// romanos · piezas comunes de los personajes romanos: cabeza (pelo rizado, barba, laurel), coraza con capa, toga y legionario de espaldas.
// Todo en colores de la paleta: la capa usa `accent` (carmesí en las paletas roma/siria/danubio) y el metal, `rim`.
import React from "react";
import type { Pal } from "../palette";
import { lerpHex } from "../palette";

export const hairCol = (pal: Pal) => lerpHex(pal.rock, pal.ink, 0.45);
export const metal = (pal: Pal) => lerpHex(pal.rim, pal.rock, 0.35);

/** corona de laurel: hojas a lo largo de un arco sobre la cabeza */
export const Laurel: React.FC<{ cx: number; cy: number; r: number; pal: Pal; k?: number }> = ({ cx, cy, r, pal, k = 1 }) => (
  <g opacity={k}>
    {[...Array(9)].map((_, i) => {
      const a = Math.PI * (1.08 + i * 0.105), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.62, rot = (a * 180) / Math.PI + 90;
      return <ellipse key={i} cx={x} cy={y} rx={r * 0.13} ry={r * 0.28} transform={`rotate(${rot - 30} ${x} ${y})`} fill={lerpHex(pal.rim, pal.rock, 0.25)} />;
    })}
    {[...Array(9)].map((_, i) => {
      const a = Math.PI * (1.92 - i * 0.105), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.62, rot = (a * 180) / Math.PI + 90;
      return <ellipse key={`b${i}`} cx={x} cy={y} rx={r * 0.13} ry={r * 0.28} transform={`rotate(${rot + 30} ${x} ${y})`} fill={pal.rim} />;
    })}
  </g>
);

/** cabeza de frente/tres cuartos: `turn` (-1..1) desplaza los rasgos; `beard` barba rizada; `laurel` 0..1 */
export const Cabeza: React.FC<{ cx: number; cy: number; r: number; pal: Pal; turn?: number; beard?: boolean; laurel?: number; curls?: boolean; eyesClosed?: number; hair?: string; bald?: boolean; mouth?: number }> = ({ cx, cy, r, pal, turn = 0, beard = false, laurel = 0, curls = true, eyesClosed = 0, hair, bald = false, mouth = 0 }) => {
  const hc = hair ?? hairCol(pal), fx = cx + turn * r * 0.32;
  return (
    <g>
      {curls && [...Array(11)].map((_, i) => { const a = Math.PI * (0.95 + i * 0.11); return <circle key={i} cx={cx + Math.cos(a) * r * 0.95} cy={cy + Math.sin(a) * r * 0.9 - r * 0.05} r={r * 0.3} fill={hc} />; })}
      <ellipse cx={cx} cy={cy} rx={r * 0.86} ry={r} fill={pal.skin} />
      <path d={`M${cx + r * 0.84} ${cy - r * 0.4} A${r * 0.86} ${r} 0 0 1 ${cx + r * 0.5} ${cy + r * 0.85}`} stroke={pal.rim} strokeWidth={r * 0.1} fill="none" opacity={0.8} />
      {beard && <path d={`M${cx - r * 0.86} ${cy - r * 0.05} Q${cx - r * 0.8} ${cy + r * 1.25} ${fx} ${cy + r * 1.3} Q${cx + r * 0.8} ${cy + r * 1.25} ${cx + r * 0.86} ${cy - r * 0.05} Q${cx + r * 0.6} ${cy + r * 0.5} ${fx} ${cy + r * 0.42} Q${cx - r * 0.6} ${cy + r * 0.5} ${cx - r * 0.86} ${cy - r * 0.05}Z`} fill={hc} />}
      {beard && [...Array(6)].map((_, i) => <circle key={i} cx={cx - r * 0.62 + i * r * 0.25} cy={cy + r * (0.95 + 0.18 * Math.sin(i * 1.3))} r={r * 0.17} fill={lerpHex(hc, pal.ink, 0.3)} />)}
      {bald ? [-1, 1].map((sd) => <path key={sd} d={`M${cx + sd * r * 0.88} ${cy + r * 0.1} Q${cx + sd * r * 1.02} ${cy - r * 0.5} ${cx + sd * r * 0.55} ${cy - r * 0.78}`} stroke={hc} strokeWidth={r * 0.28} fill="none" strokeLinecap="round" />)
        : <path d={`M${cx - r * 0.86} ${cy - r * 0.25} Q${cx - r * 0.7} ${cy - r * 1.15} ${cx} ${cy - r * 1.05} Q${cx + r * 0.75} ${cy - r * 1.1} ${cx + r * 0.86} ${cy - r * 0.25} Q${cx + r * 0.3} ${cy - r * 0.62} ${cx - r * 0.86} ${cy - r * 0.25}Z`} fill={hc} />}
      {mouth > 0 && <ellipse cx={fx} cy={cy + r * (beard ? 0.62 : 0.58)} rx={r * 0.2} ry={r * 0.16 * mouth} fill={pal.ink} />}
      {[0, 1].map((e) => {
        const ex = fx + (e ? 1 : -1) * r * 0.34, ey = cy - r * 0.08;
        return <g key={e}><path d={`M${ex - r * 0.18} ${ey - r * 0.22} L${ex + r * 0.18} ${ey - r * 0.25}`} stroke={hc} strokeWidth={r * 0.1} strokeLinecap="round" />
          <ellipse cx={ex} cy={ey} rx={r * 0.11} ry={r * 0.11 * (1 - 0.85 * eyesClosed)} fill={pal.ink} /></g>;
      })}
      <path d={`M${fx} ${cy - r * 0.05} L${fx + r * 0.12} ${cy + r * 0.3} L${fx - r * 0.04} ${cy + r * 0.34}`} stroke={lerpHex(pal.skin, pal.ink, 0.35)} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
      {!beard && <path d={`M${fx - r * 0.2} ${cy + r * 0.56} Q${fx} ${cy + r * 0.62} ${fx + r * 0.2} ${cy + r * 0.56}`} stroke={lerpHex(pal.skin, pal.ink, 0.45)} strokeWidth={r * 0.07} fill="none" />}
      {laurel > 0 && <Laurel cx={cx} cy={cy - r * 0.25} r={r * 1.02} pal={pal} k={laurel} />}
    </g>
  );
};

