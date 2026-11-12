// vela · prop del kit (D123): una vela de cera con su llama que parpadea y un halo cálido. `opts.color`: clave de paleta o #hex (con `repeat`, cada copia toma
// un color distinto); `opts.alto` 0.5–1.4. `light` (acción propia): se enciende (con `repeat` y `stagger`, se encienden en cascada).
import React from "react";
import { type AssetFC, flicker, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

const WAX = ["#FFF1D6", "#FFD27A", "#7AB8FF", "#7ED99A", "#FF8A7A", "#F2F2F2"];
export const Vela: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `vl${seed}`, k = opt(opts, "alto", 0.7 + hash(seed * 1.7) * 0.6), top = 250 - 120 * k, on = p.light === undefined ? opt(opts, "encendida", true) ? 1 : 0 : Math.min(1, p.light * 3);
  const cv = opt<string | null>(opts, "color", null), c = cv ? ((pal as Record<string, string>)[cv] ?? cv) : WAX[Math.floor(hash(seed * 2.3) * WAX.length)];
  const fl = flicker(t + seed * 31), fh = (26 + 8 * fl) * on, sway = Math.sin(t * 0.21 + seed) * 3 * fl;
  return (
    <g>
      <Grad id={`${id}g`} h a={dark(c, pal, 0.25)} mid={lite(c, pal, 0.35)} b={dark(c, pal, 0.1)} at={0.6} />
      <ContactShadow id={`${id}s`} cx={50} cy={252} rx={40} ry={7} />
      {on > 0 ? <Halo id={`${id}h`} cx={50} cy={top - 22} r={150 + 20 * fl} color={pal.glow} a={0.55 * on} /> : null}
      <rect x={30} y={top} width={40} height={252 - top} rx={5} fill={url(`${id}g`)} />
      <ellipse cx={50} cy={top + 1} rx={20} ry={5} fill={lite(c, pal, 0.45)} />
      <path d={`M50 ${top} L50 ${top - 9}`} stroke={pal.ink} strokeWidth={2} strokeLinecap="round" />
      {on > 0 ? <g><Halo id={`${id}i`} cx={50} cy={top - 20} r={34} color={pal.glow} a={0.9 * on} />
        <path d={`M50 ${top - 6} Q${38} ${top - 14} ${50 + sway} ${top - 8 - fh * 1.5} Q62 ${top - 14} 50 ${top - 6} Z`} fill={lerpHex(pal.glow, "#FF9A2E", 0.45)} />
        <path d={`M50 ${top - 7} Q44 ${top - 12} ${50 + sway * 0.6} ${top - 8 - fh * 0.85} Q56 ${top - 12} 50 ${top - 7} Z`} fill="#FFF6D8" /></g> : null}
    </g>
  );
};
