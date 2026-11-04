// Pack G (2.ª tanda) · Tierra y clima: ciclo del agua, arcoíris, huracán, estratos con fósil, aurora y duna.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, cyl, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];
const cloud = (b: Bin, c = "#eef1fa", s = 1, k = 0.2) => { const g = new THREE.Group(), m = glowMat(b, c, k, { roughness: 1 }); [[-0.6, 0, 0, 0.45], [0, 0.2, 0, 0.6], [0.6, 0, 0, 0.45], [0, -0.05, 0.3, 0.5]].forEach(([x, y, z, r]) => g.add(place(blob(b, r, 0.08, x * 5 + 2, m, 3), [x, y, z]))); g.scale.setScalar(s); return g; };

export const ciclo_agua: HeroDef = {
  kind: "primitive",
  when: "Ciclo del agua: evaporación, nubes, lluvia, ríos y mar, por qué llueve, de dónde viene el agua, condensación, el agua que bebemos es la misma de siempre.",
  poses: ["ciclo"],
  center: [0, 1.4, 0], radius: 1.5,
  anchors: { hero: [0, 1.4, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], nube: [0.8, 2.6, 0], mar: [-1.5, 0.3, 0.6], montana: [0.9, 1.0, 0], sol: [-1.8, 3.0, 0] },
  build: (_L, pose) => {
    poseOf(ciclo_agua, pose, "ciclo_agua");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const land = place(box(b, 4.2, 0.4, 2.0, glowMat(b, "#4f9a6a", 0.15, { roughness: 0.9 })), [0.4, 0.2, 0]), sea = place(box(b, 2.2, 0.3, 2.0, glowMat(b, "#2f7de0", 0.4)), [-1.7, 0.18, 0]); land.scale.x = 0.55; land.position.x = 1.0;
    const mount = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.95, 1.6, 6)), mat(b, "#7a6a76", { roughness: 0.9 })); mount.position.set(1.1, 1.05, -0.2); const snow = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.34, 0.5, 6)), mat(b, "#f4f6ff")); snow.position.set(1.1, 1.65, -0.2);
    const river = tube(b, [[0.9, 1.0, 0.4], [0.5, 0.45, 0.6], [-0.2, 0.36, 0.5], [-0.8, 0.34, 0.5]], 0.05, glowMat(b, "#4a9af0", 0.6), 24), cl = cloud(b, "#eef1fa", 0.8); cl.position.set(0.5, 2.7, 0);
    const sun = place(ball(b, 0.3, beam(b, "#ffe08a", 1.6), 16), [-1.8, 3.0, 0]);
    const ev = scatter(8, 2, (r) => [-2.0 + r() * 1.0, 0, (r() - 0.5) * 1.0] as P3).map((q) => ({ s: ball(b, 0.05, beam(b, "#d8ecff", 1.4, { transparent: true, opacity: 0.8 }), 8), q }));
    const rain = scatter(14, 5, (r) => [0.1 + r() * 0.9, r(), (r() - 0.5) * 0.6] as P3).map((q) => ({ s: new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 4)), beam(b, "#9fd0ff", 1.3)), q }));
    g.add(land, sea, mount, snow, river, cl, sun, ...ev.map((e) => e.s), ...rain.map((r) => r.s)); g.rotation.y = 0.3; root.add(g); shadows(g);
    return done(root, b, (f) => { ev.forEach(({ s, q }, i) => { const t = (f * 0.007 + i / 8) % 1; s.position.set(q[0] + 1.3 * t, 0.4 + 2.3 * t, q[2]); (s.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - 0.6 * t); }); rain.forEach(({ s, q }, i) => { const t = (f * 0.02 + q[1] + i * 0.05) % 1; s.position.set(q[0], 2.5 - 2.1 * t, q[2]); }); cl.scale.setScalar(0.8 + 0.03 * Math.sin(f * 0.05)); g.rotation.y = 0.3 + 0.25 * Math.sin(f * 0.01); });
  },
};

