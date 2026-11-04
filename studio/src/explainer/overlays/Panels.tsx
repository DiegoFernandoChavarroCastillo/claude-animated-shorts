// Paneles de apoyo colocados en la zona de overlays (no anclados): línea de tiempo, termómetro, comparación A/B,
// lista, pasos, ecuación, escala de tamaños, tendencia y aviso. Mismo contrato que el resto: entrada con spring,
// salida de 6 frames, colores solo de style.ts.
import React from "react";
import { PALETTE, OVERLAY } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Body, Card, Label, Place, fmt, tok, useAnim } from "./common";
import { Icon } from "./icons";

export type TimelineProps = BaseProps & { events: { label: string; time?: string }[] };

/** línea con 2–5 hitos que se encienden en orden; las etiquetas alternan arriba y abajo */
export const Timeline: React.FC<TimelineProps> = ({ dur, events, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.cyan), n = Math.min(5, events.length), w = 700, line = prog(0, 10 + n * 7);
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ position: "relative", width: w, height: 300 }}>
        <div style={{ position: "absolute", left: 0, top: 148, width: w, height: 8, borderRadius: 4, background: PALETTE.ui.track }} />
        <div style={{ position: "absolute", left: 0, top: 148, width: w * line, height: 8, borderRadius: 4, background: col, boxShadow: `0 0 14px ${col}` }} />
        {events.slice(0, n).map((e, i) => {
          const x = n === 1 ? w / 2 : (i / (n - 1)) * w, up = i % 2 === 0, k = enter(2 + i * 2.5), lit = line >= (n === 1 ? 0 : i / (n - 1)) - 0.001;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: 0, width: 0, opacity: k }}>
              <div style={{ position: "absolute", left: -18, top: 134, width: 36, height: 36, borderRadius: 18, background: lit ? col : PALETTE.ui.card, border: `5px solid ${col}`, boxShadow: lit ? `0 0 18px ${col}` : "none" }} />
              <div style={{ position: "absolute", left: 0, top: up ? 20 : 190, transform: "translateX(-50%)", textAlign: "center" }}>
                {e.time ? <Label size={26} col={col}>{e.time}</Label> : null}
                <Body size={32} weight={700}>{e.label}</Body>
              </div>
            </div>
          );
        })}
      </div>
    </Place>
  );
};

export type ThermometerProps = BaseProps & { value: number; min?: number; max?: number; unit?: string; label?: string; decimals?: number };

