// Pack F (2.ª tanda) · Espacio: sistema solar, cometa/asteroide, satélite, telescopio, eclipse solar y astronauta.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, cyl, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const sistema_solar: HeroDef = {
  kind: "primitive",
  when: "Sistema solar: planetas y órbitas, cuánto tarda un año en cada planeta, por qué los planetas giran alrededor del Sol, distancias entre planetas, cinturón de asteroides.",
  poses: ["orbitas"],
  center: [0, 1.4, 0], radius: 1.7,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.8, 0], base: [0, 0.1, 0], sol: [0, 1.4, 0], tierra: [1.6, 1.4, 0], jupiter: [2.6, 1.4, 0] },
  build: (_L, pose) => {
    poseOf(sistema_solar, pose, "sistema_solar");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const sun = ball(b, 0.42, beam(b, "#ffd070", 1.5), 24), gl = halo(b, "rgba(255,190,70,0.9)", 2.6, 0.8);
    const P: [number, string, number, number][] = [[0.75, "#b8a89a", 0.07, 0.05], [1.1, "#e8b87a", 0.11, 0.035], [1.5, "#4a8ae8", 0.12, 0.03], [1.9, "#d9603a", 0.09, 0.024], [2.45, "#e8c58f", 0.26, 0.014], [3.05, "#d8c090", 0.22, 0.01]];
    const orbs = P.map(([r, c, s, sp], i) => { const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(r, 0.008, 6, 90)), beam(b, "#8a92b8", 1.1, { transparent: true, opacity: 0.55 })); ring.rotation.x = Math.PI / 2; g.add(ring); const pl = ball(b, s, glowMat(b, c, 0.3), 16); g.add(pl); if (i === 5) { const rg = new THREE.Mesh(b.track(new THREE.RingGeometry(s * 1.4, s * 2.0, 40)), beam(b, "#e8d8b0", 1.0, { side: THREE.DoubleSide, transparent: true, opacity: 0.7 })); rg.rotation.x = Math.PI / 2 - 0.4; pl.add(rg); } return { pl, r, sp, i }; });
    g.add(sun, gl); gl.rotation.x = -0.9; g.position.y = 1.4; g.rotation.x = 0.8; root.add(g);
    return done(root, b, (f) => { orbs.forEach(({ pl, r, sp, i }) => { const a = f * sp + i * 1.4; pl.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); }); g.rotation.y = 0.3 * Math.sin(f * 0.01); });
  },
};

export const cometa_asteroide: HeroDef = {
  kind: "primitive",
  when: "Cometas y asteroides: por qué los cometas tienen cola, impacto de asteroides, extinción de los dinosaurios, meteoritos y estrellas fugaces, cinturón de asteroides, lluvia de meteoros.",
  poses: ["cometa", "asteroide"],
  center: [0, 1.4, 0], radius: 1.3,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], nucleo: [0.8, 1.6, 0], cola: [-1.3, 1.2, 0], crater: [0.9, 1.7, 0.4] },
  build: (_L, pose) => {
    const p = poseOf(cometa_asteroide, pose, "cometa_asteroide"), com = p === "cometa", b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const rock = blob(b, 0.5, 0.28, 4, glowMat(b, com ? "#c8d4e8" : "#8a7a6a", 0.12, { roughness: 1 }), 3, 1.8); rock.position.set(com ? 0.9 : 0, 0, 0);
    const bits = scatter(com ? 40 : 6, 3, (r, i) => [(r() - 0.5) * 0.3, (r() - 0.5) * 0.25, r()] as P3).map((q, i) => ({ s: ball(b, com ? 0.03 + 0.05 * q[2] * 0 + 0.03 * (i % 3) / 2 : 0.06, com ? beam(b, i % 2 ? "#bfe6ff" : "#ffffff", 1.4, { transparent: true, opacity: 0.8 }) : glowMat(b, "#8a7a6a", 0.1), 8), q }));
    const tail = com ? [halo(b, "rgba(160,215,255,0.85)", 1.6, 0.7), halo(b, "rgba(200,235,255,0.5)", 2.4, 0.4)] : [];
    tail.forEach((t, i) => { t.position.set(0.9 - 0.7 * (i + 1), 0, -0.05); t.scale.set(1 + i * 0.6, 0.5, 1); g.add(t); });
    g.add(rock, ...bits.map((x) => x.s)); g.position.y = 1.4; g.rotation.z = 0.2; root.add(g); shadows(g);
    return done(root, b, (f) => { rock.rotation.set(f * 0.01, f * 0.015, 0); bits.forEach(({ s, q }, i) => { const t = (q[2] + f * (com ? 0.01 : 0.004) + i * 0.02) % 1; if (com) s.position.set(0.9 - 2.4 * t, q[0] * (0.5 + 2.5 * t), q[1] * 2); else { const a = f * 0.01 + i * 1.1; s.position.set(Math.cos(a) * (0.9 + 0.3 * q[2]), Math.sin(a * 1.3) * 0.5, Math.sin(a) * (0.9 + 0.3 * q[2])); } }); g.rotation.y = 0.25 * Math.sin(f * 0.01); });
  },
};

