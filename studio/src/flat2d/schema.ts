// Contrato de datos del motor 2D (engine "2d", plan story-2d). La validación fina (assets, paletas, acciones, ritmo) la hace
// pipeline/validate_story2d.py contra templates/catalog2d.json; aquí solo se comprueba la forma para que Remotion no reciba basura.
import { z } from "zod";
import { WordSchema } from "../explainer/schema";

const At = z.union([z.string().min(1), z.number().int().min(0)]);
const Cam = z.tuple([z.number(), z.number(), z.number()]);   // [cx, cy, zoom]

export const LayerSchema = z.looseObject({
  asset: z.string(), id: z.string().optional(), z: z.number().default(0),
  at: z.tuple([z.number(), z.number()]).optional(), scale: z.number().optional(), flip: z.boolean().optional(),
  par: z.number().optional(), opacity: z.number().optional(),
});
export const Camera2Schema = z.looseObject({ preset: z.string(), from: Cam.optional(), to: Cam.optional() });
export const Beat2Schema = z.looseObject({
  id: z.string(), role: z.string(), text: z.string().min(1), keyword: z.string().optional(), keywords: z.array(z.string()).optional(), shows: z.string().optional(),
  scene: z.looseObject({ palette: z.string(), light: z.string(), layers: z.array(LayerSchema).min(1), camera: Camera2Schema }),
  overlays: z.array(z.looseObject({ type: z.string(), at: At.optional() })).default([]),
  actions: z.array(z.looseObject({ type: z.string(), at: At.optional(), target: z.string().optional(), dur: z.number().int().min(1).max(600).optional() })).default([]),
  shots: z.array(z.object({ at: At, camera: Camera2Schema })).default([]),
  transition: z.string().default("crossfade"),   // transición HACIA el beat siguiente
});
export const Story2Schema = z.object({
  meta: z.looseObject({ id: z.string(), lang: z.enum(["es", "en"]), title: z.string(), engine: z.literal("2d"), tailS: z.number().min(0.1).max(2).default(1.0),
    captionEmphasis: z.enum(["box", "accent"]).default("box"), pacing: z.enum(["viral"]).optional(), hookTitle: z.string().max(48).optional() }),
  beats: z.array(Beat2Schema).min(1),
});
export const Props2Schema = z.object({ story: Story2Schema, words: z.array(WordSchema).min(1) });

export type Story2 = z.infer<typeof Story2Schema>;
export type Beat2 = z.infer<typeof Beat2Schema>;
export type Layer2 = z.infer<typeof LayerSchema>;
export type Camera2 = z.infer<typeof Camera2Schema>;
export type Props2 = z.input<typeof Props2Schema>;
export type WordT = z.infer<typeof WordSchema>;
