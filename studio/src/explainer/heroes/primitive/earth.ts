// Pack G · Tierra y clima (F11): volcán en corte, capas de la Tierra, nube con rayo, ola y marea, iceberg y placas
// tectónicas. Formas de manual, colores de la paleta y movimiento propio (lava, rayo, oleaje).
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, ghostMat, glowMat, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const volcan_corte: HeroDef = {
  kind: "primitive",
  when: "Volcán en corte: erupciones, magma, lava, cámara magmática, cenizas, por qué entra en erupción, islas volcánicas, rocas ígneas.",
  poses: ["activo", "erupcion"],
  center: [0, 1.2, 0], radius: 1.75,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.6, 0], base: [0, 0.05, 0], crater: [0, 2.3, 0.2], camara: [0, 0.45, 0.6], conducto: [0, 1.3, 0.6], lava: [0.8, 1.6, 0.9] },
  build: (_L, pose) => {
    const p = poseOf(volcan_corte, pose, "volcan_corte"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const rock = mat(b, col("#6b4f5c", "#4f3926", 0.35), { roughness: 0.9 }), lava = beam(b, "#ff7a2a", 1.5);
    const sh = new THREE.Shape(); sh.moveTo(-2.1, 0); sh.lineTo(2.1, 0); sh.lineTo(0.45, 2.3); sh.lineTo(-0.45, 2.3); sh.lineTo(-2.1, 0);
    const wallGeo = b.track(new THREE.ShapeGeometry(sh)), wall = new THREE.Mesh(wallGeo, mat(b, col("#8a6a74", "#4f3926", 0.4), { roughness: 0.9 })); wall.position.z = 0.02;
    const body = new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(sh, { depth: 1.4, bevelEnabled: false })), rock); body.position.z = -1.4; // cuña: cara frontal = corte
    const chamber = blob(b, 0.6, 0.12, 3, glowMat(b, "#ff6a2a", 0.9, { roughness: 0.4 }), 3); chamber.scale.set(1.5, 0.75, 0.55); chamber.position.set(0, 0.55, 0.02);
    const pipe = tube(b, [[0, 0.8, 0.03], [0.05, 1.5, 0.03], [0, 2.3, 0.03]], 0.14, lava, 24);
    g.add(body, wall, chamber, pipe);
    const bombs = scatter(p === "erupcion" ? 14 : 5, 6, (r) => [(r() - 0.5) * 1.6, r(), (r() - 0.5) * 0.6] as P3).map((q) => ({ s: ball(b, 0.09, lava, 8), q }));
    const ash = scatter(p === "erupcion" ? 10 : 4, 2, (r) => [(r() - 0.5) * 0.8, r(), (r() - 0.5) * 0.5] as P3).map((q) => ({ s: ball(b, 0.3, mat(b, "#6f6a7a", { transparent: true, opacity: 0.5, roughness: 1, depthWrite: false }), 10), q }));
    g.add(...bombs.map((x) => x.s), ...ash.map((x) => x.s));
    root.add(g); shadows(g);
    return done(root, b, (f) => {
      chamber.scale.set(1.5 + 0.06 * Math.sin(f * 0.1), 0.75 + 0.05 * Math.sin(f * 0.13), 0.55);
      bombs.forEach(({ s, q }, i) => { const t = (q[1] + f * (p === "erupcion" ? 0.02 : 0.009) + i * 0.09) % 1, h = 4 * t * (1 - t); s.position.set(q[0] * t * 1.4, 2.3 + h * (p === "erupcion" ? 2.2 : 0.9), q[2] * t); s.scale.setScalar(1 - 0.4 * t); });
      ash.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.006 + i * 0.1) % 1; s.position.set(q[0] * (0.5 + t * 2), 2.5 + t * 2.2, q[2]); s.scale.setScalar(0.6 + t * 1.6); });
      g.rotation.y = 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const capas_tierra: HeroDef = {
  kind: "primitive",
  when: "Capas de la Tierra: corteza, manto, núcleo externo e interno, campo magnético, por qué la Tierra es caliente por dentro, terremotos y su origen, qué hay bajo nuestros pies.",
  poses: ["corte"],
  center: [0, 1.4, 0], radius: 1.35,
  anchors: { hero: [0, 1.4, 0.5], top: [0, 2.6, 0], base: [0, 0.2, 0], corteza: [1.1, 2.0, 0.6], manto: [0.7, 1.5, 0.7], nucleo_externo: [0.35, 1.45, 0.7], nucleo_interno: [0, 1.4, 0.7] },
  build: (_L, pose) => {
    poseOf(capas_tierra, pose, "capas_tierra");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const shell = (r: number, c: string, k = 0.25) => { const m = new THREE.Mesh(b.track(new THREE.SphereGeometry(r, 56, 40, Math.PI / 2, Math.PI * 1.5)), glowMat(b, c, k, { roughness: 0.6, side: THREE.DoubleSide })); return m; };
    // esfera con un cuarto recortado: cada capa es una cáscara con el mismo hueco, y dentro se ven las de abajo
    const crust = shell(1.0, "#3d8a5a", 0.2), mantle = shell(0.93, "#e2762a", 0.45), outer = shell(0.55, "#ffb24a", 0.8), inner = ball(b, 0.27, beam(b, "#fff2c0", 1.6), 24);
    const ocean = new THREE.Mesh(b.track(new THREE.SphereGeometry(1.005, 56, 40, Math.PI / 2, Math.PI * 1.5)), glowMat(b, "#2a6ac8", 0.2, { transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    g.add(ocean, crust, mantle, outer, inner); g.position.y = 1.4; g.rotation.set(0.25, -0.5, 0); root.add(g);
    return done(root, b, (f) => { g.rotation.y = -0.5 + 0.3 * Math.sin(f * 0.012); (outer.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + 0.2 * Math.sin(f * 0.1); });
  },
};

export const nube_rayo: HeroDef = {
  kind: "primitive",
  when: "Nube y tormenta: rayos y truenos, lluvia, cómo se forma una nube, electricidad estática, por qué se ve el rayo antes de oír el trueno, granizo.",
  poses: ["tormenta", "lluvia"],
  center: [0, 1.6, 0], radius: 1.7,
  anchors: { hero: [0, 1.9, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], nube: [0, 2.4, 0], rayo: [0.3, 1.2, 0.2], suelo: [0.3, 0.1, 0.2] },
  build: (_L, pose) => {
    const p = poseOf(nube_rayo, pose, "nube_rayo"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const dark = p === "tormenta", cm = glowMat(b, dark ? "#6d6c8a" : "#dfe4f2", 0.2, { roughness: 1 });
    const puffs = [[-0.9, 0, 0, 0.7], [-0.2, 0.25, 0.05, 0.9], [0.7, 0.1, 0, 0.8], [1.3, -0.1, 0.1, 0.5], [-1.4, -0.15, 0.1, 0.5], [0.2, -0.15, 0.4, 0.7]].map(([x, y, z, r], i) => { const m = blob(b, r as number, 0.08, i + 2, cm, 3); m.position.set(x as number, 2.5 + (y as number), z as number); return m; });
    const bolt = (() => { const pts: P3[] = [[0.2, 2.2, 0.3]]; let x = 0.2, y = 2.2; for (let i = 1; i < 9; i++) { y -= 0.27; x += (i % 2 ? 1 : -1) * (0.12 + 0.05 * (i % 3)); pts.push([x, y, 0.3]); } return tube(b, pts, 0.045, beam(b, "#fff6b0", 2.4), 40); })();
    const glow = place(new THREE.Mesh(b.track(new THREE.SphereGeometry(1, 20, 14)), b.track(new THREE.MeshBasicMaterial({ color: "#c8d4ff", transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }))), [0, 2.4, 0], 1.7);
    const drops = scatter(p === "lluvia" ? 30 : dark ? 10 : 0, 4, (r) => [(r() - 0.5) * 2.4, r(), (r() - 0.5) * 0.8] as P3).map((q) => ({ s: new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 4)), beam(b, "#9fd0ff", 1.3)), q }));
    g.add(...puffs, bolt, glow, ...drops.map((d) => d.s)); bolt.visible = dark; root.add(g);
    return done(root, b, (f) => {
      const flash = dark ? Math.max(0, Math.sin(f * 0.09)) ** 14 : 0; bolt.visible = flash > 0.05; (glow.material as THREE.MeshBasicMaterial).opacity = 0.55 * flash;
      puffs.forEach((m, i) => { m.scale.setScalar(1 + 0.03 * Math.sin(f * 0.04 + i)); });
      drops.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.022 + i * 0.05) % 1; s.position.set(q[0], 2.0 - t * 2.0, q[2]); });
      g.rotation.y = 0.25 * Math.sin(f * 0.01);
    });
  },
};

