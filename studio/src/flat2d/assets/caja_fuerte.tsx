// caja_fuerte · prop: una caja fuerte de acero de banco, robusta, con remaches, rueda de combinación, manija de tres brazos y bisagras; dentro,
// fajos de billetes verdes con faja y un saco de monedas. Lienzo 100 × 100, anclaje abajo en el centro.
// Acción propia: `open` la rueda gira, la puerta se abre hacia la izquierda y unos billetes salen volando hacia arriba (se queda abierta).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const CajaFuerte: AssetFC = ({ pal, seed, p, tb }) => {
  const id = `cf${seed}`, o = clamp01(p.open ?? 0), door = clamp01((o - 0.25) / 0.45), fly = clamp01((o - 0.55) / 0.45);
  const steel = lerpHex("#5E6670", pal.wall, 0.2), cash = "#3F8F4E";
  const wheel = o * 720;
  const stack = (x: number, y: number, k: number) => (
    <g key={k}><rect x={x} y={y} width={16} height={6} rx={0.6} fill={cash} /><rect x={x} y={y} width={16} height={1.4} fill={lite(cash, pal, 0.35)} />
      <rect x={x + 6} y={y} width={3.4} height={6} fill="#E8D9A0" /></g>
  );
  return (
    <g>
      <Vol id={`${id}b`} c={steel} pal={pal} k={1} /><Grad id={`${id}i`} a={dark(steel, pal, 0.6)} b={dark(steel, pal, 0.35)} />
      <Vol id={`${id}d`} c={lite(steel, pal, 0.08)} pal={pal} k={1} lx={0.3} />
      <ContactShadow id={`${id}s`} cx={50} cy={99} rx={42} a={0.45} />
      <rect x={14} y={18} width={72} height={78} rx={4} fill={url(`${id}b`)} />
      <rect x={22} y={26} width={56} height={62} rx={2} fill={url(`${id}i`)} />
      <Halo id={`${id}h`} cx={50} cy={60} r={34} color="#FFE7A0" a={0.5 * door} />
      {[0, 1, 2].map((r) => [0, 1].map((c) => stack(27 + c * 26, 76 - r * 8, r * 2 + c)))}
      <rect x={26} y={44} width={48} height={1.4} fill={dark(steel, pal, 0.2)} />
      <ellipse cx={50} cy={40} rx={10} ry={6} fill="#C8A040" /><path d="M46 34 Q50 30 54 34" stroke="#8A6A20" strokeWidth={1} fill="none" />
      {/* puerta: se pliega hacia la izquierda (escala horizontal desde la bisagra) */}
      <g transform={`translate(22 0) scale(${1 - door * 1.25} 1) translate(-22 0)`}>
        <rect x={22} y={26} width={56} height={62} rx={2} fill={url(`${id}d`)} stroke={dark(steel, pal, 0.4)} strokeWidth={0.8} />
        {door < 0.75 && <g>
          <circle cx={50} cy={50} r={10} fill={dark(steel, pal, 0.25)} /><circle cx={50} cy={50} r={8} fill={lite(steel, pal, 0.3)} />
          <g transform={`rotate(${wheel} 50 50)`}>{[...Array(12)].map((_, i) => <line key={i} x1={50} y1={42.6} x2={50} y2={44} stroke={pal.ink} strokeWidth={0.5} transform={`rotate(${i * 30} 50 50)`} />)}
            <path d="M50 41 L51 43 L49 43 Z" fill="#C8202E" /></g>
          <g transform={`rotate(${o * 90} 50 72)`}>{[0, 120, 240].map((a) => <rect key={a} x={49} y={64} width={2} height={8} rx={1} fill={lite(steel, pal, 0.4)} transform={`rotate(${a} 50 72)`} />)}
            <circle cx={50} cy={72} r={2.4} fill={dark(steel, pal, 0.1)} /></g>
          {[[26, 30], [74, 30], [26, 84], [74, 84]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={1} fill={lite(steel, pal, 0.5)} />)}
        </g>}
      </g>
      {[30, 80].map((y) => <rect key={y} x={12} y={y} width={4} height={8} rx={1} fill={dark(steel, pal, 0.3)} />)}
      <rect x={10} y={92} width={10} height={6} rx={1} fill={dark(steel, pal, 0.45)} /><rect x={80} y={92} width={10} height={6} rx={1} fill={dark(steel, pal, 0.45)} />
      {/* billetes que vuelan */}
      {fly > 0 && [...Array(9)].map((_, k) => {
        const h1 = hash(k + seed), h2 = hash(k * 3 + seed), f = clamp01(fly * 1.4 - k * 0.05);
        const x = 50 + (h1 - 0.5) * 90 * f, y = 56 - f * (50 + h2 * 40) + f * f * 14, r = (h1 - 0.5) * 260 * f + Math.sin(tb * 0.2 + k) * 10;
        return <g key={k} transform={`translate(${x} ${y}) rotate(${r})`} opacity={f > 0 ? 1 : 0}><rect x={-7} y={-3.5} width={14} height={7} rx={0.5} fill={lite(cash, pal, 0.2)} />
          <circle cx={0} cy={0} r={2} fill="none" stroke={dark(cash, pal, 0.3)} strokeWidth={0.5} /><rect x={-6} y={-2.6} width={12} height={5.2} fill="none" stroke={dark(cash, pal, 0.2)} strokeWidth={0.3} /></g>;
      })}
    </g>
  );
};
