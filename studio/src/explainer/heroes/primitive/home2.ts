// Pack I (2.ª tanda) · Hogar, tecnología, historia y mates: nevera, candado, engranajes, catapulta, Pitágoras y moneda.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const nevera: HeroDef = {
  kind: "primitive",
  when: "Refrigerador y frío: cómo enfría una nevera, congelador, por qué se conserva la comida, bacterias y temperatura, ciclo de refrigeración, aire acondicionado.",
  poses: ["abierta"],
  center: [0, 1.4, 0], radius: 1.5,
  anchors: { hero: [0, 1.4, 0.4], top: [0, 2.9, 0], base: [0, 0.1, 0], estante: [0, 1.4, 0.6], congelador: [0, 2.3, 0.6], puerta: [-1.0, 1.4, 0.8] },
  build: (_L, pose) => {
    poseOf(nevera, pose, "nevera");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const shell = mat(b, "#e8ebf6", { metalness: 0.3, roughness: 0.4 }), inner = glowMat(b, "#cfe7ff", 0.5, { side: THREE.BackSide });
    const body = [place(box(b, 1.7, 0.08, 1.2, shell), [0, 0.04, 0]), place(box(b, 1.7, 0.08, 1.2, shell), [0, 2.76, 0]), place(box(b, 0.08, 2.8, 1.2, shell), [-0.85, 1.4, 0]), place(box(b, 0.08, 2.8, 1.2, shell), [0.85, 1.4, 0]), place(box(b, 1.7, 2.8, 0.06, inner), [0, 1.4, -0.57])];
    const shelves = [0.7, 1.35, 2.0].map((y) => place(box(b, 1.64, 0.04, 1.1, glowMat(b, "#a8d8f0", 0.4, { transparent: true, opacity: 0.6 })), [0, y, 0.0]));
    const sep = place(box(b, 1.64, 0.05, 1.1, shell), [0, 2.1, 0]);
    const food = [[-0.45, 0.88, "#d9444e"], [0.1, 0.84, "#3ddc84"], [0.5, 0.9, "#ffd24a"], [-0.3, 1.52, "#b36bff"], [0.4, 1.5, "#4a78e8"], [-0.4, 2.2, "#e8f4ff"], [0.35, 2.2, "#bfe6ff"]].map(([x, y, c]) => place(box(b, 0.34, 0.3, 0.34, glowMat(b, c as string, 0.4)), [x as number, y as number, 0.0]));
    const door = new THREE.Group(); door.add(place(box(b, 1.7, 2.8, 0.1, shell), [0.85, 0, 0]), place(box(b, 0.08, 0.8, 0.12, mat(b, "#8a92b8")), [1.55, 0.2, 0.1]), ...[0.5, -0.1, -0.7].map((y) => place(box(b, 1.4, 0.05, 0.2, glowMat(b, "#a8d8f0", 0.3)), [0.85, y, -0.12]))); door.position.set(-0.85, 1.4, 0.6); door.rotation.y = 2.0;
    const mist = scatter(14, 4, (r) => [(r() - 0.5) * 1.4, r(), r()] as P3).map((q) => ({ s: ball(b, 0.2, glowMat(b, "#cfe7ff", 0.3, { transparent: true, opacity: 0.22, depthWrite: false }), 10), q }));
    g.add(...body, ...shelves, sep, ...food, door, ...mist.map((m) => m.s)); g.rotation.y = -0.15; root.add(g); shadows(g);
    return done(root, b, (f) => { mist.forEach(({ s, q }, i) => { const t = (f * 0.008 + q[1] + i * 0.05) % 1; s.position.set(q[0] * (1 + t * 0.8), 0.4 - 0.3 * t * 0 + (1 - t) * 0.0 + 0.0, 0.7 + t * 0.9); s.position.y = 0.9 - t * 0.7; s.scale.setScalar(0.6 + t); (s.material as THREE.MeshStandardMaterial).opacity = 0.25 * (1 - t); }); door.rotation.y = 2.0 + 0.05 * Math.sin(f * 0.03); g.rotation.y = -0.15 + 0.25 * Math.sin(f * 0.01); });
  },
};

