"""SFX del explainer (plan §7.6), sintetizados con el kit del repo original (templates/audio/dsp.py y sfx_gen.py):
whoosh_soft (transiciones), pop (entrada de overlay), tick (contadores), riser (antes del giro), impact (golpe suave).
F15 (acentos, generales para cualquier tema): zap, shimmer, heartbeat, swish_up, swish_down, blip, sizzle, bubbles, drip,
rumble, ding, buzz_no, crack, clock_tick. Todos duran ≤1,3 s y salen más bajos que los de estructura (ver REL_DB).
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


# ---------------------------------------------------------------- F15: acentos generales
def zap(seed=6):
    """chasquido eléctrico: ruido brillante con tres ráfagas rápidas y un zumbido de 120 Hz que cae (chispa, rayo, cortocircuito)"""
    t = tt(0.32)
    r = rng(seed)
    env = sum(a * np.exp(-np.clip(t - t0, 0, None) / 0.012) * (t >= t0) for a, t0 in ((1.0, 0.0), (0.6, 0.045), (0.35, 0.11)))
    crack = bp(colored(len(t), r, 0.0), 2500, 9000) * env
    buzz = np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.08) * 0.25 + np.sin(2 * np.pi * 360 * t) * np.exp(-t / 0.05) * 0.12
    return _norm(fades(crack + buzz, 0.0005, 0.04))


def shimmer(seed=7):
    """brillo: tres campanillas agudas que suben (E6, G#6, B6) y se apagan en 0,7 s (sparkle, halo, aurora, descubrimiento)"""
    t = tt(0.7)
    x = np.zeros_like(t)
    for k, (f, t0) in enumerate(((1319, 0.0), (1661, 0.07), (1976, 0.14))):
        tl = np.clip(t - t0, 0, None)
        x += (t >= t0) * np.sin(2 * np.pi * f * tl) * np.exp(-tl / 0.16) * (0.9 - 0.2 * k)
        x += (t >= t0) * np.sin(2 * np.pi * f * 2.01 * tl) * np.exp(-tl / 0.07) * 0.15
    return _norm(fades(x, 0.002, 0.15))


def heartbeat(seed=8):
    """latido: dos golpes graves (lub-dub) separados 0,26 s, el segundo más suave (corazón, pulso, miedo)"""
    t = tt(0.8)
    x = np.zeros_like(t)
    for a, t0 in ((1.0, 0.0), (0.7, 0.26)):
        tl = np.clip(t - t0, 0, None)
        f = 48 + 30 * np.exp(-tl / 0.03)
        x += (t >= t0) * a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl / 0.07)
    return _norm(lp(fades(x, 0.003, 0.1), 300))


def _swish(up, seed):
    t = tt(0.4)
    u = t / 0.4
    nz = colored(len(t), rng(seed), 0.3)
    lo, mid, hi = lp(nz, 800), bp(nz, 800, 2500), hp(nz, 2500)
    w = u if up else 1 - u                          # la banda se desplaza de graves a agudos (o al revés) durante el barrido
    x = (1 - w) ** 2 * lo + 2 * w * (1 - w) * mid + w ** 2 * hi
    return _norm(fades(x * np.sin(np.pi * u) ** 1.5, 0.01, 0.06))


def swish_up(seed=9):
    """barrido corto de aire que sube (lift, grow, appear, se infla)"""
    return _swish(True, seed)


def swish_down(seed=10):
    """barrido corto de aire que baja (drop, shrink, sink, vanish)"""
    return _swish(False, seed)


def blip(seed=11):
    """nota de interfaz: dos senos limpios (880 y 1320 Hz) de 70 ms, para marcas, flechas y etiquetas"""
    t = tt(0.16)
    x = np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.05) + 0.7 * (t > 0.06) * np.sin(2 * np.pi * 1320 * np.clip(t - 0.06, 0, None)) * np.exp(-np.clip(t - 0.06, 0, None) / 0.05)
    return _norm(fades(x, 0.002, 0.03))


def sizzle(seed=12):
    """siseo de calor: ruido agudo con chasquidos aleatorios y caída suave en 0,9 s (vapor, fuego, fritura)"""
    t = tt(0.9)
    r = rng(seed)
    nz = hp(colored(len(t), r, 0.0), 3500)
    pops = (r.random(len(t)) > 0.9985).astype(float)
    x = nz * (0.35 + 0.65 * (r.random(len(t)) > 0.5)) * 0.4 * np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 0.6 + bp(pops, 1500, 6000) * 6
    return _norm(fades(x, 0.04, 0.3))


