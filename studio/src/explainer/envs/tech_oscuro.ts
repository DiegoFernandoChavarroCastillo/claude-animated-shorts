// Fondo técnico oscuro (R3: el chip y las gráficas): suelo y pared lejana de marino con rejilla tenue y pistas de
// circuito que brillan en cian, más partículas flotando. Para diagramas, componentes y datos.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, canvasTex, repeat, std, matte, ground, fogOf, lightDots, speckle, hex, type Ctx } from "./kit";

/** placa de circuito: rejilla tenue + pistas en ángulos de 45° con nodos; `glow` = solo las pistas (emissive) */
const circuit = (ctx: Ctx, glow: boolean) => {
  const { r } = ctx;
  let s = 7; const rr = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; // mismas pistas en las dos texturas
  return canvasTex(ctx, 1024, 1024, (g) => {
    g.fillStyle = glow ? "#000000" : hex(PALETTE.bg.night0, 1.25, PALETTE.mid.lavender, 0.12); g.fillRect(0, 0, 1024, 1024);
    if (!glow) {
      g.strokeStyle = PALETTE.ui.grid; g.lineWidth = 2;
      for (let k = 0; k <= 1024; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 1024); g.moveTo(0, k); g.lineTo(1024, k); g.stroke(); }
      speckle(g, r, 1024, 1024, PALETTE.ui.grid, 2200, 1, 3, 0.2, 0.6);
    }
    for (let n = 0; n < 46; n++) {
      let x = Math.round(rr() * 16) * 64, y = Math.round(rr() * 16) * 64;
      const bright = rr() < 0.35, col = bright ? PALETTE.ui.cyan : hex(PALETTE.ui.grid, 1.8);
      g.strokeStyle = col; g.lineWidth = bright ? 3 : 2; g.globalAlpha = glow ? (bright ? 0.9 : 0) : 0.8;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        const dir = Math.floor(rr() * 8), len = 32 + Math.floor(rr() * 4) * 32;
        x += Math.round(Math.cos((dir * Math.PI) / 4)) * len; y += Math.round(Math.sin((dir * Math.PI) / 4)) * len; g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, bright ? 6 : 4, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  });
};

export const tech_oscuro: EnvDef = {
  when: "Tecnología, sensores, chips, datos, ciencia de laboratorio, moléculas; fondo neutro para diagramas.",
  lights: ["tech", "noche"],
  view: { el: 12, dof: 10 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L } = ctx;
    sky(ctx, { clouds: 0, stars: 0.15 });
    const base = repeat(circuit(ctx, false), 10, 10), glow = repeat(circuit(ctx, true), 10, 10);
    ground(ctx, matte(ctx, { map: base, color: new THREE.Color(0.9, 0.9, 1.0), roughness: 0.9, metalness: 0, emissive: new THREE.Color(1, 1, 1), emissiveMap: glow, emissiveIntensity: 0.22 }), 300);
    // pared lejana (vertical) con la misma placa: da textura al fondo y profundidad con el desenfoque
    const wb = repeat(circuit(ctx, false), 6, 2), wg = repeat(circuit(ctx, true), 6, 2);
    const wall = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(240, 80)),
      matte(ctx, { map: wb, color: new THREE.Color(0.8, 0.8, 0.9), emissive: new THREE.Color(1, 1, 1), emissiveMap: wg, emissiveIntensity: 0.9, roughness: 0.95 }));
    wall.position.set(0, 30, -60); ctx.root.add(wall);
    // partículas cian y verdes flotando (bokeh)
    lightDots(ctx, 45, PALETTE.ui.cyan, { x: [-14, 14], y: [0.3, 9], z: [-30, -4] }, [0.03, 0.08], 1.4, 0.35);
    lightDots(ctx, 14, PALETTE.ui.green, { x: [-12, 12], y: [0.3, 7], z: [-25, -6] }, [0.03, 0.06], 1.4, 0.3);
    return ctx.done(fogOf(L, 18, 90, PALETTE.bg.night0));
  },
};
