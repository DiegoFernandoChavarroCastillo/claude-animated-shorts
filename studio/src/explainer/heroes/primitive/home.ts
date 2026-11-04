// Pack I · Hogar, ingeniería y números (F11): microondas, olla que hierve, puente, pirámide, palanca, números
// flotantes (π, ∞, dado), patrón de Fibonacci, batería, router wifi y pantalla de píxeles. Genéricos y sin marcas.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, ghostMat, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const microondas: HeroDef = {
  kind: "primitive",
  when: "Microondas: cómo calienta la comida, ondas, por qué se calienta el agua primero, por qué no se meten metales, comida que explota, cocina.",
  poses: ["funciona"],
  center: [0, 1.0, 0], radius: 1.25,
  anchors: { hero: [0, 1.0, 0.5], top: [0, 2.1, 0], base: [0, 0.05, 0], puerta: [-0.3, 1.0, 0.7], plato: [-0.3, 0.45, 0.4], panel: [0.85, 1.0, 0.7], onda: [-0.3, 1.3, 0.3] },
  build: (_L, pose) => {
    poseOf(microondas, pose, "microondas");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const shell = mat(b, "#cfd3e0", { roughness: 0.4, metalness: 0.5 }), dark = mat(b, "#1b1f33", { roughness: 0.5 });
    g.add(place(box(b, 2.4, 1.5, 1.4, shell), [0, 0.8, 0]));
    const glass = new THREE.Mesh(b.track(new THREE.PlaneGeometry(1.5, 1.05)), glowMat(b, "#2a2f4a", 0.25, { transparent: true, opacity: 0.55, roughness: 0.1 })); glass.position.set(-0.35, 0.85, 0.72);
    const inside = new THREE.Mesh(b.track(new THREE.PlaneGeometry(1.5, 1.05)), glowMat(b, "#ffd9a0", 0.5)); inside.position.set(-0.35, 0.85, 0.71);
    const panel = place(box(b, 0.5, 1.2, 0.04, dark), [0.85, 0.8, 0.71]), btn = [0, 1, 2, 3].map((i) => place(ball(b, 0.05, glowMat(b, i === 0 ? TONE.green : TONE.cyan, 0.8), 8), [0.85, 1.1 - i * 0.22, 0.74]));
    const plate = new THREE.Group(), tray = cyl(b, 0.5, 0.5, 0.03, glowMat(b, "#e8f1ff", 0.3, { transparent: true, opacity: 0.8 }), 28), mug = cyl(b, 0.16, 0.14, 0.26, glowMat(b, "#e8e4f8", 0.3), 18), liq = cyl(b, 0.14, 0.14, 0.02, glowMat(b, TONE.cyan, 0.6), 18);
    mug.position.set(0.15, 0.16, 0); liq.position.set(0.15, 0.28, 0); plate.add(tray, mug, liq); plate.position.set(-0.35, 0.42, 0.25);
    const rings = [0, 1, 2, 3].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(0.3, 0.012, 6, 40)), beam(b, "#ffb24a", 1.5, { transparent: true, opacity: 0.8 })));
    rings.forEach((r) => { r.rotation.y = Math.PI / 2; g.add(r); });
    g.add(inside, glass, panel, ...btn, plate); g.rotation.y = -0.25; root.add(g); shadows(g);
    return done(root, b, (f) => {
      plate.rotation.y = f * 0.04; rings.forEach((r, i) => { const t = (f * 0.015 + i / 4) % 1; r.position.set(-1.1 + t * 1.5, 1.15 - 0.3 * Math.sin(t * 3 + i), 0.3); r.scale.setScalar(0.5 + t * 0.8); (r.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t); });
      g.rotation.y = -0.25 + 0.25 * Math.sin(f * 0.01);
    });
  },
};

