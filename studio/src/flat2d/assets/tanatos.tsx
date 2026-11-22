// tanatos · personaje: la Muerte griega (Tánatos): alto, con grandes alas negras, manto negro, cara pálida y pelo oscuro, que sostiene una antorcha
// apagada boca abajo. Mira a la izquierda. Lienzo 100×160, pies en (50, 154). Respira y mueve las alas siempre. Acciones propias: `enter` aparece
// desde la sombra abriendo las alas; `point` señala con el dedo a la izquierda (se queda); `chain` unas cadenas lo envuelven, suelta la antorcha y
// cae de rodillas (se queda); `struggle` tira de las cadenas mientras dura.
import React from "react";
import { type AssetFC, clamp01, idle, lerp } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Vol, dark, lite, url } from "./shade";

export const Tanatos: AssetFC = ({ pal, t, seed, p }) => {
  const id = `tn${seed}`, I = idle(t, seed), en = p.enter ?? 1, pt = p.point ?? 0, ch = p.chain ?? 0, sg = p.struggle ?? 0;
  const robe = lerpHex("#1A1820", pal.ink, 0.3), wing = lerpHex("#141218", pal.ink, 0.2), skin = lerpHex("#D8D4CC", pal.skin, 0.25), hair = "#1A1A22";
  const kneel = clamp01((ch - 0.4) / 0.6), wrap = clamp01(ch / 0.5), tug = sg > 0 && sg < 1 ? Math.sin(t * 0.5) : 0;
  const drop = kneel * 34, by = I.breath * 0.6 + drop, flap = Math.sin(t * 0.06 + seed) * 4 * (1 - kneel * 0.6) + tug * 3, spread = lerp(0.35, 1, en) * (1 - kneel * 0.35);
  const metal = lerpHex("#9A9AA4", pal.rim, 0.25);
  const wingPath = (side: number) => {
    const bx = 50 + side * 6, byy = 66 + by;
    return `M${bx} ${byy} Q${bx + side * 26 * spread} ${byy - 40 - flap} ${bx + side * 46 * spread} ${byy - 34 - flap} Q${bx + side * 40 * spread} ${byy - 18} ${bx + side * 44 * spread} ${byy - 8 + flap * 0.5}
      Q${bx + side * 30 * spread} ${byy - 4} ${bx + side * 36 * spread} ${byy + 12} Q${bx + side * 22 * spread} ${byy + 4} ${bx + side * 20 * spread} ${byy + 22} Q${bx + side * 10} ${byy + 10} ${bx} ${byy + 14} Z`;
  };
  const armTo = pt > 0 && ch < 0.3 ? { x: lerp(40, 14, pt), y: lerp(100, 78, pt) + by } : { x: 38 + tug * 2, y: 100 + by };
  return (
    <g opacity={lerp(0.15, 1, en)}>
      <Grad id={`${id}w`} a={lite(wing, pal, 0.18)} b={wing} />
      <Vol id={`${id}r`} c={robe} pal={pal} k={1.2} /><Vol id={`${id}k`} c={skin} pal={pal} k={0.6} />
      <ContactShadow id={`${id}s`} cx={50} cy={155} rx={28} />
      {/* alas */}
      <path d={wingPath(1)} fill={url(`${id}w`)} /><path d={wingPath(-1)} fill={url(`${id}w`)} opacity={0.92} />
      {[1, -1].map((s) => [...Array(4)].map((_, i) => <path key={`${s}${i}`} d={`M${50 + s * 8} ${70 + by} Q${50 + s * (18 + i * 6) * spread} ${60 + by - i * 6 - flap} ${50 + s * (30 + i * 4) * spread} ${68 + by + i * 4 - flap * 0.5}`} stroke={lite(wing, pal, 0.3)} strokeWidth={0.5} fill="none" opacity={0.6} />))}
      <path d={wingPath(1)} stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.5} />
      {/* manto: de pie o de rodillas */}
      <path d={`M38 ${60 + by} Q32 ${100 + by} ${lerp(30, 26, kneel)} ${154} L${lerp(70, 76, kneel)} 154 Q68 ${100 + by} 62 ${60 + by} Q50 ${54 + by} 38 ${60 + by} Z`} fill={url(`${id}r`)} />
      <path d={`M50 ${62 + by} Q48 ${110 + by} 46 154 M58 ${64 + by} Q60 ${110 + by} 64 154`} stroke={dark(robe, pal, 0.4)} strokeWidth={0.8} fill="none" />
      <path d={`M62 ${60 + by} Q68 ${100 + by} ${lerp(70, 76, kneel)} 154`} stroke={pal.rim} strokeWidth={0.7} fill="none" opacity={0.5} />
      {/* antorcha apagada boca abajo (la suelta al encadenarlo) */}
      <g transform={`translate(${lerp(64, 74, kneel)} ${lerp(96 + by, 150, kneel)}) rotate(${lerp(170, 100, kneel)})`}>
        <rect x={-1.4} y={-2} width={2.8} height={30} rx={1} fill={lerpHex("#5A4030", pal.ink, 0.3)} />
        <path d="M-3 -2 L3 -2 L2 -7 L-2 -7 Z" fill="#2A2A2A" /><path d="M0 -8 q-2 -3 0 -6 q2 3 0 6Z" fill="#555" opacity={0.6} />
      </g>
      {/* brazo */}
      <path d={`M42 ${66 + by} Q${(42 + armTo.x) / 2 - 4} ${(66 + armTo.y) / 2 + 6 + by * 0} ${armTo.x} ${armTo.y}`} stroke={dark(robe, pal, 0.15)} strokeWidth={6} strokeLinecap="round" fill="none" />
      <circle cx={armTo.x} cy={armTo.y} r={2.6} fill={url(`${id}k`)} />
      {pt > 0 && ch < 0.3 ? <path d={`M${armTo.x} ${armTo.y} l-4 -0.6`} stroke={skin} strokeWidth={1.2} strokeLinecap="round" /> : null}
      {/* cabeza: de tres cuartos mirando a la izquierda */}
      <rect x={46} y={50 + by} width={7} height={8} fill={dark(skin, pal, 0.15)} />
      <circle cx={49} cy={42 + by} r={10} fill={url(`${id}k`)} />
      <path d={`M38.5 ${42 + by} Q38 ${29 + by} 50 ${30 + by} Q61 ${30 + by} 60 ${44 + by} Q57 ${36 + by} 50 ${36 + by} Q44 ${36 + by} 41 ${48 + by} Z`} fill={hair} />
      <ellipse cx={44} cy={42 + by} rx={1.2} ry={1.3 * (1 - 0.9 * I.blink)} fill="#111" /><ellipse cx={51} cy={42 + by} rx={1.1} ry={1.2 * (1 - 0.9 * I.blink)} fill="#111" />
      <path d={`M42 ${38.5 + by} l4 0.6 M49.5 ${39 + by} l3.5 -0.2`} stroke={hair} strokeWidth={0.9} />
      <path d={`M44 ${48 + by + (ch > 0.4 ? 0 : 0)} Q47 ${ch > 0.4 ? 46.5 : 48.6} ${50} ${48 + by}`} stroke={dark(skin, pal, 0.5)} strokeWidth={0.7} fill="none" />
      <path d={`M40 ${44 + by} Q38 ${46 + by} 40 ${48 + by}`} stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.6} />
      {/* cadenas: espiral de eslabones que lo envuelve */}
      {wrap > 0 ? [...Array(Math.floor(64 * wrap))].map((_, i) => {
        const k = i / 64, y = 64 + by + k * 60, x = 50 + Math.sin(k * 22 + tug * 0.3) * 17, front = Math.cos(k * 22) > 0;
        return <ellipse key={i} cx={x} cy={y} rx={3} ry={1.7} transform={`rotate(${front ? 25 : -25} ${x} ${y})`} fill="none" stroke={front ? metal : dark(metal, pal, 0.5)} strokeWidth={1.7} />;
      }) : null}
      {wrap >= 1 ? <g><path d={`M30 ${130 + by * 0.2} Q10 140 -10 ${150 + tug * 2}`} stroke={metal} strokeWidth={1.2} strokeDasharray="2.4 1" fill="none" />
        <rect x={-14} y={146} width={6} height={8} rx={1} fill={dark(metal, pal, 0.3)} /></g> : null}
    </g>
  );
};
