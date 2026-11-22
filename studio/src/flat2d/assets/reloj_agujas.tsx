// reloj_agujas · prop: un reloj de pared de cocina de agujas: aro rojo, esfera blanca con los números 12, 3, 6 y 9, marcas de minutos,
// aguja de horas, minutero y segundero rojo que avanza. Lienzo 100 × 100, anclaje en el centro. opts.hora "10:10" (hora que marca).
// Acciones propias: `glitch` la IA intenta leerlo: las agujas tiemblan y giran sin sentido, la esfera se deforma y se descompone en
// franjas RGB (vuelve a la hora real al acabar); `read` un aro verde de «leído» rodea el reloj (se queda): una persona lo lee sin esfuerzo.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { Grad, Halo, Vol, ContactShadow, dark, url } from "./shade";

export const RelojAgujas: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `rj${seed}`, [hh, mm] = String(opt(opts, "hora", "10:10")).split(":").map(Number);
  const g = clamp01(p.glitch ?? 0), gk = g > 0 && g < 1 ? Math.sin(g * Math.PI) : 0, rd = clamp01(p.read ?? 0);
  const jit = (k: number) => (hash(Math.floor(t / 2) + k + seed) - 0.5) * 2;
  const hA = ((hh % 12) + mm / 60) * 30 + gk * (jit(1) * 140 + t * 9), mA = mm * 6 + gk * (jit(2) * 200 - t * 14), sA = (t * 6) % 360;
  const skew = gk * jit(3) * 14, red = "#D8262C";
  const face = (dx: number, tint?: string) => (
    <g transform={`translate(${dx} 0)`}>
      <circle cx={50} cy={50} r={40} fill={tint ?? url(`${id}f`)} opacity={tint ? 0.35 : 1} />
      {!tint && [...Array(60)].map((_, i) => {
        const a = (i * 6 * Math.PI) / 180, r0 = i % 5 ? 36.5 : 34, x = Math.sin(a), y = -Math.cos(a);
        return <line key={i} x1={50 + x * r0} y1={50 + y * r0} x2={50 + x * 38.5} y2={50 + y * 38.5} stroke={pal.ink} strokeWidth={i % 5 ? 0.5 : 1.4} />;
      })}
      {!tint && [["12", 50, 23], ["3", 79, 53.6], ["6", 50, 84], ["9", 21, 53.6]].map(([n, x, y]) => (
        <text key={String(n)} x={Number(x)} y={Number(y)} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={9} fill={pal.ink}>{n}</text>
      ))}
    </g>
  );
  return (
    <g>
      <Vol id={`${id}r`} c={red} pal={pal} k={0.9} lx={0.3} ly={0.25} /><Grad id={`${id}f`} a="#FFFFFF" b="#E6E2DA" />
      <Halo id={`${id}h`} cx={50} cy={50} r={58} color={rd > 0 ? "#2FE08A" : pal.glow} a={0.2 + 0.3 * rd} />
      <ContactShadow id={`${id}s`} cx={52} cy={94} rx={30} a={0.25} />
      <g transform={`translate(50 50) skewX(${skew}) scale(${1 + gk * jit(4) * 0.06} ${1 - gk * jit(5) * 0.06}) translate(-50 -50)`}>
        <circle cx={50} cy={50} r={46} fill={url(`${id}r`)} />
        <circle cx={50} cy={50} r={46} fill="none" stroke={dark(red, pal, 0.4)} strokeWidth={1} />
        {face(0)}
        {gk > 0 && <g style={{ mixBlendMode: "screen" }}>{face(gk * 4, "#FF2A4A")}{face(-gk * 4, "#2AF0FF")}</g>}
        {/* agujas */}
        <line x1={50} y1={50} x2={50 + Math.sin((hA * Math.PI) / 180) * 20} y2={50 - Math.cos((hA * Math.PI) / 180) * 20} stroke={pal.ink} strokeWidth={3.2} strokeLinecap="round" />
        <line x1={50} y1={50} x2={50 + Math.sin((mA * Math.PI) / 180) * 30} y2={50 - Math.cos((mA * Math.PI) / 180) * 30} stroke={pal.ink} strokeWidth={2} strokeLinecap="round" />
        <line x1={50 - Math.sin((sA * Math.PI) / 180) * 6} y1={50 + Math.cos((sA * Math.PI) / 180) * 6} x2={50 + Math.sin((sA * Math.PI) / 180) * 33} y2={50 - Math.cos((sA * Math.PI) / 180) * 33} stroke={red} strokeWidth={0.8} />
        <circle cx={50} cy={50} r={2.2} fill={red} />
        {gk > 0 && [...Array(4)].map((_, k) => <rect key={k} x={4} y={10 + hash(Math.floor(t / 2) * 7 + k) * 80} width={92} height={2 + hash(k + t) * 4} fill={k % 2 ? "#2AF0FF" : "#FF2A4A"} opacity={0.5 * gk} />)}
        {/* reflejo del cristal */}
        <path d="M22 30 Q36 14 58 12 Q40 20 28 38 Z" fill="#ffffff" opacity={0.35} />
      </g>
      {rd > 0 && <circle cx={50} cy={50} r={49} fill="none" stroke="#2FE08A" strokeWidth={2.4} strokeDasharray={`${rd * 308} 308`} transform="rotate(-90 50 50)" />}
    </g>
  );
};