export const olla_hierve: HeroDef = {
  kind: "primitive",
  when: "Agua hirviendo: ebullición, vapor, burbujas, por qué la olla a presión cocina más rápido, hervir a la altura, por qué la sal, cocinar pasta, calor.",
  poses: ["hierve"],
  center: [0, 1.0, 0], radius: 1.4,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.8, 0], base: [0, 0.05, 0], agua: [0, 1.3, 0.7], burbujas: [0.2, 1.1, 0.5], vapor: [0, 2.4, 0], llama: [0, 0.15, 0.5] },
  build: (_L, pose) => {
    poseOf(olla_hierve, pose, "olla_hierve");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const steel = mat(b, "#b8c0d6", { metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(b.track(new THREE.CylinderGeometry(1.0, 1.0, 1.3, 48, 1, true, Math.PI / 2, Math.PI * 1.55)), steel); wall.position.y = 0.95;
    const floor = cyl(b, 1.0, 1.0, 0.06, steel, 40); floor.position.y = 0.3;
    const water = cyl(b, 0.96, 0.96, 0.9, glowMat(b, "#3a8ae0", 0.3, { transparent: true, opacity: 0.72, roughness: 0.15 }), 40); water.position.y = 0.78;
    const surf = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.96, 40)), glowMat(b, "#7fc0ff", 0.4)); surf.rotation.x = -Math.PI / 2; surf.position.y = 1.24;
    const handle = [-1, 1].map((s) => place(box(b, 0.5, 0.1, 0.12, mat(b, "#2a2f4a")), [s * 1.2, 1.5, 0]));
    const flame = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.6, 0.05, 8, 40)), beam(b, "#6ab0ff", 1.6, { transparent: true, opacity: 0.85 })); flame.rotation.x = Math.PI / 2; flame.position.y = 0.12;
    const burner = cyl(b, 0.9, 0.9, 0.1, mat(b, "#2a2f4a", { metalness: 0.5 }), 30); burner.position.y = 0.02;
    const bub = scatter(24, 6, (r) => { const a = r() * 6.28, d = Math.sqrt(r()) * 0.8; return [Math.cos(a) * d, r(), Math.sin(a) * d] as P3; }).map((q) => ({ s: ball(b, 0.06, beam(b, "#e8fbff", 1.2, { transparent: true, opacity: 0.8 }), 8), q }));
    const steam = scatter(9, 3, (r) => [(r() - 0.5) * 1.2, r(), (r() - 0.5) * 0.8] as P3).map((q) => ({ s: ball(b, 0.22, mat(b, "#eef0fa", { transparent: true, opacity: 0.35, roughness: 1, depthWrite: false }), 10), q }));
    g.add(wall, floor, water, surf, ...handle, flame, burner, ...bub.map((x) => x.s), ...steam.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => {
      bub.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.02 + i * 0.07) % 1; s.position.set(q[0], 0.45 + t * 0.8, q[2]); s.scale.setScalar(0.6 + t * 0.9); });
      steam.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.008 + i * 0.11) % 1; s.position.set(q[0] * (1 + t), 1.4 + t * 1.8, q[2]); s.scale.setScalar(0.6 + t * 2); (s.material as THREE.MeshStandardMaterial).opacity = 0.4 * (1 - t); });
      flame.scale.setScalar(1 + 0.05 * Math.sin(f * 0.5)); surf.position.y = 1.24 + 0.01 * Math.sin(f * 0.3); g.rotation.y = 0.45 + 0.2 * Math.sin(f * 0.01);
    });
  },
};

