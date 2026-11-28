// mano_agua · prop (heraclito-rio): primer plano de una mano que baja desde arriba y toca la superficie de un río; la corriente corre de izquierda a
// derecha sin parar (líneas de luz y hojitas que se van) y bajo la superficie se ven piedras del fondo. Lienzo 100 × 100, anclaje en el centro.
// opts.manga (color de la manga, clave de paleta o #hex; "#3A5A8C"). Acciones propias: `touch` la mano baja hasta el agua y la toca: se abren ondas
// que la corriente arrastra (se queda tocando); `flow` el agua se lleva un puñado de destellos dorados río abajo mientras dura (el agua de ayer ya se fue).
import React from "react";
import { type AssetFC, hash, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const ManoAgua: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `ma${seed}`, I = idle(t, seed), tc = p.touch ?? 0, fl = p.flow ?? 0, flowing = fl > 0 && fl < 1;
  const mangaO = String(opt(opts, "manga", "#3A5A8C")), manga = mangaO.startsWith("#") ? mangaO : ((pal as Record<string, string>)[mangaO] ?? "#3A5A8C");
  const water = lerpHex("#3E8FC8", pal.wall, 0.35), surf = 52, dy = lerp(-34, 0, Math.min(1, tc * 1.25)) + I.breath * 0.4, touched = tc > 0.78;
  const skin = pal.skin;
  return (
    <g>
      {/* agua */}
      <Grad id={`${id}w`} a={lite(water, pal, 0.3)} mid={water} b={dark(water, pal, 0.45)} at={0.25} />
      <rect x={-40} y={surf} width={180} height={120} fill={url(`${id}w`)} />
      {/* piedras del fondo, vistas a través del agua */}
      {[[18, 86, 9], [44, 92, 7], [70, 84, 11], [92, 94, 8], [6, 96, 6]].map(([x, y, r], i) => (
        <g key={i} opacity={0.55}><Vol id={`${id}p${i}`} c={lerpHex(pal.rock, water, 0.45)} pal={pal} /><ellipse cx={x + Math.sin(t * 0.07 + i) * 0.5} cy={y} rx={r} ry={r * 0.5} fill={url(`${id}p${i}`)} /></g>
      ))}
      {/* corriente: destellos que corren de izquierda a derecha */}
      {[...Array(40)].map((_, i) => {
        const d = hash(i * 2.1 + seed), y = surf + 1 + d * 46, x = ((hash(i * 7.7) * 140 + t * (0.35 + 0.4 * d) * (1 + fl)) % 140) - 20, w = 3 + d * 9;
        return <rect key={i} x={x} y={y + Math.sin(t * 0.1 + i) * 0.4} width={w} height={0.5 + d * 0.4} rx={0.3} fill={pal.wallLit} opacity={0.15 + 0.3 * (1 - d)} />;
      })}
      {/* el agua de ayer se va: destellos dorados que se alejan */}
      {flowing || fl >= 1 ? [...Array(16)].map((_, i) => {
        const u = Math.min(1, fl * 1.4 - hash(i * 3.1) * 0.4), x = 52 + Math.max(0, u) * 70, y = surf + 4 + hash(i * 5.3) * 14 + Math.sin(t * 0.12 + i) * 0.8;
        return u > 0 && u < 1 ? <circle key={i} cx={x} cy={y} r={0.9 + hash(i) * 0.8} fill={pal.glow} opacity={0.85 * (1 - u)} /> : null;
      }) : null}
      {/* ondas donde toca la mano (la corriente las arrastra) */}
      {touched ? [0, 0.33, 0.66].map((o, k) => { const r = ((t * 0.012 + o) % 1); return <ellipse key={k} cx={50 + r * 8} cy={surf + 1} rx={3 + r * 26} ry={(3 + r * 26) * 0.22} fill="none" stroke={pal.wallLit} strokeWidth={0.7} opacity={(1 - r) * 0.85} />; }) : null}
      {/* reflejo de la mano en el agua */}
      <g opacity={0.25} transform={`translate(0 ${2 * surf - 4}) scale(1 -1) translate(0 ${-dy})`}>
        <path d="M44 34 Q50 30 57 34 L58 50 Q51 54 44 50 Z" fill={dark(skin, pal, 0.3)} />
      </g>
      {/* brazo y mano */}
      <g transform={`translate(0 ${dy})`}>
        <Vol id={`${id}m`} c={manga} pal={pal} />
        <path d="M66 -20 L90 -20 L66 22 L52 16 Z" fill={url(`${id}m`)} />
        <path d="M52 16 L66 22" stroke={lite(manga, pal, 0.35)} strokeWidth={1} />
        <Vol id={`${id}s`} c={skin} pal={pal} />
        {/* muñeca y palma */}
        <path d="M53 15 Q60 18 65 22 Q63 34 58 44 Q51 50 45 46 Q41 38 44 28 Q47 19 53 15 Z" fill={url(`${id}s`)} />
        {/* dedos que se estiran hacia el agua */}
        {[[45, 44, 43, 52], [49, 47, 48, 55], [53, 46, 53, 54], [57, 43, 58, 50]].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2 - 0.6} ${(y1 + y2) / 2} ${x2} ${y2 - (touched ? 1.2 : 0)}`} stroke={skin} strokeWidth={3.2} strokeLinecap="round" fill="none" />
        ))}
        <path d="M44 30 Q39 35 40 41" stroke={skin} strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <path d="M58 22 Q63 30 59 42" stroke={lite(skin, pal, 0.45)} strokeWidth={0.8} fill="none" opacity={0.7} />
      </g>
      {/* donde la mano entra, el agua tapa los dedos */}
      {touched ? <rect x={36} y={surf} width={30} height={3} fill={water} opacity={0.6} /> : null}
      {touched ? <Halo id={`${id}h`} cx={51} cy={surf + 1} r={14} color={pal.glow} a={0.35} /> : null}
    </g>
  );
};
