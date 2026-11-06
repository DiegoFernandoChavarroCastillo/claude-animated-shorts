"""Corre todas las pruebas de la skill (pipeline/tests/test_*.py) y el typecheck de TypeScript; sale con código 1 si algo falla.

    python tools/run_tests.py            # todo
    python tools/run_tests.py sfx tools  # solo las que contienen esas palabras
Regla del proyecto (F18): toda función nueva lleva su prueba aquí, y esto debe pasar antes de comitear.
"""
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
only = sys.argv[1:]
tests = sorted(p for p in (ROOT / "pipeline" / "tests").glob("test_*.py") if not only or any(o in p.name for o in only))
rows, bad = [], 0
for p in tests:
    t0 = time.time()
    r = subprocess.run([sys.executable, str(p)], cwd=ROOT, capture_output=True, text=True)
    out = r.stdout + r.stderr
    n_ok, n_bad = out.count("\nOK") + out.startswith("OK"), out.count("\nMAL") + out.startswith("MAL") + out.count("MAL ")
    ok = r.returncode == 0
    bad += not ok
    rows.append((p.name, "✅" if ok else "❌", n_ok, f"{time.time() - t0:.1f} s"))
    if not ok:
        print(f"--- {p.name} ---\n" + "\n".join(l for l in out.splitlines() if "MAL" in l or "Error" in l or "Traceback" in l)[-1500:])
if not only or "tsc" in only:
    t0 = time.time()
    r = subprocess.run(["npx", "tsc", "--noEmit"], cwd=ROOT / "studio", capture_output=True, text=True)
    errs = [l for l in r.stdout.splitlines() if "error TS" in l]
    bad += bool(errs)
    rows.append(("tsc (TypeScript)", "✅" if not errs else "❌", 0, f"{time.time() - t0:.1f} s"))
    for e in errs[:5]:
        print(e)
print("\n| prueba | | comprobaciones OK | tiempo |\n|---|---|---|---|")
for r in rows:
    print(f"| {r[0]} | {r[1]} | {r[2] or '—'} | {r[3]} |")
print("\nTODO BIEN" if not bad else f"\n{bad} PRUEBAS MAL")
sys.exit(1 if bad else 0)
