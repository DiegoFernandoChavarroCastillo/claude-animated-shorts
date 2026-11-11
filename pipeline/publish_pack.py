"""Etapa 10: paquete de publicación -> 11_publish.md, 11_cover.png y meta.json (F16, F17).

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
    two_d = story.get("meta", {}).get("engine") == "2d"
    cat = load_json(ROOT / "templates" / ("catalog2d.json" if two_d else "catalog.json"))
    if two_d:   # motor 2D: los assets más usados por capa
        assets = [ly["asset"] for b in story["beats"] for ly in b["scene"]["layers"] if cat["assets"].get(ly["asset"], {}).get("kind") != "fondo"]
    else:
        assets = [b.get("scene", {}).get("hero", {}).get("asset") for b in story["beats"]]
    top = sorted(set(assets), key=lambda x: -assets.count(x))[:2]
    tags: list[str] = []
    for asset in top:
        for t in cat["assets" if two_d else "heroes"].get(asset, {}).get("tags", [])[:2]:
            t = re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", t.lower()))
            if t and t not in tags and t not in GENERIC and len(t) > 3:
                tags.append(t)
    generic = (["#filosofia", "#historia"] if lang == "es" else ["#philosophy", "#story"]) if two_d else (["#sabiasque", "#ciencia"] if lang == "es" else ["#didyouknow", "#science"])
    return ["#" + t for t in tags[: MAX_HASHTAGS - 2]] + generic


def cover(d: Path, words: list[dict]) -> str:
    """fotograma del gancho: un segundo después de la primera palabra (ya hay movimiento y el subtítulo del gancho)"""
    t = min(words[0]["start"] + 1.0, words[-1]["end"])
    out = d / "11_cover.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(d / "09_final.mp4"), "-frames:v", "1", str(out)], check=True)
    return out.name


def script_sources(md: str) -> str:
    """las líneas de «## Fuentes» del guion, hasta la sección siguiente (Ficción, Fórmulas nuevas)"""
    m = re.search(r"^## Fuentes\s*(.*?)(?=^## |\Z)", md, re.S | re.M)
    return "\n".join(x for x in (m.group(1).strip().splitlines() if m else []) if x.startswith("-"))


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
    src = script_sources((d / "02_SCRIPT.md").read_text(encoding="utf-8"))
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


def meta(d: Path) -> dict:
    """datos del video para cruzarlos con las estadísticas de las plataformas (tools/ingest_stats.py)"""
    import datetime
    from validate_story import event_gap, script_closing
    md = (d / "02_SCRIPT.md").read_text(encoding="utf-8")
    story, words = load_json(d / "05_story.json"), load_json(d / "04_words.json")
    head = lambda k: (re.search(rf"^{k}:\s*(\w+)", md, re.M) or [None, None])[1]  # noqa: E731
    gap, _ = event_gap(story, words)
    return {"id": d.name, "title": story["meta"]["title"], "lang": story["meta"]["lang"], "date": datetime.date.today().isoformat(),
            "hook": head("hook"), "structure": head("structure") or "mito", "closing": script_closing(md),
            "duration_s": round(words[-1]["end"] + story["meta"].get("tailS", 1.0), 1), "words": len(words),
            "hook_spoken_s": round(max(w["end"] for w in words if w["beat"] == story["beats"][0]["id"]), 1),
            "beats": len(story["beats"]), "max_event_gap_s": round(gap, 1),
            "engine": story["meta"].get("engine", "3d"),
            "heroes": sorted({b["scene"]["hero"]["asset"] for b in story["beats"]} if story["meta"].get("engine") != "2d" else {ly["asset"] for b in story["beats"] for ly in b["scene"]["layers"]}),
            "shots": sum(len(b.get("shots", [])) for b in story["beats"])}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    a = ap.parse_args()
    d = ROOT / "out" / a.id
    for f in ("02_SCRIPT.md", "04_words.json", "05_story.json", "09_final.mp4"):
        if not (d / f).exists():
            raise PipelineError(f"falta {d / f}")
    (d / "11_publish.md").write_text(build(d), encoding="utf-8")
    (d / "meta.json").write_text(json.dumps(meta(d), ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[publish] {d / '11_publish.md'} y 11_cover.png")


if __name__ == "__main__":
    run_main(main)
