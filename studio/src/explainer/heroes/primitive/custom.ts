// Prefabs creados a medida para un video (un archivo para todos): cada uno nace porque un guion pedía una imagen que
// el catálogo no tenía, y se queda aquí para reutilizarlo. Nombre del video de origen en el comentario de cada uno.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, col, cyl, ghostMat, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

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

// manilla-concierto · manilla de evento sobre un lector: tira translúcida con antena en espiral y chip. El lector emite
// anillos de radio que suben (`energizar`), el chip se enciende con esa energía y devuelve su número en bolitas (`responder`).
export const manilla_rfid: HeroDef = {
  kind: "primitive",
  when: "Manilla o pulsera de evento (concierto, festival) con chip y antena RFID/NFC: etiqueta sin batería que se despierta con la señal del lector, tarjeta de transporte, llave sin contacto, pago al acercar, tarjeta de acceso.",
  poses: ["cerrada", "interior"],
  actions: {
    energizar: "El lector emite anillos de radio que suben hasta la manilla y encienden el chip (se queda así): acerca, señal, energía llega desde fuera, despierta, alimenta, se enciende.",
    responder: "El chip devuelve su número en bolitas doradas que salen hacia el lector (se queda así): contesta, responde, manda su número, identificador, envía.",
  },
  center: [0, 0.9, 0], radius: 1.45,
  anchors: { hero: [0, 1.0, 0], top: [0, 1.9, 0], base: [0, 0.05, 0], chip: [0, 1.0, 0.1], antena: [0.9, 1.0, 0.1], lector: [0, 0.3, 0], tira: [-1.2, 1.0, 0] },
  build: (_L, pose) => {
    const p = poseOf(manilla_rfid, pose, "manilla_rfid");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    // lector: base plana con un aro que brilla
    g.add(place(box(b, 3.0, 0.16, 1.7, mat(b, "#2a2f4a", { roughness: 0.5, metalness: 0.3 })), [0, 0.1, 0]));
    const ringTop = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.55, 0.035, 8, 40)), beam(b, "#59e6ff", 1.4)); ringTop.rotation.x = Math.PI / 2; ringTop.position.set(0, 0.2, 0); g.add(ringTop);
    // manilla: tira que flota inclinada sobre el lector; antena = 4 vueltas rectangulares, chip en el centro
    const band = new THREE.Group(); band.position.set(0, 1.15, 0); band.rotation.x = -Math.PI / 2 + 0.95; g.add(band);
    const strip = box(b, 3.2, 0.62, 0.07, ghostMat(b, "#a78bfa", p === "interior" ? 0.3 : 0.9, { roughness: 0.6 })); band.add(strip);
    band.add(place(box(b, 0.2, 0.62, 0.1, mat(b, "#f2c14e", { roughness: 0.4, metalness: 0.4 })), [1.55, 0, 0]));   // cierre
    const wire = glowMat(b, "#ffd36b", 0.9, { roughness: 0.3, metalness: 0.4 });
    const coil = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const hx = 1.25 - k * 0.1, hy = 0.24 - k * 0.045;
      [[-hx, -hy, hx, -hy], [hx, -hy, hx, hy], [hx, hy, -hx, hy], [-hx, hy, -hx, -hy + 0.045]].forEach(([x1, y1, x2, y2]) => coil.add(rod(b, [x1, y1, 0.045], [x2, y2, 0.045], 0.012, wire)));
    }
    coil.visible = p === "interior"; band.add(coil);
    const chipMat = glowMat(b, "#1d2440", 0.2, { roughness: 0.3, metalness: 0.5 });
    const chip = box(b, 0.3, 0.3, 0.1, chipMat); chip.position.set(0, 0, 0.08); chip.visible = p === "interior"; band.add(chip);
    const chipGlow = halo(b, "rgba(120,255,170,0.95)", 1.1, 0); chipGlow.position.set(0, 0, 0.2); band.add(chipGlow);
    // anillos de radio que suben del lector a la manilla
    const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.7, 0.025, 8, 48)), beam(b, "#59e6ff", 1.6, { transparent: true, opacity: 0 })); m.rotation.x = Math.PI / 2; g.add(m); return m; });
    // número que devuelve el chip: bolitas doradas
    const bits = Array.from({ length: 6 }, (_, i) => { const m = ball(b, 0.055, beam(b, "#ffd36b", 1.8, { transparent: true, opacity: 0 }), 10); g.add(m); return { m, i }; });
    g.rotation.y = -0.35; root.add(g); shadows(g);
    let en = 0, ans = 0;
    return {
      ...done(root, b, (f) => {
        const on = en > 0.02;
        rings.forEach((r, i) => {
          const t = (f * 0.016 + i / 3) % 1;
          r.position.set(0, 0.3 + 0.75 * t, 0); r.scale.setScalar(0.55 + 0.6 * t);
          (r.material as THREE.MeshBasicMaterial).opacity = on ? 0.9 * en * Math.min(1, t * 6) * (1 - t * 0.7) : 0;
        });
        (ringTop.material as THREE.MeshBasicMaterial).color.set("#59e6ff").multiplyScalar(on ? 1.4 + 0.8 * Math.sin(f * 0.3) : 0.7);
        (chipGlow.material as THREE.MeshBasicMaterial).opacity = on ? en * (0.6 + 0.3 * Math.sin(f * 0.25)) : 0;
        chipMat.emissive.set("#59ffa8").multiplyScalar(on ? 0.6 * en : 0.05);
        bits.forEach(({ m, i }) => {
          const t = ans > 0.02 ? (f * 0.02 + i / 6) % 1 : 0;
          m.position.set(Math.sin(i * 2.1) * 0.5 * t, 0.9 - 0.65 * t, 0.25 * Math.cos(i * 1.7) * t);
          (m.material as THREE.MeshBasicMaterial).opacity = ans > 0.02 ? 0.95 * Math.min(1, t * 8) * (1 - t * 0.8) : 0;
        });
        band.position.y = 1.15 + 0.03 * Math.sin(f * 0.05);
        g.rotation.y = -0.35 + 0.1 * Math.sin(f * 0.012);
      }),
      act: (name, u) => {
        if (name === "energizar") { en = ease(u); coil.visible = true; chip.visible = true; (strip.material as THREE.MeshStandardMaterial).opacity = 0.3; }
        if (name === "responder") { ans = ease(u); coil.visible = true; chip.visible = true; }
      },
    };
  },
};

// manilla-concierto · torre de servidor: cuatro módulos con luces de actividad. `validar` enciende en verde el módulo central
// y lanza una luz que lo recorre (el servidor comprueba el número y responde).
export const servidor_rack: HeroDef = {
  kind: "primitive",
  when: "Servidor o centro de datos: la base de datos del evento, la nube, donde se guardan el saldo y los datos de la cuenta, el servidor que valida y responde, almacenamiento en la nube, internet por dentro.",
  poses: ["rack"],
  actions: {
    validar: "El módulo central se pone en verde y una luz recorre la torre (se queda así): valida, comprueba, consulta, responde, descuenta, registra, aprueba.",
  },
  center: [0, 1.15, 0], radius: 1.4,
  anchors: { hero: [0, 1.15, 0.5], top: [0, 2.4, 0], base: [0, 0.05, 0], modulo: [0, 1.15, 0.5], luces: [0.5, 1.15, 0.5] },
  build: (_L, pose) => {
    poseOf(servidor_rack, pose, "servidor_rack");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
    const frame = mat(b, "#2a2f4a", { roughness: 0.45, metalness: 0.4 }), unitMat = mat(b, "#3b4570", { roughness: 0.5, metalness: 0.3 });
    [-0.98, 0.98].forEach((x) => g.add(place(box(b, 0.1, 2.3, 1.1, frame), [x, 1.2, 0])));
    g.add(place(box(b, 2.06, 0.1, 1.1, frame), [0, 2.35, 0]), place(box(b, 2.06, 0.1, 1.1, frame), [0, 0.05, 0]));
    const units = [0, 1, 2, 3].map((i) => {
      const y = 0.45 + i * 0.52, u = new THREE.Group(); u.position.y = y;
      u.add(box(b, 1.86, 0.4, 0.95, unitMat));
      for (let s = 0; s < 5; s++) u.add(place(box(b, 0.7, 0.02, 0.01, mat(b, "#1d2440")), [-0.4, -0.14 + s * 0.065, 0.48]));
      const leds = Array.from({ length: 5 }, (_, k) => { const l = ball(b, 0.034, glowMat(b, "#59e6ff", 1.0), 8); l.position.set(0.45 + (k % 3) * 0.12, 0.08 - Math.floor(k / 3) * 0.12, 0.49); u.add(l); return l; });
      g.add(u); return { u, leds, y };
    });
    const ok = halo(b, "rgba(90,255,150,0.95)", 2.0, 0); ok.position.set(0, units[1].y, 0.7); g.add(ok);
    const scan = new THREE.Mesh(b.track(new THREE.BoxGeometry(1.9, 0.05, 0.05)), beam(b, "#8bffb5", 1.8, { transparent: true, opacity: 0 })); scan.position.z = 0.52; g.add(scan);
    g.rotation.y = -0.4; root.add(g); shadows(g);
    let v = 0;
    return {
      ...done(root, b, (f) => {
        units.forEach(({ leds }, i) => leds.forEach((l, k) => {
          const green = v > 0.5 && i === 1, blink = hash(Math.floor(f / 5) * 3.3 + i * 7 + k) > 0.45;
          const c = green ? "#4dff8a" : "#59e6ff";
          (l.material as THREE.MeshStandardMaterial).emissive.set(c).multiplyScalar(green ? 1.2 : blink ? 1.0 : 0.15); (l.material as THREE.MeshStandardMaterial).color.set(c);
        }));
        (ok.material as THREE.MeshBasicMaterial).opacity = v > 0.02 ? v * (0.55 + 0.25 * Math.sin(f * 0.2)) : 0;
        const t = (f * 0.025) % 1;
        scan.position.y = 0.3 + t * 2.0; (scan.material as THREE.MeshBasicMaterial).opacity = v > 0.02 ? 0.9 * v * Math.min(1, t * 6, (1 - t) * 6) : 0;
        g.rotation.y = -0.4 + 0.1 * Math.sin(f * 0.012);
      }),
      act: (name, u) => { if (name === "validar") v = ease(u); },
    };
  },
};

// ── manilla-luces ─────────────────────────────────────────────────────────────────────────────────────────────────
const rbox = (b: Bin, w: number, h: number, d: number, r: number, m: THREE.Material) => new THREE.Mesh(b.track(new RoundedBoxGeometry(w, h, d, 4, r)), m);
const sync = (f: number) => new THREE.Color().setHSL((f * 0.006) % 1, 1, 0.55);   // el mismo color para todas las manillas

/** manilla LED de concierto: banda ovalada con trama, cierre, y un módulo con 5 LED, ventana infrarroja y (por dentro) placa, chip, pila de botón y antena */
const wristband = (b: Bin, ghost: number, inner: boolean) => {
  const RX = 0.95, RZ = 0.7, H = 0.4, g = new THREE.Group();
  const weave = screenTex(b.track, 256, 64, (c) => {
    c.fillStyle = "#e9edff"; c.fillRect(0, 0, 256, 64); c.strokeStyle = "rgba(80,92,150,0.55)"; c.lineWidth = 3;
    for (let x = -64; x < 256; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 64, 64); c.stroke(); c.beginPath(); c.moveTo(x + 64, 0); c.lineTo(x, 64); c.stroke(); }
  });
  weave.wrapS = THREE.RepeatWrapping; weave.repeat.set(10, 1);
  const bandMat = b.track(new THREE.MeshStandardMaterial({ map: weave, transparent: true, opacity: ghost, roughness: 0.6, side: THREE.DoubleSide, depthWrite: false, emissive: new THREE.Color(0, 0, 0) }));
  const band = new THREE.Mesh(b.track(new THREE.CylinderGeometry(RX, RX, H, 72, 1, true)), bandMat); band.scale.z = RZ / RX; g.add(band);
  const edge = mat(b, "#f4f6ff", { roughness: 0.5 });
  [-H / 2, H / 2].forEach((y) => { const e = new THREE.Mesh(b.track(new THREE.TorusGeometry(RX, 0.022, 8, 72)), edge); e.rotation.x = Math.PI / 2; e.position.y = y; e.scale.y = RZ / RX; g.add(e); });
  // cierre de plástico dorado a un costado
  const ca = 2.3, clasp = rbox(b, 0.3, H + 0.06, 0.09, 0.03, mat(b, "#e0b04a", { roughness: 0.35, metalness: 0.5 }));
  clasp.position.set(Math.sin(ca) * RX, 0, Math.cos(ca) * RZ); clasp.rotation.y = ca * 0.72; g.add(clasp);
  // módulo frontal
  const mod = new THREE.Group(); mod.position.set(0, 0, RZ + 0.045); g.add(mod);
  mod.add(rbox(b, 1.0, 0.54, 0.2, 0.07, b.track(new THREE.MeshStandardMaterial({ color: "#272c4d", transparent: true, opacity: inner ? 0.16 : 0.9, roughness: 0.3, metalness: 0.2, depthWrite: false }))));
  const ledMats = [0, 1, 2, 3, 4].map((i) => {
    const m = glowMat(b, "#4a5070", 0.1, { roughness: 0.25 }), d = ball(b, 0.072, m, 12); d.position.set(-0.36 + i * 0.18, -0.03, 0.1); mod.add(d);
    const rim = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.078, 0.012, 6, 16)), mat(b, "#9aa3c7", { metalness: 0.6, roughness: 0.3 })); rim.position.set(d.position.x, d.position.y, 0.095); mod.add(rim);
    return m;
  });
  const win = box(b, 0.14, 0.08, 0.02, glowMat(b, "#5a0f1a", 0.8, { roughness: 0.2 })); win.position.set(0.4, 0.2, 0.1); mod.add(win);   // ventana del receptor infrarrojo
  const ins = new THREE.Group(); ins.visible = inner; mod.add(ins);
  ins.add(place(box(b, 0.9, 0.4, 0.02, mat(b, "#1f7a4a", { roughness: 0.5 })), [0, 0, -0.03]));              // placa
  const gold = glowMat(b, "#ffd36b", 0.8, { metalness: 0.5, roughness: 0.3 });
  [[-0.4, 0.15, 0.4, 0.15], [-0.4, -0.15, 0.4, -0.15], [-0.4, 0.15, -0.4, -0.15], [0.05, 0.15, 0.05, -0.15]].forEach(([x1, y1, x2, y2]) => ins.add(rod(b, [x1, y1, -0.015], [x2, y2, -0.015], 0.008, gold)));
  const chip = box(b, 0.22, 0.22, 0.05, glowMat(b, "#12162b", 0.3, { roughness: 0.3, metalness: 0.5 })); chip.position.set(-0.25, 0, 0.0); ins.add(chip);
  for (let k = 0; k < 4; k++) [-1, 1].forEach((s) => ins.add(place(box(b, 0.03, 0.04, 0.012, gold), [-0.25 + s * 0.125, -0.08 + k * 0.055, 0])));
  const batt = cyl(b, 0.15, 0.15, 0.06, mat(b, "#d3d8e6", { roughness: 0.3, metalness: 0.7 }), 28); batt.rotation.x = Math.PI / 2; batt.position.set(0.22, -0.03, 0.01); ins.add(batt);
  ins.add(place(box(b, 0.04, 0.04, 0.064, gold), [0.22, -0.03, 0.01]));
  for (let k = 0; k < 3; k++) { const hx = 0.17 - k * 0.04, hy = 0.07 - k * 0.025; [[-hx, -hy, hx, -hy], [hx, -hy, hx, hy], [hx, hy, -hx, hy], [-hx, hy, -hx, -hy]].forEach(([x1, y1, x2, y2]) => ins.add(rod(b, [x1 + 0.22, y1 + 0.22 - 0.03 + 0.2 * 0, -0.005], [x2 + 0.22, y2 + 0.22 - 0.03 + 0.2 * 0, -0.005], 0.007, glowMat(b, "#e08a3c", 0.7)))); }
  return { g, ledMats, bandMat, mod };
};
const lightLeds = (leds: THREE.MeshStandardMaterial[], bandMat: THREE.MeshStandardMaterial, k: number, c: THREE.Color) => {
  leds.forEach((m) => { if (k > 0.02) { m.color.copy(c); m.emissive.copy(c).multiplyScalar(1.5 * k); } else { m.color.set("#4a5070"); m.emissive.set("#4a5070").multiplyScalar(0.1); } });
  bandMat.emissive.copy(c).multiplyScalar(0.28 * k);
};

export const manilla_led: HeroDef = {
  kind: "primitive",
  when: "Manilla o pulsera LED de concierto que se ilumina y cambia de color sincronizada con las demás (Xylobands, PixMob): banda con módulo, lo que lleva dentro (receptor, LED, pila), pulsera luminosa, luces del público, el color que manda el show.",
  poses: ["cerrada", "interior"],
  actions: {
    encender: "Los LED se encienden y cambian de color todos a la vez (se queda así): se enciende, se ilumina, brilla, cambia de color, se sincroniza, se activa.",
  },
  center: [0, 1.1, 0.2], radius: 0.85,
  anchors: { hero: [0, 1.1, 0.3], top: [0, 1.9, 0], base: [0, 0.05, 0], receptor: [-0.25, 1.15, 0.85], pila: [0.22, 1.1, 0.85], led: [0, 1.1, 0.95], ventana: [0.4, 1.3, 0.9] },
  build: (_L, pose) => {
    const p = poseOf(manilla_led, pose, "manilla_led");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), w = wristband(b, p === "interior" ? 0.3 : 0.92, p === "interior");
    const band = w.g; band.position.y = 1.1; band.rotation.x = 0.32; g.add(band);
    const glow = halo(b, "rgba(255,255,255,0.9)", 3.4, 0); glow.position.set(0, 1.15, 0.9); g.add(glow);
    g.rotation.y = -0.4; root.add(g); shadows(g);
    let on = 0;
    let lf = 0;
    const upd = (f: number) => {
        const c = sync(f); lightLeds(w.ledMats, w.bandMat, on, c);
        const gm = glow.material as THREE.MeshBasicMaterial; gm.color.copy(c); gm.opacity = 0.5 * on;
        band.position.y = 1.1 + 0.03 * Math.sin(f * 0.05);
        g.rotation.y = -0.4 + 0.12 * Math.sin(f * 0.012);
      };
    return {
      ...done(root, b, (f) => { lf = f; upd(f); }),
      act: (name, u) => { if (name === "encender") on = ease(u); upd(lf); },
    };
  },
};

// manilla-luces · emisor infrarrojo en un mástil, con su cono de luz y una manilla al final que se enciende al recibir los pulsos
export const emisor_ir: HeroDef = {
  kind: "primitive",
  when: "Emisor de infrarrojos que apunta a una manilla: luz invisible que manda órdenes de color a las manillas del público (PixMob), mando a distancia, control remoto por luz, señal infrarroja, receptor de luz.",
  poses: ["emisor"],
  actions: {
    emitir: "El emisor lanza paquetes de luz infrarroja por el cono y la manilla se enciende al recibirlos (se queda así): emite, manda, infrarroja, luz invisible, señal, recibe, convierte en color.",
  },
  center: [0, 1.5, 0], radius: 1.1,
  anchors: { hero: [0, 1.5, 0.2], top: [-0.8, 2.9, 0], base: [0, 0.05, 0], emisor: [-0.8, 2.4, 0.3], cono: [0, 1.6, 0.2], manilla: [0.7, 0.85, 0.5] },
  build: (_L, pose) => {
    poseOf(emisor_ir, pose, "emisor_ir");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const E = new THREE.Vector3(-0.8, 2.35, 0.1), T = new THREE.Vector3(0.7, 0.85, 0.35);
    // mástil con base, travesaño y cabeza con 12 lentes
    const steel = mat(b, "#3a4166", { roughness: 0.4, metalness: 0.6 });
    g.add(place(cyl(b, 0.45, 0.5, 0.1, steel, 32), [-0.8, 0.05, 0.1]), rod(b, [-0.8, 0.1, 0.1], [-0.8, 2.1, 0.1], 0.05, steel), rod(b, [-0.8, 0.7, 0.1], [-0.55, 0.1, 0.1], 0.03, steel), rod(b, [-0.8, 0.7, 0.1], [-1.05, 0.1, 0.1], 0.03, steel));
    const head = new THREE.Group(); head.position.copy(E); head.lookAt(T); g.add(head);
    head.add(rbox(b, 0.85, 0.55, 0.4, 0.05, mat(b, "#161a2e", { roughness: 0.4, metalness: 0.5 })));
    const lens = glowMat(b, "#7a0f1e", 0.9, { roughness: 0.2 });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const l = ball(b, 0.06, lens, 10); l.position.set(-0.28 + i * 0.19, -0.16 + j * 0.16, 0.2); head.add(l); }
    const mount = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.34, 0.02, 6, 24, Math.PI)), steel); mount.position.y = -0.0; mount.rotation.z = Math.PI; head.add(mount);
    // cono de luz (E → T) y paquetes que viajan por dentro
    const dir = E.clone().sub(T), L = dir.length();
    const cone = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.62, L, 28, 1, true)), beam(b, "#ff3050", 1.3, { transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
    cone.position.copy(E).add(T).multiplyScalar(0.5); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); g.add(cone);
    const pk = Array.from({ length: 12 }, (_, i) => { const m = ball(b, 0.055, beam(b, "#ff4060", 1.8, { transparent: true, opacity: 0 }), 8); g.add(m); return { m, i }; });
    // manilla receptora, más pequeña
    const w = wristband(b, 0.9, false), wb = w.g; wb.scale.setScalar(0.5); wb.position.copy(T); wb.rotation.set(0.35, 0.5, 0.0); wb.lookAt(E.x, E.y, E.z + 2); g.add(wb);
    wb.rotation.set(0.9, 0.6, 0.0);
    g.rotation.y = -0.15; root.add(g); shadows(g);
    let emit = 0;
    let lf = 0;
    const upd = (f: number) => {
        const on = emit > 0.02;
        (cone.material as THREE.MeshBasicMaterial).opacity = on ? 0.1 + 0.05 * Math.sin(f * 0.3) : 0.05;
        pk.forEach(({ m, i }) => {
          const t = on ? (f * 0.022 + i / 12) % 1 : 0;
          m.position.lerpVectors(E, T, t); m.position.x += Math.sin(i * 2.7) * 0.28 * t; m.position.y += Math.cos(i * 1.9) * 0.28 * t;
          (m.material as THREE.MeshBasicMaterial).opacity = on ? 0.95 * Math.min(1, t * 8) * (1 - Math.max(0, t - 0.88) * 8) : 0;
        });
        lightLeds(w.ledMats, w.bandMat, on ? emit * (0.75 + 0.25 * Math.sin(f * 0.4)) : 0, sync(f));
        wb.position.y = T.y + 0.03 * Math.sin(f * 0.05);
        g.rotation.y = -0.15 + 0.1 * Math.sin(f * 0.012);
      };
    return {
      ...done(root, b, (f) => { lf = f; upd(f); }),
      act: (name, u) => { if (name === "emitir") emit = ease(u); upd(lf); },
    };
  },
};

// manilla-luces · mesa de luces con diez faders (uno por zona), perillas y botones; un portátil con su pantalla y un transmisor de radio
export const consola_luces: HeroDef = {
  kind: "primitive",
  when: "Mesa o consola de luces de un show y portátil con el software de control, que manda las órdenes a un transmisor: operador de iluminación, control remoto del espectáculo, quién manda las luces, ordenador que controla equipos, regidor de luces.",
  poses: ["mesa"],
  actions: {
    mandar: "Los faders se mueven, los botones parpadean y el transmisor lanza ondas por el cable (se queda así): controla, manda, desde la mesa de luces, desde un portátil, órdenes, transmite.",
  },
  center: [0, 0.8, 0], radius: 1.05,
  anchors: { hero: [0, 0.8, 0.2], top: [0, 1.9, 0], base: [0, 0.05, 0], faders: [-0.4, 0.62, 0.45], pantalla: [1.0, 1.2, -0.3], portatil: [1.0, 0.95, -0.3], transmisor: [-1.7, 1.2, -0.3] },
  build: (_L, pose) => {
    poseOf(consola_luces, pose, "consola_luces");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const dark = mat(b, "#1b1f36", { roughness: 0.5, metalness: 0.3 }), body = mat(b, "#2a2f4f", { roughness: 0.45, metalness: 0.3 });
    g.add(place(rbox(b, 2.7, 0.4, 1.3, 0.04, body), [0, 0.22, 0]));
    const panel = new THREE.Group(); panel.position.set(0, 0.46, 0.02); panel.rotation.x = 0.3; g.add(panel);
    panel.add(rbox(b, 2.6, 0.05, 1.15, 0.02, dark));
    const NF = 10, cols = ["#ff5a7a", "#ffb24a", "#59e6ff", "#7cf59b", "#b58cff"];
    const caps = Array.from({ length: NF }, (_, i) => {
      const x = -1.15 + i * 0.17;
      panel.add(place(box(b, 0.022, 0.012, 0.52, mat(b, "#0a0c18")), [x, 0.03, 0.2]));
      const cap = box(b, 0.1, 0.05, 0.13, glowMat(b, cols[i % 5], 0.25, { roughness: 0.4 })); cap.position.set(x, 0.06, 0.2); panel.add(cap); return cap;
    });
    for (let i = 0; i < 8; i++) {
      const k = cyl(b, 0.055, 0.06, 0.05, mat(b, "#d3d8e6", { metalness: 0.6, roughness: 0.3 }), 16); k.position.set(-1.15 + i * 0.17, 0.05, -0.32); panel.add(k);
      const t = box(b, 0.012, 0.012, 0.05, mat(b, "#ff5a7a")); t.position.set(k.position.x, 0.08, -0.34); t.rotation.y = i * 0.8; panel.add(t);
    }
    const btn = Array.from({ length: 12 }, (_, i) => {
      const m = glowMat(b, cols[i % 5], 0.15, { roughness: 0.3 }), x = 0.62 + (i % 3) * 0.17, z = -0.4 + Math.floor(i / 3) * 0.24;
      const bx = box(b, 0.12, 0.03, 0.14, m); bx.position.set(x, 0.045, z); panel.add(bx); return { m, c: cols[i % 5] };
    });
    // portátil: base con teclas y pantalla con barras de colores (una por zona)
    const lap = new THREE.Group(); lap.position.set(0.95, 0.72, -0.3); lap.rotation.y = -0.25; g.add(lap);
    lap.add(place(rbox(b, 1.1, 0.04, 0.72, 0.015, mat(b, "#c9cee0", { metalness: 0.6, roughness: 0.35 })), [0, 0, 0]));
    lap.add(place(box(b, 0.9, 0.012, 0.4, mat(b, "#20243c")), [0, 0.026, 0.06]));
    const scr = new THREE.Group(); scr.position.set(0, 0.02, -0.34); scr.rotation.x = -0.25; lap.add(scr);
    const tex = screenTex(b.track, 256, 160, (c) => {
      c.fillStyle = "#0d1020"; c.fillRect(0, 0, 256, 160); c.fillStyle = "#59e6ff"; c.font = "bold 16px sans-serif"; c.fillText("ZONAS 1-10", 12, 22);
      for (let i = 0; i < 10; i++) { c.fillStyle = `hsl(${i * 36},90%,55%)`; c.fillRect(14 + i * 23, 140 - (30 + ((i * 37) % 70)), 17, 30 + ((i * 37) % 70)); }
    });
    scr.add(place(rbox(b, 1.1, 0.7, 0.04, 0.02, mat(b, "#c9cee0", { metalness: 0.6, roughness: 0.35 })), [0, 0.35, 0]));
    const face = new THREE.Mesh(b.track(new THREE.PlaneGeometry(1.0, 0.6)), b.track(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }))); face.position.set(0, 0.35, 0.025); scr.add(face);
    const cur = box(b, 0.012, 0.56, 0.004, beam(b, "#ffffff", 1.5)); cur.position.set(0, 0.35, 0.03); scr.add(cur);
    // transmisor de radio con antena y cable a la mesa
    const tx = new THREE.Group(); tx.position.set(-1.8, 0, -0.3); g.add(tx);
    tx.add(place(rbox(b, 0.5, 0.32, 0.36, 0.04, mat(b, "#161a2e", { metalness: 0.5, roughness: 0.4 })), [0, 0.18, 0]), place(cyl(b, 0.025, 0.025, 1.0, steelM(b), 10), [0, 0.8, 0]), place(ball(b, 0.06, glowMat(b, "#ff5a7a", 1.0), 10), [0, 1.32, 0]));
    tx.add(place(ball(b, 0.035, glowMat(b, "#7cf59b", 1.2), 8), [0.15, 0.2, 0.19]));
    const cable = tube(b, [[-1.35, 0.45, -0.3], [-1.5, 0.15, -0.1], [-1.65, 0.1, -0.2], [-1.8, 0.2, -0.3]], 0.018, mat(b, "#0a0c18", { roughness: 0.6 }), 24); g.add(cable);
    const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.3, 0.02, 8, 36)), beam(b, "#59e6ff", 1.6, { transparent: true, opacity: 0 })); m.rotation.x = Math.PI / 2; tx.add(m); return m; });
    const pulses = [0, 1, 2, 3].map(() => { const m = ball(b, 0.04, beam(b, "#59e6ff", 1.8, { transparent: true, opacity: 0 }), 8); g.add(m); return m; });
    g.rotation.y = 0.12; root.add(g); shadows(g);
    let go = 0;
    const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
    let lf = 0;
    const upd = (f: number) => {
        const on = go > 0.02;
        caps.forEach((c, i) => { c.position.z = 0.2 - 0.2 + (on ? 0.06 + 0.4 * (0.5 + 0.5 * Math.sin(f * 0.11 + i * 0.7)) : 0.1 + 0.35 * hash(i + 3)); });
        btn.forEach(({ m, c }, i) => { const lit = on ? Math.sin(f * 0.2 + i * 0.9) > 0 : i % 4 === 0; m.emissive.set(c).multiplyScalar(lit ? 1.1 : 0.12); });
        cur.position.x = on ? -0.45 + 0.9 * ((f * 0.02) % 1) : -0.45;
        rings.forEach((r, i) => { const t = (f * 0.018 + i / 3) % 1; r.position.y = 1.32 + t * 0.5; r.scale.setScalar(0.4 + t); (r.material as THREE.MeshBasicMaterial).opacity = on ? 0.9 * (1 - t) : 0; });
        pulses.forEach((m, i) => { const t = on ? (f * 0.03 + i / 4) % 1 : 0; m.position.set(-1.35 - 0.45 * t, 0.45 - 0.25 * Math.sin(t * Math.PI) - 0.2 * t, -0.3); (m.material as THREE.MeshBasicMaterial).opacity = on ? 0.95 * Math.sin(t * Math.PI) : 0; });
        g.rotation.y = 0.12 + 0.1 * Math.sin(f * 0.012);
      };
    return {
      ...done(root, b, (f) => { lf = f; upd(f); }),
      act: (name, u) => { if (name === "mandar") go = ease(u); upd(lf); },
    };
  },
};
const steelM = (b: Bin) => mat(b, "#9aa3c7", { roughness: 0.35, metalness: 0.7 });

// manilla-luces · estadio oval visto desde arriba: cuatro gradas escalonadas con el público (puntos de luz) repartido en diez zonas, escenario
// con arco de focos y muro exterior. `ola`: un color recorre las zonas en orden. `sincronizar`: todas las zonas cambian de color a la vez.
export const estadio_zonas: HeroDef = {
  kind: "primitive",
  when: "Estadio o recinto de concierto con el público en gradas dividido en zonas, visto desde arriba: ola de luz entre el público, manillas LED por zonas, efecto que recorre la multitud, todas las manillas a la vez, pantalla hecha con personas.",
  poses: ["estadio"],
  actions: {
    ola: "Un color recorre las diez zonas una tras otra y da vueltas por el estadio (se queda así): ola, recorre, en orden, zona por zona, efecto, se propaga.",
    sincronizar: "Todo el público cambia de color a la vez, como una sola luz (se queda así): a la vez, sincronizadas, todas juntas, el show entero, interruptor, bombillas.",
  },
  center: [0, 0.6, 0], radius: 0.85,
  anchors: { hero: [0, 0.5, 0], top: [0, 1.8, 0], base: [0, 0.05, 0], escenario: [0, 0.4, 0], zona: [1.5, 0.7, 0] },
  build: (_L, pose) => {
    poseOf(estadio_zonas, pose, "estadio_zonas");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), ZONES = 10, RX = 1.0, RZ = 0.74;
    const ell = (r: number, hole = 0) => { const s = new THREE.Shape(); s.absellipse(0, 0, r * RX * 1.7, r * RZ * 1.7, 0, Math.PI * 2, false); if (hole) { const h = new THREE.Path(); h.absellipse(0, 0, hole * RX * 1.7, hole * RZ * 1.7, 0, Math.PI * 2, true); s.holes.push(h); } return s; };
    const slab = (shape: THREE.Shape, y: number, h: number, m: THREE.Material) => { const mm = new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 48 })), m); mm.rotation.x = -Math.PI / 2; mm.position.y = y; g.add(mm); return mm; };
    g.position.y = 0.05;
    slab(ell(1.18), 0, 0.12, mat(b, "#161a2e", { roughness: 0.7 }));
    slab(ell(0.55), 0.12, 0.02, mat(b, "#1f5a46", { roughness: 0.8 }));                                  // campo
    const TIER = 4, tiers = [0, 1, 2, 3].map((t) => { const r0 = 0.62 + t * 0.14; slab(ell(r0 + 0.14, r0), 0.12, 0.08 + t * 0.09, mat(b, ["#3a4268", "#343b5e", "#2f3555", "#2a2f4c"][t], { roughness: 0.6 })); return { r: r0 + 0.07, y: 0.12 + 0.08 + t * 0.09 }; });
    slab(ell(1.2, 1.14), 0.12, 0.6, mat(b, "#252a45", { roughness: 0.5, metalness: 0.2 }));            // muro exterior
    const roof = new THREE.Mesh(b.track(new THREE.TorusGeometry(1, 0.012, 6, 80)), mat(b, "#9aa3c7", { metalness: 0.7, roughness: 0.3 })); roof.rotation.x = Math.PI / 2; roof.scale.set(RX * 1.7 * 1.17, RZ * 1.7 * 1.17, 1); roof.position.y = 0.95; g.add(roof);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, x = Math.cos(a) * RX * 1.7 * 1.17, z = Math.sin(a) * RZ * 1.7 * 1.17; g.add(rod(b, [x, 0.7, z], [x, 0.95, z], 0.012, mat(b, "#9aa3c7", { metalness: 0.7 }))); }
    // escenario con arco de focos
    g.add(place(box(b, 0.7, 0.14, 0.34, mat(b, "#f2c14e", { roughness: 0.4, metalness: 0.3 })), [0, 0.2, -0.06]));
    g.add(rod(b, [-0.34, 0.27, -0.2], [-0.34, 0.75, -0.2], 0.018, steelM(b)), rod(b, [0.34, 0.27, -0.2], [0.34, 0.75, -0.2], 0.018, steelM(b)), rod(b, [-0.34, 0.75, -0.2], [0.34, 0.75, -0.2], 0.018, steelM(b)));
    const spots = [-0.25, -0.08, 0.08, 0.25].map((x) => { const s = ball(b, 0.035, beam(b, "#fff2c0", 1.8), 8); s.position.set(x, 0.72, -0.2); g.add(s); return s; });
    // público: un punto de luz por persona, en instancias con color propio
    const dots: { x: number; y: number; z: number; zone: number }[] = [];
    tiers.forEach(({ r, y }, t) => { const n = 40 + t * 8; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + t * 0.07; dots.push({ x: Math.cos(a) * r * RX * 1.7, y: y + 0.045, z: Math.sin(a) * r * RZ * 1.7, zone: Math.floor((((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * ZONES) }); } });
    void TIER;
    const inst = new THREE.InstancedMesh(b.track(new THREE.SphereGeometry(0.045, 8, 6)), b.track(new THREE.MeshBasicMaterial({ toneMapped: false })), dots.length);
    const dm = new THREE.Object3D(); dots.forEach((d, i) => { dm.position.set(d.x, d.y, d.z); dm.updateMatrix(); inst.setMatrixAt(i, dm.matrix); }); g.add(inst);
    g.rotation.y = -0.3; root.add(g); shadows(g);
    let wave = 0, all = 0;
    const off = new THREE.Color("#3b4470"), tmp = new THREE.Color();
    let lf = 0;
    const upd = (f: number) => {
        const head = (f * 0.1) % ZONES;
        dots.forEach((d, i) => {
          if (all > 0.02) tmp.copy(sync(f * 1.6)).multiplyScalar(1.5);
          else if (wave > 0.02) { const k = (head - d.zone + ZONES) % ZONES; if (k < 2.6) tmp.setHSL(((d.zone / ZONES) + f * 0.004) % 1, 1, 0.55).multiplyScalar(1.5 * (1 - k / 2.6)).add(off.clone().multiplyScalar(0.35)); else tmp.copy(off); } else tmp.copy(off);
          inst.setColorAt(i, tmp);
        });
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
        spots.forEach((s, i) => (s.material as THREE.MeshBasicMaterial).color.setHSL((f * 0.01 + i * 0.25) % 1, 0.8, 0.7).multiplyScalar(wave + all > 0.02 ? 2 : 1.2));
        g.rotation.y = -0.3 + f * 0.003;
      };
    return {
      ...done(root, b, (f) => { lf = f; upd(f); }),
      act: (name, u) => { if (name === "ola") wave = ease(u); if (name === "sincronizar") all = ease(u); upd(lf); },
    };
  },
};

