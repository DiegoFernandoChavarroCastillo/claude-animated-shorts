// Parte las palabras alineadas en bloques de subtítulo (§3.5): 3–6 palabras, corte en la puntuación, en las
// pausas largas y en el cambio de beat, y nunca más de 2 líneas dentro del 84 % del ancho. Las líneas se
// calculan una vez por bloque con el peso activo (700), así nada se recoloca cuando cambia la palabra activa.
import { measureText } from "@remotion/layout-utils";
import { CAPTION, KEYWORD, px } from "../style";

export type Word = { w: string; start: number; end: number; beat: string };
export type Emphasis = "box" | "accent";
export type Keyword = { index: number; variant: Emphasis };

export type Line = { words: number[]; width: number };
export type Block = {
  words: number[];   // índices en el array global de palabras
  lines: Line[];
  widths: number[];  // ancho de cada palabra a peso 700 (paralelo a words), en px del frame
  pads: number[];    // margen a cada lado de la palabra (la caja de selección necesita sitio)
  space: number;     // ancho de un espacio
  scale: number;     // < 1 solo si una palabra sola no cabe en el ancho máximo
  startF: number;    // frame en que aparece la primera palabra
  endF: number;      // frame en que el bloque ya no se ve
};

const SENTENCE_END = /[.?!…]["»”)]*$/;
const SOFT_END = /[,;:]["»”)]*$/;

export type ChunkOpts = { fontFamily: string; fontSize: number; maxWidth: number; fps: number; width: number; durationF?: number; boxed?: Set<number> };

const lay = (widths: number[], space: number, maxWidth: number): Line[] => {
  const lines: Line[] = [];
  let cur: number[] = [], w = 0;
  widths.forEach((ww, i) => {
    const next = cur.length ? w + space + ww : ww;
    if (cur.length && next > maxWidth) { lines.push({ words: cur, width: w }); cur = [i]; w = ww; }
    else { cur.push(i); w = next; }
  });
  if (cur.length) lines.push({ words: cur, width: w });
  return lines;
};

export const chunkWords = (words: Word[], o: ChunkOpts): Block[] => {
  const measure = (t: string) => measureText({ text: t, fontFamily: o.fontFamily, fontSize: o.fontSize, fontWeight: String(CAPTION.activeWeight), validateFontIsLoaded: true }).width;
  const space = measure("a a") - measure("aa");
  const pad = px(KEYWORD.padX + KEYWORD.handleR / 2, o.width);
  const padOf = (i: number) => (o.boxed?.has(i) ? pad : 0);
  // measureText se queda ~1 % corto frente al texto renderizado: margen del 2 % para no pasar del 84 %
  const wid = words.map((w, i) => measure(w.w) * 1.02 + 2 * padOf(i));
  const groups: number[][] = [];
  let cur: number[] = [];
  const fits = (idx: number[]) => lay(idx.map((i) => wid[i]), space, o.maxWidth).length <= CAPTION.maxLines;
  words.forEach((w, i) => {
    if (cur.length && (w.beat !== words[cur[0]].beat || !fits([...cur, i]))) { groups.push(cur); cur = []; }
    cur.push(i);
    const next = words[i + 1];
    const gap = next ? next.start - w.end : Infinity;
    const hard = SENTENCE_END.test(w.w) || !next || next.beat !== w.beat;
    const soft = cur.length >= CAPTION.minWords && (SOFT_END.test(w.w) || gap > CAPTION.breakPauseS);
    if (hard || soft || cur.length >= CAPTION.maxWords) { groups.push(cur); cur = []; }
  });
  if (cur.length) groups.push(cur);

  const f = (s: number) => Math.round(s * o.fps);
  return groups.map((g, k) => {
    let widths = g.map((i) => wid[i]);
    const longest = Math.max(...widths);
    const scale = longest > o.maxWidth ? o.maxWidth / longest : 1;
    widths = widths.map((x) => x * scale);
    const pads = g.map((i) => padOf(i) * scale);
    const lines = lay(widths, space * scale, o.maxWidth).map((l) => ({ ...l, words: l.words.map((j) => g[j]) }));
    const last = words[g[g.length - 1]];
    const nextStart = groups[k + 1] ? f(words[groups[k + 1][0]].start) : Infinity;
    const endF = Math.min(nextStart, f(last.end + CAPTION.holdAfterS), o.durationF ?? Infinity);
    return { words: g, lines, widths, pads, space: space * scale, scale, startF: f(words[g[0]].start), endF };
  });
};

/** frame en que aparece cada palabra (cuando se pronuncia, no antes) */
export const wordFrame = (w: Word, fps: number) => Math.round(w.start * fps);
