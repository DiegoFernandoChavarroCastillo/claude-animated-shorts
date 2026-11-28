// sala_tv · fondo: una sala de estar de hoy, de noche: pared con cuadro y ventana con la ciudad, lámpara de pie encendida, sofá de tres
// plazas con cojines a la izquierda (asiento en y ≈ 92, para una `figura` sentada en x ≈ 0,2–0,4) y, a la derecha, un televisor sobre un mueble
// bajo con su mando. La pantalla es un catálogo de películas genérico (sin marcas): portadas de ACCIÓN, COMEDIA y SERIE, y su luz azul baña la
// sala. Suelo de madera con alfombra desde y ≈ 106. Lienzo 100 × 178, anclaje en el centro.
// Acciones propias: `browse` las portadas pasan y el recuadro de selección salta de una a otra mientras dura (se queda en la última);
// `stars` aparecen calificaciones con estrellas y una barra de tráiler bajo la portada elegida (se queda); `off` la tele se apaga y la
// pantalla queda negra con el reflejo de la sala (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

const COVERS: [string, string, string][] = [["ACCIÓN", "#C8402E", "boom"], ["COMEDIA", "#E8A630", "smile"], ["SERIE", "#5A4AB8", "S1"], ["DRAMA", "#2E6E8E", "drop"], ["TERROR", "#3A2A3A", "ghost"], ["ROMANCE", "#C84A7A", "heart"]];
/** icono simple de cada género (sin emojis: el navegador del render no siempre los tiene) */
const Icon: React.FC<{ k: string; x: number; y: number }> = ({ k, x, y }) => {
  if (k === "boom") return <path d={`M${x} ${y - 2.8} l0.9 1.8 l2 -0.8 l-0.8 2 l1.8 0.9 l-1.8 0.9 l0.8 2 l-2 -0.8 l-0.9 1.8 l-0.9 -1.8 l-2 0.8 l0.8 -2 l-1.8 -0.9 l1.8 -0.9 l-0.8 -2 l2 0.8 Z`} fill="#FFD23A" />;
  if (k === "smile") return <g><circle cx={x} cy={y} r={2.4} fill="#FFF2B0" /><path d={`M${x - 1.2} ${y + 0.4} q1.2 1.3 2.4 0`} stroke="#5A3A10" strokeWidth={0.4} fill="none" /><circle cx={x - 0.8} cy={y - 0.6} r={0.3} fill="#5A3A10" /><circle cx={x + 0.8} cy={y - 0.6} r={0.3} fill="#5A3A10" /></g>;
  if (k === "drop") return <path d={`M${x} ${y - 2.6} q2.2 2.8 0 4.6 q-2.2 -1.8 0 -4.6 Z`} fill="#BFE4FF" />;
  if (k === "ghost") return <path d={`M${x - 2} ${y + 2.4} L${x - 2} ${y - 0.6} Q${x} ${y - 3.4} ${x + 2} ${y - 0.6} L${x + 2} ${y + 2.4} l-1 -0.8 l-1 0.8 l-1 -0.8 Z`} fill="#EDE8F4" />;
  if (k === "heart") return <path d={`M${x} ${y + 2.2} C${x - 3.4} ${y - 0.4} ${x - 1.6} ${y - 3} ${x} ${y - 1.2} C${x + 1.6} ${y - 3} ${x + 3.4} ${y - 0.4} ${x} ${y + 2.2} Z`} fill="#FFD0DC" />;
  return <text x={x} y={y + 1.2} fontSize={3} textAnchor="middle" fontWeight={900} fill="#fff" fontFamily="Arial, sans-serif">{k}</text>;
};

