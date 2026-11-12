// Overlays de la fórmula de retención de las historias (D123): datos que se ven (`Calendar`, `Equivalence`) y el CTA animado del cierre
// `remate_cta` (`ChatMock`, `ShareCTA`). Interfaces genéricas: sin logos ni pantallas de marcas reales.
import React from "react";
import { PALETTE } from "../style";
import { CAPTION_FAMILY, DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Label, Place, tok, useAnim } from "./common";
import { Icon } from "./icons";

const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** hoja de calendario: las hojas pasan deprisa hasta el día pedido (el salto en el tiempo, «el 7 de diciembre») */
export type CalendarProps = BaseProps & { month: string; day: number; from?: number; year?: string };
export const Calendar: React.FC<CalendarProps> = ({ dur, month, day, from, year, color: c, slot = "upper" }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const k = enter(0), start = from ?? Math.max(1, day - 6), u = prog(4, 26), cur = Math.round(start + (day - start) * u), flip = u < 1 ? (f % 4) / 4 : 0, col = tok(c, PALETTE.ui.red);
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `scale(${0.7 + 0.3 * k}) rotate(${(1 - k) * -8}deg)` }}>
      <div style={{ width: 380, borderRadius: 36, overflow: "hidden", background: PALETTE.light.white, boxShadow: `0 26px 60px ${PALETTE.ui.shadow}` }}>
        <div style={{ background: col, padding: "20px 0 16px", textAlign: "center", fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 52, letterSpacing: 2, color: PALETTE.light.white, textTransform: "uppercase" }}>{month}</div>
        <div style={{ height: 290, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 230, lineHeight: 1, color: PALETTE.bg.night1,
          transform: `perspective(600px) rotateX(${-flip * 55}deg)`, transformOrigin: "50% 0%", opacity: 1 - flip * 0.5 }}>{cur}</div>
        {year ? <div style={{ textAlign: "center", paddingBottom: 18, marginTop: -14, fontFamily: DISPLAY_FAMILY, fontWeight: 700, fontSize: 44, color: PALETTE.mid.violet }}>{year}</div> : null}
      </div>
    </Place>
  );
};

/** equivalencia: una cantidad convertida en cosas que se pueden contar («11.000 kg = 2 elefantes»); los iconos entran uno a uno */
export type EquivalenceProps = BaseProps & { count: number; icon: string; label: string; text?: string };
export const Equivalence: React.FC<EquivalenceProps> = ({ dur, count, icon, label, text, color: c, slot = "upper" }) => {
  const { enter, exit } = useAnim(dur);
  const n = Math.max(1, Math.min(12, Math.round(count))), size = n <= 3 ? 190 : n <= 6 ? 130 : 96, col = tok(c, PALETTE.warm.gold), kl = enter(n + 1);
  return (
    <Place slot={slot} style={{ opacity: exit, textAlign: "center" }}>
      <div style={{ position: "absolute", inset: "-22% -10%", zIndex: -1, background: "radial-gradient(ellipse at center, rgba(5,6,20,0.78) 0%, rgba(5,6,20,0.5) 48%, rgba(5,6,20,0) 74%)" }} />
      {text ? <Label style={{ marginBottom: 14, opacity: enter(0) }}>{text}</Label> : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, maxWidth: 780 }}>
        {[...Array(n)].map((_, i) => { const k = enter(i + 1); return <div key={i} style={{ transform: `scale(${k}) translateY(${(1 - k) * 30}px)`, opacity: clamp01(k * 2) }}><Icon name={icon} size={size} color={col} stroke={2.4} /></div>; })}
      </div>
      <div style={{ marginTop: 16, fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: label.length > 12 ? 58 : 76, color: PALETTE.light.white, opacity: kl, transform: `scale(${0.8 + 0.2 * kl})`, whiteSpace: "nowrap" }}>= {label}</div>
    </Place>
  );
};

/** chat que se escribe solo: burbujas que suben una a una, con «escribiendo…» antes de cada mensaje propio (CTA: «escribe GRUPO») */
export type ChatMockProps = BaseProps & { messages: { from?: "yo" | "otro"; text: string }[]; title?: string };
export const ChatMock: React.FC<ChatMockProps> = ({ dur, messages, title, color: c, slot = "upper" }) => {
  const { f, enter, exit } = useAnim(dur);
  const k = enter(0), step = Math.max(14, Math.floor((dur - 16) / Math.max(1, messages.length))), col = tok(c, PALETTE.ui.green);
  return (
    <Place slot={slot} style={{ opacity: exit * k, transform: `translateY(${(1 - k) * 60}px)` }}>
      <div style={{ width: 720, borderRadius: 44, padding: "26px 30px 30px", background: PALETTE.ui.card, border: `2px solid ${PALETTE.ui.cardBorder}`, boxShadow: `0 26px 70px ${PALETTE.ui.shadow}` }}>
        {title ? <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}><div style={{ width: 66, height: 66, borderRadius: 33, background: col }} />
          <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 700, fontSize: 44, color: PALETTE.light.white }}>{title}</div></div> : null}
        {messages.map((m, i) => {
          const t0 = 6 + i * step, me = (m.from ?? "yo") === "yo", typing = me && f >= t0 && f < t0 + step * 0.45, shown = f >= t0 + (me ? step * 0.45 : 0);
          if (f < t0) return null;
          const a = clamp01((f - t0 - (me ? step * 0.45 : 0)) / 5), chars = me ? Math.ceil(clamp01((f - t0) / (step * 0.45)) * m.text.length) : m.text.length;
          return (
            <div key={i} style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", marginTop: 14 }}>
              <div style={{ maxWidth: 560, padding: "16px 26px", borderRadius: 30, background: me ? col : PALETTE.bg.indigo, opacity: typing ? 0.75 : shown ? 1 : 0, transform: `scale(${typing ? 0.96 : 0.9 + 0.1 * a})`,
                fontFamily: CAPTION_FAMILY, fontWeight: 700, fontSize: 46, color: me ? PALETTE.bg.night0 : PALETTE.light.white }}>{typing ? m.text.slice(0, chars) + "▏" : m.text}</div>
            </div>
          );
        })}
      </div>
    </Place>
  );
};

