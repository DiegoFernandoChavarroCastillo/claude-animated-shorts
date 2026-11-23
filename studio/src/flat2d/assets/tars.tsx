// tars · personaje (lienzo 100 × 160, anclaje en los pies): el robot TARS de Interstellar: cuatro losas verticales de metal gris oscuro
// unidas, con una franja de pantalla en la losa izquierda y pequeñas luces. No tiene cara: se mueve abriendo y girando las losas.
// Respira con un leve balanceo. Acciones propias: `talk` la pantalla parpadea con texto que corre (habla, responde); `walk` avanza
// balanceando las losas por pares (muévelo con slide); `unfold` abre las cuatro losas en abanico (se queda): corre, rueda, sorprende.
import React from "react";
import { type AssetFC, clamp01, hash, idle } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, url } from "./shade";

export const Tars: AssetFC = ({ pal, t, seed, p }) => {
  const id = `ta${seed}`, I = idle(t, seed), tk = p.talk ?? 0, talking = tk > 0 && tk < 1, wk = p.walk ?? 0, walking = wk > 0 && wk < 1, uf = clamp01(p.unfold ?? 0);
  const metal = "#6E727A", W = 9.6;
  const slab = (k: number) => {
    const swing = walking ? Math.sin(t * 0.5 + (k % 2) * Math.PI) * 6 : 0, fan = uf * (k - 1.5) * 18 + I.sway * 0.4;
    return (
      <g key={k} transform={`rotate(${swing + fan} ${30 + k * W + W / 2} 50)`}>
        <rect x={30 + k * W} y={10} width={W - 0.5} height={142} fill={url(`${id}m`)} />
        <rect x={30 + k * W} y={10} width={W - 0.5} height={142} fill="none" stroke={lerpHex(metal, pal.ink, 0.5)} strokeWidth={0.4} />
        {[40, 75, 110].map((y) => <line key={y} x1={30 + k * W + 1} y1={y} x2={30 + (k + 1) * W - 1.5} y2={y} stroke={lerpHex(metal, pal.ink, 0.45)} strokeWidth={0.5} />)}
        <path d={`M${30 + (k + 1) * W - 0.8} 11 L${30 + (k + 1) * W - 0.8} 151`} stroke={pal.rim} strokeWidth={0.6} opacity={0.5} />
      </g>
    );
  };
  return (
    <g>
      <defs><linearGradient id={`${id}m`} x1="0" x2="1"><stop offset="0" stopColor={lerpHex(metal, "#ffffff", 0.18)} /><stop offset="1" stopColor={lerpHex(metal, pal.ink, 0.4)} /></linearGradient></defs>
      <ContactShadow id={`${id}s`} cx={50} cy={153} rx={26} />
      <g transform={`translate(0 ${I.breath * 0.3})`}>
        {[0, 1, 2, 3].map(slab)}
        {/* pantalla */}
        <rect x={31.5} y={22} width={6.4} height={13} fill="#0C1418" />
        {[...Array(5)].map((_, i) => <rect key={i} x={32.3} y={23.2 + i * 2.4} width={talking ? 1.5 + hash(Math.floor(t / 3) + i) * 3.5 : 3} height={0.9} fill="#B8FFE8" opacity={talking ? 0.9 : 0.35} />)}
        <circle cx={34.6} cy={44} r={0.7} fill="#FF5A4A" opacity={0.5 + 0.5 * Math.sin(t * 0.15)} />
      </g>
    </g>
  );
};