/** cuerpo con coraza musculada, faldellín de tiras (pteruges) y capa; hombros en (cx, top), pies en `feet` */
export const Coraza: React.FC<{ cx: number; top: number; feet: number; w: number; pal: Pal; cape?: string }> = ({ cx, top, feet, w, pal, cape }) => {
  const h = feet - top, waist = top + h * 0.42, skirt = top + h * 0.58, m = metal(pal), c = cape ?? pal.accent;
  return (
    <g>
      <path d={`M${cx - w * 0.62} ${top + h * 0.02} Q${cx - w * 0.9} ${top + h * 0.6} ${cx - w * 0.72} ${top + h * 0.82} L${cx + w * 0.72} ${top + h * 0.82} Q${cx + w * 0.9} ${top + h * 0.6} ${cx + w * 0.62} ${top + h * 0.02}Z`} fill={lerpHex(c, pal.ink, 0.35)} />
      {[-1, 1].map((s) => <rect key={s} x={cx + s * w * 0.18 - w * 0.12} y={skirt} width={w * 0.24} height={feet - skirt - h * 0.03} rx={w * 0.08} fill={pal.skin} />)}
      {[-1, 1].map((s) => <path key={`s${s}`} d={`M${cx + s * w * 0.18 - w * 0.15} ${feet - h * 0.12} L${cx + s * w * 0.18 + w * 0.15} ${feet - h * 0.12} L${cx + s * w * 0.18 + w * 0.17} ${feet} L${cx + s * w * 0.18 - w * 0.17} ${feet}Z`} fill={pal.rock} />)}
      <path d={`M${cx - w * 0.42} ${waist} L${cx + w * 0.42} ${waist} L${cx + w * 0.46} ${skirt + h * 0.04} L${cx - w * 0.46} ${skirt + h * 0.04}Z`} fill={c} />
      {[...Array(7)].map((_, i) => <rect key={i} x={cx - w * 0.42 + i * w * 0.12} y={waist} width={w * 0.1} height={h * 0.15} rx={w * 0.02} fill={lerpHex(m, pal.rock, 0.3)} />)}
      <path d={`M${cx - w * 0.5} ${top} Q${cx} ${top - h * 0.03} ${cx + w * 0.5} ${top} L${cx + w * 0.42} ${waist} L${cx - w * 0.42} ${waist}Z`} fill={m} />
      <path d={`M${cx - w * 0.22} ${top + h * 0.12} Q${cx - w * 0.05} ${top + h * 0.2} ${cx} ${top + h * 0.14} Q${cx + w * 0.05} ${top + h * 0.2} ${cx + w * 0.22} ${top + h * 0.12}`} stroke={lerpHex(m, pal.ink, 0.4)} strokeWidth={w * 0.03} fill="none" />
      <path d={`M${cx} ${top + h * 0.22} L${cx} ${waist - h * 0.04}`} stroke={lerpHex(m, pal.ink, 0.35)} strokeWidth={w * 0.025} />
      <path d={`M${cx + w * 0.5} ${top} L${cx + w * 0.42} ${waist}`} stroke={pal.rim} strokeWidth={w * 0.04} />
      <path d={`M${cx - w * 0.36} ${waist - h * 0.01} L${cx + w * 0.36} ${waist - h * 0.01}`} stroke={c} strokeWidth={w * 0.05} />
      <path d={`M${cx - w * 0.62} ${top + h * 0.02} Q${cx - w * 0.3} ${top + h * 0.1} ${cx - w * 0.5} ${top} Z`} fill={c} />
      <circle cx={cx - w * 0.44} cy={top + h * 0.03} r={w * 0.07} fill={pal.rim} />
    </g>
  );
};

