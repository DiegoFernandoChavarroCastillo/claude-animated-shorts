// Marcador provisional de un asset aún sin dibujar (F2): rectángulo con su nombre, para probar capas, cámara y acciones.
import React from "react";
import type { AssetFC } from "./common";
import { CATALOG2D } from "../palette";

export const makePlaceholder = (id: string): AssetFC => {
  const aspect = (CATALOG2D.assets as Record<string, { aspect: number }>)[id].aspect;
  return ({ pal }) => (
    <g>
      <rect x={1} y={1} width={98} height={100 * aspect - 2} rx={4} fill={pal.rock} stroke={pal.rim} strokeWidth={1.5} opacity={0.9} />
      <text x={50} y={50 * aspect} textAnchor="middle" fill={pal.rim} fontSize={6} fontFamily="sans-serif">{id}</text>
    </g>
  );
};
