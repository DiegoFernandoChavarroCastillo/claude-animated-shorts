// Prefabs creados a medida para un video (un archivo para todos): cada uno nace porque un guion pedía una imagen que
// el catálogo no tenía, y se queda aquí para reutilizarlo. Nombre del video de origen en el comentario de cada uno.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, beam, box, ghostMat, glowMat, halo, mat, place, rod, scatter, type Bin } from "./kit";

type P3 = [number, number, number];
const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - (1 - clamp01(x)) ** 3;

// microondas-metal · malla de la puerta: ondas anchas (microondas) que rebotan y ondas pequeñas (luz) que pasan por los agujeros
export const rejilla_ondas: HeroDef = {
  kind: "primitive",
  when: "Una malla o rejilla con agujeros: la malla de la puerta del microondas, jaula de Faraday, por qué la luz pasa y las ondas de radio no, filtros, ondas más anchas que el agujero.",
  poses: ["malla"],
  center: [0, 1.1, 0], radius: 1.25,
  anchors: { hero: [0, 1.1, 0], top: [0, 2.0, 0], base: [0, 0.05, 0], malla: [0, 1.1, 0], microondas: [-1.5, 1.1, 0], luz: [1.5, 1.1, 0] },
  build: (_L, pose) => {
    poseOf(rejilla_ondas, pose, "rejilla_ondas");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const N = 7, pitch = 0.2, half = (N * pitch) / 2;
    const metal = glowMat(b, "#cfd3e0", 0.5, { roughness: 0.35, metalness: 0.3 });
    // la malla: barras finas y un punto en cada cruce, en el plano x = 0
    const grid = new THREE.Group();
    for (let i = 0; i <= N; i++) {
      const c = -half + i * pitch;
      grid.add(rod(b, [0, 1.1 - half, c], [0, 1.1 + half, c], 0.012, metal), rod(b, [0, 1.1 + c, -half], [0, 1.1 + c, half], 0.012, metal));
      for (let j = 0; j <= N; j++) grid.add(place(ball(b, 0.024, metal, 8), [0, 1.1 - half + j * pitch, c]));
    }
    g.add(grid);
    // microondas: pocos anillos anchos (mucho más que el agujero)
    const wide = [0, 1, 2].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(0.62, 0.028, 8, 48)), beam(b, "#ffb24a", 1.5, { transparent: true, opacity: 0.9 })));
    wide.forEach((r) => { r.rotation.y = Math.PI / 2; g.add(r); });
    // luz: anillitos que viajan por el centro de cada agujero y atraviesan
    const holes: [number, number][] = [];
    for (let i = 0; i < N; i += 2) for (let j = 0; j < N; j += 2) holes.push([-half + (i + 0.5) * pitch, -half + (j + 0.5) * pitch]);
    const small = holes.flatMap(([y, z], k) => [0, 1].map((s) => ({
      m: new THREE.Mesh(b.track(new THREE.TorusGeometry(0.045, 0.01, 6, 14)), beam(b, "#8be9ff", 1.7, { transparent: true, opacity: 0.95 })), y, z, ph: (k * 0.13 + s * 0.5) % 1,
    })));
    small.forEach((s) => { s.m.rotation.y = Math.PI / 2; g.add(s.m); });
    const flash = halo(b, "rgba(255,190,90,0.9)", 1.2, 0); flash.rotation.y = Math.PI / 2; flash.position.set(-0.04, 1.1, 0); g.add(flash);
    g.rotation.y = -0.55; root.add(g); shadows(g);
    return done(root, b, (f) => {
      let hit = 0;
      wide.forEach((r, i) => {
        const t = (f * 0.012 + i / 3) % 1, out = t < 0.55; // 0..0.55 viaja hacia la malla; el resto, rebota y se desvanece
        const x = out ? -2.1 + (t / 0.55) * 2.05 : -0.05 - ((t - 0.55) / 0.45) * 1.7;
        r.position.set(x, 1.1, 0); r.scale.setScalar(1 + (out ? 0 : 0.08 * (t - 0.55)));
        (r.material as THREE.MeshBasicMaterial).opacity = out ? 0.95 : 0.95 * (1 - (t - 0.55) / 0.45);
        if (out && t > 0.5) hit = Math.max(hit, (t - 0.5) / 0.05);
        if (!out && t < 0.62) hit = Math.max(hit, 1 - (t - 0.55) / 0.07);
      });
      small.forEach((s) => {
        const t = (f * 0.02 + s.ph) % 1;
        s.m.position.set(-2.1 + t * 4.2, 1.1 + s.y, s.z); s.m.scale.setScalar(0.9 + 0.2 * Math.sin(f * 0.3 + s.ph * 6));
        (s.m.material as THREE.MeshBasicMaterial).opacity = 0.95 * Math.min(1, t * 8, (1 - t) * 6);
      });
      (flash.material as THREE.MeshBasicMaterial).opacity = 0.7 * clamp01(hit);
      g.rotation.y = -0.55 + 0.12 * Math.sin(f * 0.012);
    });
  },
};

