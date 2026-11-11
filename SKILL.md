---
name: explainer-short
description: Hace un short vertical explicativo en formato YouTube Shorts, de 35 a 59 s (1080x1920) estilo "Explainer 2.5D", en español o en inglés. Escenas 3D estilizadas con un objeto protagonista, que Claude alterna beat a beat con dioramas 2.5D de láminas pintadas e ilustraciones 2D cuando cuentan mejor la idea, subtítulos palabra por palabra con caja de selección, overlays de datos con fuente, voz local (Chatterbox) y efectos de sonido, renderizado con three.js dentro de Remotion en el PC del usuario. Úsalo cuando el usuario pida un "video explicativo", un "short de curiosidad", un video "como los de explicación con subtítulos", un "explainer short", "explain why X in a short video", o diga "usa el skill explainer" / "use the explainer skill". Acepta `es` y `en`.
---

# Explainer short (es / en)

Un prompt → un video. Claude hace la parte creativa (investigación, guion, plan visual y revisión). `pipeline/make_short.py`
hace todo lo determinista (voz, alineación, validaciones, render, mezcla y QA).

**La carpeta de este skill es la raíz del repo.** Todos los comandos se ejecutan desde ahí. Python del proyecto:
`.venv/bin/python` en Linux y `.venv\Scripts\python.exe` en Windows (abajo, `PY`).

> **¿Historia, mito, alegoría o reflexión en lugar de divulgación?** Usa el skill `story-short` (motor 2D, mismo pipeline; ver `story-short/SKILL.md`). Antes de comitear cambios en archivos compartidos, corre `tools/regression_check.py`.

## Antes de empezar

1. Idioma: el que pida el usuario (`es` o `en`). Si no lo dice, el del prompt.
2. `id` del video: corto, en minúsculas y con guiones (`hielo-flota`). Todo va a `out/<id>/`, que no se sube a Git.
3. Antes del guion, el usuario elige gancho, estructura y cierre (paso 1b). Si además pide revisar el guion (o dice `--review`), para tras el paso 3 y espera su "ok".
4. Si falta el entorno (`.venv`, `studio/node_modules`, `.venv-chatterbox`), sigue el `README.md` → "Instalación".

## Pipeline

| # | Paso | Quién | Artefacto en `out/<id>/` |
|---|---|---|---|
| 1 | Investigación: hechos con **≥2 fuentes** cada uno (búsqueda web) | Claude | `01_research.md` |
| 1b | **Elegir gancho, estructura y cierre**: Claude propone 3 de cada uno y recomienda; el usuario elige | Claude + usuario | cabecera de `02_SCRIPT.md` |
| 2 | Guion con `templates/prompts/script_es.md` o `script_en.md` y lo elegido en 1b | Claude | `02_SCRIPT.md` |
| 3 | Validar el guion: `PY pipeline/make_short.py validate-script --id <id>` | pipeline | pasa o falla con motivos |
| 4 | Plan visual con `templates/prompts/story_es_en.md` y `templates/catalog.json` | Claude | `05_story.json` |
| 5 | Todo lo demás: `PY pipeline/make_short.py all --id <id> --scale 0.5` | pipeline | `03`–`10` |
| 6 | Revisión visual (look-match) con un agente verificador **distinto** | Claude + agente | notas y arreglos |
| 7 | Render final: `PY pipeline/make_short.py all --id <id> --force render,mix,mux,qa` (escala 1) | pipeline | `09_final.mp4` |
| 8 | Paquete de publicación (se genera solo al final de `all`): revisarlo y afinarlo | pipeline + Claude | `11_publish.md`, `11_cover.png` |

### 1. Investigación (`01_research.md`)

- Cada dato y cada número, con **al menos 2 fuentes** (URL). Nada de memoria: si no hay fuente, el dato no entra.
- Busca lo que se pueda **ver** (objetos, procesos, comparaciones), porque cada paso del guion necesita una imagen.

### 1b. Elegir gancho, estructura y cierre (pregunta siempre antes de cada video)

Cuando ya hay hechos con fuente y **antes de escribir el guion**, Claude propone y el usuario elige. El catálogo está en
`templates/formulas.json` (10 tipos de gancho, 5 estructuras, 5 cierres y 12 `formatos` de inspiración); el criterio de
elección, en su apartado `elegir`. **El catálogo es una caja de herramientas, no un menú cerrado (D120):** puedes inventar
un tipo de gancho, una estructura o un cierre para este tema si cuenta mejor la idea.

