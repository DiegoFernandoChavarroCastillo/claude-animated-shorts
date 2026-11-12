// colinas · fondo del kit (D123): tres planos de lomas que se aclaran con la distancia y el suelo cercano, que empieza en la franja de los pies (y ≈ 106).
// `opts.verde` true = prado y árboles; false = tierra y roca del color de la paleta. `opts.arboles` número de árboles (6), `opts.cipres` true = cipreses.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, url } from "./shade";

export const Colinas: AssetFC = ({ pal, t, seed, opts }) => {
  const verde = opt(opts, "verde", true), nT = opt(opts, "arboles", 6), cip = opt(opts, "cipres", false), id = `co${seed}`;
  const near = verde ? lerpHex("#5FA84A", pal.rim, 0.18) : lerpHex(pal.rock, pal.wallLit, 0.25), far = lerpHex(near, pal.bg, 0.6), mid = lerpHex(near, pal.bg, 0.3);
  const hill = (y0: number, amp: number, k: number, ph: number) => `M-40 200 L-40 ${y0} ` + [...Array(19)].map((_, i) => { const x = -40 + i * 10; return `L${x} ${y0 - amp * (Math.sin(i * k + ph) * 0.6 + Math.sin(i * k * 2.3 + ph * 2) * 0.4)}`; }).join(" ") + " L140 200 Z";
  const leaf = verde ? lerpHex("#2F7A3A", pal.ink, 0.1) : lerpHex(pal.rock, pal.ink, 0.3);
  return (
    <g>
      <Grad id={`${id}a`} a={lerpHex(far, pal.glow, 0.25)} b={far} /><Grad id={`${id}b`} a={lerpHex(mid, pal.glow, 0.2)} b={mid} /><Grad id={`${id}c`} a={lerpHex(near, pal.glow, 0.25)} b={lerpHex(near, pal.ink, 0.35)} />
      <path d={hill(92, 9, 0.5, seed)} fill={url(`${id}a`)} /><path d={hill(100, 6, 0.7, seed + 2)} fill={url(`${id}b`)} />
      {[...Array(nT)].map((_, i) => {
        const x = -10 + hash(i * 2.7 + seed) * 120, y = 101 + hash(i * 1.3 + seed) * 4, s = 0.7 + hash(i + seed) * 0.6, sway = Math.sin(t * 0.03 + i) * 0.5;
        return cip ? <path key={i} d={`M${x} ${y} Q${x - 2.4 * s} ${y - 9 * s} ${x + sway} ${y - 19 * s} Q${x + 2.4 * s} ${y - 9 * s} ${x} ${y} Z`} fill={leaf} />
          : <g key={i}><rect x={x - 0.5 * s} y={y - 6 * s} width={s} height={6 * s} fill={lerpHex(pal.rock, pal.ink, 0.3)} /><circle cx={x + sway} cy={y - 9 * s} r={4.6 * s} fill={leaf} /><circle cx={x + sway + 1.4 * s} cy={y - 10.6 * s} r={2.8 * s} fill={lerpHex(leaf, pal.glow, 0.25)} /></g>;
      })}
      <path d={hill(106, 1.6, 0.9, seed + 5)} fill={url(`${id}c`)} />
    </g>
  );
};
