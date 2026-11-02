// Anillo de escáner alrededor de una imagen circular (R2): arco que gira, línea de barrido y marcas.
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type ScanRingProps = BaseProps & { icon?: string; r?: number };

export const ScanRing: React.FC<ScanRingProps> = ({ dur, icon = "face", r = 200, color: c, slot = "center" }) => {
  const { f, enter, exit } = useAnim(dur);
  const col = tok(c, PALETTE.ui.cyan), k = enter(0), s = 2 * r + 80, cx = s / 2, scan = Math.sin(f * 0.08);
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.85 + 0.15 * k})` }}>
      <svg width={s} height={s}>
        <circle cx={cx} cy={cx} r={r} fill={PALETTE.ui.card} stroke={PALETTE.ui.track} strokeWidth={4} />
        <foreignObject x={cx - r * 0.55} y={cx - r * 0.55} width={r * 1.1} height={r * 1.1}><Icon name={icon} size={r * 1.1} color={PALETTE.light.cream} stroke={1.4} /></foreignObject>
        <g transform={`rotate(${f * 4} ${cx} ${cx})`}>
          <circle cx={cx} cy={cx} r={r + 22} fill="none" stroke={col} strokeWidth={8} strokeDasharray={`${r * 1.4} ${r * 0.6}`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${col})` }} />
        </g>
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1={cx} y1={cx - r - 40} x2={cx} y2={cx - r - 28} stroke={col} strokeWidth={6} transform={`rotate(${a} ${cx} ${cx})`} />
        ))}
        <clipPath id="scanclip"><circle cx={cx} cy={cx} r={r} /></clipPath>
        <line x1={cx - r} x2={cx + r} y1={cx + scan * r * 0.85} y2={cx + scan * r * 0.85} stroke={col} strokeWidth={5} clipPath="url(#scanclip)" opacity={0.8} />
      </svg>
    </Place>
  );
};