1. Mira qué usaron los últimos videos: `PY tools/recent_formulas.py 5`. No repitas el mismo tipo de gancho ni la misma
   estructura que el video anterior, salvo que el tema lo pida de verdad. Antes de elegir, piensa qué **formato** (premisa
   del video entero: ¿qué pasaría si…?, cuenta atrás, eres la cosa, cambio de escala, juicio…) sacaría lo mejor del tema.
2. Según los hechos de `01_research.md`, elige **tres candidatos de cada cosa** y decide cuál es el mejor:
   - **Gancho:** tres tipos distintos, cada uno ya redactado para este tema (≤12 palabras, 2.ª persona, concreto). **Puntúa** antes
     de proponer (0–2 cada criterio): concreto (nombra la cosa), conflicto (choca con algo que cree o hace), 2.ª persona, promesa que el
     video cumple, se dice en ≤3 s (8–9 palabras). Propón los tres de mayor suma y recomienda el primero.
   - **Estructura:** tres, cada una con su esquema en una línea ("gancho → tres datos → giro → cierre").
   - **Cierre:** tres, con la frase ya redactada.
   - **Comodín (D120):** entre los tres ganchos, al menos uno es un **tipo nuevo**, y entre las tres estructuras, al menos
     una es **nueva**, diseñada para este tema (con su esquema de roles). No vale renombrar algo del catálogo: tiene que cambiar
     cómo se cuenta. Se puntúa igual que los demás; si el comodín gana, recomiéndalo.
   **Cierre (F16): recomienda `bucle` salvo que el tema pida otra cosa.** `envia`, `pregunta` y `sigue` son despedidas predecibles que
   invitan a deslizar: ofrécelas solo si el usuario las pide. Con `bucle`, el story lleva `meta.tailS: 0.2` (el validador lo exige).
3. Pregunta con `AskUserQuestion`, **las tres preguntas en una sola llamada**: "¿Qué gancho quieres?", "¿Qué estructura?",
   "¿Qué cierre?". La primera opción es tu recomendación, con "(Recomendado)" en la etiqueta y, en la descripción, una frase
   de por qué encaja con **este** tema. Etiquetas tipo `A · pregunta: "¿Te has preguntado…?"`; el comodín, tipo
   `C · nuevo · cuenta_atras: "Te quedan 8 minutos…"`.
4. Si el usuario ya eligió en su mensaje ("con gancho de mito"), no preguntes esa parte. Si contesta "tú decide" (o
   no hay forma de preguntar), usa lo recomendado y dilo en la entrega.
5. Anota lo elegido en la cabecera de `02_SCRIPT.md` (`hook:`, `structure:`, `closing:`); el validador comprueba que el
   guion tenga la forma de cada uno. Si alguno es nuevo, descríbelo en la sección `## Fórmulas nuevas`
   (`- nombre: patrón en una frase`); una estructura nueva declara además `beats: hook > … > twist > cta` (≥5 roles
   en snake_case: empieza en `hook`, acaba en `cta` y lleva `twist`). Formato y ejemplo: `script_es.md` → «Fórmulas nuevas».
6. **Sé honesto con la recomendación:** son patrones establecidos (curiosidad concreta, primeros segundos, lenguaje directo),
   no resultados medidos en este canal. No prometas que un gancho "rinde más" con cifras. Detalle y fuentes: `docs/FORMULAS.md`. Una fórmula
   nueva tampoco está probada: dilo así, sin venderla como mejor.

### 2. Guion (`02_SCRIPT.md`)

Sigue el prompt del idioma al pie de la letra, con el gancho, la estructura y el cierre elegidos en el paso 1b (la
estructura `mito` es hook → tension → mechanism → layer2 → twist → cta; las otras están en el prompt). Siempre: 95–160
palabras (**formato YouTube Shorts, D121: el video dura 35–59 s**; YouTube reparte ingresos con Shorts de cualquier duración y un
video corto se ve entero y se repite más; el mismo video se sube a TikTok solo para ganar seguidores. La voz da ~2,7 palabras/s, así
que ~120–145 palabras ≈ 45–55 s), gancho ≤12 palabras en 2.ª persona, números en palabras y con fuente, frases de ≤22 palabras.
Cosas de la voz que el validador también comprueba o que conviene saber:
- **(es) No juntes dos sonidos "ll"/"y" seguidos** entre palabras ("una botella llena"): la voz hace una pausa como
  si hubiera una coma. El validador lo marca como error (D60).