export const satelite: HeroDef = {
  kind: "primitive",
  when: "Satélites: GPS, cómo funciona la ubicación del móvil, comunicaciones, la estación espacial, por qué un satélite no cae, tiempo que tarda la señal, basura espacial.",
  poses: ["orbita"],
  center: [0, 1.4, 0], radius: 1.0,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], panel: [1.4, 1.4, 0], antena: [0, 2.2, 0], senal: [0, 0.4, 0] },
  build: (_L, pose) => {
    poseOf(satelite, pose, "satelite");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), sat = new THREE.Group();
    const foil = glowMat(b, TONE.gold, 0.35, { metalness: 0.8, roughness: 0.3 }), panelM = glowMat(b, "#2a4aa8", 0.5, { roughness: 0.3 });
    sat.add(box(b, 0.7, 0.7, 0.7, foil));
    for (const s of [-1, 1]) { const arm = rod(b, [s * 0.35, 0, 0], [s * 0.7, 0, 0], 0.03, mat(b, "#aeb8d6")), panel = place(box(b, 1.1, 0.04, 0.7, panelM), [s * 1.3, 0, 0]); sat.add(arm, panel); for (let i = 1; i < 4; i++) sat.add(place(box(b, 0.01, 0.05, 0.7, beam(b, "#9ab4ff", 1.2)), [s * (0.75 + i * 0.28), 0, 0])); }
    const dish = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.34, 20, 10, 0, Math.PI * 2, 0, 1.0)), mat(b, "#e8ebf6", { side: THREE.DoubleSide, metalness: 0.4 })); dish.position.set(0, 0.55, 0); const mast = rod(b, [0, 0.35, 0], [0, 0.65, 0], 0.03, mat(b, "#aeb8d6")); sat.add(dish, mast);
    const sig = [0, 1, 2].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(0.4, 0.015, 6, 36)), beam(b, TONE.cyan, 1.5, { transparent: true, opacity: 0.8 }))); sig.forEach((s) => { s.rotation.x = Math.PI / 2; sat.add(s); });
    g.add(sat); g.position.y = 1.4; root.add(g); shadows(g);
    return done(root, b, (f) => { sat.rotation.set(0.3, f * 0.01, 0.2 * Math.sin(f * 0.02)); sig.forEach((s, i) => { const t = (f * 0.012 + i / 3) % 1; s.position.y = 0.6 - t * 1.4; s.scale.setScalar(0.3 + t * 1.6); (s.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t); }); sat.position.y = 0.06 * Math.sin(f * 0.04); });
  },
};

