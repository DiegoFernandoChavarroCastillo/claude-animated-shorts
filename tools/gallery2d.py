"""Galería de stills del motor 2D (plan story-2d): ver assets sueltos o un story completo, con una hoja de contacto.

    python tools/gallery2d.py OUT_DIR --story out/<id>/05_story.json [--words 04_words.json]   # un still por beat y otro tras su última acción
    python tools/gallery2d.py OUT_DIR prisioneros:cueva:fuego prisionero_libre:cueva:fuego:stand_up ...   # asset[:paleta[:luz[:accion]]]

Sin --words usa tiempos de palabra sintéticos (scripts/fake_words.mjs). Deja OUT_DIR/stills/*.jpg y OUT_DIR/sheet.jpg.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))
from common import ROOT, load_json  # noqa: E402

TMP = os.environ.get("REMOTION_TMP") or str(Path.home() / "remotion-tmp")
CAT = load_json(ROOT / "templates" / "catalog2d.json")
PARAMS = {"scan": {"dir": "right"}, "shadow_pass": {"object": "animal", "dir": "right"}, "walk": {"dir": "up"}, "carry": {"dir": "left"}}


def asset_story(specs: list[str]) -> dict:
    beats = []
    for i, spec in enumerate(specs):
        a, pal, light, act = (spec.split(":") + [""] * 4)[:4]
        pal = pal or "cueva"
        beat = {"id": f"b{i + 1:02d}", "role": "scene", "text": f"Este es el asset {a.replace('_', ' ')} visto de cerca", "shows": a,
                "scene": {"palette": pal, "light": light or "ninguna", "layers": [{"asset": a, "id": a, "z": 1}], "camera": {"preset": "push_in", "to": [0.5, 0.5, 1.06]}},
                "overlays": [], "actions": [], "transition": "crossfade"}
        if act:
            beat["actions"].append({"type": act, "at": "Este", "target": a, "dur": 40, **PARAMS.get(act, {})})
        beats.append(beat)
    return {"meta": {"id": "gal2d", "lang": "es", "title": "gal2d", "engine": "2d", "tailS": 0.5, "captionEmphasis": "box"}, "beats": beats}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out", type=Path)
    ap.add_argument("specs", nargs="*")
    ap.add_argument("--story", type=Path)
    ap.add_argument("--words", type=Path)
    ap.add_argument("--scale", default="0.5")
    a = ap.parse_args()
    out = a.out
    out.mkdir(parents=True, exist_ok=True)
    story = load_json(a.story) if a.story else asset_story(a.specs)
    (out / "story.json").write_text(json.dumps(story, ensure_ascii=False), encoding="utf-8")
    env = {**os.environ, "REMOTION_TMP": TMP}
    if a.words:
        words = load_json(a.words)
    else:
        subprocess.run(["node", "scripts/fake_words.mjs", "story", str(out / "story.json"), str(out / "words.json")], cwd=ROOT / "studio", check=True, capture_output=True, env=env)
        words = load_json(out / "words.json")
    frames: list[int] = []
    for b in story["beats"]:
        ws = [w for w in words if w["beat"] == b["id"]]
        s0, s1 = ws[0]["start"], ws[-1]["end"]
        frames.append(int((s0 + (s1 - s0) * 0.6) * 30))
        ends = []
        for x in b.get("actions", []):
            at = x.get("at")
            t = next((w["start"] for w in ws if w["w"].strip(".,;:¿?¡!").lower() == str(at).strip(".,;:¿?¡!").lower()), s0)
            ends.append(int(t * 30) + int(x.get("dur", 30)) + 6)
        if ends:
            frames.append(min(max(ends), int(s1 * 30) + 10))
    # con un cierre en bucle (meta.tailS ≤ 0,3) el último beat acaba casi con la voz: no pedir frames fuera del video
    last = int((words[-1]["end"] + story["meta"].get("tailS", 1.0)) * 30) - 2
    frames = sorted({min(f, last) for f in frames})
    props = out / "props.json"
    props.write_text(json.dumps({"story": story, "words": words}, ensure_ascii=False), encoding="utf-8")
    shutil_rm = out / "stills"
    if shutil_rm.exists():
        for f in shutil_rm.glob("*.jpg"):
            f.unlink()
    r = subprocess.run(["node", "scripts/job.mjs", "stills", f"{TMP}/bundle", str(props), str(shutil_rm), ",".join(map(str, frames)), "--scale", a.scale],
                       cwd=ROOT / "studio", env=env, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stdout[-1500:] + r.stderr[-1500:])
    files = [shutil_rm / f"still_{f:05d}.jpg" for f in frames]
    ims = [Image.open(f) for f in files]
    w, h = ims[0].size
    cols = min(6, len(ims))
    rows = -(-len(ims) // cols)
    sheet = Image.new("RGB", (cols * w, rows * h))
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    sheet.save(out / "sheet.jpg", quality=88)
    print(out / "sheet.jpg", len(ims), "stills")


if __name__ == "__main__":
    main()
