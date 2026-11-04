// Pack B (2.ª tanda) · Micro: mitocondria, anticuerpo, jeringa con vacuna, cromosoma, coágulo y protozoo.
import * as THREE from "three";
import { type HeroDef, bin, poseOf, shadows } from "../types";
import { TONE, ball, beam, blob, box, col, cyl, ghostMat, glowMat, mat, place, rod, scatter, tube, virusBody, type Bin } from "./kit";

const done = (root: THREE.Object3D, b: Bin, update: (f: number) => void) => ({ root, update, dispose: b.dispose });
type P3 = [number, number, number];

export const mitocondria: HeroDef = {
  kind: "primitive",
  when: "Mitocondria: la energía de la célula, ATP, respirar a nivel celular, por qué nos cansamos, metabolismo, de dónde sale la energía de la comida.",
  poses: ["corte"],
  center: [0, 1.3, 0], radius: 1.2,
  anchors: { hero: [0, 1.3, 0.3], top: [0, 2.3, 0], base: [0, 0.2, 0], membrana: [1.1, 1.5, 0.3], cresta: [0, 1.3, 0.3], matriz: [-0.4, 1.0, 0.3] },
  build: (_L, pose) => {
    poseOf(mitocondria, pose, "mitocondria");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const out = glowMat(b, "#ff9a3a", 0.3, { transparent: true, opacity: 0.55, roughness: 0.4 }), cap = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.62, 1.4, 12, 32)), out); cap.rotation.z = Math.PI / 2; cap.position.y = 1.3; cap.renderOrder = 2;
    const inner = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.5, 1.3, 12, 32)), glowMat(b, "#ffd9a0", 0.3, { transparent: true, opacity: 0.45 })); inner.rotation.z = Math.PI / 2; inner.position.y = 1.3;
    const cr = Array.from({ length: 6 }, (_, i) => { const x = -0.85 + i * 0.34, up = i % 2 ? 1 : -1; return tube(b, [[x, 1.3 + up * 0.5, 0.0], [x + 0.08, 1.3 + up * 0.1, 0.05], [x - 0.08, 1.3 - up * 0.1, 0.02], [x + 0.05, 1.3 - up * 0.2, 0]], 0.07, glowMat(b, "#ff6a3a", 0.5), 20); });
    const atp = scatter(8, 4, (r) => [(r() - 0.5) * 1.2, 1.1 + r() * 0.5, 0.35] as P3).map((q) => ({ s: place(ball(b, 0.07, beam(b, TONE.gold, 2), 8), q), q }));
    g.add(cap, inner, ...cr, ...atp.map((a) => a.s)); root.add(g); shadows(g);
    return done(root, b, (f) => { atp.forEach(({ s, q }, i) => { const t = (f * 0.012 + i / 8) % 1; s.position.set(q[0] + 1.4 * t, q[1] + 0.5 * t, 0.4); s.scale.setScalar(1 - 0.5 * t); }); g.rotation.y = 0.5 * Math.sin(f * 0.01); g.rotation.z = 0.1 * Math.sin(f * 0.02); });
  },
};

