// Teléfono genérico con pantalla configurable (R1). Sin logos ni interfaz de ninguna marca real.
import React from "react";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Body, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type PhoneScreen = "signal" | "lock" | "control" | "metrics";
export type PhoneMockProps = BaseProps & { screen?: PhoneScreen; time?: string; text?: string; value?: number };

const PW = 340, PH = 680;

export const PhoneMock: React.FC<PhoneMockProps> = ({ dur, screen = "signal", time = "18:52", text, value = 0.75, color: c, slot = "center" }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.ui.cyan);
  const content = () => {
    if (screen === "lock") return (
      <div style={{ textAlign: "center", paddingTop: 120 }}>
        <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 600, fontSize: 96, color: PALETTE.light.white }}>{time}</div>
        {text ? <div style={{ margin: "40px 22px 0", padding: 18, borderRadius: 20, background: PALETTE.ui.track, opacity: prog(10, 20) }}><Body size={24} weight={600} style={{ whiteSpace: "normal" }}>{text}</Body></div> : null}
      </div>
    );
    if (screen === "control") return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, padding: "120px 30px" }}>
        {["plane", "signal", "sensor", "drop"].map((ic, i) => {
          const on = i === 0 && prog(10, 14) > 0.5;
          return <div key={ic} style={{ height: 120, borderRadius: 60, background: on ? PALETTE.warm.gold : PALETTE.ui.track, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={ic} size={56} color={on ? PALETTE.bg.night0 : PALETTE.light.white} />
          </div>;
        })}
      </div>
    );
    if (screen === "metrics") return (
      <div style={{ padding: "130px 34px 0", display: "flex", alignItems: "flex-end", gap: 16, height: 300 }}>
        {[0.4, 0.7, 0.55, 0.9, 0.65].map((h, i) => <div key={i} style={{ flex: 1, height: `${100 * h * prog(i * 3, 20 + i * 3)}%`, background: col, borderRadius: 10 }} />)}
      </div>
    );
    const bars = 4, lit = Math.round(bars * value * (0.75 + 0.25 * Math.sin(f * 0.25)));
    return (
      <div style={{ textAlign: "center", paddingTop: 170 }}>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "flex-end", height: 140 }}>
          {[...Array(bars)].map((_, i) => <div key={i} style={{ width: 34, height: 35 * (i + 1), borderRadius: 8, background: i < lit ? col : PALETTE.ui.track }} />)}
        </div>
        {text ? <Body size={30} style={{ marginTop: 40 }}>{text}</Body> : null}
      </div>
    );
  };
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `translateY(${(1 - k) * 60}px) rotate(${(1 - k) * -6}deg)` }}>
      <div style={{ width: PW, height: PH, borderRadius: 54, background: PALETTE.bg.night0, border: `10px solid ${PALETTE.mid.lavender}`, boxSizing: "border-box",
        position: "relative", overflow: "hidden", boxShadow: `0 30px 80px ${PALETTE.ui.shadow}` }}>
        <div style={{ position: "absolute", top: 18, left: "50%", width: 96, height: 26, marginLeft: -48, borderRadius: 13, background: PALETTE.ui.track }} />
        {content()}
      </div>
    </Place>
  );
};
