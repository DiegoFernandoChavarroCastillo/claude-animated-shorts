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

// ---------------------------------------------------------------- pulsos_ir (control-rebote)
const IRV = "#C45CFF", IRV2 = "#E6B8FF";
/** bits del código (ver dos veces: 0x04 0xFB 0x08 0xF7, dirección, su inversa, POWER y su inversa) */
const NEC_BITS = [0x04, 0xfb, 0x08, 0xf7].flatMap((byte) => [...Array(8)].map((_, i) => (byte >> i) & 1));
const ScopePanel: React.FC<{ x: number; y: number; w: number; h: number; id: string }> = ({ x, y, w, h, id }) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141a3a" /><stop offset="1" stopColor="#0a0d22" /></linearGradient></defs>
    <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={30} fill="#2a2f4a" />
    <rect x={x} y={y} width={w} height={h} rx={18} fill={`url(#${id})`} stroke={PALETTE.mid.lavender} strokeOpacity={0.35} strokeWidth={3} />
    {[...Array(Math.floor(w / 60))].map((_, i) => <line key={`v${i}`} x1={x + 30 + i * 60} y1={y + 10} x2={x + 30 + i * 60} y2={y + h - 10} stroke="#5a7cff" strokeOpacity={0.12} strokeWidth={2} />)}
    {[...Array(Math.floor(h / 60))].map((_, i) => <line key={`h${i}`} x1={x + 10} y1={y + 30 + i * 60} x2={x + w - 10} y2={y + 30 + i * 60} stroke="#5a7cff" strokeOpacity={0.12} strokeWidth={2} />)}
  </g>
);
/** silueta de la punta del mando con su LED (mirando a la derecha) */
const RemoteTip: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => (
  <g>
    <rect x={x - 300} y={y - 70} width={320} height={140} rx={60} fill="#23262f" />
    <rect x={x - 285} y={y - 56} width={285} height={112} rx={48} fill="#30343f" />
    {[...Array(3)].map((_, i) => <rect key={i} x={x - 250 + i * 80} y={y - 24} width={50} height={48} rx={14} fill="#555b6e" />)}
    <path d={`M${x + 18} ${y - 34} A34 34 0 0 1 ${x + 18} ${y + 34} Z`} fill="#3a0a18" />
    <circle cx={x + 26} cy={y} r={60 + 30 * on} fill={IRV} opacity={0.35 * on} />
    <circle cx={x + 26} cy={y} r={20} fill={on > 0.5 ? IRV2 : "#5a1830"} />
  </g>
);

