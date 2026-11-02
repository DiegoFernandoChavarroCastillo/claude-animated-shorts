// Icono tachado dentro de un círculo (R3: "no ve directamente").
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Label, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type NoSymbolProps = BaseProps & { icon?: string; label?: string };

export const NoSymbol: React.FC<NoSymbolProps> = ({ dur, icon = "eye", label, color: c, slot = "lower" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.red), k = enter(0), slash = prog(8, 18), s = 300;
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.8 + 0.2 * k})` }}>
      <svg width={s} height={s} viewBox="0 0 300 300">
        <circle cx={150} cy={150} r={130} fill={PALETTE.ui.card} stroke={col} strokeWidth={14} />
        <foreignObject x={70} y={70} width={160} height={160}><Icon name={icon} size={160} color={PALETTE.light.white} stroke={1.6} /></foreignObject>
        <line x1={58} y1={58} x2={58 + 184 * slash} y2={58 + 184 * slash} stroke={col} strokeWidth={16} strokeLinecap="round" />
      </svg>
      {label ? <Label size={40} col={PALETTE.light.white} style={{ marginTop: 12 }}>{label}</Label> : null}
    </Place>
  );
};
