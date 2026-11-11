// cesarion · Retrato de medio cuerpo de Cesarión a los diecisiete años: pelo corto rizado, diadema fina, collar de oro y manto de lino; el hijo de César y Cleopatra.
// `ghost` detrás de él aparece, translúcido, el perfil de Julio César con su laurel, y los dos rostros coinciden (se queda);
// `dark` una sombra cae sobre él desde arriba y cierra los ojos (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { CabezaCesarion, gold, linen } from "./ptolomeos";

export const Cesarion: AssetFC = ({ pal, p, t, seed }) => {
  const gh = p.ghost ?? 0, dk = p.dark ?? 0, id = `cn${seed}`, br = Math.sin(t * 0.06) * 0.5;
  const ghostPal = { ...pal, skin: lerpHex(pal.glow, pal.wallLit, 0.4), ink: lerpHex(pal.rim, pal.ink, 0.4) };
  const gx = lerp(84, 70, clamp01(gh * 1.2)), go = clamp01(gh * 1.8) * 0.7;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0.7" stopColor="#fff" stopOpacity={1} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
        <mask id={`${id}m`}><rect x={-10} y={-10} width={120} height={120} fill={`url(#${id}f)`} /></mask>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.ink} stopOpacity={0.95} /><stop offset="1" stopColor={pal.ink} stopOpacity={0} /></linearGradient>
      </defs>
      {gh > 0.01 && <g opacity={go}>
        <Cabeza cx={gx} cy={30} r={15} pal={ghostPal} turn={-0.35} laurel={1} bald curls={false} hair={lerpHex(pal.glow, pal.rim, 0.4)} />
      </g>}
      <g mask={`url(#${id}m)`} transform={`translate(0 ${br})`}>
        <path d="M14 100 Q16 66 32 60 L68 60 Q84 66 86 100Z" fill={linen(pal)} />
        <path d="M30 61 Q22 80 26 100 M70 61 Q78 80 74 100" stroke={lerpHex(linen(pal), pal.wall, 0.4)} strokeWidth={1.2} fill="none" />
        <path d="M32 60 Q50 70 68 60 Q72 74 60 84 Q50 76 40 84 Q28 74 32 60Z" fill={lerpHex(pal.accent, pal.ink, 0.3)} opacity={0.9} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${36 + i * 1.5} ${61 + i * 2.6} Q50 ${70 + i * 3.2} ${64 - i * 1.5} ${61 + i * 2.6}`} stroke={i === 1 ? pal.accent : gold(pal)} strokeWidth={2} fill="none" />)}
        <path d="M68 60 Q84 66 86 100" stroke={pal.rim} strokeWidth={0.8} fill="none" opacity={0.6} />
        <rect x={44.5} y={46} width={11} height={14} fill={pal.skin} />
        <path d="M44.5 52 Q50 56 55.5 52" stroke={lerpHex(pal.skin, pal.ink, 0.3)} strokeWidth={0.6} fill="none" />
        <CabezaCesarion cx={lerp(50, 42, clamp01(gh * 1.2))} cy={34} r={15} pal={pal} turn={lerp(0.25, 0.35, gh)} eyesClosed={clamp01(dk * 1.4)} />
      </g>
      {dk > 0 && <rect x={-10} y={-10} width={120} height={lerp(0, 125, dk)} fill={`url(#${id}d)`} />}
    </g>
  );
};
