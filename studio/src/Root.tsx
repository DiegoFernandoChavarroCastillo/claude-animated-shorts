import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./legacy/bridge/Bridge";
import { CaptionTest, captionTestFrames } from "./explainer/CaptionTest";
import { Explainer, calcExplainerMetadata } from "./explainer/Explainer";
import { KitGallery, galleryFrames } from "./explainer/KitGallery";
import { CullTest } from "./explainer/CullTest";
import { Flat2D, calcFlat2DMetadata } from "./flat2d/Flat2D";
import type { Props2 } from "./flat2d/schema";
import flatStory from "./flat2d/dev/story.json";
import flatWords from "./flat2d/dev/words.json";
import type { ExplainerProps } from "./explainer/schema";
import exampleStory from "../../templates/examples/hielo-flota/05_story.json";
import exampleWords from "../../templates/examples/hielo-flota/04_words.json";

import galleryStory from "./explainer/dev/envgallery_story.json";
import galleryWords from "./explainer/dev/envgallery_words.json";

const example = { story: exampleStory, words: exampleWords } as ExplainerProps;
const flatExample = { story: flatStory, words: flatWords } as Props2;
const envGallery = { story: galleryStory, words: galleryWords } as ExplainerProps;

export const RemotionRoot: React.FC = () => (
  <>
    {/* el video: props = { story, words } (por defecto, el ejemplo hielo-flota); la duración sale de calculateMetadata */}
    <Composition id="Explainer" component={Explainer} durationInFrames={1} fps={30} width={1080} height={1920}
      defaultProps={example} calculateMetadata={calcExplainerMetadata} />
    {/* F4: un beat por entorno con su protagonista y su luz, más los objetos que faltan */}
    <Composition id="EnvGallery" component={Explainer} durationInFrames={1} fps={30} width={1080} height={1920}
      defaultProps={envGallery} calculateMetadata={calcExplainerMetadata} />
    {/* motor 2D plano (plan story-2d): props = { story, words } con story.meta.engine = "2d" */}
    <Composition id="Flat2D" component={Flat2D} durationInFrames={1} fps={30} width={1080} height={1920}
      defaultProps={flatExample} calculateMetadata={calcFlat2DMetadata} />
    <Composition id="CullTest" component={CullTest} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="KitGallery" component={KitGallery} durationInFrames={galleryFrames()} fps={30} width={1080} height={1920} />
    <Composition id="CaptionTest" component={CaptionTest} durationInFrames={captionTestFrames("es")} fps={30} width={1080} height={1920} defaultProps={{ lang: "es" as const }} />
    <Composition id="CaptionTestEn" component={CaptionTest} durationInFrames={captionTestFrames("en")} fps={30} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
    {/* legado: el puente original, solo como prueba de que el motor funciona */}
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);