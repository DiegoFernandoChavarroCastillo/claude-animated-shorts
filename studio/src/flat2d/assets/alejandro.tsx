// alejandro · Alejandro Magno joven de pie: sin barba, melena rizada con el tupé alzado (anastolé), coraza y capa carmesí.
// `silence` alza la mano con la palma abajo para hacer callar (se queda); `offer` tiende la mano abierta; `chains` le aparecen grilletes y cadenas de oro en las muñecas que brillan: esclavo de su ambición (se quedan).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza } from "./romanos";

export const Alejandro: AssetFC = ({ pal, p, t }) => {
  const si = p.silence ?? 0, of = p.offer ?? 0, ch = p.chains ?? 0, breathe = Math.sin(t * 0.07) * 0.6;
  const cx = 50, top = 52, feet = 156, w = 42, hair = lerpHex(pal.rim, pal.rock, 0.45), gold = pal.rim;
  const rhx = lerp(lerp(26, 18, si), 20, of), rhy = lerp(lerp(112, 58, si), 82, of), rex = lerp(24, 16, Math.max(si, of)), rey = lerp(88, 74, Math.max(si, of));
  const lhx = 74, lhy = 112;
  const cuff = (x: number, y: number) => <g><rect x={x - 4.4} y={y - 6} width={8.8} height={4.6} rx={1} fill={gold} /><rect x={x - 4.4} y={y - 6} width={8.8} height={4.6} rx={1} fill="none" stroke={lerpHex(gold, pal.ink, 0.4)} strokeWidth={0.6} /></g>;
  const chain = (x1: number, y1: number, x2: number, y2: number, k: string) => [...Array(9)].map((_, i) => {
    const u = i / 8, x = lerp(x1, x2, u), y = lerp(y1, y2, u) + Math.sin(u * Math.PI) * 10;
    return <ellipse key={`${k}${i}`} cx={x} cy={y} rx={1.8} ry={1.1} transform={`rotate(${i % 2 ? 0 : 90} ${x} ${y})`} fill="none" stroke={gold} strokeWidth={0.9} />;
  });
  return (
    <g transform={`translate(0 ${breathe})`}>
      <ellipse cx={50} cy={157} rx={30} ry={3.4} fill={pal.ink} opacity={0.5} />
      {ch > 0 && <circle cx={50} cy={110} r={44} fill={pal.glow} opacity={0.18 * ch + 0.05 * Math.sin(t * 0.2) * ch} />}
      <path d={`M${cx - 24} ${top} Q${cx - 38} ${top + 60} ${cx - 32} ${feet - 6} L${cx + 32} ${feet - 6} Q${cx + 38} ${top + 60} ${cx + 24} ${top}Z`} fill={lerpHex(pal.accent, pal.ink, 0.38)} />
      <Coraza cx={cx} top={top} feet={feet} w={w} pal={pal} />
      <path d={`M${cx - 21} ${top + 2} Q${rex - 4} ${rey - 10} ${rex} ${rey}`} stroke={pal.accent} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${rex} ${rey} L${rhx} ${rhy}`} stroke={pal.skin} strokeWidth={6.2} strokeLinecap="round" />
      <ellipse cx={rhx} cy={rhy} rx={si > 0.5 ? 5 : 3.6} ry={si > 0.5 ? 3 : 4.4} fill={pal.skin} />
      <path d={`M${cx + 21} ${top + 2} Q${lhx + 4} ${92 - 10} ${lhx + 2} 92`} stroke={pal.accent} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${lhx + 2} 92 L${lhx} ${lhy}`} stroke={pal.skin} strokeWidth={6.2} strokeLinecap="round" /><ellipse cx={lhx} cy={lhy} rx={3.6} ry={4.4} fill={pal.skin} />
      {ch > 0 && <g opacity={clamp01(ch * 2)}>
        {cuff(rhx + (rex - rhx) * 0.25, rhy + (rey - rhy) * 0.25 + 3)}{cuff(lhx + 0.5, lhy - 4)}
        {chain(rhx + 2, rhy + 4, 40, 156, "a")}{chain(lhx, lhy, 62, 156, "b")}
        <ellipse cx={51} cy={155} rx={10} ry={2.4} fill={gold} opacity={0.7} />
      </g>}
      <path d={`M${cx + 5} ${top - 4} L${cx - 5} ${top - 4} L${cx - 4} ${top + 3} L${cx + 4} ${top + 3}Z`} fill={pal.skin} />
      {[...Array(9)].map((_, i) => { const a = Math.PI * (0.95 + i * 0.12); return <circle key={i} cx={cx + Math.cos(a) * 12} cy={top - 22 + Math.sin(a) * 11 + 2} r={4.4} fill={hair} />; })}
      {[-1, 1].map((s) => <circle key={s} cx={cx + s * 11.5} cy={top - 14} r={4.2} fill={hair} />)}
      <Cabeza cx={cx} cy={top - 20} r={11.5} pal={pal} turn={-0.15} hair={hair} />
      <path d={`M${cx - 5} ${top - 32} Q${cx} ${top - 40} ${cx + 5} ${top - 32}`} stroke={hair} strokeWidth={4.6} fill="none" strokeLinecap="round" />
    </g>
  );
};
