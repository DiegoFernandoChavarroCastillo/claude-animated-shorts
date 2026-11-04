// Medidores y gráficas (F11, 2.ª tanda): velocímetro, batería, anillo de progreso, cuenta atrás, cronómetro, escala de
// color, cuadrícula de puntos y gráfica de línea. Cada uno dibuja con SVG sobre el lienzo de 1080 x 1920 y cuenta
// desde 0 al entrar, igual que StatCallout.
import React from "react";
import { PALETTE } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Body, Card, Label, Place, fmt, tok, useAnim } from "./common";

const big = (txt: React.ReactNode, size = 120, c: string = PALETTE.light.white): React.ReactNode => (
  <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: size, color: c, lineHeight: 1, whiteSpace: "nowrap" }}>{txt}</div>
);
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`; };

export type SpeedometerProps = BaseProps & { value: number; max?: number; unit?: string; label?: string; decimals?: number };

/** velocímetro de aguja: la aguja barre de 0 a `value` y el número cuenta con ella */
export const Speedometer: React.FC<SpeedometerProps> = ({ dur, value, max = 100, unit = " km/h", label, decimals = 0, lang = "es", color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), p = prog(4, 34), u = Math.max(0, Math.min(1, value / max)), a = 150 + 240 * u * p, col = tok(c, PALETTE.ui.cyan);
  const segs = [[0, 0.6, PALETTE.ui.green], [0.6, 0.85, PALETTE.warm.gold], [0.85, 1, PALETTE.ui.red]] as const;
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.85 + 0.15 * k})` }}>
      <svg width={520} height={420} viewBox="0 0 520 420">
        <path d={arc(260, 240, 200, 150, 390)} stroke={PALETTE.ui.track} strokeWidth={34} fill="none" strokeLinecap="round" />
        {segs.map(([s, e, cc], i) => <path key={i} d={arc(260, 240, 200, 150 + 240 * s, 150 + 240 * e)} stroke={cc} strokeWidth={34} fill="none" opacity={0.9} strokeLinecap="butt" />)}
        {Array.from({ length: 11 }, (_, i) => { const d = 150 + 24 * i, [x0, y0] = polar(260, 240, 160, d), [x1, y1] = polar(260, 240, 176, d); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={PALETTE.light.white} strokeWidth={4} opacity={0.7} />; })}
        <g transform={`rotate(${a} 260 240)`}><polygon points="260,232 450,240 260,248" fill={col} style={{ filter: `drop-shadow(0 0 10px ${col})` }} /></g>
        <circle cx={260} cy={240} r={20} fill={PALETTE.ui.card} stroke={col} strokeWidth={6} />
      </svg>
      <div style={{ marginTop: -70 }}>{big(<>{fmt(value * p, lang, decimals)}<span style={{ fontSize: 52 }}>{unit}</span></>, 110)}</div>
      {label ? <Label col={col} style={{ marginTop: 14 }}>{label}</Label> : null}
    </Place>
  );
};

export type BatteryLevelProps = BaseProps & { value: number; label?: string };

