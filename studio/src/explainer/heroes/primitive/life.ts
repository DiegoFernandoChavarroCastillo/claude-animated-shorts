// Pack H · Vida (F11): planta con fotosíntesis, semilla que germina, abeja, ave, pez y tronco con anillos. Formas
// simples y redondeadas; cada uno lleva un movimiento propio (aleteo, partículas, brote).
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, cyl, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];
const leaf = (b: Bin, m: THREE.Material, s = 1) => { const l = ball(b, 0.5 * s, m, 20); l.scale.set(1, 0.07, 0.55); return l; };

export const planta_fotosintesis: HeroDef = {
  kind: "primitive",
  when: "Plantas y fotosíntesis: luz del sol, dióxido de carbono, oxígeno, por qué las hojas son verdes, cómo crecen las plantas, por qué las hojas cambian de color en otoño.",
  poses: ["luz", "noche"],
  center: [0, 1.5, 0], radius: 1.25,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], hoja: [0.8, 2.0, 0.2], sol: [-1.7, 3.0, 0], raiz: [0, 0.1, 0], maceta: [0, 0.4, 0.5] },
  build: (_L, pose) => {
    const p = poseOf(planta_fotosintesis, pose, "planta_fotosintesis"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), day = p === "luz";
    const pot = cyl(b, 0.6, 0.45, 0.7, mat(b, "#c0694a", { roughness: 0.7 }), 28); pot.position.y = 0.35;
    const soil = cyl(b, 0.55, 0.55, 0.06, mat(b, "#4a3326", { roughness: 1 }), 24); soil.position.y = 0.7;
    const stem = tube(b, [[0, 0.7, 0], [0.05, 1.4, 0], [-0.05, 2.1, 0], [0, 2.6, 0]], 0.06, mat(b, "#3d8a5a"), 24);
    const lm = glowMat(b, day ? "#4fd46f" : "#2f7a4a", 0.25, { roughness: 0.6, side: THREE.DoubleSide });
    const leaves = [[0.5, 1.4, 0.4, 0.3], [-0.5, 1.75, -0.5, -0.3], [0.55, 2.15, 0.4, 0.2], [-0.5, 2.5, -0.6, -0.2], [0.1, 2.75, 0, 0]].map(([x, y, z, r], i) => { const l = leaf(b, lm, 1.2); const a = new THREE.Group(); l.position.x = (x as number) > 0 ? 0.55 : -0.55; a.add(l); a.position.set(0, y as number, 0); a.rotation.set(0, (i * 1.3) as number, (r as number) * 0.8); return { a, i }; });
    const sun = day ? new THREE.Group() : null;
    if (sun) { sun.add(ball(b, 0.3, beam(b, "#ffe08a", 1.5), 18), place(halo(b, "rgba(255,210,100,0.9)", 2.2, 0.8), [0, 0, -0.1])); sun.position.set(-1.7, 3.0, 0); g.add(sun); }
    const ray = day ? [0, 1, 2].map((i) => ({ r: rod(b, [-1.4, 2.8 - i * 0.1, 0], [-0.4, 2.2 + i * 0.25, 0.1], 0.025, beam(b, "#ffe08a", 1.4, { transparent: true, opacity: 0.6 })), i })) : [];
    const co2 = scatter(7, 4, (r) => [1.2 + r() * 0.5, 1.5 + r() * 1.5, (r() - 0.5) * 0.6] as P3).map((q) => ({ s: ball(b, 0.07, beam(b, "#d7e8ff", 1.2, { transparent: true, opacity: 0.8 }), 8), q }));
    const o2 = scatter(day ? 7 : 0, 8, (r) => [-0.6 + r() * 0.3, 1.5 + r() * 1.5, (r() - 0.5) * 0.6] as P3).map((q) => ({ s: ball(b, 0.07, beam(b, TONE.cyan, 1.6), 8), q }));
    g.add(pot, soil, stem, ...leaves.map((x) => x.a), ...ray.map((x) => x.r), ...co2.map((x) => x.s), ...o2.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => {
      leaves.forEach(({ a, i }) => { a.rotation.y = i * 1.3 + 0.12 * Math.sin(f * 0.03 + i); });
      co2.forEach(({ s, q }, i) => { const t = (f * 0.012 + i / 7) % 1; s.position.set(q[0] - t * 1.0, q[1] - 0.2 * t, q[2]); (s.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI); });
      o2.forEach(({ s, q }, i) => { const t = (f * 0.012 + i / 7) % 1; s.position.set(q[0] - t * 0.9, q[1] + 0.2 * t, q[2]); });
      ray.forEach(({ r }, i) => { r.scale.x = 1 + 0.05 * Math.sin(f * 0.1 + i); }); if (sun) sun.scale.setScalar(1 + 0.04 * Math.sin(f * 0.06));
      g.rotation.y = 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const semilla_germina: HeroDef = {
  kind: "primitive",
  when: "Semillas y crecimiento: cómo germina una semilla, raíces, brote, por qué crece hacia la luz, agua y suelo, de dónde sale un árbol.",
  poses: ["semilla", "brote", "planta"],
  center: [0, 0.9, 0], radius: 1.5,
  anchors: { hero: [0, 0.9, 0.5], top: [0, 2.0, 0], base: [0, 0.05, 0], semilla: [0, 0.6, 0.76], raiz: [0, 0.2, 0.76], brote: [0, 1.4, 0.2], suelo: [0.8, 0.8, 0.76] },
  build: (_L, pose) => {
    const p = poseOf(semilla_germina, pose, "semilla_germina"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const soil = box(b, 2.4, 1.3, 1.5, mat(b, "#5a3f2e", { roughness: 1 })); soil.position.y = 0.65;
    const top = box(b, 2.4, 0.1, 1.5, mat(b, "#6a8a4a", { roughness: 0.9 })); top.position.y = 1.3;
    const grain = scatter(40, 7, (r) => [(r() - 0.5) * 2.2, 0.1 + r() * 1.1, 0.76] as P3).map((q) => place(ball(b, 0.035 + 0.02 * q[1], mat(b, "#7a5a44", { roughness: 1 }), 6), q));
    const seed = blob(b, 0.2, 0.08, 3, glowMat(b, "#c9944a", 0.3), 3); seed.scale.set(1, 0.7, 0.7); seed.position.set(0, p === "semilla" ? 0.8 : 0.7, 0.76);
    const grow = p === "semilla" ? 0 : p === "brote" ? 0.5 : 1;
    const rootTubes = grow ? [tube(b, [[0, 0.68, 0.76], [0.02, 0.45, 0.76], [-0.05, 0.15 - 0.1 * grow, 0.76]], 0.035, glowMat(b, "#f0e2b0", 0.3), 20), tube(b, [[0, 0.5, 0.76], [0.3, 0.38, 0.76], [0.5, 0.25 - 0.1 * grow, 0.76]], 0.02, glowMat(b, "#f0e2b0", 0.3), 16)] : [];
    const sprout = grow ? tube(b, [[0, 0.72, 0.76], [0.02, 1.3, 0.76], [0.03, 1.3 + 0.7 * grow, 0.7]], 0.04 + 0.01 * grow, glowMat(b, "#6adf7a", 0.3), 24) : null;
    const leaves = grow ? [-1, 1].map((s) => { const l = leaf(b, glowMat(b, "#4fd46f", 0.25, { side: THREE.DoubleSide }), 0.5 + 0.5 * grow); l.position.set(0.03 + s * 0.28 * (0.6 + 0.4 * grow), 1.3 + 0.7 * grow, 0.7); l.rotation.z = s * 0.4; return l; }) : [];
    const drops = [0, 1, 2].map((i) => ({ s: ball(b, 0.05, glowMat(b, TONE.cyan, 0.8, { transparent: true, opacity: 0.85 }), 8), i }));
    g.add(soil, top, ...grain, seed, ...rootTubes, ...(sprout ? [sprout] : []), ...leaves, ...drops.map((d) => d.s));
    g.rotation.y = 0.2; root.add(g); shadows(g);
    return done(root, b, (f) => {
      drops.forEach(({ s, i }) => { const t = (f * 0.012 + i / 3) % 1; s.position.set(-0.4 + i * 0.35, 2.4 - t * 1.4, 0.76); s.visible = t < 0.9; });
      leaves.forEach((l, i) => { l.rotation.z = (i ? 1 : -1) * (0.4 + 0.08 * Math.sin(f * 0.05)); });
      seed.scale.setScalar(1 + 0.04 * Math.sin(f * 0.1)); g.rotation.y = 0.2 + 0.2 * Math.sin(f * 0.01);
    });
  },
};

export const abeja: HeroDef = {
  kind: "primitive",
  when: "Abejas e insectos: cómo vuelan, polinización, miel, el zumbido, por qué pican, colmenas, cómo ven los insectos, hormigas y avispas.",
  poses: ["vuelo"],
  center: [0, 1.5, 0], radius: 1.1,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], ala: [-0.4, 1.9, -0.3], aguijon: [0, 1.2, -0.9], ojo: [0.1, 1.55, 0.7], polen: [0, 0.7, 0.3] },
  build: (_L, pose) => {
    poseOf(abeja, pose, "abeja");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), bee = new THREE.Group();
    const yellow = glowMat(b, "#ffc93a", 0.25, { roughness: 0.5 }), black = mat(b, "#1b1b2a", { roughness: 0.6 });
    const thorax = blob(b, 0.4, 0.03, 2, yellow, 3); thorax.position.set(0, 0, 0.25); thorax.scale.set(1, 0.95, 1.1);
    const abd = new THREE.Group(); abd.position.set(0, -0.05, -0.35);
    [0, 1, 2, 3].forEach((i) => { const m = ball(b, 0.38 - i * 0.05, i % 2 ? black : yellow, 20); m.position.z = -i * 0.28; m.scale.set(1, 0.9, 0.9); abd.add(m); });
    const sting = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.05, 0.25, 8)), black); sting.rotation.x = -Math.PI / 2; sting.position.z = -1.05; abd.add(sting);
    const head = ball(b, 0.27, black, 18); head.position.set(0, 0, 0.78); const eyes = [-1, 1].map((s) => place(ball(b, 0.1, glowMat(b, "#ffffff", 0.5), 10), [s * 0.17, 0.07, 0.95]));
    const ant = [-1, 1].map((s) => tube(b, [[s * 0.1, 0.2, 1.0], [s * 0.22, 0.4, 1.2], [s * 0.3, 0.45, 1.3]], 0.015, black, 8));
    const wm = ghostMat2(b); const wings = [-1, 1].map((s) => { const w = ball(b, 0.5, wm, 16); w.scale.set(0.9, 0.04, 0.35); const a = new THREE.Group(); w.position.x = s * 0.5; a.add(w); a.position.set(0, 0.3, 0.2); return { a, s }; });
    const legs = [0, 1, 2].flatMap((i) => [-1, 1].map((s) => rod(b, [s * 0.15, -0.3, 0.1 + i * 0.2], [s * 0.35, -0.65, 0.05 + i * 0.25], 0.018, black)));
    bee.add(thorax, abd, head, ...eyes, ...ant, ...wings.map((w) => w.a), ...legs); bee.position.y = 1.5; g.add(bee); root.add(g); shadows(g);
    return done(root, b, (f) => {
      wings.forEach(({ a, s }) => { a.rotation.z = s * 0.5 * Math.sin(f * 1.4); });
      bee.position.y = 1.5 + 0.08 * Math.sin(f * 0.07); bee.rotation.set(0.12 * Math.sin(f * 0.05), 0.9 + 0.5 * Math.sin(f * 0.012), 0.05 * Math.sin(f * 0.06));
    });
  },
};
const ghostMat2 = (b: Bin) => glowMat(b, "#dfeaff", 0.3, { transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });

