"""Busca assets, paletas y acciones en templates/catalog2d.json por palabras (puntúa tags y 'when').

    python tools/catalog_search2d.py sombras pared fuego
"""
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))
from common import ROOT, load_json  # noqa: E402

norm = lambda s: "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")  # noqa: E731
cat = load_json(ROOT / "templates" / "catalog2d.json")
q = [norm(w) for w in sys.argv[1:]]
if not q:
    sys.exit(__doc__)
rows = []
for k, a in cat["assets"].items():
    score = sum(3 for w in q for t in a["tags"] if w in norm(t)) + sum(1 for w in q if w in norm(a["when"]))
    if score:
        rows.append((score, k, a))
for score, k, a in sorted(rows, key=lambda r: -r[0]):
    acts = ", ".join(a.get("actions", {})) or "—"
    print(f"{score:3d}  {k}  [{a['kind']}] acciones propias: {acts}\n     {a['when']}")
if not rows:
    print("nada: si el concepto es central, crea el asset (studio/src/flat2d/assets/) y regístralo en catalog2d.json")
