// Antena de telefonía y avión de pasajeros genérico (R1), construidos en código, sin marcas.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE } from "../../style";
import { type HeroDef, bin, screenTex, shadows } from "../types";

export const antena: HeroDef = {
  kind: "primitive",
  when: "Antena o torre de telefonía: cobertura, señal, redes, ondas de radio.",
  poses: ["torre"],
  center: [0, 1.5, 0], radius: 1.35,
  anchors: { hero: [0, 1.6, 0], top: [0, 3.05, 0], base: [0, 0.05, 0], emisor: [0, 2.6, 0] },
  build: () => {
    const b = bin(), root = new THREE.Group();
    const steel = b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.light.cream).multiplyScalar(0.75), metalness: 0.6, roughness: 0.4 }));
    const bar = b.track(new THREE.CylinderGeometry(0.025, 0.025, 1, 6));
    const leg = (a: THREE.Vector3, c: THREE.Vector3) => { const m = new THREE.Mesh(bar, steel), d = c.clone().sub(a); m.position.copy(a).add(c).multiplyScalar(0.5); m.scale.y = d.length(); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); root.add(m); };
    // celosía de tres patas que se estrecha hacia arriba, con riostras en zigzag
    const H = 2.9, w = (y: number) => 0.55 - 0.4 * (y / H);
    const corner = (k: number, y: number) => new THREE.Vector3(Math.cos((k * 2 * Math.PI) / 3) * w(y), y, Math.sin((k * 2 * Math.PI) / 3) * w(y));
    for (let k = 0; k < 3; k++) {
      leg(corner(k, 0), corner(k, H));
      for (let s = 0; s < 6; s++) { const y0 = (s * H) / 6, y1 = ((s + 1) * H) / 6; leg(corner(k, y0), corner((k + 1) % 3, y1)); leg(corner(k, y1), corner((k + 1) % 3, y1)); }
    }
    // paneles emisores arriba y platos de microondas
    const panel = b.track(new RoundedBoxGeometry(0.16, 0.5, 0.06, 2, 0.02)), panelMat = b.track(new THREE.MeshStandardMaterial({ color: PALETTE.light.cream, roughness: 0.6 }));
    for (let k = 0; k < 3; k++) { const a = (k * 2 * Math.PI) / 3 + 0.5, m = new THREE.Mesh(panel, panelMat); m.position.set(Math.cos(a) * 0.3, 2.55, Math.sin(a) * 0.3); m.rotation.y = -a + Math.PI / 2; root.add(m); }
    const dish = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 3)), panelMat);
    dish.rotation.x = Math.PI / 2; dish.position.set(0.1, 1.9, 0.3); root.add(dish);
    // baliza roja en la punta (parpadea, bloom)
    const beacon = b.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.ui.red).multiplyScalar(4) }));
    const tip = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.06, 12, 8)), beacon); tip.position.y = H + 0.08; root.add(tip);
    // base de hormigón
    const base = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.75, 0.8, 0.12, 6)), b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.mid.lavender).multiplyScalar(0.7), roughness: 0.9 })));
    base.position.y = 0.06; root.add(base);
    shadows(root);
    return { root, update: (f) => { beacon.color.setRGB(1, 0.35, 0.37).multiplyScalar(1 + 3.5 * (Math.sin(f * 0.21) > 0.3 ? 1 : 0.1)); }, dispose: b.dispose };
  },
};

