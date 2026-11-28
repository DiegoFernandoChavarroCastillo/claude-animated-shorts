// Director de cámara automático (D129): ningún plano dura más de `maxShotS` segundos. Cada beat se parte en planos cortos que alternan
// general / medio / primer plano sobre el sujeto (la capa a la que le pasa algo en ese momento o el personaje principal), con un corte seco
// en el inicio de una palabra y un Ken Burns del 3–8 % dentro de cada plano. Los sub-planos escritos a mano se respetan: el director solo
// rellena los tramos que quedan largos. Así el storyboard sigue siendo corto (lo que pasa) y el ritmo de montaje lo pone el código.
import type { BeatT2, ActionT2 } from "./timeline";
import type { Camera2, Layer2 } from "./schema";
import type { Cam } from "./camera";
import { META } from "./assets/registry";

export type Shot = { start: number; camera: Camera2; cut?: boolean };
type Box = { x: number; y: number; w: number; h: number; kind: string };
type Framing = "wide" | "medium" | "close";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const MOVERS = new Set(["slide", "launch", "walk", "run"]);   // una capa que se desplaza no admite primer plano: se sale del cuadro

/** caja de la capa en fracciones del cuadro (x, y = esquina superior izquierda), con la posición y la escala del story */
export const layerBox = (ly: Layer2, aspectWH: number): Box | null => {
  const m = META[ly.asset];
  if (!m || ly.repeat) return null;
  const s = ly.scale ?? (m.kind === "fondo" || m.kind === "ambiente" ? 1.25 : 1), at = ly.at ?? m.anchor;
  const w = s, h = s * m.aspect * aspectWH;
  return { x: at[0] - m.anchor[0] * w, y: at[1] - m.anchor[1] * h, w, h, kind: m.kind };
};

/** encuadre [cx, cy, zoom] de un sujeto; el centro se limita para no enseñar el borde del fondo */
const frame = (b: Box | null, fr: Framing, k: number): Cam => {
  if (!b || fr === "wide") { const side = [0, -1, 1][k % 3]; return [0.5 + side * 0.03, 0.5, 1.02 + 0.04 * (k % 2)]; }
  let cx = b.x + b.w / 2, cy: number, z: number;
  if (b.kind === "personaje") {
    if (fr === "close") { z = clamp(1 / (b.h * 0.62), 1.45, 3.0); cy = b.y + b.h * 0.27; }
    else { z = clamp(1 / (b.h * 1.05), 1.22, 2.2); cy = b.y + b.h * 0.42; }
    cx += (cx < 0.5 ? 0.08 : -0.08) / z;   // regla de tercios: el personaje un poco hacia su lado, con aire delante
  } else {
    const big = Math.max(b.h, b.w);
    z = clamp(1 / (big * (fr === "close" ? 1.25 : 1.7)), 1.18, fr === "close" ? 2.6 : 1.9);
    cy = b.y + b.h * 0.5;
  }
  const m = 0.5 / z - 0.04;   // los fondos van al 120–125 %: hay un 4 % de margen fuera del cuadro
  return [clamp(cx, m, 1 - m), clamp(cy, m, 1 - m), z];
};

/** Ken Burns del plano: acerca o aleja un 4–7 % y se desplaza un poco */
const kenBurns = (c: Cam, k: number): Camera2 => {
  const dir = k % 2 ? -1 : 1, dz = 0.04 + 0.03 * ((k * 7) % 3) / 2, px = (k % 3 - 1) * 0.012;
  const a: Cam = dir > 0 ? c : [c[0], c[1], c[2] * (1 + dz)], b: Cam = dir > 0 ? [c[0] + px, c[1], c[2] * (1 + dz)] : [c[0] + px, c[1], c[2]];
  return { preset: "push_in", from: a, to: b };
};

