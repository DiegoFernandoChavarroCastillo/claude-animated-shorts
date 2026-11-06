"""TTS local detrás de una interfaz común (plan §7.4):

    synth(text_segments, lang, voice, speed, pauses_ms, out_wav) -> out_wav

Se sintetiza frase a frase y se concatenan las frases con silencios explícitos, así las pausas del guion son exactas.
Las preguntas de sí/no reciben un final ascendente (tts/prosody.py, D61), porque Kokoro las termina bajando.
Salida: WAV mono 48 kHz 24 bits. Además se escribe <out>.segments.json con el inicio y fin de cada frase (lo usa la
alineación para no confundir frases repetidas).

Motores: kokoro (por defecto), piper (respaldo rápido en CPU), chatterbox (opcional, necesita NVIDIA; no instalado).
"""
from __future__ import annotations

import hashlib
import importlib
import os
from pathlib import Path

import numpy as np
from scipy import signal

from common import ROOT, SR, LEAD_MS, PipelineError, write_json
from tts.prosody import is_yes_no_question, question_rise

ENGINES = {"kokoro": "tts.kokoro_tts", "piper": "tts.piper_tts", "chatterbox": "tts.chatterbox_tts"}


def engine(name: str):
    if name not in ENGINES:
        raise PipelineError(f"motor TTS desconocido: {name} (disponibles: {', '.join(ENGINES)})")
    return importlib.import_module(ENGINES[name])


def trim(x: np.ndarray, sr: int, thr_db=-45.0, keep_ms=35) -> np.ndarray:
    """quita silencio al principio y al final de una frase (las pausas las ponemos nosotros)"""
    if not len(x):
        return x
    env = np.abs(x)
    thr = 10 ** (thr_db / 20) * max(env.max(), 1e-9)
    idx = np.flatnonzero(env > thr)
    if not len(idx):
        return x[:0]
    k = int(sr * keep_ms / 1000)
    return x[max(0, idx[0] - k): min(len(x), idx[-1] + k)]


def to48k(x: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR:
        return x
    from math import gcd
    g = gcd(SR, sr)
    return signal.resample_poly(x, SR // g, sr // g)


def cache_path(engine_name: str, lang: str, voice: str, speed: float, text: str) -> Path:
    """caché por frase (F18): la misma frase con el mismo motor, voz y velocidad no se vuelve a sintetizar; así cambiar una
    línea del guion o las pausas no obliga a repetir toda la voz (Chatterbox tarda ~7–15 min)"""
    ref = ROOT / "voices_local" / f"{voice}.wav"
    stamp = f"{ref.stat().st_size}:{int(ref.stat().st_mtime)}" if ref.exists() else "-"
    key = hashlib.sha1(f"{engine_name}|{lang}|{voice}|{stamp}|{speed:.3f}|{text}".encode("utf-8")).hexdigest()[:20]
    return Path(os.environ.get("TTS_CACHE", ROOT / "out" / ".tts_cache")) / f"{key}.npz"


def synth(text_segments: list[str], lang: str, voice: str, speed: float, pauses_ms: list[int], out_wav: Path,
          engine_name: str = "kokoro", seg_meta: list[dict] | None = None) -> Path:
    from dsp import write_wav
    eng = engine(engine_name)
    gen = None                                    # el motor se carga solo si alguna frase no está en la caché
    parts, meta, t = [np.zeros(int(SR * LEAD_MS / 1000))], [], LEAD_MS / 1000
    for i, (txt, pause) in enumerate(zip(text_segments, pauses_ms)):
        cp = cache_path(engine_name, lang, voice, speed, txt)
        if cp.exists():
            z = np.load(cp)
            x, sr = z["x"], int(z["sr"])
        else:
            gen = gen or eng.Engine(lang, voice)
            x, sr = gen.say(txt, speed)
            cp.parent.mkdir(parents=True, exist_ok=True)
            np.savez_compressed(cp, x=np.asarray(x, dtype=np.float32), sr=sr)
        x = trim(np.asarray(x, dtype=np.float64), sr)
        if is_yes_no_question(txt, lang):
            x = question_rise(x, sr)
        x = to48k(x, sr)
        meta.append({**(seg_meta[i] if seg_meta else {}), "text": txt, "start": round(t, 3), "end": round(t + len(x) / SR, 3)})
        parts += [x, np.zeros(int(SR * pause / 1000))]
        t += len(x) / SR + pause / 1000
    y = np.concatenate(parts)
    y *= 10 ** (-3 / 20) / max(np.abs(y).max(), 1e-9)   # pico a −3 dBFS (la mezcla fija el loudness final)
    Path(out_wav).parent.mkdir(parents=True, exist_ok=True)
    write_wav(str(out_wav), y)
    write_json(Path(str(out_wav) + ".segments.json"), {"engine": engine_name, "voice": voice, "speed": speed, "segments": meta})
    return Path(out_wav)
