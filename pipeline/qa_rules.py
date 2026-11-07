"""Reglas de calidad de plan y mezcla (F18), medidas sobre los archivos del video: se suman a la tabla de 10_qa.md.

Cada regla de F16/F17 (gancho, ritmo, cola, bucle, sub-planos, densidad de sonido) tiene aquí su comprobación, así que un video
no pasa el QA si el plan se saltó una de ellas. Devuelve filas (nombre, valor, objetivo, ok).
"""
from __future__ import annotations

import re
from pathlib import Path

from common import engine_of, load_json
from validate_story import (FAREWELL_ES, HOOK_ACTION_S, HOOK_MAX_S, HOOK_STATIC_CAMERAS, LOOP_TAIL_MAX_S, MAX_EVENT_GAP_S, MAX_SHOTS,
                            at_seconds, event_gap, script_closing)

ACCENT_MAX_PER_S = 1 / 3.0     # un acento (sonido no estructural) por cada 3 s como máximo
ACCENT_MIN_GAP_S = 1.2
BED_MIN_BELOW_DB = 18         # con cama sonora, la voz debe quedar al menos 18 dB por encima
EVENTS_PER_MIN_MAX = 48        # todos los sonidos juntos (los ticks de un contador cuentan uno a uno)


def rows(d: Path) -> list[tuple[str, object, str, bool]]:
    story, words = load_json(d / "05_story.json"), load_json(d / "04_words.json")
    md = (d / "02_SCRIPT.md").read_text(encoding="utf-8")
    closing = script_closing(md)
    beats, out = story["beats"], []

    def row(name, val, target, ok):
        out.append((name, val, target, bool(ok)))

    w1 = [w for w in words if w["beat"] == beats[0]["id"]]
    row("gancho dicho en (s)", round(w1[-1]["end"], 1), f"≤ {HOOK_MAX_S}", w1[-1]["end"] <= HOOK_MAX_S)
    acts = [at_seconds(beats[0], w1, a.get("at"), 0.0) for a in beats[0].get("actions", [])]
    first = min(acts) if acts else None
    row("primera acción del gancho (s)", None if first is None else round(first, 1), f"≤ {HOOK_ACTION_S}", first is not None and first <= HOOK_ACTION_S)
    cam = beats[0]["scene"]["camera"]["preset"]
    row("cámara del gancho", cam, f"no {'/'.join(HOOK_STATIC_CAMERAS)}", cam not in HOOK_STATIC_CAMERAS)
    gap, at = event_gap(story, words)
    row("hueco máximo sin cambios en pantalla (s)", round(gap, 1), f"≤ {MAX_EVENT_GAP_S}", gap <= MAX_EVENT_GAP_S)
    shots = max((len(b.get("shots", [])) for b in beats), default=0)
    row("sub-planos por beat (máx.)", shots, f"≤ {MAX_SHOTS}", shots <= MAX_SHOTS)
    tail = story["meta"].get("tailS", 1.0)
    if closing == "bucle":
        row("cola tras la última palabra con bucle (s)", tail, f"≤ {LOOP_TAIL_MAX_S}", tail <= LOOP_TAIL_MAX_S)
        s0, s1 = beats[0]["scene"], beats[-1]["scene"]
        if engine_of(story) == "2d":   # motor 2D: misma paleta y los mismos assets
            same = s0["palette"] == s1["palette"] and {x["asset"] for x in s0["layers"]} == {x["asset"] for x in s1["layers"]}
            row("el último beat vuelve a la paleta y a los assets del primero", "sí" if same else "no", "sí", same)
        else:
            same = s0["env"] == s1["env"] and s0["hero"]["asset"] == s1["hero"]["asset"]
            row("el último beat vuelve al entorno y objeto del primero", "sí" if same else "no", "sí", same)
        last = beats[-1]["text"].lower()
        row("el cierre en bucle no se despide", "sí" if not re.search(FAREWELL_ES, last) else "no", "sí", not re.search(FAREWELL_ES, last))
    plan = d / "08_sfx_plan.json"
    if plan.exists():
        p = load_json(plan)
        ev, dur = p["events"], p["duration_s"]
        from sfx_synth import ACCENTS
        acc = sorted(e["t"] for e in ev if e["type"] in ACCENTS)
        gaps = [b - a for a, b in zip(acc, acc[1:])]
        row("acentos de sonido por cada 3 s", round(len(acc) / (dur * ACCENT_MAX_PER_S), 2), "≤ 1", len(acc) <= max(1, int(dur * ACCENT_MAX_PER_S)))
        row("separación mínima entre acentos (s)", round(min(gaps), 2) if gaps else "n/d", f"≥ {ACCENT_MIN_GAP_S}", not gaps or min(gaps) >= ACCENT_MIN_GAP_S - 1e-6)
        ticks = sorted(e["t"] for e in ev if e["type"] == "tick")
        bursts = sum(1 for k, x in enumerate(ticks) if k == 0 or x - ticks[k - 1] > 0.5)   # una cuenta de ticks suena como un solo gesto
        per_min = (len([e for e in ev if e["type"] != "tick"]) + bursts) / (dur / 60)
        row("sonidos por minuto (una cuenta de ticks = 1)", round(per_min, 1), f"≤ {EVENTS_PER_MIN_MAX}", per_min <= EVENTS_PER_MIN_MAX)
    rep = d / "08_mix.wav.report.json"
    if rep.exists() and load_json(rep).get("bed_below_voice_db") is not None:   # solo con meta.music: true
        db = load_json(rep)["bed_below_voice_db"]
        row("cama sonora bajo la voz (dB)", db, f"≥ {BED_MIN_BELOW_DB}", db >= BED_MIN_BELOW_DB)
    return out
