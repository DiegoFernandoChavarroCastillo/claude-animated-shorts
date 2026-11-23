// cama · escenario (lienzo 100 × 50, anclaje en los pies de la cama, abajo al centro): una cama de lado con una persona acostada
// boca arriba bajo la sábana, la cabeza en la almohada a la izquierda; respira despacio. opts.persona anciana (pelo blanco largo,
// Murph al final) | anciano (calvo con barba gris, el profesor Brand); opts.hospital true = cabecero metálico y un monitor con
// latidos. Acción propia: `apaga` los latidos se detienen y la respiración se para (se queda): muere.
import React from "react";
import { type AssetFC, clamp01, idle, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, url } from "./shade";

export const Cama: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `ca${seed}`, I = idle(t, seed), off = clamp01(p.apaga ?? 0), vieja = opt(opts, "persona", "anciana") === "anciana", hosp = opt(opts, "hospital", true);
  const br = I.breath * (1 - off) * 0.6, sheet = "#EEF0F2", skin = pal.skin;
  const beat = (x: number) => { const u = ((x + t * 0.8) % 30) / 30; return u > 0.45 && u < 0.5 ? -6 : u > 0.5 && u < 0.55 ? 4 : 0; };
  return (
    <g>
      <Grad id={`${id}s`} a="#FFFFFF" b={lerpHex(sheet, pal.ink, 0.25)} />
      <ContactShadow id={`${id}c`} cx={50} cy={49} rx={46} />
      <rect x={6} y={30} width={88} height={14} rx={1.4} fill={lerpHex("#8A6A4A", pal.ink, 0.2)} />
      <rect x={6} y={42} width={2.4} height={7} fill={hosp ? "#9AA0A8" : "#6A4A30"} /><rect x={91.6} y={42} width={2.4} height={7} fill={hosp ? "#9AA0A8" : "#6A4A30"} />
      {hosp ? <path d="M4 44 L4 14 Q4 12 6 12 L10 12 Q12 12 12 14 L12 30" stroke="#B8BEC6" strokeWidth={1.4} fill="none" /> : <rect x={3} y={12} width={5} height={36} rx={1} fill="#6A4A30" />}
      <ellipse cx={20} cy={28} rx={10} ry={4} fill="#FAFAFA" />
      {/* cabeza */}
      <circle cx={21} cy={23.6} r={5.2} fill={skin} />
      {vieja ? <path d="M15.4 23 Q15 16.6 21 16.6 Q27 16.6 26.6 22 Q24 19.6 21 19.8 Q17.6 20 16.6 25 Q14 30 13 31 L17 30 Z" fill="#E8E6E2" /> : <path d="M17 26 Q21 31 25.4 26 Q24 28.6 21 28.6 Q18 28.6 17 26 Z" fill="#B8B4AE" />}
      <path d="M22.6 22.6 l1.6 0" stroke={pal.ink} strokeWidth={0.4} /><path d="M18.6 22.8 l1.4 0" stroke={pal.ink} strokeWidth={0.4} />
      {/* cuerpo bajo la sábana */}
      <path d={`M24 30 Q30 ${22 - br} 44 ${23 - br} Q62 24 80 25 Q90 25.6 92 30 L92 32 L24 32 Z`} fill={url(`${id}s`)} />
      <path d={`M30 ${25.6 - br} Q38 ${23 - br} 46 ${24 - br}`} stroke="#fff" strokeWidth={0.5} fill="none" opacity={0.8} />
      <path d={`M34 ${26 - br} Q36 ${24.4 - br} 39 ${25 - br}`} stroke={skin} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      {hosp ? (
        <g transform="translate(84 2)">
          <rect x={0} y={0} width={14} height={10} rx={1} fill="#1A2026" stroke="#8A9098" strokeWidth={0.4} />
          <path d={[...Array(14)].map((_, i) => `${i ? "L" : "M"}${1 + i * 0.9} ${5 + (off < 1 ? beat(i * 2.2) * 0.4 * (1 - off) : 0)}`).join(" ")} stroke="#5AF09A" strokeWidth={0.4} fill="none" />
          <line x1={7} y1={10} x2={7} y2={28} stroke="#8A9098" strokeWidth={0.5} />
        </g>
      ) : null}
    </g>
  );
};
