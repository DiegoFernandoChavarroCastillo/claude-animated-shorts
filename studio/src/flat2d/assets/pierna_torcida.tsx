// pierna_torcida · el amo, sentado al borde del diván, agarra con las dos manos el tobillo de Epicteto, que está sentado en el suelo con la pierna estirada
// hacia él, apoyado en las manos y SONRIENDO tranquilo. `twist` el amo tuerce el pie y se inclina; aparecen marcas de tensión en la rodilla (se queda);
// `snap` la espinilla se dobla en un ángulo imposible con un estallido de grietas (se queda rota); `speak` Epicteto habla, tranquilo (vuelve);
// `beckon` (con `grab` en el mismo beat, antes de agarrar) el amo alza la mano y lo llama con el dedo; `grab` las manos del amo pasan de sus rodillas al tobillo (sin `grab` en el beat ya lo tiene agarrado);
// `release` el amo suelta, se echa atrás y aparta la cara (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { CabezaAmo, TunicaEsclavo } from "./esclavitud";

export const PiernaTorcida: AssetFC = ({ pal, p, t }) => {
  const tw = p.twist ?? 0, sn = p.snap ?? 0, sp = p.speak ?? 0, rl = p.release ?? 0, breathe = Math.sin(t * 0.07) * 0.3;
  const wood = lerpHex(pal.rock, pal.ink, 0.15), tunic = lerpHex(pal.accent, pal.wall, 0.25);
  // pierna de Epicteto: cadera → rodilla → tobillo (la espinilla gira hacia abajo al romperse)
  const hip = [72, 66], knee = [57, 60], baseA = 196 * Math.PI / 180, shinA = (196 - 62 * clamp01(sn * 1.4)) * Math.PI / 180, half = 7;
  const mid = [knee[0] + Math.cos(baseA) * half, knee[1] + Math.sin(baseA) * half];
  const ank = [mid[0] + Math.cos(shinA) * half, mid[1] + Math.sin(shinA) * half];
  const footRot = -70 * tw + 30 * clamp01(sn * 1.4);
  const gr = p.grab ?? 1, bk = p.beckon ?? 0, curl = bk > 0.5 && gr < 0.5 ? Math.abs(Math.sin(t * 0.35)) : 0;
  const lean = tw * 3 * (1 - rl) - rl * 6, grip = (1 - rl) * gr, off = 1 - grip;
  // manos del amo: en el tobillo, girando con el pie → sobre sus rodillas
  const rot = Math.sin(tw * Math.PI * 0.5) * 2.4;
  const h1 = [lerp(lerp(ank[0] - 1, 30, off), 40, bk * (1 - gr)), lerp(lerp(ank[1] - 2 + rot, 50, off), 22, bk * (1 - gr))], h2 = [lerp(ank[0] + 1.5, 22, off), lerp(ank[1] + 2.4 - rot, 52, off)];
  const talk = sp > 0 && sp < 1 ? Math.abs(Math.sin(sp * Math.PI * 4)) : 0, crack = sn > 0 && sn < 0.7 ? 1 - sn / 0.7 : 0;
  return (
    <g>
      <ellipse cx={50} cy={74} rx={48} ry={2} fill={pal.ink} opacity={0.45} />
      {/* diván */}
      <rect x={-4} y={48} width={36} height={8} rx={1.5} fill={wood} /><path d="M-4 48 L32 48" stroke={pal.rim} strokeWidth={0.6} opacity={0.6} />
      {[2, 26].map((x) => <path key={x} d={`M${x} 56 L${x - 1} 74 L${x + 3} 74 L${x + 4} 56Z`} fill={wood} />)}
      <rect x={-4} y={43} width={36} height={6} rx={2.6} fill={lerpHex(pal.wallLit, pal.wall, 0.45)} />
      {/* el amo sentado */}
      <g transform={`translate(${lean} 0)`}>
        <path d="M12 44 Q10 58 16 62 L34 62 Q38 56 34 46Z" fill={lerpHex(pal.wallLit, pal.rock, 0.3)} />
        <path d="M20 62 L19 73 M30 62 L31 73" stroke={pal.skin} strokeWidth={3} strokeLinecap="round" />
        <ellipse cx={22} cy={36} rx={12} ry={11} fill={tunic} />
        <path d="M30 28 Q35 36 32 46" stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.5} />
        <path d={`M28 30 Q${lerp(h1[0], 34, 0.4)} ${h1[1] - 8} ${h1[0]} ${h1[1]}`} stroke={pal.skin} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <path d={`M16 32 Q${lerp(h2[0], 22, 0.5)} ${h2[1] - 4} ${h2[0]} ${h2[1]}`} stroke={pal.skin} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <path d="M26 28 Q29 27 31 31" stroke={tunic} strokeWidth={4.6} strokeLinecap="round" />
        <g transform={`rotate(${tw * 8 * grip - rl * 18} 22 24)`}>
          <CabezaAmo cx={22} cy={18} r={7} pal={pal} turn={lerp(0.7, -0.6, rl)} grin={tw * grip} look={rl * 0.6} />
        </g>
      </g>
      {/* Epicteto sentado en el suelo, apoyado en las manos */}
      <g transform={`translate(0 ${breathe})`}>
        <path d="M80 60 L88 70" stroke={pal.skin} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M76 68 L83 57 L88 72" stroke={pal.skin} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx={89} cy={72.6} rx={2.4} ry={1.1} fill={lerpHex(pal.skin, pal.ink, 0.25)} />
        <TunicaEsclavo cx={73} top={42} hem={68} w={13} pal={pal} c={lerpHex(pal.rock, pal.wallLit, 0.22)} />
        <path d="M67 44 Q62 56 64 70" stroke={pal.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d={`M${hip[0]} ${hip[1]} L${knee[0]} ${knee[1]}`} stroke={pal.skin} strokeWidth={4} strokeLinecap="round" />
        <path d={`M${knee[0]} ${knee[1]} L${mid[0]} ${mid[1]} L${ank[0]} ${ank[1]}`} stroke={pal.skin} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${hip[0] + 2} ${hip[1] - 3} L${knee[0] + 2} ${knee[1] - 2}`} stroke={lerpHex(pal.rock, pal.wallLit, 0.22)} strokeWidth={4.2} strokeLinecap="round" />
        <g transform={`rotate(${footRot} ${ank[0]} ${ank[1]})`}>
          <path d={`M${ank[0]} ${ank[1] - 1.4} L${ank[0] - 4} ${ank[1] - 3.6} L${ank[0] - 4.6} ${ank[1] - 1.6} L${ank[0]} ${ank[1] + 1.4}Z`} fill={pal.skin} />
        </g>
        {/* tensión y grietas en la rodilla */}
        {tw > 0.2 && sn < 0.1 && [0, 1, 2].map((i) => <path key={i} d={`M${knee[0] - 3 + i * 3} ${knee[1] - 4 - (i % 2)} q1 -1.5 2 0`} stroke={pal.glow} strokeWidth={0.5} fill="none" opacity={clamp01((tw - 0.2) * 2) * (0.5 + 0.5 * Math.sin(t * 0.8 + i))} />)}
        {crack > 0 && [...Array(7)].map((_, i) => { const a = i * 0.9 + 0.3, r1 = 2, r2 = 6 + 12 * (1 - crack) + (i % 2) * 3;
          return <path key={i} d={`M${mid[0] + Math.cos(a) * r1} ${mid[1] + Math.sin(a) * r1} L${mid[0] + Math.cos(a + 0.2) * (r1 + r2) * 0.6} ${mid[1] + Math.sin(a - 0.2) * (r1 + r2) * 0.6} L${mid[0] + Math.cos(a) * (r1 + r2)} ${mid[1] + Math.sin(a) * (r1 + r2)}`} stroke={pal.wallLit} strokeWidth={1.2} fill="none" opacity={crack} />; })}
        {sn > 0.3 && <ellipse cx={mid[0]} cy={mid[1] + 0.4} rx={2.4} ry={1.8} fill={lerpHex(pal.skin, pal.accent, 0.45)} opacity={clamp01((sn - 0.3) * 3)} />}
        <rect x={71} y={36} width={4} height={7} fill={pal.skin} />
        <Cabeza cx={73} cy={31} r={5.8} pal={pal} turn={-0.55} curls hair={lerpHex(pal.rock, pal.ink, 0.45)} mouth={talk * 0.6} />
        {/* la sonrisa tranquila */}
        <path d={`M70.4 34.3 Q72 35.8 73.6 34.1`} stroke={lerpHex(pal.skin, pal.ink, 0.55)} strokeWidth={0.55} fill="none" strokeLinecap="round" />
        {tw > 0.4 && <path d={`M77.6 ${27 + (t * 0.08) % 3} q0.6 1 0 1.6 q-0.6 -0.6 0 -1.6`} fill={pal.glow} opacity={0.7} />}
      </g>
      {/* manos del amo encima del tobillo */}
      <g transform={`translate(${lean} 0)`}>
        <ellipse cx={h1[0]} cy={h1[1]} rx={2.7} ry={2.2} fill={lerpHex(pal.skin, pal.ink, 0.06)} />
        <ellipse cx={h2[0]} cy={h2[1]} rx={2.7} ry={2.2} fill={lerpHex(pal.skin, pal.ink, 0.12)} />
        <circle cx={h1[0] - 1} cy={h1[1] - 0.6} r={0.7} fill={pal.rim} />
        {bk > 0.3 && gr < 0.5 && <path d={`M${h1[0] + 2} ${h1[1] - 0.5} q${2.8 - 1.8 * curl} ${-1.4 + 0.6 * curl} ${3.2 - 2.6 * curl} ${0.6 + 2 * curl}`} stroke={pal.skin} strokeWidth={1.2} fill="none" strokeLinecap="round" />}
      </g>
    </g>
  );
};
