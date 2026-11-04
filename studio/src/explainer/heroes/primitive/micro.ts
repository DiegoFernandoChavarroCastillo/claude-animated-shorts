// Pack B · Micro (F11): célula, virus, bacteria, ADN, glóbulos y neurona. Formas genéricas de manual (ningún virus ni
// bacteria concretos), colores de la paleta y mucho brillo propio: a esta escala la "cámara" es siempre un microscopio.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, blob, col, ghostMat, glowMat, halo, mat, place, rod, scatter, tube, virusBody, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const celula: HeroDef = {
  kind: "primitive",
  when: "Célula: membrana, núcleo, mitocondrias, cómo es una célula por dentro, infección celular, cuerpo humano a escala pequeña.",
  poses: ["sana", "infectada"],
  center: [0, 1.25, 0], radius: 1.1,
  anchors: { hero: [0, 1.25, 0], top: [0, 2.4, 0], base: [0, 0.1, 0], nucleo: [0, 1.3, 0.1], membrana: [0.98, 1.3, 0.3], mitocondria: [-0.5, 0.95, 0.5], virus: [0.45, 1.75, 0.35] },
  build: (_L, pose) => {
    const p = poseOf(celula, pose, "celula"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const sick = p === "infectada", membrane = blob(b, 1.05, 0.035, 2, ghostMat(b, col(TONE.cyan, TONE.violet, 0.3), 0.3, { emissive: col(TONE.cyan).multiplyScalar(0.12) }), 4);
    membrane.renderOrder = 2;
    const cyto = ball(b, 0.99, glowMat(b, col(TONE.violet, TONE.cyan, 0.25), 0.12, { transparent: true, opacity: 0.22, depthWrite: false }), 32);
    const nM = glowMat(b, sick ? col(TONE.glowRed, TONE.lavender, 0.35) : col("#b9a8ff", TONE.cyan, 0.2), 0.45, { roughness: 0.4 });
    const nucleus = ball(b, 0.46, nM, 32), nucleolus = place(ball(b, 0.13, glowMat(b, TONE.gold, 0.4), 16), [0.1, 0.05, 0.25]);
    const mito = scatter(5, 3, (r, i) => { const a = (i / 5) * Math.PI * 2 + r() * 0.5; return [Math.cos(a) * (0.6 + r() * 0.15), (r() - 0.5) * 0.7, Math.sin(a) * (0.6 + r() * 0.15)] as P3; })
      .map((q, i) => { const m = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.1, 0.28, 6, 12)), glowMat(b, TONE.gold, 0.5)); m.position.set(...q); m.rotation.set(i, i * 2, i * 0.5); return m; });
    const dots = scatter(26, 7, (r) => { const u = r() * 2 - 1, a = r() * 6.28, s = Math.sqrt(1 - u * u), d = 0.45 + r() * 0.42; return [s * Math.cos(a) * d, u * d, s * Math.sin(a) * d] as P3; })
      .map((q) => place(ball(b, 0.045, glowMat(b, TONE.cyan, 0.9), 6), q));
    const vir = sick ? scatter(5, 9, (r) => [(r() - 0.5) * 1.1, (r() - 0.5) * 1.1, (r() - 0.5) * 0.9] as P3).map((q) => { const v = virusBody(b, 0.1); v.position.set(...q); return v; }) : [];
    const inner = new THREE.Group(); inner.add(nucleus, nucleolus, ...mito, ...dots, ...vir);
    g.add(membrane, cyto, inner); g.position.y = 1.25; root.add(g); shadows(g);
    return done(root, b, (f) => {
      g.rotation.y = f * 0.004; inner.rotation.y = -f * 0.006; membrane.scale.setScalar(1 + 0.012 * Math.sin(f * 0.07));
      if (sick) nM.emissive.copy(col(TONE.glowRed)).multiplyScalar(0.2 + 0.2 * Math.sin(f * 0.1));
      vir.forEach((v, i) => { v.rotation.y = f * 0.03 + i; });
    });
  },
};

