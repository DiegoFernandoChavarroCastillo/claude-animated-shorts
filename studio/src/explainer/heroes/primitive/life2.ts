// Pack H (2.ª tanda) · Vida: hongo con micelio, mariposa, medusa, murciélago, huevo con embrión y flor con polen.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, cyl, ghostMat, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const hongo_micelio: HeroDef = {
  kind: "primitive",
  when: "Hongos y descomposición: setas, micelio bajo el suelo, moho, levaduras, cómo se comunican los árboles, por qué crecen hongos con humedad, reciclaje en la naturaleza.",
  poses: ["corte"],
  center: [0, 1.0, 0], radius: 1.6,
  anchors: { hero: [0, 1.0, 0.4], top: [0, 2.2, 0], base: [0, 0.05, 0], sombrero: [0, 1.7, 0.3], micelio: [0, 0.3, 0.76], laminas: [0, 1.4, 0.3] },
  build: (_L, pose) => {
    poseOf(hongo_micelio, pose, "hongo_micelio");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const soil = box(b, 2.8, 0.9, 1.5, mat(b, "#4a3326", { roughness: 1 })); soil.position.y = 0.45; const top = box(b, 2.8, 0.08, 1.5, glowMat(b, "#4f8a46", 0.15)); top.position.y = 0.92;
    const stem = cyl(b, 0.2, 0.28, 0.9, glowMat(b, "#f2ead6", 0.25), 20); stem.position.y = 1.4; const cap = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.75, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2)), glowMat(b, "#d9444e", 0.25, { roughness: 0.5 })); cap.position.y = 1.8; cap.scale.y = 0.75;
    const dots = scatter(8, 3, (r) => { const a = r() * 6.28, t = 0.2 + r() * 0.5; return [Math.cos(a) * t, 0, Math.sin(a) * t] as P3; }).map(([x, , z]) => { const y = 1.8 + Math.sqrt(Math.max(0, 0.5 - (x * x + z * z))) * 0.75 * 1.0; return place(ball(b, 0.07, mat(b, "#fff"), 8), [x, Math.max(1.8, 1.8 + 0.75 * 0.75 * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / 0.5625))), z]); });
    const myc = scatter(7, 4, (r) => [(r() - 0.5) * 2.2, 0.15 + r() * 0.5, 0.76] as P3).map((q, i) => { const pts: P3[] = [[0, 0.85, 0.76]]; let x = 0, y = 0.85; for (let k = 0; k < 5; k++) { x += (q[0] - x) * 0.4 + 0.05 * Math.sin(k + i); y += (q[1] - y) * 0.45; pts.push([x, y, 0.76]); } return tube(b, pts, 0.014, beam(b, "#fff0c0", 1.3), 16); });
    const sp = scatter(8, 6, (r) => [(r() - 0.5) * 1.0, r(), 0] as P3).map((q) => ({ s: ball(b, 0.03, beam(b, "#fff6d0", 1.4, { transparent: true, opacity: 0.7 }), 6), q }));
    g.add(soil, top, stem, cap, ...dots, ...myc, ...sp.map((s) => s.s)); g.rotation.y = 0.15; root.add(g); shadows(g);
    return done(root, b, (f) => { sp.forEach(({ s, q }, i) => { const t = (f * 0.008 + q[1] + i * 0.1) % 1; s.position.set(q[0] * (1 + t), 1.1 + t * 1.2, 0.2 * Math.sin(i)); (s.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t); }); cap.scale.set(1 + 0.01 * Math.sin(f * 0.1), 0.75, 1 + 0.01 * Math.sin(f * 0.1)); g.rotation.y = 0.15 + 0.3 * Math.sin(f * 0.01); });
  },
};

