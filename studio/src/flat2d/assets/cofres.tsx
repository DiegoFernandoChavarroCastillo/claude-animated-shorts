// cofres · dos cofres de madera con herrajes; dentro, cartas de los conspiradores (rollos y tablillas con sello de cera).
// `open` abre la tapa del cofre delantero con un resplandor dorado; `spill` hace que las cartas salgan volando y queden suspendidas en abanico, con sus líneas escritas y sellos (se quedan).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Cofres: AssetFC = ({ pal, p, t, seed }) => {
  const id = `co${seed}`, op = p.open ?? 0, sp = p.spill ?? 0;
  const wood = lerpHex(pal.rock, pal.rim, 0.18), woodD = lerpHex(pal.rock, pal.ink, 0.4), iron = lerpHex(pal.rock, pal.ink, 0.65), paper = lerpHex(pal.wallLit, pal.rim, 0.15);
  const chest = (x: number, y: number, w: number, h: number, lid: number, key: string) => (
    <g key={key}>
      <rect x={x} y={y} width={w} height={h} rx={1.2} fill={wood} />
      <g transform={`translate(${x} ${y})`}><Grain n={30} w={w} h={h} seed={seed * 5 + w} a={woodD} b={pal.rim} rMax={0.5} /></g>
      {[0.12, 0.88].map((k) => <rect key={k} x={x + w * k - 1.5} y={y} width={3} height={h} fill={iron} />)}
      <rect x={x} y={y + h * 0.45} width={w} height={2.4} fill={iron} />
      <rect x={x + w / 2 - 3} y={y + 2} width={6} height={7} rx={0.8} fill={pal.rim} /><circle cx={x + w / 2} cy={y + 5} r={1} fill={pal.ink} />
      <g transform={`rotate(${-lid * 105} ${x} ${y})`}>
        <path d={`M${x} ${y} L${x + w} ${y} L${x + w} ${y - 7} Q${x + w / 2} ${y - 13} ${x} ${y - 7}Z`} fill={lerpHex(wood, pal.wallLit, 0.1)} />
        {[0.12, 0.88].map((k) => <path key={k} d={`M${x + w * k} ${y} L${x + w * k} ${y - 7 - 4 * Math.sin(Math.PI * k)}`} stroke={iron} strokeWidth={3} />)}
        <path d={`M${x + w} ${y} L${x + w} ${y - 7}`} stroke={pal.rim} strokeWidth={0.7} />
      </g>
    </g>
  );
  const letter = (k: number, x: number, y: number, rot: number, sc: number) => (
    <g key={k} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      <rect x={-7} y={-5} width={14} height={10} rx={0.6} fill={paper} />
      {[0, 1, 2, 3].map((l) => <path key={l} d={`M-5 ${-3 + l * 2} L${4 - (l % 2) * 3} ${-3 + l * 2}`} stroke={lerpHex(pal.rock, pal.ink, 0.4)} strokeWidth={0.45} />)}
      <circle cx={4.4} cy={3} r={1.6} fill={pal.accent} /><path d="M3.6 3 L5.2 3" stroke={lerpHex(pal.accent, pal.ink, 0.4)} strokeWidth={0.4} />
    </g>
  );
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.85} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={50} cy={79} rx={44} ry={3} fill={pal.ink} opacity={0.55} />
      {chest(56, 40, 34, 22, 0, "b")}
      <ellipse cx={42} cy={50} rx={34 * op} ry={26 * op} fill={`url(#${id}g)`} />
      {op > 0 && [...Array(4)].map((_, k) => letter(10 + k, 30 + k * 6, 50 - op * 3, (hash(k) - 0.5) * 30, 0.9))}
      {chest(18, 52, 48, 27, op, "a")}
      {[...Array(8)].map((_, k) => {
        const u = clamp01(sp * 1.6 - k * 0.08); if (u <= 0) return null;
        const tx = 14 + (k % 4) * 22 + (hash(k + 4) - 0.5) * 6, ty = 10 + Math.floor(k / 4) * 18 + (hash(k + 1) - 0.5) * 6;
        const fl = Math.sin(t * 0.08 + k) * 1.2 * u;
        return letter(k, lerp(42, tx, u), lerp(52, ty, u) + fl, (hash(k + 7) - 0.5) * 50 * (1 - u * 0.5), lerp(0.6, 1.25, u));
      })}
    </g>
  );
};
