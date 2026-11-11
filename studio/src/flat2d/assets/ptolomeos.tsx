// ptolomeos · piezas comunes del video cleopatra-saco (Alejandría y Roma, 48–30 a. C.): Cleopatra, César, Apolodoro, Cesarión,
// el saco de ropa de cama atado con correa y el puñal. Pies en (x, y); alto de una figura adulta ~62·s.
import React from "react";
import { clamp01, lerp } from "./common";
import { lerpHex, type Pal } from "../palette";
import { Cabeza, Toga } from "./romanos";

export const linen = (pal: Pal) => lerpHex(pal.wallLit, pal.glow, 0.25);
export const gold = (pal: Pal) => lerpHex(pal.rim, pal.glow, 0.2);
export const wig = (pal: Pal) => lerpHex(pal.ink, pal.accent, 0.28);

/** diadema de oro con el ureo (la cobra real) en la frente */
export const Diadema: React.FC<{ cx: number; cy: number; r: number; pal: Pal; k?: number; shine?: number }> = ({ cx, cy, r, pal, k = 1, shine = 0 }) => (
  <g opacity={k}>
    {shine > 0 && <circle cx={cx} cy={cy} r={r * 2.4} fill={pal.glow} opacity={0.35 * shine} />}
    <path d={`M${cx - r * 0.95} ${cy + r * 0.1} Q${cx} ${cy - r * 0.18} ${cx + r * 0.95} ${cy + r * 0.1}`} stroke={gold(pal)} strokeWidth={r * 0.2} fill="none" />
    <path d={`M${cx - r * 0.12} ${cy - r * 0.05} Q${cx - r * 0.3} ${cy - r * 0.45} ${cx} ${cy - r * 0.6} Q${cx + r * 0.25} ${cy - r * 0.45} ${cx + r * 0.08} ${cy - r * 0.08}Z`} fill={gold(pal)} />
    <circle cx={cx} cy={cy - r * 0.42} r={r * 0.08} fill={pal.accent} />
    <circle cx={cx - r * 0.5} cy={cy + r * 0.0} r={r * 0.07} fill={pal.accent} /><circle cx={cx + r * 0.5} cy={cy + r * 0.0} r={r * 0.07} fill={pal.accent} />
  </g>
);

/** cabeza de Cleopatra: peluca negra lisa con flequillo recto, ojos con kohl, labios marcados y diadema con ureo */
export const CabezaCleo: React.FC<{ cx: number; cy: number; r: number; pal: Pal; turn?: number; eyesClosed?: number; mouth?: number; crown?: number; shine?: number; fear?: number }> = ({ cx, cy, r, pal, turn = 0, eyesClosed = 0, mouth = 0, crown = 1, shine = 0, fear = 0 }) => {
  const hc = wig(pal), fx = cx + turn * r * 0.32;
  return (
    <g>
      <path d={`M${cx - r * 1.12} ${cy - r * 0.3} Q${cx - r * 1.2} ${cy - r * 1.25} ${cx} ${cy - r * 1.22} Q${cx + r * 1.2} ${cy - r * 1.25} ${cx + r * 1.12} ${cy - r * 0.3} L${cx + r * 1.15} ${cy + r * 1.35} L${cx - r * 1.15} ${cy + r * 1.35}Z`} fill={hc} />
      <path d={`M${cx - r * 1.12} ${cy - r * 0.3} Q${cx - r * 1.2} ${cy - r * 1.25} ${cx} ${cy - r * 1.22} Q${cx + r * 1.2} ${cy - r * 1.25} ${cx + r * 1.12} ${cy - r * 0.3} L${cx + r * 1.15} ${cy + r * 1.35}`} stroke={pal.rim} strokeWidth={r * 0.07} fill="none" opacity={0.55} />
      {[-1.02, -0.86, 0.86, 1.02].map((k, i) => <path key={i} d={`M${cx + k * r} ${cy + r * 0.2} L${cx + k * r} ${cy + r * 1.33}`} stroke={lerpHex(hc, pal.rim, 0.3)} strokeWidth={r * 0.05} />)}
      <Cabeza cx={cx} cy={cy} r={r} pal={pal} turn={turn} curls={false} bald eyesClosed={eyesClosed} mouth={mouth} hair={hc} />
      <path d={`M${cx - r * 0.9} ${cy - r * 0.32} Q${cx - r * 0.95} ${cy - r * 1.12} ${cx} ${cy - r * 1.1} Q${cx + r * 0.95} ${cy - r * 1.12} ${cx + r * 0.9} ${cy - r * 0.32} L${cx + r * 0.9} ${cy - r * 0.38} L${cx - r * 0.9} ${cy - r * 0.38}Z`} fill={hc} />
      {[0, 1].map((e) => { const ex = fx + (e ? 1 : -1) * r * 0.34, ey = cy - r * 0.08, sd = e ? 1 : -1;
        return <path key={e} d={`M${ex - r * 0.2} ${ey - r * 0.03} Q${ex} ${ey - r * 0.16} ${ex + r * 0.2} ${ey - r * 0.03} L${ex + sd * r * 0.34} ${ey - r * 0.12}`} stroke={pal.ink} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />; })}
      {fear > 0.05 && [0, 1].map((e) => <circle key={`w${e}`} cx={fx + (e ? 1 : -1) * r * 0.34} cy={cy - r * 0.08} r={r * 0.17 * fear} fill="none" stroke={linen(pal)} strokeWidth={r * 0.05} opacity={0.8} />)}
      {mouth < 0.2 && <path d={`M${fx - r * 0.18} ${cy + r * 0.57} Q${fx} ${cy + r * 0.66} ${fx + r * 0.18} ${cy + r * 0.57} Q${fx} ${cy + r * 0.52} ${fx - r * 0.18} ${cy + r * 0.57}Z`} fill={lerpHex(pal.skin, pal.ink, 0.42)} />}
      {[-1, 1].map((sd) => <circle key={sd} cx={cx + sd * r * 0.9} cy={cy + r * 0.35} r={r * 0.12} fill={gold(pal)} />)}
      {crown > 0 && <Diadema cx={cx} cy={cy - r * 0.62} r={r} pal={pal} k={crown} shine={shine} />}
    </g>
  );
};

