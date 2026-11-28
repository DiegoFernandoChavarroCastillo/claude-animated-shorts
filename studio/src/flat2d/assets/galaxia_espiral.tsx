// galaxia_espiral · prop (senal-wow): una galaxia espiral como la Vía Láctea, algo inclinada: núcleo dorado brillante, dos brazos de
// estrellas azuladas con nubes de gas rosado y franjas de polvo oscuro, que gira despacio. Lienzo 100 × 100, anclaje en el centro.
// opts.inclina (0,62: aplastamiento), opts.n estrellas (420), opts.marca true = un anillo marca nuestro Sol en un brazo («nosotros»).
// Acciones propias: `civs` se encienden en cascada cientos de luces cálidas por los brazos (se quedan): civilizaciones, mundos habitados;
// `dim` esas luces se apagan y solo queda la marca del Sol (se queda): no hay prueba, seguimos solos; `pulse` el núcleo late (mientras dura).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo } from "./shade";

export const GalaxiaEspiral: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `ge${seed}`, inc = Number(opt(opts, "inclina", 0.62)), n = Number(opt(opts, "n", 420)), marca = Boolean(opt(opts, "marca", false));
  const civ = clamp01(p.civs ?? 0), dim = clamp01(p.dim ?? 0), pu = Math.sin(clamp01(p.pulse ?? 0) * Math.PI);
  const rot = t * 0.0016, blue = lerpHex("#BFD8FF", pal.glow, 0.3), pink = "#FF8AC8", gold = "#FFD89A", warm = "#FFC060";
  const pt = (arm: number, k: number, j: number) => {
    const th = k * 4.2 + arm * Math.PI + rot, r = 4 + k * 42, sp = (hash(j * 1.7 + seed) - 0.5) * (3 + k * 9), sq = (hash(j * 2.3 + seed) - 0.5) * (3 + k * 9);
    const x = Math.cos(th) * r + sp, y = Math.sin(th) * r + sq;
    return [50 + x, 50 + y * inc] as [number, number];
  };
  const stars = [...Array(n)].map((_, j) => {
    const arm = j % 2, k = Math.pow(hash(j + seed * 3), 0.8), [x, y] = pt(arm, k, j), s = 0.18 + hash(j * 5) * 0.4;
    return <circle key={j} cx={x} cy={y} r={s} fill={k < 0.25 ? gold : blue} opacity={0.35 + 0.55 * Math.abs(Math.sin(t * 0.03 + j))} />;
  });
  const gas = [...Array(18)].map((_, j) => { const [x, y] = pt(j % 2, 0.2 + hash(j * 9 + seed) * 0.75, j * 7); return <Halo key={j} id={`${id}g${j}`} cx={x} cy={y} r={4 + hash(j) * 4} color={j % 3 ? blue : pink} a={0.22} />; });
  const dust = [0, 1].map((arm) => {
    const d = [...Array(24)].map((_, i) => { const k = 0.12 + (i / 23) * 0.8, th = k * 4.2 + arm * Math.PI + rot - 0.18, r = 4 + k * 42; return `${i ? "L" : "M"}${50 + Math.cos(th) * r} ${50 + Math.sin(th) * r * inc}`; }).join(" ");
    return <path key={arm} d={d} stroke={pal.ink} strokeWidth={2.2} fill="none" opacity={0.35} strokeLinecap="round" />;
  });
  const NC = 110, lights = civ > 0 ? [...Array(NC)].map((_, j) => {
    const on = clamp01((civ - (j / NC) * 0.8) * 6) * (1 - dim), [x, y] = pt(j % 2, 0.15 + hash(j * 4.1 + 9) * 0.82, j * 11 + 3);
    return on > 0 ? <g key={j} opacity={on * (0.75 + 0.25 * Math.sin(t * 0.2 + j))}><circle cx={x} cy={y} r={0.45} fill={warm} /><circle cx={x} cy={y} r={1.2} fill={warm} opacity={0.25} /></g> : null;
  }) : null;
  const [sx, sy] = pt(1, 0.62, 77);
  return (
    <g>
      <Halo id={`${id}o`} cx={50} cy={50} r={52} color={blue} a={0.16} />
      {gas}
      {dust}
      {stars}
      <Halo id={`${id}c`} cx={50} cy={50} r={16 + pu * 6} color={gold} a={0.85} />
      <ellipse cx={50} cy={50} rx={3.6 + pu} ry={(3.6 + pu) * inc} fill="#FFF4DA" opacity={0.8} />
      {lights}
      {marca || dim > 0 ? (
        <g opacity={marca ? 1 : dim}>
          <circle cx={sx} cy={sy} r={0.9} fill="#FFF2B0" />
          <circle cx={sx} cy={sy} r={3.2 + Math.sin(t * 0.12) * 0.4} fill="none" stroke={pal.accent} strokeWidth={0.45} />
          <Halo id={`${id}s`} cx={sx} cy={sy} r={6} color={pal.accent} a={0.6} />
        </g>
      ) : null}
    </g>
  );
};
