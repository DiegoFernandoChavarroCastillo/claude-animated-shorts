// imagen_ia · prop: una imagen generada por IA en su marco de pantalla con el texto «una señal de stop volando en el cielo azul».
// opts.era "2015" (alignDRAW: mancha roja borrosa y pixelada sobre azul turbio, sin forma) | "hoy" (foto nítida: octógono rojo con STOP,
// poste, nubes y luz de borde). Lienzo 100 × 112 (marco + rótulo de año), anclaje en el centro. Acciones propias: `generate` la imagen
// aparece desde ruido (barrido de arriba abajo; se queda); `glitch` se descompone en franjas RGB un instante (vuelve).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

const OCT = (cx: number, cy: number, r: number) =>
  [...Array(8)].map((_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; }).join(" ");

export const ImagenIa: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `ia${seed}`, era = String(opt(opts, "era", "hoy")), old = era === "2015";
  const gen = p.generate === undefined ? 1 : clamp01(p.generate), gl = clamp01(p.glitch ?? 0), glk = gl > 0 && gl < 1 ? Math.sin(gl * Math.PI) : 0;
  const bob = Math.sin(t * 0.06 + seed) * 1.2, scanY = lerp(6, 94, gen);
  const sky = old ? ["#5A6E86", "#7A8AA0"] : ["#2A86E8", "#9ED4FA"], red = old ? "#A0453E" : "#D8262C";
  const frame = lite(pal.wall, pal, 0.15);
  const picture = (
    <g>
      <rect x={6} y={6} width={88} height={88} fill={url(`${id}s`)} />
      {old ? (
        <g filter={`url(#${id}b)`}>
          {/* alignDRAW: manchas sin forma, como la imagen original de 2015 */}
          <ellipse cx={52 + bob * 0.3} cy={44} rx={17} ry={14} fill={red} />
          <ellipse cx={44} cy={52} rx={10} ry={8} fill="#7A3A3A" opacity={0.8} />
          <rect x={49} y={56} width={4} height={30} fill="#5A5048" opacity={0.6} />
          <ellipse cx={26} cy={22} rx={18} ry={7} fill="#9AA4B4" opacity={0.6} />
          <ellipse cx={78} cy={78} rx={20} ry={9} fill="#4A5868" opacity={0.7} />
        </g>
      ) : (
        <g>
          {[[22, 22, 12], [74, 18, 9], [80, 70, 11], [18, 76, 8]].map(([x, y, r], k) => (
            <g key={k} opacity={0.9}><ellipse cx={x + Math.sin(t * 0.01 + k) * 2} cy={y} rx={r} ry={r * 0.45} fill="#ffffff" />
              <ellipse cx={x - r * 0.4 + Math.sin(t * 0.01 + k) * 2} cy={y - r * 0.25} rx={r * 0.55} ry={r * 0.4} fill="#ffffff" /></g>
          ))}
          <g transform={`translate(0 ${bob}) rotate(${Math.sin(t * 0.04 + seed) * 4} 50 44)`}>
            <rect x={48.4} y={56} width={3.2} height={34} fill={url(`${id}p`)} />
            <polygon points={OCT(50, 42, 19)} fill="#F4F4F4" />
            <polygon points={OCT(50, 42, 17)} fill={url(`${id}r`)} />
            <text x={50} y={46.4} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={11} fill="#ffffff" letterSpacing={0.4}>STOP</text>
            <polygon points={OCT(50, 42, 17)} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={0.6} transform="translate(-0.6 -0.6)" />
          </g>
        </g>
      )}
      {old && [...Array(64)].map((_, i) => {   // pixelado: bloques de 11 × 11 que ensucian la imagen
        const x = 6 + (i % 8) * 11, y = 6 + Math.floor(i / 8) * 11;
        return <rect key={i} x={x} y={y} width={11} height={11} fill={hash(i + seed) > 0.5 ? "#ffffff" : "#000000"} opacity={0.07 + hash(i * 3.1) * 0.08} />;
      })}
    </g>
  );
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}><rect x={6} y={6} width={88} height={88} rx={3} /></clipPath>
        <clipPath id={`${id}g`}><rect x={0} y={0} width={100} height={scanY} /></clipPath>
        <filter id={`${id}b`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={4.2} /></filter>
      </defs>
      <Grad id={`${id}s`} a={sky[0]} b={sky[1]} /><Vol id={`${id}r`} c={red} pal={pal} k={0.8} lx={0.35} ly={0.25} />
      <Grad id={`${id}p`} a="#B8BEC8" b="#6A707A" h /><Grad id={`${id}f`} a={frame} b={dark(pal.wall, pal, 0.3)} />
      <Halo id={`${id}h`} cx={50} cy={50} r={64} color={old ? pal.rim : pal.glow} a={old ? 0.12 : 0.3} />
      <rect x={1} y={1} width={98} height={98} rx={6} fill={url(`${id}f`)} />
      <rect x={1} y={1} width={98} height={98} rx={6} fill="none" stroke={pal.rim} strokeWidth={0.8} strokeOpacity={0.7} />
      <g clipPath={`url(#${id}c)`}>
        <rect x={6} y={6} width={88} height={88} fill={pal.ink} />
        {[...Array(40)].map((_, i) => <rect key={i} x={6 + hash(i + t * 0.3) * 86} y={6 + hash(i * 1.7 + t * 0.2) * 86} width={2} height={2} fill={pal.rim} opacity={0.4} />)}
        <g clipPath={`url(#${id}g)`}>{picture}</g>
        {gen < 1 && <rect x={6} y={scanY - 1} width={88} height={2} fill={pal.glow} opacity={0.9} />}
        {glk > 0 && (
          <g style={{ mixBlendMode: "screen" }}>
            <g transform={`translate(${glk * 4} 0)`} opacity={0.6}><rect x={6} y={20 + hash(Math.floor(t / 2)) * 40} width={88} height={8} fill="#FF2A4A" opacity={0.5} /></g>
            <g transform={`translate(${-glk * 4} 0)`} opacity={0.6}><rect x={6} y={40 + hash(Math.floor(t / 2) + 9) * 40} width={88} height={6} fill="#2AF0FF" opacity={0.5} /></g>
          </g>
        )}
      </g>
      {/* rótulo del año bajo el marco */}
      <rect x={30} y={101} width={40} height={10} rx={5} fill={old ? dark(pal.wall, pal, 0.2) : pal.rim} />
      <text x={50} y={108.6} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={7} fill={old ? pal.glow : pal.ink}>{old ? "2015" : "HOY"}</text>
    </g>
  );
};
