// dos_destinos · pantalla partida: a la izquierda Babilonia de noche (muro azul vidriado con leones, el lecho real con la diadema de oro y lámparas); a la derecha Corinto al sol (la tinaja sola, la lámpara apagada).
// `left` ilumina Babilonia y oscurece Corinto; `right` hace lo contrario (se quedan): uno en Babilonia, el otro en Corinto.
import React from "react";
import { type AssetFC } from "./common";
import { lerpHex } from "../palette";
import { Pithos } from "./tinaja";
import { Grain } from "./grain";

export const DosDestinos: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `dd${seed}`, l = p.left ?? 0, r = p.right ?? 0;
  const dimL = 0.15 + 0.5 * r, dimR = 0.15 + 0.45 * l * (1 - r);
  const blue = lerpHex(pal.wall, pal.ink, 0.25), gold = pal.rim;
  return (
    <g>
      <defs><clipPath id={`${id}L`}><rect x={-4} y={-4} width={54} height={182} /></clipPath><clipPath id={`${id}R`}><rect x={50} y={-4} width={54} height={182} /></clipPath>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.8} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      {/* Babilonia */}
      <g clipPath={`url(#${id}L)`}>
        <rect x={-4} y={-4} width={54} height={182} fill={lerpHex(pal.ink, blue, 0.3)} />
        <rect x={-4} y={40} width={54} height={90} fill={blue} />
        <g transform="translate(-4 40)"><Grain n={80} w={54} h={90} seed={seed + 5} a={pal.wallLit} b={pal.ink} rMax={0.5} /></g>
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-4 + i * 10} y={34} width={6} height={8} fill={blue} />)}
        {[58, 76, 94].map((y) => <g key={y}>{[...Array(4)].map((_, i) => <g key={i} transform={`translate(${4 + i * 13} ${y})`}><circle r={3.4} fill={lerpHex(pal.wallLit, gold, 0.4)} />{[...Array(8)].map((_, k) => <ellipse key={k} cx={Math.cos(k * 0.785) * 2} cy={Math.sin(k * 0.785) * 2} rx={1.2} ry={0.6} transform={`rotate(${k * 45} ${Math.cos(k * 0.785) * 2} ${Math.sin(k * 0.785) * 2})`} fill={blue} />)}<circle r={0.9} fill={gold} /></g>)}</g>)}
        {[67, 85].map((y) => <path key={y} d={`M-4 ${y} L50 ${y}`} stroke={lerpHex(pal.wallLit, gold, 0.3)} strokeWidth={1.2} />)}
        {[...Array(5)].map((_, i) => <circle key={i} cx={4 + i * 10} cy={110} r={2.2} fill="none" stroke={pal.wallLit} strokeWidth={0.8} />)}
        <rect x={6} y={132} width={38} height={10} rx={2} fill={lerpHex(pal.accent, pal.ink, 0.3)} /><rect x={4} y={128} width={42} height={5} rx={2} fill={lerpHex(pal.wallLit, pal.accent, 0.2)} />
        <path d="M18 126 Q25 118 32 126 L30 128 L20 128Z" fill={gold} /><circle cx={25} cy={121} r={1.4} fill={pal.glow} />
        {[10, 40].map((x) => <g key={x}><circle cx={x} cy={118} r={8 + 2 * flick} fill={`url(#${id}g)`} /><path d={`M${x} 142 L${x} 120`} stroke={gold} strokeWidth={0.8} /><path d={`M${x - 1} 120 Q${x} ${115 - flick} ${x + 1} 120Z`} fill={pal.rim} /></g>)}
        <rect x={-4} y={142} width={54} height={40} fill={lerpHex(pal.rock, pal.ink, 0.5)} />
        <rect x={-4} y={-4} width={54} height={182} fill={pal.ink} opacity={dimL} />
      </g>
      {/* Corinto */}
      <g clipPath={`url(#${id}R)`}>
        <rect x={50} y={-4} width={54} height={182} fill={lerpHex(pal.bg, pal.wallLit, 0.25)} />
        <circle cx={86} cy={40} r={30} fill={`url(#${id}g)`} /><circle cx={86} cy={40} r={8} fill={pal.glow} />
        <path d="M50 128 Q76 120 104 126 L104 182 L50 182Z" fill={lerpHex(pal.wallLit, pal.rock, 0.4)} />
        <g transform="translate(50 126)"><Grain n={70} w={54} h={56} seed={seed + 9} a={pal.wallLit} b={pal.rock} rMax={0.6} /></g>
        <Pithos x={76} y={140} s={0.62} pal={pal} seed={seed} />
        <path d="M90 140 Q94 138 98 140 L99 138 L96 138Z" fill={lerpHex(pal.rock, pal.accent, 0.35)} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${60 + i * 14} ${100 - ((t * 0.1 + i * 10) % 20)} q1 -2 2 0`} stroke={pal.rim} strokeWidth={0.4} fill="none" opacity={0.6} />)}
        <rect x={50} y={-4} width={54} height={182} fill={pal.ink} opacity={dimR} />
      </g>
      <path d="M50 -4 L50 182" stroke={pal.rim} strokeWidth={1} />
      <text x={25} y={48} textAnchor="middle" fontSize={4.6} fontFamily="Georgia, serif" letterSpacing={0.6} fill={pal.wallLit} opacity={0.6 + 0.4 * l}>BABILONIA</text>
      <text x={77} y={48} textAnchor="middle" fontSize={4.6} fontFamily="Georgia, serif" letterSpacing={0.6} fill={pal.wallLit} opacity={0.6 + 0.4 * r}>CORINTO</text>
    </g>
  );
};
