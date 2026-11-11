// saco_cesar · El saco de ropa de cama atado con correas a los pies de Julio César, de noche en sus aposentos; dentro va Cleopatra.
// `drop` el saco cae desde arriba y rebota con polvo (se queda); `untie` se sueltan las correas y la tela se abre (se queda);
// `emerge` Cleopatra se levanta desde dentro del saco (se queda); `look` Cleopatra lo mira de frente y alza la mano (se queda); `laugh` César echa la cabeza atrás y se ríe (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cesar, Cleo, Saco } from "./ptolomeos";

export const SacoCesar: AssetFC = ({ pal, p, t, seed }) => {
  const dr = p.drop ?? 1, un = p.untie ?? 0, em = p.emerge ?? 0, lk = p.look ?? 0, la = p.laugh ?? 0;
  const fall = clamp01(dr / 0.7), bounce = dr > 0.7 ? Math.sin(((dr - 0.7) / 0.3) * Math.PI) * 3 * (1 - dr) * 3 : 0;
  const sy = lerp(-30, 72, fall * fall) - bounce, dust = dr > 0.68 && dr < 1 ? Math.sin(((dr - 0.68) / 0.32) * Math.PI) : 0;
  const rise = clamp01(em), cy = lerp(72 + 58, 72, rise);
  const id = `sc${seed}`;
  return (
    <g>
      <defs><clipPath id={`${id}c`}><rect x={-10} y={-40} width={120} height={112.5} /></clipPath></defs>
      <ellipse cx={50} cy={72} rx={46} ry={3} fill={pal.ink} opacity={0.35} />
      <ellipse cx={40} cy={71.5} rx={30} ry={2.2} fill={lerpHex(pal.accent, pal.ink, 0.4)} opacity={0.55} />
      <Cesar x={74} y={72} s={1.08} pal={pal} t={t} turn={lerp(-0.2, -0.6, em)} arm={em * 0.3 * (1 - la)} laugh={la} />
      {em > 0.01 && <g clipPath={`url(#${id}c)`}>
        <Cleo x={33} y={cy} s={1.0} pal={pal} t={t} turn={lerp(0.2, 0.85, lk)} arm={lk * 0.35} />
      </g>}
      <Saco x={33} y={sy} s={1.0} pal={pal} t={t} open={un} straps={1 - un} breath={(1 - em) * (dr >= 1 ? 1 : 0)} rot={(1 - fall) * -12} />
      {em > 0.01 && <path d={`M20 72 Q${26 + 2 * rise} ${72 - 6 * rise} 30 ${72 - 9 * rise} M46 72 Q${40 - 2 * rise} ${72 - 6 * rise} 36 ${72 - 9 * rise}`} stroke={lerpHex(pal.wallLit, pal.rock, 0.3)} strokeWidth={2.2} fill="none" strokeLinecap="round" />}
      {dust > 0 && [...Array(7)].map((_, i) => <circle key={i} cx={33 + (i - 3) * 6 * (0.5 + dust)} cy={71 - dust * (2 + (i % 3) * 2)} r={1.4 + dust * 2} fill={lerpHex(pal.wallLit, pal.rock, 0.5)} opacity={0.5 * dust} />)}
    </g>
  );
};
