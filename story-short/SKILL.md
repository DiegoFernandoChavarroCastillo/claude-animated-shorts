---
name: story-short
description: Hace un short vertical narrativo para YouTube Shorts, de 60 a 70 s (1080x1920) en estilo 2D ilustrado con luz, color y animación (temas visuales elegidos por video): historias reales, alegorías, mitos, curiosidades contadas como misterio y reflexiones (historia, filosofía, ficción) con voz en off local, subtítulos palabra por palabra, sombras y luz 2D, efectos de sonido y cama sonora, renderizado con Remotion en el PC del usuario. Úsalo cuando el usuario pida un "short de historia", "el mito de…", "una alegoría", "un relato", "una curiosidad contada como historia", "por qué pasa X" (historia o naturaleza), "como los videos de reglas/ficción oscura" o diga "usa el skill story-short". Para divulgación con objetos 3D, usa explainer-short.
---

# Story short (motor 2D)

Mismo repo y mismo pipeline que `explainer-short` (voz, alineación, mezcla, QA y publicación), con `meta.engine: "2d"` en el story. Plan, decisiones y medidas: `docs/PLAN_STORY_2D.md`. La raíz es la carpeta del repo; Python: `.venv/bin/python` (Linux) y `REMOTION_TMP` siempre puesto.

## Pasos (en `out/<id>/`)
| # | Paso | Artefacto |
|---|---|---|
| 1 | Investigación: texto original del relato y ≥2 fuentes por **hecho ancla** (verifica contra el texto primario; separa lo que dice el autor de la interpretación) y una sección **«Huecos»**: lo que las fuentes no cuentan, donde irá la ficción | `01_research.md` |
| 1b | **Ángulo** (D123): antes de escribir, las seis decisiones de `## Ángulo` (pregunta-paradoja, qué está en juego, 2–4 cifras con su imagen, clímax panorámico, remate, por qué se compartiría). Si no aparecen la pregunta, el clímax o el remate, el tema aún no tiene video: busca otro momento u otro dato. Guía: `story2d_script_es.md` → «Ángulo» | sección de `02_SCRIPT.md` |
| 2 | **Elegir la anécdota** (una sola, con remate: si el texto cubre años, el mejor momento) y la dramatización tú mismo (nivel `ficcion: fiel/dramatizada/libre`; punto de vista **`cercano` (tercera persona) por defecto** o `testigo`; **nunca `tu` en historias reales**, el validador lo rechaza; tabla «Dramatización» de `story2d_script_es.md`) la estructura (**`drama`** para un personaje con una anécdota, **`alegoria`** para mitos y experimentos mentales, **`enigma`** para curiosidades y sucesos colectivos sin protagonista único; nada de estructuras conceptuales inventadas como «tres apuestas»), el cierre (**`bucle`** o **`remate_cta`**, ver abajo) y el **tema visual** (ver «Temas visuales»). Ver «Lo primero» en `story2d_script_es.md` (11 nov: en qué se diferencian los videos que gustaron de los que no). No se le pregunta al usuario: decláralo todo en una línea al proponer los ganchos (estructura, cierre, tema y por qué). Elegir gancho y cierre con el usuario: propón 3 ganchos y pasa la «prueba de los 3 s» de `story2d_script_es.md` (afirmación chocante, o **pregunta con la paradoja dentro**: una cifra, un nombre propio o un contraste; ≤11 palabras, sin abstracciones ni introducciones suaves); gancho `escena`/`mito`/`y_si`/… sobre el momento de la anécdota y con el protagonista por su nombre, y el cierre que elegiste. Lo nuevo se describe en `## Fórmulas nuevas` (y una estructura nueva lleva `beats:`) | cabecera de `02_SCRIPT.md` |
| 3 | Guion con `templates/prompts/story2d_script_es.md` (estructura `drama` o `alegoria`, **cabecera `pacing: viral`**, `ficcion`/`pov` y sección `## Ficción` con anclas e inventado; una escena contada en orden y en tercera persona, frases completas con sujeto, sin «según/cuentan que» en la voz) y validar: `.venv/bin/python pipeline/validate_script.py out/<id>/02_SCRIPT.md` | `02_SCRIPT.md` |
| 3b | **Crítico de guion** (etapa `review-script`, **antes de la voz**): un agente independiente califica solo el TEXTO (gancho, retención, narrativa, **drama** —¿película o documental?—, ritmo verbal, cierre, fidelidad a los hechos ancla; umbrales en `templates/review.json` → `script`). Si lo devuelve, corrige `02_SCRIPT.md`, `validate_script.py` y relanza: `make_short.py review-script --id <id>`. **`tts` no arranca sin esta aprobación** (así Diego se genera una sola vez). Tras 3 devoluciones, consulta al usuario | `06a_script_review.md/json` |
| 4 | Plan visual: `05_story.json` con `meta.engine: "2d"` y **`meta.theme`**. Cada beat con fondo, sujeto y ambiente; cada cifra con su imagen (tabla «Qué recurso para qué frase»); el `climax` con cámara `reveal`; con `remate_cta`, `ShareCTA` o `ChatMock` en el último beat. Assets: `.venv/bin/python tools/catalog_search2d.py <palabras>`; ids de `templates/catalog2d.json`. Ejemplo vigente: `templates/examples/ano-sin-verano/` (D123: `enigma`, `remate_cta`, tema `drama_oscuro` + `vivo`, kit y overlays de datos; con `make_story.py`). `solipsismo-viral` y `mito-caverna` son ejemplos anteriores | `05_story.json` |
| 5 | **Crítico del story** (etapa `review`, solo cambios visuales y de ritmo: el texto ya está aprobado y cada cambio de texto regenera voz; entre `validate-story` y `stills`): un agente independiente califica el story de 0 a 10 (gancho, retención, narrativa, ritmo verbal, coherencia visual, cierre en bucle). Si no pasa (total ≥7,5, gancho ≥7, ninguna dimensión <5) lo **devuelve** con las correcciones: corrígelo, `validate-story` y relanza `review`. Tras 3 devoluciones se para y se consulta al usuario | `06_review.md`, `06_review.json` |
| 6 | `stills` → mirar la hoja → arreglar → `all`. Con un tema `probado: false` en `themes2d.json`, saca antes su lámina (`tools/look_sheet.py`) y ajústalo | `03`–`11` |
| 7 | Una ronda de verificador independiente (`templates/prompts/verificador.md`, adaptando a 2D) | notas |
| 8 | Render final: `all --force render,mix,mux,qa,publish` (escala 1). Con ficción, la descripción lleva «Basado en hechos reales (fuente). Escenas dramatizadas.» | `09_final.mp4` |

