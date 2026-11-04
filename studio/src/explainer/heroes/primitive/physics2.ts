// Pack E (2.ª tanda) · Física: plano inclinado, resorte con masa, lente, ondas en el agua, barra de calor y trompo.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, ghostMat, glowMat, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const plano_inclinado: HeroDef = {
  kind: "primitive",
  when: "Plano inclinado y movimiento: gravedad y fricción, por qué rueda una bola, aceleración, rampas, energía potencial y cinética, caída libre, Galileo.",
  poses: ["rueda"],
  center: [0, 1.0, 0], radius: 1.5,
  anchors: { hero: [0, 1.0, 0], top: [-1.3, 2.0, 0], base: [1.4, 0.1, 0], bola: [0, 1.2, 0.2], rampa: [0, 0.9, 0.5], flecha: [0.3, 0.7, 0.4] },
  build: (_L, pose) => {
    poseOf(plano_inclinado, pose, "plano_inclinado");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const a = 0.45, L = 3.8, ramp = place(box(b, L, 0.14, 1.0, glowMat(b, "#c9944a", 0.15, { roughness: 0.7 })), [0, 1.0, 0]); ramp.rotation.z = -a;
    const prop = place(box(b, 0.16, 1.9, 1.0, mat(b, "#8a5a3a")), [-1.7, 0.95, 0]), ground = place(box(b, 5, 0.06, 1.4, glowMat(b, "#3a4a7a", 0.2)), [0, 0.0, 0]);
    const ballM = ball(b, 0.26, glowMat(b, TONE.glowRed, 0.5), 24), vel = new THREE.Group(), arrow = rod(b, [0, 0, 0], [0.8, -0.36, 0], 0.035, beam(b, TONE.gold, 1.6)), head = place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.1, 0.22, 10)), beam(b, TONE.gold, 1.6)), [0.85, -0.38, 0]); head.rotation.z = -Math.PI / 2 - a; vel.add(arrow, head);
    const grav = new THREE.Group(); grav.add(rod(b, [0, 0, 0], [0, -0.7, 0], 0.03, beam(b, TONE.cyan, 1.6)), place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.09, 0.2, 10)), beam(b, TONE.cyan, 1.6)), [0, -0.75, 0])); (grav.children[1] as THREE.Mesh).rotation.z = Math.PI;
    g.add(ramp, prop, ground, ballM, vel, grav); g.rotation.y = 0.35; root.add(g); shadows(g);
    return done(root, b, (f) => { const t = ((f * 0.012) % 1), s = -1.55 + 2.8 * t * t; const x = s * Math.cos(a), y = 1.0 + 0.3 - s * Math.sin(a) * -1; ballM.position.set(x, 1.0 - x * Math.tan(a) + 0.27 / Math.cos(a), 0); ballM.rotation.z = -s * 3; vel.position.copy(ballM.position); vel.scale.setScalar(0.3 + 1.5 * t); grav.position.copy(ballM.position); void y; g.rotation.y = 0.35 + 0.25 * Math.sin(f * 0.01); });
  },
};

export const resorte_masa: HeroDef = {
  kind: "primitive",
  when: "Resortes y vibraciones: oscilar, rebote, amortiguadores, elasticidad, ley de Hooke, por qué un trampolín te hace saltar, vibración de una cuerda o de un edificio.",
  poses: ["oscila"],
  center: [0, 1.6, 0], radius: 1.3,
  anchors: { hero: [0, 1.6, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], resorte: [0, 2.2, 0.2], masa: [0, 0.9, 0.3], techo: [0, 3.0, 0] },
  build: (_L, pose) => {
    poseOf(resorte_masa, pose, "resorte_masa");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const ceiling = place(box(b, 1.8, 0.16, 0.8, mat(b, "#6a708a")), [0, 3.05, 0]), mass = place(box(b, 0.7, 0.7, 0.7, glowMat(b, TONE.gold, 0.4)), [0, 1.0, 0]);
    const spring = new THREE.Mesh(new THREE.BufferGeometry(), glowMat(b, "#cfd6ea", 0.3, { metalness: 0.7, roughness: 0.3 })); b.track(spring.geometry as THREE.BufferGeometry);
    const rebuild = (len: number) => { spring.geometry.dispose(); const pts: P3[] = Array.from({ length: 160 }, (_, i) => { const t = i / 159, a = t * 14 * Math.PI; return [Math.cos(a) * 0.22, 3.0 - t * len, Math.sin(a) * 0.22] as P3; }); spring.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), 220, 0.028, 6, false); };
    g.add(ceiling, spring, mass); root.add(g); shadows(g);
    return done(root, b, (f) => { const len = 1.6 + 0.45 * Math.sin(f * 0.1); rebuild(len); mass.position.y = 3.0 - len - 0.35; mass.rotation.y = 0; g.rotation.y = 0.5 * Math.sin(f * 0.011); });
  },
};

