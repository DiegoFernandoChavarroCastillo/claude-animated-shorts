// insomnio · tu cuarto de noche: tú en la cama boca arriba, con los ojos abiertos mirando al techo; mesita con el móvil encendido y un reloj digital
// que marca las 3:47; ventana con la luna. `toss` te das la vuelta en la cama, inquieto (vuelve); `thoughts` sobre tu cabeza crece una maraña oscura
// de pensamientos con un rayo (se queda).
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { Grain } from "./grain";

export const Insomnio: AssetFC = ({ pal, p, t, seed }) => {
  const ts = Math.sin(clamp01(p.toss ?? 0) * Math.PI), th = p.thoughts ?? 0, id = `in${seed}`;
  const wall = lerpHex(pal.wall, pal.ink, 0.3), blanket = lerpHex(pal.wallLit, pal.wall, 0.35), wood = lerpHex(pal.rock, pal.ink, 0.2);
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.6} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <rect x={-2} y={-2} width={104} height={110} fill={wall} />
      <Grain n={160} w={100} h={106} seed={seed * 3 + 1} a={lerpHex(wall, pal.wallLit, 0.25)} b={pal.ink} rMax={0.7} />
      {/* ventana con luna y cortina */}
      <rect x={10} y={30} width={24} height={30} fill={lerpHex(pal.bg, pal.ink, 0.3)} /><circle cx={24} cy={38} r={3.6} fill={pal.glow} />
      <path d="M22 30 L22 60 M10 45 L34 45" stroke={wall} strokeWidth={1.2} />
      <path d="M8 28 Q12 46 8 62 L4 62 L4 28Z" fill={lerpHex(pal.wall, pal.accent, 0.2)} />
      <path d="M14 60 L40 104 L66 104 L34 60Z" fill={pal.glow} opacity={0.05} />
      {/* suelo */}
      <rect x={-2} y={106} width={104} height={74} fill={lerpHex(pal.rock, pal.ink, 0.4)} />
      {/* cama */}
      <rect x={6} y={70} width={5} height={36} fill={wood} />
      <rect x={8} y={92} width={58} height={8} fill={lerpHex(wood, pal.wallLit, 0.1)} /><path d="M10 100 L10 106 M64 100 L64 106" stroke={wood} strokeWidth={2} />
      <ellipse cx={20} cy={88} rx={9} ry={4.4} fill={lerpHex(pal.wallLit, pal.wall, 0.2)} />
      <g transform={`rotate(${ts * -10} 20 88)`}>
        <g transform="rotate(-90 20 85)"><Cabeza cx={20} cy={85} r={5.4} pal={pal} turn={0} curls={false} hair={lerpHex(pal.rock, pal.ink, 0.5)} /></g>
      </g>
      <path d={`M24 92 Q30 ${80 - ts * 4} 44 ${84 - ts * 3} Q52 ${80 + ts * 3} 60 86 Q64 88 66 92Z`} fill={blanket} />
      {[32, 42, 52].map((x) => <path key={x} d={`M${x} ${86 - ts * 2} Q${x + 3} 89 ${x + 1} 92`} stroke={lerpHex(blanket, pal.ink, 0.35)} strokeWidth={0.6} fill="none" />)}
      <path d="M30 86 Q38 84 40 88" stroke={pal.skin} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* mesita, móvil y reloj */}
      <rect x={68} y={84} width={14} height={22} fill={wood} /><path d="M68 84 L82 84" stroke={pal.rim} strokeWidth={0.4} opacity={0.5} />
      <circle cx={72} cy={82} r={14} fill={`url(#${id}g)`} opacity={0.6 + 0.2 * Math.sin(t * 0.2)} />
      <rect x={69} y={81.6} width={6} height={2.2} rx={0.5} fill={pal.glow} />
      <rect x={75} y={77} width={6} height={5.4} rx={0.6} fill={pal.ink} />
      <text x={78} y={81.4} fontSize={2.8} textAnchor="middle" fontFamily="monospace" fill="#FF5A4A">3:47</text>
      {/* maraña de pensamientos */}
      {th > 0.02 && <g opacity={clamp01(th * 1.6)} transform={`translate(22 66) scale(${0.4 + 0.6 * clamp01(th)})`}>
        {[...Array(9)].map((_, i) => { const a = t * 0.05 + i * 0.7, r = 5 + (i % 4) * 2.2; return <ellipse key={i} cx={Math.cos(a) * 2} cy={-6 + Math.sin(a) * 2} rx={r * 1.4} ry={r * 0.8} transform={`rotate(${i * 40 + t * 0.8} 0 -6)`} stroke={lerpHex(pal.accent, pal.ink, 0.25)} strokeWidth={0.7} fill="none" />; })}
        <path d="M-1 -14 L-4 -6 L0 -6 L-3 2" stroke={pal.glow} strokeWidth={1} fill="none" strokeLinejoin="round" />
      </g>}
    </g>
  );
};
