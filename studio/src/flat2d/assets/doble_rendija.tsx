// doble_rendija · vista cenital del experimento: un emisor abajo, una barrera con dos rendijas y una pantalla arriba. `fire` lanza partículas que forman franjas de interferencia; `watch` enciende un detector (ojo) y las franjas se convierten en dos bandas; `mark` hace lo mismo con una marca en cada rendija, sin ojo.
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { Grain } from "./grain";

const N = 340;
const sample = (pdf: (x: number) => number, seed: number) => { const out: number[] = []; for (let i = 0; out.length < N && i < 30000; i++) { if (hash(i * 2.7 + seed + 9) < pdf(14 + hash(i * 1.3 + seed) * 72)) out.push(14 + hash(i * 1.3 + seed) * 72); } return out; };
const FR = sample((x) => { const c = Math.cos((x - 50) * 0.5); return c ** 6 * Math.exp(-(((x - 50) / 34) ** 2)); }, 3);
const BA = sample((x) => Math.exp(-(((x - 40) / 3.2) ** 2)) + Math.exp(-(((x - 60) / 3.2) ** 2)), 7);
const SLITS = [40, 60];

export const DobleRendija: AssetFC = ({ pal, p, t, seed, flick, params }) => {
  const fire = p.fire ?? 0, eye = p.watch ?? 0, mark = p.mark ?? 0, watch = Math.max(eye, mark), running = fire > 0.02 || watch > 0.02, id = `dr${seed}`;
  const classic = (params.fire as { mode?: string } | undefined)?.mode === "bands", nFr = classic ? 0 : Math.floor(N * fire), nBa = Math.floor(N * (classic ? fire : watch));
  const dotY = (i: number) => 8 + hash(i + 40) * 18;
  const waves = [0, 1, 2, 3, 4, 5].map((k) => (t * 0.5 + k * 7) % 42);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.ink} stopOpacity={0.85} /><stop offset="1" stopColor={pal.bg} stopOpacity={0.85} /></linearGradient>
        <clipPath id={`${id}c`}><rect x={0} y={28} width={100} height={38} /></clipPath>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={2} y={2} width={96} height={126} rx={5} fill={`url(#${id}b)`} stroke={pal.rim} strokeWidth={0.5} opacity={0.95} />
      {/* pantalla */}
      <rect x={10} y={6} width={80} height={22} rx={2} fill={pal.ink} stroke={pal.rim} strokeWidth={0.8} />
      <rect x={10} y={6} width={80} height={22} rx={2} fill={pal.glow} opacity={0.05} />
      {FR.slice(0, nFr).map((x, i) => <circle key={`f${i}`} cx={x} cy={dotY(i)} r={0.6} fill={pal.glow} opacity={(1 - watch) * 0.95} />)}
      {BA.slice(0, nBa).map((x, i) => <circle key={`b${i}`} cx={x} cy={dotY(i + 77)} r={0.6} fill={pal.accent} opacity={0.95} />)}
      {/* ondas de las dos rendijas */}
      {running && <g clipPath={`url(#${id}c)`} opacity={(1 - watch) * (classic ? 0 : 0.7)}>{SLITS.map((sx) => waves.map((r, k) => <path key={`${sx}${k}`} d={`M${sx - r} 66 A${r} ${r} 0 0 1 ${sx + r} 66`} stroke={pal.wallLit} strokeWidth={0.7} fill="none" opacity={(1 - r / 42) * 0.8} />))}</g>}
      {/* barrera */}
      {[[6, 37.5], [42.5, 57.5], [62.5, 94]].map(([a, b], i) => <g key={i}><rect x={a} y={64} width={b - a} height={5} fill={pal.rock} stroke={pal.rim} strokeWidth={0.5} /><Grain n={14} w={b - a} h={5} seed={seed + i * 11} a={pal.wallLit} b={pal.wall} rMax={0.5} /></g>)}
      {SLITS.map((sx) => <rect key={sx} x={sx - 2.5} y={64} width={5} height={5} fill={pal.glow} opacity={0.25 + 0.5 * (running ? 1 : 0) * (0.7 + 0.3 * flick)} />)}
      {/* detector: ojo con dos haces hacia las rendijas */}
      {mark > 0.01 && SLITS.map((sx) => <g key={`m${sx}`} opacity={clamp01(mark * 1.6)} transform={`translate(${sx} 60) scale(${lerp(0.5, 1, clamp01(mark * 1.4))}) translate(${-sx} -60)`}><path d={`M${sx} 55.5 L${sx + 3.2} 59.5 L${sx} 63.5 L${sx - 3.2} 59.5 Z`} fill={pal.accent} stroke={pal.ink} strokeWidth={0.6} /><circle cx={sx} cy={59.5} r={5.6} fill="none" stroke={pal.glow} strokeWidth={0.5} opacity={0.6} /></g>)}
      {eye > 0.01 && <g opacity={clamp01(eye * 1.6)} transform={`translate(50 52) scale(${lerp(0.6, 1, clamp01(eye * 1.4))}) translate(-50 -52)`}>
        {SLITS.map((sx) => <path key={sx} d={`M50 55 L${sx - 3} 64 L${sx + 3} 64 Z`} fill={pal.glow} opacity={0.35} />)}
        <path d="M39 52 Q50 41 61 52 Q50 63 39 52Z" fill="#FFF3D6" stroke={pal.ink} strokeWidth={0.8} />
        <circle cx={50} cy={52} r={4.4} fill={pal.accent} /><circle cx={50} cy={52} r={2} fill={pal.ink} /><circle cx={51.4} cy={50.8} r={0.9} fill="#FFF8E8" />
      </g>}
      {/* partículas en vuelo */}
      {running && [0, 1, 2, 3, 4].map((j) => {
        const ph = (t * 0.032 + j / 5) % 1, cyc = Math.floor(t * 0.032 + j / 5), idx = (j * 31 + cyc * 17) % N, sx = SLITS[(j + cyc) % 2];
        const tx = (watch > 0.5 || classic ? BA : FR)[idx];
        const [x, y] = ph < 0.45 ? [lerp(50, sx, ph / 0.45), lerp(108, 67, ph / 0.45)] : [lerp(sx, tx, (ph - 0.45) / 0.55), lerp(67, 16, (ph - 0.45) / 0.55)];
        return <g key={j}><circle cx={x} cy={y} r={3.6} fill={`url(#${id}g)`} opacity={0.7} /><circle cx={x} cy={y} r={1.2} fill="#FFF8E8" /></g>;
      })}
      {/* emisor */}
      <path d="M43 124 L43 114 L47 108 L53 108 L57 114 L57 124 Z" fill={pal.wall} stroke={pal.rim} strokeWidth={0.7} />
      <circle cx={50} cy={108} r={running ? 2.6 + 0.8 * flick : 1.6} fill={pal.glow} opacity={running ? 1 : 0.5} />
    </g>
  );
};
