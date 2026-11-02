# Plan de implementación: estilo "Explainer 2.5D" sobre la bifurcación de `claude-animated-shorts`

> **Para el agente de código.** Este documento es la especificación completa. Léelo entero antes de tocar nada.
> Ejecuta las fases **en orden**. Al terminar cada fase: cumple sus criterios de aceptación, haz commit en la rama `estilo-explainer` y **detente para que el usuario revise**.
> Si algo de este plan choca con lo que encuentres en el repo (nombres de archivo, funciones, estructura), **no improvises: pregunta**. El autor de este plan no pudo leer el código de `templates/` (solo `README.md` y `SKILL.md`), así que los nombres internos se confirman en la Fase 0.

---

## 0. Cómo usar este documento

1. Copia este archivo a la raíz de la bifurcación como `docs/PLAN_ESTILO_EXPLAINER.md`.
2. Copia la carpeta `herramientas_medicion/` a `tools/medicion/`.
3. Copia tus videos de referencia (los 5 .mp4) a `references_local/videos/` (esa carpeta **no** se sube a Git, ver §11).
4. Abre Claude Code en la carpeta de la bifurcación y escribe:

```
Lee docs/PLAN_ESTILO_EXPLAINER.md completo. Empieza por la Fase 0.
Al terminar cada fase cumple sus criterios de aceptación, haz commit y detente para que revise.
Si algo del plan choca con el repo, pregúntame antes de decidir.
```

---

## 1. Objetivo

Convertir la bifurcación, que hoy produce shorts de "personajes 2D con tinta en un mundo 3D" (el video del puente), en un generador de **shorts explicativos verticales** en el estilo común de 5 cuentas de referencia:

- Una curiosidad cotidiana explicada en ~55–62 s, en segunda persona.
- Un objeto protagonista por momento (avión, teléfono, perro, reloj…) en una escena 2.5D con mucho desenfoque de fondo, brillo y luz de atardecer o nocturna.
- Una capa 2D de datos encima: tarjetas, barras comparativas, medidores, ondas, números grandes.
- Subtítulos palabra por palabra arriba, con una caja de selección azul sobre la palabra clave.
- Voz + efectos, sin música.

**Un prompt → un video**: "Usa el skill explainer-short: video sobre <tema> en <es|en>" debe producir el `.mp4` final, con un modo opcional que se detiene para aprobar el guion.

## 2. Decisiones ya tomadas por el usuario

| Tema | Decisión |
|---|---|
| Idioma | **Configurable por video: `es` o `en`** (el skill original forzaba "English only": eliminar esa regla) |
| Voz | **TTS local gratis.** Motor por defecto: **Kokoro-82M** (Apache-2.0, tiene voces en español e inglés). Alternativa: **Chatterbox Multilingual** (MIT, más expresiva, mejor con GPU NVIDIA; marca de agua inaudible PerTh en cada audio). Respaldo: Piper. |
| Sonido | **Voz + efectos, sin música** por defecto. La música queda como opción apagada (`"music": false`). |
| Sistema | **Windows** (PowerShell). Todos los comandos de este plan están escritos para PowerShell. |
| Automatización | Un prompt de punta a punta. Flag `--review` para pausar tras el guion. |

---

## 3. Biblia de estilo (medida, no opinada)

### 3.1 Material medido

5 shorts de 5 cuentas distintas, todos de 720x1280 a 30 fps (descargados de Instagram, así que con compresión). Medidos frame a frame con `tools/medicion/` (flujo óptico, k-means de color, detección de cortes, OCR de subtítulos, análisis de audio).

| Clave | Tema | Duración | Render dominante |
|---|---|---|---|
| R1 avión | Por qué existe el modo avión | 53,6 s | 3D (avión, ciudad con antenas, cabina) + maquetas de teléfono |
| R2 perro | Cómo te reconoce tu perro | 61,2 s | 2D pintado con textura + desenfoque fuerte + diagramas de línea |
| R3 reloj | Cómo mide el sueño un reloj inteligente | 124,2 s | 2.5D (reloj en la muñeca) + diagramas técnicos y gráficas |
| R4 secuestro | Consejos para escapar | 58,5 s | Vector plano con degradados |
| R5 noche | Claude sube videos mientras duermes | 55,0 s | Vector plano + tarjetas de interfaz |

R1–R3 son la referencia principal (el "punto intermedio" pedido). R4–R5 confirman el sistema de subtítulos y la paleta.

### 3.2 Medidas por video

| Medida | R1 avión | R2 perro | R3 reloj | R4 | R5 |
|---|---|---|---|---|---|
| Cortes duros | 7 | 2 | 0 | 3 | 0 |
| Cortes duros por minuto | 7,8 | 2,0 | 0 | 3,1 | 0 |
| % frames con movimiento global de cámara | 76 | 33 | 38 | 61 | 19 |
| % frames con zoom de acercamiento | 35 | 6 | 1 | 19 | 5 |
| Velocidad de zoom típica (%/frame) | 0,25 | 0,32 | 0,11 | 0,26 | 0,25 |
| Racha estática más larga (frames) | 46 | 83 | 96 | 45 | 116 |
| % frames únicos (fluidez de animación) | 98 | 86 | 93 | 89 | 97 |
| Luma p5 / mediana / p95 | .19/.37/.73 | .09/.21/.67 | .05/.15/.47 | .07/.19/.51 | .06/.20/.70 |
| Saturación mediana / p90 | .41/.60 | .51/.68 | .61/.69 | .50/.62 | .34/.59 |
| Loudness integrado | −14,1 LUFS | −14,2 | −14,1 | −14,4 | −14,1 |
| Música de fondo | No | No | No | Sí | Sí |
| % del tiempo en silencio | 27 | 30 | 28 | 2 | 5 |
| Pausas >250 ms | 18 | 25 | 39 | 0 | 1 |

Limitación: el flujo óptico no detecta empujes de cámara muy lentos (<~0,08 %/frame), así que las "rachas estáticas" pueden incluir empujes lentos. El mismo problema le pasó al autor del skill original.

### 3.3 La plantilla clave (lo que comparten)

1. **Subtítulos idénticos en 4 de 5 cuentas** (ver §3.5). Es la firma más fuerte de una plantilla común.
2. **Un objeto protagonista por momento**, centrado, entre el 30 % y el 85 % de la altura. La zona del subtítulo (12–30 % de la altura) queda libre de detalle importante.
3. **Base oscura azul marino o púrpura, nunca negro puro**, con un acento cálido (atardecer naranja o dorado) y un acento frío para datos (cian o verde brillante).
4. **Brillo (bloom) y partículas de luz** para hacer visible lo invisible: señales, olor, datos, pulsos.
5. **Desenfoque de fondo** para aislar el objeto protagonista.
6. **Capa de datos 2D**: un número grande, barras comparativas, medidores, ondas y tarjetas de interfaz con esquinas redondeadas.
7. **Cámara casi continua**: mediana de 2 cortes por minuto, empujes lentos, transiciones que viajan o hacen zoom hacia el siguiente momento.
8. **Animación constante de elementos**: entre 86 % y 98 % de los frames son únicos.
9. **Voz con pausas reales** (27–30 % del tiempo en silencio en R1–R3), sin música y masterizada a −14 LUFS.
10. **Guion explicativo en segunda persona**: pregunta o afirmación sorprendente, desmentido o pivote, mecanismo en pasos, giro final y llamada a la acción (ver §3.10).