/** collar ancho egipcio (usekh): bandas de oro y lapislázuli */
const Usekh: React.FC<{ cx: number; cy: number; w: number; pal: Pal }> = ({ cx, cy, w, pal }) => (
  <g>{[0, 1, 2].map((i) => <path key={i} d={`M${cx - w * (0.5 - i * 0.02)} ${cy - w * 0.02} Q${cx} ${cy + w * (0.34 + i * 0.12)} ${cx + w * (0.5 - i * 0.02)} ${cy - w * 0.02}`} stroke={i === 1 ? pal.accent : gold(pal)} strokeWidth={w * 0.1} fill="none" />)}</g>
);

/** Cleopatra de pie: vestido de lino ceñido, faja de oro, collar usekh, brazaletes. `arm` alza la mano derecha; `fear` mano a la boca;
 *  `hood` manto oscuro sobre la cabeza; `child` sostiene a un niño en la cadera; `crown` 0..1 aparece la diadema (con brillo) */
export const Cleo: React.FC<{ x: number; y: number; s: number; pal: Pal; t: number; turn?: number; arm?: number; fear?: number; hood?: number; child?: number; crown?: number; mouth?: number; shine?: number }> = ({ x, y, s, pal, t, turn = 0.2, arm = 0, fear = 0, hood = 0, child = 0, crown = 1, mouth = 0, shine = 0 }) => {
  const dress = linen(pal), shade = lerpHex(dress, pal.wall, 0.35), g = gold(pal), br = Math.sin(t * 0.08) * 0.3;
  const rh = { x: lerp(-7.6, -13, arm), y: lerp(-18, -50, arm) }, re = { x: lerp(-8.2, -13, arm), y: lerp(-30, -40, arm) };
  const lh = fear > 0 ? { x: lerp(8, 1.5, fear), y: lerp(-20, -44.5, fear) } : child > 0 ? { x: lerp(8, 4, child), y: lerp(-20, -26, child) } : { x: 7.6, y: -18 };
  const le = { x: lerp(8.2, 9, Math.max(fear, child)), y: lerp(-30, -32, Math.max(fear, child)) };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={11} ry={1.5} fill={pal.ink} opacity={0.45} />
      {/* manto: detrás del cuerpo, para que se vean la cara y el niño */}
      {hood > 0.02 && <path d={`M-7.5 ${-45 - 13 * hood} Q0 ${-61 - 2 * hood} 7.5 ${-45 - 13 * hood} Q9 -50 9.5 ${-30 - 5 * (1 - hood)} L${lerp(9.5, 11, hood)} ${lerp(-30, -6, hood)} L${lerp(-9.5, -11, hood)} ${lerp(-30, -6, hood)} Q-9 -50 -7.5 ${-45 - 13 * hood}Z`}
        fill={lerpHex(pal.ink, pal.wall, 0.3)} opacity={clamp01(hood * 1.4)} />}
      <path d="M-6.2 -41 Q0 -42.5 6.2 -41 L4.6 -28 Q8.5 -12 9 0 L-9 0 Q-8.5 -12 -4.6 -28Z" fill={dress} />
      <path d="M-1 -27 Q-2 -14 -3 0 M3 -26 Q4 -12 5 0" stroke={shade} strokeWidth={0.5} fill="none" />
      <path d="M8 -12 Q9 -5 9 0" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} fill="none" />
      <path d="M-4.8 -28 L4.8 -28" stroke={g} strokeWidth={1.3} />
      <path d={`M0.4 -28 Q${0.8 + br} -18 ${-0.4 + br} -9`} stroke={g} strokeWidth={0.9} fill="none" /><path d={`M1.4 -28 Q${2 + br} -19 ${1.6 + br} -10`} stroke={pal.accent} strokeWidth={0.6} fill="none" />
      {child > 0.02 && <g opacity={clamp01(child * 2)} transform={`translate(${lerp(10, 6.5, child)} ${-24}) scale(${lerp(0.7, 1, child)})`}>
        <path d="M-3.4 -6 Q0 -7 3.4 -6 L3 1.5 L-3 1.5Z" fill={lerpHex(dress, pal.wallLit, 0.3)} />
        <path d="M-2 1.5 L-2.4 6 M2 1.5 L2.6 5.4" stroke={pal.skin} strokeWidth={1.4} strokeLinecap="round" />
        <Cabeza cx={0} cy={-9.6} r={3.2} pal={pal} turn={-0.5} curls hair={lerpHex(pal.rock, pal.ink, 0.5)} />
      </g>}
      <path d={`M-6 -40 Q${re.x - 1} ${re.y - 2} ${re.x} ${re.y} L${rh.x} ${rh.y}`} stroke={pal.skin} strokeWidth={2.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${lerp(-6.8, -10.5, arm)} ${lerp(-36, -38, arm)} l1.2 0.6`} stroke={g} strokeWidth={1.2} />
      <circle cx={rh.x} cy={rh.y} r={1.4} fill={pal.skin} />
      <path d={`M6 -40 Q${le.x + 1} ${le.y - 2} ${le.x} ${le.y} L${lh.x} ${lh.y}`} stroke={pal.skin} strokeWidth={2.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lh.x} cy={lh.y} r={1.4} fill={pal.skin} />
      <rect x={-1.4} y={-45} width={2.8} height={4.5} fill={pal.skin} />
      <Usekh cx={0} cy={-41.5} w={12.5} pal={pal} />
      <CabezaCleo cx={0} cy={-50} r={5.2} pal={pal} turn={turn} mouth={mouth} crown={crown} shine={shine} fear={fear} />
      {fear > 0.4 && <circle cx={lh.x} cy={lh.y} r={1.5} fill={pal.skin} />}
      {hood > 0.02 && <path d="M-7.2 -47 Q-7.5 -58.5 0 -59 Q7.5 -58.5 7.2 -47 Q6 -55 0 -55.6 Q-6 -55 -7.2 -47Z" fill={lerpHex(pal.ink, pal.wall, 0.3)} opacity={clamp01(hood * 1.4)} />}
    </g>
  );
};

/** Julio César de pie: calvo con corona de laurel, toga con la franja púrpura. `arm` alza la mano; `laugh` echa la cabeza atrás y ríe;
 *  `recoil` aparta la cara y se tapa los ojos; `cover` se cubre la cabeza con la toga (los idus) */
export const Cesar: React.FC<{ x: number; y: number; s: number; pal: Pal; t: number; turn?: number; arm?: number; laugh?: number; recoil?: number; cover?: number; mouth?: number }> = ({ x, y, s, pal, t, turn = -0.3, arm = 0, laugh = 0, recoil = 0, cover = 0, mouth = 0 }) => {
  const shake = laugh > 0.2 && laugh < 0.98 ? Math.sin(t * 1.3) * 0.5 : 0, tilt = -10 * laugh + 16 * recoil;
  const lh = recoil > 0 ? { x: lerp(9, -1, recoil), y: lerp(-20, -48, recoil) } : { x: lerp(9, 15, arm), y: lerp(-20, -40, arm) };
  return (
    <g transform={`translate(${x} ${y + shake * 0.3}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={12} ry={1.6} fill={pal.ink} opacity={0.45} />
      <Toga cx={0} top={-41} feet={0} w={15} pal={pal} />
      <path d="M-7.5 -40 Q-10 -30 -8.5 -20" stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d={`M7 -40 Q${lerp(10, 11, Math.max(arm, recoil))} ${lerp(-30, -38, Math.max(arm, recoil))} ${lh.x} ${lh.y}`} stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <rect x={-1.6} y={-46} width={3.2} height={5} fill={pal.skin} />
      <g transform={`rotate(${tilt} 0 -44) translate(0 ${shake})`}>
        <Cabeza cx={0} cy={-51} r={5.6} pal={pal} turn={lerp(turn, -0.9, recoil)} laurel={1} curls={false} bald eyesClosed={Math.max(laugh * 0.8, recoil)} mouth={Math.max(mouth, laugh * (0.6 + 0.4 * Math.abs(Math.sin(t * 0.9))))} hair={lerpHex(pal.wallLit, pal.rock, 0.5)} />
        <path d={`M-3.6 -55.6 Q-2 -56.6 -0.4 -55.8 M1.8 -55.8 Q3.4 -56.6 4.8 -55.6`} stroke={lerpHex(pal.skin, pal.ink, 0.35)} strokeWidth={0.4} fill="none" />
      </g>
      {recoil > 0.05 && <circle cx={lh.x} cy={lh.y} r={1.6} fill={pal.skin} />}
      {cover > 0.02 && <path d={`M-8 -41 Q-9 ${-58 * cover - 41 * (1 - cover)} 0 ${-59 * cover - 42 * (1 - cover)} Q9 ${-58 * cover - 41 * (1 - cover)} 8 -41Z`} fill={lerpHex(pal.wallLit, pal.skin, 0.12)} opacity={clamp01(cover * 1.5)} />}
    </g>
  );
};

