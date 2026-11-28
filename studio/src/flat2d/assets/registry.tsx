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
import { Banquete } from "./banquete";
import { Esclavos } from "./esclavos";
import { PiernaTorcida } from "./pierna_torcida";
import { Parpados } from "./parpados";
import { Vendaje } from "./vendaje";
import { EscuelaMar } from "./escuela_mar";
import { MarcoLee } from "./marco_lee";
import { OficinaGrito } from "./oficina_grito";
import { Insomnio } from "./insomnio";
import { CirculoControl } from "./circulo_control";
import { Ugarit } from "./ugarit";
import { NavesMar } from "./naves_mar";
import { SalaUgarit } from "./sala_ugarit";
import { Dictado } from "./dictado";
import { Tablilla } from "./tablilla";
import { MapaBronce } from "./mapa_bronce";
import { Armero } from "./armero";
import { CampoSeco } from "./campo_seco";
import { Hitita } from "./hitita";
import { Hambre } from "./hambre";
import { RelieveEgipto } from "./relieve_egipto";
import { Excavacion } from "./excavacion";
import { Homero } from "./homero";
import { CelularEstano } from "./celular_estano";
import { Cleopatra } from "./cleopatra";
import { SacoCesar } from "./saco_cesar";
import { AlejandriaNoche } from "./alejandria_noche";
import { CabezaPompeyo } from "./cabeza_pompeyo";
import { PtolomeoFuria } from "./ptolomeo_furia";
import { PasilloGuardias } from "./pasillo_guardias";
import { NiloAhogo } from "./nilo_ahogo";
import { BanqueteNilo } from "./banquete_nilo";
import { Foro } from "./foro";
import { SenadoresOdio } from "./senadores_odio";
import { TemploVenus } from "./templo_venus";
import { IdusMarzo } from "./idus_marzo";
import { HuidaBarco } from "./huida_barco";
import { OctavioConsejo } from "./octavio_consejo";
import { Cesarion } from "./cesarion";
import { Particulas } from "./particulas";
import { RayosLuz } from "./rayos_luz";
import { Estrellas } from "./estrellas";
import { Nubes } from "./nubes";
import { Niebla } from "./niebla";
import { Bokeh } from "./bokeh";
import { Figura } from "./figura";
import { Cielo } from "./cielo";
import { Mar } from "./mar";
import { Colinas } from "./colinas";
import { Calle } from "./calle";
import { SalaArcos } from "./sala_arcos";
import { Vela } from "./vela";
import { Ballena } from "./ballena";
import { MapaMundo } from "./mapa_mundo";
import { Volcan } from "./volcan";
import { Cabana } from "./cabana";
import { CampoMaiz } from "./campo_maiz";
import { Criatura } from "./criatura";
import { GaleraTeseo } from "./galera_teseo";
import { PuertoAtenas } from "./puerto_atenas";
import { Carpintero } from "./carpintero";
import { Celda } from "./celda";
import { VasijaMinotauro } from "./vasija_minotauro";
import { CuerpoBarco } from "./cuerpo_barco";
import { Piramide } from "./piramide";
import { GuizaCrecida } from "./guiza_crecida";
import { BarcoPiedra } from "./barco_piedra";
import { PuertoFuego } from "./puerto_fuego";
import { AlmacenRollos } from "./almacen_rollos";
import { BibliotecaAlejandria } from "./biblioteca_alejandria";
import { GaleriaPapiros } from "./galeria_papiros";
import { PapiroMerer } from "./papiro_merer";
import { Merer } from "./merer";
import { CanteraTura } from "./cantera_tura";
import { AldeaObreros } from "./aldea_obreros";
import { Ovni } from "./ovni";
import { Tutankamon } from "./tutankamon";
import { MascaraTut } from "./mascara_tut";
import { ImagenIa } from "./imagen_ia";
import { Medalla } from "./medalla";
import { Formulas } from "./formulas";
import { PantallaPc } from "./pantalla_pc";
import { FabricaRobot } from "./fabrica_robot";
import { Proteina } from "./proteina";
import { RelojAgujas } from "./reloj_agujas";
import { Espacio } from "./espacio";
import { CabinaNave } from "./cabina_nave";
import { Saturno } from "./saturno";
import { Gargantua } from "./gargantua";
import { AgujeroGusano } from "./agujero_gusano";
import { Endurance } from "./endurance";
import { Ranger } from "./ranger";
import { Planeta } from "./planeta";
import { Tars } from "./tars";
import { TormentaPolvo } from "./tormenta_polvo";
import { CuartoMurph } from "./cuarto_murph";
import { BaseNasa } from "./base_nasa";
import { SuperficieMiller } from "./superficie_miller";
import { HieloMann } from "./hielo_mann";
import { EdmundsCampo } from "./edmunds_campo";
import { Teseracto } from "./teseracto";
import { EstacionCooper } from "./estacion_cooper";
import { RelojPulsera } from "./reloj_pulsera";
import { Cama } from "./cama";
import { MonitorMensaje } from "./monitor_mensaje";
import { Frontera } from "./frontera";
import { TumbaTesoro } from "./tumba_tesoro";
import { ValleReyes } from "./valle_reyes";
import { TemploAmon } from "./templo_amon";
import { MuroNombres } from "./muro_nombres";
import { Baston } from "./baston";
import { AtaudesHijas } from "./ataudes_hijas";
import { TronoOro } from "./trono_oro";
import { SisifoRoca } from "./sisifo_roca";
import { MontanaSisifo } from "./montana_sisifo";
import { Tanatos } from "./tanatos";
import { CamusEscribe } from "./camus_escribe";
import { Rutina } from "./rutina";
import { CafeRisa } from "./cafe_risa";
import { Dormitorio } from "./dormitorio";
import { AnilloOro } from "./anillo_oro";
import { CajaFuerte } from "./caja_fuerte";
import { CrucetaHilos } from "./cruceta_hilos";
import { Oveja } from "./oveja";
import { Burro } from "./burro";
import { Erizo } from "./erizo";
import { BosqueNevado } from "./bosque_nevado";
import { AuraPuas } from "./aura_puas";
import { Schopenhauer } from "./schopenhauer";
import { Heno } from "./heno";
import { CuboAgua } from "./cubo_agua";
import { SalaTv } from "./sala_tv";
import { TronoLidia } from "./trono_lidia";
import { Corona } from "./corona";
import { Pergamino } from "./pergamino";
import { ManuscritoVoynich } from "./manuscrito_voynich";
import { SimbolosVoynich } from "./simbolos_voynich";
import { BibliotecaNoche } from "./biblioteca_noche";
import { DespachoCripto } from "./despacho_cripto";
import { EscritorioCripto } from "./escritorio_cripto";
import { FrascosBotica } from "./frascos_botica";
import { Alambique } from "./alambique";
import { ManoPluma } from "./mano_pluma";
import { BigEar } from "./big_ear";
import { OndaRadio } from "./onda_radio";
import { ImpresionWow } from "./impresion_wow";
import { SalaOrdenador } from "./sala_ordenador";
import { MesaEhman } from "./mesa_ehman";
import { Cocina70 } from "./cocina_70";
import { GalaxiaEspiral } from "./galaxia_espiral";
import { RadioDisco } from "./radio_disco";
import { Cometa } from "./cometa";
import { Satelite } from "./satelite";
import { Balanza } from "./balanza";
import { CamaraVigilancia } from "./camara_vigilancia";
import { Ojo } from "./ojo";
import { FranjaOscura } from "./franja_oscura";
import { Rio } from "./rio";
import { ManoAgua } from "./mano_agua";
import { Espejo } from "./espejo";
const REAL: Record<string, AssetFC> = {
  pared_sombras: ParedSombras, cueva_corte: CuevaCorte, prisioneros: Prisioneros, prisionero_libre: PrisioneroLibre,
  muro_bajo: MuroBajo, fuego: Fuego, tunel_ascenso: TunelAscenso, exterior_sol: ExteriorSol,
  vacio_luz: VacioLuz, dialogo: Dialogo, epocas: Epocas, reflejo: Reflejo, huevo: Huevo,
  doble_rendija: DobleRendija, ojo_observador: OjoObservador, mundo_render: MundoRender, servidor: Servidor,
  marco: Marco, brasero_cartas: BraseroCartas, mapa_imperio: MapaImperio, susurro: Susurro, proclamacion: Proclamacion, arenga: Arenga, golpe: Golpe, mensajero: Mensajero, cofres: Cofres, senado: Senado, campamento: Campamento, palacio: Palacio, siria: Siria,
  tinaja: Tinaja, encuentro: Encuentro, diogenes: Diogenes, fuente_nino: FuenteNino, alejandro: Alejandro, asamblea: Asamblea, multitud: Multitud, sabios: Sabios, dos_destinos: DosDestinos, agora: Agora, india: India,
  academia: Academia, platon: Platon, alumnos: Alumnos, pollo: Pollo, puerta: Puerta, huellas: Huellas, alfombra: Alfombra, definicion: Definicion, unas: Unas,
  banquete: Banquete, esclavos: Esclavos, pierna_torcida: PiernaTorcida, parpados: Parpados, vendaje: Vendaje, escuela_mar: EscuelaMar, marco_lee: MarcoLee, oficina_grito: OficinaGrito, insomnio: Insomnio, circulo_control: CirculoControl,
  ugarit: Ugarit, naves_mar: NavesMar, sala_ugarit: SalaUgarit, dictado: Dictado, tablilla: Tablilla, mapa_bronce: MapaBronce,
  armero: Armero, campo_seco: CampoSeco, hitita: Hitita, hambre: Hambre, relieve_egipto: RelieveEgipto, excavacion: Excavacion, homero: Homero, celular_estano: CelularEstano,
  // kit de look (D123): ambiente, personaje y escenarios componibles
  particulas: Particulas, rayos_luz: RayosLuz, estrellas: Estrellas, nubes: Nubes, niebla: Niebla, bokeh: Bokeh, figura: Figura, cielo: Cielo, mar: Mar, colinas: Colinas, calle: Calle, sala_arcos: SalaArcos, vela: Vela, ballena: Ballena, mapa_mundo: MapaMundo,
  volcan: Volcan, cabana: Cabana, campo_maiz: CampoMaiz, criatura: Criatura,
  galera_teseo: GaleraTeseo, puerto_atenas: PuertoAtenas, carpintero: Carpintero, celda: Celda, vasija_minotauro: VasijaMinotauro, cuerpo_barco: CuerpoBarco,
  cleopatra: Cleopatra, saco_cesar: SacoCesar, alejandria_noche: AlejandriaNoche, cabeza_pompeyo: CabezaPompeyo, ptolomeo_furia: PtolomeoFuria, pasillo_guardias: PasilloGuardias, nilo_ahogo: NiloAhogo, banquete_nilo: BanqueteNilo, foro: Foro, senadores_odio: SenadoresOdio, templo_venus: TemploVenus, idus_marzo: IdusMarzo, huida_barco: HuidaBarco, octavio_consejo: OctavioConsejo, cesarion: Cesarion,
  piramide: Piramide, guiza_crecida: GuizaCrecida, barco_piedra: BarcoPiedra, puerto_fuego: PuertoFuego, almacen_rollos: AlmacenRollos, biblioteca_alejandria: BibliotecaAlejandria, galeria_papiros: GaleriaPapiros, papiro_merer: PapiroMerer, merer: Merer, cantera_tura: CanteraTura, aldea_obreros: AldeaObreros, ovni: Ovni,
  tutankamon: Tutankamon, mascara_tut: MascaraTut, tumba_tesoro: TumbaTesoro, valle_reyes: ValleReyes, templo_amon: TemploAmon, muro_nombres: MuroNombres, baston: Baston, ataudes_hijas: AtaudesHijas, trono_oro: TronoOro,
  imagen_ia: ImagenIa, medalla: Medalla, formulas: Formulas, pantalla_pc: PantallaPc, fabrica_robot: FabricaRobot, proteina: Proteina, reloj_agujas: RelojAgujas,
  espacio: Espacio, cabina_nave: CabinaNave, saturno: Saturno, gargantua: Gargantua, agujero_gusano: AgujeroGusano, endurance: Endurance, ranger: Ranger, planeta: Planeta, tars: Tars, tormenta_polvo: TormentaPolvo, cuarto_murph: CuartoMurph, base_nasa: BaseNasa, superficie_miller: SuperficieMiller, hielo_mann: HieloMann, edmunds_campo: EdmundsCampo, teseracto: Teseracto, estacion_cooper: EstacionCooper, reloj_pulsera: RelojPulsera, cama: Cama, monitor_mensaje: MonitorMensaje, frontera: Frontera,
  sisifo_roca: SisifoRoca, montana_sisifo: MontanaSisifo, tanatos: Tanatos, camus_escribe: CamusEscribe, rutina: Rutina, cafe_risa: CafeRisa,
  dormitorio: Dormitorio, anillo_oro: AnilloOro, caja_fuerte: CajaFuerte, cruceta_hilos: CrucetaHilos, oveja: Oveja, trono_lidia: TronoLidia, corona: Corona, pergamino: Pergamino, balanza: Balanza, camara_vigilancia: CamaraVigilancia, ojo: Ojo, franja_oscura: FranjaOscura,
  rio: Rio, mano_agua: ManoAgua, espejo: Espejo,
  burro: Burro, erizo: Erizo, bosque_nevado: BosqueNevado, aura_puas: AuraPuas, schopenhauer: Schopenhauer, heno: Heno, cubo_agua: CuboAgua, sala_tv: SalaTv,
  manuscrito_voynich: ManuscritoVoynich, simbolos_voynich: SimbolosVoynich, biblioteca_noche: BibliotecaNoche, despacho_cripto: DespachoCripto, escritorio_cripto: EscritorioCripto, frascos_botica: FrascosBotica, alambique: Alambique, mano_pluma: ManoPluma,
  big_ear: BigEar, onda_radio: OndaRadio, impresion_wow: ImpresionWow, sala_ordenador: SalaOrdenador, mesa_ehman: MesaEhman, cocina_70: Cocina70, galaxia_espiral: GalaxiaEspiral, radio_disco: RadioDisco, cometa: Cometa, satelite: Satelite,
};

export const ASSETS: Record<string, AssetFC> = Object.fromEntries(Object.keys(CATALOG2D.assets).map((id) => [id, REAL[id] ?? makePlaceholder(id)]));
export type AssetMeta = { kind: string; aspect: number; anchor: [number, number]; par: number };
export const META = CATALOG2D.assets as unknown as Record<string, AssetMeta>;