### 3.4 El punto intermedio elegido: "Explainer 2.5D"

| Toma de… | Qué |
|---|---|
| R1 avión | Escenas 3D reales (objetos, terreno, cielo de atardecer), anillos de señal, líneas de luz, maquetas de teléfono |
| R2 perro | Desenfoque fuerte, partículas doradas, número grande + barras, pizarra con dibujos de línea, personajes y animales con textura pintada |
| R3 reloj | Objeto con interfaz dentro (pantalla del reloj), zoom hacia el objeto como transición, diagramas técnicos (chip, sensores), ondas, medidores, flujo mide → analiza → estima |

Esto encaja con la arquitectura actual del repo: three.js dentro de Remotion, objetos y "tarjetas" 2D en un mundo 3D, desenfoque de lente, bloom y cámaras con keyframes. **Se reutiliza el motor y se cambia el look.**

### 3.5 Subtítulos (especificación)

Valores medidos a 720x1280 y escalados a 1080x1920 (el render base del repo).

| Parámetro | Valor |
|---|---|
| Posición | Centro de la primera línea al **19 % de la altura** (≈365 px a 1920). Centrado horizontal. |
| Tamaño | Altura de mayúsculas ≈34 px a 1280 → `font-size ≈ 0,064 × ancho` (≈69 px a 1080). |
| Interlineado | ≈1,25 |
| Ancho máximo | 84 % del ancho |
| Líneas | Máximo 2 |
| Bloques | 3–6 palabras por bloque (~1 s). Corta en la puntuación o cuando no cabe en 2 líneas. |
| Revelado | Cada palabra **aparece cuando se pronuncia**, no antes. Las palabras de un bloque se acumulan. |
| Palabra activa | Blanco `#FFFFFF`, peso 700 |
| Palabras ya dichas | Gris `#8E929B` aprox., peso 500 |
| Cambio de bloque | El bloque anterior desaparece en ~3–4 frames y el nuevo empieza vacío. |
| Tipografía | Sans geométrica. No pude identificarla con certeza. Candidatas gratuitas en Google Fonts: **Plus Jakarta Sans** o **Figtree** (subtítulos) y **Montserrat** (números grandes y rótulos, como en R2). Configurable en `style.ts`. |
| Legibilidad | Sombra suave `0 2px 10px rgba(0,0,0,.45)` (recomendado; no medido). |

**Palabra clave**: una por cada 2–4 bloques, elegida en el guion (`keyword`). Dos variantes:

- **Caja de selección** (R1, R2, R4, R5). Rectángulo alrededor de la palabra:
  - Borde azul `#3B82F6` de 2 px a 720 (3 px a 1080), radio ~4–6 px.
  - Relleno azul oscuro semitransparente (`rgba(30,64,175,.35)`).
  - Padding ~6/10 px.
  - **Dos tiradores circulares**: arriba-izquierda y abajo-derecha, radio ~7 px a 720 (~10 px a 1080), relleno `#3B82F6` y aro blanco de 2 px.
- **Color de acento** (R3): la palabra activa en azul claro `#8AB4FF` en vez de blanco. Úsalo para términos técnicos.

Los colores son aproximados (medidos sobre video comprimido). Ajústalos en el bucle de look-match (§9).

### 3.6 Paleta (tokens)

Colores extraídos por k-means de los fotogramas, excluyendo la banda del subtítulo, más acentos de interfaz tomados a ojo (marcados con *).

| Token | Valor | De dónde |
|---|---|---|
| `bg.night0` | `#0A091A` | R3 |
| `bg.night1` | `#161232` | R3 |
| `bg.navy` | `#0F1833` | R2 |
| `bg.indigo` | `#272758` | R3 |
| `bg.plum` | `#1D1C34` | R1 |
| `mid.violet` | `#614976` | R1 |
| `mid.lavender` | `#777DAC` | R3 |
| `warm.sunset` | `#F38A6E` | R1 |
| `warm.rose` | `#C0796D` | R1/R3 |
| `warm.gold` | `#DCAE6D` | R2 |
| `warm.brown` | `#4F3926` | R2 |
| `light.cream` | `#E9E3C8` | R2 |
| `ui.selection` | `#3B82F6` | R1/R2/R4/R5* |
| `ui.cyan` | `#5FD4F4` | R3* |
| `ui.green` | `#3DDC84` | R3* (ondas, "relajado") |
| `ui.red` | `#FF5A5F` | R3* (alertas, "estrés") |
| `ui.card` | `#14162B` con 85 % de opacidad y borde `rgba(255,255,255,.08)` | R3/R5* |

**Presets de iluminación** (uno por escena):

- `atardecer`: cielo `#2A1B4A` arriba → `#F38A6E` en el horizonte. Sol con bloom. Sombras violeta.
- `noche`: `#0A091A` → `#272758`. Luces cálidas puntuales (lámparas, ventanas) con bokeh.
- `dorado`: base `#0F1833` con luces cálidas `#DCAE6D` (calle nocturna de R2).
- `tech`: `#0A091A` con rejilla o circuitos en `#1E2A5A` y acentos cian y verde.

**Objetivos de luz y color** (rango aceptable en QA):

- Luma p5 entre 0,05 y 0,19 (nunca negro puro).
- Luma mediana entre 0,14 y 0,38.
- Saturación mediana entre 0,40 y 0,62.

### 3.7 Cámara

| Regla | Valor |
|---|---|
| Cortes duros | Solo al cambiar de lugar. Objetivo **≤3 por minuto** (mediana de las referencias: 2). |
| Plano sostenido | Siempre con empuje lento de **0,1–0,3 %/frame**. Nunca un plano 100 % quieto más de ~1,5 s. |
| Deriva lateral | ≤1,5 px/frame a 1080 |
| Planeo entre posiciones | Smootherstep de 18–40 frames (como el skill original) |
| `zoom_through` | Transición de 20–30 frames que entra en el objeto (pantalla del reloj, ventana del avión) y aparece en la escena siguiente. Es la transición firma de R3. |
| Sacudidas | Solo en impactos, como en el original (signo alterno y decaimiento en 7 frames) |
| Roll | Opcional, ≤3° |

### 3.8 Composición y capas

```
z alto  ┌ Subtítulo (12–30 % de la altura)          ← capa 2D (React/SVG)
        ├ Overlays de datos (30–85 % de la altura)   ← capa 2D (React/SVG)
        ├ Partículas, anillos, líneas de luz         ← three.js con bloom, o 2D aditivo
        ├ Objeto protagonista (enfocado)             ← three.js (modelo glTF, primitiva o tarjeta pintada)
z bajo  └ Entorno (desenfocado)                      ← three.js (cielo, terreno, habitación, calle)
```

- Un objeto protagonista por momento. Ocupa 40–65 % del ancho.
- Desenfoque de fondo (`cInf` del repo) de **10–16 px a 1080** en primeros planos y planos medios, y 0–6 px en planos aéreos o generales.
- Los overlays nunca tapan el subtítulo. Si un overlay necesita espacio, el objeto se desplaza hacia abajo.

### 3.9 Overlays de datos (catálogo inicial)

