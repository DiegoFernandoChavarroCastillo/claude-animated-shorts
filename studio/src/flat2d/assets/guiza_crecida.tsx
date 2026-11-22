// guiza_crecida · fondo: el valle del Nilo frente a la meseta de Guiza. Al fondo, la meseta de arena que se alza a la derecha (y ≈ 88–100, donde
// se coloca la `piramide`) y los riscos del desierto; delante, los campos verdes con canales, palmeras en los diques y aldeas sobre lomas. Con la
// crecida el agua cubre los campos hasta el pie de la meseta y las aldeas quedan como islas. Lleva su propia agua azul. Va sobre `cielo`.
// opts: `agua` 0..1 (0 = campos con un canal; 1 = valle inundado hasta la meseta; 0,4). Acción propia: `flood` el agua sube hasta el pie de la
// meseta (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, dark, lite, url } from "./shade";

export const GuizaCrecida: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `gc${seed}`, a = p.flood !== undefined ? Math.max(opt(opts, "agua", 0.4), clamp01(p.flood)) : opt(opts, "agua", 0.4);
  const sand = lerpHex("#E3B676", pal.wallLit, 0.15), cliff = lerpHex("#C99A62", pal.bg, 0.35), green = lerpHex("#6E9A44", pal.rock, 0.2);
  const water = lerpHex("#3A86B0", pal.bg, 0.2), mud = lerpHex("#8A6A44", pal.rock, 0.3), palm = lerpHex("#47703A", pal.rock, 0.3);
  const wl = lerp(132, 100.5, a);   // nivel del agua: con 1, hasta el pie de la meseta
  const palmTree = (x: number, y: number, s: number, k: number) => (
    <g key={k}>
      <path d={`M${x} ${y} Q${x - 0.8 * s} ${y - 8 * s} ${x + 0.8 * s} ${y - 15 * s}`} stroke={lerpHex("#7A5A36", pal.rock, 0.3)} strokeWidth={0.9 * s} fill="none" />
      {[...Array(6)].map((_, j) => { const an = -Math.PI + (j / 5) * Math.PI + Math.sin(t * 0.05 + j + k) * 0.07; return <path key={j} d={`M${x + 0.8 * s} ${y - 15 * s} q${Math.cos(an) * 3.5 * s} ${(Math.sin(an) * 2.5 - 1) * s} ${Math.cos(an) * 6 * s} ${(Math.sin(an) * 2.5 + 2.2) * s}`} stroke={palm} strokeWidth={0.9 * s} fill="none" />; })}
    </g>
  );
  return (
    <g>
      <Grad id={`${id}p`} a={lite(sand, pal, 0.3)} b={dark(sand, pal, 0.15)} /><Grad id={`${id}g`} a={lite(green, pal, 0.15)} b={dark(green, pal, 0.25)} />
      <Grad id={`${id}w`} a={lerpHex(water, pal.glow, 0.4)} mid={water} b={dark(water, pal, 0.3)} at={0.3} />
      {/* riscos lejanos del desierto */}
      <path d="M-30 96 L-10 88 L8 91 L26 85 L44 89 L60 86 L80 90 L100 84 L130 88 L130 100 L-30 100 Z" fill={cliff} opacity={0.75} />
      {/* la meseta de Guiza, a la derecha */}
      <path d="M14 101 Q22 92 34 90 L130 88 L130 102 L14 102 Z" fill={url(`${id}p`)} />
      <path d="M14 101 Q22 92 34 90 L130 88" stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.6} />
      {[...Array(10)].map((_, i) => <ellipse key={i} cx={30 + i * 9 + hash(i) * 4} cy={95 + hash(i * 3) * 5} rx={2 + hash(i * 7) * 3} ry={0.35} fill={dark(sand, pal, 0.25)} opacity={0.5} />)}
      {/* campos verdes con diques y canales */}
      <rect x={-40} y={100} width={180} height={90} fill={url(`${id}g`)} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M-40 ${104 + i * i * 1.3} L140 ${103 + i * i * 1.3}`} stroke={dark(green, pal, 0.3)} strokeWidth={0.3 + i * 0.05} opacity={0.6} />)}
      {[...Array(9)].map((_, i) => <path key={`c${i}`} d={`M${50 + (i - 4) * 4} 101 L${50 + (i - 4) * 26} 180`} stroke={lite(green, pal, 0.25)} strokeWidth={0.3} opacity={0.5} />)}
      {/* el canal que va hasta el pie de la meseta */}
      <path d="M44 101 L52 101 L66 180 L28 180 Z" fill={url(`${id}w`)} />
      {/* el agua de la crecida: sube y cubre los campos */}
      {a > 0.01 && <rect x={-40} y={wl} width={180} height={190 - wl} fill={url(`${id}w`)} />}
      {a > 0.01 && <path d={`M-40 ${wl} L140 ${wl}`} stroke={pal.wallLit} strokeWidth={0.6} opacity={0.7} />}
      {[...Array(30)].map((_, i) => {
        const y = wl + 1 + hash(i * 4.1 + seed) ** 1.5 * (176 - wl), x = ((hash(i * 2.3) * 170 + t * 0.04 * (0.4 + hash(i))) % 170) - 35;
        return a > 0.01 ? <rect key={i} x={x} y={y} width={2 + hash(i * 5) * 7} height={0.45} rx={0.2} fill={pal.wallLit} opacity={0.3} /> : null;
      })}
      {/* reflejo del sol en el agua */}
      {a > 0.2 && [...Array(10)].map((_, i) => { const y = wl + 1.5 + i * 2.6, w = (2 + i) * (0.6 + 0.4 * Math.sin(t * 0.09 + i)); return <rect key={`r${i}`} x={72 - w} y={y} width={w * 2} height={0.6} rx={0.3} fill={pal.glow} opacity={(0.6 - i * 0.05) * a} />; })}
      {/* aldeas sobre lomas: islas cuando hay crecida */}
      {[[8, 112, 1.1], [86, 124, 1.3]].map(([x, y, s], i) => (
        <g key={`v${i}`}>
          <path d={`M${x - 14 * s} ${y + 2} Q${x} ${y - 6 * s} ${x + 14 * s} ${y + 2} Z`} fill={lerpHex(mud, sand, 0.4)} />
          {[...Array(4)].map((_, j) => { const hx = x - 8 * s + j * 4.4 * s, hy = y - 2.5 * s - (j === 1 || j === 2 ? 1.2 * s : 0); return (
            <g key={j}>
              <rect x={hx} y={hy - 3.5 * s} width={3.8 * s} height={3.5 * s} fill={lerpHex(mud, pal.wallLit, 0.25)} />
              <rect x={hx + 2.6 * s} y={hy - 3.5 * s} width={1.2 * s} height={3.5 * s} fill={dark(mud, pal, 0.2)} />
              <rect x={hx + 1.1 * s} y={hy - 2.2 * s} width={0.9 * s} height={1.2 * s} fill={dark(mud, pal, 0.5)} />
            </g>
          ); })}
          {palmTree(x + 11 * s, y + 0.5, 0.9 * s, i * 10)}
        </g>
      ))}
      {/* palmeras en los diques */}
      {[[-6, 104, 0.7], [30, 106, 0.8], [104, 105, 0.75], [60, 102, 0.55]].map(([x, y, s], i) => palmTree(x, y, s, 20 + i))}
    </g>
  );
};