export const anticuerpo: HeroDef = {
  kind: "primitive",
  when: "Anticuerpos y defensas: sistema inmune, vacunas, alergias, cómo el cuerpo reconoce un virus, inmunidad, por qué enfermamos una vez y luego no.",
  poses: ["libre", "uniendo"],
  center: [0, 1.4, 0], radius: 1.3,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.6, 0], base: [0, 0.2, 0], brazo: [0.7, 2.0, 0], tallo: [0, 1.0, 0], virus: [1.3, 2.4, 0] },
  build: (_L, pose) => {
    const p = poseOf(anticuerpo, pose, "anticuerpo"), b = bin(), root = new THREE.Group(), g = new THREE.Group(), y = new THREE.Group();
    const m = glowMat(b, "#b36bff", 0.35, { roughness: 0.4 });
    y.add(tube(b, [[0, -0.2, 0], [0, 0.7, 0]], 0.14, m, 12), tube(b, [[0, 0.7, 0], [-0.7, 1.35, 0]], 0.14, m, 12), tube(b, [[0, 0.7, 0], [0.7, 1.35, 0]], 0.14, m, 12));
    for (const s of [-1, 1]) y.add(place(ball(b, 0.22, glowMat(b, TONE.cyan, 0.6), 14), [s * 0.78, 1.43, 0]));
    y.position.y = 0.9; y.scale.setScalar(1.15);
    const v = virusBody(b, 0.32); v.position.set(1.2, 2.55, 0); if (p === "libre") v.position.set(1.9, 2.9, 0);
    const v2 = virusBody(b, 0.32); v2.position.set(-1.2, 2.55, 0); if (p === "libre") v2.position.set(-1.9, 2.9, 0);
    g.add(y, v, v2, place(ball(b, 0.06, mat(b, "#fff"), 8), [0, -5, 0])); root.add(g); shadows(g);
    return done(root, b, (f) => { v.rotation.y = f * 0.03; v2.rotation.y = -f * 0.03; const k = p === "uniendo" ? 0.04 * Math.sin(f * 0.2) : 0.12 * Math.sin(f * 0.04); v.position.y += 0; y.rotation.z = k; g.rotation.y = 0.35 * Math.sin(f * 0.01); });
  },
};

export const jeringa_vacuna: HeroDef = {
  kind: "primitive",
  when: "Vacunas e inyecciones: cómo funciona una vacuna, inmunidad, por qué duele el pinchazo, dosis, refuerzos, medicinas y jeringas, entrenar a las defensas.",
  poses: ["jeringa"],
  center: [0, 1.3, 0], radius: 1.3,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.3, 0], base: [0, 0.1, 0], aguja: [-1.9, 1.3, 0], embolo: [1.8, 1.3, 0], liquido: [0, 1.3, 0.3] },
  build: (_L, pose) => {
    poseOf(jeringa_vacuna, pose, "jeringa_vacuna");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), sy = new THREE.Group();
    const barrel = cyl(b, 0.34, 0.34, 2.2, ghostMat(b, "#cfe7ff", 0.3), 28); barrel.rotation.z = Math.PI / 2;
    const liq = cyl(b, 0.3, 0.3, 1.6, glowMat(b, TONE.green, 0.45, { transparent: true, opacity: 0.85 }), 24); liq.rotation.z = Math.PI / 2; liq.position.x = -0.3;
    const plunger = new THREE.Group(); plunger.add(cyl(b, 0.3, 0.3, 0.2, mat(b, "#2a2f4a"), 24), place(cyl(b, 0.07, 0.07, 1.4, mat(b, "#aeb8d6"), 10), [0.8, 0, 0]), place(cyl(b, 0.3, 0.3, 0.1, mat(b, "#d8dcea"), 24), [1.5, 0, 0]));
    plunger.children.forEach((c) => { c.rotation.z = Math.PI / 2; }); plunger.children[1].position.set(0.8, 0, 0); plunger.children[2].position.set(1.5, 0, 0);
    const collar = cyl(b, 0.18, 0.1, 0.35, mat(b, "#d8dcea"), 16); collar.rotation.z = Math.PI / 2; collar.position.x = -1.28;
    const needle = cyl(b, 0.025, 0.025, 1.0, mat(b, "#cfd6ea", { metalness: 0.8 }), 8); needle.rotation.z = Math.PI / 2; needle.position.x = -1.95;
    const fins = [place(cyl(b, 0.5, 0.5, 0.06, mat(b, "#d8dcea"), 24), [1.0, 0, 0])]; fins[0].rotation.z = Math.PI / 2; fins[0].scale.set(1, 1, 1);
    const drop = ball(b, 0.06, beam(b, TONE.green, 1.8), 8); drop.position.set(-2.5, 0, 0);
    sy.add(barrel, liq, plunger, collar, needle, ...fins, drop); sy.position.y = 1.3; sy.rotation.z = 0.2; g.add(sy); root.add(g); shadows(g);
    return done(root, b, (f) => { const k = 0.5 + 0.5 * Math.sin(f * 0.04); plunger.position.x = -0.5 * k; liq.scale.y = 1 - 0.3 * k; liq.position.x = -0.3 - 0.25 * k; drop.visible = k > 0.5; drop.position.set(-2.5 - 0.6 * (k - 0.5), -0.1 * (k - 0.5) * 3, 0); g.rotation.y = 0.3 * Math.sin(f * 0.01); });
  },
};

