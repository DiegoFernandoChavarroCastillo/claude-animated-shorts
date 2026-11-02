// Exterior clásico (anécdotas históricas): terraza de piedra con un muro bajo, cipreses a los lados, el mar al
// atardecer con brillos y colinas lejanas en silueta.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, sun, canvasTex, repeat, std, ground, fogOf, speckle, blocker, hex } from "./kit";

export const exterior_clasico: EnvDef = {
  when: "Historia, anécdotas antiguas, Mediterráneo, viajes al pasado; objetos clásicos al aire libre.",
  lights: ["atardecer", "dorado"],
  view: { el: 8, dof: 16 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    const dir = new THREE.Vector3(0.06, 0.05, -1);
    sky(ctx, { sunDir: dir, clouds: 0.35, stars: 0.2, spread: 0.18 });
    if (L.sun) sun(ctx, dir, 22, 4);
    // losas de piedra de la terraza
    const stoneCols = [hex(PALETTE.warm.gold, 0.75, PALETTE.warm.rose, 0.3), hex(PALETTE.warm.gold, 0.65, PALETTE.warm.rose, 0.4), hex(PALETTE.light.cream, 0.6, PALETTE.warm.rose, 0.35)];
    const slabs = repeat(canvasTex(ctx, 512, 512, (g) => {
      g.fillStyle = hex(PALETTE.warm.brown, 0.9); g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 64) { const off = (y / 64) % 2 ? 48 : 0; for (let x = -48; x < 512; x += 96) { g.fillStyle = stoneCols[Math.floor(r() * 3)]; g.fillRect(x + off + 3, y + 3, 90, 58); } }
      speckle(g, r, 512, 512, "#000000", 1800, 1, 4, 0.05, 0.16);
      speckle(g, r, 512, 512, PALETTE.light.cream, 600, 1, 3, 0.05, 0.14);
    }), 12, 12);
    const terrace = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(40, 18)), std(ctx, { map: slabs, roughness: 0.9 }));
    terrace.rotation.x = -Math.PI / 2; terrace.position.set(0, 0, 3); terrace.receiveShadow = true; ctx.root.add(terrace);
    // muro bajo al borde de la terraza (bloques irregulares)
    const block = ctx.track(new THREE.BoxGeometry(1, 1, 1));
    const wallMat = std(ctx, { map: slabs, color: hex(PALETTE.light.cream, 1.1) });
    for (let x = -20; x < 20;) {
      const w = 1.2 + r() * 1.4, h = 1.0 + r() * 0.25;
      const b = blocker(new THREE.Mesh(block, wallMat)); b.scale.set(w - 0.06, h, 0.9); b.position.set(x + w / 2, h / 2, -6.2); b.castShadow = b.receiveShadow = true; ctx.root.add(b);
      x += w;
    }
    // mar: plano bajo hasta el horizonte, oscuro con brillos dorados (marcas pintadas)
    const sea = repeat(canvasTex(ctx, 1024, 1024, (g) => {
      g.fillStyle = hex(PALETTE.bg.indigo, 1.1); g.fillRect(0, 0, 1024, 1024);
      for (let k = 0; k < 900; k++) { g.fillStyle = r() < 0.25 ? L.sunColor : PALETTE.mid.lavender; g.globalAlpha = 0.15 + 0.4 * r(); g.fillRect(r() * 1024, r() * 1024, 10 + r() * 40, 2 + r() * 2); }
      g.globalAlpha = 1;
    }), 30, 30);
    ground(ctx, std(ctx, { map: sea, roughness: 0.3, metalness: 0.35, color: hex("#ffffff", 0.9) }), 1600, -1.3);
    // colinas lejanas y cabo
    const hillMat = std(ctx, { color: hex(PALETTE.bg.plum, 1.4, L.sky.horizon, 0.25) });
    for (let i = 0; i < 7; i++) {
      const h = new THREE.Mesh(ctx.track(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)), hillMat);
      h.scale.set(40 + r() * 60, 8 + r() * 14, 20 + r() * 20); h.position.set(-260 + i * 90 + r() * 30, -1.3, -260 - r() * 80); ctx.root.add(h);
    }
    // cipreses: husos verde oscuro a los lados de la terraza
    const cyp = ctx.track(new THREE.SphereGeometry(1, 16, 12)), cypMat = std(ctx, { color: hex("#2f4a35", 1, PALETTE.bg.plum, 0.35), roughness: 0.95 });
    const trunk = ctx.track(new THREE.CylinderGeometry(0.08, 0.12, 1, 6)), trunkMat = std(ctx, { color: hex(PALETTE.warm.brown, 0.8) });
    for (const [x, z, s] of [[-3.3, -8.6, 1.1], [3.6, -9.2, 1.25], [-5.8, -11, 1.3], [6.4, -12.5, 1.15], [-9, -4, 1], [9.5, -3.5, 0.95]] as const) {
      const g = blocker(new THREE.Group());
      const c = new THREE.Mesh(cyp, cypMat); c.scale.set(0.7 * s, 3.4 * s, 0.7 * s); c.position.y = 3.9 * s; c.castShadow = true;
      const t = new THREE.Mesh(trunk, trunkMat); t.scale.y = 0.8 * s; t.position.y = 0.4 * s;
      g.add(c, t); g.position.set(x, 0, z); ctx.root.add(g);
    }
    return ctx.done(fogOf(L, 12, 160, L.sky.horizon));
  },
};