/** batería que se llena (o se vacía) hasta `value` (0..1); el color pasa de rojo a verde según el nivel */
export const BatteryLevel: React.FC<BatteryLevelProps> = ({ dur, value, label, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), p = prog(4, 30), v = Math.max(0, Math.min(1, value)), col = tok(c, v < 0.2 ? PALETTE.ui.red : v < 0.5 ? PALETTE.warm.gold : PALETTE.ui.green);
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.85 + 0.15 * k})` }}>
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <div style={{ width: 420, height: 190, borderRadius: 34, border: `10px solid ${PALETTE.light.white}`, padding: 12, boxSizing: "border-box", background: PALETTE.ui.card }}>
          <div style={{ width: `${v * p * 100}%`, height: "100%", borderRadius: 18, background: col, boxShadow: `0 0 28px ${col}` }} />
        </div>
        <div style={{ width: 26, height: 80, borderRadius: "0 14px 14px 0", background: PALETTE.light.white }} />
      </div>
      <div style={{ marginTop: 24 }}>{big(`${Math.round(v * 100 * p)} %`, 110)}</div>
      {label ? <Label col={col} style={{ marginTop: 12 }}>{label}</Label> : null}
    </Place>
  );
};

export type ProgressRingProps = BaseProps & { value: number; label?: string; suffix?: string };

/** anillo de progreso con el porcentaje en el centro */
export const ProgressRing: React.FC<ProgressRingProps> = ({ dur, value, label, suffix = " %", color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), p = prog(4, 34), v = Math.max(0, Math.min(1, value)), col = tok(c, PALETTE.ui.cyan), R = 170, C = 2 * Math.PI * R;
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.85 + 0.15 * k})` }}>
      <div style={{ position: "relative", width: 420, height: 420, margin: "0 auto" }}>
        <svg width={420} height={420} viewBox="0 0 420 420" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={210} cy={210} r={R} stroke={PALETTE.ui.track} strokeWidth={40} fill="none" />
          <circle cx={210} cy={210} r={R} stroke={col} strokeWidth={40} fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v * p)} style={{ filter: `drop-shadow(0 0 14px ${col})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{big(<>{Math.round(v * 100 * p)}<span style={{ fontSize: 56 }}>{suffix}</span></>, 130)}</div>
      </div>
      {label ? <Label col={col} style={{ marginTop: 16 }}>{label}</Label> : null}
    </Place>
  );
};

export type CountdownProps = BaseProps & { from: number; unit?: string; label?: string };

/** cuenta atrás: el número baja de `from` a 0 mientras un anillo se vacía */
export const Countdown: React.FC<CountdownProps> = ({ dur, from, unit = "", label, color: c, slot = "center" }) => {
  const { f, enter, exit } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.ui.red), t = Math.min(1, Math.max(0, (f - 6) / Math.max(20, dur - 20))), n = Math.ceil(from * (1 - t)), R = 160, C = 2 * Math.PI * R;
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.85 + 0.15 * k + 0.04 * Math.max(0, 1 - ((f - 6) % 30) / 6)})` }}>
      <div style={{ position: "relative", width: 400, height: 400, margin: "0 auto" }}>
        <svg width={400} height={400} viewBox="0 0 400 400" style={{ transform: "rotate(-90deg)" }}><circle cx={200} cy={200} r={R} stroke={PALETTE.ui.track} strokeWidth={26} fill="none" /><circle cx={200} cy={200} r={R} stroke={col} strokeWidth={26} fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * t} style={{ filter: `drop-shadow(0 0 12px ${col})` }} /></svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{big(<>{n}<span style={{ fontSize: 50 }}>{unit}</span></>, 190)}</div>
      </div>
      {label ? <Label col={col} style={{ marginTop: 16 }}>{label}</Label> : null}
    </Place>
  );
};

export type StopwatchProps = BaseProps & { seconds: number; label?: string };

/** cronómetro con aguja: marca de 0 a `seconds` (s) con décimas */
export const Stopwatch: React.FC<StopwatchProps> = ({ dur, seconds, label, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), p = prog(4, 40), t = seconds * p, col = tok(c, PALETTE.warm.gold), a = (t % 60) * 6 - 90;
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.85 + 0.15 * k})` }}>
      <svg width={400} height={440} viewBox="0 0 400 440">
        <rect x={170} y={4} width={60} height={34} rx={10} fill={PALETTE.light.white} /><rect x={188} y={36} width={24} height={26} fill={PALETTE.light.white} />
        <circle cx={200} cy={250} r={170} fill={PALETTE.ui.card} stroke={PALETTE.light.white} strokeWidth={12} />
        {Array.from({ length: 60 }, (_, i) => { const [x0, y0] = polar(200, 250, i % 5 ? 150 : 138, i * 6 - 90), [x1, y1] = polar(200, 250, 160, i * 6 - 90); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={PALETTE.light.white} strokeWidth={i % 5 ? 2 : 5} opacity={0.7} />; })}
        <g transform={`rotate(${a + 90} 200 250)`}><line x1={200} y1={270} x2={200} y2={110} stroke={col} strokeWidth={9} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${col})` }} /></g><circle cx={200} cy={250} r={14} fill={col} />
      </svg>
      <div style={{ marginTop: 8 }}>{big(<>{t.toFixed(1)}<span style={{ fontSize: 50 }}> s</span></>, 100)}</div>
      {label ? <Label col={col} style={{ marginTop: 12 }}>{label}</Label> : null}
    </Place>
  );
};

export type ColorScaleProps = BaseProps & { from: string; to: string; pos: number; label?: string; colors?: string[] };

