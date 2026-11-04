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
sys.exit(1 if fails else 0)
