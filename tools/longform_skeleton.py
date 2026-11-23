"""Esqueleto de 05_story.json para un video largo (`pacing: longform`) a partir de 02_SCRIPT.md: meta (16:9, perfil, voz,
capítulos) y un beat por línea del guion, con id `<capítulo>_<n>`, rol, texto y capítulo. La parte visual (scene, overlays,
actions) se rellena después; si ya hay un 05_story.json, se conservan los campos visuales de los beats con el mismo texto.

    .venv/bin/python tools/longform_skeleton.py out/<id> [--theme cosmos] [--theme-alt drama_oscuro]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "pipeline"))
from validate_longform import LONG, parse  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", type=Path)
    ap.add_argument("--theme", default="cosmos")
    ap.add_argument("--theme-alt", default=None)
    a = ap.parse_args()
    s = parse((a.dir / "02_SCRIPT.md").read_text(encoding="utf-8"))
    if s.errors:
        sys.exit("02_SCRIPT.md: " + "; ".join(s.errors))
    old = {}
    sp = a.dir / "05_story.json"
    if sp.exists():
        prev = json.loads(sp.read_text(encoding="utf-8"))
        old = {b["text"]: b for b in prev["beats"]}
        meta = prev["meta"]
    else:
        title = next((l[2:].strip() for l in (a.dir / "02_SCRIPT.md").read_text(encoding="utf-8").splitlines() if l.startswith("# ")), a.dir.name)
        meta = {"id": a.dir.name, "lang": s.lang, "title": title, "engine": "2d", "pacing": "longform", "format": "wide", "fps": 30,
                "width": 1920, "height": 1080, "voice": {"engine": "chatterbox", "voice": "diego", "speed": LONG["voice"]["speed"]},
                "captions": LONG["captions"]["default"], "captionEmphasis": "accent", "music": True, "musicMood": "tense", "tailS": 1.5,
                "theme": a.theme, "overlayX": 0.5}
        if a.theme_alt:
            meta["themeAlt"] = a.theme_alt
    beats, chapters = [], []
    for c in s.chapters:
        for k, (role, text) in enumerate(c.lines):
            bid = f"{c.id}_{k + 1:02d}"
            b = {"id": bid, "role": role, "chapter": c.id, "text": text}
            if text in old:
                b.update({kk: v for kk, v in old[text].items() if kk not in ("id", "role", "chapter", "text")})
            beats.append(b)
        chapters.append({"id": c.id, "title": c.title, "from": f"{c.id}_01"})
    meta["chapters"] = chapters
    sp.write_text(json.dumps({"meta": meta, "beats": beats}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{sp}: {len(beats)} beats en {len(chapters)} capítulos ({sum(1 for b in beats if 'scene' in b)} con escena)")


if __name__ == "__main__":
    main()
