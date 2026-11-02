// Catálogo para el LLM (templates/catalog.json) contra el código: checkCatalog() falla si un id, pose, ancla o
// campo "anchored" no coincide en los dos sentidos; validateStory() comprueba que un story.json solo use ids del
// catálogo (lo llama calculateMetadata, así un story.json inválido falla antes de renderizar).
import catalog from "../../../templates/catalog.json";
import { ENVS } from "./envs";
import { HEROES } from "./heroes";
import { OVERLAYS } from "./overlays/registry";
import { ICONS } from "./overlays/icons";
import { CAMERA_PRESETS, LIGHT_NAMES, TRANSITIONS, type Story } from "./schema";

export const CATALOG = catalog;
type Cat = typeof catalog;
const sameSet = (what: string, code: readonly string[], cat: readonly string[]) => {
  const a = [...code].sort(), b = [...cat].sort();
  const onlyCode = a.filter((x) => !b.includes(x)), onlyCat = b.filter((x) => !a.includes(x));
  return onlyCode.length || onlyCat.length ? [`${what}: solo en el código [${onlyCode.join(", ")}], solo en catalog.json [${onlyCat.join(", ")}]`] : [];
};

/** diferencias entre el catálogo y el código (lista vacía = coinciden) */
export const catalogErrors = (): string[] => {
  const c: Cat = catalog, errs: string[] = [];
  errs.push(...sameSet("lights", LIGHT_NAMES, Object.keys(c.lights)));
  errs.push(...sameSet("envs", Object.keys(ENVS), Object.keys(c.envs)));
  errs.push(...sameSet("heroes", Object.keys(HEROES), Object.keys(c.heroes)));
  errs.push(...sameSet("camera", CAMERA_PRESETS, Object.keys(c.camera)));
  errs.push(...sameSet("transitions", TRANSITIONS, Object.keys(c.transitions)));
  errs.push(...sameSet("overlays", Object.keys(OVERLAYS), Object.keys(c.overlays)));
  errs.push(...sameSet("icons", ICONS, c.icons));
  for (const [id, e] of Object.entries(c.envs)) if (ENVS[id]) errs.push(...sameSet(`envs.${id}.lights`, ENVS[id].lights, e.lights));
  for (const [id, h] of Object.entries(c.heroes) as [string, Cat["heroes"][keyof Cat["heroes"]]][]) {
    const d = HEROES[id];
    if (!d) continue;
    if (d.kind !== h.kind) errs.push(`heroes.${id}.kind: código ${d.kind}, catálogo ${h.kind}`);
    errs.push(...sameSet(`heroes.${id}.poses`, d.poses, h.poses), ...sameSet(`heroes.${id}.anchors`, Object.keys(d.anchors), h.anchors));
  }
  for (const [id, o] of Object.entries(c.overlays) as [string, { anchored: boolean; numeric?: boolean }][]) {
    if (OVERLAYS[id] && OVERLAYS[id].anchored !== o.anchored) errs.push(`overlays.${id}.anchored no coincide`);
    if (OVERLAYS[id] && OVERLAYS[id].numeric !== Boolean(o.numeric)) errs.push(`overlays.${id}.numeric no coincide`);
  }
  return errs;
};

export const checkCatalog = () => {
  const errs = catalogErrors();
  if (errs.length) throw new Error(`templates/catalog.json no coincide con el código:\n- ${errs.join("\n- ")}`);
};

/** errores de catálogo de un story.json (ids, poses, anclas, tipos de overlay y de sfx) */
export const storyErrors = (story: Story): string[] => {
  const c: Cat = catalog, errs: string[] = [];
  const heroes = c.heroes as Record<string, { kind: string; poses: string[]; anchors: string[] }>;
  const overlays = c.overlays as Record<string, { anchored: boolean }>;
  for (const b of story.beats) {
    const s = b.scene, h = heroes[s.hero.asset];
    if (!(s.env in c.envs)) errs.push(`${b.id}: env "${s.env}" no existe`);
    if (!h) errs.push(`${b.id}: hero.asset "${s.hero.asset}" no existe`);
    else {
      if (h.kind !== s.hero.kind) errs.push(`${b.id}: hero.kind "${s.hero.kind}" no corresponde a ${s.hero.asset} (${h.kind})`);
      if (s.hero.pose && !h.poses.includes(s.hero.pose)) errs.push(`${b.id}: pose "${s.hero.pose}" no existe para ${s.hero.asset}`);
    }
    for (const o of b.overlays) {
      const d = overlays[o.type];
      if (!d) { errs.push(`${b.id}: overlay "${o.type}" no existe`); continue; }
      const anchor = (o as { anchor?: string }).anchor;
      if (anchor && (!d.anchored || (h && !h.anchors.includes(anchor)))) errs.push(`${b.id}: ${o.type} con anchor "${anchor}" no válido`);
    }
    for (const x of b.sfx) if (!(x.type in c.sfx)) errs.push(`${b.id}: sfx "${x.type}" no existe`);
  }
  return errs;
};

export const validateStory = (story: Story) => {
  checkCatalog();
  const errs = storyErrors(story);
  if (errs.length) throw new Error(`story.json usa ids que no están en el catálogo:\n- ${errs.join("\n- ")}`);
};