## Temas visuales (D123): Claude elige el mejor para cada video
Un tema es la dirección de arte entera (paletas con cielo en degradado, luces, capas de ambiente, cama sonora y acabado). Va en `meta.theme` (y `meta.themeAlt` si el video salta a otro mundo con `palette_shift`, máximo 2). Definidos en `templates/themes2d.json`, con su `look`, su `when` y los criterios `elegir`. No se pregunta: se declara con el porqué.

| Tema | Cuándo es el mejor |
|---|---|
| `vivo` | Curiosidades, naturaleza, costumbres, humor. Por defecto si nada más encaja |
| `noche_calida` | Tradiciones, fiestas, homenajes, historias emotivas |
| `marmol` | Grecia y Roma, filosofía con anécdota |
| `pergamino` | Historia antigua con viajes, imperios, rutas, cartas |
| `drama_oscuro` | Traiciones, muertes, guerras, tragedias, misterio |
| `submarino` | Mar, animales, exploración |
| `cosmos` | Espacio, tiempo, escalas enormes, existencial |
| `sueno` · `ciudad` · `tinta` | Alegorías y «¿y si…?» · historia moderna e inventos · leyendas y terror (aún `probado: false`) |

Criterios, en orden: (1) emoción dominante del ángulo; (2) época y lugar; (3) dónde ocurre el clímax; (4) que el texto blanco y amarillo se lea en la franja de subtítulos; (5) variedad: `tools/recent_formulas.py` muestra los temas recientes; no repitas uno tres veces seguidas salvo que sea claramente el mejor. `ingest_stats.py` compara temas con las estadísticas del canal.

