"""F18: línea de tiempo, cola de audio, sub-planos de cámara, zona segura y coherencia catálogo↔código, medidos ejecutando el código TypeScript
real (node + esbuild, desde studio/) sobre el ejemplo vigente (python pipeline/tests/test_timeline.py)."""
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
js = (ROOT / "pipeline/tests/js/timeline_check.mjs").read_text(encoding="utf-8")
r = subprocess.run(["node", "--input-type=module"], input=js, cwd=ROOT / "studio", capture_output=True, text=True,
                   env={**os.environ, "EX": str(ROOT / "templates/examples/bluetooth-wifi")})
if r.returncode:
    print("MAL no se pudo ejecutar el código TypeScript:", r.stderr[-600:])
    sys.exit(1)
m = json.loads(r.stdout.strip().splitlines()[-1])
cat = json.loads((ROOT / "templates/catalog.json").read_text(encoding="utf-8"))
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


check("la duración total usa meta.tailS (0,2 s tras la última palabra)", m["total"] == m["expectTotal"] and m["tail"] == 0.2, (m["total"], m["expectTotal"]))
check("los sub-planos se resuelven a fotogramas dentro de su beat, en orden", sum(len(s) for s in m["shots"]) == 6 and all(s == sorted(s) for s in m["shots"]))
check("la cámara arranca cada sub-plano sin salto (paso en el empalme ≤ 0,5)", m["seam"] <= 0.5, m["seam"])
check("el barrido entre sub-planos no es un corte (paso máximo por fotograma ≤ 2,0)", m["maxStep"] <= 2.0, m["maxStep"])
check("fuera de los barridos la cámara se mueve despacio (mediana ≤ 0,06)", m["medianStep"] <= 0.06, m["medianStep"])
slots = m["slots"]
check("zona segura: los slots de overlays están por encima del 72 % del alto", max(slots.values()) <= m["zoneBottom"] <= 0.72, (slots, m["zoneBottom"]))
check("los slots están ordenados de arriba abajo", list(slots.values()) == sorted(slots.values()))
check("el slot más alto queda bajo la banda de subtítulos (30 %)", min(slots.values()) > 0.30)
check("overlays: el catálogo y el código tienen los mismos", set(cat["overlays"]) == set(m["overlays"]), set(cat["overlays"]) ^ set(m["overlays"]))
check("Insert: el texto cabe en ≤ 760 px con cualquier largo (1–18 letras) y nunca baja de 40 px", max(m["insertWidths"]) <= 760 and m["insertMin"] >= 40, (max(m["insertWidths"]), m["insertMin"]))
sys.exit(1 if fails else 0)