const hash1 = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
const edgeLines = (b: Bin, m: THREE.Mesh, c: string) => { const l = new THREE.LineSegments(b.track(new THREE.EdgesGeometry(m.geometry)), b.track(new THREE.LineBasicMaterial({ color: c }))); m.add(l); return l; };

// memoria-usb · pen drive de verdad: carcasa con estrías y LED, conector USB-A hueco con lengüeta y contactos, anilla; abierto muestra la placa
// con el chip NAND, el controlador, el cristal, condensadores, pistas y los datos que viajan del conector al chip.
export const memoria_usb: HeroDef = {
  kind: "primitive",
  when: "Memoria USB o pen drive: la memoria flash, guardar archivos y fotos en un USB, lo que hay dentro de un pendrive (chip, controlador, placa), conector USB, almacenamiento sin partes móviles, copiar datos.",
  poses: ["cerrada", "abierta"],
  actions: {
    transferir: "Los datos viajan por las pistas del conector al chip y el LED parpadea (se queda así): guarda, copia, conecta, transfiere, escribe, pasa los archivos.",
  },
  center: [0.1, 0.6, 0], radius: 0.88,
  anchors: { hero: [0, 0.85, 0], top: [0, 1.6, 0], base: [0, 0.05, 0], conector: [1.2, 0.85, 0.1], chip: [-0.55, 0.9, 0.1], controlador: [-0.1, 0.9, 0], led: [-1.1, 0.95, 0.2], placa: [-0.4, 0.8, 0.1] },
  build: (_L, pose) => {
    const p = poseOf(memoria_usb, pose, "memoria_usb"), open = p === "abierta";
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const plastic = mat(b, "#3d3db8", { roughness: 0.55, metalness: 0 }), steel = mat(b, "#cfd5ea", { roughness: 0.22, metalness: 0.9 });
    const black = mat(b, "#0e1120", { roughness: 0.45, metalness: 0.2 }), gold = glowMat(b, "#f2c14e", 0.45, { roughness: 0.3, metalness: 0.8 });
    const board = mat(b, "#1b8a5a", { roughness: 0.55 });
    // carcasa (translúcida si está abierto, con la bandeja de abajo opaca)
    g.add(place(rbox(b, 1.9, 0.28, 0.62, 0.07, open ? ghostMat(b, "#8d7dff", 0.16, { roughness: 0.8, metalness: 0 }) : plastic), [-0.5, 0, 0]));
    if (open) g.add(place(rbox(b, 1.9, 0.05, 0.62, 0.02, plastic), [-0.5, -0.115, 0]));
    // conector USB-A: cuatro paredes de acero, lengüeta negra con cuatro contactos y dos hendiduras
    const plug = new THREE.Group(); plug.position.set(0.875, 0, 0);
    const L = 0.95, H = 0.19, W = 0.5, t = 0.025;
    plug.add(place(box(b, L, t, W, steel), [0, H / 2 - t / 2, 0]), place(box(b, L, t, W, steel), [0, -H / 2 + t / 2, 0]),
      place(box(b, L, H, t, steel), [0, 0, W / 2 - t / 2]), place(box(b, L, H, t, steel), [0, 0, -W / 2 + t / 2]),
      place(box(b, L - 0.08, 0.035, W - 0.14, black), [-0.04, -0.03, 0]));
    [-0.15, -0.05, 0.05, 0.15].forEach((z) => plug.add(place(box(b, 0.3, 0.012, 0.045, gold), [0.2, -0.0065, z])));
    [-0.1, 0.1].forEach((z) => plug.add(place(box(b, 0.06, 0.004, 0.04, black), [-0.05, H / 2 + 0.001, z])));
    g.add(plug);
    g.add(place(new THREE.Mesh(b.track(new THREE.TorusGeometry(0.09, 0.022, 10, 28)), steel), [-1.52, 0, 0]));
    g.children[g.children.length - 1].rotation.x = Math.PI / 2;
    // LED
    const ledMat = glowMat(b, "#38ff9a", 0.6), led = box(b, open ? 0.06 : 0.1, open ? 0.03 : 0.012, 0.05, ledMat);
    led.position.set(-1.15, open ? -0.05 : 0.146, 0.2); g.add(led);
    const ledGlow = halo(b, "rgba(80,255,170,0.9)", 0.5, 0); ledGlow.rotation.x = -Math.PI / 2; ledGlow.position.set(-1.15, open ? -0.02 : 0.16, 0.2); g.add(ledGlow);
    // cerrada: estrías de agarre
    if (!open) for (let i = 0; i < 6; i++) g.add(place(box(b, 0.025, 0.012, 0.5, mat(b, "#1d1c5c", { roughness: 0.7 })), [-0.9 + i * 0.12, 0.144, 0]));
    // abierta: placa, chips, cristal, condensadores, resistencias, pistas y pulsos de datos
    const pulses: { m: THREE.Mesh; z: number; k: number }[] = [];
    let nandGlow: THREE.Mesh | null = null;
    if (open) {
      g.add(place(box(b, 1.55, 0.03, 0.5, board), [-0.55, -0.075, 0]));
      const nand = place(box(b, 0.62, 0.06, 0.34, black), [-0.7, -0.03, 0]); g.add(nand);
      g.add(place(box(b, 0.5, 0.004, 0.2, mat(b, "#2a2f4f", { roughness: 0.3 })), [-0.7, 0.001, 0]), place(cyl(b, 0.016, 0.016, 0.006, steel, 12), [-0.95, 0.002, -0.13]));
      const ctrl = place(box(b, 0.26, 0.05, 0.26, black), [-0.16, -0.035, -0.05]); g.add(ctrl, place(cyl(b, 0.014, 0.014, 0.006, steel, 12), [-0.26, -0.008, -0.15]));
      g.add(place(rbox(b, 0.14, 0.05, 0.07, 0.015, steel), [-0.16, -0.04, 0.2]), place(rbox(b, 0.04, 0.03, 0.04, 0.008, mat(b, "#c9a46a")), [0.12, -0.045, 0.16]));
      [[0.12, 0.2], [0.2, 0.2], [0.2, -0.2], [0.12, -0.2]].forEach(([x, z]) => g.add(place(rbox(b, 0.05, 0.03, 0.03, 0.006, mat(b, "#c9a46a")), [x, -0.045, z])));
      [[-0.42, 0.2], [-0.42, -0.2], [-0.95, 0.2]].forEach(([x, z]) => g.add(place(box(b, 0.04, 0.015, 0.025, black), [x, -0.052, z])));
      for (let i = 0; i < 10; i++) [-1, 1].forEach((s) => g.add(place(box(b, 0.028, 0.012, 0.07, steel), [-0.98 + i * 0.068, -0.05, s * 0.2])));
      for (let i = 0; i < 5; i++) [-1, 1].forEach((s) => g.add(place(box(b, 0.028, 0.012, 0.05, steel), [-0.25 + i * 0.065, -0.055, -0.05 + s * 0.155])));
      [-0.15, -0.05, 0.05, 0.15].forEach((z, i) => {
        g.add(place(box(b, 0.12, 0.008, 0.045, gold), [0.34, -0.058, z]));
        g.add(rod(b, [0.3, -0.056, z], [-0.04, -0.056, -0.05 + (z + 0.05) * 0.8], 0.007, gold), rod(b, [-0.29, -0.056, -0.05 + (z + 0.05) * 0.8], [-0.4, -0.056, z * 0.9], 0.007, gold));
        for (let k = 0; k < 3; k++) {
          const m = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.03, 10, 8)), beam(b, "#8be9ff", 1.9, { transparent: true, opacity: 0 }));
          g.add(m); pulses.push({ m, z, k: (k + i * 0.25) / 3 });
        }
      });
      nandGlow = halo(b, "rgba(120,220,255,0.9)", 1.0, 0); nandGlow.rotation.x = -Math.PI / 2; nandGlow.position.set(-0.7, 0.04, 0); g.add(nandGlow);
    }
    g.position.y = 0.85; g.rotation.set(0.25, -0.5, 0.28); root.add(g); shadows(g);
    let tx = 0, lf = 0;
    const upd = (f: number) => {
      lf = f;
      ledMat.emissiveIntensity = 1.2 + tx * (1.4 + 1.4 * Math.sin(f * 0.55)); (ledGlow.material as THREE.MeshBasicMaterial).opacity = 0.25 + tx * (0.3 + 0.3 * Math.sin(f * 0.55));
      pulses.forEach(({ m, z, k }) => {
        const u = (f * 0.014 + k) % 1; m.position.set(0.95 - 1.7 * u, -0.05, z * (1 - 0.3 * u));
        (m.material as THREE.MeshBasicMaterial).opacity = tx * Math.min(1, u * 8, (1 - u) * 5);
      });
      if (nandGlow) (nandGlow.material as THREE.MeshBasicMaterial).opacity = tx * (0.3 + 0.2 * Math.sin(f * 0.4));
      g.position.y = 0.85 + 0.03 * Math.sin(f * 0.04); g.rotation.y = -0.5 + 0.1 * Math.sin(f * 0.012);
    };
    return {
      ...done(root, b, upd),
      act: (name, u) => { if (name === "transferir") tx = ease(u * 3); upd(lf); },
    };
  },
};

// memoria-usb · corte de una celda de memoria flash: silicio con fuente y drenaje, óxido túnel fino, compuerta flotante, óxido, compuerta de
// control y doce electrones. `escribir`: voltaje en la compuerta y los electrones suben por el óxido hasta quedar dentro; `borrar`: bajan;
// `leer`: corriente por el canal (con la compuerta cargada pasa poca); `fuga`: se escapan despacio; `desgaste`: grietas en el óxido túnel.
export const celda_flash: HeroDef = {
  kind: "primitive",
  when: "Una celda de memoria flash en corte: compuerta flotante, electrones atrapados, aislante, escribir y borrar con voltaje (efecto túnel), leer si conduce o no, desgaste del aislante, fuga de carga con el tiempo, cómo guarda un bit un chip sin energía.",
  poses: ["vacia", "cargada"],
  actions: {
    escribir: "Voltaje alto en la compuerta de control y los electrones suben por el aislante hasta la compuerta flotante, donde se quedan: guardar un dato, escribir, aplicar voltaje, efecto túnel, atraviesan, atrapados.",
    borrar: "Voltaje contrario y los electrones salen de la compuerta flotante de golpe: borrar, vaciar, salen, voltaje contrario.",
    leer: "Corriente de puntos por el canal de fuente a drenaje: pasa mucha con la compuerta vacía y casi nada con electrones atrapados: leer, medir si conduce, deja pasar corriente.",
    fuga: "Los electrones se escapan despacio de la compuerta, uno a uno: se fugan, se escapan con el tiempo, pierde la carga, olvida.",
    desgaste: "Aparecen grietas en el aislante fino y se tiñe de ámbar: daña el aislante, desgaste, se gasta, límite de borrados.",
  },
  center: [0, 0.75, 0], radius: 1.25,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.2, 0], base: [0, 0.05, 0], fuente: [-1.1, 1.9, 0], drenaje: [1.1, 1.9, 0], compuerta: [0, 1.4, 0.3], flotante: [0, 1.0, 0.3], aislante: [0, 0.85, 0.3], canal: [0, 0.7, 0.3], electrones: [0, 0.95, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(celda_flash, pose, "celda_flash");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), D = 0.62;
    const si = mat(b, "#4f5c9c", { roughness: 0.6 }), steel = mat(b, "#aeb6dc", { roughness: 0.3, metalness: 0.8 });
    g.add(place(box(b, 3.2, 0.5, D, si), [0, 0.25, 0]));
    g.add(place(box(b, 0.8, 0.22, D * 1.002, glowMat(b, "#2fb6a6", 0.35)), [-1.1, 0.39, 0]), place(box(b, 0.8, 0.22, D * 1.002, glowMat(b, "#2fb6a6", 0.35)), [1.1, 0.39, 0]));
    g.add(place(box(b, 1.64, 0.9, D * 1.06, ghostMat(b, "#7fe8ff", 0.09)), [0, 0.95, 0]));
    const oxMat = ghostMat(b, "#7fe8ff", 0.4), ox = place(box(b, 1.5, 0.09, D, oxMat), [0, 0.545, 0]); g.add(ox);
    const fg = place(box(b, 1.4, 0.24, D * 0.92, ghostMat(b, "#ffb347", 0.42, { emissive: new THREE.Color("#ffb347").multiplyScalar(0.25) })), [0, 0.705, 0]); g.add(fg); edgeLines(b, fg, "#ffd48a");
    g.add(place(box(b, 1.5, 0.07, D, ghostMat(b, "#7fe8ff", 0.4)), [0, 0.865, 0]));
    const cgMat = glowMat(b, "#8f7bff", 0.35, { roughness: 0.4, metalness: 0.3 }), cg = place(box(b, 1.4, 0.32, D * 0.92, cgMat), [0, 1.06, 0]); g.add(cg);
    [-1.1, 1.1, 0].forEach((x) => {
      const y0 = x === 0 ? 1.22 : 0.5, y1 = x === 0 ? 1.85 : 1.6;
      g.add(rod(b, [x, y0, 0], [x, y1, 0], 0.045, steel), place(ball(b, 0.09, glowMat(b, x === 0 ? "#8f7bff" : "#2fb6a6", 0.8), 14), [x, y1, 0]));
    });
    // electrones: bolita azul con barra «−» al frente; abajo en el canal, arriba dentro de la compuerta flotante
    const N = 12, eM = glowMat(b, "#5aa0ff", 1.5), bar = glowMat(b, "#ffffff", 1);
    const el = Array.from({ length: N }, (_, i) => {
      const o = new THREE.Group(); o.add(ball(b, 0.085, eM, 12)); const m = box(b, 0.09, 0.02, 0.02, bar); m.position.z = 0.082; o.add(m); const hl = halo(b, "rgba(120,180,255,0.95)", 0.42, 0.75); hl.position.z = 0.05; o.add(hl); g.add(o);
      return { o, c: [-0.62 + i * 0.113, 0.505, (hash1(i + 1) - 0.5) * 0.4] as P3, f: [-0.55 + (i % 6) * 0.22, i < 6 ? 0.64 : 0.77, (hash1(i + 9) - 0.5) * 0.34] as P3, lag: hash1(i + 20), th: hash1(i + 40) };
    });
    // corriente de lectura
    const cur = Array.from({ length: 10 }, () => new THREE.Mesh(b.track(new THREE.SphereGeometry(0.055, 10, 8)), beam(b, "#ffe27a", 2.4, { transparent: true, opacity: 0 })));
    cur.forEach((m) => g.add(m));
    const volt = halo(b, "rgba(255,170,70,0.95)", 2.0, 0); volt.position.set(0, 1.15, D * 0.55); g.add(volt);
    // grietas del óxido túnel
    const cracks = Array.from({ length: 14 }, (_, i) => {
      const m = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.14, 0.02, 0.02)), beam(b, "#ffd27a", 3.0, { transparent: true, opacity: 0 }));
      m.position.set(-0.68 + i * 0.105, 0.545 + (hash1(i + 3) - 0.5) * 0.04, D / 2 + 0.01); m.rotation.z = (hash1(i + 5) - 0.5) * 1.8; g.add(m); return m;
    });
    g.position.y = 0.3; g.rotation.y = -0.38; root.add(g); shadows(g);
    let q = p === "cargada" ? 1 : 0, lk = 0, wr = 0, er = 0, rd = 0, wn = 0, lf = 0;
    const upd = (f: number) => {
      lf = f;
      const leakOn = lk > 0;
      let charge = 0;
      el.forEach(({ o, c, f: fp, lag, th }, i) => {
        const e = ease(clamp01(q * 1.6 - lag * 0.6)), gone = leakOn ? clamp01((lk - th * 0.85) * 6) : 0, k = e * (1 - gone); charge += k / N;
        const j = (leakOn ? 0.03 : 0.012) * (1 + 3 * Math.sin(Math.PI * e)) * (e > 0 && e < 1 ? 1.8 : 1);
        o.position.set(c[0] + (fp[0] - c[0]) * k + Math.sin(f * 0.23 + i) * j, c[1] + (fp[1] - c[1]) * k + Math.cos(f * 0.19 + i * 2) * j, c[2] + (fp[2] - c[2]) * k);
        o.scale.setScalar(1 + (leakOn && gone > 0 && gone < 1 ? 0.25 * Math.sin(f * 0.6 + i) : 0));
      });
      const v = Math.max(wr > 0 && wr < 1 ? Math.sin(Math.PI * wr) : 0, er > 0 && er < 1 ? Math.sin(Math.PI * er) : 0);
      const vm = volt.material as THREE.MeshBasicMaterial; vm.opacity = 0.85 * v; vm.color.set(er > 0 && er < 1 ? "#6aa8ff" : "#ffffff");
      cgMat.emissiveIntensity = 0.35 + 1.6 * v;
      cur.forEach((m, j) => {
        const t = (f * 0.022 + j / cur.length) % 1, show = j / cur.length < 1 - 0.88 * charge ? 1 : 0;
        m.position.set(-1.1 + 2.2 * t, 0.5 + (hash1(j + 60) - 0.5) * 0.05, (hash1(j + 70) - 0.5) * 0.4);
        (m.material as THREE.MeshBasicMaterial).opacity = rd * show * Math.min(1, t * 8, (1 - t) * 8) * (0.5 + 0.5 * (1 - charge));
      });
      cracks.forEach((m, i) => { (m.material as THREE.MeshBasicMaterial).opacity = clamp01(wn * 1.4 - i * 0.07) * (0.7 + 0.3 * Math.sin(f * 0.4 + i)); });
      oxMat.color.set(wn > 0 ? new THREE.Color("#7fe8ff").lerp(new THREE.Color("#ffb04a"), wn) : "#7fe8ff");
      g.rotation.y = -0.38 + 0.1 * Math.sin(f * 0.012);
    };
    return {
      ...done(root, b, upd),
      act: (name, u) => {
        if (name === "escribir") { wr = clamp01(u); q = ease(u); }
        if (name === "borrar") { er = clamp01(u); q = 1 - ease(u); }
        if (name === "leer") rd = clamp01(u * 4);
        if (name === "fuga") lk = clamp01(u);
        if (name === "desgaste") wn = ease(u);
        upd(lf);
      },
    };
  },
};

// memoria-usb · chip NAND (encapsulado negro con patillas) y, sin la tapa, la oblea con una matriz de celdas. `escribir` carga celdas (cian),
// `repartir` (pose «uso»): al principio unas pocas celdas se gastan mucho (rojo) y una barrida las deja todas con el mismo desgaste.
export const celdas_matriz: HeroDef = {
  kind: "primitive",
  when: "Chip de memoria flash NAND con su matriz de celdas: un chip lleno de celdas, millones de bits, el encapsulado y las patillas, la oblea de silicio, repartir las escrituras para que ninguna celda se gaste antes (nivelación del desgaste), controlador que reparte.",
  poses: ["paquete", "celdas", "uso"],
  actions: {
    escribir: "Se cargan celdas por todo el chip, una tras otra (se queda así): guardar archivos, escribir datos, llenar la memoria, celdas con carga.",
    repartir: "Una barrida deja todas las celdas con el mismo desgaste, en vez de unas pocas rojas (se queda así; pose «uso»): reparte las escrituras, nivela, que ninguna se gaste antes.",
  },
  center: [0, 0.7, 0], radius: 1.3,
  anchors: { hero: [0, 0.9, 0], top: [0, 1.7, 0], base: [0, 0.05, 0], paquete: [0, 0.95, 0], celdas: [0, 1.0, 0], patillas: [1.35, 0.85, 0.9], marca: [-1.1, 0.95, -0.7] },
  build: (_L, pose) => {
    const p = poseOf(celdas_matriz, pose, "celdas_matriz"), show = p !== "paquete";
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const epoxy = mat(b, "#13162b", { roughness: 0.5, metalness: 0.15 }), steel = mat(b, "#cfd5ea", { roughness: 0.25, metalness: 0.9 });
    g.add(place(rbox(b, 2.7, 0.2, 1.9, 0.05, epoxy), [0, 0, 0]));
    for (let i = 0; i < 12; i++) [-1, 1].forEach((s) => g.add(place(box(b, 0.07, 0.02, 0.2, steel), [-1.1 + i * 0.2, -0.05, s * 1.0]), place(box(b, 0.07, 0.07, 0.025, steel), [-1.1 + i * 0.2, -0.015, s * 0.9])));
    g.add(place(cyl(b, 0.05, 0.05, 0.012, mat(b, "#3a4166", { roughness: 0.4 }), 16), [-1.1, 0.104, -0.7]));
    const cols = 14, rows = 8, cw = 2.0 / cols, rh = 1.3 / rows, N = cols * rows;
    let im: THREE.InstancedMesh | null = null; const dm = new THREE.Matrix4(), c = new THREE.Color();
    if (show) {
      g.add(place(box(b, 2.2, 0.04, 1.5, mat(b, "#252d58", { roughness: 0.35, metalness: 0.4 })), [0, 0.12, 0]));
      [-1, 1].forEach((s) => g.add(place(box(b, 2.3, 0.03, 0.04, steel), [0, 0.125, s * 0.78]), place(box(b, 0.04, 0.03, 1.6, steel), [s * 1.12, 0.125, 0])));
      im = new THREE.InstancedMesh(b.track(new THREE.BoxGeometry(cw * 0.72, 0.035, rh * 0.72)), b.track(new THREE.MeshBasicMaterial({ color: 0xffffff })), N);
      for (let i = 0; i < N; i++) { dm.makeTranslation(-1.0 + cw * (0.5 + (i % cols)), 0.16, -0.65 + rh * (0.5 + Math.floor(i / cols))); im.setMatrixAt(i, dm); }
      g.add(im);
      b.track({ dispose: () => im!.dispose() });
    } else {
      g.add(place(rbox(b, 2.3, 0.04, 1.5, 0.03, mat(b, "#1b1f3a", { roughness: 0.4, metalness: 0.2 })), [0, 0.11, 0]));
      [0.3, 0.1, -0.1].forEach((z, i) => g.add(place(box(b, 1.2 - i * 0.3, 0.008, 0.06, mat(b, "#7a82b0", { roughness: 0.5 })), [-0.5 + i * 0.15, 0.135, z])));
    }
    g.position.y = 0.9; g.rotation.set(1.0, -0.3, 0); root.add(g); shadows(g);
    let wr = 0, sw = 0, lf = 0; const heatOn = p === "uso" ? 1 : 0;
    const wear0 = (i: number) => { const x = i % cols, z = Math.floor(i / cols); return clamp01(Math.exp(-((x - 3.5) ** 2 + (z - 3) ** 2) / 9) * 1.2 + hash1(i + 3) * 0.1); };
    const upd = (f: number) => {
      lf = f;
      if (im) {
        for (let i = 0; i < N; i++) {
          const x = i % cols, h = hash1(i * 1.7 + 0.5), thr = 0.3 + 0.45 * wr, fresh = clamp01(1 - Math.abs(h - thr) * 14);
          const on = h < thr ? 1 : 0;
          c.setRGB(0.1, 0.14, 0.32).lerp(new THREE.Color(0.2, 1.1, 1.5), on).addScalar(0.9 * fresh * (wr > 0 && wr < 1 ? 1 : 0));
          const front = sw * (cols + 4) - 2, t = ease((front - x) / 4), hot = heatOn * (wear0(i) + (0.28 - wear0(i)) * t);
          c.lerp(new THREE.Color(1.8, 0.45 + 0.4 * (1 - hot), 0.12), clamp01(hot * 1.1));
          c.lerp(new THREE.Color(0.35, 1.3, 0.7), heatOn * t * 0.9);
          if (sw > 0 && sw < 1) c.addScalar(1.0 * clamp01(1 - Math.abs(x - front) * 0.6));
          im.setColorAt(i, c);
        }
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
      }
      g.rotation.y = -0.3 + 0.1 * Math.sin(f * 0.012);
    };
    return {
      ...done(root, b, upd),
      act: (name, u) => {
        if (name === "escribir") wr = ease(u);
        if (name === "repartir") sw = clamp01(u);
        upd(lf);
      },
    };
  },
};

// celular-orientacion · acelerómetro MEMS visto desde arriba: masa de silicio colgada de resortes y dedos que forman condensadores
export const acelerometro_mems: HeroDef = {
  kind: "primitive",
  when: "Acelerómetro MEMS por dentro: la masa microscópica de silicio colgada de resortes, los dedos que forman condensadores, cómo un celular siente la gravedad y la inclinación, sensor de giro de pantalla, sensor de movimiento, chip que mide empujones.",
  poses: ["plano", "inclinado"],
  actions: {
    inclinar: "El chip se inclina y la masa se desliza cuesta abajo, estirando un resorte y comprimiendo el otro (se queda así): inclinas el celular, la gravedad tira, la masa se desplaza.",
    leer: "Los dedos del condensador destellan: el chip mide cuánto cambia la distancia entre ellos (se queda así): cambia la capacitancia, el chip lo convierte en un número, lee la señal.",
  },
  center: [0, 0.85, 0], radius: 1.7,
  anchors: { hero: [0, 0.9, 0], top: [0, 1.6, 0], base: [0, 0.05, 0], masa: [0, 0.95, 0], dedos: [0, 0.95, 0.5], resorte_izq: [-1.0, 0.9, 0], resorte_der: [1.0, 0.9, 0], paquete: [0, 0.7, 0] },
  build: (_L, pose) => {
    const p = poseOf(acelerometro_mems, pose, "acelerometro_mems");
    const b = bin(), root = new THREE.Group(), tilt = new THREE.Group(), g = new THREE.Group();
    const epoxy = mat(b, "#13162b", { roughness: 0.5, metalness: 0.15 }), steel = mat(b, "#cfd5ea", { roughness: 0.25, metalness: 0.9 });
    const silicon = mat(b, "#3b4a7a", { roughness: 0.3, metalness: 0.45 }), massM = glowMat(b, "#f3c968", 0.35, { roughness: 0.3, metalness: 0.5 });
    const springM = glowMat(b, "#dfe6ff", 0.4, { roughness: 0.3, metalness: 0.7 });
    // paquete negro con patillas y la marca de la patilla 1; dentro, la placa de silicio y su marco
    g.add(place(rbox(b, 3.7, 0.2, 2.8, 0.05, epoxy), [0, 0, 0]), place(rbox(b, 3.3, 0.04, 2.4, 0.03, silicon), [0, 0.12, 0]));
    for (let i = 0; i < 7; i++) [-1, 1].forEach((s) => g.add(place(box(b, 0.1, 0.03, 0.22, steel), [-1.35 + i * 0.45, -0.04, s * 1.5])));
    g.add(place(cyl(b, 0.06, 0.06, 0.012, mat(b, "#3a4166", { roughness: 0.4 }), 16), [-1.6, 0.106, -1.15]));
    // anclajes del marco (fijos) a cada lado y las dos barras de las que salen los dedos fijos
    [-1, 1].forEach((s) => {
      g.add(place(box(b, 0.2, 0.1, 0.9, steel), [s * 1.5, 0.19, 0]));
      g.add(place(box(b, 1.9, 0.07, 0.12, steel), [0, 0.18, s * 0.98]));
    });
    // masa móvil (oro) con 5 dedos a cada lado; su grupo se desliza en x
    const mass = new THREE.Group(); mass.position.y = 0.19;
    mass.add(box(b, 1.5, 0.08, 0.7, massM));
    const xs = [-0.6, -0.3, 0, 0.3, 0.6];
    xs.forEach((x) => [-1, 1].forEach((s) => mass.add(place(box(b, 0.06, 0.06, 0.4, massM), [x, 0, s * 0.54]))));
    g.add(mass);
    // dedos fijos: uno a cada lado de cada dedo móvil (cian a la izquierda, naranja a la derecha); el brillo sube cuanto más cerca
    const fl = glowMat(b, "#4fd8ff", 0.5, { roughness: 0.3, metalness: 0.5 }), fr = glowMat(b, "#ff9a4a", 0.5, { roughness: 0.3, metalness: 0.5 });
    xs.forEach((x) => [-1, 1].forEach((s) => g.add(place(box(b, 0.04, 0.06, 0.4, fl), [x - 0.15, 0.19, s * 0.74]), place(box(b, 0.04, 0.06, 0.4, fr), [x + 0.15, 0.19, s * 0.74]))));
    // resortes en meandro: 2 por lado; se estiran con scale.x desde su anclaje
    const L0 = 0.45, springs = [-1, 1].flatMap((s) => [-0.2, 0.2].map((z) => {
      const sg = new THREE.Group(), pts: P3[] = [[0, 0, 0]];
      for (let k = 0; k < 6; k++) pts.push([(k + 0.5) * L0 / 6, 0, (k % 2 ? -1 : 1) * 0.1]);
      pts.push([L0, 0, 0]);
      for (let k = 0; k < pts.length - 1; k++) sg.add(rod(b, pts[k], pts[k + 1], 0.016, springM));
      sg.position.set(s * 1.4, 0.19, z); sg.userData.s = s; g.add(sg); return sg;
    }));
    tilt.add(g); tilt.position.y = 0.9; g.rotation.set(1.0, -0.25, 0); root.add(tilt); shadows(tilt);
    const glow = halo(b, "rgba(120,220,255,0.9)", 3.2, 0); glow.position.set(0, 1.0, 0.3); root.add(glow);
    let inc = p === "inclinado" ? 1 : 0, rd = 0, lf = 0;
    const upd = (f: number) => {
      lf = f;
      const d = -0.08 * ease(inc) + 0.002 * Math.sin(f * 0.08) * inc;
      mass.position.x = d; tilt.rotation.z = 0.42 * ease(inc);
      springs.forEach((sg) => { const s = sg.userData.s as number, len = L0 + (s < 0 ? d : -d); sg.scale.x = -s * len / L0; });
      const near = (x: number) => 0.5 + 12 * Math.abs(x); // d<0: la masa se acerca a los dedos cian de la izquierda
      (fl.emissive as THREE.Color).copy(col("#4fd8ff")).multiplyScalar(0.5 + near(Math.max(0, -d)) + 1.4 * rd * (0.6 + 0.4 * Math.sin(f * 0.3)));
      (fr.emissive as THREE.Color).copy(col("#ff9a4a")).multiplyScalar(Math.max(0.15, 0.5 - near(Math.max(0, -d))) + 0.9 * rd * (0.6 + 0.4 * Math.sin(f * 0.3 + 2)));
      (glow.material as THREE.MeshBasicMaterial).opacity = 0.5 * rd * (0.7 + 0.3 * Math.sin(f * 0.25));
      tilt.position.y = 0.9 + 0.02 * Math.sin(f * 0.05);
    };
    return {
      ...done(root, b, upd),
      act: (name, u) => { if (name === "inclinar") inc = ease(u); if (name === "leer") rd = ease(u); upd(lf); },
    };
  },
};

