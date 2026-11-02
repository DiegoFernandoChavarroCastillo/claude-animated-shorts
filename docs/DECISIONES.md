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