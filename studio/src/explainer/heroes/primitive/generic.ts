// Objetos de respaldo (F11) para conceptos abstractos sin objeto propio: mejor que repetir `persona` en todos los beats.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, glowMat, mat, place, scatter, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const esfera_flotante: HeroDef = {
  kind: "primitive",
  when: "Concepto abstracto sin objeto propio: una idea, una cantidad, 'el todo', un sistema o una causa que se explica con overlays; esfera luminosa con partículas en órbita.",
  poses: ["orbe", "pulso"],
  center: [0, 1.4, 0], radius: 1.0,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], nucleo: [0, 1.4, 0], orbita: [1.0, 1.4, 0] },
  build: (_L, pose) => {
    const p = poseOf(esfera_flotante, pose, "esfera_flotante"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const core = ball(b, 0.62, glowMat(b, col(TONE.cyan, TONE.violet, 0.35), 0.7, { transparent: true, opacity: 0.9, roughness: 0.2 }), 32);
    const shell = ball(b, 0.82, glowMat(b, TONE.lavender, 0.3, { transparent: true, opacity: 0.2, roughness: 0.1, depthWrite: false }), 32);
    const sat = scatter(14, 3, (r, i) => [0.95 + r() * 0.3, (i / 14) * 6.28, (r() - 0.5) * 1.5] as P3).map((q) => ({ s: ball(b, 0.04 + 0.02 * (q[0] - 0.95), beam(b, TONE.gold, 1.6), 8), q }));
    g.add(core, shell, ...sat.map((x) => x.s)); g.position.y = 1.4; root.add(g);
    return done(root, b, (f) => {
      const k = p === "pulso" ? 1 + 0.08 * Math.sin(f * 0.18) : 1 + 0.02 * Math.sin(f * 0.05); core.scale.setScalar(k);
      sat.forEach(({ s, q }, i) => { const a = q[1] + f * (0.02 + 0.004 * (i % 4)); s.position.set(Math.cos(a) * q[0], q[2] * 0.5, Math.sin(a) * q[0]); });
      g.rotation.z = 0.35; g.rotation.y = f * 0.004;
    });
  },
};

const SIGNS: Record<string, [string, string]> = { interrogante: ["?", TONE.cyan], exclamacion: ["!", TONE.glowRed] };

export const caja_etiquetada: HeroDef = {
  kind: "primitive",
  when: "Concepto abstracto sin objeto propio: una pregunta (?), un aviso (!) o 'el dato clave' sobre un cubo flotante con un símbolo grande; respaldo cuando ningún objeto del catálogo encaja.",
  poses: ["interrogante", "exclamacion"],
  center: [0, 1.4, 0], radius: 0.95,
  anchors: { hero: [0, 1.4, 0.2], top: [0, 2.4, 0], base: [0, 0.1, 0], cara: [0, 1.4, 0.65], arista: [0.65, 2.0, 0.65] },
  build: (_L, pose) => {
    const p = poseOf(caja_etiquetada, pose, "caja_etiquetada"), [ch, c] = p === "exclamacion" ? SIGNS.exclamacion : SIGNS.interrogante, b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 256, 256, (cv) => { cv.fillStyle = TONE.ink; cv.fillRect(0, 0, 256, 256); cv.strokeStyle = c; cv.lineWidth = 12; cv.strokeRect(10, 10, 236, 236); cv.fillStyle = c; cv.font = "800 190px Montserrat, sans-serif"; cv.textAlign = "center"; cv.textBaseline = "middle"; cv.fillText(ch, 128, 140); });
    const face = b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.7), roughness: 0.4 }));
    const cube = new THREE.Mesh(b.track(new THREE.BoxGeometry(1.2, 1.2, 1.2)), [face, face, face, face, face, face]); cube.position.y = 1.4; g.add(cube, place(box(b, 1.5, 0.04, 1.5, glowMat(b, c, 0.8, { transparent: true, opacity: 0.35 })), [0, 0.5, 0]));
    root.add(g); shadows(g);
    return done(root, b, (f) => { cube.rotation.set(0.25 * Math.sin(f * 0.02), f * 0.016, 0.1 * Math.sin(f * 0.03)); cube.position.y = 1.4 + 0.08 * Math.sin(f * 0.05); });
  },
};

export const diagrama_flujo: HeroDef = {
  kind: "primitive",
  when: "Un proceso o relación abstracta: causa → efecto → resultado, tres pasos conectados por flechas en 3D; respaldo para explicar cadenas de ideas sin un objeto físico.",
  poses: ["tres"],
  center: [0, 1.3, 0], radius: 1.45,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.2, 0], base: [0, 0.1, 0], inicio: [-1.5, 1.3, 0], medio: [0, 1.3, 0], final: [1.5, 1.3, 0] },
  build: (_L, pose) => {
    poseOf(diagrama_flujo, pose, "diagrama_flujo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const cols = [TONE.cyan, TONE.gold, TONE.green], nodes = cols.map((c, i) => { const n = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.8, 0.8, 0.8)), glowMat(b, c, 0.5, { roughness: 0.3 })); n.position.set((i - 1) * 1.55, 1.3, 0); g.add(n); return n; });
    const flow = [0, 1].map((i) => { const a = (i - 1) * 1.55 + 0.55, c = (i - 0) * 1.55 - 1.55 + 1.55 - 0.55; const rodM = beam(b, "#ffffff", 1.4); const r = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.03, 0.03, c - a, 8)), rodM); r.rotation.z = Math.PI / 2; r.position.set((a + c) / 2, 1.3, 0); const head = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.1, 0.25, 12)), rodM); head.rotation.z = -Math.PI / 2; head.position.set(c, 1.3, 0); g.add(r, head); const dot = ball(b, 0.06, beam(b, "#ffffff", 2), 8); g.add(dot); return { dot, a, c }; });
    root.add(g); shadows(g);
    return done(root, b, (f) => { nodes.forEach((n, i) => { n.rotation.set(0.2 * Math.sin(f * 0.03 + i), f * 0.012 + i, 0); n.position.y = 1.3 + 0.06 * Math.sin(f * 0.05 + i); n.scale.setScalar(1 + 0.08 * Math.max(0, Math.sin(f * 0.06 - i * 1.5))); }); flow.forEach(({ dot, a, c }, i) => { const t = (f * 0.02 + i * 0.3) % 1; dot.position.set(a + (c - a) * t, 1.3, 0); }); g.rotation.y = 0.3 * Math.sin(f * 0.01); });
  },
};

