// oficina_grito · una oficina de hoy, de noche: ventanal con luces de la ciudad, tubo fluorescente, un escritorio con monitor. El jefe (camisa y corbata),
// de pie a la izquierda, se inclina y te señala; tú, sentado detrás del escritorio a la derecha, lo miras con las manos en la mesa.
// `yell` el jefe grita: boca abierta, ondas y saliva, se inclina hacia ti (se queda gritando); `flush` el calor te sube del cuello a la cara, que se pone roja, con ondas de calor (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { Grain } from "./grain";

export const OficinaGrito: AssetFC = ({ pal, p, t, seed }) => {
  const ye = p.yell ?? 0, fl = p.flush ?? 0, id = `og${seed}`;
  const wall = lerpHex(pal.wall, pal.ink, 0.15), desk = lerpHex(pal.rock, pal.wallLit, 0.12), shirt = lerpHex(pal.wallLit, pal.wall, 0.15);
  const lean = ye * 4 + (ye > 0.3 ? Math.sin(t * 0.9) * 0.6 : 0), mouth = ye > 0.2 ? 0.8 + 0.4 * Math.abs(Math.sin(t * 0.7)) : 0;
  const red = lerpHex(pal.skin, pal.accent, 0.6 * clamp01(fl * 1.3));
  return (
    <g>
      <defs><linearGradient id={`${id}f`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={pal.accent} stopOpacity={0.55 * fl} /><stop offset={clamp01(fl)} stopColor={pal.accent} stopOpacity={0.4 * fl} /><stop offset={clamp01(fl + 0.05)} stopColor={pal.accent} stopOpacity={0} /></linearGradient></defs>
      <rect x={-2} y={-2} width={104} height={110} fill={wall} />
      <Grain n={160} w={100} h={106} seed={seed * 3 + 7} a={lerpHex(wall, pal.wallLit, 0.2)} b={pal.ink} rMax={0.7} />
      {/* ventanal con la ciudad */}
      <rect x={8} y={34} width={84} height={46} fill={lerpHex(pal.bg, pal.ink, 0.3)} />
      {[...Array(14)].map((_, i) => { const x = 10 + i * 6, h = 10 + ((i * 37) % 19); return <rect key={i} x={x} y={80 - h} width={5} height={h} fill={lerpHex(pal.bg, pal.wall, 0.4)} />; })}
      {[...Array(40)].map((_, i) => <rect key={`l${i}`} x={11 + ((i * 23) % 80)} y={64 + ((i * 7) % 14)} width={0.9} height={0.9} fill={pal.glow} opacity={0.4 + 0.4 * ((i * 13) % 3) / 2} />)}
      {[30, 50, 70].map((x) => <rect key={x} x={x} y={34} width={1.2} height={46} fill={lerpHex(wall, pal.ink, 0.3)} />)}
      <rect x={8} y={34} width={84} height={46} fill="none" stroke={lerpHex(wall, pal.ink, 0.4)} strokeWidth={1.4} />
      {/* fluorescente */}
      <rect x={30} y={20} width={40} height={2.4} rx={1} fill={pal.glow} opacity={0.85 + 0.1 * Math.sin(t * 2.3)} />
      <path d="M30 22.4 L18 60 L82 60 L70 22.4Z" fill={pal.glow} opacity={0.05} />
      {/* suelo */}
      <rect x={-2} y={106} width={104} height={74} fill={lerpHex(pal.rock, pal.ink, 0.35)} />
      <g transform="translate(0 106)"><Grain n={80} w={100} h={72} seed={seed * 5} a={pal.rock} b={pal.ink} rMax={0.6} /></g>
      {/* tú, sentado detrás del escritorio */}
      <path d="M62 84 Q60 74 66 70 L80 70 Q86 74 84 92Z" fill={lerpHex(pal.accent, pal.wall, 0.6)} />
      <rect x={70.5} y={64} width={5} height={7} fill={red} />
      <g transform={`translate(${fl > 0.5 ? Math.sin(t * 1.4) * 0.3 : 0} 0)`}>
        <Cabeza cx={73} cy={58} r={6.6} pal={{ ...pal, skin: red }} turn={-0.7} curls={false} hair={lerpHex(pal.rock, pal.ink, 0.5)} eyesClosed={fl * 0.25} />
        <ellipse cx={73} cy={58} rx={5.7} ry={6.6} fill={`url(#${id}f)`} />
      </g>
      {fl > 0.3 && [0, 1, 2].map((i) => <path key={i} d={`M${68 + i * 4} ${48 - ((t * 0.3 + i * 3) % 8)} q-1 -2 0 -4 q1 -2 0 -4`} stroke={pal.accent} strokeWidth={0.7} fill="none" opacity={(fl - 0.3) * (1 - ((t * 0.3 + i * 3) % 8) / 8)} />)}
      <path d="M64 76 Q60 86 62 90 M82 76 Q86 86 84 90" stroke={lerpHex(pal.accent, pal.wall, 0.6)} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* escritorio y monitor */}
      <rect x={50} y={88} width={52} height={4} fill={desk} /><rect x={54} y={92} width={44} height={14} fill={lerpHex(desk, pal.ink, 0.35)} />
      <path d="M50 88 L102 88" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} />
      {[[62, 88], [84, 88]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y - 0.6} rx={2.4} ry={1.2} fill={red} />)}
      <rect x={88} y={70} width={14} height={11} rx={0.8} fill={pal.ink} /><rect x={89} y={71} width={12} height={9} fill={lerpHex(pal.accent, pal.rim, 0.5)} opacity={0.35} />
      <rect x={93} y={81} width={3} height={7} fill={pal.ink} />
      {/* el jefe */}
      <g transform={`rotate(${lean} 26 106)`}>
        {[-1, 1].map((s) => <rect key={s} x={26 + s * 3.4 - 2} y={84} width={4} height={21} fill={lerpHex(pal.ink, pal.wall, 0.4)} />)}
        <path d="M17 58 Q26 54 35 58 L36 86 L16 86Z" fill={shirt} />
        <path d="M26 58 L24.4 64 L26 80 L27.6 64Z" fill={pal.accent} />
        <path d="M24 57 L26 60 L28 57" stroke={lerpHex(shirt, pal.ink, 0.3)} strokeWidth={0.6} fill="none" />
        <path d="M18 60 Q14 72 16 80" stroke={shirt} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M34 60 Q${lerp(38, 42, ye)} ${lerp(70, 60, ye)} ${lerp(38, 50, ye)} ${lerp(80, 60, ye)}`} stroke={shirt} strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={lerp(38, 51, ye)} cy={lerp(81, 60, ye)} rx={1.8} ry={1.6} fill={pal.skin} />
        {ye > 0.3 && <path d="M52.4 59.6 l3 -0.6" stroke={pal.skin} strokeWidth={1} strokeLinecap="round" />}
        <rect x={23.5} y={51} width={5} height={6} fill={pal.skin} />
        <Cabeza cx={26} cy={45} r={6.6} pal={pal} turn={0.7} curls={false} mouth={mouth} hair={lerpHex(pal.rock, pal.wallLit, 0.35)} />
        <path d="M27 39.6 L31 41 M23 40 L21 41.4" stroke={pal.ink} strokeWidth={0.8} opacity={ye} />
      </g>
      {ye > 0.25 && [0, 1, 2].map((i) => { const u = ((t * 0.08 + i / 3) % 1); return <path key={i} d={`M${36 + u * 22} ${42 - u * 6} q2 ${4 + u * 3} 0 ${8 + u * 6}`} stroke={pal.wallLit} strokeWidth={0.8} fill="none" opacity={(1 - u) * 0.8 * clamp01(ye * 2)} />; })}
      {ye > 0.3 && [0, 1, 2, 3].map((i) => <circle key={`s${i}`} cx={36 + ((t * 0.9 + i * 7) % 14)} cy={47 + Math.sin(i * 2) * 2 + ((t * 0.4 + i) % 3)} r={0.35} fill={pal.wallLit} opacity={0.7} />)}
    </g>
  );
};
