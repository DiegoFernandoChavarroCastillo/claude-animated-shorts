// Pack A · Cuerpo (F11): garganta en corte, pulmones, corazón, estómago, ojo y capas de la piel. Todo genérico y
// estilizado (sin marcas ni anatomía realista): tejidos de la paleta, brillo suave en lo que se explica y un
// movimiento propio (respirar, latir, girar) para que ningún plano quede quieto.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, blob, box, col, glowMat, halo, mat, place, rod, scatter, tube, virusBody } from "./kit";

const done = (root: THREE.Object3D, b: ReturnType<typeof bin>, update: (f: number) => void) => ({ root, update, dispose: b.dispose });

export const garganta_corte: HeroDef = {
  kind: "primitive",
  when: "Garganta en corte: dolor de garganta, gripe y resfriado, amígdalas, úvula, tragar, voz, virus que entran por la nariz.",
  actions: { inflamar: "Las amígdalas y la pared se ponen rojas e inflamadas: dolor de garganta, infección, inflamación, defensas que reaccionan." },
  poses: ["sana", "inflamada", "virus"],
  center: [0, 1.3, 0], radius: 1.0,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.6, 0], base: [0, 0.05, 0], nasofaringe: [0, 2.1, -0.3], amigdalas: [0.42, 1.2, -0.25], uvula: [0, 1.75, -0.3], laringe: [0, 0.35, -0.2] },
  build: (_L, pose) => {
    const p = poseOf(garganta_corte, pose, "garganta_corte"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    // la cara interior (la que mira la cámara por el corte) es clara y brilla un poco; la exterior, más oscura
    const inner = glowMat(b, col(TONE.flesh, "#ffd0c4", 0.45), 0.28, { side: THREE.BackSide, roughness: 0.7 }), outer = mat(b, TONE.fleshDark, { roughness: 0.6 });
    const halfGeo = b.track(new THREE.CylinderGeometry(0.62, 0.5, 2.4, 48, 1, true, Math.PI / 2, Math.PI)), domeGeo = b.track(new THREE.SphereGeometry(0.62, 40, 16, Math.PI, Math.PI, 0, Math.PI / 2));
    const half = new THREE.Mesh(halfGeo, inner), halfOut = new THREE.Mesh(halfGeo, outer), dome = new THREE.Mesh(domeGeo, inner), domeOut = new THREE.Mesh(domeGeo, outer);
    [half, halfOut].forEach((m) => { m.position.y = 1.2; }); [dome, domeOut].forEach((m) => { m.position.y = 2.4; });
    const rimM = glowMat(b, col(TONE.flesh, "#ffffff", 0.55), 0.3, { roughness: 0.5 });
    const rims = [rod(b, [0.62, 2.4, 0], [0.5, 0, 0], 0.05, rimM), rod(b, [-0.62, 2.4, 0], [-0.5, 0, 0], 0.05, rimM)];
    let heat = 0; const hot = p === "inflamada" || p === "virus", baseTon = col(TONE.flesh, TONE.fleshDark, 0.5), tonM = glowMat(b, hot ? TONE.glowRed : col(TONE.flesh, TONE.fleshDark, 0.5), hot ? 0.5 : 0.2, { roughness: 0.5 });
    const tons = [-1, 1].map((s) => place(ball(b, 0.22, tonM, 24), [s * 0.42, 1.15, -0.3]));
    tons.forEach((t) => t.scale.set(0.9, 1.4, 0.8));
    const uvula = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.07, 0.2, 6, 12)), tonM); uvula.position.set(0, 1.72, -0.32);
    const tongue = place(ball(b, 0.4, mat(b, col(TONE.flesh, TONE.glowRed, 0.25)), 24), [0, 0.2, -0.05]); tongue.scale.set(1.1, 0.5, 0.95);
    const patch = halo(b, "rgba(255,90,95,0.9)", 1.2, hot ? 0.8 : 0); patch.position.set(0, 1.55, -0.49);
    g.add(half, halfOut, dome, domeOut, ...rims, ...tons, uvula, tongue, patch);
    // virus (genéricos) que bajan por detrás de la nariz y se pegan a la pared
    const vir = p === "virus" ? scatter(7, 5, (r) => [(r() - 0.5) * 0.6, r(), -0.1 - r() * 0.3] as [number, number, number]).map((q) => { const v = virusBody(b, 0.075); v.position.set(...q); g.add(v); return { v, q }; }) : [];
    g.position.y = 0; root.add(g); shadows(g);
    const inst = done(root, b, (f) => {
      g.rotation.y = 0.32 * Math.sin(f * 0.012);
      const k = 0.5 + 0.5 * Math.sin(f * 0.12);
      const h = Math.max(hot ? 1 : 0, heat);
      if (h > 0) { tonM.emissive.copy(col(TONE.glowRed)).multiplyScalar((0.3 + 0.35 * k) * h); if (!hot) tonM.color.copy(baseTon).lerp(col(TONE.glowRed), heat * 0.7); (patch.material as THREE.MeshBasicMaterial).opacity = (0.45 + 0.4 * k) * h; patch.scale.setScalar(1 + 0.08 * k); }
      vir.forEach(({ v, q }, i) => { const t = (q[1] * 3 + f * 0.012 + i * 0.13) % 1; v.position.set(q[0] * (1 - 0.5 * t), 2.3 - 1.4 * t, q[2]); v.rotation.y = f * 0.03 + i; });
    });
    return { ...inst, act: (name, u) => { if (name === "inflamar") heat = 1 - (1 - u) ** 3; } };
  },
};

