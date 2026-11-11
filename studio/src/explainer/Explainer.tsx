// Compositor del explainer: una o dos capas de escena (dos solo durante una transición con fundido) y, encima,
// la capa 2D de overlays y subtítulos. Cada capa es three.js (objetos 3D, tarjetas y láminas 2.5D) o, si el objeto
// del beat es de clase "plano", una ilustración 2D (FlatScene) sin lienzo 3D. Todo sale de story.json + words.json; nada se escribe a mano por video.
import React, { useMemo } from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { ExplainerPropsSchema, type ExplainerProps } from "./schema";
import { buildTimeline, layersAt } from "./timeline";
import { Scene } from "./Scene";
import { FlatScene } from "./flat/FlatScene";
import { heroDef } from "./heroes";
import { Captions, HookTitle, hookEndFrame } from "./captions/Caption";
import { OverlayLayer } from "./overlays/OverlayLayer";
import { CAMERA, PALETTE } from "./style";
import { validateStory } from "./catalog";

const parse = (p: ExplainerProps) => ExplainerPropsSchema.parse(p);

export const calcExplainerMetadata: CalculateMetadataFunction<ExplainerProps> = ({ props }) => {
  const { story, words } = parse(props);
  validateStory(story);
  return { durationInFrames: buildTimeline(story, words, story.meta.fps).total, fps: story.meta.fps, width: story.meta.width, height: story.meta.height };
};

export const Explainer: React.FC<ExplainerProps> = (props) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const { story, words } = useMemo(() => parse(props), [props]);
  const tl = useMemo(() => buildTimeline(story, words, fps), [story, words, fps]);
  const layers = layersAt(tl, f);
  const hookF = useMemo(() => hookEndFrame(words, story.beats[0].id, fps), [words, story, fps]);
  return (
    <AbsoluteFill style={{ background: PALETTE.bg.night0 }}>
      {layers.map((l, k) => (
        <AbsoluteFill key={k ? "over" : "base"} style={{ opacity: l.alpha }}>
          {heroDef(tl.beats[l.beat].beat.scene.hero.asset).kind === "plano" ? <FlatScene tl={tl} i={l.beat} /> : (
            <ThreeCanvas width={width} height={height} shadows camera={{ fov: CAMERA.fov, near: 0.1, far: 2000 }}
              gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}>
              <Scene tl={tl} i={l.beat} />
            </ThreeCanvas>
          )}
        </AbsoluteFill>
      ))}
      <OverlayLayer tl={tl} words={words} lang={story.meta.lang} />
      {story.meta.hookTitle ? <HookTitle text={story.meta.hookTitle} endF={hookF} accent={story.beats[0].keyword} /> : null}
      <Captions words={words} keywords={tl.keywords} fromF={story.meta.hookTitle ? hookF : 0} />
    </AbsoluteFill>
  );
};