export const cromosoma: HeroDef = {
  kind: "primitive",
  when: "Cromosomas: cuántos tenemos, herencia, por qué somos hombre o mujer, síndrome de Down, cómo se copia el ADN al dividirse una célula, genes y mutaciones.",
  poses: ["x", "par"],
  center: [0, 1.4, 0], radius: 1.3,
  anchors: { hero: [0, 1.4, 0], top: [0, 2.6, 0], base: [0, 0.2, 0], centromero: [0, 1.4, 0], brazo: [0.5, 2.0, 0], gen: [0.3, 1.8, 0.2] },
  build: (_L, pose) => {
    const p = poseOf(cromosoma, pose, "cromosoma"), b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const one = (c: string, dx: number) => { const x = new THREE.Group(), m = glowMat(b, c, 0.4, { roughness: 0.45 }); for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const a = new THREE.Mesh(b.track(new THREE.CapsuleGeometry(0.17, 0.75, 8, 16)), m); a.position.set(sx * 0.2, sy * 0.45, 0); a.rotation.z = -sx * sy * 0.28; x.add(a); } const bands = [0.5, 0.75, -0.5, -0.75].map((y) => place(box(b, 0.5, 0.06, 0.34, glowMat(b, "#ffffff", 0.5, { transparent: true, opacity: 0.6 })), [0, y, 0])); x.add(...bands); x.add(place(ball(b, 0.2, glowMat(b, "#ffd9a0", 0.4), 14), [0, 0, 0])); x.position.x = dx; return x; };
    const parts = p === "par" ? [one("#7a8ae8", -0.7), one("#7a8ae8", 0.7)] : [one("#b36bff", 0)];
    parts.forEach((x) => { x.scale.setScalar(p === "par" ? 0.85 : 1.25); g.add(x); }); g.position.y = 1.4; root.add(g); shadows(g);
    return done(root, b, (f) => { g.rotation.y = f * 0.012; g.rotation.z = 0.1 * Math.sin(f * 0.03); });
  },
};

