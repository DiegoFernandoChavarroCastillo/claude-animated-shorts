// Compositor del motor 2D plano: capas SVG con parallax y cámara 2D, luz local y viñeta; encima, los overlays y los subtítulos del explainer
// (se reutilizan tal cual). Todo sale de story.json (engine "2d") + words.json.
import React, { useMemo } from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, HookTitle, hookEndFrame } from "../explainer/captions/Caption";
import { CAPTION } from "../explainer/style";
import pacingViral from "../../../templates/pacing_viral.json";
import { OverlayLayer } from "../explainer/overlays/OverlayLayer";
import type { Timeline } from "../explainer/timeline";
import { type Layer2, Props2Schema, type Props2 } from "./schema";
import { buildTimeline2D, layersAt, type Timeline2 } from "./timeline";
import { camAt, ease } from "./camera";
import { layerFx, sceneFx } from "./actions";
import { type Pal, lerpPal, palette } from "./palette";
import { ASSETS, META } from "./assets/registry";
import { LookCtx, flicker, hash } from "./assets/common";
import { SCENE_GLOW, type Theme, lerpSky, skyOf, themeOf } from "./look";

const parse = (p: Props2) => Props2Schema.parse(p);
const W = 1080, H = 1920;

export const calcFlat2DMetadata: CalculateMetadataFunction<Props2> = ({ props }) => {
  const { story, words } = parse(props);
  return { durationInFrames: buildTimeline2D(story, words, 30).total, fps: 30, width: W, height: H };
};

/** copias de una capa con `repeat` (D123): rejilla en filas que se alejan (cada fila más pequeña y más arriba), con desorden determinista */
const instances = (ly: Layer2, k: number) => {
  const r = ly.repeat;
  if (!r) return [{ i: 0, ox: 0, oy: 0, s: 1, delay: 0 }];
  const cols = r.cols ?? Math.ceil(Math.sqrt(r.n * 1.6)), rows = Math.ceil(r.n / cols), dx = r.dx ?? 0.12, dy = r.dy ?? 0.035, jit = r.jitter ?? 0.3, dep = r.depth ?? 0.9;
  const out = [...Array(r.n)].map((_, i) => {
    const row = Math.floor(i / cols), col = i % cols, s = dep ** row, n = Math.min(cols, r.n - row * cols);
    return { i, ox: ((col - (n - 1) / 2) * dx + (hash(i * 3.1 + k) - 0.5) * dx * jit + (row % 2 ? dx * 0.25 : 0)) * s, oy: -row * dy * (0.6 + 0.4 * s) + (hash(i * 5.3 + k) - 0.5) * dy * jit,
      s, delay: Math.round(i * (r.stagger ?? 0) + hash(i * 7.7 + k) * (r.stagger ?? 0)) };
  });
  return out.sort((x, y) => x.s - y.s);   // las del fondo primero
};

