// Pack C (2.ª tanda) · Mente: balanza de decisiones, bombilla de ideas, espejo, rompecabezas, bucle de hábitos y reloj de arena.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, ghostMat, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const balanza_decision: HeroDef = {
  kind: "primitive",
  when: "Decisiones y juicio: pros y contras, sesgos, por qué decidimos mal, elegir entre dos opciones, justicia, equilibrio entre dos ideas, dilemas.",
  poses: ["equilibrio", "inclinada"],
  center: [0, 1.5, 0], radius: 1.5,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], plato_izq: [-1.3, 1.0, 0.1], plato_der: [1.3, 1.0, 0.1], eje: [0, 2.4, 0] },
  build: (_L, pose) => {
    const p = poseOf(balanza_decision, pose, "balanza_decision"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), gold = glowMat(b, TONE.gold, 0.3, { metalness: 0.6, roughness: 0.3 });
    const post = cyl(b, 0.07, 0.1, 2.3, gold, 14); post.position.y = 1.25; const base = cyl(b, 0.6, 0.7, 0.14, gold, 28); base.position.y = 0.07;
    const beamG = new THREE.Group(), bar = box(b, 3.2, 0.09, 0.12, gold); beamG.add(bar, place(ball(b, 0.14, gold, 12), [0, 0.06, 0])); beamG.position.y = 2.4;
    const pan = (s: number, c: string, n: number) => { const a = new THREE.Group(); a.add(rod(b, [0, 0, 0], [-0.5, -1.0, 0], 0.012, gold), rod(b, [0, 0, 0], [0.5, -1.0, 0], 0.012, gold), place(cyl(b, 0.62, 0.5, 0.08, gold, 24), [0, -1.0, 0])); for (let i = 0; i < n; i++) a.add(place(ball(b, 0.2 - 0.02 * i, glowMat(b, c, 0.4), 14), [(i - (n - 1) / 2) * 0.32, -0.8 + 0.0, 0])); a.position.set(s * 1.55, 0, 0); return a; };
    const L = pan(-1, TONE.cyan, 2), R = pan(1, TONE.glowRed, 3); beamG.add(L, R); g.add(post, base, beamG); root.add(g); shadows(g);
    return done(root, b, (f) => { const t = p === "equilibrio" ? 0.16 * Math.sin(f * 0.05) : 0.32 + 0.04 * Math.sin(f * 0.08); beamG.rotation.z = t; L.rotation.z = -t; R.rotation.z = -t; g.rotation.y = 0.3 * Math.sin(f * 0.01); });
  },
};

export const bombilla_idea: HeroDef = {
  kind: "primitive",
  when: "Ideas y creatividad: tener una idea, el momento eureka, inspiración, aprender algo nuevo, curiosidad, resolver un problema, cuando 'se enciende la bombilla'.",
  poses: ["apagada", "encendida"],
  center: [0, 1.5, 0], radius: 1.2,
  anchors: { hero: [0, 1.7, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], filamento: [0, 1.7, 0], rosca: [0, 0.9, 0], rayos: [1.0, 2.2, 0] },
  build: (_L, pose) => {
    const p = poseOf(bombilla_idea, pose, "bombilla_idea"), on = p === "encendida", b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const glass = ball(b, 0.8, on ? glowMat(b, "#ffe9a0", 1.0, { transparent: true, opacity: 0.9, roughness: 0.2 }) : ghostMat(b, "#cfe0ff", 0.3), 36); glass.position.y = 1.9;
    const neck = cyl(b, 0.38, 0.3, 0.5, on ? glowMat(b, "#ffe9a0", 0.8, { transparent: true, opacity: 0.85 }) : ghostMat(b, "#cfe0ff", 0.3), 24); neck.position.y = 1.25;
    const screw = [0, 1, 2].map((i) => place(cyl(b, 0.3, 0.3, 0.11, mat(b, "#aeb8d6", { metalness: 0.8, roughness: 0.3 }), 20), [0, 0.95 - i * 0.14, 0]));
    const fil = tube(b, [[-0.2, 1.4, 0], [-0.2, 1.8, 0], [-0.08, 2.0, 0], [0.08, 1.8, 0], [0.2, 2.0, 0], [0.2, 1.4, 0]], 0.025, on ? beam(b, "#fff6d0", 2.2) : mat(b, "#6a6f85"), 30);
    const sh = halo(b, "rgba(255,226,140,0.95)", 5, on ? 0.9 : 0); sh.position.set(0, 1.9, -0.3);
    const rays = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 6.28; return rod(b, [Math.cos(a) * 1.05, 1.9 + Math.sin(a) * 1.05, 0], [Math.cos(a) * 1.4, 1.9 + Math.sin(a) * 1.4, 0], 0.03, beam(b, "#ffe08a", 1.6)); });
    g.add(glass, neck, ...screw, fil, sh); if (on) g.add(...rays); root.add(g); shadows(g);
    return done(root, b, (f) => { const k = on ? 1 + 0.06 * Math.sin(f * 0.2) : 1; sh.scale.setScalar(k); rays.forEach((r, i) => { r.visible = Math.sin(f * 0.15 + i * 0.9) > -0.5; }); g.rotation.y = 0.3 * Math.sin(f * 0.01); if (!on) fil.visible = true; });
  },
};

