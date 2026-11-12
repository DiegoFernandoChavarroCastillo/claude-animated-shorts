// bokeh · capa de ambiente: discos de luz desenfocados y grandes que flotan delante o detrás de la escena (luces de fiesta, noche de ciudad). `opts.n` (14),
// `opts.colores` true = de varios colores (guirnalda); si no, del color de la luz.
import React from "react";
import { type AssetFC, hash, opt } from "./common";

export const Bokeh: AssetFC = ({ pal, t, seed, opts }) => {
  const n = opt(opts, "n", 14), multi = opt(opts, "colores", false), cols = [pal.glow, pal.accent, pal.rim, "#7AD0FF", "#9CFF9A"];
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {[...Array(n)].map((_, i) => {
        const r = 2 + 5 * hash(i * 2.9 + seed), c = multi ? cols[i % cols.length] : pal.glow, id = `bk${seed}_${i}`;
        const x = hash(i * 1.1 + seed) * 100 + Math.sin(t * 0.011 + i) * 3, y = hash(i * 4.3 + seed + 3) * 178 + Math.cos(t * 0.009 + i * 2) * 3;
        return <g key={i} opacity={0.16 + 0.2 * Math.abs(Math.sin(t * 0.02 + i * 1.3))}><defs><radialGradient id={id}><stop offset="0.5" stopColor={c} stopOpacity={0.9} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} /></g>;
      })}
    </g>
  );
};
