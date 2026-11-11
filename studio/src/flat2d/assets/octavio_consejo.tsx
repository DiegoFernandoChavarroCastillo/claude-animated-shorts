// octavio_consejo · Octavio, el joven heredero de César (sin barba, coraza y capa roja), en Alejandría entre dos águilas de legión; a su lado, el filósofo Areio, viejo y barbudo.
// `arrive` las águilas se alzan y Octavio da un paso al frente (se queda); `whisper` Areio se inclina a su oído con la mano ahuecada (se queda);
// `decide` Octavio entorna los ojos, mira de frente y cierra el puño (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza, Himation, metal } from "./romanos";

export const OctavioConsejo: AssetFC = ({ pal, p, t }) => {
  const ar = p.arrive ?? 1, wh = p.whisper ?? 0, dc = p.decide ?? 0, m = metal(pal), g = lerpHex(pal.rim, pal.glow, 0.2);
  const ox = lerp(66, 60, ar), lean = clamp01(wh);
  const eagle = (x: number, k: number) => {
    const y = lerp(40, 4, clamp01(ar * 1.3 - k * 0.2));
    return <g key={k} transform={`translate(${x} ${y})`}>
      <path d="M0 0 L0 80" stroke={lerpHex(pal.rock, pal.ink, 0.3)} strokeWidth={1} />
      <path d="M-7 -4 Q-4 -9 0 -6 Q4 -9 7 -4 Q4 -5 2 -2 L0 2 L-2 -2 Q-4 -5 -7 -4Z" fill={g} /><circle cx={0} cy={-7} r={1.4} fill={g} />
      <rect x={-4} y={4} width={8} height={1.4} fill={g} /><path d="M-4 12 L4 12 L4 20 L0 18 L-4 20Z" fill={pal.accent} />
      <path d="M-4 12 L4 12" stroke={g} strokeWidth={0.6} />
    </g>;
  };
  const fist = clamp01(dc * 1.5);
  return (
    <g>
      <ellipse cx={55} cy={72} rx={42} ry={3} fill={pal.ink} opacity={0.4} />
      {eagle(82, 0)}{eagle(94, 1)}
      {/* Areio */}
      <g transform={`translate(${lerp(34, 40, lean)} 72) rotate(${lean * 10} 0 -20)`}>
        <Himation cx={0} top={-40} feet={0} w={14} pal={pal} ragged={false} />
        <rect x={-1.5} y={-45} width={3} height={5} fill={pal.skin} />
        <Cabeza cx={0} cy={-50} r={5.2} pal={pal} turn={0.7} beard bald curls={false} hair={lerpHex(pal.wallLit, pal.rock, 0.3)} mouth={wh > 0.3 && wh < 1 ? 0.4 + 0.4 * Math.abs(Math.sin(t * 0.6)) : 0} />
        <path d={`M6 -38 Q${lerp(9, 13, lean)} ${lerp(-30, -42, lean)} ${lerp(8, 15.5, lean)} ${lerp(-24, -48, lean)}`} stroke={pal.skin} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      </g>
      {wh > 0.4 && [0, 1, 2].map((k) => <path key={k} d={`M${55 + k * 1.4} ${19 - k * 1.2} q1 -0.6 1.6 0`} stroke={pal.wallLit} strokeWidth={0.45} fill="none" opacity={(0.5 + 0.5 * Math.sin(t * 0.4 + k)) * clamp01((wh - 0.4) * 3)} />)}
      {/* Octavio */}
      <g>
        <path d={`M${ox - 9} 31 Q${ox - 14} 52 ${ox - 11} 70 L${ox + 11} 70 Q${ox + 14} 52 ${ox + 9} 31Z`} fill={lerpHex(pal.accent, pal.ink, 0.35)} />
        <Coraza cx={ox} top={31} feet={72} w={15} pal={pal} />
        <path d={`M${ox - 7} 32 Q${ox - 10} 42 ${ox - 9} 52`} stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d={`M${ox + 7} 32 Q${ox + 10} 42 ${ox + 9} 52`} stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <circle cx={ox + 9} cy={52.5} r={lerp(1.6, 1.9, fist)} fill={pal.skin} />
        {fist > 0.3 && <path d={`M${ox + 7.6} 51.6 l2.8 0 M${ox + 7.6} 53 l2.8 0`} stroke={lerpHex(pal.skin, pal.ink, 0.4)} strokeWidth={0.3} />}
        <rect x={ox - 1.6} y={26} width={3.2} height={5} fill={pal.skin} />
        <Cabeza cx={ox} cy={21} r={5.6} pal={pal} turn={lerp(lerp(-0.3, -0.7, wh), 0, dc)} curls hair={lerpHex(pal.rim, pal.rock, 0.55)} eyesClosed={0.45 * dc} />
        {dc > 0.2 && [-1, 1].map((sd) => <path key={sd} d={`M${ox + sd * 1.9 - 1.3} ${19.4 + (sd > 0 ? 0 : -0.7) * dc} L${ox + sd * 1.9 + 1.3} ${19.4 + (sd > 0 ? -0.7 : 0) * dc}`} stroke={pal.ink} strokeWidth={0.7} strokeLinecap="round" />)}
        {dc > 0 && <ellipse cx={ox} cy={40} rx={22} ry={40} fill={pal.accent} opacity={0.08 * dc} />}
      </g>
    </g>
  );
};
