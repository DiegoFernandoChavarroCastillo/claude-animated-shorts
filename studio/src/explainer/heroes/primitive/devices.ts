// Teléfono y reloj genéricos (R1, R3): cuerpo de metal oscuro con bisel, pantalla que brilla (bloom suave) con la
// interfaz de la pose. Flotan y giran un poco para que el plano nunca esté quieto.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE } from "../../style";
import { type HeroDef, bin, screenTex, shadows, poseOf, roundRect, shapeGeo } from "../types";
import { phoneScreen, watchScreen } from "./screens";

const bodyMat = (track: ReturnType<typeof bin>["track"]) =>
  track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.bg.plum).multiplyScalar(1.3), metalness: 0.65, roughness: 0.32 }));

/** pantalla emisiva: algo por encima de 1 para que el bloom la toque solo en los blancos */
const screenMat = (track: ReturnType<typeof bin>["track"], map: THREE.Texture) =>
  track(new THREE.MeshBasicMaterial({ map, color: new THREE.Color(1.25, 1.25, 1.25) }));

export const telefono: HeroDef = {
  kind: "primitive",
  when: "Teléfono genérico: cobertura, notificaciones, batería, ajustes, pantalla bloqueada.",
  poses: ["senal", "sin_senal", "bloqueo", "metricas", "control"],
  center: [0, 1.25, 0], radius: 0.78,
  anchors: { hero: [0, 1.25, 0.06], top: [0, 2.25, 0], base: [0, 0.2, 0], screen: [0, 1.35, 0.07] },
  build: (_L, pose) => {
    const p = poseOf(telefono, pose, "telefono"), b = bin(), root = new THREE.Group(), dev = new THREE.Group();
    const W = 1.0, H = 2.06, D = 0.1;
    const body = new THREE.Mesh(b.track(new RoundedBoxGeometry(W, H, D, 6, 0.09)), bodyMat(b.track));
    const tex = screenTex(b.track, 540, 1112, (g) => phoneScreen(p)(g, 540, 1112));
    const scr = new THREE.Mesh(b.track(shapeGeo(roundRect(W - 0.07, H - 0.07, 0.11))), screenMat(b.track, tex));
    scr.position.z = D / 2 + 0.002;
    // isla de cámara arriba (pastilla negra) y botones laterales
    const pill = new THREE.Mesh(b.track(new RoundedBoxGeometry(0.26, 0.07, 0.01, 3, 0.03)), b.track(new THREE.MeshBasicMaterial({ color: PALETTE.bg.night0 })));
    pill.position.set(0, H / 2 - 0.1, D / 2 + 0.006);
    const btn = new THREE.Mesh(b.track(new RoundedBoxGeometry(0.03, 0.22, 0.04, 2, 0.012)), bodyMat(b.track));
    btn.position.set(W / 2 + 0.008, 0.45, 0);
    dev.add(body, scr, pill, btn);
    shadows(body);
    dev.position.y = 1.25; root.add(dev);
    return {
      root,
      update: (f) => { dev.rotation.set(-0.08 + 0.025 * Math.sin(f * 0.03), -0.22 + 0.06 * Math.sin(f * 0.017), 0.03 * Math.sin(f * 0.021)); dev.position.y = 1.25 + 0.03 * Math.sin(f * 0.045); },
      dispose: b.dispose,
    };
  },
};

export const reloj: HeroDef = {
  kind: "primitive",
  when: "Reloj inteligente: hora, sueño, pulso, sensores en la muñeca.",
  poses: ["hora", "sueno", "pulso"],
  center: [0, 1.1, 0], radius: 0.82,
  anchors: { hero: [0, 1.1, 0.2], top: [0, 1.8, 0], base: [0, 0.15, 0], screen: [0, 1.1, 0.2], sensor: [0, 1.1, -0.2] },
  build: (_L, pose) => {
    const p = poseOf(reloj, pose, "reloj"), b = bin(), root = new THREE.Group(), dev = new THREE.Group();
    const W = 1.0, H = 1.18, D = 0.32;
    const body = new THREE.Mesh(b.track(new RoundedBoxGeometry(W, H, D, 6, 0.2)), bodyMat(b.track));
    const tex = screenTex(b.track, 600, 700, (g) => watchScreen(p)(g, 600, 700));
    const scr = new THREE.Mesh(b.track(shapeGeo(roundRect(W - 0.13, H - 0.13, 0.17))), screenMat(b.track, tex));
    scr.position.z = D / 2 + 0.003;
    // corona y botón lateral
    const crown = new THREE.Mesh(b.track(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 20)), bodyMat(b.track));
    crown.rotation.z = Math.PI / 2; crown.position.set(W / 2 + 0.03, 0.2, 0);
    // correa de silicona: dos tramos que se curvan hacia atrás, con agujeros pintados
    const strapMat = b.track(new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.bg.night1).multiplyScalar(1.2), roughness: 0.7 }));
    const curve = (s: number) => new THREE.CatmullRomCurve3([new THREE.Vector3(0, s * H * 0.42, -0.02), new THREE.Vector3(0, s * (H / 2 + 0.22), -0.1), new THREE.Vector3(0, s * (H / 2 + 0.42), -0.38), new THREE.Vector3(0, s * (H / 2 + 0.5), -0.8)]);
    for (const s of [1, -1]) {
      const geo = b.track(new THREE.TubeGeometry(curve(s), 24, 0.1, 8));
      const strap = new THREE.Mesh(geo, strapMat); strap.scale.set(4, 1, 1); dev.add(strap); // sección 0,8 de ancho
    }
    dev.add(body, scr, crown);
    shadows(dev);
    dev.position.y = 1.1; root.add(dev);
    return {
      root,
      update: (f) => { dev.rotation.set(-0.32 + 0.03 * Math.sin(f * 0.025), -0.18 + 0.07 * Math.sin(f * 0.015), 0.02 * Math.sin(f * 0.02)); dev.position.y = 1.1 + 0.025 * Math.sin(f * 0.04); },
      dispose: b.dispose,
    };
  },
};
