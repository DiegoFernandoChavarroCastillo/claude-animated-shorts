// Objetos de ciencia construidos en código: chip, vaso de agua con hielo, cubo de hielo, moléculas de agua y un
// corte de lago helado. Materiales estándar (mismo modelo de luz que el entorno) y algún brillo emisivo.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE } from "../../style";
import { type HeroDef, bin, screenTex, shadows, poseOf } from "../types";

export const chip: HeroDef = {
  kind: "primitive",
  when: "Chip o sensor electrónico: acelerómetro, procesador, 'lo que hay dentro del aparato'.",
  poses: ["inclinado", "plano"],
  center: [0, 0.75, 0], radius: 1.15,
  anchors: { hero: [0, 0.75, 0], top: [0, 1.4, 0], base: [0, 0.1, 0], die: [0, 0.82, 0] },
  build: (_L, pose) => {
    const p = poseOf(chip, pose, "chip"), b = bin(), root = new THREE.Group(), c = new THREE.Group();
    const pkg = new THREE.Mesh(b.track(new RoundedBoxGeometry(1.7, 0.16, 1.7, 3, 0.04)),
      b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.mid.lavender).lerp(new THREE.Color(PALETTE.light.cream), 0.3), roughness: 0.4, metalness: 0.45 })));
    // tapa con rejilla de celdas (el "die") y pistas que brillan en cian
    const lid = screenTex(b.track, 512, 512, (g) => {
      g.fillStyle = PALETTE.bg.night1; g.fillRect(0, 0, 512, 512);
      g.strokeStyle = PALETTE.ui.grid; g.lineWidth = 3; for (let k = 0; k <= 512; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); }
      g.fillStyle = PALETTE.mid.lavender; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { g.globalAlpha = 0.5 + 0.5 * ((i * 7 + j * 3) % 5) / 4; g.fillRect(160 + i * 32 + 4, 160 + j * 32 + 4, 24, 24); }
      g.globalAlpha = 1; g.strokeStyle = PALETTE.ui.cyan; g.lineWidth = 5;
      for (const [x0, y0, x1, y1] of [[60, 120, 160, 160], [452, 120, 352, 160], [60, 392, 160, 352], [452, 392, 352, 352], [256, 30, 256, 160], [256, 482, 256, 352]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, (y0 + y1) / 2); g.lineTo(x1, y1); g.stroke(); }
    });
    const top = new THREE.Mesh(b.track(new THREE.PlaneGeometry(1.5, 1.5)), b.track(new THREE.MeshStandardMaterial({ map: lid, emissive: new THREE.Color(0.25, 0.4, 0.5), emissiveMap: lid, roughness: 0.4 })));
    top.rotation.x = -Math.PI / 2; top.position.y = 0.081;
    // patas doradas en los cuatro lados
    const pinGeo = b.track(new THREE.BoxGeometry(0.06, 0.05, 0.22)), pinMat = b.track(new THREE.MeshStandardMaterial({ color: PALETTE.warm.gold, metalness: 0.9, roughness: 0.3 }));
    for (let s = 0; s < 4; s++) for (let k = 0; k < 10; k++) {
      const pin = new THREE.Mesh(pinGeo, pinMat), t = -0.68 + k * 0.151, a = (s * Math.PI) / 2;
      pin.position.set(Math.cos(a) * 0.93 + Math.sin(a) * t, -0.04, Math.sin(a) * 0.93 + Math.cos(a) * t); pin.rotation.y = -a + Math.PI / 2; c.add(pin);
    }
    c.add(pkg, top); shadows(c);
    c.position.y = 0.75; root.add(c);
    const tilt = p === "plano" ? -0.05 : 0.5;
    return { root, update: (f) => { c.rotation.set(tilt + 0.03 * Math.sin(f * 0.02), 0.5 + f * 0.003, 0); c.position.y = 0.75 + 0.03 * Math.sin(f * 0.04); }, dispose: b.dispose };
  },
};