export const puente: HeroDef = {
  kind: "primitive",
  when: "Puentes e ingeniería de estructuras: arcos, cables, cómo aguanta un puente el peso, resonancia, por qué se cae un puente, tensión y compresión.",
  poses: ["arco", "colgante"],
  center: [0, 1.1, 0], radius: 1.75,
  anchors: { hero: [0, 1.1, 0], top: [0, 2.6, 0], base: [0, 0.05, 0], tablero: [0, 0.75, 0.4], cable: [0, 2.0, 0], pilar: [-1.8, 0.9, 0], arco: [0, 1.9, 0] },
  build: (_L, pose) => {
    const p = poseOf(puente, pose, "puente"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const deck = mat(b, "#b8bfd6", { roughness: 0.5, metalness: 0.3 }), steel = glowMat(b, p === "arco" ? "#e2762a" : "#e2523a", 0.3, { metalness: 0.5, roughness: 0.4 }), water = glowMat(b, "#2f7de0", 0.3, { transparent: true, opacity: 0.8 });
    g.add(place(box(b, 4.6, 0.14, 1.0, deck), [0, 0.75, 0]), place(box(b, 5.4, 0.06, 3.2, water), [0, 0.03, 0]));
    const towers: THREE.Object3D[] = [], cables: THREE.Object3D[] = [];
    if (p === "arco") {
      const pts: P3[] = Array.from({ length: 31 }, (_, i) => { const t = (i / 30) * 2 - 1; return [t * 2.2, 0.8 + (1 - t * t) * 1.3, 0.45] as P3; }), pts2 = pts.map(([x, y]) => [x, y, -0.45] as P3);
      cables.push(tube(b, pts, 0.07, steel, 50), tube(b, pts2, 0.07, steel, 50));
      for (let i = 2; i < 30; i += 2) { const [x, y] = pts[i]; cables.push(rod(b, [x, 0.8, 0.45], [x, y, 0.45], 0.02, steel), rod(b, [x, 0.8, -0.45], [x, y, -0.45], 0.02, steel)); }
    } else {
      for (const s of [-1, 1]) towers.push(place(box(b, 0.14, 2.3, 0.14, steel), [s * 1.5, 1.2, 0.5]), place(box(b, 0.14, 2.3, 0.14, steel), [s * 1.5, 1.2, -0.5]));
      for (const z of [0.5, -0.5]) {
        const main: P3[] = Array.from({ length: 41 }, (_, i) => { const t = (i / 40) * 2 - 1; return [t * 2.3, 0.9 + 1.3 * (t * t) * (Math.abs(t) < 0.65 ? 1 : 0.65), z] as P3; });
        cables.push(tube(b, main, 0.03, steel, 60));
        for (let i = 6; i <= 34; i += 2) { const [x, y] = main[i]; cables.push(rod(b, [x, 0.8, z], [x, y, z], 0.012, steel)); }
      }
    }
    for (const s of [-1, 1]) g.add(place(box(b, 0.3, 0.8, 1.2, mat(b, "#7a6a60", { roughness: 0.9 })), [s * 2.35, 0.45, 0]));
    const car = place(box(b, 0.3, 0.12, 0.2, glowMat(b, TONE.glowRed, 0.5)), [0, 0.88, 0.2]);
    g.add(...towers, ...cables, car); g.rotation.y = 0.5; root.add(g); shadows(g);
    return done(root, b, (f) => { car.position.x = -2 + ((f * 0.02) % 4); g.rotation.y = 0.5 + 0.2 * Math.sin(f * 0.01); });
  },
};

export const piramide: HeroDef = {
  kind: "primitive",
  when: "Pirámides y monumentos antiguos: Egipto, cómo se construyeron, piedra, geometría, mausoleos, civilizaciones antiguas, arquitectura histórica.",
  poses: ["escalonada"],
  center: [0, 1.0, 0], radius: 1.6,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.3, 0], base: [0, 0.05, 0], cima: [0, 2.0, 0], bloque: [0.8, 0.5, 1.0], entrada: [0, 0.3, 1.1] },
  build: (_L, pose) => {
    poseOf(piramide, pose, "piramide");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const L = 10, stone = (i: number) => glowMat(b, col("#d9b27a", "#b8905a", (i % 3) / 3), 0.12, { roughness: 0.95 });
    const blocks: THREE.Mesh[] = [];
    for (let i = 0; i < L; i++) { const w = 3.6 * (1 - i / L), m = place(box(b, w, 0.22, w, stone(i)), [0, 0.11 + i * 0.22, 0]); g.add(m); blocks.push(m); }
    const sand = place(box(b, 7, 0.04, 6, glowMat(b, "#e8c88a", 0.12)), [0, 0.0, 0]);
    const ramp = place(box(b, 0.5, 0.06, 2.4, glowMat(b, "#c9a468", 0.1)), [1.0, 0.15, 1.5]); ramp.rotation.set(-0.25, 0, 0.25);
    const sun = place(halo(b, "rgba(255,225,150,0.95)", 3.0, 0.8), [-2.5, 2.8, -1.5]);
    g.add(sand, ramp, sun); g.rotation.y = 0.6; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.6 + 0.35 * Math.sin(f * 0.009); sun.scale.setScalar(1 + 0.05 * Math.sin(f * 0.04)); });
  },
};

