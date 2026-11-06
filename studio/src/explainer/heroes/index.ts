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
import { hueso_articulacion, musculo, oido, diente, rinon, intestino } from "./primitive/body2";
import { mitocondria, anticuerpo, jeringa_vacuna, cromosoma, plaqueta_coagulo, protozoo } from "./primitive/micro2";
import { balanza_decision, bombilla_idea, espejo_reflejo, rompecabezas, habito_bucle, arena_tiempo } from "./primitive/mind2";
import { molecula_atomos, tubos_ensayo, llama_mechero, clavo_oxido, probeta_densidad, destilador } from "./primitive/chemistry2";
import { plano_inclinado, resorte_masa, lente_luz, ondas_gota, barra_calor, trompo } from "./primitive/physics2";
import { sistema_solar, cometa_asteroide, satelite, telescopio, eclipse_solar, astronauta } from "./primitive/space2";
import { ciclo_agua, arcoiris, huracan, estratos_fosil, aurora, duna_desierto } from "./primitive/earth2";
import { hongo_micelio, mariposa, medusa, murcielago, huevo_embrion, flor_polinizacion } from "./primitive/life2";
import { nevera, candado_cifrado, engranajes, catapulta, pitagoras, moneda_azar } from "./primitive/home2";
import { rejilla_ondas, aluminio_cargas, sensor_pulso, espectro_canales, manilla_rfid, servidor_rack, manilla_led, estadio_zonas, emisor_ir, consola_luces } from "./primitive/custom";
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
  hueso_articulacion, musculo, oido, diente, rinon, intestino,
  mitocondria, anticuerpo, jeringa_vacuna, cromosoma, plaqueta_coagulo, protozoo,
  balanza_decision, bombilla_idea, espejo_reflejo, rompecabezas, habito_bucle, arena_tiempo,
  molecula_atomos, tubos_ensayo, llama_mechero, clavo_oxido, probeta_densidad, destilador,
  plano_inclinado, resorte_masa, lente_luz, ondas_gota, barra_calor, trompo,
  sistema_solar, cometa_asteroide, satelite, telescopio, eclipse_solar, astronauta,
  ciclo_agua, arcoiris, huracan, estratos_fosil, aurora, duna_desierto,
  hongo_micelio, mariposa, medusa, murcielago, huevo_embrion, flor_polinizacion,
  nevera, candado_cifrado, engranajes, catapulta, pitagoras, moneda_azar,
  rejilla_ondas, aluminio_cargas, sensor_pulso, espectro_canales, manilla_rfid, servidor_rack, manilla_led, estadio_zonas, emisor_ir, consola_luces,
  perro, persona,
  ...GLTF_HEROES,
};

export const heroDef = (asset: string) => {
  const h = HEROES[asset];
  if (!h) throw new Error(`hero.asset desconocido: ${asset} (disponibles: ${Object.keys(HEROES).join(", ")})`);
  return h;
};
