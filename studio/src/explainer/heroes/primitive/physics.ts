// Pack E · Física (F11): péndulo, onda, prisma de luz, imán con campo, circuito simple y pozo de gravedad.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, ghostMat, glowMat, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const pendulo: HeroDef = {
  kind: "primitive",
  when: "Péndulo y movimiento: oscilación, periodo, relojes, energía que pasa de potencial a cinética, hipnosis, la cuna de Newton.",
  poses: ["oscila", "cuna"],
  center: [0, 1.5, 0], radius: 1.5,
  anchors: { hero: [0, 1.5, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], bola: [0, 0.7, 0], pivote: [0, 3.0, 0] },
  build: (_L, pose) => {
    const p = poseOf(pendulo, pose, "pendulo"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const metal = mat(b, "#aeb8d6", { metalness: 0.85, roughness: 0.25 }), gold = glowMat(b, TONE.gold, 0.25, { metalness: 0.6, roughness: 0.3 });
    const frame = [box(b, 3.0, 0.1, 0.5, metal), place(box(b, 0.1, 3.0, 0.5, metal), [-1.45, -1.45, 0]), place(box(b, 0.1, 3.0, 0.5, metal), [1.45, -1.45, 0])];
    frame[0].position.y = 3.05; frame[1].position.y = 1.55; frame[2].position.y = 1.55;
    const n = p === "cuna" ? 5 : 1, bobs = Array.from({ length: n }, (_, i) => { const pv = new THREE.Group(), x = n === 1 ? 0 : (i - 2) * 0.43; pv.position.set(x, 3.0, 0); const s = rod(b, [0, 0, 0], [0, -2.2, 0], 0.012, metal), ball_ = place(ball(b, n === 1 ? 0.32 : 0.21, gold, 28), [0, -2.3, 0]); pv.add(s, ball_); g.add(pv); return pv; });
    g.add(...frame); root.add(g); shadows(g);
    return done(root, b, (f) => {
      if (n === 1) bobs[0].rotation.z = 0.7 * Math.sin(f * 0.07);
      else { const a = Math.sin(f * 0.1); bobs[0].rotation.z = -0.6 * Math.max(0, a); bobs[4].rotation.z = 0.6 * Math.max(0, -a); }
      g.rotation.y = 0.35 * Math.sin(f * 0.01);
    });
  },
};

export const onda: HeroDef = {
  kind: "primitive",
  when: "Ondas: sonido, luz, olas, frecuencia y longitud de onda, eco, por qué se oye distinto, ondas de radio, el efecto Doppler.",
  poses: ["transversal", "sonido"],
  center: [0, 1.3, 0], radius: 1.75,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.4, 0], base: [0, 0.2, 0], cresta: [-0.6, 1.9, 0], valle: [0.6, 0.7, 0], fuente: [-2.0, 1.3, 0] },
  build: (_L, pose) => {
    const p = poseOf(onda, pose, "onda"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const N = 56, dots = Array.from({ length: N }, (_, i) => ball(b, 0.065, glowMat(b, col(TONE.cyan, TONE.gold, i / N), 0.9), 10));
    const rings = Array.from({ length: 5 }, () => new THREE.Mesh(b.track(new THREE.TorusGeometry(1, 0.025, 8, 64)), beam(b, TONE.cyan, 1.4, { transparent: true, opacity: 0.8 })));
    if (p === "sonido") rings.forEach((r) => g.add(r)); else dots.forEach((d) => g.add(d));
    const src = place(ball(b, 0.22, glowMat(b, TONE.gold, 0.8), 16), [-2.1, 1.3, 0]); if (p === "sonido") { src.position.x = -1.5; g.add(src); }
    root.add(g);
    return done(root, b, (f) => {
      dots.forEach((d, i) => { const x = -2.1 + (i / (N - 1)) * 4.2; d.position.set(x, 1.3 + 0.6 * Math.sin(x * 2.4 - f * 0.09) * Math.min(1, (x + 2.1) * 1.5), 0); d.scale.setScalar(1 + 0.2 * Math.sin(x * 2.4 - f * 0.09)); });
      rings.forEach((r, i) => { const u = ((f * 0.012 + i / 5) % 1); r.position.set(-1.5 + u * 0.3, 1.3, 0); r.scale.setScalar(0.1 + u * 1.9); r.rotation.y = Math.PI / 2; (r.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - u); });
      g.rotation.y = 0.5 + 0.25 * Math.sin(f * 0.01);
    });
  },
};

