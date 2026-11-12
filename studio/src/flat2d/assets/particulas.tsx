// particulas · capa de ambiente: motas en suspensión que derivan sin parar. `opts.kind`: polvo (motas doradas que flotan), chispas (suben y
// se apagan), burbujas (suben con vaivén), nieve (cae), hojas (caen girando), confeti (cae de colores), humo (volutas que suben), notas (notas musicales que suben).
// lluvia (cortinas de gotas en diagonal). `opts.n` cantidad (por defecto 40), `opts.color`. `burst` (acción propia): estalla desde el centro y luego sigue cayendo (confeti, chispas).
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";

export const Particulas: AssetFC = ({ pal, t, seed, opts, p }) => {
  const kind = opt(opts, "kind", "polvo"), n = opt(opts, "n", 40), H = 178, burst = p.burst;
  const col = opt<string | null>(opts, "color", null);
  const confeti = [pal.accent, pal.rim, pal.wallLit, pal.glow, lerpHex(pal.accent, pal.wall, 0.5)];
  const up = kind === "chispas" || kind === "burbujas" || kind === "humo" || kind === "notas";
  const speed = { lluvia: 2.4, polvo: 0.05, chispas: 0.55, burbujas: 0.32, nieve: 0.3, hojas: 0.36, confeti: 0.7, humo: 0.2, notas: 0.26 }[kind] ?? 0.1;
  return (
    <g>{[...Array(n)].map((_, i) => {
      const h1 = hash(i * 1.37 + seed), h2 = hash(i * 2.11 + seed + 9), h3 = hash(i * 3.7 + seed + 21);
      const sp = speed * (0.6 + 0.8 * h3), trav = (h2 * H + t * sp) % H, y = up ? H - trav : kind === "polvo" ? (h2 * H + Math.sin(t * 0.02 + i) * 4 + t * sp) % H : trav;
      let x = h1 * 100 + Math.sin(t * (0.02 + 0.02 * h3) + i * 1.9) * (kind === "polvo" ? 2.5 : 4), yy = y;
      const life = up ? trav / H : 1 - trav / H;
      if (burst !== undefined && burst < 1) { const a = h1 * 6.283, r = burst * (30 + 60 * h2); x = 50 + Math.cos(a) * r; yy = 80 + Math.sin(a) * r * 1.3 + burst * burst * 40; }
      const r = (kind === "burbujas" ? 0.5 + 1.2 * h3 : kind === "humo" ? 3 + 5 * h3 * (0.4 + life) : 0.25 + 0.55 * h3);
      const tw = 0.55 + 0.45 * Math.sin(t * 0.09 + i * 2.3);
      if (kind === "lluvia") return <path key={i} d={`M${x} ${yy} l-1.2 5`} stroke={col ?? pal.wallLit} strokeWidth={0.22} opacity={0.25 + 0.35 * h2} />;
      if (kind === "burbujas") return <circle key={i} cx={x} cy={yy} r={r} fill="none" stroke={col ?? pal.rim} strokeWidth={0.22} opacity={0.35 + 0.4 * h2} />;
      if (kind === "humo") return <circle key={i} cx={x} cy={yy} r={r} fill={col ?? pal.wallLit} opacity={0.1 * (1 - life)} />;
      if (kind === "confeti" || kind === "hojas") {
        const c = kind === "confeti" ? confeti[i % confeti.length] : lerpHex(pal.accent, pal.rim, h3), rot = t * (3 + 6 * h3) + i * 40, sq = Math.abs(Math.cos(t * 0.12 + i));
        return <rect key={i} x={-0.9} y={-0.5} width={1.8} height={kind === "confeti" ? 1 : 1.2} rx={kind === "hojas" ? 0.6 : 0.1} fill={c} transform={`translate(${x} ${yy}) rotate(${rot}) scale(1 ${0.3 + 0.7 * sq})`} opacity={0.95} />;
      }
      if (kind === "notas") return <g key={i} transform={`translate(${x} ${yy}) scale(${0.7 + 0.6 * h3})`} opacity={0.75 * (1 - life * 0.8)}><ellipse cx={0} cy={0} rx={1.1} ry={0.8} fill={col ?? pal.rim} /><path d="M1 0 L1 -4.4 L3 -3.6" stroke={col ?? pal.rim} strokeWidth={0.45} fill="none" /></g>;
      if (kind === "nieve") return <circle key={i} cx={x} cy={yy} r={r * 1.5} fill={col ?? pal.wallLit} opacity={0.6 + 0.3 * h2} />;
      if (kind === "chispas") return <circle key={i} cx={x} cy={yy} r={r} fill={col ?? pal.glow} opacity={(1 - life) * tw} />;
      return <circle key={i} cx={x} cy={yy} r={r} fill={col ?? pal.glow} opacity={(0.25 + 0.5 * h2) * tw} />;
    })}</g>
  );
};
