// Tarjeta de interfaz genérica: icono, título, subtítulo y barra de progreso opcional (R3 / R5).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Body, Card, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type UICardProps = BaseProps & { title: string; subtitle?: string; icon?: string; progress?: number };

export const UICard: React.FC<UICardProps> = ({ dur, title, subtitle, icon = "chart", progress, color: c, slot = "bottom" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.ui.cyan);
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `translateY(${(1 - k) * 40}px)` }}>
      <Card style={{ width: 700, boxSizing: "border-box", display: "flex", gap: 30, alignItems: "center" }}>
        <div style={{ width: 110, height: 110, borderRadius: 28, background: PALETTE.ui.track, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={64} color={col} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Body size={42} weight={700} style={{ opacity: enter(1) }}>{title}</Body>
          {subtitle ? <Body size={30} weight={500} col={PALETTE.ui.muted} style={{ marginTop: 6, opacity: enter(2) }}>{subtitle}</Body> : null}
          {progress !== undefined ? (
            <div style={{ marginTop: 18, height: 14, borderRadius: 7, background: PALETTE.ui.track, overflow: "hidden" }}>
              <div style={{ width: `${100 * progress * prog(8, 40)}%`, height: "100%", background: col, borderRadius: 7 }} />
            </div>
          ) : null}
        </div>
      </Card>
    </Place>
  );
};
