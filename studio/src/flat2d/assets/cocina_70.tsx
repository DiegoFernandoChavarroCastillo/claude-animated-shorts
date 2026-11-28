// cocina_70 · fondo (senal-wow): una cocina de los años setenta de noche, vista de frente: papel pintado de flores ocres, una ventana
// con el cielo estrellado y el reflejo de la luz, armarios altos de madera, una nevera redondeada, un reloj de pared y un calendario.
// Va detrás de una `figura` sentada y de `mesa_ehman`. Lienzo 100 × 178, anclaje en el centro; suelo de baldosas desde y ≈ 106.
// opts.luz 0..1 (0,35). Sin acciones propias.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

export const Cocina70: AssetFC = ({ pal, t, seed, opts }) => {
  const id = `ck${seed}`, G = 106, luz = Number(opt(opts, "luz", 0.35));
  const paper = lerpHex(lerpHex("#B8945A", pal.wall, 0.35), pal.ink, 0.5 - luz * 0.3), wood = lerpHex("#6A4426", pal.ink, 0.45 - luz * 0.25);
  const fridge = lerpHex(lerpHex("#D8C88A", pal.wall, 0.3), pal.ink, 0.45 - luz * 0.25), tile = lerpHex("#6A5A3A", pal.ink, 0.5);
  return (
    <g>
      <Grad id={`${id}w`} a={dark(paper, pal, 0.35)} mid={paper} b={dark(paper, pal, 0.2)} at={0.55} />
      <Grad id={`${id}f`} a={dark(tile, pal, 0.1)} b={dark(tile, pal, 0.6)} />
      <Grad id={`${id}fr`} h a={dark(fridge, pal, 0.3)} mid={lite(fridge, pal, 0.15)} b={dark(fridge, pal, 0.4)} />
      <Grad id={`${id}wd`} a={lite(wood, pal, 0.1)} b={dark(wood, pal, 0.3)} />
      <rect x={-40} y={-20} width={180} height={G + 20} fill={url(`${id}w`)} />
      {[...Array(9)].map((_, c) => [...Array(13)].map((_, r) => {
        const x = -34 + c * 20 + (r % 2) * 10, y = -14 + r * 9.5;
        return <g key={`${c}-${r}`} opacity={0.35}>{[0, 1, 2, 3].map((k) => <circle key={k} cx={x + Math.cos(k * 1.57) * 1.4} cy={y + Math.sin(k * 1.57) * 1.4} r={1.1} fill={lite(paper, pal, 0.25)} />)}<circle cx={x} cy={y} r={0.7} fill={dark(paper, pal, 0.4)} /></g>;
      }))}
      {/* ventana con estrellas */}
      <rect x={30} y={22} width={40} height={34} fill="#0A1030" />
      {[...Array(18)].map((_, i) => <circle key={i} cx={32 + hash(i + seed) * 36} cy={24 + hash(i * 7 + seed) * 30} r={0.25 + hash(i * 3) * 0.35} fill="#FFFFFF" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 0.05 + i))} />)}
      <Halo id={`${id}m`} cx={60} cy={30} r={12} color={pal.glow} a={0.25} />
      <path d="M50 22 L50 56 M30 39 L70 39" stroke={lite(wood, pal, 0.2)} strokeWidth={1.2} />
      <rect x={30} y={22} width={40} height={34} fill="none" stroke={lite(wood, pal, 0.25)} strokeWidth={1.6} />
      <rect x={27} y={56} width={46} height={2.4} fill={lite(wood, pal, 0.2)} />
      {/* armarios altos */}
      <rect x={-4} y={10} width={28} height={30} fill={url(`${id}wd`)} /><rect x={76} y={10} width={28} height={30} fill={url(`${id}wd`)} />
      {[[-2, 12], [11, 12], [78, 12], [91, 12]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width={11} height={26} fill="none" stroke={dark(wood, pal, 0.4)} strokeWidth={0.4} /><rect x={x + (i % 2 ? 1.5 : 8.5)} y={y + 20} width={1} height={3} fill={lerpHex("#C8A86A", pal.ink, 0.3)} /></g>)}
      {/* nevera */}
      <rect x={80} y={46} width={20} height={G - 46} rx={3} fill={url(`${id}fr`)} />
      <path d="M80 66 L100 66" stroke={dark(fridge, pal, 0.4)} strokeWidth={0.5} /><rect x={82} y={52} width={1.2} height={8} rx={0.5} fill={lite(fridge, pal, 0.4)} /><rect x={82} y={70} width={1.2} height={10} rx={0.5} fill={lite(fridge, pal, 0.4)} />
      {/* reloj y calendario */}
      <circle cx={22} cy={50} r={4.5} fill={lite(paper, pal, 0.35)} stroke={dark(wood, pal, 0.2)} strokeWidth={0.8} />
      <path d={`M22 50 L22 47 M22 50 L${22 + Math.cos(t * 0.01) * 3.2} ${50 + Math.sin(t * 0.01) * 3.2}`} stroke={pal.ink} strokeWidth={0.5} />
      <rect x={16} y={62} width={11} height={14} fill={lerpHex("#EEE8D8", pal.ink, 0.35)} /><rect x={16} y={62} width={11} height={3.5} fill={lerpHex("#B8302A", pal.ink, 0.3)} />
      <text x={21.5} y={72.5} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={4.5} fill={lerpHex("#2A2A2A", pal.ink, 0.2)}>15</text>
      {/* suelo de baldosas */}
      <rect x={-40} y={G} width={180} height={100} fill={url(`${id}f`)} />
      {[...Array(10)].map((_, i) => <path key={i} d={`M${-40 + i * 20} ${G} L${-90 + i * 32} 200`} stroke={dark(tile, pal, 0.45)} strokeWidth={0.4} opacity={0.6} />)}
      {[0, 6, 14, 26, 42].map((dy, i) => <path key={`h${i}`} d={`M-40 ${G + dy} L140 ${G + dy}`} stroke={dark(tile, pal, 0.45)} strokeWidth={0.35} opacity={0.5} />)}
    </g>
  );
};
