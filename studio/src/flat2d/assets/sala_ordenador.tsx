// sala_ordenador · fondo (senal-wow): la sala del ordenador de Big Ear en 1977, de noche: pared con paneles, tubo fluorescente, dos
// armarios de cinta magnética con bobinas que giran, una consola con paneles de luces que parpadean, una pantalla de osciloscopio
// verde con la línea de la señal y una impresora de líneas a la derecha de la que sale papel continuo. Suelo desde y ≈ 106.
// Lienzo 100 × 178, anclaje en el centro. opts.luz 0..1 (0,4). Acciones propias: `spike` la línea del osciloscopio sube en un pico
// enorme y vuelve a bajar (mientras dura): llega la señal; `print` sale papel de la impresora y se pliega (se queda); `flat` la línea
// queda plana (se queda): silencio, nada más.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

const SCR = "#7DFFB0";

export const SalaOrdenador: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `so${seed}`, G = 106, luz = Number(opt(opts, "luz", 0.4));
  const sp = clamp01(p.spike ?? 0), spk = Math.sin(sp * Math.PI), pr = p.print === undefined ? 0.25 : 0.25 + clamp01(p.print) * 0.75, fl = clamp01(p.flat ?? 0);
  const wall = lerpHex(lerpHex("#3E4A52", pal.wall, 0.4), pal.ink, 0.45 - luz * 0.3), cab = lerpHex(lerpHex("#7E8A94", pal.wall, 0.3), pal.ink, 0.35 - luz * 0.25);
  const beige = lerpHex(lerpHex("#C8B898", pal.wall, 0.25), pal.ink, 0.35 - luz * 0.25), blue = lerpHex("#2E4A8C", pal.ink, 0.3);
  const reel = (cx: number, cy: number, dir: number, k: number) => {
    const a = t * 0.08 * dir + k;
    return (
      <g key={`${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r={6} fill={dark(cab, pal, 0.55)} stroke={lite(cab, pal, 0.3)} strokeWidth={0.4} />
        <circle cx={cx} cy={cy} r={4.4 - k * 0.4} fill={lerpHex("#3A2A20", pal.ink, 0.3)} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${cx} ${cy} L${cx + Math.cos(a + i * 2.09) * 5.6} ${cy + Math.sin(a + i * 2.09) * 5.6}`} stroke={lite(cab, pal, 0.4)} strokeWidth={0.7} />)}
        <circle cx={cx} cy={cy} r={1.2} fill={lite(cab, pal, 0.5)} />
      </g>
    );
  };
  // línea del osciloscopio: ruido + pico gaussiano
  const line = [...Array(41)].map((_, i) => {
    const x = 50 + i * 0.6, u = (i - 20) / 5, n = (hash(i + Math.floor(t / 2) * 41) - 0.5) * 1.4 * (1 - fl);
    return `${i ? "L" : "M"}${x} ${68 + n - spk * 9 * Math.exp(-u * u)}`;
  }).join(" ");
  const paperH = pr * 30;
  return (
    <g>
      <Grad id={`${id}w`} a={dark(wall, pal, 0.25)} mid={wall} b={dark(wall, pal, 0.1)} at={0.5} />
      <Grad id={`${id}f`} a={dark(wall, pal, 0.15)} b={dark(wall, pal, 0.6)} />
      <Grad id={`${id}c`} h a={dark(cab, pal, 0.25)} mid={lite(cab, pal, 0.1)} b={dark(cab, pal, 0.35)} />
      <Grad id={`${id}b`} h a={dark(beige, pal, 0.2)} mid={lite(beige, pal, 0.15)} b={dark(beige, pal, 0.3)} />
      <rect x={-40} y={-20} width={180} height={G + 20} fill={url(`${id}w`)} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${-36 + i * 22} -20 L${-36 + i * 22} ${G}`} stroke={dark(wall, pal, 0.3)} strokeWidth={0.35} />)}
      {/* tubo fluorescente */}
      <rect x={24} y={14} width={52} height={2.2} rx={1} fill={lerpHex("#E8F4FF", pal.glow, 0.3)} opacity={0.55 + luz * 0.4} />
      <Halo id={`${id}tl`} cx={50} cy={16} r={46} color={pal.glow} a={0.12 + luz * 0.2} />
      {/* reloj de pared */}
      <circle cx={84} cy={34} r={5} fill={lite(beige, pal, 0.3)} stroke={dark(beige, pal, 0.4)} strokeWidth={0.6} />
      <path d={`M84 34 L84 30.5 M84 34 L${84 + Math.cos(t * 0.01) * 3.6} ${34 + Math.sin(t * 0.01) * 3.6}`} stroke={pal.ink} strokeWidth={0.5} />
      {/* armarios de cinta */}
      {[4, 24].map((x, k) => (
        <g key={x}>
          <rect x={x} y={50} width={18} height={G - 50} fill={url(`${id}c`)} />
          <rect x={x + 1.5} y={53} width={15} height={30} fill={dark(cab, pal, 0.4)} stroke={lite(cab, pal, 0.3)} strokeWidth={0.3} />
          {reel(x + 9, 61, 1, k * 0.7)}{reel(x + 9, 75, -1, k * 1.3)}
          {[...Array(6)].map((_, i) => <circle key={i} cx={x + 3 + i * 2.4} cy={88} r={0.6} fill={Math.sin(t * 0.3 + i * 1.7 + k) > 0.2 ? pal.accent : dark(cab, pal, 0.5)} />)}
          <rect x={x + 2} y={92} width={14} height={10} fill={dark(cab, pal, 0.15)} />
        </g>
      ))}
      {/* pantalla del osciloscopio */}
      <rect x={47} y={56} width={30} height={22} rx={1.5} fill={url(`${id}b`)} />
      <rect x={49} y={58} width={26} height={17} rx={1} fill="#06140C" />
      {[...Array(5)].map((_, i) => <path key={i} d={`M49 ${58 + i * 4.25} L75 ${58 + i * 4.25}`} stroke={SCR} strokeWidth={0.12} opacity={0.25} />)}
      <path d={line} stroke={SCR} strokeWidth={0.55} fill="none" />
      <Halo id={`${id}sc`} cx={62} cy={66} r={14 + spk * 10} color={SCR} a={0.25 + spk * 0.45} />
      {/* consola con paneles de luces */}
      <rect x={44} y={80} width={36} height={G - 80} fill={url(`${id}b`)} />
      <rect x={46} y={82} width={32} height={9} fill={blue} />
      {[...Array(3)].map((_, r) => [...Array(12)].map((_, c) => <circle key={`${r}-${c}`} cx={47.5 + c * 2.6} cy={84 + r * 2.6} r={0.55}
        fill={hash(r * 12 + c + Math.floor(t / 6) * 3 + seed) > 0.55 ? lerpHex("#FFD27A", pal.accent, 0.3) : dark(blue, pal, 0.4)} />))}
      <path d="M42 94 L82 94 L84 98 L40 98 Z" fill={lite(beige, pal, 0.2)} />
      {[...Array(14)].map((_, i) => <rect key={i} x={43 + i * 2.8} y={95} width={2} height={1.6} fill={dark(beige, pal, 0.35)} />)}
      {/* impresora de líneas con papel continuo */}
      <rect x={82} y={84} width={18} height={G - 84} fill={url(`${id}c`)} />
      <rect x={84} y={86} width={14} height={3} fill={dark(cab, pal, 0.5)} />
      <path d={`M85 86 L85 ${86 - paperH} L97 ${86 - paperH} L97 86 Z`} fill={lerpHex("#F0EEE2", pal.ink, 0.35 - luz * 0.2)} />
      {[...Array(Math.floor(paperH / 3))].map((_, i) => <rect key={i} x={85} y={86 - paperH + i * 3} width={12} height={1.5} fill={lerpHex("#BFE0B8", pal.ink, 0.35)} opacity={0.6} />)}
      {[...Array(Math.floor(paperH / 2))].map((_, i) => <path key={`l${i}`} d={`M86.5 ${86 - paperH + 1 + i * 2} h${4 + hash(i + seed) * 6}`} stroke={dark(cab, pal, 0.5)} strokeWidth={0.25} />)}
      {/* suelo */}
      <rect x={-40} y={G} width={180} height={100} fill={url(`${id}f`)} />
      {[...Array(8)].map((_, i) => <path key={i} d={`M${-40 + i * 24} ${G} L${-80 + i * 36} 200`} stroke={dark(wall, pal, 0.45)} strokeWidth={0.35} opacity={0.5} />)}
      <ContactShadow id={`${id}cs`} cx={50} cy={G + 1} rx={52} a={0.45} />
    </g>
  );
};