export const telescopio: HeroDef = {
  kind: "primitive",
  when: "Telescopios y astronomía de observación: cómo vemos estrellas lejanas, mirar el cielo, por qué el telescopio ve el pasado, galaxias lejanas, estrellas y constelaciones.",
  poses: ["apunta"],
  center: [0, 1.4, 0], radius: 1.4,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.8, 0], base: [0, 0.1, 0], lente: [0.9, 2.3, 0], ocular: [-0.7, 1.4, 0], estrella: [2.2, 3.0, 0] },
  build: (_L, pose) => {
    poseOf(telescopio, pose, "telescopio");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const white = mat(b, "#e8ebf6", { metalness: 0.3, roughness: 0.4 }), dark = mat(b, "#2a2f4a", { metalness: 0.6, roughness: 0.4 });
    const legs = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2 + 0.5; return rod(b, [0, 1.1, 0], [Math.cos(a) * 0.8, 0.0, Math.sin(a) * 0.8], 0.04, dark); });
    const tubeG = new THREE.Group(), body = cyl(b, 0.3, 0.3, 2.0, white, 28), hood = cyl(b, 0.38, 0.34, 0.3, dark, 28), lens = cyl(b, 0.32, 0.32, 0.03, glowMat(b, TONE.cyan, 0.7, { transparent: true, opacity: 0.8 }), 24), ocu = cyl(b, 0.09, 0.09, 0.4, dark, 14), band = cyl(b, 0.32, 0.32, 0.1, mat(b, TONE.gold), 24);
    hood.position.y = 1.05; lens.position.y = 1.2; ocu.position.set(0.12, -1.15, 0); band.position.y = 0.4; tubeG.add(body, hood, lens, ocu, band); tubeG.position.set(0, 1.45, 0); tubeG.rotation.z = 0.75;
    const star = ball(b, 0.08, beam(b, "#ffffff", 2.2), 10); star.position.set(2.1, 3.0, 0);
    const beamR = rod(b, [2.1, 3.0, 0], [0.9, 2.3, 0], 0.012, beam(b, "#fff6d0", 1.2, { transparent: true, opacity: 0.5 }));
    g.add(...legs, tubeG, star, beamR, place(cyl(b, 0.1, 0.1, 0.25, dark, 12), [0, 1.2, 0])); g.position.x = -0.4; root.add(g); shadows(g);
    return done(root, b, (f) => { star.scale.setScalar(1 + 0.3 * Math.sin(f * 0.15)); tubeG.rotation.z = 0.75 + 0.04 * Math.sin(f * 0.03); g.rotation.y = 0.4 * Math.sin(f * 0.01); });
  },
};

export const eclipse_solar: HeroDef = {
  kind: "primitive",
  when: "Eclipses: eclipse de Sol y de Luna, sombras, por qué la Luna tapa al Sol, corona solar, cada cuánto hay eclipses, alineación de planetas.",
  poses: ["parcial", "total"],
  center: [0, 1.5, 0], radius: 1.5,
  anchors: { hero: [0, 1.5, 0.2], top: [0, 2.9, 0], base: [0, 0.1, 0], luna: [0, 1.5, 0.3], corona: [1.1, 1.5, 0.1], sol: [0, 1.5, 0] },
  build: (_L, pose) => {
    const p = poseOf(eclipse_solar, pose, "eclipse_solar"), total = p === "total", b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const sun = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.95, 64)), beam(b, "#ffe08a", 1.7)), moon = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.97, 64)), b.track(new THREE.MeshBasicMaterial({ color: "#05060e" })));
    sun.position.set(0, 1.5, 0); moon.position.set(0, 1.5, 0.05);
    const cor = [halo(b, "rgba(255,230,160,0.95)", 5.2, total ? 0.9 : 0.35), halo(b, "rgba(255,200,120,0.6)", 7, total ? 0.5 : 0.15)]; cor.forEach((c) => { c.position.set(0, 1.5, -0.1); g.add(c); });
    const rays = Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * 6.28, l = 0.5 + 0.7 * ((i * 7) % 5) / 5; return rod(b, [Math.cos(a) * 1.0, 1.5 + Math.sin(a) * 1.0, 0.02], [Math.cos(a) * (1.0 + l), 1.5 + Math.sin(a) * (1.0 + l), 0.02], 0.03, beam(b, "#ffe8b0", 1.3, { transparent: true, opacity: total ? 0.8 : 0 })); });
    g.add(sun, moon, ...rays); root.add(g);
    return done(root, b, (f) => { const t = ((f * 0.006) % 1), off = total ? 1.3 * (1 - Math.sin(Math.min(1, t * 2) * Math.PI / 2)) * (t < 0.5 ? 1 : 0) + (t > 0.5 && t < 0.8 ? 0 : 0) : 0.75 + 0.2 * Math.sin(f * 0.02); moon.position.x = total ? (t < 0.5 ? 1.6 * (1 - t * 2) : 0) * 1 : off; moon.position.y = 1.5 + (total ? 0 : 0.2); void off; rays.forEach((r, i) => { r.scale.setScalar(1 + 0.12 * Math.sin(f * 0.1 + i)); }); g.rotation.y = 0; });
  },
};

