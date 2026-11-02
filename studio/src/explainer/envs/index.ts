// Catálogo de entornos (plan §8 F4), un builder por archivo. Cada entorno deja libre el protagonista en el origen
// (suelo en y = 0, salvo cielo_atardecer, que no tiene suelo) y pone el fondo hacia -z, que es donde mira la cámara
// con az = 0. Lo que puede tapar al protagonista va marcado con blocker() y lo oculta el culling (cull.ts).
import type { EnvDef } from "./kit";
import { cielo_atardecer } from "./cielo_atardecer";
import { vista_aerea } from "./vista_aerea";
import { calle_noche_bokeh } from "./calle_noche_bokeh";
import { cuarto_noche } from "./cuarto_noche";
import { tech_oscuro } from "./tech_oscuro";
import { interior_neutro } from "./interior_neutro";
import { exterior_clasico } from "./exterior_clasico";
import { macro_corte } from "./macro_corte";

export type { EnvDef, EnvInstance } from "./kit";

export const ENVS: Record<string, EnvDef> = {
  cielo_atardecer, vista_aerea, calle_noche_bokeh, cuarto_noche, tech_oscuro, interior_neutro, exterior_clasico, macro_corte,
};

export const envDef = (id: string) => {
  const e = ENVS[id];
  if (!e) throw new Error(`env desconocido: ${id} (disponibles: ${Object.keys(ENVS).join(", ")})`);
  return e;
};