export const arcoiris: HeroDef = {
  kind: "primitive",
  when: "Arcoíris: por qué sale un arcoíris, luz del sol y gotas de lluvia, colores del espectro, dobles arcoíris, por qué es un arco, refracción en el agua.",
  poses: ["arco"],
  center: [0, 1.5, 0], radius: 1.55,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], arco: [0, 2.6, 0], nube: [-1.8, 0.7, 0], sol: [2.0, 2.8, 0] },
  build: (_L, pose) => {
    poseOf(arcoiris, pose, "arcoiris");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const cs = ["#ff4d4d", "#ff9a3a", "#ffe14a", "#4cd97b", "#4ab6ff", "#6b6bff", "#b36bff"];
    const bands = cs.map((c, i) => { const m = new THREE.Mesh(b.track(new THREE.TorusGeometry(1.85 - i * 0.13, 0.07, 10, 64, Math.PI)), beam(b, c, 1.5, { transparent: true, opacity: 0.9 })); m.position.y = 0.4; return m; });
    const c1 = cloud(b, "#f2f4fb", 0.8), c2 = cloud(b, "#f2f4fb", 0.7); c1.position.set(-1.85, 0.5, 0); c2.position.set(1.85, 0.45, 0);
    const sun = place(ball(b, 0.3, beam(b, "#ffe08a", 1.6), 16), [2.3, 2.9, -0.4]), ray = rod(b, [2.1, 2.7, -0.4], [1.2, 1.7, -0.2], 0.02, beam(b, "#fff6d0", 1.2, { transparent: true, opacity: 0.55 }));
    const drops = scatter(20, 4, (r) => [(r() - 0.5) * 3.2, r(), (r() - 0.5) * 0.4] as P3).map((q) => ({ s: new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 4)), beam(b, "#bfe0ff", 1.2)), q }));
    g.add(...bands, c1, c2, sun, ray, ...drops.map((d) => d.s)); root.add(g);
    return done(root, b, (f) => { bands.forEach((m, i) => { (m.material as THREE.MeshBasicMaterial).opacity = 0.75 + 0.2 * Math.sin(f * 0.06 + i * 0.5); }); drops.forEach(({ s, q }, i) => { const t = (f * 0.015 + q[1] + i * 0.05) % 1; s.position.set(q[0], 1.4 - 1.3 * t, q[2]); }); g.rotation.y = 0.25 * Math.sin(f * 0.01); });
  },
};

export const huracan: HeroDef = {
  kind: "primitive",
  when: "Huracanes y tornados: por qué giran las tormentas, el ojo del huracán, vientos fuertes, océanos cálidos, presión del aire, cómo se forma una tormenta tropical.",
  poses: ["giro"],
  center: [0, 1.2, 0], radius: 1.5,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.0, 0], base: [0, 0.1, 0], ojo: [0, 1.4, 0], brazo: [1.4, 1.2, 0.3], mar: [0, 0.1, 0] },
  build: (_L, pose) => {
    poseOf(huracan, pose, "huracan");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), storm = new THREE.Group();
    const sea = place(cyl(b, 2.5, 2.5, 0.1, glowMat(b, "#2a6ac8", 0.5), 48), [0, 0.0, 0]), cm = glowMat(b, "#ffffff", 0.55, { roughness: 1 }), puffs: THREE.Mesh[] = [];
    for (let i = 0; i < 170; i++) { const t = i / 170, arm = i % 4, a = Math.pow(t, 0.8) * 11 + (arm * Math.PI * 2) / 4, r = 0.4 + t * 2.0, m = blob(b, 0.1 + 0.13 * (1 - t) + 0.03 * ((i * 7) % 3), 0.15, i, cm, 2); m.position.set(Math.cos(a) * r, 0.3 + 0.35 * (1 - t) + 0.04 * ((i * 13) % 5), Math.sin(a) * r); m.scale.y = 0.5; storm.add(m); puffs.push(m); }
    const dark = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.42, 28)), b.track(new THREE.MeshBasicMaterial({ color: "#1c3a78" }))); dark.rotation.x = -Math.PI / 2; dark.position.y = 0.2; storm.add(dark);
    const eye = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 20, 1, true)), glowMat(b, "#cfd6ea", 0.3, { transparent: true, opacity: 0.4, side: THREE.DoubleSide })); eye.position.y = 0.5; storm.add(eye);
    g.add(sea, storm); g.rotation.x = 0.55; g.position.y = 1.0; root.add(g); shadows(g);
    return done(root, b, (f) => { storm.rotation.y = -f * 0.025; g.rotation.y = 0.2 * Math.sin(f * 0.01); });
  },
};

