// Pack F · Espacio (F11): planeta, Luna con fases, Sol, agujero negro, cohete y galaxia. Estilizados (texturas pintadas
// con Canvas2D, brillos aditivos) y sin escala real: lo que importa es que se lea qué es cada cosa.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, col, cyl, glowMat, halo, mat, place, scatter, tube, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

const planetTex = (b: Bin, kind: string) => screenTex(b.track, 512, 256, (g) => {
  const W = 512, H = 256;
  if (kind === "tierra") {
    g.fillStyle = "#1c5aa8"; g.fillRect(0, 0, W, H); g.fillStyle = "#3d9a5a";
    for (const [x, y, r] of [[90, 90, 50], [150, 140, 40], [330, 80, 55], [380, 150, 45], [260, 190, 30], [450, 60, 28], [40, 180, 25]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.7, x, 0, 6.3); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(0, 0, W, 16); g.fillRect(0, H - 16, W, 16);
    g.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse((i * 97) % W, 40 + ((i * 53) % 170), 38, 8, 0, 0, 6.3); g.fill(); }
  } else if (kind === "venus") {
    g.fillStyle = "#e8d29a"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${200 + (i * 9) % 50},${170 + (i * 7) % 50},${100 + (i * 5) % 40},0.35)`; g.beginPath(); g.ellipse((i * 71) % W, 20 + ((i * 37) % (H - 40)), 70 + (i % 5) * 20, 10 + (i % 4) * 6, 0.05 * (i % 7), 0, 6.3); g.fill(); }
    g.fillStyle = "rgba(255,245,210,0.3)"; for (let i = 0; i < 14; i++) g.fillRect(0, i * 18, W, 5);
  } else if (kind === "marte") {
    g.fillStyle = "#b4543a"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${90 + (i * 7) % 60},${40 + (i * 3) % 30},30,0.35)`; g.beginPath(); g.ellipse((i * 83) % W, (i * 41) % H, 20 + (i % 5) * 8, 8 + (i % 4) * 4, i, 0, 6.3); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(0, 0, W, 10);
  } else {
    const cols = ["#e8c58f", "#c9985a", "#f3deb3", "#b07a45", "#e5b878", "#d8a86a"];
    for (let i = 0; i < 14; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(0, (i * H) / 14, W, H / 14 + 1); }
    g.fillStyle = "#b5532e"; g.beginPath(); g.ellipse(340, 160, 40, 22, 0, 0, 6.3); g.fill();
  }
});

