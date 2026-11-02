// Piezas comunes de los entornos (F4): contexto de construcción, cielo con degradado, texturas pintadas con
// Canvas2D, puntos de luz para el bokeh, sol con bloom y niebla del color del horizonte. Todo determinista
// (semilla por beat): ningún Math.random, para que los frames no parpadeen entre procesos de render.
import * as THREE from "three";
import { LIGHTS, type LightName, type LightPreset } from "../style";
import { untone } from "../world/tone";

export type EnvInstance = {
  root: THREE.Object3D;
  fog: THREE.Fog;
  update: (f: number, cam: THREE.Camera) => void;
  dispose: () => void;
};
/** cómo se ve mejor el entorno: elevación de cámara (grados), desenfoque de fondo por defecto (cInf px a 1080) y
 *  `distK`, factor sobre la distancia de encuadre (planos abiertos: el protagonista se ve más pequeño) */
export type EnvView = { el?: number; dof?: number; distK?: number };
export type EnvDef = {
  /** una línea para el catálogo: cuándo usarlo */
  when: string;
  lights: LightName[];  // luces con las que está pensado (las demás funcionan, pero no se han revisado)
  view?: EnvView;
  build: (light: LightName, seed: number) => EnvInstance;
};

export const rng = (seed: number) => {
  let s = (Math.floor(seed * 9301 + 49297) % 233280) || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};

/** contexto de construcción: raíz, luz, azar con semilla y registro de lo que hay que liberar */
export const makeCtx = (light: LightName, seed: number) => {
  const L = LIGHTS[light], r = rng(seed), root = new THREE.Group(), bin: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => { bin.push(x); return x; };
  const updates: ((f: number, cam: THREE.Camera) => void)[] = [];
  const done = (fog: THREE.Fog): EnvInstance => ({
    root, fog,
    update: (f, cam) => updates.forEach((u) => u(f, cam)),
    dispose: () => bin.forEach((d) => d.dispose()),
  });
  return { L, r, root, track, updates, done, light };
};
export type Ctx = ReturnType<typeof makeCtx>;

/** marca un objeto como bloqueante: si tapa la línea de visión de la cámara al protagonista, se oculta (cull.ts) */
export const blocker = <T extends THREE.Object3D>(o: T) => { o.userData.cull = true; return o; };

// ---------------- texturas pintadas ----------------
export const canvasTex = (ctx: Ctx, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!;
  draw(g);
  const t = ctx.track(new THREE.CanvasTexture(cv));
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
export const repeat = (t: THREE.Texture, x: number, y: number) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };

/** grano pintado: manchas suaves de un color sobre lo ya pintado (da textura al flujo óptico y aspecto R2) */
export const speckle = (g: CanvasRenderingContext2D, r: () => number, w: number, h: number, col: string, n: number, s0: number, s1: number, a0 = 0.1, a1 = 0.35) => {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    g.globalAlpha = a0 + (a1 - a0) * r();
    const s = s0 + (s1 - s0) * r();
    g.beginPath(); g.ellipse(r() * w, r() * h, s, s * (0.5 + 0.5 * r()), r() * Math.PI, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
};

export const hex = (c: THREE.ColorRepresentation, k = 1, toward?: THREE.ColorRepresentation, t = 0) => {
  const a = new THREE.Color(c);
  if (toward !== undefined) a.lerp(new THREE.Color(toward), t);
  return "#" + a.multiplyScalar(k).getHexString();
};

// ---------------- cielo ----------------
/** `spread` = elevación (rad) a la que el horizonte ya es el color medio; más bajo = violeta más cerca del horizonte */
export type SkyOpts = { clouds?: number; stars?: number; sunDir?: THREE.Vector3; sunGlow?: number; low?: number; spread?: number;
  /** colores propios del degradado (en pantalla) en vez de los de la luz: fondos que no son cielo (macro, estudio) */
  colors?: { top: string; mid: string; horizon: string } };
/** domo de cielo pegado a la cámara: degradado de la luz, bandas de nubes, estrellas y halo alrededor del sol.
 *  `low` desplaza el horizonte del degradado hacia abajo (para planos aéreos, donde se ve el cielo bajo el horizonte) */
export const sky = (ctx: Ctx, o: SkyOpts = {}) => {
  const L = ctx.L, sunDir = (o.sunDir ?? new THREE.Vector3(-0.08, 0.04, -1)).clone().normalize(), S = o.colors ?? L.sky;
  const mat = ctx.track(new THREE.ShaderMaterial({
    uniforms: {
      top: { value: untone(S.top) }, mid: { value: untone(S.mid) }, hor: { value: untone(S.horizon) },
      sunC: { value: new THREE.Color(L.sunColor) }, sunD: { value: sunDir }, glow: { value: L.sun && !o.colors ? (o.sunGlow ?? 1) : 0 },
      cl: { value: o.clouds ?? 0.22 }, st: { value: o.stars ?? 1 }, low: { value: o.low ?? 0 }, spread: { value: o.spread ?? 0.35 },
    },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform vec3 top, mid, hor, sunC, sunD; uniform float glow, cl, st, low, spread; varying vec3 vP;
      float h(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      void main(){ vec3 d = normalize(vP); float el = asin(clamp(d.y, -1.0, 1.0)) + low;
        vec3 c = mix(hor, mid, smoothstep(0.0, spread, el));
        c = mix(c, top, smoothstep(spread, spread * 3.0, el));
        c = mix(c, hor * 0.85, smoothstep(0.0, -0.4, el));
        vec2 q = d.xz / (abs(d.y) + 0.35);
        float b = 0.5 + 0.25 * sin(q.x * 3.1 + sin(q.y * 2.3)) + 0.25 * sin(q.y * 5.7 + q.x * 1.3);
        c *= 1.0 + cl * (b - 0.5) * smoothstep(0.02, 0.25, el);
        float sd = max(dot(d, sunD), 0.0);
        c += sunC * glow * (0.5 * pow(sd, 80.0) + 0.1 * pow(sd, 30.0));
        vec3 g = floor(d * 260.0); float s = h(g);
        c += vec3(0.9, 0.95, 1.0) * st * step(0.9965, s) * smoothstep(0.1, 0.35, el) * (0.4 + 0.6 * h(g + 3.0));
        gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false, fog: false,
  }));
  const m = new THREE.Mesh(ctx.track(new THREE.SphereGeometry(900, 48, 24)), mat);
  m.frustumCulled = false; m.renderOrder = -1; ctx.root.add(m);
  ctx.updates.push((_f, cam) => m.position.copy(cam.position));
  return { mesh: m, sunDir };
};

/** disco de sol con bloom en la dirección dada, lejos (no lo toca la niebla) */
export const sun = (ctx: Ctx, dir: THREE.Vector3, size = 30, k = 4) => {
  const m = new THREE.Mesh(ctx.track(new THREE.CircleGeometry(size, 48)),
    ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(ctx.L.sunColor).multiplyScalar(k), fog: false })));
  m.position.copy(dir.clone().normalize().multiplyScalar(700)); m.lookAt(0, 0, 0); ctx.root.add(m);
  ctx.updates.push((_f, cam) => { m.position.copy(dir.clone().normalize().multiplyScalar(700)).add(cam.position); m.lookAt(cam.position); });
  return m;
};

