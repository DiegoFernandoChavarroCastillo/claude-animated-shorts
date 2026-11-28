// cruceta_hilos · prop: la cruceta de madera de un titiritero con una mano que la sostiene desde arriba y tres hilos que bajan tensos hasta el
// borde inferior del lienzo (en x = 20, 50 y 80): manipular, mover a otros como marionetas. Lienzo 100 × 160, anclaje arriba en el centro;
// pon debajo las figuras (sus cabezas a la altura de y ≈ 155 del lienzo). Acción propia: `pull` la cruceta se inclina a un lado y a otro y los
// hilos tiran mientras dura.
import React from "react";
import { type AssetFC, idle } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const CrucetaHilos: AssetFC = ({ pal, t, seed, p }) => {
  const id = `ch${seed}`, pu = p.pull ?? 0, { sway } = idle(t, seed);
  const a = (pu > 0 && pu < 1 ? Math.sin(pu * Math.PI * 4) * 14 : 0) + sway * 3, wood = lerpHex("#9A6A3A", pal.wall, 0.15);
  const ends = [20, 50, 80], rad = (a * Math.PI) / 180;
  const tip = (dx: number) => [50 + Math.cos(rad) * dx, 30 + Math.sin(rad) * dx];
  const lift = (k: number) => (pu > 0 && pu < 1 ? Math.max(0, Math.sin(pu * Math.PI * 4 + k * 2)) * 4 : 0);
  return (
    <g>
      <Grad id={`${id}w`} a={lite(wood, pal, 0.3)} b={dark(wood, pal, 0.35)} /><Vol id={`${id}m`} c={pal.skin} pal={pal} k={1} />
      <Halo id={`${id}h`} cx={50} cy={20} r={30} color={pal.glow} a={0.25} />
      {ends.map((x, k) => { const [tx, ty] = tip((k - 1) * 30); return <path key={k} d={`M${tx} ${ty} L${x} ${160 - lift(k)}`} stroke={lite(pal.wallLit, pal, 0.2)} strokeWidth={0.45} opacity={0.85} />; })}
      <g transform={`rotate(${a} 50 30)`}>
        <rect x={16} y={27.5} width={68} height={5} rx={1.4} fill={url(`${id}w`)} /><rect x={47.5} y={14} width={5} height={30} rx={1.4} fill={url(`${id}w`)} />
        {[-30, 0, 30].map((d) => <circle key={d} cx={50 + d} cy={30} r={1.2} fill={dark(wood, pal, 0.4)} />)}
        {/* mano que sostiene */}
        <path d="M40 -6 L60 -6 L60 10 Q58 18 50 18 Q42 18 40 10 Z" fill={url(`${id}m`)} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${42 + i * 5} 12 q2 6 4 0`} stroke={dark(pal.skin, pal, 0.35)} strokeWidth={0.6} fill="none" />)}
        <path d="M38 -20 L62 -20 L60 -4 L40 -4 Z" fill={dark(pal.accent, pal, 0.4)} />
      </g>
    </g>
  );
};