// ── internet-bajo-agua · piezas comunes del fondo del mar: cúpula de agua, arena con rocas y algas, peces ──
const seaDome = (b: Bin) => {
  const tex = screenTex(b.track, 8, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#2a8fb8"); gr.addColorStop(0.5, "#0f5283"); gr.addColorStop(1, "#06243f"); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); });
  return new THREE.Mesh(b.track(new THREE.SphereGeometry(60, 24, 16)), b.track(new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false })));
};
const seabed = (b: Bin, R: number, seed: number, skip: (x: number, z: number) => boolean) => {
  const g = new THREE.Group(), sand = mat(b, "#d6bf88", { roughness: 0.95 }), rock = mat(b, "#7d7a74", { roughness: 0.9 }), weedM = mat(b, "#2fae6a", { roughness: 0.7, side: THREE.DoubleSide });
  const disc = cyl(b, R, R * 1.04, 0.14, sand, 56); disc.position.y = -0.06; g.add(disc);
  const far = cyl(b, 55, 55, 0.14, mat(b, "#5f8d96", { roughness: 1 }), 48); far.position.y = -0.07; g.add(far); // suelo lejano: tapa el del entorno
  scatter(18, seed, (r) => [(r() - 0.5) * R * 1.7, 0, (r() - 0.5) * R * 1.7]).forEach(([x, , z], i) => {
    if (Math.hypot(x, z) > R * 0.9 || skip(x, z)) return;
    const m = ball(b, 0.09 + 0.12 * hash1(i + seed), i % 2 ? rock : sand, 10); m.scale.y = 0.5; m.position.set(x, 0.02, z); g.add(m);
  });
  const weeds: THREE.Group[] = [];
  scatter(10, seed + 5, (r) => [(r() - 0.5) * R * 1.7, 0, (r() - 0.5) * R * 1.7]).forEach(([x, , z], i) => {
    if (Math.hypot(x, z) > R * 0.9 || skip(x, z)) return;
    const w = new THREE.Group();
    for (let k = 0; k < 3; k++) { const h = 0.45 + 0.35 * hash1(i * 3 + k + seed), bl = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.035, h, 5)), weedM); bl.position.set((k - 1) * 0.05, h / 2, 0); bl.rotation.z = (k - 1) * 0.18; w.add(bl); }
    w.position.set(x, 0, z); w.userData.ph = i; g.add(w); weeds.push(w);
  });
  return { g, sway: (f: number) => weeds.forEach((w) => { w.rotation.z = 0.14 * Math.sin(f * 0.05 + (w.userData.ph as number)); }) };
};
const fishMesh = (b: Bin, c: string, s: number) => {
  const g = new THREE.Group(), body = glowMat(b, c, 0.25, { roughness: 0.4 }), fin = glowMat(b, col(c).offsetHSL(0, 0, -0.12).getStyle(), 0.2, { side: THREE.DoubleSide });
  const bd = ball(b, 0.5, body, 16); bd.scale.set(1.5, 0.75, 0.5);
  const tail = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.38, 0.55, 4)), fin); tail.rotation.z = -Math.PI / 2; tail.scale.z = 0.3; tail.position.x = -0.95;
  const dorsal = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.2, 0.35, 4)), fin); dorsal.scale.z = 0.25; dorsal.position.set(-0.05, 0.42, 0);
  const eye = place(ball(b, 0.09, mat(b, "#10101c"), 8), [0.5, 0.12, 0.2]);
  g.add(bd, tail, dorsal, eye); g.scale.setScalar(s); g.userData.tail = tail; return g;
};
/** peces que dan vueltas por una elipse: se orientan según la velocidad */
const swim = (fs: THREE.Group[], f: number, A: number, B: number, y0: number) => fs.forEach((m, i) => {
  const w = 0.012 + 0.003 * (i % 3), ph = i * 1.3, a = f * w + ph, x = A * Math.cos(a), z = B * Math.sin(a) * (i % 2 ? 1 : -1);
  m.position.set(x, y0 + 0.25 * Math.sin(i * 2 + f * 0.02) + 0.12 * (i % 3), z);
  const vx = -A * Math.sin(a), vz = B * Math.cos(a) * (i % 2 ? 1 : -1); m.rotation.y = Math.atan2(-vz, vx);
  (m.userData.tail as THREE.Object3D).rotation.y = 0.5 * Math.sin(f * 0.3 + i);
});

// internet-bajo-agua · el cable submarino tendido sobre la arena del fondo, con un repetidor, peces y algas
export const cable_fondo: HeroDef = {
  kind: "primitive",
  when: "Cable submarino de internet tendido en el fondo del océano: datos que cruzan el mar de un continente a otro, el fondo marino con arena, peces y algas, un repetidor en mitad del cable, internet bajo el agua, mensajes y videos que viajan por debajo del mar.",
  poses: ["fondo"],
  actions: { enviar: "Pulsos de luz recorren el cable de un extremo al otro (se queda así): los datos viajan, mensajes, internet, cruza el océano, de un continente a otro." },
  center: [0, 0.5, 0], radius: 1.35,
  anchors: { hero: [0, 0.4, 0], top: [0, 1.7, 0], base: [0, 0.02, 0], cable: [-2.2, 0.15, -0.25], repetidor: [0.3, 0.3, -0.1], pez: [1.2, 1.1, 1.0] },
  build: (_L, pose) => {
    poseOf(cable_fondo, pose, "cable_fondo");
    const b = bin(), root = new THREE.Group();
    root.add(seaDome(b));
    const bed = seabed(b, 4.4, 3, (x, z) => Math.abs(z) < 0.9 && Math.abs(x) < 3.8); root.add(bed.g);
    const pts: P3[] = [[-3.8, 0.07, 0.6], [-2.2, 0.07, -0.25], [-0.9, 0.07, 0.35], [0.3, 0.07, -0.1], [1.7, 0.07, 0.45], [3.8, 0.07, -0.1]];
    const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)));
    root.add(tube(b, pts, 0.14, mat(b, "#7d8aa6", { roughness: 0.55, metalness: 0.25 }), 140));
    // repetidor: cilindro de acero con collares y una luz verde, en el punto 3 del cable
    const rep = new THREE.Group(), steel = mat(b, "#aab4c8", { roughness: 0.3, metalness: 0.9 });
    const rb = cyl(b, 0.26, 0.26, 0.8, steel, 24); rb.rotation.z = Math.PI / 2; rep.add(rb);
    [-0.31, 0.31].forEach((x) => { const c = cyl(b, 0.2, 0.2, 0.08, mat(b, "#4d566b", { metalness: 0.7, roughness: 0.4 }), 24); c.rotation.z = Math.PI / 2; c.position.x = x; rep.add(c); });
    [-0.12, 0.12].forEach((x) => { const c = cyl(b, 0.18, 0.18, 0.03, mat(b, "#e3b04a", { metalness: 0.6, roughness: 0.4 }), 24); c.rotation.z = Math.PI / 2; c.position.x = x; rep.add(c); });
    rep.add(place(ball(b, 0.03, beam(b, "#6bff9c", 2), 8), [0, 0.17, 0]));
    rep.position.set(pts[3][0], 0.19, pts[3][2]); rep.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), curve.getTangent(0.6).setY(0).normalize()); root.add(rep); shadows(rep);
    const fish = ["#ffb347", "#ff6f61", "#7dd3fc", "#ffd166", "#f78fb3", "#9be564"].map((c, i) => { const m = fishMesh(b, c, 0.3 + 0.04 * (i % 3)); root.add(m); return m; });
    const dots = Array.from({ length: 8 }, () => { const d = ball(b, 0.11, beam(b, "#9fefff", 2.6), 10); d.visible = false; root.add(d); return d; });
    let send = 0, lf = 0;
    const upd = (f: number) => {
      lf = f; bed.sway(f); swim(fish, f, 2.6, 1.5, 0.9);
      dots.forEach((d, i) => { d.visible = send > 0.01; if (d.visible) { const t = ((f * 0.0065 + i / dots.length) % 1); d.position.copy(curve.getPointAt(t)).y += 0.05; d.scale.setScalar(0.7 + 0.5 * send); } });
    };
    return { ...done(root, b, upd), act: (name, u) => { if (name === "enviar") send = ease(u); upd(lf); } };
  },
};

// internet-bajo-agua · corte de un cable submarino con sus capas (fibras, tubo de acero, cobre, aislante, funda) y, al lado, una manguera de jardín
export const cable_corte: HeroDef = {
  kind: "primitive",
  when: "Cable submarino de fibra óptica visto por dentro y por fuera: sus capas (funda de plástico, cobre, alambres de acero, fibras de colores), cuánto mide de grueso (como una manguera de jardín), la armadura de acero cerca de la costa, los pulsos de luz que llevan los datos.",
  poses: ["corte", "manguera", "armado"],
  actions: { pulsos: "Pulsos de luz salen disparados por las fibras y destellan en sus puntas (se queda así): los datos viajan como luz, pulsos de luz, fibra óptica, velocidad de la luz." },
  center: [0.8, 0.4, -0.2], radius: 0.9,
  anchors: { hero: [0, 0.4, 0], top: [0, 1.0, 0], base: [0, 0.02, 0], fibras: [2.2, 0.4, 0], funda: [-1.0, 0.4, 0], cobre: [0.9, 0.4, 0], armadura: [-0.9, 0.7, 0], manguera: [0, 0.4, -1.2] },
  build: (_L, pose) => {
    const p = poseOf(cable_corte, pose, "cable_corte"), arm = p === "armado", whole = p === "manguera";
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const X0 = -1.9, R = 0.34, outerR = arm ? 0.55 : R;
    const sheath = mat(b, "#2a2f3a", { roughness: 0.6 }), ins = mat(b, "#efe7d2", { roughness: 0.5 }), cu = mat(b, "#cf7a3e", { metalness: 0.9, roughness: 0.3 }), steel = mat(b, "#cfd5ea", { roughness: 0.25, metalness: 0.9 });
    const along = (r: number, x1: number, m: THREE.Material) => { const c = cyl(b, r, r, x1 - X0, m, 40); c.rotation.z = Math.PI / 2; c.position.set((X0 + x1) / 2, 0, 0); return c; };
    const e = (x: number, k: number) => (whole ? 1.7 + 0.004 * k : x); // pose manguera: cable entero con anillos visibles en la punta
    g.add(along(R, e(0.45, 0), sheath), along(0.27, e(0.75, 1), ins), along(0.21, e(1.05, 2), cu));
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, w = along(0.032, e(1.3, 3), steel); w.position.set(0, 0.155 * Math.cos(a), 0.155 * Math.sin(a)); g.add(w); }
    g.add(along(0.11, e(1.55, 4), mat(b, "#8b94ab", { metalness: 0.9, roughness: 0.3 })), along(0.085, e(1.62, 5), glowMat(b, "#7fe0ff", 0.5, { roughness: 0.3 })));
    if (arm) { // armadura: capa de relleno y 20 alambres de acero trenzados
      g.add(along(0.41, -0.1, mat(b, "#3b2f26", { roughness: 0.9 })));
      for (let i = 0; i < 20; i++) {
        const a0 = (i / 20) * Math.PI * 2; let prev: P3 | null = null;
        for (let k = 0; k <= 8; k++) { const x = X0 + (-0.3 - X0) * (k / 8), a = a0 + x * 0.9, q: P3 = [x, 0.47 * Math.cos(a), 0.47 * Math.sin(a)]; if (prev) g.add(rod(b, prev, q, 0.07, steel)); prev = q; }
      }
    }
    // fibras de colores que salen del tubo abiertas en abanico (código de colores real) y sus pulsos
    const fibreC = ["#2d7bff", "#ff8a1f", "#35c46b", "#8a5a2b", "#aab3c4", "#f2f2f2"], tails: THREE.CatmullRomCurve3[] = [], tips: THREE.Mesh[] = [];
    if (!whole) fibreC.forEach((c, i) => {
      const a = (i / 6) * Math.PI * 2, d: P3 = [0, 0.26 * Math.cos(a), 0.26 * Math.sin(a)], q: P3[] = [[1.55, 0.04 * Math.cos(a), 0.04 * Math.sin(a)], [1.95, d[1] * 0.5, d[2] * 0.5], [2.45, d[1], d[2]]];
      g.add(tube(b, q, 0.03, glowMat(b, c, 0.9, { roughness: 0.3 }), 24));
      tails.push(new THREE.CatmullRomCurve3(q.map((v) => new THREE.Vector3(...v))));
      const tip = ball(b, 0.06, beam(b, "#ffffff", 1.4), 10); tip.position.set(...q[2]); g.add(tip); tips.push(tip);
    });
    g.position.y = outerR; g.position.z = whole ? 0.5 : 0; root.add(g);
    if (whole) { // manguera de jardín: tubo verde con acople de latón y pistola de riego roja
      const hose = tube(b, [[X0, R, -1.35], [-0.9, R, -0.95], [0.1, R, -1.45], [1.45, R, -1.2]], R, mat(b, "#4cbf5c", { roughness: 0.6 }), 60); root.add(hose);
      const brass = mat(b, "#c8a24a", { metalness: 0.8, roughness: 0.35 }), red = mat(b, "#d94b3a", { roughness: 0.5 });
      const piece = (r: number, len: number, x: number, m: THREE.Material, sides = 20) => { const c = cyl(b, r, r, len, m, sides); c.rotation.z = Math.PI / 2; c.position.set(x, R, -1.2); root.add(c); };
      piece(0.4, 0.3, 1.55, brass, 6); piece(0.34, 0.12, 1.75, brass); piece(0.3, 0.55, 2.05, red);
      const tip = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.2, 0.3, 20)), red); tip.rotation.z = -Math.PI / 2; tip.position.set(2.45, R, -1.2); root.add(tip);
    }
    shadows(root);
    const dots = Array.from({ length: 12 }, (_, i) => { const d = ball(b, 0.065, beam(b, "#ffffff", 2.8), 10); d.visible = false; d.userData.k = i % 6; g.add(d); return d; });
    const streaks = Array.from({ length: 6 }, () => { const s = place(box(b, 0.5, 0.03, 0.09, beam(b, "#9fefff", 2.6)), [0, outerR + 0.012, 0]); s.visible = false; g.add(s); return s; });
    let pl = 0, lf = 0;
    const upd = (f: number) => {
      lf = f;
      dots.forEach((d, i) => { d.visible = pl > 0.01 && tails.length > 0; if (d.visible) d.position.copy(tails[d.userData.k as number].getPointAt(((f * 0.012 + i / 6) % 1))); });
      streaks.forEach((s, i) => { s.visible = pl > 0.01 && !whole && !arm; s.position.x = X0 + ((f * 0.03 + i / 6 * 3.6) % 3.6); s.position.z = 0.26 * Math.sin(i * 2.1); s.position.y = Math.sqrt(Math.max(0, R * R - s.position.z ** 2)) + 0.012; });
      tips.forEach((t, i) => t.scale.setScalar(1 + pl * (0.8 + 0.7 * Math.sin(f * 0.4 + i * 1.7))));
    };
    return { ...done(root, b, upd), act: (name, u) => { if (name === "pulsos") pl = ease(u); upd(lf); } };
  },
};

// internet-bajo-agua · la Tierra con los cables submarinos que unen los continentes y pulsos de luz que los recorren
const LAND: [number, number][][] = [
  [[-168, 66], [-140, 70], [-95, 72], [-80, 68], [-62, 58], [-55, 48], [-70, 42], [-76, 35], [-81, 25], [-97, 26], [-97, 20], [-87, 21], [-83, 10], [-78, 8], [-90, 14], [-106, 22], [-112, 30], [-118, 34], [-124, 40], [-130, 52], [-150, 60], [-165, 62]],
  [[-55, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 76]],
  [[-78, 8], [-60, 11], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -45], [-70, -54], [-75, -48], [-73, -30], [-70, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-2, 48], [5, 53], [10, 58], [20, 70], [40, 68], [70, 73], [100, 78], [140, 72], [170, 68], [160, 58], [142, 52], [140, 40], [122, 30], [120, 22], [108, 10], [100, 3], [104, 1], [98, 15], [90, 22], [80, 12], [72, 20], [58, 24], [48, 30], [36, 36], [28, 41], [20, 40], [12, 38], [5, 43]],
  [[35, 30], [56, 26], [59, 22], [44, 12], [38, 20]],
  [[-17, 21], [-6, 36], [10, 37], [32, 31], [43, 12], [51, 12], [40, -5], [40, -15], [33, -26], [20, -35], [13, -25], [12, -5], [9, 4], [-8, 4], [-17, 14]],
  [[114, -22], [130, -12], [142, -11], [153, -26], [146, -39], [132, -33], [115, -34]],
  [[-5, 50], [2, 52], [0, 58], [-6, 58]], [[130, 32], [141, 36], [142, 44], [134, 35]],
];
const ll = (lat: number, lon: number, r = 1): THREE.Vector3 => { const a = lat * Math.PI / 180, o = lon * Math.PI / 180; return new THREE.Vector3(Math.cos(o) * Math.cos(a), Math.sin(a), -Math.sin(o) * Math.cos(a)).multiplyScalar(r); };
const CITIES: Record<string, [number, number]> = { ny: [40.7, -74], lon: [51.5, -0.1], lis: [38.7, -9.1], for: [-3.7, -38.5], mia: [25.8, -80.2], la: [34, -118], tok: [35.7, 139.7], syd: [-33.9, 151.2], mum: [19, 72.8], mar: [43.3, 5.4], sin: [1.3, 103.8], cpt: [-33.9, 18.4], lag: [6.5, 3.4], hk: [22.3, 114.2] };
const LINKS: [string, string][] = [["ny", "lon"], ["ny", "lis"], ["mia", "for"], ["for", "lis"], ["la", "tok"], ["syd", "la"], ["mum", "mar"], ["sin", "mum"], ["cpt", "lag"], ["lag", "lis"], ["hk", "la"], ["sin", "syd"], ["for", "lag"]];

export const globo_cables: HeroDef = {
  kind: "primitive",
  when: "La Tierra con los cables submarinos de internet que unen los continentes: la red mundial de fibra por el fondo del mar, cables que cruzan el Atlántico y el Pacífico, el tráfico de datos entre continentes, más de un millón de kilómetros de cable, internet global.",
  poses: ["cables"],
  actions: {
    trafico: "Los pulsos de luz se multiplican y los cables brillan más (se queda así): muchísimos datos, el tráfico de internet, casi todo pasa por aquí, el noventa y nueve por ciento.",
  },
  center: [0, 0.95, 0], radius: 1.05,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.3, 0], base: [0, 0.1, 0], atlantico: [-0.45, 1.5, 0.95], pacifico: [0.9, 1.2, -0.3] },
  build: (_L, pose) => {
    poseOf(globo_cables, pose, "globo_cables");
    const b = bin(), root = new THREE.Group(), globe = new THREE.Group();
    const W = 1024, H = 512, tex = screenTex(b.track, W, H, (c) => {
      const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#2b7cc4"); gr.addColorStop(1, "#1b5c9e"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = "#eef6ff"; c.fillRect(0, H * (90 - -90) / 180 - H * 0.07, W, H * 0.07);
      c.fillStyle = "#58b06a"; c.strokeStyle = "#8fd69a"; c.lineWidth = 3;
      LAND.forEach((poly) => { c.beginPath(); poly.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * W, y = (90 - la) / 180 * H; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill(); c.stroke(); });
    });
    const sph = new THREE.Mesh(b.track(new THREE.SphereGeometry(1, 64, 48)), mat(b, "#ffffff", { map: tex, emissive: new THREE.Color("#ffffff"), emissiveMap: tex, emissiveIntensity: 0.28, roughness: 0.7 }));
    globe.add(sph, new THREE.Mesh(b.track(new THREE.SphereGeometry(1.045, 40, 28)), ghostMat(b, "#7fd0ff", 0.13)));
    const cableM = beam(b, "#6fe6ff", 1.5), curves: THREE.CatmullRomCurve3[] = [];
    LINKS.forEach(([a, c]) => {
      const A = ll(...CITIES[a]), B = ll(...CITIES[c]), ang = A.angleTo(B), pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24, q = new THREE.Vector3().copy(A).multiplyScalar(Math.sin((1 - t) * ang)).add(B.clone().multiplyScalar(Math.sin(t * ang))).multiplyScalar(1 / Math.sin(ang)); pts.push(q.normalize().multiplyScalar(1.012 + 0.05 * Math.sin(Math.PI * t))); }
      const cv = new THREE.CatmullRomCurve3(pts); curves.push(cv);
      globe.add(new THREE.Mesh(b.track(new THREE.TubeGeometry(cv, 48, 0.0085, 6, false)), cableM));
    });
    Object.values(CITIES).forEach((c) => { const d = ball(b, 0.024, beam(b, "#ffd166", 1.8), 8); d.position.copy(ll(c[0], c[1], 1.015)); globe.add(d); });
    const dots = curves.flatMap((cv, i) => [0, 1].map((k) => { const d = ball(b, 0.035, beam(b, "#ffffff", 2.8), 8); d.userData = { cv, off: (i * 0.37 + k * 0.5) % 1 }; globe.add(d); return d; }));
    globe.position.y = 1.2; globe.rotation.set(0.35, -Math.PI / 3, 0); root.add(globe);
    let tr = 0, lf = 0;
    const upd = (f: number) => {
      lf = f; globe.rotation.y = -Math.PI / 3 - 0.009 * f;
      dots.forEach((d) => { const t = (d.userData.off + f * (0.008 + 0.006 * tr)) % 1; d.position.copy((d.userData.cv as THREE.CatmullRomCurve3).getPointAt(t)); d.scale.setScalar(1 + 0.9 * tr); });
      cableM.color.copy(col("#6fe6ff")).multiplyScalar(1.5 + 1.3 * tr);
    };
    return { ...done(root, b, upd), act: (name, u) => { if (name === "trafico") tr = ease(u); upd(lf); } };
  },
};

// internet-bajo-agua · barco que arrastra el ancla (o una red de arrastre) por el fondo y engancha un cable submarino
const setRod = (m: THREE.Mesh, a: THREE.Vector3, c: THREE.Vector3) => { m.position.copy(a).add(c).multiplyScalar(0.5); m.scale.y = Math.max(0.001, a.distanceTo(c)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize()); };
export const ancla_barco: HeroDef = {
  kind: "primitive",
  when: "Barco que arrastra el ancla por el fondo del mar o una red de pesca de arrastre y engancha un cable submarino hasta romperlo: lo que de verdad daña los cables de internet, averías de cables, anclas de barcos, redes de pesca, pesca de arrastre.",
  poses: ["ancla", "pesca"],
  actions: { enganchar: "El barco avanza, el ancla (o la red) araña el fondo, engancha el cable, lo tensa y lo parte con una chispa roja (se queda así): arrastra, engancha, rompe el cable, daña, avería." },
  center: [0, 0.75, 0], radius: 1.25,
  anchors: { hero: [0, 1.0, 0], top: [0, 2.6, 0], base: [0, 0.02, 0], cable: [0, 0.1, 0], barco: [0, 2.2, 0], ancla: [0.4, 0.3, 0], red: [-0.8, 0.3, 0], rotura: [0, 0.2, 0] },
  build: (_L, pose) => {
    const p = poseOf(ancla_barco, pose, "ancla_barco"), trawl = p === "pesca";
    const b = bin(), root = new THREE.Group(), D = 2.0;
    root.add(seaDome(b));
    const bed = seabed(b, 4.6, 7, (x, z) => Math.abs(x) < 0.8 || (trawl && Math.abs(z) < 1)); root.add(bed.g);
    const surface = cyl(b, 4.6, 4.6, 0.03, ghostMat(b, "#8fdcff", 0.32), 48); surface.position.y = D; root.add(surface);
    // casco (vista en planta extruida), contenedores, puente de mando y chimenea
    const sh = new THREE.Shape(); sh.moveTo(-1.2, -0.34); sh.lineTo(0.7, -0.34); sh.quadraticCurveTo(1.15, -0.2, 1.4, 0); sh.quadraticCurveTo(1.15, 0.2, 0.7, 0.34); sh.lineTo(-1.2, 0.34); sh.closePath();
    const ship = new THREE.Group(), hull = new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(sh, { depth: 0.38, bevelEnabled: false })), mat(b, "#b23a34", { roughness: 0.55 }));
    hull.rotation.x = -Math.PI / 2; hull.position.y = -0.16; ship.add(hull);
    ship.add(place(box(b, 2.5, 0.05, 0.62, mat(b, "#8d96a8", { roughness: 0.6 })), [0.05, 0.225, 0]));
    const cols = ["#e24b3b", "#3b7de2", "#f2b134", "#35a86b", "#8f5fe0"];
    for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) for (let h = 0; h < (i % 2 ? 1 : 2); h++) ship.add(place(box(b, 0.26, 0.17, 0.2, mat(b, cols[(i * 2 + k + h) % 5], { roughness: 0.6 })), [-0.2 + i * 0.3, 0.33 + h * 0.18, (k - 0.5) * 0.24]));
    ship.add(place(box(b, 0.42, 0.5, 0.52, mat(b, "#f0f2f7", { roughness: 0.5 })), [-0.9, 0.5, 0]), place(box(b, 0.44, 0.07, 0.54, mat(b, "#27304a", { roughness: 0.4 })), [-0.9, 0.62, 0]));
    const fun = cyl(b, 0.08, 0.1, 0.3, mat(b, "#d94b3a", { roughness: 0.5 }), 14); fun.position.set(-1.0, 0.9, 0); ship.add(fun, rod(b, [-0.9, 0.75, 0], [-0.9, 1.05, 0], 0.015, mat(b, "#aab4c8")));
    ship.position.y = D; root.add(ship); shadows(ship);
    // cable a lo ancho del fondo (perpendicular al avance); se reconstruye al tensarse y al romperse
    const cx = trawl ? 0 : 0.1, cableM = mat(b, "#6a7690", { roughness: 0.55, metalness: 0.25 }), cableG = new THREE.Group(); root.add(cableG);
    const sparkM = beam(b, "#ff5a3c", 2.2), spark = halo(b, "rgba(255,110,70,0.95)", 1.6, 0); spark.position.set(cx, 0.2, 0); spark.rotation.y = 0; root.add(spark);
    const tips = [-1, 1].map(() => { const t = ball(b, 0.06, sparkM, 8); t.visible = false; root.add(t); return t; });
    let keyOld = "";
    const rebuild = (dx: number, gap: number) => {
      const key = dx.toFixed(3) + gap.toFixed(3); if (key === keyOld) return; keyOld = key;
      cableG.children.slice().forEach((c) => { (c as THREE.Mesh).geometry.dispose(); cableG.remove(c); });
      const half = (sign: number) => { const q: P3[] = []; for (let z = gap; z <= 3.8; z += 0.25) q.push([cx + dx * Math.exp(-((z / 0.8) ** 2)), 0.07, sign * z]); return q; };
      [-1, 1].forEach((s, i) => { const q = half(s); if (gap > 0) q.unshift([cx + dx * Math.exp(-((gap / 0.8) ** 2)), 0.07, s * gap]); else if (s > 0) q.unshift([cx + dx, 0.07, 0]); if (gap > 0 || s > 0) cableG.add(tube(b, q, 0.11, cableM, 60)); tips[i].visible = gap > 0; tips[i].position.set(q[0][0], 0.09, q[0][2]); });
    };
    // ancla (cabeza, caña, cepo, uñas) o red de arrastre (cono de malla, tablas, flotadores)
    const anchor = new THREE.Group(), irn = mat(b, "#3a4156", { roughness: 0.45, metalness: 0.8 }), net = new THREE.Group(), boards: THREE.Mesh[] = [], warps: THREE.Mesh[] = [], links: THREE.Mesh[] = [];
    if (!trawl) {
      anchor.add(place(cyl(b, 0.03, 0.03, 0.6, irn, 10), [0, 0.3, 0]), place(box(b, 0.34, 0.04, 0.04, irn), [0, 0.52, 0]));
      const crown = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.25, 0.035, 8, 20, Math.PI)), irn); crown.rotation.z = Math.PI; anchor.add(crown);
      [-1, 1].forEach((s) => { const fl = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.09, 0.22, 4)), irn); fl.position.set(s * 0.27, 0.06, 0); fl.rotation.z = -s * 0.9; anchor.add(fl); });
      anchor.add(new THREE.Mesh(b.track(new THREE.TorusGeometry(0.06, 0.015, 6, 12)), irn)); anchor.children[anchor.children.length - 1].position.y = 0.66;
      root.add(anchor); shadows(anchor);
      for (let i = 0; i < 26; i++) { const l = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.06, 0.02, 6, 10)), irn); links.push(l); root.add(l); }
    } else {
      const cone = new THREE.ConeGeometry(0.5, 1.7, 14, 6, true), meshM = ghostMat(b, "#e9f3ee", 0.35), wire = b.track(new THREE.MeshBasicMaterial({ color: "#f4fbf6", wireframe: true, transparent: true, opacity: 0.8 }));
      const body = new THREE.Mesh(b.track(cone), meshM), wf = new THREE.Mesh(cone, wire); [body, wf].forEach((m) => { m.rotation.z = Math.PI / 2; m.position.x = -0.85; net.add(m); });
      net.scale.y = 0.55; net.scale.x = 1.4; net.scale.z = 1.5;
      const netW = new THREE.Group(); netW.add(net);
      [-0.4, -0.2, 0, 0.2, 0.4].forEach((z) => netW.add(place(ball(b, 0.045, mat(b, "#ff7a1a", { roughness: 0.5 }), 8), [0, 0.3, z])));
      [-1, 1].forEach((s) => { const bd = box(b, 0.05, 0.38, 0.28, mat(b, "#7a4e2d", { roughness: 0.8 })); bd.position.set(0.05, 0.19, s * 0.62); bd.rotation.y = s * 0.35; netW.add(bd); boards.push(bd); const w = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.012, 0.012, 1, 6)), irn); warps.push(w); root.add(w); });
      anchor.add(netW); root.add(anchor); shadows(anchor);
    }
    let prog = 0, lf = 0;
    const upd = (f: number) => {
      lf = f; bed.sway(f);
      const c = -0.8 + 1.9 * prog, sx = trawl ? c + 2.0 : c - 0.9, bob = 0.025 * Math.sin(f * 0.06);
      ship.position.set(sx, D + bob, 0); ship.rotation.z = 0.02 * Math.sin(f * 0.05);
      const pull = Math.max(0, c - cx), snapAt = 0.34, snapped = pull > snapAt, rel = clamp01((pull - snapAt) / 0.5);
      rebuild(snapped ? snapAt * (1 - ease(rel)) : Math.min(pull, snapAt), snapped ? 0.1 + 0.55 * ease(rel) : 0);
      (spark.material as THREE.MeshBasicMaterial).opacity = snapped ? 0.9 * (1 - rel) : 0; spark.scale.setScalar(0.6 + 1.4 * rel); spark.position.set(cx, 0.25, 0);
      if (!trawl) {
        anchor.position.set(c, 0.45, 0); anchor.rotation.z = -0.45; anchor.scale.setScalar(1.8);
        const H = new THREE.Vector3(sx + 1.28, D - 0.05, 0), A = new THREE.Vector3(c, 1.0, 0), C = new THREE.Vector3(c + 0.4, 1.0, 0);
        links.forEach((l, i) => { const t = i / (links.length - 1), q = new THREE.Vector3().copy(H).multiplyScalar((1 - t) ** 2).add(C.clone().multiplyScalar(2 * (1 - t) * t)).add(A.clone().multiplyScalar(t * t)); l.position.copy(q); const tg = H.clone().multiplyScalar(-2 * (1 - t)).add(C.clone().multiplyScalar(2 - 4 * t)).add(A.clone().multiplyScalar(2 * t)).normalize(); l.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tg); l.rotateX(i % 2 ? Math.PI / 2 : 0); });
      } else {
        anchor.position.set(c, 0.04, 0); anchor.rotation.set(0, 0, 0);
        const stern = [-1, 1].map((s) => new THREE.Vector3(sx - 1.2, D - 0.05, s * 0.18));
        warps.forEach((w, i) => { const s = i ? 1 : -1; setRod(w, stern[i], new THREE.Vector3(c + 0.05 + (boards[i].position.x - 0.05), 0.19, s * 0.62)); });
      }
    };
    return { ...done(root, b, upd), act: (name, u) => { if (name === "enganchar") prog = ease(u); upd(lf); } };
  },
};

