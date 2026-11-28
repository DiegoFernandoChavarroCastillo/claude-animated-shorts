// erizo · personaje: un erizo de perfil (paradoja del erizo de Schopenhauer): lomo cubierto de púas pardas con puntas claras en dos filas,
// cara y vientre color crema, hocico puntiagudo con nariz negra, ojo brillante, oreja pequeña y patitas. Mira a la derecha (opts.mira -1 = izquierda).
// Lienzo 100 × 70, anclaje en las patas. Respira, mueve el hocico y parpadea siempre.
// opts.frio 0..1 (tinte azul y escarcha en las púas).
// Acciones propias: `tiritar` tiembla de frío y se encoge un poco mientras dura; `pinchar` las púas se erizan, cierra los ojos de dolor y salta
// un destello rojo en el hocico (dura y vuelve): se clavan las púas; `encoger` se hace una bola con la cara escondida (se queda);
// `calor` un halo cálido lo envuelve y cierra los ojos contento con rubor (se queda): por fin calientes.
import React from "react";
import { type AssetFC, clamp01, hash, idle, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Halo, Vol, dark, lite, url } from "./shade";

export const Erizo: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `ez${seed}`, { breath, blink, bob } = idle(t, seed);
  const mira = opt(opts, "mira", 1) < 0 ? -1 : 1;
  const frio = clamp01(opt(opts, "frio", 0));
  const tir = p.tiritar ?? 0, tirOn = tir > 0 && tir < 1 ? Math.min(1, Math.sin(tir * Math.PI) * 3) : 0;
  const pin = p.pinchar ?? 0, pinA = pin > 0 && pin < 1 ? Math.sin(pin * Math.PI) : 0;
  const enc = clamp01(p.encoger ?? 0), cal = clamp01(p.calor ?? 0);
  const shake = tirOn * Math.sin(t * 2.3) * 1.3;
  const spineC = lerpHex(lerpHex("#6B4A32", pal.rock, 0.25), "#8FA8C8", frio * 0.35), tipC = lerpHex("#E8D6B8", "#F2F7FF", frio * 0.6);
  const cream = lerpHex(lerpHex("#E9CFA6", pal.skin, 0.25), "#CFDDEB", frio * 0.25), nose = "#1A1412";
  const cx = 46, cy = 48 - enc * 2, rx = 33 - enc * 9, ry = 21 + enc * 2 - tirOn * 1.5;
  const L = 11 * (1 + pinA * 0.9 + enc * 0.15);
  // púas: dos filas a lo largo del arco superior, apuntando hacia atrás (izquierda)
  const spines = (row: number) => [...Array(row ? 22 : 26)].map((_, i, a) => {
    const u = (i + (row ? 0.5 : 0)) / (a.length - 1), ang = Math.PI * (1.02 + u * (0.74 + enc * 0.5));
    const bx = cx + Math.cos(ang) * rx * (row ? 0.82 : 0.98), by = cy + Math.sin(ang) * ry * (row ? 0.8 : 0.98);
    const nx = Math.cos(ang - 0.45), ny = Math.sin(ang - 0.45) - 0.15, len = L * (0.8 + hash(seed + i * 3 + row) * 0.4) * (row ? 0.8 : 1);
    const wx = -Math.sin(ang) * 2.4, wy = Math.cos(ang) * 2.4;
    return <g key={`${row}${i}`}>
      <path d={`M${bx + wx} ${by + wy} L${bx + nx * len} ${by + ny * len} L${bx - wx} ${by - wy} Z`} fill={row ? dark(spineC, pal, 0.2) : spineC} />
      <path d={`M${bx + nx * len * 0.62} ${by + ny * len * 0.62} L${bx + nx * len} ${by + ny * len}`} stroke={tipC} strokeWidth={1.1} strokeLinecap="round" />
    </g>;
  });
  const hx = cx + rx * 0.78 + bob * 0.4, hy = cy + 2, sn = 1 + Math.sin(t * 0.33 + seed) * 0.04;
  const eyeShut = pinA > 0.25 || cal > 0.5;
  return (
    <g transform={`translate(${shake} 0) ${mira < 0 ? "translate(100 0) scale(-1 1)" : ""}`}>
      <Vol id={`${id}b`} c={dark(spineC, pal, 0.15)} pal={pal} /><Vol id={`${id}f`} c={cream} pal={pal} k={0.7} />
      {cal > 0 ? <Halo id={`${id}h`} cx={cx} cy={cy - 4} r={44} color="#FFB45A" a={0.5 * cal} /> : null}
      <ContactShadow id={`${id}s`} cx={50} cy={69} rx={36} a={0.42} />
      <g transform={`translate(${cx} ${cy}) scale(${1 + breath * 0.015} ${1 + breath * 0.03}) translate(${-cx} ${-cy})`}>
        {/* patitas */}
        {enc < 0.6 ? [cx - 18, cx - 8, cx + 10, cx + 20].map((x, i) => (
          <ellipse key={i} cx={x} cy={67} rx={3.4} ry={2.4 + (i % 2) * 0.3} fill={dark(cream, pal, i % 2 ? 0.35 : 0.2)} opacity={1 - enc} />)) : null}
        {/* cuerpo y vientre */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={url(`${id}b`)} />
        <path d={`M${cx - rx * 0.7} ${cy + ry * 0.55} Q${cx} ${cy + ry * 1.05} ${cx + rx * 0.85} ${cy + ry * 0.35}`} fill={url(`${id}f`)} opacity={1 - enc * 0.8} />
        {/* abrigo de púas: masa dentada que cubre el lomo (detrás de las púas sueltas) */}
        <path d={[...Array(41)].map((_, i) => {
          const u = i / 40, ang = Math.PI * (0.92 + u * (0.98 + enc * 1.05)), r = i % 2 ? 1.02 : 1.16 + pinA * 0.2;
          return `${i ? "L" : "M"}${cx + Math.cos(ang) * rx * r} ${cy + Math.sin(ang) * ry * r}`;
        }).join(" ") + ` Q${cx + rx * 0.2} ${cy + ry * (0.35 + enc * 0.6)} ${cx - rx * 0.9} ${cy + ry * 0.4} Z`} fill={url(`${id}b`)} />
        {[...Array(18)].map((_, i) => { const u = (i + 0.5) / 18, ang = Math.PI * (1.0 + u * 0.95), rr = 0.55 + (i % 3) * 0.13;
          return <path key={i} d={`M${cx + Math.cos(ang) * rx * rr} ${cy + Math.sin(ang) * ry * rr} l${-3 - pinA * 2} ${-1.5}`} stroke={tipC} strokeWidth={0.7} opacity={0.55} strokeLinecap="round" />; })}
        {/* cabeza: hocico puntiagudo (se esconde al encogerse) */}
        <g transform={`translate(${hx - enc * 14} ${hy + enc * 6}) scale(${1 - enc * 0.35}) translate(${-hx} ${-hy})`} opacity={1 - enc}>
          <path d={`M${hx - 14} ${hy - 4} Q${hx - 10} ${hy - 15} ${hx + 2} ${hy - 12} Q${hx + 12} ${hy - 8} ${hx + 20 * sn} ${hy + 2} Q${hx + 14} ${hy + 9} ${hx} ${hy + 10} Q${hx - 12} ${hy + 10} ${hx - 14} ${hy - 4} Z`} fill={url(`${id}f`)} />
          <circle cx={hx + 20 * sn} cy={hy + 2.6} r={2.6} fill={nose} /><circle cx={hx + 20.6 * sn} cy={hy + 1.6} r={0.8} fill="#fff" opacity={0.6} />
          <path d={`M${hx - 3} ${hy - 12} q2 -5 5 -1`} fill={dark(cream, pal, 0.25)} />
          {eyeShut
            ? <path d={cal > 0.5 && pinA < 0.25 ? `M${hx + 2} ${hy - 4} q2.6 -2.4 5.2 0` : `M${hx + 2} ${hy - 6} l3 2 l-3 2 M${hx + 7.5} ${hy - 6} l-3 2 l3 2`} stroke={nose} strokeWidth={1.1} fill="none" strokeLinecap="round" />
            : <g><ellipse cx={hx + 5} cy={hy - 4} rx={2.4} ry={2.7 * (1 - blink * 0.9)} fill={nose} /><circle cx={hx + 5.8} cy={hy - 5} r={0.8} fill="#fff" opacity={1 - blink} /></g>}
          {cal > 0 ? <ellipse cx={hx + 8} cy={hy + 1} rx={2.6} ry={1.4} fill="#E87A7A" opacity={0.6 * cal} /> : null}
          {pinA > 0 ? <path d={`M${hx + 10} ${hy + 6} q2 1.5 4 0`} stroke={nose} strokeWidth={0.8} fill="none" opacity={pinA} /> : null}
          <path d={`M${hx - 8} ${hy - 10} Q${hx + 4} ${hy - 11} ${hx + 12} ${hy - 5}`} stroke={lite(cream, pal, 0.5)} strokeWidth={0.8} fill="none" opacity={0.7} />
        </g>
        {spines(1)}{spines(0)}
        {/* escarcha */}
        {frio > 0.2 ? [...Array(7)].map((_, i) => <circle key={i} cx={cx - rx * 0.6 + i * rx * 0.2} cy={cy - ry - 3 + hash(seed + i) * 4} r={0.9} fill="#F4FAFF" opacity={frio} />) : null}
      </g>
      {/* destello rojo del pinchazo en el hocico */}
      {pinA > 0.05 ? <g opacity={pinA} transform={`translate(${hx + 22} ${hy - 8}) scale(${0.9 + pinA * 0.9})`}>
        <path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="#FF4A3A" />
        <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" fill="#FFE2A0" />
      </g> : null}
    </g>
  );
};
