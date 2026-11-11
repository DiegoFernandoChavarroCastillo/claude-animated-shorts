// mapa_bronce · Mapa de pergamino oscuro con tinta dorada del Mediterráneo oriental hacia 1200 a. C.: Micenas, Hattusa, Ugarit, Chipre, Egipto, Babilonia: el mundo del bronce, las rutas comerciales, los reinos.
// `trade` se dibujan las rutas y navegan barquitos (se queda); `tin` llega la ruta del estaño desde el este y se marca el cobre de Chipre (se queda); `away` dos flechas salen de Ugarit; `cut` las rutas se cortan una a una con una X roja (se quedan); `burn` arden Ugarit, Hattusa, Micenas y Chipre, una tras otra (se quedan).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { seg } from "./bronce";

// ---------------------------------------------------------------- mapa del Mediterráneo oriental (c. 1200 a. C.)
const PM = (lon: number, lat: number): [number, number] => [4 + (lon - 19) * 3.4, 30 + (43 - lat) * 5];
const pth = (pts: number[][], close = true) => pts.map(([lo, la], i) => `${i ? "L" : "M"}${PM(lo, la).map((v) => v.toFixed(1)).join(" ")}`).join(" ") + (close ? "Z" : "");
const SEA = [[19, 40.2], [20, 39.5], [21, 38.3], [21.6, 37], [22.4, 36.4], [23.2, 36.4], [22.9, 37.5], [23.6, 37.9], [24.1, 38.2], [23, 39], [22.6, 40.3], [23.8, 40.4], [24.4, 40.9], [26, 40.8], [26.3, 40.1], [26.2, 39.4], [27, 38.5], [27.2, 37.6], [28, 36.7], [29.6, 36.2], [30.6, 36.8], [32, 36.1], [34, 36.2], [35.6, 36.6], [36.2, 36.6], [35.9, 35.6], [35.8, 34.6], [35.5, 33.8], [35.1, 33], [34.6, 32], [34.3, 31.3], [32.3, 31.2], [30.5, 31.5], [29.9, 31.2], [28, 31.1], [25, 31.6], [22, 32.8], [20, 32], [19, 30.8]];
const CYP = [[32.3, 35.1], [32.9, 35.4], [34, 35.4], [34.6, 35.7], [33.9, 35.1], [34, 34.6], [33, 34.6], [32.4, 34.8]];
const CRE = [[23.5, 35.4], [24.5, 35.5], [25.5, 35.35], [26.3, 35.25], [26, 34.95], [24.8, 34.95], [23.6, 35.2]];
const CITY: Record<string, [number, number, string, number]> = {
  micenas: [22.75, 37.73, "MICENAS", -1], hattusa: [34.6, 40.0, "HATTUSA", 1], ugarit: [35.78, 35.6, "UGARIT", 1], chipre: [33.4, 35.1, "CHIPRE", 0],
  egipto: [31.8, 30.6, "EGIPTO", 1], babilonia: [44.4, 32.5, "BABILONIA", -1], lukka: [29.4, 36.9, "LUKKA", 0],
};
const ROUTES: [string, string, boolean][] = [["chipre", "ugarit", true], ["egipto", "ugarit", true], ["micenas", "chipre", true], ["hattusa", "ugarit", false], ["babilonia", "ugarit", false]];

