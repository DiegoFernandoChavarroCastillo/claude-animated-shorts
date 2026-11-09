# Decisiones tomadas sin consultar (para revisar)

Durante las fases 1–3 el usuario pidió que, ante dudas técnicas o de diseño, tomara la opción recomendada y la
anotara aquí. Cada decisión dice qué se eligió, por qué y qué alternativa queda. Marca las que quieras cambiar.

## Generales

**D1 · Mapeo de los videos de referencia.** Por duración y contenido: R1 avión = `video5`, R3 reloj = `video4`,
R4 escape = `video2`, R5 noche = `video1`. **R2 (perro) no está** entre los 5 videos: `video3` es otro short
(dinero / oro, "Día uno: un gramo") que el plan no describe. Las comparaciones de F1 usan R1 (es el que tiene más
cajas de selección). *Alternativa:* añadir el video del perro a `references_local/videos/`.

**D2 · Formato de `words.json`.** Se usa el del plan (§7.5): `{ "w", "start", "end", "beat" }`. El `mix.py`
original lee `s` / `e`; se adaptará en F5 al portar el audio.

**D3 · Tiempos de palabra sintéticos hasta F5.** Sin TTS todavía, `studio/scripts/fake_words.mjs` genera
`words.json` con el ritmo del plan (~4 pal/s hablando, pausas de 0,22 s tras coma, 0,45 s tras punto, 0,5 s entre
beats, +0,5 s antes del giro). Se sustituirán por la alineación real en F5.

**D4 · `zod` 4.6.7.** No se pasa el esquema a `<Composition schema>` (Remotion lo valida con su propia versión);
se usa solo para validar `story.json` en `Explainer` y, más adelante, desde los validadores.

**D5 · Script de stills generalizado.** `studio/scripts/stills.mjs` ahora recibe
`<outDir> <Comp@f1,f2> [...] [--scale s]` y renderiza varias composiciones con un único bundle.

## F1 · Subtítulos

**D6 · Caja de selección más ajustada que el plan.** El plan daba un padding de 6/10 px a 720 (= 9/15 px a 1080).
Medido sobre la caja de "torre" en R1, la caja real mide ~80 px de alto a 1080 con ~8 px de margen lateral. Valores
finales: padding 4 / 8 px, alto de la caja = tamaño de fuente, borde 3 px, radio 6 px, tiradores de radio 8 px con
aro blanco de 2,5 px (el verificador pidió bajar de 10 a 8).

**D7 · Palabras ya dichas en blanco translúcido.** El plan decía gris `#8E929B`. El verificador observó que en R1
se ven como blanco semitransparente; se usa `rgba(255,255,255,0.58)`. Sobre fondo navy da casi el mismo gris,
pero sobre escenas claras u oscuras se integra mejor.

**D8 · Relleno de la caja al 50 %.** El plan decía `rgba(30,64,175,.35)`; sobre navy apenas se veía. Se sube a 0,5.

**D9 · Las palabras aún no dichas reservan su sitio.** El bloque se maqueta entero desde el principio (a peso 700)
y las palabras aparecen en su posición final, así no hay saltos de texto. Igual que R1 ("¿De" aparece a la
izquierda y luego se completa la línea).

**D10 · Margen de seguridad del 2 % en la medida de texto.** `measureText` se queda ~1 % corto frente al texto
renderizado; sin margen, una línea con caja llegó a ocupar el 84,4 % del ancho.

**D11 · Variante `accent`.** La palabra clave va en azul claro `#8AB4FF` solo mientras es la activa; después pasa
al color de las palabras dichas, como cualquier otra.

**D12 · Arreglos del verificador no aplicados.** (a) "Añadir sombra": ya existe (`0 2px 10px rgba(0,0,0,.45)`),
no se ve sobre fondo liso. (b) "Bloques de 1–4 palabras y una sola línea": contradice el plan (3–6 palabras,
hasta 2 líneas) y R1 también tiene bloques de 2 líneas; se mantiene el plan. (c) "Reducir la fuente un 6 % si
una palabra larga deja otra sola en la línea": caso raro; se deja para el bucle de look-match si se repite.

## F2 · Composición genérica `Explainer`

**D13 · Ejemplo `hielo-flota` con 7 beats y 143 palabras.** El plan pedía 5–6 beats; con la fórmula de §3.10
(gancho, tensión, 2 de mecanismo, segunda capa, giro y CTA) salen 7. Con tiempos sintéticos dura 48,6 s; con la
voz real (F5) y sus pausas debería acercarse a 55 s. *Alternativa:* fundir los dos beats de mecanismo.

**D14 · Fuentes del ejemplo sin verificar.** No tengo acceso web en esta sesión: cité artículos generales
(Wikipedia "Properties of water" e "Ice", Britannica "Ice") para el 9 %, los 917 g/L y los 4 °C. Son datos
estándar, pero las URL se verifican en F6, cuando el validador exija fuentes.

**D15 · Significado de `transition`.** Es la transición **hacia el beat siguiente**.
- `glide` con el mismo decorado (mismo `env`, `light` y `hero.asset`): la cámara planea 30 f desde donde acabó el
  beat anterior, sin fundido.
- `glide` con otro decorado: fundido de 12 f y la cámara llega desde un lado y desde más arriba.
- `zoom_through`: la cámara acelera hacia el objeto los últimos 24 f, fundido de 12 f y el beat siguiente arranca
  muy cerca y se aleja.
- `crossfade`: fundido de 12 f. `cut`: corte seco.

**D16 · Catálogo provisional.** Los `env` (`cocina_noche`, `tech_oscuro`, `lago_invierno`) y los `hero.asset`
(`vaso_agua_hielo`, `moleculas_agua`, `lago_corte`) del ejemplo apuntan a un decorado genérico (cielo, suelo con
rejilla, siluetas y puntos de luz) y a un cubo con bisel. Están marcados `provisional: true`; F4 los sustituye.

**D17 · Tiempos de beat.** Cada beat empieza 2 frames antes de su primera palabra (el cambio visual llega justo
antes de la voz, como en el puente), termina donde empieza el siguiente y el último tiene 1 s de cola.

**D18 · Movimiento mínimo de cámara.** Todo plano lleva empuje ≥ 0,12 %/frame **y** una deriva lateral suave de
0,6 px/frame (alterna de lado en cada beat, máx. 90 px por beat). La deriva se añadió porque `measure.py` no
detecta los empujes lentos sobre fondos lisos y desenfocados (la limitación que ya anotaba §3.2). El preset
`drift` va a 1,2 px/frame pero con tope de 130 px por beat, para que el objeto no se salga del encuadre.

**D19 · Materiales físicos en vez del sombreado de dos tonos.** El puente usaba un toon de dos tonos para su estilo
de dibujo animado; el explainer 2.5D usa `MeshStandardMaterial` con luz ambiente + luz principal + contraluz,
relativas a la cámara y congeladas por beat (la idea del puente). La tinta está desactivada.

**D20 · Renders de prueba a escala 0,5.** Los videos de comprobación de F2 se renderizan a 540x960 para que tarden
menos en esta GPU. Los criterios de `measure.py` son relativos, así que valen igual.

**D21 · Grade inicial a ojo.** Los cuatro presets de grade son un punto de partida. Con el decorado provisional la
saturación mediana sale 0,74 (objetivo 0,40–0,62): se calibra en F4 con los entornos de verdad.

**D22 · Sombras PCF.** three 0.187 ya no tiene `PCFSoftShadowMap` y Remotion lo pide por defecto: three avisa y usa
`PCFShadowMap`. Es solo un aviso en el log.

**D29 · `measure.py` necesita textura, no solo movimiento.** Con el decorado provisional liso y desenfocado, un
tramo con órbita de 12° (movimiento evidente) daba solo un 2 % de frames "en movimiento" y una racha estática de
74 frames: el flujo óptico (a 180x320) no encuentra nada que seguir. Al dar textura al fondo (ventanas encendidas en
las siluetas, rejilla más marcada, 90 puntos de luz), el mismo tramo pasó al 96,7 % y a una racha de 1 frame.
Consecuencia para F4: **cada entorno debe tener textura y contraste en el fondo aunque vaya desenfocado**. Nota:
R3 da una racha de 96 frames con este medidor, así que el límite de 45 de F2 es más estricto que las referencias.

**D30 · Objeto protagonista un poco más arriba.** Centro al 55 % del alto (antes 57 %) y slot `bottom` de overlays
al 79 % (antes 77 %), para que un `StatCallout` no pise la base del objeto.

## F3 · Overlays

**D23 · Lienzo de 1080 x 1920 y posiciones fijas.** Todos los overlays dibujan en px a 1080 dentro de un lienzo
que se escala al tamaño real. Se colocan en "slots" dentro de la zona 30–85 %: `top` 37 %, `upper` 44 %,
`center` 57 %, `lower` 70 %, `bottom` 77 % (configurable con `"slot"` en story.json).

**D24 · Overlays anclados sin hablar con el canvas.** `useProjectedPoint` / `anchorPoint` proyectan el ancla
usando la misma función de cámara (pura) que la escena 3D. Los anclados (`PulseRings`, `Callout3D`,
`LightTrails`) recortan su posición y su tamaño para no entrar en la banda de subtítulos.

