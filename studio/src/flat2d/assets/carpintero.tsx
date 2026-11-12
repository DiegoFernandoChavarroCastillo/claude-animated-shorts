// carpintero · personaje: un carpintero griego con una rodilla en el suelo, mirando a la derecha, con túnica de trabajo ceñida, cinta en el pelo y
// barba corta; sujeta una tabla con la izquierda y un martillo con la derecha. Respira y parpadea siempre. opts: `tabla` nueva | vieja (nueva).
// Acciones propias: `hammer` da martillazos mientras dura (saltan astillas en el clavo); `pull` arranca la tabla vieja, la levanta y la tira hacia
// atrás (se queda con la mano libre); `swap_plank` la tabla que sujeta pasa de vieja a nueva (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Vol, dark, lite, url } from "./shade";

export const Carpintero: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `cp${seed}`, I = idle(t, seed), hm = p.hammer ?? 0, pl = p.pull ?? 0, sp = p.swap_plank ?? 0;
  const oldW = lerpHex(lerpHex(pal.rock, "#6A6A58", 0.35), pal.ink, 0.4), newW = lerpHex("#E0A858", pal.wallLit, 0.12);
  const vieja = (opt(opts, "tabla", "nueva") === "vieja" || pl > 0) && sp < 0.5, wood = vieja ? oldW : newW;
  const cloth = lerpHex(pal.accent, pal.rock, 0.45), skin = pal.skin, hair = lerpHex(pal.ink, pal.rock, 0.3);
  const hitting = hm > 0 && hm < 1, cyc = hitting ? (t * 0.16) % 1 : 0.9, strike = hitting ? (cyc < 0.3 ? cyc / 0.3 : 1 - (cyc - 0.3) / 0.7) ** 1.4 : 0;
  const by = I.breath * 0.5, lean = strike * 4;
  // tabla: delante a la altura de la cintura; al arrancarla sube sobre la cabeza y sale volando hacia atrás
  const lift = clamp01(pl / 0.45), toss = clamp01((pl - 0.45) / 0.55);
  const px = lerp(62, 30, lift) - toss * 70, py = lerp(104, 40, lift) - toss * 20 + toss * toss * 110, prot = -lift * 15 - toss * 260;
  const lh = toss > 0 ? { x: lerp(46, 58, toss), y: lerp(44, 112, toss) } : { x: lerp(66, px + 10, lift), y: lerp(108, py + 4, lift) };   // mano izquierda
  const rh = hitting ? { x: lerp(78, 88, strike), y: lerp(42, 104, strike) + by } : { x: 72, y: 104 + by }, ang = hitting ? lerp(-2.0, -0.15, strike) : 0.5;   // mano derecha y ángulo del martillo (en reposo, a la cintura; al golpear sube por fuera de la cara)
  const hx = rh.x + Math.cos(ang) * 13, hy = rh.y + Math.sin(ang) * 13, chips = hitting && cyc > 0.28 && cyc < 0.55;
  const arm = (sx: number, sy: number, x: number, y: number, col: string, w: number) => {
    const mx = (sx + x) / 2 + (y - sy) * 0.18, my = (sy + y) / 2 + 6;
    return <path d={`M${sx} ${sy} Q${mx} ${my} ${x} ${y}`} stroke={col} strokeWidth={w} strokeLinecap="round" fill="none" />;
  };
  return (
    <g>
      <Vol id={`${id}c`} c={cloth} pal={pal} /><Vol id={`${id}k`} c={skin} pal={pal} k={0.7} /><Grad id={`${id}w`} a={lite(wood, pal, 0.2)} b={dark(wood, pal, 0.2)} />
      <ContactShadow id={`${id}s`} cx={46} cy={154} rx={30} />
      {/* piernas: rodilla izquierda en el suelo (detrás), pie derecho delante */}
      <path d={`M44 ${126 + by} L38 151 L20 152.5`} stroke={dark(skin, pal, 0.22)} strokeWidth={8.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M52 ${126 + by} L70 130 L70 151`} stroke={skin} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx={74} cy={152.5} rx={6} ry={2.5} fill={dark(pal.rock, pal, 0.4)} /><ellipse cx={17} cy={152.5} rx={4.5} ry={2.2} fill={dark(pal.rock, pal, 0.5)} />
      <g transform={`rotate(${lean} 48 128)`}>
        {/* brazo izquierdo (detrás) */}
        {arm(42, 82 + by, lh.x, lh.y, dark(skin, pal, 0.22), 6.5)}
        {/* torso: túnica ceñida con cinturón y un hombro al aire */}
        <path d={`M36 ${130 + by} Q31 ${104 + by} 37 ${78 + by} Q48 ${73 + by} 60 ${78 + by} Q66 ${104 + by} 61 ${130 + by} Z`} fill={url(`${id}c`)} />
        <path d={`M48 ${75 + by} Q56 ${74 + by} 60 ${78 + by} L55 ${90 + by} Z`} fill={url(`${id}k`)} />
        <path d={`M35 ${110 + by} Q48 ${113 + by} 63 ${110 + by}`} stroke={dark(cloth, pal, 0.5)} strokeWidth={2.2} fill="none" />
        <path d={`M60 ${80 + by} Q65 ${104 + by} 61 ${128 + by}`} stroke={lite(cloth, pal, 0.5)} strokeWidth={0.9} fill="none" opacity={0.7} />
        <rect x={45} y={68 + by} width={8} height={8} fill={dark(skin, pal, 0.1)} />
        {/* cabeza */}
        <circle cx={51} cy={58 + by} r={13} fill={url(`${id}k`)} />
        <path d={`M38.5 ${57 + by} Q39 ${43 + by} 52 ${43.5 + by} Q63 ${44 + by} 64 ${54 + by} Q58 ${50 + by} 49 ${51 + by} Q43 ${53 + by} 40.5 ${61 + by} Z`} fill={hair} />
        <path d={`M38.5 ${53 + by} Q51 ${46.5 + by} 64.5 ${51 + by}`} stroke={pal.accent} strokeWidth={2} fill="none" />
        <path d={`M43 ${64 + by} Q45 ${73 + by} 53 ${73 + by} Q61 ${72 + by} 62 ${65 + by} Q57 ${67 + by} 52 ${67 + by} Q47 ${67 + by} 43 ${64 + by} Z`} fill={hair} />
        <ellipse cx={58} cy={57 + by} rx={1.2} ry={1.5 * (1 - 0.9 * I.blink)} fill={pal.ink} />
        <path d={`M55.5 ${53.6 + by} L60.5 ${53 + by - strike * 0.8}`} stroke={hair} strokeWidth={1} strokeLinecap="round" />
        <path d={`M63.6 ${57 + by} L66 ${61 + by} L63.4 ${62 + by}`} stroke={dark(skin, pal, 0.3)} strokeWidth={0.8} fill="none" />
      </g>
      {/* la tabla */}
      {toss < 1 ? (
        <g transform={`rotate(${prot} ${px + 17} ${py + 4})`} opacity={1 - clamp01((toss - 0.75) / 0.25)}>
          <rect x={px} y={py} width={36} height={8} rx={0.8} fill={url(`${id}w`)} />
          <path d={`M${px + 2} ${py + 3} q10 -1.2 28 0.4`} stroke={dark(wood, pal, 0.35)} strokeWidth={0.4} fill="none" />
          {vieja ? <path d={`M${px + 8} ${py + 1} l2 2.5 l-1 1.5 l2.5 2 M${px + 22} ${py + 2} l1.5 2 l-1 2`} stroke={dark(wood, pal, 0.6)} strokeWidth={0.6} fill="none" />
            : <circle cx={px + 30} cy={py + 4} r={0.9} fill={lerpHex(pal.rim, "#9A9AA0", 0.5)} />}
        </g>
      ) : null}
      <circle cx={lh.x} cy={lh.y} r={3.3} fill={dark(skin, pal, 0.15)} />
      {/* brazo derecho con el martillo */}
      {arm(56, 82 + by, rh.x, rh.y, skin, 6.8)}
      <path d={`M${rh.x} ${rh.y} L${hx} ${hy}`} stroke={lerpHex("#A07040", pal.rock, 0.3)} strokeWidth={1.8} strokeLinecap="round" />
      <rect x={hx - 3.2} y={hy - 1.8} width={6.4} height={3.6} rx={0.8} transform={`rotate(${(ang * 180) / Math.PI + 90} ${hx} ${hy})`} fill={lerpHex("#7A7A84", pal.ink, 0.2)} />
      <circle cx={rh.x} cy={rh.y} r={3.4} fill={skin} />
      {chips ? [...Array(7)].map((_, i) => { const k = (cyc - 0.28) / 0.27, a = -0.3 - hash(i + Math.floor(t * 0.16)) * 2.4, r = 3 + k * 12 * (0.5 + hash(i * 3)), cx = 92 + Math.cos(a) * r, cy = 108 + Math.sin(a) * r + k * k * 6; return (
        <rect key={i} x={cx} y={cy} width={1.6} height={0.6} rx={0.3} fill={i % 2 ? pal.glow : newW} opacity={1 - k} transform={`rotate(${i * 40} ${cx} ${cy})`} />
      ); }) : null}
    </g>
  );
};
