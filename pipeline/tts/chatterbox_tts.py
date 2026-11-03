"""Chatterbox (Resemble AI, MIT), motor por defecto desde D64: en `es` el modelo de español latinoamericano y en `en`
el multilingüe V3. Cada audio lleva una marca de agua inaudible (Perth).

Chatterbox necesita otra versión de PyTorch, así que vive en .venv-chatterbox (lo crea pipeline/setup_chatterbox.py) y
se usa a través de un proceso aparte (tts/chatterbox_worker.py) que carga el modelo una sola vez por video.

- `voice`: "default" (la voz de muestra del modelo, en inglés: en español suena con acento extranjero), un nombre
  ("diego" -> voices_local/diego.wav, carpeta no versionada) o la ruta a un WAV de 10–20 s para clonar una voz. Si el
  nombre no existe en este PC, avisa y usa "default".
- `speed`: Chatterbox no tiene parámetro de velocidad. Se aplica estirando el audio sin cambiar el tono (rubberband
  de ffmpeg).
- El audio crudo de cada frase se guarda en `_cache/chatterbox/` (clave: idioma, voz, cfg, modelo y texto): un
  reajuste o un `--force tts` no vuelve a sintetizar las frases que no cambiaron (en CPU tarda ~13 veces el tiempo
  real).
"""
from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np

from common import ROOT, PipelineError

CKPT = {"es": "chatterbox/es-latam", "en": "chatterbox/mtl-v3"}   # dentro de pipeline/models/
CFG_WEIGHT = 0.2          # D64: elegido de oído; 0,5 (por defecto) habla a ~3,2 pal/s, 0,2 a ~2,9
CACHE = ROOT / "_cache/chatterbox"   # audio crudo por frase (no versionado): se sintetiza una sola vez


def _venv_python() -> Path:
    base = ROOT / ".venv-chatterbox"
    p = base / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    if not p.exists():
        raise PipelineError("Chatterbox no está instalado. Ejecuta: python pipeline/setup_chatterbox.py "
                            "(o usa voice.engine = \"kokoro\" en el story)")
    return p


def _voice_path(voice: str | None) -> str | None:
    """'default' -> None; 'diego' -> voices_local/diego.wav; una ruta -> esa ruta"""
    if voice in (None, "", "default"):
        return None
    p = Path(voice)
    if p.suffix.lower() != ".wav":
        p = ROOT / "voices_local" / f"{voice}.wav"
    elif not p.is_absolute():
        p = ROOT / p
    if p.exists():
        return str(p.resolve())
    if Path(voice).suffix.lower() == ".wav":
        raise PipelineError(f"Chatterbox: no existe la muestra de voz {p}")
    print(f"[voz] AVISO: no está {p}; se usa la voz por defecto del modelo (graba la tuya: README, «Tu voz»)")
    return None


def _stretch(x: np.ndarray, sr: int, speed: float) -> np.ndarray:
    """cambia la velocidad sin cambiar el tono (ffmpeg rubberband)"""
    if abs(speed - 1.0) < 1e-3:
        return x
    import soundfile as sf
    with tempfile.TemporaryDirectory() as td:
        a, b = Path(td) / "a.wav", Path(td) / "b.wav"
        sf.write(a, x, sr, subtype="FLOAT")
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(a), "-af", f"rubberband=tempo={speed}:pitchq=quality",
                            str(b)], capture_output=True, text=True)
        if r.returncode != 0:
            raise PipelineError(f"ffmpeg rubberband falló: {r.stderr.strip()[-200:]}")
        y, _ = sf.read(b, dtype="float32")
    return y


class Engine:
    def __init__(self, lang: str, voice: str):
        if lang not in CKPT:
            raise PipelineError(f"Chatterbox: idioma no soportado {lang}")
        ckpt = ROOT / "pipeline/models" / CKPT[lang]
        if not (ckpt / "t3.txt").exists():
            raise PipelineError(f"falta el modelo de Chatterbox en {ckpt}. Ejecuta: python pipeline/setup_chatterbox.py")
        self.lang, self.ckpt = lang, ckpt
        self.voice = _voice_path(voice)
        self.proc = None

    def _start(self):
        self.proc = subprocess.Popen([str(_venv_python()), str(ROOT / "pipeline/tts/chatterbox_worker.py"), str(self.ckpt)],
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1)
        msg = self._read()
        if not msg.get("ready"):
            raise PipelineError(f"Chatterbox no arrancó: {msg}")

    def _read(self) -> dict:
        while True:
            line = self.proc.stdout.readline()
            if not line:
                raise PipelineError("el proceso de Chatterbox terminó sin responder (¿falta memoria?)")
            line = line.strip()
            if line.startswith("{"):
                return json.loads(line)

    def say(self, text: str, speed: float):
        import soundfile as sf
        import hashlib
        key = hashlib.sha1(json.dumps([self.lang, self.voice, CFG_WEIGHT, str(self.ckpt.name), text]).encode()).hexdigest()
        out = CACHE / f"{key}.wav"
        if not out.exists():
            if self.proc is None:
                self._start()
            CACHE.mkdir(parents=True, exist_ok=True)
            self.proc.stdin.write(json.dumps({"text": text, "lang": self.lang, "out": str(out), "voice": self.voice,
                                              "cfg_weight": CFG_WEIGHT}) + "\n")
            self.proc.stdin.flush()
            r = self._read()
            if "error" in r:
                raise PipelineError(f"Chatterbox falló con {text!r}: {r['error']}")
        x, sr = sf.read(out, dtype="float32")
        x = x if x.ndim == 1 else x.mean(1)
        return _stretch(x, sr, speed), sr

    def __del__(self):
        if self.proc and self.proc.poll() is None:
            self.proc.stdin.close()
            self.proc.wait(timeout=30)
