// trono_oro · escenario: el trono de oro de Tutankamón visto de tres cuartos y muy grande: patas de león, cabezas de león en el frente del
// asiento, brazos con serpientes aladas, respaldo alto con la escena del rey y su esposa bajo los rayos del sol, incrustaciones de
// lapislázuli, turquesa y vidrio rojo. Lienzo 100 × 140, anclaje abajo; el asiento queda en y ≈ 86 (para sentar a `tutankamon` con
// `opts.sentado`, sus muslos a ~0,6 del alto del trono). Acción propia: `shine` un destello recorre el oro (se queda el brillo).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const TronoOro: AssetFC = ({ pal, t, seed, p }) => {
  const id = `to${seed}`, sh = clamp01(p.shine ?? 0);
  const gold = lerpHex("#E8B640", pal.glow, 0.15), lapis = lerpHex("#1E3C8C", pal.ink, 0.1), turq = lerpHex("#2FA3A0", pal.bg, 0.1);
  const red = lerpHex("#B8402E", pal.accent, 0.2), skin = lerpHex("#A86A3E", pal.skin, 0.2), linen = lerpHex("#F2EEE2", pal.wallLit, 0.2);
  const sx = lerp(-20, 120, ((t % 180) / 180)), lion = (x: number, k: number) => (
    <g key={k}>
      <path d={`M${x} 92 L${x} 132 Q${x} 136 ${x + 4} 136 L${x + 7} 136 L${x + 6} 132 L${x + 5} 92 Z`} fill={url(`${id}g`)} />
      {[0, 1, 2].map((j) => <path key={j} d={`M${x + 1 + j * 1.6} 136 v-2`} stroke={dark(gold, pal, 0.4)} strokeWidth={0.4} />)}
      <circle cx={x + 2.6} cy={88} r={4.6} fill={url(`${id}g`)} /><circle cx={x + 2.6} cy={88} r={5.6} fill="none" stroke={dark(gold, pal, 0.25)} strokeWidth={1.4} strokeDasharray="1 0.7" />
      <circle cx={x + 1.4} cy={87} r={0.6} fill={lapis} /><circle cx={x + 3.8} cy={87} r={0.6} fill={lapis} /><path d={`M${x + 1.6} 90 q1 0.8 2 0`} stroke={dark(gold, pal, 0.4)} strokeWidth={0.5} fill="none" />
    </g>
  );
  return (
    <g>
      <Vol id={`${id}g`} c={gold} pal={pal} k={1} /><Grad id={`${id}w`} a="#ffffff00" mid="#ffffffaa" b="#ffffff00" h />
      <defs><clipPath id={`${id}c`}><path d="M18 4 L82 4 L82 92 L18 92 Z M10 86 L90 86 L90 136 L10 136 Z" /></clipPath></defs>
      {sh > 0 && <Halo id={`${id}h`} cx={50} cy={60} r={70} color={pal.glow} a={0.4 * sh} />}
      <ContactShadow id={`${id}s`} cx={50} cy={137} rx={46} />
      {/* respaldo */}
      <rect x={20} y={6} width={60} height={82} rx={2} fill={url(`${id}g`)} />
      <rect x={24} y={10} width={52} height={70} fill={lapis} opacity={0.85} />
      {/* escena del respaldo: el sol con rayos, la reina unge al rey sentado */}
      <circle cx={50} cy={20} r={4} fill={red} stroke={gold} strokeWidth={0.8} />
      {[...Array(9)].map((_, i) => { const a = Math.PI * (0.12 + i * 0.095); return <path key={i} d={`M${50 + Math.cos(a) * 4} ${20 + Math.sin(a) * 4} L${50 + Math.cos(a) * 30} ${20 + Math.sin(a) * 30}`} stroke={gold} strokeWidth={0.5} />; })}
      <g>
        <path d="M34 76 L34 58 Q37 52 41 56 L42 76 Z" fill={linen} /><circle cx={37} cy={50} r={3.4} fill={skin} /><path d="M33.6 49 Q37 43 40.4 49" fill={lapis} stroke={gold} strokeWidth={0.4} />
        <path d="M56 76 L57 56 Q61 52 64 56 L66 76 Z" fill={linen} /><circle cx={60} cy={50} r={3.2} fill={skin} /><path d="M56.6 50 Q60 44 63.4 50 L64 54" fill={lapis} stroke={gold} strokeWidth={0.4} />
        <path d="M57 58 L46 56" stroke={skin} strokeWidth={1.2} /><circle cx={45.4} cy={56} r={1} fill={gold} />
      </g>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={25 + i * 7.4} y={80} width={5} height={3} fill={i % 2 ? turq : red} />)}
      {/* brazos con serpientes aladas */}
      {[[14, 1], [86, -1]].map(([x, d]) => (
        <g key={x}><path d={`M${x} 88 L${x} 56 Q${x + d * 4} 50 ${x + d * 6} 56 L${x + d * 6} 88 Z`} fill={url(`${id}g`)} />
          <path d={`M${x + d * 1} 80 Q${x + d * 3} 66 ${x + d * 1} 60 q${d * 2} -3 ${d * 3} 0`} stroke={turq} strokeWidth={1.4} fill="none" />
          {[0, 1, 2].map((j) => <path key={j} d={`M${x + d * 1} ${70 + j * 4} l${d * 4} -2`} stroke={red} strokeWidth={0.8} />)}</g>
      ))}
      {/* asiento con cojín y faldón */}
      <path d="M10 86 L90 86 L92 94 L8 94 Z" fill={url(`${id}g`)} />
      <path d="M12 84 Q50 80 88 84 L90 88 L10 88 Z" fill={red} opacity={0.9} />
      <path d="M14 94 L86 94 L84 112 L16 112 Z" fill={dark(gold, pal, 0.1)} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${20 + i * 8.6} 96 l3 14`} stroke={lapis} strokeWidth={1.2} />)}
      {lion(12, 0)}{lion(81, 1)}
      <path d="M17 118 L83 118" stroke={gold} strokeWidth={2} /><path d="M17 118 L83 118" stroke={lapis} strokeWidth={0.6} strokeDasharray="2 2" />
      <g clipPath={`url(#${id}c)`} style={{ mixBlendMode: "screen" }} opacity={0.5 + 0.4 * sh}>
        <rect x={sx - 8} y={-20} width={16} height={180} fill={url(`${id}w`)} transform={`rotate(22 ${sx} 70)`} />
      </g>
    </g>
  );
};