/** toga blanca con pliegues y franja carmesí (senadores); hombros en (cx, top) */
export const Toga: React.FC<{ cx: number; top: number; feet: number; w: number; pal: Pal; band?: boolean }> = ({ cx, top, feet, w, pal, band = true }) => {
  const h = feet - top, cloth = lerpHex(pal.wallLit, pal.skin, 0.12), shade = lerpHex(pal.wallLit, pal.wall, 0.45);
  return (
    <g>
      <path d={`M${cx - w * 0.5} ${top} Q${cx} ${top - h * 0.04} ${cx + w * 0.5} ${top} L${cx + w * 0.6} ${feet} L${cx - w * 0.6} ${feet}Z`} fill={cloth} />
      {[0.3, 0.5, 0.7].map((k, i) => <path key={i} d={`M${cx - w * 0.5 + k * w * 0.5} ${top + h * 0.1} Q${cx - w * 0.3 + k * w} ${top + h * 0.5} ${cx - w * 0.45 + k * w} ${feet}`} stroke={shade} strokeWidth={w * 0.04} fill="none" />)}
      <path d={`M${cx - w * 0.5} ${top} Q${cx + w * 0.05} ${top + h * 0.35} ${cx + w * 0.55} ${top + h * 0.55}`} stroke={band ? pal.accent : shade} strokeWidth={w * 0.09} fill="none" />
      <path d={`M${cx + w * 0.5} ${top} L${cx + w * 0.6} ${feet}`} stroke={pal.rim} strokeWidth={w * 0.03} opacity={0.6} />
    </g>
  );
};

/** legionario visto de espaldas: casco con cimera, escudo rectangular carmesí con umbo y lanza; `up` 0..1 alza la lanza */
export const Legionario: React.FC<{ x: number; y: number; s: number; pal: Pal; up?: number; tilt?: number; seed?: number }> = ({ x, y, s, pal, up = 0, tilt = 0, seed = 0 }) => {
  const m = metal(pal), sh = lerpHex(pal.accent, pal.ink, 0.15 + 0.1 * (seed % 3));
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      <path d={`M7 -${30 + up * 14} L7 -2`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={0.9} />
      <path d={`M6 -${30 + up * 14} L7 -${35 + up * 14} L8 -${30 + up * 14}Z`} fill={m} />
      <path d="M-8 -26 Q0 -28 8 -26 L8 0 L-8 0Z" fill={lerpHex(pal.accent, pal.ink, 0.5)} />
      <circle cx={0} cy={-31} r={4.6} fill={m} /><path d="M-4.6 -30 L-6 -27 L6 -27 L4.6 -30Z" fill={lerpHex(m, pal.ink, 0.3)} />
      <path d="M-1.2 -35.5 Q0 -40 1.2 -35.5 L1 -31 L-1 -31Z" fill={pal.accent} /><path d="M-3.5 -35 Q0 -39.5 3.5 -35" stroke={pal.accent} strokeWidth={2} fill="none" />
      <rect x={-9} y={-24} width={10} height={18} rx={1.4} fill={sh} /><rect x={-9} y={-24} width={10} height={18} rx={1.4} fill="none" stroke={pal.rim} strokeWidth={0.5} />
      <circle cx={-4} cy={-15} r={1.8} fill={pal.rim} /><path d="M-9 -15 L-6 -15 M-2 -15 L1 -15" stroke={pal.rim} strokeWidth={0.6} />
    </g>
  );
};

