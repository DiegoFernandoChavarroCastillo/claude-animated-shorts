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
                  transform: kw && isActive ? `scale(${1 + 0.16 * Math.max(0, 1 - (f - wordFrame(words[i], fps)) / 8) ** 2})` : undefined,
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

export const Captions: React.FC<{ words: Word[]; keywords: Keyword[]; cap?: CaptionCfg }> = ({ words, keywords, cap = CAP }) => {
  const f = useCurrentFrame();
  const blocks = useCaptionBlocks(words, keywords, cap);
  const kw = useMemo(() => new Map(keywords.map((k) => [k.index, k.variant])), [keywords]);
  if (!blocks) return null;
  const b = blocks.find((x) => f >= x.startF && f < x.endF);
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{b ? <BlockView b={b} words={words} keywords={kw} cap={cap} /> : null}</AbsoluteFill>;
};
