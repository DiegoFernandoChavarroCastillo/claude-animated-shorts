// nubes · capa de ambiente: nubes redondeadas con volumen que derivan despacio hacia la derecha. `opts.n` (5), `opts.hasta` fracción del alto (0.45),
// `opts.tipo` "cumulo" (algodón de día) | "franja" (bandas largas de atardecer).
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";

export const Nubes: AssetFC = ({ pal, t, seed, opts }) => {
  const n = opt(opts, "n", 5), to = opt(opts, "hasta", 0.45) * 178, tipo = opt(opts, "tipo", "cumulo"), id = `nb${seed}`;
  const top = lerpHex(pal.wallLit, "#ffffff", 0.5), bot = lerpHex(pal.wallLit, pal.bg, 0.45);
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      {[...Array(n)].map((_, i) => {
        const s = 0.6 + 0.9 * hash(i * 2.1 + seed), y = 12 + hash(i * 1.7 + seed + 4) * (to - 12), x = ((hash(i * 3.9 + seed) * 150 + t * 0.012 * (0.5 + s)) % 150) - 25;
        if (tipo === "franja") return <rect key={i} x={x - 22 * s} y={y} width={44 * s} height={2.2 * s} rx={1.1 * s} fill={lerpHex(pal.accent, pal.rim, hash(i + seed))} opacity={0.5} />;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.92}>
            <path d="M-13 3 a5 5 0 0 1 2 -9 a7 7 0 0 1 12 -4 a6 6 0 0 1 10 4 a4.5 4.5 0 0 1 2 9 Z" fill={`url(#${id})`} />
          </g>
        );
      })}
    </g>
  );
};
