// Catálogo de objetos protagonistas (plan §8 F4): primitivas construidas en código, modelos glTF CC0 y tarjetas
// pintadas. La cámara y la capa 2D solo leen los datos (centro, radio de encuadre, anclas); `build` crea el objeto.
import type { HeroDef } from "./types";
import { telefono, reloj } from "./primitive/devices";
import { chip, vaso_agua_hielo, cubo_hielo, moleculas_agua, lago_corte } from "./primitive/science";
import { antena, avion } from "./primitive/vehicles";
import { garganta_corte, pulmones, corazon, estomago, ojo, piel_capas } from "./primitive/body";
import { celula, virus, bacteria, adn, globulos, neurona } from "./primitive/micro";
import { planeta, luna_fases, sol, agujero_negro, cohete, galaxia } from "./primitive/space";
import { pendulo, onda, prisma_luz, iman_campo, circuito, gravedad_pozo } from "./primitive/physics";
import { atomo, elemento, matraz, reaccion_burbujas, cristal_sal, ph_tira } from "./primitive/chemistry";
import { volcan_corte, capas_tierra, nube_rayo, ola_marea, iceberg, placas_tectonicas } from "./primitive/earth";
import { cerebro, ojo_ilusion, sueno_cama, memoria_cajones, emocion_cara, reloj_biologico } from "./primitive/mind";
import { planta_fotosintesis, semilla_germina, abeja, ave_vuelo, pez, arbol_anillos } from "./primitive/life";
import { microondas, olla_hierve, puente, piramide, palanca, numeros_flotantes, forma_fibonacci, bateria, wifi_router, pantalla_led } from "./primitive/home";
import { esfera_flotante, caja_etiquetada, diagrama_flujo } from "./primitive/generic";
import { perro, persona } from "./cards";
import { GLTF_HEROES } from "./gltf";

export type { HeroDef, HeroInstance, V3 } from "./types";

export const HEROES: Record<string, HeroDef> = {
  telefono, reloj, chip, antena, avion, vaso_agua_hielo, cubo_hielo, moleculas_agua, lago_corte,
  garganta_corte, pulmones, corazon, estomago, ojo, piel_capas,
  celula, virus, bacteria, adn, globulos, neurona,
  planeta, luna_fases, sol, agujero_negro, cohete, galaxia,
  pendulo, onda, prisma_luz, iman_campo, circuito, gravedad_pozo,
  atomo, elemento, matraz, reaccion_burbujas, cristal_sal, ph_tira,
  volcan_corte, capas_tierra, nube_rayo, ola_marea, iceberg, placas_tectonicas,
  cerebro, ojo_ilusion, sueno_cama, memoria_cajones, emocion_cara, reloj_biologico,
  planta_fotosintesis, semilla_germina, abeja, ave_vuelo, pez, arbol_anillos,
  microondas, olla_hierve, puente, piramide, palanca, numeros_flotantes, forma_fibonacci, bateria, wifi_router, pantalla_led,
  esfera_flotante, caja_etiquetada, diagrama_flujo,
  perro, persona,
  ...GLTF_HEROES,
};

export const heroDef = (asset: string) => {
  const h = HEROES[asset];
  if (!h) throw new Error(`hero.asset desconocido: ${asset} (disponibles: ${Object.keys(HEROES).join(", ")})`);
  return h;
};
