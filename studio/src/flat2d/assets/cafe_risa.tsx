// cafe_risa · fondo: una terraza de calle al atardecer: dos amigos (uno con camisa, otra con jersey y el pelo recogido) sentados a una mesita
// redonda con dos tazas de café humeantes; detrás, fachadas con toldo y ventanas encendidas y, a la derecha, la calle que se aleja dorada
// (el camino de vuelta, x ≈ 70–95). Lienzo 100×178; los pies quedan en y ≈ 110. Respiran y parpadean siempre. Acciones propias: `steam`
// el vapor sube más fuerte mientras dura; `laugh` los dos se ríen mientras dura (echan la cabeza atrás, ojos cerrados).
import React from "react";
import { type AssetFC, hash, idle } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const CafeRisa: AssetFC = ({ pal, t, seed, p }) => {
  const id = `cr${seed}`, I = idle(t, seed), J = idle(t, seed + 5), st = p.steam ?? 0, lg = p.laugh ?? 0;
  const laughing = lg > 0 && lg < 1, shakeA = laughing ? Math.abs(Math.sin(t * 0.55)) * 1.6 : 0, shakeB = laughing ? Math.abs(Math.sin(t * 0.5 + 1)) * 1.6 : 0;
  const wall = lerpHex("#E8B888", pal.wall, 0.4), awning = lerpHex("#C2452E", pal.accent, 0.3), street = lerpHex("#C8A080", pal.rock, 0.4);
  const person = (x: number, face: number, shirt: string, hairC: string, longHair: boolean, I2: ReturnType<typeof idle>, sh: number, k: string) => {
    const by = I2.breath * 0.5 - sh, tilt = laughing ? -8 * face : 0;
    return (
      <g key={k}>
        <Vol id={`${id}s${k}`} c={shirt} pal={pal} /><Vol id={`${id}k${k}`} c={pal.skin} pal={pal} k={0.7} />
        {/* silla */}
        <path d={`M${x - 8 * face} 110 L${x - 8 * face} 92 M${x + 6 * face} 110 L${x + 6 * face} 96 M${x - 9 * face} 96 L${x + 7 * face} 96`} stroke={lerpHex("#3A3A3A", pal.ink, 0.2)} strokeWidth={1.2} />
        <path d={`M${x - 9 * face} 96 L${x - 10 * face} 74`} stroke={lerpHex("#3A3A3A", pal.ink, 0.2)} strokeWidth={1.2} />
        <path d={`M${x - 2 * face} 96 L${x + 8 * face} 98 L${x + 10 * face} 110`} stroke={dark("#3A3A50", pal, 0.1)} strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d={`M${x - 8} ${96} Q${x - 9} ${78 + by} ${x - 4} ${72 + by} L${x + 4} ${72 + by} Q${x + 9} ${78 + by} ${x + 8} 96 Z`} fill={url(`${id}s${k}`)} />
        <path d={`M${x + 4 * face} ${76 + by} Q${x + 12 * face} ${86 + by} ${x + 16 * face} ${88}`} stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
        <g transform={`rotate(${tilt} ${x} ${70 + by})`}>
          <rect x={x - 2.5} y={66 + by} width={5} height={6} fill={dark(pal.skin, pal, 0.15)} />
          <circle cx={x} cy={61 + by} r={7.5} fill={url(`${id}k${k}`)} />
          <path d={`M${x - 7.8} ${61 + by} Q${x - 8} ${52 + by} ${x} ${52.5 + by} Q${x + 8} ${52 + by} ${x + 7.8} ${60 + by} Q${x + 3} ${56 + by} ${x - 4 * face} ${57 + by} Z`} fill={hairC} />
          {longHair ? <circle cx={x - 7 * face} cy={55 + by} r={3.4} fill={hairC} /> : null}
          {laughing ? <path d={`M${x + 1.5 * face} ${60 + by} q1.4 -1.2 2.8 0 M${x - 3 * face} ${60 + by} q1.2 -1 2.4 0`} stroke="#111" strokeWidth={0.7} fill="none" />
            : <g><ellipse cx={x + 2.8 * face} cy={60 + by} rx={0.8} ry={1 * (1 - 0.9 * I2.blink)} fill="#111" /><ellipse cx={x - 1.6 * face} cy={60 + by} rx={0.7} ry={0.9 * (1 - 0.9 * I2.blink)} fill="#111" /></g>}
          {laughing ? <path d={`M${x - 1 * face} ${64 + by} Q${x + 1.8 * face} ${68 + by} ${x + 4.4 * face} ${64 + by} Z`} fill="#7A2A2A" />
            : <path d={`M${x} ${64.5 + by} q${2 * face} 1.4 ${4 * face} 0`} stroke={dark(pal.skin, pal, 0.5)} strokeWidth={0.6} fill="none" />}
          <path d={`M${x + 7.4 * face} ${59 + by} q${0.6 * face} 2 0 4`} stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.7} />
        </g>
      </g>
    );
  };
  return (
    <g>
      <Grad id={`${id}w`} a={lite(wall, pal, 0.15)} b={dark(wall, pal, 0.3)} /><Grad id={`${id}st`} a={lite(street, pal, 0.35)} b={dark(street, pal, 0.5)} />
      {/* fachada con toldo y ventanas encendidas */}
      <rect x={-4} y={10} width={74} height={100} fill={url(`${id}w`)} />
      {[0, 1, 2].map((i) => <g key={i}><rect x={4 + i * 22} y={20} width={14} height={20} fill={lerpHex("#FFD890", pal.glow, 0.4)} /><path d={`M${11 + i * 22} 20 L${11 + i * 22} 40 M${4 + i * 22} 30 L${18 + i * 22} 30`} stroke={dark(wall, pal, 0.4)} strokeWidth={0.8} />
        <Halo id={`${id}v${i}`} cx={11 + i * 22} cy={30} r={14} color={pal.glow} a={0.3} /></g>)}
      <path d="M-4 48 L70 48 L74 58 L-4 58 Z" fill={awning} />
      {[...Array(10)].map((_, i) => <path key={i} d={`M${-4 + i * 7.6} 48 L${-0.2 + i * 7.6} 58`} stroke="#FFF" strokeWidth={2.4} opacity={0.5} />)}
      <path d="M-4 58 Q0 61 4 58 Q8 61 12 58 Q16 61 20 58 Q24 61 28 58 Q32 61 36 58 Q40 61 44 58 Q48 61 52 58 Q56 61 60 58 Q64 61 68 58 Q71 61 74 58" fill={awning} />
      <rect x={6} y={64} width={50} height={46} fill={dark(wall, pal, 0.55)} opacity={0.7} />
      {/* la calle del camino de vuelta, que se aleja dorada */}
      <path d="M70 110 L104 110 L104 40 L92 40 Z" fill={lerpHex(pal.bg, pal.glow, 0.3)} opacity={0.6} />
      <path d="M70 10 L104 0 L104 44 L84 60 Z" fill={dark(wall, pal, 0.2)} opacity={0.6} />
      {[...Array(5)].map((_, i) => <circle key={i} cx={80 + i * 4} cy={62 - i * 4} r={0.9} fill={pal.glow} />)}
      <path d="M-4 110 L104 110 L104 182 L-4 182 Z" fill={url(`${id}st`)} />
      <path d="M70 110 Q86 80 96 56" stroke={lite(street, pal, 0.5)} strokeWidth={1.4} fill="none" opacity={0.6} />
      {/* mesa y tazas */}
      <ContactShadow id={`${id}sh`} cx={40} cy={110.5} rx={30} />
      {person(22, 1, lerpHex("#4A7AB0", pal.accent, 0.2), "#3A2A20", false, I, shakeA, "a")}
      {person(58, -1, lerpHex("#C2785A", pal.accent, 0.2), "#6A3A20", true, J, shakeB, "b")}
      <ellipse cx={40} cy={88} rx={14} ry={2.6} fill={lerpHex("#E8E2D6", pal.wallLit, 0.2)} /><path d="M40 90 L40 110 M34 110 L46 110" stroke="#3A3A3A" strokeWidth={1.4} />
      {[34, 46].map((cx, i) => <g key={i}>
        <path d={`M${cx - 2.6} 83 L${cx + 2.6} 83 L${cx + 2} 87.6 L${cx - 2} 87.6 Z`} fill="#FFF" /><path d={`M${cx + 2.6} 84 q1.6 0.8 0 2.4`} stroke="#FFF" strokeWidth={0.7} fill="none" />
        <ellipse cx={cx} cy={83} rx={2.6} ry={0.6} fill="#5A3A20" />
        {[...Array(3)].map((_, j) => { const k = (t * (st > 0 && st < 1 ? 0.03 : 0.015) + j * 0.33 + hash(i)) % 1; return <path key={j} d={`M${cx - 1 + j} ${82 - k * 14} q${1.4} -2 0 -4`} stroke="#FFF" strokeWidth={0.7} fill="none" opacity={(1 - k) * (st > 0 && st < 1 ? 0.8 : 0.45)} />; })}
      </g>)}
    </g>
  );
};
