// banquete · el amo romano, gordo y aburrido, recostado en un diván con cojines junto a una mesa baja con uvas, pan y una jarra; copa de vino en la mano.
// `drink` se lleva la copa a la boca y bebe (vuelve); `look` gira la cabeza a la derecha y entorna los ojos, buscando (se queda); `beckon` estira el brazo y llama con el dedo índice (se queda llamando).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { CabezaAmo } from "./esclavitud";

export const Banquete: AssetFC = ({ pal, p, t }) => {
  const dr = Math.sin(clamp01(p.drink ?? 0) * Math.PI), lk = p.look ?? 0, bk = p.beckon ?? 0, breathe = Math.sin(t * 0.06) * 0.4;
  const wood = lerpHex(pal.rock, pal.ink, 0.15), cushion = lerpHex(pal.wall, pal.accent, 0.3), tunic = lerpHex(pal.accent, pal.wall, 0.25);
  // mano derecha: copa en reposo junto al vientre → a la boca (drink) → brazo estirado llamando (beckon)
  let hx = lerp(44, 30, dr), hy = lerp(50, 34, dr);
  hx = lerp(hx, 64, bk); hy = lerp(hy, 36, bk);
  const curl = bk > 0.6 ? Math.abs(Math.sin(t * 0.35)) : 0;
  return (
    <g>
      <ellipse cx={46} cy={79} rx={44} ry={2.4} fill={pal.ink} opacity={0.45} />
      {/* diván */}
      {[12, 74].map((x) => <path key={x} d={`M${x} 64 L${x - 1} 79 L${x + 3} 79 L${x + 4} 64Z`} fill={wood} />)}
      <rect x={6} y={58} width={74} height={7} rx={1.5} fill={wood} /><path d="M6 58 L80 58" stroke={pal.rim} strokeWidth={0.6} opacity={0.6} />
      <path d="M6 58 Q4 40 12 38 L14 58Z" fill={wood} />
      <rect x={8} y={52} width={70} height={7} rx={3} fill={lerpHex(pal.wallLit, pal.wall, 0.45)} />
      <ellipse cx={16} cy={50} rx={9} ry={5} fill={cushion} /><path d="M9 50 Q16 46 23 50" stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.6} />
      {/* piernas bajo el manto */}
      <path d="M40 52 Q60 46 76 50 Q78 54 74 56 L42 57Z" fill={lerpHex(pal.wallLit, pal.rock, 0.3)} />
      {[48, 56, 64].map((x) => <path key={x} d={`M${x} 49 Q${x + 2} 53 ${x + 1} 56`} stroke={lerpHex(pal.wallLit, pal.ink, 0.4)} strokeWidth={0.5} fill="none" />)}
      <ellipse cx={77} cy={51} rx={3} ry={2} fill={pal.skin} />
      {/* torso: vientre enorme con túnica */}
      <g transform={`translate(0 ${breathe})`}>
        <ellipse cx={34} cy={45} rx={14} ry={11} fill={tunic} />
        <path d="M24 38 Q34 33 44 40" stroke={lerpHex(tunic, pal.ink, 0.35)} strokeWidth={0.7} fill="none" />
        <path d="M42 36 Q48 44 44 54" stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.5} />
        {/* brazo izquierdo apoyado en el cojín */}
        <path d="M24 40 L16 48" stroke={tunic} strokeWidth={6} strokeLinecap="round" /><ellipse cx={15} cy={49} rx={2.6} ry={2} fill={pal.skin} />
        <g transform={`rotate(${lerp(0, 10, lk) - 6 * dr} 26 34)`}>
          <CabezaAmo cx={25} cy={28} r={7} pal={pal} turn={lerp(0.35, 0.9, lk)} look={lk} grin={Math.max(lk * 0.6, bk)} />
        </g>
        {/* brazo derecho con la copa o llamando */}
        <path d={`M38 40 Q${lerp(44, 52, bk)} ${lerp(46, 38, bk)} ${hx} ${hy}`} stroke={pal.skin} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <path d={`M36 38 Q39 37 41 41`} stroke={tunic} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={hx} cy={hy} rx={2.3} ry={2} fill={pal.skin} />
        <circle cx={hx - 1.4} cy={hy + 0.6} r={0.7} fill={pal.rim} />
        {bk < 0.4 ? <g opacity={1 - bk * 2.5}>
          <path d={`M${hx - 2.4} ${hy - 4.6} L${hx + 2.4} ${hy - 4.6} L${hx + 1.2} ${hy - 1.6} L${hx - 1.2} ${hy - 1.6}Z`} fill={lerpHex(pal.rim, pal.rock, 0.2)} />
          <ellipse cx={hx} cy={hy - 4.5} rx={2.4} ry={0.6} fill={lerpHex(pal.accent, pal.ink, 0.4)} />
        </g> : <path d={`M${hx + 2} ${hy - 0.5} q${2.8 - 1.8 * curl} ${-1.4 + 0.6 * curl} ${3.2 - 2.6 * curl} ${0.6 + 2 * curl}`} stroke={pal.skin} strokeWidth={1.2} fill="none" strokeLinecap="round" />}
      </g>
      {/* mesa baja con uvas, pan y jarra */}
      <ellipse cx={88} cy={64} rx={12} ry={2.6} fill={lerpHex(wood, pal.rim, 0.15)} />
      <path d="M86 65 L85 79 M90 65 L91 79" stroke={wood} strokeWidth={1.4} />
      {[[82, 61], [84, 60], [83, 62.4], [85, 62], [86.4, 60.6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.1} fill={lerpHex(pal.wall, pal.accent, 0.2)} />)}
      <ellipse cx={90} cy={61.6} rx={3} ry={1.8} fill={lerpHex(pal.rim, pal.rock, 0.4)} />
      <path d="M94 62 Q93 56 95 54 L97 54 Q99 56 98 62Z" fill={lerpHex(pal.rock, pal.accent, 0.35)} /><path d="M98 56 Q100 57 98 59" stroke={lerpHex(pal.rock, pal.accent, 0.35)} strokeWidth={0.6} fill="none" />
    </g>
  );
};
