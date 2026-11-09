// marco · Marco Aurelio de pie, en campaña: pelo y barba rizados, corona de laurel, coraza y capa carmesí (paludamentum).
// `speak` alza el brazo derecho con la palma abierta (habla a las tropas); `hold_letter` sostiene una carta sellada frente al pecho con el pulgar sobre el sello (duda); `turn_away` gira la cabeza, cierra los ojos y alza la mano izquierda: «no quiero verlo».
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza } from "./romanos";

export const Marco: AssetFC = ({ pal, p, t }) => {
  const sp = p.speak ?? 0, ta = p.turn_away ?? 0, hl = p.hold_letter ?? 0, breathe = Math.sin(t * 0.07) * 0.6;
  const cx = 50, top = 52, feet = 156, w = 44;
  // brazo derecho (a la izquierda del cuadro): baja junto al cuerpo → alzado
  // con hold_letter la mano sube a la altura del pecho con la carta sellada, temblando un poco
  const rhx = lerp(lerp(26, 14, sp), 40, hl), rhy = lerp(lerp(112, 44 + Math.sin(t * 0.2) * sp * 1.2, sp), 66 + Math.sin(t * 0.9) * 0.5 * hl, hl), rex = lerp(lerp(24, 18, sp), 22, hl), rey = lerp(lerp(88, 74, sp), 84, hl);
  // brazo izquierdo: baja → mano frente a la cara, palma fuera
  const lhx = lerp(74, 70, ta), lhy = lerp(112, 40, ta), lex = lerp(76, 82, ta), ley = lerp(88, 66, ta);
  return (
    <g transform={`translate(0 ${breathe})`}>
      <ellipse cx={50} cy={157} rx={30} ry={3.4} fill={pal.ink} opacity={0.5} />
      <path d={`M${cx - 26} ${top} Q${cx - 40} ${top + 60} ${cx - 34} ${feet - 6} L${cx + 34} ${feet - 6} Q${cx + 40} ${top + 60} ${cx + 26} ${top}Z`} fill={lerpHex(pal.accent, pal.ink, 0.42)} />
      <Coraza cx={cx} top={top} feet={feet} w={w} pal={pal} />
      <path d={`M${cx - 22} ${top + 2} Q${rex - 4} ${rey - 10} ${rex} ${rey}`} stroke={pal.accent} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${rex} ${rey} L${rhx} ${rhy}`} stroke={pal.skin} strokeWidth={6.4} strokeLinecap="round" />
      <ellipse cx={rhx} cy={rhy} rx={3.6} ry={4.4} fill={pal.skin} />
      {hl > 0.05 && <g transform={`translate(${rhx + 6} ${rhy - 6}) rotate(${-12 + 4 * Math.sin(t * 0.07)})`} opacity={clamp01(hl * 2)}>
        <rect x={-10} y={-7} width={20} height={14} rx={0.8} fill={lerpHex(pal.wallLit, pal.rim, 0.15)} />
        {[0, 1, 2].map((l) => <path key={l} d={`M-7 ${-4 + l * 2.6} L${5 - l * 2} ${-4 + l * 2.6}`} stroke={lerpHex(pal.rock, pal.ink, 0.4)} strokeWidth={0.6} />)}
        <circle cx={5.5} cy={3.5} r={2.6} fill={pal.accent} /><path d="M4.2 3.5 L6.8 3.5 M5.5 2.2 L5.5 4.8" stroke={lerpHex(pal.accent, pal.ink, 0.4)} strokeWidth={0.5} />
        <ellipse cx={7.5} cy={1.5} rx={1.6} ry={2.4} fill={pal.skin} transform="rotate(-30 7.5 1.5)" />
      </g>}
      {sp > 0.3 && [0, 1, 2, 3].map((i) => <path key={i} d={`M${rhx - 2.4 + i * 1.6} ${rhy - 3.4} l${-0.3 + i * 0.2} -3.2`} stroke={pal.skin} strokeWidth={1.4} strokeLinecap="round" opacity={clamp01((sp - 0.3) * 3)} />)}
      <path d={`M${cx + 22} ${top + 2} Q${lex + 4} ${ley - 8} ${lex} ${ley}`} stroke={pal.accent} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${lex} ${ley} L${lhx} ${lhy}`} stroke={pal.skin} strokeWidth={6.4} strokeLinecap="round" />
      <path d={`M${cx + 12} ${top - 3} L${cx - 12} ${top - 3} L${cx - 8} ${top + 4} L${cx + 8} ${top + 4}Z`} fill={pal.skin} />
      <g transform={`rotate(${-14 * ta} ${cx} ${top - 6})`}>
        <Cabeza cx={cx - 2 * ta} cy={top - 20} r={12} pal={pal} turn={lerp(0.15, -0.9, ta)} beard laurel={1} eyesClosed={ta} />
      </g>
      {ta > 0.05 && <g opacity={clamp01(ta * 2)}>
        <ellipse cx={lhx} cy={lhy} rx={4.2} ry={5.2} fill={pal.skin} /><path d={`M${lhx + 4} ${lhy - 1} A4.2 5.2 0 0 1 ${lhx + 1} ${lhy + 5}`} stroke={pal.rim} strokeWidth={0.8} fill="none" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${lhx - 2.6 + i * 1.7} ${lhy - 4} l0 -3.6`} stroke={pal.skin} strokeWidth={1.5} strokeLinecap="round" />)}
      </g>}
      {ta <= 0.05 && <ellipse cx={lhx} cy={lhy} rx={3.6} ry={4.4} fill={pal.skin} />}
      {[0, 1, 2].map((i) => { const u = clamp01(sp * 1.6 - 0.4 - i * 0.2); return u > 0 && u < 1 ? <path key={`w${i}`} d={`M${8 - u * 6} ${34 - u * 8} Q${2 - u * 10} 44 ${8 - u * 6} ${54 + u * 8}`} stroke={pal.glow} strokeWidth={1.1} fill="none" opacity={(1 - u) * 0.8} /> : null; })}
    </g>
  );
};
