// Capa 2D de overlays de datos: cada overlay de story.json entra en su `at` (resuelto en timeline.ts) y dura hasta
// el final de su beat (o `dur` frames). Los anclados reciben la proyección de su ancla en cada frame.
import React from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import type { Timeline } from "../timeline";
import type { WordT } from "../schema";
import { OverlayStage, W as LW, wideStage } from "./common";
import { OVERLAYS } from "./registry";
import { anchorPoint } from "./project";

/** `wideX` (video largo 16:9): x por defecto de los overlays, 0–1 del ancho; cada overlay puede llevar su `screenX` */
export const OverlayLayer: React.FC<{ tl: Timeline; words: WordT[]; lang: "es" | "en"; wideX?: number }> = ({ tl, lang, wideX }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const base = wideX ?? 0.5, s = width > height ? wideStage(width, height, base).s : 1;
  return (
    <OverlayStage x={base}>
      {tl.overlays.map((o) => {
        const def = OVERLAYS[o.spec.type];
        if (!def) return null; // validate_story.py rechaza tipos desconocidos antes de llegar aquí
        const dur = typeof o.spec.dur === "number" ? o.spec.dur : Math.max(1, o.end - o.frame);
        const { type: _t, at: _a, anchor, to, dur: _d, screenX, ...rest } = o.spec as Record<string, unknown>;
        const dx = typeof screenX === "number" && width > height ? ((screenX - base) * width) / s : 0;   // en px del lienzo lógico
        const point = def.anchored ? anchorPoint(tl, o.beat, String(anchor ?? "hero"), f) ?? undefined : undefined;
        const point2 = def.anchored && to ? anchorPoint(tl, o.beat, String(to), f) ?? undefined : undefined; // FlowArrow: ancla de destino
        const C = def.component;
        return (
          <Sequence key={o.key} from={o.frame} durationInFrames={dur} layout="none">
            {dx ? <div style={{ position: "absolute", left: 0, top: 0, width: LW, height: "100%", transform: `translateX(${dx}px)` }}><C {...rest} dur={dur} lang={lang} point={point} point2={point2} /></div>
              : <C {...rest} dur={dur} lang={lang} point={point} point2={point2} />}
          </Sequence>
        );
      })}
    </OverlayStage>
  );
};