// internet-bajo-agua · satélite de comunicaciones geoestacionario: cuerpo con manta térmica dorada, alas solares con celdas, dos antenas parabólicas, bocinas hacia la Tierra y buscador de estrellas
export const satelite_geo: HeroDef = {
  kind: "primitive",
  when: "Satélite de comunicaciones geoestacionario con alas solares, antenas parabólicas y manta térmica dorada: internet por satélite, señal que sube y baja, retardo de la señal, satélites a miles de kilómetros, antenas en el espacio, órbita geoestacionaria, TV y llamadas por satélite.",
  poses: ["orbita"],
  center: [0, 1.15, 0], radius: 1.7,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.3, 0], base: [0, 0.1, 0], panel: [1.9, 1.4, 0], antena: [0.0, 1.95, 0.8], senal: [0, 0.6, 0], bocinas: [0, 1.0, 0] },
  build: (_L, pose) => {
    poseOf(satelite_geo, pose, "satelite_geo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), sat = new THREE.Group();
    const foilTex = screenTex(b.track, 256, 256, (c) => {
      c.fillStyle = "#d9a441"; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 160; i++) { const x = hash1(i + 1) * 256, y = hash1(i + 7) * 256, r = 14 + hash1(i + 13) * 30, a = hash1(i + 19) * 6.28, t = hash1(i + 23); c.fillStyle = t < 0.5 ? "rgba(255,226,140,0.35)" : "rgba(150,90,20,0.30)"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x + Math.cos(a + 2) * r, y + Math.sin(a + 2) * r); c.closePath(); c.fill(); }
    });
    const cellTex = screenTex(b.track, 128, 256, (c) => {
      c.fillStyle = "#14307a"; c.fillRect(0, 0, 128, 256); c.strokeStyle = "#8da6e6"; c.lineWidth = 2;
      for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, 256); c.stroke(); }
      for (let j = 0; j <= 8; j++) { c.beginPath(); c.moveTo(0, j * 32); c.lineTo(128, j * 32); c.stroke(); }
      c.strokeStyle = "#cfd8f5"; c.lineWidth = 4; c.strokeRect(2, 2, 124, 252);
    });
    const foil = mat(b, "#ffffff", { map: foilTex, metalness: 0.7, roughness: 0.35, emissive: new THREE.Color("#5a3a08"), emissiveIntensity: 0.5 });
    const panelM = mat(b, "#ffffff", { map: cellTex, metalness: 0.35, roughness: 0.3, emissive: new THREE.Color("#0a1f60"), emissiveIntensity: 0.55 });
    const silver = mat(b, "#cfd5ea", { metalness: 0.85, roughness: 0.3 }), dark = mat(b, "#2a2f4a", { metalness: 0.6, roughness: 0.4 }), white = mat(b, "#eef0f7", { metalness: 0.3, roughness: 0.4 });
    sat.add(place(box(b, 0.9, 0.8, 0.9, foil), [0, 0, 0]));
    sat.add(place(box(b, 0.7, 0.03, 0.7, white), [0, 0.415, 0])); // radiador blanco arriba
    for (let i = 0; i < 6; i++) sat.add(place(box(b, 0.62, 0.012, 0.025, dark), [0, 0.435, -0.25 + i * 0.1]));
    [-1, 1].forEach((s) => sat.add(place(box(b, 0.92, 0.03, 0.03, silver), [0, s * 0.4, 0.46]), place(box(b, 0.92, 0.03, 0.03, silver), [0, s * 0.4, -0.46])));
    // alas solares: brazo, bisagras y tres paneles por lado
    [-1, 1].forEach((s) => {
      sat.add(rod(b, [s * 0.45, 0, 0], [s * 0.78, 0, 0], 0.035, silver));
      for (let k = 0; k < 3; k++) { const x = s * (0.82 + 0.5 * k + 0.3); sat.add(place(box(b, 0.46, 0.03, 1.15, panelM), [x, 0, 0])); if (k < 2) sat.add(place(box(b, 0.04, 0.04, 0.2, silver), [x + s * 0.25, 0, 0])); }
      sat.add(place(box(b, 0.04, 0.05, 0.2, silver), [s * 0.8, 0, 0]));
    });
    // dos antenas parabólicas a los lados (+z, -z) con su bocina en el foco y tres puntales
    const dishes = [-1, 1].map((s) => {
      const d = new THREE.Group(), cap = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.4, 28, 12, 0, Math.PI * 2, 0, 0.95)), mat(b, "#f3f5fb", { side: THREE.DoubleSide, metalness: 0.4, roughness: 0.35 }));
      cap.scale.y = 0.6; cap.position.y = -0.15; d.add(cap, place(cyl(b, 0.04, 0.04, 0.2, silver, 10), [0, -0.12, 0]));
      d.add(place(cyl(b, 0.012, 0.045, 0.14, dark, 10), [0, 0.2, 0]));
      [0, 1, 2].forEach((i) => { const a = i * 2.094; d.add(rod(b, [Math.cos(a) * 0.3, 0.04, Math.sin(a) * 0.3], [0, 0.2, 0], 0.008, silver)); });
      d.position.set(0, 0.1, s * 0.78); d.rotation.x = s * 1.05; sat.add(d, rod(b, [0, 0.0, s * 0.45], [0, 0.0, s * 0.72], 0.03, silver)); return d;
    });
    // bocinas de cobertura hacia la Tierra (abajo), buscador de estrellas arriba y tobera trasera
    for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.1, 0.22, 12, 1, true)), mat(b, "#e8ebf6", { side: THREE.DoubleSide, metalness: 0.5, roughness: 0.3 })); h.rotation.x = Math.PI; h.position.set(-0.28 + (i % 3) * 0.28, -0.5, -0.17 + Math.floor(i / 3) * 0.34); sat.add(h); }
    sat.add(place(cyl(b, 0.07, 0.09, 0.2, dark, 14), [-0.25, 0.52, 0.2]), place(cyl(b, 0.05, 0.05, 0.03, glowMat(b, "#7fd0ff", 0.6), 12), [-0.25, 0.63, 0.2]));
    const noz = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.12, 0.2, 14, 1, true)), mat(b, "#b57b3a", { side: THREE.DoubleSide, metalness: 0.8, roughness: 0.35 })); noz.rotation.x = -Math.PI / 2; noz.position.set(0.2, -0.1, -0.56); sat.add(noz);
    const sig = [0, 1, 2].map(() => new THREE.Mesh(b.track(new THREE.TorusGeometry(0.4, 0.015, 6, 36)), beam(b, TONE.cyan, 1.5, { transparent: true, opacity: 0.8 }))); sig.forEach((s) => { s.rotation.x = Math.PI / 2; sat.add(s); });
    g.add(sat); g.position.y = 1.4; root.add(g); shadows(g);
    return done(root, b, (f) => {
      sat.rotation.set(0.28, f * 0.012, 0.16 * Math.sin(f * 0.02));
      sig.forEach((s, i) => { const t = (f * 0.012 + i / 3) % 1; s.position.y = -0.55 - t * 1.3; s.scale.setScalar(0.3 + t * 1.5); (s.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t); });
      dishes.forEach((d, i) => { d.rotation.z = 0.05 * Math.sin(f * 0.03 + i); });
      sat.position.y = 0.06 * Math.sin(f * 0.04);
    });
  },
};

// metal-madera-frio · bloque de aluminio cepillado y bloque de madera con veta sobre una mesa, cada uno con su termómetro: marcan lo mismo
export const bloques_metal_madera: HeroDef = {
  kind: "primitive",
  when: "Dos materiales a la misma temperatura: un bloque de metal y uno de madera sobre una mesa con termómetro cada uno; metal frente a madera, por qué marcan lo mismo, temperatura ambiente, el mito de que el metal está más frío.",
  poses: ["mesa"],
  actions: {
    igualar: "Los dos termómetros suben juntos al mismo nivel y aparece el signo igual (se queda así): misma temperatura, marcan lo mismo, igual, ambiente, equilibrio.",
  },
  center: [0, 0.85, 0.1], radius: 1.4,
  anchors: { hero: [0, 0.95, 0.1], top: [0, 2.1, 0], base: [0, 0.05, 0], metal: [-1.15, 0.8, 0], madera: [1.15, 0.8, 0], term_metal: [-1.15, 0.85, 1.0], term_madera: [1.15, 0.85, 1.0], igual: [0, 1.4, 1.0] },
  build: (_L, pose) => {
    poseOf(bloques_metal_madera, pose, "bloques_metal_madera");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    // mesa: tablero oscuro con cuatro patas cortas
    const tableM = mat(b, "#3a4259", { roughness: 0.7 });
    g.add(place(box(b, 5.2, 0.14, 2.6, tableM), [0, 0.17, 0.2]));
    for (const sx of [-2.3, 2.3]) for (const sz of [-0.9, 1.3]) g.add(place(box(b, 0.16, 0.12, 0.16, tableM), [sx, 0.06, sz]));
    const top = 0.24, H = 1.1;
    // aluminio cepillado: gris claro con rayas finas horizontales
    const brushed = screenTex(b.track, 256, 256, (c) => {
      const gr = c.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, "#dfe3ec"); gr.addColorStop(0.5, "#b9c0cf"); gr.addColorStop(1, "#d3d8e3"); c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 90; i++) { const y = (i * 37) % 256, a = 0.05 + 0.1 * ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 0.12; c.fillStyle = i % 2 ? `rgba(255,255,255,${a})` : `rgba(80,90,110,${a})`; c.fillRect(0, y, 256, 1.5); }
    });
    const metalM = b.track(new THREE.MeshStandardMaterial({ map: brushed, metalness: 0.75, roughness: 0.32, emissive: new THREE.Color("#8892aa").multiplyScalar(0.25) }));
    const metalBlock = new THREE.Mesh(b.track(new RoundedBoxGeometry(1.6, H, 1.2, 4, 0.06)), metalM); metalBlock.position.set(-1.2, top + H / 2, 0);
    // madera: veta con anillos y nudos pintados
    const grain = screenTex(b.track, 256, 256, (c) => {
      c.fillStyle = "#a96f3b"; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 46; i++) { const y = i * 5.6, w = 0.6 + ((i * 7) % 5) * 0.35; c.strokeStyle = i % 3 ? "rgba(92,52,22,0.55)" : "rgba(214,160,100,0.45)"; c.lineWidth = w; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(70, y + 7 * Math.sin(i), 170, y - 8 * Math.cos(i * 1.3), 256, y + 3); c.stroke(); }
      c.fillStyle = "rgba(70,38,16,0.7)"; c.beginPath(); c.ellipse(170, 120, 14, 8, 0.2, 0, 6.3); c.fill();
    });
    const woodM = b.track(new THREE.MeshStandardMaterial({ map: grain, roughness: 0.8, emissive: new THREE.Color("#6a3d18").multiplyScalar(0.25) }));
    const woodBlock = new THREE.Mesh(b.track(new RoundedBoxGeometry(1.6, H, 1.2, 4, 0.06)), woodM); woodBlock.position.set(1.2, top + H / 2, 0);
    g.add(metalBlock, woodBlock);
    // termómetros: tubo de cristal, bulbo, columna roja y marcas; los dos con el mismo nivel
    const colM = beam(b, "#ff4a3a", 1.5);
    const fluids = [-1.2, 1.2].map((x) => {
      const t = new THREE.Group(); t.position.set(x, top, 1.05); t.scale.setScalar(1.45);
      t.add(place(cyl(b, 0.075, 0.075, 1.0, ghostMat(b, "#dfeaff", 0.35), 16), [0, 0.5, 0]), place(ball(b, 0.14, colM, 16), [0, 0.14, 0]), place(box(b, 0.34, 0.03, 0.2, mat(b, "#8d96b0")), [0, 0.015, 0]));
      for (let i = 0; i < 6; i++) t.add(place(box(b, i % 5 ? 0.07 : 0.12, 0.012, 0.012, mat(b, "#e9efff")), [0.14, 0.25 + i * 0.14, 0]));
      const fl = cyl(b, 0.035, 0.035, 1, colM, 10); t.add(fl); g.add(t); return fl;
    });
    // signo igual entre los dos
    const eq = new THREE.Group(); eq.position.set(0, 1.0, 1.0);
    eq.add(place(cyl(b, 0.34, 0.34, 0.06, glowMat(b, "#1f7a4f", 0.5), 28), [0, 0, 0]), place(box(b, 0.38, 0.08, 0.05, beam(b, "#9dffcf", 1.4)), [0, 0.09, 0.05]), place(box(b, 0.38, 0.08, 0.05, beam(b, "#9dffcf", 1.4)), [0, -0.09, 0.05]));
    eq.children[0].rotation.x = Math.PI / 2; g.add(eq);
    g.rotation.y = -0.18; root.add(g); shadows(g);
    let eqU = 0, lf = 0;
    const paint = (f: number) => {
      const lvl = 0.12 + 0.4 * ease(eqU);
      fluids.forEach((fl) => { fl.scale.y = lvl; fl.position.y = 0.14 + lvl / 2; });
      const s = Math.max(0.001, ease(eqU * 1.6 - 0.6)); eq.scale.setScalar(s); eq.position.y = 1.0 + 0.03 * Math.sin(f * 0.1);
      g.rotation.y = -0.18 + 0.1 * Math.sin(f * 0.012);
    };
    return { ...done(root, b, (f) => { lf = f; paint(f); }), act: (name, u) => { if (name === "igualar") eqU = clamp01(u); paint(lf); } };
  },
};

// metal-madera-frio · corte de un dedo sobre un bloque translúcido (metal, madera o metal caliente): flechas de calor que cruzan el contacto,
// la yema que se enfría (o se calienta) y el nervio que avisa hacia arriba
export const dedo_contacto: HeroDef = {
  kind: "primitive",
  when: "Un dedo que toca una superficie: calor que sale de la piel hacia el metal o la madera, por qué el metal se siente frío (o el metal caliente quema), nervios de la yema que avisan, conducción del calor al tocar.",
  poses: ["metal", "madera", "metal_caliente"],
  actions: {
    tocar: "El dedo baja y se posa sobre el bloque (se queda así): tocas, tocar, contacto, apoyas, al tocarlo, pones el dedo.",
    fluir: "Flechas de calor cruzan el contacto y la yema cambia de color (fría en el metal, apenas en la madera, roja si está caliente; se queda así): el calor se escapa, se lleva el calor, pasa el calor, conduce, entra.",
    alarma: "El nervio de la yema se enciende y manda pulsos hacia arriba (débil con madera): los nervios gritan, avisa, siente, frío, quema, señal.",
  },
  center: [0, 2.2, 0], radius: 2.0,
  anchors: { hero: [0, 1.6, 0], top: [0, 3.4, 0], base: [0, 0.05, 0], dedo: [0, 1.7, 0.45], contacto: [0, 0.92, 0.5], bloque: [0, 0.45, 0.8], flujo: [0.9, 0.5, 0.8], nervio: [0.1, 3.0, 0] },
  build: (_L, pose) => {
    const p = poseOf(dedo_contacto, pose, "dedo_contacto");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const hot = p === "metal_caliente", wood = p === "madera", T = 0.9;
    // bloque translúcido con aristas y vetas/rayas en la cara frontal
    const tint = wood ? "#b37a42" : hot ? "#ff8a3a" : "#aebcdc";
    const blockGeo = b.track(new THREE.BoxGeometry(3.0, T, 1.7));
    const block = new THREE.Mesh(blockGeo, ghostMat(b, tint, wood ? 0.55 : 0.4, { metalness: wood ? 0 : 0.6, emissive: col(tint).multiplyScalar(hot ? 0.8 : 0.2) }));
    block.position.y = T / 2;
    const edges = new THREE.LineSegments(b.track(new THREE.EdgesGeometry(blockGeo)), b.track(new THREE.LineBasicMaterial({ color: col(tint).lerp(new THREE.Color("#ffffff"), 0.5), transparent: true, opacity: 0.8 }))); edges.position.y = T / 2;
    const lineM = beam(b, wood ? "#6b3d18" : "#f4f7ff", wood ? 1 : 1.1, { transparent: true, opacity: wood ? 0.7 : 0.5 });
    for (let i = 0; i < 6; i++) g.add(place(box(b, 2.6 - (i % 3) * 0.5, 0.012, 0.01, lineM), [(i % 2 ? 0.1 : -0.1), 0.12 + i * 0.12, 0.855]));
    g.add(block, edges, place(box(b, 3.5, 0.12, 2.3, mat(b, "#3a4259", { roughness: 0.7 })), [0, -0.06, 0]));
    // dedo de perfil: apoya la yema inclinado (como al tocar), uña en el dorso, yema aplastada, falange doblada con nudillo y pliegues
    const fing = new THREE.Group(), R = 0.5, L = 0.55;
    const skinM = ghostMat(b, "#f3b690", 0.8, { roughness: 0.5, emissive: new THREE.Color("#f3b690").multiplyScalar(0.4) }), dermM = glowMat(b, "#e8887a", 0.3, { roughness: 0.6 });
    const body = new THREE.Group(); body.scale.set(1, 1, 0.82);
    // perfil de yema que se ensancha hacia la falange (no una cápsula pareja)
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI / 2; prof.push(new THREE.Vector2(0.4 * Math.sin(a), 0.4 - 0.4 * Math.cos(a))); }
    [[0.45, 0.7], [0.49, 1.0], [0.51, 1.4], [0.5, 1.7]].forEach(([r, y]) => prof.push(new THREE.Vector2(r, y)));
    const outer = new THREE.Mesh(b.track(new THREE.LatheGeometry(prof, 28)), skinM);
    const derm = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(R - 0.1, L - 0.05, 8, 20)), dermM); derm.position.y = L / 2 + R + 0.03;
    const bone = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.14, L - 0.1, 6, 12)), mat(b, TONE.bone, { roughness: 0.5 })); bone.position.y = L / 2 + R + 0.3;
    // yema que cambia de color: casquete en la punta
    const tipM = glowMat(b, "#7da4e0", 0.5, { transparent: true, opacity: 0 }); const tip = ball(b, 0.43, tipM, 24); tip.position.y = 0.43; tip.scale.set(1, 1.05, 1);
    body.add(outer, derm, bone, tip);
    // uña en el dorso (lado +x), curva y brillante, con media luna
    const nail = place(box(b, 0.05, 0.55, 0.4, glowMat(b, "#ffe9dc", 0.55, { roughness: 0.2 })), [-0.48, 0.62, 0]); nail.rotation.z = -0.03;
    const lunula = place(ball(b, 0.11, mat(b, "#fff7ef", { roughness: 0.3 }), 12), [-0.45, 0.42, 0]); lunula.scale.set(0.35, 0.8, 1.6);
    const endM = glowMat(b, TONE.gold, 0.6);
    const ends = scatter(8, 4, (r) => [0.28 + (r() - 0.5) * 0.3, 0.1 + r() * 0.07, (r() - 0.5) * 0.4] as P3).map((q) => place(ball(b, 0.055, endM, 10), q));
    const nerve = tube(b, [[0.2, 0.15, 0], [0.1, 0.9, 0.04], [0.0, 1.7, 0], [-0.1, 2.3, 0.02]], 0.028, glowMat(b, TONE.gold, 0.5), 32);
    const pulses = [0, 1, 2, 3].map(() => ball(b, 0.07, beam(b, "#ffffff", 1.6, { transparent: true, opacity: 0 }), 10));
    // segunda falange doblada hacia atrás, con nudillo y pliegues
    const prox = new THREE.Group(); prox.position.set(0, 1.62, 0); prox.rotation.z = -0.55;
    const pOut = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(R - 0.04, 0.7, 8, 24)), skinM); pOut.position.y = 0.55;
    const pBone = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.14, 0.8, 6, 12)), mat(b, TONE.bone, { roughness: 0.5 })); pBone.position.y = 0.55;
    const creaseM = mat(b, "#a85a45");
    const crease = [-0.12, -0.02, 0.1].map((dy) => place(new THREE.Mesh(b.track(new THREE.TorusGeometry(R - 0.04, 0.014, 6, 28)), creaseM), [0, dy, 0]));
    crease.forEach((c) => { c.rotation.x = Math.PI / 2; });
    prox.add(pOut, pBone, place(ball(b, R - 0.02, skinM, 20), [0, 0, 0]), ...crease);
    body.add(prox);
    fing.add(body, nail, lunula, nerve, ...ends, ...pulses);
    const TILT = -0.42; fing.rotation.z = TILT; g.add(fing);
    // calor: flechas gruesas (asta + punta) que bajan del contacto y se abren dentro del bloque; halo bajo la yema
    const arrM = beam(b, hot ? "#ff4a2a" : "#ffb02e", 2.2, { transparent: true, opacity: 0 });
    const N = 10, spots = Array.from({ length: N }, (_, i) => [((i % 5) - 2) * 0.24, (i * 0.37) % 1, i < 5 ? -0.22 : 0.22] as P3);
    const arrows = spots.map((q) => {
      const a = new THREE.Group(), m = arrM.clone();
      const shaft = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.045, 0.045, 0.34, 8)), m); shaft.position.y = 0.17;
      const head = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.15, 0.26, 10)), m); head.position.y = -0.04; head.rotation.x = Math.PI;
      a.add(shaft, head); a.scale.setScalar(1.5); a.rotation.x = hot ? Math.PI : 0; g.add(a); return { a, q, m };
    });
    const CX = 0.25;
    const pad = halo(b, hot ? "rgba(255,90,60,1)" : "rgba(110,190,255,1)", 1.9, 0); pad.rotation.x = -Math.PI / 2; pad.position.set(CX, T + 0.02, 0); g.add(pad);
    g.position.z = -0.1; g.rotation.y = -0.45; g.scale.setScalar(1.35); g.position.y = 0.2; root.add(g); shadows(g);
    const depth = wood ? 0.18 : 0.8, speed = wood ? 0.006 : 0.02, shown = wood ? 3 : N, amp = wood ? 0.2 : 1, target = wood ? 0.1 : hot ? -1 : 1;
    const cool = new THREE.Color("#5f8fe6"), warm = new THREE.Color("#ff4a2a"), skin0 = new THREE.Color("#f3b690"), derm0 = new THREE.Color("#e8887a");
    let touch = 0, flow = 0, alarm = 0, lf = 0;
    const paint = (f: number) => {
      fing.position.set(CX - 0.12 + 0.02 * Math.sin(f * 0.05), T + 0.07 + 0.45 * (1 - ease(touch)), 0.0);
      const c = target * ease(flow), k = Math.abs(c), tone = c >= 0 ? cool : warm;
      skinM.color.copy(skin0).lerp(tone, k * 0.7); skinM.emissive.copy(skinM.color).multiplyScalar(0.4); dermM.color.copy(derm0).lerp(tone, k * 0.7);
      tipM.color.copy(tone); tipM.emissive.copy(tone); tipM.opacity = 0.75 * Math.min(1, k * 1.2);
      const gm = pad.material as THREE.MeshBasicMaterial; gm.opacity = 0.8 * k * ease(touch);
      const on = ease(touch) > 0.95 ? ease(flow) : 0;
      arrows.forEach(({ a, q, m }, i) => {
        const t = (f * speed + q[1] + i * 0.05) % 1, vis = i < shown ? on : 0, u = hot ? 1 - t : t;
        a.position.set(CX + q[0] * (1 + (wood ? 0 : 0.9 * u)), T + 0.1 - u * (depth + 0.2), q[2]); m.opacity = vis * Math.min(1, t * 6) * (1 - t * t) * 1;
      });
      const al = alarm * amp, fl = 0.5 + 2.5 * al * (0.6 + 0.4 * Math.sin(f * 0.8));
      endM.emissiveIntensity = fl; endM.emissive.copy(col(TONE.gold)).lerp(hot ? warm : new THREE.Color("#8be9ff"), al);
      pulses.forEach((s, i) => { const t = (f * 0.02 + i / 4) % 1; s.position.set(0.2 - 0.3 * t, 0.15 + t * 2.15, 0.02); (s.material as THREE.MeshBasicMaterial).opacity = al * 0.95 * Math.sin(t * Math.PI); (s.material as THREE.MeshBasicMaterial).color.set(hot ? "#ff7a5a" : "#bff4ff").multiplyScalar(1.6); });
      g.rotation.y = -0.45 + 0.08 * Math.sin(f * 0.012);
    };
    return {
      ...done(root, b, (f) => { lf = f; paint(f); }),
      act: (name, u) => {
        if (name === "tocar") touch = clamp01(u);
        if (name === "fluir") { flow = clamp01(u); touch = Math.max(touch, 1); }
        if (name === "alarma") { alarm = ease(u); touch = Math.max(touch, 1); }
        paint(lf);
      },
    };
  },
};

// segundo-cesio · piezas comunes: dígitos de 7 segmentos pintados en canvas, pantalla que se repinta solo al cambiar,
// cuerpo de teléfono y Tierra de neón (océano oscuro, costas cian)
const SEG7 = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];
const seg7 = (g: CanvasRenderingContext2D, ch: string, x: number, y: number, w: number, h: number, on: string) => {
  const t = w * 0.2, v = h / 2 - t * 0.9;
  const L: Record<string, [number, number, number, number]> = {
    a: [x + t * 0.6, y, w - t * 1.2, t], g: [x + t * 0.6, y + h / 2 - t / 2, w - t * 1.2, t], d: [x + t * 0.6, y + h - t, w - t * 1.2, t],
    f: [x, y + t * 0.6, t, v], b: [x + w - t, y + t * 0.6, t, v], e: [x, y + h / 2 + t * 0.3, t, v], c: [x + w - t, y + h / 2 + t * 0.3, t, v],
  };
  const lit = SEG7[Number(ch)] ?? "";
  for (const k of "abcdefg") {
    const [sx, sy, sw, sh] = L[k], isOn = lit.includes(k);
    g.save(); if (isOn) { g.shadowColor = on; g.shadowBlur = 26; }
    g.fillStyle = isOn ? on : "rgba(140,170,255,0.07)"; g.beginPath(); g.roundRect(sx, sy, sw, sh, t / 2); g.fill(); g.restore();
  }
};
const liveTex = (b: Bin, w: number, h: number) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const tex = b.track(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace;
  let key = "";
  return { tex, draw: (k: string, fn: (g: CanvasRenderingContext2D) => void) => { if (k === key) return; key = k; fn(cv.getContext("2d")!); tex.needsUpdate = true; } };
};
const NEON = { cyan: "#5fe3ff", gold: "#ffd166", red: "#ff4d6a", green: "#5dffa8" };
/** pantalla de reloj: MM:SS grandes, anillo de 60 marcas con los segundos, insignia SYNC y la frecuencia del cesio (detalle para ver dos veces) */
const clockScreen = (g: CanvasRenderingContext2D, w: number, h: number, digits: string, col: string, sec: number, sync: number, bad: boolean) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0d1838"); gr.addColorStop(1, "#03060f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(90,140,255,0.07)"; g.lineWidth = 2;
  for (let x = 18; x < w; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 18; y < h; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const label = (s: string, x: number, y: number, size: number, c: string) => { g.font = `700 ${size}px Montserrat, sans-serif`; g.fillStyle = c; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y); };
  label("UTC", w / 2, 80, 34, "rgba(170,205,255,0.8)");
  const dw = 96, dh = 196, gap = 18, cw = 34, x0 = (w - (4 * dw + 4 * gap + cw)) / 2, y0 = h * 0.2;
  const xs = [x0, x0 + dw + gap, x0 + 2 * dw + 3 * gap + cw, x0 + 3 * dw + 4 * gap + cw];
  digits.split("").forEach((d, i) => seg7(g, d, xs[i], y0, dw, dh, col));
  g.save(); g.shadowColor = NEON.gold; g.shadowBlur = 20; g.fillStyle = NEON.gold;
  [0.32, 0.68].forEach((k) => { g.beginPath(); g.arc(x0 + 2 * dw + 2 * gap + cw / 2, y0 + dh * k, 11, 0, Math.PI * 2); g.fill(); }); g.restore();
  // anillo de segundos: 60 marcas, cada 5 más larga
  const cx = w / 2, cy = h * 0.66, R = 150;
  for (let i = 0; i < 60; i++) {
    const a = -Math.PI / 2 + (i / 60) * Math.PI * 2, L = i % 5 ? 16 : 30, on = i < sec;
    g.strokeStyle = on ? NEON.gold : "rgba(150,180,255,0.32)"; g.lineWidth = i % 5 ? 5 : 8; g.lineCap = "round";
    g.save(); if (on) { g.shadowColor = NEON.gold; g.shadowBlur = 12; }
    g.beginPath(); g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a) * (R - L), cy + Math.sin(a) * (R - L)); g.stroke(); g.restore();
  }
  if (bad) label("✗", cx, cy, 120, NEON.red);
  else if (sync > 0) { g.globalAlpha = sync; g.save(); g.shadowColor = NEON.green; g.shadowBlur = 24; label("✓", cx, cy - 10, 110, NEON.green); g.restore(); label("SYNC", cx, cy + 70, 34, NEON.green); g.globalAlpha = 1; }
  label("9 192 631 770 Hz", w / 2, h * 0.9, 28, "rgba(95,227,255,0.55)");
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.roundRect(w / 2 - 90, h - 30, 180, 8, 4); g.fill();
};
/** teléfono genérico (sin marca): cuerpo de aluminio oscuro, pantalla, isla de cámara, botones, altavoz y módulo trasero */
const phoneBody = (b: Bin, tex: THREE.Texture) => {
  const g = new THREE.Group(), W = 1.0, H = 2.06, D = 0.1;
  const metal = mat(b, "#2a2f4f", { metalness: 0.7, roughness: 0.3 });
  g.add(new THREE.Mesh(b.track(new RoundedBoxGeometry(W, H, D, 6, 0.09)), metal));
  const scr = new THREE.Mesh(b.track(new THREE.PlaneGeometry(W - 0.07, H - 0.07)), b.track(new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(1.25, 1.25, 1.25) })));
  scr.position.z = D / 2 + 0.002; g.add(scr);
  g.add(place(new THREE.Mesh(b.track(new RoundedBoxGeometry(0.26, 0.07, 0.01, 3, 0.03)), b.track(new THREE.MeshBasicMaterial({ color: "#02030a" }))), [0, H / 2 - 0.1, D / 2 + 0.006]));
  [[W / 2 + 0.01, 0.45, 0.22], [-W / 2 - 0.01, 0.55, 0.14], [-W / 2 - 0.01, 0.3, 0.14]].forEach(([x, y, h]) => g.add(place(new THREE.Mesh(b.track(new RoundedBoxGeometry(0.03, h, 0.045, 2, 0.012)), metal), [x, y, 0])));
  const cam = new THREE.Mesh(b.track(new RoundedBoxGeometry(0.42, 0.42, 0.04, 3, 0.08)), mat(b, "#1b1f36", { metalness: 0.6, roughness: 0.25 }));
  cam.position.set(-0.22, H / 2 - 0.3, -D / 2 - 0.015); g.add(cam);
  [[-0.31, 0.71], [-0.13, 0.71], [-0.22, 0.55]].forEach(([x, y]) => { const l = cyl(b, 0.06, 0.06, 0.03, mat(b, "#05060c", { metalness: 0.9, roughness: 0.1 }), 20); l.rotation.x = Math.PI / 2; l.position.set(x, y, -D / 2 - 0.04); g.add(l); });
  g.add(place(box(b, 0.2, 0.012, 0.02, mat(b, "#05060c")), [0, -H / 2 + 0.02, 0]));
  shadows(g); return g;
};
const earthNeonTex = (b: Bin, ocean0: string, ocean1: string, land: string, coast: string) => screenTex(b.track, 1024, 512, (c) => {
  const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, ocean0); gr.addColorStop(1, ocean1); c.fillStyle = gr; c.fillRect(0, 0, 1024, 512);
  c.fillStyle = "#dff4ff"; c.fillRect(0, 0, 1024, 26); c.fillRect(0, 490, 1024, 22);
  c.fillStyle = land; c.strokeStyle = coast; c.lineWidth = 4;
  LAND.forEach((poly) => { c.beginPath(); poly.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * 1024, y = (90 - la) / 180 * 512; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill(); c.stroke(); });
});
const inLand = (lon: number, lat: number) => LAND.some((poly) => {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) ins = !ins; }
  return ins;
});

// segundo-cesio · teléfono con reloj de neón: los dígitos se vuelven locos y se congelan en 00:01; o dos teléfonos que no van a la par
export const telefono_hora: HeroDef = {
  kind: "primitive",
  when: "Teléfono con un reloj digital de neón grande en la pantalla (minutos y segundos, anillo de 60 marcas): la hora exacta, un segundo, cuánto dura un segundo, la hora de tu móvil, dos relojes que no van a la par, sincronizar la hora.",
  poses: ["hora", "par"],
  actions: {
    caos: "Los dígitos cambian sin control y se congelan en 00:01 en amarillo (se queda así): un segundo, cuánto dura, quién decidió, el tiempo, la hora.",
    recibir: "Anillos de señal bajan desde arriba hasta el teléfono y aparece «✓ SYNC» (se queda así): llega la hora, satélites, internet, se sincroniza, marcan lo mismo.",
    desfase: "El reloj de la derecha falla: salta de cifra, se pone rojo con una ✗ y tiembla (se queda así): no van a la par, no coinciden, se atrasa, se adelanta, error.",
  },
  center: [0, 1.25, 0], radius: 0.8,
  anchors: { hero: [0, 1.25, 0.06], top: [0, 2.35, 0], base: [0, 0.2, 0], screen: [0, 1.3, 0.07], digitos: [0, 1.65, 0.07], anillo: [0, 0.95, 0.07] },
  build: (_L, pose) => {
    const p = poseOf(telefono_hora, pose, "telefono_hora"), par = p === "par", b = bin(), root = new THREE.Group();
    const screens = (par ? [0, 1] : [0]).map(() => liveTex(b, 540, 1112));
    const phones = screens.map((s, i) => { const ph = phoneBody(b, s.tex); ph.position.set(par ? (i ? 0.6 : -0.6) : 0, 1.25, 0); if (par) ph.scale.setScalar(0.88); root.add(ph); return ph; });
    // polvo de partículas de neón alrededor
    const dotM = [beam(b, NEON.cyan, 2.2), beam(b, NEON.gold, 2.2)];
    const dots = scatter(54, 17, (r) => [(r() - 0.5) * 3.6, 0.1 + r() * 2.6, -0.4 - r() * 1.6]).map((q, i) => { const d = ball(b, 0.012 + 0.012 * hash1(i + 3), dotM[i % 5 ? 0 : 1], 6); d.position.set(...q); d.userData.y = q[1]; root.add(d); return d; });
    // anillos de señal que bajan al teléfono (recibir)
    const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.5, 0.014, 6, 48)), beam(b, NEON.cyan, 1.8, { transparent: true, opacity: 0 })); r.rotation.x = Math.PI / 2; root.add(r); return r; });
    // satélite GPS pequeño que llega con «recibir» (cuerpo dorado, dos paneles, antena hacia el teléfono)
    const sat = new THREE.Group(); sat.add(box(b, 0.16, 0.16, 0.2, mat(b, "#d9a441", { metalness: 0.7, roughness: 0.35, emissive: new THREE.Color("#4a3008") })));
    [-1, 1].forEach((d) => sat.add(place(box(b, 0.36, 0.014, 0.15, mat(b, "#1d3c9a", { metalness: 0.4, roughness: 0.3, emissive: new THREE.Color("#0a1f60") })), [d * 0.28, 0, 0]), rod(b, [d * 0.08, 0, 0], [d * 0.11, 0, 0], 0.012, mat(b, "#cfd5ea", { metalness: 0.8 }))));
    sat.add(place(cyl(b, 0.03, 0.05, 0.07, mat(b, "#e8ebf6", { metalness: 0.5 }), 10), [0, -0.12, 0]), halo(b, "rgba(255,220,150,0.8)", 0.6, 0.5)); sat.visible = false; root.add(sat);
    let caos = 0, rec = 0, des = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      sat.visible = rec > 0; sat.position.set(0.5 + 1.0 * (1 - rec), 2.8 + 0.6 * (1 - rec) + 0.04 * Math.sin(f * 0.05), -0.3); sat.rotation.set(0.3, f * 0.01, 0.2);
      phones.forEach((ph, i) => {
        const sx = par ? (i ? 0.6 : -0.6) : 0, jit = par && i === 1 ? des * 0.03 * Math.sin(f * 1.7) : 0;
        ph.position.set(sx + jit, 1.25 + 0.03 * Math.sin(f * 0.045 + i), 0);
        ph.rotation.set(-0.06 + 0.025 * Math.sin(f * 0.03 + i), (par ? (i ? -0.3 : 0.3) : -0.2) + 0.06 * Math.sin(f * 0.017 + i), 0.03 * Math.sin(f * 0.021 + i));
      });
      dots.forEach((d, i) => { d.position.y = d.userData.y + 0.08 * Math.sin(f * 0.03 + i) + (caos > 0 && caos < 1 ? 0.15 * Math.sin(f * 0.4 + i) : 0); });
      rings.forEach((r, i) => { const t = (f * 0.02 + i / 3) % 1; r.position.set(0, 3.3 - 0.95 * t, 0.05); r.scale.setScalar(1.4 - 0.5 * t); (r.material as THREE.MeshBasicMaterial).opacity = rec * 0.9 * Math.sin(Math.PI * t); });
      if (!par) {
        const scr = caos > 0 && caos < 1, digits = scr ? [0, 1, 2, 3].map((k) => Math.floor(hash1(Math.floor(f / 2) * 7 + k) * 10)).join("") : caos >= 1 && rec === 0 ? "0001" : "0000";
        const sec = scr ? Math.floor(hash1(Math.floor(f / 2)) * 60) : digits === "0001" ? 1 : 0, col = digits === "0001" ? NEON.gold : NEON.cyan;
        screens[0].draw(`${digits}|${sec}|${rec.toFixed(2)}`, (g) => clockScreen(g, 540, 1112, digits, col, sec, rec, false));
      } else {
        const sL = (7 + Math.floor(f / 30)) % 60, sR = (4 + Math.floor(f / 26) + (des > 0 ? Math.floor(hash1(Math.floor(f / 5)) * 9) : 0)) % 60;
        const dL = "30" + String(sL).padStart(2, "0"), dR = "30" + String(sR).padStart(2, "0");
        screens[0].draw(`${dL}|${sL}`, (g) => clockScreen(g, 540, 1112, dL, NEON.cyan, sL, 0, false));
        screens[1].draw(`${dR}|${sR}|${des > 0.5}`, (g) => clockScreen(g, 540, 1112, dR, des > 0.5 ? NEON.red : NEON.cyan, sR, 0, des > 0.5));
      }
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "caos") caos = u; if (name === "recibir") rec = ease(u); if (name === "desfase") des = ease(u); paint(lf); } };
  },
};

