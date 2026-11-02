"""Prueba del validador de guion (criterio F6): los guiones de ejemplo pasan y cada guion roto falla SOLO por su
motivo. Sin pytest: python pipeline\\tests\\test_validate_script.py  (código 0 = todo bien)."""
from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from validate_script import validate  # noqa: E402

ROOT = HERE.parents[1]
GOOD = [ROOT / "templates/examples/hielo-flota/02_SCRIPT.md", ROOT / "templates/examples/cielo-azul/02_SCRIPT.md",
        ROOT / "templates/examples/hielo-flota-en/02_SCRIPT.md"]
# guion roto -> fragmento que debe aparecer en el ÚNICO error
BAD = {
    "bad_gancho_sin_tu.md": "no está en 2.ª persona",
    "bad_numero_sin_fuente.md": "número sin fuente: 'trescientos millones'",
    "bad_sin_giro.md": "falta el beat de giro",
    "bad_frase_larga.md": "frase de",
}


def main() -> int:
    fails = 0
    for p in GOOD:
        errs, st = validate(p.read_text(encoding="utf-8"))
        ok = not errs
        fails += not ok
        print(f"{'OK ' if ok else 'MAL'} pasa   {p.relative_to(ROOT)}  ({st.get('lang')}, {st.get('words')} palabras)" + ("" if ok else f"  {errs}"))
    for name, want in BAD.items():
        errs, _ = validate((HERE / "scripts" / name).read_text(encoding="utf-8"))
        ok = len(errs) == 1 and want in errs[0]
        fails += not ok
        print(f"{'OK ' if ok else 'MAL'} falla  {name}: {errs}")
    print("TODO BIEN" if not fails else f"{fails} PRUEBAS MAL")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
