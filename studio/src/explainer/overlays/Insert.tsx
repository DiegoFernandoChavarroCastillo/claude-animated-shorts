// Inserto (F18): un corte breve de 1–1,5 s sobre la escena con un icono y una frase o cifra grande; oscurece el fondo un momento y
// sale solo (`hold` frames), aunque el beat siga. Es el «B-roll» de datos: rompe el ritmo de un beat largo sin cambiar de objeto.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Label, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type InsertProps = BaseProps & { text: string; sub?: string; icon?: string; hold?: number };

export const INSERT_HOLD_DEFAULT = 36;

export const Insert: React.FC<InsertProps> = ({ dur, text, sub, icon = "star", hold = INSERT_HOLD_DEFAULT, color: c, slot = "center" }) => {
  const total = Math.min(dur, hold), { f, enter } = useAnim(total);
  if (f >= total) return null;
  const k = enter(0), col = tok(c, PALETTE.warm.gold);
  const out = interpolate(f, [total - 6, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = Math.min(150, Math.floor(820 / (Math.max(text.length, 4) * 0.62)));
  return (
    <>
      <AbsoluteFill style={{ background: "rgba(5,8,20,0.5)", opacity: out * k }} />
      <Place slot={slot} style={{ textAlign: "center", opacity: out * k, transform: `scale(${0.8 + 0.2 * k})` }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 150, height: 150, borderRadius: 999, border: `4px solid ${col}`, boxShadow: `0 0 36px ${col}`, background: PALETTE.ui.card }}>
          <Icon name={icon} size={84} color={col} stroke={2.6} />
        </div>
        <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: size, color: PALETTE.light.white, lineHeight: 1.05, whiteSpace: "nowrap", marginTop: 22, textShadow: `0 0 30px ${col}88` }}>{text}</div>
        {sub ? <Label col={col} style={{ marginTop: 14 }}>{sub}</Label> : null}
      </Place>
    </>
  );
};
