// Tipos y utilidades comunes de los objetos protagonistas (F4). Tres clases (plan §8 F4): primitive (construido
// en código), gltf (modelo CC0 con licencia en LICENSES.md) y card (animales y personas pintados como tarjetas).
import * as THREE from "three";
import type { LightPreset } from "../style";

export type V3 = [number, number, number];
export type HeroKind = "primitive" | "gltf" | "card";
export type HeroInstance = { root: THREE.Object3D; update: (f: number, cam: THREE.Camera) => void; dispose: () => void };
export type HeroDef = {
  kind: HeroKind;
  when: string;                // una línea para el catálogo: cuándo usarlo
  poses: string[];             // la primera es la de por defecto
  center: V3;                  // centro de encuadre (m); el suelo está en y = 0
  radius: number;              // radio de ENCUADRE: la cámara se aleja para que 2 x radius ocupe ~55 % del ancho
  anchors: Record<string, V3>; // puntos con nombre para overlays anclados (PulseRings, Callout3D)
  build: (light: LightPreset, pose?: string) => HeroInstance;
};

/** registro de lo que hay que liberar al desmontar el protagonista */
export const bin = () => {
  const items: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => { items.push(x); return x; };
  return { track, dispose: () => items.forEach((d) => d.dispose()) };
};

/** textura de canvas para pantallas y etiquetas (sRGB) */
export const screenTex = (track: <T extends { dispose: () => void }>(x: T) => T, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!);
  const t = track(new THREE.CanvasTexture(cv)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

/** todos los mesh del grupo proyectan y reciben sombra */
export const shadows = (o: THREE.Object3D) => { o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

/** pose desconocida -> error claro (el validador de story.json la comprueba antes, en el catálogo) */
export const poseOf = (def: { poses: string[] }, pose: string | undefined, id: string) => {
  const p = pose ?? def.poses[0];
  if (!def.poses.includes(p)) throw new Error(`pose "${p}" no existe para ${id} (poses: ${def.poses.join(", ")})`);
  return p;
};

/** rueda de bisel redondeado: rectángulo con esquinas de radio r, como Shape (pantallas, cuerpos de dispositivo) */
export const roundRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

/** ShapeGeometry con uv 0..1 sobre su caja (para pegar una textura de pantalla) */
export const shapeGeo = (s: THREE.Shape, segs = 12) => {
  const g = new THREE.ShapeGeometry(s, segs); g.computeBoundingBox();
  const b = g.boundingBox!, uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - b.min.x) / (b.max.x - b.min.x), (p.getY(i) - b.min.y) / (b.max.y - b.min.y));
  return g;
};
