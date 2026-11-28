// satelite · prop (senal-wow): un satélite de los años setenta en órbita: cuerpo cilíndrico envuelto en lámina dorada, dos paneles
// solares azules con su cuadrícula, una antena parabólica y una varilla; gira despacio sobre sí mismo. Lienzo 100 × 60, anclaje en el
// centro. Acción propia: `emit` lanza arcos de señal hacia abajo (mientras dura): una interferencia, una emisión humana, ruido de la Tierra.
import React from "react";
import { type AssetFC, clamp01, idle } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

export const Satelite: AssetFC = ({ pal, t, seed, p }) => {
  const id = `st${seed}`, I = idle(t, seed), em = clamp01(p.emit ?? 0), emitting = em > 0 && em < 1;
  const gold = lerpHex("#D8A840", pal.wallLit, 0.1), panel = lerpHex("#2A4A9C", pal.ink, 0.15), sig = "#FFB070";
  const pnl = (x: number) => (
    <g>
      <rect x={x} y={24} width={30} height={12} fill={panel} stroke={lite(panel, pal, 0.4)} strokeWidth={0.4} />
      {[1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${x + i * 5} 24 L${x + i * 5} 36`} stroke={lite(panel, pal, 0.3)} strokeWidth={0.2} />)}
      <path d={`M${x} 30 L${x + 30} 30`} stroke={lite(panel, pal, 0.3)} strokeWidth={0.2} />
      <path d={`M${x + 2} 25 L${x + 12} 25`} stroke="#FFFFFF" strokeWidth={0.4} opacity={0.4 + 0.3 * Math.sin(t * 0.05)} />
    </g>
  );
  return (
    <g transform={`translate(50 30) rotate(${I.sway * 6 + t * 0.02}) translate(-50 -30)`}>
      <Grad id={`${id}g`} h a={dark(gold, pal, 0.4)} mid={lite(gold, pal, 0.3)} b={dark(gold, pal, 0.45)} />
      {emitting ? [0, 1, 2].map((i) => { const k = ((t * 0.03 + i / 3) % 1); return <path key={i} d={`M${50 - 6 - k * 14} ${42 + k * 16} Q50 ${48 + k * 22} ${50 + 6 + k * 14} ${42 + k * 16}`} stroke={sig} strokeWidth={0.8} fill="none" opacity={1 - k} style={{ mixBlendMode: "screen" }} />; }) : null}
      <path d="M14 30 L86 30" stroke={dark(gold, pal, 0.3)} strokeWidth={0.8} />
      {pnl(8)}{pnl(62)}
      <rect x={42} y={20} width={16} height={20} rx={1.5} fill={url(`${id}g`)} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M42 ${23 + i * 4.5} L58 ${24 + i * 4.5}`} stroke={dark(gold, pal, 0.35)} strokeWidth={0.25} opacity={0.6} />)}
      <path d="M50 20 L50 10" stroke={lite(gold, pal, 0.3)} strokeWidth={0.5} />
      <circle cx={50} cy={9.5} r={0.8} fill={sig} />
      <path d="M44 40 Q50 50 56 40 Z" fill={lerpHex("#E8ECF2", pal.ink, 0.15)} />
      <path d="M50 44 L50 47" stroke={lite(gold, pal, 0.2)} strokeWidth={0.4} />
      {emitting ? <Halo id={`${id}h`} cx={50} cy={46} r={7} color={sig} a={0.6} /> : null}
    </g>
  );
};
