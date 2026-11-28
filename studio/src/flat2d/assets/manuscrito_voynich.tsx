// manuscrito_voynich · prop (manuscrito-voynich): el manuscrito Voynich abierto, dos páginas de vitela amarillenta con tapas de piel: a la
// izquierda renglones de su escritura desconocida (bucles, «8», letras-horca altas) y a la derecha una de sus ilustraciones a color.
// Lienzo 100 × 70, anclaje en el centro. opts.pagina plantas | astro | banos | texto (la derecha); opts.pagina2 (la que queda tras `flip`);
// opts.cerrado true = empieza cerrado (lo abre `open`). Acciones propias: `open` las tapas se abren y aparecen las páginas (se queda abierto);
// `close` se cierra (se queda cerrado); `flip` pasa una hoja de derecha a izquierda y deja opts.pagina2; `write` los símbolos se escriben
// solos renglón a renglón (se quedan); `glow` los símbolos brillan en dorado mientras dura.
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex, type Pal } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

/** un glifo del voynichés de tamaño ~s (trazo), tipo k 0..7; devuelve un path d */
export const glyphD = (k: number, x: number, y: number, s: number): string => {
  const r = s * 0.42;
  switch (k % 8) {
    case 0: return `M${x + r} ${y} a${r} ${r} 0 1 0 0.01 0`; // o
    case 1: return `M${x + r} ${y} a${r} ${r} 0 1 0 0.01 0 M${x + r} ${y} q${r * 0.6} ${r * 1.6} ${r * 1.4} ${r * 1.2}`; // a
    case 2: return `M${x} ${y - r * 1.1} a${r * 0.55} ${r * 0.55} 0 1 1 0.01 0 M${x} ${y - r * 0.05} a${r * 0.7} ${r * 0.7} 0 1 0 0.01 0`; // 8
    case 3: return `M${x + r * 0.7} ${y - r * 0.6} q${-r * 1.6} ${r * 0.6} 0 ${r * 1.2}`; // c
    case 4: return `M${x - r * 0.5} ${y + r} l0 ${-r * 3.2} M${x - r * 0.5} ${y - r * 0.6} q${r * 1.2} ${-r * 1.6} ${r * 1.6} ${r * 0.2} q${-r * 0.4} ${r * 0.8} ${-r * 1.6} ${r * 0.4} M${x + r * 0.9} ${y + r} l0 ${-r * 2.4}`; // horca k
    case 5: return `M${x - r * 0.6} ${y - r * 0.6} q${r * 0.6} ${r * 1.4} ${r * 1.4} ${r * 0.4} M${x + r * 0.8} ${y - r * 0.6} q${-r * 0.2} ${r * 2.2} ${-r * 1.4} ${r * 2.4}`; // y
    case 6: return `M${x - r} ${y + r * 0.6} q${r} ${-r * 2} ${r * 2} 0 M${x - r * 0.2} ${y - r * 1.8} l${r * 0.4} ${r * 0.6}`; // e con acento
    default: return `M${x - r} ${y + r * 0.4} q${r * 0.8} ${-r * 1.6} ${r * 1.2} 0 q${r * 0.3} ${-r * 1.4} ${r * 1.1} ${-r * 0.4}`; // r/ii
  }
};
/** renglones de voynichés dentro de un rectángulo; reveal 0..1 escribe de arriba abajo y de izquierda a derecha */
export const Glyphs: React.FC<{ x: number; y: number; w: number; rows: number; lh: number; s: number; seed: number; reveal?: number; color: string; sw?: number; op?: number }> = ({ x, y, w, rows, lh, s, seed, reveal = 1, color, sw = 0.35, op = 0.85 }) => {
  const out: string[] = []; let n = 0; const total = rows * Math.floor(w / s);
  for (let r = 0; r < rows; r++) {
    let cx = x + (r === 0 ? s * 1.5 : 0) + s * 0.4;
    while (cx < x + w - s * 0.5) {
      const len = 2 + Math.floor(hash(seed * 7 + r * 31 + cx) * 4);
      for (let g = 0; g < len && cx < x + w - s * 0.5; g++) {
        if (n / total < reveal * 1.02) out.push(glyphD(Math.floor(hash(seed + r * 13 + cx * 3.1) * 8), cx, y + r * lh, s));
        cx += s * 0.95; n++;
      }
      cx += s * 0.8;
    }
  }
  return <path d={out.join(" ")} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" opacity={op} />;
};