// segundo-cesio · la Tierra de neón: 24 husos horarios que se encienden, la Luna que la frena con las mareas, terremotos,
// y un reloj de 60 marcas alrededor donde la hora oficial espera a la Tierra con un segundo extra
export const tierra_husos: HeroDef = {
  kind: "primitive",
  when: "La Tierra girando como reloj: el día dividido en 24 horas (24 husos que se encienden), 86 400 segundos, la Luna que frena su giro con las mareas, terremotos que cambian la duración del día, la rotación irregular, el segundo intercalar (la hora oficial espera a la Tierra).",
  poses: ["husos", "tambaleo", "segundo_extra"],
  actions: {
    dividir: "Se encienden uno a uno 24 meridianos dorados y los husos se tiñen alternos (se queda así): dividir el día, veinticuatro horas, husos horarios.",
    subdividir: "Un anillo de marcas finísimas aparece alrededor del ecuador y gira (se queda así): dividir en muchas partes, ochenta y seis mil cuatrocientos, segundos del día.",
    frenar: "La marea se estira hacia la Luna, aparecen arcos rojos de fricción y el giro se frena (se queda así): la Luna frena, mareas, se ralentiza, el día se alarga.",
    temblor: "Ondas sísmicas rojas salen de un punto, la Tierra tiembla y su eje se tambalea: terremoto, sacudida, cambia su giro, inestable.",
    esperar: "En el reloj de 60 marcas que rodea la Tierra, la marca de la hora atómica se detiene, se enciende un segundo extra dorado y la Tierra la alcanza (se queda así): segundo extra, segundo intercalar, esperar, va detrás, se corrige.",
  },
  center: [0, 1.2, 0], radius: 1.12,
  anchors: { hero: [0, 1.2, 0], top: [0, 2.3, 0], base: [0, 0.1, 0], polo: [0, 2.25, 0], ecuador: [1.05, 1.2, 0], luna: [-1.5, 1.6, 0.4], sismo: [0.25, 1.6, 0.9], extra: [0, 2.65, 0.2] },
  build: (_L, pose) => {
    const p = poseOf(tierra_husos, pose, "tierra_husos"), b = bin(), root = new THREE.Group(), pivot = new THREE.Group(), globe = new THREE.Group();
    pivot.position.y = 1.2; pivot.add(globe); root.add(pivot);
    const tex = earthNeonTex(b, "#14407e", "#0a2250", "#2f8f6a", "#8affd6");
    globe.add(new THREE.Mesh(b.track(new THREE.SphereGeometry(1, 64, 48)), mat(b, "#ffffff", { map: tex, emissive: new THREE.Color("#ffffff"), emissiveMap: tex, emissiveIntensity: 0.32, roughness: 0.65 })));
    pivot.add(new THREE.Mesh(b.track(new THREE.SphereGeometry(1.06, 40, 28)), ghostMat(b, "#7fd0ff", 0.12)));
    // noche: media cáscara oscura fija (no gira con la Tierra) y el Sol como halo a la izquierda
    const night = new THREE.Mesh(b.track(new THREE.SphereGeometry(1.035, 48, 32, 0, Math.PI)), ghostMat(b, "#02040c", 0.5)); night.rotation.y = -Math.PI * 0.35; pivot.add(night);
    const sun = halo(b, "rgba(255,214,120,0.95)", 1.6, 0.95); sun.position.set(-1.45, 2.25, -0.8); root.add(sun, place(ball(b, 0.16, beam(b, "#ffd98a", 2.2), 24), [-1.45, 2.25, -0.8]));
    // 24 meridianos (medio círculo de polo a polo) y 24 husos translúcidos alternos
    const merM = beam(b, NEON.gold, 1.7, { transparent: true, opacity: 1 }), mers: THREE.Group[] = [], secs: THREE.Mesh[] = [];
    for (let k = 0; k < 24; k++) {
      const m = new THREE.Group(), arc = new THREE.Mesh(b.track(new THREE.TorusGeometry(1.025, 0.007, 5, 48, Math.PI)), merM); arc.rotation.z = -Math.PI / 2; m.add(arc); m.rotation.y = (k / 24) * Math.PI * 2; globe.add(m); mers.push(m);
      const s = new THREE.Mesh(b.track(new THREE.SphereGeometry(1.02, 6, 24, (k / 24) * Math.PI * 2, Math.PI / 12)), ghostMat(b, k % 2 ? NEON.gold : NEON.cyan, 0)); globe.add(s); secs.push(s);
    }
    // anillo de marcas finas en el ecuador (subdividir)
    const tickTex = screenTex(b.track, 2048, 32, (c) => { c.clearRect(0, 0, 2048, 32); for (let i = 0; i < 480; i++) { c.fillStyle = i % 20 ? "rgba(95,227,255,0.9)" : "rgba(255,209,102,1)"; c.fillRect(i * (2048 / 480), i % 20 ? 10 : 0, 1.6, i % 20 ? 22 : 32); } });
    const tickRing = new THREE.Mesh(b.track(new THREE.CylinderGeometry(1.2, 1.2, 0.09, 128, 1, true)), b.track(new THREE.MeshBasicMaterial({ map: tickTex, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.6, 1.6) })));
    pivot.add(tickRing);
    // Luna, eje y marea (tambaleo)
    const moonTex = screenTex(b.track, 256, 128, (c) => { c.fillStyle = "#c9cbd6"; c.fillRect(0, 0, 256, 128); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(90,92,110,${0.25 + 0.3 * hash1(i + 5)})`; c.beginPath(); c.arc(hash1(i + 1) * 256, hash1(i + 9) * 128, 4 + 12 * hash1(i + 3), 0, Math.PI * 2); c.fill(); } });
    const moon = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.27, 32, 24)), mat(b, "#ffffff", { map: moonTex, roughness: 0.9, emissive: new THREE.Color("#30323f") }));
    const tide = new THREE.Mesh(b.track(new THREE.SphereGeometry(1.04, 40, 28)), ghostMat(b, "#4fc8ff", 0.0)); pivot.add(tide);
    const axis = cyl(b, 0.012, 0.012, 2.9, beam(b, "#cfe6ff", 1.3), 8); pivot.add(axis);
    const fric = [0, 1, 2].map((i) => { const a = new THREE.Mesh(b.track(new THREE.TorusGeometry(1.1 + i * 0.07, 0.02, 5, 40, 1.1)), beam(b, NEON.red, 2.2, { transparent: true, opacity: 0 })); a.rotation.x = Math.PI / 2; pivot.add(a); return a; });
    const quake = [0, 1, 2].map(() => { const r = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.12, 0.022, 5, 40)), beam(b, NEON.red, 2.4, { transparent: true, opacity: 0 })); pivot.add(r); return r; });
    const qPos = ll(22, -75, 1.01);
    quake.forEach((r) => { r.position.copy(qPos); r.lookAt(qPos.clone().multiplyScalar(2)); });
    const tamb = p === "tambaleo"; root.children.forEach((c) => { if (p === "segundo_extra" && c !== pivot && c !== moon) c.visible = false; }); moon.visible = tamb; axis.visible = tamb; root.add(moon);
    // reloj de 60 marcas alrededor (segundo extra): marca cian = hora atómica, marca dorada = la Tierra
    const dial = new THREE.Group(); dial.position.y = 1.2; dial.visible = p === "segundo_extra"; root.add(dial);
    for (let i = 0; i < 60; i++) { const a = Math.PI / 2 - (i / 60) * Math.PI * 2, L = i % 5 ? 0.07 : 0.14; const t = box(b, 0.018, L, 0.018, beam(b, "#9fb6ff", i % 5 ? 0.9 : 1.4)); t.position.set(Math.cos(a) * 1.42, Math.sin(a) * 1.42, 0); t.rotation.z = a - Math.PI / 2; dial.add(t); }
    dial.add(new THREE.Mesh(b.track(new THREE.TorusGeometry(1.5, 0.008, 5, 96)), beam(b, "#6f8cff", 1.2)));
    const atomBead = ball(b, 0.12, beam(b, NEON.cyan, 2.4), 16), earthBead = ball(b, 0.12, beam(b, NEON.gold, 2.4), 16), extra = box(b, 0.05, 0.22, 0.05, beam(b, NEON.gold, 2.6));
    const extraHalo = halo(b, "rgba(255,209,102,0.95)", 0.7, 0); dial.add(atomBead, earthBead, extra, extraHalo);
    const tag = (txt: string, c: string) => { const m = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.62, 0.17)), b.track(new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false, map: screenTex(b.track, 300, 82, (g) => { g.clearRect(0, 0, 300, 82); g.fillStyle = "rgba(8,14,36,0.85)"; g.beginPath(); g.roundRect(3, 3, 294, 76, 30); g.fill(); g.strokeStyle = c; g.lineWidth = 4; g.stroke(); g.fillStyle = c; g.font = "800 40px Montserrat, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 150, 43); }) }))); m.renderOrder = 10; dial.add(m); return m; };
    const atomTag = tag("ÁTOMO", NEON.cyan), earthTag = tag("TIERRA", NEON.gold); atomTag.scale.setScalar(1.3); earthTag.scale.setScalar(1.3);
    let dv = 0, sb = 0, fr = 0, frT = 0, qk = 0, qkT = -1, es = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      globe.rotation.y = -2.1 + f * 0.004 - fr * frT * 0.003;
      mers.forEach((m, k) => { const v = clamp01(dv * 24 - k); m.visible = v > 0; m.scale.set(1, v, 1); });
      secs.forEach((s, k) => { (s.material as THREE.MeshStandardMaterial).opacity = 0.16 * clamp01(dv * 24 - k); });
      (tickRing.material as THREE.MeshBasicMaterial).opacity = sb; tickRing.rotation.y = f * 0.03; tickRing.scale.set(1, 1 + 0.4 * sb, 1);
      // tambaleo: eje inclinado que bambolea, Luna en órbita, marea estirada hacia ella
      const wob = tamb ? 0.06 * Math.sin(f * 0.05) + (qkT >= 0 ? 0.12 * Math.exp(-qkT / 40) * Math.sin(qkT * 0.5) : 0) : 0;
      pivot.rotation.set(0, 0, tamb ? -0.41 + wob : 0);
      const ma = 2.4 + f * 0.008; moon.position.set(Math.cos(ma) * 1.55, 1.5 + 0.2 * Math.sin(ma), Math.sin(ma) * 0.9 + 0.3);
      tide.scale.set(1 + 0.09 * fr, 1, 1); tide.lookAt(moon.position); tide.rotateY(Math.PI / 2); (tide.material as THREE.MeshStandardMaterial).opacity = 0.3 * fr;
      fric.forEach((a, i) => { a.rotation.z = -f * 0.02 + i * 2.1; (a.material as THREE.MeshBasicMaterial).opacity = fr * (0.6 + 0.4 * Math.sin(f * 0.2 + i)); });
      quake.forEach((r, i) => { const t = qkT < 0 ? -1 : ((qkT / 30) + i / 3) % 1; r.scale.setScalar(t < 0 ? 0.01 : 1 + 4 * t); (r.material as THREE.MeshBasicMaterial).opacity = t < 0 ? 0 : qk * (1 - t); });
      pivot.position.set(qkT >= 0 ? 0.03 * Math.exp(-qkT / 30) * Math.sin(qkT * 2.1) : 0, 1.2, 0);
      // reloj: la marca atómica va 3 marcas por delante; con «esperar» se detiene y la Tierra la alcanza
      const base = 0.95 + 0.1 * Math.sin(f * 0.012), A = base - (3 / 60) * Math.PI * 2 * (1 - es), E = base;
      atomBead.position.set(Math.cos(Math.PI / 2 + A) * 1.5, Math.sin(Math.PI / 2 + A) * 1.5, 0.02);
      earthBead.position.set(Math.cos(Math.PI / 2 + E) * 1.5, Math.sin(Math.PI / 2 + E) * 1.5, 0.02);
      atomTag.position.copy(atomBead.position).multiplyScalar(0.8).setZ(0.4); earthTag.position.copy(earthBead.position).multiplyScalar(0.62).setZ(0.4);
      const xa = Math.PI / 2 + base - (1.5 / 60) * Math.PI * 2; extra.position.set(Math.cos(xa) * 1.42, Math.sin(xa) * 1.42, 0.03); extra.rotation.z = xa - Math.PI / 2; extra.scale.setScalar(Math.max(0.001, 1.6 * es));
      extraHalo.position.copy(extra.position); (extraHalo.material as THREE.MeshBasicMaterial).opacity = 0.9 * es;
    };
    return {
      ...done(root, b, paint),
      act: (name, u, _s, t) => {
        if (name === "dividir") dv = ease(u); if (name === "subdividir") sb = ease(u);
        if (name === "frenar") { fr = ease(u); frT = t; } if (name === "temblor") { qk = 1; qkT = t; } if (name === "esperar") es = ease(u);
        paint(lf);
      },
    };
  },
};

// segundo-cesio · tablilla de arcilla babilónica con numerales cuneiformes y un reloj de 60 marcas de neón detrás; en
// «segunda», una de sus partes se amplía en otras 60 (la segunda división: el segundo)
const cuneiform = (g: CanvasRenderingContext2D, n: number, x: number, y: number, s: number) => {
  // decenas = cuñas en ángulo (‹), unidades = cuñas verticales
  const tens = Math.floor(n / 10), ones = n % 10; let cx = x;
  const wedgeV = (px: number, py: number) => { g.beginPath(); g.moveTo(px - s * 0.28, py); g.lineTo(px + s * 0.28, py); g.lineTo(px, py + s * 0.5); g.closePath(); g.fill(); g.fillRect(px - s * 0.05, py + s * 0.4, s * 0.1, s * 0.55); };
  const wedgeA = (px: number, py: number) => { g.beginPath(); g.moveTo(px + s * 0.4, py - s * 0.3); g.lineTo(px - s * 0.25, py + s * 0.05); g.lineTo(px + s * 0.4, py + s * 0.4); g.lineTo(px + s * 0.18, py + s * 0.05); g.closePath(); g.fill(); };
  for (let i = 0; i < tens; i++) { wedgeA(cx, y + s * 0.45); cx += s * 0.55; }
  for (let i = 0; i < ones; i++) wedgeV(cx + (i % 3) * s * 0.3, y + Math.floor(i / 3) * s * 0.45 - (ones > 3 ? s * 0.2 : 0));
  return cx + Math.min(3, ones) * s * 0.3 + s * 0.5;
};
export const tablilla_sesenta: HeroDef = {
  kind: "primitive",
  when: "Tablilla de arcilla babilónica con números cuneiformes en base 60 y un reloj de neón de 60 marcas detrás: los babilonios, Mesopotamia, contar en base sesenta, sesenta minutos, sesenta segundos, la segunda división de la hora (de dónde viene la palabra segundo).",
  poses: ["tablilla", "segunda"],
  actions: {
    sesenta: "Las 60 marcas del reloj de neón se encienden una a una alrededor de la tablilla (se queda así): base sesenta, sesenta minutos, contar, dividir la hora.",
    dividir: "Una de las 60 partes se ilumina en dorado y se amplía en otro anillo con 60 marcas más pequeñas (se queda así): la segunda división, sesenta partes más, segunda parte pequeña, el segundo.",
  },
  center: [0, 1.3, 0], radius: 1.05,
  anchors: { hero: [0, 1.2, 0.15], top: [0, 2.3, 0], base: [0, 0.1, 0], tablilla: [0, 1.2, 0.15], anillo: [0, 2.45, -0.3], parte: [0.15, 2.4, -0.3], zoom: [0.85, 2.05, 0.4] },
  build: (_L, pose) => {
    const p = poseOf(tablilla_sesenta, pose, "tablilla_sesenta"), b = bin(), root = new THREE.Group();
    // tablilla: losa redondeada de arcilla con cuñas, grietas y bordes gastados; peana de piedra
    const tex = screenTex(b.track, 512, 640, (g) => {
      g.fillStyle = "#c4874f"; g.fillRect(0, 0, 512, 640);
      for (let i = 0; i < 900; i++) { g.fillStyle = hash1(i) < 0.5 ? "rgba(90,55,30,0.12)" : "rgba(240,200,150,0.12)"; g.fillRect(hash1(i + 1) * 512, hash1(i + 2) * 640, 3 + hash1(i + 3) * 6, 2 + hash1(i + 4) * 4); }
      g.strokeStyle = "rgba(80,45,22,0.45)"; g.lineWidth = 3; for (let r = 1; r < 6; r++) { g.beginPath(); g.moveTo(26, r * 110); g.lineTo(486, r * 110 + 2); g.stroke(); }
      g.fillStyle = "#4a2810"; g.shadowColor = "rgba(255,225,180,0.55)"; g.shadowOffsetY = 3;
      const rows = [[12, 23], [36, 59], [20, 7], [44, 15], [51, 30]];
      rows.forEach((row, r) => { let x = 40; row.forEach((n) => { x = cuneiform(g, n, x, r * 110 + 22, 56) + 30; }); });
      g.shadowColor = "transparent"; g.strokeStyle = "rgba(60,32,15,0.7)"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(400, 0); g.lineTo(420, 80); g.lineTo(395, 150); g.lineTo(430, 230); g.stroke();
      g.beginPath(); g.moveTo(0, 520); g.lineTo(70, 540); g.lineTo(110, 600); g.stroke();
    });
    const clay = mat(b, "#ffffff", { map: tex, roughness: 0.92 }), clayEdge = mat(b, "#a0683a", { roughness: 0.95 });
    const tab = new THREE.Mesh(b.track(new RoundedBoxGeometry(1.2, 1.5, 0.22, 6, 0.09)), [clayEdge, clayEdge, clayEdge, clayEdge, clay, clayEdge]);
    tab.position.set(0, 1.12, 0.1); tab.rotation.set(-0.08, 0, 0.03); root.add(tab);
    const stone = mat(b, "#4a4f63", { roughness: 0.85 }); root.add(place(box(b, 1.5, 0.3, 0.6, stone), [0, 0.15, 0.1]), place(box(b, 1.34, 0.08, 0.5, mat(b, "#5b6177", { roughness: 0.8 })), [0, 0.34, 0.1]));
    shadows(root);
    // reloj de neón de 60 marcas detrás (arriba, para que no tape la tablilla)
    const dial = new THREE.Group(); dial.position.set(0, 1.55, -0.35); root.add(dial);
    const R = 1.12, ticks = Array.from({ length: 60 }, (_, i) => { const a = Math.PI / 2 - (i / 60) * Math.PI * 2, L = i % 5 ? 0.1 : 0.2; const t = box(b, 0.025, L, 0.02, beam(b, i % 5 ? NEON.cyan : NEON.gold, 1.9, { transparent: true, opacity: 0.12 })); t.position.set(Math.cos(a) * (R - L / 2), Math.sin(a) * (R - L / 2), 0); t.rotation.z = a - Math.PI / 2; dial.add(t); return t; });
    dial.add(new THREE.Mesh(b.track(new THREE.TorusGeometry(R + 0.03, 0.008, 5, 96)), beam(b, "#6f8cff", 1.3)));
    const hand = new THREE.Group(), handBar = box(b, 0.02, R * 0.85, 0.02, beam(b, NEON.gold, 2)); handBar.position.y = R * 0.42; hand.add(handBar, ball(b, 0.04, beam(b, NEON.gold, 2), 10)); hand.position.z = 0.01; dial.add(hand);
    // ampliación: sector dorado, dos líneas de zoom y un anillo pequeño con 60 marcas finas
    const seg = new THREE.Mesh(b.track(new THREE.RingGeometry(R - 0.22, R + 0.02, 8, 1, Math.PI / 2 - Math.PI * 2 / 60, Math.PI * 2 / 60)), beam(b, NEON.gold, 1.6, { transparent: true, opacity: 0, side: THREE.DoubleSide })); dial.add(seg);
    const zoom = new THREE.Group(), zc = new THREE.Vector3(0.62, 0.5, 0.75); zoom.position.copy(zc); dial.add(zoom);
    zoom.add(new THREE.Mesh(b.track(new THREE.CircleGeometry(0.5, 48)), ghostMat(b, "#0a1430", 0.75)), new THREE.Mesh(b.track(new THREE.TorusGeometry(0.5, 0.012, 5, 64)), beam(b, NEON.gold, 1.8)));
    const micro = Array.from({ length: 60 }, (_, i) => { const a = Math.PI / 2 - (i / 60) * Math.PI * 2, L = i % 5 ? 0.05 : 0.1; const t = box(b, 0.012, L, 0.01, beam(b, i % 5 ? NEON.cyan : NEON.gold, 2)); t.position.set(Math.cos(a) * (0.45 - L / 2), Math.sin(a) * (0.45 - L / 2), 0.01); t.rotation.z = a - Math.PI / 2; zoom.add(t); return t; });
    const zl = [0, 1].map(() => { const m = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.006, 0.006, 1, 6)), beam(b, NEON.gold, 1.5, { transparent: true, opacity: 0 })); dial.add(m); return m; });
    const seg2 = p === "segunda";
    let s60 = seg2 ? 1 : 0, dv = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      root.rotation.y = 0.12 * Math.sin(f * 0.012);
      ticks.forEach((t, i) => { const v = clamp01(s60 * 60 - i); (t.material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.88 * v; t.scale.setScalar(1 + 0.5 * (v > 0 && v < 1 ? 1 : 0)); });
      hand.rotation.z = -(seg2 ? f * 0.02 : s60 * Math.PI * 2);
      (seg.material as THREE.MeshBasicMaterial).opacity = 0.75 * ease(dv * 2);
      const z = ease(dv * 1.6 - 0.2); zoom.scale.setScalar(Math.max(0.001, 0.8 * z)); zoom.visible = z > 0.01;
      micro.forEach((m, i) => { m.visible = dv * 60 * 1.1 - 6 > i; });
      const pA = new THREE.Vector3(Math.cos(Math.PI / 2) * (R - 0.1), Math.sin(Math.PI / 2) * (R - 0.1), 0), pB = new THREE.Vector3(Math.cos(Math.PI / 2 - Math.PI / 30) * (R - 0.1), Math.sin(Math.PI / 2 - Math.PI / 30) * (R - 0.1), 0);
      [pA, pB].forEach((q, i) => { const tgt = zc.clone().add(new THREE.Vector3(i ? 0.28 : -0.28, 0.28, 0).multiplyScalar(z)); const m = zl[i]; m.position.copy(q).add(tgt).multiplyScalar(0.5); m.scale.y = Math.max(0.001, q.distanceTo(tgt)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tgt.clone().sub(q).normalize()); (m.material as THREE.MeshBasicMaterial).opacity = 0.8 * z; });
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "sesenta") s60 = ease(u); if (name === "dividir") dv = clamp01(u); paint(lf); } };
  },
};

// segundo-cesio · átomo de cesio-133: núcleo de 55 protones y 78 neutrones, seis capas con 2-8-18-18-8-1 electrones,
// el electrón exterior dorado con su espín, y la onda electromagnética que «cuenta» los segundos
export const atomo_cesio: HeroDef = {
  kind: "primitive",
  when: "Átomo de cesio-133 con su núcleo, seis capas de electrones y un electrón exterior que cambia de espín y emite una onda electromagnética: reloj atómico, cesio, vibraciones u oscilaciones del átomo, la definición del segundo, frecuencia, 1967.",
  poses: ["atomo", "onda"],
  actions: {
    pulso: "El electrón exterior gira su espín, el núcleo destella y sale un pulso (se queda así): miramos al átomo, el cesio, transición, salto, se activa.",
    vibrar: "Una onda electromagnética (campo eléctrico cian y magnético dorado) sale del átomo y oscila muy rápido (se queda así): vibraciones, oscila, frecuencia, nueve mil millones de veces, cuenta el tiempo.",
  },
  center: [0, 1.3, 0], radius: 1.0,
  anchors: { hero: [0, 1.25, 0], top: [0, 2.6, 0], base: [0, 0.1, 0], nucleo: [0, 1.25, 0], electron: [1.25, 1.25, 0], onda: [1.2, 1.25, 0], etiqueta: [0, 2.55, 0] },
  build: (_L, pose) => {
    const p = poseOf(atomo_cesio, pose, "atomo_cesio"), onda = p === "onda", b = bin(), root = new THREE.Group(), atom = new THREE.Group();
    atom.position.set(onda ? -0.55 : 0, 1.25, 0); root.add(atom);
    if (onda) atom.scale.setScalar(0.72);
    // núcleo: 133 nucleones apretados (una geometría compartida)
    const nucleus = new THREE.Group(), ng = b.track(new THREE.SphereGeometry(0.045, 14, 10)), pm = glowMat(b, NEON.gold, 0.6, { roughness: 0.35 }), nm = glowMat(b, "#9fc4ff", 0.35, { roughness: 0.35 });
    scatter(133, 21, (r) => { const u = r() * 2 - 1, a = r() * Math.PI * 2, rr = 0.2 * Math.cbrt(r()), s = Math.sqrt(1 - u * u); return [s * Math.cos(a) * rr, u * rr, s * Math.sin(a) * rr]; })
      .forEach((q, i) => { const m = new THREE.Mesh(ng, i < 55 ? pm : nm); m.position.set(...q); nucleus.add(m); });
    const nHalo = halo(b, "rgba(255,209,102,0.9)", 0.9, 0.5); atom.add(nucleus, nHalo);
    // capas: anillos inclinados con sus electrones
    const SH = [2, 8, 18, 18, 8, 1], RS = [0.36, 0.52, 0.68, 0.84, 1.0, 1.2];
    const eM = beam(b, NEON.cyan, 2.2), eg = b.track(new THREE.SphereGeometry(0.026, 10, 8));
    const shells = SH.map((n, k) => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.2 + 0.5 * Math.sin(k * 2.3), 0.7 * k, 0.4 * Math.cos(k * 1.7)));
      const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(RS[k], 0.005, 5, 96)), beam(b, "#7f9cff", k === 5 ? 1.6 : 0.9, { transparent: true, opacity: k === 5 ? 0.9 : 0.55 }));
      ring.quaternion.copy(q); atom.add(ring);
      const es = Array.from({ length: n }, () => { const e = k === 5 ? ball(b, 0.07, beam(b, NEON.gold, 2.4), 16) : new THREE.Mesh(eg, eM); atom.add(e); return e; });
      return { q, es, r: RS[k], w: 0.05 / (1 + k * 0.4) };
    });
    // espín del electrón exterior (flecha) y su halo
    const spin = new THREE.Group(), sm = beam(b, "#ffffff", 1.8); spin.add(place(cyl(b, 0.008, 0.008, 0.16, sm, 6), [0, 0, 0]), place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.025, 0.05, 10)), sm), [0, 0.1, 0])); atom.add(spin);
    const vHalo = halo(b, "rgba(255,209,102,0.95)", 0.5, 0.6); atom.add(vHalo);
    // etiqueta Cs con número másico 133
    const lab = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.62, 0.36)), b.track(new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: screenTex(b.track, 320, 186, (g) => {
      g.clearRect(0, 0, 320, 186); g.fillStyle = "rgba(10,20,48,0.8)"; g.beginPath(); g.roundRect(4, 4, 312, 178, 24); g.fill(); g.strokeStyle = NEON.cyan; g.lineWidth = 4; g.stroke();
      g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "800 112px Montserrat, sans-serif"; g.fillText("Cs", 186, 104);
      g.fillStyle = NEON.gold; g.font = "700 46px Montserrat, sans-serif"; g.fillText("133", 70, 56); g.fillStyle = "rgba(170,205,255,0.85)"; g.fillText("55", 70, 140);
    }) })));
    lab.position.set(onda ? -0.55 : 0, onda ? 2.25 : 2.6, 0.1); root.add(lab);
    // onda electromagnética: campo E (cian, vertical) y B (dorado, horizontal) hechos de cuentas
    const wave = new THREE.Group(); wave.position.set(onda ? -0.05 : 0.9, 1.25, 0); root.add(wave);
    const wg = b.track(new THREE.SphereGeometry(0.022, 8, 6)), wE = beam(b, NEON.cyan, 2.4), wB = beam(b, NEON.gold, 2.2);
    const NW = 110, LW = onda ? 1.9 : 1.4, eb = Array.from({ length: NW }, () => { const m = new THREE.Mesh(wg, wE); wave.add(m); return m; }), bb = Array.from({ length: NW }, () => { const m = new THREE.Mesh(wg, wB); wave.add(m); return m; });
    wave.add(place(cyl(b, 0.004, 0.004, LW, beam(b, "#9fb6ff", 1), 6), [LW / 2, 0, 0])); wave.children[wave.children.length - 1].rotation.z = Math.PI / 2;
    let pu = 0, vb = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      atom.rotation.y = f * 0.004; nucleus.rotation.set(f * 0.003, f * 0.005, 0);
      shells.forEach(({ q, es, r, w }) => es.forEach((e, i) => { const a = (i / es.length) * Math.PI * 2 + f * w; e.position.set(Math.cos(a) * r, Math.sin(a) * r, 0).applyQuaternion(q); }));
      const ve = shells[5].es[0]; spin.position.copy(ve.position).add(new THREE.Vector3(0, 0.1, 0)); spin.rotation.z = Math.PI * ease(pu);
      vHalo.position.copy(ve.position); vHalo.scale.setScalar(1 + 1.2 * pu * (0.7 + 0.3 * Math.sin(f * 0.3)));
      nHalo.scale.setScalar(1 + 0.6 * pu + 0.08 * Math.sin(f * 0.1)); (nHalo.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.4 * pu;
      const A = 0.32 * vb, k = (Math.PI * 2 * 5) / LW;
      eb.forEach((m, i) => { const x = (i / (NW - 1)) * LW, env = clamp01(vb * 1.4 - x / LW * 0.4); m.visible = vb > 0 && x / LW <= vb * 1.3; m.position.set(x, A * env * Math.sin(k * x - f * 0.9), 0); });
      bb.forEach((m, i) => { const x = (i / (NW - 1)) * LW, env = clamp01(vb * 1.4 - x / LW * 0.4); m.visible = vb > 0 && x / LW <= vb * 1.3; m.position.set(x, 0, A * env * Math.sin(k * x - f * 0.9)); });
      wave.rotation.x = 0.35;
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "pulso") pu = ease(u); if (name === "vibrar") vb = ease(u); paint(lf); } };
  },
};

// segundo-cesio · la red mundial de relojes atómicos: 80 laboratorios en la Tierra y satélites GPS que los comparan
export const red_relojes: HeroDef = {
  kind: "primitive",
  when: "Red mundial de relojes atómicos: unos 80 laboratorios (puntos dorados) sobre la Tierra conectados con satélites GPS en órbita que los comparan; de destellar cada uno a su ritmo pasan a latir a la vez: hora oficial, UTC, sincronizar relojes, comparar por satélite, red global.",
  poses: ["red"],
  actions: { sincronizar: "Los laboratorios dejan de parpadear cada uno a su ritmo y laten todos a la vez, los enlaces con los satélites se encienden y sale una onda de la Tierra (se queda así): se comparan, sincronizan, la media, la hora oficial, a la vez." },
  center: [0, 1.25, 0], radius: 1.3,
  anchors: { hero: [0, 1.25, 0], top: [0, 2.9, 0], base: [0, 0.1, 0], tierra: [0, 1.25, 0], satelite: [1.5, 2.0, 0.3] },
  build: (_L, pose) => {
    poseOf(red_relojes, pose, "red_relojes");
    const b = bin(), root = new THREE.Group(), sys = new THREE.Group(), globe = new THREE.Group(); sys.position.y = 1.25; sys.rotation.x = 0.3; sys.add(globe); root.add(sys);
    const tex = earthNeonTex(b, "#0b1f48", "#050f28", "#123a5c", "#5fe3ff");
    globe.add(new THREE.Mesh(b.track(new THREE.SphereGeometry(0.95, 64, 48)), mat(b, "#ffffff", { map: tex, emissive: new THREE.Color("#ffffff"), emissiveMap: tex, emissiveIntensity: 0.45, roughness: 0.7 })));
    sys.add(new THREE.Mesh(b.track(new THREE.SphereGeometry(1.0, 40, 28)), ghostMat(b, "#5fe3ff", 0.1)));
    // 80 laboratorios en tierra firme (puntos dorados con su pedestal)
    const labs: THREE.Mesh[] = [], lg = b.track(new THREE.SphereGeometry(0.026, 10, 8));
    for (let i = 0; i < 4000 && labs.length < 80; i++) {
      const lat = -45 + hash1(i * 3 + 1) * 110, lon = -180 + hash1(i * 3 + 2) * 360; if (!inLand(lon, lat)) continue;
      const m = new THREE.Mesh(lg, beam(b, NEON.gold, 2.2)); m.position.copy(ll(lat, lon, 0.97)); m.userData.ph = hash1(i + 77) * 6.28; globe.add(m); labs.push(m);
    }
    // satélites GPS (cuerpo dorado, dos paneles) en órbitas inclinadas
    const sats = [0, 1, 2, 3, 4].map((k) => {
      const orb = new THREE.Group(); orb.rotation.set(0.9 + 0.35 * k, 1.25 * k, 0); sys.add(orb);
      const r = 1.6 + 0.08 * (k % 2); orb.add(new THREE.Mesh(b.track(new THREE.TorusGeometry(r, 0.004, 4, 120)), beam(b, "#7f9cff", 0.8, { transparent: true, opacity: 0.5 })));
      const s = new THREE.Group(); s.add(box(b, 0.11, 0.11, 0.14, mat(b, "#d9a441", { metalness: 0.7, roughness: 0.35, emissive: new THREE.Color("#4a3008") })));
      [-1, 1].forEach((d) => s.add(place(box(b, 0.26, 0.01, 0.1, mat(b, "#1d3c9a", { metalness: 0.4, roughness: 0.3, emissive: new THREE.Color("#0a1f60") })), [d * 0.2, 0, 0]), rod(b, [d * 0.055, 0, 0], [d * 0.08, 0, 0], 0.008, mat(b, "#cfd5ea", { metalness: 0.8 }))));
      s.add(place(cyl(b, 0.02, 0.035, 0.05, mat(b, "#e8ebf6", { metalness: 0.5 }), 10), [0, -0.08, 0]));
      s.scale.setScalar(1.5); s.add(halo(b, "rgba(255,220,150,0.8)", 0.5, 0.6)); orb.add(s); return { orb, s, r, w: 0.006 + 0.002 * k, ph: k * 1.3 };
    });
    // enlaces satélite-laboratorio (segmentos que se recalculan cada frame)
    const NL = sats.length * 3, pos = new Float32Array(NL * 6), lgeo = b.track(new THREE.BufferGeometry()); lgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const lmat = b.track(new THREE.LineBasicMaterial({ color: new THREE.Color(NEON.cyan).multiplyScalar(1.8), transparent: true, opacity: 0.25 })); sys.add(new THREE.LineSegments(lgeo, lmat));
    const wave = new THREE.Mesh(b.track(new THREE.TorusGeometry(1.0, 0.01, 5, 96)), beam(b, NEON.cyan, 2, { transparent: true, opacity: 0 })); sys.add(wave);
    let sy = 0, lf = 0;
    const tmp = new THREE.Vector3(), lw = new THREE.Vector3();
    const paint = (f: number) => {
      lf = f; globe.rotation.y = f * 0.005;
      const beat = Math.max(0, Math.sin(f * 0.21)) ** 6;
      labs.forEach((m) => { const own = Math.max(0, Math.sin(f * 0.21 + m.userData.ph)) ** 6, v = own * (1 - sy) + beat * sy; m.scale.setScalar(0.8 + 1.1 * v); });
      sats.forEach(({ s, r, w, ph }) => { const a = ph + f * w; s.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); s.lookAt(0, 0, 0); });
      sys.updateMatrixWorld(true);
      const inv = sys.matrixWorld.clone().invert();
      sats.forEach(({ s }, k) => {
        const sp = s.getWorldPosition(tmp).clone().applyMatrix4(inv);
        const near = labs.map((m) => ({ m, d: m.getWorldPosition(lw).clone().applyMatrix4(inv).distanceTo(sp) })).sort((x, y) => x.d - y.d).slice(0, 3);
        near.forEach(({ m }, j) => { const lp = m.getWorldPosition(lw).clone().applyMatrix4(inv), o = (k * 3 + j) * 6; pos.set([sp.x, sp.y, sp.z, lp.x, lp.y, lp.z], o); });
      });
      lgeo.attributes.position.needsUpdate = true; lmat.opacity = 0.25 + 0.6 * sy * (0.6 + 0.4 * beat);
      const t = (f * 0.015) % 1; wave.scale.setScalar(1 + 1.2 * t); wave.rotation.x = Math.PI / 2; (wave.material as THREE.MeshBasicMaterial).opacity = sy * 0.8 * (1 - t);
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "sincronizar") sy = ease(u); paint(lf); } };
  },
};

// fermi-filtro · campo de estrellas con algún planeta: cada estrella lanza un aviso que nadie contesta; al «apagar», todo queda mudo
export const cielo_mudo: HeroDef = {
  kind: "primitive",
  when: "Cielo lleno de estrellas (algunas con planetas), cada una con su pulso de señal que se apaga sin respuesta: el silencio del universo, nadie contesta, ¿estamos solos?, buscar extraterrestres, la paradoja de Fermi, puntos de luz sin señal.",
  poses: ["cielo"],
  actions: {
    encender: "Las estrellas aparecen una a una en el cielo (se quedan): mira al cielo, cada punto de luz, aparecen, se encienden.",
    apagar: "Los pulsos de señal se cortan y las estrellas se atenúan: todo queda en silencio (se queda así): nada, silencio, ninguno, nadie contesta, ni una voz.",
  },
  center: [0, 1.9, -0.2], radius: 1.6,
  anchors: { hero: [0, 1.9, 0], top: [0, 3.3, 0], base: [0, 0.5, 0], estrella: [0.9, 2.4, -0.2], cielo: [0, 2.1, -0.6] },
  build: (_L, pose) => {
    poseOf(cielo_mudo, pose, "cielo_mudo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tints = ["#ffffff", "#ffe6a8", "#a9c8ff", "#ffd0a0", "#d8e4ff"];
    // estrellas: núcleo brillante + halo; algunas con un planeta diminuto en órbita
    const stars = Array.from({ length: 46 }, (_, i) => {
      const x = -1.7 + hash1(i + 3) * 3.4, y = 0.5 + hash1(i + 11) * 2.9, z = -1.2 + hash1(i + 29) * 1.8, s = 0.03 + hash1(i + 41) ** 2 * 0.06, c = tints[i % tints.length];
      const n = place(ball(b, s, beam(b, c, 2.2, { transparent: true, opacity: 1 }), 10), [x, y, z]);
      const h = halo(b, "rgba(255,240,210,0.9)", s * 9, 0.55); h.position.set(x, y, z);
      const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.1, 0.006, 4, 40)), beam(b, TONE.cyan, 1.4, { transparent: true, opacity: 0 })); ring.position.set(x, y, z);
      g.add(n, h, ring);
      let pl: THREE.Mesh | null = null;
      if (i % 7 === 0) { pl = ball(b, 0.018, mat(b, i % 2 ? "#5fa8ff" : "#d98a4a", { roughness: 0.6, emissive: new THREE.Color("#203050"), emissiveIntensity: 0.6 }), 10); g.add(pl); }
      return { n, h, ring, pl, x, y, z, s, ph: hash1(i + 53), delay: hash1(i + 61) * 0.85 };
    });
    // polvo de fondo y una franja de nebulosa muy tenue
    const D = 500, dp = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) dp.set([-3.4 + hash1(i + 101) * 6.8, 0.4 + hash1(i + 211) * 3.2, -2.6 + hash1(i + 307) * 1.0], i * 3);
    const dgeo = b.track(new THREE.BufferGeometry()); dgeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dgeo, b.track(new THREE.PointsMaterial({ size: 0.018, color: "#c9d6ff", transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: true })));
    const neb = halo(b, "rgba(160,110,235,0.6)", 5.2, 0.55); neb.position.set(-0.5, 2.1, -2.4); neb.scale.set(1.5, 0.75, 1);
    const neb2 = halo(b, "rgba(90,150,240,0.55)", 4.2, 0.45); neb2.position.set(0.9, 1.3, -2.3); neb2.scale.set(1.3, 0.6, 1);
    g.add(dust, neb, neb2);
    root.add(g);
    let vis = 1, mute = 0, lf = 0;
    const paint = (f: number) => {
      lf = f; dust.rotation.z = Math.sin(f * 0.003) * 0.02;
      stars.forEach((st) => {
        const show = clamp01((vis - st.delay) / 0.15), tw = 0.8 + 0.2 * Math.sin(f * 0.11 + st.ph * 20), dim = 1 - 0.55 * mute;
        st.n.scale.setScalar(Math.max(0.001, show * (0.9 + 0.2 * tw)));
        (st.n.material as THREE.MeshBasicMaterial).opacity = show * dim;
        (st.h.material as THREE.MeshBasicMaterial).opacity = 0.55 * show * tw * dim;
        const t = (f * 0.012 + st.ph) % 1;
        st.ring.scale.setScalar(0.3 + t * 2.2);
        (st.ring.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t) * show * (1 - mute) * (st.s > 0.035 ? 1 : 0.5);
        if (st.pl) { const a = f * 0.03 + st.ph * 6; st.pl.position.set(st.x + Math.cos(a) * 0.12, st.y + Math.sin(a) * 0.04, st.z + Math.sin(a) * 0.12); st.pl.visible = show > 0.5; }
      });
    };
    return {
      ...done(root, b, paint),
      act: (name, u) => { if (name === "encender") vis = u; if (name === "apagar") mute = ease(u); paint(lf); },
    };
  },
};

// fermi-filtro · radiotelescopio de plato: pedestal, montura de horquilla, plato parabólico con costillas, cuadrípode con receptor y caseta de control
export const radiotelescopio: HeroDef = {
  kind: "primitive",
  when: "Radiotelescopio de plato parabólico que escucha el cielo: SETI, buscar señales extraterrestres, ondas de radio del espacio, la señal Wow!, escuchar el universo, antena gigante, observatorio de radio.",
  poses: ["escucha"],
  actions: {
    escuchar: "El plato barre el cielo despacio y un cono de escucha tenue sube desde él (se queda así): escuchar, buscar, llevamos décadas, apuntar al cielo.",
    senal: "Un único pulso baja del cielo al receptor, que destella y vuelve a apagarse: una señal extraña, un pico que no se repite, algo que llega una sola vez.",
  },
  center: [0, 1.5, 0], radius: 1.6,
  anchors: { hero: [0, 1.7, 0], top: [0, 3.0, 0], base: [0, 0.05, 0], plato: [0, 1.9, 0.2], receptor: [0, 2.5, 0.5], cielo: [0.4, 3.4, 1.2], caseta: [1.5, 0.35, 0.6] },
  build: (_L, pose) => {
    poseOf(radiotelescopio, pose, "radiotelescopio");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const concrete = mat(b, "#a9a8a2", { roughness: 0.9 }), steel = mat(b, "#c9ced8", { roughness: 0.35, metalness: 0.6 }), dark = mat(b, "#3b4150", { roughness: 0.5, metalness: 0.5 });
    const white = mat(b, "#f2f3f6", { roughness: 0.4, metalness: 0.15, side: THREE.DoubleSide });
    // suelo propio, pedestal y vía de azimut
    g.add(place(cyl(b, 2.0, 2.05, 0.06, mat(b, "#6f7a52", { roughness: 1 }), 48), [0, 0.03, 0]));
    g.add(place(cyl(b, 0.55, 0.7, 0.5, concrete, 32), [0, 0.3, 0]));
    const track = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.62, 0.03, 8, 48)), dark); track.rotation.x = Math.PI / 2; track.position.y = 0.56; g.add(track);
    // cabeza giratoria (azimut) con horquilla, eje de elevación y contrapeso
    const az = new THREE.Group(); az.position.y = 0.58; g.add(az);
    az.add(place(cyl(b, 0.5, 0.5, 0.14, steel, 32), [0, 0.07, 0]), place(box(b, 0.5, 0.3, 0.5, dark), [0, 0.3, -0.05]));
    [-1, 1].forEach((s) => { az.add(place(box(b, 0.12, 1.0, 0.36, steel), [s * 0.62, 0.65, 0])); az.add(rod(b, [s * 0.62, 0.15, 0.17], [s * 0.25, 0.15, 0.25], 0.025, steel)); });
    const el = new THREE.Group(); el.position.y = 1.15; az.add(el);
    el.add(place(cyl(b, 0.07, 0.07, 1.4, dark, 16), [0, 0, 0])); el.children[el.children.length - 1].rotation.z = Math.PI / 2;
    el.add(place(box(b, 0.42, 0.42, 0.3, dark), [0, -0.3, -0.5]));
    // plato parabólico (torno), aros de paneles, costillas traseras y borde
    const R = 1.25, F = 0.62, prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const r = (i / 24) * R; prof.push(new THREE.Vector2(r, (r * r) / (4 * F))); }
    const dish = new THREE.Group(); dish.position.set(0, 0.12, 0.12); el.add(dish);
    dish.add(new THREE.Mesh(b.track(new THREE.LatheGeometry(prof, 64)), white));
    const seam = mat(b, "#b9bfcc", { roughness: 0.5, metalness: 0.3 });
    [0.4, 0.75, 1.05].forEach((r) => { const t = new THREE.Mesh(b.track(new THREE.TorusGeometry(r, 0.008, 4, 64)), seam); t.rotation.x = Math.PI / 2; t.position.y = (r * r) / (4 * F) + 0.004; dish.add(t); });
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, pts: [number, number, number][] = [0.1, 0.5, 0.9, R].map((r) => [Math.cos(a) * r, (r * r) / (4 * F) - 0.03, Math.sin(a) * r]); dish.add(tube(b, pts, 0.012, dark, 12)); dish.add(rod(b, [Math.cos(a) * 0.6, 0.05, Math.sin(a) * 0.6], [0, -0.2, 0], 0.01, dark)); }
    const lip = new THREE.Mesh(b.track(new THREE.TorusGeometry(R, 0.025, 6, 72)), steel); lip.rotation.x = Math.PI / 2; lip.position.y = (R * R) / (4 * F); dish.add(lip);
    // cuadrípode al foco con receptor (bocina) y su luz
    const fy = F, rimY = (R * R) / (4 * F);
    [0, 1, 2, 3].forEach((k) => { const a = k * Math.PI / 2 + Math.PI / 4; dish.add(rod(b, [Math.cos(a) * R * 0.95, rimY, Math.sin(a) * R * 0.95], [0, fy - 0.04, 0], 0.014, steel)); });
    dish.add(place(cyl(b, 0.09, 0.06, 0.2, dark, 16), [0, fy + 0.05, 0]));
    const feedM = glowMat(b, "#ffcc66", 0.2, { roughness: 0.3 }); const feed = place(cyl(b, 0.05, 0.05, 0.03, feedM, 14), [0, fy - 0.06, 0]); dish.add(feed);
    const flash = halo(b, "rgba(255,220,120,1)", 1.4, 0); flash.position.set(0, fy - 0.05, 0); dish.add(flash);
    // cono de escucha tenue que sale del plato hacia el cielo
    const cone = new THREE.Mesh(b.track(new THREE.CylinderGeometry(R * 1.6, R * 0.95, 2.4, 40, 1, true)), beam(b, TONE.cyan, 1.0, { transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    cone.position.y = rimY + 1.2; dish.add(cone);
    const pulse = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.5, 0.025, 6, 40)), beam(b, "#ffd27a", 2.2, { transparent: true, opacity: 0 })); pulse.rotation.x = Math.PI / 2; dish.add(pulse);
    el.rotation.x = 0.7;
    // caseta de control con ventana encendida y antena pequeña
    const hut = new THREE.Group(); hut.position.set(1.45, 0.06, 0.55); g.add(hut);
    hut.add(place(box(b, 0.55, 0.36, 0.42, mat(b, "#d8d2c4", { roughness: 0.8 })), [0, 0.18, 0]), place(box(b, 0.62, 0.05, 0.5, dark), [0, 0.385, 0]));
    hut.add(place(box(b, 0.2, 0.12, 0.01, glowMat(b, "#ffd98a", 0.9)), [0.08, 0.22, 0.215]), place(box(b, 0.1, 0.2, 0.01, dark), [-0.16, 0.1, 0.215]));
    hut.add(rod(b, [0.18, 0.41, 0], [0.18, 0.7, 0], 0.008, steel));
    g.rotation.y = -0.35; root.add(g); shadows(g);
    let lis = 0, sig = 0, lf = 0;
    const paint = (f: number) => {
      lf = f; az.rotation.y = 0.25 * Math.sin(f * 0.006) + lis * 0.35 * Math.sin(f * 0.01); el.rotation.x = 0.7 + 0.04 * Math.sin(f * 0.008);
      (cone.material as THREE.MeshBasicMaterial).opacity = 0.05 * lis + 0.03 * lis * Math.sin(f * 0.08);
      const travel = clamp01(sig / 0.7), bump = Math.sin(Math.PI * clamp01((sig - 0.6) / 0.4));
      pulse.position.y = rimY + 2.4 * (1 - travel); pulse.scale.setScalar(1.4 - 1.1 * travel);
      (pulse.material as THREE.MeshBasicMaterial).opacity = sig > 0 && sig < 0.72 ? 0.95 : 0;
      (flash.material as THREE.MeshBasicMaterial).opacity = 0.95 * bump; feedM.emissiveIntensity = 0.2 + 2.5 * bump;
    };
    return {
      ...done(root, b, paint),
      act: (name, u) => { if (name === "escuchar") lis = ease(u); if (name === "senal") sig = u; paint(lf); },
    };
  },
};

// fermi-filtro · el Gran Filtro: escalera de cinco etapas (roca, células, vida compleja, inteligencia, civilización entre estrellas) cortada por un muro rojo
export const gran_filtro: HeroDef = {
  kind: "primitive",
  when: "El Gran Filtro (hipótesis de Robin Hanson): una escalera de etapas desde una roca sin vida hasta una civilización entre estrellas, cortada por un muro que casi nadie cruza; luces que suben y se apagan contra él, y un marcador de dónde estamos nosotros: ¿el filtro quedó atrás o está delante?, etapas de la vida, evolución, extinción, autodestrucción.",
  poses: ["escalera"],
  actions: {
    subir: "Muchas luces suben la escalera; casi todas se apagan en rojo contra el muro y solo una llega arriba: casi nadie lo supera, filtro, intentos.",
    vida: "El muro se desliza al primer escalón (entre la roca y las células): el origen de la vida.",
    inteligencia: "El muro se desliza al escalón de la inteligencia (entre la vida compleja y nosotros): el salto a la inteligencia.",
    destruirse: "El muro se desliza delante de nosotros (antes de las estrellas) y late en rojo: destruirse, autodestrucción.",
    atras: "El muro se va detrás de nosotros y nuestro marcador se pone verde: quedó atrás, ya lo pasamos, rareza afortunada.",
    delante: "El muro se pone delante de nosotros, crece y late en rojo; nuestro marcador se pone rojo: está delante, nos espera.",
  },
  // anclas ya giradas (g.rotation.y = 1, escala 1,1): la escalera sube hacia la izquierda y el fondo
  center: [-0.28, 1.49, -0.18], radius: 1.5,
  anchors: { hero: [-0.28, 1.49, -0.18], top: [-1.11, 3.19, -0.71], base: [0.83, 0.06, 0.53], roca: [1.02, 0.5, 0.65], celulas: [0.46, 0.99, 0.3], compleja: [-0.09, 1.49, -0.06], nosotros: [-0.65, 2.15, -0.42], estrellas: [-1.2, 2.7, -0.77], muro: [-0.37, 2.09, -0.24] },
  build: (_L, pose) => {
    poseOf(gran_filtro, pose, "gran_filtro");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const Z = (i: number) => 1.1 - i * 0.6, Y = (i: number) => 0.3 + i * 0.45;
    const stepM = [0, 1, 2, 3, 4].map((i) => mat(b, col("#4a5788", "#8091d0", i / 4), { roughness: 0.55, metalness: 0.15, emissive: col("#1a2450", "#2e4088", i / 4), emissiveIntensity: 0.7 }));
    const edge = beam(b, "#8fb2ff", 1.3);
    // escalones: bloque redondeado con un filo de luz
    [0, 1, 2, 3, 4].forEach((i) => {
      const h = Y(i); g.add(place(rbox(b, 1.7, h, 0.6, 0.04, stepM[i]), [0, h / 2, Z(i)]));
      g.add(rod(b, [-0.85, h + 0.005, Z(i) + 0.3], [0.85, h + 0.005, Z(i) + 0.3], 0.008, edge));
    });
    const top = (i: number): [number, number, number] => [0, Y(i), Z(i)];
    // 0 roca sin vida
    const rock = new THREE.Mesh(b.track(new THREE.DodecahedronGeometry(0.17, 0)), mat(b, "#8a8378", { roughness: 1, flatShading: true }));
    rock.position.set(0.15, Y(0) + 0.17, Z(0)); rock.scale.set(1.7, 1.15, 1.4); g.add(rock, place(ball(b, 0.06, mat(b, "#6d675e", { roughness: 1, flatShading: true }), 6), [-0.15, Y(0) + 0.05, Z(0) + 0.1]));
    // 1 células: racimo translúcido con núcleos
    const cells = new THREE.Group(); cells.position.set(0, Y(1) + 0.17, Z(1)); cells.scale.setScalar(1.4); g.add(cells);
    [[0, 0, 0], [0.16, 0.02, 0.05], [-0.15, 0.01, -0.03], [0.04, 0.13, -0.05], [-0.06, 0.03, 0.15]].forEach(([x, y, z], k) => {
      cells.add(place(ball(b, 0.09, ghostMat(b, "#6cf0a0", 0.45), 16), [x, y, z]), place(ball(b, 0.03, glowMat(b, "#2f9d5c", 0.7), 8), [x + 0.02, y + 0.01, z + 0.02 * k]));
    });
    // 2 vida compleja: un árbol con copa en tres pisos y hierba
    const tree = new THREE.Group(); tree.position.set(0.1, Y(2), Z(2)); tree.scale.setScalar(1.4); g.add(tree);
    tree.add(place(cyl(b, 0.03, 0.045, 0.25, mat(b, "#7a5230", { roughness: 0.9 }), 10), [0, 0.125, 0]));
    [0, 1, 2].forEach((k) => tree.add(place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.2 - k * 0.05, 0.22, 12)), mat(b, col("#2f8f4a", "#58c46a", k / 2), { roughness: 0.8 })), [0, 0.28 + k * 0.12, 0])));
    for (let k = 0; k < 6; k++) g.add(place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.02, 0.09, 5)), mat(b, "#4fb35c")), [-0.35 + hash1(k + 5) * 0.3, Y(2) + 0.045, Z(2) - 0.1 + hash1(k + 9) * 0.25]));
    // 3 inteligencia (nosotros): figura humana y un marcador de anillo encima
    const us = new THREE.Group(); us.position.set(0, Y(3), Z(3)); us.scale.setScalar(1.45); g.add(us);
    const skin = mat(b, "#e8d6c8", { roughness: 0.6, emissive: new THREE.Color("#302018"), emissiveIntensity: 0.4 });
    us.add(place(new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.06, 0.16, 6, 12)), mat(b, "#4a78c8", { roughness: 0.6 })), [0, 0.2, 0]), place(ball(b, 0.055, skin, 16), [0, 0.37, 0]));
    [-1, 1].forEach((s) => { us.add(rod(b, [s * 0.04, 0.12, 0], [s * 0.05, 0.0, 0], 0.022, mat(b, "#2a3048"))); us.add(rod(b, [s * 0.07, 0.27, 0], [s * 0.12, 0.13, 0.02], 0.018, skin)); });
    const markM = beam(b, TONE.cyan, 2, { transparent: true, opacity: 0.95 });
    const mark = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.11, 0.012, 6, 36)), markM); mark.rotation.x = Math.PI / 2; mark.position.y = 0.55; us.add(mark);
    const pin = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.04, 0.09, 12)), markM); pin.rotation.x = Math.PI; pin.position.y = 0.66; us.add(pin);
    const usGlow = halo(b, "rgba(120,220,255,0.9)", 0.9, 0.35); usGlow.position.y = 0.3; us.add(usGlow);
    // 4 civilización entre estrellas: cohete y estación en anillo, dorados
    const civ = new THREE.Group(); civ.position.set(0, Y(4), Z(4)); civ.scale.setScalar(1.4); g.add(civ);
    const gold = mat(b, "#f0c25a", { metalness: 0.6, roughness: 0.3, emissive: new THREE.Color("#5a3a08"), emissiveIntensity: 0.6 });
    civ.add(place(cyl(b, 0.04, 0.05, 0.24, gold, 14), [-0.25, 0.17, 0]), place(new THREE.Mesh(b.track(new THREE.ConeGeometry(0.04, 0.09, 14)), gold), [-0.25, 0.335, 0]));
    const st = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.16, 0.03, 8, 32)), gold); st.position.set(0.18, 0.32, 0); civ.add(st, place(ball(b, 0.05, gold, 12), [0.18, 0.32, 0]));
    const civGlow = halo(b, "rgba(255,210,120,0.9)", 1.1, 0.35); civGlow.position.y = 0.3; civ.add(civGlow);
    // el muro: panel rojo translúcido con trama, entre dos escalones
    const wallTex = screenTex(b.track, 256, 256, (c) => {
      c.fillStyle = "rgba(255,40,60,0.35)"; c.fillRect(0, 0, 256, 256); c.strokeStyle = "rgba(255,150,160,0.9)"; c.lineWidth = 3;
      for (let i = 0; i <= 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); }
      c.lineWidth = 8; c.strokeRect(4, 4, 248, 248);
    });
    const wallM = new THREE.MeshBasicMaterial({ map: wallTex, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, color: new THREE.Color("#ff5060").multiplyScalar(1.6) }); b.track(wallM);
    const wall = new THREE.Mesh(b.track(new THREE.PlaneGeometry(1.9, 0.7)), wallM); g.add(wall);
    const wallGlow = halo(b, "rgba(255,60,80,0.9)", 2.4, 0.4); g.add(wallGlow);
    // luces que intentan subir (la 0 es la única que cruza)
    const NC = 18, climbers = Array.from({ length: NC }, (_, k) => { const m = ball(b, 0.035, beam(b, "#ffe9a8", 2.2, { transparent: true, opacity: 0 }), 10); g.add(m); return { m, k, ph: hash1(k + 71), x: -0.65 + hash1(k + 83) * 1.3 }; });
    const burst = climbers.map(() => { const h = halo(b, "rgba(255,70,90,1)", 0.35, 0); g.add(h); return h; });
    const halos = [rock, cells, tree, us, civ].map((o) => { const h = halo(b, "rgba(255,230,160,0.9)", 0.9, 0); h.position.copy(o.position).add(new THREE.Vector3(0, 0.2, 0.05)); g.add(h); return h; });
    g.rotation.y = 1.0; g.scale.setScalar(1.1); root.add(g); shadows(g);
    let sub = 0, lf = 0; const u = { vida: 0, inteligencia: 0, destruirse: 0, atras: 0, delante: 0 };
    const paint = (f: number) => {
      lf = f;
      // posición del muro (hueco 0..3, entre el escalón n y el n+1)
      let gap = 2; gap += (0 - gap) * u.vida; gap += (2 - gap) * u.inteligencia; gap += (3 - gap) * u.destruirse; gap += (2 - gap) * u.atras; gap += (3 - gap) * u.delante;
      const wz = Z(gap + 0.5), wy = Y(gap + 1) + 0.3;
      const red = Math.max(u.destruirse, u.delante), beat = 0.5 + 0.5 * Math.sin(f * 0.25);
      wall.position.set(0, wy, wz + 0.3); wall.scale.set(1, 1 + 0.35 * u.delante, 1);
      wallM.opacity = 0.5 + 0.35 * red * beat; wallGlow.position.copy(wall.position);
      (wallGlow.material as THREE.MeshBasicMaterial).opacity = 0.3 + 0.45 * red * beat;
      halos[1].material.opacity = 0.7 * u.vida * (1 - u.inteligencia); halos[3].material.opacity = 0.7 * u.inteligencia * (1 - u.destruirse) + 0.6 * u.atras;
      halos[4].material.opacity = 0.7 * u.destruirse * (1 - u.atras);
      markM.color.copy(col(TONE.cyan, "#5dff8a", u.atras).lerp(new THREE.Color("#ff4a5a"), u.delante)).multiplyScalar(2);
      mark.scale.setScalar(1 + 0.25 * Math.max(u.atras, u.delante) * beat); mark.rotation.z = f * 0.03; pin.position.y = 0.66 + 0.03 * Math.sin(f * 0.1);
      civ.rotation.y = f * 0.01; st.rotation.y = f * 0.03; cells.rotation.y = f * 0.008;
      // escaladores: avanzan un escalón cada ~0,6 s con un saltito; chocan con el muro salvo el 0
      climbers.forEach(({ m, k, ph, x }) => {
        const cyc = 150, t = ((f + ph * cyc) % cyc) / cyc * 5.2, alive = sub > 0.02;
        const stop = k === 0 ? 4 : gap + 0.5, s = Math.min(t, stop), i0 = Math.floor(s), fr = s - i0, i1 = Math.min(4, i0 + 1);
        const hop = Math.sin(Math.PI * fr) * 0.18, y = Y(i0) + (Y(i1) - Y(i0)) * fr + hop + 0.04, z = Z(i0) + (Z(i1) - Z(i0)) * fr + 0.15;
        m.position.set(x * (k === 0 ? 0.3 : 1), y, z);
        const hit = k !== 0 && t > stop, after = hit ? (t - stop) / 0.5 : 0;
        (m.material as THREE.MeshBasicMaterial).opacity = alive ? (hit ? Math.max(0, 1 - after) : Math.min(1, t * 4)) : 0;
        (m.material as THREE.MeshBasicMaterial).color.set(hit ? "#ff5060" : k === 0 ? "#ffe27a" : "#ffe9a8").multiplyScalar(2.2);
        burst[k].position.copy(m.position); (burst[k].material as THREE.MeshBasicMaterial).opacity = alive && hit ? 0.9 * Math.max(0, 1 - after) : 0;
      });
    };
    return {
      ...done(root, b, paint),
      act: (name, v) => { if (name === "subir") sub = v; else if (name in u) u[name as keyof typeof u] = ease(v); paint(lf); },
    };
  },
};

// ---------------------------------------------------------------- control-rebote
// El mando de la tele, la sala con la pared que rebota, el receptor de la tele y el vidrio común frente al Low-E.
// El infrarrojo es invisible: se pinta en violeta, el color con el que lo enseña la cámara del celular.
const IRC = "#c45cff";
const V = (p: P3) => new THREE.Vector3(...p);
/** anclas de un objeto girado: el punto local p, girado con e, escalado con s y movido a o (espacio del root) */
const xf = (e: THREE.Euler, o: P3, s = 1) => (p: P3): P3 => { const v = V(p).multiplyScalar(s).applyEuler(e).add(V(o)); return [v.x, v.y, v.z]; };

/** mando de tele: cuerpo redondeado, power rojo, botones de color, teclado 3x4, cruceta, volumen y canal, y la ventana
 *  infrarroja en la punta (+Y). `cut` vuelve la carcasa translúcida y enseña placa, chip, pistas, LED y dos pilas AA. */
const remoteBody = (b: Bin, cut = false) => {
  const g = new THREE.Group();
  const shell = cut ? ghostMat(b, "#9aa6d6", 0.18) : mat(b, "#23262f", { roughness: 0.55, metalness: 0.15 });
  g.add(rbox(b, 0.62, 2.3, 0.2, 0.09, shell));
  if (!cut) g.add(place(rbox(b, 0.56, 2.22, 0.02, 0.06, mat(b, "#30343f", { roughness: 0.35, metalness: 0.35 })), [0, -0.01, 0.095]));
  const rub = mat(b, "#555b6e", { roughness: 0.8 });
  const key = (w: number, h: number, x: number, y: number, m: THREE.Material = rub) => { const k = rbox(b, w, h, 0.05, Math.min(w, h) * 0.45, m); k.position.set(x, y, 0.12); g.add(k); return k; };
  const powerMat = glowMat(b, "#e0354a", 0.25, { roughness: 0.5 });
  const power = key(0.15, 0.15, -0.17, 0.93, powerMat);
  key(0.13, 0.08, 0.17, 0.93);
  ["#e0354a", "#3fbf6a", "#e8c23a", "#3a74e0"].forEach((c, i) => key(0.1, 0.05, -0.195 + i * 0.13, 0.77, mat(b, c, { roughness: 0.6 })));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) key(0.14, 0.1, -0.18 + c * 0.18, 0.6 - r * 0.15);
  const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.17, 0.05, 10, 36)), rub); ring.position.set(0, -0.3, 0.12); g.add(ring);
  key(0.13, 0.13, 0, -0.3, mat(b, "#6a7088", { roughness: 0.5 }));
  [[0, -0.12], [0, -0.48], [-0.18, -0.3], [0.18, -0.3]].forEach(([x, y]) => g.add(place(ball(b, 0.018, mat(b, "#c9cede"), 8), [x, y, 0.17])));
  key(0.12, 0.34, -0.17, -0.76); key(0.12, 0.34, 0.17, -0.76); key(0.09, 0.07, 0, -0.66); key(0.09, 0.07, 0, -0.86);
  // ventana infrarroja (cúpula oscura) con el LED dentro
  const win = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), mat(b, "#3a0a18", { roughness: 0.12, metalness: 0.2, transparent: true, opacity: cut ? 0.5 : 0.85 }));
  win.position.set(0, 1.15, 0); g.add(win);
  const ledMat = glowMat(b, "#5a1830", 0.3, { roughness: 0.3 }), led = ball(b, 0.05, ledMat, 16); led.position.set(0, 1.14, 0); g.add(led);
  const chipMat = glowMat(b, "#12162b", 0.2, { roughness: 0.3, metalness: 0.5 });
  const trace: THREE.Vector3[] = [V([0, 0.27, 0.05]), V([0.12, 0.45, 0.05]), V([0.12, 0.98, 0.05]), V([0, 1.1, 0.05])];
  if (cut) {
    g.add(place(box(b, 0.52, 2.02, 0.025, mat(b, "#1f6b3f", { roughness: 0.6 })), [0, 0.05, 0.03]));
    const gold = glowMat(b, "#ffd36b", 0.5, { metalness: 0.6, roughness: 0.3 });
    g.add(tube(b, trace.map((v) => [v.x, v.y, v.z] as P3), 0.01, gold));
    [[-0.12, 0.3, 0.05], [-0.18, 0.1, 0.05], [0.1, -0.1, 0.05]].forEach((p) => g.add(tube(b, [[0, 0.15, 0.05], p as P3, [(p[0] as number) * 1.2, (p[1] as number) - 0.3, 0.05]], 0.007, gold)));
    g.add(place(box(b, 0.22, 0.22, 0.045, chipMat), [0, 0.15, 0.065]));
    for (let k = 0; k < 5; k++) [-1, 1].forEach((s) => { g.add(place(box(b, 0.04, 0.022, 0.01, gold), [s * 0.13, 0.07 + k * 0.04, 0.05])); g.add(place(box(b, 0.022, 0.04, 0.01, gold), [-0.08 + k * 0.04, 0.15 + s * 0.13, 0.05])); });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const d = cyl(b, 0.035, 0.035, 0.008, gold, 14); d.rotation.x = Math.PI / 2; d.position.set(-0.18 + c * 0.18, 0.6 - r * 0.15, 0.047); g.add(d); }
    [[-0.03, 1.0], [0.03, 1.0]].forEach(([x, y]) => g.add(rod(b, [x, y, 0.04], [x * 0.6, 1.12, 0.0], 0.008, mat(b, "#cfd5ea", { metalness: 0.8 }))));
    [-0.12, 0.12].forEach((x, i) => {
      const bt = cyl(b, 0.075, 0.075, 0.52, mat(b, i ? "#2c3550" : "#3b2f52", { roughness: 0.4, metalness: 0.3 }), 20); bt.position.set(x, -0.62, -0.04); g.add(bt);
      g.add(place(cyl(b, 0.076, 0.076, 0.12, mat(b, "#d9a441", { metalness: 0.7, roughness: 0.3 }), 20), [x, i ? -0.42 : -0.82, -0.04]));
      g.add(place(cyl(b, 0.025, 0.025, 0.03, mat(b, "#cfd5ea", { metalness: 0.8 }), 10), [x, -0.35 + (i ? 0 : -0.55), -0.04]));
    });
  }
  return { g, power, powerMat, ledMat, chipMat, trace };
};

/** tren del código: una ráfaga larga de cabecera y bits cortos, que salen de la punta (+Y local) mientras el LED emite */
const CODE: [number, number][] = (() => {
  const s: [number, number][] = [[0, 0.3]]; let y = 0.44;
  for (let i = 0; i < 12; i++) { s.push([y, 0.04]); y += 0.04 + (hash1(i * 5 + 2) > 0.5 ? 0.12 : 0.045); }
  return s;
})();
const codeTrain = (b: Bin, parent: THREE.Object3D, y0: number, w = 0.16) => {
  const m = beam(b, IRC, 1.9, { transparent: true, opacity: 0, depthWrite: false });
  const bars = CODE.map(([, len]) => { const o = box(b, w, len, w * 0.5, m); parent.add(o); return o; });
  const cone = new THREE.Mesh(b.track(new THREE.ConeGeometry(0.5, 2.4, 28, 1, true)), beam(b, IRC, 1.1, { transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  cone.rotation.x = Math.PI; cone.position.y = y0 + 1.2; parent.add(cone);
  const glow = halo(b, "rgba(200,110,255,0.9)", 0.7, 0); glow.position.y = y0; parent.add(glow);
  return (f: number, k: number) => {
    const s = (f * 0.03) % 2.6;
    bars.forEach((o, i) => { const [st, len] = CODE[i], y = y0 + s - st - len / 2; o.visible = k > 0.01 && y > y0 + len / 2; o.position.y = y; });
    m.opacity = 0.9 * k * (1 - clamp01((s - 1.8) / 0.8));
    (cone.material as THREE.MeshBasicMaterial).opacity = 0.07 * k;
    (glow.material as THREE.MeshBasicMaterial).opacity = k * (0.55 + 0.35 * Math.sin(f * 0.9));
  };
};

/** recorrido de la señal por una polilínea: haz fino que avanza (prog) y paquetes que lo recorren; fade(s) da la opacidad a lo largo (0..1) */
const irPath = (b: Bin, parent: THREE.Object3D, pts: THREE.Vector3[], n = 9, r = 0.035) => {
  const L = pts.slice(1).map((p, i) => p.distanceTo(pts[i])), tot = L.reduce((a, c) => a + c, 0);
  const segs = L.map(() => { const m = cyl(b, r * 0.35, r * 0.35, 1, beam(b, IRC, 1.4, { transparent: true, opacity: 0, depthWrite: false }), 8); parent.add(m); return m; });
  const pk = Array.from({ length: n }, () => { const m = ball(b, r, beam(b, IRC, 2.2, { transparent: true, opacity: 0, depthWrite: false }), 10); parent.add(m); return m; });
  const at = (d: number) => { let acc = 0; for (let i = 0; i < L.length; i++) { if (d <= acc + L[i] || i === L.length - 1) return pts[i].clone().lerp(pts[i + 1], clamp01((d - acc) / L[i])); acc += L[i]; } return pts[0].clone(); };
  return (f: number, prog: number, k: number, fade: (s: number) => number = () => 1) => {
    const D = clamp01(prog) * tot; let acc = 0;
    segs.forEach((m, i) => {
      const vis = Math.min(L[i], Math.max(0, D - acc)), mm = m.material as THREE.MeshBasicMaterial;
      m.visible = vis > 0.005 && k > 0.01;
      if (m.visible) { setRod(m, pts[i], pts[i].clone().lerp(pts[i + 1], vis / L[i])); mm.opacity = 0.5 * k * fade((acc + vis / 2) / tot); }
      acc += L[i];
    });
    pk.forEach((m, j) => {
      const d = ((f * 0.02 + j / n) % 1) * D, mm = m.material as THREE.MeshBasicMaterial;
      m.position.copy(at(d)); mm.opacity = D > 0.01 ? k * 0.95 * fade(d / tot) : 0; m.scale.setScalar(0.8 + 0.4 * Math.abs(Math.sin(f * 0.5 + j)));
    });
  };
};

/** tele de pie: marco negro, pantalla que se enciende (paisaje de colores), patas, y la ventanita oscura del receptor con su LED rojo */
const tvSet = (b: Bin) => {
  const g = new THREE.Group(), W = 1.5, H = 0.88;
  g.add(place(rbox(b, W, H, 0.06, 0.02, mat(b, "#15171e", { roughness: 0.3, metalness: 0.4 })), [0, H / 2 + 0.12, 0]));
  g.add(place(box(b, W - 0.12, 0.04, 0.03, mat(b, "#2a2d38", { metalness: 0.6, roughness: 0.3 })), [0, 0.16, 0.02]));
  const scr = new THREE.Mesh(b.track(new THREE.PlaneGeometry(W - 0.06, H - 0.08)), mat(b, "#07080c", { roughness: 0.15, metalness: 0.5 }));
  scr.position.set(0, H / 2 + 0.14, 0.032); g.add(scr);
  const img = screenTex(b.track, 512, 300, (c) => {
    const sk = c.createLinearGradient(0, 0, 0, 300); sk.addColorStop(0, "#3a6fe0"); sk.addColorStop(0.6, "#f2a26b"); sk.addColorStop(1, "#ffd27a"); c.fillStyle = sk; c.fillRect(0, 0, 512, 300);
    c.fillStyle = "#fff3c4"; c.beginPath(); c.arc(360, 170, 38, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#3d2a5c"; c.beginPath(); c.moveTo(0, 230); c.lineTo(110, 150); c.lineTo(210, 220); c.lineTo(320, 130); c.lineTo(512, 240); c.lineTo(512, 300); c.lineTo(0, 300); c.fill();
    c.fillStyle = "#1f6b5a"; c.fillRect(0, 262, 512, 38);
  });
  const onMat = b.track(new THREE.MeshBasicMaterial({ map: img, transparent: true, opacity: 0, color: new THREE.Color(1.15, 1.15, 1.15) }));
  const on = new THREE.Mesh(b.track(new THREE.PlaneGeometry(W - 0.06, H - 0.08)), onMat); on.position.set(0, H / 2 + 0.14, 0.035); g.add(on);
  const light = halo(b, "rgba(255,190,140,0.9)", 2.4, 0); light.position.set(0, H / 2 + 0.14, 0.2); g.add(light);
  [-0.55, 0.55].forEach((x) => g.add(rod(b, [x, 0.12, 0], [x * 1.12, 0, 0.12], 0.02, mat(b, "#2a2d38", { metalness: 0.7 }))));
  const rx = 0.42, recv = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.04, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)), mat(b, "#2a0610", { roughness: 0.1, metalness: 0.3 }));
  recv.rotation.x = Math.PI / 2; recv.position.set(rx, 0.15, 0.04); g.add(recv);
  const sbMat = glowMat(b, "#ff2a3a", 1.2), sb = ball(b, 0.012, sbMat, 8); sb.position.set(rx - 0.07, 0.15, 0.04); g.add(sb);
  return { g, receiver: V([rx, 0.15, 0.08]), set: (k: number, f: number) => {
    onMat.opacity = k; (light.material as THREE.MeshBasicMaterial).opacity = 0.35 * k;
    sbMat.emissive.set(k > 0.5 ? "#40ff90" : "#ff2a3a").multiplyScalar(0.9 + 0.3 * Math.sin(f * 0.2));
  } };
};
const lookY = (o: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3) => { o.position.copy(from); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize()); };

const M_E = new THREE.Euler(-0.45, 0.3, -0.5), M_O: P3 = [0, 1.25, 0], mA = xf(M_E, M_O);
export const mando_tv: HeroDef = {
  kind: "primitive",
  when: "Mando a distancia de la tele (control remoto): botón de encendido rojo, teclado numérico, cruceta, volumen y canal, y el LED infrarrojo en la punta; por dentro (corte) placa, chip, pistas y pilas; y la cámara del celular que ve su destello violeta. Pulsar un botón, el código, la luz invisible, probar el control con el celular.",
  poses: ["entero", "corte", "celular"],
  actions: {
    pulsar: "El botón de encendido se hunde y se ilumina; en el corte, el chip se enciende y el código corre por la pista hasta el LED (se queda así): pulsar, botón, elige un código, orden.",
    emitir: "El LED de la punta lanza el código: una ráfaga larga y bits cortos de luz violeta dentro de un cono tenue (se queda así): sale, emite, LED infrarrojo, luz invisible, parpadea.",
    destello: "En la pantalla del celular aparece el destello violeta en la punta del control, que a simple vista sigue apagada (se queda así): la cámara lo ve, destello, violeta, pruébalo.",
  },
  center: [0, 1.25, 0], radius: 1.15,
  anchors: { hero: mA([0, 0, 0.1]), top: mA([0, 1.15, 0]), base: [0, 0.05, 0], led: mA([0, 1.18, 0]), power: mA([-0.17, 0.93, 0.15]), chip: mA([0, 0.15, 0.08]), pilas: mA([0, -0.62, 0]), botones: mA([0, 0.4, 0.15]), pantalla: [0.45, 1.3, 0.4] },
  build: (_L, pose) => {
    const p = poseOf(mando_tv, pose, "mando_tv"), cel = p === "celular";
    const b = bin(), root = new THREE.Group(), r = remoteBody(b, p === "corte");
    const rg = new THREE.Group(); rg.add(r.g); root.add(rg);
    if (cel) { rg.position.set(-0.75, 1.1, -0.2); rg.rotation.set(-0.3, 0.35, -0.35); rg.scale.setScalar(0.75); }
    else { rg.position.set(...M_O); rg.rotation.copy(M_E); }
    const code = codeTrain(b, r.g, 1.2);
    // pulso que corre por la pista del corte
    const run = ball(b, 0.035, beam(b, "#ffd36b", 2.4, { transparent: true, opacity: 0 }), 10); r.g.add(run);
    const runCurve = new THREE.CatmullRomCurve3(r.trace);
    // celular con la vista de cámara
    const scr = liveTex(b, 512, 1056), phone = phoneBody(b, scr.tex);
    phone.position.set(0.45, 1.3, 0.35); phone.rotation.set(-0.05, -0.28, 0.04); phone.scale.setScalar(1.2); phone.visible = cel; root.add(phone);
    const camView = (g: CanvasRenderingContext2D, k: number, f: number) => {
      const W = 512, H = 1056, bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#2b2f3c"); bg.addColorStop(1, "#14161d"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.save(); g.translate(250, 600); g.rotate(-0.45);
      g.fillStyle = "#23262f"; g.beginPath(); g.roundRect(-85, -330, 170, 640, 40); g.fill();
      g.fillStyle = "#d63a4c"; g.beginPath(); g.arc(-42, -250, 17, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#5a6072"; for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 3; c++) { g.beginPath(); g.roundRect(-58 + c * 42, -180 + rr * 40, 32, 24, 8); g.fill(); }
      g.beginPath(); g.arc(0, 60, 42, 0, Math.PI * 2); g.lineWidth = 16; g.strokeStyle = "#5a6072"; g.stroke();
      g.fillStyle = "#3a0a18"; g.beginPath(); g.arc(0, -330, 24, Math.PI, 0); g.fill();
      if (k > 0.01) {
        const fl = k * (0.75 + 0.25 * Math.sin(f * 1.3)), rg2 = g.createRadialGradient(0, -335, 0, 0, -335, 150);
        rg2.addColorStop(0, `rgba(255,240,255,${fl})`); rg2.addColorStop(0.18, `rgba(214,140,255,${0.95 * fl})`); rg2.addColorStop(0.55, `rgba(150,80,255,${0.35 * fl})`); rg2.addColorStop(1, "rgba(120,60,255,0)");
        g.fillStyle = rg2; g.beginPath(); g.arc(0, -335, 150, 0, Math.PI * 2); g.fill();
      }
      g.restore();
      g.fillStyle = "rgba(255,255,255,0.85)"; g.font = "bold 30px sans-serif"; g.fillText("1x", 236, 960);
      g.beginPath(); g.arc(256, 1010, 34, 0, Math.PI * 2); g.lineWidth = 6; g.strokeStyle = "#fff"; g.stroke();
      g.fillStyle = "#ff3b4a"; g.beginPath(); g.arc(60, 70, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = "#fff"; g.font = "26px sans-serif"; g.fillText("REC", 80, 80);
      g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 3; [[40, 140], [472, 140], [40, 900], [472, 900]].forEach(([x, y], i) => { g.beginPath(); g.moveTo(x + (i % 2 ? -40 : 40), y); g.lineTo(x, y); g.lineTo(x, y + (i > 1 ? -40 : 40)); g.stroke(); });
    };
    root.add(place(cyl(b, 0.9, 1.0, 0.08, mat(b, "#2a2f4a", { roughness: 0.5, metalness: 0.3 }), 48), [0, 0.04, 0]));
    shadows(root);
    let pu = 0, em = 0, de = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      r.power.position.z = 0.12 - 0.035 * Math.sin(Math.PI * clamp01(pu * 1.6));
      r.powerMat.emissive.set("#ff3b4f").multiplyScalar(0.25 + 1.2 * pu);
      r.chipMat.emissive.set("#ffd36b").multiplyScalar(0.05 + 0.6 * pu * (0.7 + 0.3 * Math.sin(f * 0.4)));
      const rm = run.material as THREE.MeshBasicMaterial; rm.opacity = pu > 0.05 ? pu : 0; run.position.copy(runCurve.getPoint((f * 0.025) % 1));
      const lk = Math.max(em, cel ? 0 : pu * 0.4);
      r.ledMat.emissive.set(IRC).multiplyScalar(0.05 + 0.5 * lk);
      code(f, cel ? 0 : em);
      if (cel) scr.draw(`${de.toFixed(2)}|${de > 0 ? f % 6 : 0}`, (g) => camView(g, de, f));
      rg.position.y = (cel ? 1.1 : M_O[1]) + 0.03 * Math.sin(f * 0.04);
      if (cel) phone.position.y = 1.3 + 0.025 * Math.sin(f * 0.05 + 1);
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "pulsar") pu = ease(u); if (name === "emitir") em = ease(u); if (name === "destello") de = ease(u); paint(lf); } };
  },
};

/** pared con ladrillo oscuro (absorbe) o yeso blanco (refleja) */
const brickTex = (b: Bin) => screenTex(b.track, 512, 512, (c) => {
  c.fillStyle = "#2a1a18"; c.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 16; r++) for (let k = -1; k < 6; k++) { const x = k * 96 + (r % 2 ? 48 : 0); c.fillStyle = `hsl(${8 + hash1(r * 9 + k) * 10},${35 + hash1(r + k * 3) * 15}%,${17 + hash1(r * 3 + k * 7) * 9}%)`; c.fillRect(x + 4, r * 32 + 4, 88, 26); }
});
const plasterTex = (b: Bin) => screenTex(b.track, 256, 256, (c) => {
  c.fillStyle = "#ece6da"; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${hash1(i) > 0.5 ? "255,255,255" : "150,140,120"},0.08)`; c.fillRect(hash1(i * 3.1) * 256, hash1(i * 7.3) * 256, 2, 2); }
});

