// Caja de selección de la palabra clave (§3.5): borde azul, relleno azul oscuro translúcido y dos tiradores
// circulares (arriba-izquierda y abajo-derecha) con aro blanco. Aparece con un pequeño "pop" al decirse la palabra.
import React from "react";
import { spring, useVideoConfig } from "remotion";
import { KEYWORD, px } from "../style";

export const KeywordBox: React.FC<{ width: number; height: number; age: number }> = ({ width, height, age }) => {
  const { width: W, fps } = useVideoConfig();
  const k = spring({ frame: age, fps, durationInFrames: KEYWORD.popFrames, config: { damping: 14, stiffness: 220 } });
  const padX = px(KEYWORD.padX, W), padY = px(KEYWORD.padY, W), r = px(KEYWORD.handleR, W), ring = px(KEYWORD.handleRing, W);
  const handle = (s: React.CSSProperties): React.CSSProperties => ({
    position: "absolute", width: 2 * r, height: 2 * r, borderRadius: r, boxSizing: "border-box",
    background: KEYWORD.stroke, border: `${ring}px solid ${KEYWORD.handleRingColor}`, ...s,
  });
  return (
    <div style={{
      position: "absolute", left: -padX, top: -padY, width: width + 2 * padX, height: height + 2 * padY, boxSizing: "border-box",
      border: `${px(KEYWORD.border, W)}px solid ${KEYWORD.stroke}`, borderRadius: px(KEYWORD.radius, W), background: KEYWORD.fill,
      transform: `scale(${0.88 + 0.12 * k})`, opacity: Math.min(1, k * 1.5), zIndex: -1,
    }}>
      <div style={handle({ left: -r, top: -r })} />
      <div style={handle({ right: -r, bottom: -r })} />
    </div>
  );
};
