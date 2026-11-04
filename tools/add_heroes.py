"""Añade filas de objetos protagonistas a templates/catalog.json leyendo sus datos del código TypeScript
(poses, anclas y 'when' salen de studio/src/explainer/heroes/*), más los 'tags' que se pasan en un JSON.

    python tools/add_heroes.py tags.json     # {"garganta_corte": ["garganta", "dolor", ...], ...}
"""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from catalog_io import load, save  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
js = """
import { build } from "esbuild"; import path from "node:path"; import os from "node:os"; import fs from "node:fs";
const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "hd-")), "h.mjs");
await build({ stdin: { contents: 'import { HEROES } from "./src/explainer/heroes"; export default HEROES;', resolveDir: process.cwd(), loader: "ts" },
  bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error", loader: { ".glb": "dataurl" } });
const H = (await import(out)).default;
console.log(JSON.stringify(Object.fromEntries(Object.entries(H).map(([k, h]) => [k, { kind: h.kind, poses: h.poses, anchors: Object.keys(h.anchors), when: h.when }]))));
"""
raw = subprocess.check_output(["node", "--input-type=module", "-e", js], cwd=ROOT / "studio", text=True)
code = json.loads(raw.strip().splitlines()[-1])
tags = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8")) if len(sys.argv) > 1 else {}
cat = load()
new = 0
for k, h in code.items():
    if k not in cat["heroes"]:
        new += 1
    old = cat["heroes"].get(k, {})
    cat["heroes"][k] = {**h, "tags": tags.get(k, old.get("tags", []))}
    if not cat["heroes"][k]["tags"]:
        del cat["heroes"][k]["tags"]
# conserva el orden y el formato de los existentes: kind, poses, anchors, when, tags
save(cat)
print(f"{len(code)} objetos en el código, {new} nuevos en el catálogo")