Cada uno es un componente React en la capa 2D. Las entradas usan `spring()` de Remotion, duran 8–12 frames y se escalonan 3–4 frames entre elementos.

| Componente | Qué muestra | Inspirado en |
|---|---|---|
| `StatCallout` | Número grande (≈0,11 × ancho, Montserrat 700, color de acento) + rótulo en versalitas con tracking amplio. El contador anima desde 0. | R2 "300 MILLONES" |
| `BarCompare` | 2–3 barras horizontales con etiqueta y valor; la barra se llena. | R2 nariz vs. la tuya |
| `Gauge` | Medidor semicircular verde/azul/rojo con aguja y etiqueta. | R3 relajado/estrés |
| `Waveform` | Onda (pulso, movimiento) que se dibuja, con etiquetas en píldora. | R3 |
| `IntervalMarks` | Marcas de intervalo sobre la onda ("0,97 s"). | R3 |
| `UICard` | Tarjeta de interfaz genérica: título, subtítulo, icono, progreso. | R3/R5 |
| `Pill` | Etiqueta corta con borde de color ("acelerómetro"). | R3 |
| `PhoneMock` / `WatchMock` | Dispositivo genérico con pantalla configurable (señal, bloqueo, centro de control, métricas). **Sin logos ni UI de marcas reales.** | R1/R3 |
| `LineBoard` | Pizarra enmarcada con dibujos de línea que se trazan (SVG con `strokeDashoffset`). | R2 |
| `IconFlow` | 2–4 nodos conectados (mide → analiza → estima) que se encienden en orden. | R3 |
| `PulseRings` | Anillos concéntricos que se expanden desde un punto 3D proyectado. | R1 |
| `LightTrails` | Trazos de partículas que viajan entre puntos (señal, olor, datos). | R1/R2/R3 |
| `ScanRing` | Anillo de escáner alrededor de una imagen circular. | R2 |
| `Callout3D` | Etiqueta anclada a un punto del objeto 3D (proyección de mundo a pantalla). | R3 |
| `NoSymbol` | Icono tachado (ojo, etc.). | R3 |
| `TitlePlaque` | Placa con título y subtítulo para citas históricas ("LA ODISEA · Homero"). | R2 |
| `ClockChip` | Píldora con icono y hora. | R5 |

### 3.10 Guion (fórmula)

Medido sobre los guiones de R1–R3 (reconstruidos por OCR, ver Apéndice B).

**Ritmo**:
- ≈2,8 palabras/s de media incluyendo pausas (≈4 palabras/s mientras se habla).
- 150–175 palabras para 55–62 s.
- Pausas de 0,3–0,6 s entre frases y 0,8–1,0 s antes del giro.
- El skill original usaba 3,7 palabras/s sin pausas: **no reutilizar ese valor**.

**Estructura**:

| Beat | Tiempo aprox. | Función | Ejemplos de las referencias (no copiar) |
|---|---|---|---|
| 1. Gancho | 0–4 s | Pregunta sobre algo cotidiano o afirmación sorprendente, en 2ª persona, ≤12 palabras | "¿Por qué te piden…?", "Así te ve tu perro." |
| 2. Tensión | 4–12 s | Mito o duda y su desmentido, o "pero ¿cómo…?" | "¿De verdad…? No.", "Y no es por tu cara" |
| 3. Mecanismo | 12–40 s | 2–4 pasos, cada uno con un elemento visualizable y al menos un número grande con fuente | "300 millones de receptores" |
| 4. Segunda capa | 40–48 s | "Pasa algo más" o "aquí se pone interesante". Opcional: anécdota histórica o cultural real | Homero y Argos |
| 5. Giro | 48–55 s | Una frase que reencuadra: "no es para X: es para Y" | "no eres una cara: eres un olor" |
| 6. Llamada a la acción | Últimos 3–5 s | Pregunta para comentarios, "envíaselo a…" o "sígueme" | — |

**Reglas**:
- Cada dato y número lleva fuente en `SCRIPT.md`.
- No describas lo que ya se ve en pantalla.
- Una idea por frase.

---

## 4. Qué se conserva, qué se quita y qué se cambia del repo

Los nombres vienen del `SKILL.md` original; **confírmalos en la Fase 0**.

| Archivo o pieza | Acción | Detalle |
|---|---|---|
| `story.ts` (planos, `CAMS`, `XFADE`, `KICKS`, `DOF`/`dofAt`, `FOREGROUND`) | **Generalizar** | Deja de ser código a mano por video. Se convierte en un **lector de `story.json`** con presets de cámara (§3.7). Conserva la matemática de cámara, smootherstep, sacudidas y la tabla de desenfoque. |
| `world.ts`, `lights.ts`, `shade.ts` | **Reutilizar y extender** | Shader de cielo, niebla del color del horizonte y sol congelado por plano. Añadir los presets `atardecer`, `noche`, `dorado` y `tech` (§3.6). Sustituir los presets `day`/`golden`. |
| `build.ts` (pueblo, casas, kit Kenney, recoloreo, culling de línea de visión) | **Reemplazar contenido, conservar utilidades** | El pueblo del puente sale. El culling de línea de visión y el recoloreo por material se conservan como utilidades para el catálogo de entornos (§F4). |
| `paint.ts` (texturas pintadas con Canvas2D) | **Reutilizar** | Sirve para texturas pintadas estilo R2 (pelo, piedra, madera). Ajustar paletas. |
| `toon.ts` (API `Pen`, cabezas "bean", tinta ciruela) | **Rediseñar estilo** | Conservar la API de dibujo. Nuevo estilo de personaje: sin contorno de tinta, relleno con degradado suave, sin cara detallada o de espaldas o de perfil, proporciones realistas simplificadas. Los personajes son secundarios y el protagonista suele ser un objeto. |
| `cast.ts`, `cardshade.ts` | **Reutilizar** | Billboards iluminados por la escena: perfecto para animales y personajes pintados como tarjetas en 3D. |
| `ink.ts` (pase de tinta) | **Desactivar por defecto** | Flag `ink: false` en el estilo. No se borra. |
| `lensblur.ts` | **Reutilizar** | Es clave en este estilo. Recalibrar `cInf` según §3.8. |
| `Bridge.tsx` (compositor) | **Sustituir por `Explainer.tsx`** | Orden: (ink desactivado) → lens pre → lens main → bloom (umbral ~0,9, intensidad ~0,6, para glows) → tone map NEUTRAL → grade. MSAA 4. **Encima del canvas, la capa 2D** de overlays y subtítulos. |
| `grade.ts` | **Reutilizar y recalibrar** | Levantar sombras hacia el marino (luma p5 0,05–0,19) y saturación mediana 0,40–0,62. Viñeta suave. Grano desactivado. |
| `templates/audio/` (SFX sintetizados, `mix.py`, ducking) | **Reutilizar SFX y mezcla, quitar música por defecto** | Música apagada (`music: false`). Mezcla final a −14 LUFS integrados, true peak ≤ −1 dBTP. |
| `templates/scripts/` (stills, `sbs_sheet.py`, `bridge_merge.py`, `short_qa.py`) | **Reutilizar** | Renombrar lo que diga "bridge". Añadir chequeos de estilo (§9). |
| `references/` (fotos del canal del puente) | **Mover a `legacy/`** | Ya no es la referencia. |
| `SKILL.md` | **Reescribir** | Nuevo skill `explainer-short` (§F9). |
| Regla "No captions" | **Invertir** | Los subtítulos son parte central del estilo. |
| Regla "English only" | **Eliminar** | Idioma `es`/`en` configurable. |
| Regla "Opus max verifies every check" | **Conservar la idea** | Verificación visual por un agente distinto, sin fijar el modelo. |
| El video del puente completo | **Mover a `legacy/bridge/`** | Sigue disponible, pero el skill nuevo no lo usa. |

