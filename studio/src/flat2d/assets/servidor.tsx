// servidor · un rack de cinco servidores con luces de estado y un medidor de carga. `overload` lo satura (luces rojas, calor, medidor al tope) y `eco` (después) apaga cuatro de ellos y baja la carga: ahorrar recursos.
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { Grain } from "./grain";

export const Servidor: AssetFC = ({ pal, p, t, seed, flick }) => {
  const ov = p.overload ?? 0, eco = p.eco ?? 0, oe = ov * (1 - eco), load = clamp01(0.5 + 0.48 * oe - 0.4 * eco), RED = "#FF5A4D";
  const shake = oe > 0.2 && oe < 1 ? Math.sin(t * 2.3) * 0.5 : 0;
  return (
    <g>
      <ellipse cx={46} cy={121} rx={34} ry={3.4} fill={pal.ink} opacity={0.6} />
      {/* calor */}
      {oe > 0.05 && [0, 1, 2, 3, 4].map((i) => { const ph = (t * 0.012 + i / 5) % 1; return <ellipse key={i} cx={28 + i * 9 + Math.sin(ph * 8 + i) * 2} cy={14 - ph * 14} rx={3.2} ry={2.4} fill={RED} opacity={Math.sin(ph * Math.PI) * 0.45 * oe} />; })}
      <g transform={`translate(${shake} 0)`}>
        <rect x={12} y={10} width={68} height={108} rx={3} fill={pal.rock} stroke={pal.ink} strokeWidth={1.2} />
        <Grain n={50} w={68} h={108} seed={seed + 2} a={pal.wallLit} b={pal.wall} rMax={0.5} />
        {[0, 1, 2, 3, 4].map((i) => {
          const on = i === 0 || eco < i / 5 + 0.05 || oe > 0.3, y = 15 + i * 20.2;
          return (
            <g key={i}>
              <rect x={16} y={y} width={60} height={17} rx={1.6} fill={pal.wall} stroke={pal.rim} strokeWidth={0.5} opacity={on ? 1 : 0.55} />
              {[0, 1, 2, 3].map((v) => <line key={v} x1={44} x2={72} y1={y + 4 + v * 3} y2={y + 4 + v * 3} stroke={pal.ink} strokeWidth={0.9} opacity={0.7} />)}
              {[0, 1, 2, 3, 4].map((k) => {
                const blink = on && (hash(k + i * 7 + Math.floor(t / (oe > 0.1 ? 2 : 7)) * 3) > 0.35 - 0.3 * oe);
                return <circle key={k} cx={22 + k * 4.6} cy={y + 8.5} r={1.35} fill={blink ? (oe > 0.3 ? RED : pal.glow) : pal.ink} opacity={blink ? 0.85 + 0.15 * flick : 0.9} />;
              })}
            </g>
          );
        })}
      </g>
      {/* medidor de carga */}
      <rect x={85} y={14} width={8} height={100} rx={2} fill={pal.ink} stroke={pal.rim} strokeWidth={0.7} />
      <rect x={86.2} y={113 - 98 * load} width={5.6} height={98 * load} rx={1.2} fill={load > 0.8 ? RED : pal.glow} opacity={0.9} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={83} x2={85} y1={34 + i * 25} y2={34 + i * 25} stroke={pal.rim} strokeWidth={0.6} />)}
      {/* cables */}
      <path d="M26 118 Q20 126 8 124" stroke={pal.rock} strokeWidth={1.6} fill="none" /><path d="M60 118 Q70 128 88 124" stroke={pal.rock} strokeWidth={1.6} fill="none" />
    </g>
  );
};
