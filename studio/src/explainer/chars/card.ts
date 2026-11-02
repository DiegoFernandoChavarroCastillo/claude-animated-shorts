// Tarjetas iluminadas por la escena (plan §4: cast.ts / cardshade.ts "reutilizar"). Versión simplificada para el
// explainer: el dibujo va en un canvas y se pega en un plano que gira sobre su eje vertical hacia la cámara
// (billboard en y), con material estándar (mismo modelo de luz que el resto, D19) y alphaTest para el recorte.
// Una mancha de contacto en el suelo evita que flote. El degradado de forma ya va pintado en el dibujo.
import * as THREE from "three";
import { Pen } from "./pen";
import { PALETTE } from "../style";
import { bin } from "../heroes/types";

export type CardSpec = { w: number; h: number; ground: number; heightM: number; draw: (p: Pen) => void; px?: number };

export const buildCard = (spec: CardSpec) => {
  const b = bin(), k = spec.px ?? 1.6;
  const cv = document.createElement("canvas"); cv.width = Math.round(spec.w * k); cv.height = Math.round(spec.h * k);
  const g = cv.getContext("2d")!; g.setTransform(k, 0, 0, k, 0, 0);
  spec.draw(new Pen(g));
  const tex = b.track(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mPerU = spec.heightM / spec.ground, W = spec.w * mPerU, H = spec.h * mPerU;
  const geo = b.track(new THREE.PlaneGeometry(W, H)); geo.translate(0, H / 2 - (spec.h - spec.ground) * mPerU, 0);
  const mat = b.track(new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1, metalness: 0 }));
  const card = new THREE.Mesh(geo, mat);
  card.castShadow = true; card.receiveShadow = false;
  card.customDepthMaterial = b.track(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 }));
  // mancha de contacto: degradado radial oscuro, sin escribir profundidad
  const blobTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d")!, gr = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    gr.addColorStop(0, "rgba(0,0,0,0.55)"); gr.addColorStop(0.6, "rgba(0,0,0,0.2)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    return b.track(new THREE.CanvasTexture(c));
  })();
  const blob = new THREE.Mesh(b.track(new THREE.PlaneGeometry(W * 0.75, W * 0.28)),
    b.track(new THREE.MeshBasicMaterial({ map: blobTex, color: PALETTE.bg.night0, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.02;
  const root = new THREE.Group(); root.add(blob, card);
  return {
    root, card, W, H,
    /** gira la tarjeta hacia la cámara (solo en y) y le da una respiración leve */
    face: (f: number, cam: THREE.Camera) => {
      const wp = new THREE.Vector3(); root.getWorldPosition(wp);
      card.rotation.y = Math.atan2(cam.position.x - wp.x, cam.position.z - wp.z);
      card.scale.set(1, 1 + 0.008 * Math.sin(f * 0.11), 1);
    },
    dispose: b.dispose,
  };
};
