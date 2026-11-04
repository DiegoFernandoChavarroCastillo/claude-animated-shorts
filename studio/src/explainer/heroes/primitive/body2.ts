// Pack A (2.ª tanda) · Cuerpo: hueso y articulación, músculo, oído, diente, riñón e intestino.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, cyl, glowMat, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];
const boneM = (b: Bin) => glowMat(b, col(TONE.bone, "#ffffff", 0.2), 0.18, { roughness: 0.55 });

export const hueso_articulacion: HeroDef = {
  kind: "primitive",
  when: "Huesos y articulaciones: rodilla, fracturas, cartílago, cómo se sueldan los huesos, crujidos de las articulaciones, artritis, calcio, crecer en altura.",
  poses: ["sana", "fractura"],
  center: [0, 1.5, 0], radius: 1.35,
  anchors: { hero: [0, 1.5, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], rodilla: [0, 1.5, 0.3], cartilago: [0, 1.5, 0.4], fractura: [0, 0.6, 0.2], ligamento: [0.45, 1.5, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(hueso_articulacion, pose, "hueso_articulacion"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), bm = boneM(b);
    const femur = new THREE.Group(); femur.add(place(cyl(b, 0.2, 0.24, 1.5, bm, 20), [0, 2.35, 0]), place(ball(b, 0.3, bm, 18), [0.28, 3.1, 0]), place(ball(b, 0.27, bm, 18), [-0.15, 1.72, 0]), place(ball(b, 0.27, bm, 18), [0.15, 1.72, 0]));
    const tibia = new THREE.Group(); tibia.add(place(cyl(b, 0.17, 0.14, p === "fractura" ? 0.55 : 1.25, bm, 18), [0, p === "fractura" ? 0.95 : 0.7, 0]), place(box(b, 0.75, 0.14, 0.45, bm), [0, 1.3, 0]));
    const cart = place(cyl(b, 0.36, 0.36, 0.1, glowMat(b, TONE.cyan, 0.5, { transparent: true, opacity: 0.75 }), 24), [0, 1.5, 0]);
    const lig = [-1, 1].map((s) => rod(b, [s * 0.42, 1.8, 0.05], [s * 0.36, 1.25, 0.05], 0.045, glowMat(b, TONE.gold, 0.45)));
    g.add(femur, tibia, cart, ...lig);
    if (p === "fractura") {
      const low = new THREE.Group(); low.add(place(cyl(b, 0.14, 0.12, 0.5, bm, 16), [0, 0.0, 0]), place(ball(b, 0.15, bm, 12), [0, -0.28, 0])); low.position.set(0.28, 0.42, 0); low.rotation.z = -0.4; g.add(low);
      g.add(tube(b, [[-0.25, 1.15, 0.2], [0, 1.05, 0.2], [-0.1, 0.92, 0.2], [0.15, 0.82, 0.2]], 0.03, beam(b, TONE.glowRed, 1.7), 20));
    }
    root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.5 * Math.sin(f * 0.012); if (p === "sana") { femur.position.x = 0.1 * Math.sin(f * 0.04); femur.rotation.z = 0.07 * Math.sin(f * 0.04); } });
  },
};

