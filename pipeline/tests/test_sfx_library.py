"""Pruebas de sfx_library.py (D130): variantes sin repetición seguida y respaldo sintetizado (python pipeline/tests/test_sfx_library.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import sfx_library as L  # noqa: E402

fails = 0


def check(name, ok, info=""):
    global fails
    print(("OK  " if ok else "MAL ") + name, "" if ok else info)
    fails += 0 if ok else 1


check("tipo sin entrada: None (usa el sintetizado)", L.variant("heartbeat", 0) is None)
if L.LIB.exists() and L.variants("pop"):
    keys = [L.variant("pop", k, "x")[2] for k in range(60)]
    check("nunca la misma variante dos veces seguidas", all(a != b for a, b in zip(keys, keys[1:])), keys)
    check("usa todas las variantes", len(set(keys)) == len(L.variants("pop")))
    x, sync, _ = L.variant("riser", 0, "x")
    check("riser con punto de sincronía dentro del audio", 0 <= sync <= len(x) / L.SR)
    check("misma semilla, mismo resultado", L.variant("impact", 3, "s")[2] == L.variant("impact", 3, "s")[2])
else:
    print("(sin sfx_lib/: solo se prueba el respaldo; descarga con tools/sfx_fetch.py)")
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
