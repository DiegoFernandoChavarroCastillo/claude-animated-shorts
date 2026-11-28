// despacho_cripto · fondo (manuscrito-voynich): el despacho de un criptógrafo de los años cuarenta, de noche: pared de madera oscura con
// un corcho lleno de hojas de símbolos unidas por hilos rojos, un mapa del mundo, un reloj de pared, una ventana con persiana por la que
// entra luz en franjas y el suelo desde y ≈ 106. Va detrás de una `figura` sentada y del `escritorio_cripto`. Lienzo 100 × 178, anclaje
// en el centro. Acción propia: `pins` las hojas del corcho se van clavando una a una y se tienden los hilos (se quedan).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";
import { Glyphs } from "./manuscrito_voynich";

export const DespachoCripto: AssetFC = ({ pal, t, seed, p }) => {
  const id = `dc${seed}`, G = 106, pins = p.pins === undefined ? 1 : clamp01(p.pins);
  const wall = lerpHex(lerpHex("#4A3424", pal.wall, 0.3), pal.ink, 0.35), cork = lerpHex("#A07A4A", pal.ink, 0.3), paper = lerpHex("#E8DFC8", pal.ink, 0.2);
  const notes: [number, number, number][] = [[10, 26, -4], [26, 22, 3], [14, 44, 2], [30, 40, -3], [44, 28, 5]];
  const ang = (t * 0.012) % (Math.PI * 2);
  return (
    <g>
      <Grad id={`${id}w`} a={dark(wall, pal, 0.3)} mid={wall} b={dark(wall, pal, 0.1)} at={0.5} />
      <Grad id={`${id}f`} a={dark(wall, pal, 0.25)} b={dark(wall, pal, 0.6)} />
      <rect x={-40} y={-20} width={180} height={G + 20} fill={url(`${id}w`)} />
      {[...Array(12)].map((_, i) => <path key={i} d={`M${-40 + i * 16} -20 L${-40 + i * 16} ${G}`} stroke={dark(wall, pal, 0.35)} strokeWidth={0.5} opacity={0.6} />)}
      <rect x={-40} y={70} width={180} height={1.2} fill={lite(wall, pal, 0.15)} />
      {/* corcho con hojas e hilos */}
      <rect x={4} y={16} width={52} height={44} fill={cork} stroke={dark(cork, pal, 0.4)} strokeWidth={1.4} />
      {[...Array(40)].map((_, i) => <circle key={i} cx={6 + hash(i + seed) * 48} cy={18 + hash(i * 7) * 40} r={0.3} fill={dark(cork, pal, 0.3)} />)}
      {notes.map(([x, y, r], i) => { const v = clamp01(pins * notes.length - i); return v > 0 ? (
        <g key={i} transform={`rotate(${r} ${x + 6} ${y + 6})`} opacity={v}>
          <rect x={x} y={y} width={12} height={14} fill={paper} />
          <Glyphs x={x + 1} y={y + 3} w={10} rows={4} lh={2.8} s={1.5} seed={seed + i * 5} color={dark(pal.ink, pal, 0)} sw={0.25} op={0.8} />
          <circle cx={x + 6} cy={y + 1} r={0.9} fill="#C03A2E" />
        </g>) : null; })}
      <path d={notes.slice(0, Math.max(0, Math.floor(pins * notes.length))).map(([x, y], i) => `${i ? "L" : "M"}${x + 6} ${y + 1}`).join(" ")} stroke="#C03A2E" strokeWidth={0.4} fill="none" />
      {/* mapa del mundo */}
      <rect x={62} y={14} width={34} height={22} fill={lerpHex("#C8B890", pal.ink, 0.3)} stroke={dark(wall, pal, 0.5)} strokeWidth={0.8} />
      {[[66, 18, 8, 6], [76, 17, 10, 7], [86, 22, 7, 8], [70, 26, 5, 7]].map(([x, y, w, h], i) => <ellipse key={i} cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={lerpHex("#7A8A5A", pal.ink, 0.3)} />)}
      {/* reloj de pared */}
      <circle cx={79} cy={48} r={7} fill={lerpHex("#EDE6D2", pal.ink, 0.25)} stroke={dark(wall, pal, 0.6)} strokeWidth={1.2} />
      <path d={`M79 48 L${79 + Math.cos(ang - 1.57) * 5} ${48 + Math.sin(ang - 1.57) * 5} M79 48 L${79 + Math.cos(ang / 12 + 1) * 3.4} ${48 + Math.sin(ang / 12 + 1) * 3.4}`} stroke={pal.ink} strokeWidth={0.6} />
      {/* ventana con persiana y luz en franjas */}
      <rect x={64} y={60} width={30} height={34} fill="#141A30" stroke={dark(wall, pal, 0.5)} strokeWidth={1} />
      {[...Array(9)].map((_, i) => <rect key={i} x={64} y={61 + i * 3.7} width={30} height={2} fill={lerpHex("#C8B890", pal.ink, 0.45)} />)}
      <Halo id={`${id}v`} cx={79} cy={77} r={18} color="#9AB0FF" a={0.25} />
      {/* suelo */}
      <rect x={-40} y={G} width={180} height={100} fill={url(`${id}f`)} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${-40 + i * 30} ${G} L${-70 + i * 38} 200`} stroke={dark(wall, pal, 0.5)} strokeWidth={0.4} opacity={0.6} />)}
      {[...Array(6)].map((_, i) => <path key={`s${i}`} d={`M${70 - i * 3} ${G + 4 + i * 6} l30 -2`} stroke="#9AB0FF" strokeWidth={1.6} opacity={0.06} />)}
    </g>
  );
};
