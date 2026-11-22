// frontera · escenario: la «frontera irregular» de la IA: una línea de luz dentada sobre una rejilla, con picos altos en lo que la IA
// ya hace mejor que nadie (medalla, pantalla, robot, proteína: iconos en las cimas) y un pozo hondo en algo trivial (un reloj de agujas),
// por debajo de la línea discontinua del nivel humano. Lienzo 100 × 110, anclaje en el centro. Acciones propias: `draw` la línea se
// traza de izquierda a derecha y los iconos se encienden (se queda); `advance` toda la frontera sube y empuja hacia arriba, el pozo
// incluido (se queda): se mueve más rápido; `crumble` la línea se deshace en partículas que suben (se queda deshecha).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { Grad, Halo, url } from "./shade";

// x, y de los vértices (y menor = más alto) y el icono de cada cima
const V: [number, number, string][] = [[4, 78, ""], [14, 30, "medalla"], [22, 58, ""], [32, 24, "pantalla"], [40, 52, ""], [50, 96, "reloj"],
  [58, 50, ""], [68, 26, "robot"], [76, 54, ""], [86, 20, "proteina"], [96, 60, ""]];
const HUMAN = 56;

export const Frontera: AssetFC = ({ pal, t, seed, p }) => {
  const id = `fz${seed}`, d = p.draw === undefined ? 1 : clamp01(p.draw), adv = clamp01(p.advance ?? 0), cr = clamp01(p.crumble ?? 0);
  const up = adv * 14, pts = V.map(([x, y]) => [x, y - up + Math.sin(t * 0.05 + x) * 0.6] as [number, number]);
  const xEnd = lerp(4, 96, d);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const icon = (k: string, x: number, y: number, on: number) => {
    const c = k === "reloj" ? "#FF5A5A" : pal.glow;
    return (
      <g transform={`translate(${x} ${y - (k === "reloj" ? -7 : 7)}) scale(${0.6 + 0.4 * on})`} opacity={on}>
        <circle r={5.2} fill={pal.ink} stroke={c} strokeWidth={0.8} />
        {k === "medalla" && <g><path d="M-2 -5 L0 -1 L2 -5" stroke="#3A6AD8" strokeWidth={1.2} fill="none" /><circle cy={1} r={2.6} fill="#F2BE3C" /></g>}
        {k === "pantalla" && <g><rect x={-3.4} y={-2.6} width={6.8} height={4.6} rx={0.6} fill={pal.rim} /><rect x={-1} y={2} width={2} height={1.4} fill={pal.rim} /></g>}
        {k === "robot" && <g><rect x={-2.6} y={-2.6} width={5.2} height={4.4} rx={1.4} fill="#E8ECF2" /><rect x={-2} y={-1.6} width={4} height={1.6} rx={0.6} fill="#0C1018" /><circle cx={-0.9} cy={-0.8} r={0.45} fill="#5FF0FF" /><circle cx={0.9} cy={-0.8} r={0.45} fill="#5FF0FF" /></g>}
        {k === "proteina" && <path d="M-3 1 Q-2 -3 0 0 Q2 3 3 -1" stroke="#F25AA0" strokeWidth={1.2} fill="none" />}
        {k === "reloj" && <g><circle r={3.2} fill="#ffffff" stroke="#D8262C" strokeWidth={0.8} /><path d="M0 0 L0 -2.2 M0 0 L1.6 0.6" stroke={pal.ink} strokeWidth={0.6} /></g>}
      </g>
    );
  };
  return (
    <g>
      <Grad id={`${id}a`} a={pal.rim + "55"} b={pal.rim + "00"} />
      {/* rejilla */}
      {[...Array(11)].map((_, i) => <line key={`v${i}`} x1={i * 10} y1={6} x2={i * 10} y2={106} stroke={pal.rim} strokeWidth={0.2} opacity={0.25} />)}
      {[...Array(11)].map((_, i) => <line key={`h${i}`} x1={0} y1={6 + i * 10} x2={100} y2={6 + i * 10} stroke={pal.rim} strokeWidth={0.2} opacity={0.25} />)}
      {/* nivel humano */}
      <line x1={2} y1={HUMAN} x2={98} y2={HUMAN} stroke="#FFFFFF" strokeWidth={0.7} strokeDasharray="2 1.6" opacity={0.75} />
      <text x={3} y={HUMAN - 1.6} fontFamily="Arial, sans-serif" fontWeight={700} fontSize={3} fill="#FFFFFF" opacity={0.8}>NIVEL HUMANO</text>
      <defs><clipPath id={`${id}c`}><rect x={0} y={0} width={xEnd} height={110} /></clipPath></defs>
      <g clipPath={`url(#${id}c)`} opacity={1 - cr}>
        <path d={`${line} L96 106 L4 106 Z`} fill={url(`${id}a`)} />
        <Halo id={`${id}h`} cx={50} cy={50} r={50} color={pal.rim} a={0.15} />
        <path d={line} stroke={pal.rim} strokeWidth={3.4} fill="none" strokeLinejoin="miter" opacity={0.35} />
        <path d={line} stroke={pal.glow} strokeWidth={1.3} fill="none" strokeLinejoin="miter" />
      </g>
      {pts.map(([x, y], i) => V[i][2] ? <g key={i} opacity={1 - cr}>{icon(V[i][2], x, y, clamp01((xEnd - x) / 6))}</g> : null)}
      {cr > 0 && [...Array(60)].map((_, i) => {
        const k = i / 59, seg = Math.min(V.length - 2, Math.floor(k * (V.length - 1))), f = k * (V.length - 1) - seg;
        const x = lerp(pts[seg][0], pts[seg + 1][0], f), y = lerp(pts[seg][1], pts[seg + 1][1], f);
        return <circle key={i} cx={x + (hash(i) - 0.5) * 30 * cr} cy={y - cr * (20 + hash(i * 3) * 50)} r={0.5 + hash(i * 7) * 0.9} fill={pal.glow} opacity={1 - cr * 0.6} />;
      })}
    </g>
  );
};
