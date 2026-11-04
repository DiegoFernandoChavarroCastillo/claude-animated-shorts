// Acciones sincronizadas con la voz (F13): lo que el objeto o la escena HACEN cuando se dice una palabra. Tres clases:
//  - generic: mueven el objeto entero (subir, caer, salir volando, temblar, crecer…). Son una función pura del frame
//    (`genericPose`), así la usan la escena 3D y la capa 2D (los overlays anclados siguen al objeto cuando se mueve).
//  - marker: añaden algo en 3D pegado al objeto (anillo, flecha, líneas de velocidad, halo, chispas, onda de choque).
//  - hero: acciones propias de un objeto (`HeroDef.actions`: la línea del ecuador de `planeta`, la inflamación de la garganta…).
// Todas empiezan en la palabra `at` del beat, suben durante `dur` frames y se mantienen hasta el final del beat.
import * as THREE from "three";
import { color } from "../style";
import { heroDef, type V3 } from "../heroes";
import { bin } from "../heroes/types";
import { halo } from "../heroes/primitive/kit";
import type { ActionT, Timeline } from "../timeline";

export type ActionDef = { kind: "generic" | "marker" | "camera"; when: string; fields: Record<string, string> };
export const ACTION_DEFS: Record<string, ActionDef> = {
  // ---- generic: mueven todo el objeto
  lift: { kind: "generic", when: "Se eleva y flota: sale despedido hacia arriba, levita, se eleva, pierde peso, 'sube'.", fields: { height: "metros (1,4)", hold: "opcional: frames que se queda arriba antes de bajar" } },
  topple: { kind: "generic", when: "Se desploma de lado como un árbol: se cae, se desmaya, se derrumba, pierde el equilibrio.", fields: { dir: "left | right" } },
  fly: { kind: "generic", when: "Sale volando y se aleja, acelerando: se escapa, se va, se dispersa, es lanzado, desaparece.", fields: { dir: "up | down | left | right | away | toward", dist: "metros (5)" } },
  shake: { kind: "generic", when: "Tiembla o vibra: terremoto, miedo, calor, impacto, motor, tensión.", fields: { amp: "metros (0,06)" } },
  pulse: { kind: "generic", when: "Un latido o golpe de tamaño: late, se acelera, se activa, 'aquí está la clave'.", fields: { scale: "factor (1,18)" } },
  scale: { kind: "generic", when: "Crece o se encoge y se queda así: se expande, se infla, se hincha, se reduce, se comprime.", fields: { to: "factor final (1,5)" } },
  spin: { kind: "generic", when: "Da una vuelta rápida: gira, rueda, rota, da vueltas.", fields: { turns: "vueltas (1)" } },
  tilt: { kind: "generic", when: "Se inclina y se queda: se inclina, se ladea, cae hacia un lado sin llegar al suelo.", fields: { deg: "grados (20)" } },
  hop: { kind: "generic", when: "Salta una o varias veces: rebota, salta, brinca, se emociona.", fields: { height: "metros (0,5)", count: "saltos (2)" } },
  slide: { kind: "generic", when: "Se desplaza de lado: avanza, se mueve, se aparta, recorre.", fields: { x: "metros en x (1,2)", z: "metros en z (0)" } },
  grow: { kind: "generic", when: "Se agranda y se queda grande: crece, se agranda, se infla, aumenta, se hace enorme.", fields: { to: "factor final (1,6)" } },
  shrink: { kind: "generic", when: "Se encoge y se queda pequeño: se encoge, se reduce, disminuye, se hace diminuto, se comprime.", fields: { to: "factor final (0,5)" } },
  appear: { kind: "generic", when: "Aparece de la nada con un pequeño rebote: surge, nace, aparece, se forma, se descubre. Antes de la palabra no se ve.", fields: {} },
  vanish: { kind: "generic", when: "Desaparece encogiéndose y girando: se desvanece, desaparece, se esfuma, se evapora.", fields: {} },
  drop: { kind: "generic", when: "Se suelta y cae con rebote desde arriba (hasta la palabra, se queda arriba): se suelta, cae, aterriza, se deja caer.", fields: { height: "metros (1,6)" } },
  swing: { kind: "generic", when: "Se balancea como un péndulo y se va calmando: oscila, se balancea, se mece, va y viene.", fields: { deg: "grados (25)", cycles: "oscilaciones (3)" } },
  wobble: { kind: "generic", when: "Se tambalea y recupera el equilibrio: se tambalea, pierde el equilibrio, se agita, se desestabiliza.", fields: { amp: "grados (14)" } },
  squash: { kind: "generic", when: "Se aplasta un momento y vuelve: se aplasta, se comprime, rebota, absorbe un golpe, aterriza.", fields: { amount: "0..0,6 (0,35)" } },
  stretch: { kind: "generic", when: "Se estira en vertical y se queda así: se estira, se alarga, se espaguetiza, es succionado, se afina.", fields: { to: "factor de alto (1,5)" } },
  flip: { kind: "generic", when: "Da una voltereta hacia atrás: se da la vuelta, voltea, se invierte, cambia de lado.", fields: { turns: "vueltas (1)" } },
  circle: { kind: "generic", when: "Describe un círculo en el suelo y vuelve: da una vuelta alrededor, orbita, recorre, patrulla.", fields: { r: "metros (0,8)", turns: "vueltas (1)" } },
  zigzag: { kind: "generic", when: "Avanza en zigzag: serpentea, esquiva, zigzaguea, se mueve de forma irregular.", fields: { amp: "metros (0,5)", z: "metros que avanza (0,6)" } },
  sway: { kind: "generic", when: "Se mece suavemente sin parar mientras dura el beat: respira, flota, está tranquilo, ondea.", fields: { amp: "metros (0,12)" } },
  sink: { kind: "generic", when: "Se hunde despacio por debajo del suelo: se hunde, se sumerge, se entierra, se pierde en el fondo.", fields: { depth: "metros (1,2)" } },
  turn: { kind: "generic", when: "Se gira hacia otro lado y se queda: se voltea, mira hacia otro lado, cambia de dirección.", fields: { deg: "grados (90)" } },
  blink: { kind: "generic", when: "Parpadea o destella varias veces: parpadea, se enciende y se apaga, titila, intermitente, alerta.", fields: { count: "parpadeos (3)" } },
  // ---- camera: mueven la cámara un instante
  punch: { kind: "camera", when: "Un golpe de zoom hacia dentro y vuelta: ¡impacto!, de repente, el dato clave, un giro, una revelación.", fields: { amount: "0..0,3 (0,16)" } },
  camshake: { kind: "camera", when: "La cámara tiembla un momento: terremoto, explosión, golpe, peligro, caída.", fields: { amp: "metros (0,05)" } },
  // ---- marker: algo en 3D pegado al objeto
  ring: { kind: "marker", when: "Una línea brillante que lo rodea: ecuador, órbita, alrededor, cinturón, límite, barrera.", fields: { anchor: "ancla del objeto (hero)", r: "radio en metros", axis: "y | x | z", tilt: "grados (0)", color: "token (ui.red)" } },
  arrow: { kind: "marker", when: "Una flecha 3D que señala o muestra el sentido de un movimiento o una fuerza.", fields: { anchor: "ancla del objeto (hero)", dir: "up | down | left | right | toward | away", len: "metros (1,2)", color: "token (ui.cyan)" } },
  speed: { kind: "marker", when: "Líneas de velocidad que cruzan el plano: viaja, corre, sale disparado, cae, a toda velocidad.", fields: { dir: "up | down | left | right (sentido del movimiento)", color: "token (ui.cyan)" } },
  halo: { kind: "marker", when: "Un resplandor que late sobre una parte: calor, energía, atención, se enciende, se activa.", fields: { anchor: "ancla del objeto (hero)", size: "metros (1,6)", color: "token (warm.gold)" } },
  burst: { kind: "marker", when: "Una explosión de chispas: choque, ruptura, estallido, contacto, chispa.", fields: { anchor: "ancla del objeto (hero)", color: "token (warm.gold)", speed: "metros (1,6)" } },
  sparkle: { kind: "marker", when: "Destellos que titilan alrededor del objeto: brilla, es especial, magia, energía, hermoso, descubrimiento.", fields: { color: "token (warm.gold)" } },
  beam: { kind: "marker", when: "Un haz de luz o un rayo recto desde una parte: láser, rayo, luz que llega, señal, apunta, emite.", fields: { anchor: "ancla del objeto (hero)", dir: "up | down | left | right | toward | away", len: "metros (2,5)", color: "token (ui.cyan)" } },
  steam: { kind: "marker", when: "Partículas que suben desde una parte: vapor, humo, burbujas, calor, hierve, respira, se evapora.", fields: { kind: "steam | bubbles | smoke", anchor: "ancla del objeto (top)" } },
  mark: { kind: "marker", when: "Un símbolo flotante sobre el objeto: ? (duda, misterio), ! (alerta, sorpresa), ✓ (correcto), ✗ (falso, error), ♥ (cariño, corazón).", fields: { text: "? | ! | ✓ | ✗ | ♥", anchor: "ancla del objeto (top)" } },
  orbiter: { kind: "marker", when: "Una bolita que gira alrededor del objeto sin parar: satélite, luna, electrón, órbita, algo que lo acompaña.", fields: { r: "metros", tilt: "grados (20)", color: "token (ui.cyan)" } },
  rain: { kind: "marker", when: "Lluvia o nieve que cae sobre el objeto: llueve, nieva, tormenta, gotas, cae agua.", fields: { kind: "rain | snow" } },
  ripple: { kind: "marker", when: "Ondas que salen una tras otra del suelo o de una parte: sonido, vibración, señal, latido, eco, ondas.", fields: { anchor: "ancla del objeto (base)", color: "token (ui.cyan)" } },
  shockwave: { kind: "marker", when: "Una onda que se expande desde el suelo o una parte: impacto, golpe, terremoto, sonido, aparece de golpe.", fields: { anchor: "ancla del objeto (base)", color: "token (ui.cyan)" } },
};
export const isGeneric = (t: string) => ACTION_DEFS[t]?.kind === "generic";
export const isMarker = (t: string) => ACTION_DEFS[t]?.kind === "marker";
export const isCamera = (t: string) => ACTION_DEFS[t]?.kind === "camera";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
const easeIn = (u: number) => clamp01(u) ** 2;
const easeInOut = (u: number) => { const x = clamp01(u); return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2; };
const num = (s: Record<string, unknown>, k: string, d: number) => (typeof s[k] === "number" ? (s[k] as number) : d);
const str = (s: Record<string, unknown>, k: string, d: string) => (typeof s[k] === "string" ? (s[k] as string) : d);
const DIRS: Record<string, V3> = { up: [0, 1, 0], down: [0, -1, 0], left: [-1, 0, 0], right: [1, 0, 0], away: [0, 0.25, -1], toward: [0, 0, 1] };

