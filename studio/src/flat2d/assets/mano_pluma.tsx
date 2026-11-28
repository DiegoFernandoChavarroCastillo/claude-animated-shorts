// mano_pluma · prop (manuscrito-voynich): primer plano de una mano en sombra que sostiene una pluma de ave y escribe símbolos inventados
// sobre una hoja de vitela, a la luz de una vela que no se ve. Un falsificador, alguien que inventa un idioma, un engaño. Lienzo 100 × 70,
// anclaje en el centro. opts.manga ("#2A2026"). Acción propia: `write` la mano avanza por el renglón y van saliendo los símbolos (se quedan).
import React from "react";
import { type AssetFC, clamp01, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";
import { Glyphs } from "./manuscrito_voynich";

export const ManoPluma: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `mp${seed}`, I = idle(t, seed), wr = p.write === undefined ? 0.35 : clamp01(p.write), writing = wr > 0 && wr < 1;
  const vel = lerpHex("#E6D3A3", pal.wallLit, 0.1), manga = String(opt(opts, "manga", "#2A2026")), sk = lerpHex(pal.skin, pal.ink, 0.35);
  const row = Math.min(3, Math.floor(wr * 4)), fr = wr * 4 - row;
  const hx = lerp(18, 80, fr) + (writing ? Math.sin(t * 0.9) * 0.8 : 0), hy = 30 + row * 7 + (writing ? Math.cos(t * 1.3) * 0.5 : 0) + I.breath * 0.3;
  return (
    <g>
      <Grad id={`${id}p`} a={lite(vel, pal, 0.2)} b={dark(vel, pal, 0.3)} /><Vol id={`${id}s`} c={sk} pal={pal} k={1} lx={0.2} ly={0.2} />
      <Halo id={`${id}h`} cx={20} cy={14} r={60} color={pal.glow} a={0.35} />
      <path d="M4 12 Q50 8 96 12 L98 66 Q50 70 2 66 Z" fill={url(`${id}p`)} />
      <Glyphs x={14} y={22} w={72} rows={1} lh={7} s={3} seed={seed} color={pal.ink} sw={0.4} />
      {[0, 1, 2, 3].map((r) => <Glyphs key={r} x={14} y={30 + r * 7} w={72} rows={1} lh={7} s={3} seed={seed + r + 1} reveal={r < row ? 1 : r === row ? fr * 0.95 : 0} color={pal.ink} sw={0.45} />)}
      {/* mano y pluma */}
      <g transform={`translate(${hx} ${hy}) scale(1.7) translate(-52 -30)`}>
        <path d="M52 30 L86 -8" stroke={lerpHex("#EDE6D8", pal.ink, 0.2)} strokeWidth={0.9} />
        <path d="M66 14 Q78 -8 96 -22 Q90 -2 72 16 Z" fill={lerpHex("#EDE6D8", pal.ink, 0.22)} />
        <path d="M68 12 Q80 -6 94 -19" stroke={dark("#EDE6D8", pal, 0.3)} strokeWidth={0.3} fill="none" />
        <path d="M51.5 30.6 L53.4 28" stroke={pal.ink} strokeWidth={1.1} strokeLinecap="round" />
        {/* manga y dorso de la mano */}
        <path d="M74 20 Q86 8 100 6 L104 30 Q90 32 80 30 Z" fill={manga} />
        <path d="M74 20 Q86 8 100 6" stroke={lite(manga, pal, 0.25)} strokeWidth={0.6} fill="none" />
        <ellipse cx={72} cy={22} rx={9} ry={6.5} transform="rotate(-30 72 22)" fill={url(`${id}s`)} />
        {/* índice sobre la pluma, pulgar debajo y dedos recogidos */}
        <path d="M58 24 L68 15" stroke={url(`${id}s`)} strokeWidth={3.6} strokeLinecap="round" />
        <path d="M57 25 Q56 26.4 57.6 26" stroke={dark(sk, pal, 0.35)} strokeWidth={0.4} fill="none" />
        <path d="M58.5 28.5 L67 24" stroke={url(`${id}s`)} strokeWidth={3.4} strokeLinecap="round" />
        {[[66, 28.5], [69.6, 28], [73, 27]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={2.3} fill={url(`${id}s`)} stroke={dark(sk, pal, 0.3)} strokeWidth={0.3} />)}
        <path d="M64 17 Q66 18 67 20 M68 19 Q70 21 70 23" stroke={dark(sk, pal, 0.35)} strokeWidth={0.35} fill="none" />
      </g>
    </g>
  );
};
