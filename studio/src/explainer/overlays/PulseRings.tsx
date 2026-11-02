// Anillos concéntricos que se expanden desde un punto 3D proyectado (R1: señal del teléfono). Nunca suben a la
// banda de subtítulos: el radio máximo se recorta a la distancia entre el punto y el borde superior de la zona.
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, H, W, ZONE_TOP, clampToZone, tok, useAnim } from "./common";

export type PulseRingsProps = BaseProps & { count?: number; maxR?: number; period?: number };

export const PulseRings: React.FC<PulseRingsProps> = ({ dur, point = [W / 2, 0.57 * H], count = 3, maxR = 380, period = 45, color: c }) => {
  const { f, enter, exit } = useAnim(dur);
  const [x, y] = clampToZone(point, 20), col = tok(c, PALETTE.ui.cyan);
  const R = Math.min(maxR, y - ZONE_TOP - 8), k = enter(0);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: exit * k }}>
      {[...Array(count)].map((_, i) => {
        const u = ((f + (i * period) / count) % period) / period, r = 30 + (R - 30) * u;
        return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={col} strokeWidth={8 * (1 - u) + 4} opacity={Math.min(1, (1 - u) * 1.6)} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />;
      })}
      <circle cx={x} cy={y} r={14} fill={col} style={{ filter: `drop-shadow(0 0 14px ${col})` }} />
    </svg>
  );
};