export type Pose = { pos: V3; rot: V3; scale: number; stretch: V3 };
type Gen = (P: Pose, t: number, s: Record<string, unknown>, dur: number) => void;
const GENERIC: Record<string, Gen> = {
  lift: (P, t, s, dur) => {
    let k = easeOut(t / dur); const hold = typeof s.hold === "number" ? s.hold : undefined;
    if (hold !== undefined && t > dur + hold) k *= 1 - easeInOut((t - dur - hold) / dur);
    P.pos[1] += num(s, "height", 1.4) * k; P.pos[0] += 0.06 * Math.sin(t * 0.12) * k; P.rot[2] += 0.08 * Math.sin(t * 0.09) * k;
  },
  topple: (P, t, s, dur) => {
    const sign = str(s, "dir", "right") === "left" ? 1 : -1, k = easeIn(t / dur), after = Math.max(0, t - dur);
    P.rot[2] += sign * (Math.PI / 2 * k + Math.exp(-after * 0.15) * Math.sin(after * 0.5) * 0.12 * (t >= dur ? 1 : 0));
  },
  fly: (P, t, s, dur) => {
    const d = DIRS[str(s, "dir", "up")] ?? DIRS.up, k = easeIn(t / dur) ** 1.2, dist = num(s, "dist", 5);
    P.pos[0] += d[0] * dist * k; P.pos[1] += d[1] * dist * k; P.pos[2] += d[2] * dist * k; P.rot[0] += 1.2 * k; P.rot[2] += 0.5 * k;
  },
  shake: (P, t, s, dur) => { const u = t / dur; if (u >= 1) return; const a = num(s, "amp", 0.06) * (1 - u); P.pos[0] += a * Math.sin(t * 2.3); P.pos[1] += a * 0.6 * Math.sin(t * 3.1 + 1); P.rot[2] += a * 0.5 * Math.sin(t * 2.7); },
  pulse: (P, t, s, dur) => { const u = t / dur; if (u < 1) P.scale *= 1 + (num(s, "scale", 1.18) - 1) * Math.sin(Math.PI * u); },
  scale: (P, t, s, dur) => { P.scale *= 1 + (num(s, "to", 1.5) - 1) * easeInOut(t / dur); },
  spin: (P, t, s, dur) => { P.rot[1] += num(s, "turns", 1) * Math.PI * 2 * easeInOut(t / dur); },
  tilt: (P, t, s, dur) => { P.rot[2] += (num(s, "deg", 20) * Math.PI / 180) * easeOut(t / dur); },
  hop: (P, t, s, dur) => { const u = t / dur; if (u < 1) P.pos[1] += num(s, "height", 0.5) * Math.abs(Math.sin(Math.PI * num(s, "count", 2) * u)); },
  slide: (P, t, s, dur) => { const k = easeInOut(t / dur); P.pos[0] += num(s, "x", 1.2) * k; P.pos[2] += num(s, "z", 0) * k; },
};

