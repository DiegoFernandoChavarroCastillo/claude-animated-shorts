// 2–3 barras horizontales con etiqueta y valor que se llenan escalonadas (R2: tu nariz frente a la suya).
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Body, Card, Label, Place, fmt, tok, useAnim } from "./common";

export type BarItem = { label: string; value: number; color?: string };
export type BarCompareProps = BaseProps & { items: BarItem[]; unit?: string; max?: number; decimals?: number };

export const BarCompare: React.FC<BarCompareProps> = ({ dur, items, unit, max, decimals = 0, lang = "es", slot = "bottom" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const top = max ?? Math.max(...items.map((i) => i.value));
  const k = enter(0);
  const barW = 360;
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.94 + 0.06 * k})` }}>
      <Card style={{ width: 740, boxSizing: "border-box", padding: "30px 36px" }}>
        {items.map((it, i) => {
          const p = prog(6 + i * 4, 30 + i * 4), col = tok(it.color, i ? PALETTE.warm.gold : PALETTE.ui.cyan), ki = enter(i + 1);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: i ? 22 : 0, opacity: ki }}>
              <Body size={34} style={{ width: 130 }}>{it.label}</Body>
              <div style={{ width: barW, height: 30, borderRadius: 15, background: PALETTE.ui.track, overflow: "hidden" }}>
                <div style={{ width: barW * (it.value / top) * p, height: "100%", borderRadius: 15, background: col, boxShadow: `0 0 18px ${col}` }} />
              </div>
              <Body size={34} weight={700} col={col} style={{ width: 120, textAlign: "right" }}>{fmt(it.value * p, lang, decimals)}</Body>
            </div>
          );
        })}
        {unit ? <Label size={26} style={{ marginTop: 20, textAlign: "right" }}>{unit}</Label> : null}
      </Card>
    </Place>
  );
};