const SceneView: React.FC<{ tl: Timeline2; i: number; f: number; alpha: number; swipe: number | null; theme: Theme | null }> = ({ tl, i, f, alpha, swipe, theme }) => {
  const bt = tl.beats[i], sc = bt.beat.scene, acts = tl.actions.filter((a) => a.beat === i);
  const fxS = sceneFx(acts, f), cam = camAt(bt, f, !!theme), flick = flicker(f);
  const pal: Pal = fxS.shift ? lerpPal(palette(sc.palette), palette(fxS.shift.to), fxS.shift.u) : palette(sc.palette);
  const layers = [...sc.layers].map((ly, k) => ({ ly, k })).sort((a, b) => (a.ly.z ?? 0) - (b.ly.z ?? 0) || a.k - b.k);
  const slideY = swipe === null ? 0 : (1 - ease(swipe)) * H * 0.55;
  const g = SCENE_GLOW[sc.light], glow = g ? g.a + g.flick * flick : 0, glowAt = g?.at ?? "50% 0%";
  const sky0 = skyOf(sc.palette, palette(sc.palette)), sky = fxS.shift ? lerpSky(sky0, skyOf(fxS.shift.to, palette(fxS.shift.to)), fxS.shift.u) : sky0;
  const camT = (par: number) => { const ze = 1 + (cam[2] - 1) * par, cx = 0.5 + (cam[0] - 0.5) * par, cy = 0.5 + (cam[1] - 0.5) * par; return `translate(${W / 2}px, ${H / 2}px) scale(${ze}) translate(${-cx * W}px, ${-cy * H}px)`; };
  return (
    <AbsoluteFill style={{ opacity: alpha, background: theme ? `linear-gradient(to bottom, ${sky[0]} 0%, ${sky[1]} 48%, ${sky[2]} 78%, ${sky[2]} 100%)` : pal.bg,
      transform: `translate(${fxS.shakeX}px, ${fxS.shakeY + slideY}px)`, filter: theme ? `saturate(${theme.sat}) contrast(${theme.contrast})` : undefined }}>
      {layers.map(({ ly, k }) => {
        const m = META[ly.asset], Asset = ASSETS[ly.asset];
        const key = ly.id ?? ly.asset;
        const scale = ly.scale ?? (m.kind === "fondo" || m.kind === "ambiente" ? 1.25 : 1), par = ly.par ?? m.par;
        const w = scale * W, h = w * m.aspect, at = ly.at ?? m.anchor;
        // con tema, lo muy lejano y lo que pasa por delante se desenfocan un poco: el sujeto queda nítido (profundidad de campo)
        const blur = ly.blur ?? (theme && m.kind !== "ambiente" ? (par <= 0.25 ? 3 : par >= 1.25 ? 5 : 0) : 0);
        return (
          <div key={k} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: camT(par), filter: blur ? `blur(${blur}px)` : undefined }}>
            {instances(ly, k).map((ins) => {
              const fx = layerFx(key, acts, f - ins.delay, W, H, !!theme);
              fx.p = { ...((ly as { init?: Record<string, number> }).init ?? {}), ...fx.p };   // estado inicial de las acciones propias (p. ej. ya de pie)
              const iw = w * ins.s, ih = h * ins.s;
              const left = (at[0] + ins.ox) * W - m.anchor[0] * iw + fx.dx, top = (at[1] + ins.oy) * H - m.anchor[1] * ih + fx.dy;
              return (
                <svg key={ins.i} width={iw} height={ih} viewBox={`0 0 100 ${100 * m.aspect}`} style={{ position: "absolute", left, top, overflow: "visible", opacity: (ly.opacity ?? 1) * fx.opacity,
                  transformOrigin: `${m.anchor[0] * 100}% ${m.anchor[1] * 100}%`, transform: `rotate(${fx.rot}deg) scale(${fx.scale * fx.sx}, ${fx.scale * fx.sy})` }}>
                  <g transform={ly.flip ? `translate(100 0) scale(-1 1)` : undefined}>
                    <Asset t={f} tb={f - bt.a} p={fx.p} params={fx.params} pal={pal} light={sc.light} flick={flick} seed={k + ins.i * 17} opts={ly.opts} />
                  </g>
                </svg>
              );
            })}
          </div>
        );
      })}
      {(sc.lights ?? []).length ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: camT(1), mixBlendMode: "screen" }}>
          {(sc.lights ?? []).map((l, j) => { const r = l.r * W, a = (l.a ?? 0.6) * (l.flicker ? 0.72 + 0.28 * flicker(f + j * 37) : 1), c = l.color ?? pal.glow;
            return <div key={j} style={{ position: "absolute", left: l.at[0] * W - r, top: l.at[1] * H - r, width: 2 * r, height: 2 * r, opacity: a, background: `radial-gradient(circle, ${c} 0%, ${c}88 22%, transparent 68%)` }} />; })}
        </div>
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${glowAt}, ${pal.glow} 0%, transparent ${g?.r ?? "62%"})`, opacity: glow, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: theme ? `linear-gradient(to bottom, rgba(0,0,0,${theme.veil}) 0%, transparent 24%)` : "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.22) 22%, transparent 36%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(0,0,0,${theme ? theme.vignette : 0.45}) 100%)` }} />
      {fxS.flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: fxS.flash }} /> : null}
    </AbsoluteFill>
  );
};

/** ruido de película (D123): grano fino que cambia cada frame sobre toda la imagen. Quita el aspecto de vector limpio sin ensuciar
 *  (las motas de `Grain` parecían polvo) y hace que un plano lento sobre colores lisos no parezca una imagen parada. Se calcula a
 *  media resolución y se amplía: cuesta la cuarta parte. */
const FilmNoise: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.16, pointerEvents: "none" }}>
    <svg width={W / 2} height={H / 2} style={{ transform: "scale(2)", transformOrigin: "0 0" }}>
      <filter id="fn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 97} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#fn)" />
    </svg>
  </AbsoluteFill>
);

/** perfil `meta.pacing: "viral"`: subtítulos grandes de 1–3 palabras en la franja baja-central, con la palabra clave en amarillo y un contorno
 *  oscuro que los hace legibles sobre fondos y ropas claras (pergamino, arena, mantos blancos; D118) */
const captionCfg = (viral: boolean, themed = false): typeof CAPTION => {
  if (!viral) return CAPTION;
  const c = pacingViral.captions;
  return { ...CAPTION, centerYK: c.centerYK, fontSizeK: c.fontSizeK, minWords: c.minWords, maxWords: c.maxWords, accentColor: c.accentColor, shadow: c.shadow, punchAll: themed } as typeof CAPTION;
};

export const Flat2D: React.FC<Props2> = (props) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { story, words } = useMemo(() => parse(props), [props]);
  const tl = useMemo(() => buildTimeline2D(story, words, fps), [story, words, fps]);
  const layers = layersAt(tl, f);
  const hookF = useMemo(() => hookEndFrame(words, story.beats[0].id, fps), [words, story, fps]);
  const theme = themeOf(story.meta.theme);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookCtx.Provider value={{ themed: !!theme }}>
        {layers.map((l, k) => <SceneView key={k ? "over" : "base"} tl={tl} i={l.beat} f={f} alpha={l.alpha} swipe={l.swipe} theme={theme} />)}
      </LookCtx.Provider>
      {theme ? <FilmNoise f={f} /> : null}
      {/* los overlays no anclados del explainer solo necesitan la lista de overlays de la línea de tiempo */}
      <OverlayLayer tl={tl as unknown as Timeline} words={words} lang={story.meta.lang} />
      {story.meta.hookTitle ? <HookTitle text={story.meta.hookTitle} endF={hookF} accent={story.beats[0].keyword ?? story.beats[0].keywords?.[0]} cap={captionCfg(story.meta.pacing === "viral", !!theme)} /> : null}
      <Captions words={words} keywords={tl.keywords} cap={captionCfg(story.meta.pacing === "viral", !!theme)} fromF={story.meta.hookTitle ? hookF : 0} />
    </AbsoluteFill>
  );
};
