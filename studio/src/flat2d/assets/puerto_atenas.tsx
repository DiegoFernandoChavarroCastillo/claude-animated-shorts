// puerto_atenas · fondo: el puerto de Atenas de día. Al fondo, la colina de la Acrópolis con su templo de columnas y la ciudad blanca de tejados
// rojos posada en el horizonte (y = 100, donde empieza el mar del kit); delante, a un lado, el muelle de piedra con bolardos, ánforas y un rollo de
// cuerda (su suelo, de y = 100 a 111, es donde pisan los personajes), gaviotas y su propio mar azul con el reflejo del sol. opts: `muelle`
// izq | der | false (izq), `ancho` del muelle (34), `ciudad` (true; false = solo mar abierto), `x` columna del reflejo (70). Va sobre `cielo`;
// el barco flota con la línea de flotación en y ≈ 0,6.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const PuertoAtenas: AssetFC = ({ pal, t, seed, opts }) => {
  const id = `pa${seed}`, side = opt<string | boolean>(opts, "muelle", "izq"), W = opt(opts, "ancho", 34), ciudad = opt(opts, "ciudad", true), rx = opt(opts, "x", 70);
  const sea = lerpHex("#2F6E9E", pal.bg, 0.22);
  const hill = lerpHex(lerpHex(pal.rock, "#9AA878", 0.3), pal.wallLit, 0.25), stone = lerpHex(pal.wall, pal.rock, 0.35), marble = lite(pal.wallLit, pal, 0.3);
  const qx0 = side === "der" ? 100 - W : -30, qx1 = side === "der" ? 130 : W;
  return (
    <g>
      <Grad id={`${id}h`} a={lite(hill, pal, 0.25)} b={dark(hill, pal, 0.15)} /><Grad id={`${id}q`} a={lite(stone, pal, 0.25)} b={dark(stone, pal, 0.25)} />
      <Grad id={`${id}f`} a={dark(stone, pal, 0.1)} b={dark(stone, pal, 0.5)} />
      {/* el mar: azul propio (la pared de la paleta de mármol es piedra), destellos y el reflejo del sol */}
      <Grad id={`${id}m`} a={lerpHex(sea, pal.glow, 0.4)} mid={sea} b={dark(sea, pal, 0.3)} at={0.25} />
      <rect x={-40} y={100} width={180} height={100} fill={url(`${id}m`)} />
      {[...Array(14)].map((_, i) => { const y = 101.5 + i * (2 + i * 0.35), w = (3 + i * 1.2) * (0.6 + 0.4 * Math.sin(t * 0.08 + i * 1.3)); return <rect key={i} x={rx - w} y={y} width={w * 2} height={0.7 + i * 0.05} rx={0.4} fill={pal.glow} opacity={0.7 - i * 0.04} />; })}
      {[...Array(40)].map((_, i) => { const d = hash(i * 1.9 + seed), y = 102 + d * d * 76, w = 2 + 8 * d, x = ((hash(i * 3.3 + seed) * 170 + t * (0.02 + 0.05 * d)) % 170) - 35; return <rect key={i} x={x} y={y + Math.sin(t * 0.06 + i) * 0.4} width={w} height={0.5 + d * 0.5} rx={0.3} fill={pal.wallLit} opacity={0.15 + 0.2 * d} />; })}
      {ciudad ? <g>
      {/* colinas lejanas y la Acrópolis */}
      <path d="M-30 100 Q0 86 22 92 Q40 84 60 90 Q90 80 130 94 L130 101 L-30 101 Z" fill={lerpHex(hill, pal.bg, 0.55)} />
      <path d="M38 100 Q42 78 54 76 L76 75 Q86 78 90 100 Z" fill={url(`${id}h`)} />
      <path d="M50 77 L80 76" stroke={lite(hill, pal, 0.4)} strokeWidth={0.6} />
      <Halo id={`${id}t`} cx={64} cy={70} r={14} color={pal.glow} a={0.35} />
      <rect x={53} y={74} width={22} height={1.4} fill={marble} />
      {[...Array(8)].map((_, i) => <rect key={i} x={54 + i * 2.75} y={67.6} width={1.15} height={6.4} fill={i % 2 ? marble : lite(marble, pal, 0.2)} />)}
      <rect x={53} y={66.4} width={22} height={1.4} fill={marble} />
      <path d="M53 66.4 L64 62.6 L75 66.4 Z" fill={lite(marble, pal, 0.1)} stroke={dark(marble, pal, 0.25)} strokeWidth={0.2} />
      {/* la ciudad blanca al pie */}
      {[...Array(22)].map((_, i) => {
        const x = 18 + hash(i * 2.7 + seed) * 86, w = 3 + hash(i * 1.3) * 3.5, h = 2.5 + hash(i * 4.1) * 3, y = 100 - h - (Math.abs(x - 64) < 22 ? 2 : 0) * hash(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h + 1} fill={lerpHex(marble, pal.wall, hash(i * 9) * 0.3)} />
            <rect x={x + w * 0.62} y={y} width={w * 0.38} height={h + 1} fill={dark(marble, pal, 0.12)} />
            <path d={`M${x - 0.4} ${y} L${x + w / 2} ${y - 1.4} L${x + w + 0.4} ${y} Z`} fill={lerpHex("#C0603A", pal.rock, 0.3)} />
            {hash(i * 5.5) > 0.5 ? <rect x={x + w * 0.3} y={y + h * 0.4} width={0.8} height={1.1} fill={dark(pal.wall, pal, 0.5)} /> : null}
          </g>
        );
      })}
      </g> : null}
      {/* gaviotas */}
      {[...Array(5)].map((_, i) => {
        const x = ((hash(i + seed) * 140 + t * (0.08 + 0.04 * hash(i * 3))) % 140) - 20, y = 30 + hash(i * 7) * 30 + Math.sin(t * 0.05 + i) * 2, f = Math.sin(t * 0.3 + i * 2) * 1.2;
        return <path key={i} d={`M${x - 2} ${y - f} Q${x - 1} ${y - 1} ${x} ${y} Q${x + 1} ${y - 1} ${x + 2} ${y - f}`} stroke={pal.ink} strokeWidth={0.35} fill="none" opacity={0.6} />;
      })}
      {/* el muelle de piedra */}
      {side ? <g>
        <path d={`M${qx0} 100 L${qx1} 100 L${qx1 + (side === "der" ? 0 : 4)} 111 L${qx0} 111 Z`} fill={url(`${id}q`)} />
        <rect x={qx0} y={111} width={qx1 - qx0 + 4} height={70} fill={url(`${id}f`)} />
        {[...Array(44)].map((_, i) => { const r = Math.floor(i / 4), c = i % 4, bw = (qx1 - qx0 + 4) / 4; return <rect key={i} x={qx0 + c * bw - (r % 2) * bw * 0.5} y={112 + r * 6} width={bw - 0.5} height={5.5} fill="none" stroke={dark(stone, pal, 0.55)} strokeWidth={0.3} opacity={0.6} />; })}
        <path d={`M${qx0} 111 L${qx1 + (side === "der" ? 0 : 4)} 111`} stroke={lite(stone, pal, 0.5)} strokeWidth={0.6} />
        {/* bolardo, ánforas y cuerda, cerca del borde del agua */}
        {(() => { const bx = side === "der" ? qx0 + 4 : qx1 - 5; return (
          <g>
            <ContactShadow id={`${id}b`} cx={bx} cy={107.4} rx={3} />
            <rect x={bx - 1.6} y={102.5} width={3.2} height={5} rx={1} fill={dark(stone, pal, 0.35)} /><ellipse cx={bx} cy={102.6} rx={2.2} ry={0.8} fill={dark(stone, pal, 0.2)} />
            <path d={`M${bx} 104 Q${bx + (side === "der" ? -8 : 8)} 110 ${bx + (side === "der" ? -14 : 14)} 106`} stroke={lerpHex("#C8A060", pal.rock, 0.4)} strokeWidth={0.5} fill="none" />
          </g>
        ); })()}
        {[0, 1, 2].map((i) => { const ax = side === "der" ? 100 - W + 8 + i * 3.6 : W * 0.25 + i * 3.6, ay = 106 + (i % 2) * 1.5; return (
          <g key={i}>
            <ContactShadow id={`${id}a${i}`} cx={ax} cy={ay + 0.4} rx={2} />
            <path d={`M${ax - 0.6} ${ay - 7} L${ax + 0.6} ${ay - 7} Q${ax + 2.4} ${ay - 4.5} ${ax + 1.6} ${ay - 1.2} Q${ax} ${ay + 0.5} ${ax - 1.6} ${ay - 1.2} Q${ax - 2.4} ${ay - 4.5} ${ax - 0.6} ${ay - 7} Z`} fill={lerpHex("#B8643A", pal.rock, 0.25)} />
            <path d={`M${ax - 1.8} ${ay - 4.6} L${ax + 1.8} ${ay - 4.6}`} stroke={pal.ink} strokeWidth={0.3} opacity={0.6} />
          </g>
        ); })}
        <ellipse cx={side === "der" ? 110 : W * 0.55} cy={106.5} rx={2.6} ry={1.1} fill="none" stroke={lerpHex("#C8A060", pal.rock, 0.4)} strokeWidth={0.6} />
      </g> : null}
    </g>
  );
};