const PulsosIR: FlatComp = ({ t, u, cam, subject, pose }) => {
  const lightBg = (
    <Depth cam={cam} z={0.2}>
      <Backdrop id="pib" top="#1b1d4a" mid="#121436" bottom="#0a0b22" />
      <Glow id="pig1" cx={200} cy={880} r={520} color={IRV} a={0.22} />
      <Glow id="pig2" cx={900} cy={1200} r={520} color={PALETTE.ui.cyan} a={0.12} />
      <Stars n={60} t={t} seed={9} color={IRV2} />
    </Depth>
  );
  if (pose === "distancia") {
    const k = ease(u.alejar ?? 0), sx = 170, sy = 820, d1 = 470, d2 = 800, s1 = 110, s2 = 220;
    const ray = (yy: number, xEnd: number, op: number) => <line x1={sx} y1={sy} x2={xEnd} y2={yy} stroke={IRV} strokeWidth={4} opacity={op} />;
    return (
      <>
        {lightBg}
        <Depth cam={cam} z={0.6}>
          <path d={`M${sx} ${sy} L${d1} ${sy - s1 / 2} L${d1} ${sy + s1 / 2} Z`} fill={IRV} opacity={0.18} />
          {k > 0 ? <path d={`M${d1} ${sy - s1 / 2} L${d1 + (d2 - d1) * k} ${sy - s1 / 2 - ((s2 - s1) / 2) * k} L${d1 + (d2 - d1) * k} ${sy + s1 / 2 + ((s2 - s1) / 2) * k} L${d1} ${sy + s1 / 2} Z`} fill={IRV} opacity={0.1} /> : null}
          {ray(sy - s1 / 2, d1, 0.8)}{ray(sy + s1 / 2, d1, 0.8)}
          {k > 0 ? <>{ray(sy - s2 / 2, d1 + (d2 - d1) * k, 0.5 * k)}{ray(sy + s2 / 2, d1 + (d2 - d1) * k, 0.5 * k)}</> : null}
          <line x1={sx} y1={980} x2={d1} y2={980} stroke={PALETTE.light.cream} strokeWidth={4} opacity={0.7} />
          <text x={(sx + d1) / 2} y={1030} textAnchor="middle" fontSize={56} fontWeight={800} fill={PALETTE.light.cream}>d</text>
          <g opacity={k}>
            <line x1={sx} y1={1060} x2={d2} y2={1060} stroke={PALETTE.ui.cyan} strokeWidth={4} opacity={0.8} />
            <text x={(sx + d2) / 2} y={1115} textAnchor="middle" fontSize={56} fontWeight={800} fill={PALETTE.ui.cyan}>2d</text>
          </g>
        </Depth>
        <Subject cam={cam} pose={subject} at={[620, 820]}>
          <rect x={d1 - 8} y={sy - s1 / 2} width={16} height={s1} fill={IRV2} opacity={0.95} />
          <rect x={d1 + 8} y={sy - s1 / 2} width={s1 * 0.5} height={s1} fill={IRV} opacity={0.75 * (1 - 0.6 * k)} />
          <g opacity={k}>
            {[0, 1].map((i) => [0, 1].map((j) => (
              <rect key={`${i}${j}`} x={d2 + 6 + i * (s2 * 0.25)} y={sy - s2 / 2 + j * (s2 / 2) + 3} width={s2 * 0.25 - 6} height={s2 / 2 - 6} fill={IRV} opacity={0.3} stroke={IRV2} strokeWidth={3} />
            )))}
            <text x={d2 + s2 * 0.25} y={sy - s2 / 2 - 24} textAnchor="middle" fontSize={64} fontWeight={800} fill={IRV2}>¼</text>
          </g>
          <circle cx={sx} cy={sy} r={70} fill={IRV} opacity={0.35} />
          <circle cx={sx} cy={sy} r={26} fill={IRV2} />
        </Subject>
        <Grain />
      </>
    );
  }
  if (pose === "trama") {
    const w = ease(u.trama ?? 0), x0 = 170, X = 740, unit = 9.6;
    // fila 1: cabecera (16 u de ráfaga + 8 de silencio) y 16 bits; fila 2: los otros 16
    const row = (bits: number[], lead: boolean, y: number, reveal: number) => {
      const els: React.ReactNode[] = []; let x = x0;
      if (lead) { els.push(<rect key="ld" x={x} y={y - 90} width={16 * unit} height={90} rx={4} fill={IRV} />); els.push(<text key="lt" x={x + 8 * unit} y={y - 110} textAnchor="middle" fontSize={44} fontWeight={800} fill={IRV2}>9 ms</text>); x += 24 * unit; }
      bits.forEach((bit, i) => {
        if ((x - x0) / X > reveal) return;
        els.push(<rect key={`b${i}`} x={x} y={y - 90} width={unit} height={90} rx={2} fill={IRV} />);
        els.push(<text key={`t${i}`} x={x + (bit ? 2 * unit : unit)} y={y + 50} textAnchor="middle" fontSize={34} fontWeight={700} fill={bit ? PALETTE.ui.cyan : PALETTE.light.cream} opacity={0.9}>{bit}</text>);
        x += unit * (bit ? 4 : 2);
      });
      return <g>{els}<line x1={x0 - 20} y1={y} x2={x0 + X + 20} y2={y} stroke={PALETTE.mid.lavender} strokeWidth={3} opacity={0.6} /></g>;
    };
    return (
      <>
        {lightBg}
        <Depth cam={cam} z={0.6}><ScopePanel x={130} y={560} w={820} h={560} id="pit" /></Depth>
        <Subject cam={cam} pose={subject} at={[540, 840]}>
          {row(NEC_BITS.slice(0, 16), true, 790, clamp01(w * 2))}
          {row(NEC_BITS.slice(16), false, 1020, clamp01(w * 2 - 1))}
        </Subject>
        <Grain />
      </>
    );
  }
  // ráfagas: el LED parpadea; arriba la envolvente (ráfagas largas y cortas), abajo una ráfaga ampliada con sus dientes
  const p = ease(u.parpadear ?? 0), scroll = (t * 6 * p) % 120, on = p * (Math.floor(t / 2) % 2 ? 1 : 0.4);
  const env = [3, 1, 1, 1, 3, 1, 1, 3, 1, 1, 1, 1, 3];
  let ex = 450 - scroll; const envEls: React.ReactNode[] = [];
  env.forEach((len, i) => { const wdt = len === 3 ? 70 : 24; if (ex > 420 && ex + wdt < 915) envEls.push(<rect key={i} x={ex} y={620} width={wdt} height={110} rx={3} fill={IRV} opacity={0.4 + 0.6 * p} />); ex += wdt + (i % 3 === 2 ? 60 : 30); });
  return (
    <>
      {lightBg}
      <Depth cam={cam} z={0.6}>
        <ScopePanel x={410} y={560} w={520} h={540} id="pir" />
        <path d="M500 730 L430 860 M570 730 L920 860" stroke={IRV2} strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />
      </Depth>
      <Subject cam={cam} pose={subject} at={[540, 960]}>
        <RemoteTip x={330} y={830} on={on} />
        <line x1={425} y1={750} x2={915} y2={750} stroke={PALETTE.mid.lavender} strokeWidth={2} opacity={0.6} />
        {envEls}
        {[...Array(26)].map((_, i) => <rect key={i} x={440 + i * 18} y={900} width={10} height={140} rx={2} fill={IRV} opacity={(0.5 + 0.5 * p) * (0.6 + 0.4 * Math.abs(Math.sin(t * 0.4 + i * 0.5)))} />)}
        <line x1={425} y1={1040} x2={915} y2={1040} stroke={PALETTE.mid.lavender} strokeWidth={2} opacity={0.6} />
      </Subject>
      <Grain />
    </>
  );
};

