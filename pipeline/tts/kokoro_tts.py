"""Kokoro (Apache-2.0), motor por defecto. Idiomas: 'e' español, 'a' inglés americano. Salida 24 kHz."""
from __future__ import annotations

import numpy as np

from common import PipelineError

LANG = {"es": "e", "en": "a"}
VOICES = {"es": ["ef_dora", "em_alex", "em_santa"], "en": ["af_heart", "am_michael", "am_fenrir", "af_bella", "am_puck"]}


class Engine:
    sr = 24000

    def __init__(self, lang: str, voice: str):
        if lang not in LANG:
            raise PipelineError(f"Kokoro: idioma no soportado {lang}")
        try:
            from kokoro import KPipeline
        except ImportError as e:
            raise PipelineError("Kokoro no está instalado. Ejecuta pipeline\\setup_audio.ps1") from e
        self.voice = voice
        try:
            self.pipe = KPipeline(lang_code=LANG[lang], repo_id="hexgrad/Kokoro-82M")
        except Exception as e:  # noqa: BLE001 - mensaje claro para el usuario
            raise PipelineError(f"Kokoro no pudo arrancar ({e}). Si dice espeak, instala espeak-ng: pipeline\\setup_audio.ps1") from e

    def say(self, text: str, speed: float):
        chunks = [np.asarray(a, dtype=np.float32) for _, _, a in self.pipe(text, voice=self.voice, speed=speed)]
        if not chunks:
            raise PipelineError(f"Kokoro no devolvió audio para: {text!r}")
        return np.concatenate(chunks), self.sr
