// Interior neutro (R1: los teléfonos delante de la ventanilla): cabina o sala gris lavanda con luz suave, una pared
// curva con ventanillas ovaladas que dejan ver el atardecer y un suelo liso. Fondo limpio para objetos y maquetas.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, canvasTex, std, matte, ground, fogOf, speckle, blocker, hex, lightDots } from "./kit";

export const interior_neutro: EnvDef = {
  when: "Interiores sin contexto concreto (cabina, sala, oficina); fondo limpio para teléfonos, maquetas y objetos.",
  lights: ["atardecer", "dorado", "noche"],
  view: { el: 6, dof: 18 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    sky(ctx, { clouds: 0, stars: 0 });
    const wallCol = new THREE.Color(PALETTE.bg.indigo).lerp(new THREE.Color(PALETTE.mid.lavender), 0.3);
    const panel = canvasTex(ctx, 1024, 512, (g) => {
      g.fillStyle = hex(wallCol); g.fillRect(0, 0, 1024, 512);
      // paneles verticales con juntas suaves y grano fino
      for (let k = 0; k < 8; k++) { const gr = g.createLinearGradient(k * 128, 0, k * 128 + 128, 0); gr.addColorStop(0, "rgba(0,0,0,0.12)"); gr.addColorStop(0.1, "rgba(255,255,255,0.04)"); gr.addColorStop(1, "rgba(0,0,0,0.04)"); g.fillStyle = gr; g.fillRect(k * 128, 0, 128, 512); }
      speckle(g, r, 1024, 512, "#000000", 1600, 1, 3, 0.03, 0.1);
      speckle(g, r, 1024, 512, PALETTE.light.cream, 900, 1, 3, 0.03, 0.08);
    });
    // pared curva (arco de cilindro abierto hacia la cámara) a ~10 m detrás del protagonista; arco de ±54° para que
    // su caja no llegue al protagonista (si no, el culling la ocultaría)
    const wall = blocker(new THREE.Mesh(ctx.track(new THREE.CylinderGeometry(16, 16, 14, 64, 1, true, Math.PI * 0.7, Math.PI * 0.6)),
      matte(ctx, { map: panel, side: THREE.BackSide, color: new THREE.Color(1.5, 1.5, 1.6) })));
    wall.position.set(0, 5, 6); ctx.root.add(wall);
    // ventanillas ovaladas: atardecer pintado (emisivo) con marco claro, siguiendo la curva
    const view = canvasTex(ctx, 256, 384, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, 384);
      gr.addColorStop(0, hex(L.sky.top, 1.6)); gr.addColorStop(0.5, hex(L.sky.mid, 1.4)); gr.addColorStop(0.78, hex(L.sky.horizon, 1.3)); gr.addColorStop(1, hex(PALETTE.warm.rose, 0.9));
      g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
      g.fillStyle = hex(PALETTE.light.cream, 1); g.globalAlpha = 0.6; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(40 + r() * 180, 300 + r() * 60, 40 + r() * 40, 10 + r() * 8, 0, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
    });
    const ovalShape = new THREE.Shape(); ovalShape.absellipse(0, 0, 1.25, 1.85, 0, Math.PI * 2, false, 0);
    const winGeo = ctx.track(new THREE.ShapeGeometry(ovalShape, 32));
    { const uv = winGeo.attributes.uv, p = winGeo.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2.5 + 0.5, p.getY(i) / 3.7 + 0.5); }
    const winMat = ctx.track(new THREE.MeshBasicMaterial({ map: view, color: new THREE.Color(1.5, 1.5, 1.5) }));
    const ringGeo = ctx.track(new THREE.RingGeometry(1, 1.22, 48)); ringGeo.scale(1.25, 1.85, 1);
    const ringMat = std(ctx, { color: hex(PALETTE.light.cream, 0.85), roughness: 0.5 });
    for (const a of [-0.42, -0.14, 0.14, 0.42]) {
      const x = Math.sin(a) * 15.8, z = 6 - Math.cos(a) * 15.8;
      const w = new THREE.Mesh(winGeo, winMat); w.position.set(x, 4.2, z); w.lookAt(0, 4.2, 6); ctx.root.add(w);
      const ring = new THREE.Mesh(ringGeo, ringMat); ring.position.set(x, 4.2, z); ring.lookAt(0, 4.2, 6); ring.translateZ(0.02); ctx.root.add(ring);
    }
    // suelo liso con brillo suave
    const floorTex = canvasTex(ctx, 512, 512, (g) => { g.fillStyle = hex(wallCol, 0.85, PALETTE.mid.lavender, 0.25); g.fillRect(0, 0, 512, 512); speckle(g, r, 512, 512, "#000000", 1500, 1, 3, 0.04, 0.12); speckle(g, r, 512, 512, PALETTE.mid.lavender, 800, 1, 3, 0.04, 0.12); });
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(20, 20);
    ground(ctx, matte(ctx, { map: floorTex }), 200);
    // luz cálida que entra por las ventanillas y motas de polvo
    const win = new THREE.DirectionalLight(L.sky.horizon, 0.7); win.position.set(0, 5, -10); ctx.root.add(win);
    lightDots(ctx, 26, L.sky.horizon, { x: [-8, 8], y: [1, 7], z: [-9, -3] }, [0.03, 0.06], 2.5, 0.2);
    return ctx.done(fogOf(L, 20, 70, hex(wallCol, 0.7)));
  },
};
