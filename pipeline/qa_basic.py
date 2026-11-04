"""QA del video final (etapa 10): QA básico (F7) más el de estilo y subtítulos (F8, tools/qa/style_check.py).

Básico: duración de video, audio y final, desfase y true peak del final (ffmpeg ebur128), y la regla de diseño de F2
para la racha estática (≤45 frames, más estricta que el rango de las referencias, D31). Estilo: luz, color, cortes,
frames únicos, loudness, silencio y palabras/s frente a los rangos calibrados con las referencias (D57), y OCR de
la última palabra de cada bloque de subtítulo sobre 07_video.mp4.
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

from common import ROOT, load_json

sys.path.insert(0, str(ROOT / "tools/qa"))
from style_check import check  # noqa: E402

DESIGN_STATIC_MAX = 45   # regla de F2 (D31): todos nuestros planos llevan empuje


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
    row("duración video (s): más de 60 y menos de 120 (monetización)", round(v, 2), (60.1, 119.9))
    row("duración mezcla (s)", round(a, 2))
    row("diferencia video − audio (s)", round(abs(v - a), 3), (0, 0.1))
    _, P = ebur(d / "09_final.mp4")
    row("true peak final (dBTP)", P, (-99, -1.0))
    lang = load_json(d / "05_story.json")["meta"]["lang"]
    style_ok, style_md, m = check(d / "09_final.mp4", d / "04_words.json", lang, frames_from=d / "07_video.mp4")
    row("racha estática, regla de diseño F2 (frames)", m["longest_static_run_frames"], (0, DESIGN_STATIC_MAX))
    ok &= style_ok
    md = ["# QA", "", f"Resultado: **{'OK' if ok else 'con avisos'}**.", "", "## Básico", "",
          "| medida | valor | objetivo | |", "|---|---|---|---|", *rows, "", "## Estilo y subtítulos", "", *style_md]
    return ok, "\n".join(md)
