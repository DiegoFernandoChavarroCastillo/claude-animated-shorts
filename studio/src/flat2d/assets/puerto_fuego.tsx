// puerto_fuego · El puerto de Alejandría de noche con la flota enemiga amarrada: cuatro galeras de vela cuadrada, el Faro al fondo y, en el muelle de la derecha, un almacén de piedra.
// `ignite` las naves prenden una tras otra (se queda ardiendo); `spread` una ráfaga lleva el fuego del muelle al almacén, que arde (se queda); con ambas el cielo se vuelve naranja y el humo cruza el puerto.
import React from "react";
import { type AssetFC, hash, lerp, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { Grad, Halo, url, lite, dark } from "./shade";

const Flame: React.FC<{ x: number; y: number; s: number; t: number; i: number; pal: unknown }> = ({ x, y, s, t, i }) => {
  const w = Math.sin(t * 0.3 + i * 2) * 0.5, h = 1 + 0.25 * Math.sin(t * 0.43 + i * 1.7);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ mixBlendMode: "screen" }}>
      <path d={`M-3 0 Q-4 -5 ${-1 + w} -${10 * h} Q${1 + w} -5 0 -7 Q3 -4 3 0Z`} fill="#E2491B" opacity={0.95} />
      <path d={`M-2 0 Q-2.5 -4 ${w} -${7 * h} Q${2 + w} -3 2 0Z`} fill="#FF9A2E" />
      <path d={`M-1 0 Q-1 -2.5 ${w * 0.5} -${4 * h} Q1.4 -2 1 0Z`} fill="#FFE08A" />
    </g>
  );
};

