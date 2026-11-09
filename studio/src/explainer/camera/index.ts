// Cámara por beat (plan §3.7), función pura de (timeline, beat, frame): la usan la escena 3D y la capa 2D
// (para proyectar anclas). Conserva la matemática del puente: smootherstep, empuje exponencial y sacudidas.
// Todo plano lleva un empuje mínimo (CAMERA.pushMin %/frame): nunca hay un plano quieto.
import { CAMERA, BASE } from "../style";
import type { Timeline, BeatT } from "../timeline";
import { heroDef, type V3 } from "../heroes";
import type { Cam2 } from "../heroes/types";
import { envDef } from "../envs";
import { cameraFx } from "../actions";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Params = { az: number; el: number; dist: number; lat: number; lift: number; fov: number; roll: number; focus: V3 };

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
  return { az, el: view?.el ?? 9, dist, lat: 0, lift, fov, roll: 0, focus: [0, 0, 0] };
};

/** preset del beat en el frame local t (0 = inicio del beat; puede ser < 0 o > dur durante transiciones) */
const preset = (bt: BeatT, t: number, p: Params): Params => {
  const c = bt.beat.scene.camera, dur = bt.b - bt.a, q = { ...p };
  // empuje y derivas se centran en la mitad del beat: el encuadre base (objeto al 55 % del ancho) cae a la mitad,
  // el plano empieza algo más abierto y termina algo más cerrado sin que el objeto se salga del cuadro (D31)
  const tc = t - dur / 2;
  // deriva lateral de fondo en todos los planos (alterna por beat): el empuje solo no lo ve el flujo óptico (§3.2)
  const wpp = (2 * q.dist * Math.tan(rad(q.fov / 2)) * ASPECT) / BASE.width;
  if (c.preset !== "drift" && c.preset !== "dolly_side") q.lat += (bt.i % 2 ? -1 : 1) * Math.min(CAMERA.baseDriftPx, CAMERA.baseDriftMaxPx / dur) * tc * wpp;
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
    // ---- presets de F11 (ampliación del catálogo): todos conservan el empuje mínimo, así que nunca quedan quietos ----
    case "pull_out": {
      // se aleja abriendo el campo (lo contrario de push_in): revela el contexto
      const r = Math.min(Math.max(c.rate ?? CAMERA.pushDefault, CAMERA.pushMin) / 100, Math.log(CAMERA.pushMaxZoom) / dur);
      q.fov = 2 * (180 / Math.PI) * Math.atan(Math.tan(rad(q.fov / 2)) * Math.exp(r * tc)); break;
    }
    case "orbit_fast": q.az += (c.deg ?? 35) * (t / dur); push(CAMERA.pushMin); break;
    case "crane_up": q.el += 14 * (tc / dur); push(CAMERA.pushMin); break;
    case "crane_down": q.el -= 14 * (tc / dur); push(CAMERA.pushMin); break;
    case "dolly_side": {
      // travelling con paralaje: la cámara se desliza y gira un poco en sentido contrario (más recorrido que drift)
      const wp = (2 * q.dist * Math.tan(rad(q.fov / 2)) * ASPECT) / BASE.width, d = c.dir === "left" ? -1 : 1;
      q.lat += d * Math.min(2.4, 360 / dur) * tc * wp; q.az -= d * 10 * (tc / dur); push(CAMERA.pushMin); break;
    }
    case "whip_pan": {
      // entra barriendo desde un lado en los primeros ~12 frames y se asienta con el empuje mínimo
      const d = c.dir === "left" ? -1 : 1;
      q.lat += d * 0.6 * q.dist * (1 - easeOut(t / 12)); q.roll = d * 0.04 * (1 - easeOut(t / 12)); push(CAMERA.pushMin); break;
    }
    case "dutch_tilt": q.roll = rad(c.deg ?? 6) * glide(t / 24); push(CAMERA.pushMin); break;
    case "follow_anchor": {
      // la mirada viaja del centro del objeto al ancla con nombre mientras se acerca
      const a = heroDef(bt.beat.scene.hero.asset), h = a.anchors[c.anchor ?? "hero"] ?? a.center, u = glide(t / dur);
      if (a.kind === "plano") {
        // en un plano las anclas son px del lienzo: se pasan a metros con la escala del encuadre base para que cam2At las devuelva a px
        const wp = (2 * q.dist * Math.tan(rad(q.fov / 2)) * ASPECT) / BASE.width;
        q.focus = [(h[0] - BASE.width / 2) * wp * u, -(h[1] - BASE.height * CAMERA.heroScreenYK) * wp * u, 0];
      } else q.focus = [(h[0] - a.center[0]) * u, (h[1] - a.center[1]) * u, (h[2] - a.center[2]) * u];
      q.dist *= 1 - 0.3 * u; push(CAMERA.pushMin); break;
    }
    case "spiral_in": {
      const u = glide(t / dur);
      q.az += (c.deg ?? 40) * (1 - u); q.dist *= 1 + 0.45 * (1 - u); q.el += 6 * (1 - u); push(CAMERA.pushMin); break;
    }
    case "arc_over": {
      // arco por encima: sube y gira a la vez (para enseñar una pieza desde otro ángulo)
      q.el += 16 * (tc / dur); q.az += (c.deg ?? 20) * (tc / dur); push(CAMERA.pushMin); break;
    }
  }
  return q;
};