// microondas-metal · trozo de aluminio con punta: cargas (−) que corren a la punta y, al amontonarse, saltan en chispa
export const aluminio_cargas: HeroDef = {
  kind: "primitive",
  when: "Metal con una punta o un borde afilado: por qué chispea el metal en el microondas, efecto punta, cargas eléctricas que se acumulan, descarga o chispa, papel aluminio, pararrayos.",
  poses: ["repartidas", "amontonadas"],
  actions: {
    amontonar: "Las cargas corren desde toda la lámina hacia la punta y se amontonan (se queda así): se amontonan, se acumulan, corren a la punta, se concentran.",
    chispa: "Salta la chispa en la punta, con un destello que sigue parpadeando: chispa, descarga, arco, salta, ioniza.",
  },
  center: [0.1, 1.1, 0], radius: 1.45,
  anchors: { hero: [0, 1.1, 0.1], top: [0, 1.9, 0], base: [0, 0.05, 0], punta: [1.5, 1.1, 0.05], cargas: [-0.3, 1.1, 0.1], lamina: [-0.5, 1.1, 0.03] },
  build: (_L, pose) => {
    const p = poseOf(aluminio_cargas, pose, "aluminio_cargas");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    // lámina: rectángulo liso que acaba en una punta a la derecha
    const sh = new THREE.Shape(); sh.moveTo(-1.3, -0.38); sh.lineTo(0.85, -0.38); sh.lineTo(1.5, 0); sh.lineTo(0.85, 0.38); sh.lineTo(-1.3, 0.38); sh.closePath();
    const plate = new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false })), glowMat(b, "#d8dbe6", 0.45, { roughness: 0.35, metalness: 0.25 }));
    plate.position.set(0, 1.1, -0.025); g.add(plate);
    // cargas (−): bolitas con una barra; posiciones con semilla, destino = montón junto a la punta
    const chMat = glowMat(b, "#2f5bff", 0.9), bar = glowMat(b, "#ffffff", 1);
    const start = scatter(26, 11, (r) => [-1.15 + r() * 1.9, -0.3 + r() * 0.6, 0.07] as P3);
    const pile = scatter(26, 5, (r, i) => { const a = (i / 26) * 6.28 * 2.4 + r(), d = 0.06 + r() * 0.3; return [1.28 - d * 0.55 + Math.cos(a) * 0.05, Math.sin(a) * Math.min(0.2, d * 0.5), 0.08] as P3; });
    const lag = scatter(26, 2, (r) => [r(), r() * 6.28, r() * 6.28] as P3);
    const ch = start.map((s, i) => {
      const o = new THREE.Group(); o.add(ball(b, 0.06, chMat, 10)); const m = box(b, 0.07, 0.016, 0.016, bar); m.position.z = 0.058; o.add(m);
      o.position.set(s[0], 1.1 + s[1], s[2]); g.add(o); return { o, s, d: pile[i], l: lag[i] };
    });
    // chispa: destello + rayos que parpadean desde la punta
    const tip: P3 = [1.5, 1.1, 0.06], glow = halo(b, "rgba(255,240,170,1)", 1.1, 0); glow.position.set(tip[0], tip[1], 0.12); g.add(glow);
    const hot = halo(b, "rgba(120,200,255,0.9)", 0.7, 0); hot.position.set(tip[0], tip[1], 0.1); g.add(hot);
    const bolts = Array.from({ length: 7 }, () => new THREE.Mesh(b.track(new THREE.BoxGeometry(1, 0.025, 0.025)), beam(b, "#fff6c8", 2.2, { transparent: true, opacity: 0 })));
    bolts.forEach((m) => g.add(m));
    g.rotation.y = -0.3; root.add(g); shadows(g);
    let piled = p === "amontonadas" ? 1 : 0, spark = 0;
    const update = (f: number) => {
      ch.forEach(({ o, s, d, l }) => {
        const k = ease(piled * 1.5 - l[0] * 0.5), jit = 0.02 + 0.03 * k;
        o.position.set(s[0] + (d[0] - s[0]) * k + Math.sin(f * 0.21 + l[1]) * jit, 1.1 + s[1] + (d[1] - s[1]) * k + Math.cos(f * 0.19 + l[2]) * jit, s[2] + (d[2] - s[2]) * k);
        o.scale.setScalar(1 + 0.25 * k * Math.sin(f * 0.4 + l[1]));
      });
      const on = spark > 0, fl = on ? 0.55 + 0.45 * Math.abs(Math.sin(f * 1.3)) : 0;
      (glow.material as THREE.MeshBasicMaterial).opacity = fl * 0.9; (hot.material as THREE.MeshBasicMaterial).opacity = fl;
      const seed = Math.floor(f / 2);
      bolts.forEach((m, i) => {
        const h = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453, a = (h - Math.floor(h)) * 2 - 1, len = 0.3 + 0.45 * (((h * 7) % 1 + 1) % 1);
        const ang = a * 1.15 + (i % 2 ? 0.5 : -0.5), c = Math.cos(ang), sn = Math.sin(ang);
        m.position.set(tip[0] + c * len * 0.5, tip[1] + sn * len * 0.5, 0.1); m.rotation.z = ang; m.scale.x = len;
        (m.material as THREE.MeshBasicMaterial).opacity = on ? (i < 5 ? 0.95 : 0.6) : 0;
      });
      g.rotation.y = -0.3 + 0.08 * Math.sin(f * 0.012);
    };
    return {
      ...done(root, b, update),
      act: (name, u) => {
        if (name === "amontonar") piled = ease(u);
        if (name === "chispa") { spark = u > 0.02 ? 1 : 0; piled = Math.max(piled, 1); }
      },
    };
  },
};

