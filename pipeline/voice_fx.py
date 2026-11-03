"""Tratamiento de la voz antes de la mezcla (D62, elegido de oído por Diego entre 4 muestras A/B).

Kokoro sale seca y algo "en caja". Cadena: paso alto a 80 Hz, −2 dB a 300 Hz (menos caja), +2,5 dB a 3,5 kHz
(presencia), +1,5 dB por encima de 10 kHz (aire), compresión ligera 2,5:1 y una sala pequeña (RT60 0,35 s) al 12 %.
03_voice.wav se queda limpio (lo usa la alineación); el tratamiento se aplica solo en mix.py.
"""
from __future__ import annotations

import numpy as np
from scipy import signal

from dsp import SR, make_ir, peq, shelf

HP_HZ = 80
EQ = [(300, -2.0, 1.0), (3500, 2.5, 0.8)]          # (Hz, dB, Q)
AIR_HZ, AIR_DB = 10000, 1.5
COMP_THR_DB, COMP_RATIO, COMP_RMS_S, COMP_SMOOTH_S = -22.0, 2.5, 0.010, 0.040
ROOM_RT60, ROOM_SEED, ROOM_WET = 0.35, 7, 0.12


def _compress(x: np.ndarray) -> np.ndarray:
    """compresor de envolvente RMS (vectorizado): la señal entra con pico a −6 dBFS"""
    a = np.exp(-1 / (COMP_RMS_S * SR))
    env = np.sqrt(np.maximum(signal.lfilter([1 - a], [1, -a], x ** 2), 0))
    over = np.maximum(0, 20 * np.log10(env + 1e-9) - COMP_THR_DB)
    gr = -over * (1 - 1 / COMP_RATIO)
    b = np.exp(-1 / (COMP_SMOOTH_S * SR))
    gr = signal.filtfilt([1 - b], [1, -b], gr)                 # suaviza la ganancia sin desfase
    return x * 10 ** (gr / 20)


def treat(x: np.ndarray) -> np.ndarray:
    """voz mono a 48 kHz -> voz tratada (misma longitud). La ganancia final la fija la mezcla."""
    peak = np.abs(x).max()
    if peak <= 0:
        return x
    b, a = signal.butter(2, HP_HZ / (SR / 2), "high")
    y = signal.lfilter(b, a, x)
    for f0, g, q in EQ:
        y = peq(y, f0, g, q)
    y = shelf(y, AIR_HZ, AIR_DB)
    y = _compress(y / np.abs(y).max() * 0.5)
    ir = make_ir(ROOM_RT60, ROOM_SEED).mean(0)
    wet = signal.fftconvolve(y, ir)[: len(y)]
    rms = np.sqrt((y ** 2).mean())
    return y + ROOM_WET * wet / (np.sqrt((wet ** 2).mean()) + 1e-12) * rms