**Reglas del look** (las comprueba `validate_story2d.py` cuando hay tema): paletas y luces del tema; ≥3 capas por beat con al menos una de ambiente; con tema, el motor pinta el cielo en degradado, desenfoca lo muy lejano y lo que pasa por delante, pone ruido de película (sustituye al grano de motas), acciones con resorte y cámara con micro-deriva. Sin `meta.theme` todo se pinta como antes (videos ya hechos).

**Kit para que cualquier video se vea bonito sin dibujarlo todo** (`catalog_search2d.py`; opciones en `opts` de la capa, descritas en el `when` de cada asset):
- Ambiente: `particulas` (polvo, chispas, burbujas, nieve, hojas, confeti, humo, notas), `rayos_luz`, `estrellas`, `nubes`, `niebla`, `bokeh`.
- Escenarios: `cielo` (sol/luna con halo), `mar`, `colinas`, `calle` (colonial/moderna/antigua, ventanas que se encienden, guirnalda, farolillos), `sala_arcos` (academia, palacio, senado, templo), `mapa_mundo` (plano o globo, `route`, `light_points`).
- Personajes y props: `figura` (cualquier época: ropa, pelo, barba, tocado, gesto, pose; acciones `point`, `cheer`, `fear`, `wave`, `talk`, `walk`, `nod`, `turn`, `sit`, `bow`; respira y parpadea siempre), `vela`, `ballena`.
- Multitudes: `repeat: {n, cols, dx, dy, depth, jitter, stagger}` en cualquier capa (con `figura` y `opts.vario: true`, gente distinta; con `vela` y la acción `light`, se encienden en cascada). Máx. 80 copias.
- Luces puntuales: `scene.lights: [{at: [x, y], r, color?, a?, flicker?}]` (una ventana, una antorcha, el foco del drama).
- Cámara `reveal` (de un detalle al plano completo, para el `climax`); acción genérica `launch` (sale despedido en arco, girando).
- Kit de sombreado para assets nuevos: `assets/shade.tsx` (`Grad`, `Vol`, `Halo`, `ContactShadow`) e `idle()` de `assets/common.ts`. Toda forma grande con degradado, todo personaje con sombra de contacto, luz de borde y movimiento de reposo.

Un asset propio sigue haciendo falta cuando la voz nombra algo concreto que el kit no tiene (fidelidad visual): hazlo con el kit de sombreado. Ejemplos de cada tema: `tools/look_sheet.py OUT [tema…]`.

## Qué recurso para qué frase (D123: cifra = imagen)
| La voz dice… | Se ve | Recurso |
|---|---|---|
| Una cifra grande o una distancia | Un número que cuenta (desde 0 o desde otro valor) | `StatCallout` (`from`) |
| Una cantidad abstracta (kilos, litros, años) | La cantidad en cosas que se cuentan: «= 2 elefantes» | `Equivalence` |
| Una fecha | Hojas de calendario que pasan hasta el día | `Calendar` |
| Una hora, que pasa el tiempo | Un reloj que corre (11:57 → 12:00) | `ClockChip` (`from`), `Countdown`, `Stopwatch` |
| Un viaje, una ruta, una expansión | Mapa con la ruta que se traza o los puntos que se encienden | `mapa_mundo` + `route` / `light_points` (+ `StatCallout`) |
| Muchos (gente, velas, barcos) | Una multitud que aparece en cascada | `repeat` |
| Temperatura, nivel, proporción, «1 de cada 10» | Termómetro, medidor, cuadrícula | `Thermometer`, `Gauge`, `DotGrid`, `ProgressRing` |
| Antes y después, A contra B | Dos tarjetas enfrentadas | `VersusCard`, `BarCompare` |
| Una secuencia de hechos en el tiempo | Línea de tiempo | `Timeline` |
| Un salto al pasado | La imagen cambia de mundo | `palette_shift` (a la paleta de `themeAlt`) |
| Lo que piensa alguien | Burbuja de pensamiento | `ThoughtBubble` |
| Un nombre o un rótulo | Una etiqueta | `Pill` (como mucho el 60 % de los overlays: un rótulo nombra, no muestra) |

