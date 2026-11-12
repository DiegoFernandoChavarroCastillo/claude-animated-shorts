// figura · personaje del kit (D123): cuerpo entero de proporciones redondeadas (cabeza grande, cara simple), con degradado, luz de borde, sombra de
// contacto y movimiento de reposo (respira, se balancea, parpadea). Sirve para cualquier época cambiando `opts`:
//   ropa: tunica | toga | vestido | armadura | actual | manto     color, color2: clave de la paleta (accent, wall, rim…) o #hex
//   pelo: corto | largo | rizado | calvo | mono                    peloColor, piel: #hex     barba: true
//   tocado: laurel | corona | diadema | casco | sombrero           gesto: feliz | serio | enojado | triste | sorpresa
//   pose: pie | sentado | senala | celebra | asustado | cruzados | piensa     mira: -1..1 (hacia dónde gira la cara)
//   vario: true = ropa, piel y pelo distintos por semilla (para multitudes con `repeat`)
// Acciones propias: `point` señala a la derecha (se queda); `cheer` alza los brazos y salta; `fear` se lleva las manos a la cara y se echa atrás (se queda);
// `wave` saluda con la mano; `talk` mueve la boca mientras dura; `walk` da pasos mientras dura (muévela con `slide`); `nod` asiente; `turn` gira la cara
// al otro lado (se queda); `sit` se sienta (se queda); `bow` se inclina (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Vol, dark, lite, url } from "./shade";

type Arm = [number, number];   // grados desde «colgando»: brazo y antebrazo (negativo = el antebrazo vuelve hacia el cuerpo)
const POSES: Record<string, { l: Arm; r: Arm }> = {
  pie: { l: [8, 3], r: [8, 3] }, sentado: { l: [14, -40], r: [14, -40] }, senala: { l: [8, 3], r: [100, 96] }, celebra: { l: [152, 168], r: [152, 168] },
  asustado: { l: [30, -160], r: [30, -160] }, cruzados: { l: [18, -98], r: [18, -98] }, piensa: { l: [14, -80], r: [28, -158] },
};
const mixArm = (a: Arm, b: Arm, k: number): Arm => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const rad = (d: number) => (d * Math.PI) / 180;
const SKINS = ["#F3C9A5", "#E0A070", "#C98A5C", "#A86B43", "#7A4A2E"], HAIRS = ["#2A1C14", "#4A2E1C", "#7A4A24", "#1A1418", "#B8B0A8", "#9A5A2A"];

