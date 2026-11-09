// golpe · dos siluetas a contraluz: el general Casio (capa) y un centurión (casco con cimera transversal, espada corta) que se le echa encima; detrás, otro soldado.
// `strike`: el centurión se lanza y su espada cruza a la altura del cuello con un tajo carmesí; `fall`: Casio se desploma hacia atrás y el otro soldado avanza (se queda caído).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";

export const Golpe: AssetFC = ({ pal, p }) => {
  const st = p.strike ?? 0, fa = p.fall ?? 0, sil = pal.ink, rim = pal.rim;
  const lunge = Math.sin(clamp01(st) * Math.PI * 0.5) * 9, arm = clamp01((st - 0.25) / 0.45), slash = clamp01((st - 0.45) / 0.2) * (1 - clamp01((st - 0.75) / 0.25));
  const rot = -78 * fa, sink = 2 * fa, back = clamp01(st) * 3;
  const sx = lerp(72, 52, arm), sy = lerp(26, 38, arm);
  const person = (cape: boolean) => (
    <g>
      <rect x={-5.5} y={-28} width={4.4} height={28} rx={1.6} fill={sil} /><rect x={1.1} y={-28} width={4.4} height={28} rx={1.6} fill={sil} />
      {cape && <path d="M-10 -56 Q-16 -30 -12 -14 L8 -14 Q10 -36 6 -56Z" fill={lerpHex(pal.accent, sil, 0.55)} />}
      <path d="M-8 -56 Q0 -59 8 -56 L7 -26 L-7 -26Z" fill={sil} />
      <circle cx={0} cy={-63} r={6} fill={sil} />
      <path d="M-8 -56 Q-12 -44 -10 -34" stroke={sil} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <path d="M8 -56 L8 -54" stroke={rim} strokeWidth={0.9} />
    </g>
  );
  return (
    <g>
      <ellipse cx={50} cy={89} rx={42} ry={2.4} fill={sil} opacity={0.5} />
      {/* otro soldado, al fondo */}
      <g transform={`translate(${lerp(16, 26, fa)} 88) scale(0.82)`} opacity={0.85}>
        {person(false)}<path d="M-6 -66 L6 -66 L5 -61 L-5 -61Z" fill={sil} /><path d="M-1 -70 Q0 -76 1 -70 L1 -67 L-1 -67Z" fill={sil} />
        <path d="M8 -54 L12 -40" stroke={sil} strokeWidth={3} strokeLinecap="round" /><path d="M12 -40 L13 -26" stroke={rim} strokeWidth={0.9} opacity={0.8} />
      </g>
      {/* Casio */}
      <g transform={`translate(${40 - back} ${88 + sink}) rotate(${rot + back * -2})`}>
        {person(true)}
        <path d="M-6 -66 Q0 -71 6 -66" stroke={rim} strokeWidth={0.8} fill="none" />
        <path d="M8 -56 Q14 -46 10 -38" stroke={sil} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d="M6 -68 A6 6 0 0 1 5.5 -59" stroke={rim} strokeWidth={0.9} fill="none" />
      </g>
      {/* centurión */}
      <g transform={`translate(${70 - lunge} 88) rotate(${-8 * clamp01(st * 2)})`}>
        <g transform="scale(-1 1)">{person(false)}</g>
        <path d="M-10 -67 L10 -67 Q8 -72 0 -72.5 Q-8 -72 -10 -67Z" fill={sil} /><path d="M-11 -71 Q0 -77 11 -71 L11 -69.5 L-11 -69.5Z" fill={lerpHex(pal.accent, sil, 0.3)} />
        <path d="M-6 -66 A6 6 0 0 0 -5.5 -59" stroke={rim} strokeWidth={0.9} fill="none" />
        <rect x={4} y={-50} width={8} height={22} rx={1.2} fill={sil} /><circle cx={8} cy={-39} r={1.4} fill={rim} />
      </g>
      {/* brazo y espada del centurión */}
      <path d={`M${70 - lunge - 6} 32 L${sx - lunge} ${sy}`} stroke={sil} strokeWidth={3.2} strokeLinecap="round" />
      <path d={`M${sx - lunge} ${sy} L${sx - lunge - lerp(2, 12, arm)} ${sy - lerp(12, 2, arm)}`} stroke={lerpHex(rim, pal.wallLit, 0.5)} strokeWidth={1.4} strokeLinecap="round" />
      {slash > 0 && <path d="M30 18 Q44 26 58 22" stroke={pal.accent} strokeWidth={2.6 * slash} fill="none" strokeLinecap="round" opacity={slash} />}
      {slash > 0 && <path d="M32 19 Q44 25.5 56 22.5" stroke={pal.glow} strokeWidth={0.8 * slash} fill="none" opacity={slash} />}
    </g>
  );
};