- Las preguntas de sí/no ("¿Te has preguntado…?") salen con el final ascendente automáticamente (D61). Las que
  empiezan por un interrogativo ("¿Qué…?", "What…?") terminan bajando, que es lo natural.

### 3. Validar el guion

`PY pipeline/make_short.py validate-script --id <id>`. Si falla, corrige **solo** lo que dice el motivo y repite.

### 4. Plan visual (`05_story.json`)

- Solo se pueden usar los ids de `templates/catalog.json` (entornos, luces, objetos y poses, cámaras, transiciones,
  overlays, iconos, SFX); cada entrada dice cuándo usarla ("when"). El catálogo es grande: primero lista los conceptos
  visuales del guion y búscalos con `PY tools/catalog_search.py <palabras>` (ver `templates/prompts/story_es_en.md`).
- **Huecos (F19):** si un concepto central no tiene objeto, **créalo** (ver «Objeto que falta»). Prohibido sustituirlo por uno de otra cosa
  (un teléfono por un portátil, un circuito por «el show»): el espectador ve lo que oye. Solo lo secundario puede ir a `05_gaps.md`. El validador
  falla con el mismo objeto en más de 3 beats seguidos o en más del 65 %.
- Un beat por línea del guion, con el `text` **idéntico** (los subtítulos y la voz salen de ahí).
- Cambia de entorno solo al cambiar de lugar o de idea. Cada `mechanism` lleva su objeto protagonista y al menos un
  overlay de dato.
- Varía los encuadres: dos beats seguidos con el mismo objeto no deben repetir preset de cámara.
- **Objeto que falta (F14, F19):** si un concepto central no tiene objeto en el catálogo (puntuación 0 en `catalog_search.py`), **créalo en este
  video**: hasta **5 prefabs por video** en `studio/src/explainer/heroes/primitive/custom.ts` (~100–150 líneas cada uno), registrados en `heroes/index.ts`
  y en el catálogo con `PY tools/add_heroes.py <tags.json>`. Reglas: (1) **busca antes de crear** en el catálogo y en `custom.ts`; (2) **nivel de
  detalle:** silueta reconocible, al menos 5 partes distintas, 2–3 materiales y escala coherente (una manilla lleva banda con trama, cierre, módulo con
  LED, placa, chip y pila; una consola, faders, perillas, botones y pantalla; un estadio, gradas escalonadas, muro, escenario y público); piensa en
  cómo es de verdad, con fotos mentales de la cosa real, no en un icono; (3) **si el efecto depende de una acción, pinta el estado dentro de `act`:**
  `Scene.tsx` llama a `update(f)` ANTES que a `act` y en un still suelto el estado llegaría a 0; guarda el último `f` y vuelve a pintar al final de `act`
  (ver `manilla_led`); (4) **prueba como se va a ver:** `make_short.py stills` ya saca un frame extra por beat justo después de la última acción: mira que la
  acción se vea (luces encendidas, ola, haz) y que no quede nada bajo el suelo; (5) objeto pequeño en pantalla → baja `radius` (acerca la cámara); entornos
  con casas o edificios restan: con objetos pequeños usa `tech_oscuro`; (6) un prefab plano pide cámara con movimiento real (`orbit_slow`, `spiral_in`,
  `push_in` rápido), o la racha estática falla. Medido: ~25 min por prefab con detalle; sin coste de render.
- **Estilos: 3D, 2.5D y 2D (F20). Decides tú, beat a beat, sin preguntar.** El 3D (`primitive`, `gltf`) es la base del formato: objetos y mecanismos.
  El **2.5D** (`card`, `lamina`: láminas pintadas dentro del mundo 3D, con su luz y su parallax) es para personas, anécdotas y escenas históricas. El
  **2D** (`plano`: ilustración a pantalla completa con capas en parallax, siempre con `env: "plano"`) es para ideas, esquemas, mapas, líneas de tiempo y
  muchos casos a la vez. El overlay **`Cutaway`** mete 1–3 s de un plano dentro de un beat 3D (cuenta como `Insert`). Criterio: la imagen más clara para
  cada línea; cambia de estilo cuando cambia la idea (es un golpe de ritmo), no alternes beat a beat, y lo habitual es 60–85 % de 3D (el validador falla
  con más del 50 % de `plano`). Los planos no admiten marcadores 3D (usa overlays). Guía completa, reglas técnicas y cómo crear láminas y planos:
  `templates/prompts/story_es_en.md` → «Estilos». Piloto: `out/fermi-mix` (b05 `Cutaway`, b07 `comida_fermi`, b10 `pizarra_hipotesis`). En la entrega
  di qué beats fueron 2.5D o 2D y por qué.
