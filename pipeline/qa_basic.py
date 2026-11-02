"""QA básico del video final (etapa 10, F7). F8 añade el QA de estilo completo (style_check, hojas lado a lado).

Comprueba: duración de video, audio y final; loudness y true peak del final (ffmpeg ebur128); movimiento, luz y color
con tools/medicion/measure.py frente a los objetivos del plan (§3.6, §3.7).
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from common import ROOT

TARGETS = {"luma_p5": (0.05, 0.19), "luma_med": (0.14, 0.38), "sat_med": (0.40, 0.62), "longest_static_run_frames": (0, 45)}


def probe_dur(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(p)],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def ebur(p: Path) -> tuple[float | None, float | None]:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    t = r.stderr[r.stderr.rfind("Summary:"):]
    I, P = re.search(r"I:\s+(-?[\d.]+) LUFS", t), re.search(r"Peak:\s+(-?[\d.]+) dBFS", t)
    return (float(I.group(1)) if I else None, float(P.group(1)) if P else None)


def report(d: Path) -> tuple[bool, str]:
    rows, ok = [], True

    def row(name, val, rng=None, unit=""):
        nonlocal ok
        good = rng is None or (val is not None and rng[0] <= val <= rng[1])
        ok &= good
        rows.append(f"| {name} | {val}{unit} | {'' if rng is None else f'{rng[0]}–{rng[1]}'} | {'✅' if good else '❌'} |")

    v, a, f = probe_dur(d / "07_video.mp4"), probe_dur(d / "08_mix.wav"), probe_dur(d / "09_final.mp4")
    row("duración video (s)", round(v, 2))
    row("duración mezcla (s)", round(a, 2))
    row("diferencia video − audio (s)", round(abs(v - a), 3), (0, 0.1))
    I, P = ebur(d / "09_final.mp4")
    row("loudness final (LUFS)", I, (-14.5, -13.5))
    row("true peak final (dBTP)", P, (-99, -1.0))
    r = subprocess.run([sys.executable, str(ROOT / "tools/medicion/measure.py"), str(d / "07_video.mp4")], capture_output=True, text=True)
    m = json.loads(r.stdout.strip().splitlines()[-1]) if r.returncode == 0 and r.stdout.strip() else {}
    for k, rng in TARGETS.items():
        row(f"measure.py {k}", m.get(k), rng)
    row("measure.py % frames con movimiento", m.get("pct_frames_moving"))
    md = ["# QA básico", "", f"Resultado: **{'OK' if ok else 'con avisos'}** (F8 añadirá el QA de estilo completo).", "",
          "| medida | valor | objetivo | |", "|---|---|---|---|", *rows, ""]
    return ok, "\n".join(md)
