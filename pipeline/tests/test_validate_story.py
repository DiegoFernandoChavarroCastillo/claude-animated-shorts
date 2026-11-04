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
sys.exit(1 if fails else 0)