**D25 · Duración de un overlay.** Desde su `at` hasta el final de su beat, salvo que lleve `"dur"` en frames.
Salida con fundido de 6 frames.

**D26 · Cero colores literales en `overlays/`.** Más estricto que el criterio del plan (sin hex): tampoco hay
`rgba()`; todo sale de `PALETTE` en `style.ts`.

**D27 · Iconos propios.** 18 iconos de línea en `overlays/icons.tsx` (luna, sol, reloj, ojo, teléfono, cara,
corazón, señal, avión, chip, sensor, gráfica, cerebro, gota, nieve, check, nariz). Sin librerías ni marcas.
**D28 · Revisión del verificador de F3 (nota 5/10) y arreglos aplicados.** Lo principal: todo se veía pequeño a
tamaño de móvil. Aplicado: escala general ×1,35 en todos los overlays colocados (`OVERLAY.scale`), con anchos
ajustados para no pasar del ~95 % del ancho; `Waveform` e `IntervalMarks` dentro de tarjeta; `Pill`, `Callout3D`,
`ClockChip` y `NoSymbol` con texto más grande; anillos de `PulseRings` más visibles; `LightTrails` en cian y con
partículas más grandes; marco de `LineBoard` en lavanda en vez de marrón. **No aplicado (para el bucle de
look-match):** puntos violetas en los picos de la onda, `Gauge` con la etiqueta en píldora y escalar todavía más
(×1,8 pedido). Tras los arreglos no volví a pasar el verificador; la galería sigue sin invadir la banda (36/36).

**D31 · Movimiento mínimo de cámara medible (cierre del criterio de F2).** El render completo con la deriva de D18
dio una racha quieta de 207 frames: el objeto se movía, pero el fondo lejano (la mayor parte del cuadro) casi no, y
`measure.py` promedia todo el frame. Probé una órbita alrededor del objeto y la descarté (el suelo delante del
objeto y el fondo se mueven en sentidos opuestos y se anulan en la media). Lo que se queda:
- El empuje es un **zoom de lente** (se cierra el campo), no un acercamiento de cámara: escala todo el cuadro.
- `pushMin` sube de 0,12 a **0,25 %/frame** (rango del plan 0,1–0,3); `measure.py` lee entre el 25 y el 75 % del valor.
- La deriva base sube de 0,6 a **1,0 px/frame**, con un tope de 150 px por beat (antes 90 px).
- Empuje y derivas se **centran en la mitad del beat**: el plano empieza algo más abierto y termina algo más
  cerrado; sin esto, al final de un beat largo el objeto se salía del cuadro.
- El suelo provisional lleva una subrejilla tenue y motas con semilla fija (amplía D29: los entornos de F4 también
  necesitan textura fina en suelo y fondo).

## F4 · Entornos y objetos

**D32 · Ids del ejemplo.** Los entornos provisionales de F2 (`cocina_noche`, `lago_invierno`) no están en la lista
del plan y desaparecen. En `hielo-flota`, el vaso de agua (b01, b02, b07) pasa a `interior_neutro` con luz `noche`, y
el corte de lago (b05, b06) a `interior_neutro` con `dorado`/`atardecer`. Ningún entorno del plan encaja mejor con
"cocina" ni con "lago en invierno".

**D33 · Sin modelos glTF todavía.** En esta sesión no tengo acceso web para descargar Kenney/Quaternius, y la
inventario ya decía que faltaban (DIF 3). El cargador queda hecho (`heroes/gltf.ts`, con recoloreo por material y
`delayRender`) y `heroes/LICENSES.md` lista "ningún modelo externo". **No está probado con un modelo real**: hay que
probarlo con el primero que se añada.

**D34 · Tarjetas (`chars/`) simplificadas.** La API `Pen` se porta tal cual, pero sin tinta (ol = 0), con degradados y
trazos de pelo pintados. El material de tarjeta es `MeshStandardMaterial` con recorte por alfa en lugar de
`cardshade.ts`: el sombreado de tarjetas del puente depende de toda su cadena Lambert/two-tone (`shade.ts`), que el
explainer no usa (D19). El degradado de forma va pintado en el dibujo. Hay dos personajes: `perro` (de perfil) y
`persona` (de espaldas).

**D35 · Recalibración del grade por luz.** Los valores se midieron sobre los stills de `EnvGallery`, quitando la banda
de subtítulos. Media final: luma p5 0,12, mediana 0,19 y saturación 0,60, dentro del rango del plan. Por escena, las
de `tech` y `noche` quedan entre 0,65 y 0,80 de saturación: el propio token `bg.night0` (`#0A091A`) ya tiene saturación
HSV 0,65, y R3 mide 0,61. El cielo de atardecer queda algo claro (luma mediana 0,49, frente a 0,37 de R1).

**D36 · `radius` es de encuadre, no de la esfera envolvente.** La cámara se aleja para que 2 × radius ocupe ~55 % del
ancho. Cada entorno declara `view: { el, dof, distK }`: elevación de cámara, desenfoque por defecto y factor de
distancia (`vista_aerea` usa 2,6 para ver la ciudad y el horizonte).

**D37 · Pantallas sin texto.** Las de `telefono` y `reloj` solo llevan iconos y cifras ("22:47", "5G", "98 %"), para
que sirvan igual en español e inglés y sin interfaces de marcas reales.

**D38 · Suelos y paredes grandes, mate (Lambert).** Con `MeshStandardMaterial`, al ver un suelo a ras, el especular de
Fresnel reflejaba la luz de borde y teñía el suelo entero (cian en tech, granate en interiores). Lo detectó el
verificador: un suelo negro seguía saliendo teal. Precisa D19: objetos y piezas pequeñas usan el material estándar, y
los suelos y paredes grandes, `matte()`.

**D39 · Culling.** Se ocultan solo los objetos marcados con `blocker()` (paredes, edificios, muebles, nubes cercanas),
probando con segmentos cámara→protagonista al centro y a 4 puntos de su contorno, con un margen de 0,25 m. Con los
encuadres actuales no tapa nada de verdad. `CullTest` lo demuestra con 2 obstáculos de control por entorno (8/8
entornos 2/2) y cuenta 0 cámaras dentro de objetos o bajo el suelo en 1.248 posiciones por entorno (3 protagonistas ×
8 cámaras, con transiciones).

**D40 · Catálogo con doble comprobación.** `templates/catalog.json` está escrito a mano para el LLM. `catalog.ts` lo
cruza con el código en los dos sentidos (ids, poses, anclas, `anchored`, iconos) y `calculateMetadata` valida cada
story.json contra él, así que un id inventado falla antes de renderizar. La pose `lateral` (cámara a 35°) solo es
válida si el protagonista la declara (`vaso_agua_hielo`).

**D41 · Referencias de la hoja lado a lado.** R2 no está (D1) y `video3` es otro short (lingotes de oro), así que
`calle_noche_bokeh` y `exterior_clasico` se comparan con el fotograma de luz más parecida (R3 noche y R1 atardecer),
no con su tema.

**D42 · Composiciones de desarrollo.** `EnvGallery` es un `Explainer` normal con un story de 12 beats (8 entornos y 4
objetos extra) en `dev/`. `CullTest` es la tabla de la prueba de culling. Ninguna forma parte del pipeline.

## F5 · Audio (decididas contigo en el chat)

**D43 · Motores TTS: Kokoro y Piper instalados; Chatterbox no.** Chatterbox tiene su adaptador escrito, pero no está
instalado, porque necesita una GPU NVIDIA (este PC tiene una Intel HD 530). Kokoro 0.9.4 es el motor por defecto y
Piper 1.8.0 el respaldo. Las dos voces de Piper (es_ES-davefx, en_US-lessac) se descargan solas a `pipeline/models/`,
que no se versiona.

**D44 · Ejemplo en inglés.** `templates/examples/hielo-flota-en/` es la traducción de `hielo-flota`: mismos beats,
escenas y overlays, con las palabras clave y los `at` adaptados.

**D45 · Whisper medium** para la alineación (CPU, int8).

**D46 · Voces.** Español: principal `em_alex`, alternativa `em_santa`. Inglés: principal `am_fenrir`, alternativa
`af_heart`. Las muestras se generan con `pipeline/voice_samples.py`.

**D47 · Tiempos reales en los ejemplos.** El `04_words.json` de los dos ejemplos es ahora el alineado con la voz de
Kokoro, en lugar del sintético de F2. Los WAV no se versionan; se regeneran con `voice.py`.

**D48 · Detalles técnicos de F5 (sin decisión de diseño):**
- PyTorch necesita el Visual C++ Redistributable actual; está en `requirements.txt` y en `setup_audio.ps1`.
- espeak-ng no hace falta instalarlo aparte: Kokoro trae `espeakng-loader`.
- Whisper alarga a veces la última palabra de una frase hasta el silencio siguiente, así que los tiempos se recortan
  al tramo real de cada frase, que se conoce por la síntesis.
- Los SFX cortos (tick, pop) se limitan a un pico de "voz − 6 dB", porque medidos en ventanas de 400 ms salían con
  picos enormes.
