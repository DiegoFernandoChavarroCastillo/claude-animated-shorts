// Piezas de los beats en ilustración 2D (objetos de clase "plano"). Cada plano dibuja en un lienzo SVG de 1080 x 1920 con
// capas a distintas profundidades: `Depth` aplica la cámara 2D (cam2At) con parallax (z = 0 quieto, 1 = plano del sujeto,
// > 1 primer plano) y `Subject` además las acciones genéricas (subir, temblar, crecer…). Reglas de composición: el sujeto
// centrado hacia y ≈ 900 (CAMERA.heroScreenYK) y todo lo importante entre y = 560 y 1380 (arriba van los subtítulos y
// abajo la interfaz de las apps). Colores solo de PALETTE. Todo determinista: nada de Math.random.
import React from "react";
import { BASE, CAMERA, PALETTE } from "../style";
import type { Cam2, Pose2 } from "../heroes/types";

export const FW = BASE.width, FH = BASE.height;
/** punto fijo del zoom: donde cae el centro del sujeto */
export const PIVOT: [number, number] = [FW / 2, FH * CAMERA.heroScreenYK];
export const CAM0: Cam2 = { x: 0, y: 0, zoom: 1, roll: 0 };
export const POSE0: Pose2 = { dx: 0, dy: 0, rot: 0, scale: 1, sx: 1, sy: 1 };

const zoomAt = (cam: Cam2, z: number) => 1 + (cam.zoom - 1) * z;

/** transformación SVG de una capa a profundidad z */
export const depthTransform = (cam: Cam2, z: number) =>
  `translate(${PIVOT[0]} ${PIVOT[1]}) rotate(${(cam.roll * 180) / Math.PI}) scale(${zoomAt(cam, z)}) translate(${-PIVOT[0] - cam.x * z} ${-PIVOT[1] - cam.y * z})`;

/** punto del lienzo (capa z) -> px en pantalla; lo usa la proyección de anclas de los overlays */
export const flatProject = (cam: Cam2, [x, y]: [number, number], z = 1): [number, number] => {
  const k = zoomAt(cam, z), r = cam.roll, px = (x - PIVOT[0] - cam.x * z) * k, py = (y - PIVOT[1] - cam.y * z) * k;
  return [PIVOT[0] + px * Math.cos(r) - py * Math.sin(r), PIVOT[1] + px * Math.sin(r) + py * Math.cos(r)];
};

export const Depth: React.FC<{ cam: Cam2; z: number; children: React.ReactNode; opacity?: number }> = ({ cam, z, children, opacity }) => (
  <g transform={depthTransform(cam, z)} opacity={opacity}>{children}</g>
);

/** el sujeto del plano: capa z = 1 más las acciones genéricas, con el giro y la escala alrededor de `at` (su centro) */
export const Subject: React.FC<{ cam: Cam2; pose: Pose2; at?: [number, number]; z?: number; children: React.ReactNode }> = ({ cam, pose, at = PIVOT, z = 1, children }) => (
  <g transform={depthTransform(cam, z)}>
    <g transform={`translate(${at[0] + pose.dx} ${at[1] + pose.dy}) rotate(${pose.rot}) scale(${pose.scale * pose.sx} ${pose.scale * pose.sy}) translate(${-at[0]} ${-at[1]})`}>{children}</g>
  </g>
);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (u: number) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
export const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
/** color de acento de cada luz (el resplandor y el grade 2D del beat) */
export const LIGHT_TINT: Record<string, string> = { atardecer: PALETTE.warm.sunset, noche: PALETTE.mid.lavender, dorado: PALETTE.warm.gold, tech: PALETTE.ui.cyan };

/** fondo a sangre (más grande que el lienzo para que el parallax y el zoom no dejen bordes): degradado vertical */
export const Backdrop: React.FC<{ id: string; top: string; bottom: string; mid?: string }> = ({ id, top, bottom, mid }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />{mid ? <stop offset="0.55" stopColor={mid} /> : null}<stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-600} y={-700} width={FW + 1200} height={FH + 1400} fill={`url(#${id})`} />
  </>
);

/** halo radial suave (luces, brillos, focos) */
export const Glow: React.FC<{ id: string; cx: number; cy: number; r: number; color: string; a?: number }> = ({ id, cx, cy, r, color, a = 0.6 }) => (
  <>
    <defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={a} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
  </>
);

/** campo de estrellas que titilan (fondo de espacio o de noche) */
export const Stars: React.FC<{ n: number; t: number; seed?: number; y0?: number; y1?: number; color?: string }> = ({ n, t, seed = 1, y0 = -400, y1 = FH + 400, color = PALETTE.light.cream }) => (
  <g>{[...Array(n)].map((_, i) => {
    const x = -400 + hash(i * 3 + seed) * (FW + 800), y = y0 + hash(i * 7 + seed * 2) * (y1 - y0), r = 1.2 + hash(i + seed * 5) * 2.6;
    return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.35 + 0.5 * Math.abs(Math.sin(t * 0.04 + i))} />;
  })}</g>
);

