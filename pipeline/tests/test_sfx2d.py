"""F5 (story-2d): las acciones 2D suenan con el sonido previsto y el swipe lleva whoosh (python pipeline/tests/test_sfx2d.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import sfx_plan  # noqa: E402
from sfx_synth import SFX  # noqa: E402

fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


def story(action, transition="cut", n=4):
    beats, words = [], []
    for i in range(n):
        beats.append({"id": f"b{i}", "role": "scene", "text": "una dos tres cuatro", "overlays": [], "sfx": [], "transition": transition,
                      "actions": [{"type": action, "at": "dos"}] if i == 1 else []})
        words += [{"w": w, "start": i * 8 + k * 0.5, "end": i * 8 + k * 0.5 + 0.4, "beat": f"b{i}"} for k, w in enumerate("una dos tres cuatro".split())]
    return {"meta": {"tailS": 0.2}, "beats": beats}, words


for act, snd in (("flare", "fire_crackle"), ("walk", "footsteps"), ("carry", "footsteps"), ("sunrise", "wind"), ("light_grow", "shimmer"), ("shadow_pass", "whoosh_soft")):
    ev = sfx_plan.plan(*story(act))["events"]
    check(f"acción {act} suena como {snd}", any(e["type"] == snd for e in ev), [e["type"] for e in ev])
check("transición swipe lleva whoosh", any(e["type"] == "whoosh_soft" for e in sfx_plan.plan(*story("pop", transition="swipe"))["events"]))
check("transición cut no lleva whoosh de transición", not any("transición" in e["why"] for e in sfx_plan.plan(*story("pop", transition="cut"))["events"]))
check("los sonidos nuevos existen y duran ≤1,3 s", all(n in SFX and len(SFX[n]()) <= 1.3 * 48000 for n in ("fire_crackle", "chains", "footsteps", "wind")))
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
