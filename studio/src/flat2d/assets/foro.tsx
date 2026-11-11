// foro · El Foro romano al anochecer: templos con frontón y columnas, la colina del Capitolio al fondo, la tribuna y el empedrado: Roma, la república.
// `banners` se despliegan dos estandartes rojos con SPQR (se quedan); `crown_fall` una corona de oro rueda por las escaleras de la tribuna y se parte: Roma echó a sus reyes (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Foro: AssetFC = ({ pal, p, t, seed }) => {
  const bn = p.banners ?? 0, cf = p.crown_fall ?? 0, id = `fo${seed}`, marble = lerpHex(pal.wallLit, pal.wall, 0.45), dark = lerpHex(marble, pal.ink, 0.35);
  const temple = (x: number, w: number, top: number, base: number, n: number) => (
    <g key={x}>
      <path d={`M${x - w / 2 - 2} ${top} L${x} ${top - w * 0.22} L${x + w / 2 + 2} ${top}Z`} fill={marble} /><path d={`M${x - w / 2 + 3} ${top - 1} L${x} ${top - w * 0.17} L${x + w / 2 - 3} ${top - 1}Z`} fill={dark} />
      <rect x={x - w / 2 - 1} y={top} width={w + 2} height={3} fill={lerpHex(marble, pal.wallLit, 0.2)} />
      <rect x={x - w / 2} y={top + 3} width={w} height={base - top - 3} fill={lerpHex(pal.ink, pal.wall, 0.4)} />
      {[...Array(n)].map((_, i) => <rect key={i} x={x - w / 2 + (i * (w - 3)) / (n - 1)} y={top + 3} width={3} height={base - top - 3} fill={marble} />)}
      {[...Array(n)].map((_, i) => <path key={`r${i}`} d={`M${x - w / 2 + (i * (w - 3)) / (n - 1) + 3} ${top + 3} l0 ${base - top - 3}`} stroke={pal.rim} strokeWidth={0.4} opacity={0.5} />)}
      {[0, 1, 2].map((k) => <rect key={`s${k}`} x={x - w / 2 - 2 - k * 1.5} y={base + k * 2} width={w + 4 + k * 3} height={2} fill={lerpHex(marble, pal.ink, 0.15 + k * 0.1)} />)}
    </g>
  );
  const banner = (x: number, k: number) => {
    const u = clamp01(bn * 1.3 - k * 0.3), wave = Math.sin(t * 0.12 + k) * 1.2;
    return <g key={`b${k}`}>
      <path d={`M${x} 52 L${x} 100`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={0.8} />
      <circle cx={x} cy={51} r={1.3} fill={pal.rim} /><path d={`M${x - 5} 54 L${x + 5} 54`} stroke={pal.rim} strokeWidth={0.8} />
      <path d={`M${x - 5} 54 L${x + 5} 54 L${x + 5 + wave * 0.4} ${54 + 20 * u} L${x} ${57 + 20 * u} L${x - 5 + wave * 0.4} ${54 + 20 * u}Z`} fill={pal.accent} />
      {u > 0.6 && <text x={x + wave * 0.2} y={66} fontSize={3} fontWeight={800} fill={pal.rim} textAnchor="middle" opacity={clamp01((u - 0.6) * 3)} fontFamily="serif">SPQR</text>}
    </g>;
  };
  const cx = lerp(48, 62, cf), cy = cf < 0.75 ? lerp(82, 104, cf / 0.75) - Math.abs(Math.sin(cf * 16)) * 4 * (1 - cf) : 104, crack = clamp01((cf - 0.75) * 4);
  return (
    <g>
      <defs><linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="1" stopColor={lerpHex(pal.wall, pal.rim, 0.35)} /></linearGradient></defs>
      <rect x={-2} y={-2} width={104} height={104} fill={`url(#${id}s)`} />
      <path d="M-2 66 Q20 46 46 52 Q70 44 102 60 L102 80 L-2 80Z" fill={lerpHex(pal.wall, pal.ink, 0.45)} />
      {temple(70, 22, 46, 64, 4)}
      {temple(20, 30, 58, 86, 6)}
      {temple(84, 26, 64, 90, 5)}
      {/* tribuna */}
      <path d="M36 86 L60 86 L60 92 L36 92Z" fill={marble} /><path d="M36 86 L60 86" stroke={pal.rim} strokeWidth={0.5} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={34 - k * 2} y={92 + k * 2.4} width={28 + k * 4} height={2.4} fill={lerpHex(marble, pal.ink, 0.1 + k * 0.08)} />)}
      {banner(30, 0)}{banner(66, 1)}
      {cf > 0 && <g transform={`translate(${cx} ${cy}) rotate(${cf * 400 * (1 - crack)}) scale(2.4)`}>
        <path d={`M-3.4 0 L-3.4 -2.6 L-1.8 -1.4 L0 -3.4 L1.8 -1.4 L3.4 -2.6 L3.4 0Z`} fill={pal.rim} transform={`translate(${-crack * 1.6} 0) rotate(${-crack * 20})`} />
        {crack > 0 && <path d="M0 -3.4 L0.6 -1.6 L-0.4 0" stroke={pal.ink} strokeWidth={0.4} fill="none" />}
      </g>}
      <path d="M-2 102 L102 102 L102 180 L-2 180Z" fill={lerpHex(pal.rock, pal.ink, 0.45)} />
      {[...Array(8)].map((_, r) => <path key={`p${r}`} d={`M-2 ${106 + r * 9} L102 ${106 + r * 9}`} stroke={pal.ink} strokeWidth={0.4} opacity={0.6} />)}
      {[...Array(40)].map((_, i) => <path key={`q${i}`} d={`M${(i % 10) * 11 + (Math.floor(i / 10) % 2) * 5} ${102 + Math.floor(i / 10) * 9} l0 ${9}`} stroke={pal.ink} strokeWidth={0.35} opacity={0.5} />)}
      <g transform="translate(0 102)"><Grain n={110} w={100} h={78} seed={seed * 3 + 5} a={pal.rock} b={pal.ink} rMax={0.7} /></g>
      <Grain n={70} w={100} h={100} seed={seed * 7 + 9} a={lerpHex(pal.wall, pal.wallLit, 0.3)} b={pal.ink} rMax={0.5} />
    </g>
  );
};
