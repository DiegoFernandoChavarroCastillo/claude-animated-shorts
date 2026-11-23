// teseracto · fondo apaisado (100 × 60, anclaje en el centro): el interior del teseracto de Interstellar: un túnel infinito hecho de la
// misma estantería de Murph repetida en todas direcciones, con marcos que se alejan hacia un punto de fuga y hilos de luz dorada (el
// tiempo como cuerdas) que fluyen hacia el fondo. En el centro, la abertura cálida al cuarto de Murph. opts.cuarto true.
// Acción propia: `brillo` los hilos de luz se avivan y vibran mientras dura (Cooper empuja el tiempo, manda el mensaje).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo } from "./shade";

export const Teseracto: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `te${seed}`, b = p.brillo ?? 0, live = b > 0 && b < 1 ? Math.sin(clamp01(b) * Math.PI) : 0, gold = "#FFC86A", wood = "#5A3E2A";
  const flow = (t * 0.006) % 1;
  const frames = [...Array(9)].map((_, k) => { const z = ((k + flow) / 9) ** 1.8, s = 1 - z * 0.92; return { k, s, z }; }).sort((a, b2) => a.s - b2.s);
  return (
    <g>
      <rect x={-20} y={-20} width={140} height={100} fill={lerpHex(pal.ink, "#1A1206", 0.5)} />
      <Halo id={`${id}c`} cx={50} cy={30} r={34} color={gold} a={0.25 + 0.2 * live} />
      {/* marcos de estantería que se alejan */}
      {frames.map(({ k, s, z }) => {
        const w = 120 * s, h = 76 * s, x = 50 - w / 2, y = 30 - h / 2, op = 0.25 + 0.75 * s;
        return (
          <g key={k} opacity={op}>
            <rect x={x} y={y} width={w} height={h} fill="none" stroke={lerpHex(wood, gold, 0.2 + z * 0.4)} strokeWidth={2.4 * s} />
            {[...Array(5)].map((_, r) => <line key={r} x1={x} y1={y + (h * (r + 1)) / 6} x2={x + w * 0.16} y2={y + (h * (r + 1)) / 6} stroke={wood} strokeWidth={0.9 * s} />)}
            {[...Array(5)].map((_, r) => <line key={`r${r}`} x1={x + w * 0.84} y1={y + (h * (r + 1)) / 6} x2={x + w} y2={y + (h * (r + 1)) / 6} stroke={wood} strokeWidth={0.9 * s} />)}
            {[...Array(10)].map((_, i) => <rect key={`b${i}`} x={x + (i % 5) * w * 0.03 + (i < 5 ? w * 0.005 : w * 0.845)} y={y + h * (0.06 + (Math.floor(i / 5) * 2 + 1) / 6) - h * 0.1} width={w * 0.022} height={h * 0.1} fill={lerpHex(["#A8442E", "#3E6A8A", "#D8A040", "#4E7A4A"][i % 4], pal.ink, 0.35)} />)}
          </g>
        );
      })}
      {/* hilos del tiempo */}
      <g style={{ mixBlendMode: "screen" }}>
        {[...Array(46)].map((_, i) => {
          const a = hash(seed + i * 2.9) * 6.283, r0 = 70, x0 = 50 + Math.cos(a) * r0, y0 = 30 + Math.sin(a) * r0 * 0.6, j = live * (hash(i + Math.floor(t / 2)) - 0.5) * 2;
          return <line key={i} x1={x0} y1={y0} x2={50 + Math.cos(a) * 3 + j} y2={30 + Math.sin(a) * 2} stroke={gold} strokeWidth={0.18 + hash(i) * 0.25 + live * 0.2} opacity={0.35 + 0.3 * Math.sin(t * 0.05 + i) * 0.5 + live * 0.3} />;
        })}
        {[...Array(30)].map((_, i) => { const a = hash(i * 7.1) * 6.283, u = ((t * 0.008 + hash(i)) % 1), r = 70 * (1 - u); return <circle key={`d${i}`} cx={50 + Math.cos(a) * r} cy={30 + Math.sin(a) * r * 0.6} r={0.35 * (1 - u * 0.6)} fill="#FFE8B8" opacity={0.8 * (1 - u)} />; })}
      </g>
      {opt(opts, "cuarto", true) ? <g><rect x={44} y={25.5} width={12} height={9} fill="#F2C88A" opacity={0.85} /><rect x={44} y={25.5} width={12} height={9} fill="none" stroke={wood} strokeWidth={0.6} /><rect x={45.5} y={27} width={3} height={4} fill="#FFF0C8" opacity={0.8} /><Halo id={`${id}w`} cx={50} cy={30} r={9} color="#FFE2A8" a={0.6} /></g> : null}
    </g>
  );
};
