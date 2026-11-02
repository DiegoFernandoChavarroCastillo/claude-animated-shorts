// Cielo de atardecer sobre un mar de nubes (R1: el avión). Sin suelo: el protagonista flota sobre las nubes, el sol
// bajo con bloom queda detrás. El mar es un plano de nubes pintadas (continuo hasta el horizonte) y encima van nubes
// sueltas en sprites de bordes suaves, más grandes y desenfocadas cerca de la cámara.
import * as THREE from "three";
import { PALETTE } from "../style";
import { type EnvDef, makeCtx, sky, sun, canvasTex, fogOf, blocker, hex, type Ctx } from "./kit";

/** bola de nube suave: desenfocada (sin borde duro), cara alta encendida y el resto en el tono medio. El contraste
 *  dentro de cada bola es bajo para que el conjunto se lea como nube y no como esferas */
const puff = (g: CanvasRenderingContext2D, x: number, y: number, R: number, lit: string, mid: string, _shade: string) => {
  g.save(); g.filter = `blur(${Math.max(2, R * 0.12)}px)`;
  const gr = g.createRadialGradient(x - R * 0.1, y - R * 0.45, R * 0.1, x, y, R);
  gr.addColorStop(0, lit); gr.addColorStop(0.6, mid); gr.addColorStop(1, mid);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 0.92, 0, Math.PI * 2); g.fill();
  g.restore();
};

const cloudTex = (ctx: Ctx, seed: number, lit: string, mid: string, shade: string) => canvasTex(ctx, 512, 256, (g) => {
  let s = seed * 7 + 1; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  // primero el vientre (ancho, bajo y en sombra lavanda), luego las cúpulas de arriba
  for (let i = 0; i < 7; i++) puff(g, 90 + i * 55 + (r() - 0.5) * 20, 178, 58 + 20 * r(), shade, shade, shade);
  for (let i = 0; i < 9; i++) { const u = i / 8; puff(g, 100 + u * 312 + (r() - 0.5) * 30, 150 - Math.sin(u * Math.PI) * (40 + 30 * r()), 42 + 34 * r(), lit, mid, shade); }
});

/** mar de nubes visto desde arriba: manchas suaves que se repiten, en tonos de la luz */
const seaTex = (ctx: Ctx, lit: string, mid: string, shade: string) => {
  const t = canvasTex(ctx, 1024, 1024, (g) => {
    g.fillStyle = shade; g.fillRect(0, 0, 1024, 1024);
    let s = 5; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    // bolas grandes y planas (vistas desde arriba): la mitad encendidas, el resto en tono medio, sobre fondo lavanda
    for (let i = 0; i < 180; i++) {
      const x = r() * 1024, y = r() * 1024, R = 40 + r() * 80;
      for (const [dx, dy] of [[0, 0], [1024, 0], [-1024, 0], [0, 1024], [0, -1024]]) puff(g, x + dx, y + dy, R, i % 2 ? lit : mid, mid, shade);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10);
  return t;
};

export const cielo_atardecer: EnvDef = {
  when: "Vuelo, aviones, viajes, señales en el aire; planos abiertos y de apertura con sol bajo.",
  lights: ["atardecer", "dorado"],
  view: { el: 4, dof: 8 },
  build: (light, seed) => {
    const ctx = makeCtx(light, seed), { L, r } = ctx;
    const dir = new THREE.Vector3(0.0, 0.012, -1);
    sky(ctx, { sunDir: dir, clouds: 0.25, stars: 0.4, sunGlow: 1.3, spread: 0.1 });
    if (L.sun) sun(ctx, dir, 24, 4.5);
    const lit = hex(L.sunColor, 1.0, PALETTE.light.cream, 0.3), mid = hex(PALETTE.warm.rose, 1.0, PALETTE.mid.lavender, 0.35), shade = hex(PALETTE.mid.lavender, 0.8, PALETTE.mid.violet, 0.4);
    // mar continuo: un plano grande bajo el protagonista
    const sea = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(1600, 1600)),
      ctx.track(new THREE.MeshBasicMaterial({ map: seaTex(ctx, lit, mid, shade), color: new THREE.Color(0.56, 0.55, 0.6) })));
    sea.rotation.x = -Math.PI / 2; sea.position.y = -9; ctx.root.add(sea);
    // nubes sueltas: lejos hacia el horizonte (relieve), y unas cuantas cerca y bajas (entran desenfocadas)
    const tex = [0, 1, 2].map((k) => cloudTex(ctx, seed + k * 13, lit, mid, shade));
    const mats = tex.map((t) => ctx.track(new THREE.SpriteMaterial({ map: t, color: new THREE.Color(0.92, 0.9, 0.95), fog: true, depthWrite: false, transparent: true })));
    for (let i = 0; i < 90; i++) {
      const far = i < 70, z = far ? -30 - r() ** 0.8 * 380 : -4 - r() * 16;
      const x = (r() - 0.5) * (far ? 80 + (-z) * 1.3 : 30), y = far ? -8 + r() * 2.5 : -4.2 - r() * 2.2;
      const w = far ? 22 + (-z) * 0.1 + r() * 14 : 8 + r() * 7;
      const s = new THREE.Sprite(mats[i % 3]); s.scale.set(w, w * 0.45, 1); s.position.set(x, y, z);
      s.renderOrder = 1; ctx.root.add(s);
      if (!far) blocker(s);
    }
    return ctx.done(fogOf(L, 90, 600, L.sky.horizon));
  },
};
