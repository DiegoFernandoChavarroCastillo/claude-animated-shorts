// Guías que apuntan a una parte del objeto 3D (proyección mundo -> pantalla, como PulseRings y Callout3D): flecha,
// resalte, lupa y flecha de recorrido entre dos anclas. Nunca se dibujan dentro de la banda de subtítulos.
import React from "react";
import { PALETTE } from "../style";
import { BaseProps, Body, H, W, ZONE_BOTTOM, ZONE_TOP, clampToZone, tok, useAnim } from "./common";
import type { Pt } from "./common";
import { Icon } from "./icons";

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const;
type Side = keyof typeof DIRS;
const full: React.CSSProperties = { position: "absolute", left: 0, top: 0 };
const glow = (col: string, r = 10) => ({ filter: `drop-shadow(0 0 ${r}px ${col})` });

export type Arrow3DProps = BaseProps & { from?: Side; text?: string; len?: number };

/** flecha que llega al punto desde un lado (`from`) y late hacia él */
export const Arrow3D: React.FC<Arrow3DProps> = ({ dur, point = [W / 2, 0.57 * H], from = "up", text, len = 230, color: c }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.cyan), [dx, dy] = DIRS[from], [x, y] = clampToZone(point, 80);
  const k = enter(0), bob = 12 * Math.sin(f / 5), L = len * prog(0, 12);
  const tipX = x + dx * (46 + bob), tipY = y + dy * (46 + bob);
  const tailX = tipX + dx * L, tailY = tipY + dy * L, a = 26, nx = -dy, ny = dx; // normal al eje
  const head = `${tipX},${tipY} ${tipX + dx * a * 1.6 + nx * a},${tipY + dy * a * 1.6 + ny * a} ${tipX + dx * a * 1.6 - nx * a},${tipY + dy * a * 1.6 - ny * a}`;
  return (
    <div style={{ ...full, width: W, height: H, opacity: exit * k }}>
      <svg width={W} height={H} style={{ ...full, ...glow(col) }}>
        <line x1={tipX + dx * a * 1.4} y1={tipY + dy * a * 1.4} x2={tailX} y2={tailY} stroke={col} strokeWidth={14} strokeLinecap="round" />
        <polygon points={head} fill={col} />
      </svg>
      {text ? <div style={{ position: "absolute", left: Math.max(20, Math.min(W - 20, tailX + dx * 40)), top: Math.max(ZONE_TOP, Math.min(ZONE_BOTTOM, tailY + dy * 40)), transform: "translate(-50%, -50%)" }}>
        <Body size={44} weight={800} style={{ textShadow: `0 2px 12px ${PALETTE.ui.shadow}` }}>{text}</Body>
      </div> : null}
    </div>
  );
};

export type HighlightProps = BaseProps & { shape?: "circle" | "box"; r?: number };

/** aro o marco con esquinas que late alrededor de una parte del objeto */
export const Highlight: React.FC<HighlightProps> = ({ dur, point = [W / 2, 0.57 * H], shape = "circle", r = 120, color: c }) => {
  const { f, enter, exit } = useAnim(dur);
  const col = tok(c, PALETTE.ui.green), [x, y] = clampToZone(point, r + 10), k = enter(0), pulse = 1 + 0.05 * Math.sin(f / 4), R = r * pulse * (0.6 + 0.4 * k);
  return (
    <svg width={W} height={H} style={{ ...full, opacity: exit * k, ...glow(col, 14) }}>
      {shape === "circle" ? (
        <>
          <circle cx={x} cy={y} r={R} fill="none" stroke={col} strokeWidth={8} strokeDasharray="34 22" strokeDashoffset={-f * 2} />
          <circle cx={x} cy={y} r={R * 0.82} fill={col} opacity={0.1} />
        </>
      ) : (
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => {
          const cx = x + sx * R, cy = y + sy * R * 0.8, s = R * 0.4;
          return <polyline key={i} points={`${cx - sx * s},${cy} ${cx},${cy} ${cx},${cy - sy * s * 0.8}`} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />;
        })
      )}
    </svg>
  );
};

export type ZoomLensProps = BaseProps & { icon?: string; text?: string; side?: "left" | "right" };

/** lupa que sale del punto: "esto, visto de cerca" con un icono y una palabra dentro */
export const ZoomLens: React.FC<ZoomLensProps> = ({ dur, point = [W / 2, 0.57 * H], icon = "eye", text, side, color: c }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.cyan), [x, y] = clampToZone(point, 40), k = enter(0), R = 150;
  const dir = side ? (side === "right" ? 1 : -1) : x < W / 2 ? 1 : -1;
  const cx = Math.max(R + 20, Math.min(W - R - 20, x + dir * 250)), cy = Math.max(ZONE_TOP + R + 20, Math.min(ZONE_BOTTOM - R - 80, y - 210)), p = prog(2, 14);
  return (
    <div style={{ ...full, width: W, height: H, opacity: exit }}>
      <svg width={W} height={H} style={{ ...full, ...glow(col, 8) }}>
        <circle cx={x} cy={y} r={14 * k} fill={col} />
        <line x1={x} y1={y} x2={x + (cx - x) * p} y2={y + (cy - y) * p} stroke={col} strokeWidth={5} strokeDasharray="14 10" strokeDashoffset={-f} />
        <circle cx={cx} cy={cy} r={R * k} fill={PALETTE.ui.card} stroke={col} strokeWidth={12} />
        <path d={`M ${cx - R * 0.62} ${cy - R * 0.2} A ${R * 0.66} ${R * 0.66} 0 0 1 ${cx - R * 0.1} ${cy - R * 0.66}`} stroke="#fff" strokeOpacity={0.5} strokeWidth={9} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * k})`, opacity: k, textAlign: "center" }}>
        <Icon name={icon} size={110} color={col} stroke={1.7} />
      </div>
      {text ? <div style={{ position: "absolute", left: cx, top: cy + R + 44, transform: "translate(-50%, -50%)", opacity: k }}><Body size={42} weight={800}>{text}</Body></div> : null}
    </div>
  );
};

export type FlowArrowProps = BaseProps & { point2?: Pt; text?: string; bend?: number };

/** flecha curva con rayas que avanzan de un ancla (`anchor`) a otra (`to`): recorrido, entrada, transporte */
export const FlowArrow: React.FC<FlowArrowProps> = ({ dur, point = [W * 0.3, 0.6 * H], point2 = [W * 0.7, 0.5 * H], text, bend = 0.3, color: c }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.cyan), [x1, y1] = clampToZone(point, 30), [x2, y2] = clampToZone(point2, 30), k = enter(0), p = prog(0, 18);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const at = (t: number): Pt => [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2];
  const pts = Array.from({ length: 31 }, (_, i) => at((i / 30) * p)), tip = at(p), prev = at(Math.max(0, p - 0.03)), ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const h = 34, hx = (s: number) => `${tip[0] - Math.cos(ang + s) * h},${tip[1] - Math.sin(ang + s) * h}`;
  return (
    <svg width={W} height={H} style={{ ...full, opacity: exit * k, ...glow(col) }}>
      <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round" strokeDasharray="30 20" strokeDashoffset={-f * 3} />
      <polygon points={`${tip[0]},${tip[1]} ${hx(0.5)} ${hx(-0.5)}`} fill={col} opacity={p > 0.9 ? 1 : 0} />
      {text ? <foreignObject x={mx - 200} y={my - 30} width={400} height={60}><div style={{ textAlign: "center" }}><Body size={40} weight={800}>{text}</Body></div></foreignObject> : null}
    </svg>
  );
};