export const sala_rebote: HeroDef = {
  kind: "primitive",
  when: "Sala de estar en corte (suelo de madera, pared del fondo, sofá, lámpara, cuadro y la tele en su mueble) donde la señal del control rebota en la pared y llega a la tele: apuntar a la pared, el rebote, pared blanca que refleja o pared oscura de ladrillo que absorbe, señal que no alcanza, la tele se enciende o no.",
  poses: ["blanca", "oscura"],
  actions: {
    rebotar: "La señal sale del control, choca con la pared, se esparce en abanico y un rayo llega a la tele, que se enciende (se queda así): rebota, refleja, apuntas a la pared, enciende.",
    absorber: "La señal llega a la pared y se apaga en ella, sin abanico; la tele sigue apagada (se queda así): se la traga, absorbe, ladrillo, oscura, tela.",
    debil: "La señal rebota pero se desvanece por el camino y no llega a la tele (se queda así): no alcanza, distancia, pilas gastadas, débil, lejos.",
  },
  center: [0.1, 1.1, -0.35], radius: 1.4,
  anchors: { hero: [0.1, 1.1, -0.3], top: [0, 2.9, -1.5], base: [0, 0.02, 0], pared: [0, 1.55, -1.45], tele: [1.25, 1.05, -0.65], control: [-0.95, 0.95, 0.55], sofa: [-1.3, 0.6, 0.6], lampara: [-2.0, 1.7, -1.0] },
  build: (_L, pose) => {
    const p = poseOf(sala_rebote, pose, "sala_rebote"), dark = p === "oscura";
    const b = bin(), root = new THREE.Group();
    const wood = screenTex(b.track, 512, 512, (c) => { for (let i = 0; i < 16; i++) { c.fillStyle = `hsl(28,${38 + hash1(i) * 10}%,${30 + hash1(i * 5) * 9}%)`; c.fillRect(0, i * 32, 512, 31); c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(hash1(i * 3) * 512, i * 32, 3, 32); } });
    wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 2);
    root.add(place(box(b, 5.2, 0.06, 3.6, b.track(new THREE.MeshStandardMaterial({ map: wood, roughness: 0.6 }))), [0, -0.03, 0.2]));
    const wt = dark ? brickTex(b) : plasterTex(b); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(dark ? 2.5 : 2, dark ? 1.5 : 1.2);
    root.add(place(box(b, 5.2, 3.0, 0.1, b.track(new THREE.MeshStandardMaterial({ map: wt, roughness: 0.92 }))), [0, 1.5, -1.55]));
    root.add(place(box(b, 5.2, 0.1, 0.03, mat(b, dark ? "#1c1414" : "#f6f2ea")), [0, 0.05, -1.49]));
    // cuadro, lámpara de pie, planta y alfombra
    root.add(place(box(b, 0.9, 0.62, 0.04, mat(b, "#3a2a1e")), [-1.2, 1.95, -1.48]));
    root.add(place(new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.78, 0.5)), b.track(new THREE.MeshStandardMaterial({ map: screenTex(b.track, 256, 160, (c) => { const gr = c.createLinearGradient(0, 0, 256, 160); gr.addColorStop(0, "#5d7fb8"); gr.addColorStop(1, "#d98a6a"); c.fillStyle = gr; c.fillRect(0, 0, 256, 160); c.fillStyle = "#2e3f5e"; c.beginPath(); c.moveTo(0, 160); c.lineTo(90, 70); c.lineTo(170, 130); c.lineTo(256, 90); c.lineTo(256, 160); c.fill(); }), roughness: 0.7 }))), [-1.2, 1.95, -1.455]));
    const brass = mat(b, "#c9a25a", { metalness: 0.7, roughness: 0.35 });
    root.add(place(cyl(b, 0.2, 0.22, 0.04, brass, 24), [-2.0, 0.02, -1.0]), rod(b, [-2.0, 0.04, -1.0], [-2.0, 1.6, -1.0], 0.022, brass));
    root.add(place(cyl(b, 0.16, 0.3, 0.34, glowMat(b, "#f5d9a0", 0.55, { roughness: 0.8, side: THREE.DoubleSide }), 28), [-2.0, 1.72, -1.0]));
    root.add(place(cyl(b, 0.2, 0.15, 0.36, mat(b, "#b8643e", { roughness: 0.7 }), 20), [2.2, 0.18, -1.15]));
    for (let i = 0; i < 7; i++) { const lf = blobLeaf(b, i); lf.position.set(2.2, 0.55 + hash1(i) * 0.4, -1.15); lf.rotation.set(0.3 * Math.sin(i * 2.1), i * 0.9, 0.5 + 0.3 * hash1(i * 3)); root.add(lf); }
    root.add(place(box(b, 2.4, 0.015, 1.5, mat(b, "#6a4a7a", { roughness: 0.95 })), [0.1, 0.008, 0.35]));
    // sofá mirando a la tele
    const sofa = new THREE.Group(), fab = mat(b, "#3e6a78", { roughness: 0.9 });
    sofa.add(place(rbox(b, 1.7, 0.36, 0.75, 0.08, fab), [0, 0.28, 0]), place(rbox(b, 1.7, 0.55, 0.2, 0.08, fab), [0, 0.65, -0.3]));
    [-1, 1].forEach((s) => sofa.add(place(rbox(b, 0.2, 0.5, 0.78, 0.07, fab), [s * 0.88, 0.4, 0])));
    [-0.4, 0.4].forEach((x) => sofa.add(place(rbox(b, 0.76, 0.12, 0.62, 0.05, mat(b, "#4b7c8b", { roughness: 0.9 })), [x, 0.5, 0.05])));
    [-0.75, 0.75].forEach((x) => [-0.3, 0.3].forEach((z) => sofa.add(place(cyl(b, 0.03, 0.025, 0.1, mat(b, "#2a1d14"), 8), [x, 0.05, z]))));
    sofa.position.set(-1.3, 0, 0.75); sofa.rotation.y = 2.7; root.add(sofa);
    // mueble y tele
    const tvG = new THREE.Group(); tvG.position.set(1.25, 0, -0.75); tvG.rotation.y = -0.55; root.add(tvG);
    tvG.add(place(rbox(b, 1.6, 0.42, 0.45, 0.03, mat(b, "#6b4a32", { roughness: 0.6 })), [0, 0.21, 0]));
    [-0.4, 0.4].forEach((x) => tvG.add(place(box(b, 0.74, 0.3, 0.01, mat(b, "#5a3d29", { roughness: 0.5 })), [x, 0.21, 0.226])));
    const tv = tvSet(b); tv.g.position.set(0, 0.42, 0); tvG.add(tv.g);
    // control sobre el brazo del sofá, apuntando a la pared
    const W = V([0.1, 1.55, -1.48]), T0 = V([-0.95, 0.95, 0.55]);
    const rem = remoteBody(b); rem.g.scale.setScalar(0.3); lookY(rem.g, T0, W); root.add(rem.g);
    shadows(root);
    root.updateMatrixWorld(true);
    const R = tv.g.localToWorld(tv.receiver.clone()), T = T0.clone().add(W.clone().sub(T0).normalize().multiplyScalar(0.36));
    const path = irPath(b, root, [T, W, R], 10, 0.04);
    // abanico difuso en la pared
    const fanM = beam(b, IRC, 1.2, { transparent: true, opacity: 0, depthWrite: false });
    const fan = [-1.1, -0.7, -0.35, 0.35, 0.7, 1.1, 0].map((a, i) => { const m = cyl(b, 0.01, 0.01, 1, fanM, 6); const dir = new THREE.Vector3(Math.sin(a), 0.25 * Math.sin(i * 1.7) - 0.15, Math.cos(a)).normalize(); setRod(m, W, W.clone().add(dir.multiplyScalar(1.1))); root.add(m); return m; });
    const hit = halo(b, "rgba(205,120,255,0.9)", 0.9, 0); hit.position.copy(W).add(V([0, 0, 0.05])); root.add(hit);
    const lamp = halo(b, "rgba(255,210,150,0.7)", 1.6, 0.35); lamp.position.set(-2.0, 1.7, -0.9); root.add(lamp);
    const wSplit = T.distanceTo(W) / (T.distanceTo(W) + W.distanceTo(R));
    let re = 0, ab = 0, de = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      const u = Math.max(re, ab, de), p1 = clamp01(u / wSplit), p2 = clamp01((u - wSplit) / (1 - wSplit));
      const fade = ab > 0 ? (s: number) => (s < wSplit ? 1 : 0) : de > 0 ? (s: number) => 1 - clamp01((s - wSplit * 0.6) / (1 - wSplit * 0.6)) ** 0.7 : () => 1;
      path(f, ab > 0 ? Math.min(u, wSplit) : de > 0 ? Math.min(u, wSplit + (1 - wSplit) * 0.55) : u, u > 0 ? 1 : 0, fade);
      fanM.opacity = (re > 0 ? 0.32 : de > 0 ? 0.12 : 0.04) * p2 * (0.8 + 0.2 * Math.sin(f * 0.3));
      (hit.material as THREE.MeshBasicMaterial).opacity = p1 >= 1 ? (ab > 0 ? 0.6 * (1 - p2) + 0.1 : 0.7) : 0;
      tv.set(re > 0 ? clamp01((re - 0.9) / 0.1) : 0, f);
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "rebotar") re = ease(u); if (name === "absorber") ab = ease(u); if (name === "debil") de = ease(u); paint(lf); } };
  },
};
const blobLeaf = (b: Bin, i: number) => { const m = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.16, 12, 8)), mat(b, i % 2 ? "#3f8a55" : "#2f6f45", { roughness: 0.7 })); m.scale.set(0.45, 1.3, 0.15); m.geometry.translate(0, 0.14, 0); return m; };

