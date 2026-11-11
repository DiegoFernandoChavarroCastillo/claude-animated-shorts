// pasillo_guardias · Apolodoro y el saco de ropa de cama en el palacio de noche: Cleopatra se mete en el saco, él lo ata y se lo carga al hombro; pasan los guardias.
// `enter` Cleopatra se hunde dentro del saco abierto (se queda); `tie` Apolodoro cierra la boca con la correa y se carga el saco al hombro (se queda);
// `guards` dos guardias con lanza y casco pasan en primer plano de derecha a izquierda (se van); `freeze` el saco tiembla y se queda quieto: nadie respira (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Apolodoro, CabezaCleo, gold } from "./ptolomeos";
import { metal } from "./romanos";

export const PasilloGuardias: AssetFC = ({ pal, p, t, seed }) => {
  const en = p.enter ?? 0, ti = p.tie ?? 0, gu = p.guards ?? 0, fr = p.freeze ?? 0, id = `pg${seed}`;
  const close = clamp01(ti / 0.45), lift = clamp01((ti - 0.45) / 0.55), lE = lift * lift * (3 - 2 * lift);
  const c = lerpHex(pal.wallLit, pal.rock, 0.3), sh = lerpHex(c, pal.ink, 0.35), lea = lerpHex(pal.rock, pal.ink, 0.25);
  const trem = fr > 0 && fr < 0.7 ? Math.sin(t * 2.2) * 0.8 * (0.7 - fr) : 0;
  const bx = lerp(36, 84, lE), by = lerp(72, 29, lE), rot = lerp(0, -90, lE) + trem * 2;
  const headY = lerp(-38, -10, clamp01(en));
  const mouthW = lerp(8.5, 2.2, close);
  const walking = lift >= 1 && fr < 0.4 ? 1 : 0;
  return (
    <g>
      <defs><clipPath id={`${id}c`}><rect x={-30} y={-80} width={60} height={50} /></clipPath></defs>
      <ellipse cx={55} cy={72} rx={40} ry={2.8} fill={pal.ink} opacity={0.35} />
      <Apolodoro x={66} y={72} s={1.05} pal={pal} t={t} turn={lerp(-0.6, -0.2, lift) + 0.5 * fr} bend={lerp(0.5 * close * (1 - lift), 0, lift)} step={walking} />
      <path d={`M60 30 Q${lerp(52, 60, lE)} ${lerp(40, 26, lE)} ${lerp(44, 64, lE)} ${lerp(44, 22, lE)}`} stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <g transform={`translate(${bx} ${by}) rotate(${rot})`}>
        {en < 1 && <g clipPath={`url(#${id}c)`}><g transform={`translate(0 ${headY + 38})`}>
          <path d="M-6 -36 Q0 -38 6 -36 L7 -26 L-7 -26Z" fill={lerpHex(pal.wallLit, pal.glow, 0.25)} />
          <CabezaCleo cx={0} cy={-45} r={5} pal={pal} turn={0.5} />
        </g></g>}
        <path d={`M-8 0 Q-9.5 -16 -${mouthW} -32 Q0 ${-34 - close * 3} ${mouthW} -32 Q9.5 -16 8 0Z`} fill={c} />
        {[-3, 2.5].map((k, i) => <path key={i} d={`M${k} -28 Q${k + 1.5} -14 ${k} -1`} stroke={sh} strokeWidth={0.5} fill="none" />)}
        <path d={`M-${mouthW} -32 Q0 ${-34 - close * 3} ${mouthW} -32`} stroke={pal.rim} strokeWidth={0.5} opacity={0.5} fill="none" />
        <path d="M8 0 Q9.5 -16 8.5 -32" stroke={pal.rim} strokeWidth={0.5} opacity={0.5} fill="none" />
        {close > 0.05 && <g opacity={clamp01(close * 2)}>
          <path d={`M-${mouthW + 1} -30.5 Q0 -29 ${mouthW + 1} -30.5`} stroke={lea} strokeWidth={1.6} fill="none" />
          <rect x={-1} y={-31.5} width={2} height={2} fill={gold(pal)} />
          <path d="M-8.4 -12 Q0 -10.5 8.4 -12" stroke={lea} strokeWidth={1.5} fill="none" />
          <path d={`M1 -29.5 Q${2 + Math.sin(t * 0.2)} -24 1.5 -21`} stroke={lea} strokeWidth={0.8} fill="none" />
        </g>}
      </g>
      {gu > 0 && gu < 1 && [0, 1].map((k) => {
        const gx = lerp(150 + k * 30, -50 + k * 30, gu), st = Math.sin(t * 0.5 + k) * 3, m = metal(pal), sil = lerpHex(pal.ink, pal.wall, 0.12);
        return <g key={k} transform={`translate(${gx} 80) scale(1.55)`}>
          <path d={`M-3 -18 L${-3 - st} 0 M3 -18 L${3 + st} 0`} stroke={sil} strokeWidth={2.8} strokeLinecap="round" />
          <path d="M-7 -40 Q0 -42 7 -40 L8 -16 L-8 -16Z" fill={sil} />
          <circle cx={0} cy={-46} r={5.2} fill={sil} /><path d="M-5.6 -47 Q0 -54 5.6 -47Z" fill={sil} /><path d="M-1 -52 Q-6 -58 -9 -52" stroke={lerpHex(pal.accent, pal.ink, 0.5)} strokeWidth={2} fill="none" />
          <path d="M-5.2 -46 A5.2 5.2 0 0 1 -1 -50.8" stroke={m} strokeWidth={0.6} fill="none" opacity={0.7} />
          <path d="M-9 -60 L-9 -2" stroke={sil} strokeWidth={0.9} /><path d="M-10 -60 L-9 -64 L-8 -60Z" fill={m} />
          <path d="M-8 -40 Q-10 -30 -9 -22" stroke={sil} strokeWidth={2.4} fill="none" />
        </g>;
      })}
    </g>
  );
};
