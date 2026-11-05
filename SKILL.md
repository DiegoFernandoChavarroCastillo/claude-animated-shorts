---
name: explainer-short
description: Hace un short vertical explicativo de más de 60 s y menos de 120 s (1080x1920) estilo "Explainer 2.5D", en español o en inglés. Escenas 3D estilizadas con un objeto protagonista, subtítulos palabra por palabra con caja de selección, overlays de datos con fuente, voz local (Chatterbox) y efectos de sonido, renderizado con three.js dentro de Remotion en el PC del usuario. Úsalo cuando el usuario pida un "video explicativo", un "short de curiosidad", un video "como los de explicación con subtítulos", un "explainer short", "explain why X in a short video", o diga "usa el skill explainer" / "use the explainer skill". Acepta `es` y `en`.
---

# Explainer short (es / en)

Un prompt → un video. Claude hace la parte creativa (investigación, guion, plan visual y revisión). `pipeline/make_short.py`
hace todo lo determinista (voz, alineación, validaciones, render, mezcla y QA).

**La carpeta de este skill es la raíz del repo.** Todos los comandos se ejecutan desde ahí. Python del proyecto:
`.venv/bin/python` en Linux y `.venv\Scripts\python.exe` en Windows (abajo, `PY`).

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
`templates/formulas.json` (7 tipos de gancho, 5 estructuras, 5 cierres); el criterio de elección, en su apartado `elegir`.

1. Mira qué usaron los últimos videos: `PY tools/recent_formulas.py 5`. No repitas el mismo tipo de gancho ni la misma
   estructura que el video anterior, salvo que el tema lo pida de verdad.
2. Según los hechos de `01_research.md`, elige **tres candidatos de cada cosa** y decide cuál es el mejor:
   - **Gancho:** tres tipos distintos, cada uno ya redactado para este tema (≤12 palabras, 2.ª persona, concreto).
   - **Estructura:** tres, cada una con su esquema en una línea ("gancho → tres datos → giro → cierre").
   - **Cierre:** tres, con la frase ya redactada.
   **Cierre (F16): recomienda `bucle` salvo que el tema pida otra cosa.** `envia`, `pregunta` y `sigue` son despedidas predecibles que
   invitan a deslizar: ofrécelas solo si el usuario las pide. Con `bucle`, el story lleva `meta.tailS: 0.2` (el validador lo exige).
3. Pregunta con `AskUserQuestion`, **las tres preguntas en una sola llamada**: "¿Qué gancho quieres?", "¿Qué estructura?",
   "¿Qué cierre?". La primera opción es tu recomendación, con "(Recomendado)" en la etiqueta y, en la descripción, una frase
   de por qué encaja con **este** tema. Etiquetas tipo `A · pregunta: "¿Te has preguntado…?"`.
4. Si el usuario ya eligió en su mensaje ("con gancho de mito"), no preguntes esa parte. Si contesta "tú decide" (o
   no hay forma de preguntar), usa lo recomendado y dilo en la entrega.
5. Anota lo elegido en la cabecera de `02_SCRIPT.md` (`hook:`, `structure:`, `closing:`); el validador comprueba que el
   guion tenga la forma de cada uno.
6. **Sé honesto con la recomendación:** son patrones establecidos (curiosidad concreta, primeros segundos, lenguaje directo),
   no resultados medidos en este canal. No prometas que un gancho "rinde más" con cifras. Detalle y fuentes: `docs/FORMULAS.md`.

### 2. Guion (`02_SCRIPT.md`)

Sigue el prompt del idioma al pie de la letra, con el gancho, la estructura y el cierre elegidos en el paso 1b (la
estructura `mito` es hook → tension → mechanism → layer2 → twist → cta; las otras están en el prompt). Siempre: 175–300
palabras (**el video debe durar más de 60 s y menos de 120 s**, requisito para monetizar en YouTube, TikTok, Instagram y
Facebook; la voz da ~2,6 palabras/s, así que ~220–250 palabras ≈ 85–95 s), gancho ≤12 palabras en 2.ª persona, números en palabras y con fuente, frases de ≤22 palabras.
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
- **Huecos:** si un concepto central no tiene objeto, usa uno genérico o el más cercano, no `persona` repetida, y apúntalo
  en `out/<id>/05_gaps.md`. El validador falla con el mismo objeto en más de 3 beats seguidos o en más del 65 %.
- Un beat por línea del guion, con el `text` **idéntico** (los subtítulos y la voz salen de ahí).
- Cambia de entorno solo al cambiar de lugar o de idea. Cada `mechanism` lleva su objeto protagonista y al menos un
  overlay de dato.
