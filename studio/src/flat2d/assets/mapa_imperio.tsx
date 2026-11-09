// mapa_imperio · mapa de pergamino del Imperio romano: el Mediterráneo y el mar Negro con su costa real simplificada, el Danubio, Roma, Siria y Egipto, rosa de los vientos y marco.
// `march` dibuja la ruta de Marco del Danubio hacia Siria con un marcador que avanza; `danubio` hace brillar el río y clava el estandarte de Marco junto a él; `siria` clava el de Casio en Antioquía con un pulso; `spread` tiñe de carmesí Siria y Egipto desde Antioquía (todas se quedan).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

const P = (lon: number, lat: number): [number, number] => [6 + (lon + 6) * 1.85, 52 + (52 - lat) * 2.5];
const path = (pts: number[][]) => pts.map(([lo, la], i) => `${i ? "L" : "M"}${P(lo, la).map((v) => v.toFixed(1)).join(" ")}`).join(" ") + "Z";
const MED = [[-5.6, 36], [-0.5, 38.5], [3, 41.8], [4.8, 43.3], [8.8, 44.4], [10.5, 43.5], [12.5, 41.5], [15.6, 38.2], [16, 38], [17, 39], [18.5, 40.2], [16, 41.5], [13.5, 43.6], [12.3, 45.4], [13.7, 45.6], [16, 43.5], [19, 42], [19.5, 40], [21, 38], [22, 36.5], [23, 37.8], [24, 40], [26, 40.8], [26.3, 40.1], [27, 38.5], [28, 36.7], [30.6, 36.8], [34, 36.2], [36.2, 36.6], [35.8, 34.5], [35, 32.5], [34.3, 31.3], [32, 31.3], [29.9, 31.2], [25, 31.7], [20, 30.5], [15, 32.4], [11, 33.5], [10.2, 36.8], [8, 36.9], [3, 36.8], [-1, 35.5], [-5.4, 35.8]];
const BLACK = [[28, 41.2], [28, 43.2], [29.6, 45.2], [31, 46.6], [33.5, 44.5], [36.5, 45.3], [39, 47], [39.7, 44], [41.6, 41.6], [36, 41.7], [31, 41.1]];
const DANUBE = [[8.2, 48], [12, 48.8], [16.4, 48.2], [18.9, 47.7], [19, 46], [20.5, 44.8], [22.5, 44.6], [25, 43.7], [28, 44.1], [29.6, 45.2]];
const NILE = [[31, 31.3], [31.2, 29], [31, 27], [32.6, 25.7], [32.9, 24]];
const EAST = [[29, 31.4], [32, 31.4], [34.3, 31.4], [35, 32.6], [35.9, 34.6], [36.3, 36.7], [37.5, 37.4], [40.5, 37.2], [40.5, 33], [36, 30], [34.5, 28.5], [33.6, 24], [31, 23.5], [29, 26], [27.5, 29.5]];