export const candado_cifrado: HeroDef = {
  kind: "primitive",
  when: "Seguridad y cifrado: contraseñas, candados digitales, cómo se protege la información, internet seguro, claves y hackeos, privacidad, cifrado de mensajes.",
  poses: ["cerrado", "abierto"],
  center: [0, 1.4, 0], radius: 1.2,
  anchors: { hero: [0, 1.2, 0.3], top: [0, 2.8, 0], base: [0, 0.1, 0], arco: [0, 2.3, 0], cerradura: [0, 1.0, 0.45], codigo: [0, 1.6, 0.45] },
  build: (_L, pose) => {
    const p = poseOf(candado_cifrado, pose, "candado_cifrado"), open = p === "abierto", b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const gold = glowMat(b, open ? TONE.green : TONE.gold, 0.35, { metalness: 0.8, roughness: 0.3 }), steel = mat(b, "#cfd6ea", { metalness: 0.9, roughness: 0.2 });
    const body = place(box(b, 1.5, 1.2, 0.6, gold), [0, 0.9, 0]), shackleP: P3[] = Array.from({ length: 25 }, (_, i) => { const a = Math.PI * (i / 24); return [Math.cos(a) * 0.5, 1.5 + Math.sin(a) * 0.55, 0] as P3; }), sh = tube(b, shackleP, 0.09, steel, 40), shG = new THREE.Group(); shG.add(sh);
    const hole = place(ball(b, 0.11, mat(b, "#10101c"), 12), [0, 1.0, 0.31]), slot = place(box(b, 0.07, 0.3, 0.05, mat(b, "#10101c")), [0, 0.85, 0.31]);
    const digits = Array.from({ length: 12 }, (_, i) => { const t = screenTex(b.track, 64, 64, (c) => { c.fillStyle = open ? TONE.green : TONE.cyan; c.font = "700 56px monospace"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(i % 3 === 0 ? "1" : "0", 32, 36); }); const m = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.24, 0.24)), b.track(new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false }))); return { m, i }; });
    digits.forEach(({ m }) => g.add(m)); g.add(body, shG, hole, slot); g.position.y = 0.2; root.add(g); shadows(g);
    return done(root, b, (f) => { shG.position.y = open ? 0.3 : 0; shG.rotation.y = open ? 0 : 0; shG.rotation.z = open ? -0.0 : 0; shG.position.x = open ? 0.5 : 0; shG.rotation.z = open ? 0.0 : 0; digits.forEach(({ m, i }) => { const a = f * 0.012 + (i / 12) * 6.28, r = 1.3; m.position.set(Math.cos(a) * r, 1.4 + 0.55 * Math.sin(a * 2 + i), Math.sin(a) * r * 0.8); m.lookAt(0, 1.4, 10); }); g.rotation.y = 0.35 * Math.sin(f * 0.01); });
  },
};

export const engranajes: HeroDef = {
  kind: "primitive",
  when: "Engranajes y mecanismos: cómo funciona un reloj o una bicicleta, transmisión, velocidad y fuerza, máquinas, relaciones de giro, ventaja mecánica, motores.",
  poses: ["giran"],
  center: [0, 1.4, 0], radius: 1.6,
  anchors: { hero: [0, 1.4, 0.2], top: [0, 2.8, 0], base: [0, 0.1, 0], grande: [-0.8, 1.4, 0.3], pequeno: [0.8, 1.4, 0.3], diente: [-0.8, 2.3, 0.3] },
  build: (_L, pose) => {
    poseOf(engranajes, pose, "engranajes");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const gear = (n: number, r: number, c: string) => { const gr = new THREE.Group(), m = glowMat(b, c, 0.3, { metalness: 0.7, roughness: 0.35 }), body = new THREE.Mesh(b.track(new THREE.CylinderGeometry(r, r, 0.3, 40)), m); body.rotation.x = Math.PI / 2; gr.add(body); for (let i = 0; i < n; i++) { const a = (i / n) * 6.28, t = place(box(b, r * 0.3, 0.3, r * 0.22, m), [Math.cos(a) * (r + r * 0.1), Math.sin(a) * (r + r * 0.1), 0]); t.rotation.z = a; gr.add(t); } const hub = new THREE.Mesh(b.track(new THREE.CylinderGeometry(r * 0.25, r * 0.25, 0.4, 20)), mat(b, "#2a2f4a")); hub.rotation.x = Math.PI / 2; gr.add(hub); return gr; };
    const G1 = gear(16, 0.8, "#e2a03a"), G2 = gear(10, 0.5, "#4ab6ff"), G3 = gear(12, 0.6, "#ff5a5f");
    G1.position.set(-0.9, 1.4, 0); G2.position.set(0.52 * 1.0 + 0.0, 1.4 + 0.0, 0); G2.position.set(0.8 * 1.0 + 0.5 * 1.05 - 0.9 + 0.35, 1.4, 0); G3.position.set(-0.9, 1.4 + 0.8 + 0.6 + 0.12, 0);
    G2.position.set(-0.9 + 0.8 + 0.5 + 0.1, 1.4, 0);
    g.add(G1, G2, G3); root.add(g); shadows(g);
    return done(root, b, (f) => { const a = f * 0.03; G1.rotation.z = a; G2.rotation.z = -a * 1.6 + 0.15; G3.rotation.z = -a * 0.8 * 1.0 + 0.3; g.rotation.y = 0.4 * Math.sin(f * 0.01); });
  },
};