- **Fidelidad y limpieza visual (F19):** (1) cada beat lleva `"shows"`: una frase de lo que se ve; si la voz dice una cosa y `shows` otra, cambia
  el objeto, no la frase; (2) un overlay nunca tapa al protagonista: `NoSymbol`, `BigWord` y `Insert` grandes solo donde no quiten lo que se explica; para
  rótulos usa `Pill` en `lower` o `bottom`; dos rótulos en el mismo hueco se pisan; (3) los `Callout3D` van hacia el lado con espacio: uno cortado por el
  borde se ve mal (mira el still); (4) **revisión visual obligatoria:** hoja con todos los stills (mitad de beat y tras la acción) y un agente verificador
  distinto con `templates/prompts/verificador.md`; sus 5 notas (coincide lo dicho con lo visto, reconocible, overlays, acciones visibles, tamaño y
  encuadre), más la 6.ª (estilos) si el video mezcla 3D con 2.5D o 2D, deben ser ≥7 antes del render final. En la lista de beats que le pasas, marca el
  estilo de cada uno (3D, 2.5D, 2D, con Cutaway). Los stills ya incluyen un frame dentro de cada `Insert` y `Cutaway`.
- **Sub-planos, bucle y datos (F17):** en beats largos (>~5 s) usa `shots` (la cámara barre a otro preset a mitad de beat, sin corte duro, máx. 3
  por beat); con cierre `bucle` el último beat vuelve al entorno y objeto del primero, y la última frase no se despide (patrones de bucle
  en `templates/prompts/script_es.md`); guarda algo que solo se entienda al repetir el video. `publish` también deja `meta.json` y
  `PY tools/ingest_stats.py stats.csv` cruza tus estadísticas con el gancho, estructura y cierre de cada video.
- **Calidad como puerta (F18):** `make_short.py` **para con error si el QA final tiene avisos** (`10_qa.md`, filas ❌): un video no está terminado
  hasta que todo está en ✅ (`--allow-qa-warnings` solo si el usuario lo acepta, y se dice en la entrega). El QA ya comprueba, además de lo
  técnico, las reglas del plan: gancho ≤3,2 s con acción antes de 1 s, hueco ≤3 s sin cambios en pantalla, cola y bucle, sub-planos, densidad
  de sonido y cama sonora. **Toda función nueva lleva su prueba** en `pipeline/tests/` y se corre con `PY tools/run_tests.py` (tiene que dar TODO BIEN antes de comitear).
- **Insertos y cama (F18):** `Insert` es un corte de ~1 s con icono y cifra o frase grande (B-roll de datos, máx. 3 por video, no en el gancho; ver el prompt del
  story). `meta.music: true` añade una cama sonora sintetizada 24 dB bajo la voz (`musicMood`: tech, calm, warm; por defecto sin música). `meta.voice.pauseScale`
  (0,5–1,5) acorta o alarga las pausas; la voz se guarda **por frase** en `out/.tts_cache`, así que cambiar una línea o las pausas no repite toda la síntesis.
- **Primer fotograma (D121):** en el feed el espectador decide en un segundo y muchas veces sin sonido. `meta.hookTitle` es el gancho
  escrito (2–7 palabras, ≤40 letras; puede resumir el gancho hablado) que se ve completo desde el frame 0 hasta el final del gancho, en la
  franja de los subtítulos (que no se pintan durante ese tramo); la `keyword` del primer beat sale en color. El QA lo exige. Abre además
  con la imagen más fuerte del video ya en cuadro (no un objeto que todavía está entrando). `meta.topic` es la palabra clave de búsqueda
  del tema (≤40 letras, p. ej. «Exoplanetas habitables»): `publish_pack` la pone delante del gancho en el título de YouTube.
- **Gancho y ritmo (F16):** el primer beat se dice en ≤3 s y lleva una **acción antes de 1 s** (cámara que no sea `drift`); en todo el video
  **algo cambia en pantalla (corte, acción u overlay) al menos cada 3 s** (objetivo 2,5 s, D121); los overlays van por encima del 70 % del alto (debajo están
  la descripción y los botones de las apps). El validador lo comprueba con `words.json`.
