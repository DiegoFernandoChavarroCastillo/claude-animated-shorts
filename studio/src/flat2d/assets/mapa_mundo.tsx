// mapa_mundo · mapa del mundo del kit (D123), con los continentes simplificados. `opts.vista`: plano (mapa extendido) | globo (la Tierra redonda, con
// atmósfera y brillo). `opts.centro` [lon, lat] y `opts.zoom` encuadran una región (plano: 1 = el mundo entero a lo ancho; globo: 1 = el globo ocupa el ancho).
// `opts.ruta` [[lon, lat], …] y `opts.puntos` [[lon, lat], …] (sin `puntos` se usan grandes ciudades del mundo). Acciones propias:
// `route` traza la ruta con una línea que brilla y un marcador que avanza (se queda); `light_points` enciende los puntos uno tras otro con un pulso (se quedan);
// `spin` gira el globo 40° hacia el este (se queda); `veil` un velo de bruma oscura se extiende desde `opts.origen` [lon, lat] hasta cubrir el planeta y lo oscurece (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

type LL = [number, number];
const LAND: LL[][] = [
  [[-168, 66], [-156, 71], [-125, 70], [-95, 72], [-80, 73], [-62, 60], [-55, 52], [-66, 45], [-76, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 19], [-87, 21], [-83, 10], [-78, 8], [-92, 15], [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-124, 48], [-135, 58], [-152, 58], [-165, 55]],
  [[-78, 8], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-35, -6], [-39, -15], [-48, -25], [-57, -36], [-65, -42], [-68, -54], [-74, -50], [-72, -38], [-70, -18], [-76, -13], [-81, -5], [-78, 2]],
  [[-52, 60], [-44, 60], [-22, 70], [-20, 80], [-45, 83], [-70, 78], [-55, 70]],
  [[-17, 15], [-16, 22], [-6, 35], [10, 37], [11, 33], [25, 32], [33, 31], [43, 12], [51, 11], [40, -4], [40, -16], [33, -26], [26, -34], [18, -34], [12, -17], [13, -6], [9, 4], [-8, 5], [-13, 9]],
  [[-10, 37], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 59], [6, 62], [15, 69], [28, 71], [42, 67], [60, 68], [60, 55], [50, 46], [40, 47], [41, 41], [28, 41], [26, 36], [22, 37], [19, 41], [13, 45], [16, 38], [12, 38], [9, 44], [3, 43], [0, 39], [-5, 36]],
  [[60, 68], [75, 73], [105, 78], [140, 73], [180, 68], [178, 62], [160, 60], [156, 51], [142, 53], [135, 45], [129, 36], [122, 40], [118, 35], [122, 30], [117, 23], [108, 21], [109, 12], [103, 9], [100, 14], [98, 8], [104, 1], [98, 17], [92, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 26], [52, 16], [43, 13], [35, 28], [36, 36], [28, 41], [41, 41], [50, 46], [60, 55]],
  [[114, -22], [122, -18], [131, -12], [137, -15], [142, -11], [146, -19], [153, -27], [150, -37], [140, -38], [131, -32], [116, -34]],
  [[-180, -72], [-120, -73], [-62, -65], [-58, -72], [0, -70], [60, -67], [120, -66], [180, -72], [180, -89], [-180, -89]],
  [[-6, 50], [1, 51], [-2, 58], [-6, 57]], [[130, 32], [141, 36], [142, 44], [139, 40], [134, 35]], [[44, -25], [50, -15], [49, -12], [44, -18]], [[167, -46], [174, -41], [178, -37], [173, -35], [170, -43]],
];
const CITIES: LL[] = [[-74, 4.7], [-99, 19.4], [-74, 40.7], [-118, 34], [-79, 43.7], [-58, -34.6], [-46.6, -23.5], [-70.6, -33.4], [-77, -12], [-78.5, -0.2], [-66.9, 10.5], [-3.7, 40.4], [2.3, 48.9], [-0.1, 51.5], [13.4, 52.5], [12.5, 41.9], [37.6, 55.8], [28.9, 41],
  [31.2, 30], [3.4, 6.5], [36.8, -1.3], [18.4, -33.9], [51.4, 35.7], [72.9, 19], [77.2, 28.6], [90.4, 23.8], [100.5, 13.8], [106.8, -6.2], [103.8, 1.3], [116.4, 39.9], [121.5, 31.2], [127, 37.6], [139.7, 35.7], [151.2, -33.9], [174.8, -36.8], [-157.8, 21.3]];
