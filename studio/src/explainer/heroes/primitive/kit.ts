// Piezas comunes de los protagonistas de ciencia (F11): materiales de la paleta, bolas, blobs orgánicos con ruido
// determinista, tubos, cáscaras fantasma y degradados pintados. Todo con `bin` para liberar al desmontar; nada de
// Math.random (los frames no deben parpadear entre procesos de render).
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PALETTE } from "../../style";
import { type V3, bin } from "../types";

export type Bin = ReturnType<typeof bin>;
export const col = (a: THREE.ColorRepresentation, b?: THREE.ColorRepresentation, t = 0.5) => (b === undefined ? new THREE.Color(a) : new THREE.Color(a).lerp(new THREE.Color(b), t));

/** colores de tejido y de ciencia derivados de la paleta (un solo sitio, para que todos los packs combinen) */
export const TONE = {
  flesh: col(PALETTE.warm.sunset, PALETTE.warm.rose, 0.45).getStyle(),
  fleshDark: col(PALETTE.warm.rose, PALETTE.bg.plum, 0.45).getStyle(),
  blood: "#D9444E",
  bone: PALETTE.light.cream,
  glowRed: PALETTE.ui.red, cyan: PALETTE.ui.cyan, green: PALETTE.ui.green, gold: PALETTE.warm.gold,
  ink: PALETTE.bg.night1, navy: PALETTE.bg.navy, violet: PALETTE.mid.violet, lavender: PALETTE.mid.lavender,
};

export const mat = (b: Bin, c: THREE.ColorRepresentation, o: THREE.MeshStandardMaterialParameters = {}) =>
  b.track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0, ...o }));
/** material que brilla un poco por sí mismo (k = fracción del color como emisivo) */
export const glowMat = (b: Bin, c: THREE.ColorRepresentation, k = 0.35, o: THREE.MeshStandardMaterialParameters = {}) =>
  mat(b, c, { emissive: col(c).multiplyScalar(k), ...o });
/** cáscara translúcida (cristal, membrana, aire) */
export const ghostMat = (b: Bin, c: THREE.ColorRepresentation, opacity = 0.3, o: THREE.MeshStandardMaterialParameters = {}) =>
  mat(b, c, { transparent: true, opacity, roughness: 0.15, depthWrite: false, side: THREE.DoubleSide, ...o });
/** brillo puro que el bloom recoge (color > 1) */
export const beam = (b: Bin, c: THREE.ColorRepresentation, k = 1.6, o: THREE.MeshBasicMaterialParameters = {}) =>
  b.track(new THREE.MeshBasicMaterial({ color: col(c).multiplyScalar(k), ...o }));

export const ball = (b: Bin, r: number, m: THREE.Material, seg = 32) => new THREE.Mesh(b.track(new THREE.SphereGeometry(r, seg, Math.max(8, Math.round(seg * 0.75)))), m);
export const cyl = (b: Bin, rt: number, rb: number, h: number, m: THREE.Material, seg = 32) => new THREE.Mesh(b.track(new THREE.CylinderGeometry(rt, rb, h, seg)), m);
export const box = (b: Bin, w: number, h: number, d: number, m: THREE.Material) => new THREE.Mesh(b.track(new THREE.BoxGeometry(w, h, d)), m);
export const place = <T extends THREE.Object3D>(o: T, [x, y, z]: V3, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(s); return o; };

/** esfera irregular (célula, órgano, nube): ruido de senos con fase por semilla, normales suaves */
export const blob = (b: Bin, r: number, amp: number, seed: number, m: THREE.Material, detail = 4, freq = 1) => {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(r, detail);
  g.deleteAttribute("normal"); g.deleteAttribute("uv"); g = mergeVertices(g);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = (Math.sin(freq * v.x * 3.1 / r + seed) + Math.sin(freq * v.y * 2.7 / r + seed * 1.7) + Math.sin(freq * v.z * 3.7 / r + seed * 2.3)) / 3;
    v.multiplyScalar(1 + amp * n); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(b.track(g), m);
};

export const tube = (b: Bin, pts: V3[], r: number, m: THREE.Material, seg = 64) =>
  new THREE.Mesh(b.track(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), seg, r, 10, false)), m);

/** malla que apunta de `a` a `b` (varilla fina: enlaces, rayos, patas) */
export const rod = (bn: Bin, a: V3, c: V3, r: number, m: THREE.Material) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...c), d = A.distanceTo(B);
  const o = new THREE.Mesh(bn.track(new THREE.CylinderGeometry(r, r, 1, 8)), m);
  o.position.copy(A).add(B).multiplyScalar(0.5); o.scale.y = d;
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return o;
};

/** partículas fijas con semilla en una caja/esfera (burbujas, polvo, virus lejanos) */
export const scatter = (n: number, seed: number, f: (r: () => number, i: number) => V3) => {
  let s = Math.floor(seed * 9301 + 49297) % 233280 || 1;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  return Array.from({ length: n }, (_, i) => f(r, i));
};

/** textura de degradado radial (manchas de inflamación, halos, estrellas) */
export const radialTex = (b: Bin, inner: string, outer = "rgba(0,0,0,0)", size = 128) => {
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const g = cv.getContext("2d")!, gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = b.track(new THREE.CanvasTexture(cv)); t.colorSpace = THREE.SRGBColorSpace; return t;
};
/** plano con halo aditivo (brillo suave sin luz real) */
export const halo = (b: Bin, c: string, size: number, opacity = 0.8) => {
  const m = new THREE.Mesh(b.track(new THREE.PlaneGeometry(size, size)), b.track(new THREE.MeshBasicMaterial({ map: radialTex(b, c), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
  return m;
};

/** virus genérico: cuerpo esférico con púas de bolita (no corresponde a ningún virus real) */
export const virusBody = (b: Bin, r = 0.2, body: string = TONE.green, spike: string = TONE.gold) => {
  const g = new THREE.Group(), bm = glowMat(b, body, 0.3), sm = glowMat(b, spike, 0.3);
  g.add(ball(b, r, bm, 20));
  const dirs = scatter(16, 3, (rn) => { const u = rn() * 2 - 1, a = rn() * Math.PI * 2, s = Math.sqrt(1 - u * u); return [s * Math.cos(a), u, s * Math.sin(a)]; });
  dirs.forEach((d) => {
    const stem = rod(b, [d[0] * r, d[1] * r, d[2] * r], [d[0] * r * 1.5, d[1] * r * 1.5, d[2] * r * 1.5], r * 0.07, sm), tip = ball(b, r * 0.17, sm, 10);
    tip.position.set(d[0] * r * 1.55, d[1] * r * 1.55, d[2] * r * 1.55); g.add(stem, tip);
  });
  return g;
};
