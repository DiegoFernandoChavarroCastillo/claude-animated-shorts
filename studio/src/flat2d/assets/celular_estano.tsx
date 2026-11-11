// celular_estano · Un celular abierto por detrás con la placa, chips y soldaduras plateadas de estaño (lupa con Sn) y un buque portacontenedores detrás: hoy, tu celular, el comercio por mar, la dependencia.
// `glow` brillan las soldaduras y aparece la lupa con Sn (se queda); `sail` el buque portacontenedores cruza (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";

export const CelularEstano: AssetFC = ({ pal, p, t }) => {
  const gl = p.glow ?? 0, sa = p.sail ?? 0, pcb = lerpHex("#1F6B4A", pal.ink, 0.35), solder = lerpHex("#C9D2DA", pal.wallLit, 0.2);
  const bx = lerp(-40, 30, sa) + Math.sin(t * 0.02) * 1;
  const joints = [...Array(22)].map((_, i) => [34 + (i % 6) * 6.2 + (Math.floor(i / 6) % 2) * 2, 22 + Math.floor(i / 6) * 9 + hash(i) * 2]);
  return (
    <g>
      {/* mar y buque */}
      <rect x={-2} y={56} width={104} height={14} fill={lerpHex(pal.wall, pal.ink, 0.3)} />
      <g transform={`translate(${bx} 60)`}>
        <path d="M0 0 L44 0 L40 6 L3 6Z" fill={lerpHex(pal.accent, pal.ink, 0.4)} />
        {[...Array(8)].map((_, i) => [0, 1].map((r) => <rect key={`${i}${r}`} x={4 + i * 4.2} y={-3.4 - r * 3.2} width={4} height={3} fill={[pal.accent, pal.rim, lerpHex(pal.wall, pal.wallLit, 0.4)][(i + r) % 3]} stroke={pal.ink} strokeWidth={0.2} />))}
        <rect x={38} y={-9} width={5} height={9} fill={pal.wallLit} /><rect x={39} y={-7.6} width={3} height={1} fill={pal.ink} />
      </g>
      {[...Array(8)].map((_, i) => <path key={i} d={`M${(hash(i) * 110 + t * 0.1) % 110 - 5} ${64 + (i % 3) * 2} q2 -0.8 4 0`} stroke={lerpHex(pal.wall, pal.wallLit, 0.3)} strokeWidth={0.4} fill="none" />)}
      {/* celular */}
      <rect x={28} y={6} width={44} height={66} rx={6} fill={lerpHex(pal.ink, pal.wall, 0.3)} stroke={lerpHex(pal.wallLit, pal.wall, 0.4)} strokeWidth={0.8} />
      <rect x={31} y={10} width={38} height={44} rx={2} fill={pcb} />
      <rect x={31} y={56} width={38} height={13} rx={2} fill={lerpHex(pal.wall, pal.ink, 0.2)} /><path d="M33 58 L67 58 M33 61 L67 61 M33 64 L67 64" stroke={lerpHex(pal.wall, pal.wallLit, 0.2)} strokeWidth={0.4} />
      {[[36, 14, 10, 8], [50, 16, 8, 8], [58, 32, 8, 10], [36, 36, 12, 6]].map(([x, y, w, h], i) => <g key={`c${i}`}><rect x={x} y={y} width={w} height={h} fill={lerpHex(pal.ink, pal.wall, 0.15)} />{[...Array(Math.floor(w / 2))].map((_, k) => <rect key={k} x={x + 0.6 + k * 2} y={y - 0.8} width={0.8} height={0.8} fill={solder} />)}</g>)}
      {[...Array(7)].map((_, i) => <path key={`l${i}`} d={`M${33 + i * 5} 26 L${33 + i * 5} 32 L${37 + i * 5} 34`} stroke={lerpHex(pcb, "#C9A04A", 0.5)} strokeWidth={0.35} fill="none" />)}
      {joints.map(([x, y], i) => <g key={`j${i}`}><circle cx={x} cy={y} r={0.9} fill={solder} />{gl > 0 && <circle cx={x} cy={y} r={0.9 + 1.4 * gl * (0.6 + 0.4 * Math.sin(t * 0.2 + i))} fill={pal.glow} opacity={0.35 * gl} />}</g>)}
      {/* lupa sobre una soldadura */}
      <g opacity={clamp01(gl * 2)}>
        <circle cx={80} cy={22} r={11} fill={pcb} stroke={pal.wallLit} strokeWidth={1.2} />
        <path d="M74 25 Q80 15 86 25Z" fill={solder} /><path d="M76 23 Q80 18 83 22" stroke="#FFFFFF" strokeWidth={0.6} fill="none" opacity={0.8} />
        <rect x={72} y={25} width={16} height={2} fill={lerpHex("#C9A04A", pcb, 0.2)} />
        <text x={80} y={31} textAnchor="middle" fontFamily="Georgia, serif" fontSize={3.4} fontWeight="bold" fill={pal.wallLit}>Sn</text>
        <path d="M58 30 L70 24" stroke={pal.wallLit} strokeWidth={0.5} strokeDasharray="1 0.8" />
        <path d="M88 30 L94 36" stroke={pal.wallLit} strokeWidth={2.2} strokeLinecap="round" />
      </g>
    </g>
  );
};