/** Apolodoro el siciliano: túnica corta, pelo y barba rizados; `bend` se inclina hacia delante (atar, cargar) */
export const Apolodoro: React.FC<{ x: number; y: number; s: number; pal: Pal; t: number; turn?: number; bend?: number; step?: number }> = ({ x, y, s, pal, t, turn = 0.4, bend = 0, step = 0 }) => {
  const tun = lerpHex(pal.rock, pal.wallLit, 0.3), sh = lerpHex(tun, pal.ink, 0.3), sw = Math.sin(t * 0.45) * step;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={10} ry={1.4} fill={pal.ink} opacity={0.45} />
      <path d={`M-3 -18 L${-3 - sw * 3} 0 M3 -18 L${3 + sw * 3} 0`} stroke={lerpHex(pal.skin, pal.ink, 0.15)} strokeWidth={2.6} strokeLinecap="round" />
      <g transform={`rotate(${16 * bend} 0 -18)`}>
        <path d="M-7 -40 Q0 -42 7 -40 L8 -17 L-8 -17Z" fill={tun} />
        <path d="M-7 -28 L7 -28" stroke={lerpHex(pal.rock, pal.ink, 0.3)} strokeWidth={1.1} />
        <path d="M-3 -26 L-4 -18 M2 -26 L3 -18" stroke={sh} strokeWidth={0.5} />
        <path d="M7 -40 L8 -17" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} />
        <rect x={-1.5} y={-44.5} width={3} height={4.5} fill={pal.skin} />
        <Cabeza cx={0} cy={-49.5} r={5} pal={pal} turn={turn} beard curls />
      </g>
    </g>
  );
};

