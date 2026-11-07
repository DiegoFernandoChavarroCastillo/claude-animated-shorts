"""Prueba de no regresión del pipeline 3D (F0 del plan story-2d): pruebas, validación del ejemplo `bluetooth-wifi`,
sus stills y la comparación con las miniaturas guardadas en tools/baseline/bluetooth-wifi/.

    python tools/regression_check.py            # comprueba (≈1–2 min); sale con código 1 si algo cambió
    python tools/regression_check.py baseline   # guarda la línea base actual (hazlo solo cuando el cambio visual sea intencionado)

No necesita voz ni render: usa 04_words.json del ejemplo. Trabaja en out/_regression (que no se sube a Git).
"""
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]
EX = ROOT / "templates" / "examples" / "bluetooth-wifi"
WORK = ROOT / "out" / "_regression"
BASE = ROOT / "tools" / "baseline" / "bluetooth-wifi"
THUMB = (135, 240)     # miniatura de comparación
MAX_DIFF = 3.0         # diferencia media por canal (0–255) que se tolera entre dos stills
env = {**os.environ, "REMOTION_TMP": os.environ.get("REMOTION_TMP", str(Path.home() / "remotion-tmp"))}
mode = sys.argv[1] if len(sys.argv) > 1 else "check"


def run(cmd: list[str], cwd: Path = ROOT):
    return subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)


def step(name: str, ok: bool, detail: str = "", t0: float = 0.0) -> bool:
    print(f"{'✅' if ok else '❌'} {name} ({time.time() - t0:.0f} s){': ' + detail if detail else ''}")
    return ok


def prepare():
    WORK.mkdir(parents=True, exist_ok=True)
    for n in ("02_SCRIPT.md", "04_words.json", "05_story.json"):
        shutil.copy2(EX / n, WORK / n)
    shutil.rmtree(WORK / "06_stills", ignore_errors=True)


def thumbs(folder: Path) -> dict[str, Image.Image]:
    return {p.stem: Image.open(p).convert("RGB").resize(THUMB) for p in sorted(folder.glob("*.*g")) if p.suffix in (".jpg", ".png")}


def main() -> int:
    ok = True
    if mode == "baseline":
        pass   # al guardar la línea base no hace falta correr las pruebas
    else:
        t0 = time.time()
        r = run([sys.executable, "tools/run_tests.py"])
        ok &= step("pruebas (run_tests.py)", r.returncode == 0, "" if r.returncode == 0 else (r.stdout + r.stderr)[-400:], t0)

    prepare()
    py = [sys.executable, "pipeline/make_short.py"]
    t0 = time.time()
    r = run(py + ["validate-story", "--id", "_regression"])
    ok &= step("validar el story del ejemplo", r.returncode == 0, "" if r.returncode == 0 else (r.stdout + r.stderr)[-500:], t0)
    if r.returncode != 0:
        return 1

    t0 = time.time()
    r = run(py + ["stills", "--id", "_regression", "--stills-scale", "0.5"])
    got = WORK / "06_stills"
    n = len(list(got.glob("*.jpg")))
    ok &= step("stills del ejemplo", r.returncode == 0 and n > 0, f"{n} stills" if n else (r.stdout + r.stderr)[-500:], t0)
    if not n:
        return 1

    if mode == "baseline":
        shutil.rmtree(BASE, ignore_errors=True)
        BASE.mkdir(parents=True)
        for name, im in thumbs(got).items():
            im.save(BASE / f"{name}.png")
        (BASE / "manifest.json").write_text(json.dumps({"stills": n, "thumb": THUMB, "max_diff": MAX_DIFF}), encoding="utf-8")
        print(f"línea base guardada: {n} miniaturas en {BASE.relative_to(ROOT)}")
        return 0

    if not BASE.exists():
        print("❌ no hay línea base: corre `python tools/regression_check.py baseline` en una rama sana")
        return 1
    t0 = time.time()
    ref, cur = thumbs(BASE), thumbs(got)
    missing = sorted(set(ref) - set(cur)) + sorted(set(cur) - set(ref))
    worst = ("", 0.0)
    for name in sorted(set(ref) & set(cur)):
        d = max(ImageStat.Stat(ImageChops.difference(ref[name], cur[name])).mean)
        if d > worst[1]:
            worst = (name, d)
    same = not missing and worst[1] <= MAX_DIFF
    ok &= step("stills iguales a la línea base", same,
               f"peor diferencia {worst[1]:.2f} ({worst[0]}), límite {MAX_DIFF}" + (f"; distintos: {', '.join(missing)}" if missing else ""), t0)
    print("\nNO REGRESIÓN: TODO BIEN" if ok else "\nNO REGRESIÓN: HAY CAMBIOS (revisa arriba)")
    return 0 if ok else 1


sys.exit(main())
