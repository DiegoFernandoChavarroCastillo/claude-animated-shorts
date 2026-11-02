// Partículas de luz que viajan por una curva entre dos puntos (señal, olor, datos) (R1 / R2 / R3).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, H, Pt, W, clampToZone, tok, useAnim } from "./common";

export type LightTrailsProps = BaseProps & { to?: Pt; count?: number; bend?: number };

export const LightTrails: React.FC<LightTrailsProps> = ({ dur, point = [0.2 * W, 0.78 * H], to = [0.8 * W, 0.45 * H], count = 14, bend = 0.25, color: c }) => {
  const { f, enter, exit } = useAnim(dur);
  const a = clampToZone(point, 10), b = clampToZone(to, 10), col = tok(c, PALETTE.ui.cyan);
  // control de la curva: perpendicular al segmento, recortado a la zona
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const ctl = clampToZone([mx - dy * bend, my + dx * bend], 10);
  const at = (u: number): Pt => [(1 - u) ** 2 * a[0] + 2 * u * (1 - u) * ctl[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * ctl[1] + u * u * b[1]];
  const k = enter(0);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: exit * k }}>
      <path d={`M${a[0]},${a[1]} Q${ctl[0]},${ctl[1]} ${b[0]},${b[1]}`} stroke={col} strokeOpacity={0.25} strokeWidth={4} fill="none" strokeDasharray="4 14" />
      {[...Array(count)].map((_, i) => {
        const u = ((f / 50 + i / count) % 1 + 1) % 1;
        return [0, 0.015, 0.03].map((d, j) => {
          const [x, y] = at(Math.max(0, u - d));
          return <circle key={`${i}_${j}`} cx={x} cy={y} r={(16 - j * 5) * (0.6 + 0.4 * Math.sin(u * Math.PI))} fill={col} opacity={(1 - j * 0.35) * Math.sin(u * Math.PI)}
            style={j === 0 ? { filter: `drop-shadow(0 0 10px ${col})` } : undefined} />;
        });
      })}
    </svg>
  );
};