// reloj-pulso · corte de la muñeca bajo un reloj: dos LED verdes, un vaso que late y un fotodiodo. Con más sangre se
// absorbe más luz (menos vuelve al fotodiodo); con menos sangre, vuelve más. El ritmo es fijo (unos 70 latidos/min).
export const sensor_pulso: HeroDef = {
  kind: "primitive",
  when: "Corte de una muñeca con un sensor óptico: cómo un reloj o pulsera mide el pulso con luz verde, fotopletismografía, luz que entra en la piel, la sangre que absorbe luz, un fotodiodo que mide lo que rebota, oxímetro.",
  poses: ["luz"],
  center: [0, 1.5, 0], radius: 1.4,
  anchors: { hero: [0, 1.4, 0.3], top: [0, 2.4, 0], base: [0, 0.05, 0], led: [-0.8, 1.84, 0.4], fotodiodo: [0, 1.84, 0.4], vaso: [0, 1.15, 0.5], piel: [1.2, 1.3, 0.5] },
  build: (_L, pose) => {
    poseOf(sensor_pulso, pose, "sensor_pulso");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
    const PERIOD = 26, bump = (f: number) => { const x = 0.5 + 0.5 * Math.sin((f / PERIOD) * Math.PI * 2 - 1.2); return x * x; };
    // reloj (parte de atrás), piel en corte y tejido
    g.add(place(box(b, 3.0, 0.3, 1.0, mat(b, "#2a2f4a", { roughness: 0.45, metalness: 0.5 })), [0, 2.05, 0]));
    g.add(place(box(b, 3.0, 0.4, 1.0, ghostMat(b, "#f2b8a0", 0.5)), [0, 1.55, 0]));
    g.add(place(box(b, 3.0, 0.62, 1.0, ghostMat(b, "#c97a7a", 0.5)), [0, 1.05, 0]));
    const led = [-1, 1].map((s) => place(ball(b, 0.09, glowMat(b, "#47ff8a", 1.1), 12), [s * 0.8, 1.86, 0.0]));
    const pd = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.22, 0.07, 0.22)), b.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 0.5, 0.5) }))); pd.position.set(0, 1.87, 0);
    const vessel = new THREE.Mesh(b.track(new THREE.CylinderGeometry(1, 1, 1.12, 28)), glowMat(b, "#d62f3f", 0.5, { roughness: 0.4 })); vessel.rotation.x = Math.PI / 2; vessel.position.set(0, 1.12, 0);
    const vglow = halo(b, "rgba(255,70,70,0.9)", 1.4, 0.35); vglow.position.set(0, 1.12, 0.52);
    g.add(...led, pd, vessel, vglow);
    // luz: 8 partículas por LED; salen del LED, llegan al vaso y se absorben o rebotan hacia el fotodiodo
    const N = 8, parts = [0, 1].flatMap((s) => Array.from({ length: N }, (_, i) => ({ s: s ? 1 : -1, i, k: s * N + i,
      m: new THREE.Mesh(b.track(new THREE.SphereGeometry(0.05, 8, 6)), beam(b, "#6bff9a", 2.0, { transparent: true })) })));
    parts.forEach((q) => g.add(q.m));
    g.rotation.y = -0.2; root.add(g); shadows(g);
    const RATE = 0.022;
    return done(root, b, (f) => {
      const p = bump(f), r = 0.22 + 0.14 * p;
      vessel.scale.set(r, 1, r); vglow.scale.setScalar(0.8 + 0.5 * p); (vglow.material as THREE.MeshBasicMaterial).opacity = 0.25 + 0.4 * p;
      (vessel.material as THREE.MeshStandardMaterial).emissive.set("#d62f3f").multiplyScalar(0.25 + 0.5 * p);
      const hy = 1.12 + r + 0.02;
      parts.forEach(({ s, i, k, m }) => {
        const ph = f * RATE + i / N + (s > 0 ? 0.5 / N : 0), c = Math.floor(ph), t = ph - c;
        const arr = bump(f + (0.5 - t) / RATE), absorbed = hash(c * 17 + k * 3.1) < 0.12 + 0.82 * arr;
        const L: P3 = [s * 0.8, 1.82, 0.1 + 0.07 * (i - N / 2) * 0.3], H: P3 = [s * 0.18, hy, L[2]], R: P3 = [0, 1.84, L[2] * 0.4];
        let sc = 1, x, y, z;
        if (t < 0.5) { const u = t / 0.5; x = L[0] + (H[0] - L[0]) * u; y = L[1] + (H[1] - L[1]) * u; z = L[2] + (H[2] - L[2]) * u; }
        else if (absorbed) { const u = (t - 0.5) / 0.5; x = H[0]; y = H[1]; z = H[2]; sc = Math.max(0, 1 - u * 3); }
        else { const u = (t - 0.5) / 0.5; x = H[0] + (R[0] - H[0]) * u; y = H[1] + (R[1] - H[1]) * u; z = H[2] + (R[2] - H[2]) * u; sc = 1.1; }
        m.position.set(x, y, z); m.scale.setScalar(sc);
      });
      const back = 1 - 0.75 * bump(f - 6);
      (pd.material as THREE.MeshBasicMaterial).color.setRGB(0.3 + 1.6 * back, 0.4 + 1.9 * back, 0.4 + 1.2 * back);
      g.rotation.y = -0.2 + 0.1 * Math.sin(f * 0.012);
    });
  },
};

