// mar · fondo del kit (D123): mar abierto desde la línea del horizonte hacia abajo, con degradado de profundidad, destellos de oleaje que se mueven y el
// reflejo del sol o la luna. `opts.horizonte` (106), `opts.x` columna del reflejo (68; null = sin reflejo). `swell` (acción propia): el oleaje crece un momento.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, url } from "./shade";

export const Mar: AssetFC = ({ pal, t, seed, opts, p }) => {
  const hz = opt(opts, "horizonte", 106), rx = opt<number | null>(opts, "x", 68), id = `mr${seed}`, sw = Math.sin((p.swell ?? 0) * Math.PI);
  return (
    <g>
      <Grad id={`${id}g`} a={lerpHex(pal.wall, pal.glow, 0.35)} mid={pal.wall} b={lerpHex(pal.rock, pal.ink, 0.35)} at={0.3} />
      <rect x={-40} y={hz} width={180} height={200 - hz} fill={url(`${id}g`)} />
      {rx !== null ? [...Array(16)].map((_, i) => { const y = hz + 1.5 + i * (2 + i * 0.32), w = (3 + i * 1.1) * (0.6 + 0.4 * Math.sin(t * 0.08 + i * 1.3)); return <rect key={i} x={rx - w} y={y} width={w * 2} height={0.7 + i * 0.05} rx={0.4} fill={pal.glow} opacity={0.75 - i * 0.035} />; }) : null}
      {[...Array(46)].map((_, i) => {
        const d = hash(i * 1.9 + seed), y = hz + 2 + d * d * 80, w = (2 + 9 * d) * (0.5 + 0.5 * Math.abs(Math.sin(t * 0.05 + i))), x = ((hash(i * 3.3 + seed) * 170 + t * (0.02 + 0.05 * d)) % 170) - 35;
        return <rect key={i} x={x} y={y + Math.sin(t * 0.06 + i) * (0.4 + sw * 1.5)} width={w} height={0.5 + d * 0.5} rx={0.3} fill={pal.wallLit} opacity={0.14 + 0.2 * d} />;
      })}
    </g>
  );
};
