// cuarto_murph · fondo apaisado (100 × 60, anclaje en el centro): el cuarto de Murph en la granja: paredes de tablas, una ventana a la
// izquierda con luz polvorienta, la estantería de libros a la derecha (con un módulo lunar de juguete encima) y el suelo de madera.
// opts.franjas true = el polvo en el suelo forma rayas gruesas y finas (código binario); opts.epoca nina | adulta (más vacío y gris).
// Acciones propias: `caen` dos libros se salen de la estantería y caen al suelo (se quedan); `franjas` las rayas de polvo aparecen una
// a una (se quedan); `tiembla` los libros vibran mientras dura (alguien empuja desde el otro lado).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, url } from "./shade";

export const CuartoMurph: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `cm${seed}`, fr = Math.max(opt(opts, "franjas", false) ? 1 : 0, clamp01(p.franjas ?? 0)), ca = clamp01(p.caen ?? 0), tb = p.tiembla ?? 0, shaking = tb > 0 && tb < 1;
  const adulta = opt(opts, "epoca", "nina") === "adulta", wood = adulta ? "#6E5A4A" : "#8A623E", floor = 44;
  const BOOKS = ["#A8442E", "#3E6A8A", "#D8A040", "#4E7A4A", "#7A3A5A", "#C8B48A", "#2E4A6A", "#B8642E"];
  const shelf = (row: number) => [...Array(11)].map((_, i) => {
    const fallIdx = row === 1 && (i === 3 || i === 7), w = 1.5 + hash(i + row * 11) * 0.9, x = 70 + i * 2.35, h = 6 + hash(i * 3 + row) * 2;
    const jig = shaking ? (hash(Math.floor(t / 2) + i) - 0.5) * 0.6 : 0;
    if (fallIdx && ca > 0) {
      const u = clamp01(ca * 1.4 - (i === 7 ? 0.3 : 0)), fy = row * 10 + 15 + u * (floor - row * 10 - 16), rot = u * (i === 3 ? -80 : 95);
      return <rect key={i} x={x + (i === 3 ? -u * 6 : u * 4)} y={fy - h + u * 4} width={w} height={h} fill={BOOKS[(i + row) % 8]} transform={`rotate(${rot} ${x} ${fy})`} />;
    }
    return <rect key={i} x={x + jig} y={row * 10 + 15 - h} width={w} height={h} fill={lerpHex(BOOKS[(i + row) % 8], pal.ink, adulta ? 0.3 : 0.1)} />;
  });
  return (
    <g>
      <Grad id={`${id}w`} a={lerpHex(wood, "#FFE6B8", 0.15)} b={lerpHex(wood, pal.ink, 0.35)} />
      <Grad id={`${id}f`} a={lerpHex(wood, pal.ink, 0.15)} b={lerpHex(wood, pal.ink, 0.5)} />
      <rect x={-20} y={-20} width={140} height={64} fill={url(`${id}w`)} />
      {[...Array(16)].map((_, i) => <line key={i} x1={-20 + i * 9} y1={-20} x2={-20 + i * 9} y2={floor} stroke={lerpHex(wood, pal.ink, 0.45)} strokeWidth={0.3} />)}
      {/* ventana con luz de polvo */}
      <rect x={10} y={6} width={22} height={22} fill="#F2D49A" /><rect x={10} y={6} width={22} height={22} fill="none" stroke="#E8E0D0" strokeWidth={1.2} />
      <line x1={21} y1={6} x2={21} y2={28} stroke="#E8E0D0" strokeWidth={0.8} /><line x1={10} y1={17} x2={32} y2={17} stroke="#E8E0D0" strokeWidth={0.8} />
      <path d={`M10 28 L32 28 L58 ${floor + 8} L24 ${floor + 8} Z`} fill="#FFE2A8" opacity={0.16 + 0.04 * Math.sin(t * 0.05)} style={{ mixBlendMode: "screen" }} />
      {/* estantería */}
      <rect x={68} y={2} width={30} height={42} fill={lerpHex(wood, pal.ink, 0.5)} />
      {[15, 25, 35].map((y) => <rect key={y} x={68} y={y} width={30} height={1.4} fill={lerpHex(wood, "#FFE6B8", 0.1)} />)}
      {shelf(0)}{shelf(1)}{shelf(2).slice(0, 8)}
      {!adulta ? <g transform="translate(90 8)"><path d="M0 0 L3 -3 L6 0 Z" fill="#D8C070" /><rect x={0.6} y={0} width={4.8} height={2} fill="#C8B060" /><line x1={0} y1={2} x2={-1} y2={4} stroke="#888" strokeWidth={0.3} /><line x1={6} y1={2} x2={7} y2={4} stroke="#888" strokeWidth={0.3} /></g> : null}
      {/* suelo */}
      <path d={`M-20 ${floor} L120 ${floor} L120 80 L-20 80 Z`} fill={url(`${id}f`)} />
      {[...Array(10)].map((_, i) => <path key={i} d={`M50 ${floor} L${-60 + i * 24} 80`} stroke={lerpHex(wood, pal.ink, 0.6)} strokeWidth={0.25} />)}
      {/* rayas de polvo: código binario */}
      {[...Array(12)].map((_, i) => {
        const thick = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1][i], show = clamp01(fr * 12 - i);
        const x0 = 14 + i * 3.6;
        return <path key={i} d={`M${x0} ${floor + 2} L${x0 + (thick ? 2.2 : 0.8)} ${floor + 2} L${x0 * 1.3 + (thick ? 3 : 1.1) - 6} ${floor + 15} L${x0 * 1.3 - 6} ${floor + 15} Z`} fill="#E8CFA0" opacity={0.75 * show} />;
      })}
      {fr > 0 ? [...Array(24)].map((_, i) => <circle key={i} cx={14 + hash(i) * 44} cy={floor - 8 + hash(i * 3.1 + Math.floor(t / 40)) * 20} r={0.25} fill="#FFE6B8" opacity={0.6} />) : null}
    </g>
  );
};
