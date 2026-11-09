// pollo · un pollo desplumado de pie sobre sus dos patas flacas: piel rosada con piel de gallina, muslos, alitas peladas, cuello largo y desnudo,
// cresta roja caída, pico amarillo y ojo aturdido; ni una pluma (solo cañones). `wrapped` lo deja envuelto en un fardo de tela atado, con una pata
// asomando (el bulto); `unwrap` deja caer la tela y lo revela; `drop` lo hace caer desde arriba, aplastarse blando contra el suelo y recomponerse
// con un poco de polvo (se queda en el suelo).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";

export const Pollo: AssetFC = ({ pal, p, t, seed }) => {
  const wr = (p.wrapped ?? 0) * (1 - clamp01((p.unwrap ?? 0) * 1.4)), un = p.unwrap ?? 0, dr = p.drop ?? 0;
  const skin = lerpHex("#F2B3A6", pal.skin, 0.25), skinD = lerpHex(skin, "#9C4A4A", 0.3), bump = lerpHex(skin, pal.ink, 0.22);
  const leg = lerpHex(pal.rim, "#E8B04A", 0.5), legD = lerpHex(leg, pal.ink, 0.35), comb = "#D8352E", cloth = lerpHex(pal.rock, pal.wallLit, 0.3), clothD = lerpHex(cloth, pal.ink, 0.35);
  // caída: arriba → golpe blando (aplastado) → se recompone
  const fall = dr > 0 && dr < 1 ? clamp01(dr / 0.55) : 1, y0 = dr > 0 && dr < 0.55 ? lerp(-110, 0, fall * fall) : 0;
  const hit = dr >= 0.55 && dr < 1 ? (dr - 0.55) / 0.45 : 0, squash = hit > 0 ? Math.sin(hit * Math.PI) * 0.28 * (1 - hit * 0.5) : 0;
  const wob = Math.sin(t * 0.25) * 0.6;
  const foot = (x: number, k: number) => (
    <g key={`f${k}`}>
      <path d={`M${x} 64 L${x - 1} 74 L${x + 1} 84`} stroke={leg} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
      <circle cx={x - 1} cy={74} r={1.6} fill={legD} />
      {[[-7, 2], [-1, 3.4], [6, 1.6], [3, -2]].map(([dx, dy], i) => <g key={i}><path d={`M${x + 1} 84 L${x + 1 + dx} ${84 + dy}`} stroke={leg} strokeWidth={1.6} strokeLinecap="round" />
        <path d={`M${x + 1 + dx} ${84 + dy} l${dx > 0 ? 1.3 : -1.3} 0.5`} stroke={pal.ink} strokeWidth={0.8} strokeLinecap="round" /></g>)}
    </g>
  );
  return (
    <g transform={`translate(0 ${y0})`}>
      <ellipse cx={50} cy={88} rx={24 + squash * 30} ry={2.6} fill={pal.ink} opacity={0.4 * (dr > 0 && dr < 0.55 ? fall : 1)} />
      <g transform={`translate(50 88) scale(${1 + squash} ${1 - squash}) translate(-50 -88)`}>
        {wr < 0.98 && <g opacity={clamp01(1 - wr * 1.2)}>
          {foot(44, 0)}{foot(56, 1)}
          {/* muslos y cuerpo pelado */}
          <ellipse cx={42} cy={60} rx={8} ry={9} fill={skinD} /><ellipse cx={58} cy={60} rx={8} ry={9} fill={skinD} />
          <path d="M24 46 Q22 28 44 26 Q66 22 76 38 Q82 54 70 64 Q50 74 32 64 Q24 58 24 46Z" fill={skin} />
          <path d="M30 60 Q50 70 70 62 Q60 72 46 71 Q34 68 30 60Z" fill={skinD} opacity={0.6} />
          {[...Array(60)].map((_, i) => <circle key={i} cx={28 + hash(i + seed) * 48} cy={30 + hash(i * 2.3 + seed) * 36} r={0.35 + hash(i + 40) * 0.4} fill={bump} opacity={0.9} />)}
          {[...Array(9)].map((_, i) => <path key={`q${i}`} d={`M${34 + i * 4.4} ${34 + (i % 3) * 7} l0.4 -1.6`} stroke={lerpHex(skin, pal.ink, 0.45)} strokeWidth={0.5} />)}
          {/* alitas peladas, caídas */}
          <path d={`M30 40 Q16 ${50 + wob} 20 62 Q26 58 32 50Z`} fill={skinD} /><path d="M22 58 l-2 2 M24 60 l-1 3" stroke={bump} strokeWidth={0.6} />
          <path d={`M72 40 Q86 ${50 - wob} 82 62 Q76 58 70 50Z`} fill={skinD} />
          {/* rabadilla */}
          <path d="M74 36 Q82 30 84 36 Q80 40 76 42Z" fill={skin} />
          {/* cuello largo y desnudo, cabeza */}
          <path d={`M34 34 Q28 20 ${30 + wob} 10`} stroke={skin} strokeWidth={7} fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => <path key={`n${i}`} d={`M${30 + i * 0.6} ${30 - i * 5} q2 0.6 4 0`} stroke={bump} strokeWidth={0.5} fill="none" />)}
          <g transform={`translate(${30 + wob} 8) rotate(${-8 + Math.sin(t * 0.13) * 4})`}>
            <ellipse cx={0} cy={0} rx={5.4} ry={4.8} fill={skin} />
            <path d="M-3 -4 Q-2 -9 0 -5 Q1 -10 2.6 -5 Q4 -9 4.4 -3.6" fill={comb} />
            <path d="M-5.2 0.4 L-10.4 1.4 L-5.4 3Z" fill={pal.rim} /><path d="M-5 3 Q-7 7 -4.4 7.4 Q-3 5 -3.6 3Z" fill={comb} />
            <circle cx={-1.6} cy={-0.8} r={1.5} fill={pal.wallLit} /><circle cx={-1.9} cy={-0.6} r={0.8} fill={pal.ink} />
            <path d="M-3.4 -2.6 L0 -2.2" stroke={lerpHex(skin, pal.ink, 0.4)} strokeWidth={0.6} />
          </g>
        </g>}
        {/* fardo de tela atado con una pata asomando (el bulto) */}
        {wr > 0.02 && <g opacity={clamp01(wr * 1.5)} transform={`translate(0 ${(1 - wr) * 10})`}>
          <path d="M20 84 Q14 52 34 36 Q50 26 66 36 Q86 50 80 84Z" fill={cloth} />
          {[0.3, 0.5, 0.7].map((k, i) => <path key={i} d={`M${20 + k * 60} 40 Q${26 + k * 50} 62 ${22 + k * 58} 84`} stroke={clothD} strokeWidth={1.1} fill="none" />)}
          <path d="M44 34 Q50 30 56 34 L54 38 L46 38Z" fill={clothD} />
          <path d="M46 32 Q42 22 48 24 M54 32 Q60 22 52 24" stroke={cloth} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M20 84 L80 84" stroke={clothD} strokeWidth={1.4} />
          {/* la pata que asoma por un lado del fardo */}
          <path d="M74 58 L86 52 L90 55" stroke={leg} strokeWidth={2.6} fill="none" strokeLinejoin="round" /><circle cx={86} cy={52} r={1.6} fill={legD} />
          {[[7, -3], [8, 1.6], [5, 5], [-1, 5]].map(([dx, dy], i) => <g key={`t${i}`}><path d={`M90 55 l${dx} ${dy}`} stroke={leg} strokeWidth={1.8} strokeLinecap="round" />
            <path d={`M${90 + dx} ${55 + dy} l${dx * 0.18} ${dy * 0.18 + 0.6}`} stroke={pal.ink} strokeWidth={0.9} strokeLinecap="round" /></g>)}
        </g>}
        {/* tela caída al revelarlo */}
        {un > 0.3 && <path d={`M${10 - un * 6} 88 Q30 ${82 + un * 2} 50 86 Q70 ${83 + un * 2} ${90 + un * 4} 88Z`} fill={cloth} opacity={clamp01((un - 0.3) * 3)} />}
      </g>
      {/* polvo del golpe */}
      {hit > 0 && [...Array(7)].map((_, i) => { const a = -Math.PI * (i / 6), r = 8 + hit * 22; return <circle key={`d${i}`} cx={50 + Math.cos(a) * r * 1.4} cy={86 + Math.sin(a) * r * 0.3} r={2.6 * (1 - hit) + 0.4} fill={lerpHex(pal.wallLit, pal.rock, 0.4)} opacity={0.7 * (1 - hit)} />; })}
    </g>
  );
};
