// Subtítulos palabra por palabra (§3.5). Cada palabra aparece en el frame en que se pronuncia; la última dicha va
// en blanco 700, las anteriores en gris 500; el bloque desaparece en 3 frames antes de que empiece el siguiente.
// La palabra clave lleva caja de selección ("box") o color de acento ("accent").
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION as CAP, KEYWORD } from "../style";
import { CAPTION_FAMILY, useFontsReady } from "../fonts";
import { Block, CaptionCfg, Keyword, Word, chunkWords, wordFrame } from "./chunker";
import { KeywordBox } from "./KeywordBox";

export const useCaptionBlocks = (words: Word[], keywords: Keyword[] = [], cap: CaptionCfg = CAP) => {
  const { width, fps, durationInFrames } = useVideoConfig();
  const CAPTION = cap;
  const ready = useFontsReady();
  return useMemo(() => (ready ? chunkWords(words, {
    cap, fontFamily: CAPTION_FAMILY, fontSize: CAPTION.fontSizeK * width, maxWidth: CAPTION.maxWidthK * width, fps, width, durationF: durationInFrames,
    boxed: new Set(keywords.filter((k) => k.variant === "box").map((k) => k.index)),
  }) : null), [ready, words, keywords, width, fps, durationInFrames, CAPTION]);
};

const BlockView: React.FC<{ b: Block; words: Word[]; keywords: Map<number, Keyword["variant"]>; cap: CaptionCfg }> = ({ b, words, keywords, cap: CAPTION }) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const fs = CAPTION.fontSizeK * width * b.scale, lh = fs * CAPTION.lineHeight;
  const out = interpolate(f, [b.endF - CAPTION.fadeOutFrames, b.endF], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const said = b.words.filter((i) => f >= wordFrame(words[i], fps));
  const active = said[said.length - 1];
  const top = CAPTION.centerYK * height - lh / 2;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, opacity: out }}>
      {b.lines.map((l, li) => (
        <div key={li} style={{ display: "flex", justifyContent: "center", height: lh, alignItems: "center", gap: b.space }}>
          {l.words.map((i) => {
            const k = b.words.indexOf(i), shown = f >= wordFrame(words[i], fps), isActive = i === active, kw = keywords.get(i);
            const col = isActive && kw === "accent" ? CAPTION.accentColor : isActive ? CAPTION.activeColor : CAPTION.spokenColor;
            return (
              <span key={i} style={{ position: "relative", isolation: "isolate", width: b.widths[k], height: lh, display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", opacity: shown ? 1 : 0 }}>
                {shown && kw === "box" ? (
                  <div style={{ position: "absolute", left: b.pads[k], top: (lh - fs * KEYWORD.boxHeightK) / 2, width: b.widths[k] - 2 * b.pads[k], height: fs * KEYWORD.boxHeightK }}>
                    <KeywordBox width={b.widths[k] - 2 * b.pads[k]} height={fs * KEYWORD.boxHeightK} age={f - wordFrame(words[i], fps)} />
                  </div>
                ) : null}
                <span style={{
                  // F17: la palabra clave entra con un pequeño golpe de escala (1,16 → 1 en 8 frames)
                  // D123 (`punchAll`, historias con tema): toda palabra entra con un golpe corto; la clave, con uno mayor
                  transform: (kw || (CAPTION as { punchAll?: boolean }).punchAll) && isActive ? `scale(${1 + (kw ? 0.16 : 0.08) * Math.max(0, 1 - (f - wordFrame(words[i], fps)) / 8) ** 2})` : undefined,
                  fontFamily: CAPTION_FAMILY, fontSize: fs, lineHeight: 1, whiteSpace: "nowrap", color: col,
                  fontWeight: isActive ? CAPTION.activeWeight : CAPTION.spokenWeight, textShadow: CAPTION.shadow,
                }}>{words[i].w}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** frame en que termina el beat del gancho (última palabra del primer beat): ahí se apaga el titular del gancho */
export const hookEndFrame = (words: Word[], firstBeat: string, fps: number) =>
  Math.round(Math.max(0, ...words.filter((w) => w.beat === firstBeat).map((w) => w.end)) * fps) + 4;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]/gu, "");

/** Titular del gancho (YouTube Shorts: el espectador decide en el primer segundo, muchas veces sin sonido). Un texto corto
 *  (`meta.hookTitle`) visible y completo desde el frame 0 hasta el final del gancho, en la franja de los subtítulos y sobre una
 *  placa oscura; la palabra clave del gancho va en el color de acento. Mientras está, los subtítulos no se pintan (no se repite texto). */
export const HookTitle: React.FC<{ text: string; endF: number; accent?: string; cap?: CaptionCfg }> = ({ text, endF, accent, cap = CAP }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (f >= endF) return null;
  const fs = cap.fontSizeK * width * 1.12, lh = fs * 1.18, key = accent ? norm(accent) : "";
  const out = interpolate(f, [endF - 6, endF], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const settle = 1 + 0.05 * Math.max(0, 1 - f / 8) ** 2;   // entra ya visible, con un asentamiento mínimo
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: cap.centerYK * height - lh * 0.62, display: "flex", justifyContent: "center", opacity: out }}>
        <div style={{ maxWidth: cap.maxWidthK * width, padding: `${fs * 0.22}px ${fs * 0.42}px`, borderRadius: fs * 0.32, background: "rgba(8,9,24,0.62)",
          display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: fs * 0.28, transform: `scale(${settle})` }}>
          {text.split(/\s+/).filter(Boolean).map((w, i) => (
            <span key={i} style={{ fontFamily: CAPTION_FAMILY, fontSize: fs, lineHeight: `${lh}px`, fontWeight: 800, whiteSpace: "nowrap",
              color: key && norm(w) === key ? cap.accentColor : cap.activeColor, textShadow: cap.shadow }}>{w}</span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ words: Word[]; keywords: Keyword[]; cap?: CaptionCfg; fromF?: number }> = ({ words, keywords, cap = CAP, fromF = 0 }) => {
  const f = useCurrentFrame();
  const blocks = useCaptionBlocks(words, keywords, cap);
  const kw = useMemo(() => new Map(keywords.map((k) => [k.index, k.variant])), [keywords]);
  if (!blocks || f < fromF) return null;
  const b = blocks.find((x) => f >= x.startF && f < x.endF);
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{b ? <BlockView b={b} words={words} keywords={kw} cap={cap} /> : null}</AbsoluteFill>;
};
