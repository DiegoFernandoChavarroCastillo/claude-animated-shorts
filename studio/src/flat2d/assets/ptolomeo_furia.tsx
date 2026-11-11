// ptolomeo_furia · Al amanecer Ptolomeo XIII entra y ve a su hermana Cleopatra junto a César; sale gritando que lo han
// traicionado y se arranca la diadema (Dion 42.35). Cleopatra y César al fondo a la izquierda; el rey niño en primer plano.
// `see` Ptolomeo entra por la derecha y se queda helado, boca abierta (se queda); `shout` alza los puños y grita, temblando
// de rabia (se queda); `tear` se arranca la diadema y la tira al suelo, donde rebota y queda tirada (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { Cesar, Cleo, Diadema, gold } from "./ptolomeos";

export const PtolomeoFuria: AssetFC = ({ pal, p, t }) => {
  const see = p.see ?? 0, sh = p.shout ?? 0, tr = p.tear ?? 0;
  const ease = (x: number) => 1 - (1 - clamp01(x)) ** 3;
  const enter = sh > 0 || tr > 0 ? 1 : ease(see * 1.6), shake = sh > 0 && tr < 1 ? Math.sin(t * 2.1) * 0.6 * clamp01(sh * 3) : 0;
  const kx = lerp(104, 72, enter) + shake, mouth = Math.max(clamp01(see * 2) * 0.7, clamp01(sh * 3));
  // brazos: a los lados → puños arriba (grito) → mano a la cabeza y lanzamiento hacia delante (diadema)
  const grab = clamp01(tr * 2.5), thr = clamp01((tr - 0.4) / 0.25), up = clamp01(sh * 2.5);
  const lh = { x: lerp(-9, -13, up), y: lerp(-14, -50, up) };
  const rh = { x: lerp(lerp(9, 13, up), lerp(3, -16, thr), grab), y: lerp(lerp(-14, -50, up), lerp(-50, -36, thr), grab) };
  // vuelo de la diadema (coordenadas del rey, escala 1.15): de la cabeza al suelo, a su izquierda, con un rebote
  const fly = clamp01((tr - 0.45) / 0.45), bounce = Math.abs(Math.sin(fly * Math.PI * 1.6)) * (1 - fly);
  const dx = lerp(0, -30, fly), dy = fly < 1 ? lerp(-49, -1.5, fly) - 22 * Math.sin(fly * Math.PI) * (1 - fly * 0.6) - bounce * 6 : -1.5;
  const robe = lerpHex(pal.wallLit, pal.glow, 0.2), anger = clamp01(sh * 3) * (tr < 1 ? 1 : 0.6);
  const arm = (h: { x: number; y: number }, sx: number) => (
    <g>
      <path d={`M${sx} -33 Q${(sx + h.x) / 2 + sx * 0.6} ${(-33 + h.y) / 2 + 3} ${h.x} ${h.y}`} stroke={pal.skin} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <circle cx={h.x} cy={h.y} r={1.7} fill={pal.skin} />
    </g>
  );
  return (
    <g>
      <ellipse cx={50} cy={72} rx={46} ry={3} fill={pal.ink} opacity={0.35} />
      {/* al fondo: Cleopatra junto a César */}
      <Cesar x={30} y={70} s={0.86} pal={pal} t={t} turn={0.35} />
      <Cleo x={16} y={70} s={0.82} pal={pal} t={t} turn={0.3} />
      {/* el rey niño */}
      <g transform={`translate(${kx} 72) scale(1.15)`}>
        <ellipse cx={0} cy={0} rx={9} ry={1.6} fill={pal.ink} opacity={0.3} />
        {arm(lh, -5)}
        <path d="M-6 -36 Q0 -38 6 -36 L8 0 L-8 0Z" fill={robe} />
        <path d="M-6 -36 Q0 -38 6 -36" stroke={gold(pal)} strokeWidth={2} fill="none" />
        <path d="M-7.5 -2 L7.5 -2" stroke={gold(pal)} strokeWidth={0.8} />
        <rect x={-1.4} y={-40} width={2.8} height={4} fill={pal.skin} />
        <Cabeza cx={0} cy={-45} r={5} pal={pal} turn={-0.6} curls hair={lerpHex(pal.ink, pal.rock, 0.3)} mouth={mouth} />
        {/* cejas de rabia */}
        <g opacity={anger}>
          <path d="M-4.2 -48.4 L-1.6 -47" stroke={pal.ink} strokeWidth={0.7} strokeLinecap="round" />
          <path d="M-0.4 -47 L2.2 -48.4" stroke={pal.ink} strokeWidth={0.7} strokeLinecap="round" />
          {[0, 1, 2].map((i) => <path key={i} d={`M${-9 - i * 1.2} ${-55 + i * 4} l-3 ${-1.5 + i * 1.5}`} stroke={pal.accent} strokeWidth={0.8} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 0.9 + i)} />)}
        </g>
        {arm(rh, 5)}
        {fly <= 0 && <Diadema cx={rh.x * grab} cy={lerp(-49, rh.y + 1, grab)} r={5} pal={pal} />}
        {fly > 0 && <g transform={`rotate(${fly * 420} ${dx} ${dy})`}><Diadema cx={dx} cy={dy} r={5} pal={pal} shine={fly < 1 ? 0.4 : 0} /></g>}
      </g>
    </g>
  );
};
