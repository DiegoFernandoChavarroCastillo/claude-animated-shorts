// Protagonistas de clase "gltf": modelos CC0 en studio/public/models/. Cada modelo se declara en GLTF_MODELS con
// su archivo, altura deseada, recoloreo opcional por material y licencia, y su licencia se copia en LICENSES.md.
// Todavía no hay ninguno (sin descargas en esta fase, D33): el cargador queda listo para el primero que se añada.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { continueRender, delayRender, staticFile } from "remotion";
import type { HeroDef, V3 } from "./types";
import { recolor } from "../world/recolor";

type GltfModel = {
  file: string;                    // ruta dentro de public/ (p. ej. "models/kenney/car.glb")
  heightM: number;                 // altura a la que se escala (base en y = 0)
  center: V3; radius: number; anchors: Record<string, V3>;
  recolor?: Record<string, string>;
  license: string;                 // "CC0 1.0 - Kenney (kenney.nl)", etc.; debe aparecer en LICENSES.md
  when: string;
};

export const GLTF_MODELS: Record<string, GltfModel> = {};

const cache = new Map<string, Promise<THREE.Group>>();
const load = (file: string) => {
  let p = cache.get(file);
  if (!p) { p = new GLTFLoader().loadAsync(staticFile(file)).then((g) => g.scene); cache.set(file, p); }
  return p;
};

/** HeroDef para un modelo: el grupo se devuelve vacío y el modelo se añade al cargar (delayRender lo espera) */
export const gltfHero = (id: string, m: GltfModel): HeroDef => ({
  kind: "gltf", when: m.when, poses: ["default"], center: m.center, radius: m.radius, anchors: m.anchors,
  build: () => {
    const root = new THREE.Group(), handle = delayRender(`gltf ${id}`);
    load(m.file).then((scene) => {
      const obj = scene.clone(true);
      if (m.recolor) recolor(obj, m.recolor);
      const box = new THREE.Box3().setFromObject(obj), s = m.heightM / Math.max(1e-6, box.max.y - box.min.y);
      obj.scale.setScalar(s); obj.position.y = -box.min.y * s;
      obj.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      root.add(obj); continueRender(handle);
    }).catch((e) => { console.error(e); continueRender(handle); throw e; });
    return { root, update: () => {}, dispose: () => root.clear() };
  },
});

export const GLTF_HEROES: Record<string, HeroDef> = Object.fromEntries(Object.entries(GLTF_MODELS).map(([id, m]) => [id, gltfHero(id, m)]));
