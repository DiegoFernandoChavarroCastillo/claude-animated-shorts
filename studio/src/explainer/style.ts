// Única fuente de verdad del look "Explainer 2.5D" (plan §3.5–3.8). Ningún componente define colores, tamaños
// ni tiempos propios: todo sale de aquí. Los tamaños en px están definidos a 1080 de ancho y se escalan con
// `px(v, width)`; los relativos (K) se multiplican por el ancho o el alto del frame.

// ---------------- paleta (§3.6) ----------------
export const PALETTE = {
  bg: { night0: "#0A091A", night1: "#161232", navy: "#0F1833", indigo: "#272758", plum: "#1D1C34" },
  mid: { violet: "#614976", lavender: "#777DAC" },
  warm: { sunset: "#F38A6E", rose: "#C0796D", gold: "#DCAE6D", brown: "#4F3926" },
  light: { cream: "#E9E3C8", white: "#FFFFFF" },
  ui: {
    selection: "#3B82F6", selectionFill: "rgba(30,64,175,0.5)",
    cyan: "#5FD4F4", green: "#3DDC84", red: "#FF5A5F",
    card: "rgba(20,22,43,0.85)", cardBorder: "rgba(255,255,255,0.08)",
    spoken: "rgba(255,255,255,0.58)", accentWord: "#8AB4FF", grid: "#1E2A5A",
    shadow: "rgba(0,0,0,0.45)", track: "rgba(255,255,255,0.10)", muted: "rgba(255,255,255,0.62)",
  },
} as const;

type Palette = typeof PALETTE;
export type ColorToken = { [G in keyof Palette]: `${G & string}.${keyof Palette[G] & string}` }[keyof Palette];
/** "warm.gold" -> "#DCAE6D". Acepta también un token ya resuelto que empiece por # o rgba (para props de story.json). */
export const color = (token: ColorToken | string): string => {
  const [g, k] = token.split(".") as [keyof Palette, string];
  const v = (PALETTE[g] as Record<string, string> | undefined)?.[k];
  if (!v) throw new Error(`color desconocido: ${token}`);
  return v;
};

// ---------------- tipografía (§3.5) ----------------
/** Familia de los subtítulos: "PlusJakartaSans" o "Figtree" (fonts.ts carga solo la elegida). */
export const FONTS = {
  caption: "PlusJakartaSans" as "PlusJakartaSans" | "Figtree",
  display: "Montserrat",
};

// ---------------- frame base ----------------
export const BASE = { width: 1080, height: 1920, fps: 30 };
/** px definidos a 1080 de ancho -> px del frame actual */
export const px = (v: number, width: number) => (v * width) / BASE.width;

// ---------------- subtítulos (§3.5) ----------------
export const CAPTION = {
  centerYK: 0.19,         // centro de la primera línea, fracción del alto
  fontSizeK: 0.064,       // font-size = 0,064 x ancho (69 px a 1080)
  lineHeight: 1.25,
  maxWidthK: 0.84,        // ancho máximo de línea, fracción del ancho
  maxLines: 2,
  minWords: 3, maxWords: 6,
  breakPauseS: 0.35,      // una pausa mayor corta el bloque (si ya tiene minWords)
  holdAfterS: 0.6,        // el último bloque antes de un silencio largo se queda esto tras su última palabra
  fadeOutFrames: 3,       // el bloque anterior desaparece en 3 frames
  activeWeight: 700, spokenWeight: 500,
  activeColor: PALETTE.light.white, spokenColor: PALETTE.ui.spoken, accentColor: PALETTE.ui.accentWord,
  shadow: "0 2px 10px rgba(0,0,0,0.45)",
  band: { topK: 0.12, bottomK: 0.30 }, // zona reservada: ningún overlay entra aquí
};

/** Caja de selección de la palabra clave (§3.5), px a 1080 */
export const KEYWORD = {
  border: 3, radius: 6, padY: 4, padX: 8, boxHeightK: 1.0, // medido sobre R1 ("torre"): caja ~80 px de alto a 1080, ~8 px de margen
  fill: PALETTE.ui.selectionFill, stroke: PALETTE.ui.selection,
  handleR: 8, handleRing: 2.5, handleRingColor: PALETTE.light.white,
  popFrames: 6,
};

// ---------------- overlays (§3.8–3.9) ----------------
export const OVERLAY = {
  zone: { topK: 0.30, bottomK: 0.85 }, // los overlays viven entre el 30 % y el 85 % del alto
  scale: 1.35,                         // escala general de los overlays colocados (el verificador de F3 los vio pequeños)
  enterFrames: 10,                     // entradas de 8–12 frames
  stagger: 3,                          // 3–4 frames entre elementos
  spring: { damping: 200, stiffness: 120, mass: 0.6 },
  radius: 28, cardPad: 36, stroke: 4,  // px a 1080
  statSizeK: 0.11,                     // número grande = 0,11 x ancho
  labelSize: 34, labelTracking: "0.18em", bodySize: 40, smallSize: 30,
};