/** puntos de luz que el desenfoque convierte en bokeh y el bloom en brillo; `drift` los hace flotar despacio */
export const lightDots = (ctx: Ctx, n: number, col: THREE.ColorRepresentation, box: { x: [number, number]; y: [number, number]; z: [number, number] },
  size: [number, number] = [0.05, 0.17], k = 3.5, drift = 0) => {
  const geo = ctx.track(new THREE.SphereGeometry(1, 12, 8));
  const mat = ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k) }));
  const im = new THREE.InstancedMesh(geo, mat, n), r = ctx.r, M = new THREE.Matrix4();
  const P = [...Array(n)].map(() => ({
    p: new THREE.Vector3(box.x[0] + (box.x[1] - box.x[0]) * r(), box.y[0] + (box.y[1] - box.y[0]) * r(), box.z[0] + (box.z[1] - box.z[0]) * r()),
    s: size[0] + (size[1] - size[0]) * r(), ph: r() * 6.283, sp: 0.5 + r(),
  }));
  const place = (f: number) => {
    P.forEach((q, i) => {
      const y = q.p.y + drift * Math.sin(f * 0.02 * q.sp + q.ph), x = q.p.x + drift * 0.6 * Math.cos(f * 0.013 * q.sp + q.ph);
      M.makeScale(q.s, q.s, q.s).setPosition(x, y, q.p.z); im.setMatrixAt(i, M);
    });
    im.instanceMatrix.needsUpdate = true;
  };
  place(0); im.frustumCulled = false; ctx.root.add(im);
  if (drift) ctx.updates.push((f) => place(f));
  return im;
};

export const fogOf = (L: LightPreset, near = L.fogNear, far = L.fogFar, col: THREE.ColorRepresentation = L.fog) => new THREE.Fog(untone(col), near, far);

/** material estándar de entorno (mismo modelo de luz que el protagonista) */
export const std = (ctx: Ctx, p: THREE.MeshStandardMaterialParameters) => ctx.track(new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...p }));

/** material mate sin especular (Lambert) para suelos y paredes grandes: vistos a ras, el especular de Fresnel de
 *  MeshStandardMaterial reflejaba la luz de borde y teñía todo el suelo (cian en tech, granate en interiores) (D38) */
export const matte = (ctx: Ctx, p: THREE.MeshStandardMaterialParameters) => {
  const { roughness: _r, metalness: _m, ...q } = p;
  return ctx.track(new THREE.MeshLambertMaterial(q as THREE.MeshLambertMaterialParameters));
};

/** suelo grande; `tex` opcional con repetición */
export const ground = (ctx: Ctx, mat: THREE.Material, size = 800, y = 0) => {
  const m = new THREE.Mesh(ctx.track(new THREE.PlaneGeometry(size, size)), mat);
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; ctx.root.add(m);
  return m;
};

/** luz puntual cálida (lámpara, farola) sin sombras */
export const lamp = (ctx: Ctx, col: THREE.ColorRepresentation, intensity: number, dist: number, pos: [number, number, number]) => {
  const l = new THREE.PointLight(col, intensity, dist, 1.6); l.position.set(...pos); ctx.root.add(l); return l;
};
export { LIGHTS };
