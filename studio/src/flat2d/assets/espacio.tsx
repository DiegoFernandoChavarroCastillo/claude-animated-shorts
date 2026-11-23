// espacio · fondo apaisado (100 × 60, videos largos 16:9): el espacio profundo con una nebulosa de color en bandas difusas, una galaxia
// lejana en espiral y estrellas de tres tamaños que titilan. opts.nebula "#7A4ADF" (color de la nebulosa), opts.galaxia true,
// opts.densidad (1). Para cualquier plano en el espacio: viajes, naves, planetas, agujeros negros.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo, url } from "./shade";

export const Espacio: AssetFC = ({ pal, t, seed, opts }) => {
  const id = `es${seed}`, neb = opt(opts, "nebula", "#6A4ADF"), gal = opt(opts, "galaxia", true), den = opt(opts, "densidad", 1);
  const n = Math.round(150 * den);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}bg`} cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor={lerpHex(pal.bg, neb, 0.18)} /><stop offset="1" stopColor={pal.ink} /></radialGradient>
        <filter id={`${id}bl`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id={`${id}bs`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.8" /></filter>
      </defs>
      <rect x={-20} y={-20} width={140} height={100} fill={url(`${id}bg`)} />
      {/* nebulosa: manchas grandes y difusas que derivan muy despacio */}
      <g filter={`url(#${id}bl)`} style={{ mixBlendMode: "screen" }}>
        {[...Array(7)].map((_, i) => {
          const x = 10 + hash(seed + i * 3.1) * 80 + Math.sin(t * 0.004 + i) * 2, y = 12 + hash(seed + i * 7.7) * 36, r = 10 + hash(i + seed * 2) * 14;
          const c = i % 3 === 0 ? lerpHex(neb, "#FF7A9A", 0.4) : i % 3 === 1 ? neb : lerpHex(neb, "#4AB8FF", 0.5);
          return <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r * 0.7} fill={c} opacity={0.18 + hash(i + 9) * 0.14} transform={`rotate(${-20 + hash(i) * 40} ${x} ${y})`} />;
        })}
      </g>
      {/* galaxia lejana en espiral */}
      {gal ? (
        <g transform={`translate(78 16) rotate(${-25 + t * 0.01}) scale(1 0.42)`} style={{ mixBlendMode: "screen" }}>
          <g filter={`url(#${id}bs)`}>
            {[...Array(60)].map((_, i) => { const a = i * 0.33, r = 0.4 + i * 0.13; return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={0.55} fill="#CFE0FF" opacity={0.5 - i * 0.006} />; })}
            {[...Array(60)].map((_, i) => { const a = i * 0.33 + Math.PI, r = 0.4 + i * 0.13; return <circle key={`b${i}`} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={0.55} fill="#FFD8F0" opacity={0.5 - i * 0.006} />; })}
          </g>
          <circle r={1.4} fill="#FFF6E0" />
        </g>
      ) : null}
      {/* estrellas */}
      {[...Array(n)].map((_, i) => {
        const x = -10 + hash(seed * 1.7 + i * 2.31) * 120, y = -8 + hash(seed + i * 5.17) * 76, big = hash(i * 3.3) > 0.94, mid = hash(i * 4.1) > 0.75;
        const tw = 0.55 + 0.45 * Math.sin(t * (0.05 + hash(i) * 0.08) + i);
        return <circle key={i} cx={x} cy={y} r={big ? 0.36 : mid ? 0.2 : 0.11} fill={hash(i * 9.1) > 0.8 ? "#FFE6C8" : hash(i * 7.3) > 0.7 ? "#C8DCFF" : "#FFFFFF"} opacity={(big ? 1 : 0.75) * tw} />;
      })}
      {[...Array(4)].map((_, i) => { const x = 8 + hash(seed + i * 13) * 84, y = 6 + hash(seed + i * 17) * 46; return <Halo key={i} id={`${id}h${i}`} cx={x} cy={y} r={2.4} color="#DDE8FF" a={0.5 + 0.2 * Math.sin(t * 0.07 + i)} />; })}
    </g>
  );
};