- El módulo de síntesis de SFX se llama `sfx_synth.py`, porque `templates/audio/sfx.py` ya existe.

**Corrección de D33:** la terminal sí tiene internet; la que no tiene acceso es mi herramienta de web. Los modelos
glTF CC0 se pueden descargar. Queda como tarea aparte después de F5.

## F6 · Guion (decididas contigo en el chat)

**D49 · Fuentes como lista "número → URL".** En `## Fuentes`, una línea por dato que repite el número tal como
aparece en el guion (en cifras o en palabras) y lleva la URL. El validador detecta números en cifras y en palabras
(es y en) y exige que cada uno aparezca en alguna línea de fuentes, ya sea con el mismo texto o con el mismo valor. El
texto del guion queda limpio para la voz. "por ciento" no cuenta como el número 100, y "un", "a" y "one" solo se unen
a palabras de escala ("un millón", "a thousand"), no a "un nueve por ciento".

**D50 · Gancho estrictamente en 2.ª persona**, como dice el plan. Los ganchos de `hielo-flota` (es y en) se
reescribieron: "¿Te has preguntado por qué flota el hielo, si es agua sólida?" y "Have you ever wondered why ice
floats, if it's just solid water?". El inglés se alargó hasta 144 palabras para llegar al mínimo de 140. Se
regeneraron su voz y su alineación: 2,83 y 2,89 palabras/s; 25,8 % y 25,3 % de silencio.

**D51 · Formato de `02_SCRIPT.md` y detalles del validador:**
- Formato: `lang:`, `## Guion` (o `## Script`) con líneas `[rol] texto`, y `## Fuentes` (o `## Sources`).
- El validador comprueba también que los roles vayan en orden.
- Para "llamada a la acción", acepta verbos de CTA ("comenta", "envíaselo", "sígueme", "tell me"...) o una pregunta.
- La 2.ª persona se detecta por pronombres y posesivos, por verbos frecuentes en 2.ª persona y por pretéritos en
  `-aste`/`-iste`.
- Las pruebas están en `pipeline/tests/test_validate_script.py`: 3 guiones que pasan y 4 rotos, cada uno con un solo
  defecto.

**D52 · Ejemplos de guion.** Hay 3 temas originales en los dos idiomas: `hielo-flota` (es/en), `cielo-azul` (es/en) y
`dedos-arrugados` (es/en). `cielo-azul` y `dedos-arrugados` solo tienen guion (sin `story.json` ni voz). Sus fuentes
son de memoria (Wikipedia y Kareklas et al. 2013), no verificadas en esta sesión: revísalas si se publican.

## F7 · Orquestador (decididas contigo en el chat)

**D53 · `init` explícito.** `make_short.py init --id X --from <carpeta>` copia `01_research.md`, `02_SCRIPT.md` y
`05_story.json` a `out/X/`. Después todo trabaja solo con `out/X/`.

**D54 · Escala.** El render final usa 1.0 por defecto (`--scale` para cambiarlo). La prueba de F7 se hizo a 0,5 con
un solo proceso: 6,6 minutos para 1.573 frames, mucho más rápido que los renders por CLI de F2. El bundle único y
`renderMedia` ayudan.

**D55 · Detalles técnicos del orquestador:**
- **Checkpoints:** una etapa se salta si su artefacto existe y es más nuevo que sus entradas.
- **`--force <etapas>`:** rehace las etapas indicadas y borra antes su artefacto, para que un render forzado e
  interrumpido no deje el video viejo pasando por bueno. Lo destapó la prueba de interrupción.
- **Render interrumpido:** escribe `.part.mp4` y solo renombra al terminar.
- **Bundle:** `studio/scripts/job.mjs` empaqueta una vez en `C:/remotion-tmp/bundle` y lo reutiliza mientras no
  cambie el código (sello por hash de `src/`, `public/` y `templates/`).
- **Voz antes del story:** sale del guion (una línea = un beat `b01`, `b02`…). Si ya existe `05_story.json`, se toma
  de él la voz elegida. `validate_story` comprueba que los textos del story y del guion coincidan línea a línea.
- **QA básico:** `10_qa.md` mide duraciones, loudness del final y `measure.py`. El QA de estilo completo es de F8.
- **`catalog.json`:** los overlays numéricos llevan `"numeric": true`, y `catalog.ts` lo cruza con el registro.
## Cambio de PC a Linux (2 nov, antes de F8)

**D56 · El proyecto también corre en Linux (CachyOS).** Desde F8 se trabaja en un portátil Linux (Intel UHD, 4
núcleos, 11 GB de RAM, sin GPU NVIDIA usable). Cambios:
- **Venv con `uv`** y Python 3.11, porque el sistema trae 3.14. **PyTorch en versión CPU** (índice
  `download.pytorch.org/whl/cpu`): la versión por defecto de pip en Linux trae ~3 GB de librerías CUDA que aquí no
  sirven.
- **`REMOTION_TMP` por defecto:** `C:/remotion-tmp` en Windows y `~/remotion-tmp` en el resto (`make_short.py`,
  `job.mjs`, `stills.mjs`). No se usa `/tmp` porque suele ser tmpfs (RAM). Antes, sin la variable, en Linux se creaba
  una carpeta `C:` dentro del repo.
- **Mismo resultado que en Windows:** la prueba de humo de `hielo-flota` (escala 0,5) da las mismas medidas de
  `measure.py` (luma mediana 0,116, saturación 0,677, racha estática 178) y la misma mezcla (−14,0 LUFS). Lo que se
  mida en F8 en este PC vale para el otro. Tiempos: voz 36 s, alineación 2,9 min (con la descarga de Whisper),
  stills 41 s, render 5,2 min.

## F8 · QA de estilo (decididas contigo en el chat)

**D57 · Calibración de `style_check.py`.**
- **Referencias:** como R2 (el perro) no está, cuentan **R1 (`video5`), R3 (`video4`) y R4 (`video2`)**. R5 (`video1`)
  se mide pero es informativa: tiene 3 fallos (saturación 0,34, racha 116, silencio 4,6 % por la música). El 80 %
  se cuenta por video: al menos 8 de 9 métricas.
- **Palabras/s en las referencias:** se transcriben una vez con Whisper medium. El resultado se guarda en
  `references_local/medidas/<video>.words.json` (no versionado). En nuestros videos se usa `04_words.json`.
- **Rangos ajustados** (el resto, como el plan):
  - Cortes duros: **≤3,5/min** (antes ≤3). R4 tiene 3 cortes de escena reales en 58,6 s (3,07/min).
  - Palabras/s: **2,5–3,0** (antes 2,6–3,0). Whisper da 2,57 en R3. El plan decía 2,8–2,9, medido de otra forma.
- **Resultado:** R1 8/9 (falla cortes: 7,8/min), R3 9/9 y R4 8/9 (falla silencio: 1,5 %, por la música de fondo).
  Informe en `references_local/medidas/style_refs.md`.
- **Subtítulos por OCR:** los frames se sacan de `07_video.mp4` con ffmpeg (uno por bloque, a mitad de su última
  palabra), sin volver a renderizar. Los bloques se calculan con las reglas de `chunker.ts`, salvo el corte por
  ancho, que necesita medir la fuente. Por eso solo se busca la **última palabra** de cada bloque, que siempre está
  visible. Se pasa con ≥90 % de palabras encontradas y el 100 % de las encontradas dentro de la banda del 12–30 %.
  Tesseract `--psm 6` sobre una máscara del texto claro: en `hielo-flota` lee 29 de 31 bloques, y los 2 fallos son
  errores del OCR (el subtítulo está bien). `--psm 11` lee peor (28 de 31).
- **Integración:** la etapa `qa` de `make_short.py` escribe un único `10_qa.md` con el QA básico, el de estilo y el
  de subtítulos. Si algo sale ❌, avisa pero no falla. La regla de diseño de F2 (racha ≤45 frames, D31) sigue como fila
  propia del QA básico. Es más estricta que el rango de las referencias (≤100).

**D58 · Arreglo de los pendientes 1 (racha estática) y 2 (color).** Diagnóstico beat a beat: todos los beats salían
igual de oscuros (luma 0,11–0,14) y saturados (0,58–0,72), así que el problema estaba en el grade y no en un entorno.
Los azules muy oscuros tienen saturación HSV alta aunque se vean apagados (`#171633` = 0,73). La cámara sí se movía,
pero el flujo óptico no lo veía: el suelo y la pared lisos dan flujo ~0 y bajan la media de todo el cuadro. Arreglos:
- **Grade (`world/grade.ts`):** curva con tonos medios más altos (p. ej. noche: 0,1 → 0,195, 0,25 → 0,37,
  0,5 → 0,59) y menos saturación en sombras (noche 0,82 → 0,55; tech 0,66 → 0,48). Medido sobre 14 stills:
  luma 0,124 → 0,181, saturación 0,668 → 0,538.