export const catapulta: HeroDef = {
  kind: "primitive",
  when: "Catapultas y máquinas antiguas: cómo se lanzaban rocas, ingeniería medieval, palancas y proyectiles, trayectoria parabólica, ángulo de lanzamiento, castillos y asedios.",
  poses: ["lista", "lanza"],
  center: [0, 1.1, 0], radius: 1.2,
  anchors: { hero: [0, 1.1, 0], top: [0, 2.3, 0], base: [0, 0.1, 0], brazo: [0, 1.5, 0.3], cesta: [-1.0, 1.6, 0], roca: [-1.0, 1.9, 0] },
  build: (_L, pose) => {
    const p = poseOf(catapulta, pose, "catapulta"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const wood = mat(b, "#8a5a3a", { roughness: 0.8 }), dark = mat(b, "#5a3a24", { roughness: 0.8 });
    const frame: THREE.Object3D[] = [place(box(b, 2.6, 0.15, 0.2, dark), [0, 0.2, 0.5]), place(box(b, 2.6, 0.15, 0.2, dark), [0, 0.2, -0.5]), place(box(b, 0.15, 0.15, 1.2, dark), [-1.1, 0.2, 0]), place(box(b, 0.15, 0.15, 1.2, dark), [1.1, 0.2, 0])];
    for (const z of [0.5, -0.5]) { const s1 = rod(b, [-0.3, 0.2, z], [0, 1.2, z], 0.07, dark), s2 = rod(b, [0.3, 0.2, z], [0, 1.2, z], 0.07, dark); frame.push(s1, s2); }
    const wheels = [[-1.0, 0.5], [1.0, 0.5], [-1.0, -0.5], [1.0, -0.5]].map(([x, z]) => { const w = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 18)), wood); w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z * 1.1); return w; });
    const armG = new THREE.Group(), arm = place(box(b, 2.2, 0.1, 0.14, wood), [-0.5, 0, 0]), bucket = place(cyl(b, 0.28, 0.2, 0.18, mat(b, "#6a4a30"), 14), [-1.5, 0.0, 0]), cw = place(box(b, 0.4, 0.4, 0.4, mat(b, "#6a708a")), [0.55, -0.2, 0]); armG.add(arm, bucket, cw); armG.position.set(0, 1.2, 0);
    const rock = ball(b, 0.14, mat(b, "#7a7a86", { roughness: 1 }), 12);
    g.add(...frame, ...wheels, armG, rock); g.rotation.y = 0.4; root.add(g); shadows(g);
    return done(root, b, (f) => {
      const T = p === "lanza" ? (f % 110) / 110 : 0; const a = p === "lanza" ? (T < 0.18 ? -0.6 + 1.5 * (T / 0.18) : 0.9 - 0.0) : -0.6 + 0.03 * Math.sin(f * 0.05); armG.rotation.z = a;
      if (p === "lanza" && T >= 0.18) { const u = (T - 0.18) / 0.5, x = -1.4 - 3.0 * u, y = 1.2 + 2.2 * u - 3.2 * u * u; rock.position.set(Math.max(-3.5, x), Math.max(0.15, y), 0); } else { const rx = -1.5 * Math.cos(a), ry = 1.2 - 1.5 * Math.sin(a) * -1 * 0; rock.position.set(rx, 1.2 + (-1.5) * Math.sin(a) + 0.25, 0); void ry; }
      g.rotation.y = 0.4 + 0.2 * Math.sin(f * 0.01);
    });
  },
};

