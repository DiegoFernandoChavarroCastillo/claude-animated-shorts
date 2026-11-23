// ranger · prop (lienzo 100 × 50, anclaje en el centro): una lanzadera de Interstellar de perfil, morro a la derecha: casco blanco en
// cuña con panza oscura, alas cortas en flecha, cabina con ventanas y dos toberas. opts.fuego true = toberas encendidas (llama azul
// que vibra); opts.rota true = restos partidos e inclinados en el agua (la nave de Miller). Acción propia: `thrust` se enciende y
// tiembla mientras dura (despega, frena, maniobra).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { url } from "./shade";

export const Ranger: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `rg${seed}`, rota = opt(opts, "rota", false), th = clamp01(p.thrust ?? 0), on = opt(opts, "fuego", false) || (th > 0 && th < 1);
  const sh = th > 0 && th < 1 ? (hash(t) - 0.5) * 0.8 : 0, white = "#EFEFEA";
  const fl = 1 + 0.25 * Math.sin(t * 1.7) + 0.15 * Math.sin(t * 3.1);
  const hull = (
    <g>
      <path d="M14 26 L22 19 L60 16 L84 21 Q92 24 84 27 L60 31 L22 32 Z" fill={url(`${id}w`)} />
      <path d="M22 29 L60 28.5 L84 26 Q90 25.5 86 27.4 L60 31 L22 32 Z" fill="#30343C" />
      <path d="M30 24 L48 13 L58 13 L50 24 Z" fill={lerpHex(white, pal.ink, 0.2)} />
      <path d="M30 28 L46 38 L54 38 L48 28 Z" fill={lerpHex(white, pal.ink, 0.35)} />
      <path d="M66 18.4 L78 20.4 L78 22.6 L66 21.6 Z" fill="#1E2230" /><path d="M67 18.8 L72 19.6 L72 20.6 L67 20.2 Z" fill={pal.glow} opacity={0.5} />
      {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={36 + k * 4.6} y={21} width={2.2} height={1.3} fill="#1E2230" />)}
      <path d="M22 19 L60 16 L84 21" stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.7} />
      <rect x={10.5} y={21} width={4} height={4} fill="#4A4E56" /><rect x={10.5} y={26.6} width={4} height={4} fill="#4A4E56" />
    </g>
  );
  return (
    <g transform={`translate(${sh} ${sh * 0.6})`}>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={white} /><stop offset="1" stopColor={lerpHex(white, pal.ink, 0.3)} /></linearGradient>
        <linearGradient id={`${id}f`} x1="1" x2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.3" stopColor="#8FD0FF" /><stop offset="1" stopColor="#3A6AFF" stopOpacity={0} /></linearGradient>
      </defs>
      {rota ? (
        <g>
          <g transform="rotate(-18 40 30)">{hull}</g>
          <path d="M12 34 L30 30 L28 38 Z" fill={lerpHex(white, pal.ink, 0.4)} transform="rotate(25 20 34)" />
          {[...Array(5)].map((_, i) => <rect key={i} x={60 + i * 6} y={34 + hash(i) * 4} width={2 + hash(i * 3) * 3} height={1} fill="#6A6E76" transform={`rotate(${hash(i) * 60} ${60 + i * 6} 34)`} />)}
        </g>
      ) : (
        <g>
          {on ? <g style={{ mixBlendMode: "screen" }}><path d={`M11 23 L${11 - 16 * fl} 23 L11 23.6 Z M11 28.6 L${11 - 16 * fl} 28.6 L11 29.2 Z`} stroke="none" fill="none" />
            <ellipse cx={11 - 7 * fl} cy={23} rx={8 * fl} ry={1.8} fill={url(`${id}f`)} /><ellipse cx={11 - 7 * fl} cy={28.6} rx={8 * fl} ry={1.8} fill={url(`${id}f`)} /></g> : null}
          {hull}
        </g>
      )}
    </g>
  );
};