export const ola_marea: HeroDef = {
  kind: "primitive",
  when: "Olas y mareas: el mar, por qué sube y baja la marea, la Luna y el agua, tsunamis, corrientes, por qué el agua del mar es salada, surf.",
  poses: ["olas", "marea"],
  center: [0, 0.9, 0], radius: 1.8,
  anchors: { hero: [0, 0.9, 0], top: [0, 2.0, 0], base: [0, 0.05, 0], cresta: [0.2, 1.3, 0.2], orilla: [-1.7, 0.4, 0.5], luna: [2.0, 2.4, -0.5] },
  build: (_L, pose) => {
    const p = poseOf(ola_marea, pose, "ola_marea"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const W = 4.6, D = 2.2, SX = 90, SZ = 28, geo = b.track(new THREE.PlaneGeometry(W, D, SX, SZ)); geo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(geo, glowMat(b, "#2f7de0", 0.4, { roughness: 0.2, transparent: true, opacity: 1, side: THREE.DoubleSide })), pos = geo.attributes.position;
    const sand = new THREE.Mesh(b.track(new THREE.BoxGeometry(5, 0.3, 2.4)), mat(b, "#d9b27a", { roughness: 0.9 })); sand.position.y = -0.2;
    const slope = new THREE.Mesh(b.track(new THREE.BoxGeometry(1.2, 0.5, 2.4)), mat(b, "#d9b27a", { roughness: 0.9 })); slope.position.set(-2.2, 0.15, 0);
    const moon = ball(b, 0.3, glowMat(b, "#d9d7e6", 0.5), 20); moon.position.set(2.0, 2.4, -0.5); moon.visible = p === "marea";
    g.add(water, sand, slope, moon); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const lvl = p === "marea" ? 0.35 + 0.3 * Math.sin(f * 0.025) : 0.4;
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, lvl + 0.16 * Math.sin(x * 2.6 - f * 0.12 + z * 0.8) + 0.06 * Math.sin(x * 5.2 - f * 0.2 + z * 2)); }
      pos.needsUpdate = true; geo.computeVertexNormals(); g.rotation.y = 0.45 + 0.2 * Math.sin(f * 0.01);
    });
  },
};

