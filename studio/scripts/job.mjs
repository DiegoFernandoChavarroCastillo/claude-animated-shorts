// Trabajos de Remotion para el orquestador (pipeline/make_short.py), con UN bundle reutilizado (plan §10):
//   node scripts/job.mjs bundle <bundleDir>                         empaqueta solo si el código cambió (sello por hash)
//   node scripts/job.mjs stills <bundleDir> <props.json> <outDir> <f1,f2,...> [--scale 0.5]
//   node scripts/job.mjs render <bundleDir> <props.json> <out.mp4> [--scale 1] [--concurrency 1]
// El render escribe primero <out>.part.mp4 y lo renombra al terminar: un render interrumpido no deja un artefacto
// que el orquestador tome por bueno. Temporales en REMOTION_TMP (por defecto C:/remotion-tmp).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const tmp = process.env.REMOTION_TMP || "C:/remotion-tmp";
fs.mkdirSync(tmp, { recursive: true });
process.env.TEMP = process.env.TMP = tmp;

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : def; };
const scale = Number(opt("--scale", "1"));
const concurrency = Number(opt("--concurrency", "1"));
const [cmd, bundleDir, ...rest] = args;
const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chromiumOptions = { gl: process.env.STILLS_GL || "angle" };

/** hash de todo lo que entra en el bundle: src/, public/, package.json y los ejemplos que importa Root.tsx */
const sourceHash = () => {
  const h = crypto.createHash("sha1");
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else { const s = fs.statSync(p); h.update(`${p}:${s.size}:${s.mtimeMs}\n`); }
    }
  };
  for (const d of ["src", "public"]) walk(path.join(studio, d));
  walk(path.resolve(studio, "../templates"));
  h.update(fs.readFileSync(path.join(studio, "package.json")));
  return h.digest("hex");
};

const ensureBundle = async () => {
  const stamp = path.join(bundleDir, ".stamp"), want = sourceHash();
  if (fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === want) { console.log("bundle: al día, se reutiliza"); return bundleDir; }
  const { bundle } = await import("@remotion/bundler");
  const t0 = Date.now();
  fs.rmSync(bundleDir, { recursive: true, force: true });
  await bundle({ entryPoint: path.join(studio, "src/index.ts"), outDir: bundleDir, publicDir: path.join(studio, "public") });
  fs.writeFileSync(stamp, want);
  console.log(`bundle: nuevo en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return bundleDir;
};

const load = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const onBrowserLog = (l) => { if (l.type === "error") console.log("[navegador]", l.text.slice(0, 300)); };

if (cmd === "bundle") {
  await ensureBundle();
} else if (cmd === "stills") {
  const [propsFile, outDir, frames] = rest;
  const serveUrl = await ensureBundle(), inputProps = load(propsFile);
  const { renderStill, selectComposition } = await import("@remotion/renderer");
  const composition = await selectComposition({ serveUrl, id: "Explainer", chromiumOptions, inputProps });
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of frames.split(",").map(Number)) {
    const t1 = Date.now();
    await renderStill({ composition, serveUrl, frame: f, output: path.join(outDir, `still_${String(f).padStart(5, "0")}.jpg`), imageFormat: "jpeg",
      jpegQuality: 92, scale, inputProps, chromiumOptions, timeoutInMilliseconds: 300000, onBrowserLog });
    console.log(`still ${f} ${((Date.now() - t1) / 1000).toFixed(1)} s`);
  }
} else if (cmd === "render") {
  const [propsFile, out] = rest;
  const serveUrl = await ensureBundle(), inputProps = load(propsFile);
  const { renderMedia, selectComposition } = await import("@remotion/renderer");
  const composition = await selectComposition({ serveUrl, id: "Explainer", chromiumOptions, inputProps });
  const part = out.replace(/\.mp4$/, ".part.mp4");
  let last = -1;
  const t0 = Date.now();
  await renderMedia({ composition, serveUrl, codec: "h264", crf: 18, outputLocation: part, inputProps, scale, concurrency, chromiumOptions,
    timeoutInMilliseconds: 300000, onBrowserLog,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`render ${Math.round(progress * 100)} % (${((Date.now() - t0) / 60000).toFixed(1)} min)`); } } });
  fs.renameSync(part, out);
  console.log(`render: ${composition.durationInFrames} frames en ${((Date.now() - t0) / 60000).toFixed(1)} min -> ${out}`);
} else {
  console.error("uso: job.mjs bundle|stills|render <bundleDir> ...");
  process.exit(2);
}
