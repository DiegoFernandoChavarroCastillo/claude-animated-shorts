// Comprobaciones de la línea de tiempo y la cámara (F18): se ejecuta desde studio/ con node. Imprime un JSON con las medidas.
import { build } from "esbuild"; import path from "node:path"; import os from "node:os"; import fs from "node:fs";
const out = path.join(fs.mkdtempSync(path.join(process.cwd(), ".tmp-tl-")), "t.mjs");
await build({ stdin: { contents: 'export { buildTimeline } from "./src/explainer/timeline"; export { camAt } from "./src/explainer/camera"; export { StorySchema } from "./src/explainer/schema"; export { OVERLAYS } from "./src/explainer/overlays/registry"; export { SLOTS } from "./src/explainer/overlays/common"; export { OVERLAY, CAMERA } from "./src/explainer/style";',
  resolveDir: process.cwd(), loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error", loader: { ".glb": "dataurl" }, jsx: "automatic", external: ["remotion", "react"] });
const M = await import(out);
fs.rmSync(path.dirname(out), { recursive: true, force: true });
const ex = process.env.EX;
const story = M.StorySchema.parse(JSON.parse(fs.readFileSync(path.join(ex, "05_story.json"), "utf8")));
const words = JSON.parse(fs.readFileSync(path.join(ex, "04_words.json"), "utf8"));
const tl = M.buildTimeline(story, words);
const res = { total: tl.total, expectTotal: Math.round((words[words.length - 1].end + story.meta.tailS) * 30), tail: story.meta.tailS, shots: tl.beats.map((b) => b.shots.map((s) => s.start)), slots: M.SLOTS, zoneBottom: M.OVERLAY.zone.bottomK, overlays: Object.keys(M.OVERLAYS) };
// continuidad de la cámara dentro de cada beat (sin contar el cambio de beat): paso máximo de la posición entre fotogramas vecinos
let maxStep = 0, maxShotStep = 0, steps = [];
for (let i = 0; i < tl.beats.length; i++) {
  const bt = tl.beats[i], shotStarts = bt.shots.map((s) => s.start);
  for (let f = bt.a + 20; f < bt.b - 20; f++) {
    const a = M.camAt(tl, i, f), b = M.camAt(tl, i, f + 1);
    const st = Math.hypot(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1], b.pos[2] - a.pos[2]) + Math.abs(b.fov - a.fov) * 0.02;
    steps.push(st); if (st > maxStep) { maxStep = st; res.at = [i, f]; }
    if (shotStarts.some((s) => f >= s - 1 && f <= s + 10)) maxShotStep = Math.max(maxShotStep, st);
  }
}
for (let i = 0; i < tl.beats.length; i++) for (const s of tl.beats[i].shots) {
  const a = M.camAt(tl, i, s.start - 1), b = M.camAt(tl, i, s.start);
  res.seam = Math.max(res.seam ?? 0, Math.hypot(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1], b.pos[2] - a.pos[2]));
}
steps.sort((a, b) => a - b);
res.medianStep = steps[Math.floor(steps.length / 2)]; res.maxStep = maxStep; res.maxShotStep = maxShotStep;
console.log(JSON.stringify(res));
