// Pack D · Química (F11): átomo, ficha de un elemento, matraz, reacción con burbujas, cristal de sal y tira de pH.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, ghostMat, glowMat, mat, place, rod, scatter, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const atomo: HeroDef = {
  kind: "primitive",
  when: "Átomo: protones, neutrones y electrones, de qué está hecha la materia, por qué algo es sólido, enlaces, la nada dentro del átomo, radiactividad.",
  poses: ["bohr", "hidrogeno"],
  center: [0, 1.4, 0], radius: 1.25,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.8, 0], base: [0, 0.1, 0], nucleo: [0, 1.4, 0], electron: [1.3, 1.4, 0], orbita: [0, 2.5, 0] },
  build: (_L, pose) => {
    const p = poseOf(atomo, pose, "atomo"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const pm = glowMat(b, TONE.glowRed, 0.5), nm = glowMat(b, "#c9ccdd", 0.3), em = beam(b, TONE.cyan, 2);
    const nuc = new THREE.Group(), cnt = p === "hidrogeno" ? 1 : 6;
    scatter(cnt, 3, (r, i) => { const u = r() * 2 - 1, a = r() * 6.28, s = Math.sqrt(1 - u * u), d = cnt === 1 ? 0 : 0.17; return [s * Math.cos(a) * d, u * d, s * Math.sin(a) * d] as P3; }).forEach((q, i) => nuc.add(place(ball(b, cnt === 1 ? 0.32 : 0.14, i % 2 || cnt === 1 ? pm : nm, 18), q)));
    const orbits = (p === "hidrogeno" ? [[1.0, 0, 0]] : [[0.8, 0, 0], [1.3, 1.05, 0.4], [1.3, -1.05, 0.9]]).map(([r, tx, tz], i) => {
      const pivot = new THREE.Group(); pivot.rotation.set(tx, 0, tz);
      const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(r, 0.012, 8, 96)), beam(b, TONE.lavender, 1.2, { transparent: true, opacity: 0.6 })); ring.rotation.x = Math.PI / 2;
      const el = ball(b, 0.09, em, 12); pivot.add(ring, el); return { pivot, el, r, i };
    });
    g.add(nuc, ...orbits.map((o) => o.pivot)); g.position.y = 1.4; root.add(g);
    return done(root, b, (f) => {
      orbits.forEach(({ el, r, i }) => { const a = f * (0.06 - i * 0.012) + i * 2; el.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); });
      nuc.rotation.y = f * 0.02; g.rotation.y = 0.2 * Math.sin(f * 0.01);
    });
  },
};

const ELEM: Record<string, [string, number, string, string]> = { hierro: ["Fe", 26, "HIERRO", "#8a93b8"], oro: ["Au", 79, "ORO", "#e2b84a"], oxigeno: ["O", 8, "OXÍGENO", "#4ab6ff"], sodio: ["Na", 11, "SODIO", "#b36bff"], carbono: ["C", 6, "CARBONO", "#5fd49a"] };

export const elemento: HeroDef = {
  kind: "primitive",
  when: "Un elemento químico en su casilla de la tabla periódica (símbolo y número atómico): hierro, oro, oxígeno, sodio, carbono; metales, qué hay en el cuerpo, de qué está hecho algo.",
  poses: ["hierro", "oro", "oxigeno", "sodio", "carbono"],
  center: [0, 1.4, 0], radius: 1.25,
  anchors: { hero: [0, 1.4, 0.1], top: [0, 2.6, 0], base: [0, 0.1, 0], simbolo: [0, 1.6, 0.1], numero: [-0.7, 2.1, 0.1] },
  build: (_L, pose) => {
    const p = poseOf(elemento, pose, "elemento"), [sym, num, name, c] = ELEM[p], b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 512, 512, (cv) => {
      cv.fillStyle = TONE.ink; cv.fillRect(0, 0, 512, 512); cv.strokeStyle = c; cv.lineWidth = 14; cv.strokeRect(20, 20, 472, 472);
      cv.fillStyle = c; cv.font = "700 60px Montserrat, sans-serif"; cv.fillText(String(num), 52, 100);
      cv.font = "800 230px Montserrat, sans-serif"; cv.textAlign = "center"; cv.fillText(sym, 256, 320);
      cv.font = "700 48px Montserrat, sans-serif"; cv.fillStyle = "#ffffff"; cv.fillText(name, 256, 440);
    });
    const tile = box(b, 2.0, 2.0, 0.22, mat(b, TONE.ink, { roughness: 0.4, metalness: 0.2 }));
    const face = new THREE.Mesh(b.track(new THREE.PlaneGeometry(1.9, 1.9)), b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.6), roughness: 0.4 }))); face.position.z = 0.115;
    const edge = box(b, 2.06, 2.06, 0.1, glowMat(b, c, 0.5, { metalness: 0.5 })); edge.position.z = -0.05;
    g.add(edge, tile, face); g.position.y = 1.4; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = 0.5 * Math.sin(f * 0.014); g.position.y = 1.4 + 0.05 * Math.sin(f * 0.04); });
  },
};