// bluetooth-wifi · la banda de 2,4 GHz como una fila de 79 canales finos: el bluetooth es una barra que salta de canal en canal
// (con estela) y el wifi, un bloque ancho (~20 canales) que se queda fijo. Con `esquivar`, el salto evita los canales del wifi.
export const espectro_canales: HeroDef = {
  kind: "primitive",
  when: "Banda de radio dividida en canales: bluetooth que salta de canal (salto de frecuencia), wifi que ocupa un canal ancho y fijo, interferencia entre redes que comparten banda, espectro, frecuencias, canales saturados.",
  poses: ["bluetooth", "wifi", "ambos"],
  actions: {
    esquivar: "El salto del bluetooth deja de caer en los canales ocupados por el wifi (se queda así): esquiva, evita, cambia de carril, se adapta, deja de usar los canales ocupados.",
  },
  center: [0, 1.1, 0], radius: 1.55,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.0, 0], base: [0, 0.05, 0], bluetooth: [-1.4, 1.0, 0], wifi: [0, 0.9, 0], banda: [0, 0.8, 0] },
  build: (_L, pose) => {
    const p = poseOf(espectro_canales, pose, "espectro_canales");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const N = 79, pitch = 0.052, x0 = -(N - 1) * pitch / 2, X = (c: number) => x0 + c * pitch, Y = 1.0;
    const WIFI_A = 30, WIFI_B = 49;           // 20 canales ocupados
    const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
    // base translúcida y canales finos
    g.add(place(box(b, N * pitch + 0.2, 0.04, 0.5, ghostMat(b, "#8fa3ff", 0.35)), [0, 0.28, 0]));
    const barMat = glowMat(b, "#9db4ff", 0.55);
    const bars = Array.from({ length: N }, (_, c) => { const m = box(b, pitch * 0.6, 1.1, 0.16, barMat); m.position.set(X(c), 0.85, 0); g.add(m); return m; });
    // wifi: un bloque ancho que cubre sus canales
    const wide = (WIFI_B - WIFI_A + 1) * pitch;
    const wifi = new THREE.Mesh(b.track(new THREE.BoxGeometry(wide, 1.5, 0.34)), beam(b, "#ffb24a", 1.2, { transparent: true, opacity: 0.85 }));
    wifi.position.set((X(WIFI_A) + X(WIFI_B)) / 2, 1.05, 0); g.add(wifi);
    const wglow = halo(b, "rgba(255,170,60,0.9)", 2.8, 0.45); wglow.position.set(wifi.position.x, 1.05, 0.2); g.add(wglow);
    // bluetooth: barra alta que salta y cinco estelas
    const hop = new THREE.Mesh(b.track(new THREE.BoxGeometry(pitch * 1.2, 2.3, 0.22)), beam(b, "#59e6ff", 2.0, { transparent: true, opacity: 1 }));
    const trail = Array.from({ length: 5 }, () => new THREE.Mesh(b.track(new THREE.BoxGeometry(pitch * 1.0, 1.9, 0.18)), beam(b, "#59e6ff", 1.5, { transparent: true, opacity: 0 })));
    const clash = halo(b, "rgba(255,70,70,0.95)", 1.0, 0); clash.position.z = 0.3;
    g.add(hop, ...trail, clash);
    g.rotation.y = -0.35; root.add(g); shadows(g);
    let avoid = 0;
    const chan = (s: number) => {                 // canal del salto número s (pseudoaleatorio fijo)
      let c = Math.floor(hash(s * 1.7 + 3) * N);
      if (avoid > 0.5 && c >= WIFI_A - 1 && c <= WIFI_B + 1) c = Math.floor(hash(s * 3.1 + 9) * (WIFI_A - 2));   // se va a la parte baja de la banda
      return c;
    };
    const update = (f: number) => {
      const showBt = p !== "wifi", showWifi = p !== "bluetooth", s = Math.floor(f / 3);
      wifi.visible = wglow.visible = showWifi;
      (wifi.material as THREE.MeshBasicMaterial).opacity = 0.8 + 0.1 * Math.sin(f * 0.15);
      bars.forEach((m, c) => {
        const inWifi = showWifi && c >= WIFI_A && c <= WIFI_B;
        m.scale.y = inWifi ? 0.4 : 1 + 0.12 * Math.sin(f * 0.1 + c * 0.7);
      });
      hop.visible = showBt; trail.forEach((m) => (m.visible = showBt));
      const c0 = chan(s);
      hop.position.set(X(c0), 1.2, 0);
      trail.forEach((m, i) => { m.position.set(X(chan(s - 1 - i)), 1.0, 0); (m.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - i / 5); });
      const hit = showBt && showWifi && avoid < 0.5 && c0 >= WIFI_A && c0 <= WIFI_B;
      (clash.material as THREE.MeshBasicMaterial).opacity = hit ? 0.9 : 0;
      clash.position.x = X(c0); clash.position.y = 1.2;
      g.rotation.y = -0.35 + 0.1 * Math.sin(f * 0.012);
    };
    return {
      ...done(root, b, update),
      act: (name, u) => { if (name === "esquivar") avoid = u > 0.02 ? 1 : 0; },
    };
  },
};