export const palanca: HeroDef = {
  kind: "primitive",
  when: "Palanca y máquinas simples: balancín, equilibrio, por qué una palanca levanta más peso, poleas, ruedas, ventaja mecánica, Arquímedes.",
  poses: ["equilibrio", "ventaja"],
  center: [0, 1.2, 0], radius: 1.55,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.4, 0], base: [0, 0.05, 0], fulcro: [0, 0.5, 0.2], carga: [-1.6, 1.2, 0], fuerza: [1.7, 1.0, 0] },
  build: (_L, pose) => {
    const p = poseOf(palanca, pose, "palanca"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const wood = mat(b, "#c9944a", { roughness: 0.7 }), steel = mat(b, "#aeb8d6", { metalness: 0.7, roughness: 0.3 });
    const fx = p === "ventaja" ? -0.9 : 0;
    const base = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.45, 0.7, 3)), steel); base.position.set(fx, 0.38, 0); base.rotation.y = Math.PI / 6;
    const plank = new THREE.Group(), board = box(b, 4.4, 0.12, 0.7, wood); plank.add(board); plank.position.set(fx, 0.78, 0);
    const heavy = place(box(b, 0.8, 0.8, 0.8, glowMat(b, TONE.glowRed, 0.25)), [fx === 0 ? -1.6 : -0.95 - 0.0, 0.46, 0]), light = place(box(b, 0.4, 0.4, 0.4, glowMat(b, TONE.cyan, 0.3)), [p === "ventaja" ? 1.8 : 1.6, 0.26, 0]);
    heavy.position.x = p === "ventaja" ? -1.4 : -1.6; plank.add(heavy, light); heavy.position.y = 0.46; light.position.y = 0.26;
    const ground = place(box(b, 5.2, 0.05, 1.4, glowMat(b, "#3a4a7a", 0.2)), [0, 0.02, 0]);
    g.add(base, plank, ground); g.rotation.y = 0.35; root.add(g); shadows(g);
    return done(root, b, (f) => { plank.rotation.z = p === "equilibrio" ? 0.12 * Math.sin(f * 0.04) : -0.18 + 0.05 * Math.sin(f * 0.05); g.rotation.y = 0.35 + 0.2 * Math.sin(f * 0.01); });
  },
};

const NUM: Record<string, string[]> = { pi: ["π", "3.14159", "26535"], infinito: ["∞"], dado: [] };

