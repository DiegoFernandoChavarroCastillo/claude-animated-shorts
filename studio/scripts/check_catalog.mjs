// usage: node scripts/check_catalog.mjs
// Comprueba templates/catalog.json contra el código (ids, poses, anclas, overlays, iconos) sin abrir el navegador.
import { build } from "esbuild";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "chk-")), "chk.mjs");
await build({
  stdin: { contents: 'import { catalogErrors } from "./src/explainer/catalog"; export default catalogErrors;', resolveDir: process.cwd(), loader: "ts" },
  bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error", loader: { ".ttf": "dataurl", ".woff2": "dataurl", ".png": "dataurl", ".glb": "dataurl" },
});
const errs = (await import(out)).default();
if (errs.length) { console.log("FALLA:\n- " + errs.join("\n- ")); process.exit(1); }
console.log("catálogo y código coinciden");