export const MapaImperio: AssetFC = ({ pal, p, t, seed }) => {
  const id = `mi${seed}`, dn = p.danubio ?? 0, sy = p.siria ?? 0, spr = p.spread ?? 0, mr = p.march ?? 0;
  const parch = lerpHex(pal.rock, pal.ink, 0.3), ink = lerpHex(pal.wallLit, pal.rim, 0.35), sea = lerpHex(pal.wall, pal.wallLit, 0.12);
  const [ax, ay] = P(36.2, 36.2), [mx, my] = P(19.6, 45), [rx, ry] = P(12.5, 41.9);
  // ruta de la marcha de Marco: del Danubio a Antioquía por los Balcanes y Anatolia, dibujada hasta `mr`
  const route = [P(19.6, 45), P(23.5, 42.6), P(28.5, 41.2), P(32.5, 39.4), P(36.2, 36.2)];
  const segs = route.slice(1).map((q, i) => Math.hypot(q[0] - route[i][0], q[1] - route[i][1])), tot = segs.reduce((a, b) => a + b, 0);
  const upTo: number[][] = [route[0]];
  let left = mr * tot;
  for (let i = 0; i < segs.length && left > 0; i++) {
    const k = Math.min(1, left / segs[i]); upTo.push([route[i][0] + (route[i + 1][0] - route[i][0]) * k, route[i][1] + (route[i + 1][1] - route[i][1]) * k]); left -= segs[i];
  }
  const head = upTo[upTo.length - 1];
  const pin = (x: number, y: number, k: number, col: string, pulse: boolean) => k > 0 ? (
    <g transform={`translate(${x} ${y - 10 * (1 - k)})`} opacity={clamp01(k * 2)}>
      {pulse && [0, 1].map((i) => { const u = ((t * 0.025 + i * 0.5) % 1); return <circle key={i} r={2 + u * 9} fill="none" stroke={col} strokeWidth={0.8} opacity={(1 - u) * 0.9} />; })}
      <path d="M0 0 L0 -11" stroke={ink} strokeWidth={0.8} /><path d="M0 -11 L6 -9.5 L0 -7.5Z" fill={col} /><circle cy={-11.6} r={1} fill={pal.rim} /><circle r={1.4} fill={col} />
    </g>) : null;
  return (
    <g>
      <defs><clipPath id={`${id}c`}><circle cx={ax} cy={ay} r={2 + spr * 40} /></clipPath></defs>
      <rect x={-2} y={-2} width={104} height={182} fill={pal.bg} />
      <rect x={3} y={14} width={94} height={150} rx={2} fill={parch} />
      <Grain n={260} w={94} h={150} seed={seed * 13 + 1} a={lerpHex(pal.rim, parch, 0.6)} b={pal.ink} rMax={0.8} />
      <rect x={3} y={14} width={94} height={150} rx={2} fill="none" stroke={ink} strokeWidth={0.9} /><rect x={5.5} y={16.5} width={89} height={145} fill="none" stroke={ink} strokeWidth={0.4} />
      <text x={50} y={28} textAnchor="middle" fontFamily="Georgia, serif" fontSize={5.6} letterSpacing={0.8} fill={ink}>IMPERIVM ROMANVM</text>
      <path d="M22 31.5 L78 31.5" stroke={ink} strokeWidth={0.4} />
      <path d={path(MED)} fill={sea} stroke={ink} strokeWidth={0.6} strokeLinejoin="round" />
      <path d={path(BLACK)} fill={sea} stroke={ink} strokeWidth={0.6} strokeLinejoin="round" />
      {[[14, 37.5, 2.6, 1.3], [9, 40, 1.1, 2.2], [24.8, 35.2, 2.4, 0.7], [33.2, 35.1, 1.8, 0.8]].map(([lo, la, a, b], i) => { const [x, y] = P(lo, la); return <ellipse key={i} cx={x} cy={y} rx={a} ry={b * 1.6} fill={parch} stroke={ink} strokeWidth={0.5} />; })}
      {[...Array(14)].map((_, i) => { const [x, y] = P(-3 + hash(i) * 30, 33.5 + hash(i + 7) * 4); return <path key={i} d={`M${x} ${y} q1.2 -0.8 2.4 0 q1.2 0.8 2.4 0`} stroke={lerpHex(sea, pal.ink, 0.3)} strokeWidth={0.35} fill="none" />; })}
      <g clipPath={`url(#${id}c)`}><path d={path(EAST)} fill={pal.accent} opacity={0.55 * clamp01(spr * 1.5)} /><path d={path(EAST)} fill="none" stroke={pal.accent} strokeWidth={0.9} strokeDasharray="1.6 1" /></g>
      <path d={path(NILE).replace(/Z$/, "")} stroke={lerpHex(sea, pal.ink, 0.2)} strokeWidth={0.9} fill="none" />
      <path d={path(DANUBE).replace(/Z$/, "")} stroke={lerpHex(sea, pal.ink, 0.2)} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      {dn > 0 && <path d={path(DANUBE).replace(/Z$/, "")} stroke={pal.glow} strokeWidth={1.6 + 0.6 * Math.sin(t * 0.2)} fill="none" strokeLinecap="round" strokeDasharray="160" strokeDashoffset={160 * (1 - dn)} opacity={0.9} />}
      <circle cx={rx} cy={ry} r={1.3} fill={ink} /><text x={rx - 2} y={ry + 5} fontFamily="Georgia, serif" fontSize={3.4} fill={ink}>ROMA</text>
      <text x={P(13, 50)[0]} y={P(13, 50)[1]} fontFamily="Georgia, serif" fontSize={3.4} fill={ink} fontStyle="italic">Danubio</text>
      <text x={P(33.5, 34.2)[0]} y={P(33.5, 34.2)[1] + 1} fontFamily="Georgia, serif" fontSize={3.4} fill={ink}>SIRIA</text>
      <text x={P(26.5, 28.4)[0]} y={P(26.5, 28.4)[1]} fontFamily="Georgia, serif" fontSize={3.4} fill={ink}>EGIPTO</text>
      {mr > 0 && <g>
        <path d={upTo.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ")} stroke={pal.accent} strokeWidth={1.2} strokeDasharray="2 1.2" fill="none" strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={2.2} fill={pal.accent} stroke={pal.rim} strokeWidth={0.5} />
        <path d={`M${head[0] - 1.4} ${head[1] - 3.6} L${head[0] + 1.4} ${head[1] - 3.6} L${head[0]} ${head[1] - 1.6}Z`} fill={pal.rim} />
      </g>}
      {pin(mx, my, dn, pal.accent, true)}
      {pin(ax, ay, Math.max(sy, spr > 0 ? 1 : 0), lerpHex(pal.accent, pal.ink, 0.35), sy > 0 && sy < 1 || spr > 0)}
      {/* rosa de los vientos */}
      <g transform="translate(80 146)">
        <circle r={7} fill="none" stroke={ink} strokeWidth={0.4} />
        {[0, 90, 180, 270].map((r) => <path key={r} d="M0 -9 L1.6 0 L0 1.5 L-1.6 0Z" transform={`rotate(${r})`} fill={r ? ink : pal.accent} />)}
        <text y={-10.5} textAnchor="middle" fontFamily="Georgia, serif" fontSize={2.8} fill={ink}>N</text>
      </g>
      <path d="M12 150 L40 150 M12 152 L30 152" stroke={ink} strokeWidth={0.4} />
    </g>
  );
};