---

## 5. Estructura objetivo del repo

```
<fork>/
├─ SKILL.md                      # skill nuevo: explainer-short (§F9)
├─ README.md                     # actualizado
├─ docs/PLAN_ESTILO_EXPLAINER.md # este archivo
├─ studio/                       # proyecto Remotion (si no existe ya uno; ver F0)
│  ├─ package.json               # remotion, @remotion/three, three, zod, @remotion/layout-utils
│  └─ src/
│     ├─ index.ts / Root.tsx     # registra la composición "Explainer" (+ "KitGallery", "CaptionTest")
│     └─ explainer/
│        ├─ Explainer.tsx        # compositor: canvas three + capa 2D
│        ├─ schema.ts            # zod: StorySchema (§6)
│        ├─ style.ts             # tokens §3.5–3.8 (única fuente de verdad del look)
│        ├─ timeline.ts          # words.json + story.json → frames de cada beat/overlay/sfx
│        ├─ camera/              # presets: push_in, drift, glide, zoom_through, orbit_slow, cut
│        ├─ world/               # sky, fog, lights (presets), grade, lensblur, bloom (portados)
│        ├─ envs/                # catálogo de entornos (§F4), uno por archivo
│        ├─ heroes/              # catálogo de objetos protagonistas: glTF, primitivas, tarjetas
│        ├─ chars/               # toon/cast/cardshade portados con el estilo nuevo
│        ├─ overlays/            # catálogo §3.9, uno por archivo
│        └─ captions/            # Caption, KeywordBox, chunker
├─ pipeline/                     # Python: orquestador y etapas deterministas
│  ├─ make_short.py              # CLI con checkpoints (§7)
│  ├─ tts/                       # kokoro.py, chatterbox.py, piper.py (misma interfaz)
│  ├─ align.py                   # faster-whisper + alineación al guion → words.json
│  ├─ validate_script.py         # reglas §3.10
│  ├─ validate_story.py          # esquema + catálogo + anclas a palabras
│  ├─ sfx_plan.py                # story.json → tabla de eventos de SFX
│  └─ mix.py                     # voz + SFX → −14 LUFS
├─ tools/
│  ├─ medicion/                  # scripts de medición entregados con este plan
│  └─ qa/                        # short_qa.py, style_check.py, sbs_sheet.py
├─ templates/
│  ├─ prompts/                   # prompts de guion es/en, de story.json, del verificador
│  └─ examples/hielo-flota/      # ejemplo completo de referencia (§6)
├─ references_local/             # NO versionado: videos y frames de referencia
├─ out/                          # NO versionado: una carpeta por video
└─ legacy/                       # puente original + referencias antiguas
```

---

## 6. Contrato de datos: `story.json`

El LLM **solo** rellena este JSON. Nunca escribe TypeScript por video. Todo lo visual sale de catálogos cerrados; un tipo desconocido falla en la validación.

```jsonc
{
  "meta": {
    "id": "hielo-flota",
    "lang": "es",                       // "es" | "en"
    "title": "Por qué el hielo flota",
    "fps": 30, "width": 1080, "height": 1920,
    "voice": { "engine": "kokoro", "voice": "em_alex", "speed": 1.0 },
    "music": false,
    "captionEmphasis": "box"            // "box" | "accent"
  },
  "beats": [
    {
      "id": "b01",
      "role": "hook",                   // hook | tension | mechanism | layer2 | twist | cta
      "text": "¿Por qué el hielo flota si es agua sólida?",
      "keyword": "flota",               // palabra que lleva la caja de selección
      "scene": {
        "env": "cocina_noche",          // del catálogo envs/
        "light": "noche",               // atardecer | noche | dorado | tech
        "hero": { "kind": "primitive", "asset": "vaso_agua_hielo", "pose": "centro" },
        "camera": { "preset": "push_in", "rate": 0.2 },
        "dof": 14
      },
      "overlays": [
        { "type": "PulseRings", "at": "flota", "anchor": "hero", "color": "ui.cyan" }
      ],
      "sfx": [ { "type": "whoosh_soft", "at": 0 } ],
      "transition": "glide"             // glide | zoom_through | cut | crossfade
    },
    {
      "id": "b03",
      "role": "mechanism",
      "text": "Al congelarse, el agua se expande cerca de un nueve por ciento.",
      "keyword": "expande",
      "scene": { "env": "tech_oscuro", "light": "tech",
                 "hero": { "kind": "primitive", "asset": "moleculas_agua", "pose": "red_hexagonal" },
                 "camera": { "preset": "orbit_slow", "deg": 12 }, "dof": 8 },
      "overlays": [
        { "type": "StatCallout", "at": "nueve", "value": 9, "suffix": " %", "label": "MÁS VOLUMEN AL CONGELARSE", "color": "warm.gold" }
      ],
      "sources": ["<URL de la fuente del dato>"],
      "transition": "zoom_through"
    }
  ]
}
```

Reglas del contrato:

- `at` acepta una palabra del `text` del beat (primera aparición), un índice de palabra (`"#3"`) o un número de frames desde el inicio del beat. `timeline.ts` lo resuelve contra `words.json`.
- Cada beat dura lo que dura su voz más su pausa. **La duración total del video se calcula con `calculateMetadata`**, nunca a mano.
- `validate_story.py` falla si:
  - un `env`, `hero.asset`, `overlay.type`, preset de cámara o `sfx.type` no existe en el catálogo;
  - un `at` no resuelve a una palabra;
  - un beat de `mechanism` no tiene al menos un overlay;
  - hay más de 3 `cut` por minuto;
  - falta una fuente en un overlay con número.
- El ejemplo completo (5–6 beats con todas las fuentes) vive en `templates/examples/hielo-flota/` y es la prueba de humo del sistema.

---

## 7. Pipeline de un prompt

### 7.1 Quién hace qué

- **Claude (dentro de Claude Code, siguiendo el `SKILL.md`)** hace las partes creativas: investigación, guion, `story.json` y la revisión visual de stills. No hace falta clave de API: usa la sesión de Claude Code del usuario.
- **`pipeline/make_short.py`** hace todo lo determinista: TTS, alineación, validaciones, render, mezcla, QA y empaquetado. Cada etapa escribe un artefacto en `out/<id>/` y **se salta si el artefacto ya existe**. Así un fallo a mitad de camino no obliga a empezar de cero.

### 7.2 Etapas y artefactos

