// Utilidades conservadas de templates/bridge/build.ts (plan §4): culling de línea de visión y recoloreo por material.
// Culling: para cada beat se trazan segmentos desde la cámara (muestreada en todo el beat, transiciones incluidas)
// hasta el protagonista; todo objeto marcado con blocker() cuya caja corte un segmento, o contenga la cámara, se
// oculta. Así ningún plano queda dentro de una pared ni con un edificio delante del objeto.
import * as THREE from "three";
import type { Timeline } from "../timeline";
import { camAt } from "../camera";
import { heroDef } from "../heroes";

export type Sight = { o: THREE.Vector3; d: THREE.Vector3; len: number };

/** posiciones de cámara del beat i (cada `step` frames, más la ventana de transición) */
export const camPositions = (tl: Timeline, i: number, step = 3) => {
  const bt = tl.beats[i], a = bt.a - (bt.tIn?.half ?? 0), b = bt.b + (bt.tOut?.half ?? 0), out: THREE.Vector3[] = [];
  for (let f = a; f <= b; f += step) out.push(new THREE.Vector3(...camAt(tl, i, f).pos));
  return out;
};

/** segmentos cámara -> protagonista: al centro y a cuatro puntos de su contorno (a 0,8 del radio) */
export const sightLines = (tl: Timeline, i: number, step = 3): Sight[] => {
  const h = heroDef(tl.beats[i].beat.scene.hero.asset), c = new THREE.Vector3(...h.center), out: Sight[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (const o of camPositions(tl, i, step)) {
    const fwd = c.clone().sub(o).normalize(), right = fwd.clone().cross(up).normalize(), u = right.clone().cross(fwd);
    for (const [x, y] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const t = c.clone().addScaledVector(right, x * h.radius * 0.8).addScaledVector(u, y * h.radius * 0.8), d = t.clone().sub(o);
      const len = d.length(); out.push({ o, d: d.divideScalar(len), len });
    }
  }
  return out;
};

const boxOf = (o: THREE.Object3D, margin: number) => new THREE.Box3().setFromObject(o).expandByScalar(margin);

/** oculta los bloqueantes que tapan alguna línea de visión o contienen la cámara; devuelve cuántos ocultó */
export const cullSight = (root: THREE.Object3D, sight: Sight[], cams: THREE.Vector3[], margin = 0.25) => {
  root.updateMatrixWorld(true);
  const ray = new THREE.Ray(), hit = new THREE.Vector3();
  let hidden = 0;
  root.traverse((o) => {
    if (!o.userData.cull || !o.visible) return;
    const box = boxOf(o, margin);
    const blocks = cams.some((c) => box.containsPoint(c)) || sight.some((s) => {
      ray.set(s.o, s.d);
      return ray.intersectBox(box, hit) !== null && hit.distanceTo(s.o) <= s.len;
    });
    if (blocks) { o.visible = false; hidden++; }
  });
  return hidden;
};

/** cámaras que quedan dentro de un objeto visible (bloqueantes y sólidos marcados con userData.solid) */
export const camsInside = (root: THREE.Object3D, cams: THREE.Vector3[], margin = 0.1) => {
  root.updateMatrixWorld(true);
  let n = 0;
  const visible = (o: THREE.Object3D): boolean => o.visible && (!o.parent || visible(o.parent));
  root.traverse((o) => {
    if (!(o.userData.cull || o.userData.solid) || !visible(o)) return;
    const box = boxOf(o, margin);
    n += cams.filter((c) => box.containsPoint(c)).length;
  });
  return n;
};

export { recolor } from "../world/recolor";
