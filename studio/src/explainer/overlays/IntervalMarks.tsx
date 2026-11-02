// Marcas de intervalo sobre una onda de pulso ("0,97 s" entre latidos) (R3).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Body, Card, Place, tok, useAnim } from "./common";
import { wavePath } from "./Waveform";

export type IntervalMarksProps = BaseProps & { intervals: string[] };

export const IntervalMarks: React.FC<IntervalMarksProps> = ({ dur, intervals, color: c, slot = "lower" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.green), w = 640, h = 180, beat = w / 4, k = enter(0);
  // los picos de wavePath("pulse") caen en x = (0,43 + n) / 4 del ancho con fase 0
  const peaks = [0, 1, 2, 3].map((n) => ((0.43 + n) / 4) * w);
  return (
    <Place slot={slot} style={{ opacity: exit * k }}>
      <Card style={{ padding: "26px 30px 56px" }}>
      <svg width={w} height={h + 90} style={{ overflow: "visible" }}>
        <path d={wavePath("pulse", w, h, 0)} stroke={col} strokeWidth={6} fill="none" strokeDasharray={4000} strokeDashoffset={4000 * (1 - prog(0, 24))} />
        {intervals.slice(0, 3).map((_, i) => {
          const p = prog(14 + i * 6, 26 + i * 6), x0 = peaks[i], x1 = x0 + beat * p;
          return (
            <g key={i} opacity={p > 0 ? 1 : 0}>
              <line x1={x0} y1={h + 18} x2={x1} y2={h + 18} stroke={PALETTE.light.white} strokeWidth={3} />
              <line x1={x0} y1={h + 6} x2={x0} y2={h + 30} stroke={PALETTE.light.white} strokeWidth={3} />
              <line x1={x1} y1={h + 6} x2={x1} y2={h + 30} stroke={PALETTE.light.white} strokeWidth={3} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "relative", height: 0 }}>
        {intervals.slice(0, 3).map((t, i) => (
          <Body key={i} size={34} weight={700} style={{ position: "absolute", left: peaks[i] + beat / 2, top: -48, transform: "translateX(-50%)", opacity: prog(22 + i * 6, 30 + i * 6) }}>{t}</Body>
        ))}
      </div>
      </Card>
    </Place>
  );
};
