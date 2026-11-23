// reloj_pulsera · prop (lienzo 100 × 100, anclaje en el centro): primer plano del reloj de pulsera que Cooper le deja a Murph: caja de
// acero, esfera oscura con índices, agujas y segundero, y la correa de cuero que sale arriba y abajo. El segundero avanza.
// Acción propia: `morse` el segundero se queda quieto y tiembla adelante y atrás en golpes cortos y largos mientras dura (el mensaje
// en código Morse desde el teseracto).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Halo, url } from "./shade";

const MORSE = "1110111010100011101110111000101110100010101110001";   // golpe (1) y silencio (0), patrón fijo

export const RelojPulsera: AssetFC = ({ pal, t, seed, p }) => {
  const id = `rp${seed}`, mo = p.morse ?? 0, active = mo > 0 && mo < 1;
  const tick = active ? (MORSE[Math.floor(t / 3) % MORSE.length] === "1" ? 1 : 0) : 0;
  const sA = active ? 120 + tick * 7 * Math.sin(t * 2.1) : (Math.floor(t / 30) * 6) % 360;
  const steel = "#C8CCD2", leather = "#5A3A24";
  const hand = (deg: number, len: number, w: number, c: string) => <line x1={50} y1={50} x2={50 + Math.sin((deg * Math.PI) / 180) * len} y2={50 - Math.cos((deg * Math.PI) / 180) * len} stroke={c} strokeWidth={w} strokeLinecap="round" />;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F6F8" /><stop offset="0.5" stopColor={steel} /><stop offset="1" stopColor="#6A6E76" /></linearGradient>
        <radialGradient id={`${id}d`} cx="0.4" cy="0.35"><stop offset="0" stopColor="#2A3040" /><stop offset="1" stopColor="#0C0E14" /></radialGradient>
        <linearGradient id={`${id}l`} x1="0" x2="1"><stop offset="0" stopColor={lerpHex(leather, pal.ink, 0.3)} /><stop offset="0.5" stopColor={leather} /><stop offset="1" stopColor={lerpHex(leather, pal.ink, 0.4)} /></linearGradient>
      </defs>
      <rect x={36} y={-10} width={28} height={40} rx={3} fill={url(`${id}l`)} /><rect x={36} y={70} width={28} height={40} rx={3} fill={url(`${id}l`)} />
      {[2, 10, 82, 90].map((y) => <line key={y} x1={38} y1={y} x2={62} y2={y} stroke={lerpHex(leather, "#C8A070", 0.3)} strokeWidth={0.4} strokeDasharray="1 1" />)}
      {tick ? <Halo id={`${id}h`} cx={50} cy={50} r={40} color="#FFE2A8" a={0.4} /> : null}
      <circle cx={50} cy={50} r={28} fill={url(`${id}s`)} />
      <circle cx={50} cy={50} r={23.5} fill={url(`${id}d`)} />
      {[...Array(12)].map((_, i) => { const a = (i * 30 * Math.PI) / 180; return <rect key={i} x={49.4} y={29} width={1.2} height={i % 3 ? 2.4 : 4} fill="#E8ECF0" transform={`rotate(${i * 30} 50 50)`} />; })}
      <rect x={77} y={47} width={4} height={6} rx={1} fill={url(`${id}s`)} />
      {hand(305, 12, 2.2, "#E8ECF0")}{hand(62, 18, 1.5, "#E8ECF0")}
      {hand(sA, 20, 0.6 + tick * 0.3, "#FF6A3A")}
      <circle cx={50} cy={50} r={1.4} fill="#FF6A3A" />
      <path d="M32 36 Q42 26 58 27" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.16} strokeLinecap="round" />
      {active ? [...Array(4)].map((_, k) => <circle key={k} cx={50} cy={50} r={28 + ((t * 0.6 + k * 6) % 24)} fill="none" stroke="#FFD890" strokeWidth={0.3} opacity={tick * (1 - ((t * 0.6 + k * 6) % 24) / 24) * clamp01(hash(k) + 0.5)} />) : null}
    </g>
  );
};
