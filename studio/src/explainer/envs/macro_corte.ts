// Corte transversal macro (R3: los sensores sobre la piel): un bloque de material cortado de frente, con capas de
// colores (piel, dermis, vasos con glóbulos, grasa). El protagonista se apoya en la superficie (y = 0) y la cámara,
// baja, ve la cara del corte bajo él. Los colores de capa se cambian con `LAYERS` para suelo o materiales.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, canvasTex, std, fogOf, speckle, hex, lightDots, type Ctx } from "./kit";

type Layer = { name: string; h: number; col: string; cells?: boolean };
const LAYERS: Layer[] = [
  { name: "epidermis", h: 0.16, col: "#e2a48c" },
  { name: "dermis", h: 0.5, col: "#d9877a" },
  { name: "vasos", h: 0.42, col: "#b8323f", cells: true },
  { name: "grasa", h: 0.7, col: "#e6b98a" },
  { name: "profundo", h: 2.2, col: "#7a3a4a" },
];

/** cara del corte: capas en franjas con bordes ondulados, grano y glóbulos rojos en la capa de vasos */
const faceTex = (ctx: Ctx, total: number) => canvasTex(ctx, 1024, 1024, (g) => {
  const { r } = ctx, H = 1024, px = H / total;
  let y = 0;
  LAYERS.forEach((l, i) => {
    const y1 = y + l.h * px;
    g.fillStyle = l.col; g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y + (i ? Math.sin(x * 0.02 + i) * 6 : 0));
    g.lineTo(1024, H); g.lineTo(0, H); g.closePath(); g.fill();
    const gr = g.createLinearGradient(0, y, 0, y1); gr.addColorStop(0, "rgba(255,255,255,0.10)"); gr.addColorStop(1, "rgba(0,0,0,0.18)");
    g.fillStyle = gr; g.fillRect(0, y, 1024, y1 - y);
    if (l.cells) for (let k = 0; k < 160; k++) {
      const cx = r() * 1024, cy = y + 8 + r() * (y1 - y - 16), R = 7 + r() * 6;
      g.fillStyle = "#e0505a"; g.beginPath(); g.ellipse(cx, cy, R, R * 0.7, r() * 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(90,10,20,0.45)"; g.beginPath(); g.ellipse(cx, cy, R * 0.45, R * 0.3, 0, 0, Math.PI * 2); g.fill();
    }
    speckle(g, r, 1024, y1 - y, "#000000", 400, 1, 3, 0.04, 0.12);
    y = y1;
  });
  speckle(g, r, 1024, 1024, PALETTE.light.cream, 1200, 1, 2.5, 0.03, 0.1);
});

export const macro_corte: EnvDef = {
  when: "Dentro de algo: piel, suelo, materiales, capas; sensores que miran a través; 'cómo es por dentro'.",
  lights: ["atardecer", "dorado", "noche"],
  view: { el: -3, dof: 8 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    sky(ctx, { clouds: 0, stars: 0.3, colors: { top: PALETTE.bg.night0, mid: PALETTE.bg.night1, horizon: PALETTE.bg.indigo } });
    // la cara del corte queda 0,9 m delante del centro del protagonista: con la cámara casi a ras (el 1°) la mitad
    // baja del cuadro es el corte, con todas sus capas
    const total = LAYERS.reduce((a, l) => a + l.h, 0), front = 0.9;
    // superficie (piel con poros) y cara del corte; el bloque mide 60 x total x 60 m
    const top = canvasTex(ctx, 1024, 1024, (g) => {
      g.fillStyle = LAYERS[0].col; g.fillRect(0, 0, 1024, 1024);
      speckle(g, r, 1024, 1024, hex(LAYERS[0].col, 0.75), 2600, 1.5, 4, 0.15, 0.4);
      speckle(g, r, 1024, 1024, PALETTE.light.cream, 1200, 1, 3, 0.08, 0.25);
      g.strokeStyle = "rgba(120,60,50,0.18)"; g.lineWidth = 2; for (let k = 0; k < 60; k++) { g.beginPath(); const x = r() * 1024, y = r() * 1024; g.moveTo(x, y); g.bezierCurveTo(x + 60, y + 20 * r(), x + 120, y - 20, x + 200, y + 10 * r()); g.stroke(); }
    });
    top.wrapS = top.wrapT = THREE.RepeatWrapping; top.repeat.set(8, 8);
    const surf = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(60, 60)), std(ctx, { map: top, roughness: 0.6, color: new THREE.Color(0.82, 0.8, 0.82) }));
    surf.rotation.x = -Math.PI / 2; surf.position.set(0, 0, front - 30); surf.receiveShadow = true; ctx.root.add(surf);
    const face = faceTex(ctx, total);
    face.wrapS = THREE.RepeatWrapping; face.repeat.set(4, 1);
    const cut = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(60, total)), std(ctx, { map: face, roughness: 0.75 }));
    cut.position.set(0, -total / 2, front); cut.receiveShadow = true; cut.userData.solid = true; ctx.root.add(cut);
    // borde del corte levemente brillante (subsurface fingido) y glóbulos sueltos delante de la cara
    const rim = new THREE.Mesh(ctx.track(new THREE.BoxGeometry(60, 0.05, 0.05)), ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(LAYERS[0].col).multiplyScalar(1.6) })));
    rim.position.set(0, 0, front); ctx.root.add(rim);
    const vy = -(LAYERS[0].h + LAYERS[1].h) - LAYERS[2].h / 2; // centro de la capa de vasos
    lightDots(ctx, 30, "#e0505a", { x: [-5, 5], y: [vy - 0.15, vy + 0.15], z: [front + 0.03, front + 0.25] }, [0.03, 0.06], 1.2, 0.05);
    // fondo: la superficie se pierde en la niebla cálida
    return ctx.done(fogOf(L, 6, 30, PALETTE.bg.night1));
  },
};
