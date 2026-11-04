// Pack C · Cerebro y psicología (F11): cerebro con zonas, ilusión óptica, cama con sueño, cajones de memoria, cara
// con emociones y reloj biológico de 24 h. Genéricos y estilizados; las zonas que se explican brillan.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, screenTex, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, cyl, glowMat, halo, mat, place, rod, scatter, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const cerebro: HeroDef = {
  kind: "primitive",
  when: "Cerebro: memoria, emociones, sueño, pensar, aprendizaje, por qué olvidamos, miedo, atención, hemisferios y zonas del cerebro.",
  poses: ["activo", "memoria", "emocion", "sueno"],
  center: [0, 1.4, 0], radius: 1.35,
  anchors: { hero: [0, 1.4, 0.3], top: [0, 2.5, 0], base: [0, 0.2, 0], frontal: [0.8, 1.7, 0.7], hipocampo: [0.1, 1.15, 0.8], amigdala: [0.35, 1.05, 0.8], cerebelo: [-0.8, 0.85, 0.2], corteza: [0, 2.3, 0.2] },
  build: (_L, pose) => {
    const p = poseOf(cerebro, pose, "cerebro"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const m = glowMat(b, col("#ff9db0", TONE.flesh, 0.35), 0.22, { roughness: 0.55 });
    const lobes = [-1, 1].map((s, i) => { const l = blob(b, 0.95, 0.085, 3 + i * 2, m, 5, 4.2); l.scale.set(0.62, 0.78, 1.0); l.position.set(s * 0.33, 1.5, 0); g.add(l); return l; });
    const cer = blob(b, 0.42, 0.06, 6, glowMat(b, col("#ff9db0", TONE.violet, 0.35), 0.2), 4, 3); cer.scale.set(1.2, 0.7, 0.9); cer.position.set(0, 0.82, -0.62);
    const stem = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.14, 0.5, 6, 12)), glowMat(b, col("#ffc09a", TONE.flesh, 0.3), 0.2)); stem.position.set(0, 0.58, -0.15); stem.rotation.x = 0.35;
    const zone: Record<string, [P3, string]> = { memoria: [[0.78, 1.2, 0.45], TONE.gold], emocion: [[0.72, 1.12, 0.6], TONE.glowRed], sueno: [[0, 2.05, 0.2], TONE.cyan], activo: [[0, 1.5, 0.9], TONE.green] };
    const [zp, zc] = zone[p], hl = halo(b, `${col(zc).getStyle()}`.replace("rgb", "rgba").replace(")", ",0.95)"), 1.5, 0.9); hl.position.set(...zp); hl.lookAt(0, 1.4, 5);
    const spark = scatter(p === "activo" ? 16 : 6, 3, (r) => [(r() - 0.5) * 1.3, 1.2 + r() * 0.9, 0.6 + r() * 0.3] as P3).map((q) => ({ s: ball(b, 0.035, beam(b, zc, 1.8), 8), q }));
    g.add(cer, stem, hl, ...spark.map((x) => x.s)); root.add(g); shadows(g);
    return done(root, b, (f) => {
      const k = 1 + 0.025 * Math.sin(f * 0.08); lobes.forEach((l) => l.scale.set(0.62 * k, 0.78 * k, 1.0 * k));
      hl.scale.setScalar(0.85 + 0.2 * Math.sin(f * 0.1)); (hl.material as THREE.MeshBasicMaterial).opacity = 0.55 + 0.3 * Math.sin(f * 0.1);
      spark.forEach(({ s, q }, i) => { s.position.set(q[0] + 0.1 * Math.sin(f * 0.05 + i), q[1] + 0.1 * Math.cos(f * 0.07 + i), q[2]); s.visible = Math.sin(f * 0.2 + i * 2) > -0.3; });
      g.rotation.y = 0.55 * Math.sin(f * 0.01);
    });
  },
};

