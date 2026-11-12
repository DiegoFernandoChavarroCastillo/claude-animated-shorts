// cabana · escenario: granja de madera de Nueva Inglaterra de frente: tablas horizontales, tejado a dos aguas, chimenea, una ventana con luz
// cálida y la puerta, sobre su terreno. `opts.nieve` true = nieve en el tejado, en el alféizar y en el suelo. `open` (acción propia): la puerta se
// abre hacia dentro y sale la luz del interior al suelo (se queda).
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const Cabana: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `cb${seed}`, nieve = opt(opts, "nieve", false), op = p.open ?? 0, wood = lerpHex(pal.accent, pal.rock, 0.55), roof = dark(pal.rock, pal, 0.25);
  const snow = lerpHex(pal.wallLit, "#ffffff", 0.6), warm = lerpHex(pal.glow, "#FFB040", 0.3);
  const dw = 12 * (1 - 0.8 * op);
  return (
    <g>
      <Grad id={`${id}w`} a={lite(wood, pal, 0.12)} b={dark(wood, pal, 0.3)} /><Grad id={`${id}g`} a={nieve ? snow : lerpHex(pal.rock, "#5A7A3A", 0.4)} b={nieve ? lerpHex(snow, pal.wall, 0.35) : dark(pal.rock, pal, 0.3)} />
      <rect x={-20} y={94} width={140} height={40} fill={url(`${id}g`)} />
      <ContactShadow id={`${id}s`} cx={50} cy={95} rx={38} ry={3} />
      <rect x={70} y={22} width={7} height={22} fill={dark(pal.rock, pal, 0.15)} />
      {[0, 1, 2].map((i) => <circle key={i} cx={73.5 + Math.sin(t * 0.04 + i) * 2 + i * 1.5} cy={18 - i * 6 - ((t * 0.08) % 6)} r={2.4 + i} fill={lerpHex(pal.wallLit, pal.bg, 0.4)} opacity={0.4 - i * 0.1} />)}
      <path d="M12 52 L50 20 L88 52 Z" fill={roof} />
      {nieve ? <path d="M12 52 L50 20 L88 52 L84 52 Q70 44 50 24 Q30 44 16 52 Z" fill={snow} /> : null}
      <rect x={16} y={50} width={68} height={45} fill={url(`${id}w`)} />
      {[...Array(10)].map((_, i) => <path key={i} d={`M16 ${54 + i * 4.2} L84 ${54 + i * 4.2}`} stroke={dark(wood, pal, 0.4)} strokeWidth={0.35} />)}
      <Halo id={`${id}l`} cx={30} cy={66} r={14} color={warm} a={0.5} />
      <rect x={23} y={59} width={14} height={13} fill={warm} stroke={dark(wood, pal, 0.55)} strokeWidth={1.2} />
      <path d="M30 59 L30 72 M23 65.5 L37 65.5" stroke={dark(wood, pal, 0.55)} strokeWidth={0.8} />
      {nieve ? <rect x={22} y={72} width={16} height={1.6} rx={0.8} fill={snow} /> : null}
      <rect x={54} y={65} width={14} height={30} fill={op > 0 ? warm : dark(wood, pal, 0.35)} />
      {op > 0 ? <g><Halo id={`${id}d`} cx={61} cy={86} r={22 * op} color={warm} a={0.6 * op} /><path d={`M54 95 L68 95 L${68 + 14 * op} 112 L${54 - 8 * op} 112 Z`} fill={warm} opacity={0.4 * op} /></g> : null}
      <rect x={54} y={65} width={dw} height={30} fill={dark(wood, pal, 0.15)} stroke={dark(wood, pal, 0.5)} strokeWidth={0.6} />
      <circle cx={54 + dw - 2} cy={81} r={0.8} fill={pal.rim} />
      {nieve ? [...Array(30)].map((_, i) => <circle key={i} cx={-15 + hash(i + seed) * 130} cy={95 + hash(i * 2.3) * 30} r={0.5 + hash(i * 4) * 1.2} fill="#ffffff" opacity={0.5} />) : null}
    </g>
  );
};