export const musculo: HeroDef = {
  kind: "primitive",
  when: "Músculos: contraerse, fuerza, agujetas, calambres, ejercicio, fibras musculares, por qué se cansan, bíceps, cómo se mueve el cuerpo.",
  poses: ["relajado", "contraido"],
  center: [0, 1.4, 0], radius: 1.4,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.8, 0], base: [0, 0.1, 0], fibra: [0.2, 1.4, 0.4], tendon: [0, 2.5, 0], vientre: [0, 1.4, 0.5] },
  build: (_L, pose) => {
    const p = poseOf(musculo, pose, "musculo"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const prof = Array.from({ length: 14 }, (_, i) => { const t = i / 13; return new THREE.Vector2(0.06 + 0.5 * Math.sin(Math.PI * Math.pow(t, 0.9)), -1.1 + 2.2 * t); });
    const belly = new THREE.Mesh(b.track(new THREE.LatheGeometry(prof, 32)), glowMat(b, "#d9444e", 0.22, { roughness: 0.5 })); belly.position.y = 1.4;
    const fibers = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * 6.28; return tube(b, Array.from({ length: 10 }, (_, k) => { const t = k / 9, r = 0.06 + 0.5 * Math.sin(Math.PI * Math.pow(t, 0.9)); return [Math.cos(a) * r * 1.01, 0.3 + 2.2 * t - 0.0, Math.sin(a) * r * 1.01] as P3; }), 0.014, glowMat(b, "#ff8a8a", 0.7), 20); });
    const tendon = [1, -1].map((s) => tube(b, [[0, 1.4 + s * 1.1, 0], [0, 1.4 + s * 1.5, 0]], 0.09, glowMat(b, TONE.bone, 0.3), 8));
    const bone = [1, -1].map((s) => place(ball(b, 0.22, boneM(b), 14), [0, 1.4 + s * 1.62, 0]));
    const body = new THREE.Group(); body.add(belly, ...fibers); g.add(body, ...tendon, ...bone); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const k = p === "contraido" ? 0.5 + 0.5 * Math.sin(f * 0.07) : 0; body.scale.set(1 + 0.45 * k, 1 - 0.28 * k, 1 + 0.45 * k); body.position.y = 1.4 * 0.28 * k;
      bone[0].position.y = 3.02 - 0.3 * k; bone[1].position.y = -0.22 + 0.3 * k; g.rotation.y = 0.4 * Math.sin(f * 0.01);
    });
  },
};