export const iceberg: HeroDef = {
  kind: "primitive",
  when: "Iceberg y hielo polar: por qué solo se ve la punta, flotación, deshielo, nivel del mar, glaciares, cambio climático, el Ártico y la Antártida.",
  poses: ["corte"],
  center: [0, 1.0, 0], radius: 1.9,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.2, 0], base: [0, -1.5, 0], punta: [0, 1.7, 0.4], superficie: [1.5, 0.9, 0.5], sumergido: [0, -0.6, 0.6] },
  build: (_L, pose) => {
    poseOf(iceberg, pose, "iceberg");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const ice = glowMat(b, "#e6f6ff", 0.25, { roughness: 0.3 }), under = glowMat(b, "#9fd8ff", 0.3, { roughness: 0.3, transparent: true, opacity: 0.85 });
    const tip = blob(b, 0.85, 0.22, 4, ice, 2); tip.scale.set(1.0, 1.0, 0.8); tip.position.y = 1.25;
    const deep = blob(b, 1.3, 0.18, 7, under, 3); deep.scale.set(1.15, 1.15, 0.8); deep.position.y = -0.45;
    const waterGeo = b.track(new THREE.BoxGeometry(5.0, 3.6, 2.2)), sea = new THREE.Mesh(waterGeo, ghostMat(b, "#2a6ac8", 0.3, { emissive: col("#2a6ac8").multiplyScalar(0.25) })); sea.position.y = -0.7;
    const line = new THREE.Mesh(b.track(new THREE.PlaneGeometry(5.0, 2.2)), b.track(new THREE.MeshBasicMaterial({ color: "#bfe9ff", transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }))); line.rotation.x = -Math.PI / 2; line.position.y = 1.1 - 0.1;
    g.add(sea, deep, tip, line); g.position.y = 0.2; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.4 * Math.sin(f * 0.011); tip.position.y = 1.25 + 0.03 * Math.sin(f * 0.05); deep.position.y = -0.45 + 0.03 * Math.sin(f * 0.05); line.position.y = 1.0 + 0.02 * Math.sin(f * 0.07); });
  },
};

