// alumnos · dos filas de alumnos de la Academia sentados en bancos de madera, de perfil hacia la derecha (miran al maestro), con mantos de colores;
// uno sostiene una tablilla de cera. `applaud` los hace aplaudir (las manos chocan y vuelven al regazo); `part` los hace echarse atrás y apartarse
// del centro (se quedan apartados); `laugh` los sacude de risa con la cabeza atrás (se quedan riendo).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";

export const Alumnos: AssetFC = ({ pal, p, t }) => {
  const ap = p.applaud ?? 0, pt = p.part ?? 0, la = p.laugh ?? 0;
  const clapAmp = Math.sin(clamp01(ap) * Math.PI), wood = lerpHex(pal.rock, pal.ink, 0.25), woodD = lerpHex(wood, pal.ink, 0.4);
  const student = (i: number, row: number) => {
    const n = row ? 6 : 5, x = (row ? 8 : 14) + i * (row ? 16.5 : 18) + (hash(i + row * 7) - 0.5) * 3, y = row ? 26 : 50, s = row ? 0.78 : 1;
    const away = (x - 50) / 50, lean = pt * away * 12, shift = pt * away * 4;
    const shake = la > 0.05 ? Math.sin(t * 1.1 + i * 1.7 + row) * 1.2 * la : 0, back = -10 * la;
    const clap = ap > 0 && ap < 1 ? Math.abs(Math.sin(t * 0.9 + i * 0.8)) * 3 * clapAmp : 0;
    const cloth = lerpHex([pal.accent, pal.wall, pal.rock, pal.wallLit][(i + row * 2) % 4], pal.wallLit, 0.18), shade = lerpHex(cloth, pal.ink, 0.3);
    return (
      <g key={`${row}-${i}`} transform={`translate(${x + shift} ${y + shake * 0.3}) scale(${s}) rotate(${lean} 0 0)`}>
        {/* piernas sentadas: muslo hacia delante, pierna abajo */}
        <path d="M-1 -4 L8 -4 L9 9" stroke={pal.skin} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-6 -24 Q0 -27 6 -24 L8 -3 L-7 -3Z" fill={cloth} /><path d="M-6 -24 Q-8 -12 -7 -3 L-3 -3 Q-4 -14 -2 -25Z" fill={shade} />
        <path d="M-2 -3 L9 -3 L9 1 L-3 1Z" fill={cloth} />
        {/* brazos: en el regazo o aplaudiendo */}
        <g transform={`rotate(${shake * 2} 2 -20)`}>
          <path d={`M2 -21 Q7 ${-14 - clapAmp * 5} ${9 + clap} ${-10 - clapAmp * 8}`} stroke={pal.skin} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d={`M-1 -21 Q5 ${-13 - clapAmp * 5} ${9 - clap} ${-9 - clapAmp * 8}`} stroke={lerpHex(pal.skin, pal.ink, 0.15)} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          {clap > 2.4 && <path d={`M${12} ${-14 - clapAmp * 8} l2 -1.5 M${12} ${-11 - clapAmp * 8} l2.4 0`} stroke={pal.glow} strokeWidth={0.6} />}
          {i === 2 && row === 0 && ap <= 0 && <rect x={6} y={-12} width={6} height={4.4} rx={0.6} fill={lerpHex(pal.rock, pal.rim, 0.25)} transform="rotate(-20 9 -10)" />}
        </g>
        <g transform={`rotate(${back + shake * 3} 0 -26)`}>
          <Cabeza cx={1} cy={-31} r={5.4} pal={pal} turn={0.8} beard={hash(i + row * 3 + 1) > 0.55} mouth={la > 0.1 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 0.8 + i)) : 0} />
        </g>
        {la > 0.25 && i % 2 === row % 2 && <text x={6} y={-40 + Math.sin(t * 0.5 + i) * 1.2} fontSize={4.2} fontFamily="Georgia, serif" fill={pal.wallLit} opacity={clamp01(la * 2 - 0.4)}>ja</text>}
      </g>
    );
  };
  const bench = (y: number, k: number) => (
    <g key={`b${k}`}><rect x={-2} y={y - 3} width={104} height={3.4} fill={wood} /><rect x={-2} y={y + 0.4} width={104} height={1} fill={woodD} />
      {[6, 34, 62, 90].map((x) => <rect key={x} x={x} y={y + 0.4} width={2.4} height={k ? 6 : 8} fill={woodD} />)}</g>
  );
  return (
    <g>
      {[...Array(6)].map((_, i) => student(i, 1))}
      {bench(26, 1)}
      {[...Array(5)].map((_, i) => student(i, 0))}
      {bench(50, 0)}
      <ellipse cx={50} cy={58.5} rx={50} ry={1.8} fill={pal.ink} opacity={0.35} />
    </g>
  );
};