- **Otros entornos (`EnvGallery`, un still por entorno y luz):** con el grade original pasaban 4 de 12 combinaciones
  (luma 0,14–0,38 y saturación 0,40–0,62). La primera subida de `atardecer` sobreexponía los entornos claros, así que
  `atardecer` solo sube las sombras y `dorado` conserva más saturación en sombras. Ahora pasan **8 de 12**. Siguen
  fuera `cielo_atardecer` (0,49, ya lo estaba), `tech_oscuro` con `noche` (0,086 / 0,75, ya lo estaba),
  `vista_aerea` (0,380, en el borde) y `calle_noche_bokeh` (saturación 0,38). Con un grade por luz no se pueden
  cuadrar todos: queda pendiente permitir un ajuste de grade por entorno.
- **Textura en `interior_neutro`:** baldosas de ~1,25 m con juntas y tono variable en el suelo, y juntas de panel
  marcadas en la pared. El zoom que lee el detector en b02 sube de 0,03 a 0,10 %/frame (umbral 0,08).
- **Cámara:** `pushMin` sube de 0,25 a **0,30 %/frame** (el máximo del plan). La deriva del preset `drift` pasa de
  como mucho 130 px a **200 px por beat** (±100). El objeto, al 55 % del ancho, tiene ~240 px de margen a cada lado.
- **Resultado en `hielo-flota`** (escala 0,5): luma mediana 0,181, saturación 0,52, racha estática **30 frames**
  (cumple la regla de diseño de ≤45, D31). `style_check` da 9/9.
- **OCR de subtítulos:** con el fondo más claro, la máscara "claro y poco saturado" cogía bordes de ventanillas y
  nubes, y el acierto bajó al 71 %. Ahora la máscara solo coge casi blanco (la última palabra es la activa, `#FFFFFF`)
  dentro de la franja del 8–36 % del alto. Resultado: 100 % de 31 bloques, todos dentro de la banda.

**D59 · Arreglos del look-match de F8 (rondas 1–4, `docs/LOOKMATCH.md`).** Decidido con Diego: arreglos del sistema
y encuadres del ejemplo; las moléculas, el lago y el acento quedan para F10.
- **`interior_neutro`:** ventanillas más bajas (y = 2,3), al 85 % y separadas hacia los lados (±0,36 y ±0,66 rad):
  el texto cae sobre pared lisa y el protagonista no tiene un marco detrás. La sala se tiñe con el color de la hora
  (`atardecer` 0,22, `dorado` 0,20) en pared, mancha de luz detrás del protagonista y luz de ventana (contraluz). En
  `dorado` ese color es el de la luz principal (oro), porque su horizonte es marino. Niebla 12–60 m (antes 20–70) y
  la parte alta de la pared más oscura.
- **Cámara:** el empuje de un beat se limita a un cambio de escala total de **×2,6** (`pushMaxZoom`). Con 0,3 %/frame,
  un beat de 10 s pasaba de ×1,6 a ×0,6 y el planeo al beat siguiente se veía como un salto. El planeo entre beats
  del mismo decorado dura **50 frames** (`glideSameSetFrames`, antes 30). La deriva de base llega a **±110 px**
  (`baseDriftMaxPx` 220, antes 150).
- **Vaso:** borde de vidrio Fresnel (aditivo), hielo más opaco y emisivo, agua más visible y `radius` 0,95 (antes 1,1),
  así que el encuadre lo deja algo mayor.
- **Moléculas:** giro de 0,007 rad/frame (antes 0,004).
- **`StatCallout`:** velo oscuro radial tras el número, porque las líneas del suelo tech lo cruzaban.
- **Ejemplo `hielo-flota` (es/en):** b02 en órbita de 45°, b06 en deriva lateral y b07 con `zoom_through`, para no
  repetir los planos de b01 y b05.
- **Resultado:** look-match de 5,5 a **6,8/10**. QA completo OK: estilo 9/9, OCR 100 %, racha 41 frames.
- **Coste:** en `EnvGallery`, `interior_neutro`+`dorado` cae a 0,36 de saturación (ámbar claro), así que pasan
  7 de 12 combinaciones (con el grade original pasaban 4). Queda para F10, junto con el grade por entorno.
- **Probado y descartado:** órbita en b06, porque el suelo y el fondo se anulan en el flujo óptico (como en D31) y
  dejaba una racha de 86 frames. Tope de escala ×1,8 y niebla 7–45 m, que borraban la textura que necesita el
  detector.

**D60 · Dos sonidos ll/y seguidos (decidido con Diego, 2 nov).** En "una botella llena", Kokoro alargaba "botella"
(0,56 s) y dejaba un silencio de ~120 ms antes de "llena", y sonaba como si hubiera una coma. Los fonemas que recibe
el modelo no llevan pausa (`βotˈeʎa ʎˈena`): es la prosodia de Kokoro al juntar dos sílabas con "ll". Se decidió
evitarlo desde el guion:
- `validate_script.py` (solo `es`) da **error** cuando una palabra termina en "ll"/"y" + vocal y la siguiente, sin
  puntuación en medio, empieza por "ll" o "y" + vocal. La "y" sola (conjunción), "muy" u "hoy" no cuentan. Test nuevo:
  `bad_ll_seguidas.md`.
- `templates/prompts/script_es.md`, regla 8: pide al guionista que no junte esos sonidos y da ejemplos de cómo
  reescribir.
- Ejemplo `hielo-flota`: "una botella llena" pasa a "una botella con agua" (147 palabras).

**D61 · Entonación de pregunta (decidido con Diego, 2 nov).** Kokoro termina igual una pregunta que una afirmación:
en `em_alex`, `em_santa`, `ef_dora` y en inglés (`am_fenrir`), el tono cae 4–5 semitonos al final, también con "?".
Los fonemas sí llevan el "?", pero el modelo no lo usa, y reescribir la frase no lo arregla (probadas 5 variantes).
Arreglo general en la etapa de voz (`pipeline/tts/prosody.py`):
- En las **preguntas de sí/no** se reescribe la curva de tono de los últimos ~0,5 s sonoros, que sube de forma
  gradual hasta **+3 semitonos**. Se hace con el vocoder WORLD (`pyworld`, nueva dependencia), que cambia el tono sin
  cambiar el timbre. Solo se vuelve a sintetizar ese tramo, empalmado con un fundido de 20 ms.
- Las preguntas con interrogativo ("¿Qué…?", "¿Por qué…?", "What…?", aunque empiecen por "y"/"and") no se tocan:
  al hablar también terminan bajando.
- Probado y descartado: remuestreo de velocidad variable. Suma una subida a una curva que sigue cayendo; para que el
  final suba de verdad haría falta ~+9 semitonos, y eso deforma el timbre.
- Diego eligió +3 de oído frente a +5. Test: `pipeline/tests/test_prosody.py`.

**D62 · Tratamiento de voz y pausas en las comas (muestras A/B, decidido con Diego, 2 nov).** Cuatro muestras del
mismo fragmento a −16 LUFS: A actual, B +200 ms en cada coma, C tratamiento y D = B + C. **Diego eligió C.**
- **Tratamiento** (`pipeline/voice_fx.py`, aplicado en `mix.py`; `03_voice.wav` queda limpio para la alineación):
  paso alto a 80 Hz, −2 dB a 300 Hz, +2,5 dB a 3,5 kHz, +1,5 dB por encima de 10 kHz, compresión 2,5:1 (envolvente
  RMS de 10 ms) y sala pequeña (RT60 0,35 s) al 12 %.
- **Pausas en las comas: descartadas.** Kokoro solo pausa en algunas comas (120 ms en "congelarse,", nada en
  "hielo,"), pero el resultado sin pausas extra sonó mejor. La técnica queda documentada por si se retoma: la coma
  se sitúa en el audio con `pred_dur` de Kokoro (600 muestras por unidad a 24 kHz).
- **Efecto en `hielo-flota`:** QA OK. El % de silencio baja de 24,1 a **22,8** (rango 22–32) porque la cola de la
  sala y la compresión rellenan los huecos. Si un guion queda por debajo de 22, bajar `ROOM_WET` de 0,12 a 0,08.

## F9 · Skill y documentación (decididas con Diego)

**D63 · Qué pasa a `legacy/` y en qué idioma va el skill.**
- A `legacy/`: el `SKILL.md` anterior (`legacy/SKILL_cartoon-3d-short.md`), `templates/bridge/` (→
  `legacy/bridge/src/`), su guion y su sandbox, los scripts `bridge_*` (→ `legacy/scripts/`) y `references/` (→
  `legacy/references/`). La copia de Studio pasa de `studio/src/videos/bridge` a `studio/src/legacy/bridge`;
  `BridgeShort` sigue registrada como prueba del motor.
- Se quedan: `templates/audio/` (el pipeline usa `dsp.py` y `sfx_gen.py`). `sbs_sheet.py` y `short_qa.py` pasan a
  `tools/qa/`, como pedía el plan (§5).
- `SKILL.md` en **español**, como el resto de la documentación, con disparadores en español e inglés en la
  descripción. El README explica la instalación en Windows y en Linux, y cómo enlazar el repo como skill
  (`ln -s` / `mklink /J`).

## Voz: Chatterbox como motor por defecto (decidido con Diego, 2–3 nov)

