// Corte ilustrado (cutaway): durante 1–3 s, una ventana con una ilustración 2D (un objeto de clase plano) sobre la escena,
// como un B-roll dibujado. Entra con un pequeño zoom (no es un corte duro), la cámara empuja despacio dentro y, si se pide,
// reproduce una acción propia del plano. Cuenta en el máximo de insertos del video (validate_story.py).
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { heroDef } from "../heroes";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { CAM0, PIVOT, POSE0 } from "../flat/kit";
import { BaseProps, H, SLOTS, W, tok, useAnim } from "./common";

export type CutawayProps = BaseProps & { asset: string; pose?: string; act?: string; text?: string; hold?: number };
export const CUTAWAY_HOLD_DEFAULT = 60;
/** ventana: 920 px de ancho y 760 de alto, centrada en la zona de overlays */
const PW = 920, PH = 760;

export const Cutaway: React.FC<CutawayProps> = ({ dur, asset, pose, act, text, hold = CUTAWAY_HOLD_DEFAULT, color: c, slot = "center" }) => {
  const total = Math.min(dur, hold), { f, enter } = useAnim(total);
  if (f >= total) return null;
  const def = heroDef(asset), Comp = def.flat;
  if (!Comp) throw new Error(`Cutaway: ${asset} no es un objeto de clase plano`);
  const k = enter(0), col = tok(c, PALETTE.warm.gold);
  const out = interpolate(f, [total - 6, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const u = act ? { [act]: interpolate(f, [6, total * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) } : {};
  const cam = { ...CAM0, zoom: 1 + 0.08 * (f / total) };
  const cy = SLOTS[slot] * H, vh = (W * PH) / PW;
  return (
    <>
      <AbsoluteFill style={{ background: "rgba(5,8,20,0.6)", opacity: out * k }} />
      <div style={{ position: "absolute", left: (W - PW) / 2, top: cy - PH / 2, width: PW, height: PH, borderRadius: 34, overflow: "hidden",
        border: `4px solid ${col}`, boxShadow: `0 24px 70px rgba(0,0,0,0.55), 0 0 40px ${col}55`, opacity: out * k, transform: `scale(${0.86 + 0.14 * k})`, background: PALETTE.bg.night0 }}>
        <svg width={PW} height={PH} viewBox={`0 ${PIVOT[1] - vh / 2} ${W} ${vh}`} preserveAspectRatio="xMidYMid slice">
          <Comp t={f} tb={f} u={u} pose={pose ?? def.poses[0]} cam={cam} subject={POSE0} light="noche" />
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)" }} />
        {text ? (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 64,
            color: PALETTE.light.white, textShadow: `0 0 24px ${col}, 0 4px 14px rgba(0,0,0,0.7)` }}>{text}</div>
        ) : null}
      </div>
    </>
  );
};