export const virus: HeroDef = {
  kind: "primitive",
  when: "Virus genérico: gripe, resfriado, contagio, cómo entra en una célula, por qué no se cura con antibióticos, espículas.",
  poses: ["libre", "uniendose"],
  center: [0, 1.3, 0], radius: 1.1,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.3, 0], base: [0, 0.1, 0], espicula: [0.75, 1.95, 0.3], capside: [0, 1.3, 0.6], receptor: [0, 0.55, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(virus, pose, "virus"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const v = virusBody(b, 0.75); v.position.y = 1.3; g.add(v);
    if (p === "uniendose") {
      const wall = new THREE.Mesh(b.track(new THREE.SphereGeometry(2.2, 48, 16, 0, Math.PI * 2, 0, 0.55)), glowMat(b, col(TONE.cyan, TONE.violet, 0.35), 0.2, { roughness: 0.5 })); wall.position.y = -1.55;
      g.add(wall);
      scatter(9, 4, (r) => [(r() - 0.5) * 1.6, 0.62, (r() - 0.5) * 1.2] as P3).forEach((q) => { const y = new THREE.Group(); y.add(rod(b, [0, 0, 0], [0, 0.18, 0], 0.02, mat(b, TONE.gold)), place(ball(b, 0.05, glowMat(b, TONE.gold, 0.5), 8), [0, 0.2, 0])); y.position.set(q[0], q[1], q[2]); g.add(y); });
      v.position.y = 1.15;
    }
    const aura = halo(b, "rgba(61,220,132,0.5)", 3.2, 0.35); aura.position.set(0, 1.3, -0.3); g.add(aura);
    root.add(g); shadows(g);
    return done(root, b, (f) => { v.rotation.set(0.3 * Math.sin(f * 0.01), f * 0.012, 0); v.position.y = (p === "uniendose" ? 1.15 : 1.3) + 0.04 * Math.sin(f * 0.05); });
  },
};

export const bacteria: HeroDef = {
  kind: "primitive",
  when: "Bacteria genérica: infecciones, antibióticos, flora intestinal, probióticos, yogur, cómo se dividen, higiene y lavarse las manos.",
  poses: ["bacilo", "division"],
  center: [0, 1.25, 0], radius: 1.25,
  anchors: { hero: [0, 1.25, 0], top: [0, 2.2, 0], base: [0, 0.1, 0], flagelo: [-1.1, 1.0, 0], pared: [0.2, 1.7, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(bacteria, pose, "bacteria"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const body = glowMat(b, col(TONE.green, TONE.cyan, 0.2), 0.22, { roughness: 0.45 }), mk = (x: number, s = 1) => { const m = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.42 * s, 1.1 * s, 10, 24)), body); m.rotation.z = Math.PI / 2; m.position.x = x; return m; };
    const cells = p === "division" ? [mk(-0.48, 0.82), mk(0.48, 0.82)] : [mk(0)];
    const pili = scatter(22, 6, (r) => { const a = r() * 6.28; return [(r() - 0.5) * 1.8, Math.sin(a), Math.cos(a)] as P3; });
    const hairs = pili.map(([x, y, z]) => rod(b, [x, y * 0.4, z * 0.4], [x, y * 0.75, z * 0.75], 0.012, glowMat(b, TONE.green, 0.4)));
    const flag = tube(b, Array.from({ length: 24 }, (_, i) => [-1.0 - i * 0.07, Math.sin(i * 0.7) * 0.18, 0] as P3), 0.03, glowMat(b, TONE.gold, 0.4));
    const dna = tube(b, Array.from({ length: 30 }, (_, i) => [Math.sin(i * 0.7) * 0.3, Math.cos(i * 1.1) * 0.12, Math.sin(i * 0.5) * 0.12] as P3), 0.018, glowMat(b, TONE.cyan, 0.8));
    g.add(...cells, ...hairs, flag, dna); g.position.y = 1.25; g.rotation.z = 0.15; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = f * 0.008; flag.rotation.z = 0.2 * Math.sin(f * 0.15); flag.position.x = -0.02 * Math.sin(f * 0.15); g.position.y = 1.25 + 0.05 * Math.sin(f * 0.04); });
  },
};