export const pulmones: HeroDef = {
  kind: "primitive",
  when: "Pulmones: respirar, aire, oxígeno, tos, humo, asma, hipo, cuánto aire cabe en el cuerpo.",
  poses: ["sanos", "humo"],
  center: [0, 1.5, 0], radius: 1.3,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], traquea: [0, 2.35, 0], bronquio: [0.45, 1.85, 0.1], pulmon_izq: [-0.8, 1.3, 0.3], pulmon_der: [0.8, 1.3, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(pulmones, pose, "pulmones"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tint = p === "humo" ? col("#9a909f", TONE.flesh, 0.2) : col(TONE.flesh, "#ff9db0", 0.55);
    const lobes = [-1, 1].map((s, i) => { const l = blob(b, 0.85, 0.12, 2 + i * 3, glowMat(b, tint, 0.22, { roughness: 0.55 }), 4); l.position.set(s * 0.78, 1.25, 0); l.scale.set(0.8, 1.25, 0.7); g.add(l); return l; });
    const pipe = mat(b, col(TONE.bone, TONE.lavender, 0.3), { roughness: 0.4 }), br = [] as THREE.Object3D[];
    br.push(tube(b, [[0, 2.8, 0], [0, 2.1, 0]], 0.13, pipe));
    for (const s of [-1, 1]) {
      br.push(tube(b, [[0, 2.1, 0], [s * 0.3, 1.8, 0.05], [s * 0.6, 1.4, 0.1]], 0.085, pipe));
      for (const [dx, dy, dz] of [[0.3, 0.3, 0.15], [0.35, -0.15, -0.1], [0.2, -0.5, 0.1]]) br.push(tube(b, [[s * 0.45, 1.6, 0.08], [s * (0.45 + dx), 1.6 - dy, 0.08 + dz]], 0.04, pipe));
    }
    g.add(...br);
    const smoke = p === "humo" ? scatter(10, 9, (r) => [(r() - 0.5) * 1.8, r() * 2, (r() - 0.5) * 0.4] as [number, number, number]).map((q) => { const s = ball(b, 0.1 + 0.05 * (q[2] + 0.2), mat(b, "#6f6a7a", { transparent: true, opacity: 0.55, roughness: 1 }), 12); g.add(s); return { s, q }; }) : [];
    root.add(g); shadows(g);
    return done(root, b, (f) => {
      const k = 1 + 0.06 * Math.sin(f * 0.07);
      lobes.forEach((l, i) => l.scale.set(0.8 * k, 1.25 * k, 0.7 * k * (i ? 1 : 1)));
      g.rotation.y = 0.3 * Math.sin(f * 0.011);
      smoke.forEach(({ s, q }, i) => { const t = (q[1] * 0.5 + f * 0.007 + i * 0.1) % 1; s.position.set(q[0] * (0.6 + 0.5 * t) + 0.1 * Math.sin(f * 0.05 + i), 0.5 + 2.5 * t, q[2]); s.scale.setScalar(0.6 + t); });
    });
  },
};