**D64 · Chatterbox sustituye a Kokoro.** A Diego la voz de Kokoro no le convencía.
- **Prueba A/B** con el mismo fragmento de `hielo-flota`, el mismo proceso (pregunta ascendente y tratamiento de voz,
  D61 y D62) y −16 LUFS: Kokoro `em_alex`, Pocket TTS (Kyutai, `spanish_24l`, voz "lola") y Chatterbox con el modelo
  de **español latinoamericano** (`ResembleAI/Chatterbox-Multilingual-es-mx-latam`). **Ganó Chatterbox.** Arregla
  además la pronunciación española de Kokoro ("susTHancias"). VoiceStudio se descartó: es una interfaz sobre varios
  motores, no un motor.
- **Ritmo:** Chatterbox habla a ~3,2 palabras/s (el rango es 2,5–3,0). Probados `cfg_weight` 0,3 (3,1), 0,2 (2,88) y
  la voz por defecto estirada al 88 % con rubberband (2,87). Diego eligió **`cfg_weight` 0,2** de oído. La
  velocidad fina que pide `voice.py` se aplica estirando con rubberband, sin volver a sintetizar.
- **Idiomas:** `es` con el modelo latino y `en` con el multilingüe V3, con la voz por defecto del modelo. Kokoro queda
  como respaldo rápido (`voice.engine = "kokoro"`).
- **Instalación:** `pipeline/setup_chatterbox.py` crea `.venv-chatterbox` (Chatterbox fija PyTorch 2.6 y Kokoro usa
  2.15), instala Chatterbox fijado al commit `5de7a54` de GitHub (la versión de PyPI no carga los modelos V3) y arma
  `pipeline/models/chatterbox/{es-latam,mtl-v3}`. El decodificador `s3gen_v3.pt` viene sin dos tablas fijas
  (filtros mel y ventana); el setup las copia del propio código y comprueba que no falte nada más.
- **Integración:** `tts/chatterbox_tts.py` lanza `tts/chatterbox_worker.py` con el Python de `.venv-chatterbox`. El
  worker carga el modelo una vez por video.
- **Coste:** en CPU (este portátil) ~13 veces el tiempo real: unos 13 min de voz para un video de 60 s, más ~1 min de
  carga. Kokoro tardaba 35 s. Corre en segundo plano y no gasta tokens.
- **Licencia:** MIT. Cada audio lleva una marca de agua inaudible (Perth) de Resemble AI.
- **Ritmo, corrección (3 nov):** estirar la voz (rubberband al 85 %, el reajuste automático de `voice.py`) sonó
  "arrastrado y artificial". Las referencias hablan a ~4 palabras/s mientras hablan y bajan a ~2,8 de media con las
  pausas. Por eso, con Chatterbox, `voice.py` ajusta **las pausas** y nunca la voz. Diego eligió de oído la variante
  con pausas ×1,68, que pasan a ser las de todos los videos (`common.py`): 640 ms entre frases, 940 ms entre beats y
  1,6 s antes del giro (antes 380/560/950).
- **Voz de referencia (3 nov):** con la voz por defecto, Diego notó un acento de "gringo hablando español". Causa:
  Chatterbox imita la voz de una muestra, y la que trae el repo (`conds.pt`) es de una persona que habla inglés.
  Con 9 s de Kokoro como referencia sonó mejor, lo que confirmó la causa. Diego grabó su voz (18 s con el celular,
  pico −4,9 dBFS, ~64 dB entre voz y fondo) y es la **voz por defecto en español**: `"voice": "diego"` →
  `voices_local/diego.wav` (carpeta no versionada: es un dato personal). En inglés sigue la voz por defecto del
  modelo, que es nativa. Si el archivo no existe en otro PC, el motor avisa y usa la voz por defecto.
- **Resultado con la voz de Diego (`hielo-flota`, escala 0,5), aprobado por Diego:** 53,7 s, 2,69 palabras/s, 32,0 %
  de silencio (en el máximo del rango) y racha estática de 70 frames (cumple ≤100 de las referencias y no cumple la
  regla de diseño ≤45). La voz clonada habla más pausado que la del modelo, así que las pausas ×1,68 se notan más. Si
  algún video se pasa de 32 % de silencio, la salida es bajar las pausas a ×1,3 (500/730/1200 ms).
- **Caché:** el audio crudo de cada frase se guarda en `_cache/chatterbox/`. Un reajuste de pausas o un `--force tts`
  sin cambios en el texto no vuelve a sintetizar.

## F11 · Ampliación del catálogo (cámaras, overlays, objetos y entornos de ciencia)

- **D65 (3 nov) · Por qué.** `garganta-gripe` usó `persona/espaldas` en 8 de 8 beats (QA con avisos, racha estática de
  103 frames) porque el catálogo no tenía nada de anatomía ni de microbiología, y el skill no avisó. Se amplía el
  catálogo a 72 objetos y 17 entornos por temas (cuerpo, micro, cerebro, química, física, espacio, Tierra, vida, hogar,
  historia, matemáticas), con 10 cámaras y 13 overlays nuevos.
- **D66 · Todo en código, sin glTF.** Se pensó un híbrido (primitivas + modelos CC0). En la práctica los 72 objetos se
  hicieron con primitivas de three.js y texturas de Canvas2D, con la paleta del proyecto (`heroes/primitive/kit.ts`):
  el estilo sale coherente, no hay licencias que seguir y el cargador glTF (nunca probado) sigue sin usarse. Los
  animales (abeja, ave, pez) son formas simples, no tarjetas pintadas.
- **D67 · Red de seguridad.** `validate_story.py` falla si un objeto se repite en más de 3 beats seguidos o en más del
  65 % de los beats (el ejemplo `celular-calienta`, con 5 de 8, pasa). `tools/catalog_search.py` busca por `tags`,
  id y "when" (sin acentos) para no leer 100 filas. `esfera_flotante`, `caja_etiquetada` y `diagrama_flujo` son los
  respaldos para conceptos abstractos. Los huecos se anotan en `out/<id>/05_gaps.md`.
- **D68 · Cámaras y ayudas visuales.** 10 presets (`pull_out`, `orbit_fast`, `crane_up/down`, `dolly_side`, `whip_pan`,
  `dutch_tilt`, `follow_anchor`, `spiral_in`, `arc_over`) que conservan el empuje mínimo, para no empeorar la racha
  estática. Overlays nuevos: guías ancladas (`Arrow3D`, `Highlight`, `ZoomLens`, `FlowArrow`, que exige `to`) y paneles
  (`Timeline`, `Thermometer`, `VersusCard`, `Checklist`, `Steps`, `Equation`, `ScaleBar`, `TrendArrow`, `WarningTag`),
  más 31 iconos.
- **Herramientas.** `tools/catalog_io.py` mantiene el formato manual de `catalog.json` (diff pequeño),
  `tools/add_heroes.py` copia poses/anclas/"when" del código al catálogo, `tools/gallery.py` renderiza una hoja de
  stills de cualquier lista `objeto:pose:entorno`, y `studio/scripts/check_catalog.mjs` (`npm run check-catalog`)
  comprueba catálogo y código sin abrir el navegador.
- **D69 (3 nov) · Segunda tanda.** Diego pidió más variedad: «el medidor de velocidad ya se usó en el del hielo y en el de la
  garganta; no todos los videos pueden usar el mismo». Se añadieron **54 objetos** (6 por rama: cuerpo, micro, mente,
  química, física, espacio, Tierra, vida, hogar/historia/mates/tecnología; 126 en total) y **20 overlays** (12 generales:
  `Speedometer`, `BatteryLevel`, `ProgressRing`, `Countdown`, `Stopwatch`, `ColorScale`, `DotGrid`, `LineChart`, `Compass`,
  `Venn`, `Pyramid`, `BigWord`; 8 de tema: `ECG`, `OrbitDiagram`, `ReactionEq`, `NumberLine`, `ForceArrows`, `DepthScale`,
  `ThoughtBubble`, `FoodChain`; 51 en total). Cada medidor cuenta una idea distinta (nivel, proporción, tiempo, velocidad,
  tendencia), para no repetir `Gauge` en todos los videos. El catálogo avisa de que los medidores numéricos piden `sources`.

## F12 · Ganchos, estructuras y cierres variables

- **D70 (3 nov) · Por qué.** Todos los guiones salían de una sola fórmula (hook → tension → mechanism → layer2 → twist →
  cta, con el gancho de pregunta en 2.ª persona), y los tres ejemplos del prompt empujaban al mismo estilo. Se añaden
  **7 tipos de gancho, 5 estructuras y 5 cierres** (`templates/formulas.json`).
- **D71 · Los elige el usuario, Claude recomienda.** Antes de cada video (paso 1b de `SKILL.md`), Claude propone tres
  candidatos de cada cosa ya redactados para el tema, marca el mejor con su motivo y pregunta con una sola llamada a
  `AskUserQuestion`. Si el usuario ya lo dijo, o contesta «tú decide», se usa lo recomendado. `tools/recent_formulas.py`
  evita repetir el tipo del video anterior.
