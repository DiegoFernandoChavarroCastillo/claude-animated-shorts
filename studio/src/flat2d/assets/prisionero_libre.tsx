// prisionero_libre · el que se libera: de sentado a de pie, con una cadena rota en la muñeca y la mano sobre los ojos deslumbrados.
// `stand_up` lo levanta y sube la mano; `walk` lo hace avanzar (dir: left, right o up, que lo encoge un poco al subir por la rampa).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";

export const PrisioneroLibre: AssetFC = ({ pal, p, params, t }) => {
  const st = p.stand_up ?? 0, hand = clamp01((st - 0.55) / 0.45), wk = p.walk ?? 0, dir = String(params.walk?.dir ?? "up");
  const sy = lerp(0.6, 1, st), bob = wk > 0 && wk < 1 ? Math.sin(t * 0.55) * 1.2 : 0;
  const dx = dir === "left" ? -34 * wk : dir === "right" ? 34 * wk : 0, dy = dir === "up" ? -26 * wk : 0, sc = dir === "up" ? 1 - 0.28 * wk : 1;
  const hx = lerp(61, 54, hand), hy = lerp(52, 13.5, hand), ex = lerp(64, 67, hand), ey = lerp(42, 22, hand);
  return (
    <g transform={`translate(${50 + dx} ${88 + dy + bob}) scale(${sc}) translate(-50 -88)`}>
      <ellipse cx={50} cy={88.5} rx={15} ry={2.6} fill={pal.ink} opacity={0.5} /><path d="M24 87 q3 -3 6 0 M31 88 q3 -3 6 0" stroke={pal.skin} strokeWidth={0.9} fill="none" /><path d="M34 86 l4 -2" stroke={pal.skin} strokeWidth={0.8} />
      <g transform={`translate(50 88) scale(1 ${sy}) translate(-50 -88)`}>
        <rect x={41.5} y={52} width={7} height={34} rx={2.2} fill={pal.rock} /><rect x={51.5} y={52} width={7} height={34} rx={2.2} fill={pal.rock} />
        <ellipse cx={44} cy={87} rx={5.5} ry={2.2} fill={pal.ink} /><ellipse cx={56} cy={87} rx={5.5} ry={2.2} fill={pal.ink} />
        <path d="M37.5 27 Q38 22 50 21.5 Q62 22 62.5 27 L62 55 L38 55 Z" fill={pal.wallLit} /><path d="M62.5 27 L62 55" stroke={pal.rim} strokeWidth={1.4} />
        <path d="M38 55 L62 55 L62 58 L38 58 Z" fill={pal.accent} />
        <path d="M40.5 28 Q36 40 37.5 50" stroke={pal.skin} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d={`M59.5 28 Q${ex} ${ey} ${hx} ${hy}`} stroke={pal.skin} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={2.6} fill={pal.skin} />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={37.2 - i * 0.6} cy={52 + i * 3.4} rx={1.5} ry={1.1} fill="none" stroke={pal.skin} strokeWidth={0.8} />)}
        <circle cx={50} cy={15.5} r={6.6} fill={pal.skin} /><path d="M56.4 12 A6.6 6.6 0 0 1 55 21" stroke={pal.rim} strokeWidth={1.2} fill="none" />
        <path d="M43.5 14 Q46 8 52 9 Q57 9.5 56.6 14.5 Q51 11.5 43.5 14Z" fill={pal.ink} />
        <path d="M43.8 21 Q50 26 56.2 21" stroke={pal.rim} strokeWidth={0.7} fill="none" opacity={0.7} />
      </g>
    </g>
  );
};