/** el saco de ropa de cama, de lino basto, atado con correas de cuero. Tumbado: largo 34·s a lo largo de x, base en (x, y).
 *  `open` 0..1 la boca se abre y la tela cae plana; `straps` 0..1 aparecen las correas; `breath` hincha el saco (alguien respira dentro) */
export const Saco: React.FC<{ x: number; y: number; s: number; pal: Pal; t: number; open?: number; straps?: number; breath?: number; rot?: number }> = ({ x, y, s, pal, t, open = 0, straps = 1, breath = 0, rot = 0 }) => {
  const c = lerpHex(pal.wallLit, pal.rock, 0.3), sh = lerpHex(c, pal.ink, 0.35), lea = lerpHex(pal.rock, pal.ink, 0.25);
  const h = lerp(11, 2.2, open) * (1 + 0.05 * breath * Math.sin(t * 0.25)), L = 34;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={L * 0.55} ry={1.6} fill={pal.ink} opacity={0.4} />
      <path d={`M${-L / 2} 0 Q${-L / 2 - 2} ${-h * 0.5} ${-L / 2 + 1} ${-h} Q0 ${-h - 1.6} ${L / 2 - 1} ${-h} Q${L / 2 + 2 + open * 6} ${-h * 0.5} ${L / 2 + open * 8} 0Z`} fill={c} />
      {[-0.3, 0, 0.3].map((k, i) => <path key={i} d={`M${k * L - 1} ${-h * 0.9} Q${k * L + 1.5} ${-h * 0.5} ${k * L} -0.3`} stroke={sh} strokeWidth={0.45} fill="none" />)}
      <path d={`M${-L / 2 + 1} ${-h} Q0 ${-h - 1.6} ${L / 2 - 1} ${-h}`} stroke={pal.rim} strokeWidth={0.5} opacity={0.55} fill="none" />
      {open < 0.3 && <path d={`M${L / 2 - 1} ${-h} Q${L / 2 + 4} ${-h - 2} ${L / 2 + 3} ${-h * 0.3}`} stroke={sh} strokeWidth={0.7} fill="none" />}
      {straps > 0.02 && [-0.28, 0.12].map((k, i) => <g key={i} opacity={clamp01(straps * 2 - i * 0.5)}>
        <path d={`M${k * L} ${-h - 1} Q${k * L + 1} ${-h * 0.5} ${k * L} 0.2`} stroke={lea} strokeWidth={1.5} fill="none" />
        <rect x={k * L - 1} y={-h * 0.55} width={2} height={1.6} fill={gold(pal)} opacity={0.85} />
      </g>)}
    </g>
  );
};