export const prisma_luz: HeroDef = {
  kind: "primitive",
  when: "Luz y color: prisma, arcoíris, por qué el cielo es azul, refracción, espectro, por qué vemos colores, luz blanca.",
  poses: ["prisma"],
  center: [0, 1.2, 0], radius: 1.6,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.4, 0], base: [0, 0.1, 0], entrada: [-1.6, 1.2, 0], salida: [1.7, 1.2, 0], prisma: [0, 1.2, 0] },
  build: (_L, pose) => {
    poseOf(prisma_luz, pose, "prisma_luz");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const sh = new THREE.Shape(); sh.moveTo(-0.8, 0); sh.lineTo(0.8, 0); sh.lineTo(0, 1.4); sh.lineTo(-0.8, 0);
    const prism = new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false })), ghostMat(b, "#cfe7ff", 0.35, { roughness: 0.05, emissive: col("#9fd0ff").multiplyScalar(0.15) })); prism.position.set(0, 0.5, -0.5);
    const edge = new THREE.LineSegments(b.track(new THREE.EdgesGeometry(prism.geometry)), b.track(new THREE.LineBasicMaterial({ color: "#e8f6ff" }))); edge.position.copy(prism.position);
    const white = rod(b, [-2.4, 1.05, 0], [-0.3, 1.2, 0], 0.045, beam(b, "#ffffff", 2));
    const cols = ["#ff4d4d", "#ff9a3a", "#ffe14a", "#4cd97b", "#4ab6ff", "#6b6bff", "#b36bff"];
    const rays = cols.map((c, i) => rod(b, [0.4, 1.12, 0], [2.4, 1.3 - 0.05 + (i - 3) * 0.17 - 0.1, 0], 0.035, beam(b, c, 1.7)));
    g.add(prism, edge, white, ...rays); g.position.y = 0; root.add(g);
    return done(root, b, (f) => { g.rotation.y = 0.3 * Math.sin(f * 0.01); rays.forEach((r, i) => { r.scale.x = 1 + 0.08 * Math.sin(f * 0.08 + i); }); });
  },
};

