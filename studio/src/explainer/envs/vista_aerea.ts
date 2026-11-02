// Vista aérea (R1: ciudad con antenas): ciudad en miniatura en rejilla (manzanas de 4 m con casitas de 0,5–1 m),
// parcelas de campo alrededor, puntos de luz cálidos en las calles y niebla de atardecer hacia el horizonte. El
// protagonista (una antena, un edificio) queda más alto que todo y la cámara mira desde arriba (30°).
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, canvasTex, repeat, std, matte, ground, fogOf, lightDots, speckle, hex } from "./kit";

const BLOCK = 4;      // m por manzana (calle incluida)
const TILE = 8;       // manzanas por tesela de textura

export const vista_aerea: EnvDef = {
  when: "Ciudades, redes, antenas, mapas, 'desde arriba'; mostrar escala o cobertura.",
  lights: ["atardecer", "noche", "dorado"],
  view: { el: 22, dof: 2, distK: 2.6 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    sky(ctx, { clouds: 0.2, stars: 0.3, spread: 0.2 });
    // suelo: manzanas grises con calles claras cerca; más allá, parcelas de campo
    const pave = hex(PALETTE.mid.lavender, 0.95, L.key, 0.25), road = hex(PALETTE.light.cream, 0.7, L.key, 0.3);
    const field = [hex("#7d8a52", 0.95, L.key, 0.2), hex("#8e8a55", 0.95, L.key, 0.2), hex("#6d7a4c", 0.95, L.key, 0.2), hex("#9a7d5a", 0.95, L.key, 0.2)];
    const city = repeat(canvasTex(ctx, 1024, 1024, (g) => {
      g.fillStyle = road; g.fillRect(0, 0, 1024, 1024);
      const c = 1024 / TILE;
      for (let i = 0; i < TILE; i++) for (let j = 0; j < TILE; j++) { g.fillStyle = r() < 0.15 ? field[Math.floor(r() * 4)] : pave; g.fillRect(i * c + 10, j * c + 10, c - 20, c - 20); }
      speckle(g, r, 1024, 1024, "#000000", 3000, 1, 4, 0.04, 0.14);
      speckle(g, r, 1024, 1024, PALETTE.light.cream, 1200, 1, 3, 0.04, 0.12);
    }), 1600 / (BLOCK * TILE), 1600 / (BLOCK * TILE));
    ground(ctx, matte(ctx, { map: city }), 1600);
    // casitas: cajas con tejado a dos aguas, 3–6 por manzana, a lo largo de sus bordes; libre el centro
    const wallGeo = ctx.track(new THREE.BoxGeometry(1, 1, 1)); wallGeo.translate(0, 0.5, 0);
    const roofGeo = ctx.track(new THREE.CylinderGeometry(0.72, 0.72, 1, 3, 1)); roofGeo.rotateZ(Math.PI / 2); roofGeo.translate(0, 0.25, 0);
    const MAX = 9000;
    const walls = new THREE.InstancedMesh(wallGeo, std(ctx, { color: hex(PALETTE.light.cream, 0.85, L.key, 0.2) }), MAX);
    const roofs = new THREE.InstancedMesh(roofGeo, std(ctx, { color: hex(PALETTE.warm.rose, 0.9) }), MAX);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    let n = 0;
    const N = 26;
    for (let i = -N; i < N; i++) for (let j = -N; j < 4; j++) {
      const cx = (i + 0.5) * BLOCK, cz = (j + 0.5) * BLOCK, d = Math.hypot(cx, cz);
      if (d < 3.5 || d > 100 || r() < 0.12) continue;
      const k = 3 + Math.floor(r() * 4);
      for (let m = 0; m < k && n < MAX; m++) {
        const rot = m % 2 ? 0 : Math.PI / 2; q.setFromAxisAngle(up, rot);
        const w = 0.5 + r() * 0.5, dd = 0.55 + r() * 0.45, h = 0.35 + r() * 0.6 + (d < 40 && r() < 0.08 ? 1.2 : 0);
        const along = -1.2 + r() * 2.4, side = (r() < 0.5 ? -1 : 1) * 1.05;
        const [ox, oz] = rot ? [along, side] : [side, along];
        M.compose(P.set(cx + ox, 0, cz + oz), q, S.set(w, h, dd)); walls.setMatrixAt(n, M);
        M.compose(P.set(P.x, h, P.z), q, S.set(w * 1.05, Math.min(0.5, h * 0.5), dd * 0.88)); roofs.setMatrixAt(n, M);
        n++;
      }
    }
    walls.count = roofs.count = n;
    for (const m of [walls, roofs]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; ctx.root.add(m); }
    // farolas de las calles (bokeh cálido) y balizas rojas de otras antenas
    lightDots(ctx, 260, L.key, { x: [-100, 100], y: [0.08, 0.2], z: [-110, 12] }, [0.05, 0.12], 3.2);
    lightDots(ctx, 26, PALETTE.ui.red, { x: [-80, 80], y: [2, 4], z: [-100, -15] }, [0.07, 0.12], 3);
    return ctx.done(fogOf(L, 15, 110, L.sky.horizon));
  },
};