/** Cesarión adolescente (17 años): pelo corto, diadema fina, túnica de lino con manto; el busto de César, de perfil, puede asomar detrás (`ghost`) */
export const CabezaCesarion: React.FC<{ cx: number; cy: number; r: number; pal: Pal; turn?: number; eyesClosed?: number }> = ({ cx, cy, r, pal, turn = 0.25, eyesClosed = 0 }) => (
  <g>
    <Cabeza cx={cx} cy={cy} r={r} pal={pal} turn={turn} curls hair={lerpHex(pal.rock, pal.ink, 0.45)} eyesClosed={eyesClosed} />
    <path d={`M${cx - r * 0.9} ${cy - r * 0.55} Q${cx} ${cy - r * 0.8} ${cx + r * 0.9} ${cy - r * 0.55}`} stroke={gold(pal)} strokeWidth={r * 0.12} fill="none" />
  </g>
);

/** puñal romano (pugio): hoja ancha en hoja de sauce, guarda y pomo; punta hacia abajo, empuñadura en (x, y) */
export const Pugio: React.FC<{ x: number; y: number; s: number; pal: Pal; rot?: number; blood?: number }> = ({ x, y, s, pal, rot = 0, blood = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-1.4 0 Q-2 6 0 12 Q2 6 1.4 0Z" fill={lerpHex(pal.wallLit, pal.rim, 0.3)} />
    {blood > 0 && <path d={`M-1.3 ${12 - 9 * blood} Q-1.8 ${12 - 5 * blood} 0 12 Q1.8 ${12 - 5 * blood} 1.3 ${12 - 9 * blood}Z`} fill={pal.accent} />}
    <path d="M0 0.5 L0 10" stroke={lerpHex(pal.rim, pal.ink, 0.3)} strokeWidth={0.3} />
    <rect x={-2.4} y={-1} width={4.8} height={1.2} rx={0.4} fill={lerpHex(pal.rock, pal.rim, 0.4)} />
    <rect x={-0.8} y={-4.5} width={1.6} height={3.6} fill={lerpHex(pal.rock, pal.ink, 0.2)} />
    <circle cx={0} cy={-5} r={1.1} fill={lerpHex(pal.rock, pal.rim, 0.4)} />
  </g>
);
