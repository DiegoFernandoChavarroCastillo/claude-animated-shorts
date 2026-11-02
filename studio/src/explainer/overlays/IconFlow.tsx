// 2–4 nodos conectados (mide -> analiza -> estima) que se encienden en orden (R3).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Body, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type FlowStep = { label: string; icon?: string };
export type IconFlowProps = BaseProps & { steps: FlowStep[] };

export const IconFlow: React.FC<IconFlowProps> = ({ dur, steps, color: c, slot = "bottom" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.cyan), n = Math.min(4, steps.length), gapW = n > 3 ? 210 : 280, node = 140;
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ position: "relative", width: gapW * (n - 1) + node, height: node + 70 }}>
        {steps.slice(0, n - 1).map((_, i) => {
          const p = prog(10 + i * 10, 18 + i * 10);
          return <div key={i} style={{ position: "absolute", top: node / 2 - 3, left: i * gapW + node, width: (gapW - node) * p, height: 6, borderRadius: 3, background: col, boxShadow: `0 0 12px ${col}` }} />;
        })}
        {steps.slice(0, n).map((s, i) => {
          const k = enter(i * 3.3), lit = prog(i * 10, i * 10 + 6);
          return (
            <div key={i} style={{ position: "absolute", left: i * gapW, top: 0, width: node, textAlign: "center", opacity: k, transform: `scale(${0.8 + 0.2 * k})` }}>
              <div style={{ width: node, height: node, borderRadius: node / 2, boxSizing: "border-box", border: `5px solid ${lit > 0.5 ? col : PALETTE.ui.track}`,
                background: PALETTE.ui.card, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: lit > 0.5 ? `0 0 30px ${col}` : "none" }}>
                <Icon name={s.icon ?? "check"} size={64} color={lit > 0.5 ? col : PALETTE.ui.muted} />
              </div>
              <Body size={30} weight={700} style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>{s.label}</Body>
            </div>
          );
        })}
      </div>
    </Place>
  );
};
