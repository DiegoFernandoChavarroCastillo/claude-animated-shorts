---
name: long-video
description: Hace un video largo horizontal para YouTube (no Shorts), de 8 a 10 minutos en 1920x1080, contado por capítulos con el motor 2D ilustrado (temas visuales, personajes, naves, planetas, overlays de datos), voz local de Diego (Chatterbox), efectos y cama sonora, subtítulos en .srt, miniatura y marcas de capítulo, renderizado por capítulos con Remotion en el PC del usuario. Géneros: resumen de una película, serie o libro (con análisis propio), historia real, biografía, mito y caso o misterio. Úsalo cuando el usuario pida un "video largo", "un resumen de la película X", "video de 8–10 minutos", "formato horizontal para YouTube", "explicada", "un documental animado" o diga "usa el skill long-video". Para shorts verticales usa story-short o explainer-short.
---

# Video largo horizontal (long-video)

Mismo repo, motor 2D y pipeline que `story-short` (voz, alineación, mezcla, QA, publicación), con `meta.pacing: "longform"` y `meta.format: "wide"`. Plan y decisiones: `docs/PLAN_LONG_VIDEO.md` y D128 en `docs/DECISIONES.md`. Piloto: `out/interstellar-resumen/` (resumen de *Interstellar*, 85 beats, ~9:40). Python: `.venv/bin/python`; `REMOTION_TMP` siempre puesto (`~/remotion-tmp`).

## Las reglas del usuario siguen mandando (D127)
1. **Visto bueno del guion antes de crear nada**: el guion completo, capítulo por capítulo (narración literal y qué se ve), y esperar su sí → `make_short.py approve-script --id <id>`. Sin eso `tts` no arranca.
2. **Su guion conserva su redacción**: solo se corrigen datos falsos y lo que exige el validador.
3. Si el usuario dice que aprueba de antemano (p. ej. «me voy a dormir, decide tú»), se sigue sin preguntar y cada decisión técnica se apunta con su porqué en `out/<id>/DECISIONES.md`.

## Pasos (en `out/<id>/`)
| # | Paso | Artefacto |
|---|---|---|
| 1 | Investigación: los hechos de la obra o del suceso con ≥2 fuentes por cifra; en un resumen, lo que dice la obra y aparte lo que es análisis | `01_research.md` |
| 2 | **Estructura** para aprobar: género (`resumen`, `historia`, `biografia`, `mito`, `caso`; plantillas en `templates/pacing_longform.json` → `genres`), 3 ganchos, 6–9 capítulos con tiempo, qué se cuenta y qué se ve | `02_OUTLINE.md` |
| 3 | Guion con `templates/prompts/longform_script_es.md` y validar: `.venv/bin/python pipeline/validate_script.py out/<id>/02_SCRIPT.md` (deriva a `validate_longform.py` con `pacing: longform`) | `02_SCRIPT.md` |
| 4 | Visto bueno del usuario → `make_short.py approve-script --id <id>` | `02b_user_approval.json` |
| 5 | Esqueleto del story (un beat por línea, capítulos, meta 16:9): `.venv/bin/python tools/longform_skeleton.py out/<id> --theme <tema>`; con eso, **lanza ya la voz** en segundo plano (es lo más lento: ~1 frase/min sin caché, unas 2–3 h para 9 min): `make_short.py tts --id <id> --no-story-review` | `05_story.json`, `03_voice.wav` |
| 6 | Plan visual mientras se hace la voz con **`templates/prompts/direccion_visual.md`** (D129: director automático, caras, rótulos de escena, sellos, transiciones, props): un script `out/<id>/_dev/build_story.py` que rellena escena, acciones y overlays por beat (ver el del piloto) → `validate_story2d.py` | `05_story.json` |
| 7 | Stills sin voz (tiempos sintéticos): `tools/gallery2d.py <ABS>/out/<id>/_dev/gal --story <ABS>/out/<id>/05_story.json --scale 0.4` (rutas absolutas) → mirar la hoja y corregir. **Para ahorrar**: hojas de 5×4 a 384 px (`ffmpeg … tile=5x4`), un still por beat, y en la segunda pasada solo los beats que cambiaron | `_dev/gal/sheet.jpg` |
| 8 | Con la voz: `align`, `validate-story`, `stills` | `04_words.json`, `06_stills/` |
| 9 | Render por capítulos y el resto: `make_short.py all --id <id> --no-story-review` (render de un capítulo suelto: `--force render --chapter cap3`) | `07_parts/*.mp4`, `07_video.mp4`, `09_final.mp4` |
| 10 | Publicación: título, descripción con **marcas de capítulo**, `11_subtitles.es.srt` y `11_thumbnail.jpg` (1280x720; `meta.thumb` = id del beat del fotograma, `meta.thumbText` = texto, con `\n` para partir) | `11_publish.md` |

