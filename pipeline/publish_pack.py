"""Etapa 10: paquete de publicación -> 11_publish.md y 11_cover.png (F16).

    python pipeline/publish_pack.py --id <id>

Saca del guion, del plan visual y del video lo que se puede sin inventar: título (el gancho), descripción (el guion y las
fuentes), hashtags (de las etiquetas del catálogo de los objetos usados), comentario fijado (la pregunta del cierre) y la portada
(un fotograma del gancho). Claude lo revisa y lo afina antes de entregar; los límites por plataforma son orientativos
(no vienen de documentación oficial: compruébalos al publicar).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, PipelineError, load_json, run_main  # noqa: E402
from validate_script import parse  # noqa: E402

MAX_HASHTAGS = 5
GENERIC = {"explicacion", "curiosidad"}


def hashtags(story: dict, lang: str) -> list[str]:
    """etiquetas de los dos objetos más usados (las 2 primeras de cada uno) más dos genéricas del idioma"""
    cat = load_json(ROOT / "templates" / "catalog.json")
    assets = [b.get("scene", {}).get("hero", {}).get("asset") for b in story["beats"]]
    top = sorted(set(assets), key=lambda x: -assets.count(x))[:2]
    tags: list[str] = []
    for asset in top:
        for t in cat["heroes"].get(asset, {}).get("tags", [])[:2]:
            t = re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", t.lower()))
            if t and t not in tags and t not in GENERIC and len(t) > 3:
                tags.append(t)
    return ["#" + t for t in tags[: MAX_HASHTAGS - 2]] + (["#sabiasque", "#ciencia"] if lang == "es" else ["#didyouknow", "#science"])


def cover(d: Path, words: list[dict]) -> str:
    """fotograma del gancho: un segundo después de la primera palabra (ya hay movimiento y el subtítulo del gancho)"""
    t = min(words[0]["start"] + 1.0, words[-1]["end"])
    out = d / "11_cover.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(d / "09_final.mp4"), "-frames:v", "1", str(out)], check=True)
    return out.name


def build(d: Path) -> str:
    script = parse((d / "02_SCRIPT.md").read_text(encoding="utf-8"))
    story = load_json(d / "05_story.json")
    words = load_json(d / "04_words.json")
    lang = story["meta"]["lang"]
    closing = re.search(r"^closing:\s*(\w+)", (d / "02_SCRIPT.md").read_text(encoding="utf-8"), re.M)
    lines = [t for _, t in script.lines]
    hook, last = lines[0], lines[-1]
    dur = words[-1]["end"] + story["meta"].get("tailS", 1.0)
    tags = " ".join(hashtags(story, lang))
    body = " ".join(lines[1:4])
    sources = re.search(r"## Fuentes\s*(.*)", (d / "02_SCRIPT.md").read_text(encoding="utf-8"), re.S)
    src = "\n".join(x for x in (sources.group(1).strip().splitlines() if sources else []) if x.startswith("-"))
    cov = cover(d, words)
    return f"""# Publicación: {story['meta']['title']}

Video: `09_final.mp4` ({dur:.0f} s) · portada: `{cov}` · cierre: `{closing.group(1) if closing else 'n/d'}`
Borrador generado por `pipeline/publish_pack.py`: revísalo y afínalo antes de publicar. Los límites de caracteres son orientativos.

## YouTube Shorts
- **Título** (≤ 100 caracteres, el gancho primero): {hook}
- **Descripción:** {body} … Fuentes abajo. #Shorts {tags}
- **Comentario fijado:** {last}

## TikTok
- **Texto** (corto; el gancho en la primera línea): {hook} {tags}
- **Portada:** `{cov}` (o elige otro fotograma en la app)

## Instagram Reels
- **Texto:** {hook}
{body}
{tags}
- **Portada:** `{cov}`

## Facebook Reels
- **Texto:** {hook} {tags}

## Fuentes del guion
{src or '(sin fuentes)'}

## Antes de publicar
- Vista previa del video en cada app: la descripción y los botones tapan la parte baja; los subtítulos van arriba a propósito.
- Si el video es un bucle, no pongas «gracias por ver» ni despedidas en el texto: que el comentario fijado retome el gancho.
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    a = ap.parse_args()
    d = ROOT / "out" / a.id
    for f in ("02_SCRIPT.md", "04_words.json", "05_story.json", "09_final.mp4"):
        if not (d / f).exists():
            raise PipelineError(f"falta {d / f}")
    (d / "11_publish.md").write_text(build(d), encoding="utf-8")
    print(f"[publish] {d / '11_publish.md'} y 11_cover.png")


if __name__ == "__main__":
    run_main(main)