const bounceOut = (u: number) => { const x = clamp01(u), n = 7.5625, d = 2.75; return x < 1 / d ? n * x * x : x < 2 / d ? n * (x - 1.5 / d) ** 2 + 0.75 : x < 2.5 / d ? n * (x - 2.25 / d) ** 2 + 0.9375 : n * (x - 2.625 / d) ** 2 + 0.984375; };
GENERIC.grow = (P, t, s, dur) => { P.scale *= 1 + (num(s, "to", 1.6) - 1) * easeInOut(t / dur); };
GENERIC.shrink = (P, t, s, dur) => { P.scale *= 1 + (num(s, "to", 0.5) - 1) * easeInOut(t / dur); };
GENERIC.appear = (P, t, _s, dur) => { const u = clamp01(t / dur), k = u < 1 ? 1 + 0.18 * Math.sin(Math.PI * u) * (1 - u) * 2 : 1; P.scale *= Math.max(0.0001, easeOut(u) * k); };
GENERIC.vanish = (P, t, _s, dur) => { const u = clamp01(t / dur); P.scale *= Math.max(0.0001, 1 - easeIn(u)); P.rot[1] += 3.5 * easeIn(u); P.pos[1] += 0.5 * u; };
GENERIC.drop = (P, t, s, dur) => { P.pos[1] += num(s, "height", 1.6) * (1 - bounceOut(t / dur)); };
GENERIC.swing = (P, t, s, dur) => { const c = num(s, "cycles", 3), u = clamp01(t / (dur * c)); P.rot[2] += (num(s, "deg", 25) * Math.PI / 180) * Math.sin(2 * Math.PI * c * u) * (1 - u); };
GENERIC.wobble = (P, t, s, dur) => { const u = clamp01(t / (dur * 2)), a = (num(s, "amp", 14) * Math.PI / 180) * (1 - u); P.rot[2] += a * Math.sin(t * 0.55); P.rot[0] += a * 0.6 * Math.sin(t * 0.43 + 1); };
GENERIC.squash = (P, t, s, dur) => { const u = clamp01(t / dur); if (u >= 1) return; const k = Math.sin(Math.PI * u) * num(s, "amount", 0.35); P.stretch[1] *= 1 - k; P.stretch[0] *= 1 + k * 0.6; P.stretch[2] *= 1 + k * 0.6; };
GENERIC.stretch = (P, t, s, dur) => { const k = easeOut(t / dur), to = num(s, "to", 1.5); P.stretch[1] *= 1 + (to - 1) * k; P.stretch[0] *= 1 - (to - 1) * 0.35 * k; P.stretch[2] *= 1 - (to - 1) * 0.35 * k; };
GENERIC.flip = (P, t, s, dur) => { const u = clamp01(t / dur); P.rot[0] += -num(s, "turns", 1) * Math.PI * 2 * easeInOut(u); P.pos[1] += 0.5 * Math.sin(Math.PI * u); };
GENERIC.circle = (P, t, s, dur) => { const u = clamp01(t / (dur * 2)), a = num(s, "turns", 1) * Math.PI * 2 * easeInOut(u), r = num(s, "r", 0.8); P.pos[0] += r * Math.sin(a); P.pos[2] += r * (1 - Math.cos(a)); };
GENERIC.zigzag = (P, t, s, dur) => { const u = clamp01(t / (dur * 2)); P.pos[0] += num(s, "amp", 0.5) * Math.sin(u * Math.PI * 4); P.pos[2] += num(s, "z", 0.6) * easeInOut(u); };
GENERIC.sway = (P, t, s) => { const a = num(s, "amp", 0.12); P.pos[0] += a * Math.sin(t * 0.07); P.rot[2] += (a * 0.5) * Math.sin(t * 0.07 + 1.2); P.pos[1] += a * 0.35 * Math.sin(t * 0.11); };
GENERIC.sink = (P, t, s, dur) => { P.pos[1] -= num(s, "depth", 1.2) * easeInOut(t / dur); };
GENERIC.turn = (P, t, s, dur) => { P.rot[1] += (num(s, "deg", 90) * Math.PI / 180) * easeInOut(t / dur); };
GENERIC.blink = (P, t, s, dur) => { const n = num(s, "count", 3), u = clamp01(t / dur); if (u < 1 && Math.floor(u * n * 2) % 2 === 1) P.scale *= 0.0001; };
/** estado ANTES de la palabra de las acciones que cambian cómo empieza el beat (aparecer: invisible; soltar: arriba) */
const PRE: Record<string, Gen> = {
  appear: (P) => { P.scale *= 0.0001; },
  drop: (P, _t, s) => { P.pos[1] += num(s, "height", 1.6); },
};

