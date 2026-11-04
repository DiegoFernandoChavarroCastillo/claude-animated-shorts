// Proyección mundo -> pantalla para overlays anclados (PulseRings, Callout3D, LightTrails). La cámara es una
// función pura del frame (camera/index.ts), así que la capa 2D proyecta sin hablar con el canvas de three.js.
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BASE } from "../style";
import { camAt, type Cam } from "../camera";
import { genericPose } from "../actions";
import { heroDef, type V3 } from "../heroes";
import type { Timeline } from "../timeline";
import type { Pt } from "./common";

const cam = new THREE.PerspectiveCamera();
const v = new THREE.Vector3();

/** punto del mundo -> px en el lienzo de overlays (1080 x 1920); null si queda detrás de la cámara */
export const projectPoint = (c: Cam, p: V3): Pt | null => {
  cam.fov = c.fov; cam.aspect = BASE.width / BASE.height; cam.near = 0.1; cam.far = 2000;
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  v.set(...p).project(cam);
  if (v.z > 1) return null;
  return [((v.x + 1) / 2) * BASE.width, ((1 - v.y) / 2) * BASE.height];
};

/** ancla con nombre del objeto protagonista del beat, proyectada en el frame actual */
export const anchorPoint = (tl: Timeline, beat: number, anchor: string, f: number): Pt | null => {
  const h = heroDef(tl.beats[beat].beat.scene.hero.asset);
  const a = h.anchors[anchor] ?? h.center, P = genericPose(tl, beat, f);
  // si una acción mueve el objeto (sube, cae, crece), el ancla se mueve con él
  const v3 = new THREE.Vector3(...a).multiplyScalar(P.scale).applyEuler(new THREE.Euler(...P.rot)).add(new THREE.Vector3(...P.pos));
  return projectPoint(camAt(tl, beat, f), [v3.x, v3.y, v3.z]);
};

export const useProjectedPoint = (tl: Timeline, beat: number, anchor = "hero") => anchorPoint(tl, beat, anchor, useCurrentFrame());
