// definicion · una estela de mármol con la definición de Platón grabada: «EL HOMBRE: ANIMAL BÍPEDO, SIN PLUMAS». `add` talla debajo, letra a letra
// y con chispas de cincel, una línea nueva en dorado: «DE UÑAS ANCHAS» (la definición corregida; se queda).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Definicion: AssetFC = ({ pal, p, t, seed }) => {
  const id = `df${seed}`, ad = p.add ?? 0, marble = lerpHex(pal.wallLit, pal.wall, 0.18), marbleD = lerpHex(marble, pal.ink, 0.4), cut = lerpHex(marble, pal.ink, 0.7);
  const w = clamp01(ad * 1.15), gold = lerpHex(pal.rim, pal.accent, 0.1), cx = 14 + w * 72;
  const line = (y: number, s: string, size = 7.2) => <text x={50} y={y} fontSize={size} fontFamily="Georgia, serif" fontWeight={700} textAnchor="middle" letterSpacing={0.6} fill={cut}>{s}</text>;
  return (
    <g>
      <defs><clipPath id={`${id}c`}><rect x={0} y={52} width={14 + w * 74} height={14} /></clipPath></defs>
      <ellipse cx={50} cy={79} rx={40} ry={2} fill={pal.ink} opacity={0.4} />
      <rect x={14} y={72} width={72} height={7} fill={marbleD} /><rect x={10} y={76} width={80} height={3} fill={lerpHex(marbleD, pal.ink, 0.3)} />
      <path d="M8 6 L92 6 L90 72 L10 72Z" fill={marble} />
      <path d="M4 6 L50 -1 L96 6Z" fill={lerpHex(marble, pal.wallLit, 0.3)} /><path d="M4 6 L96 6" stroke={marbleD} strokeWidth={1} />
      <path d="M86 6 L92 6 L90 72 L85 72Z" fill={marbleD} opacity={0.5} />
      <g transform="translate(10 6)"><Grain n={120} w={80} h={66} seed={seed * 3 + 11} a={lerpHex(marble, pal.ink, 0.15)} b={pal.wallLit} rMax={0.6} /></g>
      {line(19, "EL HOMBRE:", 6)}
      {line(31, "ANIMAL BÍPEDO")}
      {line(43, "SIN PLUMAS")}
      {/* la corrección, tallada en dorado */}
      <g clipPath={`url(#${id}c)`}>
        <text x={50} y={62} fontSize={7.6} fontFamily="Georgia, serif" fontWeight={700} textAnchor="middle" letterSpacing={0.6} fill={gold} stroke={lerpHex(gold, pal.ink, 0.5)} strokeWidth={0.25}>DE UÑAS ANCHAS</text>
      </g>
      {ad > 0 && ad < 0.9 && <g>
        <path d={`M${cx} 56 L${cx + 5} 48 L${cx + 6.4} 49 L${cx + 1.4} 57Z`} fill={lerpHex(pal.rock, pal.ink, 0.2)} />
        {[...Array(6)].map((_, i) => { const a = -Math.PI * (0.2 + hash(i + Math.floor(t / 3)) * 0.8), r = 2 + hash(i * 3 + Math.floor(t / 2)) * 5; return <circle key={i} cx={cx + Math.cos(a) * r} cy={58 + Math.sin(a) * r} r={0.5} fill={pal.glow} />; })}
      </g>}
    </g>
  );
};