export const receptor_ir: HeroDef = {
  kind: "primitive",
  when: "El receptor infrarrojo de la tele visto de cerca: cápsula negra con lente en cúpula, blindaje metálico y tres patas sobre una placa, detrás de la ventanita oscura del marco; filtra la luz que parpadea a 38 kHz e ignora la luz fija; el sol lo deslumbra. Receptor, sensor, ventanita, sensible, filtra, ignora la lámpara, deslumbra.",
  poses: ["modulo"],
  actions: {
    recibir: "Llegan los pulsos violetas, la lente se ilumina, la señal corre a un chip con LED verde y la pantalla de detrás se enciende (se queda así): recibe, le basta, sensible, reflejo débil.",
    filtrar: "Un haz amarillo fijo de lámpara choca contra un anillo rojo delante de la lente y no entra, mientras los pulsos violetas sí pasan (se queda así): ignora, filtra, solo hace caso, luz fija.",
    deslumbrar: "Un chorro de luz blanca de sol inunda el receptor: la lente se satura en blanco, los pulsos se pierden y el LED se pone rojo (se queda así): sol, deslumbra, ciega, satura, tapa.",
  },
  center: [0, 1.1, 0], radius: 0.9,
  anchors: { hero: [0, 1.2, 0.3], top: [0, 2.1, 0], base: [0, 0.05, 0], lente: [0, 1.3, 0.5], chip: [0.95, 0.4, 0.3], ventana: [0, 1.15, -1.5], patas: [0, 0.55, 0] },
  build: (_L, pose) => {
    poseOf(receptor_ir, pose, "receptor_ir");
    const b = bin(), root = new THREE.Group();
    // fondo: esquina del marco de la tele con la ventanita y la pantalla encima
    const bez = new THREE.Group(); bez.position.set(0, -0.15, -1.7); root.add(bez);
    bez.add(place(rbox(b, 4.2, 0.7, 0.2, 0.05, mat(b, "#15171e", { roughness: 0.3, metalness: 0.4 })), [0, 1.3, 0]));
    const scrM = mat(b, "#0b0d16", { roughness: 0.15, metalness: 0.4 }); bez.add(place(box(b, 4.0, 1.6, 0.05, scrM), [0, 2.45, 0]));
    bez.add(place(rbox(b, 0.6, 0.24, 0.05, 0.05, mat(b, "#3a0a18", { roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.85 })), [0, 1.3, 0.11]));
    // módulo receptor
    const epoxy = glowMat(b, "#151520", 0.05, { roughness: 0.25, metalness: 0.1 });
    root.add(place(rbox(b, 0.9, 0.78, 0.38, 0.06, epoxy), [0, 1.25, 0]));
    const lensM = mat(b, "#1a0f2a", { roughness: 0.05, metalness: 0.2, emissive: new THREE.Color(0, 0, 0) });
    const lens = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.27, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2)), lensM); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.3, 0.19); root.add(lens);
    const steel = mat(b, "#aab2cc", { metalness: 0.85, roughness: 0.3 });
    root.add(place(box(b, 0.98, 0.06, 0.46, steel), [0, 1.67, -0.02]), place(box(b, 0.98, 0.84, 0.04, steel), [0, 1.25, -0.23]));
    [-0.49, 0.49].forEach((x) => root.add(place(box(b, 0.04, 0.5, 0.46, steel), [x, 1.42, -0.02])));
    root.add(place(new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.34, 0.12)), b.track(new THREE.MeshBasicMaterial({ map: screenTex(b.track, 128, 48, (c) => { c.fillStyle = "#151520"; c.fillRect(0, 0, 128, 48); c.fillStyle = "#9aa0b8"; c.font = "bold 30px monospace"; c.fillText("38K", 30, 34); }) }))), [0, 1.0, 0.192]));
    [-0.25, 0, 0.25].forEach((x) => root.add(rod(b, [x, 0.86, 0], [x, 0.3, 0], 0.025, steel)));
    root.add(place(box(b, 2.6, 0.06, 0.9, mat(b, "#1f6b3f", { roughness: 0.6 })), [0.4, 0.27, 0.05]));
    const gold = glowMat(b, "#ffd36b", 0.5, { metalness: 0.6, roughness: 0.3 });
    const trace = [V([0.25, 0.31, 0]), V([0.5, 0.31, 0.15]), V([0.8, 0.31, 0.25])];
    root.add(tube(b, trace.map((v) => [v.x, v.y, v.z] as P3), 0.012, gold));
    const mcuM = glowMat(b, "#12162b", 0.2, { roughness: 0.3, metalness: 0.5 }); root.add(place(box(b, 0.36, 0.06, 0.36, mcuM), [0.98, 0.33, 0.3]));
    for (let k = 0; k < 4; k++) [-1, 1].forEach((s) => root.add(place(box(b, 0.05, 0.02, 0.04, gold), [0.98 + s * 0.2, 0.31, 0.18 + k * 0.08])));
    const ledM = glowMat(b, "#203020", 0.2), led = ball(b, 0.08, ledM, 12); led.position.set(1.35, 0.36, 0.3); root.add(led);
    const ledH = halo(b, "rgba(255,60,70,0.9)", 0.6, 0); ledH.position.set(1.35, 0.36, 0.36); root.add(ledH);
    [[-0.7, 0.32, 0.3], [-0.95, 0.32, -0.1]].forEach((q) => root.add(place(cyl(b, 0.07, 0.07, 0.14, mat(b, "#2a3a8a", { roughness: 0.4 }), 14), q as P3)));
    shadows(root);
    // entradas: pulsos desde la izquierda, haz fijo de lámpara desde arriba a la derecha, chorro de sol desde arriba a la izquierda
    const L0 = V([0, 1.3, 0.48]);
    const pulses = irPath(b, root, [V([-2.2, 1.9, 1.6]), L0], 8, 0.05);
    const lampM = beam(b, "#ffd27a", 1.3, { transparent: true, opacity: 0, depthWrite: false }), lampB = cyl(b, 0.06, 0.06, 1, lampM, 12); root.add(lampB);
    const LS = V([2.2, 2.4, 1.4]), LE = V([0.18, 1.38, 0.62]); setRod(lampB, LS, LE);
    const bulb = place(ball(b, 0.14, glowMat(b, "#ffe2a0", 1.2), 16), [LS.x, LS.y, LS.z]); bulb.visible = false; root.add(bulb);
    const guard = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.34, 0.025, 8, 40)), beam(b, "#ff4d6a", 1.6, { transparent: true, opacity: 0 })); guard.position.set(0, 1.3, 0.62); root.add(guard);
    const sunM = beam(b, "#ffe2a0", 1.5, { transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const sun = new THREE.Mesh(b.track(new THREE.ConeGeometry(1.1, 3.2, 32, 1, true)), sunM); lookY(sun, V([-1.0, 2.4, 1.9]).lerp(L0, 0.5), V([-2.0, 3.5, 3.3])); root.add(sun);
    const sunDisc = ball(b, 0.35, beam(b, "#ffd27a", 2.0), 24); sunDisc.position.set(-2.0, 3.5, 3.3); root.add(sunDisc);
    const sunHalo = halo(b, "rgba(255,200,110,0.9)", 2.2, 0); sunHalo.position.copy(sunDisc.position); root.add(sunHalo);
    const glare = halo(b, "rgba(255,240,200,1)", 1.6, 0); glare.position.set(0, 1.3, 0.6); root.add(glare);
    const out = ball(b, 0.035, beam(b, "#5dffa8", 2.2, { transparent: true, opacity: 0 }), 10); root.add(out);
    const outC = new THREE.CatmullRomCurve3(trace);
    let rc = 0, fl = 0, ds = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      const drown = 1 - 0.85 * ds;
      pulses(f, Math.max(rc, fl, ds > 0 ? 1 : 0), Math.max(rc, fl, ds) > 0 ? drown : 0);
      const ok = Math.max(rc, fl) * drown;
      lensM.emissive.set(IRC).multiplyScalar(0.6 * ok * (0.7 + 0.3 * Math.sin(f * 0.6))).lerp(new THREE.Color(1.6, 1.55, 1.4), ds);
      (out.material as THREE.MeshBasicMaterial).opacity = ok > 0.05 ? ok : 0; out.position.copy(outC.getPoint((f * 0.03) % 1));
      mcuM.emissive.set("#5dffa8").multiplyScalar(0.25 * ok);
      ledM.emissive.set(ds > 0.5 ? "#ff3b4a" : ok > 0.3 ? "#40ff90" : "#203020").multiplyScalar(ds > 0.5 || ok > 0.3 ? 1.6 : 0.2);
      scrM.emissive.set("#6a8cff").multiplyScalar(0.18 * rc * drown);
      lampM.opacity = 0.55 * fl; bulb.visible = fl > 0.02;
      (guard.material as THREE.MeshBasicMaterial).opacity = fl * (0.6 + 0.4 * Math.sin(f * 0.25));
      sunM.opacity = 0.13 * ds; (glare.material as THREE.MeshBasicMaterial).opacity = 0.6 * ds; sunDisc.visible = ds > 0.02; (sunHalo.material as THREE.MeshBasicMaterial).opacity = 0.8 * ds; (ledH.material as THREE.MeshBasicMaterial).opacity = ds > 0.5 ? 0.9 : 0;
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "recibir") rc = ease(u); if (name === "filtrar") fl = ease(u); if (name === "deslumbrar") ds = ease(u); paint(lf); } };
  },
};

