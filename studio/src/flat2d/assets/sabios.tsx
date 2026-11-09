// sabios · dos sabios desnudos de la India (gimnosofistas), flacos, con barba y pelo largo recogido, de pie en la tierra mirando a la izquierda.
// `stamp`: el de delante alza el pie y da un pisotón; sale un anillo de polvo y una marca de la huella en el suelo: «solo posees la tierra que pisas» (se queda la huella).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";

export const Sabios: AssetFC = ({ pal, p, t }) => {
  const st = p.stamp ?? 0, lift = Math.sin(clamp01(st * 1.6) * Math.PI) * 12, dust = clamp01((st - 0.55) / 0.45);
  const hair = lerpHex(pal.ink, pal.rock, 0.3), earth = lerpHex(pal.rock, pal.wall, 0.3);
  const sage = (x: number, s: number, front: boolean) => (
    <g transform={`translate(${x} 88) scale(${s})`}>
      <path d={`M-3 -30 L-4 0`} stroke={pal.skin} strokeWidth={3.4} strokeLinecap="round" />
      <path d={`M3 -30 L${front ? -2 : 4} ${front ? -lift : 0}`} stroke={pal.skin} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M-7 -60 Q0 -63 7 -60 L6 -30 L-6 -30Z" fill={pal.skin} />
      {[0, 1, 2].map((r) => <path key={r} d={`M-4 ${-52 + r * 4} Q0 ${-51 + r * 4} 4 ${-52 + r * 4}`} stroke={lerpHex(pal.skin, pal.ink, 0.3)} strokeWidth={0.5} fill="none" />)}
      <path d="M-6.5 -33 L6.5 -33 L5 -26 L-5 -26Z" fill={lerpHex(pal.wallLit, pal.accent, 0.3)} />
      <path d="M-6 -58 Q-12 -46 -10 -36" stroke={pal.skin} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d={`M6 -58 Q${front ? 2 : 10} -46 ${front ? -4 : 9} ${front ? -40 : -36}`} stroke={pal.skin} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <Cabeza cx={0} cy={-68} r={6} pal={pal} beard turn={-0.6} hair={hair} />
      <circle cx={2} cy={-76} r={3.4} fill={hair} />
    </g>
  );
  return (
    <g>
      <ellipse cx={50} cy={89} rx={44} ry={3} fill={pal.ink} opacity={0.35} />
      {sage(68, 0.95, false)}
      {sage(44, 1.05, true)}
      {dust > 0 && <g>
        {[0, 1].map((i) => { const u = clamp01(dust - i * 0.2); return <ellipse key={i} cx={lerp(42, 42, u)} cy={88} rx={4 + u * 22} ry={1 + u * 3} fill="none" stroke={earth} strokeWidth={1.4 * (1 - u)} opacity={1 - u} />; })}
        <ellipse cx={42} cy={88.5} rx={5} ry={1.4} fill={lerpHex(earth, pal.ink, 0.4)} opacity={clamp01(dust * 3)} />
      </g>}
      {st > 0.9 && <ellipse cx={42} cy={88.5} rx={5} ry={1.4} fill={pal.rim} opacity={0.2 + 0.1 * Math.sin(t * 0.2)} />}
    </g>
  );
};