- **Dale vida (F13):** ponle **acciones** a la mitad de los beats como mínimo: lo que el objeto hace cuando se dice la palabra (una
  línea roja que rodea la Tierra al decir "ecuador", la persona que sube al decir "despedido", chispas al decir "revienta").
  Mira "Acciones" en `templates/prompts/story_es_en.md` (qué verbo pide qué acción) y las propias de cada objeto con
  `PY tools/catalog_search.py <tema>`. El pipeline falla si hay menos de la mitad de los beats con acciones.
- Ejemplo completo y **vigente** (71 s, con todas las reglas de F16–F18: gancho, ritmo, sub-planos, bucle): `templates/examples/bluetooth-wifi/`. `hielo-flota/` (y `-en`) es el original de 54 s: úsalo solo para ver el formato.

### 5. Pipeline determinista

`PY pipeline/make_short.py all --id <id> --scale 0.5` (prueba rápida a 540x960). Etapas: validate-script → tts →
align → validate-story → stills → render → mix → mux → qa → publish. Cada etapa se salta si su artefacto ya está al día;
`--force tts,render` rehace etapas concretas. Registro en `out/<id>/log.md`. Si una etapa falla, el mensaje dice por
qué. Arregla la causa (normalmente `05_story.json`) y relanza el mismo comando.

Mira los stills de `out/<id>/06_stills/` antes de seguir. Si algo se ve roto, corrige el story y relanza. Fíjate en tres cosas
que solo se ven aquí: etiquetas (`Callout3D`) fuera de cuadro, píldoras con texto cortado y overlays en `slot: top` que tapan
los subtítulos (banda 12–30 % desde arriba; usa `lower`). Ahorra un render de ~7 min cada uno.

### 6. Revisión visual (look-match, §9 del plan)

1. `PY tools/qa/lookmatch_sheets.py --id <id>`: hojas lado a lado frente a R1 y R3 en `out/<id>/lookmatch/`. Necesita
   las referencias en `references_local/videos/` (no van en Git).
2. Lanza **un agente distinto** con `templates/prompts/verificador.md`, las tres hojas y `out/<id>/10_qa.md`.
   Devuelve una nota sobre 10 por área y una lista de arreglos.
3. Aplica los arreglos en `05_story.json`. Si el fallo es del catálogo (un entorno o un objeto que no se lee), arregla
   el componente concreto y dilo en la entrega. Rehaz con `--force stills,render,mix,mux,qa`.
4. **Máximo 3 rondas.** Después entrega con las notas pendientes.

### 7. Render final y entrega

`PY pipeline/make_short.py all --id <id> --force render,mix,mux,qa` (escala 1 = 1080x1920; `--scale 1.3333` = 1440x2560).
Entrega:
- la ruta de `out/<id>/09_final.mp4`;
- el resumen de `10_qa.md` (✅/❌ por métrica);
- la nota del verificador;
- las fuentes del guion;
- lo que quede pendiente.

## Reglas

- **El objeto reacciona a lo que dice la voz:** acciones sincronizadas con las palabras (mínimo la mitad de los beats), no solo un modelo girando.
- **Subtítulos siempre activos.** Palabra por palabra, con la palabra clave del beat en caja de selección.
- **Idioma configurable** (`es`/`en`), el mismo en voz, subtítulos y overlays.
- **Fuentes obligatorias:** cada número del video tiene una fuente en `02_SCRIPT.md` (`## Fuentes`).
- **Sin música** por defecto (`music: false`): voz + SFX, mezcla a −14 LUFS y true peak ≤ −1 dBTP.
- **Sonido con medida (F15):** 19 SFX (5 de estructura y 14 acentos generales: zap, shimmer, heartbeat, swish_up/down, blip,
  sizzle, bubbles, drip, rumble, ding, buzz_no, crack, clock_tick). Las acciones eligen su sonido solas; el director de acentos
  limita a uno por cada 3 s, sin solaparse con otro sonido, para no tapar la voz. `sfx` a mano: máximo 3 por video. Escucha
  los sonidos con `PY tools/sfx_preview.py <dir>`.
- **Nada de contenido ajeno:** las referencias de `references_local/` son solo estudio de estilo. No copies sus
  guiones, escenas ni marcas, y no las subas nunca. Nada de logos ni interfaces reales.
