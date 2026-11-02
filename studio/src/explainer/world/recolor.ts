// Recoloreo por material conservado de templates/bridge/build.ts (toLambert/RECOLOR): convierte los materiales de un
// modelo glTF a MeshStandardMaterial (mismo modelo de luz que el resto, D19) y cambia el color por nombre de material.
import * as THREE from "three";

/** recoloreo por nombre de material (modelos glTF): { "Wood": "#8a5a3c" } -> MeshStandardMaterial con ese color */
export const recolor = (root: THREE.Object3D, map: Record<string, string>) => {
  const done = new Map<string, THREE.Material>();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const swap = (mat: THREE.Material) => {
      let out = done.get(mat.uuid);
      if (!out) {
        const s = mat as THREE.MeshStandardMaterial, col = map[mat.name];
        out = new THREE.MeshStandardMaterial({ color: col ? new THREE.Color(col) : s.color?.clone() ?? new THREE.Color("#ffffff"),
          map: s.map ?? null, roughness: s.roughness ?? 0.8, metalness: s.metalness ?? 0, side: s.side, transparent: s.transparent, opacity: s.opacity });
        out.name = mat.name; done.set(mat.uuid, out);
      }
      return out;
    };
    m.material = Array.isArray(m.material) ? m.material.map(swap) : swap(m.material);
    m.castShadow = true; m.receiveShadow = true;
  });
  return root;
};
