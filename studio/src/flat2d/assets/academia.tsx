// academia · interior del pórtico de la Academia de Platón al atardecer: columnas dóricas con friso de meandros, entre ellas el patio con olivos
// y cielo cálido; lámparas de aceite encendidas sobre pies de bronce, un busto en su pedestal y suelo de mármol oscuro y pulido en perspectiva.
import React from "react";
import { type AssetFC, flicker, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Academia: AssetFC = ({ pal, t, seed }) => {
  const id = `ac${seed}`, marble = lerpHex(pal.wallLit, pal.wall, 0.3), marbleD = lerpHex(marble, pal.ink, 0.5), wallC = lerpHex(pal.wall, pal.ink, 0.45);
  const floor = lerpHex(pal.rock, pal.ink, 0.72), floorL = lerpHex(floor, pal.rim, 0.12), bronze = lerpHex(pal.rim, pal.rock, 0.55), olive = lerpHex(pal.rock, "#4F6B3A", 0.6);
  const column = (x: number, k: number) => (
    <g key={`c${k}`}>
      <rect x={x - 1.2} y={22} width={10.4} height={3} fill={marble} /><path d={`M${x - 0.4} 25 L${x + 8.4} 25 L${x + 7.4} 28 L${x + 0.6} 28Z`} fill={marbleD} />
      <path d={`M${x + 0.8} 28 L${x + 7.2} 28 L${x + 7.8} 96 L${x + 0.2} 96Z`} fill={marble} />
      {[2.2, 4, 5.8].map((f, i) => <path key={i} d={`M${x + f} 29 L${x + f + 0.1 * (f - 4)} 95`} stroke={marbleD} strokeWidth={0.45} opacity={0.7} />)}
      <path d={`M${x + 5.8} 28 L${x + 7.2} 28 L${x + 7.8} 96 L${x + 6.2} 96Z`} fill={marbleD} opacity={0.55} />
      <rect x={x - 1} y={96} width={10} height={2.6} fill={marbleD} />
    </g>
  );
  const lamp = (x: number, k: number) => {
    const f = flicker(t + k * 37), fl = 0.85 + 0.3 * f;
    return (
      <g key={`l${k}`}>
        <circle cx={x} cy={58} r={22 * fl} fill={`url(#${id}g)`} />
        <path d={`M${x} 60 L${x} 97 M${x - 3} 97 L${x} 93 L${x + 3} 97`} stroke={bronze} strokeWidth={0.9} fill="none" />
        <path d={`M${x - 3.6} 60 Q${x} 63.5 ${x + 3.6} 60 L${x + 2} 59 L${x - 2} 59Z`} fill={bronze} />
        <path d={`M${x + 2.2} 59 Q${x + 3.4 + f} ${55 - 2 * f} ${x + 2.6} ${53 - 2 * f} Q${x + 1.4} ${56} ${x + 2.2} 59Z`} fill={pal.rim} />
        <circle cx={x + 2.5} cy={57.6} r={0.8} fill={pal.glow} />
      </g>
    );
  };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={lerpHex(pal.bg, pal.accent, 0.25)} /><stop offset="1" stopColor={lerpHex(pal.rim, pal.wall, 0.45)} /></linearGradient>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.55} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={floorL} /><stop offset="1" stopColor={lerpHex(floor, pal.ink, 0.4)} /></linearGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={182} fill={wallC} />
      {/* patio entre columnas: cielo de tarde, colinas y olivos */}
      <rect x={-2} y={28} width={104} height={68} fill={`url(#${id}s)`} />
      <path d="M-2 80 Q20 70 40 76 Q62 68 80 75 Q92 72 102 76 L102 96 L-2 96Z" fill={lerpHex(pal.wall, pal.bg, 0.4)} />
      {[[12, 90, 1], [44, 92, 1.2], [70, 89, 0.9], [92, 91, 1.1]].map(([x, y, s], i) => (
        <g key={`o${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 0 Q-1 -6 0.6 -10" stroke={lerpHex(pal.rock, pal.ink, 0.4)} strokeWidth={1.4} fill="none" />
          {[...Array(7)].map((_, j) => <circle key={j} cx={-5 + j * 1.8 + hash(j + i) * 2} cy={-12 - hash(j * 3 + i) * 5 + Math.sin(t * 0.03 + j) * 0.3} r={2.4 + hash(j + 9) * 1.4} fill={j % 2 ? olive : lerpHex(olive, pal.rim, 0.2)} />)}
        </g>
      ))}
      {/* techo, arquitrabe y friso de meandros */}
      <rect x={-2} y={-2} width={104} height={16} fill={lerpHex(wallC, pal.ink, 0.35)} />
      {[...Array(9)].map((_, i) => <rect key={`v${i}`} x={i * 12 - 1} y={0} width={4} height={14} fill={lerpHex(wallC, pal.ink, 0.55)} />)}
      <rect x={-2} y={13} width={104} height={9} fill={marble} />
      <rect x={-2} y={15} width={104} height={5} fill={lerpHex(pal.accent, pal.ink, 0.25)} />
      {[...Array(15)].map((_, i) => <path key={`m${i}`} d={`M${i * 7} 19 L${i * 7} 16 L${i * 7 + 5} 16 L${i * 7 + 5} 18.4 L${i * 7 + 2} 18.4 L${i * 7 + 2} 17.4`} stroke={pal.wallLit} strokeWidth={0.5} fill="none" />)}
      {[2, 27, 52, 77, 98].map((x, k) => column(x, k))}
      {/* busto sobre pedestal entre columnas */}
      <g transform="translate(64 96)">
        <rect x={-3.5} y={-20} width={7} height={20} fill={marble} /><rect x={-4.5} y={-21.5} width={9} height={2} fill={marbleD} />
        <path d="M-5 -22 Q0 -28 5 -22Z" fill={marble} /><ellipse cx={0} cy={-31} rx={3.2} ry={4} fill={marble} />
        <path d="M-3.2 -30 Q0 -24 3.2 -30 Q2 -26 0 -25.4 Q-2 -26 -3.2 -30Z" fill={marbleD} opacity={0.6} />
      </g>
      {lamp(18, 1)}{lamp(86, 2)}
      {/* suelo de mármol pulido en perspectiva */}
      <rect x={-2} y={98} width={104} height={82} fill={`url(#${id}f)`} />
      {[...Array(13)].map((_, i) => { const x = -30 + i * 13.3; return <path key={`p${i}`} d={`M${50 + (x - 50) * 0.32} 98 L${x} 180`} stroke={lerpHex(floor, pal.ink, 0.45)} strokeWidth={0.4} />; })}
      {[101, 105.5, 111, 118, 127, 139, 155].map((y, i) => <path key={`h${i}`} d={`M-2 ${y} L102 ${y}`} stroke={lerpHex(floor, pal.ink, 0.45)} strokeWidth={0.4} />)}
      {/* reflejos de las lámparas y las columnas en el mármol */}
      {[18, 86].map((x, i) => <ellipse key={`r${i}`} cx={x} cy={104} rx={7} ry={2.2} fill={pal.rim} opacity={0.12 + 0.06 * flicker(t + i * 37)} />)}
      {[2, 27, 52, 77].map((x, i) => <rect key={`cr${i}`} x={x + 0.8} y={98.6} width={6.4} height={6} fill={marble} opacity={0.07} />)}
      <g transform="translate(0 98)"><Grain n={300} w={100} h={82} seed={seed * 5 + 3} a={lerpHex(floor, pal.wallLit, 0.25)} b={pal.ink} rMax={0.7} /></g>
      <g transform="translate(0 28)"><Grain n={90} w={100} h={68} seed={seed * 3 + 1} a={lerpHex(pal.wallLit, pal.rim, 0.3)} b={pal.ink} rMax={0.5} /></g>
    </g>
  );
};
