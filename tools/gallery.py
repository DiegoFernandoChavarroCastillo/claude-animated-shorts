"""Galería de prueba de objetos: un beat por 'objeto:pose[:entorno[:luz[:camara]]]', con stills y hoja de contacto.

    python tools/gallery.py OUT_DIR garganta_corte:inflamada pulmones:humo:tech_oscuro:tech ...

Usa el compositor Explainer con palabras sintéticas (sin voz). Deja OUT_DIR/stills/*.jpg y OUT_DIR/sheet.jpg.
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
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
cat = load()
beats = []
for i, spec in enumerate(sys.argv[2:]):
    h, pose, env, light, cam = (spec.split(":") + [""] * 5)[:5]
    d = cat["heroes"][h]
    env = env or ("plano" if d["kind"] == "plano" else "macro_corte")
    light = light or cat["envs"][env]["lights"][0]
    beats.append({"id": f"b{i + 1:02d}", "role": "tension", "text": f"Este es el objeto {h.replace('_', ' ')} visto de cerca ahora mismo",
                  "scene": {"env": env, "light": light, "hero": {"kind": d["kind"], "asset": h, **({"pose": pose} if pose else {})},
                            "camera": {"preset": cam or "orbit_slow"}, "dof": 8}, "overlays": [], "sfx": [], "transition": "crossfade"})
story = {"meta": {"id": "gal", "lang": "es", "title": "gal", "fps": 30, "width": 1080, "height": 1920, "voice": {"engine": "kokoro", "voice": "x", "speed": 1}, "music": False, "captionEmphasis": "box"}, "beats": beats}
(out / "story.json").write_text(json.dumps(story, ensure_ascii=False), encoding="utf-8")
subprocess.run(["node", "scripts/fake_words.mjs", "story", str(out / "story.json"), str(out / "words.json")], cwd=ROOT / "studio", check=True, capture_output=True)
words = json.loads((out / "words.json").read_text(encoding="utf-8"))
frames = []
for b in beats:
    ws = [w for w in words if w["beat"] == b["id"]]
    frames.append(int((ws[0]["start"] + (ws[-1]["end"] - ws[0]["start"]) * 0.6) * 30))
env = {**os.environ, "STILLS_PROPS": json.dumps({"story": story, "words": words}, ensure_ascii=False)}
subprocess.run(["node", "scripts/stills.mjs", str(out / "stills"), "Explainer@" + ",".join(map(str, frames)), "--scale", "0.5"], cwd=ROOT / "studio", env=env, check=True, capture_output=True)
files = [out / "stills" / f"Explainer_{f}.jpg" for f in frames]
cols = min(4, len(files)); rows = -(-len(files) // cols)
cmd = ["ffmpeg", "-y", "-loglevel", "error"]
for f in files:
    cmd += ["-i", str(f)]
cmd += ["-filter_complex", "".join(f"[{i}:v]" for i in range(len(files))) + f"xstack=inputs={len(files)}:layout=" + "|".join(f"{(i % cols) * 540}_{(i // cols) * 960}" for i in range(len(files))) + f":fill=black,scale=iw*0.5:-1", str(out / "sheet.jpg")]
subprocess.run(cmd, check=True)
print(out / "sheet.jpg", [(b["scene"]["hero"]["asset"], b["scene"]["hero"].get("pose")) for b in beats])