export const avion: HeroDef = {
  kind: "primitive",
  when: "Avión de pasajeros genérico (sin aerolínea): vuelos, modo avión, viajes.",
  poses: ["vuelo", "frente"],
  center: [0, 1.3, 0], radius: 1.5,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.3, 0], cabina: [1.5, 1.4, 0.2], ventanilla: [0, 1.4, 0.3], base: [0, 0.4, 0] },
  build: (_L, pose) => {
    const b = bin(), root = new THREE.Group(), plane = new THREE.Group();
    const white = b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.light.white).multiplyScalar(0.92), roughness: 0.35, metalness: 0.15 }));
    const accent = b.track(new THREE.MeshStandardMaterial({ color: PALETTE.ui.red, roughness: 0.45 }));
    const gray = b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.mid.lavender).multiplyScalar(0.8), metalness: 0.5, roughness: 0.35 }));
    // fuselaje: cápsula larga en el eje x con franja de ventanillas pintada
    // uv de la cápsula: u da la vuelta (u = 0 mira a +z, u = 0,25 arriba), v va de la nariz (+x, v = 0) a la cola;
    // el canvas tiene u en horizontal y v en vertical invertida (flipY)
    const winTex = screenTex(b.track, 1024, 1024, (g) => {
      const X = (u: number) => u * 1024, Y = (v: number) => (1 - v) * 1024;
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 1024, 1024);
      for (const [u0, u1] of [[0.93, 0.955], [0.545, 0.57]]) { g.fillStyle = PALETTE.ui.red; g.fillRect(X(u0), Y(0.95), X(u1) - X(u0), Y(0.05) - Y(0.95)); }
      g.fillStyle = PALETTE.bg.night1;
      for (const u of [0.03, 0.47]) for (let v = 0.2; v < 0.86; v += 0.022) { g.beginPath(); g.roundRect(X(u) - 18, Y(v) - 7, 36, 14, 6); g.fill(); }
      for (const u of [0.05, 0.45]) { g.beginPath(); g.roundRect(X(u) - 26, Y(0.075) - 10, 52, 20, 8); g.fill(); }
    });
    const body = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.36, 3.4, 8, 32)), b.track(new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.35, metalness: 0.15 })));
    body.rotation.z = Math.PI / 2;
    // alas en flecha, estabilizadores y deriva con acento rojo
    const wingShape = new THREE.Shape(); wingShape.moveTo(0.5, 0); wingShape.lineTo(-0.35, 2.4); wingShape.lineTo(-0.75, 2.4); wingShape.lineTo(-0.6, 0); wingShape.lineTo(0.5, 0);
    const wingGeo = b.track(new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }));
    for (const s of [1, -1]) { const w = new THREE.Mesh(wingGeo, white); w.rotation.x = (s * Math.PI) / 2; w.position.set(0, -0.12, 0); plane.add(w); // el ala crece hacia +z / -z
      const eng = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.15, 0.13, 0.55, 20)), gray); eng.rotation.z = Math.PI / 2; eng.position.set(0.15, -0.3, s * 0.95); plane.add(eng); }
    const finShape = new THREE.Shape(); finShape.moveTo(0, 0); finShape.lineTo(-0.55, 0.95); finShape.lineTo(-0.85, 0.95); finShape.lineTo(-0.7, 0); finShape.lineTo(0, 0);
    const fin = new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: false })), accent); fin.position.set(-1.45, 0.2, -0.025); plane.add(fin);
    const tailGeo = b.track(new THREE.BoxGeometry(0.4, 0.04, 1.4)); const tail = new THREE.Mesh(tailGeo, white); tail.position.set(-1.85, 0.12, 0); plane.add(tail);
    // luces de navegación (bloom)
    const nav = (col: string, z: number) => { const m = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.035, 8, 6)), b.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(5) }))); m.position.set(-0.7, -0.08, z); plane.add(m); };
    nav(PALETTE.ui.red, -2.45); nav(PALETTE.ui.green, 2.45);
    plane.add(body); shadows(plane);
    plane.position.y = 1.3; root.add(plane);
    const yaw = pose === "frente" ? -0.6 : -0.12;
    return { root, update: (f) => { plane.rotation.set(0.05 * Math.sin(f * 0.02), yaw + 0.03 * Math.sin(f * 0.012), 0.08 + 0.02 * Math.sin(f * 0.03)); plane.position.y = 1.3 + 0.06 * Math.sin(f * 0.035); }, dispose: b.dispose };
  },
};