const flask = (b: Bin, liquid: string, level: number) => {
  const g = new THREE.Group(), pts = [[0.0, 0], [0.9, 0], [1.0, 0.04], [0.98, 0.1], [0.32, 1.4], [0.3, 1.9], [0.38, 1.98], [0.38, 2.1]].map(([r, y]) => new THREE.Vector2(r, y));
  const glass = new THREE.Mesh(b.track(new THREE.LatheGeometry(pts, 48)), ghostMat(b, "#cfe7ff", 0.2, { roughness: 0.05 }));
  const lp = [[0, 0.03], [0.86, 0.03], [0.93, 0.07], [0.9, 0.12]]; const hh = 0.1 + level * 1.2; const k = Math.max(0.2, 0.98 - (hh / 1.4) * 0.66);
  lp.push([k * 0.96, hh]); lp.push([0, hh]);
  const liq = new THREE.Mesh(b.track(new THREE.LatheGeometry(lp.map(([r, y]) => new THREE.Vector2(r, y)), 48)), glowMat(b, liquid, 0.3, { transparent: true, opacity: 0.85, roughness: 0.2 }));
  g.add(liq, glass); return { g, liq };
};

export const matraz: HeroDef = {
  kind: "primitive",
  when: "Matraz de laboratorio: reacciones, mezclas, ebullición, disoluciones, experimentos, cambios de color, calor en una reacción.",
  poses: ["frio", "hierve", "reaccion"],
  center: [0, 1.1, 0], radius: 1.35,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.3, 0], base: [0, 0.05, 0], liquido: [0, 0.6, 0.5], cuello: [0, 1.9, 0], burbujas: [0.2, 0.9, 0.2] },
  build: (_L, pose) => {
    const p = poseOf(matraz, pose, "matraz"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const c0 = p === "reaccion" ? "#b36bff" : p === "hierve" ? "#4ab6ff" : "#5fd4f4", { g: fl, liq } = flask(b, c0, 0.45);
    const bub = scatter(18, 4, (r) => [(r() - 0.5) * 1.1, r(), (r() - 0.5) * 1.1] as P3).map((q) => ({ s: ball(b, 0.045 + 0.03 * q[1], beam(b, "#e8fbff", 1.2, { transparent: true, opacity: 0.8 }), 8), q }));
    const steam = scatter(p === "hierve" ? 8 : 0, 6, (r) => [(r() - 0.5) * 0.2, r(), (r() - 0.5) * 0.2] as P3).map((q) => ({ s: ball(b, 0.14, mat(b, "#e8e8f4", { transparent: true, opacity: 0.35, roughness: 1, depthWrite: false }), 10), q }));
    const flame = p === "hierve" ? new THREE.Mesh(b.track(new THREE.ConeGeometry(0.22, 0.5, 16)), beam(b, "#ffb24a", 1.6, { transparent: true, opacity: 0.9 })) : null;
    const stand = cyl(b, 1.1, 1.1, 0.06, mat(b, "#555a70", { metalness: 0.7 }), 32); stand.position.y = -0.04;
    g.add(fl, stand, ...bub.map((x) => x.s), ...steam.map((x) => x.s)); if (flame) { flame.position.set(0, -0.4, 0); g.add(flame); }
    root.add(g); shadows(g);
    return done(root, b, (f) => {
      const fast = p === "reaccion" ? 0.028 : p === "hierve" ? 0.02 : 0.006;
      bub.forEach(({ s, q }, i) => { const t = (q[1] + f * fast + i * 0.05) % 1; s.position.set(q[0] * 0.75 * (1 - 0.5 * t), 0.15 + t * 0.7, q[2] * 0.75 * (1 - 0.5 * t)); s.visible = p !== "frio" || i < 5; });
      steam.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.01 + i * 0.12) % 1; s.position.set(0.1 * Math.sin(f * 0.05 + i), 2.2 + t * 1.2, 0); s.scale.setScalar(0.6 + t * 1.5); });
      if (flame) flame.scale.set(1 + 0.1 * Math.sin(f * 0.7), 1 + 0.25 * Math.sin(f * 0.5), 1);
      if (p === "reaccion") (liq.material as THREE.MeshStandardMaterial).color.copy(col("#b36bff", "#5fd49a", 0.5 + 0.5 * Math.sin(f * 0.03)));
      g.rotation.y = 0.4 * Math.sin(f * 0.01);
    });
  },
};

