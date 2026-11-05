"""Muestra los SFX: escribe cada uno en WAV, una tira con todos (separados 1 s) y una tabla de duración, pico y nivel.

    python tools/sfx_preview.py OUT_DIR [tipo ...]
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
from common import AUDIO_KIT  # noqa: E402,F401 - añade templates/audio al path
from dsp import SR, write_wav  # noqa: E402
from sfx_synth import ACCENTS, REL_DB, SFX  # noqa: E402


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    names = sys.argv[2:] or list(SFX)
    strip, rows = [], ["| sonido | dur (s) | pico | rms (dBFS) | nivel rel. | tipo |", "|---|---|---|---|---|---|"]
    for n in names:
        x = SFX[n]()
        assert np.isfinite(x).all() and np.abs(x).max() <= 1.0001, n
        write_wav(str(out / f"{n}.wav"), x[None, :] * 0.8)
        rms = 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)
        rows.append(f"| {n} | {len(x) / SR:.2f} | {np.abs(x).max():.2f} | {rms:.1f} | {REL_DB[n]:+.0f} dB | {'acento' if n in ACCENTS else 'estructura'} |")
        strip += [x * 0.8, np.zeros(SR)]
    write_wav(str(out / "todos.wav"), np.concatenate(strip)[None, :])
    (out / "tabla.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
    print("\n".join(rows))


if __name__ == "__main__":
    main()