/** transformación del objeto entero en el frame f (suma de las acciones `generic` activas del beat i) */
export const genericPose = (tl: Timeline, i: number, f: number): Pose => {
  const P: Pose = { pos: [0, 0, 0], rot: [0, 0, 0], scale: 1, stretch: [1, 1, 1] };
  for (const a of tl.actions) {
    if (a.beat !== i || !isGeneric(a.spec.type)) continue;
    if (f >= a.start) GENERIC[a.spec.type](P, f - a.start, a.spec, a.dur); else PRE[a.spec.type]?.(P, 0, a.spec, a.dur);
  }
  return P;
};

/** efectos de cámara del beat i en el frame f: zoom de golpe y temblor (los usa camAt, así los overlays anclados los siguen) */
export const cameraFx = (tl: Timeline, i: number, f: number) => {
  const fx = { fovK: 1, shake: [0, 0, 0] as V3, roll: 0 };
  for (const a of tl.actions) {
    if (a.beat !== i || !isCamera(a.spec.type) || f < a.start) continue;
    const t = f - a.start, u = clamp01(t / a.dur), s = a.spec as Record<string, unknown>;
    if (a.spec.type === "punch" && u < 1) fx.fovK *= 1 - num(s, "amount", 0.16) * Math.sin(Math.PI * u);
    if (a.spec.type === "camshake" && u < 1) { const k = num(s, "amp", 0.05) * (1 - u); fx.shake[0] += k * Math.sin(t * 2.1); fx.shake[1] += k * 0.7 * Math.sin(t * 2.9 + 1); fx.shake[2] += k * 0.5 * Math.sin(t * 1.7); fx.roll += k * 0.12 * Math.sin(t * 2.4); }
  }
  return fx;
};

