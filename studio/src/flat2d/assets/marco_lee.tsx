// marco_lee · Marco Aurelio sentado en un taburete de campaña, de noche, leyendo un rollo abierto entre las manos a la luz de una lámpara sobre una mesita;
// coraza, capa carmesí y corona de laurel. `read` desenrolla el rollo y sus ojos recorren las líneas (se queda leyendo); `look_up` alza la vista del rollo, pensativo (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza } from "./romanos";

export const MarcoLee: AssetFC = ({ pal, p, t, seed, flick }) => {
  const rd = p.read ?? 0, lu = p.look_up ?? 0, id = `ml${seed}`, wood = lerpHex(pal.rock, pal.ink, 0.2), paper = lerpHex(pal.wallLit, pal.rim, 0.15);
  const half = lerp(5, 14, clamp01(rd * 1.5)), sx = 50, sy = 52, scan = rd > 0.3 && lu < 0.5 ? Math.sin(t * 0.12) * 0.25 : 0;
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.7} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={50} cy={89} rx={40} ry={2.4} fill={pal.ink} opacity={0.5} />
      {/* mesita con lámpara */}
      <circle cx={84} cy={56} r={22 + 3 * flick} fill={`url(#${id}g)`} />
      <rect x={74} y={62} width={20} height={2.4} fill={wood} /><path d="M77 64 L76 89 M91 64 L92 89" stroke={wood} strokeWidth={1.4} />
      <path d="M79 62 Q84 65 89 62 L90 60 L78 60Z" fill={lerpHex(pal.rock, pal.accent, 0.35)} /><path d={`M89 60 Q91 ${56 - 2 * flick} 90 55`} stroke={pal.rim} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* taburete en X */}
      <path d="M38 89 L60 72 M60 89 L38 72" stroke={wood} strokeWidth={1.8} /><rect x={36} y={70} width={26} height={2.6} rx={1} fill={wood} />
      {/* capa y cuerpo sentado */}
      <path d="M32 26 Q22 60 30 72 L68 72 Q74 54 66 26Z" fill={lerpHex(pal.accent, pal.ink, 0.42)} />
      <g transform="scale(1 0.62) translate(0 16)"><Coraza cx={49} top={26} feet={98} w={36} pal={pal} /></g>
      <path d="M40 72 L36 88 M58 72 L62 88" stroke={pal.skin} strokeWidth={4} strokeLinecap="round" />
      {[[34, 88], [64, 88]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={3.4} ry={1.4} fill={pal.rock} />)}
      {/* brazos sosteniendo el rollo */}
      <path d={`M34 30 Q30 44 ${sx - half - 1} ${sy}`} stroke={pal.accent} strokeWidth={5.4} fill="none" strokeLinecap="round" />
      <path d={`M64 30 Q68 44 ${sx + half + 1} ${sy}`} stroke={pal.accent} strokeWidth={5.4} fill="none" strokeLinecap="round" />
      <rect x={sx - half} y={sy - 6} width={half * 2} height={11} fill={paper} />
      {[0, 1, 2, 3].map((l) => <path key={l} d={`M${sx - half + 2} ${sy - 3.6 + l * 2.4} L${sx + half - 2 - (l % 2) * 3} ${sy - 3.6 + l * 2.4}`} stroke={lerpHex(pal.rock, pal.ink, 0.35)} strokeWidth={0.5} opacity={clamp01(rd * 2)} />)}
      {[-1, 1].map((s) => <g key={s}><rect x={sx + s * half - 1.6} y={sy - 7.4} width={3.2} height={13.8} rx={1.4} fill={lerpHex(paper, pal.rock, 0.35)} />
        <ellipse cx={sx + s * (half + 1)} cy={sy} rx={2.6} ry={3} fill={pal.skin} /></g>)}
      <rect x={45.5} y={20} width={7} height={6} fill={pal.skin} />
      <g transform={`rotate(${lerp(14, -2, lu)} 49 24)`}>
        <Cabeza cx={49} cy={13} r={8.4} pal={pal} turn={lerp(scan, 0.35, lu)} beard laurel={1} eyesClosed={lerp(0.45, 0, lu)} />
      </g>
    </g>
  );
};