El validador (con tema y perfil viral) rechaza un beat que dice una cifra y no muestra nada.

## Cierre: `bucle` o `remate_cta` (D123)
`bucle`: la última frase queda abierta y el gancho la continúa; el video se repite solo (filosofía, «¿y si…?», remates que son un gesto). `remate_cta`: el `[twist]` dice el remate («no es X, es Y») y la `[cta]` es una invitación de ≤12 palabras ligada al tema, con `ShareCTA` (avatares, Seguir/Compartir, cursor, confeti) o `ChatMock` (chat que se escribe solo) sobre la escena del remate, 3–5 s; casi siempre en `enigma` y en temas que se comparten por orgullo, ternura o asombro. No hay datos fiables de cuál rinde más: se mide en el canal con `ingest_stats.py`.

## Formato YouTube Shorts (D121)
Solo se produce para YouTube Shorts (el mismo video se sube a TikTok para ganar seguidores). Las historias duran **60–70 s** (11 nov, a pedido del usuario: los videos que gustaron duraban 60–72 s; con 35–59 s la historia se comprimía). El explainer sigue en 35–59 s (D121). En el story: `meta.hookTitle` (2–7 palabras, ≤40 letras) es el gancho escrito que se ve completo desde el frame 0 hasta el final del gancho, en la franja de los subtítulos (lo exige el QA; la primera palabra clave sale en color), y `meta.topic` la palabra clave de búsqueda que va delante del gancho en el título de YouTube. El primer beat abre con la imagen más fuerte ya en cuadro. Gancho de `revelacion` (el desenlace primero, el cómo después) disponible para historias con un final visual.

## Dramatización (D118)
Los shorts de historia sonaban a documental (crónica en pasado, «según el historiador…», moraleja al final). Regla: **los hechos ancla no se tocan; el cómo se inventa** (gestos, sensaciones, pensamientos, un testigo, frases privadas fieles al personaje). Lo elige quien escribe con `templates/dramatizacion.json` y la tabla de `story2d_script_es.md`; `validate_script.py` exige `pov` y la sección `## Ficción` y limita las muletillas de crónica (≤1 con `dramatizada`, 0 con `libre`); el crítico de guion puntúa `drama` y `fidelidad`. En el story, la ficción se pone en escena: caras que reaccionan, el detalle sensorial que dice la voz en pantalla, planos cerrados en la tensión.

## Etapa `review` (crítico del story)
`make_short.py --id <id> review` (también dentro de `all`; solo motor 2D). Por defecto lanza `claude -p` sin herramientas ni sesión (contexto limpio) con `templates/prompts/critico_story.md` sobre `06_review_request.md` (guion con tiempos reales, `shows`, acciones y métricas). El total, el veredicto y los umbrales (`templates/review.json`: pesos, `minTotal`, `minGancho`, `minDimension`, `maxRounds`) los calcula `pipeline/review_story.py`, no el agente. La calificación caduca si cambian `02_SCRIPT.md` o `05_story.json`. `--reviewer manual` solo prepara la petición y espera un `06_review.json` escrito por otro agente (p. ej. un subagente con el mismo prompt); `--no-story-review` la omite y queda anotado en el log. El crítico trabaja dentro de 60–70 s: si algo sobra, se recorta o se cambia por algo más fuerte. `templates/examples/solipsismo-viral/` es el ejemplo del **formato** (estructura, marcas de tiempo, SFX); el crítico lo califica ~6, así que no lo tomes como vara editorial.

## Perfil viral (`pacing: viral`, por defecto en los videos nuevos)
Config única: `templates/pacing_viral.json`. En el guion: 60–70 s (170–240 palabras, `story2d` en el perfil), gancho chocante ≤11 palabras sin introducción suave, frases ≤12 palabras, cierre en bucle abierto que enlaza con la primera palabra del gancho. En el story: `meta.pacing: "viral"`, `meta.voice.speed: 1.13`, `meta.captionEmphasis: "accent"`, `keywords` por beat. El pipeline aplica solo: voz +13 % y pausas ≤150 ms; `impact` en el segundo 0, `whoosh_soft` por cambio de escena y `riser` antes de `rupture`/`climax`/`twist`; un cambio en pantalla cada ≤3 s (objetivo 2–2,5 s) y cámara siempre en movimiento; subtítulos de 1–3 palabras, grandes, en la franja 0,62–0,78 del alto con la palabra clave en amarillo (capas con los pies en y ≤0,62; overlays solo en `top`/`upper`/`center`); QA con rangos propios (silencio 2–14 %, 3,3–4,3 pal/s, duración 58–72 s). Detalle y system prompt: `templates/prompts/story2d_script_es.md`.

