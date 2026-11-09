// Diorama 2.5D (objetos de clase "lamina"): varias láminas pintadas con Canvas2D colocadas a distintas profundidades dentro del
// mundo 3D. La cámara 3D da parallax real entre ellas y reciben la luz, la niebla, el desenfoque, el bloom y el grade del
// explainer, así que se ven del mismo video que los objetos 3D. Sirve para lo que el 3D hace mal: personas, escenas históricas,
// grupos, lugares con mucho detalle. Cada lámina se ancla por el centro de su borde inferior en `pos` y gira hacia la cámara
// en una fracción `face` (0 = fija mirando a +z, 1 = siempre de frente), para que las órbitas no la pongan de canto.
import * as THREE from "three";
import { Pen } from "../chars/pen";
import { PALETTE } from "../style";
import { bin, type V3 } from "./types";

export type LaminaSpec = {
  name: string;
  /** lienzo de diseño (px) y alto en metros del lienzo entero */
  w: number; h: number; heightM: number;
  draw: (g: CanvasRenderingContext2D, pen: Pen) => void;
  pos: V3;
  /** 0..1: cuánto gira hacia la cámara (0,35 por defecto) */
  face?: number;
  /** luz propia (ventanas, pantallas, fuego): material sin sombreado, aditivo si `glow` */
  glow?: boolean; unlit?: boolean;
  /** mancha de contacto en el suelo (ancho en metros); 0 = sin mancha */
  contact?: number;
  /** resolución del lienzo respecto al diseño (1,5 por defecto) */
  px?: number;
};

export type Laminas = {
  root: THREE.Group;
  /** grupo de cada lámina por nombre (las acciones la mueven, la giran o le cambian la opacidad) */
  parts: Record<string, THREE.Group>;
  mats: Record<string, THREE.Material & { opacity: number }>;
  face: (cam: THREE.Camera) => void;
  dispose: () => void;
};

export const buildLaminas = (specs: LaminaSpec[]): Laminas => {
  const b = bin(), root = new THREE.Group(), parts: Laminas["parts"] = {}, mats: Laminas["mats"] = {};
  const faces: { g: THREE.Group; k: number }[] = [];
  for (const s of specs) {
    const k = s.px ?? 1.5, cv = document.createElement("canvas");
    cv.width = Math.round(s.w * k); cv.height = Math.round(s.h * k);
    const g = cv.getContext("2d")!; g.setTransform(k, 0, 0, k, 0, 0);
    s.draw(g, new Pen(g));
    const tex = b.track(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const H = s.heightM, W = (s.w / s.h) * H;
    const geo = b.track(new THREE.PlaneGeometry(W, H)); geo.translate(0, H / 2, 0);
    const mat = s.unlit || s.glow
      ? b.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: !s.glow, side: THREE.DoubleSide, blending: s.glow ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: !s.glow }))
      : b.track(new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1, metalness: 0, transparent: false }));
    const mesh = new THREE.Mesh(geo, mat);
    if (!s.glow) {
      mesh.castShadow = true;
      mesh.customDepthMaterial = b.track(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 }));
    }
    const grp = new THREE.Group(); grp.add(mesh); grp.position.set(...s.pos);
    if (s.contact) {
      const c = document.createElement("canvas"); c.width = c.height = 128;
      const x = c.getContext("2d")!, gr = x.createRadialGradient(64, 64, 4, 64, 64, 64);
      gr.addColorStop(0, "rgba(0,0,0,0.55)"); gr.addColorStop(0.6, "rgba(0,0,0,0.2)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
      const blob = new THREE.Mesh(b.track(new THREE.PlaneGeometry(s.contact, s.contact * 0.35)),
        b.track(new THREE.MeshBasicMaterial({ map: b.track(new THREE.CanvasTexture(c)), color: PALETTE.bg.night0, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })));
      blob.rotation.x = -Math.PI / 2; blob.position.set(s.pos[0], 0.02, s.pos[2]); root.add(blob);
    }
    root.add(grp); parts[s.name] = grp; mats[s.name] = mat as THREE.Material & { opacity: number };
    faces.push({ g: grp, k: s.face ?? 0.35 });
  }
  const wp = new THREE.Vector3();
  return {
    root, parts, mats, dispose: b.dispose,
    face: (cam) => { for (const { g, k } of faces) { g.getWorldPosition(wp); g.rotation.y = k * Math.atan2(cam.position.x - wp.x, cam.position.z - wp.z); } },
  };
};

