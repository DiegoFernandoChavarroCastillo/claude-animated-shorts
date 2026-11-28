// mesa_ehman · prop (senal-wow): la mesa de cocina de Jerry Ehman en 1977, de frente: tablero de formica con canto de metal, una
// lámpara de flexo encendida que deja un círculo de luz, las hojas de la impresora desplegadas en acordeón (la de arriba con «6EQUJ5»),
// un rotulador rojo y una taza de café que humea. Va DELANTE de una `figura` sentada (mismo par que el fondo, 0,4). Lienzo 100 × 60,
// anclaje abajo en el centro. Acciones propias: `circle` el rotulador rodea la columna en rojo (se queda); `write` aparece «Wow!» al
// margen (se queda); `lamp` la lámpara parpadea y se aviva (mientras dura).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

const RED = "#D8262A";

export const MesaEhman: AssetFC = ({ pal, t, seed, p }) => {
  const id = `me${seed}`, cir = clamp01(p.circle ?? 0), wow = clamp01(p.write ?? 0), lp = Math.sin(clamp01(p.lamp ?? 0) * Math.PI);
  const top = lerpHex(lerpHex("#C8A86A", pal.wall, 0.2), pal.ink, 0.25), paper = lerpHex("#F2EFE4", pal.ink, 0.12), lampC = lerpHex("#C85A2A", pal.ink, 0.2);
  const warm = "#FFD89A", lampA = 0.75 + lp * 0.25 + Math.sin(t * 0.9) * 0.02;
  const steam = [...Array(3)].map((_, i) => { const k = ((t * 0.01 + i / 3) % 1); return <path key={i} d={`M${83 + Math.sin(k * 6 + i) * 1.2} ${24 - k * 12} q1.5 -2 0 -4`} stroke="#FFFFFF" strokeWidth={0.5} fill="none" opacity={(1 - k) * 0.35} />; });
  return (
    <g>
      <Grad id={`${id}t`} a={lite(top, pal, 0.25)} b={dark(top, pal, 0.25)} />
      <Grad id={`${id}l`} a={dark(top, pal, 0.35)} b={dark(top, pal, 0.75)} />
      <Grad id={`${id}p`} a={paper} b={lerpHex(paper, pal.ink, 0.2)} />
      {/* tablero visto desde arriba en perspectiva, canto y patas */}
      <path d="M6 26 L94 26 L100 42 L0 42 Z" fill={url(`${id}t`)} />
      <rect x={0} y={42} width={100} height={3} fill={lite(top, pal, 0.1)} /><rect x={0} y={44.4} width={100} height={0.8} fill={dark(top, pal, 0.5)} />
      <rect x={4} y={45} width={3} height={15} fill={url(`${id}l`)} /><rect x={93} y={45} width={3} height={15} fill={url(`${id}l`)} />
      <ContactShadow id={`${id}c`} cx={50} cy={60} rx={50} a={0.35} />
      <Halo id={`${id}lh`} cx={42} cy={32} r={34} color={warm} a={0.35 * lampA} />
      {/* hojas en acordeón */}
      <path d="M22 41 L30 28 L66 28 L60 41 Z" fill={lerpHex(paper, pal.ink, 0.25)} />
      <path d="M24 39 L31 27 L67 27 L61 39 Z" fill={url(`${id}p`)} />
      {[...Array(6)].map((_, i) => <path key={i} d={`M${25.5 + i * 0.1} ${37 - i * 1.8} L${61.5 - i * 0.4} ${37 - i * 1.8}`} stroke="#BFE0B8" strokeWidth={0.9} opacity={0.6} />)}
      {[...Array(5)].map((_, r) => [...Array(8)].map((_, c) => hash(seed + r * 9 + c) > 0.45 ? <rect key={`${r}-${c}`} x={33 + c * 3.4 - r * 0.6} y={29 + r * 2} width={0.9} height={0.9} fill={pal.ink} opacity={0.6} /> : null))}
      {/* columna «6EQUJ5» y el círculo rojo */}
      {["6", "E", "Q", "U", "J", "5"].map((s, i) => <text key={i} x={47.5 - i * 0.25} y={29.6 + i * 1.55} fontFamily="monospace" fontWeight={700} fontSize={1.8} fill={pal.ink}>{s}</text>)}
      {cir > 0 ? <ellipse cx={48} cy={33.5} rx={2.4} ry={5.6} fill="none" stroke={RED} strokeWidth={0.55} strokeDasharray={`${26 * cir} 40`} transform="rotate(8 48 33.5)" /> : null}
      {wow > 0 ? <text x={35} y={31.5} fontFamily="cursive" fontStyle="italic" fontWeight={700} fontSize={3.6} fill={RED} opacity={wow} transform="rotate(-8 37 31)">Wow!</text> : null}
      {/* rotulador rojo */}
      <g transform={`translate(${cir > 0 && cir < 1 ? 48 + Math.cos(cir * 6.28) * 2.4 : 64} ${cir > 0 && cir < 1 ? 33 + Math.sin(cir * 6.28) * 5 : 36}) rotate(-35)`}>
        <rect x={0} y={-0.7} width={10} height={1.4} rx={0.6} fill={RED} /><rect x={7.5} y={-0.75} width={2.6} height={1.5} rx={0.5} fill={dark(RED, pal, 0.3)} /><path d="M0 -0.5 L-1.4 0 L0 0.5 Z" fill={pal.ink} />
      </g>
      {/* taza */}
      <path d="M79 26 L87 26 L86 34 L80 34 Z" fill={lerpHex("#E8E2D4", pal.ink, 0.25)} /><path d="M87 28 q3 1 0 4" stroke={lerpHex("#E8E2D4", pal.ink, 0.3)} strokeWidth={0.9} fill="none" />
      <ellipse cx={83} cy={26} rx={4} ry={0.9} fill={lerpHex("#3A2414", pal.ink, 0.2)} />
      {steam}
      {/* lámpara de flexo */}
      <ellipse cx={14} cy={33} rx={6} ry={1.4} fill={dark(lampC, pal, 0.3)} />
      <path d="M14 33 L18 14 L32 8" stroke={dark(lampC, pal, 0.2)} strokeWidth={1.1} fill="none" />
      <circle cx={18} cy={14} r={1} fill={lampC} />
      <path d="M29 4 L38 9 L34 15 L26 10 Z" fill={lampC} />
      <path d="M26 10 L34 15" stroke={warm} strokeWidth={1.2} opacity={lampA} />
      <path d="M26 10 L34 15 L64 41 L22 41 Z" fill={warm} opacity={0.12 * lampA} style={{ mixBlendMode: "screen" }} />
      <Halo id={`${id}b`} cx={30} cy={12.5} r={6} color={warm} a={0.9 * lampA} />
    </g>
  );
};
