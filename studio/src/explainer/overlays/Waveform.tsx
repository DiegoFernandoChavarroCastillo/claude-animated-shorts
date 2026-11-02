// Onda (pulso o movimiento) que se dibuja de izquierda a derecha, con etiquetas en píldora debajo (R3).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Card, Place, tok, useAnim } from "./common";
import { Pill } from "./Pill";

export type WaveKind = "pulse" | "sine" | "noise";
export type WaveformProps = BaseProps & { kind?: WaveKind; labels?: string[] };

/** trazo de la onda en un ancho w y alto h; `phase` la desplaza para que siga viva */
export const wavePath = (kind: WaveKind, w: number, h: number, phase: number) => {
  const pts: string[] = [];
  for (let x = 0; x <= w; x += 4) {
    const u = x / w + phase;
    let y = 0;
    if (kind === "sine") y = Math.sin(u * Math.PI * 6) * 0.8;
    else if (kind === "noise") y = Math.sin(u * 37) * 0.35 + Math.sin(u * 91) * 0.25 + Math.sin(u * 13) * 0.3;
    else { const c = ((u * 4) % 1 + 1) % 1; y = c > 0.42 && c < 0.46 ? -1 : c > 0.46 && c < 0.5 ? 0.55 : c > 0.62 && c < 0.7 ? -0.18 : 0; }
    pts.push(`${x},${h / 2 + y * h * 0.45}`);
  }
  return "M" + pts.join(" L");
};

export const Waveform: React.FC<WaveformProps> = ({ dur, kind = "pulse", labels = [], color: c, slot = "lower" }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.green), w = 640, h = 200, k = enter(0);
  const len = 4000, drawn = prog(0, 30);
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center" }}>
      <Card style={{ padding: "26px 30px" }}>
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={PALETTE.ui.track} strokeWidth={2} />
        <path d={wavePath(kind, w, h, f * 0.004)} stroke={col} strokeWidth={6} fill="none" strokeLinejoin="round"
          strokeDasharray={len} strokeDashoffset={len * (1 - drawn)} style={{ filter: `drop-shadow(0 0 10px ${col})` }} />
      </svg>
      <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 14 }}>
        {labels.map((l, i) => <Pill key={i} dur={dur} text={l} color={c} delay={6 + i * 3} inline />)}
      </div>
      </Card>
    </Place>
  );
};
