"""Chatterbox Multilingual (MIT): opcional, NO instalado por defecto (D43). Clona una voz desde una muestra corta y
rinde bien con GPU NVIDIA; en CPU es muy lento. Cada audio lleva una marca de agua inaudible (Perth).

Para usarlo en un PC con NVIDIA:  .venv\\Scripts\\pip install chatterbox-tts   y  voice = ruta a un WAV de muestra.
"""
from __future__ import annotations

import numpy as np

from common import PipelineError


class Engine:
    def __init__(self, lang: str, voice: str):
        try:
            from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        except ImportError as e:
            raise PipelineError("Chatterbox no está instalado (es opcional y necesita NVIDIA). "
                                "Instálalo con: .venv\\Scripts\\pip install chatterbox-tts") from e
        import torch
        dev = "cuda" if torch.cuda.is_available() else "cpu"
        self.m = ChatterboxMultilingualTTS.from_pretrained(device=dev)
        self.lang, self.ref = lang, voice
        self.sr = self.m.sr

    def say(self, text: str, speed: float):
        wav = self.m.generate(text, language_id=self.lang, audio_prompt_path=self.ref or None)
        return np.asarray(wav.squeeze().cpu().numpy(), dtype=np.float32), self.sr
