// Cámara por beat (plan §3.7), función pura de (timeline, beat, frame): la usan la escena 3D y la capa 2D
// (para proyectar anclas). Conserva la matemática del puente: smootherstep, empuje exponencial y sacudidas.
// Todo plano lleva un empuje mínimo (CAMERA.pushMin %/frame): nunca hay un plano quieto.
import { CAMERA, BASE } from "../style";
import type { Timeline, BeatT } from "../timeline";
import { heroDef, type V3 } from "../heroes";
import { envDef } from "../envs";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Params = { az: number; el: number; dist: number; lat: number; lift: number; fov: number };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** smootherstep simétrico (el "glide" del puente) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const easeIn = (u: number) => clamp01(u) ** 3;
const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
const rad = (d: number) => (d * Math.PI) / 180;
const ASPECT = BASE.width / BASE.height;

/** encuadre base: el objeto ocupa ~55 % del ancho y su centro cae al 57 % del alto (bajo la banda de subtítulos) */
const baseParams = (bt: BeatT): Params => {
  const h = heroDef(bt.beat.scene.hero.asset), fov = CAMERA.fov;
  const tanH = Math.tan(rad(fov / 2)) * ASPECT;
  const view = envDef(bt.beat.scene.env).view;
  const dist = (h.radius / (0.55 * tanH)) * (view?.distK ?? 1);
  const lift = dist * Math.tan(rad(fov / 2)) * (CAMERA.heroScreenYK - 0.5) * 2; // sube el punto de mira
  const az = bt.beat.scene.hero.pose === "lateral" ? 35 : 0;
  return { az, el: view?.el ?? 9, dist, lat: 0, lift, fov };
};

/** preset del beat en el frame local t (0 = inicio del beat; puede ser < 0 o > dur durante transiciones) */
const preset = (bt: BeatT, t: number, p: Params): Params => {
  const c = bt.beat.scene.camera, dur = bt.b - bt.a, q = { ...p };
  // empuje y derivas se centran en la mitad del beat: el encuadre base (objeto al 55 % del ancho) cae a la mitad,
  // el plano empieza algo más abierto y termina algo más cerrado sin que el objeto se salga del cuadro (D31)
  const tc = t - dur / 2;
  // deriva lateral de fondo en todos los planos (alterna por beat): el empuje solo no lo ve el flujo óptico (§3.2)
  const wpp = (2 * q.dist * Math.tan(rad(q.fov / 2)) * ASPECT) / BASE.width;
  if (c.preset !== "drift") q.lat += (bt.i % 2 ? -1 : 1) * Math.min(CAMERA.baseDriftPx, CAMERA.baseDriftMaxPx / dur) * tc * wpp;
  // el empuje cierra el campo (zoom de lente) en vez de acercar la cámara: así escala todo el cuadro, fondo incluido,
  // y no solo el objeto; con un dolly el fondo lejano casi no cambia y el plano se mide como quieto (D31)
  // en beats largos el empuje se limita a CAMERA.pushMaxZoom en todo el beat: centrado en la mitad, 0,3 %/frame
  // durante 10 s abría el plano ×1,6 al empezar y lo cerraba ×0,6 al acabar (look-match F8, ronda 1)
  const push = (rate: number) => {
    const r = Math.min(Math.max(rate, CAMERA.pushMin) / 100, Math.log(CAMERA.pushMaxZoom) / dur);
    const k = Math.exp(-r * tc);
    q.fov = 2 * (180 / Math.PI) * Math.atan(Math.tan(rad(q.fov / 2)) * k);
  };
  switch (c.preset) {
    case "push_in": push(c.rate ?? CAMERA.pushDefault); break;
    case "drift": {
      const worldPerPx = (2 * q.dist * Math.tan(rad(q.fov / 2)) * ASPECT) / BASE.width;
      // 1,2 px/frame (<= 1,5 del plan) pero como mucho ~200 px en todo el beat (±100): el objeto, al 55 % del ancho,
      // tiene ~240 px de margen a cada lado (D58)
      const speed = Math.min(1.2, 200 / dur);
      q.lat += (c.dir === "left" ? -1 : 1) * speed * tc * worldPerPx; push(CAMERA.pushMin); break;
    }
    case "orbit_slow": q.az += (c.deg ?? 12) * (t / dur); push(CAMERA.pushMin); break;
    case "glide": {
      const s = glide(t / CAMERA.glideFrames);
      q.dist *= 1 + 0.8 * (1 - s); q.el += 12 * (1 - s); push(0.15); break;
    }
    case "zoom_through": q.dist *= 0.3 + 0.7 * easeOut((t + 6) / 30); push(CAMERA.pushMin); break;
    case "cut": push(CAMERA.pushMin); break;
  }
  return q;
};

