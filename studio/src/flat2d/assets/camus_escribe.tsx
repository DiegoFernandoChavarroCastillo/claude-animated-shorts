// camus_escribe · fondo: Albert Camus escribe de noche en un cuarto de 1942 (la Francia ocupada). Pared con papel pintado, ventana con las cortinas
// a medio echar y reflectores que barren el cielo; él, con el pelo peinado hacia atrás, gabardina de cuello alto y un cigarrillo que humea, escribe en
// cuartillas a la luz de una lámpara de escritorio; cenicero, libros y una taza. Lienzo 100×178 (la mesa acaba en y ≈ 112). Acciones propias:
// `write` escribe mientras dura (la pluma corre, aparecen líneas); `look` levanta la vista de las cuartillas (se queda); `searchlights` los reflectores
// cruzan el cielo mientras dura.
import React from "react";
import { type AssetFC, clamp01, hash, idle, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const CamusEscribe: AssetFC = ({ pal, t, seed, p, flick }) => {
  const id = `ce${seed}`, I = idle(t, seed), wr = p.write ?? 0, lk = p.look ?? 0, sl = p.searchlights ?? 0;
  const wall = lerpHex(pal.wall, "#4A3A30", 0.35), wood = lerpHex("#6A4428", pal.ink, 0.25), coat = lerpHex("#8A7A5A", pal.ink, 0.25), skin = pal.skin, hair = "#1E1A18";
  const lamp = lerpHex(pal.glow, "#FFC870", 0.4), writing = wr > 0 && wr < 1, pen = writing ? Math.sin(t * 0.7) * 2.2 : 0;
  const headUp = clamp01(lk) * 5, by = I.breath * 0.4;
  const beam = (i: number) => { const a = (sl > 0 ? Math.sin(t * 0.03 + i * 2.1) : Math.sin(i * 2.1)) * 0.5 - 0.2; return { x2: 78 + i * 6 + Math.sin(a) * 40, y2: 18 - Math.cos(a) * 6 }; };
  return (
    <g>
      <Grad id={`${id}w`} a={lite(wall, pal, 0.08)} b={dark(wall, pal, 0.45)} />
      <Grad id={`${id}d`} a={lite(wood, pal, 0.25)} b={dark(wood, pal, 0.5)} />
      <Vol id={`${id}c`} c={coat} pal={pal} lx={0.3} ly={0.3} /><Vol id={`${id}k`} c={skin} pal={pal} lx={0.25} ly={0.4} k={0.8} />
      <rect x={-4} y={-4} width={108} height={186} fill={url(`${id}w`)} />
      {/* papel pintado */}
      {[...Array(48)].map((_, i) => <path key={i} d={`M${(i % 8) * 14 - 2} ${Math.floor(i / 8) * 18 + 4} l2 3 l-2 3 l-2 -3 Z`} fill={lite(wall, pal, 0.18)} opacity={0.35} />)}
      {/* ventana de noche con reflectores */}
      <rect x={58} y={14} width={34} height={50} fill={lerpHex("#0E1430", pal.ink, 0.3)} />
      {[...Array(14)].map((_, i) => <circle key={i} cx={60 + hash(i + 3) * 30} cy={16 + hash(i + 5) * 26} r={0.3 + hash(i) * 0.3} fill="#FFF" opacity={0.6} />)}
      {[0, 1].map((i) => { const b = beam(i); return <path key={i} d={`M${66 + i * 16} 64 L${b.x2 - 3} ${b.y2} L${b.x2 + 3} ${b.y2} Z`} fill="#E8F0FF" opacity={0.18} />; })}
      <path d="M62 64 L64 54 L70 52 L74 56 L80 50 L86 55 L90 52 L90 64 Z" fill="#0A0A14" />
      <rect x={58} y={14} width={34} height={50} fill="none" stroke={dark(wood, pal, 0.2)} strokeWidth={2} />
      <path d="M75 14 L75 64 M58 39 L92 39" stroke={dark(wood, pal, 0.2)} strokeWidth={1.2} />
      <path d="M54 10 Q60 40 57 70 L64 70 Q66 40 62 10 Z M96 10 Q90 40 93 70 L86 70 Q84 40 88 10 Z" fill={lerpHex("#6A2A2A", pal.ink, 0.35)} />
      {/* estantería con libros a la izquierda */}
      <rect x={2} y={30} width={26} height={2} fill={wood} /><rect x={2} y={52} width={26} height={2} fill={wood} />
      {[...Array(9)].map((_, i) => <rect key={i} x={3 + i * 2.8} y={21 + hash(i) * 3} width={2.4} height={9 - hash(i) * 3} fill={["#7A3A2A", "#2A4A6A", "#5A5A2A", "#3A2A4A"][i % 4]} />)}
      {[...Array(7)].map((_, i) => <rect key={`b${i}`} x={4 + i * 3.2} y={43 + hash(i + 9) * 3} width={2.8} height={9 - hash(i + 9) * 3} fill={["#2A4A3A", "#6A4A2A", "#4A2A2A"][i % 3]} />)}
      {/* halo de la lámpara */}
      <Halo id={`${id}h`} cx={26} cy={86} r={52 + 3 * flick} color={lamp} a={0.55} />
      {/* Camus: torso con gabardina, cabeza inclinada sobre el papel */}
      <path d={`M30 ${112} Q28 ${84 + by} 38 ${74 + by} L62 ${74 + by} Q72 ${84 + by} 70 112 Z`} fill={url(`${id}c`)} />
      <path d={`M42 ${74 + by} L50 ${88 + by} L58 ${74 + by} L55 ${70 + by} L50 ${80 + by} L45 ${70 + by} Z`} fill={dark(coat, pal, 0.15)} />
      <path d={`M47 ${76 + by} L50 ${86 + by} L53 ${76 + by} Z`} fill="#EDE8DC" /><path d={`M49.3 ${78 + by} L50 ${86 + by} L50.7 ${78 + by} Z`} fill="#2A2A30" />
      <g transform={`translate(0 ${-headUp}) rotate(${lerp(8, 0, clamp01(lk))} 50 ${70 + by})`}>
        <rect x={46} y={64 + by} width={8} height={8} fill={dark(skin, pal, 0.2)} />
        <ellipse cx={50} cy={55 + by} rx={9} ry={10.5} fill={url(`${id}k`)} />
        <path d={`M40.6 ${54 + by} Q40 ${42 + by} 50 ${42 + by} Q60 ${42 + by} 59.6 ${54 + by} Q58 ${46.5 + by} 50 ${46 + by} Q43 ${46 + by} 40.6 ${54 + by} Z`} fill={hair} />
        <path d={`M43 ${45 + by} Q50 ${43 + by} 57 ${45.5 + by}`} stroke={lite(hair, pal, 0.3)} strokeWidth={0.4} fill="none" />
        {/* ojos: hacia abajo al escribir, al frente al levantar la vista */}
        {lk > 0.5 ? <g><ellipse cx={46} cy={55 + by} rx={1} ry={1.1 * (1 - 0.9 * I.blink)} fill="#111" /><ellipse cx={54} cy={55 + by} rx={1} ry={1.1 * (1 - 0.9 * I.blink)} fill="#111" /></g>
          : <path d={`M44.5 ${56 + by} q1.5 0.8 3 0 M52.5 ${56 + by} q1.5 0.8 3 0`} stroke="#111" strokeWidth={0.7} fill="none" />}
        <path d={`M44 ${52.5 + by} l4 -0.4 M52 ${52.1 + by} l4 0.4`} stroke={hair} strokeWidth={0.9} />
        <path d={`M50 ${55 + by} l-1 4 l1.4 0.4`} stroke={dark(skin, pal, 0.35)} strokeWidth={0.5} fill="none" />
        <path d={`M47 ${61.5 + by} q3 0.8 6 0`} stroke={dark(skin, pal, 0.5)} strokeWidth={0.6} fill="none" />
        {/* cigarrillo en la comisura */}
        <path d={`M52.5 ${61.6 + by} l7 1.6`} stroke="#F2EEE6" strokeWidth={1.1} strokeLinecap="round" />
        <circle cx={59.6} cy={63.3 + by} r={0.6 + 0.3 * flick} fill="#FF7A3A" />
        {[...Array(5)].map((_, i) => { const k = (t * 0.012 + i * 0.2) % 1; return <circle key={i} cx={60 + Math.sin(k * 9 + i) * 3 + k * 4} cy={62 + by - k * 26} r={1 + k * 3} fill="#D8D8E0" opacity={(1 - k) * 0.25} />; })}
        <path d={`M41 ${52 + by} Q40 ${58 + by} 43 ${62 + by}`} stroke={lamp} strokeWidth={0.7} fill="none" opacity={0.7} />
      </g>
      {/* mesa */}
      <path d="M-4 100 L104 100 L104 112 L-4 112 Z" fill={url(`${id}d`)} />
      <path d="M-4 100 L104 100" stroke={lite(wood, pal, 0.5)} strokeWidth={0.8} />
      <rect x={-4} y={112} width={108} height={70} fill={dark(wood, pal, 0.65)} />
      {/* cuartillas con líneas que aparecen */}
      <path d="M36 101 L64 101 L66 96 L38 96 Z" fill="#F4EEE0" /><path d="M38 100.6 L60 100.6 L61.4 97 L39 97 Z" fill="#EAE2D0" opacity={0.6} />
      {[...Array(4)].map((_, i) => { const w = clamp01(wr * 4 - i) * 18; return w > 0 ? <path key={i} d={`M${40 + i * 0.4} ${97.4 + i * 0.8} l${w} 0`} stroke="#2A2A4A" strokeWidth={0.3} /> : null; })}
      {/* mano con la pluma */}
      <path d={`M60 ${84 + by} Q62 92 ${54 + pen} 98`} stroke={coat} strokeWidth={5.5} strokeLinecap="round" fill="none" />
      <circle cx={53 + pen} cy={98.4} r={2} fill={skin} /><path d={`M${52 + pen} 99 l-3 -6`} stroke="#1A1A1A" strokeWidth={0.7} />
      <path d={`M40 ${84 + by} Q34 92 40 98`} stroke={dark(coat, pal, 0.1)} strokeWidth={5.5} strokeLinecap="round" fill="none" />
      {/* lámpara, cenicero, taza */}
      <path d="M18 100 L28 100 L26 98 L20 98 Z" fill="#2A3A2A" /><path d="M23 98 L21 84" stroke="#2A3A2A" strokeWidth={1} />
      <path d="M14 86 Q21 76 30 84 Z" fill={lerpHex("#2A6A3A", pal.ink, 0.2)} /><ellipse cx={22} cy={85} rx={6} ry={1.2} fill={lamp} />
      <ellipse cx={74} cy={99.6} rx={5} ry={1.2} fill="#5A5A60" /><path d="M71 99 l5 -1" stroke="#EEE" strokeWidth={0.6} />
      <path d="M82 92 L88 92 L87.4 100 L82.6 100 Z" fill="#E8E2D6" /><path d="M88 94 q2.4 1 0 4" stroke="#E8E2D6" strokeWidth={0.8} fill="none" />
    </g>
  );
};