export const planeta: HeroDef = {
  kind: "primitive",
  when: "Planeta: la Tierra y otros planetas (Marte, gigantes con anillos), día y noche, estaciones, gravedad, atmósfera, el sistema solar.",
  actions: { ecuador: "Una línea roja se dibuja alrededor del ecuador: cuando se nombra el ecuador, la latitud cero, la zona más rápida o más cálida.", eje: "Aparece el eje de rotación de polo a polo: cuando se habla del eje, la inclinación, los polos o el giro." },
  poses: ["tierra", "marte", "gigante", "venus"],
  center: [0, 1.35, 0], radius: 1.25,
  anchors: { hero: [0, 1.35, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], polo: [0, 2.35, 0], ecuador: [1.1, 1.35, 0.4], anillo: [1.6, 1.4, 0] },
  build: (_L, pose) => {
    const p = poseOf(planeta, pose, "planeta"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), body = new THREE.Group();
    const tex = planetTex(b, p === "gigante" ? "gas" : p), R = p === "gigante" ? 0.9 : 1.05;
    const sph = new THREE.Mesh(b.track(new THREE.SphereGeometry(R, 64, 48)), b.track(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, emissive: new THREE.Color("#ffffff").multiplyScalar(0.12), emissiveMap: tex })));
    body.add(sph);
    if (p === "tierra" || p === "venus") { const atm = new THREE.Mesh(b.track(new THREE.SphereGeometry(R * 1.04, 48, 32)), b.track(new THREE.MeshBasicMaterial({ color: col(TONE.cyan).multiplyScalar(0.8), transparent: true, opacity: 0.1, fog: false, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending }))); body.add(atm); }
    if (p === "gigante") {
      const ring = new THREE.Mesh(b.track(new THREE.RingGeometry(1.25, 2.1, 96)), b.track(new THREE.MeshStandardMaterial({ color: "#e5c89a", side: THREE.DoubleSide, transparent: true, opacity: 0.75, roughness: 0.8, emissive: new THREE.Color("#e5c89a").multiplyScalar(0.25) })));
      ring.rotation.x = Math.PI / 2 - 0.35; body.add(ring);
    }
    const eq = new THREE.Mesh(new THREE.BufferGeometry(), b.track(new THREE.MeshBasicMaterial({ color: col("#ff3b3b").multiplyScalar(2.2), fog: false }))); eq.visible = false; body.add(eq); let eqN = -1;
    const axis = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.025, 0.025, R * 2.9, 8)), beam(b, TONE.cyan, 2)); axis.visible = false; axis.scale.y = 0.001; body.add(axis);
    body.rotation.z = p === "tierra" ? 0.41 : 0.2; body.position.y = 1.35; g.add(body); root.add(g); shadows(g);
    const inst = done(root, b, (f) => { sph.rotation.y = p === "venus" ? -f * 0.003 : f * 0.008; g.position.y = 0.03 * Math.sin(f * 0.03); });
    return { ...inst, dispose: () => { eq.geometry.dispose(); inst.dispose(); }, act: (name, u) => {
      if (name === "ecuador") { const n = Math.round(u * 96); eq.visible = n > 0; if (n !== eqN) { eqN = n; eq.geometry.dispose(); eq.geometry = new THREE.TorusGeometry(R * 1.012, 0.04, 8, 96, Math.max(0.02, (Math.PI * 2 * n) / 96)); eq.rotation.x = Math.PI / 2; } }
      else if (name === "eje") { axis.visible = u > 0; axis.scale.y = Math.max(0.001, 1 - (1 - u) ** 3); }
    } };
  },
};

