// pared_sombras · la pared de la cueva con la luz del fuego desde abajo y siluetas oscuras y desenfocadas que pasan: lo que los prisioneros creen real.
// Sin acciones pasan sombras sueltas (jarra, animal, árbol…) en bucle; `shadow_pass` suma una sombra grande de un objeto concreto que cruza de lado a lado.
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { KINDS, Kind, Sil } from "./silhouettes";

export const PAGE = { w: 100, h: 72 };

export const ParedSombras: AssetFC = ({ t, p, params, pal, flick, seed }) => {
  const id = `ps${seed}`, W = PAGE.w, H = PAGE.h;
  const idle = [0, 1].map((k) => {
    const period = 330, c = t / period + k * 0.5, cyc = Math.floor(c), u = c - cyc;
    const kind = KINDS[Math.floor(hash(cyc * 3.7 + k * 11) * KINDS.length)];
    return { kind, x: lerp(-24, 122, u), s: 1.9 + 0.5 * hash(cyc + k), key: `${k}_${cyc}`, flip: k === 1 };
  });
  const u = p.shadow_pass ?? 0, spec = params.shadow_pass ?? {}, kind = (spec.object as Kind) ?? "animal", left = spec.dir === "left";
  const wob = 1 + 0.025 * Math.sin(t * 0.41) + 0.02 * (flick - 0.5);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}g`} cx="50%" cy="108%" r="95%"><stop offset="0" stopColor={pal.wallLit} stopOpacity={0.75 + 0.25 * flick} /><stop offset="0.55" stopColor={pal.wall} /><stop offset="1" stopColor={pal.wall} /></radialGradient>
        <filter id={`${id}b`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.9" /></filter>
        <clipPath id={`${id}c`}><rect x={0} y={0} width={W} height={H} rx={3} /></clipPath>
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={3} fill={`url(#${id}g)`} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${6 + hash(i + seed) * 88} ${4 + hash(i * 2.3) * 60} q${3 + hash(i) * 5} ${hash(i * 5) * 3} ${6 + hash(i * 7) * 6} ${-1 + hash(i * 9) * 3}`} stroke={pal.rock} strokeWidth={0.5} fill="none" opacity={0.55} />)}
      <g clipPath={`url(#${id}c)`}>
        <g filter={`url(#${id}b)`} opacity={0.82} fill={pal.ink}>
          {idle.map((o) => <g key={o.key} transform={`translate(0 ${H - 5}) scale(1 ${wob}) translate(0 ${-H + 5})`}><Sil kind={o.kind} fill={pal.ink} x={o.x} y={H - 5 - 20 * o.s} s={o.s} flip={o.flip} /></g>)}
          {u > 0 && u < 1 ? <g transform={`translate(0 ${H - 5}) scale(1 ${wob}) translate(0 ${-H + 5})`}><Sil kind={kind} fill={pal.ink} x={left ? lerp(122, -62, u) : lerp(-62, 122, u)} y={H - 5 - 20 * 3.1} s={3.1} flip={left} /></g> : null}
        </g>
      </g>
      <rect x={0} y={0} width={W} height={H} rx={3} fill="none" stroke={pal.rock} strokeWidth={1.4} />
    </g>
  );
};