// ---------------- cámara (§3.7) ----------------
export const CAMERA = {
  pushMin: 0.25, pushDefault: 0.25, pushMax: 0.3, // %/frame; measure.py lee 25–75 % del valor y su umbral es 0,08 (D31)
  driftMaxPx: 1.5,                               // px/frame a 1080
  baseDriftPx: 1.0,                              // deriva suave que llevan todos los planos (px/frame a 1080) (D31)
  baseDriftMaxPx: 150,                           // recorrido máximo de esa deriva en un beat
  glideFrames: 30,                               // smootherstep de 18–40 f
  zoomThroughFrames: 24,                         // 20–30 f
  crossfadeFrames: 12,
  rollMaxDeg: 3,
  kickFrames: 7,
  fov: 38,
  heroScreenYK: 0.55,                            // centro del objeto protagonista, fracción del alto
};

/** Desenfoque de fondo (cInf, px a 1080) por tipo de plano (§3.8) */
export const DOF = { closeup: 15, medium: 12, wide: 4, aerial: 0, maxCoC: 24, nearScale: 1.2 };

// ---------------- luz (§3.6) ----------------
export type LightName = "atardecer" | "noche" | "dorado" | "tech";
export type LightPreset = {
  sky: { top: string; mid: string; horizon: string }; // degradado del cielo, colores en pantalla
  fog: string; fogNear: number; fogFar: number;
  hemiSky: string; hemiGround: string; hemi: number;  // luz ambiente
  key: string; keyI: number; keyAz: number; keyEl: number; // luz principal (grados, relativos a la cámara)
  rim: string; rimI: number;                          // contraluz
  sun: boolean; sunColor: string;                     // disco de sol con bloom
  ground: string; groundLine: string;                 // suelo provisional y su rejilla
  exposure: number;
};
export const LIGHTS: Record<LightName, LightPreset> = {
  atardecer: {
    sky: { top: "#2A1B4A", mid: PALETTE.mid.violet, horizon: PALETTE.warm.sunset }, fog: PALETTE.warm.rose, fogNear: 30, fogFar: 260,
    hemiSky: "#8a7ab8", hemiGround: "#3a2440", hemi: 0.9, key: "#ffb38a", keyI: 2.2, keyAz: 20, keyEl: 12, rim: "#ffd0a0", rimI: 2.8,
    sun: true, sunColor: "#ffd2a8", ground: "#3b2f52", groundLine: "#6a4f7a", exposure: 1.0,
  },
  noche: {
    sky: { top: PALETTE.bg.night0, mid: PALETTE.bg.night1, horizon: PALETTE.bg.indigo }, fog: PALETTE.bg.night1, fogNear: 20, fogFar: 180,
    hemiSky: "#5c64b0", hemiGround: "#141228", hemi: 0.8, key: "#ffcf8a", keyI: 1.8, keyAz: -35, keyEl: 30, rim: "#8ab4ff", rimI: 2.4,
    sun: false, sunColor: "#ffffff", ground: "#171633", groundLine: PALETTE.ui.grid, exposure: 1.0,
  },
  dorado: {
    sky: { top: PALETTE.bg.night0, mid: PALETTE.bg.navy, horizon: "#2b3355" }, fog: PALETTE.bg.navy, fogNear: 20, fogFar: 200,
    hemiSky: "#6070a8", hemiGround: "#1a1420", hemi: 0.75, key: PALETTE.warm.gold, keyI: 2.2, keyAz: 40, keyEl: 25, rim: "#ffd9a0", rimI: 2.6,
    sun: false, sunColor: "#ffffff", ground: "#1b2038", groundLine: "#33405e", exposure: 1.0,
  },
  tech: {
    sky: { top: PALETTE.bg.night0, mid: PALETTE.bg.night1, horizon: "#1a2050" }, fog: PALETTE.bg.night0, fogNear: 15, fogFar: 150,
    hemiSky: "#5a8ad0", hemiGround: "#0a0a20", hemi: 0.85, key: "#cfe6ff", keyI: 1.6, keyAz: -25, keyEl: 35, rim: PALETTE.ui.cyan, rimI: 2.6,
    sun: false, sunColor: "#ffffff", ground: PALETTE.bg.night0, groundLine: PALETTE.ui.grid, exposure: 1.0,
  },
};

// ---------------- post (§4: Explainer.tsx) ----------------
export const POST = {
  ink: false,
  bloom: { threshold: 0.9, intensity: 0.6, smoothing: 0.2, levels: 6, radius: 0.6 },
  msaa: 4,
  grain: false,
};