const ice = (b: ReturnType<typeof bin>, s: number) => new THREE.Mesh(b.track(new RoundedBoxGeometry(s, s, s, 3, s * 0.18)),
  b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color("#d8f1ff"), roughness: 0.15, metalness: 0, transparent: true, opacity: 0.82,
    emissive: new THREE.Color(PALETTE.ui.cyan).multiplyScalar(0.12) })));

export const vaso_agua_hielo: HeroDef = {
  kind: "primitive",
  when: "Vaso con agua y cubitos: agua, hielo, densidad, temperatura, bebidas.",
  poses: ["centro", "lateral"],
  center: [0, 1.15, 0], radius: 1.1,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.25, 0], base: [0, 0.05, 0], hielo: [0, 1.9, 0] },
  build: () => {
    const b = bin(), root = new THREE.Group();
    const glass = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.8, 0.66, 2.2, 48, 1, true)),
      b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color("#cfe7ff"), roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })));
    glass.position.y = 1.1; glass.renderOrder = 2;
    const bottom = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.66, 0.66, 0.12, 48)), b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color("#cfe7ff"), roughness: 0.1, transparent: true, opacity: 0.5 })));
    bottom.position.y = 0.06;
    const water = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.76, 0.66, 1.55, 48)),
      b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.ui.cyan).lerp(new THREE.Color(PALETTE.bg.indigo), 0.4), roughness: 0.1, transparent: true, opacity: 0.55,
        emissive: new THREE.Color(PALETTE.ui.cyan).multiplyScalar(0.08) })));
    water.position.y = 0.9; water.renderOrder = 1;
    const cubes = [[-0.25, 0.1, 0.4], [0.28, -0.15, -0.6], [0.05, 0.3, 1.1]].map(([x, z, a]) => { const c = ice(b, 0.5); c.position.set(x, 1.68, z); c.rotation.set(a * 0.4, a, a * 0.3); return c; });
    // brillo del borde (bloom suave) y bolitas de aire
    const rim = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.8, 0.012, 6, 64)), b.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.8, 2) })));
    rim.rotation.x = Math.PI / 2; rim.position.y = 2.2;
    root.add(bottom, water, ...cubes, glass, rim);
    shadows(bottom);
    return {
      root,
      update: (f) => cubes.forEach((c, i) => { c.position.y = 1.68 + 0.03 * Math.sin(f * 0.05 + i * 2); c.rotation.y += 0; c.rotation.z = 0.05 * Math.sin(f * 0.03 + i); }),
      dispose: b.dispose,
    };
  },
};

export const cubo_hielo: HeroDef = {
  kind: "primitive",
  when: "Un cubito de hielo solo: congelar, frío, estado sólido.",
  poses: ["flota"],
  center: [0, 1.1, 0], radius: 1.0,
  anchors: { hero: [0, 1.1, 0], top: [0, 1.9, 0], base: [0, 0.1, 0] },
  build: () => {
    const b = bin(), root = new THREE.Group(), c = ice(b, 1.4);
    c.position.y = 1.1; shadows(c); root.add(c);
    return { root, update: (f) => { c.rotation.set(0.25, 0.6 + f * 0.004, 0.1); c.position.y = 1.1 + 0.05 * Math.sin(f * 0.05); }, dispose: b.dispose };
  },
};

/** molécula de agua: O rojo coral y dos H blancos a 104,5° */
const h2o = (b: ReturnType<typeof bin>, mats: { o: THREE.Material; h: THREE.Material; bond: THREE.Material }, geos: { o: THREE.BufferGeometry; h: THREE.BufferGeometry; bond: THREE.BufferGeometry }) => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geos.o, mats.o));
  for (const s of [1, -1]) {
    const a = (s * 104.5 * Math.PI) / 360, d = new THREE.Vector3(Math.sin(a), -Math.cos(a), 0);
    const h = new THREE.Mesh(geos.h, mats.h); h.position.copy(d.clone().multiplyScalar(0.32)); g.add(h);
    const bd = new THREE.Mesh(geos.bond, mats.bond); bd.position.copy(d.clone().multiplyScalar(0.16)); bd.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); g.add(bd);
  }
  void b; return g;
};

