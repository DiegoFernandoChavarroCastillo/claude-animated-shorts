// esclavos · tres esclavos de pie en fila, sirviendo: dos con ánforas de vino al hombro y, a la derecha, Epicteto, el más joven y flaco, con una bandeja de copas.
// `look_down` los dos de la izquierda bajan la cabeza (se quedan); `flinch` se encogen y retroceden un paso (se quedan); `calm` Epicteto alza la barbilla, tranquilo (se queda).
import React from "react";
import { type AssetFC } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { TunicaEsclavo } from "./esclavitud";

export const Esclavos: AssetFC = ({ pal, p, t }) => {
  const ld = p.look_down ?? 0, fl = p.flinch ?? 0, cm = p.calm ?? 0, clay = lerpHex(pal.rock, pal.accent, 0.35);
  const one = (x: number, w: number, k: number, epic: boolean) => {
    const b = Math.sin(t * 0.07 + k) * 0.3, dx = epic ? 0 : -fl * 3, sq = epic ? 1 : 1 - fl * 0.05, legW = w * 0.2;
    return (
      <g key={k} transform={`translate(${dx} ${b}) translate(${x} 75) scale(1 ${sq}) translate(${-x} -75)`}>
        <ellipse cx={x} cy={74.6} rx={w * 0.7} ry={1.2} fill={pal.ink} opacity={0.45} />
        {[-1, 1].map((s) => <rect key={s} x={x + s * w * 0.17 - legW / 2} y={58} width={legW} height={16.5} rx={legW * 0.4} fill={pal.skin} />)}
        <TunicaEsclavo cx={x} top={36} hem={60} w={w} pal={pal} c={epic ? lerpHex(pal.rock, pal.wallLit, 0.22) : undefined} />
        {/* brazos */}
        {epic ? <>
          <path d={`M${x - w * 0.45} 38 Q${x - w * 0.55} 46 ${x - w * 0.25} 50`} stroke={pal.skin} strokeWidth={w * 0.16} fill="none" strokeLinecap="round" />
          <path d={`M${x + w * 0.45} 38 Q${x + w * 0.6} 46 ${x + w * 0.3} 50`} stroke={pal.skin} strokeWidth={w * 0.16} fill="none" strokeLinecap="round" />
          <ellipse cx={x} cy={50} rx={w * 0.75} ry={1.3} fill={lerpHex(pal.rim, pal.rock, 0.3)} />
          {[-0.4, 0, 0.4].map((o, i) => <path key={i} d={`M${x + o * w - 1.2} 49 L${x + o * w + 1.2} 49 L${x + o * w + 0.7} 46 L${x + o * w - 0.7} 46Z`} fill={lerpHex(pal.rim, pal.rock, 0.2)} />)}
        </> : <>
          <path d={`M${x - w * 0.45} 38 L${x - w * 0.55} 54`} stroke={pal.skin} strokeWidth={w * 0.18} strokeLinecap="round" />
          <path d={`M${x + w * 0.45} 38 Q${x + w * 0.7} 30 ${x + w * 0.4} 24`} stroke={pal.skin} strokeWidth={w * 0.18} fill="none" strokeLinecap="round" />
          <g transform={`rotate(-28 ${x + w * 0.45} 24)`}>
            <path d={`M${x + w * 0.1} 16 Q${x + w * 0.5} 10 ${x + w * 0.9} 16 Q${x + w} 24 ${x + w * 0.5} 32 Q${x} 24 ${x + w * 0.1} 16Z`} fill={clay} />
            <path d={`M${x + w * 0.35} 12 L${x + w * 0.65} 12 L${x + w * 0.6} 16 L${x + w * 0.4} 16Z`} fill={lerpHex(clay, pal.ink, 0.25)} />
            <path d={`M${x + w * 0.2} 20 Q${x + w * 0.5} 22 ${x + w * 0.85} 19`} stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.6} />
          </g>
        </>}
        <rect x={x - w * 0.12} y={30} width={w * 0.24} height={7} fill={pal.skin} />
        <g transform={`rotate(${epic ? -6 * cm : 22 * ld} ${x} 32)`}>
          <Cabeza cx={x} cy={epic ? 26 : 26.5} r={epic ? 5.2 : 5.8} pal={pal} turn={epic ? -0.25 : 0.1} curls={!epic} eyesClosed={epic ? 0 : ld * 0.7} beard={!epic && k === 1} hair={lerpHex(pal.rock, pal.ink, 0.35 + 0.1 * k)} />
          {epic && <path d={`M${x - 1.6} 29.2 Q${x - 0.4} ${30 + 0.8 * cm} ${x + 0.9} 29.2`} stroke={lerpHex(pal.skin, pal.ink, 0.5)} strokeWidth={0.45} fill="none" />}
        </g>
      </g>
    );
  };
  return <g>{one(20, 15, 0, false)}{one(47, 16, 1, false)}{one(78, 11.5, 2, true)}</g>;
};