export const plaqueta_coagulo: HeroDef = {
  kind: "primitive",
  when: "Coágulos y heridas: cómo deja de sangrar un corte, plaquetas, costras, moretones, por qué sangramos, anticoagulantes, cicatrización.",
  poses: ["coagulo"],
  center: [0, 1.2, 0], radius: 1.4,
  anchors: { hero: [0, 1.2, 0.2], top: [0, 2.3, 0], base: [0, 0.1, 0], malla: [0, 1.3, 0.3], plaqueta: [0.5, 1.5, 0.3], herida: [0, 0.4, 0.3] },
  build: (_L, pose) => {
    poseOf(plaqueta_coagulo, pose, "plaqueta_coagulo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group();
    const wall = new THREE.Mesh(b.track(new THREE.PlaneGeometry(4, 0.3)), glowMat(b, "#c0586a", 0.3)); wall.position.set(0, 0.2, 0);
    const gap = new THREE.Mesh(b.track(new THREE.PlaneGeometry(1.1, 0.35)), mat(b, "#16182b")); gap.position.set(0, 0.2, 0.01);
    const prof = [[0, 0.04], [0.14, 0.07], [0.2, 0.05], [0.2, -0.05], [0.14, -0.07], [0, -0.04]].map(([r, y]) => new THREE.Vector2(r, y)), rbc = b.track(new THREE.LatheGeometry(prof, 16)), rm = glowMat(b, TONE.blood, 0.3);
    const reds = scatter(22, 6, (r) => [(r() - 0.5) * 1.5, 0.6 + r() * 1.2, (r() - 0.5) * 0.5] as P3).map((q, i) => ({ m: place(new THREE.Mesh(rbc, rm), q, 1.3), q, i }));
    const mesh = scatter(18, 2, () => [0, 0, 0] as P3).map((_, i) => rod(b, [(i % 6 - 2.5) * 0.28, 0.5 + Math.floor(i / 6) * 0.45, 0.05], [((i + 2) % 6 - 2.5) * 0.28, 0.7 + Math.floor(i / 6) * 0.45, 0.1], 0.015, glowMat(b, "#fff0c0", 0.6)));
    const pl = scatter(7, 3, (r) => [(r() - 0.5) * 1.2, 0.5 + r() * 1.3, 0.2] as P3).map((q) => place(blob(b, 0.1, 0.4, 2, glowMat(b, TONE.violet, 0.5), 2), q));
    g.add(wall, gap, ...mesh, ...reds.map((r) => r.m), ...pl); root.add(g); shadows(g);
    return done(root, b, (f) => { reds.forEach(({ m, q, i }) => { m.rotation.set(1.2 + 0.3 * Math.sin(f * 0.03 + i), f * 0.02 + i, 0); m.position.y = q[1] + 0.04 * Math.sin(f * 0.04 + i); }); pl.forEach((p, i) => p.scale.setScalar(1 + 0.2 * Math.sin(f * 0.08 + i))); g.rotation.y = 0.3 * Math.sin(f * 0.01); });
  },
};

export const protozoo: HeroDef = {
  kind: "primitive",
  when: "Organismos unicelulares: paramecio, amebas, algas, agua de charco al microscopio, vida microscópica, cilios, cómo se mueven los seres diminutos.",
  poses: ["nada"],
  center: [0, 1.3, 0], radius: 1.1,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.3, 0], base: [0, 0.2, 0], cilios: [1.0, 1.5, 0.3], nucleo: [0, 1.3, 0.3], boca: [-0.3, 1.0, 0.5] },
  build: (_L, pose) => {
    poseOf(protozoo, pose, "protozoo");
    const b = bin(), root = new THREE.Group(), g = new THREE.Group(), cell = new THREE.Group();
    const body = ball(b, 0.8, glowMat(b, "#7ad8a8", 0.25, { transparent: true, opacity: 0.55, roughness: 0.3 }), 32); body.scale.set(1.6, 0.8, 0.8);
    const nuc = place(ball(b, 0.26, glowMat(b, "#b36bff", 0.6), 16), [0.1, 0.05, 0.1]), vac = [-0.6, 0.55].map((x, i) => place(ball(b, 0.16 + 0.05 * i, glowMat(b, TONE.cyan, 0.5, { transparent: true, opacity: 0.7 }), 12), [x, -0.15 * i, 0.15]));
    const food = scatter(5, 4, (r) => [(r() - 0.5) * 1.6, (r() - 0.5) * 0.7, (r() - 0.5) * 0.4] as P3).map((q) => place(ball(b, 0.06, glowMat(b, TONE.gold, 0.6), 8), q));
    const cil = Array.from({ length: 34 }, (_, i) => { const a = (i / 34) * 6.28, x = Math.cos(a) * 1.28, y = Math.sin(a) * 0.65; const c = rod(b, [x, y, 0], [x * 1.16, y * 1.22, 0], 0.012, glowMat(b, "#b8f2d0", 0.5)); return c; });
    cell.add(body, nuc, ...vac, ...food, ...cil); cell.position.y = 1.3; g.add(cell); root.add(g); shadows(g);
    return done(root, b, (f) => { cell.position.x = 0.15 * Math.sin(f * 0.03); cell.rotation.z = 0.25 * Math.sin(f * 0.025) + 0.2; cell.rotation.y = 0.4 * Math.sin(f * 0.02); cil.forEach((c, i) => { c.rotation.z = 0.25 * Math.sin(f * 0.3 + i * 0.5); }); body.scale.set(1.6 + 0.04 * Math.sin(f * 0.1), 0.8 - 0.02 * Math.sin(f * 0.1), 0.8); });
  },
};
