// Catálogo de entornos (plan §8 F4). En F2 todos son PROVISIONALES: cielo en degradado, suelo con rejilla, siluetas
// de fondo y puntos de luz, con los colores de la luz del beat. Los ids del ejemplo hielo-flota apuntan aquí hasta
// que F4 construya cada entorno de verdad.
import * as THREE from "three";
import { LIGHTS, type LightName } from "../style";
import { untone } from "../world/tone";

export type EnvInstance = { root: THREE.Object3D; fog: THREE.Fog; update: (f: number, cam: THREE.Camera) => void; dispose: () => void };
export type EnvDef = { provisional: boolean; build: (light: LightName, seed: number) => EnvInstance };

const rng = (seed: number) => { let s = (seed * 9301 + 49297) % 233280 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

const skyMaterial = (light: LightName) => {
  const L = LIGHTS[light];
  return new THREE.ShaderMaterial({
    uniforms: { top: { value: untone(L.sky.top) }, mid: { value: untone(L.sky.mid) }, hor: { value: untone(L.sky.horizon) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    // degradado + bandas de nubes tenues + estrellas: el cielo tiene textura, así el movimiento de cámara se nota
    fragmentShader: `uniform vec3 top, mid, hor; varying vec3 vP;
      float h(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      void main(){ vec3 d = normalize(vP); float el = asin(clamp(d.y, -1.0, 1.0));
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.35, el));
        c = mix(c, top, smoothstep(0.35, 1.1, el));
        vec2 q = d.xz / (d.y + 0.35);
        float cl = 0.5 + 0.25 * sin(q.x * 3.1 + sin(q.y * 2.3)) + 0.25 * sin(q.y * 5.7 + q.x * 1.3);
        c *= 1.0 + 0.22 * (cl - 0.5) * smoothstep(0.02, 0.25, el);
        vec3 g = floor(d * 260.0); float s = h(g);
        c += vec3(0.9, 0.95, 1.0) * step(0.9965, s) * smoothstep(0.08, 0.3, el) * (0.4 + 0.6 * h(g + 3.0));
        gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false, fog: false,
  });
};

const gridTexture = (bg: string, line: string, r: () => number) => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 512;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg; g.fillRect(0, 0, 512, 512);
  // subrejilla tenue y motas deterministas: sin ellas el suelo entre líneas es liso y el flujo óptico no ve el
  // movimiento de cámara (D29, D31)
  const fine = "#" + new THREE.Color(line).lerp(new THREE.Color(1, 1, 1), 0.3).getHexString();
  g.strokeStyle = fine; g.globalAlpha = 0.3; g.lineWidth = 2;
  for (let k = 16; k < 512; k += 16) if (k % 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); }
  g.fillStyle = fine;
  for (let n = 0; n < 1400; n++) { g.globalAlpha = 0.25 + 0.45 * r(); const sz = 3 + 5 * r(); g.fillRect(r() * 512, r() * 512, sz, sz); }
  g.globalAlpha = 1;
  g.strokeStyle = line; g.lineWidth = 5;
  for (let k = 0; k <= 512; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); t.anisotropy = 8;
  return t;
};

const windowTexture = (lit: string, r: () => number) => {
  const cv = document.createElement("canvas"); cv.width = 64; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "black"; g.fillRect(0, 0, 64, 128);
  for (let y = 6; y < 124; y += 12) for (let x = 6; x < 60; x += 14) if (r() < 0.45) { g.fillStyle = lit; g.globalAlpha = 0.5 + 0.5 * r(); g.fillRect(x, y, 8, 6); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const provisional = (variant: "interior" | "tech" | "exterior"): EnvDef["build"] => (light, seed) => {
  const L = LIGHTS[light], r = rng(seed), root = new THREE.Group(), disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };
  // cielo
  const sky = new THREE.Mesh(track(new THREE.SphereGeometry(900, 48, 24)), track(skyMaterial(light)));
  sky.frustumCulled = false; sky.renderOrder = -1; root.add(sky);
  // suelo con rejilla (da textura al flujo óptico y parallax al desenfoque)
  const tex = track(gridTexture(L.ground, L.groundLine, r));
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(800, 800)), track(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0 })));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
  // siluetas de fondo (edificios, muebles, bloques) detrás del objeto protagonista
  const box = track(new THREE.BoxGeometry(1, 1, 1));
  // ventanas encendidas: dan textura (contraste) al fondo aunque esté desenfocado
  const win = track(windowTexture(L.key, r));
  const silMat = track(new THREE.MeshStandardMaterial({ color: new THREE.Color(L.ground).multiplyScalar(1.4), roughness: 0.8,
    emissive: new THREE.Color(1, 1, 1), emissiveMap: win, emissiveIntensity: 1.6 }));
  const n = variant === "interior" ? 14 : 34;
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(box, silMat), w = 1.5 + r() * (variant === "interior" ? 3 : 7), h = 1 + r() * (variant === "interior" ? 4 : 16);
    m.scale.set(w, h, 1.5 + r() * 4);
    // lejos del objeto (foco ~11 m): con cInf 10–16 px el fondo queda muy desenfocado, como en las referencias
    m.position.set((r() - 0.5) * (variant === "interior" ? 40 : 140), h / 2, -18 - r() * (variant === "interior" ? 30 : 100));
    root.add(m);
  }
  // puntos de luz (bokeh con el desenfoque, brillo con el bloom)
  const dot = track(new THREE.SphereGeometry(1, 12, 8));
  const warm = new THREE.Color(variant === "tech" ? L.rim : L.key).multiplyScalar(3.5);
  const dotMat = track(new THREE.MeshBasicMaterial({ color: warm }));
  for (let i = 0; i < 90; i++) {
    const m = new THREE.Mesh(dot, dotMat), s = 0.05 + r() * 0.12;
    m.scale.setScalar(s * 2); m.position.set((r() - 0.5) * 50, 0.4 + r() * 9, -14 - r() * 40); root.add(m);
  }
  // sol bajo con bloom (atardecer)
  if (L.sun) {
    const sun = new THREE.Mesh(track(new THREE.CircleGeometry(30, 48)), track(new THREE.MeshBasicMaterial({ color: new THREE.Color(L.sunColor).multiplyScalar(4), fog: false })));
    sun.position.set(-60, 28, -700); root.add(sun);
  }
  const fog = new THREE.Fog(untone(L.fog), L.fogNear, L.fogFar);
  return {
    root, fog,
    update: (_f, cam) => { sky.position.copy(cam.position); },
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
};

export const ENVS: Record<string, EnvDef> = {
  provisional: { provisional: true, build: provisional("exterior") },
  cocina_noche: { provisional: true, build: provisional("interior") },
  tech_oscuro: { provisional: true, build: provisional("tech") },
  lago_invierno: { provisional: true, build: provisional("exterior") },
};

export const envDef = (id: string) => {
  const e = ENVS[id];
  if (!e) throw new Error(`env desconocido: ${id}`);
  return e;
};