export const mariposa: HeroDef = {
  kind: "primitive",
  when: "Mariposas y metamorfosis: oruga a mariposa, colores de las alas, migración de la monarca, cómo vuelan los insectos, ciclo de vida, polillas y luz.",
  poses: ["vuelo"],
  center: [0, 1.5, 0], radius: 1.0,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], ala: [0.9, 1.7, 0], antena: [0.1, 2.3, 0.3], cuerpo: [0, 1.5, 0] },
  build: (_L, pose) => {
    poseOf(mariposa, pose, "mariposa");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), bf = new THREE.Group();
    const tex = screenTex(b.track, 256, 256, (c) => { c.fillStyle = "#ff8a2e"; c.fillRect(0, 0, 256, 256); c.strokeStyle = "#1b1b2a"; c.lineWidth = 14; c.strokeRect(4, 4, 248, 248); c.beginPath(); c.moveTo(0, 0); c.lineTo(256, 256); c.moveTo(0, 128); c.lineTo(180, 200); c.moveTo(60, 0); c.lineTo(190, 130); c.stroke(); c.fillStyle = "#fff"; for (const [x, y] of [[190, 40], [220, 90], [140, 60], [90, 210]]) { c.beginPath(); c.arc(x, y, 12, 0, 6.3); c.fill(); } });
    const wm = b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.35), side: THREE.DoubleSide, roughness: 0.6 }));
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(0.2, 1.0, 1.1, 1.3, 1.5, 0.7); sh.bezierCurveTo(1.7, 0.2, 1.2, -0.1, 0.9, -0.1); sh.bezierCurveTo(1.2, -0.5, 0.9, -1.0, 0.5, -0.9); sh.bezierCurveTo(0.2, -0.8, 0, -0.4, 0, 0);
    const wingGeo = b.track(new THREE.ShapeGeometry(sh, 24)), wings = [-1, 1].map((s) => { const w = new THREE.Mesh(wingGeo, wm); w.scale.x = s; const a = new THREE.Group(); a.add(w); w.rotation.x = -Math.PI / 2 + 0.0; a.position.y = 0.0; return { a, s }; });
    const body = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.08, 0.85, 6, 12)), mat(b, "#1b1b2a")); body.rotation.x = Math.PI / 2; const head = place(ball(b, 0.12, mat(b, "#1b1b2a"), 10), [0, 0, 0.55]), ants = [-1, 1].map((s) => tube(b, [[s * 0.04, 0, 0.6], [s * 0.15, 0.1, 0.9], [s * 0.3, 0.05, 1.05]], 0.012, mat(b, "#1b1b2a"), 10));
    bf.add(body, head, ...ants, ...wings.map((w) => w.a)); bf.position.y = 1.5; g.add(bf); root.add(g); shadows(g);
    return done(root, b, (f) => { const flap = 0.2 + 0.9 * (0.5 + 0.5 * Math.sin(f * 0.25)); wings.forEach(({ a, s }) => { a.rotation.z = -s * flap * 0.9; }); bf.position.y = 1.5 + 0.12 * Math.sin(f * 0.1); bf.rotation.set(-0.5, 0.7 + 0.5 * Math.sin(f * 0.012), 0.1 * Math.sin(f * 0.05)); });
  },
};

