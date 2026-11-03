// Número grande con contador desde 0 + rótulo en versalitas con tracking amplio (R2 "300 MILLONES").
import React from "react";
import { OVERLAY, PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Label, Place, fmt, tok, useAnim, W } from "./common";

export type StatCalloutProps = BaseProps & { value: number; label: string; prefix?: string; suffix?: string; decimals?: number };

export const StatCallout: React.FC<StatCalloutProps> = ({ dur, value, label, prefix = "", suffix = "", decimals = 0, color: c, lang = "es", slot = "bottom" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), k2 = enter(2);
  const shown = value * prog(0, 24);
  const col = tok(c, PALETTE.warm.gold);
  return (
    <Place slot={slot} style={{ opacity: exit, textAlign: "center" }}>
      {/* velo oscuro suave detrás del número: las líneas brillantes del fondo (suelo tech) lo cruzaban (look-match F8) */}
      <div style={{ position: "absolute", inset: "-30% -12%", zIndex: -1, opacity: k,
        background: "radial-gradient(ellipse at center, rgba(5,6,20,0.8) 0%, rgba(5,6,20,0.55) 45%, rgba(5,6,20,0) 72%)" }} />
      <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: OVERLAY.statSizeK * W, lineHeight: 1, color: col, whiteSpace: "nowrap",
        transform: `scale(${0.85 + 0.15 * k})`, opacity: k, textShadow: `0 0 40px ${PALETTE.ui.shadow}` }}>
        {prefix}{fmt(shown, lang, decimals)}{suffix}
      </div>
      <Label style={{ marginTop: 18, opacity: k2, transform: `translateY(${(1 - k2) * 16}px)` }}>{label}</Label>
    </Place>
  );
};
