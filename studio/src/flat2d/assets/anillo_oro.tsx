// anillo_oro · prop: el anillo de Giges: un aro grueso de oro visto de tres cuartos, con el engaste (chatón) de una piedra roja tallada
// y grabados; reflejos que corren por el metal y un halo cálido. Lienzo 100 × 100, anclaje en el centro.
// Acciones propias: `shine` un destello en estrella recorre el aro y el halo crece (se queda más brillante); `turn` el engaste gira hacia
// dentro (hacia la palma): la piedra desaparece por detrás y el aro queda liso (se queda); `spin` gira despacio sobre sí mismo mientras dura.
import React from "react";
import { type AssetFC, clamp01, idle } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const AnilloOro: AssetFC = ({ pal, t, seed, p }) => {
  const id = `an${seed}`, sh = clamp01(p.shine ?? 0), tu = clamp01(p.turn ?? 0), sp = p.spin ?? 0, { bob } = idle(t, seed);
  const gold = lerpHex("#F0C04A", pal.glow, 0.12), ruby = "#C8202E";
  const rot = tu * 180 + sp * 360;          // ángulo del engaste alrededor del aro (0 = delante, 180 = detrás)
  const c = Math.cos((rot * Math.PI) / 180), sx = Math.sin((rot * Math.PI) / 180);
  const gx = 50 + sx * 26, gy = 30 + (1 - c) * 6, front = c > -0.1, gs = 0.55 + 0.45 * Math.abs(c);
  const star = sh > 0 && sh < 1 ? Math.sin(sh * Math.PI) : 0;
  const gem = (
    <g transform={`translate(${gx} ${gy}) scale(${gs * (0.6 + 0.4 * Math.abs(c))} ${gs})`}>
      <ellipse cx={0} cy={4} rx={14} ry={6} fill={dark(gold, pal, 0.35)} />
      <path d="M-13 3 L-10 -6 L10 -6 L13 3 Q0 9 -13 3 Z" fill={url(`${id}g`)} />
      <path d="M-8 -6 L0 -14 L8 -6 Z" fill={lerpHex(ruby, "#FF8A8A", 0.3)} /><path d="M-8 -6 L-10 -2 L0 -1 L0 -14 Z" fill={dark(ruby, pal, 0.25)} />
      <path d="M8 -6 L10 -2 L0 -1 L0 -14 Z" fill={ruby} /><path d="M-3 -10 L0 -13 L1 -8 Z" fill="#fff" opacity={0.75} />
      {[-7, 0, 7].map((x) => <circle key={x} cx={x} cy={2} r={0.9} fill={lite(gold, pal, 0.5)} />)}
    </g>
  );
  return (
    <g transform={`translate(0 ${bob * 0.8})`}>
      <Grad id={`${id}a`} a={lite(gold, pal, 0.45)} mid={gold} b={dark(gold, pal, 0.45)} at={0.45} />
      <Grad id={`${id}g`} a={lite(gold, pal, 0.3)} b={dark(gold, pal, 0.3)} />
      <Halo id={`${id}h`} cx={50} cy={52} r={44 + 14 * sh} color={pal.glow} a={0.35 + 0.35 * sh} />
      <ContactShadow id={`${id}s`} cx={50} cy={86} rx={30} a={0.3} />
      {!front && gem}
      {/* aro: elipse gruesa con hueco */}
      <path d="M14 55 A36 22 0 1 0 86 55 A36 22 0 1 0 14 55 Z M24 55 A26 14 0 1 1 76 55 A26 14 0 1 1 24 55 Z" fill={url(`${id}a`)} fillRule="evenodd" />
      <path d="M24 55 A26 14 0 0 1 76 55" fill="none" stroke={dark(gold, pal, 0.55)} strokeWidth={1.4} />
      <path d="M16 58 A35 21 0 0 0 84 58" fill="none" stroke={lite(gold, pal, 0.7)} strokeWidth={1} opacity={0.8} />
      {[...Array(9)].map((_, i) => { const a = Math.PI * (0.15 + i * 0.09); return <path key={i} d={`M${50 - Math.cos(a) * 31} ${55 + Math.sin(a) * 18} l0.8 2.4`} stroke={dark(gold, pal, 0.4)} strokeWidth={0.5} />; })}
      {/* reflejo que corre */}
      <path d={`M${22 + ((t * 0.6) % 60)} 66 q3 3 7 3`} stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
      {front && gem}
      {star > 0 && <g transform={`translate(${gx + 6} ${gy - 10}) rotate(${t * 3}) scale(${star})`} style={{ mixBlendMode: "screen" }}>
        <path d="M0 -16 L2 -2 L16 0 L2 2 L0 16 L-2 2 L-16 0 L-2 -2 Z" fill="#FFFBE8" /></g>}
    </g>
  );
};