export const PuertoFuego: AssetFC = ({ pal, p, t, seed }) => {
  const id = `pf${seed}`, ig = p.ignite ?? 0, sp = clamp01(p.spread ?? 0), fire = Math.max(ig, sp);
  const sea = lerpHex(pal.bg, pal.accent, 0.28), stone = lerpHex(pal.wall, pal.wallLit, 0.25), sky = lerpHex(pal.bg, pal.accent, 0.25 + 0.4 * fire);
  const ships = [{ x: 14, y: 112, s: 1.0 }, { x: 36, y: 106, s: 0.85 }, { x: 52, y: 114, s: 1.05 }, { x: 70, y: 108, s: 0.8 }];
  return (
    <g>
      <Grad id={`${id}s`} a={pal.bg} b={sky} />
      <rect x={-2} y={-2} width={104} height={100} fill={url(`${id}s`)} />
      {[...Array(30)].map((_, i) => <circle key={i} cx={hash(i + 3) * 100} cy={hash(i + 40) * 55} r={0.2 + hash(i + 9) * 0.3} fill={pal.wallLit} opacity={(0.5 - 0.35 * fire) * (0.5 + 0.5 * Math.abs(Math.sin(t * 0.05 + i)))} />)}
      {/* faro lejano */}
      <path d="M6 98 L7 70 L13 70 L14 98Z" fill={dark(stone, pal, 0.35)} /><path d="M7.5 70 L8.5 58 L11.5 58 L12.5 70Z" fill={dark(stone, pal, 0.25)} />
      <Halo id={`${id}h`} cx={10} cy={55} r={11} color={pal.glow} a={0.6} />
      <path d="M8.5 58 Q10 52 11.5 58Z" fill={pal.rim} />
      {/* almacén en el muelle */}
      <g>
        <path d="M60 98 L60 70 L102 70 L102 98Z" fill={dark(stone, pal, 0.3)} /><path d="M58 70 L104 70 L104 66 L58 66Z" fill={dark(stone, pal, 0.15)} />
        {[64, 74, 84, 94].map((x) => <rect key={x} x={x} y={76} width={6} height={22} fill={dark(stone, pal, 0.6)} />)}
        {[64, 74, 84, 94].map((x) => [0, 1, 2].map((j) => <rect key={`${x}${j}`} x={x + 0.6} y={79 + j * 6} width={4.8} height={3.2} rx={1.5} fill={lerpHex(pal.wallLit, pal.rock, 0.5)} opacity={0.8} />))}
        {sp > 0 && [66, 76, 86, 96, 71, 91].map((x, i) => { const k = clamp01(sp * 1.6 - i * 0.12); return k > 0 ? <Flame key={x} x={x} y={i < 4 ? 98 : 70} s={0.9 * k + 0.2} t={t} i={i + 9} pal={pal} /> : null; })}
        {sp > 0 && <Halo id={`${id}w`} cx={80} cy={84} r={34} color={pal.rim} a={0.55 * sp} />}
      </g>
      {/* agua */}
      <rect x={-2} y={98} width={104} height={34} fill={sea} />
      {[...Array(14)].map((_, i) => <path key={i} d={`M${-2 + Math.sin(t * 0.06 + i) * 3 + (i % 3) * 6} ${100 + i * 2.3} l${10 + (i % 4) * 4} 0 M${42 + Math.sin(t * 0.06 + i) * 3} ${100 + i * 2.3} l${8 + (i % 3) * 3} 0`} stroke={lerpHex(sea, pal.wallLit, 0.25)} strokeWidth={0.35} opacity={0.55} />)}
      {/* galeras */}
      {ships.map((sh, i) => {
        const k = clamp01(ig * 4.2 - i * 0.9), bob = Math.sin(t * 0.07 + i * 1.9) * 0.5;
        return (
          <g key={i} transform={`translate(${sh.x} ${sh.y + bob}) scale(${sh.s})`}>
            {k > 0 && <ellipse cx={0} cy={4} rx={16} ry={2} fill={pal.rim} opacity={0.35 * k} />}
            <path d="M-12 0 Q-13 -3 -14 -6 L14 -6 Q13 -3 12 0 Q0 3 -12 0Z" fill={dark(pal.rock, pal, 0.1)} />
            <path d="M-14 -6 L14 -6" stroke={pal.rim} strokeWidth={0.4} opacity={0.5} />
            <path d="M0 -6 L0 -24" stroke={dark(pal.rock, pal, 0.3)} strokeWidth={1} />
            <path d={`M-7 -22 L7 -22 L8 -10 Q0 ${-8 + Math.sin(t * 0.09 + i)} -8 -10Z`} fill={lerpHex(pal.wallLit, pal.accent, 0.25 + 0.5 * k)} opacity={1 - 0.3 * k} />
            {k > 0 && [-7, -2, 4, 9].map((x, j) => <Flame key={j} x={x} y={-7 - (j % 2) * 8} s={(0.8 + 0.5 * (j % 2)) * k} t={t} i={i * 5 + j} pal={pal} />)}
            {k > 0 && <Halo id={`${id}f${i}`} cx={0} cy={-12} r={24} color={pal.rim} a={0.55 * k} />}
          </g>
        );
      })}
      {/* humo que cruza el puerto */}
      {fire > 0 && [...Array(9)].map((_, i) => <ellipse key={i} cx={((hash(i + 5) * 120 + t * (0.25 + 0.1 * (i % 3))) % 130) - 15} cy={30 + hash(i + 13) * 34 - ((t * 0.12 + i * 7) % 10)} rx={14 + hash(i) * 8} ry={5 + hash(i + 2) * 3} fill={dark(pal.bg, pal, 0.2)} opacity={0.32 * fire} />)}
      {/* reflejo del fuego en el agua */}
      {fire > 0 && [...Array(8)].map((_, i) => <path key={`r${i}`} d={`M${10 + hash(i) * 75 + Math.sin(t * 0.1 + i) * 2} ${101 + i * 3.4} l${6 - i * 0.4} 0`} stroke={pal.rim} strokeWidth={0.8} opacity={0.55 * fire} />)}
      {/* muelle en primer plano */}
      <path d="M-2 130 L102 130 L102 180 L-2 180Z" fill={lerpHex(pal.rock, pal.ink, 0.55)} /><path d="M-2 130 L102 130" stroke={pal.rim} strokeWidth={0.5} opacity={0.4} />
      <g transform="translate(0 130)"><Grain n={90} w={100} h={48} seed={seed * 3 + 2} a={pal.rock} b={pal.ink} rMax={0.7} /></g>
      <Grain n={60} w={100} h={96} seed={seed * 5 + 7} a={lerpHex(sky, pal.wallLit, 0.2)} b={pal.ink} rMax={0.5} />
    </g>
  );
};
