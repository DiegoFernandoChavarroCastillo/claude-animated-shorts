// dialogo · un hombre de pie frente a una figura de luz más alta, en el vacío: la conversación tras la muerte. `speak` emite ondas de la figura de luz hacia el hombre.
import React from "react";
import { type AssetFC, clamp01 } from "./common";

export const Dialogo: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `di${seed}`, sp = p.speak ?? 0, breathe = Math.sin(t * 0.06) * 0.5;
  return (
    <g>
      <defs><radialGradient id={`${id}a`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.8} /><stop offset="0.5" stopColor={pal.glow} stopOpacity={0.25} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={50} cy={93} rx={46} ry={4.4} fill={pal.glow} opacity={0.14} /><ellipse cx={26} cy={93} rx={12} ry={2.2} fill={pal.ink} opacity={0.55} />
      {/* figura de luz */}
      <ellipse cx={72} cy={46} rx={26} ry={44} fill={`url(#${id}a)`} opacity={0.7 + 0.15 * flick} />
      <path d={`M72 28 C64 30 62 40 62 54 L60 90 L84 90 L82 54 C82 40 80 30 72 28 Z`} fill="#FFF3D6" /><circle cx={72} cy={21 + breathe} r={7} fill="#FFF8E8" />
      <path d="M62 42 Q54 52 52 60" stroke="#FFF3D6" strokeWidth={3} fill="none" strokeLinecap="round" /><circle cx={51.5} cy={61} r={2} fill="#FFF8E8" />
      <path d="M81 42 Q86 54 85 64" stroke="#FFF3D6" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* hombre */}
      <g transform={`translate(0 ${breathe * 0.4})`}>
        <rect x={20} y={64} width={4.6} height={26} rx={1.6} fill={pal.rock} /><rect x={27} y={64} width={4.6} height={26} rx={1.6} fill={pal.rock} />
        <ellipse cx={22.5} cy={90.6} rx={4} ry={1.6} fill={pal.ink} /><ellipse cx={29.5} cy={90.6} rx={4} ry={1.6} fill={pal.ink} />
        <path d="M17 38 Q17 33 26 32.5 Q35 33 35 38 L34.5 66 L17.5 66 Z" fill={pal.wall} /><path d="M35 38 L34.5 66" stroke={pal.rim} strokeWidth={1.1} /><path d="M26 33 L26 66" stroke={pal.ink} strokeWidth={0.6} opacity={0.6} />
        <path d="M18.5 38 Q15 50 17 60" stroke={pal.skin} strokeWidth={2.8} fill="none" strokeLinecap="round" /><path d="M33.5 38 Q39 46 40 54" stroke={pal.skin} strokeWidth={2.8} fill="none" strokeLinecap="round" />
        <circle cx={26} cy={26} r={5.6} fill={pal.skin} /><path d="M31.4 23 A5.6 5.6 0 0 1 30.5 30" stroke={pal.rim} strokeWidth={1} fill="none" />
        <path d="M20.5 24 Q22 18.5 27 19 Q31.5 19.5 31.5 24 Q26 21.5 20.5 24Z" fill={pal.ink} />
      </g>
      {/* ondas de la voz */}
      {[0, 1, 2].map((i) => { const u = clamp01(sp * 1.5 - i * 0.22); return u > 0 && u < 1 ? <path key={i} d={`M${56 - u * 18} ${34 - u * 8} Q${52 - u * 26} 42 ${56 - u * 18} ${50 + u * 8}`} stroke={pal.glow} strokeWidth={1} fill="none" opacity={(1 - u) * 0.8} /> : null; })}
    </g>
  );
};
