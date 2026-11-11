// cabeza_pompeyo · La corte de Ptolomeo XIII (el rey niño con diadema y su ministro Potino) le ofrece a Julio César una bandeja tapada con un paño: la cabeza de Pompeyo.
// `offer` Potino alza el paño y aparece la cabeza de Pompeyo, pálida y con los ojos cerrados (se queda); `recoil` César aparta la cara y se tapa los ojos (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { Cesar, Diadema, gold } from "./ptolomeos";

export const CabezaPompeyo: AssetFC = ({ pal, p, t }) => {
  const of = p.offer ?? 0, rc = p.recoil ?? 0;
  const robe = lerpHex(pal.accent, pal.ink, 0.3), dead = { ...pal, skin: lerpHex(pal.skin, pal.wall, 0.55) };
  const lift = clamp01(of * 1.4), tx = 46, ty = 44;
  return (
    <g>
      <ellipse cx={50} cy={72} rx={46} ry={3} fill={pal.ink} opacity={0.35} />
      {/* el rey niño */}
      <g transform="translate(13 72) scale(0.78)">
        <path d="M-6 -36 Q0 -38 6 -36 L8 0 L-8 0Z" fill={lerpHex(pal.wallLit, pal.glow, 0.2)} />
        <path d="M-6 -36 Q0 -38 6 -36" stroke={gold(pal)} strokeWidth={2} fill="none" />
        <rect x={-1.4} y={-40} width={2.8} height={4} fill={pal.skin} />
        <Cabeza cx={0} cy={-45} r={5} pal={pal} turn={0.6} curls hair={lerpHex(pal.ink, pal.rock, 0.3)} mouth={0} />
        <path d="M-2 -40 Q1 -38 3 -40" stroke={pal.ink} strokeWidth={0.5} fill="none" />
        <Diadema cx={0} cy={-49} r={5} pal={pal} />
      </g>
      {/* Potino con la bandeja */}
      <g transform="translate(30 72)">
        <path d="M-8 -42 Q0 -44 8 -42 L10 0 L-10 0Z" fill={robe} />
        <path d="M-9 -2 L9 -2" stroke={gold(pal)} strokeWidth={1} />
        <rect x={-1.6} y={-47} width={3.2} height={5} fill={pal.skin} />
        <Cabeza cx={0} cy={-52} r={5.2} pal={pal} turn={0.7} bald curls={false} hair={lerpHex(pal.ink, pal.rock, 0.3)} />
        <path d={`M5 -40 Q12 -36 ${tx - 30 - 4} ${ty - 72}`} stroke={pal.skin} strokeWidth={2.3} fill="none" strokeLinecap="round" />
      </g>
      {/* bandeja y cabeza */}
      <ellipse cx={tx} cy={ty + 1} rx={10} ry={2} fill={gold(pal)} /><ellipse cx={tx} cy={ty + 1.6} rx={10} ry={1.4} fill={lerpHex(pal.rim, pal.ink, 0.35)} />
      <g opacity={clamp01(of * 3)}>
        <Cabeza cx={tx} cy={ty - 4.5} r={5} pal={dead} turn={0.3} eyesClosed={1} curls hair={lerpHex(pal.wallLit, pal.rock, 0.55)} />
        <path d={`M${tx - 4} ${ty - 0.4} Q${tx} ${ty + 0.8} ${tx + 4} ${ty - 0.4}`} stroke={lerpHex(pal.accent, pal.ink, 0.4)} strokeWidth={0.8} fill="none" />
      </g>
      <g transform={`translate(${tx + lerp(0, -12, lift)} ${ty + lerp(0, -16, lift)}) rotate(${lerp(0, -38, lift)})`}>
        <path d={`M-11 1 Q-12 -8 -6 -11 Q0 -13 6 -11 Q12 -8 11 1 Q${lerp(0, 4, lift)} ${lerp(2, -2, lift)} -11 1Z`} fill={lerpHex(pal.wallLit, pal.accent, 0.25)} />
        <path d="M-8 -8 Q0 -11 8 -8" stroke={lerpHex(pal.wallLit, pal.ink, 0.25)} strokeWidth={0.4} fill="none" />
        <path d="M-11 1 Q0 3 11 1" stroke={gold(pal)} strokeWidth={0.7} fill="none" />
      </g>
      <Cesar x={78} y={72} s={1.08} pal={pal} t={t} turn={-0.4} recoil={rc} />
    </g>
  );
};
