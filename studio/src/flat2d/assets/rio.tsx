// rio · fondo (heraclito-rio): un río que baja desde el horizonte hacia el espectador entre dos orillas de hierba, con piedras redondas en el agua y
// en la orilla (la espuma se arremolina detrás de cada una), destellos de corriente que bajan sin parar y la columna de reflejo del sol. Lienzo 100 × 178
// (va sobre `cielo`). opts.horizonte (92), opts.x columna del reflejo (62; null = sin reflejo), opts.piedras (true), opts.verde (true), opts.reflejo (x de una silueta reflejada que está desde el inicio; null).
// Acciones propias: `ripple` ondas que se abren en (params x, y; por defecto 50, 128) mientras dura (se tocó el agua, alguien entra al río);
// `rush` la corriente se acelera y se aclara (el agua se va, todo fluye); `fade_reflect` una silueta reflejada en el agua (params x) se deshace con la corriente.
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Vol, dark, lite, url } from "./shade";

const H = 178;
/** medio ancho del río a la altura y (perspectiva: estrecho en el horizonte, ancho abajo), con una curva suave */
const half = (y: number, hz: number) => 3 + (y - hz) * 0.62;
const mid = (y: number, hz: number) => 50 + Math.sin((y - hz) * 0.045) * 7 * clamp01((y - hz) / 40);