- **D72 · «Comprobados», con honestidad.** Los ganchos son patrones establecidos y se apoyan en la teoría de la brecha de
  información (Loewenstein, 1994), pero no hay una medición propia de qué rinde más y las cifras de retención de los
  blogs no coinciden entre sí; no se usan. Un estudio de 2024 avisa de que las brechas vagas fallan, así que la regla del
  prompt es «concreto y con pago». Detalle y fuentes en `docs/FORMULAS.md`.
- **D73 · Cómo valida.** El guion declara `hook:`, `structure:` y `closing:` (opcionales: sin ellos es `mito` y vale
  como antes, así que los ejemplos y videos anteriores siguen pasando). El validador comprueba los roles, su orden y
  cuántas líneas lleva cada uno por estructura, y que el gancho y el cierre tengan la forma del tipo declarado. Son marcas
  mínimas: detectan un gancho `pregunta` sin «?», no uno aburrido. Los roles nuevos (`item`, `versus`, `story`, `chain`) se
  añadieron a `schema.ts`, y `validate_story.py` pide overlay también en `item`, `versus` y `chain`.

## F13 · Acciones sincronizadas con la voz

- **D74 (4 nov) · Por qué.** Con `sin-gravedad` Diego notó que el video era «solo ver un modelo 3D moviéndose con subtítulos y
  voz». Faltaba que el objeto **muestre lo que se dice**: al decir «ecuador», una línea roja rodea la Tierra; al decir
  «saldrías despedido», la persona sube. Se añade un sistema de **acciones** (`actions` en cada beat, con `at` = la palabra
  que las dispara), que Claude usa en todos los videos.
- **D75 · Tres clases.** `generic` (mueven el objeto entero: `lift`, `topple`, `fly`, `shake`, `pulse`, `scale`, `spin`, `tilt`,
  `hop`, `slide`; son una función pura del frame, `genericPose`), `marker` (algo en 3D pegado al objeto: `ring`, `arrow`,
  `speed`, `halo`, `burst`, `shockwave`; `MarkerRig`) y **propias de un objeto** (`HeroDef.actions` + `HeroInstance.act`:
  `ecuador` y `eje` en `planeta`, `llamarada` en `sol`, `acelerar` en `corazon`, `inflamar` en `garganta_corte`).
  Todas empiezan en la palabra, suben durante `dur` frames y se mantienen hasta el final del beat.
- **D76 · Cómo se garantiza que se usen.** El prompt del plan visual trae una tabla «si la voz dice… usa…». `validate_story.py`
  rechaza acciones que no existen, anclas inválidas, un `at` que no es una palabra del beat y más de 3 por beat, y con
  `--require-actions` (que `make_short.py` pasa siempre) exige acciones en **al menos la mitad de los beats**. El verificador de
  look-match tiene una nueva área, «Vida». Los overlays anclados siguen al objeto cuando una acción lo mueve, y `sfx_plan.py`
  añade un sonido por acción (whoosh, impacto o pop). Los ejemplos `hielo-flota` (es/en) ya llevan acciones.
- **Límites.** Las acciones propias existen solo para 4 objetos; el resto usa las genéricas y los marcadores. Se pueden
  añadir más en `HeroDef.actions` (ver `heroes/primitive/space.ts`, `planeta`). Un objeto que sale del cuadro deja el plano vacío.
- **D77 (4 nov) · Más efectos generales.** Diego pidió más efectos reutilizables («se encoge, se agranda, etc.»). Se pasa de 16 a
  **41 acciones**: 26 genéricas (nuevas: `grow`, `shrink`, `appear`, `vanish`, `drop`, `swing`, `wobble`, `squash`, `stretch`,
  `flip`, `circle`, `zigzag`, `sway`, `sink`, `turn`, `blink`), 13 marcadores 3D (nuevos: `sparkle`, `beam`, `steam`, `mark`,
  `orbiter`, `rain`, `ripple`) y 2 de cámara (`punch`, `camshake`). `appear` y `drop` cambian cómo empieza el beat (invisible o
  arriba hasta la palabra), `squash` y `stretch` deforman en vez de escalar. Los efectos de cámara están en `camAt` (puros del
  frame), así los overlays anclados los siguen. `tools/actions_gallery.py` renderiza una hoja con cada efecto.

## F14 · Prefabs por video y duración 60–120 s

- **D78 (4 nov) · Prefabs creados en cada video.** Diego notó que faltaban animaciones intermedias (rejilla del microondas con
  ondas, aluminio con cargas que corren a la punta). Se probó crear objetos sencillos por video en
  `heroes/primitive/custom.ts` y registrarlos en el catálogo para reutilizarlos. Resultado en 2 videos (`microondas-metal`,
  `reloj-pulso`; 3 prefabs de ~50–70 líneas): ~10–15 min por prefab, sin coste de render, y siempre hubo que corregir algo
  tras ver el still (material, tamaño, encuadre). Regla: máximo 2 por video, búsqueda previa, prueba con `gallery.py`, y cámara
  con movimiento para prefabs planos. Ver `SKILL.md` y `templates/prompts/story_es_en.md`.
- **D79 (4 nov) · Duración obligatoria: más de 60 s y menos de 120 s.** Para monetizar en YouTube, TikTok, Instagram y Facebook.
  El guion pasa de 140–185 a **175–300 palabras** (la voz real da ~2,6 palabras/s: 167 palabras = 64 s), el máximo de líneas por
  estructura sube (`mechanism` 7, `item` 9, `versus` 7, `story` 4, `chain` 8) y `qa_basic.py` marca ❌ si el video final no está
  entre 60,1 y 119,9 s. Los ejemplos de `templates/examples/` siguen valiendo como forma, no como duración.

## F15 · Más efectos de sonido

- **D80 (4 nov) · 14 acentos generales.** Se pasa de 5 a 19 SFX sintetizados (`sfx_synth.py`): `zap`, `shimmer`, `heartbeat`,
  `swish_up`, `swish_down`, `blip`, `sizzle`, `bubbles`, `drip`, `rumble`, `ding`, `buzz_no`, `crack` y `clock_tick`. Son generales
  (sirven para los 260 temas de `IDEAS_VIDEOS.md`: electricidad, cuerpo, calor, agua, tierra, tiempo…). Cada acción elige su
  sonido (`ACTION_SFX`, y `mark` según el símbolo), y los que no tienen acción se piden con `sfx` (máx. 3 por video).
- **D81 · Director de acentos.** Para no sobrecargar: los acentos salen 3–7 dB más bajos que los de estructura, ≤1 por cada 3 s,
  ≥1,2 s entre sí, ninguno a menos de 0,45 s de otro sonido, sin repetir el mismo en 4 s; los de `sfx` a mano tienen prioridad.
  Lo omitido queda anotado en `08_sfx_plan.json`. Prueba en `reloj-pulso`: 23 eventos en 64 s, SFX 11,9 dB bajo la voz, −14,0 LUFS
  y −1,1 dBTP, QA OK. **Falta el oído:** los sonidos son síntesis y no se pudieron escuchar en esta sesión; `tools/sfx_preview.py`
  genera `todos.wav` para que Diego los escuche y ajuste `REL_DB`.

## F16 · Gancho, ritmo y bucle (primera tanda de `docs/PLAN_MEJORAS.md`)

- **D82 (4 nov) · Validaciones nuevas en `validate_story.py` (con `words.json`).** El gancho se dice en ≤3,2 s; el primer beat lleva una
  acción antes de 1 s y no usa la cámara `drift`; no pasan más de 3,5 s sin un cambio en pantalla (inicio de beat, acción u overlay);
  con cierre `bucle`, `meta.tailS` ≤ 0,3. Medido en los 3 videos hechos: hueco máximo 4,8 / 6,0 / 6,7 s, así que los tres incumplirían
  la regla de ritmo si se validaran hoy (no se rehicieron).
- **D83 · Cola de audio.** `meta.tailS` (por defecto 1,0 s) sustituye a la cola fija: `timeline.ts` y `sfx_plan.py` la leen. Con `bucle`
  vale 0,2 s para que el final empalme con el inicio (1924 → 1900 fotogramas en `reloj-pulso` al probarlo).
- **D84 · Cierre por defecto `bucle`.** `envia`, `pregunta` y `sigue` quedan solo a petición (despedidas predecibles).
- **D85 · Zona segura de las apps.** Los overlays viven entre el 30 y el 70 % del alto (antes hasta el 85 %) y los slots se compactan
  (`lower` 0,57, `bottom` 0,64); debajo van la descripción y los botones. Los números salen de guías de terceros que no coinciden entre
  sí: confirmar con la vista previa en cada app.
- **D86 · OCR de subtítulos.** Ya no cuenta las últimas palabras de ≤3 letras (falsos negativos): `reloj-pulso` pasa de 88,6 % a 100 %.
- **D87 · Etapa `publish`.** `pipeline/publish_pack.py` deja `11_publish.md` (título, descripción, hashtags y comentario fijado por
  plataforma, fuentes) y `11_cover.png` (fotograma 1 s después de la primera palabra). Es un borrador determinista que Claude afina.
