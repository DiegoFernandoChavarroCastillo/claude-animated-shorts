// Medidor semicircular verde / azul / rojo con aguja y etiqueta (R3: relajado / estrés).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Label, Place, useAnim } from "./common";

export type GaugeProps = BaseProps & { value: number; label: string; low?: string; high?: string };

const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [200 + r * Math.cos(Math.PI - a * Math.PI), 200 - r * Math.sin(Math.PI - a * Math.PI)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
};

/** value en 0..1 (0 = izquierda, 1 = derecha) */
export const Gauge: React.FC<GaugeProps> = ({ dur, value, label, low, high, slot = "lower" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), v = Math.max(0, Math.min(1, value)) * prog(4, 34);
  const ang = Math.PI - v * Math.PI;
  const segs: [number, number, string][] = [[0, 0.34, PALETTE.ui.green], [0.36, 0.64, PALETTE.ui.selection], [0.66, 1, PALETTE.ui.red]];
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center" }}>
      <svg width={420} height={240} viewBox="0 0 400 230" style={{ overflow: "visible" }}>
        <path d={arc(160, 0, 1)} stroke={PALETTE.ui.track} strokeWidth={34} fill="none" strokeLinecap="round" />
        {segs.map(([a, b, c], i) => <path key={i} d={arc(160, a, a + (b - a) * prog(i * 3, 18 + i * 3))} stroke={c} strokeWidth={26} fill="none" strokeLinecap="round" />)}
        <line x1={200} y1={200} x2={200 + 130 * Math.cos(ang)} y2={200 - 130 * Math.sin(ang)} stroke={PALETTE.light.white} strokeWidth={8} strokeLinecap="round" />
        <circle cx={200} cy={200} r={16} fill={PALETTE.light.white} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", width: 420, marginTop: -6 }}>
        <Label size={22}>{low ?? ""}</Label><Label size={22}>{high ?? ""}</Label>
      </div>
      <Label size={34} col={PALETTE.light.white} style={{ marginTop: 10 }}>{label}</Label>
    </Place>
  );
};
