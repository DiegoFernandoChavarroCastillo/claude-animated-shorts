// Composición de prueba de subtítulos (F1): fondo bg.navy y words.json sintético en es / en.
import React from "react";
import { AbsoluteFill } from "remotion";
import { PALETTE } from "./style";
import { Captions } from "./captions/Caption";
import type { Keyword, Word } from "./captions/chunker";
import es from "./dev/captiontest_es.json";
import en from "./dev/captiontest_en.json";

const DATA = { es, en } as Record<"es" | "en", { words: Word[]; keywords: Keyword[] }>;
export const captionTestFrames = (lang: "es" | "en") => Math.ceil((DATA[lang].words[DATA[lang].words.length - 1].end + 1) * 30);

export const CaptionTest: React.FC<{ lang: "es" | "en" }> = ({ lang }) => (
  <AbsoluteFill style={{ background: PALETTE.bg.navy }}>
    <Captions words={DATA[lang].words} keywords={DATA[lang].keywords} />
  </AbsoluteFill>
);