| # | Etapa | Responsable | Artefacto |
|---|---|---|---|
| 1 | Tema y hechos (búsqueda web, ≥2 fuentes por dato) | Claude | `01_research.md` |
| 2 | Guion con la fórmula §3.10 en el idioma pedido | Claude | `02_SCRIPT.md` (texto + fuentes) |
| 2b | Validar guion | `make_short.py validate-script` | Pasa o falla con motivos |
| — | **Si `--review`: parar aquí** para que el usuario apruebe | — | — |
| 3 | TTS con pausas (§3.10) | `make_short.py tts` | `03_voice.wav` |
| 4 | Alineación por palabra | `make_short.py align` | `04_words.json` |
| 5 | Plan visual | Claude | `05_story.json` |
| 5b | Validar story | `make_short.py validate-story` | Pasa o falla con motivos |
| 6 | Stills de control (1 por beat a escala 0,5) | `make_short.py stills` | `06_stills/*.png` |
| 6b | Revisión visual con hojas lado a lado frente a referencias (§9) | Claude (un agente aparte) | `06_review.md` (nota por área + arreglos) |
| 7 | Render de video | `make_short.py render` | `07_video.mp4` |
| 8 | SFX + mezcla | `make_short.py mix` | `08_mix.wav` |
| 9 | Unir audio y video | `make_short.py mux` | `09_final.mp4` |
| 10 | QA final | `make_short.py qa` | `10_qa.md` |

Bucle permitido: si el paso 6b pide arreglos, Claude edita **solo** `05_story.json` (o, si es un problema del catálogo, el componente concreto), vuelve al paso 5b y como máximo hace **3 rondas**. Después entrega con las notas pendientes.

### 7.3 Comandos (PowerShell)

```powershell
# todo de una vez, a partir de los artefactos creativos ya escritos
python pipeline\make_short.py all --id hielo-flota

# por etapas
python pipeline\make_short.py tts --id hielo-flota
python pipeline\make_short.py align --id hielo-flota
python pipeline\make_short.py stills --id hielo-flota --frames auto --scale 0.5
python pipeline\make_short.py render --id hielo-flota --scale 1.0     # 1080x1920; 1.3333 = 1440x2560
python pipeline\make_short.py mix --id hielo-flota
python pipeline\make_short.py mux --id hielo-flota
python pipeline\make_short.py qa --id hielo-flota
```

El render llama a Remotion con las props del video, más o menos así (verifica la sintaxis con la versión instalada):

```powershell
npx remotion render src/index.ts Explainer ..\out\hielo-flota\07_video.mp4 `
  --props=..\out\hielo-flota\props.json --codec h264 --crf 18 --scale 1
