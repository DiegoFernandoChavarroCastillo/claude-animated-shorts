"""F15/F18: los 19 sonidos son válidos y el director de acentos no recarga el video (python pipeline/tests/test_sfx.py)."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import sfx_plan  # noqa: E402
from common import AUDIO_KIT  # noqa: E402,F401
from dsp import SR  # noqa: E402
from sfx_synth import ACCENTS, REL_DB, SFX  # noqa: E402

fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


# ---- síntesis
for n, fn in SFX.items():
    x = fn()
    d = len(x) / SR
    ok = np.isfinite(x).all() and 0.5 < np.abs(x).max() <= 1.0001 and 0.02 < d <= 1.3 and n in REL_DB
    check(f"sonido {n}: finito, pico ≤1, dura {d:.2f} s", ok)
check("los acentos van más bajos que la voz − 10 dB + 0 (REL_DB ≤ −1)", all(REL_DB[a] <= -1 for a in ACCENTS))
check("la síntesis es determinista", all(np.array_equal(SFX[n](), SFX[n]()) for n in SFX))
check("todos los sonidos del catálogo existen", set(__import__("json").load(open(Path(__file__).resolve().parents[2] / "templates/catalog.json"))["sfx"]) == set(SFX))


# ---- plan y director
def story(actions_by_beat, sfx_by_beat=None, n=8):
    beats = [{"id": f"b{i + 1:02d}", "role": "chain", "text": "a b c d e f", "overlays": [], "actions": actions_by_beat.get(i, []),
              "sfx": (sfx_by_beat or {}).get(i, []), "transition": "cut"} for i in range(n)]
    words = [{"w": w, "start": 4.0 * i + 0.4 * k, "end": 4.0 * i + 0.4 * k + 0.3, "beat": f"b{i + 1:02d}"} for i in range(n) for k, w in enumerate("a b c d e f".split())]
    return {"meta": {}, "beats": beats}, words


def types(acts, sfx=None, n=8):
    st, w = story(acts, sfx, n)
    return [(e["type"], e["t"]) for e in sfx_plan.plan(st, w)["events"] if e["type"] in ACCENTS]


A = lambda t, at, **k: {"type": t, "at": at, **k}  # noqa: E731
check("burst suena a zap", [x[0] for x in types({0: [A("burst", "a")]})] == ["zap"])
check("mark ✓ = ding, ✗ = buzz_no, ♥ = heartbeat", [x[0] for x in types({0: [A("mark", "a", text="✓")], 3: [A("mark", "a", text="✗")], 6: [A("mark", "a", text="♥")]})] == ["ding", "buzz_no", "heartbeat"])
check("steam con burbujas = bubbles", [x[0] for x in types({0: [A("steam", "a", kind="bubbles")]})] == ["bubbles"])
check("dos acentos a menos de 1,2 s: solo queda uno", len(types({0: [A("sparkle", "a"), A("burst", "c")]})) == 1)
check("el de mayor prioridad (zap) gana al shimmer", [x[0] for x in types({0: [A("sparkle", "a"), A("burst", "c")]})] == ["zap"])
check("el mismo acento no se repite antes de 4 s", len(types({0: [A("sparkle", "a"), A("sparkle", "e")]})) == 1)
check("el pedido a mano tiene prioridad", [x[0] for x in types({0: [A("burst", "a")]}, {0: [{"type": "ding", "at": "a"}]})] == ["ding"])
many = {i: [A("sparkle" if i % 2 else "halo", "a")] for i in range(8)}
check("tope de acentos: ≤ 1 cada 3 s", len(types(many)) <= int(8 * 4.0 / 3) + 1)
check("los sonidos de estructura no se tocan (whoosh de transición glide)", any(e["type"] == "whoosh_soft" for e in sfx_plan.plan(*(lambda s, w: ({**s, "beats": [{**b, "transition": "glide"} for b in s["beats"]]}, w))(*story({})))["events"]))
sys.exit(1 if fails else 0)