- **D88 (4 nov) · Prueba de F16 con `bluetooth-wifi`.** Primer video con las reglas nuevas (hook mito, versus, cierre bucle con `tailS` 0,2): 71,0 s,
  QA OK (estático 19 fotogramas, silencio 27,9 %, OCR 100 %, −14,0 LUFS, −1,1 dBTP). El validador de ritmo obligó a añadir 3 acciones u overlays
  (huecos de 4,0, 3,6 y 3,5 s). Con los overlays por encima del 70 % se taparon el objeto, así que el objeto protagonista sube del 55 % al 47 % del
  alto (`heroScreenYK`) y los slots quedan en `center` 0,52, `lower` 0,61, `bottom` 0,67 (zona hasta 0,72). Prefab nuevo: `espectro_canales`
  (79 canales, barra que salta, bloque ancho del wifi, acción `esquivar`). Cambia el encuadre de todos los videos nuevos; los viejos no se rehicieron.

## F17 · Segunda tanda: bucle, ganchos, sub-planos y datos
- **D89 (5 nov) · Ganchos nuevos y puntuación.** Tres tipos más (`negativo`, `coste`, `contradiccion`; 10 en total) con su forma en el validador, y una
  rúbrica de 5 criterios (0–2) para elegir los tres que se proponen. Cierre `bucle`: tres patrones en el prompt (eco, frase abierta, pregunta
  devuelta) y el validador rechaza despedidas («gracias», «adiós», «suscríbete», «comenta»…). Detalle para ver dos veces: solo guía en el prompt.
- **D90 · Sub-planos (`shots`).** Un beat puede cambiar de preset de cámara a mitad (`at` = palabra): la cámara barre en 9 frames desde donde estaba, sin
  corte duro, así que el QA de cortes sigue en 0. Máximo 3 por beat, preset distinto del anterior, cuentan como evento de ritmo. Probado en
  `bluetooth-wifi` (6 sub-planos en 5 beats): racha estática 19 → 9 fotogramas. Los subtítulos de la palabra clave entran con un golpe de escala.
- **D91 · Bucle visual y datos.** El validador exige que, con `bucle`, el último beat vuelva al entorno y objeto del primero. Se midió la diferencia entre
  el primer y el último fotograma (sin la banda de subtítulos): `bluetooth-wifi` (diseñado como bucle) 0,071 de diferencia y 0,38 de correlación frente a
  0,10–0,12 y 0,21–0,53 de videos que no lo eran: no separa, así que no se añadió al QA. `publish` deja `meta.json` (gancho, estructura, cierre, hueco
  máximo, objetos…) y `tools/ingest_stats.py` cruza un CSV de estadísticas con eso; con menos de 10 videos por grupo avisa de que son anécdotas.

## F18 · Completar el plan y la calidad como puerta
- **D92 (5 nov) · El QA es una puerta.** `10_qa.md` incluye ahora las reglas del plan (`pipeline/qa_rules.py`: gancho ≤3,2 s con acción antes de 1 s, cámara
  del gancho, hueco ≤3,5 s, sub-planos, cola y bucle, densidad de sonido, cama) además de lo técnico. `make_short.py` termina con error si hay filas ❌ y no publica;
  `--allow-qa-warnings` lo salta (hay que decirlo en la entrega). Regla de proceso: **cada función nueva lleva su prueba** en `pipeline/tests/` y
  `python tools/run_tests.py` (12 pruebas y `tsc`) debe dar TODO BIEN antes de comitear. Pruebas nuevas: `test_qa_rules`, `test_sfx`, `test_tts_cache`, `test_bed`,
  `test_timeline` (ejecuta el TypeScript real: cola, sub-planos, zona segura, Insert, overlays), `test_catalog_sync`, `test_examples`, `test_tools`.
- **D93 · Voz.** La síntesis se guarda **por frase** en `out/.tts_cache` (clave: motor, voz, muestra de referencia, velocidad y texto), y `meta.voice.pauseScale`
  (0,5–1,5) cambia las pausas sin repetir nada: en `reloj-pulso` pasar de 1,0 a 0,8 tardó unos 80 s (solo la alineación) en vez de ~8 min. No hay GPU en este PC
  (torch 2.6 solo CPU), así que la síntesis no se acelera; lo que se ahorra son las repeticiones.
- **D94 · `Insert` y cama sonora.** `Insert` (B-roll de datos): corte de 15–60 fotogramas con el fondo oscurecido al 78 %, icono y texto de ≤18 letras; máx. 3, nunca
  en el gancho, con `sources` si lleva un número. Cama opcional (`meta.music`, `musicMood`): acordes sintetizados sin melodía, 24 dB bajo la voz y agachados 6 dB mientras
  hay voz; el QA exige ≥18 dB. Por defecto sigue sin música. Muestras en `out/sfx_muestras/cama_*.wav`.
- **D95 · Herramientas y ejemplo.** `tools/gaps_report.py` (huecos de catálogo por frecuencia), `templates/examples/bluetooth-wifi/` como ejemplo vigente (71 s; `test_examples`
  comprueba que pasa todas las reglas) y 4 objetos antiguos con etiquetas insuficientes ampliadas (`test_catalog_sync`). Sub-planos: el barrido pasa a 12 fotogramas.
- **D96 · Resultado: `reloj-pulso` rehecho.** Guion de 203 palabras (+ melanina), 11 beats, 6 sub-planos y 1 Insert; 73,6 s. La puerta falló dos veces antes de pasar
  (racha estática 48 > 45 en el giro y silencio 32,2 % > 32): cámara `spiral_in` en el giro y `pauseScale` 0,8. Pasa con poco margen (estática 42/45, silencio 31,9/32).
  **Sin hacer:** recortar pausas de la voz a posteriori y el ahorro de síntesis en GPU (no hay), y no se rehicieron `microondas-metal` ni `hielo-flota`.


## F19 · Fidelidad visual (6 nov)
- **D97 · Lo que se ve es lo que se dice.** `manilla-luces` salió con buen guion y audio pero con visuales flojos: un icono `NoSymbol` tapando el objeto, una manilla que no
  parecía de concierto, un teléfono donde la voz decía «portátil o mesa de luces», luces del estadio bajo el suelo y un circuito sin relación con el giro. Causa: la regla
  «usa el objeto más cercano» y el tope de 2 prefabs de ~60 líneas. Ahora: un concepto central sin objeto obliga a crear el prefab (hasta 5 por video, ~100–150
  líneas, con 5+ partes y materiales reales); la sustitución solo vale para lo secundario.
- **D98 · Cada beat declara `shows`.** Con `meta.schema: "f19"` el validador exige una frase `shows` (≥3 palabras) en cada beat y rechaza `NoSymbol`/`BigWord` en slots
  `center`, `upper` o `top` (tapan al protagonista). Los ejemplos antiguos no llevan `schema` y siguen pasando.
- **D99 · Estado de las acciones.** `Scene.tsx` llama a `update(f)` antes que a `act`; en un still suelto (y en el primer fotograma tras un salto) el estado de una acción propia
  llegaba a 0 y el objeto salía apagado. Los prefabs nuevos guardan el último `f` y vuelven a pintar al final de `act`. Los antiguos (`manilla_rfid`, `servidor_rack`…) tienen el mismo
  patrón y quedan pendientes de revisar.
- **D100 · Stills tras la acción y verificador obligatorio.** La etapa `stills` saca ahora un frame extra por beat 0,9 s después de la última acción (`action_frames` en `make_short.py`),
  para ver las luces encendidas y no solo el reposo. Antes del render final se pasa un agente verificador con una hoja de todos los stills y la rúbrica de fidelidad de
  `templates/prompts/verificador.md` (5 notas, paso con ≥7). Ahorro de tokens: una sola hoja de imagen y respuesta de ~220 palabras; el agente ve poco detalle, así que sus quejas se contrastan con los stills.
- **Ejemplo:** 4 prefabs nuevos en `custom.ts` (`manilla_led`, `emisor_ir`, `consola_luces`, `estadio_zonas` con acciones `encender`, `emitir`, `mandar`, `ola`, `sincronizar`).

## story-2d · Shorts narrativos 2D (6–7 nov, rama `story-2d`)

Plan completo y registro de avance: `docs/PLAN_STORY_2D.md`. Piloto: `mito-caverna` (91 s, aprobado por Diego el 7 nov).

- **D101 · Un segundo motor visual en el mismo repo.** Los shorts de historias (alegorías, mitos, relatos, reflexiones) usan `meta.engine: "2d"` y una composición propia
  (`Flat2D`, `studio/src/flat2d/`); el explainer 3D sigue siendo el valor por defecto (`engine_of()` en `pipeline/common.py`). Se descartó un repo aparte: duplicaría voz, mezcla, QA
  y publicación. El riesgo de romper el 3D se controla con rama, cambios aditivos y `tools/regression_check.py`.
- **D102 · Red de seguridad de no regresión (F0).** `tools/regression_check.py` corre las pruebas, valida el ejemplo `bluetooth-wifi`, saca sus stills y los compara con 20 miniaturas PNG
  en `tools/baseline/` (~50 s, determinista: diferencia 0,04; tolera 3,0). La línea base se guardó en PNG porque con JPEG la recompresión daba falsos positivos. Se corre antes de comitear
  cualquier cambio en archivos compartidos.
