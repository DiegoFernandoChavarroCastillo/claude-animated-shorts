// burro · personaje: un burro gris visto de frente (D132, asno de Buridán): cuerpo en barril, cuatro patas con cascos, pecho claro,
// cabeza larga con hocico blanco, ollares, ojos grandes y dos orejas largas con interior rosado; crin corta y cola que se mueve.
// Lienzo 100 × 120, anclaje en los pies. Respira, mueve las orejas y parpadea siempre.
// opts.mira -1..1 (gira la cabeza a la izquierda / derecha), opts.flaco 0..1 (costillas, orejas caídas).
// Acciones propias: `mira_izq` y `mira_der` giran la cabeza hacia ese lado (se quedan); `dudar` gira la cabeza a un lado y al otro
// mientras dura y vuelve al centro; `caer` se desploma tumbado con los ojos cerrados en X (se queda): muere de hambre y sed.
import React from "react";
import { type AssetFC, clamp01, idle, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Vol, dark, lite, url } from "./shade";

export const Burro: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `bu${seed}`, { breath, sway, blink } = idle(t, seed);
  const du = p.dudar ?? 0, dud = du > 0 && du < 1 ? Math.sin(du * Math.PI * 4) * Math.min(1, Math.sin(du * Math.PI) * 2.5) : 0;
  const mira = Math.max(-1, Math.min(1, opt(opts, "mira", 0) - clamp01(p.mira_izq ?? 0) + clamp01(p.mira_der ?? 0) + dud));
  const fall = clamp01(p.caer ?? 0), fl = Math.max(clamp01(opt(opts, "flaco", 0)), fall * 0.8);
  const coat = lerpHex("#8E8A86", pal.wall, 0.15), belly = lerpHex("#D9D3C8", pal.wallLit, 0.2), mane = dark(coat, pal, 0.55);
  const hoof = dark("#3A322C", pal, 0.2), inner = "#D89A9A";
  // al caer: el cuerpo baja y se inclina, las patas se doblan
  const drop = fall * 30, tilt = fall * 14;
  const legH = 34 * (1 - fall * 0.75);
  const hx = 50 + mira * 13, hr = mira * 16 + fall * 26, ear = 6 * Math.sin(t * 0.05 + seed) * (1 - fall) - fl * 22;
  const eyesX = fall > 0.6;
  return (
    <g>
      <Vol id={`${id}c`} c={coat} pal={pal} k={1} lx={0.35} ly={0.2} /><Vol id={`${id}b`} c={belly} pal={pal} k={0.7} />
      <ContactShadow id={`${id}s`} cx={50} cy={119} rx={34 + fall * 10} a={0.4} />
      <g transform={`translate(0 ${drop}) rotate(${tilt} 50 100)`}>
        {/* cola */}
        <path d={`M72 66 Q${84 + sway * 4} 78 ${80 + sway * 6} ${96 - fall * 10}`} stroke={dark(coat, pal, 0.3)} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d={`M${80 + sway * 6} ${96 - fall * 10} l-2 6 l4 -1 l2 5 l1 -9 Z`} fill={mane} />
        {/* patas traseras y delanteras */}
        {[30, 41, 59, 70].map((x, i) => (
          <g key={x}>
            <rect x={x - 3.6} y={86} width={7.2} height={legH} rx={3} fill={i === 0 || i === 3 ? dark(coat, pal, 0.18) : url(`${id}c`)} />
            <rect x={x - 4.2} y={86 + legH - 4} width={8.4} height={5} rx={1.6} fill={hoof} />
          </g>))}
        {/* cuerpo en barril con costillas si está flaco */}
        <g transform={`translate(50 74) scale(${1 - fl * 0.12 + breath * 0.012} ${1 + breath * 0.02}) translate(-50 -74)`}>
          <ellipse cx={50} cy={72} rx={27} ry={21} fill={url(`${id}c`)} />
          <ellipse cx={50} cy={82} rx={16} ry={9} fill={url(`${id}b`)} opacity={0.9} />
          {fl > 0.15 && [0, 1, 2, 3].map((k) => <path key={k} d={`M${30 + k * 2} ${62 + k * 5} q8 -2 14 1 M${70 - k * 2} ${62 + k * 5} q-8 -2 -14 1`} stroke={dark(coat, pal, 0.35)} strokeWidth={0.7} fill="none" opacity={fl} />)}
        </g>
        {/* cuello (detrás de la cabeza) y crin corta sobre la nuca */}
        <path d={`M38 66 Q${hx - 12} 46 ${hx - 9} 34 L${hx + 9} 34 Q${hx + 12} 46 62 66 Z`} fill={dark(coat, pal, 0.12)} />
        <path d={`M${hx - 7} 32 Q${hx} 28 ${hx + 7} 32`} stroke={mane} strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* cabeza */}
        <g transform={`rotate(${hr} ${hx} 38)`}>
          {[-1, 1].map((s) => (
            <g key={s} transform={`rotate(${s * (14 + ear * s * 0.6) + s * fl * 18} ${hx + s * 5} 18)`}>
              <path d={`M${hx + s * 5} 18 Q${hx + s * 12} -2 ${hx + s * 8} -14 Q${hx + s * 3} -2 ${hx + s * 2} 18 Z`} fill={url(`${id}c`)} />
              <path d={`M${hx + s * 4.8} 15 Q${hx + s * 9} 0 ${hx + s * 7.6} -9 Q${hx + s * 4.6} 0 ${hx + s * 3.6} 15 Z`} fill={inner} opacity={0.85} />
              <path d={`M${hx + s * 8} -14 l${s * 0.6} 4 l${-s * 2.2} 0 Z`} fill={mane} />
            </g>))}
          <path d={`M${hx - 11} 22 Q${hx - 13} 10 ${hx} 9 Q${hx + 13} 10 ${hx + 11} 22 L${hx + 9} 46 Q${hx} 52 ${hx - 9} 46 Z`} fill={url(`${id}c`)} />
          <path d={`M${hx - 3} 10 l3 -5 l3 5 Z`} fill={mane} />
          <ellipse cx={hx} cy={47} rx={10.5} ry={8} fill={url(`${id}b`)} />
          {[-1, 1].map((s) => <ellipse key={s} cx={hx + s * 4} cy={48} rx={1.6} ry={2.2} fill={dark(belly, pal, 0.6)} />)}
          <path d={`M${hx - 4} 53 Q${hx} ${55 - fl * 2} ${hx + 4} 53`} stroke={dark(belly, pal, 0.5)} strokeWidth={0.8} fill="none" />
          {[-1, 1].map((s) => {
            const ex = hx + s * 7 + mira * 1.2;
            return eyesX
              ? <path key={s} d={`M${ex - 2} 23 l4 4 M${ex + 2} 23 l-4 4`} stroke={pal.ink} strokeWidth={1.2} />
              : <g key={s}><ellipse cx={ex} cy={25} rx={2.9} ry={3.3 * (1 - blink * 0.9)} fill="#1C1614" />
                  <circle cx={ex + 0.9} cy={23.8} r={0.9} fill="#fff" opacity={1 - blink} />
                  <path d={`M${ex - 3.4} ${21.4 + fl * 1.5} q3.4 -2 6.8 0`} stroke={dark(coat, pal, 0.5)} strokeWidth={0.8} fill="none" /></g>;
          })}
          <path d={`M${hx - 9} 16 Q${hx - 4} 13 ${hx} 13`} stroke={lite(coat, pal, 0.4)} strokeWidth={0.8} fill="none" opacity={0.7} />
        </g>
      </g>
    </g>
  );
};
