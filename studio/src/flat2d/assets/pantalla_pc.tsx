// pantalla_pc · escenario: un monitor de computadora encendido en el que una IA trabaja sola: el cursor se mueve sin manos, abre
// ventanas, arrastra un archivo a una carpeta y rellena un formulario campo a campo; un rótulo «Agente IA» parpadea en la barra.
// Lienzo 100 × 86 (monitor con pie), anclaje en el centro. Acción propia: `work` (0..1, larga: 4–6 s) recorre la secuencia
// abrir ventana → arrastrar archivo → llenar formulario → ✓ (se queda terminada). Sin la acción, la pantalla está en el escritorio.
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, ContactShadow, dark, lite, url } from "./shade";

const seg = (w: number, a: number, b: number) => clamp01((w - a) / (b - a));
const ease = (x: number) => x * x * (3 - 2 * x);

export const PantallaPc: AssetFC = ({ pal, t, seed, p }) => {
  const id = `pc${seed}`, w = clamp01(p.work ?? 0);
  const win = ease(seg(w, 0.02, 0.16)), drag = ease(seg(w, 0.2, 0.45)), form = seg(w, 0.5, 0.88), done = ease(seg(w, 0.9, 1));
  // ruta del cursor por fases
  let cx: number, cy: number;
  if (w < 0.18) { cx = lerp(80, 22, win); cy = lerp(60, 18, win); }
  else if (w < 0.48) { cx = lerp(24, 70, drag); cy = lerp(30, 42, drag) - Math.sin(drag * Math.PI) * 8; }
  else { const k = Math.min(3, Math.floor(form * 4)); cx = 40 + (form * 4 - k) * 20; cy = 28 + k * 8; }
  const click = (Math.sin(t * 0.5) > 0.85 ? 1 : 0) * (w > 0 && w < 1 ? 1 : 0);
  const screen = 1;
  return (
    <g>
      <Grad id={`${id}s`} a={lerpHex(pal.wall, "#1A4A9A", 0.6)} b={dark(pal.wall, pal, 0.4)} /><Grad id={`${id}b`} a={lite(pal.rock, pal, 0.2)} b={dark(pal.rock, pal, 0.3)} />
      <Halo id={`${id}h`} cx={50} cy={36} r={62} color={pal.rim} a={0.25 * screen} />
      <ContactShadow id={`${id}sh`} cx={50} cy={84} rx={26} />
      {/* pie y marco */}
      <path d="M44 70 L56 70 L60 82 L40 82 Z" fill={url(`${id}b`)} /><rect x={32} y={81} width={36} height={3} rx={1.5} fill={dark(pal.rock, pal, 0.2)} />
      <rect x={2} y={2} width={96} height={68} rx={4} fill={url(`${id}b`)} />
      <rect x={2} y={2} width={96} height={68} rx={4} fill="none" stroke={pal.rim} strokeWidth={0.6} strokeOpacity={0.6} />
      <rect x={5} y={5} width={90} height={60} rx={1.5} fill={url(`${id}s`)} />
      {/* escritorio: iconos y barra */}
      {[[12, 14], [12, 26], [12, 38]].map(([x, y], k) => (
        <g key={k}><rect x={x - 3.5} y={y - 3.5} width={7} height={6} rx={1} fill={k === 1 ? "#F2C14A" : lite(pal.wall, pal, 0.5)} /></g>
      ))}
      <rect x={5} y={60} width={90} height={5} fill={dark(pal.ink, pal, 0.1)} opacity={0.8} />
      <rect x={70} y={61} width={23} height={3} rx={1.5} fill={pal.rim} opacity={0.55 + 0.45 * Math.sin(t * 0.2)} />
      <text x={81.5} y={63.4} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={2.2} fill={pal.ink}>AGENTE IA</text>
      {/* ventana que se abre */}
      <g transform={`translate(${lerp(22, 0, win)} ${lerp(18, 0, win)}) scale(${lerp(0.05, 1, win)})`} opacity={win}>
        <rect x={20} y={10} width={70} height={46} rx={1.5} fill="#F4F7FC" />
        <rect x={20} y={10} width={70} height={5} rx={1.5} fill={pal.rim} />
        {[0, 1, 2].map((k) => <circle key={k} cx={84 - k * 3} cy={12.5} r={0.9} fill={pal.ink} opacity={0.5} />)}
        {/* carpeta destino y archivo arrastrado */}
        <rect x={64} y={36} width={14} height={11} rx={1} fill="#F2C14A" /><rect x={64} y={34} width={6} height={3} rx={0.8} fill="#E0A82A" />
        {w < 0.48 && <g transform={`translate(${lerp(0, 44, drag)} ${lerp(0, 12, drag)})`}><rect x={24} y={24} width={7} height={9} rx={0.8} fill="#ffffff" stroke="#9AA6BA" strokeWidth={0.5} />
          {[0, 1, 2].map((k) => <rect key={k} x={25.4} y={26 + k * 2} width={4} height={0.6} fill="#9AA6BA" />)}</g>}
        {w >= 0.45 && <path d="M69 41 l2 2 l4 -4" stroke="#2FA86B" strokeWidth={1.2} fill="none" opacity={1 - form} />}
        {/* formulario */}
        {[0, 1, 2, 3].map((k) => {
          const f = clamp01(form * 4 - k);
          return (
            <g key={k} opacity={w >= 0.48 ? 1 : 0}>
              <rect x={26} y={20 + k * 8} width={34} height={5} rx={1} fill="#ffffff" stroke={f > 0 && f < 1 ? pal.rim : "#C4CCDA"} strokeWidth={0.6} />
              <rect x={27.4} y={21.8} width={lerp(0, [22, 28, 16, 25][k], f)} height={1.4} fill="#3A4660" transform={`translate(0 ${k * 8})`} />
              {f >= 1 && <path d={`M62 ${21.5 + k * 8} l1.4 1.4 l2.6 -2.8`} stroke="#2FA86B" strokeWidth={1} fill="none" />}
            </g>
          );
        })}
        {done > 0 && <g opacity={done}><circle cx={55} cy={33} r={9 * done} fill="#2FA86B" /><path d="M50.5 33 l3 3 l6 -6" stroke="#fff" strokeWidth={2} fill="none" /></g>}
      </g>
      {/* cursor que se mueve solo */}
      <g transform={`translate(${cx} ${cy}) scale(${1 - click * 0.15})`}>
        <path d="M0 0 L0 7 L2 5.2 L3.4 8.2 L4.6 7.6 L3.2 4.8 L5.6 4.6 Z" fill="#ffffff" stroke={pal.ink} strokeWidth={0.5} />
        {click > 0 && <circle cx={0} cy={0} r={3} fill="none" stroke={pal.glow} strokeWidth={0.6} />}
      </g>
      {/* reflejo del cristal */}
      <path d="M5 5 L40 5 L20 65 L5 65 Z" fill="#ffffff" opacity={0.04} />
    </g>
  );
};