export const Rio: AssetFC = ({ pal, t, seed, opts, p, params }) => {
  const hz = opt(opts, "horizonte", 92), rx = opt<number | null>(opts, "x", 62), id = `ri${seed}`, verde = opt(opts, "verde", true), piedras = opt(opts, "piedras", true);
  const rush = p.rush ?? 0, speed = 1 + rush * 2.2;
  const grass = verde ? lerpHex("#5E9A48", pal.wall, 0.25) : lerpHex(pal.rock, pal.wall, 0.3), grassFar = lerpHex(grass, pal.bg, 0.45);
  const water = lerpHex("#3E8FC8", pal.wall, 0.35), waterDeep = lerpHex(water, pal.ink, 0.4);
  // contorno del río
  const ys = [...Array(23)].map((_, i) => hz + (i / 22) ** 1.4 * (H + 4 - hz));
  const left = ys.map((y) => `${mid(y, hz) - half(y, hz)},${y}`), right = ys.map((y) => `${mid(y, hz) + half(y, hz)},${y}`).reverse();
  const riverPath = `M${left.join(" L")} L${right.join(" L")} Z`;
  const rp = (params.ripple ?? {}) as Record<string, unknown>, rpx = Number(rp.x ?? 50), rpy = Number(rp.y ?? 128), rip = p.ripple ?? 0;
  const fr = (params.fade_reflect ?? {}) as Record<string, unknown>, refl = opt<number | null>(opts, "reflejo", null), frx = Number(fr.x ?? refl ?? 50), fd = p.fade_reflect ?? 0;
  const stones: [number, number, number][] = piedras ? [[-0.7, 0.55, 3.2], [0.55, 0.42, 2.4], [-0.25, 0.78, 4.4], [0.8, 0.86, 5.4], [-1.05, 0.95, 6.5], [0.2, 0.3, 1.6], [-0.5, 0.25, 1.3]] : [];
  return (
    <g>
      <Grad id={`${id}g`} a={grassFar} mid={grass} b={dark(grass, pal, 0.35)} at={0.35} />
      <rect x={-40} y={hz - 1} width={180} height={H - hz + 6} fill={url(`${id}g`)} />
      {/* hierba con briznas que se mecen */}
      {[...Array(60)].map((_, i) => {
        const d = hash(i * 2.3 + seed), y = hz + 4 + d * d * (H - hz), side = i % 2 ? -1 : 1, x = mid(y, hz) + side * (half(y, hz) + 2 + hash(i * 5.7) * 40), s = 0.5 + (y - hz) / 60;
        return <path key={i} d={`M${x} ${y} q${Math.sin(t * 0.05 + i) * s} ${-2.4 * s} ${0.6 * s} ${-4 * s}`} stroke={lite(grass, pal, 0.2 + d * 0.2)} strokeWidth={0.35 * s} fill="none" opacity={0.7} />;
      })}
      {/* el agua */}
      <Grad id={`${id}w`} a={lite(water, pal, 0.35)} mid={water} b={waterDeep} at={0.3} />
      <path d={riverPath} fill={url(`${id}w`)} />
      {/* orillas: barro claro a lo largo del borde */}
      <path d={`M${left.join(" L")}`} stroke={lerpHex(pal.rock, pal.wallLit, 0.35)} strokeWidth={1.4} fill="none" opacity={0.75} />
      <path d={`M${right.join(" L")}`} stroke={lerpHex(pal.rock, pal.wallLit, 0.35)} strokeWidth={1.4} fill="none" opacity={0.75} />
      <defs><clipPath id={`${id}c`}><path d={riverPath} /></clipPath></defs>
      <g clipPath={`url(#${id}c)`}>
        {/* reflejo del sol */}
        {rx !== null ? [...Array(14)].map((_, i) => { const y = hz + 2 + i * (2.2 + i * 0.5), w = (1.5 + i * 0.9) * (0.6 + 0.4 * Math.sin(t * 0.09 + i * 1.3)); return <rect key={i} x={rx - w + (y - hz) * 0.05} y={y} width={w * 2} height={0.6 + i * 0.07} rx={0.4} fill={pal.glow} opacity={0.6 - i * 0.035} />; }) : null}
        {/* destellos de corriente que bajan hacia el espectador */}
        {[...Array(54)].map((_, i) => {
          const d = hash(i * 1.7 + seed), u = (d + t * 0.0045 * speed * (0.7 + 0.6 * hash(i * 9.1))) % 1, y = hz + u ** 1.5 * (H - hz), lane = hash(i * 4.4) * 2 - 1;
          const x = mid(y, hz) + lane * half(y, hz) * 0.9, w = 1 + (y - hz) * 0.12 * (0.5 + d), a = (0.18 + 0.3 * d) * Math.sin(u * Math.PI) * (1 + rush * 0.6);
          return <rect key={i} x={x - w / 2} y={y} width={w} height={0.35 + (y - hz) * 0.012} rx={0.3} fill={lerpHex(pal.wallLit, "#FFFFFF", rush * 0.5)} opacity={Math.min(0.9, a)} />;
        })}
        {/* silueta reflejada que la corriente deshace */}
        {(fd > 0 || refl !== null) && fd < 0.999 ? (
          <g opacity={0.55 * (1 - fd)}>
            {/* silueta invertida (pies arriba, en la orilla; cabeza abajo), en franjas que la corriente desplaza cada vez más */}
            {[...Array(14)].map((_, k) => {
              const y = 106 + k * 2.1, off = Math.sin(t * 0.18 + k * 0.9) * (0.4 + fd * 5) + fd * k * 1.1;
              const w = k < 4 ? 2.2 : k < 6 ? 6.5 : k < 10 ? 7.5 - (k - 6) * 0.3 : 0;
              const head = k >= 10;
              return head ? <ellipse key={k} cx={frx + off} cy={y + 1} rx={3.4 - Math.abs(k - 11.5) * 0.6} ry={1.2} fill={pal.ink} /> :
                <g key={k}>{k < 4 ? [-1.4, 1.4].map((d, j) => <rect key={j} x={frx + d - 1 + off} y={y} width={w * 0.9} height={2.2} fill={pal.ink} />) : <rect x={frx - w / 2 + off} y={y} width={w} height={2.2} rx={0.6} fill={pal.ink} />}</g>;
            })}
          </g>
        ) : null}
        {/* ondas al tocar el agua */}
        {rip > 0 ? [0, 0.33, 0.66].map((o, k) => { const r = ((rip * 2 + o) % 1); return <ellipse key={k} cx={rpx} cy={rpy} rx={2 + r * 22} ry={(2 + r * 22) * 0.32} fill="none" stroke={pal.wallLit} strokeWidth={0.6} opacity={(1 - r) * 0.8 * (rip < 1 ? 1 : 0)} />; }) : null}
      </g>
      {/* piedras con espuma detrás */}
      {stones.map(([lx, v, r], i) => {
        const y = lerp(hz + 6, H - 8, v), x = mid(y, hz) + lx * half(y, hz), c = lerpHex(pal.rock, "#8A8478", 0.4);
        return (
          <g key={i}>
            {[0, 1, 2].map((k) => <ellipse key={k} cx={x + Math.sin(t * 0.15 + i + k) * 0.4} cy={y + r * 0.6 + k * r * 0.25 + ((t * 0.08 * speed + k * 0.33) % 1) * r * 0.5} rx={r * (1.1 - k * 0.2)} ry={r * 0.22} fill={pal.wallLit} opacity={0.35 - k * 0.08} />)}
            <Vol id={`${id}s${i}`} c={c} pal={pal} />
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.62} fill={url(`${id}s${i}`)} />
            <ellipse cx={x + r * 0.25} cy={y - r * 0.28} rx={r * 0.45} ry={r * 0.16} fill={lite(c, pal, 0.5)} opacity={0.6} />
          </g>
        );
      })}
    </g>
  );
};
