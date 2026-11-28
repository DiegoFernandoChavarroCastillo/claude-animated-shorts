// biblioteca_noche · fondo (manuscrito-voynich): una biblioteca antigua de noche: muros de piedra, dos estanterías altas de madera llenas
// de códices con lomos de piel, una ventana en arco con la luna entre barrotes, una mesa de lectura en el centro (tablero en y ≈ 100)
// y el suelo de baldosas desde y ≈ 106. Lienzo 100 × 178, anclaje en el centro. opts.luz 0..1 (0,4: penumbra; 1 = sala iluminada).
// Acción propia: `shadow` una sombra alargada cruza la pared de izquierda a derecha mientras dura (alguien pasa con una vela).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const BibliotecaNoche: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `bn${seed}`, G = 106, luz = Number(opt(opts, "luz", 0.4)), sh = p.shadow ?? 0;
  const stone = lerpHex(lerpHex(pal.wall, pal.ink, 0.55 - luz * 0.35), pal.rock, 0.2), wood = lerpHex("#5A361E", pal.ink, 0.35 - luz * 0.2);
  const spines = ["#7A2E24", "#3E5A3A", "#6A4A2A", "#2E3E5A", "#8A6A3A", "#4A2A3A"];
  const shelf = (x0: number, w: number, k: number) => (
    <g>
      <rect x={x0} y={8} width={w} height={G - 6} fill={url(`${id}w`)} />
      <rect x={x0 + 1.5} y={11} width={w - 3} height={G - 12} fill={dark(wood, pal, 0.5)} />
      {[...Array(6)].map((_, r) => {
        const y = 12 + r * 15.5; let x = x0 + 2; const books: React.ReactNode[] = [];
        for (let b = 0; x < x0 + w - 3; b++) {
          const bw = 1.6 + hash(seed + k * 99 + r * 17 + b) * 1.8, bh = 9 + hash(b * 3 + r + k) * 4.5, c = spines[Math.floor(hash(b + r * 7 + k * 3) * 6)];
          const lean = hash(b * 5 + r + k) > 0.92 ? 8 : 0;
          books.push(<g key={b} transform={`rotate(${lean} ${x} ${y + 14})`}><rect x={x} y={y + 14 - bh} width={bw} height={bh} fill={lerpHex(c, pal.ink, 0.35 - luz * 0.25)} />
            <rect x={x} y={y + 14 - bh + 1.5} width={bw} height={0.5} fill={lerpHex("#D9A637", pal.ink, 0.4)} opacity={0.7} /></g>);
          x += bw + 0.2;
        }
        return <g key={r}>{books}<rect x={x0 + 1} y={y + 14} width={w - 2} height={1.6} fill={lite(wood, pal, 0.15)} /></g>;
      })}
    </g>
  );
  return (
    <g>
      <Grad id={`${id}st`} a={dark(stone, pal, 0.3)} mid={stone} b={dark(stone, pal, 0.15)} at={0.55} />
      <Grad id={`${id}w`} h a={dark(wood, pal, 0.2)} mid={lite(wood, pal, 0.15)} b={dark(wood, pal, 0.3)} />
      <Grad id={`${id}f`} a={dark(stone, pal, 0.1)} b={dark(stone, pal, 0.55)} />
      <Vol id={`${id}t`} c={wood} pal={pal} k={0.9} />
      <rect x={-40} y={-20} width={180} height={G + 20} fill={url(`${id}st`)} />
      {[...Array(14)].map((_, r) => [...Array(8)].map((_, c) => <rect key={`${r}-${c}`} x={-36 + c * 22 + (r % 2) * 11} y={-16 + r * 9} width={21.4} height={8.4} fill="none" stroke={dark(stone, pal, 0.3)} strokeWidth={0.3} opacity={0.5} />))}
      {/* ventana en arco con luna */}
      <path d="M36 62 L36 30 Q50 12 64 30 L64 62 Z" fill="#0E1638" />
      <circle cx={56} cy={32} r={4.2} fill="#F2EEDC" /><Halo id={`${id}m`} cx={56} cy={32} r={16} color="#B8C8FF" a={0.5} />
      {[...Array(5)].map((_, i) => <circle key={i} cx={40 + hash(i + seed) * 20} cy={26 + hash(i * 3) * 30} r={0.35} fill="#fff" opacity={0.7} />)}
      <path d="M43 62 L43 22 M50 62 L50 17 M57 62 L57 22 M36 44 L64 44" stroke={dark(stone, pal, 0.5)} strokeWidth={0.9} />
      <path d="M36 62 L36 30 Q50 12 64 30 L64 62 Z" fill="none" stroke={lite(stone, pal, 0.2)} strokeWidth={1.6} />
      <path d={`M36 62 L64 62 L76 ${G} L24 ${G} Z`} fill="#B8C8FF" opacity={0.06} />
      {shelf(-14, 40, 1)}{shelf(74, 40, 2)}
      {/* sombra que cruza la pared */}
      {sh > 0 && sh < 1 ? <ellipse cx={-20 + sh * 140} cy={60} rx={9} ry={30} fill={pal.ink} opacity={0.35 * Math.sin(sh * Math.PI)} /> : null}
      {/* suelo de baldosas */}
      <rect x={-40} y={G} width={180} height={100} fill={url(`${id}f`)} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${-40 + i * 22} ${G} L${-90 + i * 34} 200`} stroke={dark(stone, pal, 0.45)} strokeWidth={0.4} opacity={0.6} />)}
      {[0, 6, 14, 26, 42].map((dy, i) => <path key={`h${i}`} d={`M-40 ${G + dy} L140 ${G + dy}`} stroke={dark(stone, pal, 0.45)} strokeWidth={0.35} opacity={0.5} />)}
      {/* mesa de lectura */}
      <ContactShadow id={`${id}c`} cx={50} cy={G + 2} rx={36} a={0.45} />
      <rect x={14} y={100} width={72} height={4} rx={1} fill={url(`${id}t`)} />
      <rect x={14} y={99.4} width={72} height={0.9} fill={lite(wood, pal, 0.3)} />
      <rect x={18} y={104} width={3} height={G - 102 + 6} fill={dark(wood, pal, 0.2)} /><rect x={79} y={104} width={3} height={G - 102 + 6} fill={dark(wood, pal, 0.2)} />
      <Halo id={`${id}a`} cx={50} cy={92} r={40} color={pal.glow} a={0.12 + luz * 0.15} />
      {clamp01(luz) > 0.7 ? <rect x={-40} y={-20} width={180} height={220} fill={pal.glow} opacity={0.05} /> : null}
    </g>
  );
};