export const estratos_fosil: HeroDef = {
  kind: "primitive",
  when: "Fósiles y capas de roca: cómo se forma un fósil, edad de la Tierra, dinosaurios, estratos geológicos, excavaciones, paleontología, rocas sedimentarias.",
  poses: ["estratos"],
  center: [0, 1.0, 0], radius: 1.5,
  anchors: { hero: [0, 1.0, 0.5], top: [0, 2.2, 0], base: [0, 0.05, 0], fosil: [0.2, 0.9, 0.82], capa_alta: [0.8, 1.7, 0.82], capa_baja: [0.8, 0.3, 0.82] },
  build: (_L, pose) => {
    poseOf(estratos_fosil, pose, "estratos_fosil");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const cols = ["#8a5a3a", "#c9944a", "#a8704a", "#e0c08a", "#7a4a3a", "#d9b27a"], hs = [0.3, 0.35, 0.4, 0.3, 0.45, 0.25];
    let y = 0; cols.forEach((c, i) => { const s = box(b, 2.6, hs[i], 1.6, glowMat(b, c, 0.12, { roughness: 1 })); s.position.y = y + hs[i] / 2; y += hs[i]; g.add(s); const wave = tube(b, Array.from({ length: 12 }, (_, k) => [-1.2 + k * 0.22, y + 0.001 + 0.015 * Math.sin(k * 1.3 + i), 0.81] as P3), 0.012, mat(b, "#3a2a1e"), 12); g.add(wave); });
    const fm = glowMat(b, TONE.bone, 0.3, { roughness: 0.8 }), fossil = new THREE.Group();
    fossil.add(tube(b, Array.from({ length: 30 }, (_, i) => { const a = i * 0.28, r = 0.02 + i * 0.012; return [Math.cos(a) * r, Math.sin(a) * r, 0] as P3; }), 0.045, fm, 40), place(ball(b, 0.06, fm, 8), [0, 0, 0]));
    const ribs = Array.from({ length: 5 }, (_, i) => tube(b, [[-0.3 + i * 0.15, -0.02, 0], [-0.3 + i * 0.15, 0.2, 0]], 0.02, fm, 6)); fossil.add(...ribs); fossil.position.set(0.3, 1.0, 0.81); fossil.scale.setScalar(1.1);
    const brush = place(cyl(b, 0.05, 0.05, 0.6, mat(b, "#aa8a5a"), 8), [0.9, 1.4, 0.9]); brush.rotation.z = 0.8;
    g.add(fossil, brush); g.rotation.y = -0.4; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = -0.4 + 0.3 * Math.sin(f * 0.011); fossil.rotation.z = 0.08 * Math.sin(f * 0.04); brush.position.x = 0.9 + 0.15 * Math.sin(f * 0.07); });
  },
};

export const aurora: HeroDef = {
  kind: "primitive",
  when: "Auroras boreales: por qué hay luces en el cielo polar, viento solar, campo magnético de la Tierra, colores verdes, el Ártico de noche, partículas del Sol.",
  poses: ["cortina"],
  center: [0, 1.7, 0], radius: 1.6,
  anchors: { hero: [0, 1.6, 0], top: [0, 3.2, 0], base: [0, 0.1, 0], cortina: [0, 2.4, -0.4], montana: [-1.5, 0.5, 0.2], estrella: [1.5, 3.0, -0.5] },
  build: (_L, pose) => {
    poseOf(aurora, pose, "aurora");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 256, 256, (c) => { for (let i = 0; i < 256; i++) { const edge = Math.min(1, i / 40, (255 - i) / 40), a = (0.25 + 0.75 * Math.abs(Math.sin(i * 0.27) * Math.cos(i * 0.043))) * edge, gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(150,80,255,0)"); gr.addColorStop(0.3, `rgba(110,255,180,${0.65 * a})`); gr.addColorStop(0.65, `rgba(60,255,140,${a})`); gr.addColorStop(1, "rgba(60,255,140,0)"); c.fillStyle = gr; c.fillRect(i, 0, 1, 256); } });
    const curtains = [0, 1, 2].map((k) => { const geo = b.track(new THREE.PlaneGeometry(5.2, 2.8, 70, 1)), m = new THREE.Mesh(geo, b.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, color: new THREE.Color(k === 1 ? "#ff9ae8" : "#ffffff").multiplyScalar(1.1) }))); m.position.set(0, 2.5, -0.6 - k * 0.5); return { m, geo, k }; });
    const peaks = [-2, -1.1, -0.2, 0.9, 1.9].map((x, i) => { const p = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.7 + 0.2 * (i % 2), 1.2 + 0.4 * (i % 3), 5)), mat(b, "#0a1020", { roughness: 1 })); p.position.set(x, 0.55, -0.1 + 0.2 * (i % 2)); return p; });
    const stars = scatter(30, 2, (r) => [(r() - 0.5) * 5, 1.5 + r() * 2.5, -1.8] as P3).map((q) => place(ball(b, 0.025, beam(b, "#ffffff", 1.6), 6), q));
    const snow = place(cyl(b, 2.4, 2.4, 0.05, glowMat(b, "#dfe8ff", 0.25), 40), [0, 0.0, 0]);
    g.add(...curtains.map((c) => c.m), ...peaks, ...stars, snow); root.add(g);
    return done(root, b, (f) => { curtains.forEach(({ m, geo, k }) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.25 * Math.sin(x * 1.6 + f * 0.04 + k) + 0.1 * Math.sin(x * 3.4 - f * 0.06)); } p.needsUpdate = true; m.position.y = 2.4 + 0.1 * Math.sin(f * 0.02 + k); }); g.rotation.y = 0.15 * Math.sin(f * 0.008); });
  },
};

