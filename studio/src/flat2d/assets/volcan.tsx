// volcan · fondo: una isla volcánica sobre el mar de noche (el Tambora en Sumbawa): cono de roca con vetas, cráter que brilla, el mar con el reflejo
// rojo y la costa baja. `erupt` (acción propia): revienta: la columna de ceniza sube hasta lo alto del cuadro y se abre en hongo, con rayos dentro,
// lava por las laderas y ceniza que cae (se queda). `opts.humo` true = antes de la erupción ya echa una voluta de humo.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const Volcan: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `vo${seed}`, e = p.erupt ?? 0, col = clamp01(e * 1.4), cap = clamp01((e - 0.45) * 2.2), G = 106, cx = 52, top = 70;
  const rock = lerpHex(pal.rock, pal.ink, 0.15), lava = "#FF7A2E", ash = lerpHex("#8A8078", pal.rock, 0.25);   // la lava y la ceniza son luz y materia propias, no de la paleta
  const colTop = top - col * 78;   // hasta cerca del borde superior del lienzo
  const puff = (x: number, y: number, r: number, k: number) => <circle key={k} cx={x} cy={y} r={r} fill={lerpHex(ash, k < 100 ? lava : "#C8BEB2", k < 100 ? 0.2 : 0.1 + 0.35 * hash(k + seed))} />;
  const bolt = e > 0.3 && Math.floor(t / 7 + seed) % 5 === 0;
  return (
    <g>
      <Grad id={`${id}r`} h a={dark(rock, pal, 0.45)} mid={lite(rock, pal, 0.15)} b={dark(rock, pal, 0.35)} at={0.58} />
      <Grad id={`${id}s`} a={lerpHex(pal.wall, lava, 0.25 * col)} b={dark(pal.wall, pal, 0.6)} />
      <rect x={-40} y={G - 2} width={180} height={100} fill={url(`${id}s`)} />
      {[...Array(18)].map((_, i) => <rect key={i} x={cx - 6 - i * 0.8 + Math.sin(t * 0.07 + i) * 1.2} y={G + 2 + i * 2.6} width={12 + i * 1.6} height={0.6} rx={0.3} fill={lava} opacity={(0.5 - i * 0.025) * (0.3 + 0.7 * col)} />)}
      <path d={`M-30 ${G} L18 ${G - 3} L${cx - 9} ${top + 2} Q${cx} ${top - 2} ${cx + 9} ${top + 2} L88 ${G - 4} L130 ${G} Z`} fill={url(`${id}r`)} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${cx - 7 + i * 2.3} ${top + 3} Q${cx - 18 + i * 6} ${top + 18} ${cx - 30 + i * 10} ${G - 2}`} stroke={dark(rock, pal, 0.5)} strokeWidth={0.4} fill="none" opacity={0.6} />)}
      {col > 0 ? [-1, 1].map((sd) => <path key={sd} d={`M${cx + sd * 3} ${top + 1} Q${cx + sd * 10} ${top + 14} ${cx + sd * (14 + 6 * hash(sd + seed))} ${top + 14 + col * 18}`} stroke={lava} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.9} />) : null}
      <Halo id={`${id}h`} cx={cx} cy={top} r={14 + 34 * col} color={lava} a={0.35 + 0.5 * col} />
      <ellipse cx={cx} cy={top + 0.5} rx={8} ry={1.6} fill={lerpHex(lava, "#FFF0B0", 0.3 + 0.4 * col)} />
      {opt(opts, "humo", true) && col === 0 ? [...Array(5)].map((_, i) => puff(cx + Math.sin(t * 0.03 + i) * 2 + i * 1.5, top - 4 - i * 5 - (t * 0.05) % 5, 2.5 + i * 0.9, i)) : null}
      {col > 0 ? <g>
        {[...Array(26)].map((_, i) => { const u = i / 25, y = top - u * (top - colTop), w = 6 + u * 14 + Math.sin(t * 0.08 + i) * 1.2; return puff(cx + Math.sin(i * 1.7 + t * 0.04) * w * 0.4, y, w * (0.6 + 0.3 * hash(i)), 100 + i); })}
        {cap > 0 ? [...Array(16)].map((_, i) => { const a = (i / 15) * Math.PI, r = cap * (16 + 22 * hash(i + seed)); return puff(cx + Math.cos(a) * r * 1.6, colTop + 4 - Math.sin(a) * r * 0.45, 6 + 7 * cap * hash(i * 2), 200 + i); }) : null}
        {[...Array(30)].map((_, i) => { const x = cx - 50 + hash(i * 3.1 + seed) * 100, y = (colTop + ((t * (0.4 + hash(i) * 0.5) + hash(i * 7) * 100) % (G - colTop))); return <circle key={`a${i}`} cx={x} cy={y} r={0.35} fill={ash} opacity={0.6 * col} />; })}
        {bolt ? <path d={`M${cx - 6} ${colTop + 12} L${cx - 1} ${colTop + 24} L${cx - 5} ${colTop + 26} L${cx + 2} ${colTop + 40}`} stroke="#FFFFFF" strokeWidth={0.8} fill="none" /> : null}
      </g> : null}
      <ContactShadow id={`${id}c`} cx={cx} cy={G + 1} rx={55} ry={3} a={0.3} />
    </g>
  );
};
