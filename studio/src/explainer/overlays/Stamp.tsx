// Sello de impacto (D129): una etiqueta inclinada que cae sobre la escena (escala 1,6 → 1 en 6 frames), tiembla al golpear y se queda:
// CLASIFICADO, ELIMINADO, MENTIRA, NIVEL +3. Doble borde y letras en mayúsculas, como un sello de tinta.
import React from "react";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Place, tok, useAnim } from "./common";

export type StampProps = BaseProps & { text: string; sub?: string; rotate?: number };

export const Stamp: React.FC<StampProps> = ({ dur, text, sub, rotate = -6, color: c, slot = "center" }) => {
  const { f, exit } = useAnim(dur);
  const col = tok(c, "#E0312B"), land = Math.min(1, f / 6), s = 1.6 - 0.6 * land * land;
  const hit = f >= 6 && f < 16 ? (16 - f) / 10 : 0, jx = hit * 7 * Math.sin(f * 2.6), jy = hit * 5 * Math.cos(f * 2.1);
  return (
    <Place slot={slot} style={{ opacity: exit * Math.min(1, f / 3) }}>
      <div style={{ transform: `translate(${jx}px, ${jy}px) rotate(${rotate}deg) scale(${s})`, padding: "14px 40px 12px", border: `9px solid ${col}`, borderRadius: 14,
        outline: `3px solid ${col}`, outlineOffset: 7, background: "rgba(255,248,236,0.10)", textAlign: "center", boxShadow: f >= 6 ? "0 10px 30px rgba(0,0,0,0.35)" : undefined }}>
        <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 900, fontSize: 92, lineHeight: 1, letterSpacing: 6, color: col, textTransform: "uppercase", whiteSpace: "nowrap",
          textShadow: "0 0 1px rgba(0,0,0,0.4)" }}>{text}</div>
        {sub ? <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 30, letterSpacing: 5, color: col, marginTop: 6, textTransform: "uppercase" }}>{sub}</div> : null}
      </div>
    </Place>
  );
};
