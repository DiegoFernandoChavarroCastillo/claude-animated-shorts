// Beat en ilustración 2D (objeto de clase "plano"): en lugar del lienzo de three.js, la ilustración SVG del objeto con la cámara
// 2D (cam2At: los mismos presets, sub-planos, transiciones y efectos que la 3D) y un grade 2D que imita al del explainer:
// resplandor del color de la luz, oscurecido bajo los subtítulos y viñeta. Los overlays y subtítulos van encima, igual que en 3D.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Timeline } from "../timeline";
import { cam2At } from "../camera";
import { genericPose, heroActions } from "../actions";
import { heroDef } from "../heroes";
import type { Pose2 } from "../heroes/types";
import { PALETTE } from "../style";
import { FH, FW, LIGHT_TINT, clamp01 } from "./kit";

/** px por metro de las acciones genéricas en un plano: el encuadre base pone 2 x radius en el 55 % del ancho */
const pxPerM = (radius: number) => (0.55 * FW) / (2 * radius);

/** pose 3D de las acciones genéricas -> transformación 2D del sujeto */
export const pose2At = (tl: Timeline, i: number, f: number): Pose2 => {
  const P = genericPose(tl, i, f), k = pxPerM(heroDef(tl.beats[i].beat.scene.hero.asset).radius);
  return {
    dx: P.pos[0] * k, dy: -P.pos[1] * k + P.pos[2] * k * 0.25, rot: (-P.rot[2] * 180) / Math.PI,
    scale: P.scale * (1 + P.pos[2] * 0.12), sx: P.stretch[0] * Math.cos(P.rot[1]), sy: P.stretch[1] * Math.cos(P.rot[0]),
  };
};

/** progreso 0..1 de las acciones propias del objeto en el beat (por nombre; si se repite, la última que haya empezado) */
export const ownProgress = (tl: Timeline, i: number, f: number) => {
  const u: Record<string, number> = {};
  for (const a of heroActions(tl, i)) if (f >= a.start || !(a.spec.type in u)) u[a.spec.type] = f < a.start ? 0 : clamp01((f - a.start) / a.dur);
  return u;
};

export const FlatScene: React.FC<{ tl: Timeline; i: number }> = ({ tl, i }) => {
  const f = useCurrentFrame(), { width } = useVideoConfig();
  const bt = tl.beats[i], sc = bt.beat.scene, def = heroDef(sc.hero.asset), Comp = def.flat;
  if (!Comp) throw new Error(`${sc.hero.asset} no es un objeto de clase plano`);
  const tint = LIGHT_TINT[sc.light] ?? PALETTE.mid.lavender;
  return (
    <AbsoluteFill style={{ background: PALETTE.bg.night0, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: FW, height: FH, transform: `scale(${width / FW})`, transformOrigin: "0 0" }}>
        <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{ position: "absolute", inset: 0 }}>
          <Comp t={f} tb={f - bt.a} u={ownProgress(tl, i, f)} pose={sc.hero.pose ?? def.poses[0]} cam={cam2At(tl, i, f)} subject={pose2At(tl, i, f)} light={sc.light} />
        </svg>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 46%, ${tint}33 0%, transparent 60%)`, mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,6,18,0.5) 0%, rgba(5,6,18,0.25) 24%, transparent 34%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />
      </div>
    </AbsoluteFill>
  );
};
