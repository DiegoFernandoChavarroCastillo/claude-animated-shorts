// tablilla · Primer plano de una tablilla de arcilla con filas de cuña y la mano con el punzón de caña: la carta, escribir en arcilla, la escritura.
// `write` las cuñas aparecen fila a fila con la mano escribiendo (se queda); `seal` un sello cilíndrico rueda y deja su huella (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Tablilla: AssetFC = ({ pal, p, t, seed }) => {
  const wr = p.write ?? 0, sl = p.seal ?? 0, clay = lerpHex(pal.rock, pal.rim, 0.4), dark = lerpHex(clay, pal.ink, 0.5), hi = lerpHex(clay, pal.wallLit, 0.35);
  const rows = 7, rowK = (r: number) => clamp01(wr * rows - r);
  const head = Math.min(rows - 1, Math.floor(wr * rows)), hx = 18 + 62 * clamp01(wr * rows - head), hy = 18 + head * 7.6;
  const cx = lerp(14, 86, sl);
  return (
    <g>
      <rect x={10} y={6} width={80} height={70} rx={9} fill={clay} />
      <path d="M12 12 Q50 4 88 12" stroke={hi} strokeWidth={1.2} fill="none" opacity={0.7} />
      <Grain n={70} w={78} h={66} seed={11} a={hi} b={dark} rMax={0.5} />
      {[...Array(rows)].map((_, r) => { const k = rowK(r), n = Math.round(14 * k); return <g key={r}>
        <path d={`M16 ${21 + r * 7.6} L84 ${21 + r * 7.6}`} stroke={dark} strokeWidth={0.35} opacity={0.6} />
        {[...Array(n)].map((_, i) => { const x = 18 + i * 4.6 + hash(r * 20 + i) * 1.2, y = 15 + r * 7.6, v = hash(r * 31 + i) > 0.55;
          return <g key={i}><path d={`M${x} ${y} l2.2 0 l-1.1 1.6Z`} fill={dark} /><path d={`M${x + 1.1} ${y + 1.6} l0 ${v ? 3.4 : 2}`} stroke={dark} strokeWidth={0.55} />{v && <path d={`M${x + 2.6} ${y + 2.2} l1.6 -0.8 l0 1.6Z`} fill={dark} />}</g>; })}
      </g>; })}
      {/* huella del sello cilíndrico */}
      {sl > 0 && <g><clipPath id={`tb${seed}c`}><rect x={14} y={66} width={72 * sl} height={8} /></clipPath>
        <g clipPath={`url(#tb${seed}c)`}><rect x={14} y={66} width={72} height={8} fill={dark} opacity={0.35} />
          {[...Array(9)].map((_, i) => <g key={i}><circle cx={18 + i * 8} cy={68.6} r={1} fill={dark} /><path d={`M${18 + i * 8} 69.6 l0 3 M${16.6 + i * 8} 71 l2.8 0`} stroke={dark} strokeWidth={0.6} /><path d={`M${21.6 + i * 8} 67 l1.6 6`} stroke={dark} strokeWidth={0.5} /></g>)}</g>
        {sl < 1 && <g transform={`translate(${cx} 70)`}><rect x={-3} y={-6} width={6} height={12} rx={1} fill={lerpHex(pal.wallLit, pal.rim, 0.3)} transform={`rotate(${sl * 360} 0 0)`} /><path d="M-6 -2 L-12 6" stroke={pal.skin} strokeWidth={4} strokeLinecap="round" /></g>}
      </g>}
      {/* mano con el punzón */}
      {wr > 0 && wr < 1 && sl === 0 && <g transform={`translate(${hx} ${hy + Math.sin(t * 0.9) * 0.6})`}>
        <path d="M0 2 L10 -12" stroke={lerpHex(pal.wallLit, pal.rim, 0.15)} strokeWidth={1.4} strokeLinecap="round" />
        <path d="M6 -8 Q14 -4 22 6 L30 20" stroke={pal.skin} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M6 -8 Q8 -12 11 -11" stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>}
    </g>
  );
};