const posOf = (p: Params, center: V3): Cam => {
  const look: V3 = [center[0], center[1] + p.lift, center[2]];
  const ce = Math.cos(rad(p.el)), right: V3 = [Math.cos(rad(p.az)), 0, -Math.sin(rad(p.az))];
  const pos: V3 = [
    look[0] + p.dist * ce * Math.sin(rad(p.az)) + right[0] * p.lat,
    look[1] + p.dist * Math.sin(rad(p.el)),
    look[2] + p.dist * ce * Math.cos(rad(p.az)) + right[2] * p.lat,
  ];
  return { pos, look: [look[0] + right[0] * p.lat, look[1], look[2] + right[2] * p.lat], fov: p.fov, roll: 0 };
};

const mix = (a: Params, b: Params, k: number): Params =>
  ({ az: a.az + (b.az - a.az) * k, el: a.el + (b.el - a.el) * k, dist: a.dist * Math.pow(b.dist / a.dist, k),
    lat: a.lat + (b.lat - a.lat) * k, lift: a.lift + (b.lift - a.lift) * k, fov: a.fov + (b.fov - a.fov) * k });

const paramsAt = (tl: Timeline, i: number, f: number, depth = 0): Params => {
  const bt = tl.beats[i], t = f - bt.a;
  let p = preset(bt, t, baseParams(bt));
  const tin = bt.tIn;
  if (tin && depth < 8) {
    if (tin.type === "glide" && tin.sameSet) {
      // mismo decorado: la cámara planea desde donde acabó el beat anterior
      p = mix(paramsAt(tl, i - 1, tin.at, depth + 1), p, glide(t / CAMERA.glideSameSetFrames));
    } else if (tin.type === "glide") {
      // otro decorado: llega desde un lado, más alta, mientras se funden las imágenes
      const s = glide((t + tin.half) / CAMERA.glideFrames);
      p = { ...p, lat: p.lat + 0.35 * p.dist * (1 - s), el: p.el + 6 * (1 - s) };
    } else if (tin.type === "zoom_through") {
      p = { ...p, dist: p.dist * (0.3 + 0.7 * easeOut((t + tin.half) / 30)) };
    }
  }
  const tout = bt.tOut;
  if (tout && tout.type === "zoom_through") {
    // entra en el objeto: acelera hacia él y cierra el campo antes del corte al beat siguiente
    const u = (f - (tout.at - CAMERA.zoomThroughFrames + tout.half)) / CAMERA.zoomThroughFrames;
    p = { ...p, dist: p.dist * (1 - 0.82 * easeIn(u)), fov: p.fov * (1 - 0.25 * easeIn(u)) };
  }
  return p;
};

export const camAt = (tl: Timeline, i: number, f: number): Cam =>
  posOf(paramsAt(tl, i, f), heroDef(tl.beats[i].beat.scene.hero.asset).center);

/** dirección horizontal media de la cámara en el beat (para fijar la luz relativa a cámara, congelada por beat) */
export const meanView = (tl: Timeline, i: number): [number, number] => {
  const bt = tl.beats[i];
  let x = 0, z = 0;
  for (let f = bt.a; f < bt.b; f += 5) {
    const c = camAt(tl, i, f), dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], n = Math.hypot(dx, dz) || 1;
    x += dx / n; z += dz / n;
  }
  const n = Math.hypot(x, z) || 1;
  return [x / n, z / n];
};
