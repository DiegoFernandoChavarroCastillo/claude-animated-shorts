import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { CaptionTest, captionTestFrames } from "./explainer/CaptionTest";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CaptionTest" component={CaptionTest} durationInFrames={captionTestFrames("es")} fps={30} width={1080} height={1920} defaultProps={{ lang: "es" as const }} />
    <Composition id="CaptionTestEn" component={CaptionTest} durationInFrames={captionTestFrames("en")} fps={30} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
    {/* legado: el puente original, solo como prueba de que el motor funciona */}
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);