export const pulsos_ir: HeroDef = {
  kind: "plano",
  when: "Esquemas 2D de la señal del control remoto: la punta del mando con un osciloscopio que muestra las ráfagas y, ampliada, la portadora de 38 kHz (rafagas); la trama del código con la cabecera de 9 ms y 32 unos y ceros (trama); la ley del inverso del cuadrado, al doble de distancia la luz se reparte en cuatro cuadros (distancia).",
  poses: ["rafagas", "trama", "distancia"],
  actions: {
    parpadear: "El LED parpadea y las ráfagas avanzan por la pantalla, con los dientes de la portadora latiendo: parpadea, ráfagas, treinta y ocho mil veces.",
    trama: "La trama se dibuja de izquierda a derecha: la ráfaga larga de cabecera y luego los 32 bits con su 0 o 1 debajo: mensaje, código, unos y ceros, bits.",
    alejar: "La luz sigue hasta el doble de distancia y el mismo haz se reparte en cuatro cuadros más tenues (¼): distancia, al doble de lejos, se debilita, cuarta parte.",
  },
  center: [0, 1, 0], radius: 1.5,
  anchors: { hero: [600, 860, 1], top: [600, 580, 1], base: [600, 1120, 1], led: [276, 830, 1], pantalla: [700, 960, 0.6], fuente: [150, 930, 1], lejos: [880, 930, 1] },
  build: (_L, pose) => { poseOf(pulsos_ir, pose, "pulsos_ir"); return noBuild(); },
  flat: PulsosIR,
};