/** acciones propias del objeto activas en el beat i (las implementa `HeroInstance.act`) */
export const heroActions = (tl: Timeline, i: number) => {
  const names = Object.keys(heroDef(tl.beats[i].beat.scene.hero.asset).actions ?? {});
  return tl.actions.filter((a) => a.beat === i && names.includes(a.spec.type));
};

// ---------------------------------------------------------------- marcadores 3D
const tint = (s: Record<string, unknown>, d: string, k = 1.9) => new THREE.Color(color(str(s, "color", d))).multiplyScalar(k);
type Built = { obj: THREE.Object3D; upd: (t: number, u: number, f: number, cam: THREE.Camera) => void };

/** marcadores de un beat: se crean al montar la escena y se muestran o se esconden según el frame (sin estado entre frames) */
export class MarkerRig {
  root = new THREE.Group();
  private b = bin();
  private items: { a: ActionT; built: Built }[] = [];

  constructor(tl: Timeline, i: number) {
    const hd = heroDef(tl.beats[i].beat.scene.hero.asset);
    this.anchors = hd.anchors;
    for (const a of tl.actions) {
      if (a.beat !== i || !isMarker(a.spec.type)) continue;
      const s = a.spec as Record<string, unknown>, at = hd.anchors[str(s, "anchor", a.spec.type === "mark" || a.spec.type === "steam" ? "top" : "hero")] ?? hd.center;
      const built = this[a.spec.type as "ring"](s, at, hd.center, hd.radius);
      built.obj.visible = false; this.root.add(built.obj); this.items.push({ a, built });
    }
  }

  update(f: number, cam: THREE.Camera) {
    for (const { a, built } of this.items) {
      const t = f - a.start, on = t >= 0;
      built.obj.visible = on;
      if (on) built.upd(t, clamp01(t / a.dur), f, cam);
    }
  }
  dispose() { this.b.dispose(); }

  private mat(c: THREE.Color, o: THREE.MeshBasicMaterialParameters = {}) { return this.b.track(new THREE.MeshBasicMaterial({ color: c, fog: false, ...o })); }