```

`props.json` lo genera `make_short.py` y une `05_story.json` con `04_words.json`.

### 7.4 TTS local (detalles)

- **Interfaz común**:

  ```python
  synth(text_segments: list[str], lang: str, voice: str, speed: float,
        pauses_ms: list[int]) -> wav_path
  ```

  Se sintetiza **frase a frase** y se concatenan las frases con silencios explícitos: 300–600 ms entre frases y 800–1000 ms antes del beat `twist`. Así se reproducen las pausas medidas (27–30 % del tiempo en silencio).
- **Kokoro** (por defecto):
  - `pip install kokoro soundfile`.
  - Códigos de idioma: `'e'` español y `'a'` inglés americano.
  - Voces en español: `ef_dora`, `em_alex` y `em_santa`. Las de inglés se eligen con una lista corta en la Fase 5.
  - El español probablemente necesita **espeak-ng** instalado en Windows para la fonetización. Verifícalo en la Fase 5.
  - Salida a 24 kHz; remuestrear a 48 kHz.
- **Chatterbox Multilingual** (opcional): MIT, soporta español y permite clonar una voz desde una muestra corta. Rinde mejor con GPU NVIDIA. Cada audio lleva una **marca de agua inaudible** (PerTh). Documenta esto en el README.
- **Piper** (respaldo): muy rápido en CPU, calidad menor.
- **Ajuste de ritmo**: tras sintetizar, mide palabras por segundo. Si la media sale fuera de 2,6–3,0 pal/s, reajusta `speed` y repite una vez.

### 7.5 Alineación (`align.py`)

- `faster-whisper` (modelo `small` o `medium`, CPU, `word_timestamps=True`).
- Después, **alinea con el texto exacto del guion** (difflib a nivel de palabra) para que los subtítulos usen la ortografía y la puntuación del guion, no la de Whisper. Las palabras sin correspondencia interpolan su tiempo entre vecinas.
- Salida:

  ```json
  [{"w": "¿Por", "start": 0.12, "end": 0.31, "beat": "b01"}, ...]
  ```

- Validación: cero palabras sin tiempo, tiempos monótonos y duración total igual a la del WAV ±50 ms.

### 7.6 SFX y mezcla

- `sfx_plan.py` genera eventos desde `story.json`:
  - `whoosh_soft` en cada transición `glide`/`zoom_through`;
  - `pop` en la entrada de cada overlay;
  - `tick` en contadores;
  - `riser` de 0,8 s antes del beat `twist`;
  - `impact` suave en `StatCallout`.
- Reutiliza el sintetizador de SFX del repo original (`templates/audio/`).
- Niveles: SFX entre −8 y −12 dB por debajo de la voz. Sin música (`music: false`).
- Masterizado: −14 LUFS integrados, true peak ≤ −1 dBTP (las referencias llegan a 0 dBFS; dejamos margen).

---

## 8. Fases de implementación

Cada fase termina con **commit + parada para revisión**. No pases a la siguiente sin que el usuario lo apruebe.

### F0 · Inventario y entorno

**Tareas**

1. Crear la rama `estilo-explainer`.
2. Leer `SKILL.md`, `README.md` y **todo** `templates/`.
3. Escribir `docs/INVENTARIO.md`: lista real de archivos, exports y contratos (`NOINK`, `dofAt`, `FOREGROUND`, `LIGHTS`, `LOOK`…) y en qué se diferencian de §4.
4. Decidir dónde vive el proyecto Remotion. Si el usuario ya tiene uno fuera del fork, **preguntar** si se usa ese o se crea `studio/`.
5. Comprobar el entorno: Node LTS, Python 3.11/3.12 en un venv (`py -3.12 -m venv .venv`), ffmpeg en el PATH, Tesseract con `spa` (solo para las herramientas de medición), espacio en disco.
6. Configurar las carpetas temporales de Remotion en un disco grande (ver §10).
7. Renderizar 2 stills del puente original para confirmar que el motor funciona tal cual.
8. Añadir `.gitignore`: `references_local/`, `out/`, `*.wav`, `*.mp4`, `.venv/`, `node_modules/`.

**Criterios de aceptación**

- [ ] `docs/INVENTARIO.md` existe y señala cualquier diferencia con este plan.
- [ ] 2 stills del puente renderizados sin errores.
- [ ] Ningún archivo de `references_local/` aparece en `git status`.

### F1 · Tokens de estilo y subtítulos

**Tareas**

1. `style.ts` con todos los tokens de §3.5–3.8 (colores, tipografía, tamaños relativos al ancho, tiempos de animación).
2. Fuentes cargadas con `@remotion/google-fonts` (Plus Jakarta Sans o Figtree, y Montserrat). La familia debe ser configurable.
3. `captions/chunker.ts`: bloques de 3–6 palabras que cortan en la puntuación o cuando no caben en 2 líneas. Mide el ancho con `measureText` de `@remotion/layout-utils`.
4. `Caption.tsx`: revelado por palabra, activa en blanco y 700, ya dichas en gris y 500, salida del bloque en 3–4 frames.
5. `KeywordBox.tsx` (caja + 2 tiradores) y la variante `accent`.
6. Composición `CaptionTest`: fondo `bg.navy` y un `words.json` de prueba en `es` y en `en`.

**Criterios de aceptación**

- [ ] Stills a los frames 15, 45 y 90 de `CaptionTest`. El centro de la primera línea cae al 19 % ±1 % de la altura.
- [ ] Ninguna línea supera el 84 % del ancho y nunca hay más de 2 líneas, aunque una palabra sea muy larga ("electroencefalograma").
- [ ] La palabra aparece en el frame de su `start` (±1 frame).
- [ ] Hoja lado a lado frente a 2 frames de R1/R2 con subtítulo y caja, revisada por Claude, con nota ≥7/10 en "subtítulos".

### F2 · Composición genérica `Explainer` desde `story.json`

**Tareas**

1. `schema.ts` (zod) para el contrato de §6.
2. `timeline.ts`: resolver `at`, inicio y fin de beats, transiciones y duración total con `calculateMetadata`.
3. `Explainer.tsx`: canvas de three.js (`@remotion/three`) + capa 2D.
4. Portar desde el puente el desenfoque de lente, el bloom, el tone map, el grade y el cielo y niebla. Pase de tinta **desactivado**.
5. `camera/`: presets de §3.7 parametrizados (`push_in`, `drift`, `glide`, `zoom_through`, `orbit_slow`, `cut`) usando la matemática de cámara existente.
6. Entorno mínimo provisional (cielo con degradado + plano de suelo) y objeto provisional (cubo con bisel) para probar la cadena entera.

**Criterios de aceptación**

- [ ] `templates/examples/hielo-flota/05_story.json` (aunque los entornos aún sean provisionales) renderiza sin errores con su `words.json`.
- [ ] Ningún plano sostenido está quieto más de 45 frames, comprobado con `tools/medicion/measure.py` sobre el render.
- [ ] Las transiciones `zoom_through` y `glide` se ven en stills consecutivos.
- [ ] `npx tsc --noEmit` sin errores en `studio/`.

### F3 · Catálogo de overlays

**Tareas**

1. Implementar los componentes de §3.9, uno por archivo, con props tipadas y entradas con `spring()`.
2. `Callout3D` y `PulseRings` necesitan proyectar un punto 3D a la pantalla. Expón desde el canvas un `useProjectedPoint(objectId)`.
3. Composición `KitGallery`: todos los overlays en secuencia, 2 s cada uno, sobre `bg.night1`.

**Criterios de aceptación**

- [ ] `KitGallery` renderiza todos los overlays. Hoja de contactos de 1 frame por segundo revisada.
- [ ] Ningún overlay invade la banda del subtítulo (12–30 % de la altura).
- [ ] Todos los colores salen de `style.ts`; no hay hex sueltos en componentes (`grep -r "#[0-9A-Fa-f]{6}" src/explainer/overlays` vacío).

### F4 · Catálogo de entornos y objetos

**Tareas**

1. `envs/`, un builder por entorno. Primera tanda (cubre las 3 referencias principales y temas cercanos):
   - `cielo_atardecer`: cielo de degradado, mar de nubes y sol con bloom.
   - `vista_aerea`: terreno de parcelas o ciudad en rejilla low-poly, con niebla de atardecer.
   - `calle_noche_bokeh`: fachadas con ventanas cálidas, farolas y desenfoque fuerte.
   - `cuarto_noche`: cama, lámpara y ventana con luz de luna.
   - `tech_oscuro`: fondo marino con rejilla o circuitos tenues.
   - `interior_neutro`: pared o cabina gris neutra con luz suave.
   - `exterior_clasico`: mar al atardecer, muro de piedra y cipreses (para anécdotas históricas).
   - `macro_corte`: corte transversal (piel, suelo, material) con capas.
2. `heroes/`, tres clases de objeto protagonista:
   - `primitive`: objetos construidos en código (teléfono, reloj, chip, vaso, antena, moléculas). Son los más fiables y no dependen de licencias.
   - `gltf`: modelos CC0 (Kenney, Quaternius, Poly Pizza **solo si el modelo es CC0**). Guarda la licencia de cada modelo en `heroes/LICENSES.md`.
   - `card`: animales y personas pintados con la API `Pen` como tarjetas iluminadas por la escena (`cast.ts`/`cardshade.ts`), con el estilo nuevo de `chars/`.
3. Catálogo legible por el LLM: `templates/catalog.json` con cada `env`, `hero.asset`, `pose`, `overlay.type`, preset de cámara y `sfx.type`, más una línea de "cuándo usarlo". El prompt de `story.json` lo incluye entero.
4. Conservar el culling de línea de visión y el recoloreo por material del `build.ts` original como utilidades.

**Criterios de aceptación**

- [ ] Un still por entorno, con un objeto protagonista y la luz que le toque, en una hoja lado a lado frente a frames de R1–R3. Nota del verificador ≥6/10 en color, luz y profundidad.
- [ ] Ninguna cámara de prueba queda dentro de un objeto (culling activo).
- [ ] `heroes/LICENSES.md` lista cada modelo externo con su licencia.

### F5 · Audio: TTS local, alineación, SFX y mezcla

**Tareas**

1. `pipeline/tts/` con Kokoro (por defecto), Chatterbox y Piper detrás de la misma interfaz (§7.4).
2. Script de instalación `pipeline/setup_audio.ps1`: venv, dependencias y comprobación de espeak-ng. Si falta algo, muestra un mensaje claro con el enlace de descarga, no un traceback.
3. `align.py` (§7.5), `sfx_plan.py` y `mix.py` (§7.6).
4. Elegir y documentar 2 voces por idioma tras escuchar muestras (pedir al usuario que elija entre 3 muestras por idioma).

**Criterios de aceptación**

- [ ] Para el guion de ejemplo en `es` y en `en`: WAV generado.
- [ ] Media de 2,6–3,0 palabras/s; silencio entre el 22 % y el 32 % del tiempo (`tools/medicion/audio.py`).
- [ ] `words.json` válido (§7.5).
- [ ] Mezcla final a −14 ±0,5 LUFS y true peak ≤ −1 dBTP (verificado con `ffmpeg -af ebur128=peak=true`).

### F6 · Guion: prompts y validador

**Tareas**

1. `templates/prompts/script_es.md` y `script_en.md`: fórmula de §3.10 con la tabla de beats, las reglas y **3 ejemplos originales** (no copiados de las referencias).
2. `validate_script.py` comprueba:
   - 140–185 palabras;
   - gancho ≤12 palabras y en 2ª persona (heurística por idioma);
   - existe un beat de tensión y uno de giro;
   - la última frase es llamada a la acción;
   - cada número tiene una fuente en la sección `## Fuentes`;
   - no hay frases de más de 22 palabras.
3. `templates/prompts/story_es_en.md`: cómo convertir un guion aprobado en `story.json` usando solo `catalog.json`, con la regla "cada beat de mecanismo = un objeto protagonista + al menos un overlay de dato".

**Criterios de aceptación**

- [ ] 3 guiones de prueba (2 en `es` y 1 en `en`) pasan el validador, y 3 guiones rotos a propósito fallan con el motivo correcto.

