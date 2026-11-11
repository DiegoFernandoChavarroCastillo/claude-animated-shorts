// ugarit · Ugarit de noche: ciudad costera con palacio y dos templos sobre la colina, murallas, el puerto con su muelle de piedra y dos mercantes cargados de lingotes, el mar y una columna de humo: la ciudad, el reino, el puerto, Siria.
// `ships` asoman siete velas en el horizonte, una tras otra (se quedan); `empty` los mercantes se van del muelle y quedan gaviotas (se queda vacío); `burn` arde la ciudad.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { seg } from "./bronce";

export const Ugarit: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `ug${seed}`, sh = p.ships ?? 0, em = p.empty ?? 0, bu = p.burn ?? 0;
  const stone = lerpHex(pal.wallLit, pal.rock, 0.55), stoneD = lerpHex(stone, pal.ink, 0.35), sea = lerpHex(pal.wall, pal.ink, 0.35);
  const houses = [...Array(16)].map((_, i) => ({ x: 46 + i * 3.6 + hash(i + seed) * 2, w: 4 + hash(i * 3) * 3, h: 5 + hash(i * 5) * 7, y: 84 - Math.abs(i - 8) * 0.9 }));
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="1" stopColor={lerpHex(lerpHex(pal.wall, pal.bg, 0.4), pal.accent, 0.45 * bu)} /></linearGradient>
        <radialGradient id={`${id}f`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.85} /><stop offset="1" stopColor={pal.accent} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={92} fill={`url(#${id}s)`} />
      {[...Array(18)].map((_, i) => <circle key={i} cx={hash(i * 7 + 1) * 100} cy={hash(i * 3 + 2) * 50} r={0.25 + hash(i) * 0.3} fill={pal.wallLit} opacity={(0.6 - bu * 0.5) * (0.6 + 0.4 * Math.sin(t * 0.1 + i))} />)}
      {/* humo: siempre una columna lejana; con burn, muchas */}
      {[...Array(3 + Math.round(bu * 5))].map((_, i) => {
        const cx = i === 0 ? 14 : 50 + i * 6.5, k = i === 0 ? 0.6 : bu;
        return <g key={`h${i}`} opacity={0.75 * k}>{[...Array(6)].map((_, j) => { const u = ((t * 0.006 + j / 6 + i * 0.13) % 1); return <circle key={j} cx={cx + Math.sin(u * 4 + i) * 4 + u * 10} cy={(i === 0 ? 84 : 66) - u * 70} r={3 + u * 9} fill={lerpHex(pal.wall, pal.ink, 0.5)} opacity={(1 - u) * 0.8} />; })}</g>;
      })}
      {/* mar y horizonte */}
      <rect x={-2} y={86} width={104} height={26} fill={sea} />
      <path d="M-2 86 L102 86" stroke={lerpHex(sea, pal.rim, 0.4 + bu * 0.3)} strokeWidth={0.4} />
      {[...Array(12)].map((_, i) => <path key={`w${i}`} d={`M${(hash(i) * 110 + t * 0.05 * (1 + (i % 3))) % 110 - 6} ${88 + (i % 6) * 3.6} q1.6 -0.8 3.2 0`} stroke={lerpHex(sea, pal.wallLit, 0.25)} strokeWidth={0.4} fill="none" />)}
      {/* siete velas en el horizonte */}
      {[...Array(7)].map((_, i) => { const k = seg(sh, i / 9, i / 9 + 0.25); return k > 0 ? <g key={`v${i}`} transform={`translate(${4 + i * 5.2 + (1 - k) * -6} ${85.6})`} opacity={k}>
        <path d="M0 0 L0 -4.4" stroke={pal.ink} strokeWidth={0.35} /><path d="M-1.8 -4 L1.8 -4 L1.6 -1.2 L-1.6 -1.2Z" fill={lerpHex(pal.wallLit, pal.rock, 0.3)} /><path d="M-2.6 0 Q0 1 2.6 0 L2.2 -0.6 L-2.2 -0.6Z" fill={pal.ink} /></g> : null; })}
      {/* colina (tell) y murallas */}
      <path d="M38 112 Q44 84 56 80 L96 78 Q104 80 104 112Z" fill={lerpHex(pal.rock, pal.ink, 0.3)} />
      {houses.map((h, i) => <g key={`c${i}`}><rect x={h.x} y={h.y - h.h} width={h.w} height={h.h + 4} fill={i % 2 ? stone : stoneD} /><rect x={h.x + h.w * 0.35} y={h.y - h.h * 0.6} width={1} height={1.6} fill={bu > 0.2 ? pal.glow : pal.ink} opacity={0.9} /></g>)}
      {/* palacio y los dos templos (Baal y Dagán) */}
      <rect x={62} y={66} width={22} height={16} fill={stone} /><path d="M62 66 L84 66" stroke={pal.rim} strokeWidth={0.5} opacity={0.7} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={64.5 + k * 5} y={72} width={2} height={6} fill={pal.ink} />)}
      <rect x={86} y={58} width={7} height={22} fill={stoneD} /><rect x={53} y={62} width={6} height={18} fill={stoneD} />
      <path d="M86 58 L93 58 M53 62 L59 62" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} />
      <path d="M40 104 L46 90 L100 88 L100 92 L48 94 L44 106Z" fill={stoneD} />
      {[48, 60, 72, 84, 96].map((x) => <rect key={x} x={x - 1.6} y={86} width={3.2} height={5} fill={stoneD} />)}
      {/* puerto: muelle de piedra, mercantes y gaviotas */}
      <path d="M-2 104 L36 104 L36 108 L-2 108Z" fill={stoneD} /><path d="M-2 104 L36 104" stroke={pal.rim} strokeWidth={0.4} opacity={0.5} />
      {[0, 1].map((i) => <g key={`m${i}`} opacity={1 - em} transform={`translate(${-em * 30} 0)`}>
        <path d={`M${6 + i * 16} 103 Q${12 + i * 16} 107 ${20 + i * 16} 103 L${19 + i * 16} 101 L${7 + i * 16} 101Z`} fill={lerpHex(pal.rock, pal.ink, 0.2)} />
        <path d={`M${13 + i * 16} 101 L${13 + i * 16} 88`} stroke={pal.ink} strokeWidth={0.5} /><path d={`M${8 + i * 16} 89 L${18 + i * 16} 89 L${17.4 + i * 16} 97 L${8.6 + i * 16} 97Z`} fill={lerpHex(pal.wallLit, pal.rock, 0.4)} />
        {[0, 1, 2].map((k) => <path key={k} d={`M${9 + i * 16 + k * 3} 100.6 l1.2 -1 l1.2 1 l-1.2 1Z`} fill={pal.accent} />)}
      </g>)}
      {em > 0 && [...Array(5)].map((_, i) => { const gx = 4 + i * 7 + Math.sin(t * 0.04 + i) * 4, gy = 94 - i * 2 + Math.sin(t * 0.09 + i * 2) * 1.5, f = Math.sin(t * 0.4 + i) * 0.8; return <path key={`g${i}`} d={`M${gx - 1.8} ${gy - f} Q${gx - 0.8} ${gy - 1} ${gx} ${gy} Q${gx + 0.8} ${gy - 1} ${gx + 1.8} ${gy - f}`} stroke={pal.wallLit} strokeWidth={0.45} fill="none" opacity={em} />; })}
      {/* fuego */}
      {bu > 0 && <g>
        <ellipse cx={72} cy={78} rx={40} ry={22} fill={`url(#${id}f)`} opacity={0.7 * bu * (0.8 + 0.2 * flick)} />
        {[...Array(9)].map((_, i) => { const fx = 48 + i * 6 + hash(i) * 3, fy = 80 - Math.abs(i - 4) * 1.2, k = seg(bu, i * 0.06, i * 0.06 + 0.4), h = (5 + hash(i * 2) * 6) * k * (0.8 + 0.3 * Math.sin(t * 0.5 + i));
          return <path key={`f${i}`} d={`M${fx - 2} ${fy} Q${fx - 1.5} ${fy - h * 0.6} ${fx + Math.sin(t * 0.3 + i)} ${fy - h} Q${fx + 1.5} ${fy - h * 0.6} ${fx + 2} ${fy}Z`} fill={i % 2 ? pal.rim : pal.glow} opacity={0.95} />; })}
        <rect x={-2} y={86} width={104} height={26} fill={pal.accent} opacity={0.15 * bu} />
      </g>}
      {/* tierra oscura (franja de subtítulos) */}
      <rect x={-2} y={112} width={104} height={68} fill={lerpHex(pal.rock, pal.ink, 0.6)} />
      <g transform="translate(0 112)"><Grain n={120} w={100} h={66} seed={seed * 5 + 9} a={pal.rock} b={pal.ink} rMax={0.8} /></g>
      <path d="M-2 112 L102 112" stroke={pal.rim} strokeWidth={0.5} opacity={0.4} />
    </g>
  );
};