export const oido: HeroDef = {
  kind: "primitive",
  when: "Oído: cómo oímos, sonido, tímpano, huesecillos, cóclea, equilibrio y mareos, por qué zumban los oídos, volumen y sordera.",
  poses: ["corte"],
  center: [0, 1.3, 0], radius: 1.5,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], timpano: [0.1, 1.3, 0.2], coclea: [1.3, 1.1, 0], pabellon: [-1.5, 1.4, 0] },
  build: (_L, pose) => {
    poseOf(oido, pose, "oido");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), fl = glowMat(b, TONE.flesh, 0.2);
    const pinna = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.75, 0.2, 14, 32, 4.6)), fl); pinna.position.set(-1.5, 1.4, 0); pinna.rotation.z = 0.9;
    const canal = tube(b, [[-1.2, 1.4, 0], [-0.4, 1.35, 0], [0.1, 1.3, 0]], 0.2, glowMat(b, col(TONE.flesh, TONE.fleshDark, 0.4), 0.2), 20);
    const drum = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.3, 24)), glowMat(b, "#fff0d0", 0.5, { side: THREE.DoubleSide })); drum.rotation.y = Math.PI / 2; drum.position.set(0.1, 1.3, 0);
    const oss = [0.35, 0.6, 0.8].map((x, i) => place(ball(b, 0.08 - i * 0.01, boneM(b), 10), [x, 1.3 + 0.1 * i, 0]));
    const sp: P3[] = Array.from({ length: 60 }, (_, i) => { const t = i / 59, a = t * 3.3 * Math.PI, r = 0.55 * (1 - 0.7 * t); return [1.35 + Math.cos(a) * r, 1.1 + Math.sin(a) * r, 0] as P3; });
    const coc = tube(b, sp, 0.13, glowMat(b, TONE.gold, 0.4), 80), nerve = tube(b, [[1.5, 1.2, 0], [1.9, 1.7, 0], [2.3, 2.2, 0]], 0.05, glowMat(b, TONE.cyan, 0.7), 12);
    const rings = [0, 1, 2].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(0.4, 0.02, 6, 28)), beam(b, TONE.cyan, 1.5, { transparent: true, opacity: 0.8 })));
    rings.forEach((r) => { r.rotation.y = Math.PI / 2; g.add(r); });
    g.add(pinna, canal, drum, ...oss, coc, nerve); g.position.x = -0.2; root.add(g); shadows(g);
    return done(root, b, (f) => {
      rings.forEach((r, i) => { const t = (f * 0.015 + i / 3) % 1; r.position.set(-2.4 + t * 2.4, 1.38, 0); r.scale.setScalar(0.6 + 0.6 * (1 - t)); (r.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - t); });
      drum.scale.setScalar(1 + 0.06 * Math.sin(f * 0.4)); g.rotation.y = 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const diente: HeroDef = {
  kind: "primitive",
  when: "Dientes: esmalte, caries, por qué duelen los dientes, flúor, cepillarse, dientes de leche, sensibilidad, por qué el azúcar daña los dientes.",
  poses: ["sano", "caries"],
  center: [0, 1.3, 0], radius: 1.3,
  anchors: { hero: [0, 1.3, 0.3], top: [0, 2.6, 0], base: [0, 0.1, 0], esmalte: [0.55, 2.3, 0.1], pulpa: [0, 1.4, 0.3], raiz: [0, 0.4, 0.2], caries: [0.3, 2.1, 0.4] },
  build: (_L, pose) => {
    const p = poseOf(diente, pose, "diente"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const prof = [[0, 1.9], [0.4, 1.85], [0.62, 1.6], [0.66, 1.2], [0.58, 0.9], [0.46, 0.5], [0.34, 0.0], [0.16, -0.65], [0, -0.75]];
    const shape = (k: number) => { const s = new THREE.Shape(); prof.forEach(([r, y], i) => (i ? s.lineTo(-r * k, y) : s.moveTo(-r * k, y))); [...prof].reverse().forEach(([r, y]) => s.lineTo(r * k, y)); return s; };
    const lay = (k: number, c: string, z: number, k2 = 0.2) => { const m = new THREE.Mesh(b.track(new THREE.ShapeGeometry(shape(k), 16)), glowMat(b, c, k2, { side: THREE.DoubleSide })); m.position.z = z; return m; };
    const half = (k: number, c: string, o: number) => { const l = new THREE.Mesh(b.track(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r * k, y)), 36, Math.PI / 2, Math.PI)), glowMat(b, c, 0.2, { side: THREE.DoubleSide, transparent: o < 1, opacity: o })); return l; };
    g.add(half(1, "#f6f2e6", 0.5), lay(1, "#f6f2e6", 0.0), lay(0.82, "#f0d090", 0.01), lay(0.34, "#e04a54", 0.02, 0.6));
    if (p === "caries") {
      const hole = blob(b, 0.26, 0.2, 3, mat(b, "#2a1a14", { roughness: 1 }), 2); hole.position.set(0.32, 1.55, 0.04); hole.scale.set(1, 1, 0.3);
      const trail = lay(0.14, "#3a2418", 0.025, 0.1); trail.position.set(0.2, 0.9, 0.025); trail.scale.set(0.5, 0.55, 1);
      const bac = scatter(6, 3, (r) => [0.1 + r() * 0.4, 1.3 + r() * 0.7, 0.06] as P3).map((q) => ({ s: place(ball(b, 0.045, glowMat(b, TONE.green, 0.8), 8), q), q }));
      g.add(hole, trail, ...bac.map((x) => x.s));
    }
    g.position.y = 0.7; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.5 * Math.sin(f * 0.012); g.position.y = 0.7 + 0.03 * Math.sin(f * 0.05); });
  },
};