export const moleculas_agua: HeroDef = {
  kind: "primitive",
  when: "Moléculas de agua: estructura del hielo (red hexagonal), líquido desordenado o una sola molécula.",
  poses: ["red_hexagonal", "liquido", "molecula"],
  center: [0, 1.2, 0], radius: 1.15,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.2, 0], base: [0, 0.2, 0] },
  build: (_L, pose) => {
    const p = poseOf(moleculas_agua, pose, "moleculas_agua"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const mats = {
      o: b.track(new THREE.MeshStandardMaterial({ color: PALETTE.ui.red, roughness: 0.35, emissive: new THREE.Color(PALETTE.ui.red).multiplyScalar(0.15) })),
      h: b.track(new THREE.MeshStandardMaterial({ color: PALETTE.light.white, roughness: 0.35 })),
      bond: b.track(new THREE.MeshStandardMaterial({ color: PALETTE.mid.lavender, roughness: 0.5 })),
    };
    const geos = { o: b.track(new THREE.SphereGeometry(0.13, 24, 16)), h: b.track(new THREE.SphereGeometry(0.075, 16, 12)), bond: b.track(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8)) };
    const hbond = b.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.ui.cyan).multiplyScalar(1.6), transparent: true, opacity: 0.7 }));
    const pts: THREE.Vector3[] = [];
    if (p === "molecula") { const m = h2o(b, mats, geos); m.scale.setScalar(3.2); g.add(m); }
    else if (p === "red_hexagonal") {
      // dos capas de anillos hexagonales (hielo Ih simplificado), con puentes de hidrógeno en cian
      const R = 0.42;
      for (let L = 0; L < 2; L++) for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        const cx = i * R * 1.732 + (j % 2 ? R * 0.866 : 0), cz = j * R * 1.5;
        if (Math.hypot(cx, cz) > 1.0) continue;
        for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; pts.push(new THREE.Vector3(cx + R * Math.cos(a), (L - 0.5) * 0.75 + (k % 2 ? 0.12 : -0.12), cz + R * Math.sin(a))); }
      }
      const uniq = pts.filter((q, i) => pts.findIndex((o) => o.distanceTo(q) < 0.05) === i);
      uniq.forEach((q, i) => { const m = h2o(b, mats, geos); m.position.copy(q); m.rotation.set(i * 1.3, i * 0.7, i * 2.1); g.add(m); });
      const seg = b.track(new THREE.CylinderGeometry(0.012, 0.012, 1, 6));
      uniq.forEach((a, i) => uniq.slice(i + 1).forEach((c) => {
        const d = a.distanceTo(c);
        if (d > 0.3 && d < 0.5) { const s = new THREE.Mesh(seg, hbond); s.position.copy(a).add(c).multiplyScalar(0.5); s.scale.y = d; s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize()); g.add(s); }
      }));
    } else {
      let s = 11; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      for (let i = 0; i < 26; i++) { const m = h2o(b, mats, geos); m.position.set((r() - 0.5) * 2, (r() - 0.5) * 1.6, (r() - 0.5) * 2); m.rotation.set(r() * 6, r() * 6, r() * 6); g.add(m); }
    }
    g.position.y = 1.2; shadows(g); root.add(g);
    const kids = g.children.slice();
    return {
      root,
      update: (f) => {
        g.rotation.y = 0.4 + f * 0.004; g.rotation.x = 0.25;
        if (p === "liquido") kids.forEach((k, i) => { k.rotation.x += 0; k.position.y += 0.0015 * Math.sin(f * 0.07 + i); });
      },
      dispose: b.dispose,
    };
  },
};