const R = Math.PI / 180;

export const MapaMundo: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `mm${seed}`, globo = opt(opts, "vista", "plano") === "globo", zoom = opt(opts, "zoom", 1), c0 = opt<LL>(opts, "centro", globo ? [-70, -10] : [10, 15]);
  const lon0 = c0[0] + (p.spin ?? 0) * 40, lat0 = c0[1], CX = 50, CY = 89, RG = 46 * zoom, K = (100 / 360) * zoom;
  const proj = ([lon, lat]: LL): [number, number, boolean] => {
    if (!globo) { let d = lon - lon0; d = ((d + 540) % 360) - 180; return [CX + d * K, CY - (lat - lat0) * K * 1.15, true]; }
    const l = (lon - lon0) * R, f = lat * R, f0 = lat0 * R, cosc = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l);
    let x = Math.cos(f) * Math.sin(l), y = Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l);
    if (cosc < 0) { const n = Math.hypot(x, y) || 1; x /= n; y /= n; }   // detrás del globo: se pega al borde
    return [CX + x * RG, CY - y * RG, cosc >= 0];
  };
  const smooth = (pts: [number, number][]) => pts.map((q, i) => { const n = pts[(i + 1) % pts.length], m = [(q[0] + n[0]) / 2, (q[1] + n[1]) / 2]; return i ? `Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}` : `M${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }).join(" ")
    + ` Q${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} ${((pts[0][0] + pts[1][0]) / 2).toFixed(1)} ${((pts[0][1] + pts[1][1]) / 2).toFixed(1)} Z`;
  const sea = globo ? lerpHex("#1F74D8", pal.wall, 0.25) : lerpHex(pal.wallLit, pal.wall, 0.18), land = globo ? lerpHex("#4E9A4A", pal.rim, 0.15) : lerpHex(pal.rock, pal.wallLit, 0.35);
  const polys = LAND.map((poly) => poly.map(proj)).filter((pp) => globo ? pp.some((q) => q[2]) : Math.max(...pp.map((q) => q[0])) - Math.min(...pp.map((q) => q[0])) < 70 * zoom + 30);
  // ruta: densificada para que siga la curva del globo
  const ruta = opt<LL[]>(opts, "ruta", []), rt = p.route ?? 0, dense: [number, number][] = [];
  ruta.slice(1).forEach((b, i) => { const a = ruta[i]; for (let k = 0; k < 12; k++) { const q = proj([a[0] + ((b[0] - a[0]) * k) / 12, a[1] + ((b[1] - a[1]) * k) / 12]); if (q[2]) dense.push([q[0], q[1]]); } });
  if (ruta.length) { const q = proj(ruta[ruta.length - 1]); if (q[2]) dense.push([q[0], q[1]]); }
  const upto = dense.slice(0, Math.max(1, Math.round(rt * (dense.length - 1)) + 1)), head = upto[upto.length - 1], line = upto.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
  const pts = opt<LL[]>(opts, "puntos", CITIES), lp = p.light_points;
  return (
    <g>
      <Grad id={`${id}s`} a={lite(sea, pal, 0.2)} b={dark(sea, pal, 0.25)} /><Grad id={`${id}l`} a={lite(land, pal, 0.2)} b={dark(land, pal, 0.2)} />
      <defs><clipPath id={`${id}c`}>{globo ? <circle cx={CX} cy={CY} r={RG} /> : <rect x={-40} y={-20} width={180} height={220} />}</clipPath>
        <radialGradient id={`${id}v`} cx={0.36} cy={0.3} r={0.8}><stop offset="0" stopColor="#fff" stopOpacity={0.22} /><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.5} /></radialGradient></defs>
      {globo ? <Halo id={`${id}a`} cx={CX} cy={CY} r={RG * 1.28} color={lerpHex(pal.rim, "#7AC8FF", 0.6)} a={0.55} /> : null}
      {globo ? <circle cx={CX} cy={CY} r={RG} fill={url(`${id}s`)} /> : <rect x={-40} y={-20} width={180} height={220} fill={url(`${id}s`)} />}
      <g clipPath={`url(#${id}c)`}>
        {!globo ? [...Array(9)].map((_, i) => <path key={i} d={`M-40 ${CY - (i - 4) * 18 * K * 1.15} L140 ${CY - (i - 4) * 18 * K * 1.15}`} stroke={dark(sea, pal, 0.25)} strokeWidth={0.25} opacity={0.5} />) : null}
        {polys.map((pp, i) => <path key={i} d={smooth(pp.map((q) => [q[0], q[1]]))} fill={url(`${id}l`)} stroke={dark(land, pal, 0.35)} strokeWidth={0.4} strokeLinejoin="round" />)}
        {lp !== undefined ? pts.map((q, i) => { const [x, y, vis] = proj(q), k = clamp01((lp - hash(i * 3.7 + seed) * 0.8) * 6); if (!vis || k <= 0) return null; const pu = (t * 0.03 + i * 0.37) % 1;
          return <g key={i}><Halo id={`${id}p${i}`} cx={x} cy={y} r={3.2 * k} color={pal.glow} a={0.9} /><circle cx={x} cy={y} r={0.7 * k} fill="#fff" /><circle cx={x} cy={y} r={1 + pu * 3} fill="none" stroke={pal.glow} strokeWidth={0.3} opacity={(1 - pu) * 0.7 * k} /></g>; }) : null}
        {dense.length > 1 && rt > 0 ? <g>
          <path d={line} stroke={pal.glow} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.35} style={{ mixBlendMode: "screen" }} />
          <path d={line} stroke="#fff" strokeWidth={0.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Halo id={`${id}m`} cx={head[0]} cy={head[1]} r={6 + Math.sin(t * 0.2)} color={pal.glow} a={0.95} /><circle cx={head[0]} cy={head[1]} r={1.2} fill="#fff" />
        </g> : null}
        {p.veil !== undefined ? (() => { const o = proj(opt<LL>(opts, "origen", [118, -8.2])), r = (globo ? RG * 2.2 : 140) * p.veil;
          return <g><defs><radialGradient id={`${id}w`}><stop offset="0" stopColor="#E0C88A" stopOpacity={0.9} /><stop offset="0.65" stopColor="#B8A07A" stopOpacity={0.7} /><stop offset="1" stopColor={pal.bg} stopOpacity={0} /></radialGradient></defs>
            <circle cx={o[0]} cy={o[1]} r={Math.max(0.1, r)} fill={url(`${id}w`)} />
            {[...Array(14)].map((_, i) => { const a = hash(i * 2.2 + seed) * 6.283, rr = r * (0.3 + 0.6 * hash(i * 5)); return <ellipse key={i} cx={o[0] + Math.cos(a + t * 0.004) * rr} cy={o[1] + Math.sin(a + t * 0.004) * rr * 0.6} rx={6 + 6 * hash(i)} ry={2.2} fill="#F0DCA8" opacity={0.5 * p.veil} />; })}</g>; })() : null}
        {globo ? <circle cx={CX} cy={CY} r={RG} fill={url(`${id}v`)} /> : null}
      </g>
    </g>
  );
};
