// Registro de assets 2D: id de templates/catalog2d.json -> componente. Los que aún no están dibujados usan un marcador (se reemplazan uno a uno en F3).
import { CATALOG2D } from "../palette";
import type { AssetFC } from "./common";
import { makePlaceholder } from "./placeholder";
import { ParedSombras } from "./pared_sombras";

const REAL: Record<string, AssetFC> = {
  pared_sombras: ParedSombras,
};

export const ASSETS: Record<string, AssetFC> = Object.fromEntries(Object.keys(CATALOG2D.assets).map((id) => [id, REAL[id] ?? makePlaceholder(id)]));
export type AssetMeta = { kind: string; aspect: number; anchor: [number, number]; par: number };
export const META = CATALOG2D.assets as unknown as Record<string, AssetMeta>;