const posOf = (p: Params, center: V3): Cam => {
  const look: V3 = [center[0] + p.focus[0], center[1] + p.lift + p.focus[1], center[2] + p.focus[2]];
  const ce = Math.cos(rad(p.el)), right: V3 = [Math.cos(rad(p.az)), 0, -Math.sin(rad(p.az))];
  const pos: V3 = [
    look[0] + p.dist * ce * Math.sin(rad(p.az)) + right[0] * p.lat,
    look[1] + p.dist * Math.sin(rad(p.el)),
    look[2] + p.dist * ce * Math.cos(rad(p.az)) + right[2] * p.lat,
  ];
  return { pos, look: [look[0] + right[0] * p.lat, look[1], look[2] + right[2] * p.lat], fov: p.fov, roll: p.roll };
};

const mix = (a: Params, b: Params, k: number): Params =>
  ({ az: a.az + (b.az - a.az) * k, el: a.el + (b.el - a.el) * k, dist: a.dist * Math.pow(b.dist / a.dist, k),
    lat: a.lat + (b.lat - a.lat) * k, lift: a.lift + (b.lift - a.lift) * k, fov: a.fov + (b.fov - a.fov) * k,
    roll: a.roll + (b.roll - a.roll) * k, focus: [0, 1, 2].map((i) => a.focus[i] + (b.focus[i] - a.focus[i]) * k) as V3 });

const SHOT_MIX_FRAMES = 12;  // F17: el barrido entre sub-planos dura 12 frames (rápido, pero no es un corte duro)

/** cámara del beat con sus sub-planos: cada tramo usa su preset desde su inicio; al empezar uno, la cámara barre desde donde estaba */
const shotParams = (bt: BeatT, f: number): Params => {
  const base = baseParams(bt);
  const segs = [{ start: bt.a, camera: bt.beat.scene.camera }, ...bt.shots.filter((s) => s.start > bt.a && s.start < bt.b)];
  const at = (k: number, g: number): Params => {
    const end = k + 1 < segs.length ? segs[k + 1].start : bt.b;
    const sub: BeatT = { ...bt, a: segs[k].start, b: end, beat: { ...bt.beat, scene: { ...bt.beat.scene, camera: segs[k].camera } } };
    return preset(sub, g - segs[k].start, base);
  };
  let k = 0;
  segs.forEach((s, j) => { if (f >= s.start) k = j; });
  const p = at(k, f);
  if (k === 0 || f - segs[k].start >= SHOT_MIX_FRAMES) return p;
  return mix(at(k - 1, segs[k].start), p, glide((f - segs[k].start) / SHOT_MIX_FRAMES));
};

const paramsAt = (tl: Timeline, i: number, f: number, depth = 0): Params => {
  const bt = tl.beats[i], t = f - bt.a;
  let p = bt.shots.length ? shotParams(bt, f) : preset(bt, t, baseParams(bt));
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

export const camAt = (tl: Timeline, i: number, f: number): Cam => {
  const c = posOf(paramsAt(tl, i, f), heroDef(tl.beats[i].beat.scene.hero.asset).center), fx = cameraFx(tl, i, f);
  // efectos de cámara de las acciones (punch, camshake): zoom de golpe y temblor, funciones puras del frame
  return { pos: [c.pos[0] + fx.shake[0], c.pos[1] + fx.shake[1], c.pos[2] + fx.shake[2]], look: c.look, fov: c.fov * fx.fovK, roll: c.roll + fx.roll };
};

/** px a 1080 por grado de giro u elevación de la cámara 3D al pasarla a 2D (orbit, crane, arc_over…) */
const PX_PER_DEG = 7;

/** cámara 2D de un beat plano (Cam2): sale de los MISMOS presets, sub-planos, transiciones y efectos que la 3D, convertidos a
 *  desplazamiento y zoom respecto del encuadre base. Así un plano admite cualquier preset y los overlays anclados lo siguen. */
export const cam2At = (tl: Timeline, i: number, f: number): Cam2 => {
  const b = baseParams(tl.beats[i]), p = paramsAt(tl, i, f), fx = cameraFx(tl, i, f);
  const wpp = (2 * b.dist * Math.tan(rad(b.fov / 2)) * ASPECT) / BASE.width;
  const zoom = (b.dist / p.dist) * (Math.tan(rad(b.fov / 2)) / Math.tan(rad((p.fov * fx.fovK) / 2)));
  return {
    x: (p.lat + p.focus[0] + fx.shake[0]) / wpp + (p.az - b.az) * PX_PER_DEG,
    y: -(p.el - b.el) * PX_PER_DEG - (p.focus[1] + p.lift - b.lift + fx.shake[1]) / wpp,
    zoom, roll: p.roll + fx.roll,
  };
};

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