export const medusa: HeroDef = {
  kind: "primitive",
  when: "Medusas y vida marina profunda: cómo se mueven sin cerebro, bioluminiscencia, picaduras, animales transparentes, el océano profundo, por qué brillan algunos animales marinos.",
  poses: ["nada"],
  center: [0, 1.6, 0], radius: 1.5,
  anchors: { hero: [0, 1.6, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], campana: [0, 2.2, 0], tentaculo: [0.3, 0.7, 0], brillo: [0, 1.9, 0] },
  build: (_L, pose) => {
    poseOf(medusa, pose, "medusa");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), jelly = new THREE.Group();
    const bell = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.9, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2)), glowMat(b, "#b36bff", 0.5, { transparent: true, opacity: 0.55, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false })); bell.scale.y = 0.8; bell.position.y = 2.0;
    const core = ball(b, 0.35, beam(b, "#ff9ae8", 1.2, { transparent: true, opacity: 0.8 }), 20); core.position.y = 2.2; core.scale.y = 0.6;
    const rim = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.9, 0.03, 8, 48)), beam(b, "#e8b8ff", 1.5)); rim.rotation.x = Math.PI / 2; rim.position.y = 2.0;
    const tent = Array.from({ length: 12 }, (_, i) => ({ i, m: new THREE.Mesh(new THREE.BufferGeometry(), glowMat(b, i % 2 ? "#d89aff" : "#ff9ae8", 0.7, { transparent: true, opacity: 0.8 })) })); tent.forEach(({ m }) => { b.track(m.geometry); jelly.add(m); });
    jelly.add(bell, core, rim); g.add(jelly); root.add(g);
    return done(root, b, (f) => {
      const pulse = Math.sin(f * 0.1); bell.scale.set(1 + 0.12 * pulse, 0.8 - 0.12 * pulse, 1 + 0.12 * pulse); rim.scale.set(1 + 0.12 * pulse, 1 + 0.12 * pulse, 1);
      tent.forEach(({ i, m }) => { m.geometry.dispose(); const a = (i / 12) * 6.28, len = 1.6 + 0.5 * ((i * 7) % 3) / 2, pts = Array.from({ length: 10 }, (_, k) => { const t = k / 9; return new THREE.Vector3(Math.cos(a) * (0.75 - 0.4 * t + 0.12 * Math.sin(f * 0.1 - t * 5 + i)), 2.0 - t * len, Math.sin(a) * (0.75 - 0.4 * t) + 0.1 * Math.sin(f * 0.08 - t * 4)); }); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.025 + (i % 2) * 0.012, 6, false); });
      jelly.position.y = 0.15 * Math.sin(f * 0.05) + 0.2 * pulse * 0.5; g.rotation.y = 0.3 * Math.sin(f * 0.01);
    });
  },
};

export const murcielago: HeroDef = {
  kind: "primitive",
  when: "Murciélagos y ecolocalización: cómo ven en la oscuridad, ultrasonido, sonar, mamíferos que vuelan, cuevas, por qué duermen al revés, eco y sonido.",
  poses: ["vuelo"],
  center: [0, 1.5, 0], radius: 1.15,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], ala: [1.2, 1.6, 0], boca: [0, 1.5, 0.7], onda: [0, 1.5, 1.5] },
  build: (_L, pose) => {
    poseOf(murcielago, pose, "murcielago");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), bat = new THREE.Group();
    const fur = glowMat(b, "#4a3a5a", 0.25, { roughness: 0.8 }), skin = glowMat(b, "#2a2038", 0.2, { side: THREE.DoubleSide, roughness: 0.8 });
    const body = ball(b, 0.35, fur, 20); body.scale.set(0.8, 0.9, 1.2); const head = place(ball(b, 0.22, fur, 16), [0, 0.25, 0.4]), ears = [-1, 1].map((s) => { const e = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.1, 0.3, 8)), fur); e.position.set(s * 0.14, 0.5, 0.38); return e; }), eyes = [-1, 1].map((s) => place(ball(b, 0.035, beam(b, "#ffe08a", 1.6), 6), [s * 0.09, 0.3, 0.58]));
    const sh = new THREE.Shape(); sh.moveTo(0, 0.25); sh.lineTo(0.7, 0.8); sh.lineTo(1.0, 0.35); sh.lineTo(1.4, 0.55); sh.lineTo(1.5, 0.0); sh.lineTo(1.2, -0.3); sh.lineTo(0.85, -0.1); sh.lineTo(0.5, -0.5); sh.lineTo(0, -0.4); sh.lineTo(0, 0.25);
    const wGeo = b.track(new THREE.ShapeGeometry(sh)), wings = [-1, 1].map((s) => { const w = new THREE.Mesh(wGeo, skin); w.scale.x = s; w.rotation.x = -Math.PI / 2; const a = new THREE.Group(); a.add(w); return { a, s }; });
    const rings = [0, 1, 2, 3].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(0.3, 0.015, 6, 28, Math.PI * 1.2)), beam(b, TONE.cyan, 1.6, { transparent: true, opacity: 0.8 })));
    bat.add(body, head, ...ears, ...eyes, ...wings.map((w) => w.a)); bat.position.y = 1.5; g.add(bat, ...rings); root.add(g); shadows(g);
    return done(root, b, (f) => { const fl = 0.55 * Math.sin(f * 0.2); wings.forEach(({ a, s }) => { a.rotation.z = -s * fl; }); bat.position.y = 1.5 + 0.1 * Math.sin(f * 0.1); bat.rotation.set(0.1, 0.9 + 0.3 * Math.sin(f * 0.011), 0); rings.forEach((r, i) => { const t = (f * 0.014 + i / 4) % 1; r.position.set(0, 1.75, 0.5 + t * 2.0); r.scale.setScalar(0.4 + t * 2.0); r.rotation.set(0, 0, 0); (r.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t); }); });
  },
};