def bubbles(seed=13):
    """burbujeo: 9 burbujas con tono que sube, repartidas en 0,9 s (hervir, reacciones, espuma, vapor)"""
    t = tt(0.9)
    r = rng(seed)
    x = np.zeros_like(t)
    for t0 in np.sort(r.random(9) * 0.75):
        f0 = 350 + r.random() * 500
        tl = np.clip(t - t0, 0, None)
        x += (t >= t0) * np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * tl)) / SR) * np.exp(-tl / 0.025) * (0.4 + 0.6 * r.random())
    return _norm(fades(x, 0.002, 0.1))


def drip(seed=14):
    """gota de agua: seno que sube de 700 a 1500 Hz en 50 ms y su eco más suave (lluvia, ondas, agua)"""
    t = tt(0.4)
    x = np.zeros_like(t)
    for a, t0 in ((1.0, 0.0), (0.22, 0.17)):
        tl = np.clip(t - t0, 0, None)
        f = 700 + 800 * (1 - np.exp(-tl / 0.03))
        x += (t >= t0) * a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl / 0.035)
    return _norm(fades(x, 0.001, 0.08))


def rumble(seed=15):
    """retumbo grave de 1,2 s: ruido rosa por debajo de 140 Hz que sube y baja (volcán, terremoto, cohete, tormenta)"""
    t = tt(1.2)
    u = t / 1.2
    x = lp(colored(len(t), rng(seed), 1.5), 140, 3) * (np.sin(np.pi * u) ** 1.2) * (1 + 0.3 * np.sin(2 * np.pi * 9 * t))
    return _norm(lp(fades(x, 0.05, 0.3), 200))


def ding(seed=16):
    """campanilla de acierto: C6 + G6 con cola de 0,6 s (correcto, respuesta, ✓, 'ahí está')"""
    t = tt(0.7)
    x = np.sin(2 * np.pi * 1047 * t) * np.exp(-t / 0.18) + 0.5 * np.sin(2 * np.pi * 1568 * t) * np.exp(-t / 0.12) + 0.1 * np.sin(2 * np.pi * 2093 * t) * np.exp(-t / 0.05)
    return _norm(fades(x, 0.001, 0.12))


def buzz_no(seed=17):
    """zumbido suave de error: dos tonos de 150 y 120 Hz con diente de sierra recortado, 0,35 s (falso, mito, ✗)"""
    t = tt(0.36)
    x = np.zeros_like(t)
    for f, t0 in ((150, 0.0), (118, 0.17)):
        tl = np.clip(t - t0, 0, None)
        saw = 2 * ((f * tl) % 1.0) - 1
        x += (t >= t0) * lp(saw, 1400) * np.exp(-tl / 0.2) * (tl < 0.17 + 0.03)
    return _norm(fades(x, 0.004, 0.05))


def crack(seed=18):
    """chasquido seco: ruido de banda media muy corto con un golpe de 200 Hz (hielo, hueso, rotura, estallido)"""
    t = tt(0.22)
    r = rng(seed)
    x = bp(colored(len(t), r, 0.0), 1200, 6500) * np.exp(-t / 0.006) + 0.5 * np.sin(2 * np.pi * 200 * t) * np.exp(-t / 0.03)
    x += 0.35 * bp(colored(len(t), r, 0.0), 800, 3000) * np.exp(-np.clip(t - 0.05, 0, None) / 0.02) * (t > 0.05)
    return _norm(fades(x, 0.0003, 0.04))


def clock_tick(seed=19):
    """tic-tac de reloj: dos clics de madera, el segundo más grave (relojes, tiempo, péndulo, pulso)"""
    t = tt(0.5)
    x = np.zeros_like(t)
    for f, a, t0 in ((2600, 1.0, 0.0), (1900, 0.8, 0.25)):
        tl = np.clip(t - t0, 0, None)
        x += (t >= t0) * a * (bp(colored(len(t), rng(seed), 0.0), f * 0.8, f * 1.4) * np.exp(-tl / 0.004) + 0.4 * np.sin(2 * np.pi * f * tl) * np.exp(-tl / 0.008))
    return _norm(fades(x, 0.0005, 0.06))


