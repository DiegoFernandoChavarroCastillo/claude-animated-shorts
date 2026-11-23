// gargantua · escenario (lienzo 100 × 60, anclaje en el centro): el agujero negro de Interstellar tal como lo calculó Kip Thorne: la
// sombra negra, el anillo de fotones, el disco de acreción incandescente que lo cruza de lado a lado y el mismo disco curvado por la
// gravedad por encima y por debajo de la sombra (lente gravitacional). El gas fluye sin parar. opts.brillo (1).
// Acción propia: `pulse` el disco se aviva y el halo crece (se queda): el horizonte, la caída, la honda gravitacional.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { url } from "./shade";

export const Gargantua: AssetFC = ({ t, seed, opts, p }) => {
  const id = `ga${seed}`, br = opt(opts, "brillo", 1) * (1 + 0.35 * clamp01(p.pulse ?? 0)), R = 9;
  const hot = "#FFF2D6", warm = "#FFC46A", deep = "#E0762A";
  const streaks = (cy: number, rx: number, ry: number, k: number) => [...Array(22)].map((_, i) => {
    const ph = (t * 0.012 * (1 + (i % 3) * 0.3) + hash(seed + i * k) * 6.28) % 6.28;
    const a0 = ph, a1 = ph + 0.5 + hash(i * 2.1) * 0.6;
    const x0 = Math.cos(a0) * rx, y0 = cy + Math.sin(a0) * ry, x1 = Math.cos(a1) * rx, y1 = cy + Math.sin(a1) * ry;
    return <path key={i} d={`M${x0} ${y0} A${rx} ${ry} 0 0 1 ${x1} ${y1}`} stroke={i % 4 ? warm : hot} strokeWidth={0.35 + hash(i) * 0.4} fill="none" opacity={0.55 * br} />;
  });
  return (
    <g transform="translate(50 30)">
      <defs>
        <radialGradient id={`${id}glow`}><stop offset="0.12" stopColor={warm} stopOpacity={0.55 * br} /><stop offset="0.4" stopColor={deep} stopOpacity={0.22 * br} /><stop offset="1" stopColor={deep} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}disc`} x1="0" x2="1"><stop offset="0" stopColor={deep} stopOpacity={0} /><stop offset="0.18" stopColor={warm} /><stop offset="0.5" stopColor={hot} /><stop offset="0.82" stopColor={warm} /><stop offset="1" stopColor={deep} stopOpacity={0} /></linearGradient>
        <linearGradient id={`${id}arc`} x1="0" x2="1"><stop offset="0" stopColor={warm} stopOpacity={0.3} /><stop offset="0.5" stopColor={hot} /><stop offset="1" stopColor={warm} stopOpacity={0.3} /></linearGradient>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.9" /></filter>
        <filter id={`${id}b2`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" /></filter>
      </defs>
      <ellipse rx={58} ry={30} fill={url(`${id}glow`)} style={{ mixBlendMode: "screen" }} />
      {/* disco curvado por encima de la sombra (la parte de atrás del disco, vista por la lente) */}
      <g filter={`url(#${id}b)`} style={{ mixBlendMode: "screen" }}>
        <path d={`M${-R * 1.9} 0 A${R * 1.9} ${R * 1.6} 0 0 1 ${R * 1.9} 0 L${R * 1.45} 0 A${R * 1.45} ${R * 1.25} 0 0 0 ${-R * 1.45} 0 Z`} fill={url(`${id}arc`)} opacity={0.95 * br} />
        <path d={`M${-R * 1.5} 0.6 A${R * 1.5} ${R * 1.35} 0 0 0 ${R * 1.5} 0.6 L${R * 1.25} 0.6 A${R * 1.25} ${R * 1.1} 0 0 1 ${-R * 1.25} 0.6 Z`} fill={url(`${id}arc`)} opacity={0.6 * br} />
      </g>
      {/* sombra y anillo de fotones */}
      <circle r={R * 1.06} fill="none" stroke={hot} strokeWidth={0.5} opacity={0.9 * br} filter={`url(#${id}b)`} />
      <circle r={R} fill="#000" />
      {/* disco de acreción que cruza por delante */}
      <g style={{ mixBlendMode: "screen" }}>
        <ellipse rx={46} ry={2.2} fill={url(`${id}disc`)} opacity={0.5 * br} filter={`url(#${id}b2)`} />
        <ellipse rx={40} ry={1.1} fill={url(`${id}disc`)} opacity={br} filter={`url(#${id}b)`} />
        <g filter={`url(#${id}b)`}>{streaks(0, 34, 1.4, 1.3)}</g>
      </g>
      <rect x={-R * 0.98} y={-0.4} width={R * 1.96} height={0.8} fill={hot} opacity={0.9 * br} />
    </g>
  );
};