export const luna_fases: HeroDef = {
  kind: "primitive",
  when: "La Luna: fases lunares, eclipses, mareas, por qué siempre vemos la misma cara, cráteres, luz que viene del Sol.",
  poses: ["fases", "llena", "nueva"],
  center: [0, 1.35, 0], radius: 1.1,
  anchors: { hero: [0, 1.35, 0], top: [0, 2.5, 0], base: [0, 0.1, 0], crater: [-0.3, 1.6, 0.9], sombra: [-0.7, 1.35, 0.6] },
  build: (_L, pose) => {
    const p = poseOf(luna_fases, pose, "luna_fases"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 512, 256, (c) => {
      c.fillStyle = "#cfc9bd"; c.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(90,86,98,${0.12 + (i % 5) * 0.05})`; c.beginPath(); c.ellipse((i * 131) % 512, (i * 67) % 256, 8 + (i % 6) * 6, 6 + (i % 4) * 5, 0, 0, 6.3); c.fill(); }
    });
    const uni = { sunDir: { value: new THREE.Vector3(1, 0, 0) }, map: { value: tex } };
    const moon = new THREE.Mesh(b.track(new THREE.SphereGeometry(1, 64, 48)), b.track(new THREE.ShaderMaterial({
      uniforms: uni, fog: false,
      vertexShader: "varying vec3 n; varying vec2 u; void main(){ n = normalize(mat3(modelMatrix) * normal); u = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 sunDir; uniform sampler2D map; varying vec3 n; varying vec2 u; void main(){ float l = smoothstep(-0.05, 0.25, dot(normalize(n), normalize(sunDir))); vec3 c = texture2D(map, u).rgb; gl_FragColor = vec4(mix(c * vec3(0.06,0.07,0.12), c * 1.1, l), 1.0); }",
    })));
    moon.position.y = 1.35; g.add(moon, place(halo(b, "rgba(230,230,255,0.5)", 3.6, 0.25), [0, 1.35, -0.8])); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const a = p === "fases" ? f * 0.02 : p === "llena" ? 0.0 : Math.PI;
      uni.sunDir.value.set(Math.sin(a) * 1.0, 0.15, Math.cos(a));
      moon.rotation.y = 0.5;
      // el Sol viene de detrás al principio (luna nueva) y da la vuelta: a = 0 -> de frente (llena)
    });
  },
};

export const sol: HeroDef = {
  kind: "primitive",
  when: "El Sol y las estrellas: luz, calor, fusión, manchas solares, auroras, cuánto tarda la luz, por qué brillan las estrellas.",
  actions: { llamarada: "Una llamarada gigante se alza desde el borde del Sol: erupciones solares, tormentas solares, explosiones, energía que sale." },
  poses: ["activo"],
  center: [0, 1.35, 0], radius: 1.15,
  anchors: { hero: [0, 1.35, 0], top: [0, 2.7, 0], base: [0, 0.1, 0], protuberancia: [1.0, 2.1, 0.2], mancha: [-0.4, 1.6, 1.0] },
  build: (_L, pose) => {
    poseOf(sol, pose, "sol");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 512, 256, (c) => {
      c.fillStyle = "#ffb43a"; c.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 220; i++) { c.fillStyle = `rgba(${i % 2 ? "255,230,140" : "230,110,20"},${0.12 + (i % 4) * 0.05})`; c.beginPath(); c.ellipse((i * 97) % 512, (i * 59) % 256, 6 + (i % 7) * 4, 4 + (i % 5) * 3, i, 0, 6.3); c.fill(); }
      c.fillStyle = "rgba(90,30,0,0.65)"; for (const [x, y] of [[120, 110], [330, 150]]) { c.beginPath(); c.ellipse(x, y, 16, 10, 0, 0, 6.3); c.fill(); }
    });
    const star = new THREE.Mesh(b.track(new THREE.SphereGeometry(1, 64, 48)), beam(b, "#ffffff", 1.15, { map: tex })); star.position.y = 1.35;
    const glow = [halo(b, "rgba(255,190,70,0.95)", 5.2, 0.9), halo(b, "rgba(255,120,40,0.6)", 8, 0.45)]; glow.forEach((h) => { h.position.set(0, 1.35, -0.6); g.add(h); });
    const loops = [0, 1, 2].map((i) => { const a = [0.35, 1.25, 2.7][i], t = tube(b, Array.from({ length: 14 }, (_, k) => { const u = k / 13, r = 1 + 0.5 * Math.sin(u * Math.PI); const ang = a + (u - 0.5) * 0.7; return [Math.cos(ang) * r, 1.35 + Math.sin(ang) * r, 0.1] as P3; }), 0.035, beam(b, "#ff9a3a", 1.5, { transparent: true, opacity: 0.85 })); return t; });
    const flare = new THREE.Group(), arcPts = Array.from({ length: 24 }, (_, k) => { const t = k / 23, a = 0.9 + (t - 0.5) * 0.9, r = 1 + 0.95 * Math.sin(Math.PI * t); return [Math.cos(a) * r, Math.sin(a) * r, 0.15] as P3; });
    flare.add(tube(b, arcPts, 0.07, beam(b, "#ffb04a", 2, { transparent: true, opacity: 0.95 }), 40)); flare.position.set(0, 1.35, 0); flare.scale.setScalar(0.001); flare.visible = false;
    g.add(star, ...loops, flare); root.add(g);
    const inst = done(root, b, (f) => { star.rotation.y = f * 0.004; glow.forEach((h, i) => h.scale.setScalar(1 + 0.04 * Math.sin(f * 0.05 + i))); loops.forEach((l, i) => { l.rotation.z = 0.05 * Math.sin(f * 0.03 + i); }); });
    return { ...inst, act: (name, u) => { if (name === "llamarada") { flare.visible = u > 0; flare.scale.setScalar(Math.max(0.001, 1 - (1 - u) ** 3)); } } };
  },
};

export const agujero_negro: HeroDef = {
  kind: "primitive",
  when: "Agujero negro: gravedad extrema, horizonte de eventos, disco de acreción, nada escapa, espaguetización, curvatura del espacio.",
  poses: ["disco"],
  center: [0, 1.4, 0], radius: 1.7,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.5, 0], base: [0, 0.2, 0], horizonte: [0, 1.4, 0.7], disco: [1.5, 1.4, 0.2], chorro: [0, 2.6, 0] },
  build: (_L, pose) => {
    poseOf(agujero_negro, pose, "agujero_negro");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const hole = ball(b, 0.62, b.track(new THREE.MeshBasicMaterial({ color: "#000000" })), 40);
    const discTex = screenTex(b.track, 512, 512, (c) => {
      const gr = c.createRadialGradient(256, 256, 130, 256, 256, 256); gr.addColorStop(0, "rgba(255,255,230,1)"); gr.addColorStop(0.25, "rgba(255,190,80,0.95)"); gr.addColorStop(0.6, "rgba(220,80,60,0.55)"); gr.addColorStop(1, "rgba(120,40,120,0)");
      c.fillStyle = gr; c.fillRect(0, 0, 512, 512); c.globalCompositeOperation = "destination-out"; c.beginPath(); c.arc(256, 256, 118, 0, 6.3); c.fill();
    });
    const diskM = b.track(new THREE.MeshBasicMaterial({ map: discTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, color: col("#ffffff").multiplyScalar(1.3) }));
    const disk = new THREE.Mesh(b.track(new THREE.PlaneGeometry(3.6, 3.6)), diskM); disk.rotation.x = -Math.PI / 2 + 0.28;
    const lens = new THREE.Mesh(b.track(new THREE.PlaneGeometry(3.6, 3.6)), diskM); lens.scale.set(0.55, 0.55, 0.55); // halo vertical = luz curvada por detrás
    const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.74, 0.028, 12, 80)), beam(b, "#ffd9a0", 1.8));
    const stars = scatter(40, 3, (r) => [(r() - 0.5) * 5, (r() - 0.5) * 4, -1.5 - r() * 2] as P3).map((q) => place(ball(b, 0.02, beam(b, "#ffffff", 1.4), 6), q));
    const body = new THREE.Group(); body.add(hole, disk, lens, ring); body.position.y = 1.4; body.rotation.z = -0.15;
    g.add(body, ...stars.map((s) => { s.position.y += 1.4; return s; })); root.add(g);
    return done(root, b, (f) => { disk.rotation.z = f * 0.02; body.rotation.y = 0.25 * Math.sin(f * 0.01); lens.rotation.y = 0; ring.lookAt(0, 0, 100 * 1); });
  },
};

export const cohete: HeroDef = {
  kind: "primitive",
  when: "Cohete y viajes espaciales: despegue, órbita, gravedad cero, astronautas, por qué los cohetes tienen etapas, escapar de la Tierra.",
  poses: ["despegue", "orbita"],
  center: [0, 1.6, 0], radius: 1.55,
  anchors: { hero: [0, 1.6, 0], top: [0, 3.3, 0], base: [0, 0.1, 0], motor: [0, 0.35, 0], cabina: [0, 2.9, 0.3], llama: [0, -0.3, 0] },
  build: (_L, pose) => {
    const p = poseOf(cohete, pose, "cohete"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), rocket = new THREE.Group();
    const white = mat(b, "#f2efe6", { roughness: 0.35, metalness: 0.15 }), red = mat(b, "#d9444e", { roughness: 0.4 });
    const body = cyl(b, 0.42, 0.46, 2.1, white, 32); body.position.y = 1.55;
    const nose = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.42, 0.85, 32)), red); nose.position.y = 3.02;
    const win = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.17, 24)), glowMat(b, TONE.cyan, 0.7)); win.position.set(0, 2.45, 0.43);
    const band = cyl(b, 0.435, 0.435, 0.16, red, 32); band.position.y = 1.7;
    const fins = [0, 1, 2].map((i) => { const f = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.06, 0.8, 0.55)), red); const a = (i / 3) * Math.PI * 2; f.position.set(Math.sin(a) * 0.55, 0.78, Math.cos(a) * 0.55); f.rotation.y = a; f.rotation.z = Math.sin(a) * 0.25; f.rotation.x = -Math.cos(a) * 0.25; return f; });
    const nozzle = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.22, 0.3, 0.3, 24)), mat(b, "#555a70", { metalness: 0.7, roughness: 0.4 })); nozzle.position.y = 0.45;
    const flame = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.28, 1.3, 20)), beam(b, "#ffb24a", 1.7, { transparent: true, opacity: 0.9 })); flame.rotation.x = Math.PI; flame.position.y = -0.2;
    const core = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.15, 0.9, 16)), beam(b, "#fff2c0", 2)); core.rotation.x = Math.PI; core.position.y = -0.02;
    rocket.add(body, nose, win, band, ...fins, nozzle, flame, core);
    const trail = Array.from({ length: 10 }, (_, i) => place(ball(b, 0.14, beam(b, "#d7d2c8", 0.9, { transparent: true, opacity: 0.35 }), 10), [0, -0.3 - i * 0.3, 0]));
    g.add(rocket, ...trail); if (p === "orbita") { rocket.rotation.z = -1.1; rocket.position.set(0, 0.0, 0); flame.visible = core.visible = false; }
    root.add(g); shadows(rocket);
    return done(root, b, (f) => {
      const sh = p === "despegue" ? 0.02 : 0; rocket.position.x = sh * Math.sin(f * 1.7); rocket.position.y = p === "despegue" ? 0.05 * Math.sin(f * 0.1) : 1.0 + 0.05 * Math.sin(f * 0.05);
      flame.scale.set(1 + 0.15 * Math.sin(f * 0.8), 1 + 0.25 * Math.sin(f * 0.6), 1); core.scale.y = 1 + 0.2 * Math.sin(f * 0.9);
      trail.forEach((t, i) => { const u = (f * 0.03 + i / 10) % 1; t.position.set(0.08 * Math.sin(i + f * 0.05), -0.3 - u * 3, 0); t.scale.setScalar(0.5 + u * 1.8); (t.material as THREE.MeshBasicMaterial).opacity = p === "despegue" ? 0.4 * (1 - u) : 0; });
      rocket.rotation.y = f * 0.01;
    });
  },
};

export const galaxia: HeroDef = {
  kind: "primitive",
  when: "Galaxia: la Vía Láctea, estrellas, expansión del universo, materia oscura, cuántas estrellas hay, el universo a gran escala.",
  poses: ["espiral"],
  center: [0, 1.4, 0], radius: 1.5,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.8, 0], base: [0, 0.2, 0], centro: [0, 1.4, 0], brazo: [1.6, 1.4, 0.4], borde: [2.2, 1.4, 0] },
  build: (_L, pose) => {
    poseOf(galaxia, pose, "galaxia");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const N = 2600, pos = new Float32Array(N * 3), cs = new Float32Array(N * 3);
    let s = 17; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    for (let i = 0; i < N; i++) {
      const arm = i % 3, t = Math.pow(r(), 0.7), rad = 0.12 + t * 2.0, ang = t * 5.2 + (arm * Math.PI * 2) / 3 + (r() - 0.5) * (0.5 + 0.6 * t);
      pos.set([Math.cos(ang) * rad, (r() - 0.5) * 0.12 * (1.2 - t), Math.sin(ang) * rad], i * 3);
      const c = col("#ffe9b8", TONE.cyan, Math.min(1, t * 1.1)).lerp(col("#c58bff"), r() * 0.25); cs.set([c.r, c.g, c.b], i * 3);
    }
    const geo = b.track(new THREE.BufferGeometry()); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(cs, 3));
    const pts = new THREE.Points(geo, b.track(new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })));
    const core = halo(b, "rgba(255,225,160,0.95)", 2.0, 0.9); core.rotation.x = -Math.PI / 2;
    const disc = new THREE.Group(); disc.add(pts, core); disc.position.y = 1.4; disc.rotation.x = 0.85; g.add(disc); root.add(g);
    return done(root, b, (f) => { pts.rotation.y = f * 0.004; });
  },
};