/** termómetro vertical: el mercurio sube hasta `value` (azul frío -> rojo caliente) con el número al lado */
export const Thermometer: React.FC<ThermometerProps> = ({ dur, value, min = 0, max = 100, unit = " °C", label, decimals = 0, lang = "es", color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const u = Math.max(0, Math.min(1, (value - min) / (max - min))), p = prog(4, 28), k = enter(0);
  const hot = u > 0.5 ? PALETTE.ui.red : PALETTE.ui.cyan, col = tok(c, hot), h = 420;
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.85 + 0.15 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
        <div style={{ position: "relative", width: 90, height: h + 90 }}>
          <div style={{ position: "absolute", left: 25, top: 0, width: 40, height: h, borderRadius: 20, background: PALETTE.ui.card, border: `4px solid ${PALETTE.ui.cardBorder}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 40, height: h * (0.08 + 0.92 * u * p), background: col, boxShadow: `0 0 18px ${col}` }} />
          </div>
          <div style={{ position: "absolute", left: 0, top: h - 20, width: 90, height: 90, borderRadius: 45, background: col, boxShadow: `0 0 26px ${col}` }} />
        </div>
        <div>
          <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 130, color: PALETTE.light.white, lineHeight: 1, whiteSpace: "nowrap" }}>{fmt(value * p, lang, decimals)}<span style={{ fontSize: 64 }}>{unit}</span></div>
          {label ? <Label col={col} style={{ marginTop: 14 }}>{label}</Label> : null}
        </div>
      </div>
    </Place>
  );
};

type Side = { title: string; icon?: string; sub?: string; color?: string };
export type VersusCardProps = BaseProps & { a: Side; b: Side };

/** dos tarjetas enfrentadas con un VS en medio: comparar dos cosas, antes/después, mito/realidad */
export const VersusCard: React.FC<VersusCardProps> = ({ dur, a, b, slot = "center" }) => {
  const { enter, exit } = useAnim(dur);
  const card = (s: Side, i: number, dflt: string) => {
    const k = enter(i * 2), col = tok(s.color, dflt);
    return (
      <Card style={{ width: 300, textAlign: "center", border: `4px solid ${col}`, opacity: k, transform: `translateX(${(1 - k) * (i ? 60 : -60)}px)`, boxShadow: `0 0 28px ${col}55` }}>
        {s.icon ? <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Icon name={s.icon} size={96} color={col} /></div> : null}
        <Body size={42} weight={800} style={{ display: "flex", justifyContent: "center" }}>{s.title}</Body>
        {s.sub ? <Body size={30} col={PALETTE.ui.muted} style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>{s.sub}</Body> : null}
      </Card>
    );
  };
  const kv = enter(3);
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {card(a, 0, PALETTE.ui.cyan)}
        <div style={{ width: 90, height: 90, borderRadius: 45, margin: "0 -22px", zIndex: 2, background: PALETTE.ui.card, border: `4px solid ${PALETTE.light.white}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${kv})` }}>
          <Label size={34} col={PALETTE.light.white} style={{ letterSpacing: 0 }}>VS</Label>
        </div>
        {card(b, 1, PALETTE.warm.sunset)}
      </div>
    </Place>
  );
};

export type ChecklistProps = BaseProps & { items: string[]; crossed?: boolean };

/** 2–4 filas que se marcan en orden (✓, o ✗ con `crossed`): requisitos, mitos descartados, lo que sí/no pasa */
export const Checklist: React.FC<ChecklistProps> = ({ dur, items, crossed = false, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, crossed ? PALETTE.ui.red : PALETTE.ui.green);
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <Card style={{ width: 720 }}>
        {items.slice(0, 4).map((t, i) => {
          const k = enter(i * 2.5), m = prog(6 + i * 9, 14 + i * 9);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: "16px 0", opacity: k, transform: `translateX(${(1 - k) * 40}px)` }}>
              <div style={{ width: 70, height: 70, borderRadius: 18, border: `4px solid ${m > 0.5 ? col : PALETTE.ui.track}`, background: m > 0.5 ? `${col}22` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <div style={{ opacity: m, transform: `scale(${0.5 + 0.5 * m})` }}>
                  {crossed ? <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth={3.2} strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg> : <Icon name="check" size={46} color={col} stroke={3} />}
                </div>
              </div>
              <Body size={42} weight={700}>{t}</Body>
            </div>
          );
        })}
      </Card>
    </Place>
  );
};

export type StepsProps = BaseProps & { steps: { title: string; sub?: string }[] };

/** pasos numerados 1-2-3 en vertical unidos por una línea: un proceso con orden */
export const Steps: React.FC<StepsProps> = ({ dur, steps, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.warm.gold), n = Math.min(4, steps.length), row = 150;
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ position: "relative", width: 700, height: row * (n - 1) + 100 }}>
        <div style={{ position: "absolute", left: 47, top: 50, width: 6, height: row * (n - 1) * prog(2, 8 + n * 8), background: col, borderRadius: 3, boxShadow: `0 0 12px ${col}` }} />
        {steps.slice(0, n).map((s, i) => {
          const k = enter(i * 3);
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: i * row, display: "flex", alignItems: "center", gap: 30, opacity: k, transform: `translateX(${(1 - k) * 40}px)` }}>
              <div style={{ width: 100, height: 100, borderRadius: 50, boxSizing: "border-box", border: `5px solid ${col}`, background: PALETTE.ui.card, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 22px ${col}66` }}>
                <span style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 56, color: PALETTE.light.white }}>{i + 1}</span>
              </div>
              <div>
                <Body size={44} weight={800}>{s.title}</Body>
                {s.sub ? <Body size={30} col={PALETTE.ui.muted} weight={500}>{s.sub}</Body> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Place>
  );
};

export type EquationProps = BaseProps & { text: string; note?: string };