export const placas_tectonicas: HeroDef = {
  kind: "primitive",
  when: "Placas tectónicas: terremotos, montañas que crecen, deriva continental, volcanes y fallas, por qué tiembla la tierra, el Anillo de Fuego, subducción.",
  poses: ["choque", "separan"],
  center: [0, 0.8, 0], radius: 1.9,
  anchors: { hero: [0, 0.8, 0], top: [0, 2.0, 0], base: [0, 0.05, 0], falla: [0, 0.9, 0.7], monte: [0, 1.5, 0.3], magma: [0, 0.1, 0.7] },
  build: (_L, pose) => {
    const p = poseOf(placas_tectonicas, pose, "placas_tectonicas"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const top = mat(b, "#4f9a6a", { roughness: 0.85 }), rock = mat(b, "#7a5a66", { roughness: 0.9 }), mantle = glowMat(b, "#e2762a", 0.6, { roughness: 0.6 });
    const plateL = new THREE.Group(), plateR = new THREE.Group();
    for (const [pl, s] of [[plateL, -1], [plateR, 1]] as const) { pl.add(place(box(b, 2.1, 0.4, 1.8, top), [0, 0.8, 0]), place(box(b, 2.1, 0.5, 1.8, rock), [0, 0.35, 0])); pl.position.set(s * 1.1, 0, 0); }
    const base = box(b, 4.6, 0.3, 1.9, mantle); base.position.y = 0.1;
    const peaks = [0, 1, 2].map((i) => { const m = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.4 - i * 0.07, 0.8 - i * 0.12, 4)), mat(b, "#e8e8f4", { roughness: 0.7 })); m.position.set((i - 1) * 0.35, 1.3, 0); return m; });
    const arrows = [-1, 1].map((s) => { const a = new THREE.Group(); a.add(rod(b, [0, 0, 0], [-s * 0.7, 0, 0], 0.05, beam(b, p === "choque" ? TONE.glowRed : TONE.cyan, 1.6)), place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.14, 0.3, 12)), beam(b, p === "choque" ? TONE.glowRed : TONE.cyan, 1.6)), [-s * 0.78, 0, 0])); a.children[1].rotation.z = s * Math.PI / 2; a.position.set(s * 2.0, 1.6, 0.9); return { a, s }; });
    g.add(base, plateL, plateR, ...peaks, ...arrows.map((x) => x.a)); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const k = 0.5 + 0.5 * Math.sin(f * 0.04), gap = p === "choque" ? 1.0 - 0.1 * k : 1.1 + 0.25 * k;
      plateL.position.x = -gap; plateR.position.x = gap; peaks.forEach((m, i) => { m.visible = p === "choque"; m.scale.y = 0.7 + 0.5 * k; m.position.y = 1.0 + 0.2 * k + 0.1 * (i === 1 ? 1 : 0); });
      plateL.position.y = p === "choque" ? 0.05 * k : 0; arrows.forEach(({ a, s }) => { a.position.x = s * (2.0 + (p === "choque" ? -0.2 * k : 0.2 * k)); });
      g.rotation.y = 0.3 * Math.sin(f * 0.01);
    });
  },
};