export const vidrio_lowe: HeroDef = {
  kind: "primitive",
  when: "Dos dioramas uno encima del otro con un control, una tele pequeña y lo que hay en medio: una pared que rebota la señal hacia la tele, un vidrio común que la deja pasar o un vidrio con capa metálica (Low-E, control solar) que la refleja y la tele no se entera. Vidrio transparente frente a pared opaca, ventana, capa invisible de metal, la señal pasa o se frena.",
  poses: ["contraste", "par"],
  actions: {
    pasar: "En el diorama de arriba la señal llega a la tele (rebotando en la pared o atravesando el vidrio común) y la tele se enciende (se queda así): ayuda, pasa, deja pasar, opaco, espejo.",
    frenar: "En el diorama de abajo la señal choca con el vidrio de capa metálica, que brilla dorado, y vuelve atrás; la tele sigue apagada (se queda así): frena, estorba, muro, capa, metal.",
  },
  center: [0, 1.25, 0], radius: 1.15,
  anchors: { hero: [0, 1.25, 0], top: [0, 3.0, -0.3], base: [0, 0.02, 0.3], izquierda: [0, 2.25, -0.3], derecha: [0, 0.8, 0.3], arriba: [0, 2.25, -0.3], abajo: [0, 0.8, 0.3], pared: [-0.85, 2.4, -0.43], vidrio: [0.6, 1.0, 0.23], tele_abajo: [0, 0.6, -0.45] },
  build: (_L, pose) => {
    const p = poseOf(vidrio_lowe, pose, "vidrio_lowe"), wall = p === "contraste";
    const b = bin(), root = new THREE.Group(), S = 1.35;
    const side = (y: number, z: number) => {
      const g = new THREE.Group(); g.position.set(0, y, z); g.scale.setScalar(S); root.add(g);
      g.add(place(cyl(b, 0.82, 0.88, 0.08, mat(b, "#2a2f4a", { roughness: 0.5, metalness: 0.3 }), 48), [0, 0.04, 0]));
      const rim = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.86, 0.012, 6, 64)), beam(b, IRC, 1.2, { transparent: true, opacity: 0.6 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.0; g.add(rim);
      return g;
    };
    const pane = (g: THREE.Group, lowe: boolean) => {
      const m = lowe ? mat(b, "#e8d9a8", { transparent: true, opacity: 0.2, metalness: 0.3, roughness: 0.05, emissive: new THREE.Color(0, 0, 0), side: THREE.DoubleSide, depthWrite: false })
        : mat(b, "#cfeaf2", { transparent: true, opacity: 0.16, roughness: 0.02, side: THREE.DoubleSide, depthWrite: false });
      g.add(place(box(b, 1.1, 0.9, 0.03, m), [0, 0.57, -0.05]));
      const fr = mat(b, "#d8dce8", { metalness: 0.6, roughness: 0.3 });
      [[0, 1.03], [0, 0.11]].forEach(([x, y]) => g.add(place(box(b, 1.16, 0.04, 0.06, fr), [x, y, -0.05])));
      [-0.57, 0.57].forEach((x) => g.add(place(box(b, 0.04, 0.96, 0.06, fr), [x, 0.57, -0.05])));
      if (lowe) for (let i = 0; i < 2; i++) g.add(place(box(b, 1.06, 0.004, 0.034, beam(b, "#ffd36b", 0.6, { transparent: true, opacity: 0.25 })), [0, 0.35 + i * 0.44, -0.05]));
      return m;
    };
    const miniTV = (g: THREE.Group, pos: P3, ry: number) => { const t = tvSet(b); t.g.scale.setScalar(0.5); t.g.position.set(...pos); t.g.rotation.y = ry; g.add(t.g); return t; };
    const miniRemote = (g: THREE.Group, from: THREE.Vector3, to: THREE.Vector3) => { const r = remoteBody(b); r.g.scale.setScalar(0.2); lookY(r.g, from, to); g.add(r.g); return from.clone().add(to.clone().sub(from).normalize().multiplyScalar(0.24)); };
    const recvIn = (g: THREE.Group, t: ReturnType<typeof tvSet>) => { root.updateMatrixWorld(true); return g.worldToLocal(t.g.localToWorld(t.receiver.clone())); };
    // arriba: pared que rebota (contraste) o vidrio común (par); abajo: vidrio con capa metálica
    const gl = side(1.5, -0.3), gr = side(0, 0.3);
    let tvL: ReturnType<typeof tvSet>, ptsL: THREE.Vector3[];
    if (wall) {
      gl.add(place(box(b, 0.1, 1.1, 1.1, b.track(new THREE.MeshStandardMaterial({ map: plasterTex(b), roughness: 0.9 }))), [-0.66, 0.6, -0.1]));
      tvL = miniTV(gl, [0.42, 0.05, -0.38], -0.8);
      const W = V([-0.6, 0.72, -0.1]), tip = miniRemote(gl, V([-0.12, 0.32, 0.66]), W);
      ptsL = [tip, W, recvIn(gl, tvL)];
    } else {
      pane(gl, false); tvL = miniTV(gl, [0, 0.05, -0.55], 0);
      const tip = miniRemote(gl, V([0.08, 0.45, 0.62]), V([0.12, 0.2, -0.5]));
      ptsL = [tip, recvIn(gl, tvL)];
    }
    const lm = pane(gr, true) as THREE.MeshStandardMaterial, tvR = miniTV(gr, [0, 0.05, -0.55], 0);
    const tipR = miniRemote(gr, V([-0.08, 0.45, 0.62]), V([-0.12, 0.2, -0.5]));
    const hitR = V([-0.04, 0.3, -0.03]), backR = V([0.45, 0.6, 0.75]);
    shadows(root);
    const pathL = irPath(b, gl, ptsL, 8, 0.03), pathR = irPath(b, gr, [tipR, hitR, backR], 8, 0.03);
    const flash = halo(b, "rgba(255,215,120,0.9)", 0.8, 0); flash.position.copy(hitR).add(V([0, 0, 0.04])); gr.add(flash);
    const split = tipR.distanceTo(hitR) / (tipR.distanceTo(hitR) + hitR.distanceTo(backR));
    let pa = 0, fr = 0, lf = 0;
    const paint = (f: number) => {
      lf = f;
      pathL(f, pa, pa > 0 ? 1 : 0, wall ? () => 1 : (s) => (s > 0.5 ? 0.85 : 1));
      tvL.set(clamp01((pa - 0.88) / 0.12), f);
      pathR(f, fr, fr > 0 ? 1 : 0, (s) => (s > split ? 0.75 - 0.5 * (s - split) : 1));
      tvR.set(0, f);
      const hk = fr > split ? 1 : 0;
      lm.emissive.set("#ffd36b").multiplyScalar(0.35 * hk * (0.7 + 0.3 * Math.sin(f * 0.2)));
      (flash.material as THREE.MeshBasicMaterial).opacity = 0.7 * hk;
      gl.position.y = 1.5 + 0.03 * Math.sin(f * 0.04); gr.position.y = 0.03 * Math.sin(f * 0.04 + 1.5);
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name === "pasar") pa = ease(u); if (name === "frenar") fr = ease(u); paint(lf); } };
  },
};

// mudanza-planeta · esfera iluminada desde una dirección fija (día y noche con terminador) para planetas junto a su estrella
const litSphere = (b: Bin, r: number, tex: THREE.Texture, tint: string, dir: P3, seg = 64) => {
  const uni = { sunDir: { value: new THREE.Vector3(...dir).normalize() }, map: { value: tex }, tint: { value: col(tint) }, spin: { value: 0 }, term: { value: 0 }, hit: { value: 0 } };
  const m = new THREE.Mesh(b.track(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75))), b.track(new THREE.ShaderMaterial({
    uniforms: uni, fog: false,
    vertexShader: "varying vec3 n; varying vec2 u; void main(){ n = normalize(mat3(modelMatrix) * normal); u = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 sunDir; uniform sampler2D map; uniform vec3 tint; uniform float spin; uniform float term; uniform float hit; varying vec3 n; varying vec2 u;
      void main(){ vec3 N = normalize(n); float d = dot(N, sunDir); float l = smoothstep(-0.1, 0.32, d);
        vec3 c = texture2D(map, vec2(fract(u.x + spin), u.y)).rgb;
        vec3 day = c * mix(vec3(1.0), tint, 0.35) * 1.18; vec3 night = c * vec3(0.05, 0.06, 0.12) + vec3(0.012, 0.016, 0.05);
        vec3 o = mix(night, day, l); float edge = 1.0 - smoothstep(0.0, 0.07, abs(d - 0.03));
        o += term * edge * vec3(1.0, 0.72, 0.32) * 1.5; o = mix(o, vec3(1.6, 0.9, 0.7), hit * (0.35 + 0.65 * l));
        gl_FragColor = vec4(o, 1.0); }`,
  })));
  return { m, uni };
};

const exoTex = (b: Bin, p: string) => screenTex(b.track, 512, 256, (g) => {
  const W = 512, H = 256;
  if (p === "proxima" || p === "roca") {
    g.fillStyle = "#a0603e"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(${70 + (i * 13) % 70},${34 + (i * 7) % 30},26,0.35)`; g.beginPath(); g.ellipse((i * 83) % W, (i * 47) % H, 14 + (i % 6) * 9, 6 + (i % 4) * 5, i, 0, 6.3); g.fill(); }
    for (let i = 0; i < 34; i++) { const x = (i * 151) % W, y = 20 + ((i * 71) % (H - 40)), r = 3 + (i % 5) * 3; g.fillStyle = "rgba(55,24,18,0.5)"; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); g.strokeStyle = "rgba(235,165,120,0.45)"; g.lineWidth = 1.5; g.beginPath(); g.arc(x - 0.6, y - 0.6, r, 3.6, 5.8); g.stroke(); }
    g.fillStyle = "rgba(240,235,230,0.75)"; g.fillRect(0, 0, W, 9); g.fillRect(0, H - 9, W, 9);
  } else {
    const ocean = p === "kepler" ? "#2a6aa6" : "#1f5a8f", land = p === "kepler" ? ["#8a9450", "#c2a266"] : ["#3f8a58", "#6f7f45"];
    g.fillStyle = ocean; g.fillRect(0, 0, W, H);
    for (const [x, y, r, k] of [[80, 100, 55, 0], [170, 150, 40, 1], [300, 80, 60, 0], [390, 160, 48, 1], [250, 195, 32, 0], [460, 70, 30, 1], [30, 190, 26, 0]]) {
      g.fillStyle = land[k]; g.beginPath(); g.ellipse(x, y, r, r * 0.65, x * 0.01, 0, 6.3); g.fill();
      g.fillStyle = "rgba(255,255,255,0.1)"; g.beginPath(); g.ellipse(x - r * 0.2, y - r * 0.15, r * 0.5, r * 0.3, 0, 0, 6.3); g.fill();
    }
    g.fillStyle = "rgba(255,255,255,0.85)"; g.fillRect(0, 0, W, 12); g.fillRect(0, H - 12, W, 12);
    g.fillStyle = "rgba(255,255,255,0.42)"; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse((i * 97 + 30) % W, 30 + ((i * 53) % 190), 34 + (i % 3) * 12, 7, 0.1 * (i % 5), 0, 6.3); g.fill(); }
  }
});

const rgbaOf = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

/** estrella pintada (enana roja o como el Sol): núcleo con granulado, dos halos aditivos */
const starBall = (b: Bin, r: number, base: string, hot: string, spot: string) => {
  const tex = screenTex(b.track, 512, 256, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 240; i++) { c.fillStyle = i % 2 ? hot : "rgba(120,20,10,0.25)"; c.globalAlpha = 0.12 + (i % 4) * 0.05; c.beginPath(); c.ellipse((i * 97) % 512, (i * 59) % 256, 6 + (i % 7) * 4, 4 + (i % 5) * 3, i, 0, 6.3); c.fill(); }
    c.globalAlpha = 1; c.fillStyle = spot; for (const [x, y, s] of [[110, 100, 18], [320, 150, 14], [400, 80, 10]]) { c.beginPath(); c.ellipse(x, y, s, s * 0.6, 0, 0, 6.3); c.fill(); }
  });
  return ball(b, r, beam(b, "#ffffff", 1.1, { map: tex }), 48);
};

/** cartel de «SE VENDE» (tablero blanco con borde rojo y poste) */
const signTex = (b: Bin) => screenTex(b.track, 512, 240, (c) => {
  c.fillStyle = "#f6f2e6"; c.fillRect(0, 0, 512, 240); c.strokeStyle = "#d9444e"; c.lineWidth = 22; c.strokeRect(11, 11, 490, 218);
  c.fillStyle = "#d9444e"; c.font = "900 84px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("SE VENDE", 256, 108);
  c.fillStyle = "#3b4150"; c.font = "700 28px sans-serif"; c.fillText("PLANETA · VISTAS AL ESPACIO", 256, 186);
});

// mudanza-planeta · exoplaneta en venta: planeta junto a su estrella (cara de día y de noche) con un cartel de SE VENDE clavado arriba
const EXO: Record<string, { star: [string, string, string]; sr: number; sp: P3; atm: string; tint: string }> = {
  proxima: { star: ["#ff5a32", "#ffb070", "rgba(110,10,10,0.6)"], sr: 1.05, sp: [2.3, 2.1, -2.6], atm: "#ff8a60", tint: "#ff7a50" },
  teegarden: { star: ["#ff7a40", "#ffc48a", "rgba(120,30,10,0.5)"], sr: 0.42, sp: [1.9, 2.15, -2.4], atm: "#8cc8ff", tint: "#ffb080" },
  kepler: { star: ["#ffc04a", "#fff0b0", "rgba(130,60,0,0.45)"], sr: 0.55, sp: [1.9, 2.15, -2.4], atm: "#8cc8ff", tint: "#fff2d0" },
};
export const planeta_venta: HeroDef = {
  kind: "primitive",
  when: "Un exoplaneta junto a su estrella, con un cartel de SE VENDE clavado arriba: mudarse a otro planeta, planetas habitables, exoplanetas como casas, Próxima b (enana roja, cara de día y de noche), Teegarden b, Kepler-452b (como la Tierra), colonizar otro mundo.",
  poses: ["proxima", "teegarden", "kepler"],
  actions: {
    cartel: "El cartel de SE VENDE brota del planeta con un rebote: se vende, mudarte, casa disponible, otro planeta.",
    cara: "El planeta deja de girar y la línea entre el día y la noche se enciende (se queda así): siempre la misma cara, día eterno, noche eterna, acoplamiento de marea.",
    favorita: "Aparece una estrella dorada de «favorita» en el cartel y destellos: la mejor, la más parecida, la favorita, recomendada.",
  },
  center: [0, 1.72, 0], radius: 1.05,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.6, 0], base: [0, 0.3, 0], cartel: [-1.45, 1.95, 0.15], planeta: [0, 1.35, 0.6], estrella: [1.5, 2.0, -1.6], dia: [0.55, 1.6, 0.6], noche: [-0.6, 1.2, 0.6] },
  build: (_L, pose) => {
    const p = poseOf(planeta_venta, pose, "planeta_venta"), cfg = EXO[p], b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const R = 0.95, Y = 1.35;
    // la luz entra de lado y algo de frente (no desde la posición real de la estrella, que queda detrás): se ven el día y la noche
    const { m: planet, uni } = litSphere(b, R, exoTex(b, p), cfg.tint, [cfg.sp[0], cfg.sp[1] - Y, cfg.sp[2] + 2.6]);
    planet.position.y = Y; planet.rotation.z = 0.25;
    const atm = new THREE.Mesh(b.track(new THREE.SphereGeometry(R * 1.05, 48, 32)), b.track(new THREE.MeshBasicMaterial({ color: col(cfg.atm).multiplyScalar(0.9), transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
    atm.position.y = Y;
    const star = starBall(b, cfg.sr, ...cfg.star); star.position.set(...cfg.sp);
    const sh = [halo(b, rgbaOf(cfg.star[0], 0.9), cfg.sr * 4.6, 0.85), halo(b, "rgba(255,150,90,0.5)", cfg.sr * 8, 0.35)];
    sh.forEach((h) => { h.position.set(cfg.sp[0], cfg.sp[1], cfg.sp[2] - 0.2); g.add(h); });
    // cartel: poste clavado en el polo, tablero con su textura, dos tornillos y una estrella de «favorita» escondida
    const SA = 1.05, sign = new THREE.Group(); sign.position.set(-Math.sin(SA) * (R - 0.05), Y + Math.cos(SA) * (R - 0.05), 0.12); sign.rotation.z = SA; sign.scale.setScalar(0.85);
    const wood = mat(b, "#6b4a32", { roughness: 0.8 }), st = signTex(b);
    sign.add(place(cyl(b, 0.035, 0.045, 0.62, wood, 12), [0, 0.31, 0]));
    const board = box(b, 0.98, 0.46, 0.05, mat(b, "#f6f2e6", { roughness: 0.6 })); board.position.y = 0.66; sign.add(board);
    const face = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.96, 0.45)), b.track(new THREE.MeshStandardMaterial({ map: st, roughness: 0.6, emissive: new THREE.Color("#ffffff").multiplyScalar(0.55), emissiveMap: st })));
    face.position.set(0, 0.66, 0.027); sign.add(face);
    [-0.4, 0.4].forEach((x) => sign.add(place(ball(b, 0.018, mat(b, "#9aa0ad", { metalness: 0.6, roughness: 0.3 }), 8), [x, 0.84, 0.03])));
    const badge = new THREE.Group(); badge.position.set(0.47, 0.9, 0.06); sign.add(badge);
    const starShape = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 0.07 : 0.16; k ? starShape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : starShape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    badge.add(new THREE.Mesh(b.track(new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: false })), beam(b, "#ffcf5a", 1.8)));
    const bglow = halo(b, "rgba(255,210,110,0.9)", 0.8, 0); badge.add(bglow); badge.scale.setScalar(0.001);
    // rocas y un pequeño cráter alrededor del poste (que el cartel se vea clavado en el suelo)
    scatter(6, 5, (r) => [(r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.3] as P3).forEach((q, i) => sign.add(place(ball(b, 0.035 + (i % 3) * 0.015, mat(b, "#5a3a2a", { roughness: 1 }), 8), [q[0], 0.02, q[2]])));
    const scraps = scatter(70, 9, (r) => [(r() - 0.5) * 9, 0.2 + r() * 5, -3 - r() * 2] as P3).map((q, i) => place(ball(b, 0.012 + (i % 4) * 0.006, beam(b, i % 3 ? "#ffffff" : "#ffd9b0", 1.4), 6), q));
    g.add(planet, atm, star, sign, ...scraps); root.add(g); shadows(g);
    const s = { cartel: 1, cara: 0, favorita: 0 }; let lf = 0;
    const paint = (f: number) => {
      lf = f; const lock = ease(s.cara);
      uni.spin.value = f * 0.0016 * (1 - lock); uni.term.value = lock;
      star.rotation.y = f * 0.003; sh[0].scale.setScalar(1 + 0.05 * Math.sin(f * 0.05));
      const pc = clamp01(s.cartel), bounce = pc < 1 ? ease(pc) * (1 + 0.3 * Math.sin(Math.PI * pc)) : 1;
      sign.scale.set(0.85, 0.85 * Math.max(0.001, bounce), 0.85); sign.rotation.z = SA + 0.04 * Math.sin(f * 0.04) * (pc < 1 ? 3 : 1);
      const fv = ease(s.favorita); badge.scale.setScalar(Math.max(0.001, fv * (1 + 0.15 * Math.sin(f * 0.15)))); badge.rotation.z = f * 0.02 * fv;
      (bglow.material as THREE.MeshBasicMaterial).opacity = 0.7 * fv;
      g.position.y = 0.03 * Math.sin(f * 0.03);
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name in s) s[name as keyof typeof s] = u; paint(lf); } };
  },
};

// mudanza-planeta · enana roja: sola y enorme con su planeta pegado (llamaradas), o TRAPPIST-1 con sus siete planetas y la zona habitable
const TRAP = [0.62, 0.8, 1.0, 1.2, 1.42, 1.64, 1.86];   // radios de órbita (no a escala): b, c, d, e, f, g, h
export const enana_roja: HeroDef = {
  kind: "primitive",
  when: "Una enana roja: estrella pequeña, roja y fría, con llamaradas violentas que barren a su planeta, o el sistema TRAPPIST-1 con siete planetas del tamaño de la Tierra en órbitas apretadas y su zona habitable; Próxima Centauri, estrella roja, radiación, sistema con muchos planetas.",
  poses: ["sola", "trappist"],
  actions: {
    llamarada: "Una llamarada sale de la estrella hacia el planeta, una onda de radiación lo barre y el planeta se enciende de rojo: llamarada, radiación, violenta, tormenta estelar.",
    contar: "Los planetas aparecen uno a uno en sus órbitas: siete planetas, uno tras otro, un sistema entero.",
    resaltar: "Se enciende en verde la franja habitable y los planetas que caen en ella brillan: zona habitable, donde podría haber agua líquida, tres planetas.",
  },
  center: [0, 1.4, 0], radius: 1.2,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.8, 0], base: [0, 0.2, 0], estrella: [0, 1.4, 0.4], planeta: [-1.45, 0.95, 0.7], zona: [1.6, 1.4, 0.3] },
  build: (_L, pose) => {
    const p = poseOf(enana_roja, pose, "enana_roja"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), Y = 1.4;
    const sola = p === "sola", SR = sola ? 1.0 : 0.42;
    const star = starBall(b, SR, "#ff4a2a", "#ffa060", "rgba(90,8,8,0.7)"); star.position.y = Y;
    const glows = [halo(b, "rgba(255,80,40,0.95)", SR * 4.4, 0.85), halo(b, "rgba(255,40,30,0.5)", SR * 6.5, 0.3)];
    glows.forEach((h) => { h.position.set(0, Y, -0.5); g.add(h); });
    // bucles magnéticos en el borde (se ven como arcos encendidos)
    const loops = [0.5, 1.9, 3.4, 4.6].map((a, i) => tube(b, Array.from({ length: 12 }, (_, k) => { const t = k / 11, r = SR * (0.99 + 0.16 * Math.sin(Math.PI * t)), ang = a + (t - 0.5) * 0.22; return [Math.cos(ang) * r, Y + Math.sin(ang) * r, SR * 0.35] as P3; }), SR * 0.035, beam(b, "#ffb070", 1.8, { transparent: true, opacity: 0.85 }), 20));
    g.add(star, ...loops);
    const st = { llamarada: 0, contar: 1, resaltar: 0 }; let lf = 0;
    // pose «sola»: el planeta pegado a la estrella y la llamarada que lo alcanza
    let planet: ReturnType<typeof litSphere> | null = null; const flare = new THREE.Group(); let wave: THREE.Mesh | null = null;
    if (sola) {
      planet = litSphere(b, 0.3, exoTex(b, "roca"), "#ff7a50", [1.45, 0.45, -0.7], 40); planet.m.position.set(-1.45, 0.95, 0.7); g.add(planet.m);
      const pts = Array.from({ length: 26 }, (_, k) => { const t = k / 25, a = 3.55 + (t - 0.5) * 0.55, r = SR * (1 + 0.8 * Math.sin(Math.PI * t)); return [Math.cos(a) * r, Y + Math.sin(a) * r, 0.2] as P3; });
      flare.add(tube(b, pts, 0.08, beam(b, "#ffd080", 2.2, { transparent: true, opacity: 0.95 }), 40), tube(b, pts, 0.16, beam(b, "#ff6a30", 1.4, { transparent: true, opacity: 0.4 }), 40));
      flare.visible = false; g.add(flare);
      wave = new THREE.Mesh(b.track(new THREE.SphereGeometry(1, 40, 28)), beam(b, "#ff7a50", 1.3, { transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      wave.position.y = Y; g.add(wave);
    }
    // pose «trappist»: órbitas inclinadas, siete planetas y la franja habitable (e, f, g)
    const orb = new THREE.Group(); orb.position.y = Y; orb.rotation.x = 0.5; orb.rotation.z = -0.12; orb.scale.setScalar(1.22);
    const worlds: { m: THREE.Mesh; r: number; ph: number; hab: boolean; ring: THREE.Mesh }[] = [];
    let band: THREE.Mesh | null = null;
    if (!sola) {
      const cols = ["#b98a6a", "#a8735a", "#c9a27a", "#3f7fb5", "#4a8a9a", "#5f8fb8", "#9fb4c8"];
      band = new THREE.Mesh(b.track(new THREE.RingGeometry(1.1, 1.75, 96)), beam(b, TONE.green, 0.9, { transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      band.rotation.x = -Math.PI / 2; orb.add(band);
      TRAP.forEach((r, i) => {
        const line = new THREE.Mesh(b.track(new THREE.TorusGeometry(r, 0.006, 4, 120)), beam(b, "#c9d6ff", 0.9, { transparent: true, opacity: 0.35 })); line.rotation.x = Math.PI / 2; orb.add(line);
        const m = ball(b, 0.1 + (i % 3) * 0.015, glowMat(b, cols[i], 0.3, { roughness: 0.6 }), 24); orb.add(m);
        const ring = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.16, 0.012, 6, 32)), beam(b, TONE.green, 2, { transparent: true, opacity: 0 })); orb.add(ring);
        worlds.push({ m, r, ph: hash1(i + 7) * 6.28, hab: i >= 3 && i <= 5, ring });
      });
      g.add(orb);
    }
    const stars = scatter(60, 4, (r) => [(r() - 0.5) * 8, 0.2 + r() * 4.5, -3 - r() * 2] as P3).map((q, i) => place(ball(b, 0.012 + (i % 4) * 0.006, beam(b, "#ffffff", 1.3), 6), q));
    g.add(...stars); root.add(g); shadows(g);
    const paint = (f: number) => {
      lf = f; star.rotation.y = f * 0.004; glows.forEach((h, i) => h.scale.setScalar(1 + 0.05 * Math.sin(f * 0.05 + i)));
      loops.forEach((l, i) => { l.scale.setScalar(1 + 0.03 * Math.sin(f * 0.06 + i)); });
      if (planet && wave) {
        const fl = clamp01(st.llamarada), grow = ease(fl / 0.5), hitU = clamp01((fl - 0.35) / 0.3);
        flare.visible = fl > 0; flare.scale.setScalar(Math.max(0.001, grow)); flare.position.set(0, Y * (1 - grow), 0);
        wave.scale.setScalar(SR + 2.2 * ease(clamp01((fl - 0.2) / 0.6))); (wave.material as THREE.MeshBasicMaterial).opacity = fl > 0.2 ? 0.22 * (1 - ease(clamp01((fl - 0.2) / 0.8))) + 0.04 : 0;
        planet.uni.hit.value = hitU * (0.7 + 0.3 * Math.sin(f * 0.4)) * (1 - 0.5 * clamp01((fl - 0.85) / 0.15));
        planet.uni.spin.value = f * 0.002; planet.m.position.y = 0.95 + 0.02 * Math.sin(f * 0.04);
      }
      const hb = ease(st.resaltar);
      if (band) (band.material as THREE.MeshBasicMaterial).opacity = 0.22 * hb;
      worlds.forEach((w, i) => {
        const a = w.ph + f * (0.022 / Math.pow(w.r, 1.5)), show = ease(clamp01(st.contar * 7.5 - i));
        w.m.position.set(Math.cos(a) * w.r, 0, Math.sin(a) * w.r); w.m.scale.setScalar(Math.max(0.001, show * (w.hab ? 1 + 0.25 * hb : 1)));
        w.ring.position.copy(w.m.position); w.ring.lookAt(w.ring.position.clone().add(new THREE.Vector3(0, 1, 0))); w.ring.rotation.x = Math.PI / 2;
        (w.ring.material as THREE.MeshBasicMaterial).opacity = w.hab ? 0.9 * hb * show : 0;
      });
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name in st) st[name as keyof typeof st] = u; paint(lf); } };
  },
};

// mudanza-planeta · dos relojes: el tuyo (viajas casi a la velocidad de la luz, casi parado) y el de la Tierra (corre), con el contador de años
const clockFace = (b: Bin, ring: string) => screenTex(b.track, 512, 512, (c) => {
  const gr = c.createRadialGradient(256, 230, 40, 256, 256, 256); gr.addColorStop(0, "#fbf8ef"); gr.addColorStop(1, "#d9d3c2"); c.fillStyle = gr; c.fillRect(0, 0, 512, 512);
  c.strokeStyle = ring; c.lineWidth = 18; c.beginPath(); c.arc(256, 256, 238, 0, 6.3); c.stroke();
  for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, big = i % 5 === 0, r0 = big ? 196 : 212; c.strokeStyle = "#2a2f45"; c.lineWidth = big ? 9 : 3; c.beginPath(); c.moveTo(256 + Math.sin(a) * r0, 256 - Math.cos(a) * r0); c.lineTo(256 + Math.sin(a) * 226, 256 - Math.cos(a) * 226); c.stroke(); }
  c.fillStyle = "#2a2f45"; c.font = "700 54px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
  [12, 3, 6, 9].forEach((n, i) => { const a = (i / 4) * Math.PI * 2; c.fillText(String(n), 256 + Math.sin(a) * 160, 258 - Math.cos(a) * 160); });
});
const labelTex = (b: Bin, text: string, color: string) => screenTex(b.track, 512, 160, (c) => {
  c.fillStyle = "#151a33"; c.beginPath(); c.roundRect(6, 6, 500, 148, 40); c.fill(); c.strokeStyle = color; c.lineWidth = 8; c.stroke();
  c.fillStyle = color; c.font = "900 92px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 256, 84);
});
export const relojes_tiempo: HeroDef = {
  kind: "primitive",
  when: "Dos relojes lado a lado: el tuyo, que casi no avanza porque viajas cerca de la velocidad de la luz, y el de la Tierra, que corre y suma años: dilatación del tiempo, paradoja de los gemelos, para ti el tiempo casi no pasa, en la Tierra pasan años.",
  poses: ["par"],
  actions: {
    frenar: "Tu reloj se frena casi hasta parar y se rodea de un brillo cian (se queda así): para ti el tiempo casi no pasa, viajas a esa velocidad.",
    correr: "Las agujas del reloj de la Tierra giran a toda velocidad y el contador suma años hasta cuarenta: en la Tierra pasan años, mientras viajas.",
  },
  center: [0, 1.45, 0], radius: 1.25,
  anchors: { hero: [0, 1.5, 0], top: [0, 2.6, 0], base: [0, 0.3, 0], tu: [-0.85, 1.55, 0.2], tierra: [0.85, 1.55, 0.2], contador: [0.85, 0.55, 0.2] },
  build: (_L, pose) => {
    poseOf(relojes_tiempo, pose, "relojes_tiempo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), Y = 1.55;
    const dark = mat(b, "#2a2f45", { roughness: 0.4, metalness: 0.4 });
    const mkClock = (x: number, ringCol: string, label: string) => {
      const c = new THREE.Group(); c.position.set(x, Y, 0);
      const rim = new THREE.Mesh(b.track(new THREE.TorusGeometry(0.62, 0.06, 16, 64)), mat(b, ringCol, { roughness: 0.3, metalness: 0.6, emissive: col(ringCol).multiplyScalar(0.25) }));
      const back = cyl(b, 0.62, 0.62, 0.1, dark, 64); back.rotation.x = Math.PI / 2; back.position.z = -0.06;
      const faceT = clockFace(b, ringCol);
      const face = new THREE.Mesh(b.track(new THREE.CircleGeometry(0.6, 64)), b.track(new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.5, emissive: new THREE.Color("#ffffff").multiplyScalar(0.45), emissiveMap: faceT })));
      face.position.z = 0.0;
      const hand = (len: number, w: number, z: number, m: THREE.Material) => { const h = new THREE.Group(); const bx = box(b, w, len, 0.02, m); bx.position.y = len / 2 - 0.05; h.add(bx); h.position.z = z; return h; };
      const hour = hand(0.34, 0.05, 0.02, dark), minute = hand(0.5, 0.032, 0.035, dark), sec = hand(0.52, 0.012, 0.05, mat(b, "#d9444e", { emissive: col("#d9444e").multiplyScalar(0.4) }));
      const cap = place(cyl(b, 0.045, 0.045, 0.03, mat(b, ringCol, { metalness: 0.6, roughness: 0.3 }), 16), [0, 0, 0.06]); cap.rotation.x = Math.PI / 2;
      const lt = labelTex(b, label, ringCol), plate = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.72, 0.225)), b.track(new THREE.MeshBasicMaterial({ map: lt, transparent: true })));
      plate.position.set(0, 0.86, 0.02);
      const glow = halo(b, rgbaOf(ringCol, 0.9), 2.2, 0); glow.position.z = -0.12;
      c.add(glow, back, rim, face, hour, minute, sec, cap, plate);
      // patas de reloj de mesa
      [-1, 1].forEach((s) => c.add(rod(b, [s * 0.3, -0.55, -0.02], [s * 0.42, -0.8, -0.02], 0.03, dark)));
      g.add(c); return { c, hour, minute, sec, glow };
    };
    const tu = mkClock(-0.85, "#5ad1ff", "TÚ"), tierra = mkClock(0.85, "#ffc04a", "TIERRA");
    // contador de años bajo el reloj de la Tierra (se repinta solo cuando cambia el número)
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 180; const cx = cv.getContext("2d")!;
    const ctex = b.track(new THREE.CanvasTexture(cv)); ctex.colorSpace = THREE.SRGBColorSpace;
    const counter = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.9, 0.316)), b.track(new THREE.MeshBasicMaterial({ map: ctex, transparent: true }))); counter.position.set(0.85, 0.5, 0.05);
    let shown = -1;
    const drawCount = (n: number) => { if (n === shown) return; shown = n; cx.clearRect(0, 0, 512, 180); cx.fillStyle = "#151a33"; cx.beginPath(); cx.roundRect(6, 6, 500, 168, 36); cx.fill(); cx.strokeStyle = "#ffc04a"; cx.lineWidth = 6; cx.stroke(); cx.fillStyle = "#ffe2a0"; cx.font = "900 96px sans-serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(`+${n} AÑOS`, 256, 94); ctex.needsUpdate = true; };
    drawCount(0); g.add(counter);
    // estela de la nave entre los dos (rayas de velocidad tras el reloj «tú»)
    const streaks = Array.from({ length: 9 }, (_, i) => { const m = new THREE.Mesh(b.track(new THREE.BoxGeometry(0.5 + hash1(i) * 0.6, 0.012, 0.012)), beam(b, "#8be9ff", 1.6, { transparent: true, opacity: 0 })); m.position.set(-1.6 - hash1(i + 3) * 0.6, 1.0 + hash1(i + 9) * 1.2, -0.3); g.add(m); return m; });
    root.add(g); shadows(g);
    const st = { frenar: 0, correr: 0 }; let lf = 0;
    const paint = (f: number) => {
      lf = f; const fr = ease(st.frenar), ru = clamp01(st.correr);
      // el tuyo: ritmo normal que cae casi a cero al frenar
      const tuT = f * (1 - 0.97 * fr) * 0.02;
      tu.sec.rotation.z = -tuT * 6; tu.minute.rotation.z = -tuT * 0.5 - 0.6; tu.hour.rotation.z = -tuT * 0.04 - 2.2;
      (tu.glow.material as THREE.MeshBasicMaterial).opacity = 0.55 * fr;
      streaks.forEach((s, i) => { s.position.x = -1.2 - ((f * 0.05 + hash1(i) * 3) % 1.4); (s.material as THREE.MeshBasicMaterial).opacity = 0.7 * fr; });
      // la Tierra: con «correr» las agujas se disparan y el contador sube hasta 40
      const tiT = f * 0.02 + 120 * ease(ru) * 6.28;
      tierra.sec.rotation.z = -tiT * 6; tierra.minute.rotation.z = -tiT * 0.5 - 1.4; tierra.hour.rotation.z = -tiT * 0.04 - 0.4;
      (tierra.glow.material as THREE.MeshBasicMaterial).opacity = 0.5 * Math.sin(Math.PI * Math.min(1, ru * 1.2)) + 0.2 * (ru >= 1 ? 1 : 0);
      drawCount(Math.round(40 * ease(ru)));
      tierra.c.position.y = Y + (ru > 0 && ru < 1 ? 0.015 * Math.sin(f * 1.3) : 0);
    };
    return { ...done(root, b, paint), act: (name, u) => { if (name in st) st[name as keyof typeof st] = u; paint(lf); } };
  },
};
