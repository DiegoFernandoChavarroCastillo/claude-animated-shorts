// escritorio_cripto · prop (manuscrito-voynich): el escritorio de un criptógrafo de los años cuarenta visto de frente: tablero de madera
// con una máquina de cifrar de rotores y teclado, una lámpara de banquero verde encendida, montones de papeles con símbolos tachados, una
// taza y bolas de papel. Va DELANTE de una `figura` sentada (mismo par). Lienzo 100 × 60, anclaje abajo en el centro.
// Acciones propias: `type` las teclas bajan y los rotores giran mientras dura (alguien teclea); `crumple` una hoja se arruga y sale
// volando hacia un lado (se queda en el suelo); `cross` aparecen tachones rojos sobre los papeles (se quedan): fracaso.
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";
import { Glyphs } from "./manuscrito_voynich";

export const EscritorioCripto: AssetFC = ({ pal, t, seed, p }) => {
  const id = `ec${seed}`, ty = p.type ?? 0, typing = ty > 0 && ty < 1, cr = clamp01(p.crumple ?? 0), xs = clamp01(p.cross ?? 0);
  const wood = lerpHex("#6A3E22", pal.rock, 0.25), metal = lerpHex("#3A3A3E", pal.ink, 0.2), green = "#2E6A4A", paper = lerpHex("#EEE6CE", pal.wallLit, 0.1);
  const lamp = "#FFD68A";
  return (
    <g>
      <Vol id={`${id}w`} c={wood} pal={pal} k={1} /><Grad id={`${id}m`} a={lite(metal, pal, 0.25)} b={dark(metal, pal, 0.3)} />
      <Vol id={`${id}g`} c={green} pal={pal} k={1.2} />
      <ContactShadow id={`${id}s`} cx={50} cy={59} rx={50} a={0.45} />
      <Halo id={`${id}l`} cx={22} cy={22} r={40} color={lamp} a={0.55} />
      {/* tablero y frente */}
      <rect x={0} y={26} width={100} height={5} rx={1} fill={lite(wood, pal, 0.15)} />
      <rect x={3} y={31} width={94} height={29} fill={url(`${id}w`)} />
      <rect x={8} y={35} width={36} height={10} rx={1} fill="none" stroke={dark(wood, pal, 0.35)} strokeWidth={0.6} />
      <rect x={56} y={35} width={36} height={10} rx={1} fill="none" stroke={dark(wood, pal, 0.35)} strokeWidth={0.6} />
      <circle cx={26} cy={40} r={0.9} fill="#C8A050" /><circle cx={74} cy={40} r={0.9} fill="#C8A050" />
      {/* lámpara de banquero */}
      <rect x={20.6} y={14} width={1.6} height={12} fill="#B8923A" /><ellipse cx={21.4} cy={26} rx={5} ry={1.2} fill="#B8923A" />
      <path d="M12 15 Q21.4 6 31 15 Z" fill={url(`${id}g`)} /><ellipse cx={21.4} cy={15} rx={9.4} ry={1.3} fill={lamp} opacity={0.85} />
      {/* papeles con símbolos */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`rotate(${-8 + i * 7} ${70 + i * 4} 24)`}>
          <rect x={62 + i * 5} y={18 - i * 0.6} width={16} height={8} fill={lerpHex(paper, pal.ink, i * 0.06)} />
          <Glyphs x={63 + i * 5} y={20 - i * 0.6} w={14} rows={2} lh={2.6} s={1.4} seed={seed + i * 11} color={pal.ink} sw={0.22} op={0.7} />
          {xs > i / 3 ? <path d={`M${63 + i * 5} ${19} L${77 + i * 5} ${25} M${77 + i * 5} ${19} L${63 + i * 5} ${25}`} stroke="#C8302A" strokeWidth={0.6} opacity={clamp01(xs * 3 - i)} /> : null}
        </g>
      ))}
      {/* máquina de cifrar */}
      <rect x={34} y={12} width={26} height={14} rx={1.4} fill={url(`${id}m`)} />
      {[0, 1, 2].map((i) => { const rot = typing ? t * 0.4 + i : i; return (
        <g key={i}><rect x={39 + i * 6} y={9} width={4} height={6} rx={1.2} fill={dark(metal, pal, 0.1)} />
          {[0, 1, 2].map((k) => <rect key={k} x={39.4 + i * 6} y={9.6 + ((k * 2 + rot * 2) % 6)} width={3.2} height={0.5} fill={lite(metal, pal, 0.5)} />)}</g>); })}
      {[...Array(3)].map((_, r) => [...Array(8)].map((_, c) => { const down = typing && hash(Math.floor(t / 3) + r * 8 + c) > 0.85;
        return <circle key={`${r}${c}`} cx={37 + c * 2.9 + r * 0.8} cy={18 + r * 2.6 + (down ? 0.4 : 0)} r={0.95} fill={down ? lite(metal, pal, 0.6) : lite(metal, pal, 0.35)} stroke={dark(metal, pal, 0.4)} strokeWidth={0.2} />; }))}
      {/* taza y bolas de papel */}
      <rect x={86} y={20} width={6} height={6} rx={1} fill={lerpHex("#E8E2D8", pal.ink, 0.2)} /><path d="M92 21.5 q2.4 1.5 0 3" stroke={lerpHex("#E8E2D8", pal.ink, 0.2)} strokeWidth={0.8} fill="none" />
      {[[6, 24], [10, 25]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6} fill={paper} stroke={dark(paper, pal, 0.3)} strokeWidth={0.3} />)}
      {cr > 0 ? (() => { const x = 64 - cr * 60, y = 22 - Math.sin(cr * Math.PI) * 18 + cr * 32, r = 1.6 + (1 - cr) * 3;
        return <g transform={`rotate(${cr * 400} ${x} ${y})`}><path d={`M${x - r} ${y} l${r * 0.6} ${-r} l${r} ${r * 0.2} l${r * 0.5} ${r * 0.9} l${-r} ${r * 0.6} Z`} fill={paper} stroke={dark(paper, pal, 0.35)} strokeWidth={0.3} /></g>; })() : null}
    </g>
  );
};