El crítico automático de guion y de story todavía no tiene versión para videos largos: se usa `--no-story-review` y queda anotado en el log. El visto bueno del usuario es lo que manda.

## Formato del guion (`pacing: longform`)
Cabecera `lang`, `pacing: longform`, `genre`; `## Ángulo` con `pregunta`, `promesa`, `final` (y `analisis` en un resumen); `## Guion` en capítulos `### id | Título`: el primero `gancho` (20–45 s) y el último `cierre`, con 5–10 capítulos entre medias de 35–110 s. Cada línea `[rol] texto` es un beat de 5–15 s (≤45 palabras; el director lo parte en planos de ≤3,5 s); roles `hook escena dato analisis puente climax twist cta`; cada capítulo intermedio acaba en `[puente]` (una pregunta o promesa que empuja al siguiente) y el video en `[cta]` con una pregunta para los comentarios. Frases ≤22 palabras, números en palabras con fuente, 1 150–1 650 palabras (≈8–10 min a 2,65 pal/s).

## Diferencias con los shorts
| | Short | Largo |
|---|---|---|
| Lienzo | 1080x1920 | **1920x1080** (`meta.format: "wide"`) |
| Voz | speed 1,13–1,35, pausas ≤150 ms | **speed 1,1**, pausas ≤420 ms y 800 ms entre capítulos |
| Ritmo (D129) | planos ≤3,0 s (director), micro-evento cada ~2 s | planos **≤3,5 s** (director automático), micro-evento cada ~2 s, re-gancho cada 15–20 s; hueco máximo 3,5 s, plano quieto ≤4 s |
| Subtítulos | quemados, grandes | **.srt aparte** (`meta.captions: "srt"`); `"burned"` los pinta en dos líneas abajo |
| Overlays | centrados en la columna | a un lado: `meta.overlayX` (0,5) o `screenX` por overlay (0,25 izquierda, 0,75 derecha) para no tapar al protagonista |
| Capítulos | — | `meta.chapters` (lo escribe el esqueleto); placa `TitlePlaque` con «CAPÍTULO n» en la primera palabra de cada uno; whoosh al cambiar |
| QA | 58–72 s, OCR | 450–630 s, sin OCR con .srt, hueco ≤3,5 s |

## Escena en 16:9
- **Fondos apaisados** (lienzo 100 × 60, `kind: fondo`, `scale` 1,2 centrado): `espacio`, `tormenta_polvo`, `cuarto_murph`, `base_nasa`, `superficie_miller`, `hielo_mann`, `edmunds_campo`, `teseracto`, `estacion_cooper`. Con `scale` 1,2 un punto del lienzo (cx, cy) cae en pantalla en x = (−192 + cx·23)/1920, y = (−151 + cy·23)/1080: el horizonte en cy 34–38 queda a 0,56–0,67 del alto.
- Los fondos verticales del kit (`cielo`, `colinas`, `mar`…; lienzo 100 × 178) también sirven: en 16:9 se ve su franja central, que es el horizonte.
- `scale` de una capa es fracción del **ancho** (1920): una persona `figura` mide bien con 0,10–0,16 (≈300–480 px de alto) y los pies en y 0,86–0,95.
- `figura` con `ropa: "espacial"` y `tocado: "escafandra"` para astronautas.
- Tema `scifi` para ciencia ficción con varios mundos (paletas `cosmos`, `polvo`, `interior`, `miller`, `hielo`, `edmunds`, `estacion`). Para otros géneros, los temas de `story-short` (`marmol`, `pergamino`, `drama_oscuro`…).
- Assets de *Interstellar* reutilizables para cualquier ciencia ficción: `saturno`, `gargantua` (agujero negro), `agujero_gusano`, `endurance` (nave anillo), `ranger` (lanzadera), `planeta` (`tipo` tierra/polvo/agua/hielo/desierto), `tars` (robot), `reloj_pulsera`, `cama`, `monitor_mensaje`.

## Derechos (resúmenes)
Nada de la obra: ni clips, ni fotogramas, ni póster, ni música, ni citas largas. Personajes con `figura`, sin el parecido de los actores. Además de la trama, análisis propio (ciencia, contexto, lecturas). La descripción dice «Resumen y análisis con ilustraciones propias; no se usa material de la película».

## Efectos de sonido (D130)
Una vez por PC: `.venv/bin/python tools/sfx_fetch.py` baja las librerías CC0 a `sfx_lib/`; la mezcla rota sus variantes (`templates/sfx_library.json`). Sin ellas usa los sintetizados.

## Antes de dar algo por terminado
`.venv/bin/python tools/run_tests.py` y `tools/regression_check.py` (los shorts y el 3D no deben cambiar). El QA (`10_qa.md`) para con ❌; `--allow-qa-warnings` solo si se dice en la entrega.
