"""Piper (MIT), respaldo rápido en CPU y de menor calidad. Las voces son modelos .onnx que se descargan una vez a
pipeline/models/piper/ desde huggingface.co/rhasspy/piper-voices."""
from __future__ import annotations

import urllib.request
import wave
import io
from pathlib import Path

import numpy as np

from common import ROOT, PipelineError

MODELS = ROOT / "pipeline" / "models" / "piper"
BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0"
# voz -> ruta dentro del repo de voces
VOICES = {
    "es_ES-davefx-medium": "es/es_ES/davefx/medium/es_ES-davefx-medium",
    "es_MX-claude-high": "es/es_MX/claude/high/es_MX-claude-high",
    "en_US-lessac-medium": "en/en_US/lessac/medium/en_US-lessac-medium",
    "en_US-ryan-high": "en/en_US/ryan/high/en_US-ryan-high",
}
DEFAULT = {"es": "es_ES-davefx-medium", "en": "en_US-lessac-medium"}


def ensure(voice: str) -> Path:
    if voice not in VOICES:
        raise PipelineError(f"Piper: voz desconocida {voice} (disponibles: {', '.join(VOICES)})")
    onnx = MODELS / f"{voice}.onnx"
    MODELS.mkdir(parents=True, exist_ok=True)
    for ext in (".onnx", ".onnx.json"):
        p = MODELS / f"{voice}{ext}"
        if not p.exists():
            url = f"{BASE}/{VOICES[voice]}{ext}"
            try:
                urllib.request.urlretrieve(url, p)
            except Exception as e:  # noqa: BLE001
                raise PipelineError(f"Piper: no pude descargar {url} ({e})") from e
    return onnx


class Engine:
    def __init__(self, lang: str, voice: str):
        try:
            from piper import PiperVoice
        except ImportError as e:
            raise PipelineError("Piper no está instalado. Ejecuta pipeline\\setup_audio.ps1") from e
        voice = voice if voice in VOICES else DEFAULT[lang]
        self.v = PiperVoice.load(str(ensure(voice)))
        self.sr = self.v.config.sample_rate

    def say(self, text: str, speed: float):
        from piper import SynthesisConfig
        buf = io.BytesIO()
        with wave.open(buf, "wb") as w:
            self.v.synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=1.0 / max(speed, 0.1)))
        buf.seek(0)
        with wave.open(buf, "rb") as w:
            x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768.0
        return x, self.sr
