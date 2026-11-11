// senadores_odio · Cleopatra cruza el foro con su diadema y cuatro senadores con toga la miran en silencio; uno le susurra algo al oído a otro.
// `cross` Cleopatra entra caminando por la izquierda hasta el centro (se queda); `glare` los senadores giran la cabeza hacia ella y fruncen el ceño (se quedan);
// `whisper` un senador se inclina al oído de otro con la mano ahuecada (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Toga } from "./romanos";
import { Cleo } from "./ptolomeos";

export const SenadoresOdio: AssetFC = ({ pal, p, t }) => {
  const cr = p.cross ?? 1, gl = p.glare ?? 0, wh = p.whisper ?? 0;
  const walking = cr > 0 && cr < 1 ? 1 : 0, cx = lerp(-12, 26, cr), bob = walking ? Math.abs(Math.sin(t * 0.45)) * -0.8 : 0;
  const sen = (x: number, s: number, k: number, lean = 0) => {
    const turn = lerp(k % 2 ? 0.5 : -0.2, -0.85, gl), brow = gl;
    return <g key={k} transform={`translate(${x} 72) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={10} ry={1.4} fill={pal.ink} opacity={0.4} />
      <g transform={`rotate(${lean * 14} 0 -20)`}>
        <Toga cx={0} top={-41} feet={0} w={15} pal={pal} />
        <path d="M-7.5 -40 Q-10 -30 -8.5 -20" stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <rect x={-1.6} y={-46} width={3.2} height={5} fill={pal.skin} />
        <Cabeza cx={0} cy={-51} r={5.4} pal={pal} turn={turn} curls={k !== 1} bald={k === 1} hair={lerpHex(pal.wallLit, pal.rock, 0.25 + 0.15 * k)} eyesClosed={0.35 * gl} />
        {brow > 0.1 && [-1, 1].map((sd) => <path key={sd} d={`M${turn * 1.7 + sd * 1.8 - 1.2} ${-53.4 + (sd > 0 ? 0 : -0.6) * brow} L${turn * 1.7 + sd * 1.8 + 1.2} ${-53.4 + (sd > 0 ? -0.6 : 0) * brow}`} stroke={pal.ink} strokeWidth={0.7} strokeLinecap="round" opacity={brow} />)}
      </g>
    </g>;
  };
  return (
    <g>
      <ellipse cx={60} cy={72} rx={40} ry={2.6} fill={pal.ink} opacity={0.3} />
      {sen(92, 0.95, 3)}
      {sen(78, 1.0, 2)}
      {sen(64, 1.03, 1, wh)}
      {sen(50, 1.0, 0)}
      {wh > 0.05 && <g opacity={clamp01(wh * 2)}>
        <path d={`M${lerp(62, 70, wh)} ${lerp(40, 22, wh)} Q${lerp(64, 72, wh)} ${lerp(36, 19, wh)} ${lerp(66, 73.5, wh)} ${lerp(38, 21, wh)}`} stroke={pal.skin} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {[0, 1, 2].map((k) => <path key={k} d={`M${74.5 + k * 1.6} ${20 - k * 1.2} q1 -0.6 1.6 0`} stroke={pal.wallLit} strokeWidth={0.4} fill="none" opacity={0.5 + 0.5 * Math.sin(t * 0.4 + k)} />)}
      </g>}
      <g transform={`translate(0 ${bob})`}><Cleo x={cx} y={72} s={1.05} pal={pal} t={t} turn={lerp(0.6, 0.15, gl)} /></g>
    </g>
  );
};
