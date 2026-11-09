// multitud · una fila de políticos y filósofos griegos con túnica y manto de colores que caminan de perfil hacia la derecha, con prisa, algunos con ramas de laurel en la mano.
// `walk`: avanzan hacia la derecha con paso apresurado y salen en parte del cuadro (se quedan donde llegan): corren a felicitarlo.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";

export const Multitud: AssetFC = ({ pal, p, t }) => {
  const wk = p.walk ?? 0, adv = wk * 40;
  const man = (i: number) => {
    const x = -10 + i * 17 + adv + (hash(i) - 0.5) * 4, y = 92 - (i % 2) * 6, s = 0.9 + (i % 3) * 0.08, step = wk > 0 && wk < 1 ? Math.sin(t * 0.6 + i) : 0;
    const cloth = lerpHex(i % 3 === 0 ? pal.accent : i % 3 === 1 ? pal.wall : pal.rock, pal.wallLit, 0.25 + 0.1 * (i % 2));
    return (
      <g key={i} transform={`translate(${x} ${y + Math.abs(step) * -0.8}) scale(${s})`}>
        <path d={`M-2 -18 L${-4 - step * 3} 0 M2 -18 L${4 + step * 3} 0`} stroke={pal.skin} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M-6 -44 Q0 -46 6 -44 L8 -14 L-8 -14Z" fill={lerpHex(pal.wallLit, pal.skin, 0.15)} />
        <path d="M-6 -44 Q4 -40 8 -14 L-8 -14 Q-9 -30 -6 -44Z" fill={cloth} />
        <path d={`M5 -40 L${10 + step * 1.5} -26`} stroke={pal.skin} strokeWidth={2.4} strokeLinecap="round" />
        {i % 2 === 0 && <g><path d="M10 -26 L14 -38" stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={0.6} />{[0, 1, 2].map((l) => <ellipse key={l} cx={12 + l * 0.6} cy={-30 - l * 3} rx={1.6} ry={0.8} fill={lerpHex(pal.rim, pal.rock, 0.3)} transform={`rotate(-40 ${12 + l * 0.6} ${-30 - l * 3})`} />)}</g>}
        <Cabeza cx={1} cy={-50} r={5} pal={pal} turn={0.8} beard={hash(i + 3) > 0.4} />
      </g>
    );
  };
  return <g>{[...Array(7)].map((_, i) => man(i))}</g>;
};