export const huevo_embrion: HeroDef = {
  kind: "primitive",
  when: "Huevos y desarrollo: cómo se forma un pollito, yema y clara, por qué las gallinas ponen huevos, incubación, desarrollo del embrión, cáscara de huevo y su dureza.",
  poses: ["corte"],
  center: [0, 1.3, 0], radius: 1.1,
  anchors: { hero: [0, 1.3, 0.3], top: [0, 2.5, 0], base: [0, 0.1, 0], yema: [0, 1.3, 0.4], clara: [0.5, 1.5, 0.4], embrion: [0, 1.5, 0.45], cascara: [0.8, 1.3, 0.2] },
  build: (_L, pose) => {
    poseOf(huevo_embrion, pose, "huevo_embrion");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const prof = Array.from({ length: 21 }, (_, i) => { const t = i / 20, y = -1 + 2 * t, r = 0.78 * Math.sqrt(Math.max(0, 1 - y * y)) * (1 + 0.14 * y); return new THREE.Vector2(r, y * 1.05); });
    const shell = new THREE.Mesh(b.track(new THREE.LatheGeometry(prof, 40, Math.PI / 2, Math.PI)), glowMat(b, "#f4e8d0", 0.25, { side: THREE.DoubleSide, roughness: 0.6 }));
    const albumen = new THREE.Mesh(b.track(new THREE.LatheGeometry(prof.map((p) => new THREE.Vector2(p.x * 0.93, p.y * 0.96)), 40, Math.PI / 2, Math.PI)), glowMat(b, "#fffdf0", 0.5, { side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    const cut = new THREE.Mesh(b.track(new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); prof.forEach((p, i) => (i ? s.lineTo(-p.x * 0.93, p.y * 0.96) : s.moveTo(-p.x * 0.93, p.y * 0.96))); [...prof].reverse().forEach((p) => s.lineTo(p.x * 0.93, p.y * 0.96)); return s; })(), 20)), glowMat(b, "#fff6dc", 0.5, { side: THREE.DoubleSide })); cut.position.z = 0.005;
    const yolk = place(ball(b, 0.36, glowMat(b, "#ffb02e", 0.55), 28), [0, -0.05, 0.12]), emb = new THREE.Group();
    emb.add(place(ball(b, 0.13, glowMat(b, "#ffd0b8", 0.5), 12), [0, 0.0, 0]), place(ball(b, 0.06, mat(b, "#1b1b2a"), 8), [0.05, 0.03, 0.1]), tube(b, [[-0.1, -0.05, 0], [-0.3, -0.15, 0], [-0.2, -0.3, 0]], 0.03, glowMat(b, "#ffd0b8", 0.5), 10)); emb.position.set(0, 0.35, 0.3);
    const vein = [0, 1, 2, 3].map((i) => tube(b, [[0, 0.35, 0.32], [Math.cos(i * 1.6) * 0.3, 0.1 + Math.sin(i * 1.6) * 0.2, 0.33], [Math.cos(i * 1.6) * 0.34, -0.15 + Math.sin(i * 1.6) * 0.2, 0.3]], 0.012, glowMat(b, TONE.glowRed, 0.7), 12));
    g.add(shell, albumen, cut, yolk, emb, ...vein); g.position.y = 1.3; g.scale.setScalar(1.15); root.add(g); shadows(g);
    return done(root, b, (f) => { emb.scale.setScalar(1 + 0.06 * Math.sin(f * 0.25)); g.rotation.y = 0.5 * Math.sin(f * 0.012); g.position.y = 1.3 + 0.03 * Math.sin(f * 0.04); });
  },
};