- **QA:** `10_qa.md` debe salir OK. Los rangos (luz, color, cortes, racha estática, frames únicos, loudness,
  silencio, palabras/s, OCR de subtítulos) están calibrados con las referencias (D57).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Prompts (guion es/en, story, verificador) | `templates/prompts/` |
| Ganchos, estructuras y cierres (catálogo y criterio de elección) | `templates/formulas.json` (con `formatos`), `docs/FORMULAS.md`, `tools/recent_formulas.py` (`--nuevas`: fórmulas nuevas usadas y candidatas al catálogo) |
| Catálogo cerrado para el story | `templates/catalog.json` (cruzado con el código en `studio/src/explainer/catalog.ts`) |
| Ejemplos | `templates/examples/` (`bluetooth-wifi` completo y vigente, `hielo-flota` el original; solo guion: `cielo-azul`, `dedos-arrugados` y uno por estructura: `agua-rara-lista`, `agua-contra-hielo`, `dedos-historia`, `atardecer-cadena`) |
| Look del video (paleta, subtítulos, cámara, luces) | `studio/src/explainer/style.ts` y `world/grade.ts` |
| Acciones sincronizadas con la voz | `studio/src/explainer/actions/index.ts` (genéricas y marcadores), `HeroDef.actions` + `HeroInstance.act` (propias de cada objeto) |
| Estilos 2.5D y 2D (F20) | Láminas: `heroes/laminas.ts` (constructor y `drawSeated`) y `heroes/laminas_custom.ts` (las de cada video). Planos: `flat/FlatScene.tsx` (render y grade 2D), `flat/kit.tsx` (`Depth`, `Subject`, `Person`, `Backdrop`, `Glow`, `Stars`, `Grain`) y `flat/custom.tsx` (los de cada video). Cámara 2D: `cam2At` en `camera/index.ts`. Corte ilustrado: `overlays/Cutaway.tsx` |
| Entornos, objetos, overlays | `studio/src/explainer/envs/` (`ciencia.ts`), `heroes/primitive/` (`body`, `micro`, `space`, `physics`, `chemistry`, `earth`, `mind`, `life`, `home`, `generic`, y sus segundas tandas `*2.ts`), `overlays/` (`Guides`, `Panels`, `Meters`, `Diagrams`) |
| Buscar en el catálogo, probar objetos | `tools/catalog_search.py`, `tools/gallery.py` (galería con stills), `tools/add_heroes.py`; prefabs de cada video en `heroes/primitive/custom.ts` |
| Pruebas y huecos | `tools/run_tests.py` (todas las pruebas y `tsc`), `tools/gaps_report.py` (huecos de catálogo por frecuencia) |
| Estadísticas | `tools/ingest_stats.py` (CSV de YouTube Studio/TikTok → `out/stats.json` y resumen por gancho, estructura y cierre), `out/<id>/meta.json` |
| Sonidos | `pipeline/sfx_synth.py` (19), `pipeline/sfx_plan.py` (qué suena y director de acentos), `tools/sfx_preview.py` (escucharlos) |
| Pruebas | `.venv/bin/python pipeline/tests/test_validate_script.py` (y `test_validate_story.py`, `test_prosody.py`) |
| Orquestador y etapas | `pipeline/` (`make_short.py`, `voice.py`, `tts/`, `align.py`, `mix.py`, `voice_fx.py`…) |
| QA | `pipeline/qa_basic.py`, `tools/qa/style_check.py`, `tools/qa/lookmatch_sheets.py` |
| Decisiones y estado | `docs/DECISIONES.md`, `docs/PROGRESO.md`, `docs/LOOKMATCH.md` |
| Plan completo | `docs/PLAN_ESTILO_EXPLAINER.md` |

## Errores conocidos

- **Temporales de Remotion:** cada bundle copia `public/`. Por defecto van a `C:/remotion-tmp` (Windows) o
  `~/remotion-tmp` (Linux/macOS); se cambia con `REMOTION_TMP`. No uses `/tmp` si está en RAM.