/** barra de degradado (frío → caliente por defecto) con un marcador en `pos` (0..1) y los extremos rotulados */
export const ColorScale: React.FC<ColorScaleProps> = ({ dur, from, to, pos, label, colors = ["#4a78e8", "#3ddc84", "#ffd24a", "#ff5a5f"], slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), x = Math.max(0, Math.min(1, pos)) * 720 * prog(6, 28);
  return (
    <Place slot={slot} style={{ opacity: exit * k }}>
      <div style={{ position: "relative", width: 720, height: 230 }}>
        <div style={{ position: "absolute", left: 0, top: 90, width: 720, height: 44, borderRadius: 22, background: `linear-gradient(90deg, ${colors.join(", ")})`, boxShadow: "0 0 24px rgba(255,255,255,0.15)" }} />
        <div style={{ position: "absolute", left: x - 8, top: 70, width: 16, height: 84, borderRadius: 8, background: PALETTE.light.white, boxShadow: "0 0 16px #fff" }} />
        {label ? <div style={{ position: "absolute", left: x, top: 0, transform: "translateX(-50%)" }}><Body size={44} weight={800}>{label}</Body></div> : null}
        <div style={{ position: "absolute", left: 0, top: 160 }}><Label size={30}>{from}</Label></div><div style={{ position: "absolute", right: 0, top: 160 }}><Label size={30}>{to}</Label></div>
      </div>
    </Place>
  );
};

export type DotGridProps = BaseProps & { filled: number; total?: number; label?: string };

/** cuadrícula de 100 puntos con `filled` iluminados: "1 de cada 10", proporciones fáciles de ver */
export const DotGrid: React.FC<DotGridProps> = ({ dur, filled, total = 100, label, color: c, slot = "center" }) => {
  const { f, enter, exit } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.warm.gold), n = Math.min(total, 100), cols = 10, shown = Math.min(filled, Math.floor(Math.max(0, f - 6) * 1.6));
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 54px)`, gap: 12, justifyContent: "center" }}>
        {Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 54, height: 54, borderRadius: 27, background: i < shown ? col : PALETTE.ui.track, boxShadow: i < shown ? `0 0 14px ${col}` : "none", transform: `scale(${i === shown - 1 ? 1.25 : 1})` }} />)}
      </div>
      <div style={{ marginTop: 26 }}>{big(<>{shown}<span style={{ fontSize: 56 }}> / {n}</span></>, 110, col)}</div>
      {label ? <Label style={{ marginTop: 10 }}>{label}</Label> : null}
    </Place>
  );
};

export type LineChartProps = BaseProps & { points: number[]; labels?: string[]; unit?: string; label?: string };

/** gráfica de línea animada de 3–8 puntos con área bajo la curva y el último valor destacado */
export const LineChart: React.FC<LineChartProps> = ({ dur, points, labels, unit = "", label, lang = "es", color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), p = prog(4, 36), col = tok(c, PALETTE.ui.cyan), n = Math.min(8, points.length), W = 700, H = 360, lo = Math.min(...points), hi = Math.max(...points), span = hi - lo || 1;
  const xy = points.slice(0, n).map((v, i): [number, number] => [(i / (n - 1)) * W, H - 30 - ((v - lo) / span) * (H - 90)]);
  const shown = Math.max(1, p * (n - 1)), seg = Math.floor(shown), fr = shown - seg;
  const pts = xy.slice(0, seg + 1).concat(seg < n - 1 ? [[xy[seg][0] + (xy[seg + 1][0] - xy[seg][0]) * fr, xy[seg][1] + (xy[seg + 1][1] - xy[seg][1]) * fr] as [number, number]] : []);
  const line = pts.map(([x, y]) => `${x},${y}`).join(" "), last = pts[pts.length - 1];
  return (
    <Place slot={slot} style={{ opacity: exit * k }}>
      <Card style={{ width: W + 80, padding: "36px 40px" }}>
        {label ? <Label style={{ marginBottom: 12 }}>{label}</Label> : null}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={W} y1={H - 30 - g * (H - 90)} y2={H - 30 - g * (H - 90)} stroke={PALETTE.ui.track} strokeWidth={2} />)}
          <polygon points={`0,${H - 30} ${line} ${last[0]},${H - 30}`} fill={col} opacity={0.15} />
          <polyline points={line} fill="none" stroke={col} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${col})` }} />
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 13 : 8} fill={i === pts.length - 1 ? PALETTE.light.white : col} />)}
          {labels ? labels.slice(0, n).map((l, i) => <text key={i} x={xy[i][0]} y={H + 4} textAnchor="middle" fill={PALETTE.ui.muted} fontSize={28} fontFamily={DISPLAY_FAMILY}>{l}</text>) : null}
        </svg>
        <div style={{ textAlign: "right", marginTop: 18 }}>{big(<>{fmt(points[Math.min(n - 1, seg)] ?? 0, lang, points.some((v) => v % 1) ? 1 : 0)}<span style={{ fontSize: 46 }}>{unit}</span></>, 90, col)}</div>
      </Card>
    </Place>
  );
};
