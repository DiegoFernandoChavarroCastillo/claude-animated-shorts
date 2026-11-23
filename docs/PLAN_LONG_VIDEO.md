# Plan: video largo horizontal (skill `long-video`)

Creado el 23 nov 2026. Piloto: `interstellar-resumen` (resumen de *Interstellar*, 8–10 min, 1920x1080).

## Qué es
Videos de 8–10 min en 16:9 para YouTube (no Shorts), contados por capítulos, con el motor 2D de `story-short` (temas, prefabs, figura, overlays de datos), la voz de Diego (Chatterbox) y el mismo flujo de aprobación (D127: guion visto escena por escena antes de crear nada). `story-short` y `explainer-short` no se tocan.

## Decisiones de formato
| Tema | Short (actual) | Largo (nuevo) |
|---|---|---|
| Lienzo | 1080x1920 | **1920x1080**, 30 fps |
| Duración | 60–70 s | **8–10 min** (≈1 250–1 500 palabras) |
| Velocidad de voz | 1,13, pausas ≤150 ms | **1,0–1,05**, pausas naturales; respiro de 0,6–1 s entre capítulos |
| Palabras/s | 3,3–4,3 | **2,4–2,9** |
| Cambio en pantalla | cada 2–3 s | **cada 4–6 s**, sin plano quieto >8 s |
| Gancho | ≤3 s, `hookTitle` en el fotograma 0 | **los primeros 30 s**: la imagen más fuerte + la promesa del video; sin `hookTitle` (lo cumple la miniatura) |
| Estructura | una anécdota | **gancho → 6–8 capítulos → cierre**; cada capítulo termina con una pregunta abierta que lleva al siguiente |
| Subtítulos | palabra a palabra, grandes, en la franja central | **por defecto, `.srt` para YouTube** (CC); opción quemados en una franja baja de 2 líneas (0,84–0,94 del alto) |
| Publicación | título + descripción | + **marcas de capítulo** (`0:00 …`), **miniatura 1280x720** y `.srt` |

## Cambios de código (en orden)
1. **Composición `Flat2DWide`** (1920x1080): `W`/`H` salen de `meta.format` (`"vertical"` por defecto, así los videos hechos no cambian) en vez de la constante de `Flat2D.tsx:20`. Cámara, `at:[x,y]` y `repeat` ya son relativos (0–1); revisar los overlays que asumen 1080 de ancho (`explainer/overlays/common.tsx`, `Meters.tsx`, `project.ts`).
2. **Perfil `pacing: longform`** (`templates/pacing_longform.json`): rangos de arriba; `validate_script.py`, `validate_story2d.py` y `qa_rules.py` lo leen como leen `viral`.
3. **Capítulos**: el story lleva `chapters: [{id, title, beats}]`. `make_short.py render` renderiza **un mp4 por capítulo** (`08_render/ch01.mp4`…), con `--chapter` para rehacer solo uno; `mix`/`mux` los unen con ffmpeg (concat sin recodificar) sobre una sola pista de voz y música continua. Así un fallo no repite 9 min de render, y la QA y los stills van por capítulo.
4. **Voz por capítulo**: `tts` por segmento (ya existe), con caché por capítulo: cambiar una frase regenera solo ese capítulo.
5. **Publicación**: `publish_pack.py` escribe las marcas de capítulo, el `.srt` (de `words`) y la miniatura (un fotograma elegido + título grande).
6. **Skill** `long-video/SKILL.md` + guía de guion `templates/prompts/longform_script_es.md` + umbrales del crítico (`templates/review.json` → `longform`).

## Pruebas antes del video entero
- Capítulo 1 completo (~1 min) renderizado a escala 1: medir el tiempo de render por minuto en este PC (4 núcleos, 11 GB) y revisar la legibilidad en 16:9.
- `tools/run_tests.py` y `tools/regression_check.py`: los shorts y el 3D no deben cambiar.

## Derechos (resúmenes de películas)
- Nada de la película: ni clips, ni fotogramas, ni póster, ni música (Hans Zimmer), ni frases citadas largas.
- Personajes como `figura` genéricas (ropa y rasgos del papel, **no** el parecido del actor).
- Además de contar la trama, comentario y análisis propio (la ciencia, por qué funciona el final). Es lo que protege el video como uso transformativo y lo que lo hace distinto de los mil resúmenes que hay.
