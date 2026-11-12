// campo_maiz · escenario: campo arado con surcos que se pierden en perspectiva y brotes de maíz recién nacidos, verdes. `freeze` (acción propia):
// la helada lo cubre: el suelo se vuelve blanco desde el fondo, los brotes se doblan y pierden el color hasta quedar pardos (se queda).
// `opts.helado` true = ya helado desde el principio.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, dark, url } from "./shade";

export const CampoMaiz: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `cm${seed}`, fz = opt(opts, "helado", false) ? 1 : p.freeze ?? 0;
  const soil = lerpHex(lerpHex(pal.rock, "#6A4A2A", 0.5), "#E8EEF4", fz * 0.85), snow = "#F2F6FA";
  const rows = 9;
  return (
    <g>
      <Grad id={`${id}g`} a={lerpHex(soil, pal.wall, 0.25)} b={dark(soil, pal, 0.25)} />
      <rect x={-20} y={30} width={140} height={110} fill={url(`${id}g`)} />
      {[...Array(rows)].map((_, r) => {
        const y = 34 + r ** 1.45 * 4.2, s = 0.3 + r * 0.1, lf = clamp01(fz * 1.5 - (rows - r) * 0.06);
        return (
          <g key={r}>
            <path d={`M-20 ${y} L120 ${y}`} stroke={dark(soil, pal, 0.35)} strokeWidth={0.5 + r * 0.12} opacity={0.6} />
            {[...Array(9 - Math.floor(r / 2))].map((_, i) => {
              const n = 9 - Math.floor(r / 2), x = -6 + (i + 0.5) * (112 / n) + (hash(i * 3 + r + seed) - 0.5) * 4, sw = Math.sin(t * 0.05 + i + r) * (1 - lf) * 2;
              const leaf = lerpHex(lerpHex("#5FB04A", pal.rim, 0.12), lerpHex("#8A7A5A", snow, 0.25), lf), droop = lf * 40;
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                  <path d={`M0 0 L${sw * 0.3} -9`} stroke={leaf} strokeWidth={1.4} strokeLinecap="round" />
                  <path d={`M0 -4 Q-6 ${-9 + droop * 0.15} -9 ${-6 + droop * 0.2}`} stroke={leaf} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                  <path d={`M${sw * 0.2} -7 Q6 ${-13 + droop * 0.18} 9 ${-9 + droop * 0.22}`} stroke={leaf} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                  {lf > 0.3 ? <ellipse cx={0} cy={-0.4} rx={4} ry={1.2} fill={snow} opacity={lf} /> : null}
                </g>
              );
            })}
          </g>
        );
      })}
      {fz > 0 ? [...Array(40)].map((_, i) => <circle key={i} cx={hash(i + seed) * 100} cy={34 + hash(i * 1.9) * 90} r={0.4 + hash(i * 3.3) * 1.1} fill={snow} opacity={fz * 0.8} />) : null}
    </g>
  );
};