- **Rutas en strings de JS/TS:** siempre con `/`, nunca con `\` (`\r` se convierte en un retorno de carro).
- **No dejes archivos `.ts` dentro de `out/`:** rompen `tsc`. Usa `.json` o `.txt`.
- **Un id que no está en el catálogo** hace fallar el render con el motivo exacto. Corrige el story, no el código.
- **Planos "quietos":** el QA mide el movimiento con flujo óptico. Las órbitas alrededor del objeto se anulan en la
  media (el suelo y el fondo se mueven en sentidos opuestos), y los objetos grandes y lisos lo esconden. Si `10_qa.md`
  marca la racha estática, cambia `orbit_slow` por `drift` o `push_in` en ese beat.
- **% de silencio justo:** con el tratamiento de voz queda cerca del mínimo (22,8 en `hielo-flota`). Si sale por
  debajo de 22, baja `ROOM_WET` en `pipeline/voice_fx.py` de 0,12 a 0,08.
- **Primera ejecución:** descarga Whisper medium (~1,5 GB) y, con `setup_chatterbox.py`, los modelos de Chatterbox
  (~6 GB). Necesita internet.
- **Voz:** en español, `"voice": "diego"` (`voices_local/diego.wav`). Si no existe, el pipeline avisa y usa la voz
  del modelo, que suena con acento extranjero: díselo al usuario en la entrega.
- **Publicación (F16):** la etapa `publish` deja `11_publish.md` (título, descripción, hashtags y comentario fijado por plataforma, fuentes) y
  `11_cover.png`. Es un borrador deterministico: léelo y afínalo antes de entregarlo.
- **Voz lenta:** Chatterbox tarda ~13 min por video en CPU. Para pruebas rápidas del plan visual, usa
  `"engine": "kokoro"` en el story y vuelve a Chatterbox para el render final (`--force tts`).
- **Duración (35–59 s, D121):** el QA marca ❌ si el video dura menos de 30 s o 60 s o más. Si sale largo, quita un paso; si sale corto, añade líneas al guion (no relleno) y
  repite desde la voz; si sale largo, quita un paso. Un video de ~65 s tarda ~15 min de voz y ~7 min de render a escala 1;
  uno de 110 s, aprox. 25 min y 12 min (escala lineal con la duración).
- **Tiempos de referencia** (portátil Intel UHD, video de 52 s a escala 0,5): voz ~13 min con Chatterbox (35 s con Kokoro), alineación ~1 min, stills
  40 s, render 5–6 min, mezcla + QA ~1 min. A escala 1, el render tarda unas 4 veces más.

## Para no perder tiempo ni tokens (lecciones de `internet-bajo-agua`)

- **Escribe el story con el ritmo ya resuelto:** un evento (acción, overlay o `shots`) como mucho cada 2,5 s y ≤3 cortes por minuto. La voz real cambia
  los tiempos respecto a Kokoro, y un margen de 1 s evita rondas de «hueco de 3,6 s». `validate-story` ahora lista **todos** los huecos con su beat.
- **Orden fijo antes de renderizar:** `stills` → mirar la hoja → arreglar → recién entonces `all`. `all` renderiza solo; si ves los stills después, pierdes ~8 min.
- **Tras cada edición de `05_story.json`, corre `validate-story`** (0,1 s). No lances un render ni un `all` sin eso.
- **Prueba cada objeto existente en la galería** (`tools/gallery.py`) antes de ponerlo en el story: un prefab viejo puede verse mal (el `satelite` parecía una caja).
- **Prefabs nuevos:** `radius` ≈ mitad del ancho de la pieza (con 1,5× de más sale diminuto); en escenas submarinas usa cúpula de agua grande (`seaDome`) y suelo
  lejano que tape el del entorno (`seabed` en `custom.ts`); los números grandes (`StatCallout`) en `slot: lower`, nunca en `upper` (tapan al objeto).
- **Verificador:** una ronda bien preparada (hoja de stills + guion + `shows`) basta casi siempre; la 2.ª y la 3.ª solo si la nota baja de 7 en un área concreta.
  Los overlays entran con fundido: un still justo al entrar los muestra tenues, no es un fallo.
- **Shell:** nunca `pkill -f <patrón>` con un texto que aparece en tu propio comando (mata la shell y pierde ediciones); usa el PID o `pgrep` + `kill`.
- **Esperas largas** (voz Chatterbox ~20 min, render): lánzalas en segundo plano y no vuelvas a mirar hasta el aviso.

## Legado

El skill anterior (`cartoon-3d-short`, el video del puente) está en `legacy/`. Este skill no lo usa. La composición
`BridgeShort` de Studio queda solo como prueba de que el motor funciona.