export const ave_vuelo: HeroDef = {
  kind: "primitive",
  when: "Aves y vuelo: cómo vuelan los pájaros, migración, plumas, alas, por qué los pájaros cantan, buhos, aerodinámica, cómo duermen las aves.",
  poses: ["vuelo", "planeo"],
  center: [0, 1.5, 0], radius: 1.7,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], ala: [1.0, 1.7, 0], pico: [0, 1.5, 1.0], cola: [0, 1.4, -0.9] },
  build: (_L, pose) => {
    const p = poseOf(ave_vuelo, pose, "ave_vuelo"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), bird = new THREE.Group();
    const body = glowMat(b, "#5b8de8", 0.25, { roughness: 0.55 }), belly = glowMat(b, "#f1ecdc", 0.25, { roughness: 0.6 }), beak = glowMat(b, "#ffb02e", 0.4);
    const torso = ball(b, 0.4, body, 24); torso.scale.set(0.8, 0.8, 1.5); const chest = place(ball(b, 0.34, belly, 20), [0, -0.12, 0.1]); chest.scale.set(0.85, 0.7, 1.3);
    const head = place(ball(b, 0.24, body, 20), [0, 0.14, 0.62]), bk = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.08, 0.28, 10)), beak); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.1, 0.9);
    const eye = [-1, 1].map((s) => place(ball(b, 0.045, mat(b, "#1b1b2a"), 8), [s * 0.14, 0.2, 0.78]));
    const tail = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.4, 0.04, 0.7)), body); tail.position.set(0, 0.02, -0.85); tail.rotation.x = 0.15;
    const wingGeo = (s: number) => { const sh = new THREE.Shape(); sh.moveTo(0, 0.25); sh.quadraticCurveTo(s * 0.9, 0.5, s * 1.7, -0.1); sh.quadraticCurveTo(s * 1.2, -0.2, s * 0.9, -0.6); sh.quadraticCurveTo(s * 0.4, -0.5, 0, -0.45); return b.track(new THREE.ShapeGeometry(sh, 12)); };
    const wings = [-1, 1].map((s) => { const w = new THREE.Mesh(wingGeo(s), glowMat(b, "#4a78d8", 0.3, { side: THREE.DoubleSide })); w.rotation.x = -Math.PI / 2; const a = new THREE.Group(); a.add(w); a.position.set(0, 0.12, 0.05); return { a, s }; });
    bird.add(torso, chest, head, bk, ...eye, tail, ...wings.map((w) => w.a)); bird.position.y = 1.5; g.add(bird); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const flap = p === "vuelo" ? 0.55 * Math.sin(f * 0.22) : 0.08 * Math.sin(f * 0.05); wings.forEach(({ a, s }) => { a.rotation.z = -s * flap; });
      bird.position.y = 1.5 + 0.12 * Math.sin(f * 0.11) * (p === "vuelo" ? 1 : 0.3); bird.rotation.set(-0.08 + 0.05 * Math.sin(f * 0.07), 0.8 + 0.35 * Math.sin(f * 0.012), 0.1 * Math.sin(f * 0.05));
    });
  },
};

