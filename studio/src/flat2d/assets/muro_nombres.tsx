// muro_nombres · fondo: un muro egipcio de piedra visto de cerca, en tres versiones (`opts.modo`). La parte baja se oscurece desde y ≈ 108
// (franja de subtítulos). Lienzo 100 × 178.
// - `cambio`: un cartucho real grande con el nombre del rey niño; con `rename` el disco solar de Atón (con rayos acabados en manos) se
//   raspa y en su sitio aparecen los signos de Amón (la hoja de junco, el tablero y el agua): Tutankatón pasa a ser Tutankamón.
// - `lista`: la lista de reyes de Abidos, dos hileras de cartuchos; el cartucho resaltado (`opts.marcado`, índice 0–13, por defecto 9) se
//   borra a cincel con `erase` y la hilera se cierra como si nunca hubiera estado.
// - `pintura`: la pared pintada de la cámara funeraria (fondo amarillo, el rey como Osiris de blanco, un sacerdote con piel de leopardo y
//   babuinos), con la pintura que todavía chorrea; `seal` levanta hilada a hilada un muro de bloques enlucido y estampado con sellos
//   delante de la puerta (se queda); `spots` salen las manchas marrones del moho (se queda).
// Todas las acciones se quedan.
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, dark, lite, url } from "./shade";

