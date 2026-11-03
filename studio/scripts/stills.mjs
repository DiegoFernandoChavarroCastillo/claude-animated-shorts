// usage: node scripts/stills.mjs <outDir> <Comp@f1,f2,...> [<Comp2@...> ...] [--scale 0.5]
// Empaqueta una vez y renderiza stills JPEG en <outDir>/<Comp>_<frame>.jpg. Remotion usa su Chrome Headless Shell.
// Variables: REMOTION_TMP (carpeta temporal, por defecto C:/remotion-tmp en Windows y ~/remotion-tmp en el resto: cada bundle copia public/ y no se borra),
// STILLS_PROPS (inputProps en JSON), STILLS_GL (por defecto angle), STILLS_ENTRY (otra entrada), STILLS_DEBUG.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const tmp = process.env.REMOTION_TMP || (process.platform === "win32" ? "C:/remotion-tmp" : path.join(os.homedir(), "remotion-tmp"));
fs.mkdirSync(tmp, { recursive: true });
process.env.TEMP = process.env.TMP = tmp;
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
const args = process.argv.slice(2);
const si = args.indexOf("--scale");
const scale = si >= 0 ? Number(args.splice(si, 2)[1]) : 0.5;
const [outDir, ...specs] = args;
fs.mkdirSync(outDir, { recursive: true });
const chromiumOptions = { gl: process.env.STILLS_GL || "angle" };
const inputProps = process.env.STILLS_PROPS ? JSON.parse(process.env.STILLS_PROPS) : {};
const onBrowserLog = (l) => { if (process.env.STILLS_DEBUG || l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.STILLS_ENTRY || "src/index.ts"), publicDir: path.resolve("public") });
console.log("bundle", ((Date.now() - t0) / 1000).toFixed(1) + "s");
for (const spec of specs) {
  const [id, frames] = spec.split("@");
  const composition = await selectComposition({ serveUrl, id, chromiumOptions, inputProps });
  for (const f of frames.split(",").map(Number)) {
    const t1 = Date.now();
    await renderStill({ composition, serveUrl, frame: f, output: path.join(outDir, `${id}_${f}.jpg`), imageFormat: "jpeg", jpegQuality: 92,
      scale, inputProps, chromiumOptions, timeoutInMilliseconds: 300000, onBrowserLog });
    console.log("still", id, f, ((Date.now() - t1) / 1000).toFixed(1) + "s");
  }
}