"""Hojas lado a lado para el bucle de look-match (plan §9): nuestros frames arriba, los de referencia abajo.

  python tools/qa/lookmatch_sheets.py --id hielo-flota [--strip-beat b02]

Escribe en out/<id>/lookmatch/:
  sheet_R1.jpg, sheet_R3.jpg   un frame por beat (a mitad de su texto) frente a frames repartidos de la referencia
  sheet_motion.jpg             tira temporal: 8 frames cada 0,5 s de un beat nuestro frente a 8 de R3 (cámara, ritmo)
Los frames salen de 07_video.mp4 (con subtítulos y overlays, sin audio) y de references_local/videos/.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REFS = {"R1": "video5", "R3": "video4"}   # D1
SBS = ROOT / "templates/scripts/sbs_sheet.py"


def grab(video: Path, frames: list[int], out: Path, tag: str) -> list[Path]:
    """Saca los frames pedidos (en orden) como JPG."""
    sel = "+".join(f"eq(n\\,{f})" for f in frames)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vf", f"select='{sel}'", "-fps_mode", "passthrough",
                    "-q:v", "2", str(out / f"{tag}_%02d.jpg")], check=True)
    return [out / f"{tag}_{k + 1:02d}.jpg" for k in range(len(frames))]


def nframes(video: Path) -> int:
    r = subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries",
                        "stream=nb_read_packets", "-of", "csv=p=0", str(video)], capture_output=True, text=True)
    return int(r.stdout.strip())


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--id", required=True)
    ap.add_argument("--strip-beat", help="beat de la tira temporal (por defecto, el más largo)")
    a = ap.parse_args()
    d = ROOT / "out" / a.id
    video, words = d / "07_video.mp4", json.loads((d / "04_words.json").read_text(encoding="utf-8"))
    fps = 30
    beats: dict[str, list[float]] = {}
    for w in words:
        beats.setdefault(w["beat"], [w["start"], w["end"]])[1] = w["end"]
    ours_f = [round((s + e) / 2 * fps) for s, e in beats.values()]
    out = d / "lookmatch"
    out.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        t = Path(td)
        ours = grab(video, ours_f, t, "ours")
        for rid, name in REFS.items():
            rv = ROOT / "references_local/videos" / f"{name}.mp4"
            n = nframes(rv)
            ref = grab(rv, [round(n * (k + 0.5) / len(ours_f)) for k in range(len(ours_f))], t, rid)
            subprocess.run([sys.executable, str(SBS), str(out / f"sheet_{rid}.jpg"), "--ours", *map(str, ours),
                            "--ref", *map(str, ref), "--h", "640"], check=True)
        sb = a.strip_beat or max(beats, key=lambda b: beats[b][1] - beats[b][0])
        f0 = round(beats[sb][0] * fps)
        mo = grab(video, [f0 + 15 * k for k in range(8)], t, "mo")
        r3 = ROOT / "references_local/videos" / f"{REFS['R3']}.mp4"
        r0 = nframes(r3) // 3
        mr = grab(r3, [r0 + 15 * k for k in range(8)], t, "mr")
        subprocess.run([sys.executable, str(SBS), str(out / "sheet_motion.jpg"), "--ours", *map(str, mo),
                        "--ref", *map(str, mr), "--h", "480"], check=True)
        print(f"tira temporal: beat {sb}, frames {f0}–{f0 + 105} (cada 15)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
