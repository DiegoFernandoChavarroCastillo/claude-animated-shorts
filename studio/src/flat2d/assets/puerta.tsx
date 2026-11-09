// puerta · la puerta doble de madera de la Academia en su marco de mármol, con clavos y aldabas de bronce. `burst` la abre de golpe: las hojas
// se estampan contra el marco y rebotan, entra la luz de la calle en haces y flota el polvo (se queda abierta).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";

export const Puerta: AssetFC = ({ pal, p, t, seed }) => {
  const id = `pu${seed}`, b = p.burst ?? 0, wood = lerpHex(pal.rock, pal.ink, 0.15), woodD = lerpHex(wood, pal.ink, 0.45), bronze = lerpHex(pal.rim, pal.rock, 0.5);
  const marble = lerpHex(pal.wallLit, pal.wall, 0.3), marbleD = lerpHex(marble, pal.ink, 0.45);
  // apertura con rebote: 0 cerrada → 1 abierta (plano de la hoja casi de canto)
  const u = clamp01(b * 2.2), open = b <= 0 ? 0 : Math.min(1, u * u * 1.15) - (b > 0.45 && b < 0.9 ? Math.sin(((b - 0.45) / 0.45) * Math.PI) * 0.12 : 0);
  const light = clamp01(b * 3);
  const leaf = (side: -1 | 1) => {
    const hx = side < 0 ? 18 : 82, w = 32 * (1 - 0.82 * open), x = side < 0 ? hx : hx - w;
    return (
      <g key={side}>
        <rect x={x} y={26} width={w} height={102} fill={wood} />
        {[0.25, 0.5, 0.75].map((k) => <path key={k} d={`M${x + w * k} 26 L${x + w * k} 128`} stroke={woodD} strokeWidth={0.6} />)}
        <rect x={x + w * 0.12} y={36} width={w * 0.76} height={36} fill="none" stroke={woodD} strokeWidth={1} /><rect x={x + w * 0.12} y={80} width={w * 0.76} height={40} fill="none" stroke={woodD} strokeWidth={1} />
        {[...Array(4)].map((_, i) => <circle key={i} cx={x + w * (0.2 + i * 0.2)} cy={30} r={0.9} fill={bronze} />)}
        {open < 0.6 && <g><circle cx={side < 0 ? x + w - 5 : x + 5} cy={76} r={3} fill="none" stroke={bronze} strokeWidth={1.1} /><circle cx={side < 0 ? x + w - 5 : x + 5} cy={73} r={1.2} fill={bronze} /></g>}
      </g>
    );
  };
  return (
    <g>
      <defs><linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.glow} /><stop offset="1" stopColor={lerpHex(pal.rim, pal.wallLit, 0.4)} /></linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.glow} stopOpacity={0.5} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></linearGradient></defs>
      {/* hueco: oscuro → calle iluminada */}
      <rect x={18} y={26} width={64} height={102} fill={lerpHex(pal.ink, pal.wall, 0.15)} />
      <rect x={18} y={26} width={64} height={102} fill={`url(#${id}l)`} opacity={light} />
      {light > 0 && <path d="M18 128 L82 128 L70 108 Q50 104 30 108Z" fill={lerpHex(pal.rock, pal.wallLit, 0.4)} opacity={light * 0.7} />}
      {leaf(-1)}{leaf(1)}
      {/* marco de mármol */}
      <rect x={10} y={20} width={8} height={110} fill={marble} /><rect x={82} y={20} width={8} height={110} fill={marble} />
      <rect x={15.6} y={20} width={2.4} height={110} fill={marbleD} /><rect x={82} y={20} width={2.4} height={110} fill={marbleD} opacity={0.6} />
      <rect x={6} y={12} width={88} height={9} fill={marble} /><rect x={6} y={19} width={88} height={2} fill={marbleD} />
      {[...Array(11)].map((_, i) => <path key={i} d={`M${10 + i * 7.6} 18 L${10 + i * 7.6} 14.4 L${14.6 + i * 7.6} 14.4 L${14.6 + i * 7.6} 17 L${12.4 + i * 7.6} 17`} stroke={lerpHex(pal.accent, pal.ink, 0.2)} strokeWidth={0.6} fill="none" />)}
      {/* haces de luz y polvo que entran */}
      {light > 0 && <g opacity={light * (0.85 + 0.15 * Math.sin(t * 0.2))}>
        {[[-30, 0.5], [-8, 0.7], [16, 0.45], [36, 0.6]].map(([dx, o], i) => <path key={i} d={`M${30 + i * 13} 30 L${42 + i * 13} 30 L${52 + dx + i * 8} 130 L${34 + dx + i * 8} 130Z`} fill={`url(#${id}r)`} opacity={o} />)}
        {[...Array(18)].map((_, i) => <circle key={`d${i}`} cx={20 + hash(i + seed) * 60 + Math.sin(t * 0.04 + i) * 3} cy={40 + ((hash(i * 3) * 90 + t * 0.15 * (1 + hash(i))) % 88)} r={0.4 + hash(i + 7) * 0.6} fill={pal.glow} opacity={0.6} />)}
      </g>}
      <ellipse cx={50} cy={129} rx={44} ry={1.6} fill={pal.ink} opacity={0.4} />
    </g>
  );
};