export const corazon: HeroDef = {
  kind: "primitive",
  when: "Corazón: latido, pulso, sangre, presión, miedo y emociones, ejercicio, cuántas veces late al día.",
  actions: { acelerar: "El corazón se acelera: miedo, ejercicio, emoción, fiebre, estrés, correr." },
  poses: ["latido", "rapido"],
  center: [0, 1.25, 0], radius: 1.25,
  anchors: { hero: [0, 1.25, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], aorta: [0.3, 2.2, 0], ventriculo: [-0.2, 0.9, 0.5], vena: [-0.55, 2.2, 0] },
  build: (_L, pose) => {
    const p = poseOf(corazon, pose, "corazon"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), body = new THREE.Group();
    const m = glowMat(b, col(TONE.blood, TONE.flesh, 0.15), 0.2, { roughness: 0.4 });
    const main = blob(b, 0.85, 0.06, 4, m, 4); main.scale.set(0.9, 1.05, 0.85); main.position.set(-0.1, 1.15, 0);
    const right = blob(b, 0.55, 0.06, 7, m, 3); right.position.set(0.45, 1.3, 0.1);
    const vein = mat(b, "#6d7fd8", { roughness: 0.4 }), art = mat(b, col(TONE.blood, TONE.glowRed, 0.4), { roughness: 0.4 });
    body.add(main, right,
      tube(b, [[0.15, 1.9, 0], [0.25, 2.5, 0], [0.7, 2.6, 0], [1.0, 2.2, 0]], 0.17, art),
      tube(b, [[-0.5, 1.85, 0], [-0.55, 2.45, 0]], 0.13, vein), tube(b, [[0.45, 1.75, 0.1], [0.5, 2.35, 0.1]], 0.12, vein),
      tube(b, [[-0.3, 0.45, 0.1], [-0.3, 0.05, 0.1]], 0.12, art));
    body.position.y = 0; g.add(body); root.add(g); shadows(g);
    const rate = p === "rapido" ? 0.34 : 0.2; let extra = 0;
    const inst = done(root, b, (f) => {
      const ph = Math.max(0, Math.sin(f * rate + extra)) ** 6, k = 1 + 0.07 * ph;
      body.scale.setScalar(k); body.position.y = 1.2 * (1 - k); m.emissive.copy(col(TONE.blood)).multiplyScalar(0.18 + 0.3 * ph);
      g.rotation.y = 0.45 * Math.sin(f * 0.01);
    });
    return { ...inst, act: (name, _u, spec, t) => { if (name === "acelerar") { const d = typeof spec.dur === "number" ? spec.dur : 30, r1 = rate * 1.9, m = Math.min(t, d); extra = (r1 - rate) * ((m * m) / (2 * d) + Math.max(0, t - d)); } } };
  },
};