### F7 · Orquestador `make_short.py`

**Tareas**

1. Subcomandos de §7.3, checkpoints por artefacto, `--force <etapa>` y `--review`.
2. Registro legible en `out/<id>/log.md`: qué etapa corrió, cuánto tardó y qué falló.
3. Reutilizar el bundle de Remotion entre stills y render para no copiar `public/` en cada llamada (ver §10).

**Criterios de aceptación**

- [ ] `make_short.py all --id hielo-flota` produce `09_final.mp4` desde los artefactos creativos de ejemplo.
- [ ] Si se interrumpe el render y se relanza, las etapas anteriores se saltan.

### F8 · QA de estilo

**Tareas**

1. Mantener `short_qa.py` del original: frames negros, blancos, congelados, saltos y loudness.
2. Nuevo `tools/qa/style_check.py`, que reutiliza `tools/medicion/measure.py` y `audio.py`, más los comandos de ffmpeg del `README.md` de `tools/medicion/` para cortes y frames únicos. Compara el render con estos rangos:

| Métrica | Rango objetivo | Referencias R1–R3 | Cómo se mide |
|---|---|---|---|
| Luma p5 | 0,05–0,19 | 0,05–0,19 | `measure.py` |
| Luma mediana | 0,14–0,38 | 0,15–0,37 | `measure.py` |
| Saturación mediana | 0,40–0,62 | 0,41–0,61 | `measure.py` |
| Cortes duros por minuto | ≤3 | 0–7,8 | `ffmpeg … select='gt(scene,0.4)'` |
| Racha estática más larga | ≤100 frames | 46–96 | `measure.py` |
| % de frames únicos | ≥85 | 86–98 | `ffmpeg … mpdecimate` |
| Loudness | −14 ±0,5 LUFS | −14,1/−14,2 | `ffmpeg … ebur128` |
| % de silencio | 22–32 | 27–30 | `audio.py` |
| Palabras/s | 2,6–3,0 | 2,8–2,9 | `words.json` / duración |

El rango de la racha estática (≤100) está calibrado con las referencias. La regla de diseño de F2 (≤45 frames, porque todos nuestros planos llevan empuje) es más estricta a propósito. R1 falla el límite de cortes (es la más "cortada" de las tres) y eso es esperado.

3. Chequeo de subtítulos: renderiza 1 frame por bloque y verifica por OCR (Tesseract `spa`/`eng`) que el texto existe y está en la banda correcta.
4. Informe `10_qa.md`: tabla con ✅/❌ por métrica y frames problemáticos.

**Criterios de aceptación**

- [ ] `style_check.py` sobre las 3 referencias R1–R3 (en `references_local/`) da ✅ en al menos el 80 % de las métricas. Si no, los rangos están mal calibrados: ajústalos y documenta por qué.

### F9 · Nuevo `SKILL.md` y documentación

**Tareas**

1. Reescribir `SKILL.md` con frontmatter `name: explainer-short` y una descripción con disparadores: "video explicativo", "short de curiosidad", "como los videos de explicación con subtítulos", "usa el skill explainer". Incluir que acepta `es` y `en`.
2. Contenido del skill:
   - pipeline (§7) paso a paso;
   - reglas (subtítulos activos, idioma configurable, fuentes obligatorias, sin música por defecto, máximo 3 rondas de revisión visual);
   - dónde están los catálogos y los prompts;
   - errores conocidos (§10).
