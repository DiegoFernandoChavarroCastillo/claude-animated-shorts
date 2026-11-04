// Diagramas de apoyo (F11, 2.ª tanda): brújula, Venn, pirámide, palabra grande, y los de tema: ECG, órbita, ecuación
// química, recta numérica, fuerzas, escala de profundidad, burbuja de pensamiento y cadena alimentaria.
import React from "react";
import { PALETTE, OVERLAY } from "../style";
import { DISPLAY_FAMILY } from "../fonts";
import { BaseProps, Body, Card, Label, Place, W, fmt, tok, useAnim } from "./common";
import { Icon } from "./icons";

const big = (txt: React.ReactNode, size = 120, c: string = PALETTE.light.white): React.ReactNode => (
  <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: size, color: c, lineHeight: 1, whiteSpace: "nowrap" }}>{txt}</div>
);

export type CompassProps = BaseProps & { deg: number; label?: string };

/** brújula con aguja que gira hasta `deg` (0 = norte, 90 = este) */
export const Compass: React.FC<CompassProps> = ({ dur, deg, label, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), a = deg * prog(4, 36) + 40 * (1 - prog(4, 36)) * Math.sin(prog(4, 36) * 12), col = tok(c, PALETTE.ui.red);
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.85 + 0.15 * k})` }}>
      <svg width={420} height={420} viewBox="0 0 420 420">
        <circle cx={210} cy={210} r={190} fill={PALETTE.ui.card} stroke={PALETTE.light.white} strokeWidth={12} />
        {Array.from({ length: 36 }, (_, i) => { const r = (i * 10 * Math.PI) / 180 - Math.PI / 2, l = i % 9 ? 12 : 26; return <line key={i} x1={210 + Math.cos(r) * 172} y1={210 + Math.sin(r) * 172} x2={210 + Math.cos(r) * (172 - l)} y2={210 + Math.sin(r) * (172 - l)} stroke={PALETTE.light.white} strokeWidth={i % 9 ? 2 : 5} opacity={0.7} />; })}
        {[["N", 210, 70], ["E", 350, 224], ["S", 210, 372], ["O", 70, 224]].map(([t, x, y]) => <text key={t as string} x={x as number} y={y as number} textAnchor="middle" fill={t === "N" ? col : PALETTE.light.white} fontSize={44} fontWeight={800} fontFamily={DISPLAY_FAMILY}>{t}</text>)}
        <g transform={`rotate(${a} 210 210)`}><polygon points="210,60 232,210 188,210" fill={col} /><polygon points="210,360 232,210 188,210" fill={PALETTE.light.white} opacity={0.85} /></g><circle cx={210} cy={210} r={13} fill={PALETTE.ui.card} stroke={PALETTE.light.white} strokeWidth={5} />
      </svg>
      {label ? <Label col={col} style={{ marginTop: 14 }}>{label}</Label> : null}
    </Place>
  );
};

export type VennProps = BaseProps & { a: string; b: string; both: string };

/** dos círculos que se cruzan: lo que es de A, lo que es de B y lo que comparten */
export const Venn: React.FC<VennProps> = ({ dur, a, b, both, slot = "center" }) => {
  const { enter, exit } = useAnim(dur);
  const ka = enter(0), kb = enter(2), kc = enter(4), A = PALETTE.ui.cyan, B = PALETTE.warm.sunset;
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ position: "relative", width: 700, height: 420 }}>
        <div style={{ position: "absolute", left: 20, top: 20, width: 380, height: 380, borderRadius: 190, background: `${A}33`, border: `6px solid ${A}`, opacity: ka, transform: `scale(${0.7 + 0.3 * ka})` }} />
        <div style={{ position: "absolute", left: 300, top: 20, width: 380, height: 380, borderRadius: 190, background: `${B}33`, border: `6px solid ${B}`, opacity: kb, transform: `scale(${0.7 + 0.3 * kb})` }} />
        <div style={{ position: "absolute", left: 90, top: 190, opacity: ka }}><Body size={44} weight={800}>{a}</Body></div>
        <div style={{ position: "absolute", right: 90, top: 190, opacity: kb }}><Body size={44} weight={800}>{b}</Body></div>
        <div style={{ position: "absolute", left: 350, top: 190, transform: "translateX(-50%)", opacity: kc }}><Body size={40} weight={800} col={PALETTE.warm.gold}>{both}</Body></div>
      </div>
    </Place>
  );
};

export type PyramidProps = BaseProps & { levels: string[] };

/** pirámide de 3–5 niveles (la cima primero): jerarquías, cadenas tróficas, necesidades */
export const Pyramid: React.FC<PyramidProps> = ({ dur, levels, color: c, slot = "center" }) => {
  const { enter, exit } = useAnim(dur);
  const n = Math.min(5, levels.length), col = tok(c, PALETTE.warm.gold), H = 100;
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ position: "relative", width: 700, height: H * n + 10 }}>
        {levels.slice(0, n).map((t, i) => {
          const k = enter((n - 1 - i) * 2), w0 = 120 + (i / n) * 560, w1 = 120 + ((i + 1) / n) * 560, cx = 350;
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: i * H, width: 700, height: H - 6, opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
              <svg width={700} height={H - 6} style={{ position: "absolute" }}><polygon points={`${cx - w0 / 2},0 ${cx + w0 / 2},0 ${cx + w1 / 2},${H - 6} ${cx - w1 / 2},${H - 6}`} fill={col} opacity={0.2 + 0.7 * (i / n)} stroke={col} strokeWidth={3} /></svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Body size={38} weight={800}>{t}</Body></div>
            </div>
          );
        })}
      </div>
    </Place>
  );
};

export type BigWordProps = BaseProps & { word: string; sub?: string };

/** una palabra enorme como sello (el concepto clave) con un subrayado que se traza */
export const BigWord: React.FC<BigWordProps> = ({ dur, word, sub, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.warm.gold), size = Math.min(210, Math.floor(760 / (word.length * 0.78)));   // el sello no debe pasar de ~760 px de ancho (antes se cortaba con 11 letras)
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center", transform: `scale(${0.7 + 0.3 * k}) rotate(${(1 - k) * -4}deg)` }}>
      <div style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: size, color: PALETTE.light.white, lineHeight: 1, whiteSpace: "nowrap", textShadow: `0 0 40px ${col}88`, letterSpacing: "0.02em" }}>{word}</div>
      <div style={{ height: 14, width: `${prog(6, 20) * 100}%`, margin: "10px auto 0", borderRadius: 7, background: col, boxShadow: `0 0 20px ${col}` }} />
      {sub ? <Label col={col} style={{ marginTop: 22 }}>{sub}</Label> : null}
    </Place>
  );
};

export type ECGProps = BaseProps & { bpm: number; label?: string };

/** electrocardiograma que avanza con el pulso y el número de pulsaciones por minuto */
export const ECG: React.FC<ECGProps> = ({ dur, bpm, label, lang = "es", color: c, slot = "center" }) => {
  const { f, enter, exit } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.ui.green), per = Math.max(14, (60 / bpm) * 30), Wd = 720, H = 220;
  const beat = (x0: number) => `${x0},110 ${x0 + 30},110 ${x0 + 44},96 ${x0 + 56},110 ${x0 + 78},110 ${x0 + 90},40 ${x0 + 104},190 ${x0 + 118},110 ${x0 + 150},110 ${x0 + 170},88 ${x0 + 192},110`;
  const sp = per * 7.5, off = -((f * 7.5) % sp), pts: string[] = []; for (let x = off - sp; x < Wd + sp; x += sp) pts.push(beat(x));
  const pulse = 1 + 0.12 * Math.max(0, 1 - ((f % per) / per) * 4);
  return (
    <Place slot={slot} style={{ opacity: exit * k }}>
      <Card style={{ width: Wd + 60, padding: "30px 30px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          {label ? <Label col={col}>{label}</Label> : <span />}
          <div style={{ display: "flex", alignItems: "center", gap: 16, transform: `scale(${pulse})` }}><Icon name="heart" size={64} color={PALETTE.ui.red} stroke={2.4} />{big(<>{fmt(bpm, lang)}<span style={{ fontSize: 34 }}> BPM</span></>, 76)}</div>
        </div>
        <svg width={Wd} height={H} viewBox={`0 0 ${Wd} ${H}`} style={{ overflow: "hidden" }}>
          {[1, 2, 3].map((g) => <line key={g} x1={0} x2={Wd} y1={g * 55} y2={g * 55} stroke={PALETTE.ui.track} strokeWidth={2} />)}
          <polyline points={pts.join(" ")} fill="none" stroke={col} strokeWidth={6} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
        </svg>
      </Card>
    </Place>
  );
};

export type OrbitDiagramProps = BaseProps & { center: string; orbiter: string; period?: string };

/** una órbita elíptica con un cuerpo que gira alrededor de otro y el periodo debajo */
export const OrbitDiagram: React.FC<OrbitDiagramProps> = ({ dur, center, orbiter, period, color: c, slot = "center" }) => {
  const { f, enter, exit } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.ui.cyan), a = f * 0.05, x = 360 + Math.cos(a) * 270, y = 190 + Math.sin(a) * 120;
  return (
    <Place slot={slot} style={{ opacity: exit * k, textAlign: "center" }}>
      <svg width={720} height={400} viewBox="0 0 720 400">
        <ellipse cx={360} cy={190} rx={270} ry={120} fill="none" stroke={col} strokeWidth={4} strokeDasharray="14 12" opacity={0.7} />
        <circle cx={360} cy={190} r={50} fill={PALETTE.warm.gold} style={{ filter: `drop-shadow(0 0 30px ${PALETTE.warm.gold})` }} />
        <circle cx={x} cy={y} r={22} fill={col} style={{ filter: `drop-shadow(0 0 14px ${col})` }} />
        <text x={360} y={198} textAnchor="middle" fill={PALETTE.bg.night0} fontSize={26} fontWeight={800} fontFamily={DISPLAY_FAMILY}>{center}</text>
        <text x={x} y={y - 36} textAnchor="middle" fill={PALETTE.light.white} fontSize={34} fontWeight={800} fontFamily={DISPLAY_FAMILY}>{orbiter}</text>
      </svg>
      {period ? <Label col={col}>{period}</Label> : null}
    </Place>
  );
};

export type ReactionEqProps = BaseProps & { parts: string[] };

/** ecuación química en fichas: reactivos en cian, "+" y "→" y producto en dorado (el último). Ej.: ["H₂", "+", "O₂", "→", "H₂O"] */
export const ReactionEq: React.FC<ReactionEqProps> = ({ dur, parts, slot = "center" }) => {
  const { enter, exit } = useAnim(dur);
  const arrowAt = parts.indexOf("→");
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "nowrap" }}>
        {parts.slice(0, 7).map((t, i) => {
          const k = enter(i * 1.6), sym = t === "+" || t === "→", prod = arrowAt >= 0 && i > arrowAt, col = prod ? PALETTE.warm.gold : PALETTE.ui.cyan;
          return sym ? <div key={i} style={{ fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 60, color: PALETTE.light.white, opacity: k }}>{t}</div> :
            <div key={i} style={{ padding: "14px 22px", borderRadius: OVERLAY.radius, border: `5px solid ${col}`, background: PALETTE.ui.card, fontFamily: DISPLAY_FAMILY, fontWeight: 800, fontSize: 60, color: PALETTE.light.white, boxShadow: `0 0 26px ${col}66`, opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>{t}</div>;
        })}
      </div>
    </Place>
  );
};

export type NumberLineProps = BaseProps & { min: number; max: number; value: number; marks?: { v: number; label: string }[]; label?: string };

/** recta numérica con marcas rotuladas y un marcador que se mueve hasta `value` */
export const NumberLine: React.FC<NumberLineProps> = ({ dur, min, max, value, marks = [], label, lang = "es", color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.warm.gold), pos = (v: number) => ((v - min) / (max - min)) * 720, x = pos(value) * prog(6, 30);
  return (
    <Place slot={slot} style={{ opacity: exit * k }}>
      <div style={{ position: "relative", width: 720, height: 250 }}>
        <div style={{ position: "absolute", left: 0, top: 120, width: 720, height: 8, borderRadius: 4, background: PALETTE.light.white, opacity: 0.8 }} />
        {[min, ...marks.map((m) => m.v), max].map((v, i) => <div key={i} style={{ position: "absolute", left: pos(v) - 2, top: 100, width: 4, height: 48, background: PALETTE.light.white, opacity: 0.8 }} />)}
        <div style={{ position: "absolute", left: 0, top: 160 }}><Label size={28}>{fmt(min, lang)}</Label></div><div style={{ position: "absolute", right: 0, top: 160 }}><Label size={28}>{fmt(max, lang)}</Label></div>
        {marks.map((m, i) => <div key={i} style={{ position: "absolute", left: pos(m.v), top: 160, transform: "translateX(-50%)" }}><Label size={26}>{m.label}</Label></div>)}
        <div style={{ position: "absolute", left: x, top: 60, transform: "translateX(-50%)", textAlign: "center" }}><div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: `34px solid ${col}`, filter: `drop-shadow(0 0 10px ${col})`, marginTop: 28 }} /><div style={{ position: "absolute", top: -34, left: "50%", transform: "translateX(-50%)" }}>{big(fmt(value * prog(6, 30), lang, value % 1 ? 1 : 0), 64, col)}</div></div>
        {label ? <div style={{ position: "absolute", left: 0, top: 210, width: 720, textAlign: "center" }}><Label col={col}>{label}</Label></div> : null}
      </div>
    </Place>
  );
};

export type ForceArrowsProps = BaseProps & { arrows: { label: string; dir: "up" | "down" | "left" | "right"; size?: number }[]; center?: string };

/** flechas de fuerza alrededor de un cuerpo central: cada una con su nombre (peso, empuje, rozamiento…) */
export const ForceArrows: React.FC<ForceArrowsProps> = ({ dur, arrows, center = "", slot = "center" }) => {
  const { enter, exit } = useAnim(dur);
  const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const, cols = [PALETTE.ui.cyan, PALETTE.ui.red, PALETTE.warm.gold, PALETTE.ui.green];
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <svg width={720} height={560} viewBox="0 0 720 560" style={{ overflow: "visible" }}>
        <rect x={290} y={220} width={140} height={120} rx={24} fill={PALETTE.ui.card} stroke={PALETTE.light.white} strokeWidth={6} />
        <text x={360} y={292} textAnchor="middle" fill="#fff" fontSize={34} fontWeight={800} fontFamily={DISPLAY_FAMILY}>{center}</text>
        {arrows.slice(0, 4).map((a, i) => {
          const k = enter(i * 3), [dx, dy] = D[a.dir], L = (a.size ?? 1) * 170 * k, sx = 360 + dx * 80 * (dx ? 1 : 0) + dx * 0, sy = 280 + dy * 70, ex = sx + dx * L, ey = sy + dy * L, col = cols[i % 4], nx = -dy, ny = dx, h = 26;
          return (
            <g key={i} opacity={k} style={{ filter: `drop-shadow(0 0 10px ${col})` }}>
              <line x1={sx} y1={sy} x2={ex - dx * 8} y2={ey - dy * 8} stroke={col} strokeWidth={14} strokeLinecap="round" />
              <polygon points={`${ex + dx * 10},${ey + dy * 10} ${ex - dx * 20 + nx * h},${ey - dy * 20 + ny * h} ${ex - dx * 20 - nx * h},${ey - dy * 20 - ny * h}`} fill={col} />
              <text x={ex + dx * 20 + (dx ? dx * 10 : 0)} y={ey + dy * 20 + (dy ? dy * 18 : 12)} textAnchor={dx > 0 ? "start" : dx < 0 ? "end" : "middle"} fill="#fff" fontSize={36} fontWeight={800} fontFamily={DISPLAY_FAMILY}>{a.label}</text>
            </g>
          );
        })}
      </svg>
    </Place>
  );
};

export type DepthScaleProps = BaseProps & { top: string; bottom: string; marks: { at: number; label: string }[]; marker?: number };

/** regla vertical de profundidad o altura (0 arriba, 1 abajo) con marcas rotuladas y un marcador que desciende */
export const DepthScale: React.FC<DepthScaleProps> = ({ dur, top, bottom, marks, marker, color: c, slot = "center" }) => {
  const { enter, exit, prog } = useAnim(dur);
  const k = enter(0), col = tok(c, PALETTE.ui.cyan), H = 560, m = (marker ?? 0) * prog(6, 36);
  return (
    <Place slot={slot} style={{ opacity: exit * k }}>
      <div style={{ position: "relative", width: 640, height: H + 90 }}>
        <div style={{ position: "absolute", left: 300, top: 50, width: 40, height: H, borderRadius: 20, background: `linear-gradient(180deg, ${PALETTE.ui.cyan}, #1b3a8a, #0a0a20)`, border: `4px solid ${PALETTE.light.white}` }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 640, textAlign: "center" }}><Label size={30}>{top}</Label></div><div style={{ position: "absolute", left: 0, top: H + 58, width: 640, textAlign: "center" }}><Label size={30}>{bottom}</Label></div>
        {marks.map((mk, i) => <div key={i} style={{ position: "absolute", left: 360, top: 50 + mk.at * H - 22, display: "flex", alignItems: "center", gap: 14, opacity: enter(i * 2) }}><div style={{ width: 40, height: 4, background: PALETTE.light.white }} /><Body size={34} weight={700}>{mk.label}</Body></div>)}
        {marker !== undefined ? <div style={{ position: "absolute", left: 270, top: 50 + m * H - 20, width: 100, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 34, height: 34, borderRadius: 17, background: col, border: "5px solid #fff", boxShadow: `0 0 18px ${col}` }} /></div> : null}
      </div>
    </Place>
  );
};