/** fórmula corta en grande ("E = m × c²", "v = d / t") con una nota debajo */
export const Equation: React.FC<EquationProps> = ({ dur, text, note, color: c, slot = "center" }) => {
  const { enter, exit } = useAnim(dur);
  const col = tok(c, PALETTE.warm.gold), k = enter(0), size = text.length > 12 ? 78 : 104;
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.85 + 0.15 * k})` }}>
      <Card style={{ textAlign: "center", border: `3px solid ${col}`, boxShadow: `0 0 32px ${col}55`, padding: "40px 56px" }}>
        <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: size, color: PALETTE.light.white, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{text}</div>
        {note ? <Label size={30} col={col} style={{ marginTop: 18 }}>{note}</Label> : null}
      </Card>
    </Place>
  );
};

export type ScaleBarProps = BaseProps & { from: string; to: string; pos: number; label?: string };

/** escala de tamaños/cantidades de un extremo (`from`) al otro (`to`); el marcador cae en `pos` (0..1) */
export const ScaleBar: React.FC<ScaleBarProps> = ({ dur, from, to, pos, label, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const col = tok(c, PALETTE.ui.cyan), k = enter(0), x = Math.max(0, Math.min(1, pos)) * 700 * prog(6, 26);
  return (
    <Place slot={slot} style={{ opacity: exit * k }}>
      <div style={{ position: "relative", width: 700, height: 200 }}>
        <div style={{ position: "absolute", left: 0, top: 96, width: 700, height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${PALETTE.ui.track}, ${col})` }} />
        {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ position: "absolute", left: (i / 7) * 700 - 2, top: 84, width: 4, height: 36, borderRadius: 2, background: PALETTE.ui.muted }} />)}
        <div style={{ position: "absolute", left: x - 22, top: 80, width: 44, height: 44, borderRadius: 22, background: col, border: `5px solid ${PALETTE.light.white}`, boxShadow: `0 0 22px ${col}` }} />
        {label ? <div style={{ position: "absolute", left: x, top: 8, transform: "translateX(-50%)" }}><Body size={40} weight={800}>{label}</Body></div> : null}
        <div style={{ position: "absolute", left: 0, top: 138 }}><Label size={28}>{from}</Label></div>
        <div style={{ position: "absolute", right: 0, top: 138 }}><Label size={28}>{to}</Label></div>
      </div>
    </Place>
  );
};

export type TrendArrowProps = BaseProps & { dir?: "up" | "down"; value?: string; label?: string };

/** flecha grande de subida o bajada con un valor ("+12 %") y una etiqueta */
export const TrendArrow: React.FC<TrendArrowProps> = ({ dur, dir = "up", value, label, color: c, slot = "center" }) => {
  const { f, enter, exit } = useAnim(dur);
  const up = dir === "up", col = tok(c, up ? PALETTE.ui.green : PALETTE.ui.red), k = enter(0), bob = 10 * Math.sin(f / 6) * (up ? -1 : 1);
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.8 + 0.2 * k})` }}>
      <svg width={220} height={260} viewBox="0 0 220 260" style={{ transform: `translateY(${bob}px)`, filter: `drop-shadow(0 0 22px ${col})` }}>
        <g transform={up ? "" : "translate(220 260) rotate(180)"}>
          <polygon points="110,10 210,120 140,120 140,250 80,250 80,120 10,120" fill={col} />
        </g>
      </svg>
      {value ? <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 120, color: PALETTE.light.white, lineHeight: 1, whiteSpace: "nowrap" }}>{value}</div> : null}
      {label ? <Label col={col} style={{ marginTop: 14 }}>{label}</Label> : null}
    </Place>
  );
};

export type WarningTagProps = BaseProps & { text: string; icon?: string };

/** aviso con triángulo: peligro, error común, "ojo con esto" */
export const WarningTag: React.FC<WarningTagProps> = ({ dur, text, icon = "warning", color: c, slot = "top" }) => {
  const { enter, exit } = useAnim(dur);
  const col = tok(c, PALETTE.warm.gold), k = enter(0);
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.85 + 0.15 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "20px 40px 20px 28px", borderRadius: OVERLAY.radius, background: PALETTE.ui.card, border: `4px solid ${col}`, boxShadow: `0 0 28px ${col}66` }}>
        <Icon name={icon} size={84} color={col} stroke={1.8} />
        <Body size={44} weight={800}>{text}</Body>
      </div>
    </Place>
  );
};
