// balanza · prop: una balanza de dos platos de bronce colgados de cadenas, con un fiel de pie y una base escalonada; cada plato lleva su rótulo
// (opts.izq, opts.der: hasta 12 letras, p. ej. "LO CORRECTO" y "EL MIEDO"). Lienzo 100 × 110, anclaje abajo en el centro. Oscila un poco siempre.
// Acciones propias: `tilt_left` baja el plato izquierdo (se queda), `tilt_right` baja el derecho (se queda), `waver` duda: oscila de un lado
// a otro mientras dura y vuelve al centro: no se sabe qué pesa más.
import React from "react";
import { type AssetFC, clamp01, idle, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const Balanza: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `bz${seed}`, { sway } = idle(t, seed), br = lerpHex("#C89A48", pal.glow, 0.1);
  const tl = clamp01(p.tilt_left ?? 0), tr = clamp01(p.tilt_right ?? 0), wv = p.waver ?? 0;
  const ang = (tr - tl) * 14 * 0 + (-tl + tr) * 14 + (wv > 0 && wv < 1 ? Math.sin(wv * Math.PI * 5) * 12 * Math.sin(wv * Math.PI) : 0) + sway * 1.2;
  const rad = (ang * Math.PI) / 180, arm = 38, cx = 50, cy = 22;
  const end = (s: number) => [cx + Math.cos(rad) * arm * s, cy + Math.sin(rad) * arm * s];
  const pan = (s: number, label: string, k: number) => { const [x, y] = end(s); return (
    <g key={k}><path d={`M${x} ${y} L${x - 13} ${y + 34} M${x} ${y} L${x + 13} ${y + 34}`} stroke={dark(br, pal, 0.2)} strokeWidth={0.6} />
      <path d={`M${x - 17} ${y + 34} Q${x} ${y + 46} ${x + 17} ${y + 34} Z`} fill={url(`${id}p`)} stroke={dark(br, pal, 0.4)} strokeWidth={0.6} />
      <rect x={x - 17} y={y + 47} width={34} height={7} rx={3.5} fill={k ? lerpHex(pal.accent, pal.ink, 0.2) : "#2E6E9E"} />
      <text x={x} y={y + 52} textAnchor="middle" fontSize={label.length > 9 ? 3.4 : 4} fontWeight={700} fontFamily="Arial, sans-serif" fill="#fff">{label}</text></g>); };
  return (
    <g>
      <Vol id={`${id}p`} c={br} pal={pal} k={1} /><Grad id={`${id}c`} h a={dark(br, pal, 0.35)} mid={lite(br, pal, 0.35)} b={dark(br, pal, 0.3)} />
      <Halo id={`${id}h`} cx={50} cy={40} r={56} color={pal.glow} a={0.22} />
      <ContactShadow id={`${id}s`} cx={50} cy={109} rx={30} a={0.4} />
      <rect x={47.5} y={20} width={5} height={82} fill={url(`${id}c`)} /><path d="M34 110 L38 102 L62 102 L66 110 Z" fill={url(`${id}c`)} /><rect x={40} y={98} width={20} height={4} rx={1} fill={url(`${id}c`)} />
      <g transform={`rotate(${ang} ${cx} ${cy})`}><rect x={cx - arm - 2} y={cy - 1.6} width={arm * 2 + 4} height={3.2} rx={1.6} fill={url(`${id}c`)} /></g>
      <path d={`M50 22 L50 8`} stroke={dark(br, pal, 0.3)} strokeWidth={1} /><circle cx={50} cy={6} r={3.4} fill={url(`${id}p`)} /><circle cx={cx} cy={cy} r={3} fill={lite(br, pal, 0.3)} />
      {pan(-1, String(opt(opts, "izq", "")), 0)}{pan(1, String(opt(opts, "der", "")), 1)}
    </g>
  );
};
