// biblioteca_alejandria · El Museo y la Biblioteca de Alejandría al amanecer: pórtico de columnas blancas con friso, nichos de rollos entre las columnas, el Faro al fondo y el mar.
// `sunrise` el cielo pasa de la noche al amanecer y la luz entra por el pórtico (se queda); `empty` las siluetas de sabios se van apagando y las repisas quedan huecas poco a poco (se queda vacío).
import React from "react";
import { type AssetFC, hash, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { Grad, Halo, url, dark, lite } from "./shade";

export const BibliotecaAlejandria: AssetFC = ({ pal, p, t, seed }) => {
  const id = `ba${seed}`, sr = clamp01(p.sunrise ?? 0), em = clamp01(p.empty ?? 0), stone = lerpHex(pal.wallLit, pal.wall, 0.35);
  const sky = lerpHex(pal.bg, lerpHex(pal.accent, pal.glow, 0.5), 0.15 + 0.6 * sr), sea = lerpHex(pal.bg, pal.accent, 0.3 + 0.2 * sr);
  const cols = [6, 22, 38, 54, 70, 86];
  return (
    <g>
      <Grad id={`${id}s`} a={lerpHex(pal.bg, pal.accent, 0.3 * sr)} b={lerpHex(sky, pal.glow, 0.5 * sr)} />
      <rect x={-2} y={-2} width={104} height={104} fill={url(`${id}s`)} />
      <Halo id={`${id}sun`} cx={50} cy={lerp(100, 74, sr)} r={46} color={pal.glow} a={0.85 * sr} />
      {/* mar y faro */}
      <rect x={-2} y={84} width={104} height={26} fill={sea} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${8 + hash(i) * 80} ${87 + i * 2.6} l${8 + (i % 3) * 3} 0`} stroke={pal.glow} strokeWidth={0.5} opacity={0.2 + 0.4 * sr} />)}
      <path d="M90 88 L91 52 L97 52 L98 88Z" fill={dark(stone, pal, 0.4)} /><path d="M91.5 52 L92.5 42 L95.5 42 L96.5 52Z" fill={dark(stone, pal, 0.3)} /><path d="M92.5 42 Q94 37 95.5 42Z" fill={pal.rim} />
      {/* pórtico */}
      <path d="M-2 28 L102 28 L102 36 L-2 36Z" fill={lite(stone, pal, 0.1)} /><path d="M-2 28 L50 14 L102 28Z" fill={stone} /><path d="M-2 28 L50 14 L102 28" stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.5 + 0.4 * sr} />
      <rect x={-2} y={36} width={104} height={50} fill={dark(pal.rock, pal, 0.55)} />
      {/* repisas de rollos entre columnas */}
      {[14, 30, 46, 62, 78].map((x0, c) => [0, 1, 2].map((r) => [...Array(4)].map((_, j) => { const gone = hash(c * 9 + r * 3 + j + seed) < em * 1.05; return gone ? null : <rect key={`${c}${r}${j}`} x={x0 + 1.4 + j * 3} y={42 + r * 13} width={2.4} height={9} rx={1.1} fill={lerpHex(pal.wallLit, pal.skin, 0.4)} opacity={0.85 - 0.25 * (1 - sr)} />; })))}
      {/* sabios */}
      {[22, 54, 76].map((x, i) => <g key={i} opacity={0.9 * (1 - em)} transform={`translate(${x} ${84 + Math.sin(t * 0.04 + i) * 0.3})`}><path d="M-2.6 0 L-2 -9 Q0 -12 2 -9 L2.6 0Z" fill={lerpHex(pal.wallLit, pal.rock, 0.3)} /><circle cx={0} cy={-12.5} r={1.7} fill={pal.skin} /></g>)}
      {cols.map((x, i) => <g key={i}><rect x={x - 3} y={36} width={6} height={50} fill={stone} /><rect x={x - 3} y={36} width={2} height={50} fill={lite(stone, pal, 0.2)} opacity={0.6} /><rect x={x - 4.2} y={34} width={8.4} height={3} fill={lite(stone, pal, 0.1)} /><rect x={x - 4.2} y={84} width={8.4} height={3} fill={dark(stone, pal, 0.2)} /></g>)}
      <rect x={-2} y={86} width={104} height={24} fill={dark(pal.rock, pal, 0.4)} /><path d="M-2 86 L102 86" stroke={pal.rim} strokeWidth={0.4} opacity={0.5} />
      <Grain n={70} w={100} h={100} seed={seed * 3 + 1} a={stone} b={pal.ink} rMax={0.5} />
    </g>
  );
};