export const adn: HeroDef = {
  kind: "primitive",
  when: "ADN: doble hélice, genes, herencia, por qué nos parecemos a nuestros padres, mutaciones, código genético, cromosomas.",
  poses: ["helice"],
  center: [0, 1.3, 0], radius: 1.05,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.6, 0], base: [0, 0.05, 0], par: [0.2, 1.3, 0.55], hebra: [0.55, 1.9, 0] },
  build: (_L, pose) => {
    poseOf(adn, pose, "adn");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const A = glowMat(b, TONE.cyan, 0.5), T = glowMat(b, TONE.gold, 0.5), C = glowMat(b, TONE.green, 0.5), G = glowMat(b, TONE.glowRed, 0.5), back = glowMat(b, TONE.lavender, 0.3);
    const N = 26, H = 2.6, R = 0.5, turn = 0.62, pairs = [[A, T], [C, G], [T, A], [G, C]];
    const pts = (s: number) => Array.from({ length: N * 2 }, (_, i) => { const t = i / (N * 2 - 1), a = t * N * turn + s * Math.PI; return [Math.cos(a) * R, t * H, Math.sin(a) * R] as P3; });
    g.add(tube(b, pts(0), 0.055, back, 160), tube(b, pts(1), 0.055, back, 160));
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N, a = t * N * turn, y = t * H, [m1, m2] = pairs[i % 4], p1: P3 = [Math.cos(a) * R, y, Math.sin(a) * R], p2: P3 = [-Math.cos(a) * R, y, -Math.sin(a) * R], mid: P3 = [0, y, 0];
      g.add(rod(b, p1, mid, 0.04, m1), rod(b, mid, p2, 0.04, m2), place(ball(b, 0.09, m1, 12), p1), place(ball(b, 0.09, m2, 12), p2));
    }
    g.position.y = 0.0; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = f * 0.015; g.position.y = 0.04 * Math.sin(f * 0.04); });
  },
};

export const globulos: HeroDef = {
  kind: "primitive",
  when: "Glóbulos de la sangre: sangre, oxígeno, anemia, heridas y coágulos, defensas, por qué la sangre es roja, venas.",
  poses: ["flujo", "defensa"],
  center: [0, 1.2, 0], radius: 1.35,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.3, 0], base: [0, 0.2, 0], rojo: [0.5, 1.3, 0.2], blanco: [-0.6, 1.6, 0.3], vaso: [0, 1.2, -0.9] },
  build: (_L, pose) => {
    const p = poseOf(globulos, pose, "globulos"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const prof = [[0, 0.05], [0.12, 0.09], [0.24, 0.13], [0.34, 0.09], [0.37, 0], [0.34, -0.09], [0.24, -0.13], [0.12, -0.09], [0, -0.05]].map(([r, y]) => new THREE.Vector2(r, y));
    const geo = b.track(new THREE.LatheGeometry(prof, 28)), redM = glowMat(b, TONE.blood, 0.3, { roughness: 0.4 });
    const vessel = new THREE.Mesh(b.track(new THREE.CylinderGeometry(1.35, 1.35, 5, 36, 1, true)), ghostMat(b, col(TONE.glowRed, TONE.violet, 0.5), 0.22, { side: THREE.BackSide })); vessel.rotation.z = Math.PI / 2; vessel.position.y = 1.2;
    const reds = scatter(16, 5, (r) => [(r() - 0.5) * 5, 0.5 + r() * 1.4, (r() - 0.5) * 1.5] as P3).map((q, i) => ({ m: new THREE.Mesh(geo, redM), q, i }));
    reds.forEach(({ m }) => g.add(m));
    const white = p === "defensa" ? (() => { const w = blob(b, 0.5, 0.1, 4, glowMat(b, "#e8e1ff", 0.3, { roughness: 0.5 }), 3); const n = ball(b, 0.22, glowMat(b, TONE.violet, 0.4), 16); w.add(n); w.position.set(-0.4, 1.4, 0.3); g.add(w); return w; })() : null;
    const bad = p === "defensa" ? [0, 1, 2].map((i) => { const v = virusBody(b, 0.08); g.add(v); return { v, i }; }) : [];
    g.add(vessel); root.add(g); shadows(g);
    return done(root, b, (f) => {
      reds.forEach(({ m, q, i }) => { const x = ((q[0] + 2.5 + f * 0.018) % 5) - 2.5; m.position.set(x, q[1], q[2]); m.rotation.set(1.2 + 0.4 * Math.sin(f * 0.03 + i), f * 0.02 + i, 0.3 * i); });
      if (white) { white.position.set(-0.4 + 0.15 * Math.sin(f * 0.03), 1.4 + 0.08 * Math.sin(f * 0.05), 0.3); white.scale.setScalar(1 + 0.05 * Math.sin(f * 0.08)); }
      bad.forEach(({ v, i }) => { v.position.set(0.8 + 0.5 * i - 0.004 * ((f + i * 40) % 160), 1.0 + 0.3 * i + 0.1 * Math.sin(f * 0.05 + i), 0.3); v.rotation.y = f * 0.04; });
    });
  },
};

