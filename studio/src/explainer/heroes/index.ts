// Catálogo de objetos protagonistas (plan §8 F4): primitivas construidas en código, modelos glTF CC0 y tarjetas
// pintadas. La cámara y la capa 2D solo leen los datos (centro, radio de encuadre, anclas); `build` crea el objeto.
import type { HeroDef } from "./types";
import { telefono, reloj } from "./primitive/devices";
import { chip, vaso_agua_hielo, cubo_hielo, moleculas_agua, lago_corte } from "./primitive/science";
import { antena, avion } from "./primitive/vehicles";
import { perro, persona } from "./cards";
import { GLTF_HEROES } from "./gltf";

export type { HeroDef, HeroInstance, V3 } from "./types";

export const HEROES: Record<string, HeroDef> = {
  telefono, reloj, chip, antena, avion, vaso_agua_hielo, cubo_hielo, moleculas_agua, lago_corte,
  perro, persona,
  ...GLTF_HEROES,
};

export const heroDef = (asset: string) => {
  const h = HEROES[asset];
  if (!h) throw new Error(`hero.asset desconocido: ${asset} (disponibles: ${Object.keys(HEROES).join(", ")})`);
  return h;
};
