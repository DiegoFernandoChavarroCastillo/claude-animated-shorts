// rutina · fondo: la rutina de cada día en tres viñetas apiladas que se encienden una a una (lienzo 100×178, todo por encima de y ≈ 112):
// arriba, un despertador en la mesilla junto a la cama a las siete; en medio, una fila de coches parados en un atasco con las luces de freno;
// abajo, un fregadero con platos sucios. Con poca luz las viñetas aún apagadas se ven en penumbra. Acciones propias: `ring` el despertador
// suena y tiembla mientras dura (enciende la 1.ª viñeta); `jam` los coches avanzan un poco y frenan (enciende la 2.ª); `pile` los platos se
// apilan uno a uno (enciende la 3.ª). Las viñetas encendidas se quedan.
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

const CAR = ["#C2452E", "#2E7FC2", "#E8B640", "#3A8A5A", "#8A8A92"];

export const Rutina: AssetFC = ({ pal, t, seed, p }) => {
  const id = `ru${seed}`, rg = p.ring ?? 0, jm = p.jam ?? 0, pl = p.pile ?? 0;
  const on1 = clamp01(rg * 4), on2 = clamp01(jm * 4), on3 = clamp01(pl * 4);
  const ringing = rg > 0 && rg < 1, shake = ringing ? Math.sin(t * 2.2) * 2 : 0;
  const panel = (y: number, h: number, on: number, bg: string, child: React.ReactNode, k: string) => (
    <g key={k}>
      <rect x={6} y={y} width={88} height={h} rx={3} fill={bg} />
      {child}
      <rect x={6} y={y} width={88} height={h} rx={3} fill={pal.ink} opacity={0.62 * (1 - on)} />
      <rect x={6} y={y} width={88} height={h} rx={3} fill="none" stroke={on > 0.5 ? pal.rim : lite(pal.ink, pal, 0.2)} strokeWidth={1} />
    </g>
  );
  const plates = Math.floor(2 + pl * 6);
  return (
    <g>
      <Grad id={`${id}b`} a={lerpHex(lerpHex(pal.wall, "#D8783A", 0.55), pal.ink, 0.15)} b={lerpHex(lerpHex(pal.wall, "#B8502E", 0.55), pal.ink, 0.45)} />
      <rect x={-4} y={-4} width={108} height={186} fill={url(`${id}b`)} />
      <g transform="translate(5 14) scale(0.9)">
      {/* 1. dormitorio: cama, mesilla y despertador */}
      {panel(8, 32, on1, lerpHex("#B8C8E8", pal.wall, 0.4), <g>
        <rect x={6} y={8} width={88} height={20} rx={3} fill={lerpHex("#FFD8A0", pal.wallLit, 0.3)} opacity={0.5} />
        <path d="M8 40 L8 30 Q30 26 54 30 L54 40 Z" fill={lerpHex("#E8E2F0", pal.wallLit, 0.2)} /><rect x={8} y={24} width={14} height={7} rx={3} fill="#FFF" />
        <path d="M24 30 Q34 24 46 28 Q52 30 54 34 L24 34 Z" fill={lerpHex("#5A7AB8", pal.accent, 0.3)} />
        <rect x={60} y={30} width={18} height={10} fill={lerpHex("#8A5A3A", pal.ink, 0.2)} />
        <g transform={`translate(${69 + shake} 22) rotate(${shake * 3})`}>
          {ringing ? <Halo id={`${id}a`} cx={0} cy={0} r={12} color={pal.glow} a={0.6} /> : null}
          <circle r={6.2} fill={lerpHex("#C2452E", pal.accent, 0.2)} /><circle r={4.8} fill="#FFF8E8" />
          <circle cx={-4.6} cy={-5.6} r={2.2} fill="#D8D0B0" /><circle cx={4.6} cy={-5.6} r={2.2} fill="#D8D0B0" />
          <path d="M0 0 L0 -3.6 M0 0 L0 3.6" stroke="#222" strokeWidth={0.7} />
          <path d="M-4 6 l-1.6 2.6 M4 6 l1.6 2.6" stroke="#333" strokeWidth={0.9} />
          {ringing ? <path d="M-9 -6 q-2 2 0 4 M9 -6 q2 2 0 4 M-11 -8 q-3 4 0 8 M11 -8 q3 4 0 8" stroke={pal.ink} strokeWidth={0.6} fill="none" /> : null}
        </g>
      </g>, "1")}
      {/* 2. atasco: carretera y coches con luces de freno */}
      {panel(44, 32, on2, lerpHex("#F0B880", pal.wall, 0.4), <g>
        <rect x={6} y={44} width={88} height={14} rx={3} fill={lerpHex("#FFB870", pal.glow, 0.3)} opacity={0.6} />
        {[...Array(5)].map((_, i) => <rect key={i} x={10 + i * 18} y={48 + hash(i) * 4} width={6} height={10} fill={lerpHex("#6A6A80", pal.ink, 0.2)} />)}
        <rect x={6} y={60} width={88} height={16} fill="#4A4A52" /><path d="M8 68 L92 68" stroke="#E8E0B0" strokeWidth={0.6} strokeDasharray="4 3" />
        {[...Array(4)].map((_, i) => { const x = 8 + i * 22 + Math.sin(Math.min(1, jm) * Math.PI) * 3, c = CAR[(i + seed) % CAR.length]; return (
          <g key={i} transform={`translate(${x} 62)`}>
            <path d="M0 8 L0 4 Q2 0 6 0 L12 0 Q16 0 18 4 L18 8 Z" fill={c} /><rect x={3} y={1} width={11} height={3} rx={1} fill="#BFE0F0" opacity={0.8} />
            <circle cx={4} cy={8.4} r={1.8} fill="#1A1A1A" /><circle cx={14} cy={8.4} r={1.8} fill="#1A1A1A" />
            <rect x={-0.4} y={4.6} width={1.6} height={1.4} fill="#FF3A2A" /><Halo id={`${id}f${i}`} cx={0.4} cy={5.3} r={3 + (jm > 0.5 ? 1.5 : 0)} color="#FF3A2A" a={0.7 * on2} />
          </g>
        ); })}
      </g>, "2")}
      {/* 3. cocina: fregadero con platos que se apilan */}
      {panel(80, 30, on3, lerpHex("#CFE8DC", pal.wall, 0.4), <g>
        {[...Array(8)].map((_, i) => <rect key={i} x={8 + (i % 4) * 22} y={82 + Math.floor(i / 4) * 8} width={21} height={7} fill="#FFF" opacity={0.25} />)}
        <rect x={20} y={98} width={60} height={12} rx={2} fill="#B8C0C8" /><rect x={24} y={99} width={52} height={8} rx={2} fill="#7A8490" />
        <path d="M62 98 L62 88 Q62 85 66 85 L70 85" stroke="#A0A8B0" strokeWidth={1.6} fill="none" />
        <ContactShadow id={`${id}p`} cx={44} cy={99} rx={16} />
        {[...Array(plates)].map((_, i) => <g key={i}>
          <ellipse cx={44 + (hash(i + 2) - 0.5) * 3} cy={98 - i * 1.6} rx={11} ry={1.8} fill={i % 3 === 2 ? "#E8D8C0" : "#F6F6F2"} />
          <path d={`M${36 + hash(i) * 8} ${97.6 - i * 1.6} q2 -0.6 4 0`} stroke="#B87A3A" strokeWidth={0.5} opacity={0.7} />
        </g>)}
        <path d="M58 98 L61 92 L64 98 Z" fill="#E0E8F0" opacity={0.8} />
      </g>, "3")}
      </g>
    </g>
  );
};