export const MuroNombres: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `mn${seed}`, modo = opt(opts, "modo", "cambio");
  const stone = lerpHex("#D2B282", pal.wall, 0.3), ink = lerpHex("#2A1E14", pal.ink, 0.2), blue = lerpHex("#2E5AA8", pal.accent, 0.1);
  const red = lerpHex("#B8402E", pal.accent, 0.2), gold = lerpHex("#E8B640", pal.glow, 0.2), green = lerpHex("#3A8A5A", pal.bg, 0.1);
  const rn = clamp01(p.rename ?? 0), er = clamp01(p.erase ?? 0), se = clamp01(p.seal ?? 0), sp = clamp01(p.spots ?? 0);
  const working = (v: number | undefined) => v !== undefined && v > 0 && v < 1;
  const chisel = (x: number, y: number) => (
    <g>
      <path d={`M${x + Math.sin(t * 0.9) * 1.5} ${y} l7 -8`} stroke="#8C8C8C" strokeWidth={1.4} strokeLinecap="round" />
      <path d={`M${x + 7 + Math.sin(t * 0.9) * 1.5} ${y - 8} l4 -3`} stroke={lerpHex("#6A4A2A", pal.rock, 0.2)} strokeWidth={2.6} strokeLinecap="round" />
      {[...Array(7)].map((_, i) => { const ph = (t * 0.1 + hash(seed + i)) % 1; return <circle key={i} cx={x + (hash(i) - 0.5) * 10 * ph} cy={y + ph * ph * 18} r={0.5} fill={lite(stone, pal, 0.3)} opacity={1 - ph} />; })}
    </g>
  );
  const shade = <g><Grad id={`${id}b`} a="#00000000" b={pal.ink} /><rect x={-30} y={100} width={160} height={78} fill={url(`${id}b`)} opacity={1} /><rect x={-30} y={108} width={160} height={70} fill={pal.ink} opacity={0.6} /></g>;
  const wall = (
    <g>
      <rect x={-30} y={0} width={160} height={178} fill={url(`${id}w`)} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M-30 ${14 + i * 20} H130`} stroke={dark(stone, pal, 0.2)} strokeWidth={0.4} />)}
      {[...Array(30)].map((_, i) => <path key={`v${i}`} d={`M${-30 + ((i * 23 + (Math.floor(i / 6) % 2) * 11) % 160)} ${14 + (i % 9) * 20} v20`} stroke={dark(stone, pal, 0.2)} strokeWidth={0.4} />)}
    </g>
  );
  // un cartucho: óvalo alargado con base
  const cart = (x: number, y: number, w: number, h: number, k: number, kids: React.ReactNode, hl = 0) => (
    <g key={k}>
      {hl > 0 && <rect x={x - w / 2 - 2} y={y - 2} width={w + 4} height={h + 6} rx={w / 2 + 2} fill={gold} opacity={0.35 * hl} />}
      <rect x={x - w / 2} y={y} width={w} height={h} rx={w / 2} fill={lite(stone, pal, 0.15)} stroke={ink} strokeWidth={0.7} />
      <path d={`M${x - w / 2 - 0.5} ${y + h + 1.2} H${x + w / 2 + 0.5}`} stroke={ink} strokeWidth={0.9} />
      {kids}
    </g>
  );
  const glyphs = (x: number, y: number, k: number) => {
    // signos genéricos de nombre real (sol, escarabajo, junco, cesta…) para los cartuchos de la lista
    const g = [
      <circle key="s" cx={x} cy={y} r={1.6} fill={red} />, <ellipse key="e" cx={x} cy={y} rx={1.6} ry={1.1} fill={blue} />,
      <path key="j" d={`M${x} ${y + 1.8} q1.4 -2 0 -3.6`} stroke={green} strokeWidth={0.8} fill="none" />, <path key="c" d={`M${x - 1.8} ${y - 0.6} q1.8 2.4 3.6 0 Z`} fill={ink} />,
      <path key="o" d={`M${x - 1.6} ${y} h3.2 M${x} ${y - 1.6} v3.2`} stroke={ink} strokeWidth={0.7} />,
    ];
    return [0, 1, 2].map((j) => <g key={j} transform={`translate(0 ${j * 4.4})`}>{g[(k * 3 + j * 2) % 5]}</g>);
  };
  if (modo === "lista") {
    const mk = opt(opts, "marcado", 9), N = 14;
    return (
      <g>
        <Grad id={`${id}w`} a={lite(stone, pal, 0.15)} b={dark(stone, pal, 0.2)} />
        {wall}
        <rect x={-30} y={36} width={160} height={1.2} fill={ink} /><rect x={-30} y={98} width={160} height={1.2} fill={ink} />
        {[...Array(N)].map((_, i) => {
          const row = Math.floor(i / 7), col = i % 7;
          // tras borrar el marcado, los de su derecha (en su hilera) se corren para cerrar el hueco
          const shift = row === Math.floor(mk / 7) && col > mk % 7 ? -er * 13.4 * clamp01((er - 0.6) / 0.4) : 0;
          const x = 10 + col * 13.4 + shift, y = 42 + row * 28;
          if (i === mk) {
            return (
              <g key={i} opacity={1 - clamp01((er - 0.55) / 0.3)}>
                {cart(x, y, 9, 22, i, glyphs(x, y + 5, i), 1 - er)}
                {er > 0 && <rect x={x - 5} y={y} width={10} height={lerp(0, 23, clamp01(er * 1.8))} rx={4} fill={lerpHex(stone, "#9A7E58", 0.5)} />}
                {er > 0 && [...Array(Math.floor(clamp01(er * 1.8) * 14))].map((_, j) => <path key={j} d={`M${x - 4 + hash(j + seed) * 8} ${y + j * 1.6} l1.6 1.2`} stroke={dark(stone, pal, 0.4)} strokeWidth={0.5} />)}
                {working(p.erase) && er < 0.55 && chisel(x + 2, y + lerp(4, 20, er * 1.8))}
              </g>
            );
          }
          return cart(x, y, 9, 22, i, glyphs(x, y + 5, i));
        })}
        {shade}
      </g>
    );
  }
  if (modo === "pintura") {
    const ochre = lerpHex("#E8C04A", pal.wallLit, 0.1), white = lerpHex("#F2EEE2", pal.wallLit, 0.2), skin = lerpHex("#A85A34", pal.skin, 0.2);
    const fig = (x: number, k: number, kind: number) => (
      <g key={k}>
        {kind === 0 && <g>{/* el rey como Osiris: sudario blanco, corona atef, cayado y mayal */}
          <path d={`M${x - 4} 96 L${x - 3.4} 62 Q${x} 58 ${x + 3.4} 62 L${x + 4} 96 Z`} fill={white} stroke={ink} strokeWidth={0.4} />
          <circle cx={x} cy={56} r={3} fill={green} /><path d={`M${x - 2} 53 L${x} 42 L${x + 2} 53 Z`} fill={white} stroke={ink} strokeWidth={0.3} />
          <path d={`M${x - 2} 70 L${x + 2} 64 M${x + 2} 70 L${x - 2} 64`} stroke={gold} strokeWidth={0.9} /></g>}
        {kind === 1 && <g>{/* sacerdote con piel de leopardo */}
          <path d={`M${x - 1.6} 96 L${x - 1.4} 80 M${x + 1.6} 96 L${x + 1.4} 80`} stroke={skin} strokeWidth={1.8} />
          <path d={`M${x - 3.4} 82 L${x + 3.4} 82 L${x + 3} 64 L${x - 3} 64 Z`} fill={white} stroke={ink} strokeWidth={0.3} />
          <path d={`M${x - 3} 64 L${x + 3} 64 L${x + 2} 76 L${x - 3} 74 Z`} fill={ochre} stroke={ink} strokeWidth={0.3} />
          {[...Array(6)].map((_, j) => <circle key={j} cx={x - 2 + (j % 3) * 1.8} cy={67 + Math.floor(j / 3) * 3.4} r={0.4} fill={ink} />)}
          <circle cx={x} cy={60} r={2.8} fill={skin} /><path d={`M${x - 2.8} 59 Q${x} 55.6 ${x + 2.8} 59`} fill={blue} />
          <path d={`M${x - 3} 68 L${x - 8} 64`} stroke={skin} strokeWidth={1.4} /></g>}
        {kind === 2 && <g>{/* babuino sentado */}
          <path d={`M${x - 3} 96 Q${x - 4} 86 ${x} 84 Q${x + 4} 86 ${x + 3} 96 Z`} fill={lerpHex("#8A7A5A", pal.rock, 0.2)} stroke={ink} strokeWidth={0.3} />
          <circle cx={x + 0.6} cy={82} r={2.4} fill={lerpHex("#8A7A5A", pal.rock, 0.2)} stroke={ink} strokeWidth={0.3} /></g>}
      </g>
    );
    const rows = 7;
    return (
      <g>
        <Grad id={`${id}w`} a={lite(ochre, pal, 0.1)} b={dark(ochre, pal, 0.15)} />
        <rect x={-30} y={0} width={160} height={178} fill={url(`${id}w`)} />
        <rect x={-30} y={30} width={160} height={2} fill={red} /><rect x={-30} y={98} width={160} height={2} fill={red} />
        {[...Array(9)].map((_, i) => <path key={i} d={`M${-20 + i * 16} 34 v12`} stroke={ink} strokeWidth={0.5} strokeDasharray="1.6 1.2" />)}
        {fig(4, 0, 2)}{fig(16, 1, 1)}{fig(32, 2, 0)}{fig(56, 3, 1)}{fig(72, 4, 0)}{fig(92, 5, 2)}
        {/* pintura fresca que chorrea */}
        {[...Array(8)].map((_, i) => { const x = -10 + i * 17 + hash(seed + i) * 6, l = 4 + ((t * 0.04 + hash(i) * 4) % 1) * 6; return <path key={i} d={`M${x} 100 v${l}`} stroke={i % 2 ? red : ochre} strokeWidth={0.8} strokeLinecap="round" opacity={0.85} />; })}
        {/* manchas marrones del moho */}
        {sp > 0 && [...Array(40)].map((_, i) => <circle key={i} cx={-20 + hash(seed + i * 3) * 140} cy={34 + hash(i * 7) * 64} r={(0.4 + hash(i) * 1.4) * clamp01(sp * 2 - hash(i + 5))} fill={lerpHex("#5A3A1E", pal.ink, 0.2)} opacity={0.8} />)}
        {/* muro de bloques que sella la puerta, hilada a hilada */}
        {se > 0 && [...Array(rows)].map((_, r) => {
          const k = clamp01(se * rows - r), y = 108 - (r + 1) * 11;
          return k > 0 && (
            <g key={r} opacity={k} transform={`translate(0 ${(1 - k) * -10})`}>
              {[...Array(5)].map((_, c) => <rect key={c} x={8 + c * 17 + (r % 2) * 8} y={y} width={16} height={10.4} fill={lerpHex(stone, white, 0.3)} stroke={dark(stone, pal, 0.3)} strokeWidth={0.4} />)}
            </g>
          );
        })}
        {se > 0.9 && <g opacity={(se - 0.9) / 0.1}>{[...Array(10)].map((_, i) => <ellipse key={i} cx={20 + (i % 5) * 15} cy={44 + Math.floor(i / 5) * 30} rx={3} ry={2.2} fill={red} stroke={dark(red, pal, 0.3)} strokeWidth={0.4} />)}</g>}
        {shade}
      </g>
    );
  }
  // modo `cambio`: un cartucho grande; arriba el disco de Atón con rayos y manos, que se raspa y deja su sitio a los signos de Amón
  const x = 50, y = 22, w = 26, h = 76;
  return (
    <g>
      <Grad id={`${id}w`} a={lite(stone, pal, 0.15)} b={dark(stone, pal, 0.2)} />
      {wall}
      {cart(x, y, w, h, 0, null, 0.6)}
      {/* signos fijos: el ankh (vida) y el pan y el junco de «Tut» */}
      <g>
        <path d={`M${x} ${y + 56} v14 M${x - 4} ${y + 60} h8`} stroke={blue} strokeWidth={2} /><ellipse cx={x} cy={y + 52.6} rx={2.6} ry={3.6} fill="none" stroke={blue} strokeWidth={1.8} />
        <path d={`M${x - 6} ${y + 46} q6 -4 12 0 Z`} fill={red} />
        <path d={`M${x + 6} ${y + 44} q2 -6 0 -10`} stroke={green} strokeWidth={1.2} fill="none" />
      </g>
      {/* Atón: disco con rayos que acaban en manos */}
      <g opacity={1 - clamp01(rn * 2.2)}>
        <circle cx={x} cy={y + 14} r={6} fill={red} stroke={gold} strokeWidth={0.8} />
        {[...Array(7)].map((_, i) => { const a = Math.PI * (0.15 + i * 0.117); return <g key={i}><path d={`M${x + Math.cos(a) * 6} ${y + 14 + Math.sin(a) * 6} L${x + Math.cos(a) * 15} ${y + 14 + Math.sin(a) * 15}`} stroke={gold} strokeWidth={0.6} /><circle cx={x + Math.cos(a) * 15.6} cy={y + 14 + Math.sin(a) * 15.6} r={0.9} fill={gold} /></g>; })}
      </g>
      {rn > 0 && rn < 0.6 && <rect x={x - 11} y={y + 4} width={22} height={lerp(0, 28, rn / 0.45)} fill={lerpHex(stone, "#9A7E58", 0.5)} opacity={0.9} />}
      {working(p.rename) && rn < 0.5 && chisel(x + 4, y + lerp(8, 28, rn * 2))}
      {/* Amón: hoja de junco, tablero de juego y agua */}
      <g opacity={clamp01((rn - 0.5) * 2.2)}>
        <path d={`M${x - 6} ${y + 26} q2 -12 0 -18 q3 6 0 18`} fill={green} />
        <rect x={x - 2} y={y + 18} width={10} height={3.6} fill={blue} /><path d={`M${x - 1} ${y + 18} v-3 M${x + 2} ${y + 18} v-3 M${x + 5} ${y + 18} v-3`} stroke={blue} strokeWidth={1} />
        <path d={`M${x - 8} ${y + 32} l2 -1.4 l2 1.4 l2 -1.4 l2 1.4 l2 -1.4 l2 1.4 l2 -1.4 l2 1.4`} stroke={blue} strokeWidth={0.9} fill="none" />
        <rect x={x - 12} y={y + 4} width={24} height={30} rx={10} fill={gold} opacity={0.18 * (1 - rn) + 0.08} />
      </g>
      {shade}
    </g>
  );
};