const Planta: React.FC<{ x: number; y: number; pal: Pal; id: string }> = ({ x, y, pal, id }) => {
  const g = lerpHex("#4F8A5A", pal.wall, 0.15), g2 = lerpHex("#3A7A8A", pal.wall, 0.15), root = lerpHex("#9A6A3A", pal.ink, 0.15), fl = lerpHex("#C0473A", pal.accent, 0.3);
  return (
    <g>
      <Vol id={`${id}l`} c={g} pal={pal} k={0.7} />
      {/* raíces bulbosas como dedos */}
      <path d={`M${x - 3} ${y + 14} q-6 4 -9 12 M${x} ${y + 15} q1 6 -1 12 M${x + 3} ${y + 14} q6 3 8 11 M${x - 1} ${y + 18} q-3 3 -4 8`} stroke={root} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <ellipse cx={x} cy={y + 13} rx={5} ry={3.4} fill={root} />
      <path d={`M${x} ${y + 11} L${x} ${y - 14}`} stroke={dark(g, pal, 0.2)} strokeWidth={1.1} />
      {[[-1, 6, 1], [1, 2, 1.1], [-1, -3, 0.9], [1, -8, 0.8]].map(([sd, dy, k], i) => (
        <path key={i} d={`M${x} ${y + dy} q${sd * 8 * k} ${-6 * k} ${sd * 13 * k} ${-1} q${-sd * 6 * k} ${5 * k} ${-sd * 13 * k} ${1} Z`} fill={i % 2 ? url(`${id}l`) : g2} stroke={dark(g, pal, 0.35)} strokeWidth={0.25} />
      ))}
      {/* flor roja y azul, imposible */}
      {[...Array(6)].map((_, i) => { const a = (i / 6) * Math.PI * 2; return <ellipse key={i} cx={x + Math.cos(a) * 3} cy={y - 16 + Math.sin(a) * 3} rx={2.4} ry={1.3} transform={`rotate(${(a * 180) / Math.PI} ${x + Math.cos(a) * 3} ${y - 16 + Math.sin(a) * 3})`} fill={i % 2 ? fl : lerpHex("#3A5AA0", pal.wall, 0.2)} />; })}
      <circle cx={x} cy={y - 16} r={1.8} fill={lerpHex("#E8B840", pal.glow, 0.3)} />
    </g>
  );
};
const Astro: React.FC<{ x: number; y: number; pal: Pal; t: number; id: string }> = ({ x, y, pal, t, id }) => {
  const b = lerpHex("#3A5AA0", pal.wall, 0.2), sun = lerpHex("#E8B840", pal.glow, 0.3), R = 19;
  return (
    <g>
      <circle cx={x} cy={y} r={R} fill={lerpHex(b, "#F0E2B8", 0.75)} stroke={pal.ink} strokeWidth={0.4} />
      <circle cx={x} cy={y} r={R * 0.72} fill="none" stroke={pal.ink} strokeWidth={0.3} />
      {[...Array(12)].map((_, i) => { const a = (i / 12) * Math.PI * 2 + t * 0.002; return (
        <g key={i}>
          <path d={`M${x + Math.cos(a) * R * 0.72} ${y + Math.sin(a) * R * 0.72} L${x + Math.cos(a) * R} ${y + Math.sin(a) * R}`} stroke={pal.ink} strokeWidth={0.25} />
          <path d={`M${x + Math.cos(a + 0.26) * R * 0.86 + 1} ${y + Math.sin(a + 0.26) * R * 0.86} l-1 -1.2 l-1 1.2 l1 1.2 Z`} fill={i % 3 ? b : sun} />
        </g>); })}
      <circle cx={x} cy={y} r={R * 0.72} fill={lerpHex(b, pal.ink, 0.1)} opacity={0.5} />
      {[...Array(10)].map((_, i) => <circle key={i} cx={x + Math.cos(i * 2.4) * R * (0.3 + hash(i) * 0.35)} cy={y + Math.sin(i * 2.4) * R * (0.3 + hash(i) * 0.35)} r={0.6} fill="#FFF6D8" />)}
      <Halo id={`${id}s`} cx={x} cy={y} r={9} color={sun} a={0.6} />
      <circle cx={x} cy={y} r={4.4} fill={sun} stroke={dark(sun, pal, 0.4)} strokeWidth={0.3} />
      <path d={`M${x - 1.6} ${y - 0.8} l0.8 0 M${x + 0.8} ${y - 0.8} l0.8 0 M${x - 1.4} ${y + 1.4} q1.4 1 2.8 0`} stroke={dark(sun, pal, 0.6)} strokeWidth={0.35} />
    </g>
  );
};
const Banos: React.FC<{ x: number; y: number; pal: Pal; t: number }> = ({ x, y, pal, t }) => {
  const water = lerpHex("#4FA07A", pal.wall, 0.15), tube = lerpHex("#3A6AB0", pal.wall, 0.15), sk = lerpHex(pal.skin, "#F2D0B0", 0.3);
  const pools: [number, number, number][] = [[x - 10, y - 8, 9], [x + 11, y + 2, 9], [x - 6, y + 14, 10]];
  return (
    <g>
      {/* tubos que unen las piscinas */}
      <path d={`M${x - 10} ${y - 13} q4 -10 18 -6 q6 2 4 9 M${x + 14} ${y + 6} q4 10 -10 13 M${x - 14} ${y - 4} q-6 10 2 15`} stroke={tube} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d={`M${x - 10} ${y - 13} q4 -10 18 -6 q6 2 4 9 M${x + 14} ${y + 6} q4 10 -10 13 M${x - 14} ${y - 4} q-6 10 2 15`} stroke={lite(tube, pal, 0.4)} strokeWidth={0.6} fill="none" strokeDasharray="1 2" strokeDashoffset={-t * 0.2} />
      {pools.map(([px, py, w], i) => (
        <g key={i}>
          {/* mujeres de pie en el agua, en silueta, sin detalle */}
          {[-1, 1].map((sd) => { const fx = px + sd * w * 0.35, bob = Math.sin(t * 0.05 + i * 2 + sd) * 0.3; return (
            <g key={sd} transform={`translate(0 ${bob})`}>
              <circle cx={fx} cy={py - 4.4} r={1.4} fill={sk} />
              <path d={`M${fx} ${py - 3.2} q-1.3 0.4 -1.4 3 L${fx + 1.4} ${py - 0.2} q-0.1 -2.6 -1.4 -3 Z`} fill={sk} />
              <path d={`M${fx - 1.6} ${py - 5.4} q1.6 -1 3.2 0`} stroke={dark(pal.ink, pal, 0)} strokeWidth={0.5} fill="none" />
            </g>); })}
          <path d={`M${px - w * 0.6} ${py - 1} q${w * 0.6} 2 ${w * 1.2} 0 l-${w * 0.15} ${w * 0.4} q-${w * 0.45} 1.4 -${w * 0.9} 0 Z`} fill={water} stroke={pal.ink} strokeWidth={0.3} />
          <path d={`M${px - w * 0.45} ${py + 0.4} q${w * 0.2} -0.6 ${w * 0.4} 0 q${w * 0.2} 0.6 ${w * 0.4} 0`} stroke={lite(water, pal, 0.5)} strokeWidth={0.3} fill="none" />
        </g>
      ))}
    </g>
  );
};

