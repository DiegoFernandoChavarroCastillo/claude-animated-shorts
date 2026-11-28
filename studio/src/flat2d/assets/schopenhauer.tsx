// schopenhauer · personaje: Arthur Schopenhauer ya mayor, de pie (el retrato de 1850 en Fráncfort): coronilla calva con dos mechones blancos
// y encrespados a los lados de la cabeza, cejas espesas, boca fina y seria con las comisuras hacia abajo, levita negra de solapas anchas,
// chaleco, cuello blanco alto y corbatín negro; sostiene un libro cerrado contra el pecho. Lienzo 100 × 160, anclaje en los pies.
// Respira y parpadea siempre. Acciones propias: `look` gira la cara y te mira de frente (se queda); `talk` mueve la boca mientras dura;
// `raise_brow` alza una ceja, escéptico (se queda); `open_book` abre el libro (se queda): lo escribió, Parerga y Paralipómena.
import React from "react";
import { type AssetFC, clamp01, idle, lerp } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Vol, dark, lite, url } from "./shade";

export const Schopenhauer: AssetFC = ({ pal, t, seed, p }) => {
  const id = `sc${seed}`, { breath, blink, sway } = idle(t, seed);
  const lk = clamp01(p.look ?? 0), tk = p.talk ?? 0, talking = tk > 0 && tk < 1 ? Math.abs(Math.sin(t * 0.55)) : 0;
  const rb = clamp01(p.raise_brow ?? 0), ob = clamp01(p.open_book ?? 0);
  const coat = lerpHex("#24222A", pal.ink, 0.2), vest = lerpHex("#4A4038", pal.rock, 0.3), shirt = lerpHex("#EDE6D8", pal.wallLit, 0.2);
  const hair = lerpHex("#F2EFEA", pal.wallLit, 0.15), skin = lerpHex(pal.skin, "#E3B898", 0.4), book = lerpHex("#6A2A22", pal.accent, 0.25);
  const turn = lerp(0.35, 0, lk), hx = 50 + turn * 3, hy = 30, fx = hx + turn * 4;
  return (
    <g transform={`translate(${sway * 0.4} ${breath * 0.4})`}>
      <Vol id={`${id}c`} c={coat} pal={pal} k={1.4} /><Vol id={`${id}h`} c={skin} pal={pal} k={0.8} /><Vol id={`${id}w`} c={hair} pal={pal} k={0.6} />
      <ContactShadow id={`${id}s`} cx={50} cy={159} rx={24} a={0.45} />
      {/* piernas y zapatos */}
      <rect x={40} y={118} width={8.5} height={38} rx={2} fill={dark(coat, pal, 0.25)} /><rect x={51.5} y={118} width={8.5} height={38} rx={2} fill={dark(coat, pal, 0.18)} />
      <ellipse cx={43} cy={156.5} rx={6.5} ry={2.4} fill={pal.ink} /><ellipse cx={57} cy={156.5} rx={6.5} ry={2.4} fill={pal.ink} />
      {/* levita con faldones */}
      <path d="M29 56 Q50 49 71 56 L76 128 Q62 132 50 126 Q38 132 24 128 Z" fill={url(`${id}c`)} />
      <path d="M50 58 L50 126" stroke={dark(coat, pal, 0.4)} strokeWidth={0.6} />
      {/* chaleco, camisa, cuello alto y corbatín */}
      <path d="M42 56 L58 56 L56 92 L50 96 L44 92 Z" fill={vest} />
      {[66, 74, 82].map((y) => <circle key={y} cx={50} cy={y} r={0.9} fill={lite(vest, pal, 0.4)} />)}
      <path d="M44 52 L56 52 L55 64 L50 61 L45 64 Z" fill={shirt} />
      <path d="M44.5 50 L50 56 L55.5 50 L56 46 L44 46 Z" fill={shirt} />
      <path d="M45 56 L50 58.5 L45 61 Z M55 56 L50 58.5 L55 61 Z" fill={pal.ink} /><circle cx={50} cy={58.5} r={1.4} fill={pal.ink} />
      {/* solapas anchas */}
      <path d="M42 54 L34 60 L44 84 L46 64 Z" fill={dark(coat, pal, 0.2)} /><path d="M58 54 L66 60 L56 84 L54 64 Z" fill={lite(coat, pal, 0.08)} />
      {/* brazos y el libro contra el pecho */}
      <path d="M31 58 Q24 84 30 104" stroke={coat} strokeWidth={9} fill="none" strokeLinecap="round" />
      <ellipse cx={31} cy={106} rx={3.6} ry={4} fill={skin} />
      <path d="M69 58 Q76 76 60 84" stroke={lite(coat, pal, 0.06)} strokeWidth={9} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${-8 + ob * 4} 56 82)`}>
        {ob > 0.05
          ? <g><path d={`M56 70 L${56 - 15 * ob} 72 L${56 - 15 * ob} 92 L56 90 Z`} fill={lite(shirt, pal, 0.1)} /><path d="M56 70 L71 72 L71 92 L56 90 Z" fill={shirt} />
              {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M59 ${75 + k * 3} l9 0.4`} stroke={dark(shirt, pal, 0.45)} strokeWidth={0.5} opacity={ob} />)}
              <path d={`M56 70 L56 90`} stroke={dark(book, pal, 0.3)} strokeWidth={1} /></g>
          : <g><rect x={50} y={70} width={17} height={22} rx={1.4} fill={book} /><rect x={50} y={70} width={2.6} height={22} fill={dark(book, pal, 0.35)} />
              <path d="M55 76 l9 0 M55 79 l7 0" stroke={lerpHex("#D8B060", pal.glow, 0.3)} strokeWidth={0.7} /></g>}
      </g>
      <ellipse cx={62} cy={84} rx={3.8} ry={3.4} fill={skin} />
      {/* cabeza */}
      <rect x={hx - 4} y={hy + 14} width={8} height={6} fill={dark(skin, pal, 0.2)} />
      <ellipse cx={hx} cy={hy} rx={11.5} ry={14} fill={url(`${id}h`)} />
      {/* mechones blancos encrespados a los lados (calvo arriba) */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${hx + s * 9} ${hy - 9} Q${hx + s * 17} ${hy - 14} ${hx + s * 21} ${hy - 8} Q${hx + s * 25} ${hy - 6} ${hx + s * 21} ${hy - 1} Q${hx + s * 26} ${hy + 3} ${hx + s * 20} ${hy + 7} Q${hx + s * 22} ${hy + 12} ${hx + s * 14} ${hy + 11} Q${hx + s * 10} ${hy + 6} ${hx + s * 10.5} ${hy - 2} Z`} fill={url(`${id}w`)} />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${hx + s * 12} ${hy - 6 + k * 3.6} q${s * 6} ${-2 + k} ${s * (10 + (k % 2) * 3)} ${-1 + k * 0.8}`} stroke={dark(hair, pal, 0.18)} strokeWidth={0.6} fill="none" strokeLinecap="round" />)}
        </g>))}
      <path d={`M${hx - 7} ${hy - 10} Q${hx} ${hy - 15} ${hx + 7} ${hy - 10}`} stroke={lite(skin, pal, 0.5)} strokeWidth={1.2} fill="none" opacity={0.6} />
      <ellipse cx={hx - 11.5} cy={hy + 1} rx={2} ry={3} fill={dark(skin, pal, 0.15)} /><ellipse cx={hx + 11.5} cy={hy + 1} rx={2} ry={3} fill={dark(skin, pal, 0.15)} />
      {/* cejas espesas, ojos hundidos, nariz, boca seria */}
      {[-1, 1].map((s) => {
        const ex = fx + s * 4.4, up = s === 1 ? rb * 2.2 : 0;
        return <g key={s}>
          <path d={`M${ex - 3.2} ${hy - 5.4 - up + (s === -1 ? 0.6 : 0)} Q${ex} ${hy - 7.4 - up} ${ex + 3.2} ${hy - 5.2 - up}`} stroke={lerpHex(hair, pal.rock, 0.35)} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <ellipse cx={ex} cy={hy - 2.4} rx={2.6} ry={1.6} fill={dark(skin, pal, 0.25)} />
          <ellipse cx={ex + turn * 0.6} cy={hy - 2.3} rx={1.2} ry={1.3 * (1 - blink * 0.9)} fill="#2A3442" />
        </g>;
      })}
      <path d={`M${fx} ${hy - 2} L${fx + 1.8 + turn} ${hy + 4.5} L${fx - 0.6} ${hy + 5}`} stroke={dark(skin, pal, 0.4)} strokeWidth={0.8} fill="none" />
      <path d={`M${fx - 4} ${hy + 8.6} Q${fx} ${hy + 7.4 + talking * 1.5} ${fx + 4} ${hy + 8.6}`} stroke={dark(skin, pal, 0.55)} strokeWidth={1} fill={talking > 0.2 ? dark(skin, pal, 0.6) : "none"} />
      <path d={`M${fx - 6} ${hy + 6} q1 3 2 3.6 M${fx + 6} ${hy + 6} q-1 3 -2 3.6`} stroke={dark(skin, pal, 0.3)} strokeWidth={0.6} fill="none" />
    </g>
  );
};
