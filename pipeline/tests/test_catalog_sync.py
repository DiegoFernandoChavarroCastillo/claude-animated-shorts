"""F18: el catálogo (templates/catalog.json) y el código (heroes, acciones, cámaras, envs) dicen lo mismo, y cada objeto tiene 'when' y etiquetas
(python pipeline/tests/test_catalog_sync.py). Ejecuta el TypeScript real con node + esbuild."""
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JS = """
import { build } from "esbuild"; import path from "node:path"; import fs from "node:fs";
const out = path.join(fs.mkdtempSync(path.join(process.cwd(), ".tmp-cs-")), "c.mjs");
await build({ stdin: { contents: 'import { HEROES } from "./src/explainer/heroes"; export { ACTION_DEFS } from "./src/explainer/actions"; export { CAMERA_PRESETS, LIGHT_NAMES } from "./src/explainer/schema"; export { HEROES };',
  resolveDir: process.cwd(), loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error", loader: { ".glb": "dataurl" }, jsx: "automatic", external: ["remotion", "react"] });
const M = await import(out); fs.rmSync(path.dirname(out), { recursive: true, force: true });
console.log(JSON.stringify({ heroes: Object.fromEntries(Object.entries(M.HEROES).map(([k, h]) => [k, { poses: h.poses, anchors: Object.keys(h.anchors), actions: Object.keys(h.actions ?? {}), when: h.when }])),
  actions: Object.keys(M.ACTION_DEFS ?? {}), camera: M.CAMERA_PRESETS, lights: M.LIGHT_NAMES }));
"""
r = subprocess.run(["node", "--input-type=module"], input=JS, cwd=ROOT / "studio", capture_output=True, text=True)
if r.returncode:
    print("MAL no se pudo ejecutar el código TypeScript:", r.stderr[-600:])
    sys.exit(1)
code = json.loads(r.stdout.strip().splitlines()[-1])
cat = json.loads((ROOT / "templates/catalog.json").read_text(encoding="utf-8"))
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


check("objetos: mismos en código y catálogo", set(code["heroes"]) == set(cat["heroes"]), set(code["heroes"]) ^ set(cat["heroes"]))
bad = [k for k, h in code["heroes"].items() if k in cat["heroes"] and (h["poses"] != cat["heroes"][k]["poses"] or h["anchors"] != cat["heroes"][k]["anchors"]
       or sorted(h["actions"]) != sorted(cat["heroes"][k].get("actions", {})))]
check("objetos: poses, anclas y acciones propias coinciden", not bad, bad)
check("todos los objetos tienen 'when' y al menos 5 etiquetas", all(h.get("when") and len(h.get("tags", [])) >= 5 for h in cat["heroes"].values()), [k for k, h in cat["heroes"].items() if len(h.get("tags", [])) < 5])
check("acciones: mismas en código y catálogo", set(code["actions"]) == set(cat["actions"]), set(code["actions"]) ^ set(cat["actions"]))
check("cámaras: mismas en código y catálogo", set(code["camera"]) == set(cat["camera"]), set(code["camera"]) ^ set(cat["camera"]))
check("luces: mismas en código y catálogo", set(code["lights"]) == set(cat["lights"]), set(code["lights"]) ^ set(cat["lights"]))
sys.exit(1 if fails else 0)