- **D103 · `validate-story` lista todos los problemas a la vez.** Antes decía un hueco de ritmo por intento (6–7 rondas en `internet-bajo-agua`). `event_gaps()` devuelve todos con su beat;
  `validate_story2d.py` hace lo mismo con el resto de reglas.
- **D104 · Catálogo 2D cerrado (`templates/catalog2d.json`).** Paletas (`cueva`, `exterior`, `noche`), luces, 9 assets con su `aspect`, anclaje, parallax, `when`, tags y acciones propias,
  cámaras 2D (`push_in`, `pull_out`, `pan_slow`, `hold`), transiciones (`cut`, `crossfade`, `swipe`), acciones genéricas y estructuras. Coordenadas normalizadas 0–1; una capa se ancla por
  los pies. Los overlays son los no anclados del explainer (se reutilizan tal cual, igual que los subtítulos).
- **D105 · Estructura `alegoria`.** `hook → scene+ → rupture → ascent+ → return → twist → cta`, añadida a `templates/formulas.json` (así `validate_script.py` la reconoce). Cierre en `bucle` por
  defecto; el último beat repite paleta y assets del primero. Prompt: `templates/prompts/story2d_script_es.md`.
- **D106 · Asset = SVG React en un lienzo de 100 × (100·aspect).** Cada asset recibe `t`, `p` (progreso de sus acciones propias), `pal`, `flick` y `seed`. Las acciones propias llegan como
  progreso 0–1 y se quedan aplicadas; `init` en la capa deja una acción ya aplicada sin gastar una de las 3 por beat.
- **D107 · Un `crossfade` entre beats con la misma escena no funde.** Con los mismos assets, paleta y luz el timeline pone `half = 0` (como `glide` en el 3D) para no ver dos copias
  desfasadas; el autor mantiene la cámara continua.
- **D108 · El QA de movimiento no ve zooms lentos sobre fondos oscuros y lisos.** En el piloto, tramos con cámara en movimiento daban racha estática de 46–56 frames (límite 45) porque el
  flujo óptico mide casi cero en zonas planas. Se resolvió dando textura (`assets/grain.tsx`, motas con semilla fija) y moviendo más la cámara, **no** relajando la regla. Los rangos de
  estilo del 2D (`templates/qa2d_ranges.json`) están calibrados con un solo video y son provisionales.
- **D109 · Sonido de historias.** Cuatro sonidos nuevos (`fire_crackle`, `chains`, `footsteps`, `wind`, ≤1,3 s), cama `tense` (graves con tritono) y mapeo de las acciones 2D a sonidos en
  `sfx_plan.py` (`swipe` lleva whoosh). Están también en `catalog.json` porque es la fuente de nombres de sfx del 3D.
- **D110 · Iterar con Kokoro, entregar con la voz que se pida.** El piloto usó Kokoro (`em_alex`) por decisión de Diego (Chatterbox con su voz tarda ~20 min). El tono no se probó con `diego`.
  La caché de etapas solo mira story y palabras: tras cambiar el código de un asset hay que forzar `--force stills,render,mix,mux,qa`.
- **Ejemplo y skill:** `templates/examples/mito-caverna/` (investigación, guion, story y palabras) y `story-short/SKILL.md` (enlazada en `~/.claude/skills/story-short`).

### Perfil `viral` y etapa `review` (7 nov)

- **D111 · Un perfil de ritmo opt-in con una sola fuente de verdad.** `pacing: viral` (cabecera del guion) y `meta.pacing: "viral"` (story) activan las reglas de `templates/pacing_viral.json`:
  guion de 60–80 s (225–290 palabras), gancho ≤11 palabras sin introducción suave, frases ≤12 palabras, cierre en bucle abierto que enlaza con el gancho, voz +13 % con pausas ≤150 ms,
  `impact` en el segundo 0, `whoosh` por cambio de escena y `riser` antes de `rupture`/`twist`, cambio en pantalla cada ≤3 s sin cámara `hold`, y subtítulos de 1–3 palabras en el 70 % del alto con la clave en
  amarillo. Sin la cabecera rigen las reglas clásicas, así que los videos hechos no cambian. **Hoy es "por defecto" solo por las instrucciones de `story-short/SKILL.md`, no por el código.**
- **D112 · 60–80 s y no «máximo 55 s».** El system prompt pedido hablaba de 55 s, pero YouTube solo monetiza Shorts de más de 60 s y el QA lo exige; el perfil usa 60–80 s. Con Chatterbox a +13 % salen ~3,7 pal/s, de ahí las 225 palabras mínimas.
  El hook de dos oraciones (~20 palabras) del ejemplo pedido no cabe en 3 s hablados: el gancho es la primera frase y la segunda pasa a la primera línea `[scene]`.
- **D113 · Los subtítulos virales están en la franja baja-central y condicionan el story.** Centro al 70 % del alto, 7,4 % del ancho (~80 px a 1080; «48–54 pt» era ambiguo), por encima de la interfaz de Shorts. La franja 0,62–0,78 es de los subtítulos: capas con
  los pies en y ≤0,62 y overlays solo en `top`/`upper`/`center` (lo valida `validate_story2d.py`). `Captions` acepta una configuración (`cap`) y el chunker la usa; el 3D no cambia (regresión OK).
  El OCR del QA acepta también texto amarillo y usa la banda 0,62–0,78.
- **D114 · El ritmo del perfil no se reajusta.** `voice.py` ya no corrige velocidad ni pausas hacia 2,8 pal/s cuando hay perfil viral: solo avisa si salen de 3,3–4,3 pal/s. El QA usa rangos propios (silencio 2–14 %, 3,3–4,3 pal/s, duración 60–80 s)
  y comprueba el `impact` del segundo 0 y un barrido por cambio de escena. Kokoro, más lento, sale a ~3 pal/s: es solo para iterar.
- **D115 · Etapa `review`: un crítico independiente califica el story y lo devuelve.** Entre `validate-story` y `stills`, solo motor 2D. `pipeline/review_story.py` lanza `claude -p` sin herramientas ni sesión con
  `templates/prompts/critico_story.md` sobre una petición con guion, tiempos reales, `shows` y métricas. Seis dimensiones (gancho 3, retención 3, narrativa 2, ritmo verbal, coherencia visual y cierre en bucle 1 cada una);
  el total y el veredicto los calcula Python con `templates/review.json` (total ≥7,5, gancho ≥7, ninguna <5), no el agente. La calificación lleva la huella de guion+story y caduca si cambian; tras 3 devoluciones se para y se consulta al usuario.
  `--reviewer manual` espera un `06_review.json` de otro agente; `--no-story-review` la omite y queda en el log. El crítico no puede pedir menos de 60 s: debe sustituir lo que sobra por contenido nuevo.
- **D117 · Crítico de guion antes de la voz (`review-script`).** La voz de Diego (~20 min) se regeneraba 3–4 veces porque el crítico del story corría después de `tts`. Ahora `review_story.py --kind script` califica solo el texto de `02_SCRIPT.md` (`templates/prompts/critico_guion.md`; gancho 3, retención 3, narrativa 2, ritmo verbal, cierre en bucle y rigor 1 cada una; umbrales en `templates/review.json` → `script`, mismos valores) y guarda `06a_script_review.*`. `tts` no genera voz sin una calificación vigente y aprobada (`script_gate`; caduca si cambia el guion, no si cambia el plan visual); no bloquea si la voz ya está al día. Solo aplica al motor 2D, o al perfil viral mientras no hay story. `--no-story-review` omite ambas críticas. El crítico del story queda para lo visual y el ritmo y marca `text_change` si pide tocar texto. Calibración: el guion de `simulacion-render` saca 5,91 (el story, 6,55), detectando antes de la voz contradicciones y simplificaciones de rigor.
- **D116 · El ejemplo viral es del formato, no del contenido.** `templates/examples/solipsismo-viral/` fue devuelto por el crítico con 5,91 y 6,0 (retención y gancho). No se pulió más: sirve para ver estructura, marcas de tiempo y SFX. La nota del crítico varía entre llamadas, así que es una guía.
- **D118 · Historias dramatizadas: hechos ancla fijos, el cómo se inventa.** Un espectador externo vio los shorts de historia «muy documentales, forzados a contar la historia; les falta ficción». Causa: la skill premiaba el rigor (≥2 fuentes por dato, «cuenta solo lo que dice el texto», dimensión `rigor`) y la estructura `alegoria` terminaba en una lección. Ahora: estructura `drama` (hook in medias res → scene → rupture → ascent → twist → return → cta; en `formulas.json` y `catalog2d.json`), cabeceras `ficcion: fiel|dramatizada|libre` y `pov: tu|yo|testigo|cercano` (`templates/dramatizacion.json`), sección `## Ficción` (`- ancla:` / `- inventado:`) obligatoria con ficción, y `validate_script.py` limita las muletillas de crónica en la voz (≤1 dramatizada, 0 libre). Claude elige nivel y punto de vista (no se le pregunta a Diego). El crítico de guion cambia `rigor` por `fidelidad` (no alterar anclas ni presentar lo inventado como dato) y suma `drama` (peso 2; «¿película o documental?»). El crítico del story juzga si lo visual pone en escena la ficción. Piloto: `diogenes-pollo`.

