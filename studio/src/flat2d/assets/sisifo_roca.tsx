// sisifo_roca · personaje: Sísifo (o cualquiera, con opts.ropa moderna) empuja con el hombro y las manos una roca enorme cuesta arriba, hacia la
// derecha. Lienzo 100×100, anclaje en los pies (50, 96). opts: `pendiente` grados de la ladera (0; sube hacia la derecha), `suelo` true = pinta su
// propio trozo de ladera (planos cercanos), `roca` false = sin roca (de pie o caminando), `ropa` griega | moderna, `mira` 1 | -1 (sin roca: hacia
// dónde mira), `sonrisa` 0..1. Respira siempre. Acciones propias: `push` empuja mientras dura (pasos, tensión, la roca gira un poco); `smile` sonríe
// (se queda); `sweat` gotas de sudor mientras dura; `lose` la roca se le escapa y rueda ladera abajo hasta salir (se queda sin roca); `walk` camina
// erguido mientras dura (muévelo con slide); `drop` la roca cae del cielo a su lado y rebota (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Vol, dark, lite, url } from "./shade";

const ROPA_MODERNA = ["#3A5A8A", "#8A3A3A", "#3A7A5A", "#5A4A7A", "#7A6A3A", "#2E6E8E"];

export const SisifoRoca: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `sr${seed}`, I = idle(t, seed);
  const pend = opt(opts, "pendiente", 0), suelo = opt(opts, "suelo", false), moderna = opt(opts, "ropa", "griega") === "moderna";
  const ps = p.push ?? 0, pushing = ps > 0 && ps < 1, sm = Math.max(opt(opts, "sonrisa", 0), p.smile ?? 0), sw = p.sweat ?? 0;
  const lo = p.lose ?? 0, wk = p.walk ?? 0, walking = wk > 0 && wk < 1, dr = p.drop ?? 0;
  const conRoca = opt(opts, "roca", true) ? lo < 1 : dr > 0;
  const empuja = opt(opts, "roca", true) && lo < 0.15;   // postura de empujar
  const mira = empuja ? 1 : opt(opts, "mira", 1) >= 0 ? 1 : -1;
  const skin = pal.skin, hair = lerpHex(pal.ink, pal.rock, 0.25);
  const cloth = moderna ? ROPA_MODERNA[Math.floor(hash(seed * 3.1) * ROPA_MODERNA.length)] : lerpHex("#EDE4D0", pal.wallLit, 0.2);
  const pants = moderna ? lerpHex("#3A3A44", pal.ink, 0.2) : skin;
  const rockC = lerpHex(lerpHex(pal.rock, "#6E665E", 0.55), pal.ink, 0.12);
  // ciclo de pasos (empujar o caminar)
  const cyc = pushing ? t * 0.12 : walking ? t * 0.2 : 0, st = Math.sin(cyc), by = I.breath * 0.5 + (pushing ? Math.abs(st) * 0.8 : 0);
  // roca: en su sitio delante; al perderla rueda ladera abajo (a la izquierda) por detrás de él; al caer del cielo rebota
  const rx0 = 70, ry0 = 70, R = 26;
  const rollK = clamp01((lo - 0.1) / 0.9), lift = lo > 0 && lo < 0.1 ? Math.sin((lo / 0.1) * Math.PI) * 2 : 0;
  const dropK = clamp01(dr / 0.6), bounce = dr > 0.6 ? Math.abs(Math.sin(((dr - 0.6) / 0.4) * Math.PI * 2)) * 6 * (1 - (dr - 0.6) / 0.4) : 0;
  const rx = opt(opts, "roca", true) ? rx0 - rollK * rollK * 260 : rx0, ry = opt(opts, "roca", true) ? ry0 - lift + rollK * rollK * 30 - Math.abs(Math.sin(rollK * 9)) * 6 * rollK : ry0 - (1 - dropK * dropK) * 260 - bounce;
  const rrot = (pushing ? ps * 30 : 0) - rollK * 720 + (ps >= 1 ? 30 : 0);
  // postura: empujando (inclinado, hombro contra la roca) o de pie
  const lean = empuja ? 1 : clamp01(1 - lo * 3);
  const hip = { x: lerp(48, 30, lean), y: lerp(64, 72, lean) + by }, sh = { x: lerp(50, 42, lean), y: lerp(36, 52, lean) + by };
  const head = { x: lerp(52, 47, lean), y: lerp(25, 44, lean) + by };
  const fB = { x: lerp(44, 8, lean) + (pushing || walking ? st * 5 : 0), y: 96 }, fF = { x: lerp(56, 28, lean) - (pushing || walking ? st * 5 : 0), y: 96 };
  const kB = { x: (hip.x + fB.x) / 2 - lerp(0, 2, lean), y: (hip.y + 96) / 2 + lerp(0, 2, lean) }, kF = { x: (hip.x + fF.x) / 2 + lerp(2, 6, lean), y: (hip.y + 96) / 2 - lerp(0, 4, lean) };
  const hand1 = empuja ? { x: 50, y: 54 + by } : lo > 0 && lo < 1 ? { x: lerp(50, 60, clamp01(lo * 3)), y: lerp(54, 30, clamp01(lo * 3)) } : { x: 44 + (walking ? -st * 4 : 0), y: 60 + by };
  const hand2 = empuja ? { x: 45, y: 66 + by } : lo > 0 && lo < 1 ? { x: lerp(45, 62, clamp01(lo * 3)), y: lerp(66, 36, clamp01(lo * 3)) } : { x: 58 + (walking ? st * 4 : 0), y: 62 + by };
  const limb = (a: { x: number; y: number }, k: { x: number; y: number }, b: { x: number; y: number }, c: string, w: number) =>
    <path d={`M${a.x} ${a.y} Q${k.x} ${k.y} ${b.x} ${b.y}`} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  const elbow = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2 - 3, y: (a.y + b.y) / 2 + 4 });
  const upright = empuja ? 0 : pend * clamp01(lo * 2 + (opt(opts, "roca", true) ? 0 : 1));   // de pie, el cuerpo se endereza contra la pendiente
  const sweatDrops = sw > 0 && sw < 1 ? [...Array(4)].map((_, i) => { const k = ((t * 0.05 + i * 0.27) % 1); return { x: head.x - 4 + i * 2.2, y: head.y + 2 + k * 30, o: 1 - k }; }) : [];
  const Rock = conRoca ? (
    <g transform={`translate(${rx} ${ry}) rotate(${rrot})`}>
      <path d={`M${-R} 3 Q${-R} ${-R * 0.85} ${-4} ${-R} Q${R * 0.8} ${-R * 1.02} ${R} ${-4} Q${R * 1.04} ${R * 0.7} ${4} ${R} Q${-R * 0.9} ${R * 0.98} ${-R} 3 Z`} fill={url(`${id}r`)} stroke={dark(rockC, pal, 0.55)} strokeWidth={1.2} />
      <path d={`M${-R * 0.85} ${-R * 0.1} l7 2.5 l3 -4 M${R * 0.15} ${R * 0.45} l7 -2 l2 5 M${-R * 0.35} ${R * 0.75} l-5 -3 M${R * 0.55} ${-R * 0.5} l4 5`} stroke={dark(rockC, pal, 0.5)} strokeWidth={0.9} fill="none" />
      <path d={`M${-R * 0.95} ${R * 0.1} Q${-R * 0.4} ${R * 1.05} ${R * 0.6} ${R * 0.75}`} stroke={dark(rockC, pal, 0.35)} strokeWidth={4} fill="none" opacity={0.45} />
      <path d={`M${-R * 0.6} ${-R * 0.72} Q0 ${-R * 1.02} ${R * 0.72} ${-R * 0.55}`} stroke={lite(rockC, pal, 0.5)} strokeWidth={1.4} fill="none" opacity={0.8} />
      {[...Array(6)].map((_, i) => <circle key={i} cx={(hash(i + seed) - 0.5) * R * 1.4} cy={(hash(i * 3 + seed) - 0.5) * R * 1.4} r={0.8 + hash(i * 7) * 1.2} fill={dark(rockC, pal, 0.3)} opacity={0.6} />)}
    </g>
  ) : null;
  return (
    <g transform={`rotate(${-pend} 50 96)`}>
      <Vol id={`${id}r`} c={rockC} pal={pal} /><Vol id={`${id}k`} c={skin} pal={pal} k={0.7} /><Vol id={`${id}c`} c={cloth} pal={pal} />
      {suelo ? <g><Grad id={`${id}g`} a={lerpHex(pal.rock, pal.wallLit, 0.15)} b={dark(pal.rock, pal, 0.55)} />
        <path d="M-160 96 L260 96 L260 220 L-160 220 Z" fill={url(`${id}g`)} />
        <path d="M-160 96.5 L260 96.5" stroke={pal.rim} strokeWidth={1} opacity={0.6} />
        {[...Array(14)].map((_, i) => <ellipse key={i} cx={-150 + i * 30 + hash(i) * 12} cy={99 + hash(i + 5) * 8} rx={1.5 + hash(i + 9) * 3} ry={1 + hash(i + 3)} fill={dark(pal.rock, pal, 0.4)} opacity={0.7} />)}
      </g> : null}
      <ContactShadow id={`${id}s`} cx={empuja ? 48 : 50} cy={96.5} rx={empuja ? 42 : 16} />
      {Rock}
      <g transform={`rotate(${upright} 50 96)`}>
        <g transform={mira < 0 ? "translate(100 0) scale(-1 1)" : undefined}>
          {/* pierna de atrás, brazo de atrás */}
          {limb(hip, kB, fB, dark(pants, pal, 0.25), moderna ? 6.5 : 5.5)}
          <ellipse cx={fB.x - 1} cy={96} rx={3.4} ry={1.5} fill={dark(moderna ? "#2A2A2A" : skin, pal, 0.35)} />
          {limb({ x: sh.x - 2, y: sh.y + 2 }, elbow({ x: sh.x - 2, y: sh.y + 2 }, hand2), hand2, dark(moderna ? cloth : skin, pal, 0.25), 4.6)}
          {/* torso */}
          <path d={`M${hip.x - 6} ${hip.y + 2} Q${(hip.x + sh.x) / 2 - 8} ${(hip.y + sh.y) / 2} ${sh.x - 6} ${sh.y - 1} L${sh.x + 5} ${sh.y + 2} Q${(hip.x + sh.x) / 2 + 6} ${(hip.y + sh.y) / 2 + 4} ${hip.x + 6} ${hip.y + 2} Z`} fill={url(`${id}c`)} />
          {moderna ? <path d={`M${sh.x - 1} ${sh.y + 1} L${(hip.x + sh.x) / 2} ${(hip.y + sh.y) / 2 + 2}`} stroke={dark(cloth, pal, 0.4)} strokeWidth={0.8} />
            : <path d={`M${hip.x - 6} ${hip.y + 2} L${hip.x - 7} ${hip.y + 9} L${hip.x + 7} ${hip.y + 8} L${hip.x + 6} ${hip.y + 2} Z`} fill={dark(cloth, pal, 0.12)} />}
          <path d={`M${hip.x - 6} ${hip.y - 1} L${hip.x + 6} ${hip.y - 1}`} stroke={moderna ? pal.ink : dark(cloth, pal, 0.5)} strokeWidth={1.4} />
          {/* pierna de delante */}
          {limb({ x: hip.x + 1, y: hip.y + 3 }, kF, fF, pants, moderna ? 6.8 : 5.8)}
          <ellipse cx={fF.x + 1} cy={96} rx={3.6} ry={1.6} fill={dark(moderna ? "#2A2A2A" : skin, pal, 0.3)} />
          {/* cabeza: de perfil hacia la derecha */}
          <circle cx={head.x} cy={head.y} r={7.2} fill={url(`${id}k`)} />
          <path d={`M${head.x - 7.4} ${head.y + 1} Q${head.x - 8} ${head.y - 8.5} ${head.x} ${head.y - 8} Q${head.x + 7} ${head.y - 7.6} ${head.x + 6.4} ${head.y - 3} Q${head.x + 1} ${head.y - 5} ${head.x - 3} ${head.y - 3} Q${head.x - 5} ${head.y} ${head.x - 6} ${head.y + 3} Z`} fill={hair} />
          {!moderna ? [...Array(5)].map((_, i) => <circle key={i} cx={head.x - 6 + i * 2.6} cy={head.y - 7 + Math.abs(i - 2) * 0.6} r={1.6} fill={hair} />) : null}
          {!moderna ? <path d={`M${head.x - 3} ${head.y + 3} Q${head.x - 2} ${head.y + 9.5} ${head.x + 3} ${head.y + 9} Q${head.x + 7} ${head.y + 8} ${head.x + 7} ${head.y + 3.5} Q${head.x + 3} ${head.y + 5} ${head.x - 3} ${head.y + 3} Z`} fill={hair} /> : null}
          {/* ojo: apretado al empujar, abierto si no */}
          {empuja && sm < 0.5 ? <path d={`M${head.x + 2.2} ${head.y - 1} l2.4 0.4`} stroke={pal.ink} strokeWidth={0.9} strokeLinecap="round" />
            : <ellipse cx={head.x + 3.2} cy={head.y - 1} rx={0.8} ry={1 * (1 - 0.9 * I.blink)} fill={pal.ink} />}
          <path d={`M${head.x + 1.6} ${head.y - 3.4} L${head.x + 5} ${head.y - 3.2 + (empuja && sm < 0.5 ? 0.8 : 0)}`} stroke={hair} strokeWidth={0.8} strokeLinecap="round" />
          <path d={`M${head.x + 6.8} ${head.y - 0.6} L${head.x + 8.6} ${head.y + 1.8} L${head.x + 6.8} ${head.y + 2.4}`} fill={dark(skin, pal, 0.1)} />
          {/* boca: mueca de esfuerzo → sonrisa */}
          <path d={`M${head.x + 3} ${head.y + 4.2} Q${head.x + 5} ${head.y + 4.2 + lerp(-0.6, 1.6, sm)} ${head.x + 6.4} ${head.y + 3.4 - sm * 0.8}`} stroke={dark(skin, pal, 0.55)} strokeWidth={0.8} strokeLinecap="round" fill="none" />
          {sm > 0.3 ? <path d={`M${head.x + 6} ${head.y + 2.6} q0.8 0.4 0.7 1.4`} stroke={dark(skin, pal, 0.4)} strokeWidth={0.5} fill="none" opacity={sm} /> : null}
          {/* brazo de delante */}
          {limb({ x: sh.x + 2, y: sh.y + 1 }, elbow({ x: sh.x + 2, y: sh.y + 1 }, hand1), hand1, moderna ? cloth : skin, 4.8)}
          <circle cx={hand1.x} cy={hand1.y} r={2.4} fill={skin} /><circle cx={hand2.x} cy={hand2.y} r={2.3} fill={dark(skin, pal, 0.15)} />
          {/* luz de borde */}
          <path d={`M${sh.x + 5} ${sh.y + 2} Q${(hip.x + sh.x) / 2 + 6} ${(hip.y + sh.y) / 2 + 4} ${hip.x + 6} ${hip.y + 2}`} stroke={pal.rim} strokeWidth={0.8} fill="none" opacity={0.7} />
          {sweatDrops.map((d, i) => <path key={i} d={`M${d.x} ${d.y} q-1 1.8 0 2.6 q1 -0.8 0 -2.6Z`} fill="#BFE6FF" opacity={d.o * 0.9} />)}
        </g>
      </g>
      {/* polvo en los pies al empujar */}
      {pushing ? [...Array(5)].map((_, i) => { const k = (t * 0.04 + i * 0.2) % 1; return <circle key={i} cx={20 - k * 16 + i * 3} cy={95 - k * 8} r={1.5 + k * 3} fill={lite(pal.rock, pal, 0.4)} opacity={(1 - k) * 0.5} />; }) : null}
    </g>
  );
};
