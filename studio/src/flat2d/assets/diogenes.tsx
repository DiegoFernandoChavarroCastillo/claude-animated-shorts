// diogenes · el filósofo viejo de pie: calvo, barba blanca larga, descalzo y con un manto raído sobre un hombro; lleva un vaso de barro en la mano.
// `throw` tira el vaso, que vuela y se rompe en el suelo (se queda sin él); `lamp` alza una lámpara de aceite encendida y mira a un lado y a otro, buscando;
// `laugh` echa la cabeza atrás y se ríe a carcajadas (se queda riendo). `bundle` le pone un bulto de tela bajo el manto con una pata de pollo asomando
// (sin vaso); `fling` lo lanza hacia delante y abajo (se queda sin él); `arms` abre los brazos en alto y grita; `spit` escupe al suelo (todas se quedan).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Himation } from "./romanos";

export const Diogenes: AssetFC = ({ pal, p, t, seed }) => {
  const id = `dg${seed}`, th = p.throw ?? 0, lp = p.lamp ?? 0, la = p.laugh ?? 0, breathe = Math.sin(t * 0.07) * 0.5;
  const bd = p.bundle ?? 0, fl = p.fling ?? 0, aw = clamp01((p.arms ?? 0) * 1.6), sp = p.spit ?? 0, noCup = bd > 0 || fl > 0 || aw > 0;
  const legC = lerpHex(pal.rim, "#E8B04A", 0.5), cloak = lerpHex(pal.rock, pal.wallLit, 0.25);
  const clay = lerpHex(pal.rock, pal.accent, 0.35), shake = la > 0.1 ? Math.sin(t * 1.3) * 0.8 * la : 0;
  // brazo izquierdo del personaje (derecha del cuadro): con el vaso → lanzándolo
  const swing = Math.sin(clamp01(th * 1.6) * Math.PI);
  const flSw = Math.sin(clamp01(fl * 1.4) * Math.PI * 0.5);
  let lhx = lerp(66, 74, swing), lhy = lerp(94, 62, swing);
  if (bd > 0 || fl > 0) { lhx = lerp(66, 84, flSw); lhy = lerp(86, 96, flSw); }
  lhx = lerp(lhx, 86, aw); lhy = lerp(lhy, 30, aw);
  const cupU = clamp01((th - 0.35) / 0.5), cupX = lerp(lhx + 2, 92, cupU), cupY = lerp(lhy, 134, cupU) - Math.sin(cupU * Math.PI) * 26;
  // brazo derecho (izquierda del cuadro): abajo → alza la lámpara
  const rhx = lerp(lerp(32, 26, lp), 14, aw), rhy = lerp(lerp(100, 34, lp), 32, aw), look = lp > 0.6 ? Math.sin(t * 0.09) * 0.8 : 0.2;
  const lean = sp > 0 && sp < 1 ? Math.sin(sp * Math.PI) * 10 : 0, dropU = clamp01((sp - 0.35) / 0.4), bundleOn = bd > 0 && fl < 0.35;
  return (
    <g transform={`translate(${shake} ${breathe})`}>
      <defs><radialGradient id={`${id}l`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={50} cy={137} rx={24} ry={2.8} fill={pal.ink} opacity={0.45} />
      <rect x={42} y={112} width={6} height={24} rx={2} fill={pal.skin} /><rect x={52} y={112} width={6} height={24} rx={2} fill={pal.skin} />
      <ellipse cx={44} cy={136} rx={4.4} ry={1.6} fill={lerpHex(pal.skin, pal.ink, 0.3)} /><ellipse cx={57} cy={136} rx={4.4} ry={1.6} fill={lerpHex(pal.skin, pal.ink, 0.3)} />
      <path d="M36 62 Q50 58 64 62 L64 92 L36 92Z" fill={lerpHex(pal.skin, pal.ink, 0.12)} />
      <path d="M44 70 Q50 73 56 70" stroke={lerpHex(pal.skin, pal.ink, 0.35)} strokeWidth={0.6} fill="none" />
      <Himation cx={50} top={63} feet={124} w={32} pal={pal} />
      <path d={`M37 64 Q${lerp(30, 30, lp)} ${lerp(84, 56, lp)} ${rhx} ${rhy}`} stroke={pal.skin} strokeWidth={4.6} fill="none" strokeLinecap="round" />
      <ellipse cx={rhx} cy={rhy} rx={2.8} ry={3.4} fill={pal.skin} />
      <path d={`M63 64 Q${lerp(70, 72, swing)} ${lerp(80, 66, swing)} ${lhx} ${lhy}`} stroke={pal.skin} strokeWidth={4.6} fill="none" strokeLinecap="round" />
      <ellipse cx={lhx} cy={lhy} rx={2.8} ry={3.4} fill={pal.skin} />
      {/* vaso: en la mano, volando o roto */}
      {/* bulto bajo el manto con la pata asomando */}
      {bundleOn && <g opacity={clamp01(bd * 3) * (1 - clamp01((fl - 0.2) * 7))}>
        <ellipse cx={lhx + 1} cy={lhy - 2} rx={12.5} ry={10.5} fill={lerpHex(cloak, pal.ink, 0.45)} />
        <ellipse cx={lhx} cy={lhy - 3} rx={11.5} ry={9.6} fill={lerpHex(cloak, pal.wallLit, 0.12)} />
        <path d={`M${lhx - 9} ${lhy - 8} Q${lhx} ${lhy - 1} ${lhx + 9} ${lhy - 9} M${lhx - 7} ${lhy + 2} Q${lhx + 1} ${lhy - 2} ${lhx + 10} ${lhy + 1}`} stroke={lerpHex(cloak, pal.ink, 0.4)} strokeWidth={0.9} fill="none" />
        <path d={`M${lhx + 6} ${lhy + 4} L${lhx + 8} ${lhy + 15}`} stroke={legC} strokeWidth={1.8} strokeLinecap="round" />
        {[[-4, 3], [0, 4.4], [4, 3], [2, -1.6]].map(([dx, dy], i) => <path key={i} d={`M${lhx + 8} ${lhy + 15} l${dx} ${dy}`} stroke={legC} strokeWidth={1.3} strokeLinecap="round" />)}
      </g>}
      {/* escupitajo */}
      {sp > 0.35 && sp < 0.75 && <circle cx={lerp(58, 74, dropU)} cy={lerp(52, 135, dropU * dropU)} r={1.1} fill={lerpHex(pal.wallLit, pal.wall, 0.3)} />}
      {sp >= 0.75 && <ellipse cx={74} cy={135.6} rx={2.6} ry={0.7} fill={lerpHex(pal.wallLit, pal.wall, 0.4)} opacity={0.8} />}
      {!noCup && th < 0.35 && <path d={`M${lhx - 1} ${lhy - 7} L${lhx + 6} ${lhy - 7} L${lhx + 5} ${lhy - 1} L${lhx} ${lhy - 1}Z`} fill={clay} />}
      {!noCup && th >= 0.35 && cupU < 1 && <g transform={`translate(${cupX} ${cupY}) rotate(${cupU * 400})`}><path d="M-3.5 -3 L3.5 -3 L2.6 3 L-2.6 3Z" fill={clay} /></g>}
      {!noCup && cupU >= 1 && [[-5, -1, 20], [1, -2, -30], [6, 0, 60], [-1, 1, 5]].map(([dx, dy, r], i) => <path key={i} d="M-1.6 -1 L1.8 -1.2 L1 1.2Z" transform={`translate(${92 + dx} ${135 + dy}) rotate(${r})`} fill={clay} />)}
      {/* lámpara */}
      {lp > 0.05 && <g opacity={clamp01(lp * 3)}>
        <circle cx={rhx} cy={rhy - 6} r={16 + 3 * Math.sin(t * 0.3)} fill={`url(#${id}l)`} />
        <path d={`M${rhx - 5} ${rhy - 2} Q${rhx} ${rhy + 2} ${rhx + 6} ${rhy - 2} L${rhx + 8} ${rhy - 4} L${rhx + 4} ${rhy - 4} Q${rhx} ${rhy - 6} ${rhx - 5} ${rhy - 2}Z`} fill={clay} />
        <path d={`M${rhx + 7} ${rhy - 4} Q${rhx + 9} ${rhy - 10 - Math.sin(t * 0.5)} ${rhx + 8} ${rhy - 12}`} stroke={pal.rim} strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx={rhx + 8} cy={rhy - 7} r={1.4} fill={pal.glow} />
      </g>}
      <path d="M46 52 L54 52 L54 62 L46 62Z" fill={pal.skin} />
      <g transform={`rotate(${-16 * la + lean - 6 * aw} 50 56)`}>
        <Cabeza cx={50} cy={44} r={10} pal={pal} beard bald turn={look} hair={lerpHex(pal.wallLit, pal.rim, 0.1)} curls={false} mouth={aw > 0.3 ? 0.9 + 0.1 * Math.sin(t * 0.9) : la > 0.1 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 0.7)) : 0} />
        <path d={`M43 58 Q50 ${70 + la * 2} 57 58`} fill={lerpHex(pal.wallLit, pal.rim, 0.1)} />
      </g>
      {la > 0.2 && [0, 1, 2].map((i) => <text key={i} x={64 + i * 8} y={34 - i * 6 + Math.sin(t * 0.5 + i)} fontSize={7} fontFamily="Georgia, serif" fill={pal.wallLit} opacity={clamp01(la * 2 - 0.4)}>ja</text>)}
    </g>
  );
};
