// merer · personaje: Merer, inspector de una cuadrilla de la época de Keops, de pie y mirando a la derecha: peluca corta negra, torso desnudo,
// faldellín de lino blanco con cinturón, un rollo de papiro bajo el brazo izquierdo y el cálamo en la mano derecha. Respira y parpadea siempre.
// Pies en y ≈ 155 (anclaje 0,97). Acciones propias: `write` abre una hoja delante del pecho y escribe mientras dura (se queda con la hoja
// abierta); `point` señala con el brazo hacia la derecha (se queda); `talk` mueve la boca mientras dura.
import React from "react";
import { type AssetFC, clamp01, idle, lerp } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Vol, dark, lite, url } from "./shade";

export const Merer: AssetFC = ({ pal, t, seed, p }) => {
  const id = `mr${seed}`, I = idle(t, seed), wr = clamp01(p.write ?? 0), pt = clamp01(p.point ?? 0), tk = p.talk ?? 0;
  const skin = lerpHex(pal.skin, "#9A5A32", 0.35), linen = lerpHex("#F4EEDC", pal.wallLit, 0.3), wig = lerpHex("#16110E", pal.ink, 0.3), papy = lerpHex("#E9D49C", pal.wallLit, 0.2);
  const by = I.breath * 0.6, open = clamp01(wr * 4), writing = wr > 0 && wr < 1;
  const mouth = (tk > 0 && tk < 1) ? Math.abs(Math.sin(t * 0.55)) : 0;
  // mano derecha: en reposo junto a la cadera; escribiendo, sobre la hoja; señalando, estirada a la derecha
  const wx = writing ? 58 + Math.sin(t * 0.5) * 3 : 56, wy = writing ? 86 + Math.cos(t * 0.7) * 1.2 : 88;
  const rh = { x: lerp(lerp(64, wx, open), 92, pt), y: lerp(lerp(104, wy, open), 74, pt) + by };
  const lh = { x: lerp(40, 46, open), y: lerp(96, 88, open) + by };
  const arm = (sx: number, sy: number, x: number, y: number, col: string, wd: number, bend = 6) => {
    const mx = (sx + x) / 2 + (y - sy) * 0.12, my = (sy + y) / 2 + bend;
    return <path d={`M${sx} ${sy} Q${mx} ${my} ${x} ${y}`} stroke={col} strokeWidth={wd} strokeLinecap="round" fill="none" />;
  };
  return (
    <g>
      <Vol id={`${id}k`} c={skin} pal={pal} k={0.8} /><Grad id={`${id}l`} a={lite(linen, pal, 0.3)} b={dark(linen, pal, 0.18)} />
      <ContactShadow id={`${id}s`} cx={50} cy={155} rx={22} />
      {/* piernas y pies descalzos */}
      <path d={`M44 ${120 + by} L42 153`} stroke={dark(skin, pal, 0.2)} strokeWidth={7} strokeLinecap="round" />
      <path d={`M55 ${120 + by} L58 153`} stroke={skin} strokeWidth={7.4} strokeLinecap="round" />
      <ellipse cx={44.5} cy={154} rx={4.6} ry={1.8} fill={dark(skin, pal, 0.25)} /><ellipse cx={61} cy={154} rx={4.8} ry={1.9} fill={dark(skin, pal, 0.1)} />
      {/* brazo izquierdo (detrás) con el rollo */}
      {arm(42, 76 + by, lh.x, lh.y, dark(skin, pal, 0.2), 6)}
      {/* torso desnudo */}
      <path d={`M37 ${110 + by} Q34 ${88 + by} 38 ${74 + by} Q50 ${68 + by} 62 ${74 + by} Q66 ${90 + by} 62 ${110 + by} Z`} fill={url(`${id}k`)} />
      <path d={`M62 ${75 + by} Q66 ${92 + by} 62 ${109 + by}`} stroke={pal.rim} strokeWidth={0.9} fill="none" opacity={0.6} />
      <path d={`M44 ${82 + by} Q50 ${85 + by} 56 ${82 + by}`} stroke={dark(skin, pal, 0.3)} strokeWidth={0.5} fill="none" opacity={0.6} />
      {/* faldellín de lino con cinturón y pliegue delantero */}
      <path d={`M35 ${108 + by} L65 ${108 + by} L68 ${126 + by} L32 ${126 + by} Z`} fill={url(`${id}l`)} />
      <path d={`M50 ${109 + by} L56 ${126 + by} L60 ${126 + by} Z`} fill={dark(linen, pal, 0.12)} />
      {[40, 45, 62].map((x) => <path key={x} d={`M${x} ${110 + by} L${x + (x - 50) * 0.08} ${125 + by}`} stroke={dark(linen, pal, 0.2)} strokeWidth={0.3} />)}
      <rect x={34.5} y={106.5 + by} width={31} height={2.6} rx={0.6} fill={lerpHex(linen, pal.accent, 0.25)} />
      {/* cuello y cabeza con peluca corta */}
      <rect x={46} y={63 + by} width={8} height={8} fill={dark(skin, pal, 0.12)} />
      <circle cx={51} cy={55 + by} r={11.5} fill={url(`${id}k`)} />
      <path d={`M38.5 ${60 + by} Q37 ${42 + by} 50 ${41.5 + by} Q62 ${41.5 + by} 63 ${51 + by} L58 ${51 + by} Q54 ${48 + by} 49 ${49 + by} L48 ${60 + by} Q44 ${64 + by} 38.5 ${60 + by} Z`} fill={wig} />
      <path d={`M39 ${50 + by} Q50 ${42 + by} 62.5 ${49 + by}`} stroke={lite(wig, pal, 0.35)} strokeWidth={0.6} fill="none" opacity={0.6} />
      <ellipse cx={58} cy={55 + by} rx={1.1} ry={1.4 * (1 - 0.9 * I.blink)} fill={pal.ink} />
      <path d={`M58 ${55 + by} l3 0.3`} stroke={pal.ink} strokeWidth={0.4} />
      <path d={`M55.5 ${51.6 + by} L60.5 ${51.4 + by}`} stroke={wig} strokeWidth={0.9} strokeLinecap="round" />
      <path d={`M62.4 ${55 + by} L64.6 ${59 + by} L62.4 ${59.6 + by}`} stroke={dark(skin, pal, 0.3)} strokeWidth={0.7} fill="none" />
      <ellipse cx={60.5} cy={62 + by} rx={1.6} ry={0.4 + mouth * 1.1} fill={dark(skin, pal, 0.55)} />
      {/* rollo bajo el brazo o la hoja abierta para escribir */}
      {open < 1 && <g opacity={1 - open}><rect x={lh.x - 9} y={lh.y - 3} width={14} height={5} rx={2.4} fill={papy} /><ellipse cx={lh.x + 5} cy={lh.y - 0.5} rx={1.2} ry={2.4} fill={lite(papy, pal, 0.3)} /></g>}
      {open > 0 && (
        <g opacity={open}>
          <path d={`M${lh.x} ${lh.y - 6} L${lh.x + 18 * open} ${lh.y - 9} L${lh.x + 19 * open} ${lh.y + 3} L${lh.x + 1} ${lh.y + 5} Z`} fill={papy} stroke={dark(papy, pal, 0.3)} strokeWidth={0.25} />
          {[...Array(Math.floor(clamp01(wr) * 5) + 1)].map((_, i) => <path key={i} d={`M${lh.x + 15 - i * 3} ${lh.y - 6.5} l0.4 9`} stroke={i === 0 ? pal.accent : pal.ink} strokeWidth={0.5} strokeDasharray="1 0.6" />)}
        </g>
      )}
      <circle cx={lh.x} cy={lh.y} r={2.8} fill={dark(skin, pal, 0.15)} />
      {/* brazo derecho con el cálamo */}
      {arm(58, 76 + by, rh.x, rh.y, skin, 6.4, pt > 0.5 ? -2 : 6)}
      {pt < 0.5 && <path d={`M${rh.x} ${rh.y} l${4} ${-6}`} stroke={lerpHex("#8A6A3A", pal.rock, 0.3)} strokeWidth={0.7} strokeLinecap="round" />}
      <circle cx={rh.x} cy={rh.y} r={3} fill={skin} />
    </g>
  );
};
