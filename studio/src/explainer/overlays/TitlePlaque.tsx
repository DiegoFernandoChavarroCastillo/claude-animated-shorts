// Placa con título y subtítulo para citas históricas ("LA ODISEA · Homero") (R2).
import React from "react";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Body, Place, tok, useAnim } from "./common";

export type TitlePlaqueProps = BaseProps & { title: string; subtitle?: string };

export const TitlePlaque: React.FC<TitlePlaqueProps> = ({ dur, title, subtitle, color: c, slot = "bottom" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.warm.gold), k = enter(0), line = prog(6, 20);
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `translateY(${(1 - k) * 30}px)` }}>
      <div style={{ padding: "28px 60px", borderRadius: 10, background: PALETTE.ui.card, border: `2px solid ${col}`, boxShadow: `0 20px 50px ${PALETTE.ui.shadow}` }}>
        <div style={{ height: 3, width: 260 * line, margin: "0 auto 18px", background: col }} />
        <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 64, letterSpacing: "0.12em", color: PALETTE.light.cream, whiteSpace: "nowrap" }}>{title}</div>
        {subtitle ? <Body size={34} weight={500} col={col} style={{ marginTop: 8, opacity: enter(2) }}>{subtitle}</Body> : null}
        <div style={{ height: 3, width: 260 * line, margin: "18px auto 0", background: col }} />
      </div>
    </Place>
  );
};
