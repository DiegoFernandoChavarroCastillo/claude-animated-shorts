// franja_oscura · ambiente: un degradado oscuro (tinta de la paleta) detrás de la franja de subtítulos (0,62–0,78 del alto) para que el texto
// blanco y amarillo se lea en fondos claros (mármol, cielo, prado). Lienzo 100 × 178; par 0 en el catálogo (fija a la pantalla, no sigue
// a la cámara) y en el story `scale: 1`. opts.a opacidad máxima (0.6); opts.y centro (0.7).
import React from "react";
import { type AssetFC, opt } from "./common";

export const FranjaOscura: AssetFC = ({ pal, seed, opts }) => {
  const id = `fo${seed}`, a = Number(opt(opts, "a", 0.6)), y = Number(opt(opts, "y", 0.7)) * 178;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.ink} stopOpacity={0} /><stop offset="0.3" stopColor={pal.ink} stopOpacity={a} />
        <stop offset="0.7" stopColor={pal.ink} stopOpacity={a} /><stop offset="1" stopColor={pal.ink} stopOpacity={0} /></linearGradient></defs>
      <rect x={-60} y={y - 26} width={220} height={52} fill={`url(#${id})`} />
    </g>
  );
};
