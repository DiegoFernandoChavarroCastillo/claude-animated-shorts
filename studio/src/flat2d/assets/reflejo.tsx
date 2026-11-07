// reflejo · una persona frente a un cristal y su copia de luz al otro lado: lo que le haces al otro te lo haces a ti. `merge` acerca a las dos hasta fundirse en una sola luz.
import React from "react";
import { type AssetFC, lerp } from "./common";

export const Reflejo: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `rf${seed}`, m = p.merge ?? 0, dx = lerp(0, 17, m), breathe = Math.sin(t * 0.06) * 0.4;
  const person = (fill: string, rim: string, glowy: boolean) => (
    <g>
      <rect x={-5.2} y={50} width={4.4} height={26} rx={1.5} fill={glowy ? fill : pal.rock} /><rect x={0.8} y={50} width={4.4} height={26} rx={1.5} fill={glowy ? fill : pal.rock} />
      <path d="M-8 26 Q-8 21 0 20.5 Q8 21 8 26 L7.4 52 L-7.4 52 Z" fill={fill} /><path d="M8 26 L7.4 52" stroke={rim} strokeWidth={1.1} />
      <path d="M-7 27 Q-10 38 -8.4 47" stroke={glowy ? fill : pal.skin} strokeWidth={2.7} fill="none" strokeLinecap="round" /><path d="M7 27 Q11 36 11 44" stroke={glowy ? fill : pal.skin} strokeWidth={2.7} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={14 + breathe} r={5.8} fill={glowy ? fill : pal.skin} /><path d="M-5.6 12.4 Q-3.5 6.6 1 7.2 Q5.6 7.8 5.8 12 Q0 10 -5.6 12.4Z" fill={glowy ? "#FFF8E8" : pal.ink} />
    </g>
  );
  return (
    <g>
      <defs><linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={pal.wallLit} stopOpacity={0.06} /><stop offset="0.5" stopColor={pal.glow} stopOpacity={0.35} /><stop offset="1" stopColor={pal.wallLit} stopOpacity={0.06} /></linearGradient>
        <radialGradient id={`${id}a`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.7} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={50} cy={93} rx={46} ry={4} fill={pal.glow} opacity={0.12} />
      <ellipse cx={50} cy={50} rx={lerp(30, 46, m)} ry={lerp(40, 52, m)} fill={`url(#${id}a)`} opacity={(0.3 + 0.3 * m) * (0.85 + 0.15 * flick)} />
      <g opacity={1 - m}><rect x={47} y={4} width={6} height={90} fill={`url(#${id}c)`} /><rect x={46} y={4} width={0.9} height={90} fill={pal.rim} opacity={0.8} /><rect x={53} y={4} width={0.9} height={90} fill={pal.rim} opacity={0.8} />
        <path d="M48.4 14 L51.6 10 M48.4 26 L51.6 22" stroke="#FFF8E8" strokeWidth={0.5} opacity={0.6} /></g>
      <ellipse cx={30 + dx} cy={93} rx={11} ry={2} fill={pal.ink} opacity={0.5} />
      <g transform={`translate(${30 + dx} 17)`}>{person(pal.wall, pal.rim, false)}</g>
      <g transform={`translate(${70 - dx} 17) scale(-1 1)`} opacity={0.9}>{person("#FFF3D6", pal.glow, true)}</g>
    </g>
  );
};