export const reaccion_burbujas: HeroDef = {
  kind: "primitive",
  when: "Reacción con espuma y gas: bicarbonato y vinagre, efervescencia, refrescos con gas, por qué sale espuma, antiácidos, levadura, dióxido de carbono.",
  poses: ["espuma", "gas"],
  center: [0, 1.2, 0], radius: 1.2,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.7, 0], base: [0, 0.05, 0], espuma: [0, 2.0, 0], burbujas: [0.2, 1.4, 0.3], liquido: [0, 0.8, 0.5] },
  build: (_L, pose) => {
    const p = poseOf(reaccion_burbujas, pose, "reaccion_burbujas"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const glass = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.8, 0.7, 2.0, 40, 1, true)), ghostMat(b, "#cfe7ff", 0.22)); glass.position.y = 1.0;
    const bottom = cyl(b, 0.7, 0.7, 0.08, ghostMat(b, "#cfe7ff", 0.4), 32); bottom.position.y = 0.04;
    const liq = cyl(b, 0.77, 0.69, 1.1, glowMat(b, "#e8d58a", 0.25, { transparent: true, opacity: 0.85 }), 32); liq.position.y = 0.6;
    const foam = scatter(46, 9, (r) => { const a = r() * 6.28, d = Math.sqrt(r()) * 0.7; return [Math.cos(a) * d, 0, Math.sin(a) * d] as P3; }).map((q, i) => ({ s: ball(b, 0.1 + 0.08 * (i % 4) / 3, glowMat(b, "#fff4d6", 0.35, { transparent: true, opacity: 0.92 }), 10), q, i }));
    const co2 = scatter(p === "gas" ? 14 : 0, 4, (r) => [(r() - 0.5) * 0.8, r(), (r() - 0.5) * 0.8] as P3).map((q) => ({ s: ball(b, 0.055, beam(b, "#d7e8ff", 1.2, { transparent: true, opacity: 0.6 }), 8), q }));
    g.add(glass, bottom, liq, ...foam.map((x) => x.s), ...co2.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const rise = p === "espuma" ? 0.5 + 0.5 * Math.min(1, (f % 150) / 90) : 0.18;
      foam.forEach(({ s, q, i }) => { const y = 1.15 + rise * 1.1 * (0.7 + 0.3 * Math.sin(i)) + 0.06 * Math.sin(f * 0.1 + i); const k = p === "espuma" ? 1 + 0.2 * rise : 1; s.position.set(q[0] * k, y - 0.02 * i % 3 * 0.01, q[2] * k); s.scale.setScalar(0.8 + 0.2 * Math.sin(f * 0.15 + i)); });
      co2.forEach(({ s, q }, i) => { const t = (q[1] + f * 0.012 + i * 0.07) % 1; s.position.set(q[0] + 0.1 * Math.sin(f * 0.04 + i), 2.0 + t * 1.0, q[2]); });
      g.rotation.y = 0.35 * Math.sin(f * 0.01);
    });
  },
};

