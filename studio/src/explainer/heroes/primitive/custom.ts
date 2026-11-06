// Prefabs creados a medida para un video (un archivo para todos): cada uno nace porque un guion pedía una imagen que
// el catálogo no tenía, y se queda aquí para reutilizarlo. Nombre del video de origen en el comentario de cada uno.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, box, cyl, ghostMat, glowMat, halo, mat, place, rod, scatter, tube, type Bin } from "./kit";

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
