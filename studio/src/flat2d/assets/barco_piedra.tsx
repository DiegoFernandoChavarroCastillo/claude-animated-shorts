// barco_piedra · escenario: barco de carga egipcio de madera de perfil, mirando a la derecha, con la proa y la popa curvas, el timón de espadilla
// a popa, un mástil con vela cuadrada de lino, cuatro remeros sentados y bloques de caliza blanca atados en cubierta. Cabecea siempre.
// Línea de flotación en y ≈ 46 del lienzo (anclaje 0,77). opts: `bloques` 1..3 (2), `vela` (true).
// Acciones propias: `row` los remeros bogan mientras dura (ondas en el agua); `load` un bloque baja colgado de cuerdas hasta la cubierta (se queda).
import React from "react";
import { type AssetFC, clamp01, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Vol, dark, lite, url } from "./shade";

export const BarcoPiedra: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `bp${seed}`, I = idle(t, seed), nb = opt(opts, "bloques", 2), vela = opt(opts, "vela", true);
  const rw = p.row ?? 0, rowing = rw > 0 && rw < 1, ld = p.load;
  const wood = lerpHex("#9A6236", pal.rock, 0.3), linen = lerpHex("#F2E6C8", pal.wallLit, 0.3), stone = lerpHex("#F7F1E2", pal.wallLit, 0.3);
  const bob = I.bob * 0.6, tilt = I.sway * 1.2;
  const cyc = rowing ? (t * 0.12) % 1 : 0.25, sweep = Math.sin(cyc * Math.PI * 2);
  const blocks = [...Array(nb)].map((_, i) => ({ x: 30 + i * 13, w: 11, h: 7 }));
  const drop = ld === undefined ? 1 : clamp01(ld);
  return (
    <g transform={`translate(0 ${bob}) rotate(${tilt} 50 44)`}>
      <Grad id={`${id}h`} a={lite(wood, pal, 0.25)} b={dark(wood, pal, 0.45)} /><Grad id={`${id}v`} a={lite(linen, pal, 0.3)} b={dark(linen, pal, 0.15)} h />
      <Vol id={`${id}k`} c={pal.skin} pal={pal} k={0.6} /><Grad id={`${id}b`} a={lite(stone, pal, 0.3)} b={dark(stone, pal, 0.18)} />
      {/* mástil y vela */}
      {vela && <g>
        <rect x={48.6} y={2} width={1.4} height={38} fill={dark(wood, pal, 0.2)} />
        <path d={`M30 5 L70 5 Q${68 + I.sway} 18 70 30 L30 30 Q${32 + I.sway} 18 30 5 Z`} fill={url(`${id}v`)} />
        <path d="M30 5 L70 5 M30 30 L70 30" stroke={dark(wood, pal, 0.3)} strokeWidth={0.9} />
        {[38, 46, 54, 62].map((x) => <path key={x} d={`M${x} 5.5 L${x} 29.5`} stroke={dark(linen, pal, 0.18)} strokeWidth={0.3} opacity={0.6} />)}
        <path d="M49 2 L10 38 M49 2 L92 37" stroke={dark(wood, pal, 0.4)} strokeWidth={0.25} />
      </g>}
      {/* bloques de caliza blanca atados en cubierta */}
      {blocks.map((b, i) => {
        const last = i === blocks.length - 1, yy = last ? lerp(-30, 0, drop * drop) : 0;
        return (
          <g key={i} transform={`translate(0 ${yy + 3.2})`}>
            {last && drop < 1 && <path d={`M${b.x + 2} ${32.5 - b.h} L${b.x + 5.5} -40 L${b.x + b.w - 2} ${32.5 - b.h}`} stroke={dark(wood, pal, 0.2)} strokeWidth={0.4} fill="none" />}
            <rect x={b.x} y={33 - b.h} width={b.w} height={b.h} rx={0.3} fill={url(`${id}b`)} />
            <path d={`M${b.x} ${33 - b.h} l2 -1.6 l${b.w} 0 l-2 1.6`} fill={lite(stone, pal, 0.5)} />
            <path d={`M${b.x + b.w} ${33 - b.h} l2 -1.6 l0 ${b.h} l-2 1.6 Z`} fill={dark(stone, pal, 0.3)} />
            <path d={`M${b.x + 3} ${33 - b.h} l0 ${b.h} M${b.x + b.w - 3} ${33 - b.h} l0 ${b.h}`} stroke={lerpHex("#A0703A", pal.rock, 0.3)} strokeWidth={0.5} />
          </g>
        );
      })}
      {/* remeros sentados (dos delante del mástil, dos detrás) con sus remos */}
      {[14, 22, 80, 88].map((x, i) => {
        const lean = rowing ? sweep * 2.2 : 0, ox = x + lean, oa = rowing ? -0.55 + sweep * 0.35 : -0.5;
        return (
          <g key={i}>
            <path d={`M${ox} 31 L${ox + Math.cos(oa + 1.9) * 22} ${31 + Math.sin(oa + 1.9) * 22}`} stroke={dark(wood, pal, 0.1)} strokeWidth={0.8} strokeLinecap="round" />
            <path d={`M${x - 2} 37 Q${x - 2.5} 31 ${ox} 29`} stroke={dark(pal.skin, pal, 0.15)} strokeWidth={3} strokeLinecap="round" fill="none" />
            <rect x={x - 3} y={33.5} width={5} height={3} rx={0.6} fill={linen} />
            <circle cx={ox + 0.4} cy={26.8} r={2} fill={url(`${id}k`)} />
            <path d={`M${ox - 1.8} 26.6 Q${ox} 24 ${ox + 2} 26.4 L${ox + 1.9} 27.8 L${ox - 2} 28 Z`} fill={pal.ink} />
          </g>
        );
      })}
      {/* casco curvo: proa (derecha) y popa (izquierda) levantadas */}
      <path d="M2 30 Q6 38 14 41 Q50 47 86 41 Q94 38 99 26 Q96 34 88 36 L12 36.5 Q5 35 2 30 Z" fill={url(`${id}h`)} />
      <path d="M12 36.5 L88 36" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${12 + i * 0.5} ${38.3 + i * 1.5} Q50 ${43 + i * 1.6} ${88 - i * 0.6} ${38 + i * 1.4}`} stroke={dark(wood, pal, 0.5)} strokeWidth={0.25} fill="none" opacity={0.7} />)}
      <path d="M99 26 q1.5 -3 0 -5" stroke={dark(wood, pal, 0.2)} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d="M2 30 q-1.2 -3 0.5 -5.5" stroke={dark(wood, pal, 0.2)} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      {/* timón de espadilla a popa */}
      <path d={`M10 28 L${3 + I.sway} 49`} stroke={dark(wood, pal, 0.3)} strokeWidth={1.1} strokeLinecap="round" />
      <path d={`M${3.6 + I.sway} 44 l-2 6 l2.8 0.4 Z`} fill={dark(wood, pal, 0.3)} />
      {/* ondas en el agua: siempre algo, más al bogar */}
      {[...Array(5)].map((_, i) => { const ph = (t * 0.03 + i / 5) % 1, x = lerp(4, 96, i / 4); return <path key={i} d={`M${x - 3 - ph * 4} ${46.5 + ph} q${3 + ph * 4} ${-1} ${6 + ph * 8} 0`} stroke={pal.wallLit} strokeWidth={0.35} fill="none" opacity={(rowing ? 0.7 : 0.35) * (1 - ph)} />; })}
    </g>
  );
};