export const duna_desierto: HeroDef = {
  kind: "primitive",
  when: "Desiertos y calor: dunas, por qué el desierto es frío de noche, espejismos, cactus y agua, arena, tormentas de arena, vida en condiciones extremas.",
  poses: ["dia"],
  center: [0, 1.0, 0], radius: 1.3,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.4, 0], base: [0, 0.05, 0], duna: [0, 0.7, 0.3], cactus: [1.2, 1.1, 0.3], sol: [-1.8, 2.8, -0.4] },
  build: (_L, pose) => {
    poseOf(duna_desierto, pose, "duna_desierto");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const geo = b.track(new THREE.PlaneGeometry(5, 3, 70, 30)); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.55 * Math.exp(-((x + 0.6) ** 2) / 1.3) * Math.exp(-((z + 0.2) ** 2) / 2.5) + 0.35 * Math.exp(-((x - 1.5) ** 2) / 0.9) + 0.04 * Math.sin(x * 9 + z * 3)); } geo.computeVertexNormals();
    const dune = new THREE.Mesh(geo, glowMat(b, "#e8b86a", 0.25, { roughness: 1 })), green = glowMat(b, "#3f9a4a", 0.25);
    const cactus = new THREE.Group(); cactus.add(cyl(b, 0.1, 0.1, 0.9, green, 12), place(cyl(b, 0.07, 0.07, 0.4, green, 10), [-0.2, 0.45, 0]), place(cyl(b, 0.07, 0.07, 0.35, green, 10), [0.2, 0.35, 0]), place(ball(b, 0.1, green, 10), [0, 0.46, 0])); cactus.children[1].rotation.z = 0.0; cactus.position.set(1.4, 0.75, 0.3);
    const arms = [place(rod(b, [-0.2, 0.3, 0], [-0.2, 0.7, 0], 0.07, green), [0, 0, 0])]; cactus.add(...arms);
    const sun = place(ball(b, 0.38, beam(b, "#ffe08a", 1.7), 20), [-1.9, 2.7, -0.6]), glow = place(halo(b, "rgba(255,220,130,0.9)", 2.6, 0.7), [-1.9, 2.7, -0.7]);
    const heat = scatter(10, 3, (r) => [(r() - 0.5) * 3, r(), 0.4] as P3).map((q) => ({ s: place(ball(b, 0.04, beam(b, "#fff0c0", 1.2, { transparent: true, opacity: 0.5 }), 6), q), q }));
    g.add(dune, cactus, sun, glow, ...heat.map((h) => h.s)); g.position.y = 0.0; g.rotation.y = 0.2; root.add(g); shadows(g);
    return done(root, b, (f) => { heat.forEach(({ s, q }, i) => { const t = (f * 0.01 + q[1] + i * 0.1) % 1; s.position.set(q[0] + 0.1 * Math.sin(f * 0.1 + i), 0.6 + t * 1.0, q[2]); (s.material as THREE.MeshBasicMaterial).opacity = 0.5 * Math.sin(t * 3.1); }); glow.scale.setScalar(1 + 0.05 * Math.sin(f * 0.05)); g.rotation.y = 0.2 + 0.2 * Math.sin(f * 0.01); });
  },
};
