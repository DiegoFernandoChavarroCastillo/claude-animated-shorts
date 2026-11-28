// camara_vigilancia · prop: una cámara de seguridad blanca montada en un brazo contra la pared, mirando a la izquierda y abajo, con visera,
// lente oscura con reflejo y un piloto rojo que parpadea («grabando»). Lienzo 100 × 70, anclaje en el centro. Gira despacio (vigila) siempre.
// Acciones propias: `off` el piloto se apaga, la lente se vuelve negra y la cámara cae un poco, muerta (se queda): nadie te observa;
// `watch` la cámara gira hacia el espectador y el piloto se enciende fijo (se queda): te están mirando.
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const CamaraVigilancia: AssetFC = ({ pal, t, seed, p }) => {
  const id = `cv${seed}`, off = clamp01(p.off ?? 0), w = clamp01(p.watch ?? 0), body = lerpHex("#E8E8EA", pal.wallLit, 0.1);
  const pan = (1 - off) * (1 - w) * Math.sin(t * 0.03 + seed) * 8 + off * 14 - w * 10;
  const led = off > 0.5 ? 0 : w > 0.5 ? 1 : (Math.floor(t / 15) % 2 ? 1 : 0.15);
  return (
    <g>
      <Vol id={`${id}b`} c={body} pal={pal} k={1} lx={0.4} ly={0.15} /><Grad id={`${id}a`} a={lite("#7A7E86", pal, 0.2)} b={dark("#7A7E86", pal, 0.4)} />
      <rect x={82} y={18} width={12} height={30} rx={2} fill={url(`${id}a`)} /><rect x={70} y={30} width={16} height={5} rx={2} fill={url(`${id}a`)} />
      <g transform={`rotate(${pan} 72 32)`}>
        <path d="M18 20 L74 22 L74 42 L18 44 Z" fill={url(`${id}b`)} stroke={dark(body, pal, 0.35)} strokeWidth={0.6} />
        <path d="M14 16 L76 18 L76 22 L18 22 Z" fill={dark(body, pal, 0.15)} />
        <ellipse cx={18} cy={32} rx={5} ry={11} fill={dark(body, pal, 0.3)} />
        <ellipse cx={16} cy={32} rx={4} ry={8.5} fill={lerpHex("#1A2A40", "#000000", off)} />
        <ellipse cx={15} cy={29} rx={1.4} ry={2.6} fill="#9FD0FF" opacity={0.6 * (1 - off)} />
        <circle cx={66} cy={38} r={1.8} fill={led ? "#FF2A2A" : "#401010"} />
        {led > 0.5 && <Halo id={`${id}l`} cx={66} cy={38} r={7} color="#FF3030" a={0.8} />}
        {[30, 40, 50].map((x) => <line key={x} x1={x} y1={26} x2={x} y2={40} stroke={dark(body, pal, 0.12)} strokeWidth={0.4} />)}
      </g>
    </g>
  );
};