/** CTA de compartir: avatares que se van uniendo, botones Seguir y Compartir, un cursor que pulsa y confeti. Va sobre la escena del remate */
export type ShareCTAProps = BaseProps & { text: string; follow?: string; share?: string; avatars?: number };
export const ShareCTA: React.FC<ShareCTAProps> = ({ dur, text, follow = "Seguir", share = "Compartir", avatars = 5, color: c, slot = "upper" }) => {
  const { f, enter, exit, prog } = useAnim(dur);
  const k = enter(0), n = Math.max(2, Math.min(7, avatars)), col = tok(c, PALETTE.ui.red), tap = Math.min(dur - 14, 34), press = f >= tap && f < tap + 6 ? 0.92 : 1, done = f >= tap + 3, cu = prog(12, tap);
  const tones = [PALETTE.warm.sunset, PALETTE.ui.cyan, PALETTE.warm.gold, PALETTE.ui.green, PALETTE.mid.lavender, PALETTE.warm.rose, PALETTE.ui.selection];
  return (
    <Place slot={slot} style={{ opacity: exit, textAlign: "center" }}>
      <div style={{ position: "absolute", inset: "-26% -8%", zIndex: -1, opacity: k, background: "radial-gradient(ellipse at center, rgba(5,6,20,0.82) 0%, rgba(5,6,20,0.55) 50%, rgba(5,6,20,0) 76%)" }} />
      {done ? [...Array(26)].map((_, i) => { const u = clamp01((f - tap - 3) / 30), a = hash(i) * 6.283, r = u * (260 + 320 * hash(i + 9));
        return <div key={i} style={{ position: "absolute", left: "50%", top: "62%", width: 18, height: 10, borderRadius: 3, background: tones[i % tones.length], opacity: 1 - u,
          transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r * 0.8 + u * u * 240}px) rotate(${u * 600 * (hash(i + 3) - 0.5)}deg)` }} />; }) : null}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        {[...Array(n)].map((_, i) => { const ka = enter(i + 1); return (
          <div key={i} style={{ width: 104, height: 104, borderRadius: 52, marginLeft: i ? -22 : 0, background: tones[i % tones.length], border: `5px solid ${PALETTE.light.white}`, transform: `scale(${ka})`, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 30, top: 18, width: 34, height: 34, borderRadius: 17, background: PALETTE.light.cream }} /><div style={{ position: "absolute", left: 12, top: 58, width: 70, height: 60, borderRadius: 35, background: PALETTE.light.cream }} />
          </div>); })}
      </div>
      <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 60, lineHeight: 1.12, color: PALETTE.light.white, maxWidth: 820, opacity: enter(2), textShadow: `0 4px 24px ${PALETTE.ui.shadow}` }}>{text}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 26 }}>
        <div style={{ padding: "18px 44px", borderRadius: 60, background: done ? PALETTE.ui.green : col, transform: `scale(${enter(4) * press})`, fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 48, color: PALETTE.light.white, whiteSpace: "nowrap" }}>{done ? "✓ " : ""}{follow}</div>
        <div style={{ padding: "18px 44px", borderRadius: 60, background: PALETTE.ui.card, border: `3px solid ${PALETTE.light.white}`, transform: `scale(${enter(5)})`, display: "flex", alignItems: "center", gap: 12, fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 48, color: PALETTE.light.white }}>
          <Icon name="arrow" size={44} color={PALETTE.light.white} stroke={3} />{share}</div>
      </div>
      <div style={{ position: "absolute", left: `${78 - cu * 46}%`, top: `${128 - cu * 38}%`, opacity: enter(3), transform: `scale(${press})` }}>
        <svg width={70} height={84} viewBox="0 0 24 28"><path d="M3 2 L3 21 L8.5 16.5 L12.5 25.5 L16 24 L12 15.5 L19 15.5 Z" fill={PALETTE.light.white} stroke={PALETTE.bg.night0} strokeWidth={1.6} strokeLinejoin="round" /></svg>
      </div>
    </Place>
  );
};
