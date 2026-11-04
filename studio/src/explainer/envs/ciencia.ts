// Entornos de ciencia (F11): interior del cuerpo, microscopio, espacio profundo, paisaje natural, bosque de día, cocina,
// taller antiguo, laboratorio y mente abstracta. Mismo contrato que el resto (protagonista en el origen, fondo hacia -z):
// cielo con degradado propio, suelo mate con textura pintada, niebla del color del fondo y puntos de luz con deriva.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, type Ctx, makeCtx, sky, canvasTex, repeat, matte, ground, fogOf, lightDots, speckle, hex, blocker } from "./kit";

const sphereBg = (ctx: Ctx, n: number, col: string, box: { x: [number, number]; y: [number, number]; z: [number, number] }, size: [number, number], opacity = 0.25) => {
  const g = ctx.track(new THREE.SphereGeometry(1, 20, 14)), m = ctx.track(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const out: THREE.Mesh[] = [];
  for (let i = 0; i < n; i++) {
    const s = size[0] + (size[1] - size[0]) * ctx.r(), o = new THREE.Mesh(g, m), x = box.x[0] + (box.x[1] - box.x[0]) * ctx.r(), y = box.y[0] + (box.y[1] - box.y[0]) * ctx.r(), z = box.z[0] + (box.z[1] - box.z[0]) * ctx.r();
    o.position.set(x, y, z); o.scale.setScalar(s); ctx.root.add(o); out.push(o);
    const ph = ctx.r() * 6.28; ctx.updates.push((f) => { o.position.y = y + 0.8 * Math.sin(f * 0.012 + ph); });
  }
  return out;
};

const floor = (ctx: Ctx, base: string, line: string, speck: string, rep = 12, size = 300) => {
  const tex = repeat(canvasTex(ctx, 512, 512, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 512, 512); speckle(g, ctx.r, 512, 512, speck, 900, 2, 9, 0.08, 0.3);
    g.strokeStyle = line; g.globalAlpha = 0.35; g.lineWidth = 2; for (let k = 0; k <= 512; k += 128) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); } g.globalAlpha = 1;
  }), rep, rep);
  return ground(ctx, matte(ctx, { map: tex, color: new THREE.Color(1, 1, 1) }), size);
};

export const interior_cuerpo: EnvDef = {
  when: "Dentro del cuerpo: tejido, sangre, órganos, infecciones, garganta, estómago, 'qué pasa por dentro'; fondo cálido rosado con glóbulos flotando.",
  lights: ["noche", "tech"],
  view: { el: 8, dof: 11 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed);
    sky(ctx, { clouds: 0, stars: 0, colors: { top: "#1e0a1a", mid: "#4a1a30", horizon: "#8a3a52" } });
    floor(ctx, "#7a2e45", "#a84a5a", "#d9747e");
    sphereBg(ctx, 9, "#ff7a8a", { x: [-14, 14], y: [2, 9], z: [-28, -12] }, [3, 7], 0.05);
    lightDots(ctx, 40, "#ff6a7a", { x: [-12, 12], y: [0.4, 8], z: [-26, -4] }, [0.08, 0.22], 1.6, 0.5);
    lightDots(ctx, 14, "#ffd0b8", { x: [-10, 10], y: [0.4, 7], z: [-20, -5] }, [0.04, 0.1], 1.8, 0.4);
    return ctx.done(fogOf(ctx.L, 14, 70, "#3a1226"));
  },
};