export const estomago: HeroDef = {
  kind: "primitive",
  when: "Estómago: digestión, ácido, hambre, rugidos, comida, por qué no nos digerimos a nosotros mismos.",
  poses: ["lleno", "vacio"],
  center: [0.1, 1.35, 0], radius: 1.35,
  anchors: { hero: [0.1, 1.35, 0], top: [-0.6, 2.7, 0], base: [0.1, 0.2, 0], esofago: [-0.7, 2.5, 0], acido: [0.2, 1.0, 0.3], intestino: [1.2, 0.9, 0] },
  build: (_L, pose) => {
    const p = poseOf(estomago, pose, "estomago"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const wall = glowMat(b, col(TONE.flesh, "#ffa8a8", 0.45), 0.2, { roughness: 0.55 });
    const sac = blob(b, 0.8, 0.05, 3, wall, 4); sac.scale.set(1.35, 1.0, 0.8); sac.position.set(0.1, 1.2, 0);
    const shell = new THREE.Mesh(sac.geometry, mat(b, "#ffffff", { transparent: true, opacity: 0.18, depthWrite: false, roughness: 0.1 })); shell.scale.copy(sac.scale).multiplyScalar(1.02); shell.position.copy(sac.position);
    const inner = p === "lleno" ? ball(b, 0.7, glowMat(b, col(TONE.gold, TONE.green, 0.5), 0.35, { transparent: true, opacity: 0.85 }), 24) : null;
    if (inner) { inner.scale.set(1.25, 0.8, 0.65); inner.position.set(0.1, 1.15, 0); }
    const food = scatter(p === "lleno" ? 9 : 0, 4, (r) => [(r() - 0.5) * 1.5, 0.85 + r() * 0.6, (r() - 0.5) * 0.4] as [number, number, number]).map((q, i) => ball(b, 0.09 + 0.03 * (i % 3), glowMat(b, i % 2 ? TONE.green : TONE.gold, 0.35), 12));
    const acid = scatter(14, 8, (r) => [(r() - 0.5) * 1.4, r(), (r() - 0.5) * 0.5] as [number, number, number]).map((q) => ({ s: ball(b, 0.05, glowMat(b, TONE.green, 0.8), 8), q }));
    const eso = tube(b, [[-0.65, 2.9, 0], [-0.6, 2.2, 0], [-0.4, 1.8, 0]], 0.13, wall), gut = tube(b, [[0.95, 1.0, 0], [1.3, 0.7, 0], [1.1, 0.3, 0], [0.7, 0.2, 0.1]], 0.17, mat(b, col(TONE.flesh, TONE.gold, 0.3)));
    g.add(sac, shell, eso, gut, ...food, ...acid.map((a) => a.s)); if (inner) g.add(inner);
    root.add(g); shadows(g);
    return done(root, b, (f) => {
      g.rotation.y = 0.35 * Math.sin(f * 0.011); sac.scale.set(1.35 + 0.03 * Math.sin(f * 0.09), 1.0 + 0.04 * Math.sin(f * 0.09 + 1), 0.8);
      food.forEach((s, i) => s.position.set(Math.sin(f * 0.02 + i * 2) * 0.5 - 0.1 + i * 0.05, 1.0 + 0.25 * Math.sin(f * 0.03 + i), 0.12 * Math.cos(f * 0.02 + i)));
      acid.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.01 + i * 0.07) % 1; s.position.set(q[0] * 0.9 + 0.1, 0.8 + t * 0.8, q[2] * 0.4); (s.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + 0.6 * t; });
    });
  },
};

export const ojo: HeroDef = {
  kind: "primitive",
  when: "Ojo: visión, pupila y luz, color, parpadeo, ilusiones ópticas, por qué se ven los colores, ojos rojos.",
  poses: ["abierto", "luz", "oscuridad"],
  center: [0, 1.3, 0], radius: 1.15,
  anchors: { hero: [0, 1.3, 0.3], top: [0, 2.4, 0], base: [0, 0.2, 0], pupila: [0, 1.3, 1.05], iris: [0.45, 1.3, 0.95], nervio: [0, 1.3, -1.3] },
  build: (_L, pose) => {
    const p = poseOf(ojo, pose, "ojo"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), eye = new THREE.Group();
    const white = ball(b, 1.0, glowMat(b, col(TONE.bone, "#ffffff", 0.6), 0.25, { roughness: 0.35 }), 48);
    // iris y pupila son casquetes pegados a la esfera (un disco plano quedaba dentro del globo); el degradado va en el color de vértice
    const irisGeo = b.track(new THREE.SphereGeometry(1.004, 48, 14, 0, Math.PI * 2, 0, 0.6)), pos = irisGeo.attributes.position, cols: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const t = Math.acos(Math.min(1, pos.getY(i) / 1.004)) / 0.6, a = Math.atan2(pos.getZ(i), pos.getX(i)), c = col(TONE.green, "#1b4f86", Math.min(1, t * 1.1)).lerp(col("#e8fbff"), 0.12 * Math.max(0, Math.sin(a * 14)) * (1 - t));
      cols.push(c.r, c.g, c.b);
    }
    irisGeo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    const iris = new THREE.Mesh(irisGeo, b.track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, emissive: col(TONE.cyan).multiplyScalar(0.18) }))); iris.rotation.x = Math.PI / 2;
    const pupil = new THREE.Mesh(b.track(new THREE.SphereGeometry(1.012, 32, 8, 0, Math.PI * 2, 0, 0.2)), b.track(new THREE.MeshBasicMaterial({ color: "#05050c" }))); pupil.rotation.x = Math.PI / 2;
    const cornea = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.62, 40, 20, 0, Math.PI * 2, 0, 1.05)), mat(b, "#e6f6ff", { transparent: true, opacity: 0.12, roughness: 0.05, depthWrite: false })); cornea.rotation.x = Math.PI / 2; cornea.position.z = 0.62;
    const nerve = tube(b, [[0, 0, -0.9], [0, -0.1, -1.6], [0.1, -0.3, -2.2]], 0.15, mat(b, TONE.gold, { roughness: 0.5 }));
    const vessel = tube(b, [[0.5, 0.7, 0.5], [0.8, 0.4, 0.3], [0.85, 0, 0.5]], 0.012, mat(b, TONE.glowRed));
    eye.add(white, iris, pupil, cornea, nerve, vessel); eye.position.set(0, 1.3, 0); g.add(eye); root.add(g); shadows(g);
    const target = p === "luz" ? 0.38 : p === "oscuridad" ? 1.25 : 0.7;
    return done(root, b, (f) => {
      const k = target * (1 + 0.04 * Math.sin(f * 0.1)); pupil.scale.set(k * 1.3, 1, k * 1.3);
      eye.rotation.set(0.12 * Math.sin(f * 0.017), 0.4 * Math.sin(f * 0.012), 0);
    });
  },
};

