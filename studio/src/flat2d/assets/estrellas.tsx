// estrellas · capa de ambiente: cielo estrellado que titila, en la mitad superior del cuadro. `opts.n` (70), `opts.hasta` fracción del alto que ocupan (0.6),
// `opts.fugaz` true = cruza una estrella fugaz cada pocos segundos.
import React from "react";
import { type AssetFC, hash, opt } from "./common";

export const Estrellas: AssetFC = ({ pal, t, seed, opts }) => {
  const n = opt(opts, "n", 70), to = opt(opts, "hasta", 0.6) * 178, fugaz = opt(opts, "fugaz", false), u = (t % 150) / 26;
  return (
    <g>
      {[...Array(n)].map((_, i) => {
        const h3 = hash(i * 3.3 + seed + 5), big = h3 > 0.9;
        return <circle key={i} cx={hash(i * 1.3 + seed) * 100} cy={hash(i * 2.7 + seed + 2) ** 1.4 * to} r={big ? 0.55 : 0.16 + 0.3 * h3} fill={big ? pal.glow : pal.wallLit} opacity={0.35 + 0.6 * Math.abs(Math.sin(t * (0.03 + 0.04 * h3) + i))} />;
      })}
      {fugaz && u < 1 ? <path d={`M${20 + u * 40} ${14 + u * 16} l-9 -3.6`} stroke={pal.wallLit} strokeWidth={0.5} strokeLinecap="round" opacity={Math.sin(u * Math.PI)} /> : null}
    </g>
  );
};