export const numeros_flotantes: HeroDef = {
  kind: "primitive",
  when: "Matemáticas y números: pi, el infinito, probabilidad y dados, por qué existen los números irracionales, azar, la paradoja de los cumpleaños, cuánto es un millón.",
  poses: ["pi", "infinito", "dado"],
  center: [0, 1.4, 0], radius: 1.4,
  anchors: { hero: [0, 1.4, 0.2], top: [0, 2.6, 0], base: [0, 0.1, 0], simbolo: [0, 1.5, 0.2], digitos: [0, 0.6, 0.2], cara: [0.5, 1.9, 0.7] },
  build: (_L, pose) => {
    const p = poseOf(numeros_flotantes, pose, "numeros_flotantes"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const parts: THREE.Object3D[] = [];
    if (p === "dado") {
      const face = (n: number) => screenTex(b.track, 256, 256, (c) => { c.fillStyle = "#f6f2e6"; c.fillRect(0, 0, 256, 256); c.fillStyle = "#1b1b3a"; const P: Record<number, [number, number][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] }; P[n].forEach(([x, y]) => { c.beginPath(); c.arc(64 + x * 64, 64 + y * 64, 22, 0, 6.3); c.fill(); }); });
      const mats = [3, 4, 1, 6, 2, 5].map((n) => { const t = face(n); return b.track(new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color("#ffffff").multiplyScalar(0.35), roughness: 0.4 })); });
      const die = new THREE.Mesh(b.track(new THREE.BoxGeometry(1.4, 1.4, 1.4)), mats); die.position.y = 1.4; parts.push(die);
    } else {
      NUM[p].forEach((t, i) => { const big = i === 0; const s = big ? 1.9 : 0.5; const tex = screenTex(b.track, 512, big ? 512 : 128, (c) => { c.clearRect(0, 0, 512, 512); c.fillStyle = big ? TONE.gold : TONE.cyan; c.font = `800 ${big ? 420 : 90}px Montserrat, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(t, 256, big ? 270 : 64); });
        const m = new THREE.Mesh(b.track(new THREE.PlaneGeometry(big ? s : s * 5.5, big ? s : s * 1.4)), b.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, color: col("#ffffff").multiplyScalar(1.2) }))); m.position.set(0, big ? 1.6 : 0.5 - (i - 1) * 0.35, 0); parts.push(m); });
    }
    const dust = scatter(30, 3, (r) => [(r() - 0.5) * 3, 0.3 + r() * 2.4, (r() - 0.5) * 1.5] as P3).map((q) => ({ s: ball(b, 0.03, beam(b, "#ffffff", 1.4), 6), q }));
    g.add(...parts, ...dust.map((d) => d.s)); root.add(g); shadows(g);
    return done(root, b, (f) => {
      dust.forEach(({ s, q }, i) => s.position.set(q[0], q[1] + 0.1 * Math.sin(f * 0.03 + i), q[2]));
      if (p === "dado") { parts[0].rotation.set(0.5 + f * 0.012, f * 0.017, 0.2); parts[0].position.y = 1.4 + 0.1 * Math.sin(f * 0.05); }
      else { g.rotation.y = 0.25 * Math.sin(f * 0.012); parts[0].position.y = 1.6 + 0.06 * Math.sin(f * 0.05); }
    });
  },
};

export const forma_fibonacci: HeroDef = {
  kind: "primitive",
  when: "Patrones matemáticos en la naturaleza: Fibonacci y la proporción áurea, espirales de girasoles, caracoles y piñas, el ángulo áureo, simetría, fractales.",
  poses: ["girasol", "espiral"],
  center: [0, 1.4, 0], radius: 1.5,
  anchors: { hero: [0, 1.4, 0.2], top: [0, 2.7, 0], base: [0, 0.1, 0], centro: [0, 1.4, 0.2], borde: [1.2, 1.4, 0.2], espiral: [0.9, 1.9, 0.2] },
  build: (_L, pose) => {
    const p = poseOf(forma_fibonacci, pose, "forma_fibonacci"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const N = p === "girasol" ? 340 : 120, GA = Math.PI * (3 - Math.sqrt(5)), mesh = (i: number) => ball(b, p === "girasol" ? 0.045 + 0.03 * (i / N) : 0.05, glowMat(b, col(TONE.gold, p === "girasol" ? "#a85a1a" : TONE.cyan, i / N), 0.6), 8);
    const seeds = Array.from({ length: N }, (_, i) => { const s = mesh(i); const r = (p === "girasol" ? 1.2 : 1.35) * Math.sqrt(i / N), a = i * GA; s.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); g.add(s); return s; });
    if (p === "espiral") { const pts: P3[] = Array.from({ length: 140 }, (_, i) => { const t = i / 139 * 3.1 * Math.PI, r = 0.06 * Math.pow(1.618, t / (Math.PI / 2)); return [Math.cos(t) * r, Math.sin(t) * r, 0.02] as P3; }); g.add(tube(b, pts, 0.03, beam(b, TONE.gold, 1.5), 140)); }
    g.position.y = 1.4; g.rotation.x = -0.45; root.add(g);
    return done(root, b, (f) => { g.rotation.z = f * 0.006; g.rotation.y = 0.3 * Math.sin(f * 0.01); seeds.forEach((s, i) => { s.position.z = 0.04 * Math.sin(f * 0.04 + i * 0.1); }); });
  },
};

export const bateria: HeroDef = {
  kind: "primitive",
  when: "Baterías y pilas: cómo almacenan energía, por qué se gastan, electrones y carga, el litio, por qué se calienta el celular al cargar, autonomía.",
  poses: ["descarga", "carga"],
  center: [0, 1.3, 0], radius: 1.4,
  anchors: { hero: [0, 1.3, 0.3], top: [0, 2.8, 0], base: [0, 0.05, 0], positivo: [0, 2.7, 0], negativo: [0, 0.1, 0], electrolito: [0, 1.4, 0.5] },
  build: (_L, pose) => {
    const p = poseOf(bateria, pose, "bateria"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const casing = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.75, 0.75, 2.4, 40, 1, true, Math.PI / 2, Math.PI * 1.45)), glowMat(b, "#4a78e8", 0.2, { side: THREE.DoubleSide, roughness: 0.4 })); casing.position.y = 1.3;
    const cap = cyl(b, 0.28, 0.28, 0.22, mat(b, "#d0d4e4", { metalness: 0.8, roughness: 0.3 }), 20); cap.position.y = 2.6; const bot = cyl(b, 0.75, 0.75, 0.08, mat(b, "#2a2f4a", { metalness: 0.5 }), 32); bot.position.y = 0.08; const top = cyl(b, 0.75, 0.75, 0.08, mat(b, "#2a2f4a", { metalness: 0.5 }), 32); top.position.y = 2.5;
    const layers = [[0.12, "#e8a03a"], [0.3, "#f3e9a8"], [0.55, "#6a7ab8"]].map(([r, c]) => { const l = cyl(b, r as number, r as number, 2.3, glowMat(b, c as string, 0.3, { transparent: true, opacity: 0.55 }), 28); l.position.y = 1.3; return l; });
    const charge = p === "carga", el = scatter(22, 3, (r) => { const a = r() * 6.28, d = 0.15 + r() * 0.45; return [Math.cos(a) * d, r(), Math.sin(a) * d] as P3; }).map((q) => ({ s: ball(b, 0.05, beam(b, TONE.cyan, 1.8), 8), q }));
    g.add(casing, cap, bot, top, ...layers, ...el.map((e) => e.s)); g.rotation.y = 0.4; root.add(g); shadows(g);
    return done(root, b, (f) => {
      el.forEach(({ s, q }, i) => { const t = (q[1] + (charge ? -1 : 1) * f * 0.012 + i * 0.05 + 4) % 1; s.position.set(q[0], 0.3 + t * 2.0, q[2]); });
      g.rotation.y = 0.4 + 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const wifi_router: HeroDef = {
  kind: "primitive",
  when: "Wifi y redes: router, señal inalámbrica, por qué se corta el wifi, paredes y distancia, ondas de radio, internet en casa, cobertura, bluetooth.",
  poses: ["senal"],
  center: [0, 1.0, 0], radius: 1.25,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.3, 0], base: [0, 0.05, 0], antena: [-0.9, 1.9, 0], luces: [0.6, 0.35, 0.8], onda: [0, 2.0, 0.6] },
  build: (_L, pose) => {
    poseOf(wifi_router, pose, "wifi_router");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const body = place(box(b, 2.2, 0.35, 1.3, mat(b, "#e8ebf6", { roughness: 0.4 })), [0, 0.28, 0]);
    const ants = [-0.8, 0, 0.8].map((x) => { const a = place(box(b, 0.1, 1.5, 0.1, mat(b, "#2a2f4a", { roughness: 0.5 })), [x, 1.15, -0.45]); a.rotation.z = x * -0.12; return a; });
    const leds = [0, 1, 2, 3].map((i) => ({ l: place(ball(b, 0.05, glowMat(b, TONE.green, 0.9), 8), [0.3 + i * 0.22, 0.3, 0.66]), i }));
    const arcs = [0, 1, 2, 3].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(1, 0.03, 8, 48, Math.PI * 0.8)), beam(b, TONE.cyan, 1.6, { transparent: true, opacity: 0.8 })));
    arcs.forEach((a) => { a.rotation.z = Math.PI * 0.1; g.add(a); });
    g.add(body, ...ants, ...leds.map((x) => x.l)); g.rotation.y = -0.3; root.add(g); shadows(g);
    return done(root, b, (f) => {
      arcs.forEach((a, i) => { const t = (f * 0.012 + i / 4) % 1; a.position.set(0, 1.5, 0.1); a.scale.setScalar(0.3 + t * 1.5); (a.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t); });
      leds.forEach(({ l, i }) => { l.visible = Math.sin(f * 0.25 + i * 1.7) > -0.2; }); g.rotation.y = -0.3 + 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const pantalla_led: HeroDef = {
  kind: "primitive",
  when: "Pantallas y píxeles: cómo se forma una imagen, subpíxeles rojo-verde-azul, resolución, por qué los colores se ven en la pantalla, LED, televisores, ver de cerca.",
  poses: ["pixeles", "subpixeles"],
  center: [0, 1.4, 0], radius: 1.3,
  anchors: { hero: [0, 1.4, 0.1], top: [0, 2.7, 0], base: [0, 0.1, 0], pixel: [0.3, 1.5, 0.1], borde: [1.4, 1.4, 0.1], centro: [0, 1.4, 0.1] },
  build: (_L, pose) => {
    const p = poseOf(pantalla_led, pose, "pantalla_led"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 1024, 1024, (c) => {
      c.fillStyle = "#06060f"; c.fillRect(0, 0, 1024, 1024);
      if (p === "pixeles") { const n = 28, s = 1024 / n; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const h = ((x / n) * 300 + (y / n) * 80 + 180) % 360; c.fillStyle = `hsl(${h},85%,${40 + 25 * Math.sin(x * 0.4) * Math.cos(y * 0.3)}%)`; c.fillRect(x * s + 3, y * s + 3, s - 6, s - 6); } }
      else { const n = 9, s = 1024 / n; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { ["#ff3b3b", "#3bff6a", "#3b6aff"].forEach((cc, k) => { c.fillStyle = cc; c.globalAlpha = 0.35 + 0.65 * (((x * 5 + y * 3 + k * 2) % 7) / 6); c.fillRect(x * s + 8 + k * (s - 16) / 3, y * s + 10, (s - 16) / 3 - 4, s - 20); }); } c.globalAlpha = 1; }
    });
    const panel = new THREE.Mesh(b.track(new THREE.PlaneGeometry(2.4, 2.4)), b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.9), roughness: 0.4 })));
    const frame = place(box(b, 2.6, 2.6, 0.12, mat(b, "#1b1f33", { roughness: 0.5, metalness: 0.4 })), [0, 0, -0.07]); panel.position.z = 0.0;
    const wrap = new THREE.Group(); wrap.add(frame, panel, place(halo(b, "rgba(120,160,255,0.5)", 4.2, 0.35), [0, 0, -0.3])); wrap.position.y = 1.4; g.add(wrap); root.add(g); shadows(g);
    return done(root, b, (f) => { wrap.rotation.y = 0.45 * Math.sin(f * 0.012); wrap.rotation.x = 0.05 * Math.sin(f * 0.02); });
  },
};