# ── F5 (story-2d): sonidos de cueva y de exterior, generales para historias ──
def fire_crackle(seed=20):
    """crepitar de hoguera de 1,3 s: base grave suave y chasquidos de madera al azar (fuego, brasas, hoguera, leña)"""
    t = tt(1.3)
    r = rng(seed)
    x = 0.25 * lp(colored(len(t), r, 1.0), 700) * np.sin(np.pi * np.clip(t / 1.3, 0, 1)) ** 0.5
    for t0 in np.sort(r.random(14) * 1.15):
        tl = np.clip(t - t0, 0, None)
        x += (t >= t0) * (0.4 + 0.6 * r.random()) * bp(colored(len(t), r, 0.0), 1500, 5500) * np.exp(-tl / (0.004 + 0.006 * r.random()))
    return _norm(fades(x, 0.03, 0.25))


def chains(seed=21):
    """cadenas que tintinean, 0,9 s: pequeños golpes metálicos de 2 a 5 kHz que se apagan rápido (cadenas, grilletes, prisioneros)"""
    t = tt(0.9)
    r = rng(seed)
    x = np.zeros_like(t)
    for t0 in np.sort(r.random(9) * 0.6):
        f = 2200 + r.random() * 2800
        tl = np.clip(t - t0, 0, None)
        x += (t >= t0) * (0.35 + 0.65 * r.random()) * (np.sin(2 * np.pi * f * tl) + 0.5 * np.sin(2 * np.pi * f * 1.51 * tl)) * np.exp(-tl / (0.02 + 0.03 * r.random()))
    x += 0.15 * bp(colored(len(t), r, 0.0), 1200, 4500) * np.sin(np.pi * np.clip(t / 0.8, 0, 1))
    return _norm(fades(x, 0.002, 0.15))


def footsteps(seed=22):
    """tres pasos sobre piedra, 1,3 s: golpe grave sordo y roce corto, cada 0,4 s (caminar, avanzar, subir, desfilar)"""
    t = tt(1.3)
    r = rng(seed)
    x = np.zeros_like(t)
    for k, t0 in enumerate((0.05, 0.45, 0.85)):
        tl = np.clip(t - t0, 0, None)
        f = 110 - 14 * k
        x += (t >= t0) * (np.sin(2 * np.pi * f * tl) * np.exp(-tl / 0.06) + 0.5 * bp(colored(len(t), r, 0.0), 500, 2200) * np.exp(-tl / 0.025))
    return _norm(fades(x, 0.002, 0.2))


def wind(seed=23):
    """viento exterior de 1,3 s: ruido filtrado que sube y baja con un silbido suave (exterior, amanecer, aire libre)"""
    t = tt(1.3)
    r = rng(seed)
    u = np.clip(t / 1.3, 0, 1)
    x = bp(colored(len(t), r, 1.5), 250, 1500) * np.sin(np.pi * u) ** 1.3 * (0.75 + 0.25 * np.sin(2 * np.pi * 3 * t + 1))
    x += 0.2 * bp(colored(len(t), r, 0.5), 900, 2400) * np.sin(np.pi * u) ** 2
    return _norm(fades(x, 0.15, 0.4))


SFX = {"whoosh_soft": whoosh_soft, "pop": pop, "tick": tick, "riser": riser, "impact": impact,
       "zap": zap, "shimmer": shimmer, "heartbeat": heartbeat, "swish_up": swish_up, "swish_down": swish_down, "blip": blip,
       "sizzle": sizzle, "bubbles": bubbles, "drip": drip, "rumble": rumble, "ding": ding, "buzz_no": buzz_no, "crack": crack,
       "clock_tick": clock_tick, "fire_crackle": fire_crackle, "chains": chains, "footsteps": footsteps, "wind": wind}
# nivel relativo de cada tipo respecto a "voz − 10 dB" (plan: SFX entre −8 y −12 dB bajo la voz)
# F15: los acentos van más bajos que los de estructura (−3 a −6 dB) para acompañar la voz sin competir con ella
REL_DB = {"whoosh_soft": 0.0, "pop": -1.0, "tick": -2.0, "riser": 0.0, "impact": 1.0,
          "zap": -4.0, "shimmer": -5.0, "heartbeat": -2.0, "swish_up": -4.0, "swish_down": -4.0, "blip": -5.0, "sizzle": -7.0,
          "bubbles": -6.0, "drip": -5.0, "rumble": -3.0, "ding": -5.0, "buzz_no": -5.0, "crack": -4.0, "clock_tick": -5.0,
          "fire_crackle": -6.0, "chains": -5.0, "footsteps": -6.0, "wind": -7.0}
ACCENTS = tuple(k for k in SFX if k not in ("whoosh_soft", "pop", "tick", "riser", "impact"))
