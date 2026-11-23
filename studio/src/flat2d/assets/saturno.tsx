// saturno · prop (lienzo 100 × 60, anclaje en el centro del planeta): Saturno con bandas de nubes ocre que giran despacio, sombra del
// lado nocturno, y los anillos inclinados (la mitad de atrás pasa por detrás del planeta y la de delante por delante, con la sombra
// del planeta sobre ellos). opts.inclina (-14 grados). Para «cerca de Saturno», el viaje, la estación que lo orbita.
import React from "react";
import { type AssetFC, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo, url } from "./shade";

export const Saturno: AssetFC = ({ pal, t, seed, opts }) => {
  const id = `sa${seed}`, inc = opt(opts, "inclina", -14), R = 17;
  const bands = ["#E8D2A0", "#D8B47A", "#F0DCB0", "#C89A62", "#E4C690", "#B88A58", "#EED8AA"];
  const ring = (front: boolean) => (
    <g clipPath={`url(#${id}${front ? "f" : "b"})`}>
      {[...Array(9)].map((_, i) => {
        const r = 24 + i * 2.1, gap = i === 4;
        return <ellipse key={i} cx={0} cy={0} rx={r} ry={r * 0.24} fill="none" stroke={lerpHex("#E6D0A6", "#9A7A52", (i % 3) / 3)} strokeWidth={gap ? 0.4 : 1.9} opacity={gap ? 0.2 : 0.85 - i * 0.05} />;
      })}
    </g>
  );
  return (
    <g transform={`translate(50 30) rotate(${inc})`}>
      <defs>
        <clipPath id={`${id}p`}><circle r={R} /></clipPath>
        <clipPath id={`${id}b`}><rect x={-60} y={-30} width={120} height={30} /></clipPath>
        <clipPath id={`${id}f`}><rect x={-60} y={0} width={120} height={30} /></clipPath>
        <radialGradient id={`${id}sh`} cx="0.25" cy="0.3" r="0.95"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.78} /></radialGradient>
      </defs>
      <Halo id={`${id}h`} cx={0} cy={0} r={34} color={lerpHex(pal.glow, "#FFD89A", 0.5)} a={0.25} />
      {ring(false)}
      <g clipPath={`url(#${id}p)`}>
        {bands.map((c, i) => <rect key={i} x={-R} y={-R + i * ((2 * R) / bands.length) + Math.sin(t * 0.01 + i) * 0.3} width={2 * R} height={(2 * R) / bands.length + 0.6} fill={c} />)}
        {[...Array(6)].map((_, i) => <ellipse key={i} cx={((t * 0.05 + i * 13) % 50) - 25} cy={-R + 4 + i * 5.4} rx={5} ry={0.6} fill="#FFF0D0" opacity={0.25} />)}
        <circle r={R} fill={url(`${id}sh`)} />
      </g>
      {ring(true)}
      {/* sombra del planeta sobre los anillos de delante */}
      <ellipse cx={6} cy={3.6} rx={12} ry={2.6} fill="#000" opacity={0.35} />
    </g>
  );
};
