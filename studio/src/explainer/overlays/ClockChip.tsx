// Píldora con icono y hora ("23:00") (R5).
import React from "react";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type ClockChipProps = BaseProps & { time: string; icon?: string };

export const ClockChip: React.FC<ClockChipProps> = ({ dur, time, icon = "moon", color: c, slot = "top" }) => {
  const { enter, exit } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.light.cream);
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.8 + 0.2 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 34px", borderRadius: 22, background: PALETTE.ui.card, border: `2px solid ${PALETTE.ui.cardBorder}` }}>
        <Icon name={icon} size={56} color={col} />
        <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 700, fontSize: 64, color: PALETTE.light.white }}>{time}</div>
      </div>
    </Place>
  );
};
