// circulo_control · la dicotomía del control como imagen: un gran anillo exterior apagado con lo que NO depende de ti (nube con lluvia, una boca que grita,
// un reloj, una pierna rota) y un círculo interior luminoso con una figura serena, la mano en el pecho: lo que SÍ depende de ti.
// `outer` los iconos del anillo aparecen uno tras otro y se apagan (se quedan apagados); `inner` el círculo interior se enciende y aparece la figura (se queda).
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const CirculoControl: AssetFC = ({ pal, p, t, seed }) => {
  const ou = p.outer ?? 0, inn = p.inner ?? 0, id = `cc${seed}`, cx = 50, cy = 84, R = 28, dim = lerpHex(pal.wallLit, pal.wall, 0.5);
  const icons: [number, (x: number, y: number) => React.ReactNode][] = [
    [-90, (x, y) => <g><ellipse cx={x} cy={y} rx={6} ry={3.4} fill={dim} /><circle cx={x - 3} cy={y - 1.6} r={2.8} fill={dim} /><circle cx={x + 2} cy={y - 2.4} r={3.2} fill={dim} />
      {[-3, 0, 3].map((d) => <path key={d} d={`M${x + d} ${y + 4 + ((t * 0.3 + d) % 3)} l-0.8 2`} stroke={pal.rim} strokeWidth={0.6} />)}</g>],
    [0, (x, y) => <g><ellipse cx={x} cy={y} rx={4.6} ry={3.6} fill={dim} /><ellipse cx={x} cy={y + 0.4} rx={3} ry={2.2} fill={pal.ink} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${x + 6 + i * 2} ${y - 3} q1.4 3 0 6`} stroke={dim} strokeWidth={0.6} fill="none" />)}</g>],
    [90, (x, y) => <g><circle cx={x} cy={y} r={5} fill="none" stroke={dim} strokeWidth={1.2} /><path d={`M${x} ${y} L${x} ${y - 3.4} M${x} ${y} L${x + Math.cos(t * 0.1) * 2.6} ${y + Math.sin(t * 0.1) * 2.6}`} stroke={dim} strokeWidth={0.8} /></g>],
    [180, (x, y) => <g><path d={`M${x - 6} ${y - 1} L${x} ${y} L${x + 4} ${y + 4}`} stroke={dim} strokeWidth={2.2} fill="none" strokeLinecap="round" /><path d={`M${x - 1} ${y - 2.6} l1 1.2 l-1 1 l1 1.2`} stroke={pal.accent} strokeWidth={0.5} fill="none" /></g>],
  ];
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.95} /><stop offset="0.6" stopColor={pal.rim} stopOpacity={0.5} /><stop offset="1" stopColor={pal.rim} stopOpacity={0} /></radialGradient></defs>
      <rect x={-2} y={-2} width={104} height={182} fill={lerpHex(pal.bg, pal.ink, 0.2)} />
      <Grain n={260} w={100} h={178} seed={seed * 5 + 9} a={lerpHex(pal.bg, pal.wallLit, 0.2)} b={pal.ink} rMax={0.7} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={dim} strokeWidth={0.8} strokeDasharray="2 2" transform={`rotate(${t * 0.3} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={R + 3} fill="none" stroke={lerpHex(pal.wall, pal.ink, 0.2)} strokeWidth={0.4} />
      {icons.map(([deg, f], i) => { const k = clamp01(ou * 4 - i * 0.7), a = (deg + t * 0.3) * Math.PI / 180, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        return <g key={i} opacity={k * (ou > 0.95 ? 0.55 : 0.9)}><g transform={`translate(${x} ${y}) scale(1.45) translate(${-x} ${-y})`}><circle cx={x} cy={y} r={8} fill={lerpHex(pal.bg, pal.wall, 0.5)} />{f(x, y)}</g></g>; })}
      <circle cx={cx} cy={cy} r={14 + 8 * inn} fill={`url(#${id}g)`} opacity={0.25 + 0.75 * inn} />
      <circle cx={cx} cy={cy} r={13} fill="none" stroke={pal.rim} strokeWidth={0.8 + inn} opacity={0.4 + 0.6 * inn} />
      <g opacity={clamp01(inn * 1.5)} transform={`translate(${cx} ${cy + 8}) scale(${0.8 + 0.2 * inn})`}>
        <path d="M-4 0 L-3 -10 Q0 -12 3 -10 L4 0Z" fill={lerpHex(pal.ink, pal.wall, 0.3)} />
        <circle cx={0} cy={-14} r={3} fill={lerpHex(pal.ink, pal.wall, 0.3)} />
        <path d="M-3 -9 Q-1 -6 1 -7" stroke={lerpHex(pal.ink, pal.wall, 0.3)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <circle cx={0.6} cy={-7.4} r={0.9} fill={pal.accent} opacity={0.5 + 0.5 * Math.sin(t * 0.2)} />
      </g>
    </g>
  );
};
