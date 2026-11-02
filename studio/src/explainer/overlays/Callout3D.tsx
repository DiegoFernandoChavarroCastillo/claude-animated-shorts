// Etiqueta anclada a un punto del objeto 3D (proyección mundo -> pantalla): punto, línea guía y tarjeta (R3).
// La tarjeta se coloca al lado con más sitio y nunca sube a la banda de subtítulos.
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Body, H, W, ZONE_TOP, clampToZone, tok, useAnim } from "./common";

export type Callout3DProps = BaseProps & { text: string; side?: "left" | "right" };

export const Callout3D: React.FC<Callout3DProps> = ({ dur, point = [W / 2, 0.5 * H], text, side, color: c }) => {
  const { enter, exit, prog } = useAnim(dur);
  const [x, y] = clampToZone(point, 30), col = tok(c, PALETTE.ui.cyan);
  const dir = side ? (side === "right" ? 1 : -1) : x < W / 2 ? 1 : -1;
  const lx = x + dir * 170, ly = Math.max(ZONE_TOP + 60, y - 120), p = prog(4, 16), k = enter(0), kc = enter(4);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: exit }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={x} cy={y} r={12 * k} fill={col} style={{ filter: `drop-shadow(0 0 10px ${col})` }} />
        <circle cx={x} cy={y} r={26 * k} fill="none" stroke={col} strokeWidth={3} opacity={0.6} />
        <polyline points={`${x},${y} ${x + (lx - x) * p},${y + (ly - y) * p}`} stroke={col} strokeWidth={4} fill="none" />
      </svg>
      <div style={{ position: "absolute", left: lx, top: ly, transform: `translate(${dir > 0 ? 0 : -100}%, -50%) scale(${0.85 + 0.15 * kc})`, opacity: kc,
        padding: "18px 32px", borderRadius: 18, background: PALETTE.ui.card, border: `3px solid ${col}` }}>
        <Body size={44} weight={700}>{text}</Body>
      </div>
    </div>
  );
};
