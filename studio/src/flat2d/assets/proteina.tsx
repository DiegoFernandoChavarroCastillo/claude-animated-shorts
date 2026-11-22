// proteina · prop: ciencia de proteínas: detrás, una doble hélice de ADN que gira; delante, la cadena de una proteína (cinta de color
// con aminoácidos como cuentas) que se pliega en su forma 3D: hélices y láminas apretadas en un ovillo. Lienzo 100 × 100, anclaje en
// el centro. Acciones propias: `fold` la cadena estirada se pliega a toda velocidad (se queda plegada): AlphaFold predice la forma;
// `glow` la proteína plegada brilla con un halo (se queda). opts.plegada true la deja ya plegada.
import React from "react";
import { type AssetFC, clamp01, lerp, opt } from "./common";
import { Halo } from "./shade";

const N = 46;
// forma plegada: ovillo de hélices (determinista)
const folded = (i: number): [number, number] => {
  const a = i * 0.62, r = 14 + 9 * Math.sin(i * 0.23) + 4 * Math.cos(i * 0.71);
  return [50 + r * Math.cos(a) + 3 * Math.sin(i * 1.9), 52 + r * 0.9 * Math.sin(a) + 3 * Math.cos(i * 1.3)];
};
const straight = (i: number): [number, number] => [8 + (i / (N - 1)) * 84, 52 + Math.sin(i * 0.5) * 4];
const ease = (x: number) => x * x * (3 - 2 * x);

export const Proteina: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `pr${seed}`, f = opt(opts, "plegada", false) ? 1 : ease(clamp01(p.fold ?? 0)), gl = clamp01(p.glow ?? 0);
  const pts = [...Array(N)].map((_, i) => {
    const s = straight(i), d = folded(i), k = clamp01(f * 1.3 - (i / N) * 0.3);
    const wob = Math.sin(t * 0.08 + i * 0.4) * (1 - f) * 1.4;
    return [lerp(s[0], d[0], k), lerp(s[1], d[1], k) + wob] as [number, number];
  });
  const path = pts.map(([x, y], i) => (i ? `L${x.toFixed(2)} ${y.toFixed(2)}` : `M${x.toFixed(2)} ${y.toFixed(2)}`)).join(" ");
  const cols = [pal.rim, "#F25AA0", "#FFC23A", "#5FE08A"];
  return (
    <g>
      {/* doble hélice de ADN que gira, al fondo */}
      <g opacity={0.45}>
        {[...Array(22)].map((_, i) => {
          const y = 4 + i * 4.4, ph = t * 0.06 + i * 0.55, x1 = 18 + 8 * Math.sin(ph), x2 = 18 - 8 * Math.sin(ph), front = Math.cos(ph) > 0;
          return <g key={i}><line x1={x1} y1={y} x2={x2} y2={y} stroke={pal.glow} strokeWidth={0.6} opacity={0.6} />
            <circle cx={x1} cy={y} r={front ? 1.4 : 1} fill={front ? pal.rim : pal.wall} /><circle cx={x2} cy={y} r={front ? 1 : 1.4} fill={front ? "#F25AA0" : pal.wall} /></g>;
        })}
      </g>
      <Halo id={`${id}h`} cx={50} cy={52} r={40} color={pal.glow} a={0.18 + 0.4 * gl * f} />
      {/* cinta de la proteína */}
      <path d={path} stroke={pal.ink} strokeWidth={4.6} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.5} />
      {pts.slice(1).map(([x, y], i) => {
        const [x0, y0] = pts[i];
        return <line key={i} x1={x0} y1={y0} x2={x} y2={y} stroke={cols[Math.floor(i / 12) % 4]} strokeWidth={3.2} strokeLinecap="round" />;
      })}
      {pts.filter((_, i) => i % 3 === 0).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.1} fill="#ffffff" opacity={0.75} />)}
    </g>
  );
};
