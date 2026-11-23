// endurance · prop (lienzo 100 × 100, anclaje en el centro): la nave Endurance de Interstellar vista en tres cuartos: un anillo de doce
// módulos blancos unidos por un tubo, con el núcleo central y cuatro radios; gira sobre sí misma para crear gravedad (opts.gira,
// vueltas por minuto de video: 2). opts.danada true = le faltan módulos y echa chispas y restos (tras la explosión de Mann).
// Acción propia: `spin` gira muy rápido y se tambalea mientras dura (sin control, girando hacia la atmósfera).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo, url } from "./shade";

export const Endurance: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `en${seed}`, dam = opt(opts, "danada", false), sp = clamp01(p.spin ?? 0), spinning = sp > 0 && sp < 1;
  const ang = (t / 30) * (opt(opts, "gira", 2) / 60) * 360 + (spinning ? sp * 1440 : sp >= 1 ? 1440 : 0);
  const wob = spinning ? Math.sin(t * 0.4) * 10 : 0, R = 34, tilt = 0.42;
  const white = "#F2F2EE", grey = "#9AA0A8", missing = new Set(dam ? [2, 3, 7] : []);
  const mods = [...Array(12)].map((_, i) => {
    const a = ((ang + i * 30) * Math.PI) / 180, x = Math.cos(a) * R, y = Math.sin(a) * R * tilt, back = Math.sin(a) < 0;
    return { i, x, y, back, a };
  });
  const mod = (m: (typeof mods)[number]) => missing.has(m.i) ? null : (
    <g key={m.i} transform={`translate(${m.x} ${m.y}) rotate(${(m.a * 180) / Math.PI + 90}) scale(1 ${0.6 + 0.4 * Math.abs(Math.sin(m.a))})`} opacity={m.back ? 0.8 : 1}>
      <rect x={-6.2} y={-4.2} width={12.4} height={8.4} rx={1.3} fill={url(`${id}m`)} />
      <rect x={-5.2} y={-1} width={10.4} height={1.2} fill={grey} />
      {[...Array(3)].map((_, k) => <rect key={k} x={-4 + k * 3} y={-3.3} width={1.6} height={1.4} fill="#2A3040" />)}
      <rect x={-6.2} y={-4.2} width={12.4} height={8.4} rx={1.3} fill="none" stroke={pal.rim} strokeWidth={0.3} opacity={0.6} />
    </g>
  );
  return (
    <g transform={`translate(50 50) rotate(${wob})`}>
      <defs><linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={white} /><stop offset="1" stopColor={lerpHex(white, pal.ink, 0.35)} /></linearGradient></defs>
      <Halo id={`${id}h`} cx={0} cy={0} r={48} color={pal.glow} a={0.12} />
      {/* tubo del anillo y radios */}
      <ellipse rx={R} ry={R * tilt} fill="none" stroke={lerpHex(grey, pal.ink, 0.35)} strokeWidth={1.6} />
      {mods.filter((m) => m.back).map(mod)}
      {[0, 90, 180, 270].map((k) => { const a = ((ang + k + 15) * Math.PI) / 180; return <line key={k} x1={0} y1={0} x2={Math.cos(a) * R} y2={Math.sin(a) * R * tilt} stroke={grey} strokeWidth={0.8} />; })}
      <ellipse rx={5.4} ry={4} fill={url(`${id}m`)} /><ellipse rx={2.6} ry={1.9} fill="#2A3040" /><circle cx={0.6} cy={-0.5} r={0.8} fill={pal.accent} opacity={0.6 + 0.4 * Math.sin(t * 0.2)} />
      <ellipse rx={R} ry={R * tilt} fill="none" stroke={grey} strokeWidth={1.2} strokeDasharray="1 2" opacity={0.5} clipPath="none" />
      {mods.filter((m) => !m.back).map(mod)}
      {dam ? [...Array(14)].map((_, i) => { const u = ((t * 0.02 + hash(i + seed)) % 1), a = hash(i * 3.3) * 6.28; return <rect key={i} x={Math.cos(a) * (10 + u * 50)} y={Math.sin(a) * (6 + u * 28)} width={1.4} height={0.8} fill={grey} opacity={1 - u} transform={`rotate(${u * 400 + i * 30})`} />; }) : null}
      {dam ? [...Array(6)].map((_, i) => <circle key={`s${i}`} cx={-12 + hash(i * 7) * 24} cy={-6 + hash(i * 5) * 12} r={0.5 + hash(t * 0.3 + i) * 0.7} fill="#FFD27A" opacity={hash(Math.floor(t / 3) + i) > 0.5 ? 1 : 0.2} />) : null}
    </g>
  );
};
