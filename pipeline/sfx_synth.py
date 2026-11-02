"""SFX del explainer (plan §7.6), sintetizados con el kit del repo original (templates/audio/dsp.py y sfx_gen.py):
whoosh_soft (transiciones), pop (entrada de overlay), tick (contadores), riser (antes del giro), impact (golpe suave).
Cada función devuelve audio mono a 48 kHz con el pico normalizado a 1; el nivel lo fija la mezcla.
"""
from __future__ import annotations

import numpy as np

from common import AUDIO_KIT  # noqa: F401 - añade templates/audio al path
from dsp import SR, bp, colored, fades, hp, lp, rng, tt
from sfx_gen import whoosh


def _norm(x):
    return x / max(np.abs(x).max(), 1e-9)


def whoosh_soft(seed=1):
    """aire filtrado que sube y baja en ~0,55 s, suave (las transiciones no deben distraer de la voz)"""
    return _norm(lp(whoosh(0.6, rng(seed), peak=0.28, f_lo=300, f_hi=1800, width=0.7, tail=0.18, air=0.08), 5000))


def pop(seed=2):
    """burbuja corta: seno con caída de tono 900 -> 520 Hz en 60 ms y un clic de ataque"""
    t = tt(0.09)
    f = 520 + 380 * np.exp(-t / 0.018)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.028)
    click = hp(colored(len(t), rng(seed), 0.0), 2500) * np.exp(-t / 0.002) * 0.25
    return _norm(fades(x + click, 0.001, 0.015))


def tick(seed=3):
    """tic de contador: clic de madera fino (ruido en banda estrecha, 25 ms)"""
    t = tt(0.025)
    x = bp(colored(len(t), rng(seed), 0.0), 2800, 4200) * np.exp(-t / 0.004)
    x += 0.4 * np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.006)
    return _norm(fades(x, 0.0005, 0.005))


def riser(dur=0.8, seed=4):
    """subida de 0,8 s: ruido que abre el filtro y gana nivel, más un tono que sube una quinta; corte limpio al final"""
    t = tt(dur)
    u = t / dur
    nz = colored(len(t), rng(seed), 0.8)
    # filtro que se abre: mezcla de dos bandas según u
    x = (1 - u) * lp(nz, 900) + u * bp(nz, 1200, 6000)
    f = 220 * 2 ** (u * 7 / 12)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    env = u ** 2.2
    return _norm(fades((x + tone) * env, 0.02, 0.012))


def impact(seed=5):
    """golpe suave: bombo grave (65 -> 45 Hz) con cola corta y un poco de cuerpo en medios, sin agudos"""
    t = tt(0.55)
    f = 45 + 20 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
    thump = lp(colored(len(t), rng(seed), 1.5), 400) * np.exp(-t / 0.03) * 0.6
    return _norm(lp(fades(body + thump, 0.002, 0.08), 2500))


SFX = {"whoosh_soft": whoosh_soft, "pop": pop, "tick": tick, "riser": riser, "impact": impact}
# nivel relativo de cada tipo respecto a "voz − 10 dB" (plan: SFX entre −8 y −12 dB bajo la voz)
REL_DB = {"whoosh_soft": 0.0, "pop": -1.0, "tick": -2.0, "riser": 0.0, "impact": 1.0}