export const microscopio: EnvDef = {
  when: "Mundo microscópico: células, virus, bacterias, moléculas, ADN, 'visto al microscopio'; fondo oscuro verdoso con partículas.",
  lights: ["tech", "noche"],
  view: { el: 6, dof: 12 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed);
    sky(ctx, { clouds: 0, stars: 0, colors: { top: "#04121a", mid: "#0b2a36", horizon: "#16525c" } });
    floor(ctx, "#08222c", "#1d6a74", "#5fd4f4", 10);
    const halo = new THREE.Mesh(ctx.track(new THREE.CircleGeometry(40, 64)), ctx.track(new THREE.MeshBasicMaterial({ map: canvasTex(ctx, 256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, "rgba(95,212,244,0.28)"); gr.addColorStop(1, "rgba(95,212,244,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
    halo.position.set(0, 8, -50); ctx.root.add(halo);
    lightDots(ctx, 70, PALETTE.ui.cyan, { x: [-14, 14], y: [0.3, 10], z: [-34, -3] }, [0.03, 0.12], 1.5, 0.6);
    lightDots(ctx, 26, PALETTE.ui.green, { x: [-12, 12], y: [0.3, 9], z: [-28, -4] }, [0.04, 0.12], 1.5, 0.5);
    sphereBg(ctx, 7, "#5fd4f4", { x: [-16, 16], y: [1, 9], z: [-34, -14] }, [1.5, 4], 0.05);
    return ctx.done(fogOf(ctx.L, 14, 80, "#04121a"));
  },
};

export const espacio_profundo: EnvDef = {
  when: "Espacio exterior: planetas, estrellas, galaxias, agujeros negros, cohetes, el universo; fondo azul noche con estrellas, nebulosas suaves y un suelo tenue con rejilla.",
  lights: ["tech", "noche"],
  view: { el: 5, dof: 5, distK: 0.85 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed);
    sky(ctx, { clouds: 0, stars: 3.2, colors: { top: "#0b0f33", mid: "#1c2260", horizon: "#3a3f94" } });
    floor(ctx, "#171b4a", "#4a52b8", "#9aa4ff", 20, 300);   // un suelo azul noche con rejilla tenue: ya no es un bloque negro (look-match F12)
    sphereBg(ctx, 4, "#7a3ab8", { x: [-40, 40], y: [4, 30], z: [-90, -50] }, [14, 28], 0.05);
    sphereBg(ctx, 3, "#3a6ae0", { x: [-40, 40], y: [2, 26], z: [-90, -50] }, [12, 24], 0.04);
    lightDots(ctx, 130, "#ffffff", { x: [-40, 40], y: [0.5, 28], z: [-80, -10] }, [0.04, 0.1], 2, 0.1);
    lightDots(ctx, 30, "#9ab4ff", { x: [-14, 14], y: [0.3, 9], z: [-30, -4] }, [0.03, 0.08], 1.6, 0.4);
    return ctx.done(fogOf(ctx.L, 30, 200, "#1c2260"));
  },
};

export const paisaje_natural: EnvDef = {
  when: "Naturaleza abierta: montañas, mar, costas, volcanes, nubes, clima, geología, hielo, tormentas; paisaje amplio de cielo y colinas.",
  lights: ["atardecer", "dorado"],
  view: { el: 8, dof: 6, distK: 0.9 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    sky(ctx, { clouds: 0.5, stars: 0.1, low: 0.05 });
    floor(ctx, hex(L.ground, 1.5, "#4f8a5a", 0.5), "#3a6a46", "#8ac070", 30, 400);
    // montañas lejanas: conos aplastados con la niebla del horizonte
    for (let i = 0; i < 9; i++) {
      const h = 14 + 22 * r(), w = 20 + 24 * r(), m = new THREE.Mesh(ctx.track(new THREE.ConeGeometry(w, h, 5 + Math.floor(r() * 3))), ctx.track(new THREE.MeshLambertMaterial({ color: hex(L.hemiSky, 0.55, L.fog, 0.35 + 0.3 * r()) })));
      m.position.set(-110 + i * 28 + r() * 10, h / 2 - 1, -90 - 30 * r()); ctx.root.add(m);
    }
    const sea = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(400, 90)), ctx.track(new THREE.MeshBasicMaterial({ color: hex("#2a6ac8", 0.7, L.sky.horizon, 0.35), fog: true })));
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.02, -75); ctx.root.add(sea);
    lightDots(ctx, 20, L.key, { x: [-30, 30], y: [1, 12], z: [-60, -10] }, [0.04, 0.1], 1.4, 0.6);
    return ctx.done(fogOf(L, 24, 220));
  },
};

export const bosque_dia: EnvDef = {
  when: "Bosque, jardín y campo de día: plantas, árboles, insectos, aves, polinización, semillas, ecosistemas; verde con luz filtrada.",
  lights: ["dorado", "atardecer"],
  view: { el: 7, dof: 10 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { r } = ctx;
    sky(ctx, { clouds: 0.25, stars: 0, colors: { top: "#7ab8e8", mid: "#b8dcf0", horizon: "#f2eed0" } });
    floor(ctx, "#4a8a46", "#2f6a3a", "#9ad06a", 24);
    const trunkM = ctx.track(new THREE.MeshLambertMaterial({ color: "#6a4a30" }));
    for (let i = 0; i < 26; i++) {
      const x = (r() - 0.5) * 60, z = -14 - 40 * r(), h = 6 + 8 * r(), t = new THREE.Mesh(ctx.track(new THREE.CylinderGeometry(0.35, 0.5, h, 8)), trunkM);
      t.position.set(x, h / 2, z); ctx.root.add(t);
      const c = new THREE.Mesh(ctx.track(new THREE.SphereGeometry(2.6 + 2 * r(), 12, 10)), ctx.track(new THREE.MeshLambertMaterial({ color: new THREE.Color("#3f9a4a").lerp(new THREE.Color("#8ad05a"), r()) })));
      c.position.set(x, h + 1.2, z); c.scale.y = 0.8; ctx.root.add(c);
      if (Math.abs(x) < 4 && z > -22) { blocker(t); blocker(c); }
    }
    lightDots(ctx, 30, "#fff6c0", { x: [-14, 14], y: [0.6, 8], z: [-26, -4] }, [0.03, 0.09], 1.8, 0.7);
    return ctx.done(fogOf(ctx.L, 18, 110, "#c8e6d0"));
  },
};

