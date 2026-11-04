"""Galería de acciones: un beat por acción, con 2 frames (a mitad y al final de la subida) y una hoja de contacto.

    python tools/actions_gallery.py OUT_DIR [acción ...]        # sin acciones: todas las del catálogo
    python tools/actions_gallery.py out/galeria-acciones grow shrink appear

Usa `astronauta` como protagonista (o el objeto del catálogo si la acción es propia de uno).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from catalog_io import load  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve(); out.mkdir(parents=True, exist_ok=True)
cat = load()
own = {(h, a): k for k, v in cat["heroes"].items() for a in v.get("actions", {}) for h in [k]}
names = sys.argv[2:] or list(cat["actions"]) + [a for v in cat["heroes"].values() for a in v.get("actions", {})]
EXTRA = {"drop": {"height": 1.6}, "mark": {"text": "?"}, "steam": {"kind": "bubbles"}, "rain": {"kind": "rain"}, "arrow": {"anchor": "casco", "dir": "down"},
         "beam": {"anchor": "casco", "dir": "up"}, "fly": {"dir": "right", "dist": 3}, "slide": {"x": 1.0}, "ring": {"tilt": 60}}
beats, jobs = [], []
for i, name in enumerate(names):
    hero = next((h for (h, a) in own if a == name), "astronauta")
    d = cat["heroes"][hero]
    spec = {"type": name, "at": "clave", "dur": 40, **EXTRA.get(name, {})}
    beats.append({"id": f"b{i + 1:02d}", "role": "tension", "text": f"Esto muestra el efecto {name.replace('_', ' ')} con la palabra clave y sigue un rato más hasta el final",
                  "scene": {"env": "espacio_profundo", "light": "tech", "hero": {"kind": d["kind"], "asset": hero}, "camera": {"preset": "cut"}, "dof": 6},
                  "overlays": [], "actions": [spec], "sfx": [], "transition": "cut"})
    jobs.append(name)
story = {"meta": {"id": "gal", "lang": "es", "title": "gal", "fps": 30, "width": 1080, "height": 1920, "voice": {"engine": "kokoro", "voice": "x", "speed": 1}, "music": False, "captionEmphasis": "box"}, "beats": beats}
(out / "story.json").write_text(json.dumps(story, ensure_ascii=False), encoding="utf-8")
subprocess.run(["node", "scripts/fake_words.mjs", "story", str(out / "story.json"), str(out / "words.json")], cwd=ROOT / "studio", check=True, capture_output=True)
words = json.loads((out / "words.json").read_text(encoding="utf-8"))
frames = []
for b in beats:
    ws = [w for w in words if w["beat"] == b["id"]]
    t0 = next(round(w["start"] * 30) for w in ws if w["w"].lower().startswith("clave"))
    frames += [t0 + 20, t0 + 55]
(out / "props.json").write_text(json.dumps({"story": story, "words": words}, ensure_ascii=False), encoding="utf-8")
subprocess.run(["node", "scripts/stills.mjs", str(out / "stills"), "Explainer@" + ",".join(map(str, frames)), "--scale", "0.4"], cwd=ROOT / "studio",
               env={**os.environ, "STILLS_PROPS_FILE": str(out / "props.json")}, check=True, capture_output=True)
print(len(names), "acciones;", out / "stills")
for k in range(0, len(names), 8):
    ch = names[k:k + 8]; cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    fl = []
    for n in range(k, k + len(ch)):
        fl += [out / "stills" / f"Explainer_{frames[2 * n]}.jpg", out / "stills" / f"Explainer_{frames[2 * n + 1]}.jpg"]
    for f in fl:
        cmd += ["-i", str(f)]
    lay = "|".join(f"{(j % 8) * 432}_{(j // 8) * 768}" for j in range(len(fl)))
    cmd += ["-filter_complex", "".join(f"[{j}:v]" for j in range(len(fl))) + f"xstack=inputs={len(fl)}:layout={lay}:fill=black", str(out / f"hoja_{k // 8 + 1}.jpg")]
    subprocess.run(cmd, check=True)
    print(f"hoja_{k // 8 + 1}.jpg:", ", ".join(ch))
