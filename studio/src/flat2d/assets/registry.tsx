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
import { DobleRendija } from "./doble_rendija";
import { OjoObservador } from "./ojo_observador";
import { MundoRender } from "./mundo_render";
import { Servidor } from "./servidor";
import { Marco } from "./marco";
import { BraseroCartas } from "./brasero_cartas";
import { MapaImperio } from "./mapa_imperio";
import { Susurro } from "./susurro";
import { Proclamacion } from "./proclamacion";
import { Arenga } from "./arenga";
import { Golpe } from "./golpe";
import { Mensajero } from "./mensajero";
import { Cofres } from "./cofres";
import { Senado } from "./senado";
import { Campamento } from "./campamento";
import { Palacio } from "./palacio";
import { Siria } from "./siria";
import { Tinaja } from "./tinaja";
import { Encuentro } from "./encuentro";
import { Diogenes } from "./diogenes";
import { FuenteNino } from "./fuente_nino";
import { Alejandro } from "./alejandro";
import { Asamblea } from "./asamblea";
import { Multitud } from "./multitud";
import { Sabios } from "./sabios";
import { DosDestinos } from "./dos_destinos";
import { Agora } from "./agora";
import { India } from "./india";

import { Academia } from "./academia";
import { Platon } from "./platon";
import { Alumnos } from "./alumnos";
import { Pollo } from "./pollo";
import { Puerta } from "./puerta";
import { Huellas } from "./huellas";
import { Alfombra } from "./alfombra";
import { Definicion } from "./definicion";
import { Unas } from "./unas";
const REAL: Record<string, AssetFC> = {
  pared_sombras: ParedSombras, cueva_corte: CuevaCorte, prisioneros: Prisioneros, prisionero_libre: PrisioneroLibre,
  muro_bajo: MuroBajo, fuego: Fuego, tunel_ascenso: TunelAscenso, exterior_sol: ExteriorSol,
  vacio_luz: VacioLuz, dialogo: Dialogo, epocas: Epocas, reflejo: Reflejo, huevo: Huevo,
  doble_rendija: DobleRendija, ojo_observador: OjoObservador, mundo_render: MundoRender, servidor: Servidor,
  marco: Marco, brasero_cartas: BraseroCartas, mapa_imperio: MapaImperio, susurro: Susurro, proclamacion: Proclamacion, arenga: Arenga, golpe: Golpe, mensajero: Mensajero, cofres: Cofres, senado: Senado, campamento: Campamento, palacio: Palacio, siria: Siria,
  tinaja: Tinaja, encuentro: Encuentro, diogenes: Diogenes, fuente_nino: FuenteNino, alejandro: Alejandro, asamblea: Asamblea, multitud: Multitud, sabios: Sabios, dos_destinos: DosDestinos, agora: Agora, india: India,
  academia: Academia, platon: Platon, alumnos: Alumnos, pollo: Pollo, puerta: Puerta, huellas: Huellas, alfombra: Alfombra, definicion: Definicion, unas: Unas,
};

export const ASSETS: Record<string, AssetFC> = Object.fromEntries(Object.keys(CATALOG2D.assets).map((id) => [id, REAL[id] ?? makePlaceholder(id)]));
export type AssetMeta = { kind: string; aspect: number; anchor: [number, number]; par: number };
export const META = CATALOG2D.assets as unknown as Record<string, AssetMeta>;
