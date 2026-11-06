"""F18: cama sonora opcional (bed_synth.py y mix.py --music) (python pipeline/tests/test_bed.py)."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from common import AUDIO_KIT  # noqa: E402,F401
from dsp import SR, write_wav  # noqa: E402
from bed_synth import MOODS, bed, duck_curve  # noqa: E402

fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


for m in MOODS:
    b = bed(12.0, m)
    check(f"cama {m}: 12 s, finita, pico 1, empieza y acaba suave", len(b) == 12 * SR and np.isfinite(b).all() and abs(np.abs(b).max() - 1) < 1e-6 and abs(b[0]) < 0.01 and abs(b[-1]) < 0.01)
check("la cama es determinista", np.array_equal(bed(5.0, "tech"), bed(5.0, "tech")))
check("sin melodía rítmica: casi nada por encima de 4 kHz", (lambda X: X[np.fft.rfftfreq(len(bed(5.0)), 1 / SR) > 4000].sum() / X.sum() < 0.01)(np.abs(np.fft.rfft(bed(5.0))) ** 2))
v = np.zeros(6 * SR)
v[2 * SR: 4 * SR] = 0.3 * np.sin(2 * np.pi * 180 * np.arange(2 * SR) / SR)
g = duck_curve(v)
check("agacha unos 6 dB con voz y vuelve a 1 sin ella", g[int(3 * SR)] < 0.55 and g[int(0.5 * SR)] > 0.99 and g[-1] > 0.9, (g[int(3 * SR)], g[int(0.5 * SR)], g[-1]))
# mezcla de extremo a extremo con una voz sintética
d = Path(tempfile.mkdtemp())
t = np.arange(10 * SR) / SR
voice = 0.2 * np.sin(2 * np.pi * 200 * t) * (np.sin(2 * np.pi * 0.7 * t) > -0.3)
write_wav(str(d / "v.wav"), voice[None, :])
(d / "plan.json").write_text(json.dumps({"duration_s": 10.0, "events": [{"type": "pop", "t": 3.0, "why": "t"}]}))


def mix(*extra):
    r = subprocess.run([sys.executable, str(HERE.parent / "mix.py"), "--voice", str(d / "v.wav"), "--plan", str(d / "plan.json"), "--out", str(d / "m.wav"), *extra],
                       capture_output=True, text=True)
    return r, json.loads((d / "m.wav.report.json").read_text()) if (d / "m.wav.report.json").exists() else {}


r, rep = mix()
check("sin --music no hay cama en el informe", rep.get("bed_below_voice_db") is None, r.stderr[-300:])
r, rep = mix("--music", "tech")
f = rep.get("ffmpeg_ebur128", {})
check("con --music la cama queda ≥ 18 dB bajo la voz", (rep.get("bed_below_voice_db") or 0) >= 18, rep.get("bed_below_voice_db"))
check("con cama el master sigue en −14 LUFS y ≤ −1 dBTP", abs((f.get("I_lufs") or 0) + 14) <= 0.5 and (f.get("true_peak_dbtp") or 0) <= -1.0, f)
sys.exit(1 if fails else 0)
