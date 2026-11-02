// Cuarto de noche (R3: el reloj sobre la cama): el protagonista descansa sobre una manta con pliegues; detrás, una
// almohada, la pared con una ventana iluminada por la luna y una lámpara cálida en la mesilla.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, canvasTex, repeat, std, ground, fogOf, lightDots, speckle, blocker, lamp, hex } from "./kit";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const cuarto_noche: EnvDef = {
  when: "Dormir, noche en casa, cama, hábitos, cuerpo en reposo; objetos personales (reloj, teléfono).",
  lights: ["noche"],
  view: { el: 10, dof: 19 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    sky(ctx, { clouds: 0, stars: 0 });
    // manta: superficie a y = 0 bajo el protagonista, con pliegues pintados (bandas suaves) y relieve leve
    const blanket = canvasTex(ctx, 1024, 1024, (g) => {
      const base = hex(PALETTE.bg.indigo, 1.7, PALETTE.mid.lavender, 0.2);
      g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
      for (let k = 0; k < 16; k++) {
        const y = k * 64 + r() * 30, gr = g.createLinearGradient(0, y - 40, 0, y + 40);
        gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, `rgba(255,255,255,${0.05 + 0.07 * r()})`); gr.addColorStop(0.62, "rgba(0,0,0,0.22)"); gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr; g.save(); g.translate(512, y); g.rotate((r() - 0.5) * 0.35); g.fillRect(-800, -40, 1600, 80); g.restore();
      }
      speckle(g, r, 1024, 1024, PALETTE.mid.lavender, 3000, 1, 3, 0.04, 0.14);
    });
    const bedGeo = ctx.track(new THREE.PlaneGeometry(14, 12, 70, 60)), pos = bedGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, 0.12 * Math.sin(x * 0.9 + y * 0.35) + 0.08 * Math.sin(y * 1.7 - x * 0.4) - 0.6 * Math.max(0, Math.abs(x) - 5.5) ** 1.4);
    }
    bedGeo.computeVertexNormals();
    const bed = new THREE.Mesh(bedGeo, std(ctx, { map: blanket, roughness: 0.95 }));
    bed.rotation.x = -Math.PI / 2; bed.position.set(0, -0.12, -1); bed.receiveShadow = true; ctx.root.add(bed);
    // almohada detrás
    const pillow = blocker(new THREE.Mesh(ctx.track(new RoundedBoxGeometry(4.2, 0.9, 1.8, 4, 0.42)), std(ctx, { color: hex(PALETTE.mid.lavender, 0.95), roughness: 0.95 })));
    pillow.position.set(-1.6, 0.3, -5.6); pillow.rotation.y = 0.12; pillow.castShadow = pillow.receiveShadow = true; ctx.root.add(pillow);
    // suelo de madera más abajo y pared del fondo con ventana
    const floorTex = repeat(canvasTex(ctx, 512, 512, (g) => {
      g.fillStyle = hex(PALETTE.warm.brown, 0.6); g.fillRect(0, 0, 512, 512);
      for (let k = 0; k < 8; k++) { g.fillStyle = `rgba(0,0,0,${0.08 + 0.1 * r()})`; g.fillRect(0, k * 64, 512, 3); }
      speckle(g, r, 512, 512, "#000000", 800, 1, 4, 0.05, 0.15);
    }), 8, 8);
    ground(ctx, std(ctx, { map: floorTex, roughness: 0.6 }), 80, -1.4);
    const wallTex = canvasTex(ctx, 512, 512, (g) => {
      g.fillStyle = hex(PALETTE.bg.night1, 1.6); g.fillRect(0, 0, 512, 512);
      speckle(g, r, 512, 512, PALETTE.mid.lavender, 1500, 2, 6, 0.03, 0.1);
    });
    const wall = blocker(new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(60, 14)), std(ctx, { map: wallTex, roughness: 0.95 })));
    wall.position.set(0, 5.6, -11); wall.receiveShadow = true; ctx.root.add(wall);
    // ventana: cristales que brillan con luz de luna (fría) y marco en cruz; la luna detrás, borrosa
    const moon = new THREE.Color(PALETTE.mid.lavender).lerp(new THREE.Color(PALETTE.light.cream), 0.25);
    const glass = canvasTex(ctx, 256, 256, (g) => {
      const gr = g.createRadialGradient(170, 70, 10, 128, 128, 200);
      gr.addColorStop(0, hex(moon, 1.6)); gr.addColorStop(0.5, hex(moon, 0.8)); gr.addColorStop(1, hex(PALETTE.bg.indigo, 1.2));
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    });
    const pane = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(4.4, 4.4)), ctx.track(new THREE.MeshBasicMaterial({ map: glass, color: new THREE.Color(0.62, 0.62, 0.75) })));
    pane.position.set(2.2, 3.4, -10.95); ctx.root.add(pane);
    const frameMat = std(ctx, { color: hex(PALETTE.bg.night1, 2.0) });
    for (const [w, h, x, y] of [[4.8, 0.22, 2.2, 5.6], [4.8, 0.22, 2.2, 1.2], [0.22, 4.6, -0.1, 3.4], [0.22, 4.6, 4.5, 3.4], [0.14, 4.4, 2.2, 3.4], [4.4, 0.14, 2.2, 3.4]] as const) {
      const b = new THREE.Mesh(ctx.track(new THREE.BoxGeometry(w, h, 0.2)), frameMat); b.position.set(x, y, -10.85); ctx.root.add(b);
    }
    // cortina a un lado de la ventana
    const curtain = blocker(new THREE.Mesh(ctx.track(new THREE.CylinderGeometry(0.5, 0.7, 7, 12, 1, true)), std(ctx, { color: hex(PALETTE.mid.violet, 0.8), side: THREE.DoubleSide })));
    curtain.position.set(5.2, 3.0, -10.4); ctx.root.add(curtain);
    // mesilla con lámpara: pantalla cálida que brilla + luz puntual
    const table = blocker(new THREE.Mesh(ctx.track(new THREE.BoxGeometry(1.8, 2.2, 1.6)), std(ctx, { color: hex(PALETTE.warm.brown, 1.0) })));
    table.position.set(-2.6, -0.3, -6.5); ctx.root.add(table);
    const shade = new THREE.Mesh(ctx.track(new THREE.CylinderGeometry(0.45, 0.75, 0.9, 20, 1, true)),
      ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(L.key).multiplyScalar(2.2), side: THREE.DoubleSide })));
    shade.position.set(-2.6, 1.3, -6.5); ctx.root.add(shade);
    lamp(ctx, L.key, 22, 14, [-2.6, 1.2, -6.1]);
    // luz de luna entrando por la ventana (fría, sin sombras) y polvo en suspensión
    const moonLight = new THREE.DirectionalLight(moon, 1.1); moonLight.position.set(4, 6, -12); ctx.root.add(moonLight);
    lightDots(ctx, 40, moon, { x: [-8, 8], y: [0.5, 6], z: [-10, -3] }, [0.02, 0.05], 2.5, 0.25);
    return ctx.done(fogOf(L, 14, 60, PALETTE.bg.night1));
  },
};