export const lente_luz: HeroDef = {
  kind: "primitive",
  when: "Lentes y óptica: cómo enfoca una lupa, gafas, cámaras y telescopios, refracción, por qué se ve invertida la imagen, quemar con una lupa, miopía.",
  poses: ["convergente"],
  center: [0, 1.3, 0], radius: 1.5,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], lente: [0, 1.3, 0.2], foco: [1.4, 1.3, 0], rayo: [-1.5, 1.7, 0] },
  build: (_L, pose) => {
    poseOf(lente_luz, pose, "lente_luz");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const lens = ball(b, 1.0, ghostMat(b, "#cfe7ff", 0.35, { roughness: 0.05, emissive: col("#9fd0ff").multiplyScalar(0.2) }), 40); lens.scale.set(0.22, 1.0, 0.7); lens.position.y = 1.3;
    const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(1.0, 0.04, 8, 48)), glowMat(b, TONE.gold, 0.3, { metalness: 0.5 })); ring.scale.set(0.22, 1, 0.7); ring.rotation.y = Math.PI / 2; ring.position.y = 1.3; ring.scale.set(1, 1, 1); ring.scale.set(1, 1, 1);
    const rays: THREE.Object3D[] = [], F: P3 = [1.5, 1.3, 0];
    for (const dy of [-0.6, -0.3, 0, 0.3, 0.6]) { rays.push(rod(b, [-2.2, 1.3 + dy, 0], [0, 1.3 + dy, 0], 0.025, beam(b, "#ffe08a", 1.6)), rod(b, [0, 1.3 + dy, 0], F, 0.025, beam(b, "#ffe08a", 1.6))); }
    const focus = ball(b, 0.09, beam(b, "#fff6d0", 2.4), 12); focus.position.set(...F);
    const base = place(box(b, 3.4, 0.05, 0.9, glowMat(b, "#3a4a7a", 0.2)), [0, 0.0, 0]);
    g.add(lens, ring, ...rays, focus, base); g.position.x = -0.2; root.add(g); shadows(g);
    ring.visible = false;
    return done(root, b, (f) => { focus.scale.setScalar(1 + 0.25 * Math.sin(f * 0.2)); rays.forEach((r, i) => { (r as THREE.Mesh).visible = Math.sin(f * 0.1 + i * 0.4) > -0.8; }); g.rotation.y = 0.45 * Math.sin(f * 0.012); });
  },
};

