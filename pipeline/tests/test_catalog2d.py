"""Coherencia de templates/catalog2d.json con el código (python pipeline/tests/test_catalog2d.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import ROOT, load_json  # noqa: E402

cat = load_json(ROOT / "templates" / "catalog2d.json")
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


for k, a in cat["assets"].items():
    f = ROOT / "studio" / "src" / "flat2d" / "assets" / f"{k}.tsx"
    check(f"{k}: tiene su dibujo (assets/{k}.tsx)", f.exists())
    check(f"{k}: aspect, anclaje, parallax y tags válidos", a["aspect"] > 0 and len(a["anchor"]) == 2 and all(0 <= v <= 1 for v in a["anchor"]) and a["par"] > 0 and a["tags"] and a["when"])
    check(f"{k}: sus acciones propias no chocan con las genéricas", not set(a.get("actions", {})) & set(cat["actions"]))
    check(f"{k}: el registro conoce su componente", f"{k}" in (ROOT / "studio/src/flat2d/assets/registry.tsx").read_text(encoding="utf-8"))
keys = [set(p) for p in cat["palettes"].values()]
check("todas las paletas tienen los mismos colores", all(k == keys[0] for k in keys))
check("cada estructura usa roles con orden", all(s["order"] and set(s.get("min", {})) <= set(s["order"]) for s in cat["structures"].values()))
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
