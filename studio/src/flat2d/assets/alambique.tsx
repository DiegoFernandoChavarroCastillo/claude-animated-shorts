// alambique · prop (manuscrito-voynich): el alambique de un alquimista: una retorta de vidrio con líquido verde que hierve sobre un brasero,
// el tubo que gotea en un matraz, humo que sube, y al pie un crisol y un pergamino con símbolos de alquimia (sol, luna, mercurio).
// Alquimia, conocimientos secretos, transmutación. Lienzo 100 × 90, anclaje abajo en el centro. opts.color (líquido, "#7ADF8A").
// Acción propia: `boil` el líquido hierve fuerte, el humo sube en espiral y el matraz se enciende (se queda encendido).
import React from "react";
import { type AssetFC, clamp01, flicker, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const Alambique: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `al${seed}`, bo = clamp01(p.boil ?? 0), liq = lerpHex(String(opt(opts, "color", "#7ADF8A")), pal.glow, 0.15);
  const glass = lerpHex("#BFE0E8", pal.wall, 0.3), iron = lerpHex("#3A3430", pal.ink, 0.2), fire = "#FF9A3A", fl = flicker(t + seed);
  return (
    <g>
      <Grad id={`${id}g`} h a={dark(glass, pal, 0.2)} mid={lite(glass, pal, 0.4)} b={dark(glass, pal, 0.3)} />
      <Grad id={`${id}l`} a={lite(liq, pal, 0.3)} b={dark(liq, pal, 0.35)} />
      <ContactShadow id={`${id}s`} cx={50} cy={89} rx={44} a={0.4} />
      <Halo id={`${id}f`} cx={34} cy={78} r={24 + fl * 6} color={fire} a={0.45 + fl * 0.2} />
      {/* brasero */}
      <path d="M20 74 L48 74 L44 88 L24 88 Z" fill={iron} /><rect x={18} y={72} width={32} height={3} fill={lite(iron, pal, 0.2)} />
      {[0, 1, 2].map((k) => <path key={k} d={`M${27 + k * 7} 73 q${-2 - fl} -6 ${1} ${-10 - fl * 4 - k} q${2} 5 ${1} 10 Z`} fill={k === 1 ? "#FFD06A" : fire} opacity={0.9} />)}
      {/* retorta */}
      <circle cx={34} cy={56} r={14} fill={url(`${id}g`)} opacity={0.75} />
      <path d="M20 58 A14 14 0 0 0 48 58 Z" fill={url(`${id}l`)} />
      {[...Array(5)].map((_, k) => { const ph = (t * (0.03 + bo * 0.05) + k / 5) % 1; return <circle key={k} cx={26 + k * 4} cy={68 - ph * 10} r={0.8 + bo * 0.6} fill={lite(liq, pal, 0.5)} opacity={1 - ph} />; })}
      <path d="M40 44 Q50 30 76 40" stroke={url(`${id}g`)} strokeWidth={3} fill="none" opacity={0.85} />
      <path d="M40 44 Q50 30 76 40" stroke={lite(glass, pal, 0.5)} strokeWidth={0.6} fill="none" />
      <circle cx={34} cy={52} r={14} fill="none" stroke={lite(glass, pal, 0.6)} strokeWidth={0.5} opacity={0.6} />
      <path d="M26 48 q3 -5 8 -6" stroke="#fff" strokeWidth={1} opacity={0.5} fill="none" />
      {/* matraz que recibe */}
      {bo > 0.3 ? <Halo id={`${id}m`} cx={78} cy={70} r={18} color={liq} a={0.6 * bo} /> : null}
      <path d="M74 44 L74 56 L66 82 L90 82 L82 56 L82 44 Z" fill={url(`${id}g`)} opacity={0.8} />
      <path d="M69 74 L87 74 L90 82 L66 82 Z" fill={url(`${id}l`)} opacity={0.5 + bo * 0.5} />
      <circle cx={78} cy={44 + ((t * 0.6) % 14)} r={0.7} fill={liq} />
      {/* humo */}
      {[...Array(4)].map((_, k) => { const ph = (t * 0.012 + k / 4) % 1, sp = bo * 6; return <circle key={k} cx={34 + Math.sin(ph * 6 + k) * (3 + sp)} cy={40 - ph * 38} r={3 + ph * 7} fill={lerpHex(liq, pal.wallLit, 0.6)} opacity={0.22 * (1 - ph) * (0.5 + bo)} />; })}
      {/* pergamino con símbolos */}
      <path d="M52 82 L64 80 L66 88 L54 89 Z" fill={lerpHex("#E8D6A8", pal.ink, 0.2)} />
      <path d="M57 84 a1.4 1.4 0 1 0 0.01 0 M61 83.4 q-1.6 1.2 0 2.4" stroke={pal.ink} strokeWidth={0.3} fill="none" />
    </g>
  );
};
