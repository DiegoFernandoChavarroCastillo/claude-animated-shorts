// onda_radio · ambiente (senal-wow): una señal de radio que viaja de un punto a otro como arcos de luz que se abren desde el emisor,
// con un hilo de luz tenue que marca el camino. Lienzo 100 × 178, anclaje en el centro. opts.de [x, y] y opts.a [x, y] (en el lienzo;
// por defecto de una estrella arriba a la izquierda hacia abajo), opts.color (luz verde agua), opts.n arcos (6), opts.abre (grados, 40),
// opts.auto (true: la onda viaja siempre). Acciones propias: `send` la onda empieza a viajar (con opts.auto false; se queda); `noise` los arcos se rompen en
// ruido de estática que se dispersa (se queda): solo ruido, nada; `fade` se apaga (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { Halo } from "./shade";

export const OndaRadio: AssetFC = ({ t, seed, p, opts }) => {
  const id = `or${seed}`;
  const de = opt(opts, "de", [22, 10]) as unknown as number[], a = opt(opts, "a", [70, 96]) as unknown as number[];
  const col = String(opt(opts, "color", "#9FFFE8")), n = Number(opt(opts, "n", 6)), abre = Number(opt(opts, "abre", 40));
  const auto = Boolean(opt(opts, "auto", true));
  const send = auto ? 1 : clamp01((p.send ?? 0) * 4);
  const nz = clamp01(p.noise ?? 0), fd = 1 - clamp01(p.fade ?? 0);
  const dx = a[0] - de[0], dy = a[1] - de[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  const vis = send * fd;
  if (vis <= 0 && nz <= 0) return null;
  const arcs = [...Array(n)].map((_, i) => {
    const k = ((t * 0.014 + i / n) % 1), r = 3 + k * L, op = Math.sin(k * Math.PI) * (1 - nz);
    const a0 = ang - (abre * Math.PI) / 360, a1 = ang + (abre * Math.PI) / 360;
    const x0 = de[0] + Math.cos(a0) * r, y0 = de[1] + Math.sin(a0) * r, x1 = de[0] + Math.cos(a1) * r, y1 = de[1] + Math.sin(a1) * r;
    return <path key={i} d={`M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`} stroke={col} strokeWidth={0.7 + (1 - k) * 0.6} fill="none" opacity={op * vis} strokeLinecap="round" />;
  });
  const dots = nz > 0 ? [...Array(90)].map((_, i) => {
    const k = hash(i + seed), x = lerp(de[0], a[0], k) + (hash(i * 3) - 0.5) * 30 * nz, y = lerp(de[1], a[1], k) + (hash(i * 7) - 0.5) * 30 * nz;
    const on = hash(i * 13 + Math.floor(t / 2)) > 0.45;
    return on ? <rect key={i} x={x} y={y} width={0.7} height={0.35} fill={col} opacity={(1 - nz * 0.7) * fd} /> : null;
  }) : null;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <path d={`M${de[0]} ${de[1]} L${a[0]} ${a[1]}`} stroke={col} strokeWidth={0.35} opacity={0.25 * vis * (1 - nz)} strokeDasharray="1.2 1.6" strokeDashoffset={-t * 0.3} />
      <Halo id={`${id}s`} cx={de[0]} cy={de[1]} r={7} color={col} a={0.7 * vis * (1 - nz) + 0.1} />
      <circle cx={de[0]} cy={de[1]} r={0.9} fill="#FFFFFF" opacity={vis * (1 - nz)} />
      {arcs}
      {dots}
    </g>
  );
};