export const lago_corte: HeroDef = {
  kind: "primitive",
  when: "Corte de un lago helado: capa de hielo arriba, agua a 4 °C en el fondo, fondo del lago.",
  poses: ["corte"],
  center: [0, 1.2, 0], radius: 1.35,
  anchors: { hero: [0, 1.2, 0.9], top: [0, 2.15, 0.9], hielo: [0, 2.0, 0.9], fondo: [0, 0.45, 0.9], base: [0, 0.05, 0.9] },
  build: () => {
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    // bloque de agua con degradado vertical pintado (más oscuro y denso abajo) y cara frontal más clara
    const tex = screenTex(b.track, 256, 512, (c) => {
      const gr = c.createLinearGradient(0, 0, 0, 512);
      gr.addColorStop(0, "#7cc7ea"); gr.addColorStop(0.5, "#3c78b8"); gr.addColorStop(1, "#1d3a78");
      c.fillStyle = gr; c.fillRect(0, 0, 256, 512);
      for (let k = 0; k < 60; k++) { c.fillStyle = "rgba(255,255,255,0.18)"; c.beginPath(); c.arc((k * 97) % 256, 60 + ((k * 53) % 420), 2 + (k % 3), 0, Math.PI * 2); c.fill(); }
    });
    const water = new THREE.Mesh(b.track(new THREE.BoxGeometry(2.4, 1.5, 1.8)), b.track(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, transparent: true, opacity: 0.92 })));
    water.position.y = 1.05;
    const iceLayer = new THREE.Mesh(b.track(new RoundedBoxGeometry(2.46, 0.32, 1.86, 3, 0.05)),
      b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color("#e6f6ff"), roughness: 0.2, emissive: new THREE.Color(PALETTE.ui.cyan).multiplyScalar(0.1) })));
    iceLayer.position.y = 1.95;
    const bed = new THREE.Mesh(b.track(new RoundedBoxGeometry(2.5, 0.32, 1.9, 3, 0.05)), b.track(new THREE.MeshStandardMaterial({ color: PALETTE.warm.brown, roughness: 0.95 })));
    bed.position.y = 0.16;
    // piedras del fondo y un par de peces (siluetas) para dar escala
    const stone = b.track(new THREE.DodecahedronGeometry(0.1)), stoneMat = b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.warm.brown).multiplyScalar(1.4), roughness: 0.9 }));
    for (let k = 0; k < 14; k++) { const s = new THREE.Mesh(stone, stoneMat); s.position.set(-1.1 + (k * 0.37) % 2.2, 0.34, -0.8 + ((k * 0.61) % 1.6)); s.scale.setScalar(0.6 + (k % 3) * 0.4); g.add(s); }
    const fishGeo = b.track(new THREE.ConeGeometry(0.08, 0.32, 8)); fishGeo.rotateZ(Math.PI / 2);
    const fishMat = b.track(new THREE.MeshStandardMaterial({ color: PALETTE.warm.gold, roughness: 0.5 }));
    const fish = [0, 1].map((k) => { const m = new THREE.Mesh(fishGeo, fishMat); m.position.set(-0.4 + k * 0.7, 0.55 + k * 0.15, 0.3 - k * 0.5); g.add(m); return m; });
    g.add(bed, water, iceLayer); shadows(bed); shadows(iceLayer);
    root.add(g);
    return {
      root,
      update: (f) => { g.rotation.y = -0.35 + 0.08 * Math.sin(f * 0.01); fish.forEach((m, k) => { m.position.x = -0.6 + k * 0.7 + 0.25 * Math.sin(f * 0.02 + k * 2); m.rotation.y = Math.cos(f * 0.02 + k * 2) > 0 ? 0 : Math.PI; }); },
      dispose: b.dispose,
    };
  },
};