export const ojo_ilusion: HeroDef = {
  kind: "primitive",
  when: "Ilusiones ópticas: cómo nos engaña la vista, espirales que giran, líneas que parecen torcidas, color y contraste, por qué el cerebro completa lo que no ve.",
  poses: ["espiral", "tablero"],
  center: [0, 1.5, 0], radius: 1.4,
  anchors: { hero: [0, 1.5, 0.1], top: [0, 2.9, 0], base: [0, 0.1, 0], centro: [0, 1.5, 0.1], borde: [1.3, 1.5, 0.1] },
  build: (_L, pose) => {
    const p = poseOf(ojo_ilusion, pose, "ojo_ilusion"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 1024, 1024, (c) => {
      c.fillStyle = "#f4f1e8"; c.fillRect(0, 0, 1024, 1024); c.translate(512, 512);
      if (p === "espiral") { c.strokeStyle = "#1b1b3a"; c.lineWidth = 26; for (let k = 0; k < 2; k++) { c.beginPath(); for (let t = 0; t < 30; t += 0.05) { const r = 14 + t * 16, a = t + k * Math.PI; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke(); } }
      else { for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) { if ((i + j) % 2) { c.fillStyle = "#1b1b3a"; c.fillRect(-480 + i * 80 + ((j % 2) * 14), -480 + j * 80, 80, 80); } } c.fillStyle = "#e8363a"; c.beginPath(); c.arc(0, 0, 40, 0, 6.3); c.fill(); }
    });
    const disc = new THREE.Mesh(b.track(new THREE.CircleGeometry(1.3, 64)), b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.5), roughness: 0.6 })));
    const rim = new THREE.Mesh(b.track(new THREE.TorusGeometry(1.32, 0.05, 12, 80)), glowMat(b, TONE.gold, 0.5)); const stand = cyl(b, 0.08, 0.08, 1.4, mat(b, "#aeb8d6", { metalness: 0.7 }), 12); stand.position.set(0, -0.7, -0.05);
    const wrap = new THREE.Group(); wrap.add(disc, rim); wrap.position.y = 1.5; g.add(wrap, stand); root.add(g); shadows(g);
    return done(root, b, (f) => { disc.rotation.z = f * 0.025; wrap.rotation.y = 0.3 * Math.sin(f * 0.012); });
  },
};