3. Actualizar `README.md`: instalación en Windows, cómo clonar o enlazar la carpeta a `%USERPROFILE%\.claude\skills\explainer-short\` (con `mklink /J` si se quiere mantener el repo en otra ruta) y un ejemplo de prompt.
4. Mover el puente a `legacy/` y quitarlo de los disparadores del skill.

**Criterios de aceptación**

- [ ] En una sesión nueva de Claude Code, el prompt "Usa el skill explainer-short: video sobre por qué el hielo flota, en español" activa el skill y llega al paso 2 (guion) sin intervención.

### F10 · Prueba de punta a punta

**Tareas**

1. Dos videos completos con temas nuevos (uno en `es` y otro en `en`) elegidos por el usuario o propuestos por Claude, ejecutados con un solo prompt cada uno.
2. Revisión visual con hojas lado a lado frente a R1–R3, con notas por área: subtítulos, color, luz, profundidad, objeto protagonista, overlays, cámara y ritmo.
3. Lista de mejoras priorizada en `docs/MEJORAS.md`.

**Criterios de aceptación**

- [ ] Los 2 `09_final.mp4` existen, pasan `short_qa.py` y al menos el 80 % de `style_check.py`.
- [ ] Ningún área del verificador por debajo de 5/10.
- [ ] Tiempo total por video anotado en `log.md`.

---

## 9. Bucle de look-match (adaptado del skill original)

El método del autor original sigue siendo válido: **medir, no opinar**.

1. Las referencias viven en `references_local/videos/`. `tools/medicion/` genera hojas de contacto y medidas en `references_local/medidas/`.
2. Para comparar, usa `sbs_sheet.py` (del original): frames propios a la izquierda y de referencia a la derecha.
3. El verificador es **un agente distinto** al que construyó. Le pasas 1–3 hojas y la rúbrica de áreas, y devuelve una nota sobre 10 por área y una lista de arreglos numerada con frames.
4. Cada arreglo se asigna a su dueño:
   - `style.ts` / `world/`: color y luz.
   - `captions/`: subtítulos.
   - `overlays/`: datos.
   - `envs/` / `heroes/`: escena.
   - `camera/`: movimiento.
   - `pipeline/tts`: ritmo.
5. Si trabajas con varios agentes en paralelo, **divide por archivos** (como el original): cada agente edita solo su carpeta y la fusión es por archivo.
6. Máximo 4 rondas por fase visual. Anota las notas de cada ronda en `docs/LOOKMATCH.md`.

---

## 10. Notas para Windows

- **Disco y temporales**: cada bundle de Remotion copia `public/` a la carpeta temporal y no la borra; el autor original llenó más de 60 GB. Antes de renderizar:

  ```powershell
  $env:TEMP = "D:\remotion-tmp"; $env:TMP = "D:\remotion-tmp"; $env:REMOTION_TMP = "D:\remotion-tmp"
  ```

  `make_short.py` debe fijarlas él mismo al lanzar `npx`. Mantén `public/` pequeño: los catálogos son código, no imágenes pesadas.
- **Bundle único**: empaqueta una vez (`npx remotion bundle`) y renderiza stills y video contra esa carpeta. Confirma la sintaxis con la versión instalada.
- **Rutas en strings de JS/TS**: usa `/`, nunca `\` (en el original, `\r` se convirtió en un retorno de carro).
- **ffmpeg**: `winget install Gyan.FFmpeg` y reinicia la terminal.
- **Python**: usa un venv y llama a los scripts con `.venv\Scripts\python.exe` desde `make_short.py`. Kokoro y faster-whisper funcionan en CPU; con GPU NVIDIA instala la variante CUDA de PyTorch.
- **espeak-ng**: instalador MSI desde sus releases de GitHub. Puede ser necesario para el español de Kokoro.
- **Rutas largas**: activa `git config core.longpaths true`.
- **Archivos temporales `.ts` dentro de `out/`** rompen `tsc` (aviso del original): usa `.txt` o `.json`.

---

## 11. Licencias y contenido

- **Referencias**: los 5 videos son de otras cuentas. Úsalos **solo como estudio** en `references_local/` y **nunca los subas al fork** (que probablemente es público).
  - No copies sus guiones, personajes, escenas concretas, títulos ni marcas.
  - Tómales el lenguaje visual (subtítulos, paleta, ritmo), no el contenido.
- **Marcas**: nada de logos ni interfaces reales (YouTube Studio, Claude, iOS, Apple Watch). `PhoneMock` y `WatchMock` son genéricos.
- **Remotion**: gratis para personas físicas y equipos de hasta 3 personas, incluso para uso comercial. A partir de 4 personas necesita licencia de empresa. Tenlo en cuenta si lo usas con clientes de una empresa que crezca.
- **Voces**: Kokoro es Apache-2.0 y Chatterbox es MIT con marca de agua inaudible. Piper depende de la voz elegida: revisa la licencia de cada modelo de voz antes de monetizar.
- **Modelos 3D**: solo CC0 o con licencia anotada en `heroes/LICENSES.md`.
- **Hechos**: cada número del video necesita una fuente en `02_SCRIPT.md`.
- **Producción en masa**: si se publica mucho con la misma plantilla, revisa la política vigente de la plataforma sobre contenido repetitivo o producido en masa antes de monetizar. Varía temas, entornos y voces.

---

## 12. Riesgos y límites de este plan

- **No vi el código de `templates/`**, solo `README.md` y `SKILL.md`. Los nombres de §4 vienen del `SKILL.md`. La Fase 0 existe para corregirlos.
- **Las medidas vienen de videos de 720p comprimidos por Instagram.** Los colores exactos, el grosor de la caja de selección y la tipografía son aproximados. Ajústalos en el bucle de §9.
- **El catálogo de entornos es el techo de calidad.** Un tema que no encaje en ningún entorno saldrá genérico (cae a `tech_oscuro` + overlays). Cada entorno nuevo amplía los temas posibles.
- **Velocidad del render**: con desenfoque y bloom, espera varios minutos por video a 1080x1920 en una GPU media. El 2K (`--scale 1.3333`) tarda bastante más.
- **R3 dura 124 s**, el doble que el resto. Este plan apunta a 55–62 s; el validador permite subir el límite con un flag si quieres formatos largos.

---

## Apéndice A · Medidas crudas

Ver `tools/medicion/medidas_referencias.json` (salida de `measure.py` para los 5 videos). Resumen del audio (`audio.py`):

| Video | Mediana RMS | Piso p10 | % silencio | Pausas >250 ms | Pausa más larga |
|---|---|---|---|---|---|
| R1 avión | −18,5 dB | −65,0 dB | 26,7 | 18 | 1,05 s |
| R2 perro | −21,1 dB | −57,6 dB | 30,1 | 25 | 0,80 s |
| R3 reloj | −18,3 dB | −55,2 dB | 27,8 | 39 | 0,90 s |
| R4 | −21,2 dB | −30,9 dB | 1,5 | 0 | 0,20 s |
| R5 | −17,3 dB | −27,8 dB | 4,6 | 1 | 0,25 s |

Un piso de −55 a −65 dB significa silencio real entre frases: sin música. Uno de −28 a −31 dB significa una cama musical continua.

## Apéndice B · Guiones reconstruidos (para estudiar la estructura, **no para reutilizar**)

Reconstruidos con OCR de los subtítulos. Las partes entre corchetes las completé yo donde el OCR falló, así que son aproximadas.

**R1 avión (≈155 palabras, 53,6 s, ≈2,9 pal/s)**

- *[Gancho]* ¿Por qué te piden poner el celular en modo avión cuando vuelas?
- *[Tensión]* ¿De verdad tu celular puede tumbar un avión? No. Boeing intentó repetir esos fallos en su laboratorio, y nunca pudo.
- *[Mecanismo]* El problema es otro: [en el aire tu celular busca señal]. Sube su potencia [al máximo] y llega a muchas antenas a la vez, a kilómetros de distancia. Por eso las reglas prohíben usarlo en pleno vuelo: estorba la señal de muchísima gente en tierra.
- *[Segunda capa]* Y al despegar y aterrizar, cerca de las antenas, pasa algo más: cada vez que a un celular le llega un mensaje, en los audífonos del piloto suena un zumbido, como un mosquito. Justo cuando está escuchando la torre de control.
- *[Giro]* Así que el modo avión no es para que el avión no se caiga: es para que el piloto escuche bien.
- *[CTA]* Si te gustó la información, ¿qué otra duda te gustaría que resolvamos en el próximo video?

**R2 perro (≈170 palabras, 61,2 s, ≈2,8 pal/s)**

- *[Gancho]* Así te ve tu perro. Borroso, casi sin colores… y aun así, no te confunde con nadie.
- *[Tensión]* Y no es por tu cara: su cerebro ni siquiera tiene una zona para las caras. [Le] da igual verte de frente que de espaldas.
- *[Mecanismo]* Te reconoce por algo [que tú] ni notas: tu olor. En la nariz tiene hasta 300 millones de receptores. Tú, [unos pocos millones]. [Tu olor es] como una huella: [distinto] hasta [en] dos gemelos idénticos. Y en un escáner, el olor de su dueño le encendió la misma zona del cerebro [que] cuando sabe que va a comer. Ningún otro olor se la encendió tanto. Ni el de otros perros.
- *[Segunda capa]* ¿Y si pasan años sin verte? Eso nunca se ha podido medir. Pero hace casi 3.000 años, Homero ya lo contó: Ulises vuelve a casa tras veinte años, disfrazado de mendigo. Nadie le reconoce. [Solo su viejo perro,] Argos…
- *[Giro]* Porque para tu perro no eres una cara: eres el olor de [casa].

**R3 reloj (124 s; guion largo, misma estructura)**

- *[Gancho]* Te duermes con tu reloj inteligente puesto. A la mañana siguiente te dice cuánto dormiste, cuándo estuviste en sueño profundo y si tu cuerpo se recuperó.
- *[Tensión]* Pero ¿cómo puede un pequeño dispositivo en tu muñeca saber todo eso mientras duermes?
- *[Mecanismo 1]* Acelerómetros: quieto, te mueves, despiertas.
- *[Mecanismo 2]* Sensores ópticos: flujo sanguíneo y frecuencia cardíaca.
- *[Segunda capa]* "Pero aquí es donde se pone más interesante": la variabilidad de la frecuencia cardíaca (VFC) indica relajado, recuperándose o estrés.
- *[Mecanismo 3]* Combinación de señales, algoritmos y fases del sueño, que da la puntuación.
- *[Giro]* No ve directamente cómo duermes: mide señales, analiza patrones y estima.
- *[CTA]* "¿Sabías…? Envíaselo a ese que duerme con el reloj puesto. Si quieres saber más, sígueme."

## Apéndice C · Herramientas incluidas

`tools/medicion/` (ver su `README.md`): `measure.py`, `audio.py`, `ocr_caps.py` y `chunks.py`, más `medidas_referencias.json`. Se usan en la Fase 8 y en el bucle de §9.