  ring(s: Record<string, unknown>, at: V3, center: V3, radius: number): Built {
    const R = num(s, "r", radius * 0.85), axis = str(s, "axis", "y"), m = this.mat(tint(s, "ui.red"), { transparent: true });
    const holder = new THREE.Group(), mesh = new THREE.Mesh(new THREE.BufferGeometry(), m); holder.add(mesh);
    holder.position.set(center[0], at[1], center[2]);
    holder.rotation.set(axis === "x" ? Math.PI / 2 : 0, 0, (axis === "z" ? Math.PI / 2 : 0) + (num(s, "tilt", 0) * Math.PI) / 180);
    this.b.track(mesh.geometry); let lastN = -1;
    return { obj: holder, upd: (_t, u, f) => {
      const n = Math.max(2, Math.round(easeInOut(u) * 120));
      if (n !== lastN) {
        lastN = n; mesh.geometry.dispose();
        const pts = Array.from({ length: n + 1 }, (_, k) => { const a = (k / 120) * Math.PI * 2 - Math.PI / 2; return new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R); });
        mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, 0.035, 8, false);
      }
      m.opacity = 0.85 + 0.15 * Math.sin(f * 0.15);
    } };
  }

  arrow(s: Record<string, unknown>, at: V3, _c: V3, _r: number): Built {
    const d = new THREE.Vector3(...(DIRS[str(s, "dir", "down")] ?? DIRS.down)).normalize(), len = num(s, "len", 1.2), m = this.mat(tint(s, "ui.cyan"));
    const g = new THREE.Group(), shaft = new THREE.Mesh(this.b.track(new THREE.CylinderGeometry(0.05, 0.05, len, 10)), m), head = new THREE.Mesh(this.b.track(new THREE.ConeGeometry(0.14, 0.34, 14)), m);
    shaft.position.y = -len / 2 - 0.17; head.position.y = -0.17 + 0.0; head.rotation.x = Math.PI; g.add(shaft, head);
    // el eje +y del grupo apunta a lo contrario de `d`: la punta queda en `at` mirando hacia donde señala `d`
    const out = new THREE.Group(); out.add(g); out.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d);
    const holder = new THREE.Group(); holder.add(out); holder.position.set(...at).addScaledVector(d, -0.25);
    return { obj: holder, upd: (_t, u, f) => { const k = easeOut(u); holder.scale.setScalar(Math.max(0.01, k)); holder.position.set(...at).addScaledVector(d, -0.25 - 0.08 * Math.sin(f * 0.2) - (1 - k) * 0.6); } };
  }

  speed(s: Record<string, unknown>, _at: V3, center: V3, radius: number): Built {
    const d = new THREE.Vector3(...(DIRS[str(s, "dir", "up")] ?? DIRS.up)).normalize(), m = this.mat(tint(s, "ui.cyan", 1.3), { transparent: true, opacity: 0.55 });
    const holder = new THREE.Group(), lines: { mesh: THREE.Mesh; base: THREE.Vector3; ph: number }[] = [];
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d), geo = this.b.track(new THREE.BoxGeometry(0.025, 1, 0.025));
    for (let k = 0; k < 22; k++) {
      const mesh = new THREE.Mesh(geo, m), side = new THREE.Vector3((rnd() - 0.5) * 2, (rnd() - 0.5) * 2, (rnd() - 0.5) * 1.2).multiplyScalar(radius * 1.2);
      side.addScaledVector(d, -side.dot(d)); mesh.quaternion.copy(q); mesh.scale.y = 0.5 + rnd() * 1.1; holder.add(mesh); lines.push({ mesh, base: side, ph: rnd() });
    }
    holder.position.set(...center);
    const span = radius * 3.2;
    return { obj: holder, upd: (_t, u, f) => { lines.forEach(({ mesh, base, ph }) => { const p = ((f * 0.045 + ph) % 1) * span - span / 2; mesh.position.copy(base).addScaledVector(d, -p); mesh.visible = u > 0.05; }); m.opacity = 0.55 * easeOut(u); } };
  }

  halo(s: Record<string, unknown>, at: V3, _c: V3, _r: number): Built {
    const c = tint(s, "warm.gold", 1), size = num(s, "size", 1.6), h = halo(this.b, `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0.95)`, size, 0.9);
    h.position.set(...at);
    return { obj: h, upd: (_t, u, f, cam) => { h.quaternion.copy(cam.quaternion); h.scale.setScalar(easeOut(u) * (1 + 0.1 * Math.sin(f * 0.18))); (h.material as THREE.MeshBasicMaterial).opacity = 0.9 * easeOut(u); } };
  }

  burst(s: Record<string, unknown>, at: V3, _c: V3, _r: number): Built {
    const m = this.mat(tint(s, "warm.gold", 2), { transparent: true }), geo = this.b.track(new THREE.SphereGeometry(0.05, 8, 6)), sp = num(s, "speed", 1.6);
    const holder = new THREE.Group(), parts: { mesh: THREE.Mesh; d: THREE.Vector3 }[] = [];
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let k = 0; k < 30; k++) { const u1 = rnd() * 2 - 1, a = rnd() * 6.283, r = Math.sqrt(1 - u1 * u1), mesh = new THREE.Mesh(geo, m); holder.add(mesh); parts.push({ mesh, d: new THREE.Vector3(r * Math.cos(a), u1, r * Math.sin(a)).multiplyScalar(0.5 + rnd() * 0.7) }); }
    holder.position.set(...at);
    return { obj: holder, upd: (t, u) => { const v = clamp01(t / 36); holder.visible = v < 1; parts.forEach(({ mesh, d }) => { mesh.position.copy(d).multiplyScalar(sp * easeOut(v)); mesh.scale.setScalar(Math.max(0.01, 1 - v)); }); void u; } };
  }

  sparkle(s: Record<string, unknown>, _at: V3, center: V3, radius: number): Built {
    const m = this.mat(tint(s, "warm.gold", 2.2), { transparent: true }), geo = this.b.track(new THREE.OctahedronGeometry(0.07, 0));
    const holder = new THREE.Group(), ps: { mesh: THREE.Mesh; ph: number }[] = [];
    let seed = 23; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let k = 0; k < 20; k++) { const u1 = rnd() * 2 - 1, a = rnd() * 6.283, r = Math.sqrt(1 - u1 * u1), mesh = new THREE.Mesh(geo, m); mesh.position.set(r * Math.cos(a), u1, r * Math.sin(a)).multiplyScalar(radius * (0.8 + rnd() * 0.5)); holder.add(mesh); ps.push({ mesh, ph: rnd() * 6.28 }); }
    holder.position.set(...center);
    return { obj: holder, upd: (_t, u, f) => { ps.forEach(({ mesh, ph }) => { const k = Math.max(0, Math.sin(f * 0.16 + ph)); mesh.scale.setScalar(Math.max(0.001, k * easeOut(u) * 1.4)); mesh.rotation.y = f * 0.05 + ph; }); } };
  }

  beam(s: Record<string, unknown>, at: V3, _c: V3, _r: number): Built {
    const d = new THREE.Vector3(...(DIRS[str(s, "dir", "up")] ?? DIRS.up)).normalize(), len = num(s, "len", 2.5), m = this.mat(tint(s, "ui.cyan", 2), { transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(this.b.track(new THREE.CylinderGeometry(0.06, 0.06, 1, 10)), m), holder = new THREE.Group(); holder.add(mesh);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    return { obj: holder, upd: (_t, u, f) => { const L = len * easeOut(u); mesh.scale.set(1 + 0.25 * Math.sin(f * 0.6), Math.max(0.001, L), 1 + 0.25 * Math.sin(f * 0.6)); mesh.position.set(...at).addScaledVector(d, L / 2); m.opacity = 0.7 + 0.2 * Math.sin(f * 0.5); } };
  }

  steam(s: Record<string, unknown>, at: V3, _c: V3, radius: number): Built {
    const kind = str(s, "kind", "steam"), col = kind === "bubbles" ? new THREE.Color("#bfe9ff").multiplyScalar(1.3) : kind === "smoke" ? new THREE.Color("#3a3a46") : new THREE.Color("#eef2fb");
    const m = this.mat(col, { transparent: true, opacity: kind === "bubbles" ? 0.75 : 0.5 }), geo = this.b.track(new THREE.SphereGeometry(kind === "bubbles" ? 0.07 : 0.18, 10, 8));
    const holder = new THREE.Group(), ps: { mesh: THREE.Mesh; ph: number; ox: number; oz: number }[] = [];
    let seed = 31; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let k = 0; k < 16; k++) { const mesh = new THREE.Mesh(geo, m); holder.add(mesh); ps.push({ mesh, ph: rnd(), ox: (rnd() - 0.5) * radius * 0.5, oz: (rnd() - 0.5) * radius * 0.5 }); }
    holder.position.set(...at);
    return { obj: holder, upd: (_t, u, f) => { ps.forEach(({ mesh, ph, ox, oz }) => { const p = (f * 0.012 + ph) % 1; mesh.position.set(ox + 0.12 * Math.sin(p * 9 + ph * 6), p * 1.8, oz); mesh.scale.setScalar(Math.max(0.001, (kind === "bubbles" ? 1 : 0.5 + p * 1.6) * Math.sin(Math.PI * p) * easeOut(u))); }); } };
  }

  mark(s: Record<string, unknown>, at: V3, _c: V3, _r: number): Built {
    const ch = str(s, "text", "?"), c = ({ "?": "#5fd4f4", "!": "#dcae6d", "✓": "#3ddc84", "✗": "#ff5a5f", "♥": "#ff7ab8" } as Record<string, string>)[ch] ?? "#5fd4f4";
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d")!;
    g.fillStyle = "rgba(10,12,30,0.8)"; g.beginPath(); g.arc(128, 128, 118, 0, Math.PI * 2); g.fill(); g.strokeStyle = c; g.lineWidth = 12; g.stroke();
    g.fillStyle = c; g.font = "800 150px Montserrat, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, 128, 138);
    const tex = this.b.track(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(this.b.track(new THREE.PlaneGeometry(0.75, 0.75)), this.b.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })));
    const top = this.anchorOr(s, at);
    return { obj: mesh, upd: (_t, u, f, cam) => { mesh.quaternion.copy(cam.quaternion); const pop = u < 1 ? easeOut(u) * (1 + 0.25 * Math.sin(Math.PI * u)) : 1; mesh.scale.setScalar(Math.max(0.001, pop)); mesh.position.set(top[0], top[1] + 0.45 + 0.07 * Math.sin(f * 0.12), top[2]); } };
  }

  orbiter(s: Record<string, unknown>, at: V3, center: V3, radius: number): Built {
    const R = num(s, "r", radius * 0.95), m = this.mat(tint(s, "ui.cyan", 2)), holder = new THREE.Group(), ball = new THREE.Mesh(this.b.track(new THREE.SphereGeometry(0.13, 14, 10)), m);
    const trail = Array.from({ length: 6 }, (_, k) => { const t = new THREE.Mesh(this.b.track(new THREE.SphereGeometry(0.07 - k * 0.009, 8, 6)), this.mat(tint(s, "ui.cyan", 1.2), { transparent: true, opacity: 0.5 - k * 0.07 })); holder.add(t); return t; });
    holder.add(ball); holder.position.set(center[0], at[1], center[2]); holder.rotation.z = (num(s, "tilt", 20) * Math.PI) / 180;
    return { obj: holder, upd: (_t, u, f) => { const place = (m2: THREE.Object3D, a: number) => m2.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); const a0 = f * 0.06; place(ball, a0); trail.forEach((t, k) => place(t, a0 - (k + 1) * 0.12)); holder.scale.setScalar(Math.max(0.001, easeOut(u))); } };
  }

  rain(s: Record<string, unknown>, _at: V3, center: V3, radius: number): Built {
    const snow = str(s, "kind", "rain") === "snow", m = this.mat(new THREE.Color(snow ? "#ffffff" : "#9fd0ff").multiplyScalar(1.4), { transparent: true, opacity: 0 });
    const geo = this.b.track(snow ? new THREE.SphereGeometry(0.04, 6, 5) : new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4)), holder = new THREE.Group(), ps: { mesh: THREE.Mesh; x: number; z: number; ph: number }[] = [];
    let seed = 41; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let k = 0; k < 60; k++) { const mesh = new THREE.Mesh(geo, m); holder.add(mesh); ps.push({ mesh, x: (rnd() - 0.5) * radius * 3, z: (rnd() - 0.5) * radius * 1.8, ph: rnd() }); }
    holder.position.set(center[0], 0, center[2]);
    return { obj: holder, upd: (_t, u, f) => { m.opacity = 0.75 * easeOut(u); ps.forEach(({ mesh, x, z, ph }) => { const p = (f * (snow ? 0.006 : 0.022) + ph) % 1; mesh.position.set(x + (snow ? 0.15 * Math.sin(f * 0.05 + ph * 9) : 0), 3.8 * (1 - p), z); }); } };
  }

  ripple(s: Record<string, unknown>, at: V3, center: V3, radius: number): Built {
    const holder = new THREE.Group(), rings = [0, 1, 2].map(() => { const m = this.mat(tint(s, "ui.cyan", 1.8), { transparent: true }), r = new THREE.Mesh(this.b.track(new THREE.TorusGeometry(1, 0.025, 8, 80)), m); r.rotation.x = Math.PI / 2; holder.add(r); return { r, m }; });
    holder.position.set(center[0], Math.max(0.03, at[1]), center[2]);
    return { obj: holder, upd: (t) => { rings.forEach(({ r, m }, k) => { const p = ((t + k * 20) % 60) / 60; r.scale.setScalar(0.2 + radius * 1.8 * easeOut(p)); m.opacity = (1 - p) * 0.9; }); } };
  }

  /** ancla pedida (por defecto "top") o la dada */
  private anchorOr(s: Record<string, unknown>, fallback: V3): V3 { return (this.anchors[str(s, "anchor", "top")] ?? fallback) as V3; }
  private anchors: Record<string, V3> = {};

  shockwave(s: Record<string, unknown>, at: V3, center: V3, radius: number): Built {
    const m = this.mat(tint(s, "ui.cyan", 1.8), { transparent: true }), ring = new THREE.Mesh(this.b.track(new THREE.TorusGeometry(1, 0.03, 8, 80)), m);
    ring.rotation.x = Math.PI / 2; const holder = new THREE.Group(); holder.add(ring); holder.position.set(center[0], Math.max(0.03, at[1]), center[2]);
    return { obj: holder, upd: (t) => { const v = clamp01(t / 40); holder.visible = v < 1; ring.scale.setScalar(0.2 + radius * 2.2 * easeOut(v)); m.opacity = 1 - v; } };
  }
}
