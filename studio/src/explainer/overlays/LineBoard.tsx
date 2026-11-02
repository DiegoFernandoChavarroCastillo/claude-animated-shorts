// Pizarra enmarcada con dibujos de línea que se trazan (SVG con strokeDashoffset) (R2).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Label, Place, tok, useAnim } from "./common";

export type Drawing = "hexagons" | "head" | "eye" | "drop";
export type LineBoardProps = BaseProps & { drawing?: Drawing; title?: string };

const hexes = () => {
  const out: string[] = [], r = 46;
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
    const cx = 120 + col * r * 1.75 + (row % 2) * r * 0.87, cy = 90 + row * r * 1.5;
    out.push("M" + [0, 1, 2, 3, 4, 5, 6].map((i) => `${cx + r * Math.cos((Math.PI / 3) * i + Math.PI / 6)},${cy + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)}`).join(" L"));
  }
  return out;
};
const DRAW: Record<Drawing, string[]> = {
  hexagons: hexes(),
  head: ["M330 300 C 330 210 300 120 220 100 C 140 80 90 150 100 220 C 104 250 90 260 80 280 L 104 290 C 100 320 120 330 150 330 L 160 360",
    "M235 180 C 255 175 270 185 275 200", "M300 250 C 330 240 360 250 380 270"],
  eye: ["M90 220 C 160 120 360 120 430 220 C 360 320 160 320 90 220 Z", "M260 220 m -55 0 a 55 55 0 1 0 110 0 a 55 55 0 1 0 -110 0", "M260 220 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0"],
  drop: ["M260 70 C 260 70 380 200 380 260 C 380 330 325 370 260 370 C 195 370 140 330 140 260 C 140 200 260 70 260 70 Z", "M200 270 C 200 300 220 325 245 330"],
};

export const LineBoard: React.FC<LineBoardProps> = ({ dur, drawing = "hexagons", title, color: c, slot = "lower" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.light.cream), paths = DRAW[drawing];
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.94 + 0.06 * k})` }}>
      <div style={{ width: 620, padding: 20, borderRadius: 16, background: PALETTE.mid.lavender, boxShadow: `0 24px 60px ${PALETTE.ui.shadow}` }}>
        <div style={{ borderRadius: 8, background: PALETTE.bg.navy, padding: "16px 0" }}>
          <svg width={580} height={400} viewBox="0 0 520 420">
            {paths.map((d, i) => {
              const p = prog(4 + i * 3, 30 + i * 3);
              return <path key={i} d={d} stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
            })}
          </svg>
          {title ? <Label size={34} col={col} style={{ textAlign: "center" }}>{title}</Label> : null}
        </div>
      </div>
    </Place>
  );
};
