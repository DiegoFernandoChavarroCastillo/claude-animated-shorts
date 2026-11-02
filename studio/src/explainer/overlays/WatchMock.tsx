// Reloj inteligente genérico con métrica en pantalla (R3). Sin marca ni interfaz real.
import React from "react";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Label, Place, fmt, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type WatchScreen = "heart" | "sleep" | "steps";
export type WatchMockProps = BaseProps & { screen?: WatchScreen; value?: number; unit?: string };

export const WatchMock: React.FC<WatchMockProps> = ({ dur, screen = "heart", value = 72, unit, color: c, lang = "es", slot = "center" }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const k = enter(0), col = tok(c, screen === "heart" ? PALETTE.ui.red : PALETTE.ui.cyan);
  const beat = 1 + 0.12 * Math.max(0, Math.sin(f * 0.42)) ** 8;
  const icon = screen === "heart" ? "heart" : screen === "sleep" ? "moon" : "chart";
  const u = unit ?? (screen === "heart" ? "LPM" : screen === "sleep" ? "h" : "");
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.9 + 0.1 * k})` }}>
      <div style={{ position: "relative", width: 360, height: 620 }}>
        <div style={{ position: "absolute", left: 80, width: 200, top: 0, height: 620, borderRadius: 40, background: PALETTE.bg.indigo }} />
        <div style={{ position: "absolute", left: 0, top: 130, width: 360, height: 360, borderRadius: 96, background: PALETTE.bg.night0,
          border: `14px solid ${PALETTE.mid.lavender}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: `0 30px 80px ${PALETTE.ui.shadow}` }}>
          <div style={{ transform: `scale(${screen === "heart" ? beat : 1})` }}><Icon name={icon} size={70} color={col} stroke={2.4} /></div>
          <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 92, color: PALETTE.light.white, lineHeight: 1.1 }}>
            {fmt(value * prog(4, 28), lang, screen === "sleep" ? 1 : 0)}
          </div>
          <Label size={26}>{u}</Label>
        </div>
      </div>
    </Place>
  );
};
