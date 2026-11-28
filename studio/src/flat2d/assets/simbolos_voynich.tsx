// simbolos_voynich · ambiente (manuscrito-voynich): símbolos del voynichés que se elevan del libro y flotan en dorado por la mitad alta
// del cuadro. Lienzo 100 × 178, anclaje en el centro. opts.n (30), opts.hasta (0,58 del alto: no baja a la franja de subtítulos),
// opts.cx, opts.cy (de dónde salen, 50 y 96). Acción propia: `order` los símbolos dejan de flotar, se colocan en renglones y los que se
// repiten se encienden del mismo color: patrones, un idioma con reglas (se queda); `rise` salen del libro y suben (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo } from "./shade";
import { glyphD } from "./manuscrito_voynich";

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export const SimbolosVoynich: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `sv${seed}`, n = Number(opt(opts, "n", 30)), hasta = Number(opt(opts, "hasta", 0.58)) * 178;
  const cx = Number(opt(opts, "cx", 50)), cy = Number(opt(opts, "cy", 96));
  const rise = p.rise === undefined ? 1 : ease(clamp01(p.rise)), ord = ease(clamp01(p.order ?? 0));
  const gold = lerpHex("#FFD870", pal.glow, 0.3), cols = ["#FFD870", "#7FE0FF", "#FF9A7A", "#B8FF9A"];
  const perRow = 7, rows = Math.ceil(n / perRow);
  return (
    <g>
      {[...Array(n)].map((_, i) => {
        const k = Math.floor(hash(seed + i * 3.7) * 4), sz = 3.2 + hash(i + seed) * 1.6;
        const fx = 8 + hash(i * 1.3 + seed) * 84, fy = 18 + hash(i * 2.9 + seed) * (hasta - 24);
        const dx = Math.sin(t * 0.02 + i) * 2.5, dy = Math.cos(t * 0.017 + i * 1.7) * 2.5;
        const flx = lerp(cx + (hash(i) - 0.5) * 10, fx + dx, rise), fly = lerp(cy, fy + dy, rise);
        const r = Math.floor(i / perRow), c = i % perRow, gx = 14 + c * 12, gy = hasta * 0.5 - rows * 6 + r * 12 + Math.sin(t * 0.05 + c) * 0.4;
        const x = lerp(flx, gx, ord), y = lerp(fly, gy, ord), col = lerpHex(gold, cols[k], ord);
        const rot = (1 - ord) * Math.sin(t * 0.03 + i) * 25, a = (0.55 + 0.35 * Math.sin(t * 0.06 + i * 2)) * (0.3 + 0.7 * rise);
        return (
          <g key={i} transform={`rotate(${rot} ${x} ${y})`} opacity={a + ord * 0.3}>
            <Halo id={`${id}h${i}`} cx={x} cy={y} r={sz * 1.8} color={col} a={0.35 + ord * 0.25} />
            <path d={glyphD(k * 2 + (i % 2), x, y, sz)} stroke={col} strokeWidth={0.55} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      {ord > 0.6 ? [...Array(rows)].map((_, r) => <path key={r} d={`M10 ${hasta * 0.5 - rows * 6 + r * 12 + 3.4} L90 ${hasta * 0.5 - rows * 6 + r * 12 + 3.4}`} stroke={gold} strokeWidth={0.2} opacity={(ord - 0.6) * 1.2} />) : null}
    </g>
  );
};