export const pez: HeroDef = {
  kind: "primitive",
  when: "Peces y vida marina: cómo respiran bajo el agua, branquias, cardúmenes, por qué los peces no se ahogan, aletas, profundidades, peces que brillan.",
  poses: ["nada"],
  center: [0, 1.4, 0], radius: 1.5,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.3, 0], base: [0, 0.1, 0], branquia: [0.45, 1.35, 0.4], cola: [-1.3, 1.4, 0], aleta: [0, 1.9, 0.1], ojo: [0.8, 1.5, 0.35] },
  build: (_L, pose) => {
    poseOf(pez, pose, "pez");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), fish = new THREE.Group();
    const skin = glowMat(b, "#ff9a3a", 0.3, { roughness: 0.4 }), fin = glowMat(b, "#ffb870", 0.3, { roughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }), white = glowMat(b, "#fff6e8", 0.3);
    const body = ball(b, 0.7, skin, 32); body.scale.set(1.5, 0.85, 0.55);
    const stripes = [-0.1, 0.35].map((x) => { const s = ball(b, 0.7, white, 24); s.scale.set(0.1, 0.84, 0.56); s.position.x = x; return s; });
    const eye = place(ball(b, 0.11, mat(b, "#10101c"), 12), [0.65, 0.12, 0.28]), eyeW = place(ball(b, 0.16, white, 12), [0.65, 0.12, 0.25]);
    const tail = new THREE.Group(); const ts = new THREE.Shape(); ts.moveTo(0, 0); ts.lineTo(-0.7, 0.6); ts.quadraticCurveTo(-0.5, 0, -0.7, -0.6); ts.lineTo(0, 0); const tm = new THREE.Mesh(b.track(new THREE.ShapeGeometry(ts)), fin); tail.add(tm); tail.position.x = -1.0;
    const dorsal = new THREE.Mesh(b.track(new THREE.ShapeGeometry((() => { const d = new THREE.Shape(); d.moveTo(-0.5, 0); d.quadraticCurveTo(-0.1, 0.7, 0.4, 0); d.lineTo(-0.5, 0); return d; })())), fin); dorsal.position.set(0, 0.5, 0);
    const gill = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.28, 0.02, 6, 20, 2.4)), mat(b, "#a8541a")); gill.position.set(0.4, 0, 0.3); gill.rotation.set(0, 0.2, 2);
    const bubbles = scatter(6, 3, (r) => [0.9 + r() * 0.2, r(), (r() - 0.5) * 0.3] as P3).map((q) => ({ s: ball(b, 0.05, beam(b, "#e8fbff", 1.2, { transparent: true, opacity: 0.7 }), 8), q }));
    fish.add(body, ...stripes, eye, eyeW, tail, dorsal, gill); fish.position.y = 1.4; g.add(fish, ...bubbles.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => {
      tail.rotation.y = 0.5 * Math.sin(f * 0.2); body.rotation.y = 0.06 * Math.sin(f * 0.2 + 1); fish.position.y = 1.4 + 0.06 * Math.sin(f * 0.05); fish.rotation.y = 0.5 + 0.3 * Math.sin(f * 0.012);
      bubbles.forEach(({ s, q }, i) => { const t = (f * 0.012 + i / 6) % 1; s.position.set(q[0] + 0.3 * Math.cos(0.5), 1.6 + t * 1.2, q[2]); (s.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t); });
    });
  },
};

