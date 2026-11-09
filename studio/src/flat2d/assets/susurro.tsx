// susurro · de medio cuerpo: el general Avidio Casio (coraza, capa carmesí, sin barba) y, a su lado y en sombra, una mujer con velo que se inclina a su oído (Faustina).
// `whisper` saca ondas de su boca al oído de él, que gira un poco la cabeza; `reveal` la ilumina y le cae el velo: se ven el peinado ondulado y la diadema de emperatriz (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza, hairCol } from "./romanos";

export const Susurro: AssetFC = ({ pal, p, t, seed }) => {
  const id = `su${seed}`, wh = p.whisper ?? 0, rv = p.reveal ?? 0, breathe = Math.sin(t * 0.07) * 0.4;
  const shade = lerp(0.62, 0, rv), veil = lerpHex(pal.wall, pal.ink, 0.2), hc = hairCol(pal);
  const dim = (c: string) => lerpHex(c, pal.ink, shade);
  const fpal = { ...pal, skin: dim(pal.skin), rock: dim(pal.rock), rim: dim(pal.rim), ink: pal.ink };
  const veilDrop = rv * 10, lean = Math.sin(clamp01(wh) * Math.PI) * 2;
  return (
    <g>
      <defs><clipPath id={`${id}c`}><rect x={-4} y={-4} width={108} height={94} /></clipPath>
        <radialGradient id={`${id}l`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.55} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <g clipPath={`url(#${id}c)`}>
        {rv > 0 && <circle cx={30} cy={36} r={30} fill={`url(#${id}l)`} opacity={rv} />}
        {/* Casio */}
        <g transform={`translate(0 ${breathe})`}>
          <path d="M42 50 Q36 72 38 94 L94 94 Q96 70 88 50Z" fill={lerpHex(pal.accent, pal.ink, 0.4)} />
          <Coraza cx={65} top={52} feet={150} w={40} pal={pal} />
          <path d="M57 41 L73 41 L72 52 L58 52Z" fill={pal.skin} />
          <g transform={`rotate(${-6 * Math.sin(clamp01(wh * 1.3) * Math.PI * 0.5)} 65 44)`}>
            <Cabeza cx={65} cy={30} r={12} pal={pal} turn={-0.5 - 0.3 * wh} curls={false} />
            <path d="M54 26 Q55 15 66 16 Q76 16.5 77 26 Q72 20 66 21 Q58 21 54 26Z" fill={hc} />
          </g>
        </g>
        {/* Faustina, en sombra */}
        <g transform={`translate(${lean} 0)`}>
          <path d="M12 58 Q8 76 6 94 L52 94 Q50 74 46 58 Q30 52 12 58Z" fill={dim(lerpHex(pal.wallLit, pal.wall, 0.35))} />
          <path d="M22 60 Q30 72 46 70" stroke={dim(pal.wallLit)} strokeWidth={0.8} fill="none" opacity={0.6} />
          <path d="M24 46 L36 46 L35 58 L25 58Z" fill={fpal.skin} />
          <g transform={`rotate(10 30 38)`}>
            <Cabeza cx={30} cy={36} r={10.5} pal={fpal} turn={0.7} curls={false} />
            <path d="M19 33 Q19 22 30 22 Q41 22 41.5 31 Q37 27 34 29 Q31 26 27 29 Q23 27 19 33Z" fill={dim(hc)} />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M${21 + i * 5} ${27 - (i % 2)} q2 -2 4 0`} stroke={dim(lerpHex(hc, pal.rim, 0.25))} strokeWidth={0.8} fill="none" />)}
            <circle cx={22} cy={36} r={4.2} fill={dim(hc)} />
            <path d="M22 26 Q30 21.5 39 25" stroke={pal.rim} strokeWidth={1.4} fill="none" opacity={rv} />
            {[0, 1, 2].map((i) => <circle key={i} cx={26 + i * 4.5} cy={23.6 - (i === 1 ? 0.8 : 0)} r={0.9} fill={pal.glow} opacity={rv} />)}
            <g transform={`translate(${-veilDrop * 0.4} ${veilDrop * 0.9})`} opacity={1 - rv}>
              <path d="M17 46 Q14 30 19 23 Q25 15 31 15.5 Q39 16 42 23 Q44 28 43 34 Q40 26 31 24 Q22 24 20 34 Q19 40 21 47Z" fill={veil} />
              <path d="M19 23 Q25 15 31 15.5 Q39 16 42 23" stroke={lerpHex(veil, pal.wallLit, 0.25)} strokeWidth={0.6} fill="none" />
            </g>
          </g>
        </g>
        {/* susurro */}
        {[0, 1, 2].map((i) => { const u = clamp01(wh * 1.8 - i * 0.25); return u > 0 && u < 1 ? <path key={i} d={`M${42 + u * 8} ${36 - 3 - u * 2} Q${45 + u * 9} 37 ${42 + u * 8} ${41 + u * 2}`} stroke={pal.glow} strokeWidth={0.8} fill="none" opacity={(1 - u) * 0.9} /> : null; })}
      </g>
    </g>
  );
};
