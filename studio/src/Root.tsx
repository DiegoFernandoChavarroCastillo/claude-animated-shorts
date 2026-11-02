import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { CaptionTest, captionTestFrames } from "./explainer/CaptionTest";
import { Explainer, calcExplainerMetadata } from "./explainer/Explainer";
import { KitGallery, galleryFrames } from "./explainer/KitGallery";
import type { ExplainerProps } from "./explainer/schema";
import exampleStory from "../../templates/examples/hielo-flota/05_story.json";
import exampleWords from "../../templates/examples/hielo-flota/04_words.json";

const example = { story: exampleStory, words: exampleWords } as ExplainerProps;

export const RemotionRoot: React.FC = () => (
  <>
    {/* el video: props = { story, words } (por defecto, el ejemplo hielo-flota); la duración sale de calculateMetadata */}
    <Composition id="Explainer" component={Explainer} durationInFrames={1} fps={30} width={1080} height={1920}
      defaultProps={example} calculateMetadata={calcExplainerMetadata} />
    <Composition id="KitGallery" component={KitGallery} durationInFrames={galleryFrames()} fps={30} width={1080} height={1920} />
    <Composition id="CaptionTest" component={CaptionTest} durationInFrames={captionTestFrames("es")} fps={30} width={1080} height={1920} defaultProps={{ lang: "es" as const }} />
    <Composition id="CaptionTestEn" component={CaptionTest} durationInFrames={captionTestFrames("en")} fps={30} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
    {/* legado: el puente original, solo como prueba de que el motor funciona */}
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);