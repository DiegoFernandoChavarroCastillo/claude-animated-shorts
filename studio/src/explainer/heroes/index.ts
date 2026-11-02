// Catálogo de objetos protagonistas (plan §8 F4). En F2 todos son PROVISIONALES: un cubo con bisel de color
// distinto por asset, para probar la cadena entera. La cámara y la capa 2D solo usan los datos (centro, radio,
// anclas), así que reemplazar `build` en F4 no cambia nada más.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE, type LightPreset } from "../style";

export type V3 = [number, number, number];
export type HeroInstance = { root: THREE.Object3D; update: (f: number) => void; dispose: () => void };
export type HeroDef = {
  center: V3;                  // centro del objeto (m); el suelo está en y = 0
  radius: number;              // radio de la esfera que lo envuelve (encuadre)
  anchors: Record<string, V3>; // puntos con nombre para overlays anclados (PulseRings, Callout3D)
  provisional: boolean;
  build: (light: LightPreset, pose?: string) => HeroInstance;
};

const cube = (color: string, glow: string): HeroDef["build"] => () => {
  const root = new THREE.Group();
  const geo = new RoundedBoxGeometry(1.6, 1.6, 1.6, 5, 0.2);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.05 });
  const box = new THREE.Mesh(geo, mat);
  box.position.y = 1.1; box.castShadow = true; box.receiveShadow = true;
  const ringGeo = new THREE.TorusGeometry(1.25, 0.025, 8, 96);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(glow).multiplyScalar(2.2), toneMapped: true });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03;
  root.add(box, ring);
  return {
    root,
    update: (f) => { box.rotation.y = 0.6 + f * 0.004; box.position.y = 1.1 + 0.04 * Math.sin(f * 0.05); },
    dispose: () => { geo.dispose(); mat.dispose(); ringGeo.dispose(); ringMat.dispose(); },
  };
};

const CUBE = { center: [0, 1.1, 0] as V3, radius: 1.2, anchors: { hero: [0, 1.1, 0] as V3, top: [0, 1.95, 0] as V3, base: [0, 0.05, 0] as V3 } };

export const HEROES: Record<string, HeroDef> = {
  cubo: { ...CUBE, provisional: true, build: cube(PALETTE.light.cream, PALETTE.ui.cyan) },
  vaso_agua_hielo: { ...CUBE, provisional: true, build: cube("#9fd8ec", PALETTE.ui.cyan) },
  moleculas_agua: { ...CUBE, provisional: true, build: cube(PALETTE.ui.cyan, PALETTE.ui.green) },
  lago_corte: { ...CUBE, provisional: true, build: cube("#5d86b8", PALETTE.warm.gold) },
};

export const heroDef = (asset: string) => {
  const h = HEROES[asset];
  if (!h) throw new Error(`hero.asset desconocido: ${asset}`);
  return h;
};
