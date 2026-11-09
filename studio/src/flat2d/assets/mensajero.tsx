// mensajero · un soldado (casco, túnica carmesí, cinturón) que lleva un fardo envuelto en tela oscura y atado con cuerda, mirando a la derecha.
// `kneel`: hinca la rodilla, baja la cabeza y tiende el fardo hacia delante, como quien entrega algo al emperador (se queda arrodillado).
import React from "react";
import { type AssetFC, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, metal } from "./romanos";

export const Mensajero: AssetFC = ({ pal, p, t }) => {
  const k = p.kneel ?? 0, m = metal(pal), cloth = lerpHex(pal.rock, pal.ink, 0.45), breathe = Math.sin(t * 0.08) * 0.4;
  const drop = lerp(0, 22, k), bow = lerp(0, 16, k);
  const bx = lerp(66, 74, k), by = lerp(56, 66, k) + breathe;
  return (
    <g>
      <ellipse cx={50} cy={99} rx={26} ry={2.6} fill={pal.ink} opacity={0.5} />
      {/* piernas: de pie → rodilla en tierra */}
      <path d={`M44 ${70 + drop * 0.4} L${lerp(42, 34, k)} ${lerp(84, 88, k)} L${lerp(42, 30, k)} 98`} stroke={pal.skin} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M54 ${70 + drop * 0.4} L${lerp(56, 66, k)} ${lerp(84, 82, k)} L${lerp(56, 66, k)} 98`} stroke={pal.skin} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={lerp(42, 28, k)} cy={98} rx={4.4} ry={1.8} fill={pal.rock} /><ellipse cx={lerp(57, 68, k)} cy={98} rx={4.4} ry={1.8} fill={pal.rock} />
      <g transform={`translate(0 ${drop}) rotate(${bow} 50 70)`}>
        <path d="M38 42 Q38 36 50 35.5 Q62 36 62 42 L64 72 L36 72Z" fill={pal.accent} />
        <path d="M37 60 L63 60" stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={3} /><rect x={47} y={58.4} width={6} height={3.2} fill={pal.rim} />
        <path d="M38.5 40 L61.5 40 L61 50 L39 50Z" fill={m} opacity={0.85} />
        <path d="M62 42 L64 72" stroke={pal.rim} strokeWidth={0.8} />
        <path d={`M58 42 L${bx - 4} ${by + 2}`} stroke={pal.skin} strokeWidth={3.6} strokeLinecap="round" />
        <path d={`M42 42 L${bx - 10} ${by + 4}`} stroke={pal.skin} strokeWidth={3.6} strokeLinecap="round" />
        <Cabeza cx={50} cy={26} r={8} pal={pal} turn={0.7} curls={false} />
        <path d="M41.5 25 Q42 15 51 15 Q59 15 59 23 L59 26 L55 25 L54 21 Q48 20 44 26Z" fill={m} /><path d="M41 21 Q50 13 59 20" stroke={pal.rim} strokeWidth={0.7} fill="none" />
        <path d="M49 13 Q50 7 52 13 L51.5 16 L49.5 16Z" fill={pal.accent} />
        {/* fardo */}
        <g transform={`translate(${bx} ${by - drop})`}>
          <path d="M-9 -6 Q-11 0 -8 6 Q0 9 8 6 Q11 0 9 -6 Q0 -9 -9 -6Z" fill={cloth} />
          <path d="M-9 -6 Q-4 -1 0 -8 Q4 -1 9 -6" stroke={lerpHex(cloth, pal.wallLit, 0.2)} strokeWidth={0.6} fill="none" />
          <path d="M0 -8 L0 8 M-10 0 Q0 3 10 0" stroke={lerpHex(pal.rock, pal.rim, 0.4)} strokeWidth={0.9} fill="none" />
          <path d="M-2 -9 Q0 -12 2 -9" stroke={lerpHex(pal.rock, pal.rim, 0.4)} strokeWidth={0.9} fill="none" />
          <path d="M8.6 -5 Q11 0 8 6" stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.7} />
        </g>
      </g>
    </g>
  );
};
