"""Muestras de voz para elegir (plan F5, tarea 4): la misma frase con 3 voces por idioma.

    python pipeline\\voice_samples.py --out out\\voces

Escribe out\\voces\\<lang>_<voz>.wav (24 bits, 48 kHz, pico −3 dBFS).
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import run_main  # noqa: E402

TEXT = {
    "es": ["¿Por qué el hielo flota, si es agua sólida?", "Al congelarse, el agua se expande cerca de un nueve por ciento."],
    "en": ["Why does ice float, if it's just solid water?", "When water freezes, it expands by about nine percent."],
}
CANDIDATES = {"es": ["em_alex", "ef_dora", "em_santa"], "en": ["am_michael", "af_heart", "am_fenrir"]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=Path("out/voces"))
    a = ap.parse_args()
    from tts import synth
    for lang, voices in CANDIDATES.items():
        for v in voices:
            p = a.out / f"{lang}_{v}.wav"
            synth(TEXT[lang], lang, v, 1.0, [450, 0], p, "kokoro")
            print("muestra:", p)


if __name__ == "__main__":
    run_main(main)
