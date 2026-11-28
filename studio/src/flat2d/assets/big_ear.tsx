// big_ear · fondo (senal-wow): el radiotelescopio Big Ear de Ohio de noche, en tres cuartos y de perfil, como era: a la izquierda el
// reflector plano inclinado (una pared de rejilla de metal), a la derecha el reflector parabólico fijo (una pared curva), entre los dos
// el gran plano de tierra de aluminio que brilla como un lago, y junto al reflector plano la caseta de las bocinas (el receptor).
// Detrás, una hilera de árboles en el horizonte. El cielo queda libre (lo pinta el tema; pon `estrellas` detrás). Lienzo 100 × 178,
// anclaje en el centro; el suelo de hierba desde y ≈ 104. Luces rojas de aviso que parpadean siempre.
// opts.luz 0..1 (0,35). Acciones propias: `receive` una onda baja del cielo al reflector plano, rebota al parabólico y vuelve
// concentrada a la caseta, que se enciende (mientras dura, se queda encendida); `glow` el metal se ilumina de azul (mientras dura).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

const SIG = "#9FFFE8";
const DX = 8, DY = -5; // profundidad de la vista en tres cuartos

export const BigEar: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `be${seed}`, G = 104, luz = Number(opt(opts, "luz", 0.35));
  const rc = p.receive === undefined ? -1 : clamp01(p.receive), gl = Math.sin(clamp01(p.glow ?? 0) * Math.PI);
  const metal = lerpHex(lerpHex("#9AA6B8", pal.wall, 0.35), pal.ink, 0.35 - luz * 0.25);
  const lit = lerpHex(metal, SIG, gl * 0.45 + (rc > 0.85 ? 0.2 : 0));
  const grass = lerpHex("#1E2A22", pal.ink, 0.35), trees = lerpHex("#0C1418", pal.ink, 0.3);
  // reflector plano: base en (14, G) → arriba (6, 64); el parabólico: base (88, G), arriba (82, 72), curvo hacia la derecha
  const flat = (o: number) => `M${22 + o * DX} ${G + o * DY} L${14 + o * DX} ${64 + o * DY}`;
  const par = (o: number) => `M${78 + o * DX} ${G + o * DY} Q${89 + o * DX} ${88 + o * DY} ${73 + o * DX} ${72 + o * DY}`;
  // onda: fase 0–0,4 baja del cielo al plano; 0,4–0,7 cruza al parabólico; 0,7–1 vuelve a la caseta
  const P0: [number, number] = [52, -10], P1: [number, number] = [22, 82], P2: [number, number] = [82, 88], P3: [number, number] = [38, 98];
  const seg = (a: [number, number], b: [number, number], k: number): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const wave = (): React.ReactNode => {
    if (rc <= 0) return null;
    const pts: { at: [number, number]; ang: number; a: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const k = rc - i * 0.035; if (k <= 0) continue;
      let at: [number, number], dir: [number, number];
      if (k < 0.4) { at = seg(P0, P1, k / 0.4); dir = [P1[0] - P0[0], P1[1] - P0[1]]; }
      else if (k < 0.7) { at = seg(P1, P2, (k - 0.4) / 0.3); dir = [P2[0] - P1[0], P2[1] - P1[1]]; }
      else { at = seg(P2, P3, Math.min(1, (k - 0.7) / 0.3)); dir = [P3[0] - P2[0], P3[1] - P2[1]]; }
      pts.push({ at, ang: (Math.atan2(dir[1], dir[0]) * 180) / Math.PI, a: 1 - i * 0.18 });
    }
    return pts.map((w, i) => (
      <g key={i} transform={`translate(${w.at[0]} ${w.at[1]}) rotate(${w.ang})`} opacity={w.a * (rc > 0.97 ? (1 - rc) * 30 : 1)} style={{ mixBlendMode: "screen" }}>
        <path d="M0 -6 Q3 0 0 6" stroke={SIG} strokeWidth={0.9} fill="none" />
        <path d="M-2 -4 Q0.5 0 -2 4" stroke={SIG} strokeWidth={0.6} fill="none" opacity={0.7} />
      </g>
    ));
  };
  const hut = rc > 0.92 ? 1 : 0;
  const lattice = (base: (o: number) => string, n: number, key: string) => (
    <g key={key} opacity={0.55}>{[...Array(n)].map((_, i) => <path key={i} d={base(i / (n - 1))} stroke={lite(lit, pal, 0.35)} strokeWidth={0.22} fill="none" />)}</g>
  );
  return (
    <g>
      <Grad id={`${id}g`} a={lerpHex(grass, pal.wall, 0.15)} b={dark(grass, pal, 0.6)} />
      <Grad id={`${id}al`} a={lerpHex(lit, pal.glow, 0.25)} mid={lit} b={dark(lit, pal, 0.25)} at={0.4} />
      <Grad id={`${id}f`} h a={dark(lit, pal, 0.25)} b={lite(lit, pal, 0.15)} />
      <Grad id={`${id}p`} h a={lite(lit, pal, 0.2)} b={dark(lit, pal, 0.3)} />
      {/* horizonte: árboles lejanos */}
      <path d={`M-40 ${G - 4} ${[...Array(36)].map((_, i) => `L${-40 + i * 5} ${G - 9 - hash(i + seed) * 6} L${-37.5 + i * 5} ${G - 6 - hash(i * 3 + seed) * 3}`).join(" ")} L140 ${G - 4} L140 ${G + 4} L-40 ${G + 4} Z`} fill={trees} />
      <Halo id={`${id}hz`} cx={50} cy={G - 6} r={60} color={pal.glow} a={0.08} />
      {/* suelo de hierba */}
      <rect x={-40} y={G} width={180} height={100} fill={url(`${id}g`)} />
      {[...Array(40)].map((_, i) => <path key={i} d={`M${-36 + hash(i + 3) * 172} ${G + 4 + hash(i * 7) * 60} l0.4 -1.6 l0.4 1.6`} stroke={lerpHex(grass, pal.rim, 0.15)} strokeWidth={0.3} fill="none" opacity={0.5} />)}
      {/* plano de tierra de aluminio: brilla como un lago y refleja el cielo */}
      <path d={`M22 ${G} L78 ${G} L${78 + DX} ${G + DY} L${22 + DX} ${G + DY} Z`} fill={url(`${id}al`)} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${22 + i * 7} ${G} L${22 + i * 7 + DX} ${G + DY}`} stroke={dark(lit, pal, 0.25)} strokeWidth={0.18} />)}
      <path d={`M22 ${G} L78 ${G}`} stroke={lite(lit, pal, 0.4)} strokeWidth={0.4} />
      {[...Array(6)].map((_, i) => <circle key={i} cx={26 + hash(i + seed * 2) * 52} cy={G - 1 - hash(i * 5) * 3.5} r={0.25} fill="#FFFFFF" opacity={0.3 + 0.3 * Math.sin(t * 0.08 + i)} />)}
      <ContactShadow id={`${id}c`} cx={52} cy={G + 1} rx={46} a={0.3} />
      {/* reflector plano inclinado: estructura de apoyo detrás y la cara de rejilla */}
      <path d={`M${10 + DX} ${G + DY} L${14 + DX} ${64 + DY} M6 ${G} L14 64 M${6 + DX * 0.5} ${G + DY * 0.5} L${14 + DX * 0.5} ${64 + DY * 0.5}`} stroke={dark(metal, pal, 0.5)} strokeWidth={0.8} />
      <path d={`M22 ${G} L14 64 L${14 + DX} ${64 + DY} L${22 + DX} ${G + DY} Z`} fill={url(`${id}f`)} />
      {lattice(flat, 6, "fl")}
      {[...Array(9)].map((_, i) => { const k = (i + 1) / 10; return <path key={i} d={`M${lerp(22, 14, k)} ${lerp(G, 64, k)} l${DX} ${DY}`} stroke={lite(lit, pal, 0.3)} strokeWidth={0.2} opacity={0.6} />; })}
      <path d={`M14 64 l${DX} ${DY}`} stroke={lite(lit, pal, 0.5)} strokeWidth={0.6} />
      {/* reflector parabólico fijo */}
      <path d={`${par(0)} L${73 + DX} ${72 + DY} Q${89 + DX} ${88 + DY} ${78 + DX} ${G + DY} Z`} fill={url(`${id}p`)} />
      {lattice(par, 6, "pa")}
      {[...Array(8)].map((_, i) => { const k = (i + 1) / 9, x = (1 - k) * (1 - k) * 78 + 2 * (1 - k) * k * 89 + k * k * 73, y = (1 - k) * (1 - k) * G + 2 * (1 - k) * k * 88 + k * k * 72; return <path key={i} d={`M${x} ${y} l${DX} ${DY}`} stroke={lite(lit, pal, 0.3)} strokeWidth={0.2} opacity={0.6} />; })}
      <path d={`M73 72 l${DX} ${DY}`} stroke={lite(lit, pal, 0.5)} strokeWidth={0.6} />
      {/* caseta de las bocinas (el receptor) junto al reflector plano */}
      <rect x={34} y={G - 7} width={7} height={5} fill={dark(metal, pal, 0.2)} />
      <path d={`M34 ${G - 7} l2 -1.4 h7 l-2 1.4 Z`} fill={lite(metal, pal, 0.2)} />
      <path d={`M41 ${G - 6.4} l3.4 -1.2 v3.6 l-3.4 -1.2 Z M41 ${G - 4} l3.4 -1 v3 l-3.4 -0.8 Z`} fill={lite(metal, pal, 0.35)} />
      <rect x={35.2} y={G - 5.8} width={1.6} height={1.2} fill={hut ? SIG : lerpHex(pal.accent, pal.ink, 0.4)} />
      {hut ? <Halo id={`${id}hh`} cx={38} cy={G - 5} r={10} color={SIG} a={0.7} /> : null}
      {/* luces rojas de aviso en lo alto de los reflectores */}
      {[[14, 64], [14 + DX, 64 + DY], [73, 72], [73 + DX, 72 + DY]].map(([x, y], i) => {
        const on = Math.sin(t * 0.1 + i * 0.8) > 0.3;
        return <g key={i}><circle cx={x} cy={y - 0.6} r={0.55} fill={on ? "#FF4A3A" : "#5A1A14"} />{on ? <Halo id={`${id}r${i}`} cx={x} cy={y - 0.6} r={3.5} color="#FF4A3A" a={0.6} /> : null}</g>;
      })}
      {gl > 0 ? <Halo id={`${id}gl`} cx={50} cy={86} r={50} color={SIG} a={0.25 * gl} /> : null}
      {wave()}
    </g>
  );
};
