// epocas · cuatro personas de épocas distintas (campesino, dama con vestido largo, hombre de traje, niña con mochila) unidas por un hilo de luz; `link` traza el hilo y enciende las almas.
import React from "react";
import { type AssetFC, clamp01 } from "./common";

export const Epocas: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `ep${seed}`, k = p.link ?? 0, xs = [13, 37, 62, 86], glow = (i: number) => clamp01(k * 4 - i);
  const hy = 17, path = `M${xs[0]} ${hy} C${xs[0] + 8} 6 ${xs[1] - 8} 6 ${xs[1]} ${hy} S${xs[2] - 8} 28 ${xs[2]} ${hy} S${xs[3] - 8} 6 ${xs[3]} ${hy}`;
  const orb = (i: number) => <g key={i}><circle cx={xs[i]} cy={hy - 4} r={5.5 * glow(i)} fill={pal.glow} opacity={0.35 * (0.8 + 0.2 * flick)} /><circle cx={xs[i]} cy={hy - 4} r={1.6 * glow(i)} fill="#FFF8E8" /></g>;
  return (
    <g>
      <defs><linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={pal.rim} /><stop offset="1" stopColor={pal.glow} /></linearGradient></defs>
      <ellipse cx={50} cy={47} rx={49} ry={2.6} fill={pal.glow} opacity={0.12} />
      <path d={path} stroke={`url(#${id}g)`} strokeWidth={0.9} fill="none" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - k)} opacity={0.95} />
      {/* campesino */}
      <g fill={pal.rock}><ellipse cx={xs[0]} cy={19.5} rx={5.4} ry={1.2} fill={pal.accent} /><path d={`M${xs[0] - 2.5} 19 Q${xs[0]} 14 ${xs[0] + 2.5} 19Z`} fill={pal.accent} /><circle cx={xs[0]} cy={22.2} r={2.6} fill={pal.skin} />
        <path d={`M${xs[0] - 4} 26 H${xs[0] + 4} L${xs[0] + 4.6} 38 H${xs[0] - 4.6}Z`} fill={pal.wall} /><rect x={xs[0] - 3.6} y={37.5} width={2.8} height={8.6} rx={1} /><rect x={xs[0] + 0.8} y={37.5} width={2.8} height={8.6} rx={1} />
        <path d={`M${xs[0] + 4} 28 L${xs[0] + 9} 24 L${xs[0] + 8} 46`} stroke="#7A5A38" strokeWidth={0.9} fill="none" /><path d={`M${xs[0] + 6.6} 24 h4.4`} stroke={pal.wallLit} strokeWidth={0.9} /></g>
      {/* dama */}
      <g><path d={`M${xs[1] - 2.6} 20 Q${xs[1]} 15 ${xs[1] + 2.6} 20 L${xs[1] + 3.4} 23 H${xs[1] - 3.4}Z`} fill={pal.accent} /><circle cx={xs[1]} cy={22.4} r={2.5} fill={pal.skin} />
        <path d={`M${xs[1] - 3.4} 26 H${xs[1] + 3.4} L${xs[1] + 8.6} 46.4 H${xs[1] - 8.6}Z`} fill={pal.wallLit} /><path d={`M${xs[1] + 3.4} 26 L${xs[1] + 8.6} 46.4`} stroke={pal.rim} strokeWidth={0.8} /><path d={`M${xs[1] - 3} 28 Q${xs[1] - 6} 34 ${xs[1] - 4} 37`} stroke={pal.skin} strokeWidth={1.5} fill="none" strokeLinecap="round" /></g>
      {/* hombre de traje */}
      <g><ellipse cx={xs[2]} cy={19.2} rx={4.4} ry={0.9} fill={pal.ink} /><path d={`M${xs[2] - 2.6} 19 Q${xs[2]} 14 ${xs[2] + 2.6} 19Z`} fill={pal.ink} /><circle cx={xs[2]} cy={22.4} r={2.6} fill={pal.skin} />
        <path d={`M${xs[2] - 4.2} 26 H${xs[2] + 4.2} L${xs[2] + 3.8} 38 H${xs[2] - 3.8}Z`} fill={pal.ink} stroke={pal.wall} strokeWidth={0.5} /><path d={`M${xs[2]} 26 L${xs[2] - 0.8} 31 L${xs[2]} 37 L${xs[2] + 0.8} 31Z`} fill={pal.accent} />
        <rect x={xs[2] - 3.4} y={37.5} width={2.8} height={8.8} rx={0.8} fill={pal.ink} /><rect x={xs[2] + 0.6} y={37.5} width={2.8} height={8.8} rx={0.8} fill={pal.ink} /><rect x={xs[2] + 4.4} y={37.6} width={4.6} height={3.4} rx={0.6} fill={pal.rock} stroke={pal.wallLit} strokeWidth={0.4} /></g>
      {/* niña */}
      <g><circle cx={xs[3]} cy={25} r={2.7} fill={pal.skin} /><path d={`M${xs[3] - 2.8} 24 Q${xs[3]} 18.6 ${xs[3] + 2.8} 24 Q${xs[3]} 22 ${xs[3] - 2.8} 24Z`} fill={pal.ink} /><path d={`M${xs[3] - 2.4} 23.6 Q${xs[3] - 6.4} 27 ${xs[3] - 4.4} 31`} stroke={pal.ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <path d={`M${xs[3] - 3.4} 28.5 H${xs[3] + 3.4} L${xs[3] + 4.8} 38 H${xs[3] - 4.8}Z`} fill={pal.accent} /><rect x={xs[3] + 3.2} y={29} width={3.4} height={6} rx={1} fill={pal.wall} /><rect x={xs[3] - 3} y={38} width={2.4} height={8.2} rx={0.9} fill={pal.skin} /><rect x={xs[3] + 0.6} y={38} width={2.4} height={8.2} rx={0.9} fill={pal.skin} /></g>
      {[0, 1, 2, 3].map(orb)}
      <g opacity={0.0 + 0.0 * t} />
    </g>
  );
};
