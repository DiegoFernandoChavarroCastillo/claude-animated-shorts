// naves_mar · Las siete naves de los Pueblos del Mar (proa y popa en cabeza de pájaro, vela cuadrada, guerreros con tocado de plumas) sobre el oleaje: los invasores, siete barcos, desde el mar.
// `approach` las naves se acercan, crecen y bajan (se quedan); `count` cada vela se ilumina con su número, de una a siete (se queda).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { seg, NaveMar } from "./bronce";

export const NavesMar: AssetFC = ({ pal, p, t }) => {
  const ap = p.approach ?? 0, ct = p.count ?? 0, sea = lerpHex(pal.wall, pal.ink, 0.35);
  const pos = [[18, 30, 0.42], [50, 28, 0.4], [82, 31, 0.42], [8, 46, 0.55], [36, 45, 0.56], [64, 46, 0.55], [92, 47, 0.55]];
  return (
    <g>
      <rect x={-2} y={20} width={104} height={42} fill={sea} opacity={0.6} />
      {pos.map(([x, y, s], i) => { const k = seg(ct, i / 7, (i + 1) / 7); return <g key={i}>
        <NaveMar x={50 + (x - 50) * (1 + ap * 0.1)} y={y + ap * 4} s={s * (1 + ap * 0.25)} pal={pal} t={t} seed={i} glow={k > 0 ? 1 - k * 0.5 : 0} />
        {k > 0 && <text x={50 + (x - 50) * (1 + ap * 0.1)} y={y + ap * 4 - 38 * s * (1 + ap * 0.25)} textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize={6} fill={pal.glow} opacity={clamp01(k * 3)}>{i + 1}</text>}
      </g>; })}
      {[...Array(14)].map((_, i) => <path key={i} d={`M${(hash(i) * 110 + t * 0.12) % 110 - 6} ${50 + (i % 5) * 2.4} q2 -1 4 0 q2 1 4 0`} stroke={lerpHex(sea, pal.wallLit, 0.35)} strokeWidth={0.5} fill="none" />)}
      <path d="M-2 52 Q25 49 50 52 Q75 55 102 52 L102 62 L-2 62Z" fill={sea} />
    </g>
  );
};
