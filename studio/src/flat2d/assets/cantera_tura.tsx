// cantera_tura · fondo: las canteras de Tura, en la orilla este del Nilo. Un farallón de caliza blanquísima tallado en escalones, con bloques
// a medio cortar y otros listos al pie; una cuadrilla arrastra un bloque sobre un trineo de madera hacia el muelle; abajo, el Nilo azul con su
// orilla de palmeras enfrente. Suelo donde pisan los personajes: y ≈ 96–102; agua desde y ≈ 105 (un barco flota con la línea de flotación en y ≈ 0,62 del cuadro). Va sobre `cielo`.
// Acciones propias: `haul` la cuadrilla arrastra el trineo hacia el muelle mientras dura (se queda donde llega); `chisel` saltan esquirlas de los
// cinceles en el farallón mientras dura.
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grad, dark, lite, url } from "./shade";

export const CanteraTura: AssetFC = ({ pal, t, seed, p }) => {
  const id = `ct${seed}`, hl = clamp01(p.haul ?? 0), ch = p.chisel ?? 0, chiseling = ch > 0 && ch < 1;
  const lime = lerpHex("#F2ECDD", pal.wallLit, 0.3), shadow = lerpHex(lime, pal.rock, 0.35), sand = lerpHex("#DDB57A", pal.wallLit, 0.2);
  const river = lerpHex("#2F78A2", pal.bg, 0.2), palm = lerpHex("#4E7A3A", pal.rock, 0.25);
  const sx = lerp(14, 50, hl);   // trineo
  return (
    <g>
      <Grad id={`${id}c`} a={lite(lime, pal, 0.3)} b={shadow} /><Grad id={`${id}s`} a={lite(sand, pal, 0.1)} b={dark(sand, pal, 0.2)} />
      <Grad id={`${id}r`} a={lerpHex(river, pal.glow, 0.3)} b={dark(river, pal, 0.3)} />
      <g transform="translate(0 -8)">
      {/* farallón de caliza en escalones */}
      <path d="M-30 104 L-30 40 L-6 40 L-6 52 L14 52 L14 62 L34 62 L34 74 L58 74 L58 86 L80 86 L80 96 L130 96 L130 104 Z" fill={url(`${id}c`)} />
      {[[-30, 40, 24], [-6, 52, 20], [14, 62, 20], [34, 74, 24], [58, 86, 22]].map(([x, y, w], i) => (
        <g key={i}>
          <path d={`M${x} ${y} L${x + w} ${y}`} stroke={lite(lime, pal, 0.6)} strokeWidth={0.7} />
          <rect x={x + w - 0.8} y={y} width={1.6} height={12} fill={shadow} opacity={0.7} />
          {[...Array(3)].map((_, j) => <path key={j} d={`M${x + 3 + j * (w / 3)} ${y + 1} l0 ${10}`} stroke={dark(lime, pal, 0.18)} strokeWidth={0.35} />)}
          <path d={`M${x} ${y + 6} L${x + w} ${y + 6}`} stroke={dark(lime, pal, 0.15)} strokeWidth={0.3} />
        </g>
      ))}
      {/* canteros diminutos con cincel en los escalones */}
      {[[2, 52], [24, 62], [46, 74]].map(([x, y], i) => {
        const hit = chiseling ? Math.abs(Math.sin(t * 0.4 + i)) : 0.3;
        return (
          <g key={i}>
            <path d={`M${x} ${y} l0 -4.5`} stroke={dark(pal.skin, pal, 0.1)} strokeWidth={1.6} strokeLinecap="round" />
            <circle cx={x} cy={y - 5.6} r={1.1} fill={pal.ink} />
            <path d={`M${x + 0.6} ${y - 3.4} l${2 + hit} ${-1 + hit * 1.5}`} stroke={dark(pal.skin, pal, 0.1)} strokeWidth={0.8} strokeLinecap="round" />
            {chiseling && hit > 0.85 && [...Array(4)].map((_, k) => <circle key={k} cx={x + 3 + hash(k + Math.floor(t * 0.3)) * 3} cy={y - 2 - hash(k * 3 + Math.floor(t * 0.3)) * 3} r={0.35} fill={lime} />)}
          </g>
        );
      })}
      {/* explanada de arena y bloques listos */}
      <rect x={-40} y={96} width={180} height={18} fill={url(`${id}s`)} />
      {[[66, 100], [76, 101], [86, 100]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y - 4.5} width={8} height={4.5} fill={lite(lime, pal, 0.1)} />
          <path d={`M${x} ${y - 4.5} l1.5 -1.2 l8 0 l-1.5 1.2 Z`} fill={lite(lime, pal, 0.5)} /><path d={`M${x + 8} ${y - 4.5} l1.5 -1.2 l0 4.5 l-1.5 1.2 Z`} fill={shadow} />
        </g>
      ))}
      {/* el trineo con su bloque y la cuadrilla que tira de la cuerda */}
      <g>
        <path d={`M${sx - 7} 106.5 L${sx + 7} 106.5 q2 0 2.5 -1.5`} stroke={lerpHex("#8A5A30", pal.rock, 0.3)} strokeWidth={1} fill="none" />
        <rect x={sx - 6} y={99} width={12} height={7} fill={lite(lime, pal, 0.15)} />
        <path d={`M${sx - 6} 99 l1.8 -1.4 l12 0 l-1.8 1.4 Z`} fill={lite(lime, pal, 0.5)} /><path d={`M${sx + 6} 99 l1.8 -1.4 l0 7 l-1.8 1.4 Z`} fill={shadow} />
        <path d={`M${sx + 8} 104 L${sx + 30} 101`} stroke={lerpHex("#C8A060", pal.rock, 0.3)} strokeWidth={0.45} />
        {[...Array(5)].map((_, i) => {
          const x = sx + 12 + i * 4.2, step = hl > 0 && hl < 1 ? Math.sin(t * 0.35 + i) : 0;
          return (
            <g key={i}>
              <path d={`M${x} 106.5 L${x - 1.6} 101.5 L${x + 1.8} 98`} stroke={dark(pal.skin, pal, 0.15)} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d={`M${x - 1.6} 101.5 l${1.4 + step} 5`} stroke={dark(pal.skin, pal, 0.25)} strokeWidth={1.3} strokeLinecap="round" />
              <rect x={x - 2.4} y={100.6} width={2.4} height={1.8} fill={lime} />
              <circle cx={x + 2.4} cy={97} r={1.1} fill={pal.ink} />
            </g>
          );
        })}
        {/* un chorro de agua delante del trineo para que deslice */}
        {hl > 0 && hl < 1 && <ellipse cx={sx + 8} cy={106.8} rx={2.4} ry={0.5} fill={river} opacity={0.6} />}
      </g>
      {/* el Nilo y la orilla de enfrente */}
      <rect x={-40} y={113} width={180} height={90} fill={url(`${id}r`)} />
      <path d="M-40 113 L140 113" stroke={pal.wallLit} strokeWidth={0.6} opacity={0.6} />
      {[...Array(26)].map((_, i) => { const x = ((hash(i * 1.9 + seed) * 170 + t * 0.05 * (0.5 + hash(i))) % 170) - 35, y = 116 + hash(i * 4.4) * 50; return <rect key={i} x={x} y={y} width={2 + hash(i * 2) * 7} height={0.45} rx={0.2} fill={pal.wallLit} opacity={0.25} />; })}
      {/* muelle de piedra */}
      <rect x={52} y={106} width={30} height={7.5} fill={dark(lime, pal, 0.12)} />
      <path d="M52 106 L82 106" stroke={lite(lime, pal, 0.5)} strokeWidth={0.5} />
      {/* palmeras de la orilla */}
      {[[96, 98], [104, 97], [-4, 40]].slice(0, 2).map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y} Q${x - 1} ${y - 9} ${x + 1} ${y - 17}`} stroke={lerpHex("#7A5A36", pal.rock, 0.3)} strokeWidth={1.1} fill="none" />
          {[...Array(6)].map((_, k) => { const a = -Math.PI + (k / 5) * Math.PI + Math.sin(t * 0.04 + k) * 0.06; return <path key={k} d={`M${x + 1} ${y - 17} q${Math.cos(a) * 4} ${Math.sin(a) * 3 - 1} ${Math.cos(a) * 7} ${Math.sin(a) * 3 + 2.5}`} stroke={palm} strokeWidth={1} fill="none" />; })}
        </g>
      ))}
      </g>
    </g>
  );
};