export const iman_campo: HeroDef = {
  kind: "primitive",
  when: "Imán y magnetismo: polos norte y sur, campo magnético, brújula, por qué los imanes se atraen o repelen, la Tierra como imán, electricidad y magnetismo.",
  poses: ["campo", "atrae"],
  center: [0, 1.3, 0], radius: 1.7,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], polo_norte: [-0.9, 1.3, 0.2], polo_sur: [0.9, 1.3, 0.2], linea: [0, 2.3, 0] },
  build: (_L, pose) => {
    const p = poseOf(iman_campo, pose, "iman_campo"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const red = mat(b, "#d9444e", { roughness: 0.4 }), blue = mat(b, "#4a78e8", { roughness: 0.4 });
    const bar = new THREE.Group(); bar.add(place(box(b, 0.9, 0.5, 0.5, red), [-0.45, 0, 0]), place(box(b, 0.9, 0.5, 0.5, blue), [0.45, 0, 0])); bar.position.set(0, 1.3, 0);
    const lines: THREE.Object3D[] = [];
    for (let k = 1; k <= 4; k++) for (const s of [1, -1]) {
      const a = 0.5 + k * 0.45, pts: P3[] = Array.from({ length: 41 }, (_, i) => { const t = (i / 40) * Math.PI; return [-Math.cos(t) * a * 1.15, 1.3 + s * Math.sin(t) * a * 0.62 * (1 + 0.05 * k), 0] as P3; });
      lines.push(tube(b, pts, 0.014, beam(b, TONE.cyan, 1.4, { transparent: true, opacity: 0.7 }), 60));
    }
    const filings = scatter(p === "campo" ? 70 : 0, 5, (r) => { const a = r() * Math.PI, rad = 0.6 + r() * 1.5; return [-Math.cos(a) * rad * 1.15, 1.3 + (r() > 0.5 ? 1 : -1) * Math.sin(a) * rad * 0.6, (r() - 0.5) * 0.3] as P3; }).map((q) => place(box(b, 0.1, 0.012, 0.012, glowMat(b, "#cfd6ea", 0.4)), q));
    const second = p === "atrae" ? (() => { const m = new THREE.Group(); m.add(place(box(b, 0.9, 0.5, 0.5, blue), [-0.45, 0, 0]), place(box(b, 0.9, 0.5, 0.5, red), [0.45, 0, 0])); m.position.set(2.6, 1.3, 0); return m; })() : null;
    g.add(bar, ...lines, ...filings); if (second) g.add(second); root.add(g); shadows(g);
    return done(root, b, (f) => {
      g.rotation.y = 0.35 * Math.sin(f * 0.012);
      lines.forEach((l, i) => { l.scale.y = 1 + 0.03 * Math.sin(f * 0.06 + i); });
      filings.forEach((q, i) => { q.rotation.z = Math.atan2(q.position.y - 1.3, q.position.x) + Math.PI / 2 + 0.1 * Math.sin(f * 0.05 + i); });
      if (second) second.position.x = 2.0 - 0.5 * (0.5 + 0.5 * Math.sin(f * 0.04)); 
    });
  },
};

