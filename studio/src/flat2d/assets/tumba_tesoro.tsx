// tumba_tesoro · fondo: la antecámara de la tumba de Tutankamón llena hasta el techo: a la izquierda, carros dorados desmontados con sus
// ruedas; al fondo, los tres lechos rituales con cabezas de vaca (con el disco solar entre los cuernos), de león y de hipopótamo, con
// cofres y jarrones de alabastro debajo; a la derecha, las dos estatuas guardianas negras con nemes y faldellín de oro a los lados de la
// puerta sellada; delante, cofres, el trono de oro y vasos. Suelo de roca oscuro desde y ≈ 108 (la franja de subtítulos queda oscura).
// Lienzo 100 × 178. opts: `luz` 0..1 (0 = solo se ve un círculo junto a la vela, en `cx`,`cy` del lienzo, por defecto 24, 92; 1 = toda la
// sala a la luz de las antorchas). Acciones propias: `reveal` la luz se abre desde la vela hasta toda la sala (se queda); `glint` destellos
// sobre el oro mientras dura.
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const TumbaTesoro: AssetFC = ({ pal, t, seed, p, opts, flick }) => {
  const id = `tt${seed}`, luz = p.reveal !== undefined ? Math.max(opt(opts, "luz", 1), clamp01(p.reveal)) : opt(opts, "luz", 1);
  const cx = opt(opts, "cx", 24), cy = opt(opts, "cy", 92), gl = p.glint ?? 0;
  const gold = lerpHex("#E2AE3C", pal.glow, 0.15), wall = lerpHex("#B88A56", pal.wall, 0.35), rock = lerpHex("#3A2618", pal.ink, 0.35);
  const black = lerpHex("#16110E", pal.ink, 0.3), alab = lerpHex("#EDE2C8", pal.wallLit, 0.2), wood = lerpHex("#7A4A26", pal.rock, 0.3);
  const lapis = lerpHex("#1E3C8C", pal.ink, 0.1), red = lerpHex("#B8402E", pal.accent, 0.2);
  const wheel = (x: number, y: number, r: number, k: number) => (
    <g key={`w${k}`}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={url(`${id}g`)} strokeWidth={r * 0.18} />
      {[...Array(6)].map((_, j) => { const a = (j / 6) * Math.PI + k; return <path key={j} d={`M${x - Math.cos(a) * r} ${y - Math.sin(a) * r} L${x + Math.cos(a) * r} ${y + Math.sin(a) * r}`} stroke={gold} strokeWidth={r * 0.08} />; })}
      <circle cx={x} cy={y} r={r * 0.18} fill={gold} />
    </g>
  );
  const chest = (x: number, y: number, w: number, h: number, k: number, c = wood) => (
    <g key={`c${k}`}>
      <rect x={x} y={y - h} width={w} height={h} fill={c} stroke={dark(c, pal, 0.4)} strokeWidth={0.3} />
      <path d={`M${x} ${y - h} Q${x + w / 2} ${y - h - h * 0.35} ${x + w} ${y - h} Z`} fill={lite(c, pal, 0.15)} />
      <rect x={x + w * 0.1} y={y - h * 0.8} width={w * 0.8} height={h * 0.55} fill="none" stroke={gold} strokeWidth={0.35} />
      {[0.25, 0.5, 0.75].map((f) => <circle key={f} cx={x + w * f} cy={y - h * 0.52} r={0.5} fill={k % 2 ? lapis : red} />)}
    </g>
  );
  const vase = (x: number, y: number, s: number, k: number) => (
    <g key={`v${k}`}><path d={`M${x - 1.6 * s} ${y} Q${x - 2.6 * s} ${y - 4 * s} ${x - 1 * s} ${y - 7 * s} L${x - 1.4 * s} ${y - 8.6 * s} L${x + 1.4 * s} ${y - 8.6 * s} L${x + 1 * s} ${y - 7 * s} Q${x + 2.6 * s} ${y - 4 * s} ${x + 1.6 * s} ${y} Z`} fill={alab} stroke={dark(alab, pal, 0.3)} strokeWidth={0.25} /></g>
  );
  // un lecho ritual: patas de animal, cuerpo largo y cabeza (vaca, león o hipopótamo)
  const couch = (x: number, y: number, kind: number) => (
    <g key={`l${kind}`}>
      <path d={`M${x} ${y} L${x + 30} ${y} L${x + 30} ${y + 3} L${x} ${y + 3} Z`} fill={url(`${id}g`)} />
      {[x + 2, x + 26].map((lx) => <path key={lx} d={`M${lx} ${y + 3} L${lx} ${y + 16} M${lx - 1} ${y + 16} h3`} stroke={gold} strokeWidth={1.6} />)}
      <path d={`M${x} ${y + 1} Q${x - 4} ${y - 6} ${x - 2} ${y - 12}`} stroke={gold} strokeWidth={2.4} fill="none" />
      {kind === 0 && <g><ellipse cx={x - 2} cy={y - 14} rx={3} ry={3.6} fill={gold} />{[0, 1].map((j) => <circle key={j} cx={x - 3 + j * 2.4} cy={y - 14.4} r={0.6} fill={lapis} />)}
        <path d={`M${x - 6} ${y - 18} Q${x - 2} ${y - 13} ${x + 2} ${y - 18}`} stroke={gold} strokeWidth={0.9} fill="none" /><circle cx={x - 2} cy={y - 19.6} r={1.8} fill={red} /></g>}
      {kind === 1 && <g><circle cx={x - 2} cy={y - 14} r={3.8} fill={gold} /><circle cx={x - 2} cy={y - 14} r={4.6} fill="none" stroke={dark(gold, pal, 0.2)} strokeWidth={1.2} strokeDasharray="0.8 0.6" />
        {[0, 1].map((j) => <circle key={j} cx={x - 3.4 + j * 2.8} cy={y - 14.8} r={0.6} fill={lapis} />)}</g>}
      {kind === 2 && <g><path d={`M${x - 6} ${y - 12} Q${x - 4} ${y - 18} ${x} ${y - 16} Q${x + 1} ${y - 11} ${x - 2} ${y - 9} Z`} fill={gold} />
        <path d={`M${x - 6} ${y - 12} L${x - 2} ${y - 11}`} stroke={red} strokeWidth={0.6} /><circle cx={x - 2} cy={y - 15.6} r={0.6} fill={lapis} /></g>}
      {chest(x + 5, y + 16, 9, 6, kind)}{vase(x + 20, y + 16, 1, kind)}
    </g>
  );
  // estatua guardiana: piel negra, nemes, collar y faldellín de oro, bastón y maza
  const guard = (x: number, k: number) => (
    <g key={`g${k}`}>
      <rect x={x - 6} y={98} width={12} height={4} fill={black} />
      <path d={`M${x - 2.6} 98 L${x - 2.2} 82 M${x + 2.6} 98 L${x + 2.2} 82`} stroke={black} strokeWidth={2.4} />
      <path d={`M${x - 4.6} 82 L${x + 4.6} 82 L${x + 5.6} 72 L${x - 5.6} 72 Z`} fill={url(`${id}g`)} />
      <path d={`M${x - 4.4} 72 Q${x - 5} 62 ${x} 61 Q${x + 5} 62 ${x + 4.4} 72 Z`} fill={black} />
      <path d={`M${x - 4.4} 63.4 Q${x} 67 ${x + 4.4} 63.4`} stroke={gold} strokeWidth={1.2} fill="none" />
      <circle cx={x} cy={57.6} r={3.2} fill={black} /><path d={`M${x - 4} 59 Q${x - 4} 52.4 ${x} 52.6 Q${x + 4} 52.4 ${x + 4} 59 L${x + 4.6} 64 L${x - 4.6} 64 Z`} fill={gold} />
      {[0, 1, 2].map((j) => <path key={j} d={`M${x - 4.4} ${55 + j * 2.6} h8.8`} stroke={lapis} strokeWidth={0.6} />)}
      <circle cx={x - 1.2} cy={58} r={0.5} fill="#fff" /><circle cx={x + 1.2} cy={58} r={0.5} fill="#fff" />
      <path d={`M${x + (k ? -6 : 6)} 64 L${x + (k ? -6 : 6)} 99`} stroke={gold} strokeWidth={0.9} />
    </g>
  );
  const sparks = gl > 0 && gl < 1 ? [...Array(12)].map((_, i) => {
    const ph = ((t * 0.06 + hash(seed + i) * 6) % 1), a = Math.sin(ph * Math.PI);
    const x = 10 + hash(seed + i * 3) * 80, y = 70 + hash(seed + i * 7) * 32, r = 1.4 * a;
    return <g key={i} opacity={a} style={{ mixBlendMode: "screen" }}><path d={`M${x - r * 2} ${y} L${x + r * 2} ${y} M${x} ${y - r * 2} L${x} ${y + r * 2}`} stroke="#FFF6D0" strokeWidth={0.4} /><circle cx={x} cy={y} r={r * 0.4} fill="#fff" /></g>;
  }) : null;
  const R = lerp(16, 230, luz) * (0.97 + 0.03 * flick);
  return (
    <g>
      <Grad id={`${id}w`} a={lite(wall, pal, 0.1)} b={dark(wall, pal, 0.35)} /><Grad id={`${id}r`} a={dark(rock, pal, 0.1)} b={dark(rock, pal, 0.5)} />
      <Vol id={`${id}g`} c={gold} pal={pal} k={1} />
      <defs><radialGradient id={`${id}d`} cx={cx} cy={cy} r={R} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={pal.ink} stopOpacity={0} /><stop offset="0.55" stopColor={pal.ink} stopOpacity={0.15 * (1 - luz)} /><stop offset="1" stopColor={pal.ink} stopOpacity={lerp(0.97, 0.45, luz)} />
      </radialGradient></defs>
      {/* muros y techo de roca enlucida */}
      <rect x={-30} y={0} width={160} height={110} fill={url(`${id}w`)} />
      <rect x={-30} y={0} width={160} height={34} fill={dark(wall, pal, 0.45)} />
      {[...Array(16)].map((_, i) => <circle key={i} cx={-20 + hash(seed + i) * 140} cy={40 + hash(seed + i * 5) * 30} r={0.6 + hash(i) * 0.8} fill={dark(wall, pal, 0.3)} opacity={0.5} />)}
      {/* puerta sellada entre las guardianas */}
      <rect x={70} y={56} width={18} height={44} fill={lite(wall, pal, 0.1)} stroke={dark(wall, pal, 0.3)} strokeWidth={0.4} />
      {[...Array(9)].map((_, i) => <ellipse key={i} cx={72.6 + (i % 3) * 6.4} cy={62 + Math.floor(i / 3) * 12} rx={1.8} ry={1.4} fill={dark(red, pal, 0.2)} opacity={0.8} />)}
      {guard(64, 0)}{guard(94, 1)}
      {/* carros desmontados a la izquierda */}
      <path d="M-8 92 Q2 74 18 80 L20 92 Z" fill={url(`${id}g`)} /><path d="M-4 84 Q6 76 16 82" stroke={lapis} strokeWidth={0.7} fill="none" />
      {wheel(-2, 96, 7, 0)}{wheel(12, 98, 6, 1.2)}{wheel(4, 86, 5.4, 0.6)}
      <path d="M18 88 L34 74" stroke={gold} strokeWidth={1.4} />
      {/* los tres lechos rituales al fondo */}
      {couch(18, 72, 0)}{couch(34, 76, 1)}{couch(48, 80, 2)}
      {/* suelo de roca */}
      <path d="M-30 104 Q50 100 130 104 L130 178 L-30 178 Z" fill={url(`${id}r`)} />
      {/* delante: trono de oro, cofres y vasos */}
      <g>
        <rect x={40} y={92} width={13} height={14} fill={url(`${id}g`)} /><rect x={41.6} y={93.4} width={9.8} height={8} fill={lapis} opacity={0.8} />
        <path d="M42 96 q2 -2 4 0 q2 2 4 0" stroke={gold} strokeWidth={0.6} fill="none" />
        <rect x={38} y={104} width={17} height={3} fill={gold} />
        {[39, 53].map((x) => <path key={x} d={`M${x} 107 L${x} 112 l2 0`} stroke={gold} strokeWidth={1.2} />)}
        <circle cx={38.6} cy={102} r={1.6} fill={gold} /><circle cx={54.4} cy={102} r={1.6} fill={gold} />
      </g>
      {chest(20, 112, 12, 7, 3, lerpHex("#E8D8B0", pal.wallLit, 0.1))}{chest(58, 112, 10, 6, 4)}{chest(84, 110, 14, 8, 5, lerpHex(gold, wood, 0.3))}
      {vase(72, 112, 1.3, 6)}{vase(76, 113, 1, 7)}{vase(33, 113, 1.1, 8)}
      {sparks}
      {/* oscuridad: solo se ve lo que alcanza la luz */}
      <rect x={-30} y={0} width={160} height={178} fill={url(`${id}d`)} />
      <Halo id={`${id}h`} cx={cx} cy={cy} r={lerp(14, 60, luz)} color={pal.glow} a={0.35 + 0.15 * flick} />
    </g>
  );
};
