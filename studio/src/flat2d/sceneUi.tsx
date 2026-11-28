// Rótulos dentro de la escena (D129): van pegados a una capa y siguen a la cámara, al revés que los overlays del explainer (fijos en pantalla).
//   callout: flecha curva que se dibuja sola desde un rótulo en mayúsculas con borde oscuro hasta el detalle de la capa («LA OLA», «MURPH»).
//   bubble: globo de diálogo corto sobre la cabeza de un personaje («?», «¡Sí!», «Ni hablar.»).
// Se escriben como acciones del beat ({type: "callout" | "bubble", target, text, at, dur?, side?, point?}).
import React from "react";
import type { Cam } from "./camera";
import type { ActionT2 } from "./timeline";
import type { Layer2 } from "./schema";
import { layerBox } from "./director";
import { META } from "./assets/registry";
import { spring } from "./actions";
import { DISPLAY_FAMILY } from "../explainer/fonts";

export const SCENE_UI = ["callout", "bubble"];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const INK = "#141018";

type Props = { acts: ActionT2[]; layers: Layer2[]; cam: Cam; f: number; W: number; H: number; offset: (key: string) => { dx: number; dy: number } };

export const SceneUI: React.FC<Props> = ({ acts, layers, cam, f, W, H, offset }) => {
  const U = Math.min(W, H), live = acts.filter((a) => SCENE_UI.includes(a.spec.type) && f >= a.start && f < a.start + a.dur);
  if (!live.length) return null;
  const toScreen = (x: number, y: number, par: number): [number, number] => {
    const ze = 1 + (cam[2] - 1) * par, cx = 0.5 + (cam[0] - 0.5) * par, cy = 0.5 + (cam[1] - 0.5) * par;
    return [W / 2 + ze * (x - cx) * W, H / 2 + ze * (y - cy) * H];
  };
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {live.map((a) => {
        const s = a.spec as { type: string; target?: string; text?: string; side?: number; point?: [number, number]; color?: string };
        const ly = layers.find((l) => (l.id ?? l.asset) === s.target);
        const box = ly ? layerBox(ly, W / H) : null;
        if (!ly || !box) return null;
        const person = box.kind === "personaje", isBubble = s.type === "bubble";
        const [u, v] = s.point ?? (isBubble ? [0.5, person ? 0.1 : 0] : person ? [0.5, 0.24] : [0.5, 0.4]);
        const o = offset(s.target!), par = ly.par ?? META[ly.asset].par;
        const [px, py] = toScreen(box.x + u * box.w + o.dx / W, box.y + v * box.h + o.dy / H, par);
        const side = s.side ?? (px > W / 2 ? -1 : 1), age = f - a.start, out = clamp((a.start + a.dur - f) / 8, 0, 1);
        const text = String(s.text ?? "").toUpperCase();
        if (isBubble) {
          const fs = 0.042 * U, bw = Math.max(fs * 1.9, text.length * fs * 0.62 + fs * 1.3), bh = fs * 1.75;
          const bx = clamp(px + side * 0.06 * U, bw / 2 + 0.03 * W, W - bw / 2 - 0.03 * W), by = clamp(py - 0.11 * U, bh / 2 + 0.04 * H, H - bh), k = spring(clamp(age / 12, 0, 1));
          const tipX = px + side * 0.01 * U, tipY = py - 0.015 * U, bob = Math.sin(f * 0.18) * 0.004 * U;
          return (
            <g key={a.key} opacity={out} transform={`translate(${tipX} ${tipY}) scale(${0.25 + 0.75 * k}) translate(${-tipX} ${-tipY + bob})`}>
              <path d={`M${bx - fs * 0.35} ${by + bh / 2 - 2} L${tipX} ${tipY} L${bx + fs * 0.35} ${by + bh / 2 - 2} Z`} fill="#fff" stroke={INK} strokeWidth={0.005 * U} strokeLinejoin="round" />
              <rect x={bx - bw / 2} y={by - bh / 2} width={bw} height={bh} rx={bh / 2} fill="#fff" stroke={INK} strokeWidth={0.005 * U} />
              <rect x={bx - fs * 0.38} y={by + bh / 2 - 0.006 * U} width={fs * 0.76} height={0.009 * U} fill="#fff" />
              <text x={bx} y={by + fs * 0.36} textAnchor="middle" fontFamily={DISPLAY_FAMILY} fontWeight={800} fontSize={fs} fill={INK}>{text}</text>
            </g>
          );
        }
        // callout: rótulo arriba hacia el centro y flecha curva hasta el detalle
        const fs = 0.044 * U, tw = text.length * fs * 0.64;
        const lx = clamp(px + side * 0.3 * U, tw / 2 + 0.04 * W, W - tw / 2 - 0.04 * W), ly2 = clamp(py - 0.22 * U, fs + 0.06 * H, 0.8 * H);
        const sx = lx + (px < lx ? -1 : 1) * Math.min(tw * 0.25, 0.04 * U), sy = ly2 + fs * 0.45;
        const len = Math.hypot(px - sx, py - sy), ex = px - ((px - sx) / len) * 0.02 * U, ey = py - ((py - sy) / len) * 0.02 * U;
        const cxp = ex, cyp = sy + (ey - sy) * 0.15, draw = clamp((age - 3) / 11, 0, 1), k = spring(clamp(age / 12, 0, 1));
        const ang = Math.atan2(ey - cyp, ex - cxp), ah = 0.022 * U;
        const head = `M${ex} ${ey} L${ex - ah * Math.cos(ang - 0.5)} ${ey - ah * Math.sin(ang - 0.5)} M${ex} ${ey} L${ex - ah * Math.cos(ang + 0.5)} ${ey - ah * Math.sin(ang + 0.5)}`;
        const curve = `M${sx} ${sy} Q${cxp} ${cyp} ${ex} ${ey}`, col = s.color ?? "#FFE14A";
        return (
          <g key={a.key} opacity={out}>
            <path d={curve} stroke={INK} strokeWidth={0.013 * U} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
            <path d={curve} stroke="#fff" strokeWidth={0.0065 * U} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
            {draw >= 1 ? <><path d={head} stroke={INK} strokeWidth={0.013 * U} strokeLinecap="round" fill="none" /><path d={head} stroke="#fff" strokeWidth={0.0065 * U} strokeLinecap="round" fill="none" /></> : null}
            <text x={lx} y={ly2} textAnchor="middle" fontFamily={DISPLAY_FAMILY} fontWeight={800} fontSize={fs} letterSpacing={fs * 0.04} fill={col} stroke={INK} strokeWidth={fs * 0.2}
              paintOrder="stroke" strokeLinejoin="round" transform={`translate(${lx} ${ly2}) scale(${0.4 + 0.6 * k}) translate(${-lx} ${-ly2})`}>{text}</text>
          </g>
        );
      })}
    </svg>
  );
};