/** hoplita griego visto de espaldas: casco corintio con cimera, escudo redondo (hoplon) con una estrella o una lambda y lanza; `up` 0..1 alza la lanza */
export const Hoplita: React.FC<{ x: number; y: number; s: number; pal: Pal; up?: number; tilt?: number; seed?: number }> = ({ x, y, s, pal, up = 0, tilt = 0, seed = 0 }) => {
  const m = metal(pal), sh = lerpHex(pal.rim, pal.rock, 0.3 + 0.15 * (seed % 3)), em = lerpHex(pal.accent, pal.ink, 0.1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      <path d={`M7 -${30 + up * 14} L7 -2`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={0.9} />
      <path d={`M6 -${30 + up * 14} L7 -${35 + up * 14} L8 -${30 + up * 14}Z`} fill={m} />
      <path d="M-7 -26 Q0 -28 7 -26 L7 0 L-7 0Z" fill={lerpHex(pal.accent, pal.ink, 0.45)} />
      <circle cx={0} cy={-31} r={4.6} fill={m} /><path d="M-4.6 -31 L-4.6 -27 L4.6 -27 L4.6 -31" fill={lerpHex(m, pal.ink, 0.25)} />
      <path d="M-5 -35 Q0 -42 5 -35 L4 -33 Q0 -38 -4 -33Z" fill={pal.accent} />
      <circle cx={-3} cy={-15} r={9} fill={sh} /><circle cx={-3} cy={-15} r={9} fill="none" stroke={lerpHex(pal.rim, pal.ink, 0.3)} strokeWidth={0.9} />
      {seed % 2 ? <path d="M-6.5 -10 L-3 -20 L0.5 -10" stroke={em} strokeWidth={1.4} fill="none" />
        : [...Array(8)].map((_, i) => <path key={i} d={`M-3 -15 L${-3 + Math.cos(i * 0.785) * 4.5} ${-15 + Math.sin(i * 0.785) * 4.5}`} stroke={em} strokeWidth={0.8} />)}
    </g>
  );
};

/** manto griego (himatión) raído sobre un hombro, con el otro hombro y el brazo al aire; hombros en (cx, top) */
export const Himation: React.FC<{ cx: number; top: number; feet: number; w: number; pal: Pal; cloth?: string; ragged?: boolean }> = ({ cx, top, feet, w, pal, cloth, ragged = true }) => {
  const h = feet - top, c = cloth ?? lerpHex(pal.rock, pal.wallLit, 0.25), shade = lerpHex(c, pal.ink, 0.3);
  const hem = ragged ? [...Array(7)].map((_, i) => `L${cx + w * 0.55 - i * w * 0.18} ${feet - (i % 2 ? h * 0.06 : 0)}`).join(" ") : `L${cx - w * 0.55} ${feet}`;
  return (
    <g>
      <path d={`M${cx - w * 0.45} ${top + h * 0.02} Q${cx} ${top - h * 0.03} ${cx + w * 0.5} ${top} L${cx + w * 0.58} ${feet} ${hem} L${cx - w * 0.58} ${feet} L${cx - w * 0.5} ${top + h * 0.3}Z`} fill={c} />
      {[0.25, 0.45, 0.65].map((k, i) => <path key={i} d={`M${cx - w * 0.4 + k * w * 0.6} ${top + h * 0.12} Q${cx - w * 0.25 + k * w} ${top + h * 0.55} ${cx - w * 0.4 + k * w} ${feet - h * 0.05}`} stroke={shade} strokeWidth={w * 0.035} fill="none" />)}
      <path d={`M${cx + w * 0.5} ${top} Q${cx - w * 0.1} ${top + h * 0.3} ${cx - w * 0.52} ${top + h * 0.32}`} stroke={shade} strokeWidth={w * 0.06} fill="none" />
      <path d={`M${cx + w * 0.5} ${top} L${cx + w * 0.58} ${feet}`} stroke={pal.rim} strokeWidth={w * 0.03} opacity={0.6} />
      {ragged && [0, 1].map((i) => <rect key={i} x={cx - w * 0.2 + i * w * 0.32} y={top + h * (0.45 + i * 0.2)} width={w * 0.12} height={w * 0.1} fill={shade} transform={`rotate(${i * 20 - 10} ${cx} ${top + h * 0.5})`} />)}
    </g>
  );
};