export const arbol_anillos: HeroDef = {
  kind: "primitive",
  when: "Árboles: anillos del tronco y la edad, cómo crecen, madera, corteza, sequías que dejan huella, bosques, cómo se sabe cuántos años tiene un árbol.",
  poses: ["corte"],
  center: [0, 1.0, 0], radius: 1.15,
  anchors: { hero: [0, 1.0, 0.45], top: [0, 2.2, 0], base: [0, 0.05, 0], centro: [0, 1.0, 0.46], anillo: [0.5, 1.0, 0.46], corteza: [1.2, 1.0, 0.3] },
  build: (_L, pose) => {
    poseOf(arbol_anillos, pose, "arbol_anillos");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 1024, 1024, (c) => {
      c.translate(512, 512); c.fillStyle = "#b9824a"; c.beginPath(); c.arc(0, 0, 500, 0, 6.3); c.fill();
      let r = 20; for (let i = 0; i < 22; i++) { r += 14 + ((i * 37) % 17) + (i === 11 || i === 12 ? -8 : 0); c.strokeStyle = `rgba(90,50,25,${0.35 + 0.25 * ((i * 13) % 5) / 5})`; c.lineWidth = 3 + ((i * 7) % 4); c.beginPath(); c.arc(((i % 3) - 1) * 2, ((i % 2) - 0.5) * 3, r, 0, 6.3); c.stroke(); }
      c.strokeStyle = "rgba(60,30,15,0.5)"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(300, 30); c.stroke();
      c.fillStyle = "#e8c690"; c.beginPath(); c.arc(0, 0, 14, 0, 6.3); c.fill();
      c.strokeStyle = "#5a3a22"; c.lineWidth = 34; c.beginPath(); c.arc(0, 0, 490, 0, 6.3); c.stroke();
    });
    const side = mat(b, "#6a4a30", { roughness: 1 });
    const log = new THREE.Mesh(b.track(new THREE.CylinderGeometry(1.0, 1.0, 1.1, 64)), [side, b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.35), roughness: 0.8 })), b.track(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }))]);
    log.rotation.x = Math.PI / 2; log.position.y = 1.0; g.add(log); g.rotation.y = -0.3; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = -0.3 + 0.35 * Math.sin(f * 0.011); g.position.y = 0.03 * Math.sin(f * 0.04); });
  },
};

