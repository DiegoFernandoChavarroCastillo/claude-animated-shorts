"""Descarga las librerías de efectos de sonido CC0 (dominio público, uso comercial sin atribución) a `sfx_lib/` (fuera de git, D130).

    .venv/bin/python tools/sfx_fetch.py            # descarga lo que falte
    .venv/bin/python tools/sfx_fetch.py --force    # vuelve a descargar todo

Fuentes (todas CC0 1.0; el LICENSE de cada una se guarda junto a sus archivos):
- Kenney (kenney.nl): impact-sounds, interface-sounds, sci-fi-sounds, ui-audio, rpg-audio, digital-audio.
- wyzowl/sfx-kit (GitHub): 320 efectos en 28 categorías (whooshes, risers, impactos, UI, ambientes).
La mezcla usa `templates/sfx_library.json` para elegir variantes por tipo de efecto; sin librería, vuelve a los sintetizados.
"""
from __future__ import annotations

import argparse
import http.cookiejar
import io
import json
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "sfx_lib"
KENNEY = ["impact-sounds", "interface-sounds", "sci-fi-sounds", "ui-audio", "rpg-audio", "digital-audio"]
GITHUB = {"sfx-kit": "https://github.com/wyzowl/sfx-kit.git"}
UA = {"User-Agent": "Mozilla/5.0 (sfx-fetch)"}


def kenney(slug: str, dest: Path) -> None:
    """kenney.nl entrega el zip con un enlace firmado que pide la cookie de la página del paquete"""
    jar = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    page = f"https://kenney.nl/assets/{slug}"
    op.open(urllib.request.Request(page, headers=UA)).read()
    did = f"assets/{slug}".encode().hex()
    req = urllib.request.Request(f"https://kenney.nl/download-link/{did}", headers={**UA, "Referer": page})
    url = json.loads(op.open(req).read())["url"]
    data = op.open(urllib.request.Request(url, headers={**UA, "Referer": page})).read()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for m in z.infolist():   # solo audio y licencias; nada ejecutable
            name = Path(m.filename)
            if m.is_dir() or ".." in name.parts or name.suffix.lower() not in (".ogg", ".wav", ".txt", ".md"):
                continue
            out = dest / name.name if name.suffix.lower() in (".txt", ".md") else dest / name
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(z.read(m))


def github(url: str, dest: Path) -> None:
    subprocess.run(["git", "clone", "--depth", "1", "--quiet", url, str(dest)], check=True)
    shutil.rmtree(dest / ".git", ignore_errors=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    LIB.mkdir(exist_ok=True)
    jobs = [(s, lambda d, s=s: kenney(s, d)) for s in KENNEY] + [(n, lambda d, u=u: github(u, d)) for n, u in GITHUB.items()]
    for name, fn in jobs:
        dest = LIB / name
        if dest.exists() and not a.force:
            print(f"ya está: {name}")
            continue
        shutil.rmtree(dest, ignore_errors=True)
        dest.mkdir(parents=True)
        try:
            fn(dest)
        except Exception as e:   # una fuente caída no impide las demás
            shutil.rmtree(dest, ignore_errors=True)
            print(f"FALLÓ {name}: {e}", file=sys.stderr)
            continue
        n = sum(1 for p in dest.rglob("*") if p.suffix.lower() in (".ogg", ".wav", ".mp3"))
        print(f"{name}: {n} sonidos")


if __name__ == "__main__":
    main()
