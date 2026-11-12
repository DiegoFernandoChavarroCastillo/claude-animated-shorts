// Grano: motas diminutas repartidas con semilla fija sobre un asset. Da textura a las zonas lisas (si no, un zoom lento sobre colores planos no se
// distingue de una imagen parada para el QA de movimiento) y se lee como roca, hierba o polvo según los colores.
import React from "react";
import { hash, useThemed } from "./common";

// Con tema visual (D123) el grano de motas no se pinta: lo sustituye el ruido de película de toda la composición (Flat2D), que no ensucia.
export const Grain: React.FC<{ n: number; w: number; h: number; seed: number; a: string; b: string; rMax?: number }> = ({ n, w, h, seed, a, b, rMax = 0.9 }) => useThemed() ? null : (
  <g>{[...Array(n)].map((_, i) => <circle key={i} cx={hash(i + seed) * w} cy={hash(i * 1.7 + seed + 50) * h} r={0.25 + hash(i + seed + 90) * rMax} fill={i % 3 ? a : b} opacity={0.12 + 0.2 * hash(i + seed + 130)} />)}</g>
);
