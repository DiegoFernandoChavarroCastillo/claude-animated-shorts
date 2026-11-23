// planeta · prop (lienzo 100 × 100, anclaje en el centro): un planeta visto desde la órbita, con atmósfera que brilla en el borde y el
// lado nocturno en sombra. opts.tipo: tierra (azul y verde con nubes) | polvo (la Tierra enferma: ocre, cubierta de tormentas marrones)
// | agua (océano gris azulado sin tierra, con líneas de olas) | hielo (blanco y azul, nubes heladas) | desierto (naranja y rocoso:
// Edmunds). opts.luz -1..1 (lado iluminado: 1 = derecha). Las nubes y las bandas giran despacio.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo, url } from "./shade";

const LOOK: Record<string, { base: string; land: string; cloud: string; atm: string }> = {
  tierra: { base: "#1E5AA8", land: "#4A8A4A", cloud: "#FFFFFF", atm: "#8FC8FF" },
  polvo: { base: "#6A5A4A", land: "#A87A4A", cloud: "#C89A68", atm: "#E8B880" },
  agua: { base: "#3E6E86", land: "#5A8EA4", cloud: "#DCEEF4", atm: "#B8E0F0" },
  hielo: { base: "#B8D0E4", land: "#E8F2FA", cloud: "#FFFFFF", atm: "#DCEFFF" },
  desierto: { base: "#B8683A", land: "#8A4A2A", cloud: "#F2D2A8", atm: "#FFC890" },
};

export const Planeta: AssetFC = ({ t, seed, opts }) => {
  const id = `pl${seed}`, tipo = opt(opts, "tipo", "tierra"), L = LOOK[tipo] ?? LOOK.tierra, lx = opt(opts, "luz", 0.6), R = 36;
  const rot = t * 0.04;
  return (
    <g transform="translate(50 50)">
      <defs>
        <clipPath id={`${id}c`}><circle r={R} /></clipPath>
        <radialGradient id={`${id}s`} cx={0.5 + lx * 0.32} cy="0.4" r="0.75"><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.85} /></radialGradient>
        <radialGradient id={`${id}b`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={lerpHex(L.base, "#FFFFFF", 0.12)} /><stop offset="1" stopColor={lerpHex(L.base, "#000000", 0.3)} /></radialGradient>
        <filter id={`${id}bl`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1" /></filter>
      </defs>
      <Halo id={`${id}h`} cx={lx * 6} cy={0} r={R * 1.45} color={L.atm} a={0.35} />
      <g clipPath={`url(#${id}c)`}>
        <circle r={R} fill={url(`${id}b`)} />
        <g filter={`url(#${id}bl)`}>
          {tipo === "agua"
            ? [...Array(16)].map((_, i) => <path key={i} d={`M${-R + ((i * 7 + rot * 8) % 14)} ${-R + i * 4.6} q 8 -1.6 16 0 t 16 0 t 16 0 t 16 0 t 16 0`} stroke={L.cloud} strokeWidth={0.5} fill="none" opacity={0.35} />)
            : [...Array(9)].map((_, i) => { const x = ((hash(seed + i * 2.3) * 120 + rot * 10) % 120) - 60, y = -R + hash(i * 4.1 + seed) * 2 * R; return <ellipse key={i} cx={x} cy={y} rx={6 + hash(i) * 10} ry={3 + hash(i * 1.9) * 7} fill={L.land} opacity={tipo === "hielo" ? 0.6 : 0.9} />; })}
          {[...Array(tipo === "polvo" ? 14 : 8)].map((_, i) => { const x = ((hash(seed + i * 5.7) * 130 + rot * 16) % 130) - 65, y = -R + hash(i * 6.1) * 2 * R; return <ellipse key={`c${i}`} cx={x} cy={y} rx={8 + hash(i * 2) * 14} ry={1.4 + hash(i * 3) * 2.4} fill={L.cloud} opacity={tipo === "polvo" ? 0.6 : 0.55} transform={`rotate(${-8 + hash(i) * 16} ${x} ${y})`} />; })}
        </g>
        <circle r={R} fill={url(`${id}s`)} />
      </g>
      <circle r={R} fill="none" stroke={L.atm} strokeWidth={1.1} opacity={0.55} />
    </g>
  );
};
