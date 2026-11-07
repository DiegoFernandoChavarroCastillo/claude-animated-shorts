// story 2D + words.json -> frames de cada beat, transiciones, palabra clave, overlays y acciones. Función pura, como explainer/timeline.ts.
import type { Beat2, Story2, WordT } from "./schema";
import type { Keyword } from "../explainer/captions/chunker";

export type Trans = { type: string; at: number; half: number };
export type BeatT2 = { i: number; beat: Beat2; a: number; b: number; words: number[]; tIn: Trans | null; tOut: Trans | null; shots: { start: number; camera: Beat2["scene"]["camera"] }[] };
export type OverlayT2 = { beat: number; frame: number; end: number; spec: Beat2["overlays"][number]; key: string };
export type ActionT2 = { beat: number; start: number; dur: number; spec: Beat2["actions"][number]; key: string };
export type Timeline2 = { fps: number; total: number; beats: BeatT2[]; keywords: Keyword[]; overlays: OverlayT2[]; actions: ActionT2[] };
export const ACTION_DUR = 30;
const LEAD_F = 2;
const HALF: Record<string, number> = { cut: 0, crossfade: 6, swipe: 9 };
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]/gu, "");

export const resolveAt = (bt: BeatT2, words: WordT[], at: string | number | undefined, fps: number): number => {
  if (at === undefined) return bt.a;
  if (typeof at === "number") return bt.a + at;
  const m = /^#(\d+)$/.exec(at);
  const idx = m ? bt.words[Number(m[1])] : bt.words.find((i) => norm(words[i].w) === norm(at));
  if (idx === undefined) throw new Error(`"at": "${at}" no corresponde a ninguna palabra del beat ${bt.beat.id}`);
  return Math.round(words[idx].start * fps);
};

export const buildTimeline2D = (story: Story2, words: WordT[], fps = 30): Timeline2 => {
  const f = (s: number) => Math.round(s * fps);
  const beats: BeatT2[] = story.beats.map((beat, i) => {
    const ws = words.flatMap((w, k) => (w.beat === beat.id ? [k] : []));
    if (!ws.length) throw new Error(`el beat ${beat.id} no tiene palabras en words.json`);
    return { i, beat, a: 0, b: 0, words: ws, tIn: null, tOut: null, shots: [] };
  });
  beats.forEach((bt, i) => { bt.a = i === 0 ? 0 : Math.max(0, f(words[bt.words[0]].start) - LEAD_F); });
  const total = f(words[words.length - 1].end + story.meta.tailS);
  beats.forEach((bt, i) => { bt.b = i + 1 < beats.length ? beats[i + 1].a : total; });
  for (const bt of beats) bt.shots = bt.beat.shots.map((s) => ({ start: resolveAt(bt, words, s.at, fps), camera: s.camera })).sort((x, y) => x.start - y.start);
  for (let i = 0; i + 1 < beats.length; i++) {
    const type = beats[i].beat.transition;
    const sig = (b: Beat2) => `${b.scene.palette}|${b.scene.light}|${b.scene.layers.map((l) => l.asset).sort().join(",")}`;
    const same = sig(beats[i].beat) === sig(beats[i + 1].beat);   // misma escena: sin fundido (evita ver dos copias desfasadas)
    const t: Trans = { type, at: beats[i + 1].a, half: type === "crossfade" && same ? 0 : HALF[type] ?? 6 };
    beats[i].tOut = t; beats[i + 1].tIn = t;
  }
  const keywords: Keyword[] = [];
  for (const bt of beats) {
    if (!bt.beat.keyword) continue;
    const idx = bt.words.find((i) => norm(words[i].w) === norm(bt.beat.keyword!));
    if (idx === undefined) throw new Error(`keyword "${bt.beat.keyword}" no está en el texto del beat ${bt.beat.id}`);
    keywords.push({ index: idx, variant: story.meta.captionEmphasis });
  }
  const overlays: OverlayT2[] = beats.flatMap((bt) => bt.beat.overlays.map((spec, k) => ({ beat: bt.i, frame: resolveAt(bt, words, spec.at, fps), end: bt.b, spec, key: `${bt.beat.id}_${k}` })));
  const actions: ActionT2[] = beats.flatMap((bt) => bt.beat.actions.map((spec, k) => ({ beat: bt.i, start: resolveAt(bt, words, spec.at, fps), dur: spec.dur ?? ACTION_DUR, spec, key: `${bt.beat.id}_a${k}` })));
  return { fps, total, beats, keywords, overlays, actions };
};

/** beats visibles en el frame f: el actual y, dentro de una ventana de transición, el siguiente con su opacidad (u = progreso 0..1) */
export const layersAt = (tl: Timeline2, f: number): { beat: number; alpha: number; swipe: number | null }[] => {
  for (const bt of tl.beats) {
    const t = bt.tOut;
    if (t && t.half > 0 && f >= t.at - t.half && f < t.at + t.half) {
      const u = (f - (t.at - t.half) + 1) / (2 * t.half + 1);
      return [{ beat: bt.i, alpha: 1, swipe: null }, { beat: bt.i + 1, alpha: t.type === "swipe" ? Math.min(1, u * 2) : u, swipe: t.type === "swipe" ? u : null }];
    }
  }
  const cur = tl.beats.find((bt) => f >= bt.a && f < bt.b) ?? tl.beats[tl.beats.length - 1];
  return [{ beat: cur.i, alpha: 1, swipe: null }];
};
