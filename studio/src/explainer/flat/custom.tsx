// Ilustraciones 2D (objetos de clase "plano") creadas para videos concretos. Cada una es un HeroDef con `flat` (el componente) y
// anclas en px del lienzo 1080 x 1920 con la profundidad de su capa en z. `build` no se usa (los planos no montan three.js).
import React from "react";
import * as THREE from "three";
import type { FlatComp, HeroDef } from "../heroes/types";
import { poseOf } from "../heroes/types";
import { PALETTE } from "../style";
import { Backdrop, Depth, Glow, Grain, Person, Stars, Subject, clamp01, ease, hash } from "./kit";

/** build vacío de los planos (Explainer.tsx nunca monta su escena 3D) */
const noBuild = () => ({ root: new THREE.Group(), update: () => {}, dispose: () => {} });
/** trazo que se dibuja con u (0..1) */
const draw = (u: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp01(u) });

// ---------------------------------------------------------------- pizarra_hipotesis
const CHALK = "#E9E3C8";
const STEP = (i: number) => ({ x: 330 + i * 125, y: 1150 - i * 100 });

const PizarraHipotesis: FlatComp = ({ t, u, cam, subject }) => {
  const w = u.escribir ?? 0, fl = ease(u.filtro ?? 0), el = (k: number) => clamp01(w * 6 - k);
  const icon = (i: number, s: number) => {
    const { x, y } = STEP(i), cx = x + 62, by = y - 14, p = { stroke: CHALK, strokeWidth: 6, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...draw(s) };
    return [
      <path key={i} d={`M${cx - 34} ${by} C${cx - 40} ${by - 30} ${cx - 10} ${by - 46} ${cx + 14} ${by - 38} C${cx + 38} ${by - 30} ${cx + 40} ${by - 8} ${cx + 30} ${by} Z`} {...p} />,
      <g key={i}>{[[-18, -22, 15], [12, -30, 13], [2, -58, 11]].map(([dx, dy, r], k) => <circle key={k} cx={cx + dx} cy={by + dy} r={r} {...p} />)}</g>,
      <path key={i} d={`M${cx} ${by} L${cx} ${by - 40} M${cx} ${by - 40} m-30 -26 a30 26 0 1 0 60 0 a30 26 0 1 0 -60 0`} {...p} />,
      <path key={i} d={`M${cx} ${by} L${cx - 14} ${by - 2} M${cx} ${by} L${cx + 14} ${by - 2} M${cx} ${by} L${cx} ${by - 42} M${cx - 20} ${by - 30} L${cx + 20} ${by - 30} M${cx} ${by - 42} m-11 -12 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0`} {...p} />,
      <path key={i} d={`M${cx} ${by - 80} C${cx + 16} ${by - 60} ${cx + 16} ${by - 24} ${cx + 10} ${by - 6} L${cx - 10} ${by - 6} C${cx - 16} ${by - 24} ${cx - 16} ${by - 60} ${cx} ${by - 80} Z M${cx - 10} ${by - 14} L${cx - 22} ${by + 2} M${cx + 10} ${by - 14} L${cx + 22} ${by + 2} M${cx + 34} ${by - 84} l4 10 l10 2 l-8 7 l2 10 l-8 -5 l-8 5 l2 -10 l-8 -7 l10 -2 Z`} {...p} />,
    ][i];
  };
  const stairs = Array.from({ length: 5 }, (_, i) => { const { x, y } = STEP(i); return `${i ? "L" : "M"}${x} ${y} L${x + 125} ${y}${i < 4 ? ` L${x + 125} ${y - 100}` : ""}`; }).join(" ");
  return (
    <>
      <Depth cam={cam} z={0.25}>
        <Backdrop id="pzb" top="#26305A" bottom="#11152E" />
        {[0, 1].map((side) => <g key={side}>{[...Array(5)].map((_, r) => [...Array(7)].map((__, k) => {
          const x = (side ? 1000 : -10) + k * 13, y = 620 + r * 150, h = 90 + hash(r * 7 + k + side * 50) * 40;
          return <rect key={`${r}-${k}`} x={x} y={y + 130 - h} width={11} height={h} fill={[PALETTE.mid.violet, PALETTE.warm.brown, PALETTE.bg.indigo, PALETTE.warm.rose][(r + k + side) % 4]} opacity={0.55} />;
        }))}</g>)}
        <Glow id="pzl" cx={540} cy={560} r={620} color={PALETTE.warm.gold} a={0.18} />
      </Depth>
      <Depth cam={cam} z={0.55}>
        <rect x={84} y={584} width={912} height={662} rx={14} fill={PALETTE.warm.brown} />
        <defs><linearGradient id="pzs" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#2A4A44" /><stop offset="1" stopColor="#17302C" /></linearGradient></defs>
        <rect x={102} y={602} width={876} height={626} rx={6} fill="url(#pzs)" />
        {[...Array(9)].map((_, i) => <ellipse key={i} cx={160 + hash(i) * 760} cy={640 + hash(i + 9) * 560} rx={70 + hash(i + 3) * 80} ry={20 + hash(i + 5) * 26} fill={CHALK} opacity={0.035} />)}
        <rect x={110} y={1232} width={860} height={16} fill="#3A2A1E" />
        <rect x={620} y={1222} width={46} height={10} rx={4} fill={CHALK} /><rect x={690} y={1224} width={30} height={8} rx={4} fill={PALETTE.ui.red} opacity={0.8} />
        <path d={stairs} stroke={CHALK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" {...draw(el(0))} />
        {[0, 1, 2, 3, 4].map((i) => icon(i, el(i + 1)))}
        {fl > 0 ? (
          <g opacity={fl}>
            <rect x={796 - 30 * fl} y={640} width={60 * fl} height={540} fill={PALETTE.ui.red} opacity={0.18 + 0.06 * Math.sin(t * 0.2)} />
            <path d="M796 640 L796 1180" stroke={PALETTE.ui.red} strokeWidth={10} strokeLinecap="round" {...draw(fl)} />
            {[...Array(8)].map((_, k) => <path key={k} d={`M774 ${680 + k * 62} L818 ${652 + k * 62}`} stroke={PALETTE.ui.red} strokeWidth={5} strokeLinecap="round" opacity={clamp01(fl * 3 - 1)} />)}
            <text x={796} y={630} textAnchor="middle" fontSize={96} fontWeight={800} fill={PALETTE.ui.red} fontFamily="serif" opacity={clamp01(fl * 2 - 0.8)}>?</text>
          </g>
        ) : null}
      </Depth>
      <Subject cam={cam} pose={subject} at={[170, 1100]}>
        <Glow id="pzp" cx={190} cy={980} r={260} color={PALETTE.ui.cyan} a={0.12} />
        <Person x={175} y={1470} h={600} fill="#0A0D1C" jacket="#161C3A" hair="#05060F" rim={PALETTE.ui.cyan} arm={0.35 + 0.35 * Math.sin(Math.min(1, w) * Math.PI)} />
      </Subject>
      <Grain />
    </>
  );
};

export const pizarra_hipotesis: HeroDef = {
  kind: "plano",
  when: "Alguien propone una hipótesis o una teoría: una silueta ante una pizarra que se llena con un esquema de etapas en escalera (roca, células, planta, persona, cohete) y un muro rojo que corta el paso; propuso, hipótesis, teoría, idea, explicación posible, el Gran Filtro.",
  poses: ["pizarra"],
  actions: {
    escribir: "El esquema se dibuja con tiza paso a paso mientras la silueta señala: propuso, explicó, una respuesta posible, la idea es.",
    filtro: "Aparece un muro rojo con un «?» entre dos escalones: un filtro, un paso que casi nadie supera, una barrera, el obstáculo.",
  },
  center: [0, 1, 0], radius: 1.5,
  anchors: { hero: [560, 910, 0.55], top: [560, 640, 0.55], pizarra: [560, 910, 0.55], persona: [175, 930, 1], filtro: [796, 900, 0.55], base: [560, 1220, 0.55] },
  build: (_L, pose) => { poseOf(pizarra_hipotesis, pose, "pizarra_hipotesis"); return noBuild(); },
  flat: PizarraHipotesis,
};

// ---------------------------------------------------------------- planetas_campo
const BARREN = ["#A0603E", "#7D7A86", "#C8A774", "#777DAC", "#A9B8C8", "#8A5A4A"];
const PLANETS = Array.from({ length: 34 }, (_, i) => {
  const col = i % 6, row = Math.floor(i / 6);
  return { x: 110 + col * 172 + (hash(i * 3) - 0.5) * 90, y: 590 + row * 140 + (hash(i * 5) - 0.5) * 70, r: 18 + hash(i * 7) * 32, c: BARREN[i % BARREN.length], earth: [2, 7, 11, 15, 20, 24, 29, 32].includes(i), ring: i % 9 === 4, z: i % 3 ? 1 : 0.7 };
});

const PlanetasCampo: FlatComp = ({ t, u, cam, subject }) => {
  const r = u.resaltar ?? 0;
  const planet = (p: (typeof PLANETS)[number], i: number) => {
    const e = p.earth ? ease(clamp01(r * 1.6 - (i % 8) * 0.07)) : 0, dim = p.earth ? 1 : 1 - 0.55 * ease(r);
    const fy = 2 * Math.sin(t * 0.03 + i);
    return (
      <g key={i} opacity={dim} transform={`translate(0 ${fy})`}>
        {p.ring ? <ellipse cx={p.x} cy={p.y} rx={p.r * 1.9} ry={p.r * 0.5} fill="none" stroke={PALETTE.light.cream} strokeWidth={3} opacity={0.45} transform={`rotate(-18 ${p.x} ${p.y})`} /> : null}
        <circle cx={p.x} cy={p.y} r={p.r} fill={p.c} />
        {e > 0 ? (
          <g opacity={e}>
            <circle cx={p.x} cy={p.y} r={p.r * (1.6 + 0.25 * Math.sin(t * 0.15 + i))} fill="none" stroke={PALETTE.ui.cyan} strokeWidth={3} opacity={0.6} />
            <circle cx={p.x} cy={p.y} r={p.r} fill="#2F6FB0" />
            <path d={`M${p.x - p.r * 0.6} ${p.y - p.r * 0.2} c${p.r * 0.3} ${-p.r * 0.5} ${p.r * 0.7} ${-p.r * 0.3} ${p.r * 0.5} ${p.r * 0.1} c${-p.r * 0.2} ${p.r * 0.3} ${-p.r * 0.6} ${p.r * 0.3} ${-p.r * 0.5} ${-p.r * 0.1} Z M${p.x + p.r * 0.1} ${p.y + p.r * 0.3} c${p.r * 0.3} ${-p.r * 0.1} ${p.r * 0.5} ${p.r * 0.2} ${p.r * 0.3} ${p.r * 0.4} c${-p.r * 0.2} ${p.r * 0.1} ${-p.r * 0.4} 0 ${-p.r * 0.3} ${-p.r * 0.4} Z`} fill={PALETTE.ui.green} opacity={0.85} />
            <circle cx={p.x} cy={p.y} r={p.r * 1.02} fill="none" stroke="#9FD8FF" strokeWidth={2.5} opacity={0.8} />
          </g>
        ) : null}
        <circle cx={p.x} cy={p.y} r={p.r} fill="url(#plsh)" />
      </g>
    );
  };
  return (
    <>
      <Depth cam={cam} z={0.15}>
        <Backdrop id="plb" top="#141A44" mid="#0E1233" bottom="#0A091A" />
        <Stars n={170} t={t} seed={4} />
        <Glow id="pln1" cx={280} cy={720} r={520} color={PALETTE.mid.violet} a={0.45} />
        <Glow id="pln2" cx={860} cy={1240} r={480} color={PALETTE.warm.rose} a={0.25} />
      </Depth>
      <defs>
        <radialGradient id="plsh" cx="0.32" cy="0.3" r="0.85"><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="0.75" stopColor="#05061A" stopOpacity={0.55} /><stop offset="1" stopColor="#05061A" stopOpacity={0.85} /></radialGradient>
      </defs>
      <Depth cam={cam} z={0.7}>{PLANETS.map((p, i) => (p.z < 1 ? planet(p, i) : null))}</Depth>
      <Subject cam={cam} pose={subject} at={[540, 960]}>{PLANETS.map((p, i) => (p.z === 1 ? planet(p, i) : null))}</Subject>
      <Grain n={600} />
    </>
  );
};

export const planetas_campo: HeroDef = {
  kind: "plano",
  when: "Un campo de decenas de planetas de colores (rocosos, helados, con anillos) donde, al resaltarlos, unos pocos se vuelven azules y verdes como la Tierra: planetas parecidos a la Tierra, exoplanetas, cuántos mundos habitables, la mayoría de estrellas tiene planetas.",
  poses: ["campo"],
  actions: { resaltar: "Los planetas parecidos a la Tierra se vuelven azules y verdes con un anillo de luz y el resto se apaga: parecidos a la Tierra, habitables, como el nuestro." },
  center: [0, 1, 0], radius: 1.5,
  anchors: { hero: [540, 960, 1], top: [540, 600, 1], base: [540, 1340, 1] },
  build: (_L, pose) => { poseOf(planetas_campo, pose, "planetas_campo"); return noBuild(); },
  flat: PlanetasCampo,
};
