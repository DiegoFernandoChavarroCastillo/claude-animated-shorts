// mascara_tut · escenario: la máscara funeraria de oro de Tutankamón, de frente y hasta el pecho: nemes a rayas de oro y lapislázuli,
// el buitre y la cobra en la frente, la cara de oro bruñido con ojos de cuarzo y obsidiana delineados en lapislázuli, las orejas con los
// lóbulos perforados, la barba postiza trenzada y el collar ancho de cuentas con remates de halcón. Un reflejo recorre el oro de vez en cuando.
// Lienzo 100 × 120, anclaje en el centro. opts: `apagada` 0..1 (oro mate y gris, como olvidado). Acciones propias: `shine` un destello
// recorre la máscara en diagonal y queda un halo (se queda); `fade` el oro se apaga hasta casi gris (se queda); `wake` el oro vuelve a brillar.
import React from "react";
import { type AssetFC, clamp01, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const MascaraTut: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `mt${seed}`, sh = clamp01(p.shine ?? 0);
  const off = clamp01(Math.max(opt(opts, "apagada", 0), clamp01(p.fade ?? 0)) - clamp01(p.wake ?? 0));
  const gold0 = lerpHex("#F0C04A", pal.glow, 0.15), gold = lerpHex(gold0, "#7A7468", off * 0.75);
  const lapis = lerpHex(lerpHex("#1E3C8C", pal.ink, 0.1), "#3A3E48", off * 0.6), turq = lerpHex("#2FA3A0", "#4A5050", off * 0.6);
  const carn = lerpHex("#C0452E", "#5A4A44", off * 0.6), quartz = lerpHex("#F6F2E8", "#9A9A94", off * 0.5);
  // reflejo periódico: banda clara que cruza en diagonal cada ~5 s, y el destello de `shine`
  const sweep = ((t % 150) / 150) * 1.6 - 0.3, sx = lerp(-30, 130, sh > 0 && sh < 1 ? sh : sweep);
  const nemes = "M50 6 Q22 7 18 34 L14 70 Q12 88 20 100 L30 104 L34 66 Q36 50 50 49 Q64 50 66 66 L70 104 L80 100 Q88 88 86 70 L82 34 Q78 7 50 6 Z";
  return (
    <g>
      <Vol id={`${id}g`} c={gold} pal={pal} k={1.1} lx={0.62} ly={0.3} /><Grad id={`${id}f`} a={lite(gold, pal, 0.25)} b={dark(gold, pal, 0.28)} />
      <Grad id={`${id}w`} a="#ffffff00" mid="#ffffffcc" b="#ffffff00" h />
      <defs><clipPath id={`${id}c`}><path d={nemes} /><path d="M35 46 Q35 30 50 29 Q65 30 65 46 L64 70 Q60 86 50 88 Q40 86 36 70 Z" /><path d="M8 96 Q50 82 92 96 L98 120 L2 120 Z" /></clipPath></defs>
      {sh > 0 && <Halo id={`${id}h`} cx={50} cy={55} r={60} color={pal.glow} a={0.35 * sh * (1 - off)} />}
      {/* collar ancho: hileras de cuentas y remates de halcón en los hombros */}
      <path d="M4 120 Q2 100 14 94 Q50 80 86 94 Q98 100 96 120 Z" fill={url(`${id}f`)} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${10 - i * 1.2} ${100 + i * 3.4} Q50 ${88 + i * 4.4} ${90 + i * 1.2} ${100 + i * 3.4}`} stroke={[lapis, turq, carn, lapis, turq, gold][i]} strokeWidth={2.2} fill="none" strokeDasharray={i % 2 ? "2.4 0.8" : "1.4 0.6"} />
      ))}
      {[[8, 100], [92, 100]].map(([x, y], k) => <path key={k} d={`M${x} ${y} q${k ? -4 : 4} -6 ${k ? -9 : 9} -3 q${k ? -2 : 2} 4 0 7 Z`} fill={gold} stroke={lapis} strokeWidth={0.6} />)}
      {/* nemes */}
      <path d={nemes} fill={url(`${id}g`)} />
      {[...Array(13)].map((_, i) => {
        const y = 12 + i * 7.4;
        return <path key={i} d={`M10 ${y + 4} Q50 ${y - 6} 90 ${y + 4}`} stroke={lapis} strokeWidth={2.6} fill="none" clipPath={`url(#${id}c)`} />;
      })}
      <path d={nemes} fill="none" stroke={dark(gold, pal, 0.3)} strokeWidth={0.6} />
      {/* orejas con lóbulo perforado */}
      {[[33, 1], [67, -1]].map(([x, d]) => (
        <g key={x}><ellipse cx={x} cy={60} rx={3.6} ry={7} fill={url(`${id}f`)} /><path d={`M${x + d * 0.6} 55 q${-d * 1.6} 4 0 8`} stroke={dark(gold, pal, 0.35)} strokeWidth={0.6} fill="none" />
          <circle cx={x} cy={66.4} r={0.9} fill={dark(gold, pal, 0.6)} /></g>
      ))}
      {/* cara */}
      <path d="M36 46 Q36 31 50 30 Q64 31 64 46 L63 70 Q59 85 50 87 Q41 85 37 70 Z" fill={url(`${id}g`)} />
      <path d="M63 46 L62.4 70 Q58.6 84 50 86.4" stroke={pal.rim} strokeWidth={0.6} fill="none" opacity={0.5 * (1 - off)} />
      <path d="M36 37 Q50 33 64 37 L64 40 Q50 36.4 36 40 Z" fill={lapis} />
      {/* cejas, ojos de cuarzo y obsidiana con kohl */}
      {[[43, -1], [57, 1]].map(([x, d]) => (
        <g key={x}>
          <path d={`M${x - 6} 47 Q${x} 43.6 ${x + 6} 47 l${d * 2} 0.4`} stroke={lapis} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <path d={`M${x - 5} 52 Q${x} 48.4 ${x + 5} 52 Q${x} 54.6 ${x - 5} 52 Z`} fill={quartz} />
          <circle cx={x + d * 0.4} cy={51.6} r={1.7} fill={lerpHex("#0E0A10", pal.ink, 0.2)} /><circle cx={x + d * 0.4 + 0.6} cy={51} r={0.45} fill="#fff" opacity={0.8 * (1 - off)} />
          <path d={`M${x - 5.4} 52 Q${x} 48 ${x + 5.4} 52 l${d * 5} 0.6`} stroke={lapis} strokeWidth={0.9} fill="none" />
          <path d={`M${x - 5} 52.4 Q${x} 55 ${x + 5} 52.4`} stroke={lapis} strokeWidth={0.7} fill="none" />
        </g>
      ))}
      {/* nariz y boca */}
      <path d="M49 53 L47.4 66 Q50 68 52.6 66 L51 53" fill={lite(gold, pal, 0.15)} stroke={dark(gold, pal, 0.3)} strokeWidth={0.5} />
      <path d="M45 73 Q50 71 55 73 Q50 74.4 45 73 Z" fill={dark(gold, pal, 0.25)} /><path d="M45.6 73.4 Q50 77.6 54.4 73.4" fill={dark(gold, pal, 0.12)} />
      {/* buitre y cobra en la frente */}
      <path d="M46 30 q0 -6 4 -8 q3 2 2 7" fill={gold} stroke={dark(gold, pal, 0.4)} strokeWidth={0.5} />
      <path d="M52.6 30.4 q2 -4 1.4 -9 q-1.6 -2.4 -3 -0.4 q2 2 0.6 5" stroke={lapis} strokeWidth={1.4} fill={carn} strokeLinecap="round" />
      {/* barba postiza trenzada */}
      <path d="M46 86 L47 101 Q50 104 53 101 L54 86 Z" fill={lapis} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M46.4 ${88 + i * 3} q3.6 1.6 7.2 0`} stroke={gold} strokeWidth={0.7} fill="none" />)}
      <path d="M46 101.6 Q50 105 54 101.6" stroke={gold} strokeWidth={1.1} fill="none" />
      {/* reflejo que cruza el oro */}
      <g clipPath={`url(#${id}c)`} style={{ mixBlendMode: "screen" }} opacity={(0.55 + 0.35 * sh) * (1 - off)}>
        <rect x={sx - 7} y={-20} width={14} height={170} fill={url(`${id}w`)} transform={`rotate(24 ${sx} 60)`} />
      </g>
    </g>
  );
};
