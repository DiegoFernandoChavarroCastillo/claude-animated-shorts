// heno · prop: un montón de heno dorado en forma de cúpula, con briznas sueltas que asoman y se mecen, sombra de contacto y luz de borde.
// Lienzo 100 × 70, anclaje en los pies. opts.seco true = ya marchito (gris pardo, hundido).
// Acción propia: `secar` el heno se marchita, pierde color y se hunde un poco (se queda): pasa el tiempo, nadie lo comió.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Vol, dark, lite, url } from "./shade";

export const Heno: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `he${seed}`, dry = Math.max(opt(opts, "seco", false) ? 1 : 0, clamp01(p.secar ?? 0));
  const hay = lerpHex(lerpHex("#E2B34A", pal.glow, 0.1), "#8C7A5E", dry), sag = dry * 6;
  return (
    <g>
      <Vol id={`${id}h`} c={hay} pal={pal} k={1} lx={0.35} ly={0.2} />
      <ContactShadow id={`${id}s`} cx={50} cy={69} rx={46} a={0.38} />
      <path d={`M4 69 Q6 ${30 + sag} 30 ${18 + sag} Q50 ${8 + sag * 1.4} 70 ${18 + sag} Q94 ${30 + sag} 96 69 Z`} fill={url(`${id}h`)} />
      {[...Array(46)].map((_, i) => {
        const x = 8 + hash(i + seed) * 84, y = 22 + sag + hash(i * 7 + seed) * 44, a = -30 + hash(i * 3) * 60 + Math.sin(t * 0.06 + i) * 4;
        return <path key={i} d={`M${x} ${y} l${Math.sin((a * Math.PI) / 180) * 9} ${-Math.cos((a * Math.PI) / 180) * 9}`}
          stroke={i % 3 ? dark(hay, pal, 0.3) : lite(hay, pal, 0.35)} strokeWidth={0.7} strokeLinecap="round" />;
      })}
      {[...Array(9)].map((_, i) => {
        const x = 18 + i * 8, a = -40 + hash(i + 2 + seed) * 80 + Math.sin(t * 0.08 + i * 1.3) * 8;
        return <path key={`t${i}`} d={`M${x} ${20 + sag + Math.abs(x - 50) * 0.35} q${a * 0.12} -8 ${a * 0.2} -13`} stroke={lite(hay, pal, 0.2)} strokeWidth={0.8} fill="none" strokeLinecap="round" />;
      })}
      <path d={`M10 60 Q50 54 90 60`} stroke={dark(hay, pal, 0.35)} strokeWidth={1.2} fill="none" opacity={0.6} />
    </g>
  );
};
