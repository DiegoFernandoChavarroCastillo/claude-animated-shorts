// Etiqueta corta con borde de color ("acelerómetro", "SE HUNDE") (R3).
import React from "react";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Place, tok, useAnim } from "./common";

export type PillProps = BaseProps & { text: string; icon?: string; delay?: number; inline?: boolean };

export const Pill: React.FC<PillProps> = ({ dur, text, color: c, delay = 0, inline = false, slot = "top" }) => {
  const { enter, exit } = useAnim(dur);
  const k = enter(delay / 3), col = tok(c, PALETTE.ui.cyan);
  const pill = (
    <div style={{ display: "inline-block", padding: "14px 34px", borderRadius: 999, border: `3px solid ${col}`, background: PALETTE.ui.card,
      fontFamily: DISPLAY_FAMILY, fontWeight: 700, fontSize: 38, letterSpacing: "0.06em", color: PALETTE.light.white, whiteSpace: "nowrap",
      boxShadow: `0 0 22px ${col}`, opacity: k * exit, transform: `scale(${0.8 + 0.2 * k})` }}>{text}</div>
  );
  return inline ? pill : <Place slot={slot}>{pill}</Place>;
};
