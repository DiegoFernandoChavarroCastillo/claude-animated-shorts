// medalla · prop: una medalla con su cinta, que gira despacio sobre sí misma. opts.metal "plata" | "oro" | "nobel" (oro con perfil en
// relieve, laurel y la palabra NOBEL). Lienzo 100 × 140 (cinta arriba, disco abajo), anclaje en el centro. Acciones propias: `gold`
// la plata se vuelve oro con un destello (se queda): gana el oro; `shine` un brillo recorre el disco y queda un halo (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const Medalla: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `md${seed}`, metal = String(opt(opts, "metal", "oro")), nobel = metal === "nobel";
  const g = metal === "plata" ? clamp01(p.gold ?? 0) : 1, sh = clamp01(p.shine ?? 0);
  const c = lerpHex("#C8CDD6", "#F2BE3C", g), rib = nobel ? "#1E3C8C" : lerpHex("#3A6AD8", "#D8262C", 0);
  const spin = Math.cos(t * 0.035 + seed), sx = 0.55 + 0.45 * Math.abs(spin), flash = g > 0 && g < 1 ? Math.sin(g * Math.PI) : 0;
  const sweep = lerp(-40, 140, ((t % 120) / 120));
  return (
    <g>
      <Vol id={`${id}m`} c={c} pal={pal} k={1.2} lx={0.35} ly={0.3} /><Grad id={`${id}r`} a={lite(rib, pal, 0.15)} b={dark(rib, pal, 0.35)} h />
      <Grad id={`${id}w`} a="#ffffff00" mid="#ffffffbb" b="#ffffff00" h />
      <Halo id={`${id}h`} cx={50} cy={92} r={46 + flash * 20} color={pal.glow} a={0.25 + 0.4 * Math.max(flash, sh)} />
      {/* cinta en V */}
      <path d="M26 0 L46 0 L58 64 L44 70 Z" fill={url(`${id}r`)} /><path d="M74 0 L54 0 L42 64 L56 70 Z" fill={url(`${id}r`)} />
      <path d="M33 0 L37 0 L50 66 L47 66 Z" fill={nobel ? "#F2BE3C" : "#ffffff"} opacity={0.75} />
      <path d="M67 0 L63 0 L50 66 L53 66 Z" fill={nobel ? "#F2BE3C" : "#ffffff"} opacity={0.75} />
      <rect x={42} y={62} width={16} height={8} rx={2} fill={dark(c, pal, 0.2)} />
      {/* disco que gira (escala horizontal) */}
      <g transform={`translate(50 100) scale(${sx} 1) translate(-50 -100)`}>
        <circle cx={50} cy={100} r={33} fill={dark(c, pal, 0.35)} />
        <circle cx={50} cy={100} r={31} fill={url(`${id}m`)} />
        <circle cx={50} cy={100} r={25} fill="none" stroke={dark(c, pal, 0.25)} strokeWidth={1.2} />
        {spin > 0 ? (
          nobel ? (
            <g>
              <path d="M44 86 q8 -4 12 4 q2 6 -1 10 l3 4 l-3 1 q0 5 -5 6 l-6 0 q-4 -6 -3 -14 q0 -8 3 -11 Z" fill={dark(c, pal, 0.2)} />
              <text x={50} y={122} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={6.4} fill={dark(c, pal, 0.45)} letterSpacing={1}>NOBEL</text>
            </g>
          ) : (
            <g>
              <path d="M50 82 l4.4 9 l9.8 1.4 l-7.1 6.9 l1.7 9.8 l-8.8 -4.6 l-8.8 4.6 l1.7 -9.8 l-7.1 -6.9 l9.8 -1.4 Z" fill={dark(c, pal, 0.18)} />
              <text x={50} y={121} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={6} fill={dark(c, pal, 0.45)}>{g > 0.5 ? "ORO" : "PLATA"}</text>
            </g>
          )
        ) : (
          <g>{[...Array(9)].map((_, i) => <path key={i} d={`M${30 + i * 0.6} ${86 + i * 3.4} q-4 -2 -3 -6`} stroke={dark(c, pal, 0.3)} strokeWidth={1.2} fill="none" />)}
            {[...Array(9)].map((_, i) => <path key={i} d={`M${70 - i * 0.6} ${86 + i * 3.4} q4 -2 3 -6`} stroke={dark(c, pal, 0.3)} strokeWidth={1.2} fill="none" />)}</g>
        )}
        <circle cx={50} cy={100} r={31} fill="none" stroke={pal.rim} strokeWidth={0.7} strokeOpacity={0.5} />
        <clipPath id={`${id}c`}><circle cx={50} cy={100} r={31} /></clipPath>
        <rect x={sweep - 6} y={60} width={12} height={80} fill={url(`${id}w`)} transform={`rotate(25 ${sweep} 100)`} clipPath={`url(#${id}c)`} opacity={0.7} />
      </g>
      {flash > 0 && <circle cx={50} cy={100} r={36 + flash * 14} fill="none" stroke={pal.glow} strokeWidth={2} opacity={flash} />}
    </g>
  );
};
