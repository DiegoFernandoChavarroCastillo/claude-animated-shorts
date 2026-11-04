// Pack D (2.ª tanda) · Química: moléculas con bolas y palitos, tubos de ensayo, mechero, clavo oxidado, columna de
// densidades y destilador.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, ghostMat, glowMat, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];
const ATOM: Record<string, [string, number]> = { C: ["#4a4f66", 0.34], O: ["#ff5a5f", 0.32], H: ["#f4f4ff", 0.2] };

export const molecula_atomos: HeroDef = {
  kind: "primitive",
  when: "Moléculas de uso cotidiano: dióxido de carbono, metano, oxígeno, efecto invernadero, gases, combustión, enlaces y estructura de una molécula.",
  poses: ["co2", "metano", "oxigeno"],
  center: [0, 1.4, 0], radius: 1.1,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.5, 0], base: [0, 0.2, 0], carbono: [0, 1.4, 0.3], enlace: [0.5, 1.4, 0.2], oxigeno: [1.2, 1.4, 0] },
  build: (_L, pose) => {
    const p = poseOf(molecula_atomos, pose, "molecula_atomos"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const at = (e: string, q: P3) => { const [c, r] = ATOM[e]; const m = place(ball(b, r, glowMat(b, c, 0.3, { roughness: 0.35 }), 24), q); g.add(m); return m; };
    const bond = (a: P3, c: P3, d = 1) => { for (let i = 0; i < d; i++) { const o = (i - (d - 1) / 2) * 0.1; g.add(rod(b, [a[0], a[1] + o, a[2]], [c[0], c[1] + o, c[2]], 0.035, glowMat(b, "#cfd4ea", 0.3))); } };
    if (p === "co2") { at("C", [0, 0, 0]); at("O", [-1.0, 0, 0]); at("O", [1.0, 0, 0]); bond([0, 0, 0], [-1, 0, 0], 2); bond([0, 0, 0], [1, 0, 0], 2); }
    else if (p === "oxigeno") { at("O", [-0.5, 0, 0]); at("O", [0.5, 0, 0]); bond([-0.5, 0, 0], [0.5, 0, 0], 2); }
    else { at("C", [0, 0, 0]); for (const q of [[0.7, 0.7, 0.7], [-0.7, -0.7, 0.7], [-0.7, 0.7, -0.7], [0.7, -0.7, -0.7]] as P3[]) { at("H", q); bond([0, 0, 0], q); } }
    const sc = p === "oxigeno" ? 1.5 : p === "metano" ? 1.25 : 1.1; g.scale.setScalar(sc); g.position.y = 1.4; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = f * 0.018; g.rotation.x = 0.3 * Math.sin(f * 0.02); });
  },
};

export const tubos_ensayo: HeroDef = {
  kind: "primitive",
  when: "Tubos de ensayo: experimentos de color, indicadores, mezclas, soluciones, pruebas de laboratorio, comparar sustancias, reacciones que cambian de color.",
  poses: ["colores"],
  center: [0, 1.0, 0], radius: 1.5,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.2, 0], base: [0, 0.1, 0], tubo1: [-0.9, 1.4, 0.2], tubo2: [-0.3, 1.4, 0.2], tubo3: [0.3, 1.4, 0.2], tubo4: [0.9, 1.4, 0.2] },
  build: (_L, pose) => {
    poseOf(tubos_ensayo, pose, "tubos_ensayo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const wood = mat(b, "#8a5a3a", { roughness: 0.7 }), rack = [place(box(b, 2.6, 0.12, 0.7, wood), [0, 0.7, 0]), place(box(b, 2.6, 0.12, 0.7, wood), [0, 0.2, 0]), place(box(b, 0.12, 0.62, 0.7, wood), [-1.3, 0.45, 0]), place(box(b, 0.12, 0.62, 0.7, wood), [1.3, 0.45, 0])];
    const cs = ["#ff5a5f", "#ffd24a", "#3ddc84", "#b36bff"], levels = [0.6, 0.8, 0.5, 0.7], tubes = cs.map((c, i) => {
      const t = new THREE.Group(), prof = [[0.02, 0], [0.2, 0.04], [0.22, 0.15], [0.22, 1.6]].map(([r, y]) => new THREE.Vector2(r, y));
      t.add(new THREE.Mesh(b.track(new THREE.LatheGeometry(prof, 24)), ghostMat(b, "#d8ecff", 0.22)), place(cyl(b, 0.2, 0.2, levels[i], glowMat(b, c, 0.5, { transparent: true, opacity: 0.9 }), 20), [0, levels[i] / 2 + 0.1, 0]));
      t.position.set(-0.9 + i * 0.6, 0.8, 0.0); return t; });
    const bub = scatter(12, 3, (r) => [Math.floor(r() * 4), r()] as unknown as P3).map((q) => ({ s: ball(b, 0.03, beam(b, "#fff", 1.4, { transparent: true, opacity: 0.8 }), 6), q }));
    g.add(...rack, ...tubes, ...bub.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { bub.forEach(({ s, q }, i) => { const k = q[0], t = (f * 0.015 + q[1] + i * 0.1) % 1; s.position.set(-0.9 + k * 0.6 + 0.05 * Math.sin(f * 0.2 + i), 0.9 + t * levels[k], 0); s.visible = k !== 3 || t > 0.3; }); g.rotation.y = 0.4 * Math.sin(f * 0.01); });
  },
};