export const piel_capas: HeroDef = {
  kind: "primitive",
  when: "Piel en corte: epidermis, dermis, sudor, pelo, tacto y dolor, quemaduras, arrugas, por qué se arruga con el agua, cicatrices.",
  poses: ["corte", "calor"],
  center: [0, 0.85, 0], radius: 1.15,
  anchors: { hero: [0, 0.85, 0.6], top: [0, 1.9, 0], base: [0, 0.05, 0], epidermis: [0.5, 1.4, 0.72], dermis: [0.5, 0.95, 0.72], hipodermis: [0.5, 0.35, 0.72], pelo: [-0.6, 1.8, 0.77], sudor: [0.45, 0.9, 0.77] },
  build: (_L, pose) => {
    const p = poseOf(piel_capas, pose, "piel_capas"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const slab = (y0: number, h: number, c: string, o = 0) => { const s = box(b, 2.4, h, 1.5, mat(b, c, { roughness: 0.6, emissive: col(c).multiplyScalar(o) })); s.position.y = y0 + h / 2; return s; };
    g.add(slab(0, 0.62, col(TONE.gold, TONE.bone, 0.55).getStyle()), slab(0.62, 0.7, col(TONE.flesh, TONE.fleshDark, 0.15).getStyle()), slab(1.32, 0.16, col(TONE.flesh, "#ffd9c0", 0.5).getStyle()));
    const hairM = mat(b, TONE.ink, { roughness: 0.6 });
    g.add(tube(b, [[-0.6, 0.8, 0.77], [-0.6, 1.5, 0.77], [-0.55, 2.0, 0.77]], 0.035, hairM));
    g.add(tube(b, [[0.1, 0.7, 0.77], [0.1, 1.25, 0.77], [0.1, 1.5, 0.77]], 0.03, glowMat(b, TONE.cyan, 0.6)));
    const coil = Array.from({ length: 40 }, (_, i) => [0.45 + 0.1 * Math.sin(i * 0.9), 0.68 + i * 0.011, 0.77] as [number, number, number]);
    g.add(tube(b, coil, 0.03, glowMat(b, TONE.gold, 0.5)));
    g.add(tube(b, [[-1.2, 1.0, 0.77], [-0.2, 0.95, 0.77], [0.8, 1.05, 0.77], [1.2, 1.0, 0.77]], 0.05, glowMat(b, TONE.glowRed, 0.5)));
    const drops = p === "calor" ? Array.from({ length: 6 }, (_, i) => ({ s: ball(b, 0.05, glowMat(b, TONE.cyan, 0.6), 10), i })) : [];
    drops.forEach((d) => g.add(d.s));
    g.rotation.x = 0.1; root.add(g); shadows(g);
    return done(root, b, (f) => {
      g.rotation.y = 0.5 + 0.3 * Math.sin(f * 0.012);
      drops.forEach(({ s, i }) => { const t = (f * 0.012 + i / 6) % 1; s.position.set(0.45 + 0.08 * Math.sin(i * 2), 1.5 + 0.9 * t, 0.7); s.scale.setScalar(1 - 0.5 * t); });
    });
  },
};