/** sujeto de un tramo: la capa de la primera acción que empieza en él (si se puede encuadrar), si no el personaje principal o el prop más grande */
const subjectAt = (bt: BeatT2, acts: ActionT2[], s: number, e: number, aspectWH: number): { box: Box | null; moving: boolean } => {
  const layers = bt.beat.scene.layers, byId = (id?: string) => layers.find((l) => (l.id ?? l.asset) === id);
  const moving = new Set(acts.filter((a) => MOVERS.has(a.spec.type)).map((a) => a.spec.target));
  const hit = acts.find((a) => a.start >= s - 8 && a.start < e - 15 && a.spec.target && byId(a.spec.target));
  const pick = (ly?: Layer2) => { const box = ly ? layerBox(ly, aspectWH) : null; return box && (box.kind === "personaje" || box.kind === "prop" || box.kind === "escenario") ? box : null; };
  if (hit) { const ly = byId(hit.spec.target)!; return { box: pick(ly), moving: moving.has(hit.spec.target) }; }
  const subj = (bt.beat.scene as { subject?: string }).subject;
  const main = (subj && byId(subj)) || layers.filter((l) => META[l.asset]?.kind === "personaje" && !l.repeat).sort((a, b) => (b.scale ?? 1) - (a.scale ?? 1))[0]
    || layers.filter((l) => META[l.asset]?.kind === "prop" && !l.repeat).sort((a, b) => (b.scale ?? 1) - (a.scale ?? 1))[0];
  return { box: pick(main), moving: !!main && moving.has(main.id ?? main.asset) };
};

/** reparte los tramos largos de cada beat en planos de ≤ maxShotS con cortes secos en el inicio de una palabra */
export const direct = (beats: BeatT2[], actions: ActionT2[], wordStartsF: number[], fps: number, maxShotS: number, aspectWH: number) => {
  const maxF = Math.round(maxShotS * fps), minF = Math.round(1.6 * fps);
  for (const bt of beats) {
    const acts = actions.filter((a) => a.beat === bt.i);
    const starts = bt.words.map((w) => wordStartsF[w]).filter((f) => f > bt.a + minF && f < bt.b - minF);
    const bounds = [bt.a, ...bt.shots.map((s) => s.start), bt.b];
    const added: Shot[] = [];
    // el plano de entrada también lleva Ken Burns: si la cámara del beat apenas se mueve, se le da un 5 %
    const c0 = bt.beat.scene.camera, f0 = c0.from ?? [0.5, 0.5, 1], t0 = c0.to ?? f0;
    if (Math.abs(t0[2] - f0[2]) < 0.03 && Math.hypot(t0[0] - f0[0], t0[1] - f0[1]) < 0.01) added.push({ start: bt.a, camera: { preset: "push_in", from: f0, to: [t0[0], t0[1], f0[2] * 1.05] }, cut: true });
    let k = bt.i;
    for (let j = 0; j + 1 < bounds.length; j++) {
      const s = bounds[j], e = bounds[j + 1], n = Math.ceil((e - s) / maxF);
      if (n <= 1) continue;
      for (let q = 1; q < n; q++) {
        const ideal = s + ((e - s) * q) / n;
        const near = starts.reduce((best, f) => (Math.abs(f - ideal) < Math.abs(best - ideal) ? f : best), ideal);
        const at = Math.abs(near - ideal) < (e - s) / n / 3 ? near : Math.round(ideal);
        if (at - s < minF || e - at < minF) continue;
        const end = q + 1 < n ? s + ((e - s) * (q + 1)) / n : e;
        const sub = subjectAt(bt, acts, at, end, aspectWH);
        const order: Framing[] = sub.moving ? ["wide", "wide", "medium"] : ["medium", "close", "wide"];
        k += 1;
        added.push({ start: at, camera: kenBurns(frame(sub.box, order[(bt.i + q) % 3], k), k), cut: true });
      }
    }
    bt.shots = [...bt.shots, ...added].sort((x, y) => x.start - y.start);
  }
};