/** grano estático de papel (puntos claros y oscuros muy tenues): quita el aspecto de vector limpio */
export const Grain: React.FC<{ n?: number; seed?: number }> = ({ n = 900, seed = 3 }) => (
  <g opacity={0.5}>{[...Array(n)].map((_, i) => (
    <circle key={i} cx={hash(i + seed) * FW} cy={hash(i * 1.7 + seed * 3) * FH} r={0.8 + hash(i * 2.3) * 1.6} fill={i % 2 ? "#FFFFFF" : "#000000"} opacity={0.05 + hash(i * 3.1) * 0.06} />
  ))}</g>
);

/** persona de pie vista de espaldas (tres cuartos), en silueta con luz de recorte: `x` = centro, `y` = pies, `h` = alto en px.
 *  `arm` 0..1 levanta el brazo derecho desde colgando hasta señalar arriba a la derecha (explicar, señalar una pizarra). */
export const Person: React.FC<{ x: number; y: number; h: number; fill: string; rim?: string; arm?: number; jacket?: string; hair?: string }> = ({ x, y, h, fill, rim, arm = 0, jacket, hair }) => {
  const k = h / 100, J = jacket ?? fill, a = 8 + 128 * arm, b = a - 6 + 26 * arm;   // grados desde la vertical hacia abajo
  const P = (px: number, py: number) => `${x + px * k} ${y + py * k}`;
  const sx = 13, sy = -75, rad = (d: number) => (d * Math.PI) / 180;
  const ex = sx + Math.sin(rad(a)) * 17, ey = sy + Math.cos(rad(a)) * 17, hx = ex + Math.sin(rad(b)) * 16, hy = ey + Math.cos(rad(b)) * 16;
  return (
    <g>
      <path d={`M${P(-11, -42)} L${P(-10, -2)} L${P(-3, -2)} L${P(-0.5, -34)} L${P(0.5, -34)} L${P(3, -2)} L${P(10, -2)} L${P(11, -42)} Z`} fill={fill} />
      <ellipse cx={x - 6.5 * k} cy={y - 1 * k} rx={5 * k} ry={2 * k} fill={fill} /><ellipse cx={x + 6.5 * k} cy={y - 1 * k} rx={5 * k} ry={2 * k} fill={fill} />
      <path d={`M${P(-15, -76)} C${P(-19, -66)} ${P(-19, -54)} ${P(-17, -44)} L${P(-13, -44)} C${P(-14, -54)} ${P(-13, -64)} ${P(-11, -72)} Z`} fill={J} />
      <circle cx={x - 15 * k} cy={y - 42 * k} r={2.6 * k} fill={fill} />
      <path d={`M${P(-13, -79)} C${P(-16, -78)} ${P(-17, -72)} ${P(-16.5, -62)} L${P(-14, -40)} C${P(-12, -37)} ${P(12, -37)} ${P(14, -40)} L${P(16.5, -62)} C${P(17, -72)} ${P(16, -78)} ${P(13, -79)} C${P(8, -81.5)} ${P(-8, -81.5)} ${P(-13, -79)} Z`} fill={J} />
      <path d={`M${P(-1, -80)} L${P(0, -60)}`} stroke={fill} strokeWidth={0.8 * k} opacity={0.6} />
      <path d={`M${P(sx, sy)} L${P(ex, ey)} L${P(hx, hy)}`} stroke={J} strokeWidth={5.4 * k} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={x + hx * k} cy={y + hy * k} r={2.6 * k} fill={fill} />
      <path d={`M${P(-2.6, -86)} L${P(2.6, -86)} L${P(3.2, -80)} L${P(-3.2, -80)} Z`} fill={fill} />
      <ellipse cx={x} cy={y - 92 * k} rx={6.6 * k} ry={7.6 * k} fill={fill} />
      <path d={`M${P(-6.8, -92)} C${P(-7.4, -101)} ${P(6.6, -103)} ${P(7, -93)} C${P(5, -96)} ${P(-4, -96)} ${P(-6.8, -90)} Z`} fill={hair ?? J} />
      {rim ? <path d={`M${P(3.5, -98.5)} C${P(6.5, -97)} ${P(7.4, -93)} ${P(6.4, -88)} M${P(13.5, -78.5)} C${P(16.3, -76.5)} ${P(17, -70)} ${P(16.6, -62)}`} stroke={rim} strokeWidth={1.4 * k} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
    </g>
  );
};
