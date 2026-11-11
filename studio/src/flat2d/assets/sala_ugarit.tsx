// sala_ugarit · Sala del palacio de Ugarit de noche: sillares, vigas de cedro, un nicho con tablillas del archivo, ventana con cielo rojo y humo, brasero y puerta de madera a la derecha: el palacio, el archivo, el escriba, dentro.
// `burst` la puerta revienta con luz de fuego y astillas (se queda abierta).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const SalaUgarit: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `su${seed}`, bs = p.burst ?? 0, plaster = lerpHex(pal.wall, pal.wallLit, 0.12), ashlar = lerpHex(pal.rock, pal.wallLit, 0.25), wood = lerpHex(pal.rock, pal.ink, 0.3);
  const open = clamp01(bs * 2);
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.6} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <rect x={-2} y={-2} width={104} height={114} fill={plaster} />
      <Grain n={170} w={100} h={110} seed={seed * 3 + 1} a={lerpHex(plaster, pal.wallLit, 0.15)} b={pal.ink} rMax={0.7} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={`b${i}`} x={-2 + i * 20} y={-2} width={6} height={12} fill={wood} />)}
      <rect x={-2} y={8} width={104} height={3} fill={lerpHex(wood, pal.rim, 0.15)} />
      {/* sillares */}
      <rect x={-2} y={78} width={104} height={34} fill={ashlar} />
      {[...Array(4)].map((_, r) => [...Array(7)].map((_, c) => <rect key={`${r}${c}`} x={-2 + c * 16 + (r % 2) * 8} y={78 + r * 8.5} width={15.4} height={8} fill="none" stroke={lerpHex(ashlar, pal.ink, 0.35)} strokeWidth={0.4} />))}
      {/* ventana */}
      <rect x={8} y={26} width={26} height={30} fill={lerpHex(pal.bg, pal.accent, 0.45 + 0.1 * flick)} />
      {[0, 1, 2].map((i) => { const u = ((t * 0.008 + i / 3) % 1); return <circle key={i} cx={16 + i * 5 + u * 6} cy={54 - u * 26} r={3 + u * 5} fill={lerpHex(pal.wall, pal.ink, 0.5)} opacity={0.7 * (1 - u)} />; })}
      <path d="M8 50 L12 46 L15 48 L18 44 L22 47 L26 43 L30 47 L34 45 L34 56 L8 56Z" fill={pal.ink} />
      <rect x={8} y={26} width={26} height={30} fill="none" stroke={wood} strokeWidth={1.6} /><path d="M21 26 L21 56" stroke={wood} strokeWidth={1} />
      {/* nicho del archivo con tablillas */}
      <rect x={40} y={30} width={22} height={26} fill={lerpHex(plaster, pal.ink, 0.45)} />
      {[0, 1, 2].map((r) => [...Array(5)].map((_, c) => <rect key={`t${r}${c}`} x={41.5 + c * 4.1} y={33 + r * 8} width={3.2} height={5.6} rx={0.8} fill={lerpHex(pal.rock, pal.rim, 0.25 + hash(r * 5 + c) * 0.15)} />))}
      {[0, 1, 2].map((r) => <path key={`s${r}`} d={`M40 ${38.8 + r * 8} L62 ${38.8 + r * 8}`} stroke={wood} strokeWidth={0.8} />)}
      {/* puerta */}
      <rect x={70} y={46} width={24} height={66} fill={open > 0 ? pal.glow : pal.ink} opacity={open > 0 ? 0.6 + 0.3 * flick : 1} />
      <g transform={`translate(70 46) skewY(${-open * 12}) scale(${1 - open * 0.75} 1)`}>
        <rect x={0} y={0} width={24} height={66} fill={wood} />
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M${6 * k + 3} 0 L${6 * k + 3} 66`} stroke={lerpHex(wood, pal.ink, 0.4)} strokeWidth={0.5} />)}
        <rect x={0} y={14} width={24} height={2} fill={lerpHex(wood, pal.rim, 0.3)} /><rect x={0} y={50} width={24} height={2} fill={lerpHex(wood, pal.rim, 0.3)} />
      </g>
      <rect x={68} y={44} width={28} height={2.4} fill={ashlar} />
      {bs > 0 && bs < 1 && [...Array(10)].map((_, i) => { const u = clamp01(bs * 1.6 - i * 0.03), a = hash(i) * Math.PI - Math.PI; return <rect key={`a${i}`} x={80 + Math.cos(a) * u * 34} y={80 + Math.sin(a) * u * 26 + u * u * 20} width={2.4} height={0.8} fill={wood} transform={`rotate(${i * 37 + u * 200} ${80 + Math.cos(a) * u * 34} ${80 + Math.sin(a) * u * 26})`} opacity={1 - u * 0.5} />; })}
      {/* brasero */}
      <circle cx={52} cy={98} r={20 + 3 * flick} fill={`url(#${id}g)`} />
      <path d="M46 110 L48 100 L56 100 L58 110" stroke={lerpHex(pal.rim, pal.rock, 0.4)} strokeWidth={1} fill="none" />
      <path d="M45 100 L59 100 L57 96 L47 96Z" fill={lerpHex(pal.rim, pal.rock, 0.45)} />
      <path d={`M49 96 Q50 ${90 - 2 * flick} 52 ${88 - 3 * flick} Q54 ${91 - flick} 55 96Z`} fill={pal.rim} /><path d={`M51 96 Q52 ${92 - flick} 53 96Z`} fill={pal.glow} />
      {/* suelo */}
      <rect x={-2} y={110} width={104} height={70} fill={lerpHex(pal.rock, pal.ink, 0.62)} />
      <g transform="translate(0 110)"><Grain n={110} w={100} h={68} seed={seed * 9 + 2} a={pal.rock} b={pal.ink} rMax={0.8} /></g>
      <path d="M-2 110 L102 110" stroke={pal.rim} strokeWidth={0.5} opacity={0.45} />
    </g>
  );
};
