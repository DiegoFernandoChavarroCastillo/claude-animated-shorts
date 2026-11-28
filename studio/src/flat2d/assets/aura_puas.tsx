// aura_puas · ambiente/prop: un halo de púas oscuras que brota alrededor de una persona (la metáfora del erizo: poner barreras,
// protegerse, no dejar que nadie se acerque). Lienzo 100 × 160, anclaje en el centro; se coloca detrás de la figura, centrado en su pecho.
// opts.color. Acción propia: `grow` las púas salen desde el cuerpo hacia fuera y quedan erizadas, vibrando (se queda);
// `shrink` se retraen y desaparecen (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { Halo, dark } from "./shade";
import { lerpHex } from "../palette";

export const AuraPuas: AssetFC = ({ pal, t, seed, p, opts }) => {
  const g = clamp01(p.grow ?? 0) * (1 - clamp01(p.shrink ?? 0)), id = `ap${seed}`;
  const c = lerpHex(opt(opts, "color", "#4A3428") as string, pal.ink, 0.15), tip = lerpHex("#E8D6B8", pal.wallLit, 0.2);
  if (g <= 0.01) return <g />;
  return (
    <g opacity={Math.min(1, g * 1.6)}>
      <Halo id={`${id}h`} cx={50} cy={80} r={60} color="#8A2A3A" a={0.35 * g} />
      {[...Array(30)].map((_, i) => {
        const a = (i / 30) * Math.PI * 2 + hash(i + seed) * 0.1, r0 = 16, L = (18 + hash(i * 3 + seed) * 16) * g, vib = Math.sin(t * 0.6 + i) * 0.6 * g;
        const rx = Math.cos(a), ry = Math.sin(a) * 1.9, bx = 50 + rx * r0, by = 80 + ry * r0, ex = 50 + rx * (r0 + L) + vib, ey = 80 + ry * (r0 + L);
        const px = -ry * 0.12, py = rx * 0.12;
        return <g key={i}><path d={`M${bx + px * 22} ${by + py * 22} L${ex} ${ey} L${bx - px * 22} ${by - py * 22} Z`} fill={i % 2 ? c : dark(c, pal, 0.2)} />
          <path d={`M${bx + (ex - bx) * 0.7} ${by + (ey - by) * 0.7} L${ex} ${ey}`} stroke={tip} strokeWidth={1} strokeLinecap="round" /></g>;
      })}
    </g>
  );
};