export const astronauta: HeroDef = {
  kind: "primitive",
  when: "Astronautas: vivir en el espacio, gravedad cero, trajes espaciales, por qué flotan, caminata espacial, la Estación Espacial, qué pasa con el cuerpo en el espacio.",
  poses: ["flota"],
  center: [0, 1.5, 0], radius: 1.2,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], casco: [0, 2.35, 0.1], visor: [0, 2.35, 0.55], mochila: [0, 1.6, -0.6] },
  build: (_L, pose) => {
    poseOf(astronauta, pose, "astronauta");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), a = new THREE.Group();
    const suit = glowMat(b, "#f2f0ea", 0.25, { roughness: 0.55 }), joint = mat(b, "#8a92b8", { roughness: 0.5 });
    const helmet = ball(b, 0.45, suit, 28); helmet.position.y = 1.15; const visor = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.36, 24, 16, -0.9, 1.8, 0.35, 1.4)), glowMat(b, "#e8a830", 0.6, { roughness: 0.1, metalness: 0.7 })); visor.position.set(0, 1.15, 0.12); visor.scale.set(1, 1, 1.05);
    const torso = place(box(b, 0.75, 0.9, 0.5, suit), [0, 0.35, 0]), pack = place(box(b, 0.6, 0.8, 0.3, mat(b, "#d8dcea")), [0, 0.4, -0.38]), chest = place(box(b, 0.3, 0.2, 0.05, glowMat(b, TONE.cyan, 0.8)), [0, 0.5, 0.27]);
    const limb = (x: number, y: number, rz: number, len: number, c: THREE.Material) => { const m = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.14, len, 6, 12)), c); m.position.set(x, y, 0); m.rotation.z = rz; return m; };
    const arms = [limb(-0.55, 0.45, 0.6, 0.55, suit), limb(0.55, 0.55, -0.9, 0.55, suit)], legs = [limb(-0.2, -0.45, 0.15, 0.7, suit), limb(0.22, -0.5, -0.25, 0.7, suit)], boots = [place(ball(b, 0.16, joint, 10), [-0.3, -0.95, 0]), place(ball(b, 0.16, joint, 10), [0.4, -0.98, 0])];
    const tether = tube(b, [[0, 0.1, -0.5], [-0.5, -0.3, -0.9], [-1.2, 0.2, -1.2]], 0.02, glowMat(b, TONE.gold, 0.5), 20);
    a.add(helmet, visor, torso, pack, chest, ...arms, ...legs, ...boots, tether); a.position.y = 1.5; g.add(a); root.add(g); shadows(g);
    return done(root, b, (f) => { a.rotation.set(0.15 * Math.sin(f * 0.02), 0.6 + 0.4 * Math.sin(f * 0.011), 0.2 * Math.sin(f * 0.017)); a.position.y = 1.5 + 0.12 * Math.sin(f * 0.03); arms[0].rotation.z = 0.6 + 0.15 * Math.sin(f * 0.05); legs[1].rotation.z = -0.25 + 0.12 * Math.sin(f * 0.04); });
  },
};
