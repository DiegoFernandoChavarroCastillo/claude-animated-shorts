// story.json + words.json -> frames de cada beat, transición, palabra clave y overlay (plan §6). Función pura:
// la usan calculateMetadata (duración total), la capa 3D (cámara por beat) y la capa 2D (subtítulos y overlays).
import type { ActionSpec, Beat, OverlaySpec, Story, WordT } from "./schema";
import type { Keyword } from "./captions/chunker";
import { CAMERA } from "./style";

export type TransType = Beat["transition"];
export type Trans = { type: TransType; at: number; half: number; sameSet: boolean };
export type BeatT = {
  i: number; beat: Beat;
  a: number; b: number;        // frames [a, b)
  words: number[];             // índices globales de sus palabras
  tIn: Trans | null; tOut: Trans | null;
};
export type OverlayT = { beat: number; frame: number; end: number; spec: OverlaySpec; key: string };
/** acción resuelta: empieza en `start` (palabra `at`), sube durante `dur` frames y se mantiene hasta el final del beat */
export type ActionT = { beat: number; start: number; end: number; dur: number; spec: ActionSpec; key: string };
export type Timeline = { fps: number; total: number; beats: BeatT[]; keywords: Keyword[]; overlays: OverlayT[]; actions: ActionT[] };
export const ACTION_DUR_DEFAULT = 30;

const LEAD_F = 2;      // el cambio visual llega 0–3 frames antes de la palabra (como en el original)
const TAIL_S = 1.0;    // cola por defecto tras la última palabra (story.meta.tailS la cambia)
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]/gu, "");

/** semiancho (frames) de la ventana en que se ven los dos beats a la vez */
const halfOf = (t: TransType, sameSet: boolean) =>
  t === "cut" ? 0 : t === "glide" && sameSet ? 0 : t === "zoom_through" ? 6 : CAMERA.crossfadeFrames / 2;

/** resuelve `at` contra las palabras del beat: palabra (1.ª aparición), "#3" o frames desde el inicio del beat */
export const resolveAt = (bt: BeatT, words: WordT[], at: string | number | undefined, fps: number): number => {
  if (at === undefined) return bt.a;
  if (typeof at === "number") return bt.a + at;
  const m = /^#(\d+)$/.exec(at);
  const idx = m ? bt.words[Number(m[1])] : bt.words.find((i) => norm(words[i].w) === norm(at));
  if (idx === undefined) throw new Error(`"at": "${at}" no corresponde a ninguna palabra del beat ${bt.beat.id}`);
  return Math.round(words[idx].start * fps);
};

export const buildTimeline = (story: Story, words: WordT[], fps = 30): Timeline => {
  const f = (s: number) => Math.round(s * fps);
  const beats: BeatT[] = story.beats.map((beat, i) => {
    const ws = words.flatMap((w, k) => (w.beat === beat.id ? [k] : []));
    if (!ws.length) throw new Error(`el beat ${beat.id} no tiene palabras en words.json`);
    return { i, beat, a: 0, b: 0, words: ws, tIn: null, tOut: null };
  });
  beats.forEach((bt, i) => {
    bt.a = i === 0 ? 0 : Math.max(0, f(words[bt.words[0]].start) - LEAD_F);
  });
  const lastWord = words[words.length - 1];
  const total = f(lastWord.end + (story.meta.tailS ?? TAIL_S));
  beats.forEach((bt, i) => { bt.b = i + 1 < beats.length ? beats[i + 1].a : total; });
  for (let i = 0; i + 1 < beats.length; i++) {
    const A = beats[i].beat.scene, B = beats[i + 1].beat.scene;
    const sameSet = A.env === B.env && A.light === B.light && A.hero.asset === B.hero.asset;
    const type = beats[i].beat.transition;
    const t: Trans = { type, at: beats[i + 1].a, half: halfOf(type, sameSet), sameSet };
    beats[i].tOut = t; beats[i + 1].tIn = t;
  }

  const keywords: Keyword[] = [];
  for (const bt of beats) {
    if (!bt.beat.keyword) continue;
    const idx = bt.words.find((i) => norm(words[i].w) === norm(bt.beat.keyword!));
    if (idx === undefined) throw new Error(`keyword "${bt.beat.keyword}" no está en el texto del beat ${bt.beat.id}`);
    keywords.push({ index: idx, variant: story.meta.captionEmphasis });
  }

  const overlays: OverlayT[] = beats.flatMap((bt) => bt.beat.overlays.map((spec, k) => ({
    beat: bt.i, frame: resolveAt(bt, words, spec.at, fps), end: bt.b, spec, key: `${bt.beat.id}_${k}`,
  })));
  const actions: ActionT[] = beats.flatMap((bt) => bt.beat.actions.map((spec, k) => ({
    beat: bt.i, start: resolveAt(bt, words, spec.at, fps), end: bt.b, dur: spec.dur ?? ACTION_DUR_DEFAULT, spec, key: `${bt.beat.id}_a${k}`,
  })));
  return { fps, total, beats, keywords, overlays, actions };
};

/** beats visibles en el frame f: el actual y, dentro de una ventana de transición, el siguiente con su opacidad */
export const layersAt = (tl: Timeline, f: number): { beat: number; alpha: number }[] => {
  for (const bt of tl.beats) {
    const t = bt.tOut;
    if (t && t.half > 0 && f >= t.at - t.half && f < t.at + t.half)
      return [{ beat: bt.i, alpha: 1 }, { beat: bt.i + 1, alpha: (f - (t.at - t.half) + 1) / (2 * t.half + 1) }];
  }
  const cur = tl.beats.find((bt) => f >= bt.a && f < bt.b) ?? tl.beats[tl.beats.length - 1];
  return [{ beat: cur.i, alpha: 1 }];
};
