// hitita · Un mensajero hitita (gorro picudo, trenza, túnica corta, botas de punta curva) ante la mesa de tablillas y el escriba sentado: exige, los hititas, el mensajero.
// `slam` alza el puño y golpea la mesa; saltan las tablillas (se queda).
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { seg, Escriba } from "./bronce";

export const Hitita: AssetFC = ({ pal, p, t }) => {
  const sl = p.slam ?? 0, up = seg(sl, 0, 0.45), down = seg(sl, 0.45, 0.6), jump = down > 0 ? Math.sin(seg(sl, 0.6, 0.85) * Math.PI) * 3 : 0;
  const fy = lerp(lerp(-34, -58, up), -30, down), fx = lerp(lerp(-10, -6, up), -14, down);
  const tunic = lerpHex(pal.accent, pal.rock, 0.45), wood = lerpHex(pal.rock, pal.ink, 0.25);
  return (
    <g>
      <Escriba x={22} y={75} s={1.15} pal={pal} t={t} turn={0.8} shake={down} />
      <rect x={32} y={58} width={30} height={3} fill={wood} /><path d="M35 61 L35 75 M59 61 L59 75" stroke={wood} strokeWidth={1.6} />
      {[0, 1, 2].map((i) => <rect key={i} x={36 + i * 8} y={53.6 - jump * (1 + i * 0.3)} width={6} height={4.4} rx={1} fill={lerpHex(pal.rock, pal.rim, 0.35)} transform={`rotate(${jump * (i - 1) * 4} ${39 + i * 8} 56)`} />)}
      <g transform="translate(76 75)">
        <path d="M-4 0 L-4 -14 M4 0 L4 -14" stroke={lerpHex(pal.skin, pal.ink, 0.3)} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M-6 0 L-1 0 L-2 -2.5 L-6 -2.5 Q-8 -2 -8 -3.5Z M2 0 L7 0 Q6 -2 7.5 -3.5 L3 -2.5Z" fill={lerpHex(pal.rock, pal.ink, 0.4)} />
        <path d="M-7 -12 L-6 -40 L6 -40 L7 -12Z" fill={tunic} /><path d="M-6.5 -26 L6.5 -26" stroke={pal.rim} strokeWidth={1.1} />
        <path d="M5 -26 L10 -18" stroke={lerpHex(pal.rim, pal.rock, 0.3)} strokeWidth={1} />
        <path d="M6 -39 Q11 -30 8 -22" stroke={pal.skin} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d={`M-6 -39 Q${(fx - 6) / 2} ${(fy - 39) / 2 - 2} ${fx} ${fy}`} stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <circle cx={fx} cy={fy} r={2} fill={pal.skin} />
        <rect x={-1.4} y={-44} width={2.8} height={4} fill={pal.skin} />
        <path d="M3 -50 Q8 -42 6 -34" stroke={lerpHex(pal.ink, pal.rock, 0.2)} strokeWidth={1.6} fill="none" />
        <Cabeza cx={0} cy={-48} r={4.6} pal={pal} turn={-0.8} curls={false} mouth={sl > 0.4 ? 0.6 : 0} hair={lerpHex(pal.ink, pal.rock, 0.2)} />
        <path d="M-4.4 -50 Q-2 -60 1 -64 Q4 -58 4.4 -50Z" fill={lerpHex(pal.wall, pal.ink, 0.2)} /><path d="M-4.6 -50.5 L4.6 -50.5" stroke={pal.rim} strokeWidth={0.8} />
      </g>
      {down > 0.5 && sl < 0.9 && [...Array(6)].map((_, i) => <path key={i} d={`M${46 + Math.cos(i) * 4} ${57 + Math.sin(i) * 2} l${Math.cos(i) * 4} ${-2 - hash(i) * 3}`} stroke={pal.wallLit} strokeWidth={0.5} />)}
      <ellipse cx={50} cy={75.5} rx={48} ry={1.6} fill={pal.ink} opacity={0.4} />
    </g>
  );
};
