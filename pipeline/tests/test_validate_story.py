"""Pruebas de las reglas de variedad de validate_story.py (python pipeline/tests/test_validate_story.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import ROOT, load_json  # noqa: E402
from validate_story import validate  # noqa: E402


def story(heroes: list[str]) -> dict:
    cat = load_json(ROOT / "templates" / "catalog.json")["heroes"]
    beats = [{"id": f"b{i}", "role": "tension", "text": "una dos tres cuatro cinco",
              "scene": {"env": "tech_oscuro", "light": "tech", "hero": {"kind": cat[h]["kind"], "asset": h},
                        "camera": {"preset": "push_in"}}, "overlays": []} for i, h in enumerate(heroes)]
    return {"meta": {"lang": "es"}, "beats": beats}


def with_role(role: str, n: int = 5) -> dict:
    st = story(["telefono", "chip", "perro", "persona", "reloj"][:n])
    st["beats"][1]["role"] = role
    return st


def has(errs, frag):
    return any(frag in e for e in errs)


fails = 0
for name, heroes, expect in [
    ("repetido 4 seguidos", ["persona"] * 4 + ["perro", "chip"], "seguidos"),
    ("8 de 8", ["persona"] * 8, "seguidos"),
    ("reparto", ["telefono", "chip", "telefono", "perro", "telefono", "chip"], None),
    ("dominio >65 %", ["telefono", "chip", "telefono", "telefono", "chip", "telefono", "telefono", "telefono"], "protagonista de"),
    ("5 de 8 (celular-calienta) pasa", ["telefono", "chip", "telefono", "telefono", "chip", "telefono", "perro", "telefono"], None),
]:
    errs = validate(story(heroes))
    ok = has(errs, expect) if expect else not (has(errs, "seguidos") or has(errs, "protagonista de"))
    print("OK " if ok else "MAL", name)
    fails += not ok
for role in ("item", "versus", "chain", "mechanism"):
    ok = has(validate(with_role(role)), f"beat {role} sin overlay")
    print("OK " if ok else "MAL", f"rol {role} sin overlay falla")
    fails += not ok
ok = not has(validate(with_role("story")), "sin overlay")
print("OK " if ok else "MAL", "rol story no pide overlay")
fails += not ok
# acciones (F13)
def with_actions(acts_by_beat: dict, n: int = 6) -> dict:
    st = story(["telefono", "chip", "perro", "persona", "reloj", "planeta"][:n])
    for k, acts in acts_by_beat.items():
        st["beats"][k]["actions"] = acts
    return st


for name, st, frag in [
    ("acción desconocida", with_actions({0: [{"type": "volar_alto", "at": "una"}]}), "acción 'volar_alto' no existe"),
    ("acción de otro objeto", with_actions({0: [{"type": "ecuador", "at": "una"}]}), "acción 'ecuador' no existe"),
    ("ancla inválida", with_actions({0: [{"type": "arrow", "at": "una", "anchor": "no_existe"}]}), "anchor 'no_existe' no válido"),
    ("at que no es palabra", with_actions({0: [{"type": "pulse", "at": "zzz"}]}), "no es una palabra del beat"),
    ("4 acciones en un beat", with_actions({0: [{"type": "pulse", "at": "una"}] * 4}), "4 acciones (máximo 3"),
]:
    ok = has(validate(st), frag)
    print("OK " if ok else "MAL", f"acciones: {name} falla")
    fails += not ok
ok = not any("acción" in e for e in validate(with_actions({5: [{"type": "ecuador", "at": "una"}], 0: [{"type": "lift", "at": "dos"}]})))
print("OK " if ok else "MAL", "acciones válidas (genérica y propia del objeto) pasan")
fails += not ok
ok = has(validate(with_actions({0: [{"type": "pulse", "at": "una"}]}), require_actions=True), "solo 1 de 6 beats llevan acciones")
print("OK " if ok else "MAL", "--require-actions exige la mitad de los beats")
fails += not ok
ok = not has(validate(with_actions({0: [{"type": "pulse", "at": "una"}], 1: [{"type": "pulse", "at": "una"}], 2: [{"type": "pulse", "at": "una"}]}), require_actions=True), "llevan acciones")
print("OK " if ok else "MAL", "--require-actions pasa con la mitad")
fails += not ok


# F16: gancho, ritmo y bucle (con words.json)
def timed(hook_end=2.5, beat_len=2.4, n=6, hook_act=True, cam="push_in", tail=None, ev_each=True):
    st = story(["telefono", "chip", "perro", "persona", "reloj", "telefono"][:n])
    words, t0 = [], 0.1
    for i, b in enumerate(st["beats"]):
        L = hook_end - 0.1 if i == 0 else beat_len
        ws = ["una", "dos", "tres", "cuatro", "cinco"]
        for k, w in enumerate(ws):
            words.append({"w": w, "start": round(t0 + L * k / 5, 2), "end": round(t0 + L * (k + 1) / 5, 2), "beat": b["id"]})
        t0 += L
        b["scene"]["camera"]["preset"] = cam if i == 0 else "push_in"
        b["actions"] = [{"type": "pulse", "at": "una"}] if (ev_each and (i or hook_act)) else []
    if tail is not None:
        st["meta"]["tailS"] = tail
    return st, words


def f16(name, frag, closing=None, **kw):
    global fails
    st, w = timed(**kw)
    errs = validate(st, w, closing=closing)
    ok = has(errs, frag) if frag else not any(k in " ".join(errs) for k in ("gancho dura", "primer beat", "sin ningún cambio", "bucle"))
    print("OK " if ok else "MAL", f"F16: {name}", "" if ok else errs)
    fails += not ok


f16("gancho de 2,5 s con acción pasa", None)
f16("gancho de 4 s falla", "el gancho dura", hook_end=4.0)
f16("primer beat sin acción falla", "no tiene una acción antes de 1 s", hook_act=False)
f16("primer beat con drift falla", "demasiado suave", cam="drift")
f16("5 s sin cambios falla", "sin ningún cambio en pantalla", beat_len=5.5, ev_each=False)
f16("cierre bucle con cola de 1 s falla", "meta.tailS", closing="bucle")
f16("cierre bucle con cola de 0,2 s pasa", None, closing="bucle", tail=0.2)
f16("otro cierre con cola de 1 s pasa", None, closing="reto_casa")


# F17: sub-planos y bucle visual
def shots_story(shots, last_env=None):
    st, w = timed(tail=0.2)
    st["beats"][1]["shots"] = shots
    if last_env:
        st["beats"][-1]["scene"]["env"] = last_env
    return st, w


def f17(name, frag, shots=(), closing=None, last_env=None):
    global fails
    st, w = shots_story(list(shots), last_env)
    errs = validate(st, w, closing=closing)
    ok = has(errs, frag) if frag else not any(k in " ".join(errs) for k in ("sub-plano", "shot", "bucle"))
    print("OK " if ok else "MAL", f"F17: {name}", "" if ok else errs)
    fails += not ok


S = lambda at, p: {"at": at, "camera": {"preset": p}}  # noqa: E731
f17("un sub-plano válido pasa", None, [S("tres", "orbit_slow")])
f17("sub-plano con otra cámara que no existe falla", "no existe", [S("tres", "volar")])
f17("sub-plano que repite la cámara falla", "repite la cámara", [S("tres", "push_in")])
f17("sub-plano con at que no es palabra falla", "no es una palabra", [S("zzz", "orbit_slow")])
f17("4 sub-planos falla", "máximo 3", [S("una", "orbit_slow"), S("dos", "drift"), S("tres", "crane_up"), S("cuatro", "pull_out")])
f17("bucle con último beat en otro entorno falla", "debe volver al entorno", closing="bucle", last_env="cocina")
f17("bucle con último beat en el mismo entorno pasa", None, closing="bucle")


# F18: insertos (B-roll de datos)
def with_insert(beat=2, **spec):
    st, w = timed(tail=0.2)
    st["beats"][0]["role"] = "hook"
    st["beats"][beat]["overlays"] = [{"type": "Insert", "at": "tres", "text": "1600 SALTOS", "icon": "bolt", **spec}]
    return st, w


def f18(name, frag, st_w, n=1):
    global fails
    st, w = st_w
    errs = validate(st, w)
    ok = has(errs, frag) if frag else not any("Insert" in e for e in errs)
    print("OK " if ok else "MAL", f"F18: {name}", "" if ok else errs)
    fails += not ok


f18("un Insert válido pasa", None, with_insert())
f18("Insert en el gancho falla", "no va en el gancho", with_insert(beat=0))
f18("Insert con hold largo falla", "hold", with_insert(hold=120))
f18("Insert con texto largo falla", "texto del Insert", with_insert(text="UN TEXTO DEMASIADO LARGO PARA UN INSERTO"))
f18("Insert con icono inexistente falla", "icono", with_insert(icon="no_existe"))
st, w = timed(tail=0.2)
for b in st["beats"][1:5]:
    b["overlays"] = [{"type": "Insert", "at": "tres", "text": "DATO", "icon": "bolt"}]
f18("4 Insert en el video falla", "máximo 3", (st, w))
sys.exit(1 if fails else 0)
