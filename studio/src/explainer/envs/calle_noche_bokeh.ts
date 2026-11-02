// Calle de noche (R2: el paseo del perro): fachadas a los dos lados con ventanas cálidas, farolas con bloom y
// asfalto mojado que refleja. Pensada para desenfoque fuerte: el fondo se vuelve bokeh dorado.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, canvasTex, repeat, std, ground, fogOf, lightDots, speckle, blocker, lamp, hex } from "./kit";

export const calle_noche_bokeh: EnvDef = {
  when: "Calle, ciudad de noche, paseos, personas o animales fuera de casa; ambiente cálido y desenfocado.",
  lights: ["dorado", "noche"],
  view: { el: 8, dof: 16 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    sky(ctx, { clouds: 0.12, stars: 0.6 });
    // asfalto: oscuro, grano fino y línea central discontinua; poco rugoso para recoger reflejos de las farolas
    const asphalt = repeat(canvasTex(ctx, 512, 512, (g) => {
      g.fillStyle = hex(PALETTE.bg.navy, 1.7, PALETTE.mid.violet, 0.15); g.fillRect(0, 0, 512, 512);
      speckle(g, r, 512, 512, "#000000", 2600, 1, 3, 0.08, 0.3);
      speckle(g, r, 512, 512, PALETTE.mid.lavender, 1400, 1, 3, 0.05, 0.18);
      g.fillStyle = hex(PALETTE.light.cream, 0.7); g.globalAlpha = 0.5; g.fillRect(250, 0, 12, 200); g.globalAlpha = 1;
    }), 1, 60);
    const street = ground(ctx, std(ctx, { map: asphalt, roughness: 0.38, metalness: 0.25 }), 600);
    street.scale.x = 14 / 600; // calle de 14 m de ancho; las aceras van aparte
    asphalt.repeat.set(1, 60);
    const walk = repeat(canvasTex(ctx, 256, 256, (g) => {
      g.fillStyle = hex(PALETTE.bg.plum, 1.5); g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 3; for (let k = 0; k <= 256; k += 64) { g.beginPath(); g.moveTo(0, k); g.lineTo(256, k); g.moveTo(k, 0); g.lineTo(k, 256); g.stroke(); }
      speckle(g, r, 256, 256, PALETTE.mid.lavender, 300, 1, 3, 0.05, 0.2);
    }), 4, 300);
    ground(ctx, std(ctx, { map: walk, roughness: 0.7 }), 600, -0.01);
    // fachadas: bloques a los dos lados, con ventanas cálidas (emissive) y pisos de alturas distintas
    const winTex = (k: number) => canvasTex(ctx, 128, 256, (g) => {
      g.fillStyle = "#000000"; g.fillRect(0, 0, 128, 256);
      for (let y = 10; y < 250; y += 30) for (let x = 10; x < 120; x += 28) if (r() < 0.5) {
        g.fillStyle = r() < 0.75 ? L.key : PALETTE.warm.sunset; g.globalAlpha = 0.45 + 0.55 * r(); g.fillRect(x, y, 16, 20);
      }
      g.globalAlpha = 1; void k;
    });
    const wins = [0, 1, 2].map(winTex);
    const box = ctx.track(new THREE.BoxGeometry(1, 1, 1)); box.translate(0, 0.5, 0);
    const wallCols = [hex(PALETTE.bg.indigo, 1.1), hex(PALETTE.bg.plum, 1.3), hex(PALETTE.mid.violet, 0.55), hex(PALETTE.warm.brown, 0.8)];
    const mats = wins.flatMap((w) => wallCols.map((c) => std(ctx, { color: c, emissive: new THREE.Color(1, 1, 1), emissiveMap: w, emissiveIntensity: 1.4 })));
    for (const side of [-1, 1]) {
      let z = 6;
      while (z > -170) {
        const w = 6 + r() * 7, h = 6 + r() * 12, d = 6 + r() * 4;
        const m = blocker(new THREE.Mesh(box, mats[Math.floor(r() * mats.length)]));
        m.scale.set(d, h, w); m.position.set(side * (10.5 + d / 2), 0, z - w / 2); m.receiveShadow = true; ctx.root.add(m);
        z -= w + 0.3;
      }
    }
    // farolas cada 13 m a los dos lados: poste, cabeza brillante (bloom) y luz real en las cercanas
    const pole = ctx.track(new THREE.CylinderGeometry(0.06, 0.08, 4.6, 8)); pole.translate(0, 2.3, 0);
    const head = ctx.track(new THREE.SphereGeometry(0.28, 16, 12));
    const poleMat = std(ctx, { color: hex(PALETTE.bg.night1, 1.4), roughness: 0.5, metalness: 0.4 });
    const bulb = ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(L.key).multiplyScalar(6) }));
    for (const side of [-1, 1]) for (let k = 0; k < 13; k++) {
      const z = 4 - k * 13 - (side > 0 ? 6 : 0), x = side * 7.8;
      const p = blocker(new THREE.Mesh(pole, poleMat)); p.position.set(x, 0, z); ctx.root.add(p);
      const hd = new THREE.Mesh(head, bulb); hd.position.set(x - side * 0.4, 4.6, z); ctx.root.add(hd);
      if (k < 3) lamp(ctx, L.key, 30, 18, [x - side * 0.4, 4.4, z]);
    }
    // bokeh lejano: luces de coches, escaparates y ventanas
    lightDots(ctx, 120, L.key, { x: [-16, 16], y: [0.5, 9], z: [-140, -25] }, [0.08, 0.25], 3.5);
    lightDots(ctx, 30, PALETTE.warm.sunset, { x: [-6, 6], y: [0.4, 1.2], z: [-120, -30] }, [0.1, 0.2], 3);
    return ctx.done(fogOf(L, 18, 150));
  },
};