export const ManuscritoVoynich: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `mv${seed}`, cerr = opt(opts, "cerrado", false);
  const o = clamp01((cerr ? (p.open ?? 0) : 1) - (p.close ?? 0)), fl = p.flip ?? 0, fz = fl > 0 && fl < 1;
  const page = String(fl >= 0.5 ? opt(opts, "pagina2", opt(opts, "pagina", "plantas")) : opt(opts, "pagina", "plantas"));
  const wr = p.write === undefined ? 1 : clamp01(p.write), gl = p.glow ?? 0, glowing = gl > 0 && gl < 1 ? Math.sin(gl * Math.PI) : 0;
  const vel = lerpHex("#E6D3A3", pal.wallLit, 0.15), leather = lerpHex("#6A4426", pal.rock, 0.3);
  const ink = lerpHex(lerpHex("#5A3A22", pal.ink, 0.3), "#FFD870", glowing * 0.8);
  const w = lerp(22, 46, o), L = 50 - w, R = 50 + w;
  return (
    <g>
      <Grad id={`${id}p`} h a={dark(vel, pal, 0.14)} mid={lite(vel, pal, 0.15)} b={dark(vel, pal, 0.25)} at={0.45} />
      <Grad id={`${id}q`} h a={dark(vel, pal, 0.25)} mid={lite(vel, pal, 0.15)} b={dark(vel, pal, 0.12)} at={0.55} />
      <Vol id={`${id}c`} c={leather} pal={pal} k={1} />
      <Halo id={`${id}h`} cx={50} cy={35} r={52} color={pal.glow} a={0.22 + glowing * 0.3} />
      <ContactShadow id={`${id}s`} cx={50} cy={64} rx={w + 2} a={0.35} />
      {/* tapas */}
      <rect x={L - 2} y={6} width={(R - L) + 4} height={56} rx={2} fill={url(`${id}c`)} />
      {o < 0.35 ? (
        <g opacity={1 - o / 0.35}>
          <rect x={L} y={8} width={R - L} height={52} rx={1.5} fill={url(`${id}c`)} stroke={dark(leather, pal, 0.4)} strokeWidth={0.6} />
          <rect x={L + 4} y={12} width={R - L - 8} height={44} rx={1} fill="none" stroke={lite(leather, pal, 0.25)} strokeWidth={0.5} />
          <path d={`M50 22 L58 34 L50 46 L42 34 Z M50 27 L54.5 34 L50 41 L45.5 34 Z`} stroke={lite(leather, pal, 0.35)} strokeWidth={0.6} fill="none" />
          {[[L + 3, 11], [R - 3, 11], [L + 3, 57], [R - 3, 57]].map(([x, y], i) => <path key={i} d={`M${x - 2.4} ${y} L${x} ${y - 2.4} L${x + 2.4} ${y} L${x} ${y + 2.4} Z`} fill={lerpHex("#C8A050", pal.ink, 0.25)} />)}
          <rect x={R - 3} y={30} width={5} height={8} rx={1} fill={dark(leather, pal, 0.2)} /><circle cx={R} cy={34} r={1} fill={lerpHex("#C8A050", pal.ink, 0.2)} />
          <rect x={L - 1} y={8} width={3} height={52} fill={dark(leather, pal, 0.3)} />
        </g>
      ) : null}
      {/* páginas */}
      <g opacity={clamp01((o - 0.25) / 0.5)}>
        <path d={`M${L} 9 Q${(L + 50) / 2} 6 50 10 L50 60 Q${(L + 50) / 2} 57 ${L} 59 Z`} fill={url(`${id}p`)} />
        <path d={`M50 10 Q${(R + 50) / 2} 6 ${R} 9 L${R} 59 Q${(R + 50) / 2} 57 50 60 Z`} fill={url(`${id}q`)} />
        <path d="M50 10 L50 60" stroke={dark(vel, pal, 0.4)} strokeWidth={0.6} />
        {[...Array(5)].map((_, i) => <path key={i} d={`M${L - 0.6 - i * 0.3} ${10 + i * 0.3} L${L - 0.6 - i * 0.3} ${59 - i * 0.3}`} stroke={dark(vel, pal, 0.2 + i * 0.05)} strokeWidth={0.3} />)}
        {/* manchas de la vitela */}
        {[...Array(6)].map((_, i) => <ellipse key={i} cx={L + 4 + hash(seed + i) * (R - L - 8)} cy={14 + hash(seed + i * 5) * 40} rx={2 + hash(i) * 3} ry={1.4 + hash(i + 2) * 2} fill={dark(vel, pal, 0.3)} opacity={0.12} />)}
        <Glyphs x={L + 4} y={15} w={50 - L - 7} rows={12} lh={3.6} s={2.1} seed={seed + 3} reveal={wr} color={ink} sw={0.32 + glowing * 0.1} />
        <g transform={`translate(${(R + 50) / 2 - 50} 0)`}>
          {page === "texto" ? <Glyphs x={53 - ((R + 50) / 2 - 50)} y={15} w={R - 57} rows={12} lh={3.6} s={2.1} seed={seed + 9} reveal={wr} color={ink} sw={0.32 + glowing * 0.1} />
            : page === "astro" ? <Astro x={50} y={33} pal={pal} t={t} id={id} />
              : page === "banos" ? <Banos x={50} y={30} pal={pal} t={t} />
                : <Planta x={50} y={28} pal={pal} id={id} />}
          {page !== "texto" ? <Glyphs x={32} y={52} w={34} rows={2} lh={3.2} s={1.9} seed={seed + 17} reveal={wr} color={ink} sw={0.3 + glowing * 0.1} /> : null}
        </g>
        {glowing > 0 ? <Halo id={`${id}g`} cx={30} cy={35} r={30} color="#FFD870" a={0.35 * glowing} /> : null}
        {/* hoja que pasa */}
        {fz ? (() => { const a = fl * Math.PI, x2 = 50 + Math.cos(a) * w, lift = Math.sin(a) * 6;
          return <path d={`M50 10 Q${(x2 + 50) / 2} ${6 - lift} ${x2} ${9 - lift} L${x2} ${59 - lift} Q${(x2 + 50) / 2} ${57 - lift} 50 60 Z`} fill={lite(vel, pal, fl < 0.5 ? 0.05 : 0.2)} stroke={dark(vel, pal, 0.35)} strokeWidth={0.3} />; })() : null}
      </g>
    </g>
  );
};
