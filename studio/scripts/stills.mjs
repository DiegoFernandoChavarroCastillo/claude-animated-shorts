// usage: node scripts/stills.mjs <compositionId> <outPrefix> <frame,frame,...> [scale]
// Empaqueta una vez y renderiza stills JPEG. Basado en templates/scripts/bridge-stills.mjs, sin ruta fija a Chrome:
// Remotion usa su propio Chrome Headless Shell. STILLS_ENTRY cambia la entrada (sandboxes).
// Cada bundle copia public/ a la carpeta temporal y no la borra: REMOTION_TMP la lleva a otra carpeta.
import fs from "node:fs";
import path from "node:path";
const tmp = process.env.REMOTION_TMP || "C:/remotion-tmp";
fs.mkdirSync(tmp, { recursive: true });
process.env.TEMP = process.env.TMP = tmp;
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
const [id, prefix, frames, scale = "0.5"] = process.argv.slice(2);
const chromiumOptions = { gl: process.env.STILLS_GL || "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.STILLS_ENTRY || "src/index.ts"), publicDir: path.resolve("public") });
const inputProps = process.env.STILLS_PROPS ? JSON.parse(process.env.STILLS_PROPS) : {};
const composition = await selectComposition({ serveUrl, id, chromiumOptions, inputProps });
const onBrowserLog = (l) => { if (process.env.STILLS_DEBUG || l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
fs.mkdirSync(path.dirname(path.resolve(prefix)), { recursive: true });
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale),
    inputProps, chromiumOptions, timeoutInMilliseconds: 300000, onBrowserLog });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