export const SalaTv: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `st${seed}`, G = 106, br = p.browse ?? 0, st = clamp01(p.stars ?? 0), off = clamp01(p.off ?? 0), on = 1 - off;
  const wall = lerpHex(pal.wall, pal.ink, 0.3), wood = lerpHex("#6A4028", pal.ink, 0.35), sofa = lerpHex("#3E5A8A", pal.ink, 0.2);
  const tvGlow = "#7FB8FF", lamp = "#FFC870";
  // la portada seleccionada: con `browse` salta de una en una (≈ 9 saltos), luego se queda
  const sel = br > 0 ? Math.min(COVERS.length * 2 - 1, Math.floor(br * 11)) : 0, scroll = br > 0 && br < 1 ? br * 3 : br >= 1 ? 3 : 0;
  const sx = 52, sy = 52, sw = 36, sh = 24;
  if (opt(opts, "capa", "") === "delante") return (
    <g>
      <Vol id={`${id}so`} c={sofa} pal={pal} k={1} lx={0.3} ly={0.2} />
      <rect x={-6} y={88} width={62} height={12} rx={4} fill={lite(sofa, pal, 0.08)} />
      <rect x={-10} y={74} width={9} height={26} rx={4} fill={url(`${id}so`)} /><rect x={51} y={74} width={9} height={26} rx={4} fill={url(`${id}so`)} />
      {[-2, 52].map((x) => <rect key={x} x={x} y={100} width={2.4} height={6} fill={dark(wood, pal, 0.4)} />)}
    </g>);
  return (
    <g>
      <Grad id={`${id}w`} a={dark(wall, pal, 0.35)} mid={wall} b={dark(wall, pal, 0.15)} />
      <Grad id={`${id}f`} a={wood} b={dark(wood, pal, 0.55)} />
      <Vol id={`${id}so`} c={sofa} pal={pal} k={1} lx={0.3} ly={0.2} /><Vol id={`${id}m`} c={wood} pal={pal} k={0.8} />
      <rect x={-40} y={-20} width={180} height={G + 20} fill={url(`${id}w`)} />
      {/* ventana con la ciudad de noche */}
      <rect x={8} y={14} width={34} height={36} rx={1} fill="#0E1838" />
      {[...Array(9)].map((_, i) => { const bx = 9 + i * 3.8, bh = 8 + hash(i + seed) * 16; return (
        <g key={i}><rect x={bx} y={50 - bh} width={3.4} height={bh} fill="#1C2A52" />
          {[0, 1, 2].map((k) => hash(i * 5 + k) > 0.45 && <rect key={k} x={bx + 1} y={50 - bh + 2 + k * 4} width={1.2} height={1.4} fill="#FFD78A" opacity={0.85} />)}</g>); })}
      <circle cx={34} cy={21} r={2.6} fill="#F2EEDA" /><Halo id={`${id}lu`} cx={34} cy={21} r={8} color="#BBD0FF" a={0.4} />
      <path d="M25 14 L25 50 M8 32 L42 32" stroke={lite(wall, pal, 0.25)} strokeWidth={1.1} />
      <rect x={8} y={14} width={34} height={36} rx={1} fill="none" stroke={lite(wall, pal, 0.3)} strokeWidth={1.5} />
      {/* cuadro */}
      <rect x={60} y={14} width={26} height={18} fill={dark(wood, pal, 0.2)} /><rect x={61.6} y={15.6} width={22.8} height={14.8} fill={lerpHex(pal.accent, pal.wall, 0.3)} />
      <path d="M62 30 L69 22 L74 27 L78 23 L84 30 Z" fill={dark(pal.accent, pal, 0.35)} />
      {/* lámpara de pie */}
      <Halo id={`${id}la`} cx={4} cy={50} r={24} color={lamp} a={0.45} />
      <rect x={3.4} y={52} width={1.2} height={G - 52} fill={dark("#C8A060", pal, 0.3)} /><ellipse cx={4} cy={G} rx={4} ry={1} fill={dark("#C8A060", pal, 0.4)} />
      <path d="M-2 52 L10 52 L7 42 L1 42 Z" fill={lerpHex(lamp, "#FFF4D8", 0.4)} />
      {/* suelo y alfombra */}
      <rect x={-40} y={G} width={180} height={110} fill={url(`${id}f`)} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${-40 + i * 26} ${G} L${-70 + i * 34} 200`} stroke={dark(wood, pal, 0.45)} strokeWidth={0.4} opacity={0.6} />)}
      <ellipse cx={46} cy={G + 16} rx={44} ry={9} fill={lerpHex(pal.accent, pal.ink, 0.35)} opacity={0.6} />
      {/* luz de la tele sobre la sala */}
      <Halo id={`${id}tg`} cx={sx + sw / 2} cy={sy + sh / 2} r={60} color={tvGlow} a={0.32 * on * (0.85 + 0.15 * Math.sin(t * 0.4))} />
      {/* sofá */}
      <ContactShadow id={`${id}cs`} cx={28} cy={G + 1} rx={34} a={0.45} />
      <rect x={-4} y={64} width={58} height={30} rx={6} fill={url(`${id}so`)} />
      {[6, 24, 42].map((x) => <rect key={x} x={x - 7} y={67} width={16} height={20} rx={4} fill={lite(sofa, pal, 0.12)} opacity={0.9} />)}
      <rect x={-6} y={88} width={62} height={12} rx={4} fill={lite(sofa, pal, 0.08)} />
      <rect x={-10} y={74} width={9} height={26} rx={4} fill={url(`${id}so`)} /><rect x={51} y={74} width={9} height={26} rx={4} fill={url(`${id}so`)} />
      {[-2, 52].map((x) => <rect key={x} x={x} y={100} width={2.4} height={G - 100} fill={dark(wood, pal, 0.4)} />)}
      {/* mueble bajo y mando */}
      <ContactShadow id={`${id}ms`} cx={72} cy={G + 1} rx={24} a={0.4} />
      <rect x={52} y={84} width={40} height={G - 84} rx={1.5} fill={url(`${id}m`)} />
      <path d="M72 86 L72 104 M53 95 L91 95" stroke={dark(wood, pal, 0.45)} strokeWidth={0.5} />
      <rect x={82} y={81.6} width={7} height={2.4} rx={1} fill="#1E1E24" /><circle cx={83.4} cy={82.8} r={0.5} fill="#E84A3A" />
      {/* televisor */}
      <rect x={68} y={78} width={4} height={6} fill="#18181E" /><rect x={62} y={83} width={16} height={1.4} rx={0.6} fill="#18181E" />
      <rect x={sx - 1.6} y={sy - 1.6} width={sw + 3.2} height={sh + 3.2} rx={1.4} fill="#121218" />
      <svg x={sx} y={sy} width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`} overflow="hidden">
        <rect width={sw} height={sh} fill={lerpHex("#0A0C14", "#141A2C", on)} />
        <g opacity={on}>
          <rect x={2} y={1.6} width={10} height={1.4} rx={0.6} fill="#E84A3A" />
          {[...Array(3)].map((_, row) => [...Array(4)].map((__, c) => {
            const k = (row * 4 + c) % COVERS.length, [name, col, ic] = COVERS[(k + Math.floor(scroll)) % COVERS.length];
            const x = 1.4 + c * 8.6 - ((scroll % 1) * 8.6) * (row === 0 ? 1 : 0), y = 4.4 + row * 10.4, isSel = row === 0 && (c === sel % 4);
            return (
              <g key={`${row}-${c}`}>
                <rect x={x} y={y} width={7.8} height={9.4} rx={0.6} fill={col} />
                <rect x={x} y={y + 6.6} width={7.8} height={2.8} fill="#000" opacity={0.35} />
                <Icon k={ic} x={x + 3.9} y={y + 3.4} />
                <text x={x + 3.9} y={y + 8.6} fontSize={1.5} textAnchor="middle" fontWeight={700} fill="#fff" fontFamily="Arial, sans-serif">{name}</text>
                {isSel && <rect x={x - 0.5} y={y - 0.5} width={8.8} height={10.4} rx={0.8} fill="none" stroke="#fff" strokeWidth={0.6} />}
              </g>);
          }))}
          {st > 0 && <g opacity={st}>
            <rect x={1} y={14.4} width={sw - 2} height={10.6} rx={0.8} fill="#000" opacity={0.75} />
            {[...Array(5)].map((_, i) => <text key={i} x={3.4 + i * 3.4} y={18.6} fontSize={3} fill={i < Math.round(st * 4) ? "#FFD23A" : "#555"}>★</text>)}
            <text x={20} y={18.4} fontSize={1.6} fill="#ccc" fontFamily="Arial, sans-serif">Sinopsis · 2 h 10 min</text>
            <rect x={3} y={21.4} width={30} height={1.2} rx={0.6} fill="#444" /><rect x={3} y={21.4} width={30 * ((t * 0.01) % 1)} height={1.2} rx={0.6} fill="#E84A3A" />
          </g>}
        </g>
        {/* reflejo de la sala en la pantalla apagada */}
        <g opacity={off * 0.5}><path d={`M0 ${sh} L${sw * 0.35} 0 L${sw * 0.5} 0 L${sw * 0.15} ${sh} Z`} fill="#fff" opacity={0.1} />
          <rect x={4} y={sh - 10} width={20} height={8} rx={2} fill={lite(sofa, pal, 0.1)} opacity={0.25} /></g>
      </svg>
    </g>
  );
};
