// idus_marzo · Los idus de marzo en la curia de Pompeyo: César con toga rodeado por senadores conspiradores a contraluz que alzan los puñales; a la derecha, la estatua de Pompeyo.
// `stab` los conspiradores apuñalan una y otra vez con tajos carmesí (se queda en el último golpe); `fall` César se cubre la cara con la toga y cae al pie de la estatua de Pompeyo (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Toga } from "./romanos";
import { Cesar, Pugio } from "./ptolomeos";

export const IdusMarzo: AssetFC = ({ pal, p, t }) => {
  const st = p.stab ?? 0, fa = p.fall ?? 0, sil = lerpHex(pal.ink, pal.wall, 0.55), marble = lerpHex(pal.wallLit, pal.wall, 0.4);
  const hits = st * 6, phase = hits % 1, cur = Math.floor(hits);
  const cons = [{ x: 24, s: 1.05, dir: 1 }, { x: 36, s: 0.95, dir: 1 }, { x: 64, s: 1.0, dir: -1 }, { x: 14, s: 1.1, dir: 1 }];
  const cX = lerp(48, 70, fa), rot = lerp(0, 72, fa * fa);
  return (
    <g>
      <ellipse cx={46} cy={40} rx={44} ry={36} fill={pal.accent} opacity={0.22} />
      <ellipse cx={50} cy={72} rx={46} ry={3} fill={pal.ink} opacity={0.5} />
      {/* estatua de Pompeyo */}
      <g>
        <rect x={74} y={52} width={20} height={20} fill={lerpHex(marble, pal.ink, 0.25)} /><rect x={72} y={50} width={24} height={3} fill={marble} />
        <g transform="translate(84 50) scale(0.78)">
          <Toga cx={0} top={-41} feet={0} w={15} pal={{ ...pal, wallLit: marble, skin: marble, accent: lerpHex(marble, pal.ink, 0.25) }} band={false} />
          <path d="M7 -40 Q14 -44 15 -54" stroke={marble} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <rect x={-1.6} y={-46} width={3.2} height={5} fill={marble} />
          <Cabeza cx={0} cy={-51} r={5.4} pal={{ ...pal, skin: marble, ink: lerpHex(marble, pal.ink, 0.6) }} turn={-0.5} curls hair={lerpHex(marble, pal.ink, 0.2)} />
        </g>
        <path d="M94 52 L94 72" stroke={pal.rim} strokeWidth={0.6} opacity={0.6} />
      </g>
      {/* César */}
      <g transform={`translate(${cX} 72) rotate(${rot}) translate(${-cX} -72)`}>
        <Cesar x={cX} y={72} s={1.06} pal={pal} t={t} turn={lerp(-0.2, 0.4, Math.min(1, st * 3))} cover={clamp01(fa * 2.5)} mouth={st > 0 && fa < 0.2 ? 0.5 : 0} />
      </g>
      {fa > 0.3 && <path d={`M${cX - 6} 72 Q${cX + 4} ${73.5} ${cX + 18 * fa} 72.4`} stroke={pal.accent} strokeWidth={2.2 * clamp01((fa - 0.3) * 2)} fill="none" opacity={0.85} />}
      {/* conspiradores */}
      {cons.map((c, k) => {
        const mine = (cur + k) % 4 === 0, a = mine ? Math.sin(phase * Math.PI) : 0.15, retreat = fa * 6 * c.dir;
        const hx = c.x + c.dir * lerp(7, 15, a) - retreat, hy = lerp(14, 38, a), base = c.x - retreat;
        return <g key={k} opacity={1 - 0.3 * fa}>
          <g transform={`translate(${base} 72) scale(${c.s})`}>
            <path d="M-3 -18 L-4 0 M3 -18 L4 0" stroke={sil} strokeWidth={2.8} strokeLinecap="round" />
            <path d="M-8 -41 Q0 -43 8 -41 L9 -14 L-9 -14Z" fill={sil} /><circle cx={0} cy={-49} r={5.6} fill={sil} />
            <path d={`M${c.dir * 5.4} -52 A5.6 5.6 0 0 ${c.dir > 0 ? 1 : 0} ${c.dir * 4.6} -45`} stroke={pal.rim} strokeWidth={0.9} fill="none" />
            <path d={`M${c.dir * 8} -41 L${c.dir * 9} -14`} stroke={pal.rim} strokeWidth={0.8} opacity={0.8} />
            <path d="M-8 -41 Q-12 -26 -9 -14 L-6 -14 Q-8 -28 -5 -40Z" fill={lerpHex(sil, pal.wallLit, 0.12)} />
          </g>
          <path d={`M${base + c.dir * 6 * c.s} ${72 - 39 * c.s} Q${base + c.dir * 10} ${lerp(26, 34, a)} ${hx} ${hy}`} stroke={sil} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {st > 0 && <Pugio x={hx} y={hy} s={0.9} pal={pal} rot={c.dir * lerp(25, -15, a)} blood={clamp01(st * 2)} />}
          {mine && st > 0 && st < 1 && phase > 0.4 && phase < 0.8 && <path d={`M${hx - 5} ${hy + 4} Q${hx} ${hy + 1} ${hx + 5} ${hy + 6}`} stroke={pal.accent} strokeWidth={1.6} fill="none" opacity={0.9} />}
        </g>;
      })}
    </g>
  );
};
