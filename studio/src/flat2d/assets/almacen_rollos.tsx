// almacen_rollos · Interior de un almacén de libros junto al puerto de Alejandría: estantes de piedra hasta el techo llenos de rollos de papiro, un arco al fondo y la luz de la noche por una ventana alta.
// opts.llenos 0..1 (cuántos huecos llevan rollo, por defecto 1). `burn` el fuego entra por la puerta, trepa por los estantes, el papiro prende y los rollos se oscurecen y caen en ceniza (se queda quemado).
import React from "react";
import { type AssetFC, hash, clamp01, opt, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { Grad, Halo, url, dark } from "./shade";

export const AlmacenRollos: AssetFC = ({ pal, p, t, seed, opts }) => {
  const id = `ar${seed}`, bu = p.burn ?? 0, fill = opt(opts, "llenos", 1), stone = lerpHex(pal.wall, pal.wallLit, 0.2);
  const shelves = [0, 1, 2, 3, 4];
  return (
    <g>
      <Grad id={`${id}w`} a={dark(stone, pal, 0.55)} b={dark(stone, pal, 0.2)} />
      <rect x={-2} y={-2} width={104} height={104} fill={url(`${id}w`)} />
      <rect x={-2} y={92} width={104} height={20} fill={dark(pal.rock, pal, 0.5)} />
      {/* ventana alta con luna */}
      <rect x={42} y={4} width={16} height={14} rx={7} fill={lerpHex(pal.bg, pal.wallLit, 0.2)} /><Halo id={`${id}m`} cx={50} cy={11} r={16} color={pal.wallLit} a={0.35 * (1 - bu)} />
      {/* estantes: tres columnas */}
      {[4, 36, 68].map((x0, c) => (
        <g key={c}>
          <rect x={x0} y={20} width={28} height={74} fill={dark(pal.rock, pal, 0.3)} />
          {shelves.map((r) => {
            const y = 24 + r * 14;
            return (
              <g key={r}>
                <rect x={x0} y={y + 11} width={28} height={2.4} fill={dark(pal.rock, pal, 0.55)} />
                {[...Array(7)].map((_, j) => {
                  const k = hash(c * 100 + r * 10 + j + seed), burnK = clamp01(bu * 2.2 - (4 - r) * 0.16 - c * 0.12 - k * 0.2);
                  if (k > fill) return null;
                  const col = lerpHex(lerpHex(pal.wallLit, pal.skin, 0.4), pal.ink, burnK * 0.8);
                  return <g key={j}><rect x={x0 + 1.6 + j * 3.8} y={y + 3 + burnK * 6} width={3.2} height={8 - burnK * 6} rx={1.4} fill={col} /><ellipse cx={x0 + 3.2 + j * 3.8} cy={y + 3 + burnK * 6} rx={1.6} ry={0.7} fill={burnK > 0.5 ? pal.ink : lerpHex(col, pal.wallLit, 0.3)} /></g>;
                })}
                {bu > 0 && [...Array(4)].map((_, j) => { const f = clamp01(bu * 2.2 - (4 - r) * 0.16 - c * 0.12 - j * 0.05); const fl = 0.5 + 0.5 * Math.sin(t * 0.4 + j + r); return f > 0 ? <path key={`f${j}`} d={`M${x0 + 4 + j * 7} ${y + 11} Q${x0 + 3 + j * 7} ${y + 4 - 4 * fl} ${x0 + 5 + j * 7} ${y - 2 - 3 * fl} Q${x0 + 7 + j * 7} ${y + 4} ${x0 + 6 + j * 7} ${y + 11}Z`} fill={j % 2 ? "#FF9A2E" : "#E2491B"} opacity={0.9 * f * (1 - 0.45 * clamp01((bu - 0.85) / 0.15))} style={{ mixBlendMode: "screen" }} /> : null; })}
              </g>
            );
          })}
        </g>
      ))}
      {bu > 0 && <Halo id={`${id}g`} cx={50} cy={60} r={70} color={pal.rim} a={0.55 * Math.min(1, bu * 1.5)} />}
      {/* ceniza que cae y chispas */}
      {bu > 0 && [...Array(26)].map((_, i) => <circle key={i} cx={(hash(i + 7) * 100 + Math.sin(t * 0.05 + i) * 3)} cy={((hash(i + 21) * 100 + t * (0.4 + 0.3 * hash(i))) % 110) - 5} r={0.35 + hash(i + 2) * 0.5} fill={i % 3 ? pal.ink : pal.glow} opacity={0.75 * Math.min(1, bu * 2)} />)}
      <Grain n={90} w={100} h={100} seed={seed * 3 + 1} a={stone} b={pal.ink} rMax={0.6} />
    </g>
  );
};
