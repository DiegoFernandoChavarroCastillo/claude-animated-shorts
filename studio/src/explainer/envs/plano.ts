// Entorno de los beats en ilustración 2D (objetos de clase "plano"): no construye nada en 3D, porque esos beats no montan
// el lienzo de three.js (Explainer.tsx dibuja la ilustración con FlatScene). Existe para que el beat tenga un entorno
// válido en el catálogo; la luz sí se usa: tiñe el resplandor y el grade 2D (flat/FlatScene.tsx).
import * as THREE from "three";
import type { EnvDef } from "./kit";

export const plano: EnvDef = {
  when: "Solo para objetos de clase plano (ilustración 2D a pantalla completa); con cualquier otro objeto, no.",
  lights: ["atardecer", "noche", "dorado", "tech"],
  build: () => ({ root: new THREE.Group(), fog: new THREE.Fog(0x000000, 1000, 2000), update: () => {}, dispose: () => {} }),
};
