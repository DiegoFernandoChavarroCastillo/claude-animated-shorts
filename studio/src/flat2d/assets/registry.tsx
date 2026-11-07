// Registro de assets 2D: id de templates/catalog2d.json -> componente. Los que aún no están dibujados usan un marcador (se reemplazan uno a uno en F3).
import { CATALOG2D } from "../palette";
import type { AssetFC } from "./common";
import { makePlaceholder } from "./placeholder";
import { ParedSombras } from "./pared_sombras";
import { CuevaCorte } from "./cueva_corte";
import { Prisioneros } from "./prisioneros";
import { PrisioneroLibre } from "./prisionero_libre";
import { MuroBajo } from "./muro_bajo";
import { Fuego } from "./fuego";
import { TunelAscenso } from "./tunel_ascenso";
import { ExteriorSol } from "./exterior_sol";
import { VacioLuz } from "./vacio_luz";
import { Dialogo } from "./dialogo";
import { Epocas } from "./epocas";
import { Reflejo } from "./reflejo";
import { Huevo } from "./huevo";

const REAL: Record<string, AssetFC> = {
  pared_sombras: ParedSombras, cueva_corte: CuevaCorte, prisioneros: Prisioneros, prisionero_libre: PrisioneroLibre,
  muro_bajo: MuroBajo, fuego: Fuego, tunel_ascenso: TunelAscenso, exterior_sol: ExteriorSol,
  vacio_luz: VacioLuz, dialogo: Dialogo, epocas: Epocas, reflejo: Reflejo, huevo: Huevo,
};

export const ASSETS: Record<string, AssetFC> = Object.fromEntries(Object.keys(CATALOG2D.assets).map((id) => [id, REAL[id] ?? makePlaceholder(id)]));
export type AssetMeta = { kind: string; aspect: number; anchor: [number, number]; par: number };
export const META = CATALOG2D.assets as unknown as Record<string, AssetMeta>;
