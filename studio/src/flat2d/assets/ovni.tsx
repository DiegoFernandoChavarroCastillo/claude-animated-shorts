// ovni · prop: un platillo volante de película (la teoría de los extraterrestres): disco metálico con cúpula de cristal, luces que parpadean en el
// borde y un rayo de luz en cono hacia abajo. Flota y se balancea siempre. Lienzo 100 × 100 con el disco arriba (anclaje en el disco, 0,2).
// opts: `rayo` (false). Acciones propias: `beam` se enciende el rayo (se queda); `flee` apaga el rayo y sale disparado hacia arriba a la derecha,
// haciéndose pequeño (se queda fuera): «no fueron ellos».
import React from "react";
import { type AssetFC, clamp01, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

export const Ovni: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `ov${seed}`, I = idle(t, seed), fl = clamp01(p.flee ?? 0);
  const ray = (p.beam !== undefined ? clamp01(p.beam * 2) : opt(opts, "rayo", false) ? 1 : 0) * (1 - clamp01(fl * 3));
  const metal = lerpHex("#A8B4C0", pal.wallLit, 0.2), glass = lerpHex("#8FE0D0", pal.glow, 0.25), beamC = lerpHex("#B8FFE0", pal.glow, 0.3);
  const e = fl * fl, dx = e * 90, dy = -e * 70, sc = 1 - e * 0.8;
  return (
    <g transform={`translate(${50 + dx} ${20 + dy + I.bob * 1.2}) scale(${sc}) rotate(${I.sway * 4 - fl * 20}) translate(-50 -20)`}>
      <Grad id={`${id}m`} a={lite(metal, pal, 0.45)} b={dark(metal, pal, 0.45)} /><Grad id={`${id}g`} a={lite(glass, pal, 0.5)} b={dark(glass, pal, 0.2)} />
      <Grad id={`${id}b`} a={beamC} b={beamC} />
      {ray > 0 && <path d="M38 24 L62 24 L86 100 L14 100 Z" fill={beamC} opacity={0.32 * ray} style={{ mixBlendMode: "screen" }} />}
      {ray > 0 && <path d="M44 24 L56 24 L68 100 L32 100 Z" fill={beamC} opacity={0.3 * ray} style={{ mixBlendMode: "screen" }} />}
      <Halo id={`${id}h`} cx={50} cy={20} r={26} color={glass} a={0.35} />
      <path d="M36 15 Q38 4 50 4 Q62 4 64 15 Z" fill={url(`${id}g`)} />
      <path d="M40 12 Q43 7 49 6.5" stroke="#FFFFFF" strokeWidth={0.8} fill="none" opacity={0.6} />
      <ellipse cx={50} cy={18} rx={28} ry={6} fill={url(`${id}m`)} />
      <ellipse cx={50} cy={16.5} rx={27} ry={3} fill={lite(metal, pal, 0.3)} opacity={0.5} />
      <ellipse cx={50} cy={22.5} rx={12} ry={2.4} fill={dark(metal, pal, 0.5)} />
      {[...Array(8)].map((_, i) => { const a = (i / 8) * Math.PI * 2 + t * 0.06, on = Math.sin(t * 0.4 + i * 1.3) > 0; return Math.sin(a) > -0.2 ? <circle key={i} cx={50 + Math.cos(a) * 25} cy={19 + Math.sin(a) * 3} r={1.2} fill={on ? lerpHex(pal.accent, "#FF5050", 0.4) : pal.glow} /> : null; })}
      <path d={`M24 18 Q50 ${lerp(25, 24, ray)} 76 18`} stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.6} />
    </g>
  );
};