// ---------------------------------------------------------------- mapa_vecindario (mudanza-planeta)
// mapa del vecindario estelar con el Sol abajo y anillos de distancia (no a escala lineal): «casas» en Próxima b, Teegarden b y TRAPPIST-1;
// con «lejos» todo se encoge hacia el Sol y aparece, muy arriba, Kepler-452b a 1.400 años luz
const SUN: [number, number] = [540, 1260];
const RINGS = [{ r: 170, t: "4,2 AL" }, { r: 330, t: "12,5 AL" }, { r: 520, t: "40 AL" }];
const HOMES = [
  { ring: 0, a: -62, name: "PRÓXIMA b", c: "#C96A48" },
  { ring: 1, a: -128, name: "TEEGARDEN b", c: "#3F8FC8" },
  { ring: 2, a: -78, name: "TRAPPIST-1", c: "#5FB89A" },
];
const House: React.FC<{ x: number; y: number; s: number; c: string; on: number }> = ({ x, y, s, c, on }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={on}>
    <circle cx={0} cy={0} r={40} fill={c} />
    <circle cx={0} cy={0} r={40} fill="url(#mvsh)" />
    <circle cx={0} cy={0} r={56 + 6 * on} fill="none" stroke={PALETTE.light.cream} strokeWidth={3} opacity={0.35} />
    <path d="M-30 -62 L0 -92 L30 -62 Z" fill={PALETTE.ui.red} />
    <rect x={-22} y={-64} width={44} height={30} fill={PALETTE.light.cream} />
    <rect x={-6} y={-52} width={12} height={18} fill={PALETTE.warm.brown} />
    <line x1={0} y1={-34} x2={0} y2={-40} stroke={PALETTE.light.cream} strokeWidth={4} />
  </g>
);
const MapaVecindario: FlatComp = ({ t, u, cam, subject }) => {
  const casas = u.casas ?? 1, far = ease(u.lejos ?? 0), k = 1 - 0.72 * far;
  const pos = (ring: number, a: number): [number, number] => { const r = RINGS[ring].r * k, rad = (a * Math.PI) / 180; return [SUN[0] + Math.cos(rad) * r, SUN[1] + Math.sin(rad) * r]; };
  const fy = 690 - 40 * (1 - far);
  return (
    <>
      <Depth cam={cam} z={0.15}>
        <Backdrop id="mvb" top="#2A3478" mid="#232A62" bottom="#1A1E48" />
        <Stars n={190} t={t} seed={8} />
        <Glow id="mvn1" cx={300} cy={760} r={540} color={PALETTE.mid.violet} a={0.35} />
        <Glow id="mvn2" cx={820} cy={1180} r={460} color={PALETTE.ui.cyan} a={0.2} />
      </Depth>
      <defs><radialGradient id="mvsh" cx="0.32" cy="0.3" r="0.85"><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#05061A" stopOpacity={0.8} /></radialGradient></defs>
      <Subject cam={cam} pose={subject} at={[540, 960]}>
        {RINGS.map((rg, i) => (
          <g key={i}>
            <circle cx={SUN[0]} cy={SUN[1]} r={rg.r * k} fill="none" stroke={PALETTE.mid.lavender} strokeWidth={3} strokeDasharray="10 14" opacity={0.45} />
            <text x={SUN[0] + rg.r * k * 0.74 + 12} y={SUN[1] - rg.r * k * 0.66} fill={PALETTE.mid.lavender} fontSize={34 - 12 * far} fontWeight={700} fontFamily="sans-serif" opacity={0.85}>{rg.t}</text>
          </g>
        ))}
        <Glow id="mvsun" cx={SUN[0]} cy={SUN[1]} r={120} color={PALETTE.warm.gold} a={0.85} />
        <circle cx={SUN[0]} cy={SUN[1]} r={34} fill="#FFD27A" />
        <text x={SUN[0]} y={SUN[1] + 84} textAnchor="middle" fill={PALETTE.warm.gold} fontSize={38} fontWeight={800} fontFamily="sans-serif">SOL</text>
        {HOMES.map((h, i) => {
          const [x, y] = pos(h.ring, h.a), on = ease(clamp01(casas * 3.2 - i)), s = (0.6 + 0.4 * on) * (1 - 0.45 * far);
          return (
            <g key={i}>
              <line x1={SUN[0]} y1={SUN[1]} x2={x} y2={y} stroke={h.c} strokeWidth={3} opacity={0.4 * on} />
              <House x={x} y={y + 2 * Math.sin(t * 0.05 + i)} s={s} c={h.c} on={on} />
              <text x={x} y={y + 76 * s} textAnchor="middle" fill={PALETTE.light.cream} fontSize={32 * (1 - 0.4 * far)} fontWeight={800} fontFamily="sans-serif" opacity={on}>{h.name}</text>
            </g>
          );
        })}
        {far > 0 ? (
          <g opacity={far}>
            <path d={`M${SUN[0]} ${SUN[1]} L${SUN[0]} ${fy + 60}`} stroke={PALETTE.warm.gold} strokeWidth={4} {...draw(far)} />
            <Glow id="mvk" cx={SUN[0]} cy={fy} r={110} color={PALETTE.warm.gold} a={0.5} />
            <House x={SUN[0]} y={fy} s={1.1} c="#5F9FD0" on={1} />
            <text x={SUN[0]} y={fy - 128} textAnchor="middle" fill={PALETTE.warm.gold} fontSize={40} fontWeight={900} fontFamily="sans-serif">KEPLER-452b</text>
            <text x={SUN[0] + 120} y={(fy + SUN[1]) / 2} fill={PALETTE.warm.gold} fontSize={44} fontWeight={900} fontFamily="sans-serif">1.400 AL</text>
          </g>
        ) : null}
      </Subject>
      <Grain n={600} />
    </>
  );
};

export const mapa_vecindario: HeroDef = {
  kind: "plano",
  when: "Mapa del vecindario estelar con el Sol abajo, anillos de distancia en años luz y casitas en los planetas candidatos (Próxima b, Teegarden b, TRAPPIST-1); al alejar, aparece muy lejos Kepler-452b a 1.400 años luz: casas disponibles en el espacio, a qué distancia están las estrellas, mudarse a otro planeta, lo lejos que está.",
  poses: ["mapa"],
  actions: {
    casas: "Las casitas aparecen una tras otra sobre cada planeta del mapa: las casas disponibles, te enseño, el catálogo.",
    lejos: "El mapa se encoge hacia el Sol y una línea dorada sube hasta un planeta muy lejano con su distancia: el problema, está lejísimos, mil cuatrocientos años luz.",
  },
  center: [0, 1, 0], radius: 1.5,
  anchors: { hero: [540, 960, 1], top: [540, 640, 1], base: [540, 1340, 1], sol: [540, 1260, 1], lejos: [540, 690, 1] },
  build: (_L, pose) => { poseOf(mapa_vecindario, pose, "mapa_vecindario"); return noBuild(); },
  flat: MapaVecindario,
};
