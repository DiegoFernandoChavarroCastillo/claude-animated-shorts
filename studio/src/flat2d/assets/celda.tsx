// celda · fondo: una celda de piedra de la antigua Atenas. Muros de sillares con degradado, una ventana alta con barrotes a la derecha por la que
// entra un haz de sol con polvo, banco de piedra a la izquierda (asiento en y ≈ 96; un `figura` sentado encima, con los pies en y ≈ 0,61), una copa
// de barro en el suelo y, en la pared de la izquierda, marcas de días rayadas en grupos de cinco. El suelo empieza en y = 106.
// opts: `marcas` (0) ya rayadas al empezar. Acción propia: `tally` raya marcas una a una hasta params `to` (30) mientras el haz de luz barre la
// celda, como si pasaran los días (se queda).
import React from "react";
import { type AssetFC, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const Celda: AssetFC = ({ pal, t, seed, p, params, opts }) => {
  const id = `ce${seed}`, m0 = opt(opts, "marcas", 0), to = Number((params.tally ?? {}).to ?? 30), tk = p.tally ?? -1;
  const marks = tk >= 0 ? lerp(m0, to, tk) : m0, n = Math.floor(marks), sweep = tk >= 0 ? tk : 0;
  const stone = lerpHex(pal.wall, pal.rock, 0.5), sun = lerpHex(pal.glow, "#FFD890", 0.3);
  const bx = lerp(78, 30, sweep);   // donde cae el haz en el suelo
  return (
    <g>
      <Grad id={`${id}w`} a={dark(stone, pal, 0.05)} b={dark(stone, pal, 0.4)} /><Grad id={`${id}f`} a={dark(stone, pal, 0.2)} b={dark(stone, pal, 0.55)} />
      <defs><linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sun} stopOpacity={0.55} /><stop offset="1" stopColor={sun} stopOpacity={0.05} /></linearGradient></defs>
      <rect x={-30} y={-10} width={160} height={118} fill={url(`${id}w`)} />
      {[...Array(60)].map((_, i) => { const r = Math.floor(i / 6), c = i % 6, w = 26; return <rect key={i} x={-30 + c * w + (r % 2) * 13} y={-10 + r * 11.6} width={w - 0.6} height={11} rx={0.8} fill={lerpHex(stone, hash(i + seed) > 0.5 ? pal.wallLit : pal.ink, 0.06 + hash(i * 3.7) * 0.06)} stroke={dark(stone, pal, 0.5)} strokeWidth={0.35} />; })}
      <path d="M-30 106 L130 106 L130 190 L-30 190 Z" fill={url(`${id}f`)} />
      <path d="M-30 106 L130 106" stroke={lite(stone, pal, 0.2)} strokeWidth={0.5} opacity={0.6} />
      {/* ventana alta con barrotes */}
      <Halo id={`${id}h`} cx={80} cy={34} r={22} color={sun} a={0.5} />
      <rect x={70} y={24} width={20} height={20} rx={1} fill={lite(sun, pal, 0.3)} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={72.5 + i * 5} y={24} width={1.3} height={20} fill={dark(pal.ink, pal, 0)} opacity={0.85} />)}
      <rect x={69} y={23} width={22} height={1.6} fill={dark(stone, pal, 0.5)} /><rect x={69} y={43.5} width={22} height={1.8} fill={lite(stone, pal, 0.2)} />
      {/* haz de luz con polvo: barre el suelo al pasar los días */}
      <path d={`M70 44 L90 44 L${bx + 16} 112 L${bx - 10} 112 Z`} fill={url(`${id}b`)} style={{ mixBlendMode: "screen" }} />
      <ellipse cx={bx + 3} cy={110} rx={16} ry={3} fill={sun} opacity={0.35} />
      {[...Array(18)].map((_, i) => { const k = hash(i * 2.1 + seed), y = 46 + ((k * 60 + t * (0.05 + 0.05 * hash(i))) % 62), x = lerp(80, bx + 3, (y - 44) / 68) + Math.sin(t * 0.03 + i) * 4 + (k - 0.5) * 10; return <circle key={i} cx={x} cy={y} r={0.35 + k * 0.4} fill={sun} opacity={0.5} />; })}
      {/* marcas de los días en la pared */}
      {[...Array(n)].map((_, i) => {
        const g = Math.floor(i / 5), j = i % 5, gx = 6 + (g % 3) * 13, gy = 52 + Math.floor(g / 3) * 15, last = i === n - 1 && tk > 0 && tk < 1;
        const d = j < 4 ? `M${gx + j * 2.4} ${gy} L${gx + j * 2.4 + 0.4} ${gy + 10}` : `M${gx - 1.2} ${gy + 8} L${gx + 9} ${gy + 2}`;
        return <path key={i} d={d} stroke={lite(stone, pal, 0.55)} strokeWidth={last ? 1.1 : 0.8} strokeLinecap="round" opacity={last ? 1 : 0.85} />;
      })}
      {/* banco de piedra y copa de barro */}
      <ContactShadow id={`${id}s`} cx={24} cy={106.5} rx={24} />
      <rect x={2} y={96} width={44} height={4} rx={0.8} fill={lite(stone, pal, 0.15)} />
      <rect x={4} y={100} width={6} height={6.5} fill={dark(stone, pal, 0.25)} /><rect x={38} y={100} width={6} height={6.5} fill={dark(stone, pal, 0.25)} />
      <ContactShadow id={`${id}k`} cx={56} cy={107} rx={4} />
      <path d="M52.5 102 L59.5 102 Q59 106 56 106.3 Q53 106 52.5 102 Z" fill={lerpHex("#B8643A", pal.rock, 0.3)} />
      <path d="M52.5 102 L59.5 102" stroke={pal.ink} strokeWidth={0.4} opacity={0.6} />
    </g>
  );
};
