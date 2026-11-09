// platon · Platón de pie, ancho de hombros («el Ancho»), barba y pelo rizados entrecanos, manto fino con cenefa azul, sandalias y un rollo de papiro
// en la mano; mira a la izquierda y sonríe. `finger` alza el índice para enseñar («el hombre es un animal…»); `frown` borra la sonrisa, baja las cejas
// y aprieta la mandíbula (deja de sonreír); `step_back` retrocede un paso echándose atrás; `look` gira la cabeza y te mira de frente (todas se quedan).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Himation } from "./romanos";

export const Platon: AssetFC = ({ pal, p, t }) => {
  const fg = p.finger ?? 0, fr = p.frown ?? 0, sb = p.step_back ?? 0, lk = p.look ?? 0, breathe = Math.sin(t * 0.06) * 0.5;
  const cloth = lerpHex(pal.wallLit, pal.wall, 0.28), border = lerpHex(pal.accent, pal.ink, 0.15), hair = lerpHex(pal.rock, pal.wallLit, 0.35);
  const turn = lerp(-0.45, 0, lk), fx = 50 + turn * 10.5 * 0.32, my = 40 + 10.5 * 0.62;
  // brazo derecho (izquierda del cuadro): reposa → alza el índice
  const up = clamp01(fg * 1.3), rhx = lerp(33, 27, up), rhy = lerp(100, 30, up);
  return (
    <g transform={`translate(${sb * 7} ${breathe}) rotate(${-4 * sb} 50 137)`}>
      <ellipse cx={50} cy={137} rx={26} ry={2.8} fill={pal.ink} opacity={0.45} />
      {/* piernas y sandalias */}
      <rect x={41} y={118} width={6.4} height={18} rx={2} fill={pal.skin} /><rect x={52.6} y={118} width={6.4} height={18} rx={2} fill={pal.skin} />
      {[44, 56].map((x, i) => <g key={i}><ellipse cx={x} cy={136} rx={4.8} ry={1.5} fill={lerpHex(pal.rock, pal.ink, 0.35)} /><path d={`M${x - 3} 131 L${x + 3} 134 M${x + 3} 131 L${x - 3} 134`} stroke={lerpHex(pal.rock, pal.ink, 0.35)} strokeWidth={0.8} /></g>)}
      {/* torso ancho */}
      <path d="M29 60 Q50 54 71 60 L68 96 L32 96Z" fill={lerpHex(pal.skin, pal.ink, 0.1)} />
      <path d="M40 66 Q50 70 60 66" stroke={lerpHex(pal.skin, pal.ink, 0.3)} strokeWidth={0.6} fill="none" />
      <Himation cx={50} top={59} feet={126} w={42} pal={pal} cloth={cloth} ragged={false} />
      <path d="M71 59 L74 126" stroke={border} strokeWidth={2.2} /><path d="M26 126 L74 126" stroke={border} strokeWidth={2.4} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${29 + i * 6} 124.6 l1.6 -1.6 l1.6 1.6`} stroke={pal.wallLit} strokeWidth={0.5} fill="none" />)}
      {/* brazo que enseña */}
      <path d={`M33 62 Q${lerp(28, 25, up)} ${lerp(84, 52, up)} ${rhx} ${rhy}`} stroke={pal.skin} strokeWidth={5.2} fill="none" strokeLinecap="round" />
      <path d={`M33 62 Q${lerp(28, 25, up)} ${lerp(80, 50, up)} ${lerp(30, 26, up)} ${lerp(80, 46, up)}`} stroke={cloth} strokeWidth={6.4} fill="none" strokeLinecap="round" opacity={0.95} />
      <ellipse cx={rhx} cy={rhy} rx={3} ry={3.4} fill={pal.skin} />
      {up > 0.5 && <path d={`M${rhx + 0.4} ${rhy - 2.6} L${rhx + 0.8} ${rhy - 8.5}`} stroke={pal.skin} strokeWidth={1.7} strokeLinecap="round" />}
      {/* brazo izquierdo con el rollo de papiro */}
      <path d="M67 62 Q73 80 66 96" stroke={pal.skin} strokeWidth={5.2} fill="none" strokeLinecap="round" />
      <g transform="translate(64 97) rotate(-24)"><rect x={-7} y={-2.2} width={14} height={4.4} rx={2} fill={lerpHex(pal.wallLit, pal.rim, 0.35)} />
        <ellipse cx={-7} cy={0} rx={1.2} ry={2.2} fill={lerpHex(pal.rock, pal.ink, 0.2)} /><ellipse cx={7} cy={0} rx={1.2} ry={2.2} fill={lerpHex(pal.rock, pal.ink, 0.2)} /></g>
      <ellipse cx={66} cy={96} rx={3} ry={3.3} fill={pal.skin} />
      {/* cabeza: cuello ancho, pelo y barba rizados entrecanos */}
      <path d="M45 49 L55 49 L56 60 L44 60Z" fill={pal.skin} />
      <g transform={`rotate(${-6 * sb + 3 * Math.sin(lk * Math.PI)} 50 50)`}>
        <Cabeza cx={50} cy={40} r={10.5} pal={pal} beard turn={turn} hair={hair} curls />
        {[...Array(7)].map((_, i) => <circle key={i} cx={42.5 + i * 2.5} cy={52 + Math.sin(i * 1.7) * 1.2} r={1.5} fill={lerpHex(hair, pal.ink, 0.25)} />)}
        {/* boca: sonrisa → línea apretada */}
        <path d={`M${fx - 2.4} ${my - 0.3 + fr * 0.6} Q${fx} ${my + 1.6 * (1 - fr) - 0.4 * fr} ${fx + 2.4} ${my - 0.3 + fr * 0.6}`} stroke={pal.ink} strokeWidth={0.8} fill="none" strokeLinecap="round" />
        {fr > 0.05 && [-1, 1].map((sd) => <path key={sd} d={`M${fx + sd * 1.6} ${39.6 - 2.3} L${fx + sd * 5.2} ${39.6 - 3.6 + 1.6 * fr}`} stroke={lerpHex(hair, pal.ink, 0.4)} strokeWidth={1.1 * fr} strokeLinecap="round" />)}
        {fr > 0.3 && [-1, 1].map((sd) => <path key={`j${sd}`} d={`M${50 + sd * 8.4} 44 l${sd * 0.6} 2.6`} stroke={lerpHex(pal.skin, pal.ink, 0.4)} strokeWidth={0.6} opacity={fr} />)}
      </g>
    </g>
  );
};
