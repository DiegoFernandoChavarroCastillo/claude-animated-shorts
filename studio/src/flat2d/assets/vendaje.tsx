// vendaje · de noche, en el cuarto de los esclavos: Epicteto sentado en una estera contra la pared, con la pierna rota estirada y entablillada con un palo,
// se la venda con una tira de tela a la luz de una lámpara de aceite; ventanuco con barrotes y la luna. `wrap` da vueltas a la venda (las manos tiemblan; se queda vendada);
// `look` alza la cabeza y te mira (se queda); `point` se toca la sien con el índice: «esto no» (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { TunicaEsclavo } from "./esclavitud";
import { Grain } from "./grain";

export const Vendaje: AssetFC = ({ pal, p, t, seed, flick }) => {
  const wr = p.wrap ?? 0, lk = p.look ?? 0, pt = p.point ?? 0, id = `vd${seed}`;
  const wall = lerpHex(pal.wall, pal.ink, 0.2), floor = lerpHex(pal.rock, pal.ink, 0.35), band = lerpHex(pal.wallLit, pal.rock, 0.15);
  const shake = Math.sin(t * 1.7) * 0.5 * (1 - pt), turns = Math.floor(clamp01(wr) * 6.99);
  const hx = lerp(70, 58, 0.5) + Math.sin(wr * Math.PI * 7) * 3, hy = 102 + shake;
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.55} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <rect x={-2} y={-2} width={104} height={110} fill={wall} />
      <Grain n={220} w={100} h={106} seed={seed * 5 + 3} a={lerpHex(wall, pal.wallLit, 0.25)} b={pal.ink} rMax={0.9} />
      {[[8, 30, 14], [60, 22, 20], [30, 50, 10]].map(([x, y, w], i) => <path key={i} d={`M${x} ${y} l${w * 0.4} 2 l${w * 0.3} -1 l${w * 0.3} 3`} stroke={lerpHex(wall, pal.ink, 0.4)} strokeWidth={0.5} fill="none" />)}
      {/* ventanuco con barrotes y luna */}
      <rect x={66} y={34} width={18} height={14} fill={lerpHex(pal.bg, pal.wall, 0.3)} /><circle cx={78} cy={39} r={3.4} fill={pal.glow} opacity={0.85} />
      {[70, 75, 80].map((x) => <rect key={x} x={x} y={34} width={1.2} height={14} fill={pal.ink} />)}
      <rect x={66} y={34} width={18} height={14} fill="none" stroke={lerpHex(wall, pal.ink, 0.5)} strokeWidth={1.2} />
      {/* suelo y estera */}
      <rect x={-2} y={106} width={104} height={74} fill={floor} />
      <g transform="translate(0 106)"><Grain n={90} w={100} h={72} seed={seed * 9 + 2} a={pal.rock} b={pal.ink} rMax={0.8} /></g>
      <path d="M26 104 L92 104 L96 110 L22 110Z" fill={lerpHex(pal.rim, pal.rock, 0.55)} />
      {[...Array(10)].map((_, i) => <path key={i} d={`M${28 + i * 6.6} 104 L${26 + i * 7.2} 110`} stroke={lerpHex(pal.rim, pal.ink, 0.5)} strokeWidth={0.4} />)}
      {/* lámpara */}
      <circle cx={18} cy={100} r={22 + 3 * flick} fill={`url(#${id}g)`} />
      <path d="M13 106 Q18 109 23 106 L24 104 L12 104Z" fill={lerpHex(pal.rock, pal.accent, 0.35)} /><path d={`M23 104 Q25 ${100 - 2 * flick} 24 99`} stroke={pal.rim} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* Epicteto */}
      <path d="M44 104 L46 96" stroke={pal.skin} strokeWidth={3.4} strokeLinecap="round" />
      <TunicaEsclavo cx={42} top={76} hem={102} w={15} pal={pal} c={lerpHex(pal.rock, pal.wallLit, 0.22)} />
      {/* pierna rota estirada: muslo y espinilla con tablilla y venda */}
      <path d="M46 101 L62 103 L86 103" stroke={pal.skin} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M86 103 L90 99" stroke={pal.skin} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M64 100.4 L84 100.4" stroke={lerpHex(pal.rock, pal.rim, 0.25)} strokeWidth={1.2} />
      {[...Array(turns)].map((_, i) => <path key={i} d={`M${66 + i * 2.8} 100 L${68 + i * 2.8} 105.6`} stroke={band} strokeWidth={2.2} />)}
      {/* brazos: vendando → uno a la sien */}
      <path d={`M36 79 Q40 ${lerp(94, 84, pt)} ${lerp(hx - 4, 49, pt)} ${lerp(hy, 61, pt)}`} stroke={pal.skin} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d={`M48 79 Q56 92 ${hx} ${hy - 1}`} stroke={pal.skin} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <ellipse cx={hx} cy={hy - 1} rx={1.8} ry={1.5} fill={pal.skin} />
      {wr > 0 && wr < 1 && <path d={`M${hx} ${hy - 1} Q${hx + 4} ${hy - 6} ${70 + turns * 2.8} 101`} stroke={band} strokeWidth={1.4} fill="none" />}
      {pt > 0.05 && <path d={`M${lerp(hx - 4, 49, pt)} ${lerp(hy, 61, pt)} l${-2 * pt} ${-2.6 * pt}`} stroke={pal.skin} strokeWidth={1} strokeLinecap="round" />}
      <rect x={40} y={70} width={4} height={7} fill={pal.skin} />
      <g transform={`rotate(${lerp(24, 0, lk)} 42 70)`}>
        <Cabeza cx={42} cy={64} r={6} pal={pal} turn={lerp(0.6, 0, lk)} hair={lerpHex(pal.rock, pal.ink, 0.45)} eyesClosed={lerp(0.5, 0, lk)} />
        <path d="M40.2 67.6 Q42 68.8 43.8 67.4" stroke={lerpHex(pal.skin, pal.ink, 0.55)} strokeWidth={0.5} fill="none" opacity={lk} />
      </g>
    </g>
  );
};
