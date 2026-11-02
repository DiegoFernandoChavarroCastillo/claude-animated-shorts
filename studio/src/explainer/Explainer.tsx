// Compositor del explainer: una o dos capas three.js (dos solo durante una transición con fundido) y, encima,
// la capa 2D de overlays y subtítulos. Todo sale de story.json + words.json; nada se escribe a mano por video.
import React, { useMemo } from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { ExplainerPropsSchema, type ExplainerProps } from "./schema";
import { buildTimeline, layersAt } from "./timeline";
import { Scene } from "./Scene";
import { Captions } from "./captions/Caption";
import { OverlayLayer } from "./overlays/OverlayLayer";
import { CAMERA, PALETTE } from "./style";

const parse = (p: ExplainerProps) => ExplainerPropsSchema.parse(p);

export const calcExplainerMetadata: CalculateMetadataFunction<ExplainerProps> = ({ props }) => {
  const { story, words } = parse(props);
  return { durationInFrames: buildTimeline(story, words, story.meta.fps).total, fps: story.meta.fps, width: story.meta.width, height: story.meta.height };
};

export const Explainer: React.FC<ExplainerProps> = (props) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const { story, words } = useMemo(() => parse(props), [props]);
  const tl = useMemo(() => buildTimeline(story, words, fps), [story, words, fps]);
  const layers = layersAt(tl, f);
  return (
    <AbsoluteFill style={{ background: PALETTE.bg.night0 }}>
      {layers.map((l, k) => (
        <AbsoluteFill key={k ? "over" : "base"} style={{ opacity: l.alpha }}>
          <ThreeCanvas width={width} height={height} shadows camera={{ fov: CAMERA.fov, near: 0.1, far: 2000 }}
            gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}>
            <Scene tl={tl} i={l.beat} />
          </ThreeCanvas>
        </AbsoluteFill>
      ))}
      <OverlayLayer tl={tl} words={words} lang={story.meta.lang} />
      <Captions words={words} keywords={tl.keywords} />
    </AbsoluteFill>
  );
};
