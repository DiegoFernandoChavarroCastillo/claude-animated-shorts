// radio_disco · prop (senal-wow): una antena parabólica de radiotelescopio moderna (como las del VLA): plato blanco con nervios, tres
// patas que sostienen el receptor en el foco, horquilla y pedestal sobre una base de hormigón. Mira al cielo, a la izquierda.
// Lienzo 100 × 110, anclaje en la base. opts.mira (grados, -30: hacia arriba a la izquierda). Con `repeat` hace una fila de antenas.
// Acciones propias: `scan` el plato barre el cielo despacio a un lado y a otro (mientras dura): buscan, escuchan; `listen` una luz verde
// late en el receptor (mientras dura).
import React from "react";
import { type AssetFC, clamp01, idle, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const RadioDisco: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `rd${seed}`, I = idle(t, seed), sc = clamp01(p.scan ?? 0), li = clamp01(p.listen ?? 0);
  const mira = Number(opt(opts, "mira", -30)) + Math.sin(sc * Math.PI * 2) * 14 * Math.sin(sc * Math.PI) + I.sway * 0.4;
  const white = lerpHex("#E8ECF2", pal.wallLit, 0.2), conc = lerpHex("#8A8E96", pal.wall, 0.3);
  const on = li > 0 && li < 1 && Math.sin(t * 0.35) > 0;
  return (
    <g>
      <Grad id={`${id}d`} a={lite(white, pal, 0.2)} b={dark(white, pal, 0.45)} />
      <Grad id={`${id}p`} h a={dark(white, pal, 0.35)} mid={white} b={dark(white, pal, 0.4)} />
      <ContactShadow id={`${id}c`} cx={50} cy={109} rx={26} a={0.45} />
      <path d="M34 110 L66 110 L62 102 L38 102 Z" fill={dark(conc, pal, 0.2)} />
      <path d="M44 102 L56 102 L54 66 L46 66 Z" fill={url(`${id}p`)} />
      <path d="M40 66 L60 66 L56 58 L44 58 Z" fill={dark(white, pal, 0.25)} />
      <g transform={`rotate(${mira} 50 52)`}>
        {/* plato: elipse vista de lado con su cara cóncava */}
        <path d="M14 46 Q50 76 86 46 Q50 60 14 46 Z" fill={dark(white, pal, 0.35)} />
        <path d="M14 46 Q50 30 86 46 Q50 60 14 46 Z" fill={url(`${id}d`)} />
        {[-24, -12, 0, 12, 24].map((dx, i) => <path key={i} d={`M${50 + dx * 1.4} ${46 + Math.abs(dx) * 0.2 - 8} Q${50 + dx * 0.4} 48 ${50 + dx * 0.15} ${52}`} stroke={dark(white, pal, 0.2)} strokeWidth={0.3} fill="none" opacity={0.6} />)}
        <ellipse cx={50} cy={46} rx={36} ry={10} fill="none" stroke={lite(white, pal, 0.4)} strokeWidth={0.7} />
        {/* patas al foco y receptor */}
        <path d="M22 47 L50 14 M78 47 L50 14 M50 54 L50 14" stroke={dark(white, pal, 0.3)} strokeWidth={0.8} />
        <rect x={47.5} y={9} width={5} height={6} rx={1} fill={lite(white, pal, 0.1)} />
        <circle cx={50} cy={12} r={1} fill={on ? "#7DFFB0" : dark(white, pal, 0.5)} />
        {on ? <Halo id={`${id}h`} cx={50} cy={12} r={6} color="#7DFFB0" a={0.7} /> : null}
        <rect x={44} y={54} width={12} height={6} fill={dark(white, pal, 0.3)} />
      </g>
    </g>
  );
};
