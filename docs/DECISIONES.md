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
