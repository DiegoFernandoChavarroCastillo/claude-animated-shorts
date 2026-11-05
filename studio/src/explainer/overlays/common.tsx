// Piezas comunes de los overlays (§3.9). Todos los overlays dibujan en un lienzo de 1080 x 1920 que OverlayStage
// escala al tamaño real; su frame 0 es el momento de entrada (van dentro de un <Sequence>). Entradas con spring()
// de ~10 frames escalonadas 3 frames, salida en 6 frames al final. Ningún color va escrito aquí: todo de style.ts.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BASE, CAPTION, OVERLAY, PALETTE, color } from "../style";
import { CAPTION_FAMILY, DISPLAY_FAMILY } from "../fonts";

export type Pt = [number, number];
/** props que reciben todos los overlays además de los suyos */
export type BaseProps = { dur: number; color?: string; lang?: "es" | "en"; point?: Pt; slot?: Slot };

export const W = BASE.width, H = BASE.height;
export const ZONE_TOP = OVERLAY.zone.topK * H, ZONE_BOTTOM = OVERLAY.zone.bottomK * H;
export const BAND_BOTTOM = CAPTION.band.bottomK * H;

/** posiciones verticales dentro de la zona de overlays (centro del overlay, fracción del alto) */
// F16: antes lower 0,70 y bottom 0,79 caían en la zona de la interfaz de las apps (últimos ~35 % del alto)
export const SLOTS = { top: 0.37, upper: 0.43, center: 0.52, lower: 0.61, bottom: 0.67 } as const;
export type Slot = keyof typeof SLOTS;

export const useAnim = (dur: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (k = 0, frames: number = OVERLAY.enterFrames) =>
    spring({ frame: f - k * OVERLAY.stagger, fps, config: OVERLAY.spring, durationInFrames: frames });
  const exit = interpolate(f, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  /** 0..1 con ease-out entre los frames a y b (contadores, trazos) */
  const prog = (a: number, b: number) => { const u = Math.max(0, Math.min(1, (f - a) / Math.max(1, b - a))); return 1 - (1 - u) ** 3; };
  return { f, enter, exit, prog };
};

export const tok = (c: string | undefined, fallback: string) => (c ? color(c) : fallback);

/** número con el formato del idioma (coma decimal en español) */
export const fmt = (v: number, lang: "es" | "en" = "es", decimals = 0) =>
  v.toLocaleString(lang === "es" ? "es-ES" : "en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: Math.abs(v) >= 10000 });

/** contenedor centrado en x en la posición del slot */
export const Place: React.FC<{ slot?: Slot; y?: number; x?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ slot = "lower", y, x = W / 2, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y ?? SLOTS[slot] * H, transform: `translate(-50%, -50%) scale(${OVERLAY.scale})` }}>
    <div style={style}>{children}</div>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: PALETTE.ui.card, border: `2px solid ${PALETTE.ui.cardBorder}`, borderRadius: OVERLAY.radius, padding: OVERLAY.cardPad,
    boxShadow: `0 18px 50px ${PALETTE.ui.shadow}`, ...style }}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; size?: number; col?: string; style?: React.CSSProperties }> = ({ children, size = OVERLAY.labelSize, col = PALETTE.ui.muted, style }) => (
  <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 700, fontSize: size, letterSpacing: OVERLAY.labelTracking, textTransform: "uppercase", color: col, whiteSpace: "nowrap", ...style }}>{children}</div>
);

export const Body: React.FC<{ children: React.ReactNode; size?: number; col?: string; weight?: number; style?: React.CSSProperties }> = ({ children, size = OVERLAY.bodySize, col = PALETTE.light.white, weight = 600, style }) => (
  <div style={{ fontFamily: CAPTION_FAMILY, fontWeight: weight, fontSize: size, color: col, whiteSpace: "nowrap", ...style }}>{children}</div>
);

/** lienzo 1080 x 1920 escalado al tamaño real del frame */
export const OverlayStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${width / W})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

/** suelo de la zona: un punto anclado nunca se dibuja dentro de la banda de subtítulos */
export const clampToZone = ([x, y]: Pt, margin = 0): Pt => [Math.max(margin, Math.min(W - margin, x)), Math.max(ZONE_TOP + margin, Math.min(ZONE_BOTTOM - margin, y))];