export const ondas_gota: HeroDef = {
  kind: "primitive",
  when: "Ondas en el agua: ondas circulares, interferencia, por qué se forman ondas al caer una gota, tsunamis, vibraciones, sonido expandiéndose, ripples.",
  poses: ["gota"],
  center: [0, 0.8, 0], radius: 1.35,
  anchors: { hero: [0, 0.8, 0], top: [0, 2.2, 0], base: [0, 0.05, 0], gota: [0, 2.0, 0], onda: [1.0, 0.3, 0.4], borde: [1.8, 0.3, 0] },
  build: (_L, pose) => {
    poseOf(ondas_gota, pose, "ondas_gota");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const W = 4.4, SX = 80, geo = b.track(new THREE.PlaneGeometry(W, W, SX, SX)); geo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(geo, glowMat(b, "#2f7de0", 0.45, { roughness: 0.2, side: THREE.DoubleSide })), pos = geo.attributes.position;
    const drop = ball(b, 0.14, beam(b, "#9fd0ff", 1.6), 14); drop.scale.y = 1.4;
    const rings = [0, 1, 2, 3].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(1, 0.025, 6, 64)), beam(b, "#e8f4ff", 1.6, { transparent: true, opacity: 0.8 }))); rings.forEach((r) => { r.rotation.x = Math.PI / 2; g.add(r); });
    g.add(water, drop); g.position.y = 0.3; root.add(g); shadows(g);
    return done(root, b, (f) => {
      const T = (f % 90) / 90, hit = T > 0.35; drop.visible = !hit; drop.position.set(0, 2.0 - 2.0 * (T / 0.35) ** 2 * 1 + 0.0, 0); drop.position.y = Math.max(0.15, 2.0 * (1 - (T / 0.35) ** 2));
      const t = Math.max(0, T - 0.35) * 90 / 30;
      for (let i = 0; i < pos.count; i++) { const r = Math.hypot(pos.getX(i), pos.getZ(i)), ph = r * 5 - t * 6; pos.setY(i, hit ? 0.28 * Math.sin(ph) * Math.exp(-r * 0.6) * Math.min(1, Math.max(0, (t * 1.2 - r) / 0.6 + 0.2)) * Math.exp(-t * 0.1) : 0); }
      rings.forEach((r, i) => { const u = t * 0.6 - i * 0.45; r.visible = hit && u > 0 && u < 2.0; r.scale.setScalar(Math.max(0.01, u)); r.position.y = 0.03; (r.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 * (1 - u / 2.0)); });
      pos.needsUpdate = true; geo.computeVertexNormals(); g.rotation.y = 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const barra_calor: HeroDef = {
  kind: "primitive",
  when: "Calor y temperatura: conducción del calor, por qué el metal se siente frío, cómo se transmite el calor, cucharas calientes, aislantes, termómetros.",
  poses: ["barra"],
  center: [0, 1.0, 0], radius: 1.5,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.0, 0], base: [0, 0.1, 0], extremo_caliente: [-1.8, 1.0, 0], extremo_frio: [1.8, 1.0, 0], llama: [-2.0, 0.3, 0] },
  build: (_L, pose) => {
    poseOf(barra_calor, pose, "barra_calor");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 512, 64, (c) => { const gr = c.createLinearGradient(0, 0, 512, 0); gr.addColorStop(0, "#ff3b2e"); gr.addColorStop(0.35, "#ff9a3a"); gr.addColorStop(0.65, "#8a9ac8"); gr.addColorStop(1, "#4a78e8"); c.fillStyle = gr; c.fillRect(0, 0, 512, 64); });
    const barM = b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.55), metalness: 0.5, roughness: 0.4 })), bar = new THREE.Mesh(b.track(new THREE.BoxGeometry(3.8, 0.32, 0.32)), barM); bar.position.y = 1.0;
    const stand = [-1.4, 1.4].map((x) => place(box(b, 0.12, 0.7, 0.4, mat(b, "#6a708a")), [x, 0.45, 0]));
    const flame = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.28, 0.7, 16)), beam(b, "#ffb24a", 1.7, { transparent: true, opacity: 0.9 })); flame.position.set(-1.95, 0.55, 0);
    const heat = scatter(12, 3, (r) => [r(), r()] as unknown as P3).map((q) => ({ s: ball(b, 0.05, beam(b, "#ff7a3a", 1.8, { transparent: true, opacity: 0.8 }), 8), q }));
    const pins = [0.3, 0.9, 1.5, 2.1, 2.7].map((x, i) => { const p = place(ball(b, 0.09, glowMat(b, i < 2 ? "#ff5a3a" : "#8aa0d8", 0.5), 10), [-1.6 + x, 1.4, 0]); return p; });
    g.add(bar, ...stand, flame, ...heat.map((h) => h.s), ...pins); g.rotation.y = 0.3; root.add(g); shadows(g);
    return done(root, b, (f) => { flame.scale.set(1 + 0.1 * Math.sin(f * 0.6), 1 + 0.2 * Math.sin(f * 0.45), 1); heat.forEach(({ s, q }, i) => { const t = (f * 0.008 + q[0] + i * 0.08) % 1; s.position.set(-1.8 + 3.6 * t, 1.0 + 0.3 * Math.sin(t * 20 + i) * (1 - t), 0.2 * (q[1] - 0.5)); (s.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t); }); pins.forEach((p, i) => { p.position.y = 1.4 + 0.02 * Math.sin(f * 0.3 + i); }); g.rotation.y = 0.3 + 0.2 * Math.sin(f * 0.01); });
  },
};

export const trompo: HeroDef = {
  kind: "primitive",
  when: "Giro y rotación: por qué un trompo no se cae, giroscopios, momento angular, equilibrio de una bicicleta, la Tierra que gira, patinadores que giran más rápido.",
  poses: ["gira"],
  center: [0, 1.0, 0], radius: 1.1,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.0, 0], base: [0, 0.1, 0], punta: [0, 0.05, 0], eje: [0, 1.8, 0], disco: [0.7, 1.2, 0] },
  build: (_L, pose) => {
    poseOf(trompo, pose, "trompo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), top = new THREE.Group();
    const stripe = screenTex(b.track, 256, 64, (c) => { const cs = ["#ff5a5f", "#ffd24a", "#3ddc84", "#4a78e8", "#b36bff"]; for (let i = 0; i < 10; i++) { c.fillStyle = cs[i % 5]; c.fillRect(i * 26, 0, 26, 64); } });
    const body = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.8, 1.2, 36)), b.track(new THREE.MeshStandardMaterial({ map: stripe, emissiveMap: stripe, emissive: new THREE.Color("#ffffff").multiplyScalar(0.35), roughness: 0.4 }))); body.rotation.x = Math.PI; body.position.y = 0.75;
    const disc = place(cyl(b, 0.85, 0.85, 0.1, glowMat(b, TONE.gold, 0.3, { metalness: 0.5 }), 36), [0, 1.4, 0]), stem = place(cyl(b, 0.06, 0.06, 0.8, mat(b, "#aeb8d6", { metalness: 0.7 }), 12), [0, 1.8, 0]), tip = place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.06, 0.15, 10)), mat(b, "#aeb8d6")), [0, 0.1, 0]); tip.rotation.x = Math.PI;
    top.add(body, disc, stem, tip); top.position.y = 0.0; g.add(top, place(cyl(b, 1.1, 1.1, 0.03, glowMat(b, "#3a4a7a", 0.25), 32), [0, -0.02, 0])); root.add(g); shadows(g);
    return done(root, b, (f) => { top.rotation.y = f * 0.5; top.rotation.z = 0.18 * Math.sin(f * 0.04); top.rotation.x = 0.18 * Math.cos(f * 0.04); });
  },
};