export const MapaBronce: AssetFC = ({ pal, p, t, seed, flick }) => {
  const tr = p.trade ?? 0, tn = p.tin ?? 0, aw = p.away ?? 0, cu = p.cut ?? 0, bu = p.burn ?? 0;
  const parch = lerpHex(pal.rock, pal.ink, 0.35), ink = lerpHex(pal.wallLit, pal.rim, 0.4), sea = lerpHex(pal.wall, pal.ink, 0.45), land = lerpHex(parch, pal.rim, 0.08);
  const C = (k: string) => PM(CITY[k][0], CITY[k][1]);
  const curve = (a: [number, number], b: [number, number], bend: number) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - bend; return { d: `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`, at: (u: number) => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]] }; };
  const fire = (x: number, y: number, k: number, i: number) => k > 0 ? <g key={`fi${i}`}>
    <circle cx={x} cy={y} r={7 * k} fill={pal.accent} opacity={0.35 * (0.8 + 0.2 * flick)} />
    {[-1.6, 0, 1.6].map((dx, j) => { const h = (4 + j % 2 * 2) * k * (0.8 + 0.25 * Math.sin(t * 0.6 + j + i)); return <path key={j} d={`M${x + dx - 1.3} ${y} Q${x + dx} ${y - h} ${x + dx + 1.3} ${y}Z`} fill={j === 1 ? pal.glow : pal.rim} />; })}
  </g> : null;
  const burnOrder = ["ugarit", "hattusa", "micenas", "chipre"];
  const tinA = PM(46.5, 35.2), tinPath = curve(tinA, C("babilonia"), 4), tin2 = curve(C("babilonia"), C("ugarit"), 6);
  return (
    <g>
      <rect x={-2} y={-2} width={104} height={182} fill={pal.bg} />
      <rect x={2} y={14} width={96} height={150} rx={2} fill={parch} />
      <Grain n={240} w={96} h={150} seed={seed * 13 + 1} a={lerpHex(pal.rim, parch, 0.7)} b={pal.ink} rMax={0.8} />
      <rect x={2} y={14} width={96} height={150} rx={2} fill="none" stroke={ink} strokeWidth={0.9} /><rect x={4.5} y={16.5} width={91} height={145} fill="none" stroke={ink} strokeWidth={0.35} />
      <text x={50} y={25} textAnchor="middle" fontFamily="Georgia, serif" fontSize={4.6} letterSpacing={0.6} fill={ink}>EL MUNDO DEL BRONCE · 1200 a. C.</text>
      <rect x={4.5} y={28} width={91} height={84} fill={land} />
      <path d={pth(SEA)} fill={sea} stroke={ink} strokeWidth={0.55} strokeLinejoin="round" />
      <path d={pth(CYP)} fill={land} stroke={ink} strokeWidth={0.5} /><path d={pth(CRE)} fill={land} stroke={ink} strokeWidth={0.5} />
      <path d={pth([[31, 31.4], [31.2, 30], [31, 28]], false)} stroke={sea} strokeWidth={1} fill="none" />
      <path d={pth([[38.2, 37.2], [38.4, 36], [40, 35], [41.5, 34.4], [43.5, 33.2], [44.4, 32.5], [45, 31.2]], false)} stroke={sea} strokeWidth={1} fill="none" />
      {[...Array(12)].map((_, i) => { const [x, y] = PM(20 + hash(i) * 12, 32 + hash(i + 7) * 3); return <path key={i} d={`M${x} ${y} q1 -0.7 2 0 q1 0.7 2 0`} stroke={lerpHex(sea, pal.wallLit, 0.2)} strokeWidth={0.3} fill="none" />; })}
      {/* rutas */}
      {ROUTES.map(([a, b, bySea], i) => {
        const c = curve(C(a), C(b), bySea ? 4 : 3), k = seg(tr, i * 0.12, i * 0.12 + 0.4), cut = seg(cu, i / ROUTES.length, (i + 0.8) / ROUTES.length);
        if (k <= 0) return null;
        const col = cut > 0 ? lerpHex(pal.rim, pal.accent, cut) : pal.rim, [mx, my] = c.at(0.5);
        return <g key={`r${i}`}>
          <path d={c.d} stroke={col} strokeWidth={0.9} strokeDasharray={bySea ? "1.8 1" : "0.6 0.9"} fill="none" pathLength={100} strokeDashoffset={0} opacity={1 - cut * 0.5} />
          {cut === 0 && k >= 1 && bySea && (() => { const [sx, sy] = c.at(((t * 0.006 + i * 0.3) % 1)); return <path d={`M${sx - 1.6} ${sy} Q${sx} ${sy + 1} ${sx + 1.6} ${sy} L${sx} ${sy - 2.6}Z`} fill={pal.glow} />; })()}
          {cut > 0 && <g transform={`translate(${mx} ${my}) scale(${clamp01(cut * 2)})`}><path d="M-2.4 -2.4 L2.4 2.4 M2.4 -2.4 L-2.4 2.4" stroke={pal.accent} strokeWidth={1.3} strokeLinecap="round" /></g>}
        </g>;
      })}
      {/* estaño y cobre */}
      {tn > 0 && <g opacity={clamp01(tn * 2)}>
        <path d={tinPath.d} stroke={pal.glow} strokeWidth={1.2} strokeDasharray="2 1" fill="none" />
        <path d={tin2.d} stroke={pal.glow} strokeWidth={1.2} strokeDasharray="2 1" fill="none" />
        <path d={`M${tinA[0] + 3} ${tinA[1] - 1.5} L${tinA[0]} ${tinA[1]} L${tinA[0] + 3} ${tinA[1] + 1.5}`} stroke={pal.glow} strokeWidth={0.9} fill="none" />
        <text x={tinA[0] - 1} y={tinA[1] - 4} textAnchor="end" fontFamily="Georgia, serif" fontSize={3.2} fontWeight="bold" fill={pal.glow}>ESTAÑO →</text>
        <text x={C("chipre")[0]} y={C("chipre")[1] + 6} textAnchor="middle" fontFamily="Georgia, serif" fontSize={3.2} fontWeight="bold" fill={lerpHex(pal.rim, pal.accent, 0.3)}>COBRE</text>
        {(() => { const [sx, sy] = tin2.at(seg(tn, 0.2, 1)); return <rect x={sx - 1.4} y={sy - 0.9} width={2.8} height={1.8} rx={0.4} fill={pal.glow} />; })()}
      </g>}
      {/* ciudades */}
      {Object.entries(CITY).map(([k, [lo, la, name, side]]) => { if (k === "lukka" && aw === 0) return null; const [x, y] = PM(lo, la), hot = k === "ugarit";
        return <g key={k}><circle cx={x} cy={y} r={hot ? 1.5 : 1.1} fill={hot ? pal.rim : ink} stroke={pal.ink} strokeWidth={0.3} />
          {hot && <circle cx={x} cy={y} r={2.6 + Math.sin(t * 0.15) * 0.6} fill="none" stroke={pal.rim} strokeWidth={0.4} />}
          <text x={x + side * 2.2} y={y + (side === 0 ? -2.6 : 1.2)} textAnchor={side > 0 ? "start" : side < 0 ? "end" : "middle"} fontFamily="Georgia, serif" fontSize={hot ? 3.4 : 2.9} fontWeight={hot ? "bold" : "normal"} fill={ink}>{name}</text></g>; })}
      {/* ejército a Hatti y flota a Lukka */}
      {aw > 0 && [["hattusa", "EJÉRCITO", 0], ["lukka", "FLOTA", 0.3]].map(([to, label, d0], i) => {
        const k = seg(aw, d0 as number, (d0 as number) + 0.6), c = curve(C("ugarit"), C(to as string), i ? 10 : 3), [hx, hy] = c.at(k), [px, py] = c.at(Math.max(0, k - 0.05));
        const ang = Math.atan2(hy - py, hx - px) * 180 / Math.PI;
        return k > 0 ? <g key={`aw${i}`}>
          <path d={c.d} stroke={pal.accent} strokeWidth={1.3} fill="none" pathLength={100} strokeDasharray={`${k * 100} 100`} strokeLinecap="round" />
          <path d="M0 0 L-3 -1.8 L-3 1.8Z" fill={pal.accent} transform={`translate(${hx} ${hy}) rotate(${ang})`} />
          <text x={hx + (i ? -1 : 2)} y={hy + (i ? 6 : -2.5)} textAnchor={i ? "middle" : "start"} fontFamily="Georgia, serif" fontSize={3.2} fontWeight="bold" fill={pal.accent} opacity={clamp01(k * 2 - 0.6)}>{label}</text>
        </g> : null; })}
      {burnOrder.map((k, i) => fire(C(k)[0], C(k)[1], seg(bu, i * 0.2, i * 0.2 + 0.3), i))}
      {/* rosa de los vientos y franja oscura */}
      <g transform="translate(14 126)"><circle r={6} fill="none" stroke={ink} strokeWidth={0.4} />{[0, 90, 180, 270].map((r) => <path key={r} d="M0 -8 L1.4 0 L0 1.3 L-1.4 0Z" transform={`rotate(${r})`} fill={r ? ink : pal.accent} />)}</g>
      <path d="M30 124 L84 124 M30 127 L70 127" stroke={ink} strokeWidth={0.35} opacity={0.6} />
    </g>
  );
};