export const espejo_reflejo: HeroDef = {
  kind: "primitive",
  when: "Espejos e identidad: verse al espejo, autoimagen, por qué el espejo invierte izquierda y derecha, reconocerse a uno mismo, reflejos, el 'yo'.",
  poses: ["espejo"],
  center: [0, 1.5, 0], radius: 1.3,
  anchors: { hero: [0, 1.5, 0.1], top: [0, 3.0, 0], base: [0, 0.1, 0], reflejo: [0, 1.7, 0.1], marco: [0.9, 1.5, 0.1], brillo: [-0.4, 2.3, 0.1] },
  build: (_L, pose) => {
    poseOf(espejo_reflejo, pose, "espejo_reflejo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 512, 768, (c) => { const gr = c.createLinearGradient(0, 0, 512, 768); gr.addColorStop(0, "#5a6aa8"); gr.addColorStop(1, "#1e2650"); c.fillStyle = gr; c.fillRect(0, 0, 512, 768); c.fillStyle = "#f4c04a"; c.beginPath(); c.arc(256, 300, 110, 0, 6.3); c.fill(); c.fillStyle = "#3a2a1a"; c.beginPath(); c.arc(220, 285, 12, 0, 6.3); c.arc(292, 285, 12, 0, 6.3); c.fill(); c.strokeStyle = "#3a2a1a"; c.lineWidth = 9; c.lineCap = "round"; c.beginPath(); c.arc(256, 320, 52, 0.25, Math.PI - 0.25); c.stroke(); c.fillStyle = "#4a6ac8"; c.beginPath(); c.ellipse(256, 600, 170, 140, 0, Math.PI, 0); c.fill(); });
    const glass = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.85, 48)), b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.5), roughness: 0.1 }))); glass.scale.y = 1.35; glass.position.set(0, 1.7, 0.02);
    const frame = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.9, 0.09, 12, 48)), glowMat(b, TONE.gold, 0.35, { metalness: 0.6 })); frame.scale.y = 1.35; frame.position.set(0, 1.7, 0);
    const legs = [-1, 1].map((s) => rod(b, [s * 0.5, 0.6, -0.05], [s * 0.85, 0.05, -0.3], 0.05, glowMat(b, TONE.gold, 0.3)));
    const shine = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.25, 1.6)), b.track(new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }))); shine.position.set(-0.5, 1.7, 0.04); shine.rotation.z = 0.5;
    g.add(glass, frame, ...legs, shine); root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.4 * Math.sin(f * 0.012); shine.position.x = -0.6 + 1.2 * ((f * 0.008) % 1); (shine.material as THREE.MeshBasicMaterial).opacity = 0.35 * Math.sin(((f * 0.008) % 1) * Math.PI); });
  },
};

export const rompecabezas: HeroDef = {
  kind: "primitive",
  when: "Rompecabezas y resolver problemas: encajar piezas, pensamiento lógico, lo que falta en una explicación, cómo el cerebro completa patrones, juegos de ingenio.",
  poses: ["armado", "falta"],
  center: [0, 1.4, 0], radius: 1.4,
  anchors: { hero: [0, 1.4, 0.1], top: [0, 2.6, 0], base: [0, 0.1, 0], hueco: [0.55, 0.85, 0.1], pieza: [0.55, 1.9, 0.1], centro: [0, 1.4, 0.1] },
  build: (_L, pose) => {
    const p = poseOf(rompecabezas, pose, "rompecabezas"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const cols = [TONE.cyan, TONE.gold, TONE.green, "#b36bff"], pieces: THREE.Group[] = [];
    cols.forEach((c, i) => { const pc = new THREE.Group(), m = glowMat(b, c, 0.35, { roughness: 0.5 }); pc.add(box(b, 0.95, 0.95, 0.18, m), place(ball(b, 0.17, m, 14), [i % 2 ? -0.52 : 0.52, 0, 0]), place(ball(b, 0.17, m, 14), [0, i < 2 ? -0.52 : 0.52, 0])); pc.position.set((i % 2 ? 0.55 : -0.55), (i < 2 ? 0.55 : -0.55), 0); pieces.push(pc); g.add(pc); });
    if (p === "falta") pieces[3].visible = false;
    const ghost = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.95, 0.95, 0.18)), b.track(new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.12, depthWrite: false })));
    ghost.position.copy(pieces[3].position); ghost.visible = p === "falta"; g.add(ghost);
    g.position.y = 1.4; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.4 * Math.sin(f * 0.012); if (p === "falta") (ghost.material as THREE.MeshBasicMaterial).opacity = 0.1 + 0.1 * Math.sin(f * 0.1); else pieces.forEach((pc, i) => { pc.position.z = 0.04 * Math.sin(f * 0.05 + i * 1.5); }); });
  },
};

