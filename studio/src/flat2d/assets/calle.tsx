// calle · fondo del kit (D123): una calle vista de frente, con una hilera de casas de alturas y colores distintos, ventanas y puertas en arco, alero, acera
// (que empieza en la franja de los pies, y ≈ 106) y calzada. `opts.epoca`: colonial (tejas, muros de color) | moderna (bloques, muchas ventanas) | antigua (adobe y piedra).
// `opts.luces` 0–1: cuántas ventanas están encendidas (por defecto 1 de noche); `opts.guirnalda` true = guirnalda de bombillas de colores que titilan;
// `opts.faroles` true = farolillos de papel colgados. `lights_on` (acción propia): las ventanas se encienden una tras otra (se quedan).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

export const Calle: AssetFC = ({ pal, t, seed, opts, p, light }) => {
  const epoca = opt(opts, "epoca", "colonial"), night = ["velas", "luna", "fuego", "foco"].includes(light), id = `cl${seed}`;
  const on0 = opt(opts, "luces", night ? 1 : 0), prog = p.lights_on, G = 106;
  const walls = epoca === "antigua" ? [lerpHex(pal.wallLit, pal.rock, 0.35), lerpHex(pal.wallLit, pal.rock, 0.5), pal.wallLit]
    : [lerpHex(pal.accent, pal.wallLit, 0.35), lerpHex(pal.wall, pal.wallLit, 0.3), lerpHex(pal.rim, pal.accent, 0.4), lerpHex("#3FA890", pal.wall, 0.35), lerpHex(pal.wallLit, pal.rim, 0.3)];
  const n = epoca === "moderna" ? 4 : 5, bw = 150 / n, lamps = ["#FF6B6B", "#FFC24B", "#5FD08A", "#5AA8FF", "#FF8AD0"];
  let wi = 0;
  return (
    <g>
      {[...Array(n)].map((_, b) => {
        const x = -25 + b * bw, h = (epoca === "moderna" ? 62 : 44) + hash(b * 3.1 + seed) * 22, top = G - h, c = walls[(b + seed) % walls.length], rows = epoca === "moderna" ? 5 : 2, cols = epoca === "moderna" ? 3 : 2;
        const cd = night ? lerpHex(c, pal.bg, 0.45) : c;
        return (
          <g key={b}>
            <Grad id={`${id}w${b}`} a={lite(cd, pal, night ? 0.02 : 0.18)} b={dark(cd, pal, 0.3)} />
            <rect x={x} y={top} width={bw + 0.3} height={h} fill={url(`${id}w${b}`)} />
            {epoca === "colonial" ? <path d={`M${x - 1.5} ${top} L${x + bw + 1.5} ${top} L${x + bw} ${top - 5} L${x} ${top - 5} Z`} fill={dark(lerpHex("#B5532E", pal.rock, 0.3), pal, night ? 0.5 : 0.1)} />
              : <rect x={x - 0.6} y={top - 1.6} width={bw + 1.5} height={2.4} fill={dark(cd, pal, 0.4)} />}
            {[...Array(rows)].map((_, r) => [...Array(cols)].map((_, q) => {
              const k = wi++, ww = bw / (cols * 2 + 1), wx = x + ww * (1 + q * 2), wh = epoca === "moderna" ? 6 : 11, wy = top + 7 + r * (wh + (epoca === "moderna" ? 5 : 8));
              if (wy + wh > G - (r === rows - 1 && epoca !== "moderna" ? 0 : 3) && epoca === "moderna") return null;
              const ord = hash(k * 5.1 + seed), lit = prog !== undefined ? clamp01((prog - ord * 0.8) * 6) : ord < on0 ? 1 : 0, fl = 0.9 + 0.1 * Math.sin(t * 0.07 + k);
              return (
                <g key={`${r}_${q}`}>
                  {lit > 0 ? <Halo id={`${id}h${k}`} cx={wx + ww / 2} cy={wy + wh / 2} r={ww * 1.9} color={pal.glow} a={0.5 * lit * fl} /> : null}
                  <rect x={wx - 0.7} y={wy - 0.7} width={ww + 1.4} height={wh + 1.4} rx={0.6} fill={dark(cd, pal, 0.55)} />
                  <rect x={wx} y={wy} width={ww} height={wh} rx={0.4} fill={lerpHex(night ? lerpHex(pal.bg, pal.ink, 0.4) : lerpHex("#5A8FC2", pal.ink, 0.25), lerpHex(pal.glow, "#FFB040", 0.3), lit * fl)} />
                  <path d={`M${wx + ww / 2} ${wy} L${wx + ww / 2} ${wy + wh} M${wx} ${wy + wh / 2} L${wx + ww} ${wy + wh / 2}`} stroke={dark(cd, pal, 0.55)} strokeWidth={0.45} />
                </g>
              );
            }))}
            {epoca !== "moderna" ? <path d={`M${x + bw * 0.36} ${G} L${x + bw * 0.36} ${G - 15} Q${x + bw * 0.5} ${G - 23} ${x + bw * 0.64} ${G - 15} L${x + bw * 0.64} ${G} Z`} fill={dark(lerpHex(pal.rock, pal.ink, 0.25), pal, 0.2)} stroke={dark(cd, pal, 0.5)} strokeWidth={0.8} /> : <rect x={x + bw * 0.38} y={G - 12} width={bw * 0.24} height={12} fill={dark(pal.rock, pal, 0.4)} />}
          </g>
        );
      })}
      <Grad id={`${id}a`} a={lite(pal.rock, pal, night ? 0.12 : 0.4)} b={dark(pal.rock, pal, 0.2)} /><Grad id={`${id}r`} a={dark(pal.rock, pal, night ? 0.35 : 0.15)} b={dark(pal.rock, pal, 0.6)} />
      <rect x={-40} y={G} width={180} height={12} fill={url(`${id}a`)} /><rect x={-40} y={G + 12} width={180} height={90} fill={url(`${id}r`)} />
      <rect x={-40} y={G + 11.4} width={180} height={1} fill={dark(pal.rock, pal, 0.55)} />
      {opt(opts, "guirnalda", false) ? [0, 1].map((row) => <g key={row}>
        <path d={`M-25 ${50 + row * 12} Q25 ${64 + row * 12} 62 ${52 + row * 10} T125 ${50 + row * 12}`} stroke={pal.ink} strokeWidth={0.35} fill="none" opacity={0.7} />
        {[...Array(15)].map((_, i) => { const u = i / 14, x = -25 + u * 150, y = 50 + row * 12 + Math.sin(u * Math.PI * 2) * 5 + Math.sin(u * Math.PI) * 6, c = lamps[(i + row) % 5], tw = 0.6 + 0.4 * Math.sin(t * 0.12 + i * 1.7 + row);
          return <g key={i}><Halo id={`${id}l${row}_${i}`} cx={x} cy={y + 1} r={3.4} color={c} a={0.7 * tw} /><circle cx={x} cy={y + 1} r={0.95} fill={lerpHex(c, "#ffffff", 0.35)} /></g>; })}
      </g>) : null}
      {opt(opts, "faroles", false) ? [...Array(4)].map((_, i) => { const x = 22 + i * 19, y = 76 + (i % 2) * 3 + Math.sin(t * 0.04 + i) * 0.5, c = lamps[(i * 2 + 1) % 5], sw = Math.sin(t * 0.035 + i * 2) * 3;
        return <g key={i} transform={`rotate(${sw} ${x} ${y - 8})`}><path d={`M${x} ${y - 8} L${x} ${y - 4}`} stroke={pal.ink} strokeWidth={0.3} /><Halo id={`${id}f${i}`} cx={x} cy={y} r={9} color={c} a={0.6} /><ellipse cx={x} cy={y} rx={3.2} ry={4} fill={lerpHex(c, "#ffffff", 0.2)} />{[-1.6, 0, 1.6].map((dx) => <path key={dx} d={`M${x + dx} ${y - 3.8} Q${x + dx * 1.5} ${y} ${x + dx} ${y + 3.8}`} stroke={dark(c, pal, 0.3)} strokeWidth={0.3} fill="none" />)}</g>; }) : null}
    </g>
  );
};