Voz: la definitiva es la de Diego (`chatterbox`/`diego`; con el perfil viral `speed` 1,13 y pausas ≤150 ms, sin `pauseScale`; sin el perfil, `pauseScale` ~0,7 y para alargar el video añade palabras, no pausas). Música propia: `"musicFile": "voices_local/<archivo>"` y `"musicGain"` en `meta` (con `"music": false`). Para iterar usa `"voice": {"engine": "kokoro", "voice": "em_alex"}` (rápida, ~2 min); `chatterbox`/`diego` para la versión definitiva (~20 min). Cama sonora: `"music": true, "musicMood": "tense"`.

## Reglas del story 2D (las comprueba `pipeline/validate_story2d.py`, que lista todos los problemas de una vez)
- Un beat por línea del guion, con `shows` (qué se ve). Capas: `{asset, z, at:[x,y] (0–1), scale, id?, init?}`; `at` es el punto de anclaje (por defecto, los pies).
- Cámara 2D: `push_in`, `pull_out`, `pan_slow` (con `to`), `reveal` (clímax), `hold`; `shots` (≤3 por beat, ≥1,5 s entre sí) para cambiar de plano dentro de un beat largo.
- Acciones genéricas (`appear`, `vanish`, `tremble`, `pop`, `slide`, `scale`, `launch`, `flash`, `camshake`, `palette_shift`) y propias de cada asset (`shadow_pass`, `stand_up`, `walk`, `carry`, `flare`, `light_grow`, `sunrise`). Máx. 3 por beat; al menos la mitad de los beats con acción. `init` deja una acción propia ya aplicada (p. ej. el prisionero de pie).
- Ritmo: un evento (acción, overlay o sub-plano) como mucho cada 2,5–3 s (viral: cada 2–2,5 s, tope 3 s); ≤3 cortes por minuto; gancho ≤3 s con acción antes de 1 s; con cierre `bucle`, el último beat repite paleta y assets del primero y `tailS` ≤ 0,3.
- Overlays: todos los no anclados de `templates/catalog.json` (ver «Qué recurso para qué frase»; `IconFlow` de ≤3 pasos: con 4 se sale del cuadro). Nunca encima del protagonista.
- `crossfade` entre dos beats con los mismos assets no hace fundido (evita ver dos copias desfasadas): mantén la cámara continua.
- **Textura:** las zonas lisas y oscuras hacen que el QA de movimiento crea que el plano está quieto aunque la cámara se mueva. Los assets llevan grano (`assets/grain.tsx`); si sale una racha estática, mueve más la cámara (zoom o pan) o añade grano antes de relajar nada.

## Assets y cómo añadir uno
Más de cien en `catalog2d.json` (búscalos con `catalog_search2d.py`; el kit genérico está en «Temas visuales»). Uno nuevo: `studio/src/flat2d/assets/<id>.tsx` (lienzo de 100 de ancho × 100·aspect), registrarlo en `assets/registry.tsx` y en `catalog2d.json` (aspect, anclaje, `par`, `when`, `tags`, acciones propias); `tools/gallery2d.py` para verlo. Estilo: colores de la paleta (nunca hex sueltos salvo luz), ≥4 partes, nada de sustitutos de lo que dice la voz; con el kit de sombreado (`shade.tsx`) y movimiento de reposo (`idle`); opciones fijas en `opts` (`opt()` de `common.ts`).

## Antes de dar algo por terminado
`.venv/bin/python tools/run_tests.py` y `.venv/bin/python tools/regression_check.py` (el 3D no debe cambiar). `make_short.py` para con error si el QA tiene ❌ (`--allow-qa-warnings` solo si el usuario lo acepta y se dice).
