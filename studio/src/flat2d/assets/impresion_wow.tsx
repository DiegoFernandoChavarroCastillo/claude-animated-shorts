// impresion_wow · prop (senal-wow): la hoja de impresora de Big Ear del 15 de agosto de 1977, de cerca: papel continuo de franjas
// verdes con agujeros de arrastre a los lados y columnas de caracteres de la intensidad (espacios, unos, doses…); en una columna, de
// arriba abajo, «6EQUJ5». Lienzo 100 × 130, anclaje en el centro. opts.rodeado true y opts.wow true dejan ya dibujados el círculo rojo
// y el «Wow!» al margen. Acciones propias: `circle` un rotulador rojo rodea «6EQUJ5» (se queda); `write` escribe «Wow!» en rojo al margen
// izquierdo (se queda); `glow` los caracteres de la señal brillan mientras dura.
import React from "react";
import { type AssetFC, clamp01, hash, idle, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, url } from "./shade";

const COLS = 9, ROWS = 16, SIGC = 5, SIGR = 6;
const SIGNAL = ["6", "E", "Q", "U", "J", "5"];
const RED = "#D8262A";

export const ImpresionWow: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `iw${seed}`, I = idle(t, seed);
  const cir = p.circle !== undefined ? clamp01(p.circle) : opt(opts, "rodeado", false) ? 1 : 0;
  const wow = p.write !== undefined ? clamp01(p.write) : opt(opts, "wow", false) ? 1 : 0;
  const gl = Math.sin(clamp01(p.glow ?? 0) * Math.PI);
  const paper = lerpHex("#F2EFE4", pal.wallLit, 0.12), band = lerpHex("#CFE6C8", paper, 0.25), ink = lerpHex("#2A2E3A", pal.ink, 0.2);
  const x0 = 30, dxc = 6.6, y0 = 22, dyr = 6.2;
  const ch = (r: number, c: number) => {
    if (c === SIGC && r >= SIGR && r < SIGR + 6) return SIGNAL[r - SIGR];
    const h = hash(seed + r * 31 + c * 7);
    return h < 0.5 ? " " : h < 0.85 ? "1" : h < 0.96 ? "2" : "3";
  };
  const cx = x0 + SIGC * dxc + 1.5, cy = y0 + (SIGR + 2.5) * dyr - 2, rx = 6, ry = 22;
  const circLen = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
  return (
    <g transform={`translate(50 65) rotate(${-2 + I.sway * 0.4}) translate(-50 -65)`}>
      <Grad id={`${id}p`} a={paper} b={lerpHex(paper, pal.ink, 0.18)} />
      <ContactShadow id={`${id}c`} cx={52} cy={124} rx={46} a={0.4} />
      <rect x={6} y={4} width={88} height={120} fill={url(`${id}p`)} />
      {[...Array(10)].map((_, i) => <rect key={i} x={6} y={4 + i * 12.4} width={88} height={6.2} fill={band} opacity={0.75} />)}
      {/* perforación de arrastre y línea de corte */}
      {[...Array(20)].map((_, i) => <g key={i}><circle cx={10} cy={8 + i * 6} r={1.3} fill={dark(paper, pal, 0.55)} /><circle cx={90} cy={8 + i * 6} r={1.3} fill={dark(paper, pal, 0.55)} /></g>)}
      <path d="M14 4 L14 124 M86 4 L86 124" stroke={dark(paper, pal, 0.25)} strokeWidth={0.2} strokeDasharray="0.6 0.8" />
      {/* cabecera de la hoja */}
      <text x={x0 - 6} y={14} fontFamily="monospace" fontSize={3.2} fill={ink} opacity={0.75}>1 2 3 4 5 6 7 8 9 0 1 2</text>
      {/* columnas de intensidad */}
      {[...Array(ROWS)].map((_, r) => [...Array(COLS)].map((_, c) => {
        const s = ch(r, c), sig = c === SIGC && r >= SIGR && r < SIGR + 6;
        return s === " " ? null : (
          <text key={`${r}-${c}`} x={x0 + c * dxc} y={y0 + r * dyr} fontFamily="monospace" fontWeight={sig ? 700 : 400} fontSize={sig ? 5.2 : 4.4}
            fill={sig ? lerpHex(ink, "#000000", 0.4) : ink} opacity={sig ? 1 : 0.72}>{s}</text>
        );
      }))}
      {gl > 0 ? <Halo id={`${id}g`} cx={cx} cy={cy} r={24} color={pal.glow} a={0.5 * gl} /> : null}
      {/* círculo rojo de rotulador */}
      {cir > 0 ? <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={RED} strokeWidth={1.3} strokeLinecap="round"
        strokeDasharray={`${circLen * cir} ${circLen}`} transform={`rotate(-4 ${cx} ${cy})`} opacity={0.92} /> : null}
      {/* «Wow!» al margen izquierdo, escrito a mano */}
      <defs><clipPath id={`${id}w`}><rect x={14} y={40} width={1 + wow * 22} height={30} /></clipPath></defs>
      {wow > 0 ? (
        <g clipPath={url(`${id}w`)}>
          <text x={15} y={60} fontFamily="'Comic Neue', 'Segoe Print', 'Bradley Hand', cursive" fontStyle="italic" fontWeight={700} fontSize={9.5} fill={RED}
            transform="rotate(-12 26 56)" opacity={0.95}>Wow!</text>
        </g>
      ) : null}
      {wow > 0.95 && cir > 0.95 ? <path d={`M${cx - rx - 0.5} ${cy - 6} Q44 52 37 56`} stroke={RED} strokeWidth={0.7} fill="none" opacity={0.75} /> : null}
    </g>
  );
};
