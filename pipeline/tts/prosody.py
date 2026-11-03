"""Entonación de pregunta (D61). Kokoro termina igual una pregunta que una afirmación: el tono cae 4–5 semitonos al
final, también con "?". En las preguntas de sí/no ("¿Te has preguntado…?") el final debería subir, así que se reescribe
la curva de tono de los últimos ~0,5 s sonoros para que suba QUESTION_RISE_ST semitonos, con el vocoder WORLD
(pyworld: cambia el tono sin cambiar el timbre). Solo se vuelve a sintetizar ese tramo, empalmado con un fundido.

Las preguntas con interrogativo ("¿Qué…?", "¿Por qué…?", "What…?") terminan bajando también al hablar, así que no
se tocan.
"""
from __future__ import annotations

import re
import unicodedata

import numpy as np

QUESTION_RISE_ST = 3.0   # elegido de oído por Diego entre +3 y +5 (2 nov)
TAIL_S, XFADE_S, FRAME_MS = 0.5, 0.02, 5.0
LEAD = {"es": r"(y|pero|entonces|o|pues)", "en": r"(and|but|so|or)"}
WH = {"es": r"(que|quien|quienes|cual|cuales|como|donde|adonde|cuando|cuanto|cuanta|cuantos|cuantas|por que|para que)",
      "en": r"(what|who|whom|whose|which|how|where|when|why)"}


def _fold(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if not unicodedata.combining(c))


def is_yes_no_question(text: str, lang: str) -> bool:
    t = text.strip().rstrip("\"'»” )")
    if not t.endswith("?") or lang not in WH:
        return False
    # la última pregunta de la frase ("Es un mito. ¿Lo sabías?" -> "lo sabias?")
    q = _fold(re.split(r"[.!¡¿]\s*", t.rstrip("?"))[-1]).strip(" \"'«“(")
    q = re.sub(rf"^{LEAD[lang]}\s+", "", q)
    return not re.match(rf"{WH[lang]}\b", q)


def question_rise(x: np.ndarray, sr: int, st: float = QUESTION_RISE_ST) -> np.ndarray:
    """los últimos TAIL_S s sonoros suben de forma gradual hasta +st semitonos sobre el tono con que empieza ese tramo"""
    import pyworld as pw
    x = np.ascontiguousarray(x, dtype=np.float64)
    f0, t = pw.harvest(x, sr, frame_period=FRAME_MS)
    voiced = np.flatnonzero(f0 > 0)
    if len(voiced) < 10:
        return x
    sp, ap = pw.cheaptrick(x, f0, t, sr), pw.d4c(x, f0, t, sr)
    end = voiced[-1]
    start = max(voiced[0], end - int(TAIL_S * 1000 / FRAME_MS))
    ref = f0[max(voiced[0], start - 20): start + 1]
    base = float(np.median(ref[ref > 0])) if (ref > 0).any() else float(np.median(f0[voiced]))
    g = f0.copy()
    for i in range(start, end + 1):
        if g[i] > 0:
            g[i] = base * 2 ** (st * ((i - start) / max(1, end - start)) ** 1.4 / 12)
    y = pw.synthesize(g, sp, ap, sr, frame_period=FRAME_MS)
    y = np.pad(y, (0, max(0, len(x) - len(y))))[:len(x)]
    a, k = int(t[start] * sr), int(XFADE_S * sr)
    w = np.linspace(0, 1, k)
    out = x.copy()
    out[a:a + k] = x[a:a + k] * (1 - w) + y[a:a + k] * w
    out[a + k:] = y[a + k:]
    return out
