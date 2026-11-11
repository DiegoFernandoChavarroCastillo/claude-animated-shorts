// relieve_egipto · Muro de arenisca de Medinet Habu con el relieve de Ramsés III tensando el arco ante las naves de los Pueblos del Mar y columnas de jeroglíficos: Egipto, el faraón, grabado en piedra, la victoria.
// `carve` el relieve se talla de izquierda a derecha con chispas de cincel (se queda).
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { NaveMar } from "./bronce";

export const RelieveEgipto: AssetFC = ({ pal, p, t, seed }) => {
  const id = `re${seed}`, cv = p.carve ?? 1, stone = lerpHex(pal.wall, pal.wallLit, 0.35), cut = lerpHex(stone, pal.ink, 0.5), hi = lerpHex(stone, pal.wallLit, 0.4);
  const glyph = (x: number, y: number, k: number) => { const v = Math.floor(hash(k) * 5);
    return v === 0 ? <circle cx={x} cy={y} r={1.2} fill="none" stroke={cut} strokeWidth={0.5} /> : v === 1 ? <path d={`M${x - 1.4} ${y + 1} L${x} ${y - 1.4} L${x + 1.4} ${y + 1}`} stroke={cut} strokeWidth={0.5} fill="none" />
      : v === 2 ? <path d={`M${x - 1.5} ${y} q0.75 -1 1.5 0 q0.75 1 1.5 0`} stroke={cut} strokeWidth={0.5} fill="none" /> : v === 3 ? <rect x={x - 1.2} y={y - 0.6} width={2.4} height={1.2} fill="none" stroke={cut} strokeWidth={0.5} />
      : <path d={`M${x - 1} ${y + 1.2} Q${x - 1.6} ${y - 1} ${x} ${y - 1.4} Q${x + 1} ${y - 1} ${x + 1.2} ${y + 0.4}`} stroke={cut} strokeWidth={0.5} fill="none" />; };
  return (
    <g>
      <defs><clipPath id={`${id}c`}><rect x={-2} y={-2} width={4 + 104 * cv} height={182} /></clipPath></defs>
      <rect x={-2} y={-2} width={104} height={182} fill={stone} />
      <Grain n={260} w={100} h={110} seed={seed * 5 + 7} a={hi} b={lerpHex(stone, pal.ink, 0.3)} rMax={0.7} />
      {[...Array(5)].map((_, r) => <path key={r} d={`M-2 ${10 + r * 22} L102 ${10 + r * 22}`} stroke={lerpHex(stone, pal.ink, 0.25)} strokeWidth={0.35} />)}
      <g clipPath={`url(#${id}c)`}>
        {[...Array(6)].map((_, c) => [...Array(7)].map((_, r) => <g key={`${c}${r}`}>{glyph(6 + c * 4.2, 18 + r * 4.6, c * 9 + r)}</g>))}
        <path d="M4 15 L30 15 M4 50 L30 50" stroke={cut} strokeWidth={0.5} />
        {/* Ramsés con la corona azul tensando el arco */}
        <g transform="translate(28 100)">
          <path d="M-4 0 L-2 -24 M4 0 L3 -24" stroke={cut} strokeWidth={2.8} strokeLinecap="round" />
          <path d="M-6 -22 L6 -22 L4 -14 L-4 -14Z" fill={lerpHex(stone, pal.wallLit, 0.2)} stroke={cut} strokeWidth={0.6} />
          <path d="M-5 -24 L-6 -44 L6 -44 L5 -24Z" fill={lerpHex(stone, pal.skin, 0.35)} stroke={cut} strokeWidth={0.6} />
          <path d="M5 -42 L22 -46 M5 -38 L12 -40" stroke={cut} strokeWidth={2} strokeLinecap="round" />
          <path d="M18 -62 Q30 -46 18 -30" stroke={cut} strokeWidth={1.1} fill="none" /><path d="M18 -62 L12 -40 L18 -30" stroke={cut} strokeWidth={0.4} fill="none" />
          <path d="M12 -40 L34 -40" stroke={cut} strokeWidth={0.6} /><path d="M34 -40 l-2 -1 l0 2Z" fill={cut} />
          <ellipse cx={0} cy={-49} rx={4} ry={5} fill={lerpHex(stone, pal.skin, 0.35)} stroke={cut} strokeWidth={0.6} />
          <path d="M-4.4 -51 Q-5 -62 0 -63 Q6 -62 4.6 -50 Q2 -55 -4.4 -51Z" fill={lerpHex(pal.accent, stone, 0.35)} stroke={cut} strokeWidth={0.6} />
          {[0, 1, 2].map((i) => <circle key={i} cx={-2 + i * 2} cy={-58} r={0.5} fill={cut} />)}
          <path d="M3.6 -45 L5 -42 L2 -42" stroke={cut} strokeWidth={0.5} fill="none" />
        </g>
        {/* naves enemigas talladas */}
        <g opacity={0.95}>{[[66, 48, 0.42], [86, 62, 0.4], [64, 84, 0.42], [86, 100, 0.38]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y})`}><NaveMar x={0} y={0} s={s} pal={{ ...pal, rock: cut, ink: cut, skin: stone, wallLit: hi, rim: hi }} t={0} seed={i} sail={lerpHex(stone, pal.ink, 0.15)} /></g>)}</g>
        {[...Array(5)].map((_, i) => <path key={`ar${i}`} d={`M${48 + i * 3} ${44 + i * 13} l7 -2`} stroke={cut} strokeWidth={0.5} />)}
        <path d="M44 15 L100 15" stroke={cut} strokeWidth={0.5} />
        {[...Array(11)].map((_, c) => glyph(48 + c * 4.6, 11, 90 + c))}
      </g>
      {cv < 1 && <g transform={`translate(${104 * cv} ${60 + Math.sin(t * 0.8) * 20})`}>{[...Array(5)].map((_, i) => <path key={i} d={`M0 0 l${2 + hash(i + t) * 3} ${(hash(i * 3 + t) - 0.5) * 6}`} stroke={pal.glow} strokeWidth={0.5} />)}<rect x={0} y={-8} width={1.6} height={10} fill={lerpHex(pal.rock, pal.rim, 0.4)} transform="rotate(30)" /></g>}
      {/* base en sombra (subtítulos) */}
      <rect x={-2} y={110} width={104} height={70} fill={lerpHex(pal.rock, pal.ink, 0.6)} />
      <path d="M-2 110 L102 110" stroke={pal.rim} strokeWidth={0.6} opacity={0.4} />
      <g transform="translate(0 110)"><Grain n={90} w={100} h={68} seed={seed + 21} a={pal.rock} b={pal.ink} rMax={0.7} /></g>
    </g>
  );
};