export const cocina: EnvDef = {
  when: "Cocina y hogar: comida, hervir, microondas, sal, vinagre, electrodomésticos, 'por qué pasa en la cocina'; azulejos y encimera cálidos.",
  lights: ["dorado", "atardecer"],
  view: { el: 10, dof: 10 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { r } = ctx;
    sky(ctx, { clouds: 0, stars: 0, colors: { top: "#4a3a3a", mid: "#6a5448", horizon: "#8a6a58" } });
    floor(ctx, "#b0987a", "#8a7258", "#d8c4a0", 16);
    const tile = repeat(canvasTex(ctx, 256, 256, (g) => { g.fillStyle = "#e8e2d4"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#b8b0a0"; g.lineWidth = 4; g.strokeRect(0, 0, 128, 128); g.strokeRect(128, 0, 128, 128); g.strokeRect(0, 128, 128, 128); g.strokeRect(128, 128, 128, 128); speckle(g, r, 256, 256, "#c8c0b0", 200, 1, 4, 0.1, 0.3); }), 14, 5);
    const wall = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(70, 24)), matte(ctx, { map: tile, color: new THREE.Color(0.8, 0.78, 0.74) })); wall.position.set(0, 12, -24); ctx.root.add(wall);
    const counter = new THREE.Mesh(ctx.track(new THREE.BoxGeometry(60, 2.4, 3)), matte(ctx, { color: new THREE.Color("#5a4636") })); counter.position.set(0, 1.2, -21); ctx.root.add(counter);
    const top = new THREE.Mesh(ctx.track(new THREE.BoxGeometry(60, 0.2, 3.2)), matte(ctx, { color: new THREE.Color("#d8d2c4") })); top.position.set(0, 2.5, -21); ctx.root.add(top);
    const win = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(9, 6)), ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffe6b0").multiplyScalar(1.4), fog: false }))); win.position.set(10, 10, -23.8); ctx.root.add(win);
    lightDots(ctx, 14, "#ffd9a0", { x: [-12, 12], y: [1, 9], z: [-20, -6] }, [0.04, 0.1], 1.6, 0.4);
    return ctx.done(fogOf(ctx.L, 24, 110, "#7a6252"));
  },
};

export const taller_antiguo: EnvDef = {
  when: "Historia e ingeniería antigua: inventos, herramientas, talleres, construcción de monumentos, máquinas simples, física clásica; piedra y madera a la luz de antorchas.",
  lights: ["dorado", "atardecer"],
  view: { el: 9, dof: 10 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { r } = ctx;
    sky(ctx, { clouds: 0, stars: 0, colors: { top: "#1b1410", mid: "#3a2a1e", horizon: "#6a4a30" } });
    floor(ctx, "#6a4e36", "#4a3624", "#a8845a", 14);
    const stone = repeat(canvasTex(ctx, 512, 256, (g) => { g.fillStyle = "#8a7660"; g.fillRect(0, 0, 512, 256); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = hex("#a8927a", 0.75 + 0.35 * r()); g.fillRect(x * 128 + (y % 2) * 64 + 3, y * 64 + 3, 122, 58); } speckle(g, r, 512, 256, "#3a2e22", 600, 1, 5, 0.1, 0.35); }), 8, 3);
    const wall = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(80, 26)), matte(ctx, { map: stone, color: new THREE.Color(0.9, 0.85, 0.8) })); wall.position.set(0, 13, -24); ctx.root.add(wall);
    for (const x of [-9, 9]) { const t = new THREE.Mesh(ctx.track(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 8)), ctx.track(new THREE.MeshLambertMaterial({ color: "#3a2a1e" }))); t.position.set(x, 7, -23.5); ctx.root.add(t); const f = new THREE.Mesh(ctx.track(new THREE.SphereGeometry(0.5, 12, 10)), ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffa24a").multiplyScalar(2.2), fog: false }))); f.position.set(x, 8.4, -23.4); ctx.root.add(f); ctx.updates.push((fr) => f.scale.setScalar(1 + 0.12 * Math.sin(fr * 0.4 + x))); }
    lightDots(ctx, 26, "#ffb870", { x: [-12, 12], y: [0.5, 9], z: [-20, -4] }, [0.03, 0.08], 1.8, 0.6);
    return ctx.done(fogOf(ctx.L, 20, 100, "#2a1e16"));
  },
};

