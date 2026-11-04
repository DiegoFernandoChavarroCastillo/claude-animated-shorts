// Capa 2D de overlays de datos: cada overlay de story.json entra en su `at` (resuelto en timeline.ts) y dura hasta
// el final de su beat (o `dur` frames). Los anclados reciben la proyección de su ancla en cada frame.
import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import type { Timeline } from "../timeline";
import type { WordT } from "../schema";
import { OverlayStage } from "./common";
import { OVERLAYS } from "./registry";
import { anchorPoint } from "./project";

export const OverlayLayer: React.FC<{ tl: Timeline; words: WordT[]; lang: "es" | "en" }> = ({ tl, lang }) => {
  const f = useCurrentFrame();
  return (
    <OverlayStage>
      {tl.overlays.map((o) => {
        const def = OVERLAYS[o.spec.type];
        if (!def) return null; // validate_story.py rechaza tipos desconocidos antes de llegar aquí
        const dur = typeof o.spec.dur === "number" ? o.spec.dur : Math.max(1, o.end - o.frame);
        const { type: _t, at: _a, anchor, to, dur: _d, ...rest } = o.spec as Record<string, unknown>;
        const point = def.anchored ? anchorPoint(tl, o.beat, String(anchor ?? "hero"), f) ?? undefined : undefined;
        const point2 = def.anchored && to ? anchorPoint(tl, o.beat, String(to), f) ?? undefined : undefined; // FlowArrow: ancla de destino
        const C = def.component;
        return (
          <Sequence key={o.key} from={o.frame} durationInFrames={dur} layout="none">
            <C {...rest} dur={dur} lang={lang} point={point} point2={point2} />
          </Sequence>
        );
      })}
    </OverlayStage>
  );
};
