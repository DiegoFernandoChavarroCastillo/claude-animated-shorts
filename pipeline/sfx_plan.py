"""Plan de SFX (plan §7.6): story.json + words.json -> lista de eventos {type, t, why}.

    python pipeline\\sfx_plan.py --story <05_story.json> --words <04_words.json> --out <08_sfx_plan.json>

Reglas: whoosh_soft en cada transición glide / zoom_through; pop al entrar cada overlay; tick en los contadores
(StatCallout, BarCompare); impact suave al terminar la cuenta de un StatCallout; riser de 0,8 s antes del beat twist;
más un efecto por cada acción del beat (ACTION_SFX: salir volando = whoosh, onda de choque o chispas = impact, anillo o halo = pop)
y los "sfx" que el story.json pida a mano. Los frames siguen las mismas reglas que timeline.ts.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import FPS, TAIL_MS, PipelineError, load_json, norm, run_main, write_json  # noqa: E402

LEAD_F = 2                  # timeline.ts: el beat empieza 2 frames antes de su primera palabra
STAT_COUNT_F = 24           # StatCallout cuenta en 24 frames (prog(0, 24))
BAR_FILL_F = (6, 30)        # BarCompare llena la barra i entre 6 + 4i y 30 + 4i
ACTION_SFX = {"fly": "whoosh_soft", "speed": "whoosh_soft", "lift": "whoosh_soft", "shockwave": "impact", "burst": "impact", "topple": "impact",
              "shake": "impact", "hop": "pop", "pulse": "pop", "ring": "pop", "arrow": "pop", "halo": "pop"}   # F13: acciones con sonido; el resto, mudas


def beat_frames(story: dict, words: list[dict]):
    out, ids = [], [b["id"] for b in story["beats"]]
    for i, bid in enumerate(ids):
        ws = [k for k, w in enumerate(words) if w["beat"] == bid]
        if not ws:
            raise PipelineError(f"el beat {bid} no tiene palabras en words.json")
        a = 0 if i == 0 else max(0, round(words[ws[0]]["start"] * FPS) - LEAD_F)
        out.append({"id": bid, "a": a, "words": ws})
    total = round((words[-1]["end"] + TAIL_MS / 1000) * FPS)
    for i, b in enumerate(out):
        b["b"] = out[i + 1]["a"] if i + 1 < len(out) else total
    return out, total


def resolve_at(bt: dict, words: list[dict], at) -> int:
    if at is None:
        return bt["a"]
    if isinstance(at, (int, float)):
        return bt["a"] + int(at)
    m = re.fullmatch(r"#(\d+)", at)
    idx = bt["words"][int(m.group(1))] if m else next((k for k in bt["words"] if norm(words[k]["w"]) == norm(at)), None)
    if idx is None:
        raise PipelineError(f'"at": "{at}" no es una palabra del beat {bt["id"]}')
    return round(words[idx]["start"] * FPS)


def plan(story: dict, words: list[dict]) -> dict:
    bts, total = beat_frames(story, words)
    ev = []
    add = lambda typ, f, why: ev.append({"type": typ, "t": round(f / FPS, 3), "why": why})  # noqa: E731
    for i, (b, bt) in enumerate(zip(story["beats"], bts)):
        if i + 1 < len(bts) and b.get("transition", "glide") in ("glide", "zoom_through"):
            add("whoosh_soft", bts[i + 1]["a"] - 8, f"{b['id']}: transición {b.get('transition', 'glide')}")
        if b["role"] == "twist":
            add("riser", bt["a"] - round(0.8 * FPS), f"{b['id']}: antes del giro")
        for o in b.get("overlays", []):
            f0 = resolve_at(bt, words, o.get("at"))
            add("pop", f0, f"{b['id']}: entra {o['type']}")
            if o["type"] == "StatCallout":
                for k in range(6):
                    add("tick", f0 + 2 + k * 3, f"{b['id']}: contador")
                add("impact", f0 + STAT_COUNT_F, f"{b['id']}: fin de la cuenta")
            elif o["type"] == "BarCompare":
                for i_bar in range(len(o.get("items", []))):
                    for k in range(4):
                        add("tick", f0 + BAR_FILL_F[0] + 4 * i_bar + k * 5, f"{b['id']}: barra {i_bar + 1}")
        for a in b.get("actions", []):
            if a.get("type") in ACTION_SFX:
                add(ACTION_SFX[a["type"]], resolve_at(bt, words, a.get("at")), f"{b['id']}: acción {a['type']}")
        for s in b.get("sfx", []):
            add(s["type"], resolve_at(bt, words, s.get("at")), f"{b['id']}: pedido en story.json")
    ev.sort(key=lambda e: e["t"])
    ev = [e for k, e in enumerate(ev) if "acción" not in e["why"] or not any(o["type"] == e["type"] and 0 <= e["t"] - o["t"] < 0.12 for o in ev[:k])]   # una acción no duplica un sonido que ya suena
    for e in ev:
        e["t"] = max(0.0, e["t"])
    return {"duration_s": round(total / FPS, 3), "frames": total, "events": ev}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--story", required=True, type=Path)
    ap.add_argument("--words", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    a = ap.parse_args()
    p = plan(load_json(a.story), load_json(a.words))
    write_json(a.out, p)
    counts = {}
    for e in p["events"]:
        counts[e["type"]] = counts.get(e["type"], 0) + 1
    print(f"[sfx] {len(p['events'])} eventos {counts}, video {p['duration_s']} s -> {a.out}")


if __name__ == "__main__":
    run_main(main)