export const llama_mechero: HeroDef = {
  kind: "primitive",
  when: "Fuego y llama: combustión, colores de la llama, por qué el fuego es caliente, mechero de laboratorio, quemar metales, oxígeno y fuego, humo.",
  poses: ["azul", "amarilla"],
  center: [0, 1.3, 0], radius: 1.2,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], llama: [0, 1.9, 0], cono: [0, 1.5, 0], valvula: [0.4, 0.5, 0.2] },
  build: (_L, pose) => {
    const p = poseOf(llama_mechero, pose, "llama_mechero"), blue = p === "azul", b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const steel = mat(b, "#aeb8d6", { metalness: 0.8, roughness: 0.3 }), base = cyl(b, 0.7, 0.8, 0.14, steel, 28); base.position.y = 0.07;
    const tubeM = cyl(b, 0.14, 0.14, 1.2, steel, 18); tubeM.position.y = 0.75; const collar = cyl(b, 0.2, 0.2, 0.22, mat(b, "#d9444e"), 18); collar.position.y = 0.45;
    const outer = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.28, blue ? 0.8 : 1.3, 24)), beam(b, blue ? "#6ab0ff" : "#ffb24a", 1.5, { transparent: true, opacity: 0.8 })), core = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.15, blue ? 0.45 : 0.6, 20)), beam(b, blue ? "#e8f4ff" : "#fff2c0", 2));
    outer.position.y = 1.35 + (blue ? 0.4 : 0.65); core.position.y = 1.35 + (blue ? 0.25 : 0.3);
    const sm = scatter(blue ? 0 : 8, 2, (r) => [(r() - 0.5) * 0.3, r(), 0] as P3).map((q) => ({ s: ball(b, 0.14, mat(b, "#3a3a46", { transparent: true, opacity: 0.4, roughness: 1, depthWrite: false }), 10), q }));
    g.add(base, tubeM, collar, outer, core, ...sm.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { outer.scale.set(1 + 0.08 * Math.sin(f * 0.6), 1 + 0.15 * Math.sin(f * 0.45), 1 + 0.08 * Math.sin(f * 0.6)); core.scale.y = 1 + 0.12 * Math.sin(f * 0.7); sm.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.01 + i * 0.12) % 1; s.position.set(q[0] + 0.15 * Math.sin(f * 0.05 + i), 2.5 + t * 1.4, 0); s.scale.setScalar(0.6 + t * 1.8); }); g.rotation.y = 0.4 * Math.sin(f * 0.01); });
  },
};

