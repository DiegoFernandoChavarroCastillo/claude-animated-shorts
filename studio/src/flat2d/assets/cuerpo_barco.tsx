// cuerpo_barco · personaje: una persona de frente, translúcida y con luz de borde, cuyo cuerpo está hecho de tablas de madera como el casco de un
// barco: tú eres el barco. Dentro se ven las venas con glóbulos rojos que circulan y, en la cabeza, una red de neuronas. Respira siempre.
// opts: `nuevas` 0..1 (tablas nuevas al empezar), `foco` tablas | piel | sangre | neuronas (lo demás se atenúa; sin foco, todo a medias).
// Acciones propias: `swap` cambia tablas viejas por nuevas (params `from`/`to`; destellan al cambiar), `shed` se desprenden escamas de piel que
// caen mientras dura, `blood` las venas se encienden y los glóbulos viejos se apagan y nacen otros nuevos mientras dura, `neurons` la red de la
// cabeza se enciende en oro y se queda encendida (no cambia).
import React from "react";
import { type AssetFC, clamp01, hash, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Halo, dark, lite } from "./shade";

const ROWS = 34, N = ROWS * 2;
const rank = [...Array(N)].map((_, k) => k).sort((a, b) => hash(a * 5.31 + 1) - hash(b * 5.31 + 1));
const order = new Map(rank.map((k, i) => [k, i]));
const VEINS: [number, number][][] = [
  [[55, 62], [52, 48], [50, 40]], [[55, 62], [40, 52], [34, 70], [31, 92]], [[55, 62], [60, 52], [66, 70], [69, 92]],
  [[55, 62], [50, 80], [45, 100], [43, 128], [42, 150]], [[55, 62], [52, 80], [56, 100], [57, 128], [58, 150]],
];
const NEU: [number, number][] = [[44, 24], [50, 20], [56, 24], [47, 30], [54, 30], [50, 35], [42, 30], [58, 30], [46, 18], [55, 17]];
const LINKS = [[0, 1], [1, 2], [0, 3], [2, 4], [3, 5], [4, 5], [3, 4], [6, 0], [6, 3], [7, 2], [7, 4], [8, 1], [9, 1], [8, 0], [9, 2]];
const along = (pts: [number, number][], s: number): [number, number] => {
  const seg = pts.length - 1, f = s * seg, i = Math.min(seg - 1, Math.floor(f)), u = f - i;
  return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)];
};

