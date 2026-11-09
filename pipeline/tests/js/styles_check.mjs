// Comprobaciones de los estilos (F20): cámara 2D de los planos y proyección de sus anclas, con el código TypeScript real.
import { build } from "esbuild"; import path from "node:path"; import fs from "node:fs";
const out = path.join(fs.mkdtempSync(path.join(process.cwd(), ".tmp-st-")), "t.mjs");
await build({ stdin: { contents: 'export { buildTimeline } from "./src/explainer/timeline"; export { cam2At } from "./src/explainer/camera"; export { anchorPoint } from "./src/explainer/overlays/project"; export { StorySchema } from "./src/explainer/schema"; export { catalogErrors } from "./src/explainer/catalog"; export { HEROES } from "./src/explainer/heroes";',
  resolveDir: process.cwd(), loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error", loader: { ".glb": "dataurl" }, jsx: "automatic", external: ["remotion", "react"] });
const M = await import(out);
fs.rmSync(path.dirname(out), { recursive: true, force: true });
const beat = (id, cam, asset = "pizarra_hipotesis") => ({ id, role: "tension", text: "una dos tres cuatro", scene: { env: "plano", light: "tech", hero: { kind: "plano", asset }, camera: cam }, overlays: [], actions: [] });
const story = M.StorySchema.parse({ meta: { id: "t", lang: "es", title: "t", voice: { engine: "x", voice: "x" } }, beats: [
  beat("b1", { preset: "push_in", rate: 0.4 }), beat("b2", { preset: "dolly_side", dir: "right" }), beat("b3", { preset: "pull_out" }), beat("b4", { preset: "follow_anchor", anchor: "filtro" }) ] });
const words = []; story.beats.forEach((b, i) => b.text.split(" ").forEach((w, k) => words.push({ w, start: i * 4 + k, end: i * 4 + k + 0.8, beat: b.id })));
const tl = M.buildTimeline(story, words);
const at = (i, k) => M.cam2At(tl, i, Math.round(tl.beats[i].a + (tl.beats[i].b - tl.beats[i].a) * k));
const res = {
  pushZoom: [at(0, 0.1).zoom, at(0, 0.9).zoom], pullZoom: [at(2, 0.1).zoom, at(2, 0.9).zoom], dollyX: [at(1, 0.1).x, at(1, 0.9).x],
  follow: [at(3, 0.1).x, at(3, 0.95).x], mid: at(0, 0.5),
  anchors: Object.entries(M.HEROES).filter(([, h]) => h.kind === "plano").flatMap(([id, h]) => Object.keys(h.anchors).map((a) => {
    const t2 = M.buildTimeline(M.StorySchema.parse({ ...story, beats: [beat("b1", { preset: "push_in" }, id)] }), words.filter((w) => w.beat === "b1"));
    return [id, a, M.anchorPoint(t2, 0, a, 30)];
  })),
  flatHaveComp: Object.values(M.HEROES).filter((h) => h.kind === "plano").every((h) => typeof h.flat === "function"),
  catalog: M.catalogErrors(),
};
console.log(JSON.stringify(res));