export const clavo_oxido: HeroDef = {
  kind: "primitive",
  when: "Oxidación y corrosión: por qué se oxida el hierro, herrumbre, agua y oxígeno, por qué se oscurece la manzana, metales que se desgastan, reacciones lentas.",
  poses: ["nuevo", "oxidado"],
  center: [0, 1.3, 0], radius: 1.2,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], punta: [0, 0.2, 0], cabeza: [0, 2.4, 0], herrumbre: [0.3, 1.2, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(clavo_oxido, pose, "clavo_oxido"), rusty = p === "oxidado", b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 64, 512, (c) => { c.fillStyle = rusty ? "#a8501e" : "#b8c0d6"; c.fillRect(0, 0, 64, 512); if (rusty) for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${90 + (i * 7) % 90},${40 + (i * 3) % 40},${15},${0.2 + (i % 5) * 0.1})`; c.beginPath(); c.arc((i * 37) % 64, (i * 53) % 512, 3 + (i % 7), 0, 6.3); c.fill(); } });
    const m = b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.25), roughness: rusty ? 0.95 : 0.3, metalness: rusty ? 0.1 : 0.85 }));
    const shaft = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.1, 0.1, 2.0, 16)), m), tip = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.1, 0.3, 16)), m), head = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 24)), m);
    shaft.position.y = 1.4; tip.position.y = 0.25; tip.rotation.x = Math.PI; head.position.y = 2.45;
    const o2 = scatter(10, 4, (r) => [(r() - 0.5) * 2, 0.3 + r() * 2, (r() - 0.5) * 0.8] as P3).map((q) => ({ s: ball(b, 0.05, beam(b, TONE.cyan, 1.6, { transparent: true, opacity: 0.8 }), 8), q }));
    const dr = scatter(6, 5, (r) => [(r() - 0.5) * 1.6, 2.5 * r(), (r() - 0.5) * 0.5] as P3).map((q) => ({ s: ball(b, 0.06, glowMat(b, "#6ab0ff", 0.7), 8), q }));
    g.add(shaft, tip, head, ...o2.map((x) => x.s), ...dr.map((x) => x.s)); g.rotation.z = 0.2; root.add(g); shadows(g);
    return done(root, b, (f) => { o2.forEach(({ s, q }, i) => { const t = (f * 0.008 + i / 10) % 1; s.position.set(q[0] * (1 - 0.7 * t), q[1], q[2] * (1 - 0.7 * t)); }); dr.forEach(({ s, q }, i) => { const t = (f * 0.012 + i / 6) % 1; s.position.set(q[0], 2.5 - 2.3 * t, q[2]); }); g.rotation.y = f * 0.012; });
  },
};

export const probeta_densidad: HeroDef = {
  kind: "primitive",
  when: "Densidad y capas: líquidos que no se mezclan, aceite y agua, por qué algo flota o se hunde, torre de densidades, lámpara de lava, mezclas y separación.",
  poses: ["capas"],
  center: [0, 1.4, 0], radius: 1.2,
  anchors: { hero: [0, 1.4, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], capa_alta: [0, 2.4, 0.3], capa_media: [0, 1.5, 0.3], capa_baja: [0, 0.6, 0.3] },
  build: (_L, pose) => {
    poseOf(probeta_densidad, pose, "probeta_densidad");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const glass = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.58, 0.58, 3.0, 36, 1, true)), ghostMat(b, "#d8ecff", 0.2)); glass.position.y = 1.55;
    const bot = cyl(b, 0.58, 0.58, 0.08, ghostMat(b, "#d8ecff", 0.5), 28); bot.position.y = 0.05; const foot = cyl(b, 0.8, 0.85, 0.1, ghostMat(b, "#d8ecff", 0.4), 28); foot.position.y = 0.02;
    const L = [["#d9444e", 0.1, 0.8], ["#ffb02e", 0.9, 0.7], ["#3ddc84", 1.6, 0.7], ["#4a78e8", 2.3, 0.7]].map(([c, y, h]) => place(cyl(b, 0.55, 0.55, h as number, glowMat(b, c as string, 0.4, { transparent: true, opacity: 0.85 }), 28), [0, (y as number) + (h as number) / 2, 0]));
    const items = [[TONE.gold, 0.12, 2.0], ["#ffffff", 0.15, 1.3], [TONE.glowRed, 0.14, 0.55]].map(([c, r, y]) => ({ s: ball(b, r as number, glowMat(b, c as string, 0.5), 14), y: y as number }));
    g.add(glass, bot, foot, ...L, ...items.map((i) => i.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { items.forEach(({ s, y }, i) => { s.position.set(0.2 * Math.sin(f * 0.04 + i * 2), y + 0.06 * Math.sin(f * 0.05 + i), 0.15 * Math.cos(f * 0.04 + i)); }); g.rotation.y = 0.4 * Math.sin(f * 0.011); });
  },
};

export const destilador: HeroDef = {
  kind: "primitive",
  when: "Destilación y evaporación: separar mezclas, agua potable del mar, cómo se hace el alcohol, condensación, por qué hierve primero una sustancia que otra, vapor que vuelve líquido.",
  poses: ["destila"],
  center: [0, 1.2, 0], radius: 1.4,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], matraz: [-1.3, 0.9, 0], condensador: [0, 1.7, 0.2], recogida: [1.4, 0.5, 0], llama: [-1.3, 0.1, 0] },
  build: (_L, pose) => {
    poseOf(destilador, pose, "destilador");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const gl = ghostMat(b, "#d8ecff", 0.22), flaskP = [[0.02, 0], [0.55, 0.02], [0.6, 0.15], [0.55, 0.7], [0.2, 1.1], [0.16, 1.5]].map(([r, y]) => new THREE.Vector2(r, y));
    const flask = new THREE.Mesh(b.track(new THREE.LatheGeometry(flaskP, 28)), gl); flask.position.set(-1.3, 0.35, 0);
    const liq = cyl(b, 0.52, 0.52, 0.4, glowMat(b, "#6ab0ff", 0.4, { transparent: true, opacity: 0.8 }), 24); liq.position.set(-1.3, 0.62, 0);
    const neck = tube(b, [[-1.3, 1.8, 0], [-1.0, 2.1, 0], [-0.6, 2.0, 0]], 0.1, gl, 20), cond = cyl(b, 0.22, 0.22, 1.9, gl, 20); cond.rotation.z = Math.PI / 2 - 0.35; cond.position.set(0.2, 1.65, 0);
    const jacket = cyl(b, 0.34, 0.34, 1.5, glowMat(b, "#5fd4f4", 0.2, { transparent: true, opacity: 0.25, depthWrite: false }), 20); jacket.rotation.z = cond.rotation.z; jacket.position.copy(cond.position);
    const out = tube(b, [[1.0, 1.3, 0], [1.4, 1.1, 0], [1.4, 0.95, 0]], 0.06, gl, 10), beaker = cyl(b, 0.4, 0.36, 0.7, gl, 24); beaker.position.set(1.4, 0.45, 0);
    const clear = cyl(b, 0.34, 0.32, 0.12, glowMat(b, "#e8fbff", 0.5, { transparent: true, opacity: 0.8 }), 20); clear.position.set(1.4, 0.15, 0);
    const flame = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.2, 0.45, 14)), beam(b, "#ffb24a", 1.6, { transparent: true, opacity: 0.9 })); flame.position.set(-1.3, -0.05, 0);
    const vap = scatter(9, 4, (r) => [r(), 0, 0] as P3).map((q) => ({ s: ball(b, 0.07, beam(b, "#e8f4ff", 1.3, { transparent: true, opacity: 0.7 }), 8), q }));
    const drip = ball(b, 0.05, beam(b, TONE.cyan, 1.8), 8), curve = new THREE.CatmullRomCurve3([[-1.3, 1.5, 0], [-1.3, 1.85, 0], [-1.0, 2.1, 0], [-0.4, 2.0, 0], [0.2, 1.65, 0], [1.0, 1.3, 0]].map((q) => new THREE.Vector3(...(q as P3))));
    g.add(flask, liq, neck, jacket, cond, out, beaker, clear, flame, drip, ...vap.map((v) => v.s)); g.position.set(0.0, 0.0, 0); root.add(g); shadows(g);
    return done(root, b, (f) => { vap.forEach(({ s, q }, i) => { s.position.copy(curve.getPoint(((f * 0.006 + i / 9) % 1))); }); drip.position.set(1.4, 0.95 - 0.7 * ((f * 0.02) % 1), 0); clear.scale.y = 1 + 2 * ((f * 0.001) % 1); flame.scale.set(1, 1 + 0.2 * Math.sin(f * 0.5), 1); g.rotation.y = 0.4 * Math.sin(f * 0.01); });
  },
};