export const neurona: HeroDef = {
  kind: "primitive",
  when: "Neurona: cerebro, nervios, pensar, reflejos, dolor, cómo viaja una señal, sinapsis, por qué sentimos.",
  poses: ["reposo", "senal"],
  center: [0.4, 1.3, 0], radius: 1.3,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.4, 0], base: [0, 0.2, 0], soma: [-0.9, 1.3, 0], axon: [0.4, 1.3, 0], dendrita: [-1.2, 1.9, 0], sinapsis: [1.8, 1.4, 0] },
  build: (_L, pose) => {
    const p = poseOf(neurona, pose, "neurona"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const cell = glowMat(b, col(TONE.violet, TONE.lavender, 0.4), 0.25, { roughness: 0.45 }), pulse = glowMat(b, TONE.gold, 1.0);
    const soma = blob(b, 0.42, 0.08, 5, cell, 3); soma.position.set(-0.9, 1.3, 0);
    const nuc = place(ball(b, 0.15, glowMat(b, TONE.cyan, 0.6), 14), [-0.9, 1.3, 0.1]);
    const dend: THREE.Object3D[] = [];
    scatter(6, 2, (r, i) => [Math.cos((i / 6) * 4 + 1.9), Math.sin((i / 6) * 4 + 1.9), r()] as P3).forEach(([cx, cy, r], i) => {
      const s: P3 = [-0.9 + cx * 0.4, 1.3 + cy * 0.4, 0], m: P3 = [-0.9 + cx * 0.85, 1.3 + cy * 0.85 + 0.1, r * 0.2], e: P3 = [-0.9 + cx * 1.3, 1.3 + cy * 1.25, (r - 0.5) * 0.4];
      dend.push(tube(b, [s, m, e], 0.045, cell, 16), tube(b, [m, [m[0] + 0.2 * cy, m[1] - 0.2 * cx, 0.05], [e[0] + 0.3 * cy, e[1] - 0.3 * cx, 0.1]], 0.025, cell, 12));
    });
    const axonPts: P3[] = [[-0.5, 1.3, 0], [0.2, 1.4, 0], [0.9, 1.2, 0], [1.6, 1.3, 0]];
    const axon = tube(b, axonPts, 0.07, cell, 40);
    const myel = [0.0, 0.5, 1.0].map((x, i) => { const m = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.13, 0.3, 6, 12)), glowMat(b, TONE.bone, 0.2)); m.rotation.z = Math.PI / 2; m.position.set(-0.1 + x * 1.0, 1.32 - 0.05 * i, 0); return m; });
    const bouton = [0, 1, 2].map((i) => place(ball(b, 0.09, cell, 12), [1.65 + 0.12 * i, 1.3 + (i - 1) * 0.16, 0]));
    const spark = ball(b, 0.11, pulse, 12), curve = new THREE.CatmullRomCurve3(axonPts.map((q) => new THREE.Vector3(...q)));
    g.add(soma, nuc, ...dend, axon, ...myel, ...bouton, spark); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const t = p === "senal" ? (f * 0.011) % 1 : 0; spark.position.copy(curve.getPoint(t)); spark.visible = p === "senal"; spark.scale.setScalar(1 + 0.3 * Math.sin(f * 0.4));
      g.rotation.y = 0.35 * Math.sin(f * 0.01); soma.scale.setScalar(1 + 0.03 * Math.sin(f * 0.06));
    });
  },
};