export const pitagoras: HeroDef = {
  kind: "primitive",
  when: "Teorema de Pitágoras y geometría: triángulo rectángulo, hipotenusa, áreas de cuadrados, medir distancias, escaleras y rampas, relaciones entre lados, demostraciones visuales.",
  poses: ["cuadrados"],
  center: [0, 1.5, 0], radius: 1.8,
  anchors: { hero: [0, 1.5, 0.1], top: [0, 3.0, 0], base: [0, 0.1, 0], cateto_a: [-0.4, 0.8, 0.1], cateto_b: [-1.6, 2.0, 0.1], hipotenusa: [0.9, 2.2, 0.1] },
  build: (_L, pose) => {
    poseOf(pitagoras, pose, "pitagoras");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const A = 1.2, B = 0.9, C = 1.5, sq = (s: number, c: string) => glowMat(b, c, 0.4, { roughness: 0.5, transparent: true, opacity: 0.9 });
    const tri = new THREE.Shape(); tri.moveTo(0, 0); tri.lineTo(A, 0); tri.lineTo(0, B); tri.lineTo(0, 0);
    const tm = new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(tri, { depth: 0.18, bevelEnabled: false })), glowMat(b, "#e8ebf6", 0.35)); tm.position.set(-0.2, 0.9, 0);
    const sa = new THREE.Mesh(b.track(new THREE.BoxGeometry(A, A, 0.18)), sq(A, TONE.cyan)); sa.position.set(-0.2 + A / 2, 0.9 - A / 2, 0.0);
    const sb = new THREE.Mesh(b.track(new THREE.BoxGeometry(B, B, 0.18)), sq(B, TONE.gold)); sb.position.set(-0.2 - B / 2, 0.9 + B / 2, 0.0);
    const sc = new THREE.Mesh(b.track(new THREE.BoxGeometry(C, C, 0.18)), sq(C, TONE.glowRed)); sc.position.set(-0.2 + (A + B) / 2 * 0.0 + (A / 2 + B / 2) * 0.0 + 0.6, 0.9 + 0.6 + 0.0, 0.0); sc.rotation.z = -Math.atan2(B, A); sc.position.set(-0.2 + A / 2 + B * 0.5 * 1.0 * (B / C) * 1.0 + 0.0, 0.9 + B / 2 + A * 0.5 * (A / C) * 1.0 + 0.0, 0);
    const grid = (s: number, n: number, c: string, o: THREE.Object3D) => { for (let i = 1; i < n; i++) { const l1 = place(box(b, s, 0.02, 0.2, mat(b, c)), [0, -s / 2 + (i / n) * s, 0.1]), l2 = place(box(b, 0.02, s, 0.2, mat(b, c)), [-s / 2 + (i / n) * s, 0, 0.1]); o.add(l1, l2); } };
    grid(A, 4, "#0a2a3a", sa); grid(B, 3, "#3a2a0a", sb);
    g.add(tm, sa, sb, sc); g.position.y = 0.2; g.rotation.y = 0.0; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.5 * Math.sin(f * 0.012); const k = 0.5 + 0.5 * Math.sin(f * 0.05); sa.position.z = 0.1 * k; sb.position.z = 0.1 * k; sc.position.z = 0.1 * k; });
  },
};

export const moneda_azar: HeroDef = {
  kind: "primitive",
  when: "Azar y probabilidad: lanzar una moneda, cara o cruz, la falacia del jugador, por qué el azar parece tener patrones, apuestas, loterías, suerte y estadística.",
  poses: ["gira"],
  center: [0, 1.6, 0], radius: 0.9,
  anchors: { hero: [0, 1.6, 0], top: [0, 3.0, 0], base: [0, 0.1, 0], cara: [0, 1.6, 0.1], cruz: [0, 1.6, -0.1], borde: [0.9, 1.6, 0] },
  build: (_L, pose) => {
    poseOf(moneda_azar, pose, "moneda_azar");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const face = (ch: string) => screenTex(b.track, 256, 256, (c) => { const gr = c.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, "#f7d86a"); gr.addColorStop(1, "#c9942a"); c.fillStyle = gr; c.fillRect(0, 0, 256, 256); c.strokeStyle = "#8a5a10"; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 112, 0, 6.3); c.stroke(); c.fillStyle = "#8a5a10"; c.font = "800 130px Montserrat, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(ch, 128, 140); });
    const t1 = face("C"), t2 = face("X"), edge = glowMat(b, "#d9a830", 0.35, { metalness: 0.8, roughness: 0.3 });
    const coin = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.85, 0.85, 0.14, 48)), [edge, b.track(new THREE.MeshStandardMaterial({ map: t1, emissiveMap: t1, emissive: new THREE.Color("#ffffff").multiplyScalar(0.35), metalness: 0.5, roughness: 0.4 })), b.track(new THREE.MeshStandardMaterial({ map: t2, emissiveMap: t2, emissive: new THREE.Color("#ffffff").multiplyScalar(0.35), metalness: 0.5, roughness: 0.4 }))]);
    const sh = place(cyl(b, 0.7, 0.7, 0.02, glowMat(b, "#10101c", 0.1, { transparent: true, opacity: 0.4 }), 24), [0, 0.02, 0]), sp = scatter(8, 3, (r) => [(r() - 0.5) * 1.8, r() * 2, (r() - 0.5) * 0.6] as P3).map((q) => ({ s: place(ball(b, 0.03, beam(b, "#fff0b0", 1.6), 6), q), q }));
    g.add(coin, sh, ...sp.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { const t = (f % 100) / 100, h = Math.sin(Math.min(1, t * 1.25) * Math.PI) * 1.3; coin.position.y = 0.8 + h * 1.2 + 0.0; coin.rotation.x = Math.PI / 2 + (t < 0.8 ? t * 24 : 24 * 0.8 + 0); coin.rotation.z = 0.1 * Math.sin(f * 0.1); sh.scale.setScalar(1 - 0.35 * (h / 1.3)); sp.forEach(({ s, q }, i) => { s.position.y = q[1] + 0.1 * Math.sin(f * 0.1 + i); s.visible = h > 0.4; }); });
  },
};
