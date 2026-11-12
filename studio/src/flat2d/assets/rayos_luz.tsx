// rayos_luz · capa de ambiente: haces de luz anchos que bajan en diagonal desde arriba y respiran despacio (bajo el agua, por una ventana, entre nubes).
// `opts.n` número de haces (6), `opts.desde` "arriba" | "izquierda" | "derecha", `opts.a` intensidad (0.22).
import React from "react";
import { type AssetFC, hash, opt } from "./common";

export const RayosLuz: AssetFC = ({ pal, t, seed, opts }) => {
  const n = opt(opts, "n", 6), from = opt(opts, "desde", "arriba"), a = opt(opts, "a", 0.22), id = `ry${seed}`;
  const lean = from === "izquierda" ? 26 : from === "derecha" ? -26 : 8;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.glow} stopOpacity={1} /><stop offset="0.7" stopColor={pal.glow} stopOpacity={0.25} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></linearGradient></defs>
      {[...Array(n)].map((_, i) => {
        const x = (i + 0.5) * (120 / n) - 10 + (hash(i + seed) - 0.5) * 8, w = 5 + 9 * hash(i * 2.3 + seed), o = a * (0.55 + 0.45 * Math.sin(t * 0.03 + i * 1.7));
        return <polygon key={i} points={`${x},-10 ${x + w},-10 ${x + w * 2.2 + lean},178 ${x - w * 0.6 + lean},178`} fill={`url(#${id})`} opacity={o} />;
      })}
    </g>
  );
};
