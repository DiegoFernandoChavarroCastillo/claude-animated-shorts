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
    // la hora del día tiñe la sala, no solo lo que se ve por las ventanillas (look-match F8, ronda 1)
    const warmK = { atardecer: 0.22, dorado: 0.2, noche: 0, tech: 0 }[light];
    // color de la hora: el horizonte del cielo, salvo en "dorado", cuyo horizonte es marino y el oro está en la luz principal
    const hourCol = light === "dorado" ? L.key : L.sky.horizon;
    const wallCol = new THREE.Color(PALETTE.bg.indigo).lerp(new THREE.Color(PALETTE.mid.lavender), 0.3).lerp(new THREE.Color(hourCol), warmK);
    const panel = canvasTex(ctx, 1024, 512, (g) => {
      g.fillStyle = hex(wallCol); g.fillRect(0, 0, 1024, 512);
      // paneles verticales con juntas suaves y grano fino
      // juntas marcadas y un tono distinto por panel: dan al fondo estructura que se lee al moverse la cámara (D58)
      for (let k = 0; k < 8; k++) {
        const gr = g.createLinearGradient(k * 128, 0, k * 128 + 128, 0); gr.addColorStop(0, "rgba(0,0,0,0.32)"); gr.addColorStop(0.06, "rgba(255,255,255,0.07)"); gr.addColorStop(1, "rgba(0,0,0,0.06)");
        g.fillStyle = gr; g.fillRect(k * 128, 0, 128, 512);
        g.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)"; g.fillRect(k * 128, 0, 128, 512);
      }
      g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(0, 150, 1024, 4); g.fillRect(0, 380, 1024, 4);
      // mancha de luz de la hora detrás del protagonista (entra por ventanillas fuera de cuadro) y bordes más oscuros:
      // da la hora del día y separa al objeto de la pared (look-match F8, ronda 3)
      const glow = g.createRadialGradient(512, 330, 20, 512, 330, 430);
      glow.addColorStop(0, hex(hourCol, 1)); glow.addColorStop(1, hex(hourCol) + "00");
      g.globalAlpha = 0.14 + warmK; g.fillStyle = glow; g.fillRect(0, 0, 1024, 512); g.globalAlpha = 1;
      const shade = g.createLinearGradient(0, 0, 0, 512); shade.addColorStop(0, "rgba(0,0,0,0.35)"); shade.addColorStop(0.55, "rgba(0,0,0,0)");
      g.fillStyle = shade; g.fillRect(0, 0, 1024, 512);
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
    // ventanillas más bajas y algo menores: sus marcos quedan bajo la banda de subtítulos (12–30 % del alto), detrás
    // del protagonista, como los teléfonos delante de la ventanilla de R1 (look-match F8, ronda 1)
    const WIN_Y = 2.3;
    const ovalShape = new THREE.Shape(); ovalShape.absellipse(0, 0, 1.25, 1.85, 0, Math.PI * 2, false, 0);
    const winGeo = ctx.track(new THREE.ShapeGeometry(ovalShape, 32));
    { const uv = winGeo.attributes.uv, p = winGeo.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2.5 + 0.5, p.getY(i) / 3.7 + 0.5); }
    const winMat = ctx.track(new THREE.MeshBasicMaterial({ map: view, color: new THREE.Color(1.5, 1.5, 1.5) }));
    const ringGeo = ctx.track(new THREE.RingGeometry(1, 1.22, 48)); ringGeo.scale(1.25, 1.85, 1);
    const ringMat = std(ctx, { color: hex(PALETTE.light.cream, 0.85), roughness: 0.5 });
    // separadas hacia los lados: el protagonista queda delante de pared lisa, no de un marco (look-match F8, ronda 2)
    for (const a of [-0.66, -0.36, 0.36, 0.66]) {
      const x = Math.sin(a) * 15.8, z = 6 - Math.cos(a) * 15.8;
      const w = new THREE.Mesh(winGeo, winMat); w.position.set(x, WIN_Y, z); w.lookAt(0, WIN_Y, 6); w.scale.setScalar(0.85); ctx.root.add(w);
      const ring = new THREE.Mesh(ringGeo, ringMat); ring.position.set(x, WIN_Y, z); ring.lookAt(0, WIN_Y, 6); ring.scale.setScalar(0.85); ring.translateZ(0.02); ctx.root.add(ring);
    }
    // suelo liso con brillo suave
    // baldosas grandes (~1,25 m) con juntas y tono variable: el suelo liso no daba nada que seguir al flujo óptico (D58)
    const floorTex = canvasTex(ctx, 512, 512, (g) => {
      g.fillStyle = hex(wallCol, 0.85, PALETTE.mid.lavender, 0.25); g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.05)"; g.fillRect(x * 128, y * 128, 128, 128); }
      speckle(g, r, 512, 512, "#000000", 1500, 1, 3, 0.04, 0.12); speckle(g, r, 512, 512, PALETTE.mid.lavender, 800, 1, 3, 0.04, 0.12);
      g.fillStyle = "rgba(0,0,0,0.35)"; for (let k = 0; k < 4; k++) { g.fillRect(k * 128, 0, 3, 512); g.fillRect(0, k * 128, 512, 3); }
      g.fillStyle = "rgba(255,255,255,0.06)"; for (let k = 0; k < 4; k++) { g.fillRect(k * 128 + 3, 0, 2, 512); g.fillRect(0, k * 128 + 3, 512, 2); }
    });
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(40, 40);
    ground(ctx, matte(ctx, { map: floorTex }), 200);
    // luz cálida que entra por las ventanillas y motas de polvo
    // la luz de las ventanillas hace de contraluz del protagonista; más fuerte con sol bajo
    const win = new THREE.DirectionalLight(hourCol, { atardecer: 2.4, dorado: 1.9, noche: 0.7, tech: 0.7 }[light]); win.position.set(0, 4, -10); ctx.root.add(win);
    lightDots(ctx, 26, L.sky.horizon, { x: [-8, 8], y: [1, 7], z: [-9, -3] }, [0.03, 0.06], 2.5, 0.2);
    // niebla más cercana: la pared (10–16 m) se separa del protagonista (look-match F8, ronda 1)
    return ctx.done(fogOf(L, 12, 60, hex(wallCol, 0.7)));
  },
};
