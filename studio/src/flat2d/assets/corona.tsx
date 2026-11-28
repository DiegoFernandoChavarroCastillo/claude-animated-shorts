// corona · prop: una corona real de oro de la antigüedad: aro con piedras rojas y azules y cinco puntas rematadas en perlas, con un halo dorado.
// Lienzo 100 × 70, anclaje en el centro. Acción propia: `float` la corona se eleva despacio, flota oscilando y brilla más (se queda arriba):
// el poder sin dueño, el trono vacío, tomar el reino.
import React from "react";
import { type AssetFC, clamp01, idle } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const Corona: AssetFC = ({ pal, t, seed, p }) => {
  const id = `co${seed}`, f = clamp01(p.float ?? 0), { bob } = idle(t, seed), gold = lerpHex("#E8B640", pal.glow, 0.15);
  const y = -f * 22 + bob * 1.2 * (0.4 + f);
  return (
    <g transform={`translate(0 ${y}) rotate(${Math.sin(t * 0.04) * 3 * f} 50 40)`}>
      <Vol id={`${id}g`} c={gold} pal={pal} k={1.1} /><Grad id={`${id}b`} a={lite(gold, pal, 0.3)} b={dark(gold, pal, 0.45)} />
      <Halo id={`${id}h`} cx={50} cy={38} r={40 + 12 * f} color={pal.glow} a={0.3 + 0.4 * f} />
      <path d="M14 56 L10 18 L28 34 L38 10 L50 30 L62 10 L72 34 L90 18 L86 56 Z" fill={url(`${id}g`)} stroke={dark(gold, pal, 0.4)} strokeWidth={0.8} />
      {[[10, 18], [38, 10], [62, 10], [90, 18], [50, 30]].map(([x, yy]) => <circle key={x} cx={x} cy={yy - 2} r={2.8} fill="#F6F0E0" stroke={dark(gold, pal, 0.3)} strokeWidth={0.4} />)}
      <rect x={12} y={50} width={76} height={10} rx={2} fill={url(`${id}b`)} />
      {[22, 36, 50, 64, 78].map((x, i) => <g key={x}><ellipse cx={x} cy={55} rx={3} ry={2.4} fill={i % 2 ? "#2A5CC8" : "#C8202E"} /><circle cx={x - 0.8} cy={54.2} r={0.7} fill="#fff" opacity={0.7} /></g>)}
      <path d="M16 46 L84 46" stroke={lite(gold, pal, 0.5)} strokeWidth={0.6} opacity={0.7} />
    </g>
  );
};