export type ThoughtBubbleProps = BaseProps & { text: string; icon?: string };

/** burbuja de pensamiento con nubes pequeñas que suben a la cabeza: lo que alguien piensa o recuerda */
export const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ dur, text, icon, color: c, slot = "top" }) => {
  const { f, enter, exit } = useAnim(dur);
  const k = enter(0), k2 = enter(3), col = tok(c, PALETTE.light.white), bob = 6 * Math.sin(f / 12);
  return (
    <Place slot={slot} style={{ opacity: exit, textAlign: "center" }}>
      <div style={{ transform: `translateY(${bob}px)` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 24, padding: "30px 54px", borderRadius: 100, background: PALETTE.ui.card, border: `5px solid ${col}`, boxShadow: `0 0 30px ${col}44`, opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>
          {icon ? <Icon name={icon} size={72} color={PALETTE.ui.cyan} /> : null}<Body size={50} weight={800}>{text}</Body>
        </div>
        <div style={{ marginTop: 10, opacity: k2 }}><div style={{ width: 36, height: 36, borderRadius: 18, background: PALETTE.ui.card, border: `4px solid ${col}`, margin: "0 0 0 40px", display: "inline-block" }} /><div style={{ width: 22, height: 22, borderRadius: 11, background: PALETTE.ui.card, border: `4px solid ${col}`, margin: "0 0 0 -4px", display: "inline-block", transform: "translateY(26px)" }} /></div>
      </div>
    </Place>
  );
};

export type FoodChainProps = BaseProps & { nodes: { label: string; icon?: string }[] };

/** cadena alimentaria: 3–4 fichas cuadradas unidas por flechas "es comido por" (Sol → planta → insecto → ave) */
export const FoodChain: React.FC<FoodChainProps> = ({ dur, nodes, color: c, slot = "center" }) => {
  const { enter, exit } = useAnim(dur);
  const n = Math.min(4, nodes.length), col = tok(c, PALETTE.ui.green), gap = n > 3 ? 190 : 250;
  return (
    <Place slot={slot} style={{ opacity: exit }}>
      <div style={{ position: "relative", width: gap * (n - 1) + 150, height: 250 }}>
        {nodes.slice(0, n).map((nd, i) => {
          const k = enter(i * 3);
          return (
            <React.Fragment key={i}>
              {i < n - 1 ? <svg width={gap - 150} height={60} style={{ position: "absolute", left: i * gap + 150, top: 45, opacity: enter(i * 3 + 2) }}><line x1={8} y1={30} x2={gap - 150 - 28} y2={30} stroke={col} strokeWidth={8} strokeLinecap="round" /><polygon points={`${gap - 150 - 6},30 ${gap - 150 - 32},14 ${gap - 150 - 32},46`} fill={col} /></svg> : null}
              <div style={{ position: "absolute", left: i * gap, top: 0, width: 150, textAlign: "center", opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>
                <div style={{ width: 150, height: 130, borderRadius: 30, background: PALETTE.ui.card, border: `5px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px ${col}55` }}><Icon name={nd.icon ?? "leaf"} size={76} color={PALETTE.light.white} /></div>
                <Body size={32} weight={800} style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>{nd.label}</Body>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Place>
  );
};

