// Compositor del motor 2D plano: capas SVG con parallax y cámara 2D, luz local y viñeta; encima, los overlays y los subtítulos del explainer
// (se reutilizan tal cual). Todo sale de story.json (engine "2d") + words.json.
import React, { useMemo } from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions } from "../explainer/captions/Caption";
import { CAPTION } from "../explainer/style";
import pacingViral from "../../../templates/pacing_viral.json";
import { OverlayLayer } from "../explainer/overlays/OverlayLayer";
import type { Timeline } from "../explainer/timeline";
import { Props2Schema, type Props2 } from "./schema";
import { buildTimeline2D, layersAt, type Timeline2 } from "./timeline";
import { camAt, ease } from "./camera";
import { layerFx, sceneFx } from "./actions";
import { type Pal, lerpPal, palette } from "./palette";
import { ASSETS, META } from "./assets/registry";
import { flicker } from "./assets/common";

const parse = (p: Props2) => Props2Schema.parse(p);
const W = 1080, H = 1920;

export const calcFlat2DMetadata: CalculateMetadataFunction<Props2> = ({ props }) => {
  const { story, words } = parse(props);
  return { durationInFrames: buildTimeline2D(story, words, 30).total, fps: 30, width: W, height: H };
};

const SceneView: React.FC<{ tl: Timeline2; i: number; f: number; alpha: number; swipe: number | null }> = ({ tl, i, f, alpha, swipe }) => {
  const bt = tl.beats[i], sc = bt.beat.scene, acts = tl.actions.filter((a) => a.beat === i);
  const fxS = sceneFx(acts, f), cam = camAt(bt, f), flick = flicker(f);
  const pal: Pal = fxS.shift ? lerpPal(palette(sc.palette), palette(fxS.shift.to), fxS.shift.u) : palette(sc.palette);
  const layers = [...sc.layers].map((ly, k) => ({ ly, k })).sort((a, b) => (a.ly.z ?? 0) - (b.ly.z ?? 0) || a.k - b.k);
  const slideY = swipe === null ? 0 : (1 - ease(swipe)) * H * 0.55;
  const glow = sc.light === "fuego" ? 0.18 + 0.14 * flick : sc.light === "sol" ? 0.2 : sc.light === "luna" ? 0.1 : 0;
  const glowAt = sc.light === "fuego" ? "50% 105%" : sc.light === "sol" ? "50% -5%" : "50% 0%";
  return (
    <AbsoluteFill style={{ opacity: alpha, background: pal.bg, transform: `translate(${fxS.shakeX}px, ${fxS.shakeY + slideY}px)` }}>
      {layers.map(({ ly, k }) => {
        const m = META[ly.asset], Asset = ASSETS[ly.asset];
        const key = ly.id ?? ly.asset, fx = layerFx(key, acts, f, W, H);
        fx.p = { ...((ly as { init?: Record<string, number> }).init ?? {}), ...fx.p };   // estado inicial de las acciones propias (p. ej. ya de pie)
        const scale = ly.scale ?? (m.kind === "fondo" ? 1.25 : 1), par = ly.par ?? m.par;
        const w = scale * W, h = w * m.aspect, at = ly.at ?? m.anchor;
        const left = at[0] * W - m.anchor[0] * w + fx.dx, top = at[1] * H - m.anchor[1] * h + fx.dy;
        const ze = 1 + (cam[2] - 1) * par, cx = 0.5 + (cam[0] - 0.5) * par, cy = 0.5 + (cam[1] - 0.5) * par;
        return (
          <div key={k} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
            transform: `translate(${W / 2}px, ${H / 2}px) scale(${ze}) translate(${-cx * W}px, ${-cy * H}px)`, opacity: (ly.opacity ?? 1) * fx.opacity }}>
            <svg width={w} height={h} viewBox={`0 0 100 ${100 * m.aspect}`} style={{ position: "absolute", left, top, overflow: "visible",
              transformOrigin: `${m.anchor[0] * 100}% ${m.anchor[1] * 100}%`, transform: `scale(${fx.scale}${ly.flip ? " ,1" : ""})` }}>
              <g transform={ly.flip ? `translate(100 0) scale(-1 1)` : undefined}>
                <Asset t={f} tb={f - bt.a} p={fx.p} params={fx.params} pal={pal} light={sc.light} flick={flick} seed={k} />
              </g>
            </svg>
          </div>
        );
      })}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${glowAt}, ${pal.glow} 0%, transparent 62%)`, opacity: glow, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.22) 22%, transparent 36%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(0,0,0,0.45) 100%)" }} />
      {fxS.flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: fxS.flash }} /> : null}
    </AbsoluteFill>
  );
};

/** perfil `meta.pacing: "viral"`: subtítulos grandes de 1–3 palabras en la franja baja-central, con la palabra clave en amarillo */
const captionCfg = (viral: boolean): typeof CAPTION => {
  if (!viral) return CAPTION;
  const c = pacingViral.captions;
  return { ...CAPTION, centerYK: c.centerYK, fontSizeK: c.fontSizeK, minWords: c.minWords, maxWords: c.maxWords, accentColor: c.accentColor } as typeof CAPTION;
};

export const Flat2D: React.FC<Props2> = (props) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { story, words } = useMemo(() => parse(props), [props]);
  const tl = useMemo(() => buildTimeline2D(story, words, fps), [story, words, fps]);
  const layers = layersAt(tl, f);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {layers.map((l, k) => <SceneView key={k ? "over" : "base"} tl={tl} i={l.beat} f={f} alpha={l.alpha} swipe={l.swipe} />)}
      {/* los overlays no anclados del explainer solo necesitan la lista de overlays de la línea de tiempo */}
      <OverlayLayer tl={tl as unknown as Timeline} words={words} lang={story.meta.lang} />
      <Captions words={words} keywords={tl.keywords} cap={captionCfg(story.meta.pacing === "viral")} />
    </AbsoluteFill>
  );
};
