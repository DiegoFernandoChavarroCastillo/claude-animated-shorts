// dormitorio · fondo: un dormitorio de hoy visto de frente: pared con cuadro, ventana con cortinas (cielo de amanecer o de noche con luna),
// cama con cabecero, almohadas y edredón arrugado, mesilla con lámpara encendida y despertador, alfombra y suelo de madera desde y ≈ 106.
// Lienzo 100 × 178, anclaje en el centro. opts.noche true = cielo de noche, cuarto en penumbra y la lámpara como única luz.
// Acción propia: `dawn` la luz del amanecer entra por la ventana y aclara el cuarto (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const Dormitorio: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `dm${seed}`, G = 106, noche = opt(opts, "noche", false), dw = clamp01(p.dawn ?? (noche ? 0 : 1));
  const wall = lerpHex(lerpHex(pal.wall, pal.ink, 0.35), lerpHex(pal.wall, pal.wallLit, 0.35), dw);
  const wood = lerpHex(lerpHex("#7A4A2C", pal.ink, 0.5), "#8A5A36", dw), sheet = lerpHex(lerpHex("#5A6A9A", pal.ink, 0.45), "#7C8FC8", dw);
  const skyA = lerpHex("#0B1330", "#F6B37A", dw), skyB = lerpHex("#1C2A5A", "#FFE2B0", dw), lamp = "#FFC870";
  const curt = lerpHex(pal.accent, pal.ink, 0.35 + 0.25 * (1 - dw));
  return (
    <g>
      <Grad id={`${id}w`} a={dark(wall, pal, 0.25)} mid={wall} b={dark(wall, pal, 0.1)} at={0.5} />
      <Grad id={`${id}s`} a={skyA} b={skyB} /><Grad id={`${id}f`} a={wood} b={dark(wood, pal, 0.45)} />
      <Vol id={`${id}e`} c={sheet} pal={pal} k={1} lx={0.3} ly={0.2} /><Vol id={`${id}h`} c={wood} pal={pal} k={0.8} />
      <rect x={-40} y={-20} width={180} height={G + 20} fill={url(`${id}w`)} />
      {/* ventana */}
      <rect x={52} y={22} width={34} height={42} rx={1} fill={url(`${id}s`)} />
      {dw < 0.5 ? <g><circle cx={76} cy={32} r={4} fill="#F4F0DC" opacity={1 - dw * 2} /><Halo id={`${id}m`} cx={76} cy={32} r={12} color="#BBD0FF" a={0.5 * (1 - dw * 2)} /></g>
        : <Halo id={`${id}m`} cx={70} cy={60} r={22} color="#FFD8A0" a={0.6 * dw} />}
      {[...Array(6)].map((_, i) => <circle key={i} cx={55 + hash(i + seed) * 28} cy={25 + hash(i * 3 + seed) * 20} r={0.35} fill="#fff" opacity={(1 - dw) * 0.8} />)}
      <path d="M69 22 L69 64 M52 43 L86 43" stroke={lite(wall, pal, 0.3)} strokeWidth={1.2} />
      <rect x={52} y={22} width={34} height={42} rx={1} fill="none" stroke={lite(wall, pal, 0.35)} strokeWidth={1.6} />
      {[-1, 1].map((sd) => <path key={sd} d={sd < 0 ? `M48 19 Q52 42 ${49 + Math.sin(t * 0.03) * 0.5} 68 L55 68 Q55 40 54 19 Z` : `M90 19 Q86 42 ${89 + Math.sin(t * 0.03 + 1) * 0.5} 68 L83 68 Q83 40 84 19 Z`} fill={curt} />)}
      <rect x={46} y={17.5} width={46} height={1.6} rx={0.8} fill={dark(wood, pal, 0.2)} />
      {/* luz del amanecer en el suelo y la pared */}
      <path d={`M52 64 L86 64 L96 ${G + 40} L40 ${G + 40} Z`} fill="#FFD8A0" opacity={0.12 * dw} />
      {/* cuadro */}
      <rect x={8} y={30} width={22} height={16} fill={dark(wood, pal, 0.2)} /><rect x={9.5} y={31.5} width={19} height={13} fill={lerpHex(pal.accent, pal.wallLit, 0.4)} opacity={0.8} />
      <path d="M10 44 L16 37 L21 42 L24 39 L28 44 Z" fill={dark(pal.accent, pal, 0.3)} opacity={0.8} />
      {/* suelo y alfombra */}
      <rect x={-40} y={G} width={180} height={100} fill={url(`${id}f`)} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${-40 + i * 30} ${G} L${-60 + i * 36} 200`} stroke={dark(wood, pal, 0.4)} strokeWidth={0.4} opacity={0.6} />)}
      <ellipse cx={42} cy={G + 22} rx={40} ry={9} fill={lerpHex(pal.accent, pal.wallLit, 0.2)} opacity={0.55} />
      {/* cama */}
      <ContactShadow id={`${id}c`} cx={34} cy={G + 2} rx={40} a={0.4} />
      <rect x={-6} y={54} width={10} height={G - 52} rx={2} fill={url(`${id}h`)} />
      <path d={`M-6 58 Q0 50 6 58`} fill={lite(wood, pal, 0.2)} />
      <rect x={2} y={82} width={68} height={18} rx={3} fill={lerpHex("#EDE6DA", pal.ink, 0.3 * (1 - dw))} />
      <path d="M4 80 Q14 72 26 78 Q28 84 18 86 Q8 86 4 80 Z" fill={lerpHex("#F6F2EA", pal.ink, 0.3 * (1 - dw))} />
      <path d={`M24 84 Q40 76 56 82 Q68 80 74 88 L74 100 L24 100 Z`} fill={url(`${id}e`)} />
      <path d="M32 86 Q44 82 52 88 M56 86 Q64 84 70 92" stroke={dark(sheet, pal, 0.3)} strokeWidth={0.5} fill="none" />
      <rect x={0} y={100} width={74} height={4} fill={dark(wood, pal, 0.25)} /><rect x={70} y={74} width={6} height={32} rx={1.4} fill={url(`${id}h`)} />
      {/* mesilla, lámpara y despertador */}
      <rect x={78} y={86} width={20} height={20} rx={1} fill={url(`${id}h`)} /><rect x={78} y={93} width={20} height={0.6} fill={dark(wood, pal, 0.4)} />
      <circle cx={88} cy={99} r={0.9} fill={lite(wood, pal, 0.4)} />
      <Halo id={`${id}l`} cx={84} cy={74} r={22} color={lamp} a={0.55 - 0.25 * dw} />
      <rect x={83.4} y={76} width={1.2} height={10} fill={dark("#C8A060", pal, 0.2)} /><ellipse cx={84} cy={86} rx={3} ry={0.9} fill={dark("#C8A060", pal, 0.3)} />
      <path d="M79 76 L89 76 L87 68 L81 68 Z" fill={lerpHex(lamp, "#FFF4D8", 0.4)} />
      <rect x={91} y={81} width={6} height={5} rx={1} fill="#2A2A30" /><text x={94} y={84.9} fontSize={2.4} textAnchor="middle" fill="#FF5A4A" fontFamily="monospace">7:00</text>
    </g>
  );
};
