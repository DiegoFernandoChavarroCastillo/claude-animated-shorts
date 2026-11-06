"""Cama sonora sintetizada (F18, opcional con `meta.music: true`): un colchón suave de acordes sin melodía ni batería, para que el silencio entre
frases no suene vacío. Sin licencias: se genera aquí. Va muy por debajo de la voz y se agacha mientras hay voz (ver mix.py).
Estados de ánimo: tech (acordes menores abiertos), calm (mayores lentos), warm (sextas cálidas)."""
from __future__ import annotations

import numpy as np

from common import AUDIO_KIT  # noqa: F401 - añade templates/audio al path
from dsp import SR, bp, colored, lp, rng, smooth_noise

MOODS = {
    "tech": [(110.0, [1, 1.5, 2, 2.378]), (98.0, [1, 1.5, 2, 2.378]), (82.4, [1, 1.5, 2, 2.378]), (110.0, [1, 1.5, 2, 2.5])],
    "calm": [(130.8, [1, 1.26, 1.5, 2]), (110.0, [1, 1.2, 1.5, 2]), (87.3, [1, 1.26, 1.5, 2]), (98.0, [1, 1.26, 1.5, 1.89])],
    "warm": [(98.0, [1, 1.25, 1.5, 1.68]), (87.3, [1, 1.25, 1.5, 1.68]), (110.0, [1, 1.2, 1.5, 1.78]), (98.0, [1, 1.25, 1.5, 1.68])],
}
CHORD_S = 9.0     # cada acorde dura 9 s y se funde con el siguiente


def bed(dur_s: float, mood: str = "tech", seed: int = 21) -> np.ndarray:
    """audio mono a 48 kHz, pico normalizado a 1, de dur_s segundos (empieza y acaba con fundido de 1,5 s)"""
    n = int(dur_s * SR)
    t = np.arange(n) / SR
    r = rng(seed)
    chords = MOODS[mood]
    x = np.zeros(n)
    for k in range(int(dur_s / CHORD_S) + 2):
        root, ratios = chords[k % len(chords)]
        c0 = (k - 0.5) * CHORD_S
        w = np.clip(1 - np.abs(t - (c0 + CHORD_S / 2)) / CHORD_S, 0, 1) ** 1.5           # ventana triangular suave por acorde
        if not w.any():
            continue
        for j, ra in enumerate(ratios):
            f = root * ra
            for det in (-0.35, 0.35):                                                       # dos osciladores desafinados = coro lento
                x += w * np.sin(2 * np.pi * (f + det) * t + j) * (0.5 if j else 0.8) / (1 + 0.4 * j)
    x *= 0.8 + 0.2 * smooth_noise(n, r, 0.2)                                              # respiración lenta
    x = lp(x, 1400) + 0.04 * lp(bp(colored(n, r, 1.0), 300, 3000), 2500)
    fade = np.minimum(1, np.minimum(t, dur_s - t) / 1.5)
    x *= fade
    return x / max(np.abs(x).max(), 1e-9)


def duck_curve(voice: np.ndarray, depth_db: float = 6.0, attack_s: float = 0.08, release_s: float = 0.5) -> np.ndarray:
    """ganancia (1 = sin bajar) que agacha la cama depth_db mientras hay voz; suave para no bombear"""
    env = np.abs(voice)
    win = int(0.05 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    on = (env > 0.02 * max(env.max(), 1e-9)).astype(float)
    g = np.empty_like(on)
    a, rl = 1 - np.exp(-1 / (attack_s * SR)), 1 - np.exp(-1 / (release_s * SR))
    cur = 0.0
    for i in range(len(on)):                                                                # polo simple con ataque y relajación
        cur += ((on[i] - cur) * (a if on[i] > cur else rl))
        g[i] = cur
    return 10 ** (-depth_db * g / 20)
