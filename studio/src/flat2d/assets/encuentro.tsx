// encuentro · Diógenes tumbado al sol delante de su tinaja; Alejandro (joven, sin barba, coraza y capa) de pie ante él con dos guardias; el sol viene de detrás del rey y su sombra cae sobre el viejo.
// `arrive` trae al rey y su guardia desde la derecha (la sombra crece); `offer` le hace tender la mano («pídeme lo que quieras»); `point` hace que Diógenes alce el brazo y le indique que se aparte;
// `laugh` sacude a los guardias de risa; `step_aside` aparta al rey: la sombra se va y el sol vuelve a bañar al viejo (todas se quedan).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import type { Pal } from "../palette";
import { Cabeza, Coraza, Himation, metal } from "./romanos";
import { Pithos } from "./tinaja";

const Guard: React.FC<{ x: number; y: number; s: number; pal: Pal; shake: number; t: number; k: number }> = ({ x, y, s, pal, shake, t, k }) => {
  const m = metal(pal), wob = shake * Math.sin(t * 0.9 + k * 2) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M8 -52 L8 0" stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={1} /><path d="M7 -52 L8 -57 L9 -52Z" fill={m} />
      <rect x={-4.5} y={-18} width={3.4} height={18} rx={1.2} fill={pal.skin} /><rect x={1.1} y={-18} width={3.4} height={18} rx={1.2} fill={pal.skin} />
      <path d="M-7 -38 Q0 -40 7 -38 L8 -16 L-8 -16Z" fill={lerpHex(pal.accent, pal.ink, 0.25)} />
      <g transform={`rotate(${wob} 0 -40)`}>
        <circle cx={0} cy={-45} r={5} fill={pal.skin} /><path d="M-5.4 -45 Q-5 -52 0 -52 Q5 -52 5.4 -45 L5.4 -42 L3 -42 L3 -46 L-3 -46 L-3 -42 L-5.4 -42Z" fill={m} />
        <path d="M-5 -51 Q0 -58 5 -51" stroke={pal.accent} strokeWidth={2.2} fill="none" />
        {shake > 0.05 && <ellipse cx={0} cy={-41.5} rx={1.6} ry={1.2 * shake} fill={pal.ink} />}
      </g>
      <circle cx={-6} cy={-26} r={8} fill={lerpHex(pal.rim, pal.rock, 0.3)} /><circle cx={-6} cy={-26} r={8} fill="none" stroke={lerpHex(pal.rim, pal.ink, 0.3)} strokeWidth={0.8} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M-6 -26 L${-6 + Math.cos(i * 0.785) * 4} ${-26 + Math.sin(i * 0.785) * 4}`} stroke={pal.accent} strokeWidth={0.7} />)}
      {shake > 0.05 && [0, 1].map((i) => <text key={i} x={6 + i * 5} y={-56 - i * 4 + Math.sin(t * 0.5 + i) * 1.5} fontSize={4.4} fontFamily="Georgia, serif" fill={pal.wallLit} opacity={shake}>ja</text>)}
    </g>
  );
};

export const Encuentro: AssetFC = ({ pal, p, t, seed }) => {
  const id = `en${seed}`, ar = p.arrive ?? 0, of = p.offer ?? 0, pt = p.point ?? 0, la = p.laugh ?? 0, sa = p.step_aside ?? 0;
  const dx = (1 - ar) * 46 + sa * 16, sh = clamp01(ar * 1.3) * (1 - sa), breathe = Math.sin(t * 0.07) * 0.4;
  const ax = 66 + dx, hide = clamp01(ar * 3);
  const ohx = lerp(ax - 10, ax - 20, of), ohy = lerp(70, 58, of);
  const dhx = lerp(40, 46, pt) + (pt > 0.3 && pt < 1 ? Math.sin(t * 0.8) * 1.5 : 0), dhy = lerp(80, 54, pt);
  return (
    <g>
      <defs><radialGradient id={`${id}s`} cx="1" cy="0" r="1"><stop offset="0" stopColor={pal.glow} stopOpacity={0.75} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
        <radialGradient id={`${id}d`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.6} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <rect x={-4} y={-4} width={108} height={104} fill={`url(#${id}s)`} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M104 ${-4 + i * 4} L${30 + i * 10} 100`} stroke={pal.glow} strokeWidth={3 - i * 0.5} opacity={0.08} />)}
      <Pithos x={26} y={86} s={0.78} pal={pal} seed={seed} />
      {/* Diógenes, tumbado y apoyado en el codo */}
      <ellipse cx={34} cy={73} rx={26 * (1 - sh)} ry={18 * (1 - sh)} fill={`url(#${id}d)`} />
      <g transform={`translate(0 ${breathe})`}>
        <path d="M30 86 Q44 81 56 86 L56 89 L30 89Z" fill={lerpHex(pal.rock, pal.wallLit, 0.25)} />
        <ellipse cx={56} cy={87} rx={3} ry={1.6} fill={pal.skin} />
        <Himation cx={30} top={70} feet={88} w={14} pal={pal} />
        <path d="M24 72 L20 84" stroke={pal.skin} strokeWidth={3} strokeLinecap="round" />
        <path d={`M35 72 Q${lerp(40, 40, pt)} ${lerp(78, 64, pt)} ${dhx} ${dhy}`} stroke={pal.skin} strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={dhx} cy={dhy} rx={1.8} ry={2.2} fill={pal.skin} />
        <Cabeza cx={30} cy={64} r={5.4} pal={pal} turn={0.6} beard bald hair={lerpHex(pal.wallLit, pal.rim, 0.1)} curls={false} mouth={pt > 0.2 ? 0.8 : 0} />
      </g>
      {/* sombra del rey sobre el viejo */}
      {sh > 0 && <g opacity={0.55 * sh}>
        <path d={`M${ax - 7} 91 L${ax + 7} 91 L40 88 Q26 78 14 80 L12 90Z`} fill={pal.ink} />
        <circle cx={9} cy={84} r={6} fill={pal.ink} />
      </g>}
      {/* guardias */}
      <g opacity={hide}>
        <Guard x={ax + 16} y={90} s={0.92} pal={pal} shake={la} t={t} k={0} />
        <Guard x={ax + 27} y={92} s={1.0} pal={pal} shake={la} t={t} k={1} />
      </g>
      {/* Alejandro */}
      <g opacity={hide} transform={`translate(0 ${breathe * 0.5})`}>
        <path d={`M${ax - 9} 50 Q${ax - 14} 70 ${ax - 12} 88 L${ax + 12} 88 Q${ax + 14} 70 ${ax + 9} 50Z`} fill={lerpHex(pal.accent, pal.ink, 0.3)} />
        <Coraza cx={ax} top={50} feet={91} w={18} pal={pal} />
        <path d={`M${ax - 8} 51 Q${ohx + 2} ${lerp(60, 56, of)} ${ohx} ${ohy}`} stroke={pal.accent} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <path d={`M${lerp(ax - 9, ax - 13, of)} ${lerp(62, 57, of)} L${ohx} ${ohy}`} stroke={pal.skin} strokeWidth={2.4} strokeLinecap="round" />
        <ellipse cx={ohx} cy={ohy} rx={1.8} ry={2.2} fill={pal.skin} />
        <path d={`M${ax + 8} 51 Q${ax + 10} 60 ${ax + 9} 68`} stroke={pal.accent} strokeWidth={3.6} fill="none" strokeLinecap="round" /><circle cx={ax + 9} cy={69} r={1.7} fill={pal.skin} />
        <path d={`M${ax - 2} 46 L${ax + 2} 46 L${ax + 2} 51 L${ax - 2} 51Z`} fill={pal.skin} />
        <Cabeza cx={ax} cy={40} r={6} pal={pal} turn={-0.6} hair={lerpHex(pal.rim, pal.rock, 0.45)} />
        <path d={`M${ax - 3} ${33.6} Q${ax} ${30} ${ax + 3} ${33.6}`} stroke={lerpHex(pal.rim, pal.rock, 0.45)} strokeWidth={2.2} fill="none" />
      </g>
    </g>
  );
};
