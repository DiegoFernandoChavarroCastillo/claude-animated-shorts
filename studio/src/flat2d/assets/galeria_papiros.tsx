// galeria_papiros · fondo: Wadi al-Jarf, junto al mar Rojo. Un farallón de roca del desierto con la boca de una galería tallada (donde se guardaban
// los barcos) cerrada por grandes bloques de caliza; detrás del bloque de la derecha, en un hueco oscuro, rollos de papiro apretados. Al fondo, la
// franja azul del mar Rojo (y ≈ 92–100) y el suelo de arena donde pisan los personajes (y ≈ 106–110). Va sobre `cielo`.
// Acciones propias: `push` el bloque de la derecha se aparta y cae polvo (se queda: queda a la vista el hueco con los rollos); `glow` los rollos se
// iluminan con un halo cálido (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const GaleriaPapiros: AssetFC = ({ pal, t, seed, p }) => {
  const id = `gp${seed}`, ps = clamp01(p.push ?? 0), gl = clamp01(p.glow ?? 0);
  const rock = lerpHex(lerpHex("#B07A4A", pal.rock, 0.35), pal.wall, 0.15), sand = lerpHex("#E2B878", pal.wallLit, 0.2), lime = lerpHex("#EDE3CC", pal.wallLit, 0.25);
  const sea = lerpHex("#2C7FA8", pal.bg, 0.2), papy = lerpHex("#E8D29A", pal.wallLit, 0.2);
  const bx = 54 + ps * ps * 26, shake = ps > 0 && ps < 1 ? Math.sin(t * 1.7) * 0.4 : 0;
  return (
    <g>
      <Grad id={`${id}m`} a={lerpHex(sea, pal.glow, 0.35)} b={dark(sea, pal, 0.15)} /><Grad id={`${id}s`} a={lite(sand, pal, 0.1)} mid={dark(sand, pal, 0.55)} b={dark(sand, pal, 0.7)} at={0.12} />
      <Grad id={`${id}r`} a={lite(rock, pal, 0.25)} b={dark(rock, pal, 0.35)} /><Vol id={`${id}l`} c={lime} pal={pal} k={0.8} />
      <Grad id={`${id}d`} a={dark(rock, pal, 0.75)} b={dark(rock, pal, 0.9)} />
      {/* el mar Rojo al fondo, con destellos */}
      <rect x={-40} y={91} width={180} height={12} fill={url(`${id}m`)} />
      {[...Array(16)].map((_, i) => { const x = ((hash(i * 2.1 + seed) * 170 + t * 0.04) % 170) - 35; return <rect key={i} x={x} y={92 + hash(i * 3.7) * 8} width={2 + hash(i) * 5} height={0.4} fill={pal.glow} opacity={0.5} />; })}
      {/* montes lejanos de la costa */}
      <path d="M-30 92 L-5 84 L12 88 L30 80 L48 86 L70 82 L100 87 L130 83 L130 92 Z" fill={lerpHex(rock, pal.bg, 0.5)} />
      {/* arena */}
      <rect x={-40} y={100} width={180} height={90} fill={url(`${id}s`)} />
      {[...Array(30)].map((_, i) => { const x = hash(i * 1.7 + seed) * 150 - 25, y = 112 + hash(i * 4.3) * 60; return <ellipse key={i} cx={x} cy={y} rx={1 + hash(i) * 3} ry={0.35} fill={dark(sand, pal, 0.3)} opacity={0.5} />; })}
      {/* el farallón de roca */}
      <path d="M-30 106 L-30 66 L-20 60 L-12 62 L-4 52 L4 55 L10 46 L18 50 L26 41 L34 47 L42 40 L50 45 L58 38 L66 44 L74 36 L84 46 L92 42 L100 50 L110 47 L130 54 L130 106 Z" fill={url(`${id}r`)} />
      {/* grietas y vetas sueltas de la roca, manchas de sombra */}
      {[...Array(26)].map((_, i) => { const x = hash(i * 3.1 + seed) * 150 - 25, y = 52 + hash(i * 5.7) * 50, w = 4 + hash(i * 2.2) * 10; return <path key={i} d={`M${x} ${y} l${w * 0.4} ${hash(i) * 2 - 1} l${w * 0.3} ${hash(i * 7) * 3} l${w * 0.3} ${-hash(i * 9) * 2}`} stroke={dark(rock, pal, 0.35)} strokeWidth={0.35} fill="none" opacity={0.65} />; })}
      {[...Array(10)].map((_, i) => <ellipse key={`m${i}`} cx={hash(i * 6.1 + seed) * 140 - 20} cy={56 + hash(i * 2.9) * 44} rx={4 + hash(i) * 7} ry={2 + hash(i * 4) * 3} fill={dark(rock, pal, 0.2)} opacity={0.35} />)}
      <path d="M-30 66 L-20 60 L-12 62 L-4 52 L4 55 L10 46 L18 50 L26 41 L34 47 L42 40 L50 45 L58 38 L66 44 L74 36 L84 46 L92 42 L100 50 L110 47 L130 54" stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.6} />
      {/* boca de la galería, tallada a escuadra */}
      <rect x={28} y={64} width={52} height={42} fill={url(`${id}d`)} />
      <path d="M27 106 L27 63 L81 63 L81 106" stroke={dark(rock, pal, 0.55)} strokeWidth={1} fill="none" />
      {/* el hueco detrás del bloque derecho, con los rollos de papiro apretados */}
      {gl > 0 && <Halo id={`${id}g`} cx={66} cy={98} r={16 * gl} color={pal.glow} a={0.7} />}
      {[...Array(6)].map((_, i) => {
        const cx = 59 + (i % 3) * 6.2, cy = 103.5 - Math.floor(i / 3) * 4.4;
        return (
          <g key={i}>
            <rect x={cx - 2.9} y={cy - 2} width={6} height={4.2} rx={2} fill={lerpHex(papy, pal.ink, 0.25 - gl * 0.2)} />
            <ellipse cx={cx + 3} cy={cy + 0.1} rx={1.3} ry={2.1} fill={lerpHex(papy, pal.wallLit, 0.2 + gl * 0.3)} />
            <path d={`M${cx + 3} ${cy - 1.2} q-0.8 1.2 0 2.4`} stroke={dark(papy, pal, 0.5)} strokeWidth={0.25} fill="none" />
          </g>
        );
      })}
      {/* bloques de caliza que sellan la entrada */}
      <rect x={28} y={64} width={52} height={17} fill={url(`${id}l`)} />
      <rect x={28} y={81.4} width={25.6} height={24.6} fill={url(`${id}l`)} />
      <g transform={`translate(${bx - 54 + shake} 0)`}>
        <rect x={54} y={81.4} width={26} height={24.6} fill={url(`${id}l`)} />
        <path d="M54 81.4 L80 81.4" stroke={lite(lime, pal, 0.5)} strokeWidth={0.5} />
        <path d="M62 86 l2 3 l-1 3 M72 95 l-2 2" stroke={dark(lime, pal, 0.3)} strokeWidth={0.3} fill="none" />
        {/* signos de tinta roja de los canteros */}
        <path d="M66 90 l3 0 m-1.5 -1.5 l0 3" stroke={lerpHex(pal.accent, "#B03A2E", 0.5)} strokeWidth={0.5} />
      </g>
      <path d="M28 81.2 L80 81.2 M53.8 81.4 L53.8 106" stroke={dark(lime, pal, 0.45)} strokeWidth={0.4} />
      {/* rendija que deja ver un rollo antes de apartar el bloque */}
      <rect x={53.8} y={82} width={0.7 + ps * 2} height={23.5} fill={dark(rock, pal, 0.85)} />
      {/* polvo que cae al moverse el bloque */}
      {ps > 0.05 && [...Array(18)].map((_, i) => {
        const k = clamp01(ps * 1.4 - hash(i * 2.9) * 0.4), x = lerp(52, 84, hash(i * 5.3 + seed)), y = lerp(80, 107, k) + hash(i) * 3;
        return <circle key={i} cx={x + Math.sin(t * 0.2 + i) * 0.6} cy={y} r={0.4 + hash(i * 7) * 0.8} fill={sand} opacity={0.75 * (1 - k * 0.6) * (k > 0 ? 1 : 0)} />;
      })}
      {ps > 0.1 && <ellipse cx={lerp(70, 80, ps)} cy={106} rx={10 + ps * 8} ry={2.5} fill={sand} opacity={0.35 * (1 - ps * 0.5)} />}
      {/* piedras sueltas al pie */}
      {[...Array(7)].map((_, i) => <ellipse key={i} cx={8 + i * 14 + hash(i) * 6} cy={107 + hash(i * 2) * 3} rx={1.5 + hash(i * 5) * 2} ry={0.9} fill={dark(rock, pal, 0.2)} />)}
    </g>
  );
};
