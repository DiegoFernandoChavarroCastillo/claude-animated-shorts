// monitor_mensaje · prop (lienzo 100 × 75, anclaje en el centro): una pantalla de la nave que reproduce un mensaje de vídeo de casa:
// marco gris con botones, imagen con líneas de barrido y, dentro, una persona de medio cuerpo que habla (busto simple con pelo y ropa
// según opts.persona: tom (chico, pelo corto castaño) | tom_adulto (barba, gorra) | murph (mujer, pelo castaño largo) | brand (anciano
// calvo, gafas)). Abajo, la fecha y un contador de mensajes. Acción propia: `next` la imagen salta con ruido al mensaje siguiente
// (cambia la persona por opts.siguiente) y el contador sube.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";

const LOOK: Record<string, { hair: string; cloth: string; long?: boolean; beard?: boolean; cap?: boolean; bald?: boolean; glasses?: boolean }> = {
  tom: { hair: "#6A4A2A", cloth: "#4A6A8A" },
  tom_adulto: { hair: "#5A3E24", cloth: "#6A5A3A", beard: true, cap: true },
  murph: { hair: "#5A3A24", cloth: "#8A3A3A", long: true },
  brand: { hair: "#D8D4CC", cloth: "#3A3E46", bald: true, glasses: true },
};

export const MonitorMensaje: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `mm${seed}`, nx = clamp01(p.next ?? 0), who = nx >= 0.5 ? opt(opts, "siguiente", opt(opts, "persona", "tom")) : opt(opts, "persona", "tom");
  const L = LOOK[who] ?? LOOK.tom, noise = nx > 0.25 && nx < 0.75, n = opt(opts, "n", 1) + (nx >= 0.5 ? 1 : 0), talk = Math.sin(t * 0.8) * 0.5 + 0.5;
  const skin = "#E0B08A";
  return (
    <g>
      <defs><clipPath id={`${id}c`}><rect x={10} y={8} width={80} height={52} rx={2} /></clipPath>
        <radialGradient id={`${id}bg`} cx="0.5" cy="0.4"><stop offset="0" stopColor="#7A8A80" /><stop offset="1" stopColor="#2A3430" /></radialGradient></defs>
      <rect x={4} y={2} width={92} height={70} rx={4} fill="#3A3E44" /><rect x={4} y={2} width={92} height={70} rx={4} fill="none" stroke="#8A9098" strokeWidth={0.6} />
      <g clipPath={`url(#${id}c)`}>
        <rect x={10} y={8} width={80} height={52} fill={`url(#${id}bg)`} />
        <rect x={60} y={14} width={20} height={14} fill="#C8B890" opacity={0.35} />
        <g transform={`translate(50 ${36 + Math.sin(t * 0.06) * 0.4})`}>
          <path d="M-18 30 Q-17 12 0 11 Q17 12 18 30 Z" fill={L.cloth} />
          {L.long ? <path d="M-11 -4 Q-13 12 -9 16 L9 16 Q13 12 11 -4 Z" fill={L.hair} /> : null}
          <circle cx={0} cy={0} r={10} fill={skin} />
          {!L.bald ? <path d="M-10 -1 Q-10 -11 0 -11 Q10 -11 10 -1 Q6 -6 0 -6 Q-6 -6 -10 -1 Z" fill={L.hair} /> : <path d="M-10 0 Q-11 -4 -8 -5 M10 0 Q11 -4 8 -5" stroke={L.hair} strokeWidth={1.4} fill="none" />}
          {L.cap ? <g><path d="M-10.4 -3 Q-10 -12 0 -12 Q10 -12 10.4 -3 Z" fill="#3A5A3A" /><path d="M2 -4 L15 -3 L10 -1 Z" fill="#2E4A2E" /></g> : null}
          {L.beard ? <path d="M-8 3 Q-7 11 0 11 Q7 11 8 3 Q4 6 0 6 Q-4 6 -8 3 Z" fill={L.hair} /> : null}
          <circle cx={-3.6} cy={0} r={0.9} fill={pal.ink} /><circle cx={3.6} cy={0} r={0.9} fill={pal.ink} />
          {L.glasses ? <g fill="none" stroke="#2A2A2A" strokeWidth={0.5}><circle cx={-3.6} cy={0} r={2.4} /><circle cx={3.6} cy={0} r={2.4} /><line x1={-1.2} y1={0} x2={1.2} y2={0} /></g> : null}
          <ellipse cx={0} cy={5.4} rx={2.2} ry={0.4 + talk * 1.2} fill={lerpHex(skin, pal.ink, 0.6)} />
        </g>
        {[...Array(26)].map((_, i) => <rect key={i} x={10} y={8 + i * 2} width={80} height={0.5} fill="#000" opacity={0.18} />)}
        <rect x={10} y={8 + ((t * 0.7) % 52)} width={80} height={3} fill="#fff" opacity={0.05} />
        {noise ? [...Array(60)].map((_, i) => <rect key={`n${i}`} x={10 + hash(i + t) * 80} y={8 + hash(i * 3 + t) * 52} width={2 + hash(i * 5 + t) * 14} height={0.8} fill={hash(i * 7 + t) > 0.5 ? "#fff" : "#000"} opacity={0.7} />) : null}
      </g>
      <circle cx={14} cy={66} r={1.4} fill="#E84A3A" opacity={0.6 + 0.4 * Math.sin(t * 0.2)} />
      <text x={50} y={67.6} textAnchor="middle" fontFamily="Courier New, monospace" fontSize={3.4} fill="#C8F0D8">{`MENSAJE ${n} / ${opt(opts, "total", 23)}`}</text>
    </g>
  );
};
