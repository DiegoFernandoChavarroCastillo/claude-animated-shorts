// espejo · prop (heraclito-rio): espejo de pie, ovalado, con marco de madera torneada; dentro, el reflejo de medio cuerpo de una persona que respira y
// parpadea, y un brillo que cruza el cristal. Lienzo 100 × 150, anclaje en la base. opts.color (ropa del reflejo, "#3A5A8C"), opts.color2 (ropa tras
// `change`, "#8E4A7A"), opts.pelo ("#3A2A20"). Acciones propias: `change` el reflejo cambia despacio y se queda distinto (otra ropa, canas, se
// desplaza a destiempo): ya no eres quien eras; `ripple` el cristal ondula como el agua de un río mientras dura (el reflejo se deforma y se recompone).
import React from "react";
import { type AssetFC, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const Espejo: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `es${seed}`, I = idle(t, seed + 5), ch = p.change ?? 0, rp = p.ripple ?? 0, rippling = rp > 0 && rp < 1;
  const c1 = String(opt(opts, "color", "#3A5A8C")), c2 = String(opt(opts, "color2", "#8E4A7A")), pelo = String(opt(opts, "pelo", "#3A2A20"));
  const ropa = lerpHex(c1, c2, ch), hair = lerpHex(pelo, "#C8C4BC", ch * 0.8), wood = lerpHex("#7A4E2C", pal.rock, 0.3);
  const glass = lerpHex(lerpHex("#9EC4D8", pal.wall, 0.4), pal.ink, 0.15), lag = Math.sin(ch * Math.PI) * 4 + ch * 1.5;
  const cx = 50, cy = 60, rx = 29, ry = 43;
  const wave = (y: number) => (rippling ? Math.sin(y * 0.35 + t * 0.35) * 2.2 * Math.sin(rp * Math.PI) : 0);
  const sheen = ((t * 0.006) % 1.6) - 0.3;
  return (
    <g>
      <ContactShadow id={`${id}c`} cx={50} cy={148} rx={30} />
      {/* patas */}
      <path d="M38 100 L26 148 M62 100 L74 148" stroke={dark(wood, pal, 0.2)} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M50 104 L50 146" stroke={dark(wood, pal, 0.3)} strokeWidth={2.4} />
      {/* marco */}
      <Vol id={`${id}w`} c={wood} pal={pal} />
      <ellipse cx={cx} cy={cy} rx={rx + 5} ry={ry + 5} fill={url(`${id}w`)} />
      <ellipse cx={cx} cy={cy} rx={rx + 5} ry={ry + 5} fill="none" stroke={lite(wood, pal, 0.5)} strokeWidth={0.8} opacity={0.7} />
      <circle cx={cx} cy={cy - ry - 5} r={3} fill={lite(wood, pal, 0.25)} />
      {/* cristal */}
      <defs><clipPath id={`${id}k`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath></defs>
      <Grad id={`${id}g`} a={lite(glass, pal, 0.25)} mid={glass} b={dark(glass, pal, 0.35)} at={0.5} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={url(`${id}g`)} />
      <g clipPath={`url(#${id}k)`}>
        {/* el reflejo: medio cuerpo, en franjas para poder ondular */}
        {[...Array(30)].map((_, k) => {
          const y0 = 30 + k * 2.6, dx = wave(y0) + lag;
          return (
            <g key={k} transform={`translate(${dx} ${I.breath * 0.4})`}>
              <defs><clipPath id={`${id}r${k}`}><rect x={0} y={y0} width={100} height={2.7} /></clipPath></defs>
              <g clipPath={`url(#${id}r${k})`}>
                <path d="M26 110 Q28 82 50 78 Q72 82 74 110 Z" fill={ropa} />
                <rect x={46} y={66} width={8} height={13} fill={dark(pal.skin, pal, 0.1)} />
                <ellipse cx={50} cy={56} rx={11} ry={13} fill={pal.skin} />
                <path d="M39 54 Q40 40 50 40 Q61 40 61 54 Q58 46 50 46 Q42 46 39 54 Z" fill={hair} />
                <ellipse cx={45.5} cy={57} rx={1.3} ry={1.3 * (1 - I.blink)} fill={pal.ink} />
                <ellipse cx={54.5} cy={57} rx={1.3} ry={1.3 * (1 - I.blink)} fill={pal.ink} />
                <path d={`M46 ${63.5} Q50 ${lerp(65, 63.6, ch)} 54 63.5`} stroke={dark(pal.skin, pal, 0.5)} strokeWidth={0.7} fill="none" />
              </g>
            </g>
          );
        })}
        {/* velo del cristal y brillo que lo cruza */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={glass} opacity={0.22} />
        <path d={`M${cx - rx + sheen * 2 * rx} ${cy - ry} l10 0 l-22 ${2 * ry} l-10 0 Z`} fill="#FFFFFF" opacity={0.16} />
        {rippling ? [0, 0.5].map((o, k) => { const r = (rp * 3 + o) % 1; return <ellipse key={k} cx={cx} cy={cy + 8} rx={4 + r * 30} ry={(4 + r * 30) * 0.4} fill="none" stroke={pal.wallLit} strokeWidth={0.6} opacity={(1 - r) * 0.7} />; }) : null}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={dark(wood, pal, 0.45)} strokeWidth={1.2} />
      {ch > 0 ? <Halo id={`${id}h`} cx={cx} cy={cy} r={40} color={pal.glow} a={0.18 * Math.sin(ch * Math.PI)} /> : null}
    </g>
  );
};