export const CuerpoBarco: AssetFC = ({ pal, t, seed, p, params, opts }) => {
  const id = `cb${seed}`, I = idle(t, seed), foco = opt(opts, "foco", ""), by = I.breath * 0.6;
  const sw = (params.swap ?? {}) as Record<string, unknown>, n0 = opt(opts, "nuevas", 0);
  const frac = p.swap !== undefined ? lerp(Number(sw.from ?? n0), Number(sw.to ?? 1), p.swap) : n0;
  const sh = p.shed ?? 0, bl = p.blood ?? 0, ne = p.neurons ?? 0, shedding = sh > 0 && sh < 1, bleeding = bl > 0 && bl < 1;
  const dim = (k: string) => (!foco ? 0.75 : foco === k ? 1 : 0.28);
  const oldW = lerpHex(lerpHex(pal.rock, "#6A6A58", 0.35), pal.ink, 0.4), newW = lerpHex("#E0A858", pal.wallLit, 0.12), rim = lerpHex(pal.rim, pal.glow, 0.4);
  const red = "#E0303A", gold = lerpHex(pal.glow, "#FFB020", 0.6);
  const T = `translate(0 ${by})`;
  const shapes = (extra: Record<string, unknown> = {}) => [
    <circle key="h" cx={50} cy={27} r={12.5} transform={T} {...extra} />, <rect key="n" x={45} y={37} width={10} height={8} transform={T} {...extra} />,
    <path key="t" d="M33 47 Q50 41 67 47 Q70 70 63 98 L37 98 Q30 70 33 47 Z" transform={T} {...extra} />,
    <path key="al" d="M33 48 Q27 70 30 96 L35 96 Q36 72 39 54 Z" transform={T} {...extra} />, <path key="ar" d="M67 48 Q73 70 70 96 L65 96 Q64 72 61 54 Z" transform={T} {...extra} />,
    <path key="ll" d="M38 96 L49 96 L48 152 L40 152 Z" transform={T} {...extra} />, <path key="lr" d="M51 96 L62 96 L60 152 L52 152 Z" transform={T} {...extra} />,
  ];
  return (
    <g>
      <defs><clipPath id={`${id}k`}>{shapes()}</clipPath></defs>
      <ContactShadow id={`${id}s`} cx={50} cy={154} rx={18} />
      <Halo id={`${id}h`} cx={50} cy={80} r={58} color={rim} a={0.18} />
      {/* contorno de piel con luz de borde (debajo: las tablas tapan las líneas interiores) */}
      {shapes({ fill: "none", stroke: dark(pal.ink, pal, 0), strokeWidth: 4.2, opacity: 0.55 })}
      <g opacity={0.45 + 0.55 * dim("piel")}>{shapes({ fill: "none", stroke: rim, strokeWidth: 2.2 })}</g>
      {/* tablas */}
      <g clipPath={`url(#${id}k)`} opacity={foco && foco !== "tablas" ? 0.82 : 1}>
        {[...Array(N)].map((_, k) => {
          const r = Math.floor(k / 2), c = k % 2, ord = order.get(k)!, isNew = ord < frac * N, flip = frac * N - ord, y = 13 + r * 4.15, col = isNew ? newW : oldW;
          return (
            <g key={k}>
              <rect x={c ? 50 : 20} y={y} width={30} height={3.95} fill={col} />
              <rect x={c ? 50 : 20} y={y} width={30} height={0.8} fill={lite(col, pal, isNew ? 0.4 : 0.12)} opacity={0.8} />
              {!isNew ? <path d={`M${(c ? 52 : 22) + hash(k) * 20} ${y + 0.8} l1.4 1.2 l-0.6 1 l1.6 0.6`} stroke={dark(col, pal, 0.55)} strokeWidth={0.25} fill="none" /> : null}
              {flip > 0 && flip < 2 && p.swap !== undefined ? <rect x={c ? 50 : 20} y={y} width={30} height={3.95} fill={pal.glow} opacity={0.8 * (1 - flip / 2)} /> : null}
            </g>
          );
        })}
      </g>
      {/* venas y glóbulos */}
      <g opacity={(bleeding ? 1 : 0.35) * dim("sangre") + (bl >= 1 ? 0.3 : 0)}>
        {VEINS.map((v, i) => <polyline key={i} points={v.map(([x, y]) => `${x},${y + by}`).join(" ")} fill="none" stroke={lerpHex(red, pal.ink, 0.35)} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />)}
        {VEINS.flatMap((v, i) => [...Array(6)].map((_, j) => {
          const s = (t * 0.006 + j / 6 + hash(i * 3 + j) * 0.1) % 1, [x, y] = along(v, s), life = (t * 0.01 + hash(i * 7 + j * 3)) % 1;
          const aging = bleeding ? clamp01((life - 0.6) / 0.4) : 0, born = bleeding && life < 0.12 ? 1 - life / 0.12 : 0;
          return <ellipse key={`${i}-${j}`} cx={x} cy={y + by} rx={1.3 + born * 0.8} ry={0.9 + born * 0.5} fill={lerpHex(red, "#8A8A90", aging)} opacity={1 - aging * 0.6} />;
        }))}
        <circle cx={55} cy={62 + by} r={2.6 + (bleeding ? Math.abs(Math.sin(t * 0.2)) * 0.8 : 0)} fill={red} />
      </g>
      {/* neuronas: con el foco en ellas, la cabeza queda en sombra para que el oro destaque */}
      {foco === "neuronas" ? <circle cx={50} cy={27 + by} r={12.5} fill={pal.ink} opacity={0.55} /> : null}
      <g opacity={Math.min(1, lerp(0.35, 1, ne) * dim("neuronas") + ne * 0.3)}>
        {ne > 0 ? <Halo id={`${id}n`} cx={50} cy={26 + by} r={20 * ne} color={gold} a={0.55 * ne} /> : null}
        {LINKS.map(([a, b], i) => <path key={i} d={`M${NEU[a][0]} ${NEU[a][1] + by} L${NEU[b][0]} ${NEU[b][1] + by}`} stroke={ne > 0 ? gold : lite(pal.wall, pal, 0.3)} strokeWidth={0.45} opacity={0.7 * clamp01(ne * 3 - i * 0.12) + 0.3} />)}
        {NEU.map(([x, y], i) => <circle key={i} cx={x} cy={y + by} r={1 + (ne > 0 ? 0.35 * Math.sin(t * 0.15 + i) : 0)} fill={ne > 0 ? gold : lite(pal.wall, pal, 0.4)} />)}
      </g>
      {/* escamas de piel que caen */}
      {shedding || sh >= 1 ? [...Array(26)].map((_, i) => {
        const s0 = hash(i * 1.7 + seed), life = (t * 0.012 + s0) % 1, edge = i % 2 ? 33 + s0 * 3 : 64 + s0 * 3, y0 = 50 + hash(i * 2.9) * 90, x = edge + (i % 2 ? -1 : 1) * life * 6 + Math.sin(t * 0.08 + i) * 1.5, y = y0 + life * 40;
        return <path key={i} d={`M${x} ${y} l1.4 0.5 l-0.4 1 Z`} fill={lerpHex(pal.skin, pal.wallLit, 0.3)} opacity={(shedding ? 1 : 0.4) * (1 - life) * dim("piel")} />;
      }) : null}
    </g>
  );
};
