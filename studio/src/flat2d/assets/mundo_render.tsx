// mundo_render · un paisaje (montañas, casa, árbol, luna) que solo está "dibujado" dentro de un círculo de atención; fuera es una malla de alambre. `scan` (dir: left|right) mueve el foco de la casa al árbol, `blank` lo apaga (todo queda en alambre) y `reveal` lo vuelve a abrir tras `blank` (con `init: {blank: 1}` el mundo empieza apagado).
import React from "react";
import { type AssetFC, lerp } from "./common";
import { Grain } from "./grain";
import type { Pal } from "../palette";

const MT = "M-2 112 L18 78 L34 100 L52 70 L74 104 L90 84 L102 108 L102 240 L-2 240Z", GR = "M-2 130 Q30 112 60 128 T102 122 L102 240 L-2 240Z";
const Scene: React.FC<{ pal: Pal; wire: boolean; id: string; seed: number }> = ({ pal, wire, id, seed }) => {
  const f = (c: string) => (wire ? "none" : c), s = wire ? pal.glow : "none", sw = wire ? 0.45 : 0, op = wire ? 0.6 : 1;
  return (
    <g stroke={s} strokeWidth={sw} opacity={op} strokeLinejoin="round">
      {!wire && <rect x={-2} y={-60} width={104} height={300} fill={`url(#${id}s)`} />}
      <circle cx={72} cy={34} r={9} fill={f(pal.rim)} />
      <ellipse cx={26} cy={52} rx={13} ry={3.4} fill={f(pal.wallLit)} opacity={wire ? 1 : 0.5} /><ellipse cx={34} cy={49} rx={9} ry={3} fill={f(pal.wallLit)} opacity={wire ? 1 : 0.5} />
      <path d={MT} fill={f(pal.rock)} /><path d={GR} fill={f(pal.wall)} />
      <rect x={20} y={116} width={26} height={22} fill={f(pal.wallLit)} /><path d="M16 116 L33 99 L50 116Z" fill={f(pal.accent)} />
      <rect x={30} y={127} width={6} height={11} fill={f(pal.ink)} /><rect x={22.5} y={121} width={5} height={6} fill={f(pal.glow)} /><rect x={38.5} y={121} width={5} height={6} fill={f(pal.glow)} />
      <rect x={73.8} y={119} width={3.6} height={20} fill={f(pal.rock)} />
      <circle cx={75.6} cy={113} r={9.5} fill={f(pal.rock)} /><circle cx={68.5} cy={119} r={6.5} fill={f(pal.rock)} /><circle cx={83} cy={119} r={6.5} fill={f(pal.rock)} />
      {!wire && <><Grain n={120} w={100} h={60} seed={seed + 5} a={pal.wallLit} b={pal.rock} rMax={0.7} /><g transform="translate(0 120)"><Grain n={160} w={100} h={58} seed={seed + 9} a={pal.rock} b={pal.wallLit} rMax={0.8} /></g></>}
      {wire && <>{[...Array(12)].map((_, i) => <line key={`h${i}`} x1={-2} x2={102} y1={134 + i * i * 0.75 + i * 2} y2={134 + i * i * 0.75 + i * 2} />)}{[...Array(12)].map((_, i) => <line key={`v${i}`} x1={50} y1={126} x2={-40 + i * 15} y2={240} />)}{[...Array(9)].map((_, i) => <line key={`s${i}`} x1={i * 12.5} x2={i * 12.5} y1={-60} y2={90} opacity={0.25} />)}</>}
    </g>
  );
};

export const MundoRender: AssetFC = ({ pal, p, t, seed, flick, params }) => {
  const id = `mr${seed}`, R = 36, dir = String((params.scan as { dir?: string } | undefined)?.dir ?? "right"), sc = p.scan ?? 0;
  const x = dir === "left" ? lerp(72, 30, sc) : lerp(30, 72, sc), y = 122;
  const r = R * (1 - (p.blank ?? 0) * (1 - (p.reveal ?? 0)));
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="0.5" stopColor={pal.wall} /><stop offset="1" stopColor={pal.wallLit} stopOpacity={0.6} /></linearGradient>
        <clipPath id={`${id}c`}><circle cx={x} cy={y} r={Math.max(0.01, r)} /></clipPath>
      </defs>
      <rect x={-2} y={-60} width={104} height={300} fill={pal.ink} />
      <g transform="translate(0 -24)"><Scene pal={pal} wire id={id} seed={seed} />
      <g clipPath={`url(#${id}c)`}><Scene pal={pal} wire={false} id={id} seed={seed} /></g>
      {r > 0.5 && <><circle cx={x} cy={y} r={r} fill="none" stroke={pal.glow} strokeWidth={0.9} strokeDasharray="2.2 1.6" strokeDashoffset={-t * 0.25} opacity={0.8 + 0.2 * flick} /><circle cx={x} cy={y} r={r + 1.8} fill="none" stroke={pal.glow} strokeWidth={0.3} opacity={0.4} /></>}</g>
    </g>
  );
};