const glyph = (b: Bin, ch: string, c: string, size = 256) => screenTex(b.track, size, size, (g) => { g.clearRect(0, 0, size, size); g.fillStyle = c; g.font = `800 ${size * 0.8}px Montserrat, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, size / 2, size / 2 + size * 0.04); });
const sprite = (b: Bin, t: THREE.Texture, s: number, opacity = 1) => new THREE.Mesh(b.track(new THREE.PlaneGeometry(s, s)), b.track(new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity, depthWrite: false, fog: false })));

export const sueno_cama: HeroDef = {
  kind: "primitive",
  when: "Dormir y soñar: sueño, insomnio, por qué soñamos, ronquidos, siesta, luz azul, ritmo de sueño, por qué nos da sueño.",
  poses: ["durmiendo"],
  center: [0, 1.2, 0], radius: 1.7,
  anchors: { hero: [0, 1.1, 0], top: [0, 2.8, 0], base: [0, 0.05, 0], cabeza: [-0.8, 1.0, 0.3], luna: [1.2, 2.6, -0.4], zzz: [-0.6, 2.0, 0] },
  build: (_L, pose) => {
    poseOf(sueno_cama, pose, "sueno_cama");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const wood = mat(b, "#6a4a3a", { roughness: 0.7 }), sheet = glowMat(b, "#e8e4f8", 0.12, { roughness: 0.9 }), blanket = glowMat(b, "#5b6fd8", 0.22, { roughness: 0.9 });
    const frame = place(box(b, 3.0, 0.3, 1.7, wood), [0, 0.35, 0]), head = place(box(b, 0.15, 1.1, 1.7, wood), [-1.5, 0.8, 0]), foot = place(box(b, 0.15, 0.6, 1.7, wood), [1.5, 0.55, 0]);
    const mat_ = place(box(b, 2.8, 0.28, 1.55, sheet), [0, 0.64, 0]), pillow = place(new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.2, 0.7, 6, 12)), sheet), [-1.0, 0.95, 0]); pillow.rotation.x = Math.PI / 2;
    const cover = place(box(b, 1.9, 0.3, 1.6, blanket), [0.4, 0.95, 0]);
    const sleeper = place(ball(b, 0.3, glowMat(b, "#ffd9c0", 0.2), 20), [-1.0, 1.1, 0]);
    const moon = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.4, 28, 20)), beam(b, "#fff2c0", 1.2)); moon.position.set(1.2, 2.6, -0.4);
    const crescent = new THREE.Mesh(b.track(new THREE.SphereGeometry(0.36, 24, 18)), b.track(new THREE.MeshBasicMaterial({ color: TONE.navy, fog: false }))); crescent.position.set(1.34, 2.68, -0.3);
    const zz = [0, 1, 2].map((i) => { const s = sprite(b, glyph(b, "Z", TONE.cyan), 0.4 + i * 0.12); g.add(s); return { s, i }; });
    const stars = scatter(10, 5, (r) => [(r() - 0.3) * 4, 1.8 + r() * 1.3, -0.8] as P3).map((q) => place(ball(b, 0.035, beam(b, "#fff6d0", 1.8), 6), q));
    g.add(frame, head, foot, mat_, pillow, cover, sleeper, moon, crescent, ...stars); g.rotation.y = 0.3; root.add(g); shadows(g);
    return done(root, b, (f) => {
      zz.forEach(({ s, i }) => { const t = (f * 0.01 + i / 3) % 1; s.position.set(-0.8 + t * 0.8, 1.6 + t * 1.0, 0.2); s.scale.setScalar(0.6 + t); (s.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI); s.lookAt(0, 1.5, 10); });
      cover.position.y = 0.95 + 0.02 * Math.sin(f * 0.06); g.rotation.y = 0.3 + 0.15 * Math.sin(f * 0.01);
    });
  },
};

export const memoria_cajones: HeroDef = {
  kind: "primitive",
  when: "Memoria y recuerdos: por qué olvidamos, cómo se guarda un recuerdo, aprender y repasar, déjà vu, recordar un nombre, recuerdos falsos.",
  poses: ["cajon"],
  center: [0, 1.4, 0], radius: 1.3,
  anchors: { hero: [0, 1.4, 0.3], top: [0, 2.8, 0], base: [0, 0.05, 0], abierto: [0.5, 1.6, 0.9], recuerdo: [0.5, 1.9, 0.9], cajones: [-0.5, 1.2, 0.5] },
  build: (_L, pose) => {
    poseOf(memoria_cajones, pose, "memoria_cajones");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const wood = mat(b, "#7a5a46", { roughness: 0.7 }), dark = mat(b, "#4a3a30", { roughness: 0.8 }), knob = glowMat(b, TONE.gold, 0.4, { metalness: 0.6 });
    g.add(place(box(b, 2.2, 2.8, 0.9, dark), [0, 1.4, -0.05]));
    const drawers: THREE.Group[] = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const d = new THREE.Group(); d.add(box(b, 0.98, 0.84, 0.12, wood), place(ball(b, 0.06, knob, 10), [0, 0, 0.09])); d.position.set((c - 0.5) * 1.05, 0.55 + r * 0.9 + 0.2, 0.45); g.add(d); drawers.push(d);
    }
    const open = drawers[3], card = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.7, 0.5)), glowMat(b, "#fff6d0", 0.8, { side: THREE.DoubleSide })); card.position.set(0, 0.05, 0.5); open.add(card);
    const photo = new THREE.Mesh(b.track(new THREE.PlaneGeometry(0.5, 0.3)), glowMat(b, TONE.cyan, 0.7)); photo.position.set(0, 0.07, 0.505); open.add(photo);
    const lg = halo(b, "rgba(255,225,150,0.95)", 2.2, 0.8); lg.position.set(0.5, 1.9, 0.7); g.add(lg);
    g.rotation.y = -0.25; root.add(g); shadows(g);
    return done(root, b, (f) => { const k = 0.5 + 0.5 * Math.sin(f * 0.04); open.position.z = 0.45 + 0.35 * k; card.position.y = 0.1 + 0.3 * k; photo.position.y = 0.12 + 0.3 * k; (lg.material as THREE.MeshBasicMaterial).opacity = 0.3 + 0.5 * k; g.rotation.y = -0.25 + 0.2 * Math.sin(f * 0.01); });
  },
};

const FACE: Record<string, { eye: string; mouth: string; brow: number }> = { feliz: { eye: "arc", mouth: "smile", brow: 0 }, triste: { eye: "dot", mouth: "frown", brow: 1 }, enojo: { eye: "dot", mouth: "flat", brow: -1 }, miedo: { eye: "wide", mouth: "o", brow: 1 }, sorpresa: { eye: "wide", mouth: "o", brow: 0 } };

export const emocion_cara: HeroDef = {
  kind: "primitive",
  when: "Emociones y expresiones: alegría, tristeza, enojo, miedo, sorpresa, por qué lloramos, por qué nos reímos, contagio de bostezos, lenguaje corporal.",
  poses: ["feliz", "triste", "enojo", "miedo", "sorpresa"],
  center: [0, 1.4, 0], radius: 1.2,
  anchors: { hero: [0, 1.4, 0.8], top: [0, 2.6, 0], base: [0, 0.1, 0], ojos: [0, 1.65, 1.0], boca: [0, 1.1, 1.0], ceja: [0.4, 1.95, 0.9] },
  build: (_L, pose) => {
    const p = poseOf(emocion_cara, pose, "emocion_cara"), F = FACE[p], b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 1024, 512, (c) => {
      c.fillStyle = "#f4c04a"; c.fillRect(0, 0, 1024, 512); c.strokeStyle = "#3a2a1a"; c.fillStyle = "#3a2a1a"; c.lineWidth = 16; c.lineCap = "round";
      const fx = 256, ey = 210;
      for (const s of [-1, 1]) {
        const x = fx + s * 56;
        if (F.eye === "dot") { c.beginPath(); c.arc(x, ey, 16, 0, 6.3); c.fill(); }
        else if (F.eye === "arc") { c.beginPath(); c.arc(x, ey + 10, 22, Math.PI, 0); c.stroke(); }
        else { c.fillStyle = "#fff"; c.beginPath(); c.arc(x, ey, 26, 0, 6.3); c.fill(); c.fillStyle = "#3a2a1a"; c.beginPath(); c.arc(x, ey, 11, 0, 6.3); c.fill(); }
        c.beginPath(); c.moveTo(x - 24, ey - 44 + F.brow * 12 * s * -1); c.lineTo(x + 24, ey - 44 - F.brow * 12 * s * -1); c.stroke();
      }
      c.beginPath(); const my = 330;
      if (F.mouth === "smile") c.arc(fx, my - 40, 60, 0.2, Math.PI - 0.2); else if (F.mouth === "frown") c.arc(fx, my + 50, 56, Math.PI + 0.3, -0.3); else if (F.mouth === "flat") { c.moveTo(fx - 44, my); c.lineTo(fx + 44, my + 6); } else c.ellipse(fx, my, 30, 40, 0, 0, 6.3);
      c.stroke();
      if (p === "triste") { c.fillStyle = "#5fd4f4"; c.beginPath(); c.ellipse(fx + 80, ey + 50, 9, 16, 0, 0, 6.3); c.fill(); }
      if (p === "enojo") { c.fillStyle = "rgba(255,90,95,0.35)"; c.fillRect(0, 0, 1024, 512); }
    });
    const head = new THREE.Mesh(b.track(new THREE.SphereGeometry(1.0, 64, 48)), b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.35), roughness: 0.55 })));
    head.position.y = 1.4; g.add(head); root.add(g); shadows(g);
    return done(root, b, (f) => { head.rotation.y = 0.18 * Math.sin(f * 0.02); head.rotation.x = 0.05 * Math.sin(f * 0.03); const sc = p === "sorpresa" || p === "miedo" ? 1 + 0.03 * Math.sin(f * 0.3) : p === "enojo" ? 1 + 0.015 * Math.sin(f * 0.5) : 1; head.scale.setScalar(sc); head.position.y = 1.4 + 0.03 * Math.sin(f * 0.05); });
  },
};

export const reloj_biologico: HeroDef = {
  kind: "primitive",
  when: "Reloj biológico y ritmo circadiano: por qué tenemos sueño de noche, jet lag, luz y melatonina, madrugar o trasnochar, el día de 24 horas.",
  poses: ["dia"],
  center: [0, 1.5, 0], radius: 1.35,
  anchors: { hero: [0, 1.5, 0.1], top: [0, 2.9, 0], base: [0, 0.1, 0], sol: [0, 2.3, 0.1], luna: [0, 0.7, 0.1], aguja: [0.7, 1.5, 0.15] },
  build: (_L, pose) => {
    poseOf(reloj_biologico, pose, "reloj_biologico");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const tex = screenTex(b.track, 1024, 1024, (c) => {
      c.translate(512, 512); c.fillStyle = "#1b2250"; c.beginPath(); c.arc(0, 0, 480, 0, 6.3); c.fill();
      c.fillStyle = "#f7c85a"; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 480, Math.PI, 2 * Math.PI); c.fill();
      c.fillStyle = "#fff6d0"; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(-420 + ((i * 131) % 840), 60 + ((i * 53) % 330), 5, 0, 6.3); c.fill(); }
      c.strokeStyle = "#ffffff"; c.lineWidth = 8; for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283; c.beginPath(); c.moveTo(Math.cos(a) * 440, Math.sin(a) * 440); c.lineTo(Math.cos(a) * (i % 6 ? 462 : 400), Math.sin(a) * (i % 6 ? 462 : 400)); c.stroke(); }
      c.fillStyle = "#ffffff"; c.font = "800 70px Montserrat"; c.textAlign = "center"; c.textBaseline = "middle"; for (const [t, a] of [["0", 90], ["6", 180], ["12", 270], ["18", 0]] as [string, number][]) c.fillText(t, Math.cos((a * Math.PI) / 180) * 340, Math.sin((a * Math.PI) / 180) * 340);
    });
    const dial = new THREE.Mesh(b.track(new THREE.CircleGeometry(1.2, 64)), b.track(new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color("#ffffff").multiplyScalar(0.5), roughness: 0.5 })));
    const rim = new THREE.Mesh(b.track(new THREE.TorusGeometry(1.22, 0.07, 12, 80)), glowMat(b, TONE.lavender, 0.3, { metalness: 0.6 }));
    const hand = new THREE.Group(); hand.add(place(box(b, 0.07, 0.95, 0.05, glowMat(b, "#ffffff", 0.7)), [0, 0.47, 0.06]), place(ball(b, 0.1, glowMat(b, "#ffffff", 0.7), 14), [0, 0, 0.07]));
    const sun = place(ball(b, 0.13, beam(b, "#ffe08a", 1.6), 14), [0, 0.9, 0.08]), moon = place(ball(b, 0.11, beam(b, "#dfe6ff", 1.4), 14), [0, -0.9, 0.08]);
    const wrap = new THREE.Group(); wrap.add(dial, rim, hand, sun, moon); wrap.position.y = 1.5; g.add(wrap); root.add(g); shadows(g);
    return done(root, b, (f) => { hand.rotation.z = -f * 0.02; wrap.rotation.y = 0.35 * Math.sin(f * 0.011); });
  },
};

