// piramide · escenario: la Gran Pirámide de Keops vista en tres cuartos, con su cara iluminada a la izquierda y la de sombra a la derecha.
// El núcleo son hiladas de bloques de caliza amarilla (escalonadas en las aristas); el revestimiento de caliza blanca de Tura la cubre lisa y
// brillante. opts: `blanca` 0..1 (parte revestida al empezar, de la punta hacia abajo; 0), `altura` 0..1 (obra levantada; 1).
// Acciones propias: `build` sube hilada a hilada desde la base (se queda); `shine` el revestimiento blanco baja desde la punta, cubre las dos
// caras y un destello recorre la arista (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

const AX = 54, AY = 1, BL = [2, 62], BM = [66, 63.5], BR = [98, 61];
/** x de una arista (desde la punta hasta un vértice de la base) a la altura y */
const edge = (b: number[], y: number) => AX + (b[0] - AX) * clamp01((y - AY) / (b[1] - AY));

export const Piramide: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `py${seed}`;
  const h = p.build !== undefined ? lerp(0.12, 1, clamp01(p.build)) : opt(opts, "altura", 1);
  const k = p.shine !== undefined ? Math.max(opt(opts, "blanca", 0), clamp01(p.shine)) : opt(opts, "blanca", 0);
  const core = lerpHex(lerpHex("#D9A85E", pal.wall, 0.25), pal.rock, 0.15), white = lerpHex("#FBF6EA", pal.wallLit, 0.25);
  const yTop = lerp(BM[1], AY, h), yC = lerp(AY, BM[1], k);   // cima de la obra y borde inferior del revestimiento
  const face = (a: number[], b: number[], y0: number, y1: number) => {
    // trapecio de una cara entre las alturas y0 (arriba) e y1 (abajo); con y0 en la punta es un triángulo
    const ya = Math.max(y0, AY);
    return `M${edge(a, ya)} ${ya} L${edge(b, ya)} ${ya} L${edge(b, y1)} ${Math.min(y1, b[1])} L${edge(a, y1)} ${Math.min(y1, a[1])} Z`;
  };
  // la cara frontal va de la arista izquierda (BL) a la del medio (BM); la lateral, de BM a BR
  const front = (y0: number, y1: number) => {
    const ya = Math.max(y0, AY), fl = (y: number) => edge(BL, y), fm = (y: number) => edge(BM, y);
    return `M${fl(ya)} ${ya} L${fm(ya)} ${ya} L${fm(y1)} ${lerp(ya, y1, 1)} L${fl(y1)} ${y1} Z`;
  };
  const side = (y0: number, y1: number) => face(BM, BR, y0, y1);
  const courses = 34, glint = p.shine !== undefined && p.shine > 0 && p.shine < 1 ? p.shine : -1;
  return (
    <g>
      <Grad id={`${id}f`} a={lite(core, pal, 0.35)} b={core} /><Grad id={`${id}s`} a={dark(core, pal, 0.25)} b={dark(core, pal, 0.45)} />
      <Grad id={`${id}w`} a={lite(white, pal, 0.4)} b={lerpHex(white, core, 0.12)} /><Grad id={`${id}v`} a={lerpHex(white, pal.wall, 0.3)} b={dark(white, pal, 0.3)} />
      <ContactShadow id={`${id}c`} cx={50} cy={63} rx={56} ry={3} a={0.32} />
      {/* sombra que proyecta sobre la arena, hacia la derecha */}
      <path d={`M${BM[0]} ${BM[1]} L${BR[0]} ${BR[1]} L${BR[0] + 14 * h} ${BR[1] + 2.6} L${BM[0] + 10} ${BM[1] + 1.6} Z`} fill={pal.ink} opacity={0.18} />
      {/* núcleo: caras de caliza amarilla */}
      <path d={front(yTop, BM[1])} fill={url(`${id}f`)} />
      <path d={side(yTop, BM[1])} fill={url(`${id}s`)} />
      {/* hiladas de bloques y juntas verticales */}
      {[...Array(courses)].map((_, i) => {
        const y = AY + ((i + 1) / courses) * (BM[1] - AY);
        if (y < yTop + 0.3) return null;
        const xl = edge(BL, y), xm = edge(BM, y), xr = edge(BR, y), n = Math.max(2, Math.round((xm - xl) / 4));
        return (
          <g key={i}>
            <path d={`M${xl} ${y} L${xm} ${y}`} stroke={dark(core, pal, 0.35)} strokeWidth={0.25} opacity={0.75} />
            <path d={`M${xm} ${y} L${xr} ${y}`} stroke={dark(core, pal, 0.6)} strokeWidth={0.22} opacity={0.7} />
            <path d={`M${xl} ${y} l-0.5 0 l0 -0.9`} stroke={dark(core, pal, 0.4)} strokeWidth={0.3} fill="none" />
            {[...Array(n)].map((_, j) => { const x = lerp(xl, xm, (j + hash(i * 7.1 + j * 3.3 + seed) * 0.6) / n), hh = (BM[1] - AY) / courses; return <path key={j} d={`M${x} ${y} l0 ${-hh}`} stroke={dark(core, pal, 0.3)} strokeWidth={0.18} opacity={0.5} />; })}
          </g>
        );
      })}
      {/* cima de la obra (plataforma plana mientras se construye) */}
      {h < 0.995 && <path d={`M${edge(BL, yTop)} ${yTop} L${edge(BM, yTop)} ${yTop + 0.6} L${edge(BR, yTop)} ${yTop}`} stroke={lite(core, pal, 0.5)} strokeWidth={0.6} fill="none" />}
      {/* revestimiento de caliza blanca de Tura: liso y brillante, de la punta hacia abajo */}
      {k > 0.001 && (
        <g>
          <path d={front(Math.max(AY, yTop), Math.max(yC, yTop))} fill={url(`${id}w`)} />
          <path d={side(Math.max(AY, yTop), Math.max(yC, yTop))} fill={url(`${id}v`)} />
          {/* borde inferior del revestimiento: una franja de bloques recién puestos */}
          {k < 0.999 && <path d={`M${edge(BL, yC)} ${yC} L${edge(BM, yC)} ${yC} L${edge(BR, yC)} ${yC}`} stroke={lite(white, pal, 0.5)} strokeWidth={0.7} fill="none" />}
          {/* reflejo del sol en la cara iluminada */}
          <path d={`M${AX} ${AY} L${edge(BL, yC)} ${yC} L${lerp(edge(BL, yC), edge(BM, yC), 0.3)} ${yC} Z`} fill={pal.glow} opacity={0.22 * k} />
          <Halo id={`${id}h`} cx={AX} cy={AY + 4} r={18 * k} color={pal.glow} a={0.45} />
        </g>
      )}
      {/* luz de borde en la arista entre las dos caras */}
      <path d={`M${edge(BM, Math.max(AY, yTop))} ${Math.max(AY, yTop)} L${BM[0]} ${BM[1]}`} stroke={pal.rim} strokeWidth={0.5} opacity={0.55} />
      {/* destello que baja por la arista mientras se reviste */}
      {glint >= 0 && <Halo id={`${id}g`} cx={edge(BM, yC)} cy={yC} r={7} color={pal.glow} a={0.9} />}
      {/* polvo de arena que se levanta al pie */}
      {[...Array(6)].map((_, i) => { const x = 8 + hash(i * 2.3 + seed) * 84, ph = (t * 0.01 + hash(i * 5.1)) % 1; return <ellipse key={i} cx={x + ph * 6} cy={62 - ph * 2} rx={2 + ph * 4} ry={0.6 + ph} fill={pal.wallLit} opacity={0.18 * (1 - ph)} />; })}
    </g>
  );
};
