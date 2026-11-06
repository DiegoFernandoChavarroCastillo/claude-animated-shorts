"""F18: caché de voz por frase y escala de pausas (python pipeline/tests/test_tts_cache.py). Usa un motor falso: no carga ningún modelo."""
import os
import sys
import tempfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["TTS_CACHE"] = tempfile.mkdtemp()
import tts  # noqa: E402
from common import SR, load_json  # noqa: E402

CALLS = []


class FakeEngine:
    def __init__(self, lang, voice):
        CALLS.append("load")

    def say(self, text, speed):
        CALLS.append(text)
        return 0.3 * np.sin(2 * np.pi * 220 * np.arange(int(0.8 * 24000)) / 24000), 24000


class FakeModule:
    Engine = FakeEngine


tts.ENGINES["fake"] = "fake"
tts.engine = lambda name: FakeModule
out = Path(tempfile.mkdtemp()) / "v.wav"
fails = 0


def check(name, ok):
    global fails
    print("OK " if ok else "MAL", name)
    fails += not ok


def dur(p):
    import soundfile as sf
    info = sf.info(str(p))
    return info.frames / info.samplerate


tts.synth(["Hola uno.", "Hola dos."], "es", "v", 1.0, [600, 0], out, "fake")
d1 = dur(out)
check("1.ª vez: el motor se carga y sintetiza las dos frases", CALLS == ["load", "Hola uno.", "Hola dos."])
CALLS.clear()
tts.synth(["Hola uno.", "Hola dos."], "es", "v", 1.0, [300, 0], out, "fake")
check("2.ª vez con otras pausas: no carga el motor ni sintetiza nada", CALLS == [])
check("las pausas más cortas acortan el audio ~0,3 s", abs((d1 - dur(out)) - 0.3) < 0.02)
tts.synth(["Hola uno.", "Hola tres."], "es", "v", 1.0, [300, 0], out, "fake")
check("cambiar una frase solo sintetiza esa", CALLS == ["load", "Hola tres."])
CALLS.clear()
tts.synth(["Hola uno."], "es", "v", 1.2, [0], out, "fake")
check("otra velocidad no reutiliza la caché", CALLS == ["load", "Hola uno."])
seg = load_json(Path(str(out) + ".segments.json"))
check("segments.json se escribe", len(seg["segments"]) == 1)
sys.exit(1 if fails else 0)