export const Figura: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `fg${seed}`, I = idle(t, seed), vario = opt(opts, "vario", false);
  const pick = <T,>(arr: T[], k: number): T => arr[Math.floor(hash(seed * 1.31 + k) * arr.length) % arr.length];
  const C = (k: string, d: string) => { const v = opt<string | null>(opts, k, null); return v ? ((pal as Record<string, string>)[v] ?? v) : d; };
  const ropa = opt(opts, "ropa", "tunica"), pelo = vario ? pick(["corto", "largo", "rizado", "corto", "mono"], 5) : opt(opts, "pelo", "corto");
  const tocado = opt(opts, "tocado", ""), gesto0 = opt(opts, "gesto", "feliz"), barba = opt(opts, "barba", false) || (vario && hash(seed + 31) > 0.72);
  const cloth = vario ? pick([pal.accent, pal.wallLit, pal.wall, pal.rim, lerpHex(pal.accent, pal.wallLit, 0.5), lerpHex(pal.wall, pal.rim, 0.45), lerpHex(pal.accent, pal.ink, 0.3)], 1)
    : C("color", ropa === "toga" ? pal.wallLit : ropa === "manto" ? lerpHex(pal.wall, pal.ink, 0.3) : pal.accent);
  const cloth2 = C("color2", ropa === "actual" ? lerpHex(pal.wall, pal.ink, 0.45) : ropa === "toga" ? pal.accent : lerpHex(cloth, pal.ink, 0.35));
  const skin = vario ? pick(SKINS, 2) : C("piel", pal.skin), hair = vario ? pick(HAIRS, 3) : C("peloColor", lerpHex(pal.ink, pal.rock, 0.35));
  const metal = lerpHex(pal.rim, pal.rock, 0.3);

  // estado: pose base + acciones
  const base = POSES[opt(opts, "pose", "pie")] ?? POSES.pie;
  const pt = p.point ?? 0, ch = p.cheer ?? 0, fe = p.fear ?? 0, wv = p.wave ?? 0, tk = p.talk ?? 0, wk = p.walk ?? 0, nd = p.nod ?? 0, bw = p.bow ?? 0;
  const sit = Math.max(opt(opts, "pose", "pie") === "sentado" ? 1 : 0, p.sit ?? 0);
  const cheerK = Math.sin(clamp01(ch) * Math.PI) ** 0.5 * (ch > 0 && ch < 1 ? 1 : 0), jump = ch > 0 && ch < 1 ? Math.abs(Math.sin(ch * Math.PI * 2)) * 7 : 0;
  let L = base.l, R = base.r;
  R = mixArm(R, POSES.senala.r, pt); L = mixArm(L, POSES.celebra.l, cheerK); R = mixArm(R, POSES.celebra.r, cheerK);
  L = mixArm(L, POSES.asustado.l, fe); R = mixArm(R, POSES.asustado.r, fe);
  if (wv > 0 && wv < 1) R = mixArm(R, [140, 165 + 22 * Math.sin(t * 0.7)], Math.sin(wv * Math.PI) ** 0.4);
  const mira = lerp(opt(opts, "mira", 0), -opt(opts, "mira", 0) || 0.8, p.turn ?? 0);
  const gesto = fe > 0.3 ? "sorpresa" : cheerK > 0.2 ? "feliz" : gesto0;
  const talking = tk > 0 && tk < 1, walking = wk > 0 && wk < 1, step = walking ? Math.sin(t * 0.55) : 0;
  const long = ropa === "toga" || ropa === "vestido" || ropa === "manto";

  // geometría (lienzo 100 × 160; pies en y = 154)
  const drop = sit * 20, by = -jump + drop + I.breath * 0.35, lean = I.sway * 0.9 - fe * 5 + bw * 16, hy = 40 + by + Math.sin(clamp01(nd) * Math.PI * 2) * 2.2, fx = 50 + mira * 4.6;
  const sh = 64 + by, hem = long ? 148 : ropa === "armadura" ? 114 + drop * 0.4 : 116 + drop * 0.3, hip = 108 + drop;
  const arm = (side: -1 | 1, a: Arm, key: string) => {
    const sx = 50 + side * 11.5, sy = sh + 3, ex = sx + side * Math.sin(rad(a[0])) * 16, ey = sy + Math.cos(rad(a[0])) * 16;
    const hx = ex + side * Math.sin(rad(a[1])) * 15, hy2 = ey + Math.cos(rad(a[1])) * 15, sleeve = ropa === "tunica" || ropa === "armadura" ? skin : cloth;
    return (
      <g key={key}>
        <path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={dark(sleeve, pal, side < 0 ? 0.18 : 0.04)} strokeWidth={7} strokeLinecap="round" />
        <path d={`M${ex} ${ey} L${hx} ${hy2}`} stroke={dark(ropa === "actual" || ropa === "manto" ? cloth : skin, pal, side < 0 ? 0.16 : 0.02)} strokeWidth={6} strokeLinecap="round" />
        <circle cx={hx} cy={hy2} r={3.5} fill={skin} />
      </g>
    );
  };
  const leg = (side: -1 | 1) => {
    const x0 = 50 + side * 6, sw = side * step * 5, kx = x0 + side * sit * 4 + sw * 0.5, ky = lerp((hip + 154) / 2, hip + 8, sit), fxx = x0 + sw + side * sit * 3, fy = 154 - Math.max(0, side * step) * 3;
    const col = ropa === "actual" ? cloth2 : skin;
    return (
      <g key={side}>
        <path d={`M${x0} ${hip - 4} L${kx} ${ky} L${fxx} ${fy - 2}`} stroke={dark(col, pal, side < 0 ? 0.16 : 0.03)} strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {ropa === "armadura" ? <path d={`M${kx} ${ky + 2} L${fxx} ${fy - 4}`} stroke={metal} strokeWidth={8} strokeLinecap="round" /> : null}
        <ellipse cx={fxx + side * 1.5} cy={fy} rx={5.4} ry={2.6} fill={ropa === "actual" ? dark(cloth2, pal, 0.5) : lerpHex(pal.rock, pal.ink, 0.3)} />
      </g>
    );
  };
  const eye = (side: -1 | 1) => {
    const ex = fx + side * 5.4, ey = hy + 1, big = gesto === "sorpresa", ry = (big ? 2.7 : 2.1) * (1 - 0.9 * I.blink), bx = gesto === "enojado" ? side * -1.2 : gesto === "triste" ? side * 1.2 : 0;
    return (
      <g key={side}>
        {big ? <ellipse cx={ex} cy={ey} rx={2.6} ry={ry + 0.9} fill="#fff" /> : null}
        <ellipse cx={ex} cy={ey} rx={1.55} ry={ry} fill={pal.ink} /><circle cx={ex + 0.55} cy={ey - 0.7} r={0.5} fill="#fff" opacity={I.blink > 0.5 ? 0 : 0.9} />
        <path d={`M${ex - 2.4} ${ey - 4.6 - bx - (big ? 1.4 : 0)} L${ex + 2.4} ${ey - 4.6 + bx - (big ? 1.4 : 0)}`} stroke={hair} strokeWidth={1.1} strokeLinecap="round" />
      </g>
    );
  };
  const my = hy + 7.6, open = talking ? 0.5 + 0.5 * Math.sin(t * 0.9) : 0;
  const mouth = gesto === "sorpresa" ? <ellipse cx={fx} cy={my + 0.6} rx={1.9} ry={2.5} fill={pal.ink} />
    : talking ? <ellipse cx={fx} cy={my} rx={2.6} ry={0.6 + 2 * open} fill={pal.ink} />
    : <path d={gesto === "feliz" ? `M${fx - 3.4} ${my - 0.6} Q${fx} ${my + 3} ${fx + 3.4} ${my - 0.6}` : gesto === "serio" ? `M${fx - 2.6} ${my} L${fx + 2.6} ${my}` : `M${fx - 3} ${my + 1.4} Q${fx} ${my - 1.6} ${fx + 3} ${my + 1.4}`}
        stroke={lerpHex(skin, pal.ink, 0.7)} strokeWidth={1.1} strokeLinecap="round" fill="none" />;
  const body = long
    ? `M38 ${sh - 2} Q50 ${sh - 8} 62 ${sh - 2} L${66 + I.sway * 0.6} ${hem} Q50 ${hem + 4} ${34 + I.sway * 0.6} ${hem} Z`
    : `M38 ${sh - 2} Q50 ${sh - 8} 62 ${sh - 2} L${63.5} ${hem} Q50 ${hem + 3} ${36.5} ${hem} Z`;
  return (
    <g>
      <Grad id={`${id}b`} a={lite(cloth, pal, 0.22)} b={dark(cloth, pal, 0.3)} /><Vol id={`${id}h`} c={skin} pal={pal} /><Grad id={`${id}m`} a={lite(metal, pal, 0.4)} b={dark(metal, pal, 0.35)} />
      <ContactShadow id={`${id}s`} cx={50} cy={155} rx={22 - jump * 0.8} />
      <g transform={`rotate(${lean} 50 154)`}>
        {pelo === "largo" || ropa === "manto" ? <path d={`M${50 - 15.5} ${hy - 2} Q${50 - 19} ${hy + 22} ${50 - 12} ${hy + 27} L${50 + 12} ${hy + 27} Q${50 + 19} ${hy + 22} ${50 + 15.5} ${hy - 2} Z`} fill={ropa === "manto" ? dark(cloth, pal, 0.25) : dark(hair, pal, 0.15)} /> : null}
        {arm(-1, L, "l")}
        {!long || sit > 0 ? [leg(-1), leg(1)] : [-1, 1].map((sd) => <ellipse key={sd} cx={50 + sd * 7 + sd * step * 3} cy={153.6} rx={5.2} ry={2.5} fill={lerpHex(pal.rock, pal.ink, 0.3)} />)}
        <path d={body} fill={url(`${id}b`)} />
        {ropa === "toga" ? <path d={`M39 ${sh - 2} Q50 ${sh - 8} 61 ${sh - 3} Q56 ${sh + 30} 37 ${hem - 22} L36 ${sh + 40} Z`} fill={cloth2} opacity={0.92} /> : null}
        {ropa === "vestido" ? <path d={`M40 ${sh + 30} Q50 ${sh + 34} 60 ${sh + 30}`} stroke={cloth2} strokeWidth={3} fill="none" /> : null}
        {ropa === "tunica" ? <path d={`M37.4 ${sh + 30} Q50 ${sh + 34} 62.6 ${sh + 30}`} stroke={cloth2} strokeWidth={2.6} fill="none" /> : null}
        {ropa === "armadura" ? <g><path d={`M38 ${sh - 2} Q50 ${sh - 8} 62 ${sh - 2} L62 ${sh + 30} Q50 ${sh + 35} 38 ${sh + 30} Z`} fill={url(`${id}m`)} />
          {[...Array(6)].map((_, i) => <rect key={i} x={37.5 + i * 4.3} y={sh + 31} width={3.6} height={hem - sh - 30} rx={1} fill={i % 2 ? cloth : cloth2} />)}
          <path d={`M44 ${sh + 6} Q50 ${sh + 12} 56 ${sh + 6} M50 ${sh + 10} L50 ${sh + 26}`} stroke={dark(metal, pal, 0.4)} strokeWidth={0.8} fill="none" /></g> : null}
        {ropa === "actual" ? <path d={`M37 ${hem - 12} L63 ${hem - 12} L63.5 ${hem} Q50 ${hem + 3} 36.5 ${hem} Z`} fill={cloth2} /> : null}
        <path d={long ? `M62 ${sh - 2} L${66 + I.sway * 0.6} ${hem}` : `M62 ${sh - 2} L63.5 ${hem}`} stroke={pal.rim} strokeWidth={1.3} strokeLinecap="round" opacity={0.6} />
        {arm(1, R, "r")}
        {/* cabeza */}
        {pelo === "rizado" ? [...Array(9)].map((_, i) => { const a = Math.PI * (1 + i / 8); return <circle key={i} cx={50 + Math.cos(a) * 14.5} cy={hy - 2 + Math.sin(a) * 13.5} r={5} fill={hair} />; }) : null}
        {pelo === "mono" ? <circle cx={50} cy={hy - 18} r={6} fill={hair} /> : null}
        <circle cx={50} cy={hy} r={15} fill={url(`${id}h`)} />
        <path d={`M${50 + 13.6} ${hy - 6} A15 15 0 0 1 ${50 + 9} ${hy + 12}`} stroke={pal.rim} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.75} />
        {barba ? <path d={`M${50 - 14.6} ${hy + 2} Q${50 - 13} ${hy + 20} ${fx} ${hy + 21} Q${50 + 13} ${hy + 20} ${50 + 14.6} ${hy + 2} Q${50 + 9} ${hy + 8} ${fx} ${hy + 5.5} Q${50 - 9} ${hy + 8} ${50 - 14.6} ${hy + 2} Z`} fill={hair} /> : null}
        {pelo !== "calvo" ? <path d={`M${50 - 15.2} ${hy - 1} Q${50 - 16} ${hy - 17} 50 ${hy - 16.5} Q${50 + 16} ${hy - 17} ${50 + 15.2} ${hy - 1} Q${fx + 6} ${hy - 9} ${fx - 2} ${hy - 7.5} Q${50 - 9} ${hy - 7} ${50 - 15.2} ${hy - 1} Z`} fill={hair} /> : null}
        {ropa === "manto" ? <path d={`M${50 - 16.5} ${hy + 6} Q${50 - 19} ${hy - 19} 50 ${hy - 19} Q${50 + 19} ${hy - 19} ${50 + 16.5} ${hy + 6} Q${50 + 12} ${hy - 10} 50 ${hy - 11} Q${50 - 12} ${hy - 10} ${50 - 16.5} ${hy + 6} Z`} fill={cloth} /> : null}
        {eye(-1)}{eye(1)}{mouth}
        {[-1, 1].map((sd) => <circle key={sd} cx={fx + sd * 8.6} cy={hy + 5.4} r={2.5} fill="#FF7A6B" opacity={0.26} />)}
        {tocado === "laurel" ? [...Array(7)].map((_, i) => { const a = Math.PI * (1.08 + i * 0.14); return <ellipse key={i} cx={50 + Math.cos(a) * 14.6} cy={hy - 3 + Math.sin(a) * 13} rx={3} ry={1.4} fill={lerpHex(pal.rim, "#6A8A2A", 0.55)} transform={`rotate(${(a * 180) / Math.PI + 90} ${50 + Math.cos(a) * 14.6} ${hy - 3 + Math.sin(a) * 13})`} />; }) : null}
        {tocado === "corona" ? <path d={`M${50 - 11} ${hy - 12} L${50 - 12} ${hy - 22} L${50 - 6} ${hy - 17} L50 ${hy - 24} L${50 + 6} ${hy - 17} L${50 + 12} ${hy - 22} L${50 + 11} ${hy - 12} Z`} fill={url(`${id}m`)} stroke={dark(metal, pal, 0.3)} strokeWidth={0.5} /> : null}
        {tocado === "diadema" ? <g><path d={`M${50 - 14.4} ${hy - 6} Q50 ${hy - 13} ${50 + 14.4} ${hy - 6}`} stroke={pal.rim} strokeWidth={2.2} fill="none" /><circle cx={fx} cy={hy - 10.6} r={1.6} fill={pal.accent} /></g> : null}
        {tocado === "casco" ? <g><path d={`M${50 - 16} ${hy - 1} Q${50 - 17} ${hy - 19} 50 ${hy - 19} Q${50 + 17} ${hy - 19} ${50 + 16} ${hy - 1} L${50 + 12} ${hy - 4} Q50 ${hy - 9} ${50 - 12} ${hy - 4} Z`} fill={url(`${id}m`)} /><path d={`M${50 - 9} ${hy - 19} Q50 ${hy - 30} ${50 + 9} ${hy - 19} Z`} fill={pal.accent} /></g> : null}
        {tocado === "sombrero" ? <g><ellipse cx={50} cy={hy - 11} rx={21} ry={3.6} fill={dark(cloth2, pal, 0.2)} /><path d={`M${50 - 11} ${hy - 11} Q${50 - 10} ${hy - 25} 50 ${hy - 25} Q${50 + 10} ${hy - 25} ${50 + 11} ${hy - 11} Z`} fill={cloth2} /></g> : null}
      </g>
    </g>
  );
};