export const rinon: HeroDef = {
  kind: "primitive",
  when: "Riñones y filtrado: orina, cómo se limpia la sangre, sed y agua, sal en el cuerpo, deshidratación, cálculos renales, hidratación.",
  poses: ["filtra"],
  center: [0, 1.3, 0], radius: 1.4,
  anchors: { hero: [0, 1.3, 0.3], top: [0, 2.6, 0], base: [0, 0.1, 0], arteria: [-0.2, 2.2, 0.2], uretero: [0, 0.3, 0.2], corteza: [0.6, 1.4, 0.5] },
  build: (_L, pose) => {
    poseOf(rinon, pose, "rinon");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const bean = blob(b, 0.9, 0.04, 5, glowMat(b, "#b04a56", 0.22, { roughness: 0.5 }), 4); bean.scale.set(0.75, 1.15, 0.55); bean.position.set(0.2, 1.3, 0);
    const notch = place(ball(b, 0.38, glowMat(b, "#6a2a34", 0.2), 18), [-0.35, 1.3, 0.1]);
    const art = tube(b, [[-0.4, 2.7, 0], [-0.45, 2.1, 0.05], [-0.3, 1.5, 0.1]], 0.07, glowMat(b, TONE.blood, 0.4), 18), vein = tube(b, [[-0.55, 2.7, 0], [-0.6, 2.0, 0.05], [-0.4, 1.4, 0.1]], 0.07, glowMat(b, "#6d7fd8", 0.4), 18);
    const ure = tube(b, [[-0.3, 1.1, 0.1], [-0.3, 0.6, 0.1], [0, 0.1, 0.1]], 0.05, glowMat(b, TONE.gold, 0.5), 20);
    const dots = scatter(14, 4, (r) => [0.1 + r() * 0.6, 0.8 + r() * 1.0, 0.3] as P3).map((q) => ({ s: place(ball(b, 0.035, beam(b, TONE.cyan, 1.8), 6), q), q }));
    const drops = [0, 1, 2].map(() => ball(b, 0.05, beam(b, TONE.gold, 1.8), 8));
    g.add(bean, notch, art, vein, ure, ...dots.map((d) => d.s), ...drops); root.add(g); shadows(g);
    return done(root, b, (f) => {
      dots.forEach(({ s, q }, i) => { const t = (f * 0.01 + i / 14) % 1; s.position.set(q[0] - 0.9 * t, q[1] - 0.3 * Math.sin(t * 3.1), 0.3); });
      drops.forEach((d, i) => { const t = (f * 0.012 + i / 3) % 1; d.position.set(-0.3 + 0.3 * t, 1.1 - 1.0 * t, 0.1); }); bean.scale.set(0.75 + 0.015 * Math.sin(f * 0.1), 1.15, 0.55); g.rotation.y = 0.45 * Math.sin(f * 0.01);
    });
  },
};

export const intestino: HeroDef = {
  kind: "primitive",
  when: "Intestino y digestión larga: absorción de nutrientes, cuánto mide el intestino, flora intestinal, por qué hacemos caca, fibra, náuseas, comida que avanza.",
  poses: ["enrollado"],
  center: [0, 1.3, 0], radius: 1.4,
  anchors: { hero: [0, 1.3, 0.3], top: [0, 2.5, 0], base: [0, 0.1, 0], vellosidad: [0.8, 1.5, 0.4], final: [-0.9, 0.3, 0.2], inicio: [0.9, 2.3, 0.2] },
  build: (_L, pose) => {
    poseOf(intestino, pose, "intestino");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const pts: P3[] = []; for (let r = 0; r < 6; r++) { const y = 2.3 - r * 0.38, d = r % 2 ? -1 : 1; for (let k = 0; k <= 8; k++) pts.push([d * (-0.95 + (k / 8) * 1.9), y + 0.1 * Math.sin(k * 1.6), 0.05 * Math.sin(k)]); }
    const gut = tube(b, pts, 0.15, glowMat(b, col(TONE.flesh, TONE.gold, 0.4), 0.22, { roughness: 0.55 }), 260);
    const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), food = Array.from({ length: 8 }, (_, i) => ({ s: ball(b, 0.09, beam(b, i % 2 ? TONE.green : TONE.gold, 1.5), 8), i }));
    g.add(gut, ...food.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { food.forEach(({ s, i }) => { s.position.copy(curve.getPoint((f * 0.0035 + i / 8) % 1)); s.position.z += 0.18; s.scale.setScalar(1 - 0.5 * (((f * 0.0035 + i / 8) % 1))); }); g.rotation.y = 0.4 * Math.sin(f * 0.01); });
  },
};
