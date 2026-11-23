// agujero_gusano · prop (lienzo 100 × 100, anclaje en el centro): el agujero de gusano de Interstellar: no un círculo sino una esfera
// de cristal que refleja, deformadas hacia el borde, las estrellas y una galaxia de otro lugar; borde que tiembla con la luz curvada.
// Las estrellas de dentro giran despacio. Acción propia: `open` la esfera crece desde un punto (aparece); `enter` la esfera llena el
// cuadro y la luz se estira hacia el centro (cruzarlo).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { url } from "./shade";

export const AgujeroGusano: AssetFC = ({ t, seed, p }) => {
  const id = `ag${seed}`, op = p.open === undefined ? 1 : clamp01(p.open), en = clamp01(p.enter ?? 0), R = 30 * (0.05 + 0.95 * op) * (1 + en * 1.6);
  const rot = t * 0.15;
  return (
    <g transform="translate(50 50)">
      <defs>
        <clipPath id={`${id}c`}><circle r={R} /></clipPath>
        <radialGradient id={`${id}in`}><stop offset="0" stopColor="#1A1440" /><stop offset="0.7" stopColor="#0A0A24" /><stop offset="1" stopColor="#3A4A9A" /></radialGradient>
        <radialGradient id={`${id}rim`}><stop offset="0.86" stopColor="#9FC4FF" stopOpacity={0} /><stop offset="0.97" stopColor="#E6F0FF" stopOpacity={0.9} /><stop offset="1" stopColor="#9FC4FF" stopOpacity={0} /></radialGradient>
        <radialGradient id={`${id}halo`}><stop offset="0.5" stopColor="#7AA0FF" stopOpacity={0.35} /><stop offset="1" stopColor="#7AA0FF" stopOpacity={0} /></radialGradient>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" /></filter>
      </defs>
      <circle r={R * 1.5} fill={url(`${id}halo`)} style={{ mixBlendMode: "screen" }} />
      <g clipPath={`url(#${id}c)`}>
        <circle r={R} fill={url(`${id}in`)} />
        {/* galaxia del otro lado, aplastada hacia el borde como en una lente */}
        <g transform={`rotate(${rot}) scale(${R / 30})`} filter={`url(#${id}b)`} style={{ mixBlendMode: "screen" }}>
          {[...Array(90)].map((_, i) => { const a = i * 0.27, r = 1 + i * 0.26, k = 1 - (r / 30) ** 2 * 0.5; return <circle key={i} cx={Math.cos(a) * r * k} cy={Math.sin(a) * r * k * 0.55} r={0.9} fill={i % 2 ? "#FFE0C0" : "#C8D8FF"} opacity={0.65 - i * 0.005} />; })}
          <circle r={2.2} fill="#FFF4E0" />
        </g>
        {/* estrellas comprimidas hacia el borde */}
        {[...Array(120)].map((_, i) => {
          const a = hash(seed + i * 1.7) * 6.283 + rot * 0.01 * (1 + (i % 4)), u = Math.sqrt(hash(i * 3.9)), r = R * (1 - (1 - u) ** 2.4), s = 0.18 + (r / R) * 0.25;
          return <ellipse key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} rx={s * (1 + (r / R) * 2.2)} ry={s * 0.6} transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * r} ${Math.sin(a) * r})`} fill="#fff" opacity={0.85} />;
        })}
        {en > 0 ? [...Array(40)].map((_, i) => { const a = hash(i * 5.1) * 6.283, r0 = R * (0.2 + hash(i) * 0.6); return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r0 * (1 - en * 0.8)} y2={Math.sin(a) * r0 * (1 - en * 0.8)} stroke="#E6F0FF" strokeWidth={0.4} opacity={en} />; }) : null}
        {/* reflejo del cristal: arriba a la izquierda */}
        <ellipse cx={-R * 0.35} cy={-R * 0.45} rx={R * 0.45} ry={R * 0.22} transform={`rotate(-30 ${-R * 0.35} ${-R * 0.45})`} fill="#fff" opacity={0.08} />
      </g>
      <circle r={R} fill={url(`${id}rim`)} style={{ mixBlendMode: "screen" }} />
      <circle r={R * (1.005 + 0.006 * Math.sin(t * 0.3))} fill="none" stroke="#DCE8FF" strokeWidth={0.35} opacity={0.75} />
    </g>
  );
};
