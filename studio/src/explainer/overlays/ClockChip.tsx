// Píldora con icono y hora ("23:00") (R5). Con `from` (D123) el reloj corre de esa hora a `time` en un segundo: el tiempo que pasa.
import React from "react";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type ClockChipProps = BaseProps & { time: string; icon?: string; from?: string };
const mins = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + (m || 0); };
const hhmm = (v: number) => `${String(Math.floor(v / 60) % 24).padStart(2, "0")}:${String(Math.round(v) % 60).padStart(2, "0")}`;

export const ClockChip: React.FC<ClockChipProps> = ({ dur, time, icon = "moon", from, color: c, slot = "top" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const shown = from ? hhmm(Math.floor(mins(from) + (mins(time) - mins(from)) * prog(6, 32))) : time;
  const k = enter(0), col = tok(c, PALETTE.light.cream);
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.8 + 0.2 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 34px", borderRadius: 22, background: PALETTE.ui.card, border: `2px solid ${PALETTE.ui.cardBorder}` }}>
        <Icon name={icon} size={56} color={col} />
        <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 700, fontSize: 64, color: PALETTE.light.white, fontVariantNumeric: "tabular-nums" }}>{shown}</div>
      </div>
    </Place>
  );
};