export const flor_polinizacion: HeroDef = {
  kind: "primitive",
  when: "Flores y reproducción de las plantas: polen, abejas polinizadoras, por qué las flores tienen colores y olor, alergias al polen, semillas y frutos, partes de una flor.",
  poses: ["abierta", "cerrada"],
  center: [0, 1.5, 0], radius: 1.3,
  anchors: { hero: [0, 1.9, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], petalo: [0.7, 2.0, 0.1], polen: [0, 2.0, 0.3], tallo: [0, 1.0, 0] },
  build: (_L, pose) => {
    const p = poseOf(flor_polinizacion, pose, "flor_polinizacion"), open = p === "abierta", b = bin(), root = new THREE.Group(), g = new THREE.Group(), fl = new THREE.Group();
    const green = glowMat(b, "#3fa05a", 0.25), stem = tube(b, [[0, 0.05, 0], [0.05, 1.0, 0], [0, 1.9, 0]], 0.07, green, 24), leaf = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.4, 14, 10)), glowMat(b, "#4fd46f", 0.25, { side: THREE.DoubleSide })); leaf.scale.set(1, 0.07, 0.45); leaf.position.set(0.45, 0.8, 0); leaf.rotation.z = 0.5;
    const pm = glowMat(b, "#ff7ab8", 0.4, { roughness: 0.5, side: THREE.DoubleSide }), petals = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * 6.28, pt = new THREE.Group(), m = ball(b, 0.5, pm, 18); m.scale.set(0.34, 1.0, 0.1); m.position.y = 0.5; pt.add(m); pt.rotation.z = a; return { pt, a }; });
    const center = ball(b, 0.2, glowMat(b, "#ffd24a", 0.7), 18), pistil = rod(b, [0, 0, 0], [0, 0.0, 0.3], 0.03, glowMat(b, TONE.green, 0.5)), stamens = Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * 6.28; return place(ball(b, 0.045, glowMat(b, "#ffe08a", 0.9), 8), [Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.15]); });
    petals.forEach(({ pt }) => fl.add(pt)); fl.add(center, pistil, ...stamens); fl.position.set(0, 2.0, 0); fl.rotation.x = 0.0;
    const pollen = scatter(open ? 16 : 0, 3, (r) => [(r() - 0.5) * 0.6, r(), (r() - 0.5) * 0.4] as P3).map((q) => ({ s: ball(b, 0.03, beam(b, "#ffe08a", 1.7), 6), q }));
    g.add(stem, leaf, fl, ...pollen.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { const o = open ? 1 : 0.15 + 0.03 * Math.sin(f * 0.03); petals.forEach(({ pt, a }) => { const sc = 0.55 + 0.45 * o; pt.scale.setScalar(sc); pt.children[0].rotation.x = 0; pt.rotation.x = open ? 0 : 0; pt.position.z = -(1 - o) * 0.25; pt.rotation.y = (1 - o) * 0.9 * Math.cos(a) * 0 + 0; }); fl.scale.set(1, 1, 1); pollen.forEach(({ s, q }, i) => { const t = (f * 0.01 + q[1] + i * 0.06) % 1; s.position.set(q[0] + 0.9 * t * (i % 2 ? 1 : -1), 2.0 + 0.9 * t, q[2]); (s.material as THREE.MeshBasicMaterial).opacity = 1; }); fl.rotation.z = 0.06 * Math.sin(f * 0.04); g.rotation.y = 0.5 * Math.sin(f * 0.01); });
  },
};
