// Contrato de datos (plan §6): el LLM solo rellena story.json; words.json sale de la alineación (F5).
// Este esquema valida la forma. Que env / hero / overlay / sfx existan en el catálogo lo comprueba catalog.ts.
import { z } from "zod";

export const LANGS = ["es", "en"] as const;
export const ROLES = ["hook", "tension", "mechanism", "layer2", "twist", "cta"] as const;
export const LIGHT_NAMES = ["atardecer", "noche", "dorado", "tech"] as const;
export const CAMERA_PRESETS = ["push_in", "drift", "glide", "zoom_through", "orbit_slow", "cut"] as const;
export const TRANSITIONS = ["glide", "zoom_through", "cut", "crossfade"] as const;
export const HERO_KINDS = ["primitive", "gltf", "card"] as const;

/** palabra del texto del beat (1.ª aparición), índice "#3" o número de frames desde el inicio del beat */
export const AtSchema = z.union([z.string().min(1), z.number().int().min(0)]);

export const OverlaySpecSchema = z.looseObject({ type: z.string(), at: AtSchema.optional() });
export const SfxSpecSchema = z.object({ type: z.string(), at: AtSchema });

export const SceneSchema = z.object({
  env: z.string(),
  light: z.enum(LIGHT_NAMES),
  hero: z.object({ kind: z.enum(HERO_KINDS), asset: z.string(), pose: z.string().optional() }),
  camera: z.object({
    preset: z.enum(CAMERA_PRESETS),
    rate: z.number().min(0).max(0.6).optional(),   // %/frame (push_in)
    deg: z.number().min(-45).max(45).optional(),   // grados totales (orbit_slow)
    dir: z.enum(["left", "right"]).optional(),     // drift
  }),
  dof: z.number().min(0).max(24).optional(),       // cInf en px a 1080
});

export const BeatSchema = z.object({
  id: z.string(),
  role: z.enum(ROLES),
  text: z.string().min(1),
  keyword: z.string().optional(),
  scene: SceneSchema,
  overlays: z.array(OverlaySpecSchema).default([]),
  sfx: z.array(SfxSpecSchema).default([]),
  transition: z.enum(TRANSITIONS).default("glide"),  // transición HACIA el beat siguiente
  sources: z.array(z.string()).optional(),
});

export const MetaSchema = z.object({
  id: z.string(),
  lang: z.enum(LANGS),
  title: z.string(),
  fps: z.literal(30).default(30),
  width: z.number().int().default(1080),
  height: z.number().int().default(1920),
  voice: z.object({ engine: z.string(), voice: z.string(), speed: z.number().default(1) }),
  music: z.boolean().default(false),
  captionEmphasis: z.enum(["box", "accent"]).default("box"),
});

export const StorySchema = z.object({ meta: MetaSchema, beats: z.array(BeatSchema).min(1) });
export const WordSchema = z.object({ w: z.string(), start: z.number().min(0), end: z.number().min(0), beat: z.string() });
export const ExplainerPropsSchema = z.object({ story: StorySchema, words: z.array(WordSchema).min(1) });

export type Story = z.infer<typeof StorySchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type OverlaySpec = z.infer<typeof OverlaySpecSchema>;
export type WordT = z.infer<typeof WordSchema>;
export type ExplainerProps = z.input<typeof ExplainerPropsSchema>;