export const laboratorio: EnvDef = {
  when: "Laboratorio: química, experimentos, reacciones, matraces, ciencia básica, física de mesa; banco claro con estantes y fondo azul verdoso.",
  lights: ["tech", "noche"],
  view: { el: 9, dof: 10 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { r } = ctx;
    sky(ctx, { clouds: 0, stars: 0, colors: { top: "#102a3a", mid: "#1e4a5a", horizon: "#3a7a86" } });
    floor(ctx, "#2a5260", "#5a9aa6", "#a8e0e8", 16);
    const wall = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(80, 26)), matte(ctx, { color: new THREE.Color("#2e6070") })); wall.position.set(0, 13, -26); ctx.root.add(wall);
    const bench = new THREE.Mesh(ctx.track(new THREE.BoxGeometry(70, 1.8, 4)), matte(ctx, { color: new THREE.Color("#e8f1f4") })); bench.position.set(0, 0.9, -22); ctx.root.add(bench);
    for (let row = 0; row < 2; row++) {
      const sh = new THREE.Mesh(ctx.track(new THREE.BoxGeometry(34, 0.3, 1.2)), matte(ctx, { color: new THREE.Color("#cfd8dc") })); sh.position.set(-8, 8 + row * 5, -25); ctx.root.add(sh);
      for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(ctx.track(new THREE.CylinderGeometry(0.5 + 0.3 * r(), 0.6 + 0.3 * r(), 1.2 + 1.4 * r(), 12)), ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(["#5fd4f4", "#3ddc84", "#dcae6d", "#b36bff", "#ff5a5f"][Math.floor(r() * 5)]).multiplyScalar(0.8), transparent: true, opacity: 0.8 }))); c.position.set(-23 + i * 3.8, 8.9 + row * 5, -24.9); ctx.root.add(c); }
    }
    lightDots(ctx, 30, "#aef0ff", { x: [-12, 12], y: [0.5, 9], z: [-20, -4] }, [0.03, 0.08], 1.5, 0.5);
    return ctx.done(fogOf(ctx.L, 20, 110, "#12303c"));
  },
};

export const mente_abstracta: EnvDef = {
  when: "Mente y psicología: pensamientos, memoria, emociones, sueños, ilusiones, hábitos; fondo abstracto violeta con formas flotantes.",
  lights: ["noche", "tech"],
  view: { el: 7, dof: 12 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { r } = ctx;
    sky(ctx, { clouds: 0, stars: 0.3, colors: { top: "#0c0620", mid: "#1e1244", horizon: "#4a2a6a" } });
    floor(ctx, "#241448", "#5a3a9a", "#b8a0ff", 10);
    const shapes = [() => new THREE.IcosahedronGeometry(1, 0), () => new THREE.TorusGeometry(1, 0.3, 10, 24), () => new THREE.OctahedronGeometry(1, 0), () => new THREE.SphereGeometry(1, 16, 12)];
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(ctx.track(shapes[i % 4]()), ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(["#b36bff", "#5fd4f4", "#ff8ab8", "#dcae6d"][i % 4]).multiplyScalar(0.8), transparent: true, opacity: 0.28, wireframe: i % 3 === 0, fog: false })));
      const x = (r() - 0.5) * 36, y = 1 + 11 * r(), z = -12 - 28 * r(), s = 0.8 + 1.8 * r(); m.position.set(x, y, z); m.scale.setScalar(s); ctx.root.add(m);
      const ph = r() * 6.28; ctx.updates.push((f) => { m.rotation.set(f * 0.006 + ph, f * 0.009, 0); m.position.y = y + 0.6 * Math.sin(f * 0.015 + ph); });
    }
    lightDots(ctx, 50, "#d8b8ff", { x: [-14, 14], y: [0.4, 11], z: [-30, -4] }, [0.04, 0.12], 1.6, 0.6);
    return ctx.done(fogOf(ctx.L, 16, 90, "#120a2e"));
  },
};