export const circuito: HeroDef = {
  kind: "primitive",
  when: "Electricidad: circuito, pila, bombilla, corriente, voltaje, por qué se funde un fusible, cómo funciona un interruptor, la electricidad en casa.",
  poses: ["encendido", "apagado"],
  center: [0, 1.3, 0], radius: 1.7,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], bombilla: [0, 2.15, 0], pila: [-1.4, 1.2, 0], cable: [1.2, 0.6, 0], interruptor: [0.9, 0.35, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(circuito, pose, "circuito"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), on = p === "encendido";
    const wire = mat(b, "#e0b070", { metalness: 0.8, roughness: 0.3 }), path: P3[] = [[-1.4, 0.5, 0], [1.4, 0.5, 0], [1.4, 1.9, 0], [0.45, 1.9, 0]], path2: P3[] = [[-0.45, 1.9, 0], [-1.4, 1.9, 0], [-1.4, 0.9, 0]];
    g.add(tube(b, path, 0.04, wire, 40), tube(b, path2, 0.04, wire, 40));
    const batt = new THREE.Group(); batt.add(cyl(b, 0.22, 0.22, 0.7, mat(b, "#4a78e8", { roughness: 0.4 }), 24), place(cyl(b, 0.1, 0.1, 0.12, mat(b, "#d0d0d8", { metalness: 0.8 }), 16), [0, 0.4, 0])); batt.position.set(-1.4, 0.45, 0);
    const bulbM = on ? glowMat(b, "#ffe9a0", 1, { transparent: true, opacity: 0.92, roughness: 0.2 }) : ghostMat(b, "#dfe8ff", 0.35);
    const glass = ball(b, 0.38, bulbM, 28); glass.position.set(0, 2.15, 0);
    const base = cyl(b, 0.16, 0.16, 0.25, mat(b, "#9aa3bd", { metalness: 0.7 }), 16); base.position.set(0, 1.78, 0);
    const fil = tube(b, [[-0.1, 1.85, 0], [-0.1, 2.05, 0], [0, 2.1, 0], [0.1, 2.05, 0], [0.1, 1.85, 0]], 0.015, on ? beam(b, "#fff6d0", 2) : mat(b, "#555a70"), 20);
    const sw = new THREE.Group(); sw.add(place(ball(b, 0.06, wire, 10), [-0.35, 0, 0]), place(ball(b, 0.06, wire, 10), [0.35, 0, 0]), rod(b, [-0.35, 0, 0], on ? [0.35, 0, 0] : [0.3, 0.3, 0], 0.025, wire)); sw.position.set(0.9, 0.5, 0);
    const glowL = on ? place(new THREE.Mesh(b.track(new THREE.SphereGeometry(1, 24, 16)), b.track(new THREE.MeshBasicMaterial({ color: "#ffd980", transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }))), [0, 2.15, 0], 0.9) : null;
    const e = on ? scatter(12, 3, (_r, i) => [i / 12, 0, 0] as P3).map(() => ball(b, 0.05, beam(b, TONE.cyan, 1.8), 8)) : [];
    g.add(batt, glass, base, fil, sw, ...e); if (glowL) g.add(glowL); root.add(g); shadows(g);
    const curve = new THREE.CatmullRomCurve3([[-1.4, 0.9, 0], [-1.4, 0.5, 0], [1.4, 0.5, 0], [1.4, 1.9, 0], [0.45, 1.9, 0], [-0.45, 1.9, 0], [-1.4, 1.9, 0], [-1.4, 0.9, 0]].map((q) => new THREE.Vector3(...(q as P3))), false, "catmullrom", 0.05);
    return done(root, b, (f) => {
      e.forEach((s, i) => s.position.copy(curve.getPoint(((f * 0.006 + i / 12) % 1)))); if (glowL) glowL.scale.setScalar(0.85 + 0.08 * Math.sin(f * 0.3)); g.rotation.y = 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const gravedad_pozo: HeroDef = {
  kind: "primitive",
  when: "Gravedad y espacio-tiempo: masa que curva el espacio, órbitas, por qué caen las cosas, relatividad, por qué la Luna no cae, peso.",
  poses: ["pozo"],
  center: [0, 0.9, 0], radius: 1.9,
  anchors: { hero: [0, 0.9, 0], top: [0, 2.2, 0], base: [0, 0.05, 0], masa: [0, 0.3, 0], orbita: [1.5, 0.9, 0.6], malla: [-1.7, 1.2, 0] },
  build: (_L, pose) => {
    poseOf(gravedad_pozo, pose, "gravedad_pozo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const N = 22, S = 4.4, depth = (x: number, z: number) => 1.6 / (0.6 + Math.hypot(x, z) * 1.1);
    const lines = new THREE.Group(), lm = beam(b, TONE.cyan, 1.2, { transparent: true, opacity: 0.8 });
    for (let k = 0; k <= N; k += 2) for (const dir of [0, 1]) {
      const pts: P3[] = Array.from({ length: 60 }, (_, i) => { const u = -S / 2 + (i / 59) * S, v = -S / 2 + (k / N) * S, x = dir ? v : u, z = dir ? u : v; return [x, 1.7 - depth(x, z), z] as P3; });
      lines.add(tube(b, pts, 0.014, lm, 80));
    }
    const mass = ball(b, 0.4, glowMat(b, TONE.gold, 0.5), 32); mass.position.y = 1.7 - depth(0, 0) + 0.38;
    const sat = ball(b, 0.14, glowMat(b, TONE.cyan, 0.8), 16);
    g.add(lines, mass, sat); g.rotation.x = 0.0; root.add(g);
    return done(root, b, (f) => { const a = f * 0.03, r = 1.5; sat.position.set(Math.cos(a) * r, 1.7 - depth(Math.cos(a) * r, Math.sin(a) * r) + 0.15, Math.sin(a) * r); g.rotation.y = 0.2 * Math.sin(f * 0.008); });
  },
};
