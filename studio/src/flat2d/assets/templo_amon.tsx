// templo_amon · fondo: la fachada del templo de Amón en Karnak, de frente: dos torres del pilono con el relieve de Amón (dios de piel azul
// con la corona de dos plumas altas) pintado en cada una, mástiles con banderolas rojas, un obelisco a la izquierda y en el centro la gran
// puerta de cedro de dos hojas. Suelo de losas que se oscurece desde y ≈ 108 (franja de subtítulos). Va sobre `cielo`. Lienzo 100 × 178.
// opts: `cerrado` 0..1 (las hojas cerradas con una tranca y un sello), `raspado` 0..1 (el relieve de Amón de la torre izquierda, borrado a
// cincel). Acciones propias: `close` las hojas se cierran y cae la tranca (se queda); `open` se abren y sale luz de dentro (se queda);
// `scrape` un cincel raspa el relieve de Amón mientras saltan esquirlas (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

export const TemploAmon: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `ta${seed}`;
  let shut = opt(opts, "cerrado", 0);
  if (p.close !== undefined) shut = Math.max(shut, clamp01(p.close));
  if (p.open !== undefined) shut = Math.min(shut, 1 - clamp01(p.open));
  const op = clamp01(p.open ?? 0), sc = p.scrape !== undefined ? Math.max(opt(opts, "raspado", 0), clamp01(p.scrape)) : opt(opts, "raspado", 0);
  const scraping = (p.scrape ?? 0) > 0 && (p.scrape ?? 0) < 1;
  const stone = lerpHex("#D9B884", pal.wall, 0.3), cedar = lerpHex("#6A3E1E", pal.rock, 0.3), blue = lerpHex("#2E5AA8", pal.accent, 0.15);
  const red = lerpHex("#B8402E", pal.accent, 0.3), gold = lerpHex("#E8B640", pal.glow, 0.2), floor = lerpHex("#B89868", pal.rock, 0.3);
  // Amón: de perfil a la derecha, corona de dos plumas, cetro uas
  const amun = (x: number, y: number, k: number) => (
    <g key={k}>
      <path d={`M${x} ${y} l0 -22 M${x + 3.4} ${y} l0 -22`} stroke={blue} strokeWidth={2.4} />
      <path d={`M${x - 2} ${y - 22} L${x + 5.4} ${y - 22} L${x + 4.6} ${y - 34} L${x - 1.4} ${y - 34} Z`} fill={blue} />
      <path d={`M${x - 2} ${y - 20} L${x + 5.4} ${y - 20} L${x + 4.4} ${y - 12} L${x - 1.2} ${y - 12} Z`} fill={lite(stone, pal, 0.3)} />
      <circle cx={x + 1.8} cy={y - 37} r={3} fill={blue} />
      <path d={`M${x - 1} ${y - 39} L${x + 4.6} ${y - 39} L${x + 4} ${y - 41}`} fill={red} />
      <path d={`M${x + 0.4} ${y - 41} L${x + 0.6} ${y - 52} L${x + 2.2} ${y - 52} L${x + 2.4} ${y - 41} M${x + 2.6} ${y - 41} L${x + 3} ${y - 52} L${x + 4.4} ${y - 51} L${x + 4.2} ${y - 41}`} fill={gold} stroke={dark(gold, pal, 0.3)} strokeWidth={0.3} />
      <path d={`M${x + 5} ${y - 30} L${x + 9} ${y - 30} M${x + 8} ${y - 34} L${x + 8} ${y} M${x + 8} ${y - 34} l1.6 -1.4`} stroke={dark(blue, pal, 0.2)} strokeWidth={0.8} fill="none" />
      {[0, 1, 2].map((j) => <rect key={j} x={x - 6} y={y - 48 + j * 6} width={3} height={4} fill="none" stroke={dark(stone, pal, 0.35)} strokeWidth={0.4} />)}
    </g>
  );
  const chips = scraping ? [...Array(8)].map((_, i) => {
    const ph = (t * 0.09 + hash(seed + i)) % 1;
    return <circle key={i} cx={20 + ph * (hash(i) - 0.5) * 16} cy={lerp(52, 76, sc) + ph * ph * 22} r={0.5} fill={lite(stone, pal, 0.3)} opacity={1 - ph} />;
  }) : null;
  const leaf = (k: number) => {
    const w = 8 * (1 - (1 - shut) * 0.85), x = k ? 58 - w : 42;
    return (
      <g key={k}>
        <rect x={x} y={70} width={w} height={36} fill={url(`${id}d`)} stroke={dark(cedar, pal, 0.4)} strokeWidth={0.3} />
        {[76, 88, 100].map((y) => <rect key={y} x={x + 0.4} y={y} width={w - 0.8} height={1} fill={gold} opacity={0.8} />)}
      </g>
    );
  };
  return (
    <g>
      <Grad id={`${id}p`} a={lite(stone, pal, 0.2)} b={dark(stone, pal, 0.25)} /><Grad id={`${id}d`} a={lite(cedar, pal, 0.1)} b={dark(cedar, pal, 0.3)} h />
      <Grad id={`${id}f`} a={floor} mid={dark(floor, pal, 0.6)} b={dark(floor, pal, 0.85)} at={0.12} />
      {/* obelisco */}
      <path d="M-8 106 L-6 34 L-4 30 L-2 34 L0 106 Z" fill={url(`${id}p`)} /><path d="M-6 34 L-4 30 L-2 34 Z" fill={gold} />
      {/* mástiles y banderolas */}
      {[14, 22, 78, 86].map((x, i) => (
        <g key={x}><path d={`M${x} 106 L${x} 22`} stroke={cedar} strokeWidth={0.9} />
          <path d={`M${x} 23 q4 ${1 + Math.sin(t * 0.12 + i) * 1.2} 8 ${Math.sin(t * 0.1 + i) * 2} l0 2.4 q-4 ${Math.sin(t * 0.11 + i) * 1.4} -8 0 Z`} fill={red} /></g>
      ))}
      {/* torres del pilono */}
      {[[8, 40], [60, 92]].map(([a, b], k) => (
        <g key={k}>
          <path d={`M${a - 4} 106 L${a + 2} 36 L${b - 2} 36 L${b + 4} 106 Z`} fill={url(`${id}p`)} />
          <path d={`M${a + 2} 36 L${b - 2} 36 L${b - 1.6} 39 L${a + 1.6} 39 Z`} fill={dark(stone, pal, 0.2)} />
          <path d={`M${a - 4} 106 L${a + 2} 36`} stroke={pal.rim} strokeWidth={0.4} opacity={0.6} />
        </g>
      ))}
      {amun(20, 100, 0)}{amun(72, 100, 1)}
      {/* raspado del Amón izquierdo: marcas de cincel que lo cubren de arriba abajo */}
      {sc > 0 && (
        <g>
          <rect x={13} y={48} width={20} height={lerp(0, 54, sc)} fill={lerpHex(stone, "#A88A62", 0.4)} />
          {[...Array(Math.floor(sc * 26))].map((_, i) => <path key={i} d={`M${13 + hash(seed + i) * 18} ${50 + (i / 26) * 50} l${1 + hash(i) * 2} ${1 + hash(i + 2)}`} stroke={dark(stone, pal, 0.35)} strokeWidth={0.5} />)}
        </g>
      )}
      {scraping && <g><path d={`M${22 + Math.sin(t * 0.8) * 4} ${lerp(52, 98, sc)} l4 -4`} stroke="#8A8A8A" strokeWidth={1.1} strokeLinecap="round" />{chips}</g>}
      {/* puerta: hueco, luz de dentro y hojas de cedro */}
      <path d="M40 106 L40 66 L60 66 L60 106 Z" fill={dark(stone, pal, 0.35)} />
      <rect x={40} y={66} width={20} height={3} fill={gold} opacity={0.7} />
      <rect x={42} y={70} width={16} height={36} fill={pal.glow} opacity={0.25 + 0.6 * (1 - shut) * (op || 1)} />
      {(1 - shut) > 0.2 && <Halo id={`${id}h`} cx={50} cy={92} r={lerp(8, 34, 1 - shut)} color={pal.glow} a={0.5 * (1 - shut)} />}
      {leaf(0)}{leaf(1)}
      {shut > 0.85 && <g opacity={(shut - 0.85) / 0.15}><rect x={41} y={86} width={18} height={2.2} fill={dark(cedar, pal, 0.3)} /><circle cx={50} cy={87.1} r={1.8} fill={red} /></g>}
      {/* suelo de losas, oscuro abajo */}
      <path d="M-30 105 L130 105 L130 178 L-30 178 Z" fill={url(`${id}f`)} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${50 + (i - 3) * 6} 105 L${50 + (i - 3) * 30} 150`} stroke={dark(floor, pal, 0.3)} strokeWidth={0.3} />)}
      {[110, 118].map((y) => <path key={y} d={`M-30 ${y} H130`} stroke={dark(floor, pal, 0.3)} strokeWidth={0.3} />)}
      <rect x={-30} y={107} width={160} height={71} fill={pal.ink} opacity={0.5} />
    </g>
  );
};