export const cristal_sal: HeroDef = {
  kind: "primitive",
  when: "Sal y cristales: cloruro de sodio, red cristalina, disolver sal en agua, por qué la sal derrite el hielo, iones, cristalización, sólidos iónicos.",
  poses: ["cristal", "disuelta"],
  center: [0, 1.65, 0], radius: 1.3,
  anchors: { hero: [0, 1.65, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], sodio: [0.6, 1.9, 0.6], cloro: [-0.6, 1.3, 0.6], red: [0, 1.3, 0] },
  build: (_L, pose) => {
    const p = poseOf(cristal_sal, pose, "cristal_sal"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const na = glowMat(b, "#b36bff", 0.4), cl = glowMat(b, TONE.green, 0.4), stick = glowMat(b, "#d7dcef", 0.2), N = 4, sp = 0.62;
    const items: { m: THREE.Mesh; home: THREE.Vector3; i: number }[] = [];
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
      const isNa = (x + y + z) % 2 === 0, m = ball(b, isNa ? 0.17 : 0.25, isNa ? na : cl, 14), home = new THREE.Vector3((x - 1.5) * sp, (y - 1.5) * sp, (z - 1.5) * sp);
      m.position.copy(home); g.add(m); items.push({ m, home, i: x * 16 + y * 4 + z });
      if (x < N - 1) g.add(rod(b, [home.x, home.y, home.z], [home.x + sp, home.y, home.z], 0.025, stick));
      if (y < N - 1) g.add(rod(b, [home.x, home.y, home.z], [home.x, home.y + sp, home.z], 0.025, stick));
      if (z < N - 1) g.add(rod(b, [home.x, home.y, home.z], [home.x, home.y, home.z + sp], 0.025, stick));
    }
    g.position.y = 1.65; root.add(g);
    return done(root, b, (f) => {
      g.rotation.set(0.45, f * 0.01, 0.1);
      if (p === "disuelta") items.forEach(({ m, home, i }) => { const k = Math.min(1, (f % 240) / 120); m.position.set(home.x * (1 + 1.1 * k) + 0.25 * k * Math.sin(f * 0.04 + i), home.y * (1 + 0.8 * k) + 0.2 * k * Math.cos(f * 0.05 + i), home.z * (1 + 1.1 * k) + 0.25 * k * Math.sin(f * 0.03 + i * 2)); });
    });
  },
};

export const ph_tira: HeroDef = {
  kind: "primitive",
  when: "Escala de pH: ácidos y bases, limón y jabón, indicador de color, por qué pica el limón, lluvia ácida, neutralizar, el pH de la piel y del estómago.",
  poses: ["neutro", "acido", "base"],
  center: [0, 1.3, 0], radius: 1.05,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], marca: [0, 1.3, 0.1], acido: [0, 2.3, 0.1], basico: [0, 0.3, 0.1] },
  build: (_L, pose) => {
    const p = poseOf(ph_tira, pose, "ph_tira"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const stops = ["#e8363a", "#f0602e", "#f69a2a", "#f7d23a", "#9bd84a", "#3cc26a", "#2aa89a", "#3a9ad8", "#4a6ae8", "#6a4ae0", "#8a3ac8"];
    const tex = screenTex(b.track, 128, 512, (c) => { stops.forEach((s, i) => { c.fillStyle = s; c.fillRect(0, (i * 512) / stops.length, 128, 512 / stops.length + 1); }); c.fillStyle = "#fff"; c.font = "700 28px Montserrat"; c.textAlign = "center"; for (let i = 0; i < stops.length; i += 2) c.fillText(String(i * 14 / 14 + 1), 64, (i * 512) / stops.length + 40); });
    const strip = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.9, 2.4, 0.06)), [mat(b, "#eee"), mat(b, "#eee"), mat(b, "#eee"), mat(b, "#eee"), b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.55), roughness: 0.5 })), mat(b, "#eee")]);
    strip.position.y = 1.3;
    const target = p === "acido" ? 1.0 : p === "base" ? -1.0 : 0.0;
    const marker = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.16, 0.34, 3)), glowMat(b, "#ffffff", 0.8)); marker.rotation.z = Math.PI / 2; 
    const drop = ball(b, 0.14, glowMat(b, TONE.cyan, 0.7, { transparent: true, opacity: 0.9 }), 16);
    g.add(strip, marker, drop); root.add(g); shadows(g);
    return done(root, b, (f) => {
      marker.position.set(0.7, 1.3 + target * 0.95 + 0.04 * Math.sin(f * 0.1), 0.05); marker.rotation.z = Math.PI / 2 + Math.PI;
      const t = (f * 0.01) % 1; drop.position.set(0, 3.2 - t * 1.9, 0.05); drop.visible = t < 0.95; drop.scale.set(0.7, 1.2 - 0.2 * t, 0.7);
      g.rotation.y = 0.35 * Math.sin(f * 0.012);
    });
  },
};