/** pinta un path SVG (string `d`) en el lienzo (`fill` "none" = solo trazo): así las láminas se dibujan con la misma sintaxis que los planos 2D */
export const fillPath = (g: CanvasRenderingContext2D, d: string, fill: string | CanvasGradient, stroke?: string, lw = 2) => {
  const p = new Path2D(d);
  if (fill !== "none") { g.fillStyle = fill; g.fill(p); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(p); }
};

/** degradado vertical de y0 a y1 */
export const vgrad = (g: CanvasRenderingContext2D, y0: number, y1: number, a: string, b: string) => {
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr;
};

/** persona sentada de perfil mirando a la derecha (o a la izquierda con `flip`): cabeza, pelo, traje, camisa, corbata, brazo
 *  sobre la mesa. `x` = cadera, `y` = asiento; `k` = escala (1 ≈ 300 px de alto). Diseño para láminas de grupo y escenas históricas. */
export const drawSeated = (g: CanvasRenderingContext2D, x: number, y: number, k: number, o: { suit: string; skin: string; hair: string; shirt?: string; tie?: string; flip?: boolean; bald?: number; arm?: boolean }) => {
  g.save(); g.translate(x, y); g.scale(o.flip ? -k : k, k);
  const shade = "rgba(10,9,26,0.35)";
  // piernas (bajo la mesa casi no se ven) y torso inclinado hacia delante
  fillPath(g, "M-30 0 C-28 40 -20 70 -6 70 L60 70 C70 70 70 50 60 44 L10 30 Z", o.suit);
  fillPath(g, "M-40 4 C-46 -60 -40 -120 -10 -150 C10 -168 40 -164 52 -140 C62 -112 58 -60 50 0 Z", o.suit);
  fillPath(g, "M20 -146 L34 -150 L40 -100 L26 -96 Z", o.shirt ?? "#E9E3C8");
  if (o.tie) fillPath(g, "M30 -144 L36 -142 L38 -104 L32 -98 L28 -104 Z", o.tie);
  fillPath(g, "M-40 4 C-46 -60 -40 -120 -10 -150 L-6 -120 C-20 -90 -24 -40 -18 4 Z", shade);
  // cuello y cabeza de perfil
  fillPath(g, "M14 -150 L30 -150 L32 -172 L14 -174 Z", o.skin);
  fillPath(g, "M2 -200 C2 -232 24 -246 46 -238 C64 -230 68 -206 64 -192 L70 -184 L64 -180 C66 -172 62 -166 54 -166 L40 -164 C30 -164 22 -170 14 -174 C6 -180 2 -190 2 -200 Z", o.skin);
  fillPath(g, "M44 -200 C46 -196 48 -194 52 -194", "none", shade, 2);
  // pelo (con entradas si `bald`)
  const b = o.bald ?? 0;
  fillPath(g, `M0 -200 C-2 -236 22 -252 ${46 - b * 18} -244 C${34 - b * 10} -236 ${20 - b * 4} -230 16 -214 C14 -204 12 -196 8 -186 C2 -190 0 -196 0 -200 Z`, o.hair);
  g.beginPath(); g.arc(20, -200, 6, 0, Math.PI * 2); g.fillStyle = o.skin; g.fill(); // oreja
  // brazo sobre la mesa
  if (o.arm !== false) {
    fillPath(g, "M10 -132 C30 -110 50 -86 84 -78 L96 -64 C60 -60 24 -78 0 -104 Z", o.suit);
    fillPath(g, "M86 -80 C96 -84 106 -80 108 -72 C104 -64 96 -62 90 -64 Z", o.skin);
  }
  g.restore();
};