- Varía los encuadres: dos beats seguidos con el mismo objeto no deben repetir preset de cámara.
- **Objeto que falta (F14):** si un concepto central no tiene objeto en el catálogo (puntuación 0 en `catalog_search.py`) y
  se puede hacer sencillo, **créalo en este video**: hasta **2 prefabs por video** en `studio/src/explainer/heroes/primitive/custom.ts`
  (~50–70 líneas cada uno, con acciones propias si el guion lo pide), regístralos en `heroes/index.ts` y en el catálogo con
  `PY tools/add_heroes.py <tags.json>`. Reglas: (1) **busca antes de crear** en el catálogo y en `custom.ts`; (2) **prueba visual
  obligatoria** con `PY tools/gallery.py` (mira el still; en la práctica siempre hubo que corregir encuadre, material o tamaño;
  en entornos oscuros evita `metalness` alto); (3) un prefab plano o frontal pide cámara con movimiento real (`orbit_slow`,
  `spiral_in`, `push_in` rápido), o la racha estática del QA falla; (4) no más de 2 por video, el resto va a `05_gaps.md`.
  Medido en 2 videos: ~10–15 min por prefab, sin coste de render.
- **Gancho y ritmo (F16):** el primer beat se dice en ≤3 s y lleva una **acción antes de 1 s** (cámara que no sea `drift`); en todo el video
  **algo cambia en pantalla (corte, acción u overlay) al menos cada 3,5 s**; los overlays van por encima del 70 % del alto (debajo están
  la descripción y los botones de las apps). El validador lo comprueba con `words.json`.
- **Dale vida (F13):** ponle **acciones** a la mitad de los beats como mínimo: lo que el objeto hace cuando se dice la palabra (una
  línea roja que rodea la Tierra al decir "ecuador", la persona que sube al decir "despedido", chispas al decir "revienta").
  Mira "Acciones" en `templates/prompts/story_es_en.md` (qué verbo pide qué acción) y las propias de cada objeto con
  `PY tools/catalog_search.py <tema>`. El pipeline falla si hay menos de la mitad de los beats con acciones.
- Ejemplo completo: `templates/examples/hielo-flota/` (y `hielo-flota-en/`).

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
| Ganchos, estructuras y cierres (catálogo y criterio de elección) | `templates/formulas.json`, `docs/FORMULAS.md`, `tools/recent_formulas.py` |
| Catálogo cerrado para el story | `templates/catalog.json` (cruzado con el código en `studio/src/explainer/catalog.ts`) |
| Ejemplos | `templates/examples/` (`hielo-flota` completo; solo guion: `cielo-azul`, `dedos-arrugados` y uno por estructura: `agua-rara-lista`, `agua-contra-hielo`, `dedos-historia`, `atardecer-cadena`) |
| Look del video (paleta, subtítulos, cámara, luces) | `studio/src/explainer/style.ts` y `world/grade.ts` |
| Acciones sincronizadas con la voz | `studio/src/explainer/actions/index.ts` (genéricas y marcadores), `HeroDef.actions` + `HeroInstance.act` (propias de cada objeto) |
| Entornos, objetos, overlays | `studio/src/explainer/envs/` (`ciencia.ts`), `heroes/primitive/` (`body`, `micro`, `space`, `physics`, `chemistry`, `earth`, `mind`, `life`, `home`, `generic`, y sus segundas tandas `*2.ts`), `overlays/` (`Guides`, `Panels`, `Meters`, `Diagrams`) |
| Buscar en el catálogo, probar objetos | `tools/catalog_search.py`, `tools/gallery.py` (galería con stills), `tools/add_heroes.py`; prefabs de cada video en `heroes/primitive/custom.ts` |
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
- **Duración (60–120 s):** el QA marca ❌ si el video dura ≤60 s o ≥120 s. Si sale corto, añade líneas al guion (no relleno) y
  repite desde la voz; si sale largo, quita un paso. Un video de ~65 s tarda ~15 min de voz y ~7 min de render a escala 1;
  uno de 110 s, aprox. 25 min y 12 min (escala lineal con la duración).
- **Tiempos de referencia** (portátil Intel UHD, video de 52 s a escala 0,5): voz ~13 min con Chatterbox (35 s con Kokoro), alineación ~1 min, stills
  40 s, render 5–6 min, mezcla + QA ~1 min. A escala 1, el render tarda unas 4 veces más.

## Legado

El skill anterior (`cartoon-3d-short`, el video del puente) está en `legacy/`. Este skill no lo usa. La composición
`BridgeShort` de Studio queda solo como prueba de que el motor funciona.