export const habito_bucle: HeroDef = {
  kind: "primitive",
  when: "Hábitos y rutinas: ciclos, adicciones, procrastinación, por qué repetimos conductas, bucles de recompensa, rutinas, cómo se forma un hábito.",
  poses: ["bucle"],
  center: [0, 1.4, 0], radius: 1.4,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.6, 0], base: [0, 0.2, 0], senal: [0, 2.4, 0], rutina: [1.1, 1.4, 0], recompensa: [0, 0.4, 0] },
  build: (_L, pose) => {
    poseOf(habito_bucle, pose, "habito_bucle");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), ring = new THREE.Group();
    const cs = [TONE.cyan, TONE.gold, TONE.glowRed];
    cs.forEach((c, i) => { const a0 = (i / 3) * Math.PI * 2 + 0.2, a1 = a0 + Math.PI * 2 / 3 - 0.55, pts: P3[] = Array.from({ length: 24 }, (_, k) => { const a = a0 + (a1 - a0) * (k / 23); return [Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0] as P3; }); ring.add(tube(b, pts, 0.07, glowMat(b, c, 0.6), 40)); const e = pts[23], d = Math.atan2(e[1], e[0]) + Math.PI / 2, h = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.2, 0.4, 14)), glowMat(b, c, 0.7)); h.position.set(e[0], e[1], 0); h.rotation.z = d - Math.PI / 2 + Math.PI; ring.add(h); ring.add(place(ball(b, 0.2, glowMat(b, c, 0.8), 14), [Math.cos(a0 - 0.1) * 1.1, Math.sin(a0 - 0.1) * 1.1, 0])); });
    const core = ball(b, 0.34, glowMat(b, TONE.lavender, 0.6, { transparent: true, opacity: 0.85 }), 24), hl = halo(b, "rgba(179,107,255,0.8)", 2.0, 0.5); hl.position.z = -0.1;
    ring.position.y = 1.4; core.position.y = 1.4; hl.position.y = 1.4; g.add(ring, core, hl); root.add(g); shadows(g);
    return done(root, b, (f) => { ring.rotation.z = -f * 0.02; core.scale.setScalar(1 + 0.08 * Math.sin(f * 0.1)); g.rotation.y = 0.5 * Math.sin(f * 0.01); });
  },
};

export const arena_tiempo: HeroDef = {
  kind: "primitive",
  when: "Tiempo: cómo percibimos el tiempo, por qué el tiempo parece pasar más rápido con la edad, esperar, relojes de arena, plazos, la paradoja del tiempo y la espera.",
  poses: ["cae"],
  center: [0, 1.45, 0], radius: 1.3,
  anchors: { hero: [0, 1.45, 0], top: [0, 2.8, 0], base: [0, 0.1, 0], cuello: [0, 1.45, 0], arena_arriba: [0, 2.1, 0], arena_abajo: [0, 0.6, 0] },
  build: (_L, pose) => {
    poseOf(arena_tiempo, pose, "arena_tiempo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const prof = [[0.02, 0], [0.7, 0.08], [0.75, 0.2], [0.6, 0.8], [0.2, 1.25], [0.06, 1.4], [0.2, 1.55], [0.6, 2.0], [0.75, 2.6], [0.7, 2.72], [0.02, 2.8]].map(([r, y]) => new THREE.Vector2(r, y));
    const glass = new THREE.Mesh(b.track(new THREE.LatheGeometry(prof, 40)), ghostMat(b, "#cfe7ff", 0.22, { roughness: 0.05 }));
    const wood = glowMat(b, "#8a5a3a", 0.15), caps = [0.04, 2.76].map((y) => place(cyl(b, 0.9, 0.9, 0.12, wood, 28), [0, y, 0]));
    const posts = [0, 1, 2].map((i) => { const a = (i / 3) * 6.28; return rod(b, [Math.cos(a) * 0.82, 0.05, Math.sin(a) * 0.82], [Math.cos(a) * 0.82, 2.75, Math.sin(a) * 0.82], 0.035, wood); });
    const sand = glowMat(b, "#f0c070", 0.35), top = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.62, 0.8, 28)), sand), bot = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.62, 0.7, 28)), sand), stream = cyl(b, 0.015, 0.015, 1.3, sand, 6), grains = scatter(10, 3, (r) => [(r() - 0.5) * 0.05, r(), (r() - 0.5) * 0.05] as P3).map((q) => ({ s: ball(b, 0.02, sand, 6), q }));
    top.position.y = 1.85; top.rotation.x = Math.PI; bot.position.y = 0.45; stream.position.y = 1.0;
    g.add(glass, ...caps, ...posts, top, bot, stream, ...grains.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { const t = (f * 0.004) % 1; top.scale.set(1, 1 - 0.8 * t + 0.01, 1); top.position.y = 1.45 + 0.4 * (1 - t) * 0.98 + 0.0; bot.scale.set(1, 0.3 + 0.9 * t, 1); bot.position.y = 0.1 + 0.35 * (0.3 + 0.9 * t); grains.forEach(({ s, q }, i) => { const u = (f * 0.03 + q[1] + i * 0.1) % 1; s.position.set(q[0], 1.7 - u * 1.1, q[2]); }); g.rotation.y = 0.4 * Math.sin(f * 0.01); });
  },
};
