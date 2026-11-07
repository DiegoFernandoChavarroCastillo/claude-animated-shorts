// muro_bajo · el muro de piedra con los portadores detrás, que pasan objetos (jarra, animal, árbol) por encima: de ahí salen las sombras.
// `carry` los hace cruzar de lado a lado y salir de plano; sin acción, siguen quietos con un leve balanceo.
import React from "react";
import { type AssetFC, lerp } from "./common";
import { Kind, Sil } from "./silhouettes";

const CARRY: { x: number; kind: Kind }[] = [{ x: 18, kind: "jarra" }, { x: 52, kind: "animal" }, { x: 84, kind: "arbol" }];

export const MuroBajo: AssetFC = ({ pal, p, params, t }) => {
  const u = p.carry ?? 0, left = (params.carry?.dir ?? "left") === "left";
  return (
    <g>
      {CARRY.map((c, i) => {
        const off = left ? lerp(0, -150, u) : lerp(0, 150, u), bob = Math.sin(t * 0.09 + i * 2) * 0.6;
        return (
          <g key={i} transform={`translate(${off} ${bob})`}>
            <Sil kind="persona" fill={pal.ink} x={c.x - 10} y={16.2} s={1} stroke={pal.rim} />
            <Sil kind={c.kind} fill={pal.ink} x={c.x - 7} y={5.4} s={0.7} stroke={pal.rim} />
          </g>
        );
      })}
      <rect x={0} y={30} width={100} height={12} fill={pal.rock} />
      <rect x={0} y={30} width={100} height={1.3} fill={pal.rim} opacity={0.7} />
      {[0, 1].map((r) => [...Array(8)].map((_, i) => <rect key={`${r}${i}`} x={i * 12.8 + (r ? 6 : 0) - 1} y={31.3 + r * 5.3} width={11.8} height={4.9} rx={0.8} fill="none" stroke={pal.ink} strokeWidth={0.5} opacity={0.8} />))}
    </g>
  );
};
