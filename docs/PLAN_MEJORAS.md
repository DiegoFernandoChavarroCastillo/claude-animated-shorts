# Plan de mejoras (revisión del 4 nov, tras F15)

Objetivo: shorts de 1 a 2 minutos que **atrapen en los primeros 3 s, mantengan el ritmo y se repitan solos**. Esta
revisión parte de lo medido en los tres videos hechos (`hielo-flota`, `microondas-metal`, `reloj-pulso`) y de la
investigación del día. No hay nada implementado de lo que sigue: es una propuesta para elegir.

## Qué tan sólida es la evidencia

- **Sólido:** las plataformas muestran la retención segundo a segundo (YouTube Studio, TikTok) y se puede medir con datos propios.
- **Blogs y proveedores, sin estudio detrás:** casi todas las cifras de retención (70–85 % a los 3 s, 68 % de completado en
  31–60 s, 45 % de mediana en Shorts). Se usan como dirección, no como objetivo.
- **Dudoso:** «retención >100 % es la señal principal». YouTube cuenta desde marzo de 2025 cada inicio o repetición como
  vista, pero la métrica de «vistas comprometidas» (la que se usa para monetizar) puede no contar los bucles. Hay que
  comprobarlo en YouTube Studio antes de apostar todo al bucle.
- **Tensión a tener en cuenta:** el mínimo de 60 s (monetización) va contra el bucle, porque el completado cae al alargar el
  video. Propuesta: apuntar a **62–80 s**, y 100–120 s solo en listas.
- Fuentes: [Shortimize](https://www.shortimize.com/blog/youtube-shorts-retention-rate), [Bytecap](https://www.bytecap.io/research/youtube-shorts-retention-benchmarks),
  [Quso](https://quso.ai/research/video-retention-benchmarks), [Reap (zonas seguras)](https://reap.video/blog/short-form-video-safe-zones),
  [Metricool (TikTok)](https://metricool.com/tiktok-creator-next/). Ninguna es documentación oficial.

## Lo que medimos en nuestros videos

| | hielo-flota | microondas-metal | reloj-pulso |
|---|---|---|---|
| Duración del gancho hablado | 3,6 s | 2,9 s | 2,6 s |
| Duración media de un beat / la mayor | 6,7 / 11,0 s | 7,0 / 9,1 s | 5,3 / 7,7 s |
| Cola de silencio al final | 1,0 s | 1,0 s | 1,0 s |
| Cierre | pregunta a comentarios | bucle | pruébalo hoy |
| Silencio total | OK | OK | 33,2 % ❌ |

## Pilar 1 · Gancho (0–3 s)

Hoy: 7 tipos de gancho (≤12 palabras), voz desde 0,1 s, sin saludo. Falta **forzar el gancho visual y el tiempo**.

| # | Mejora | Esfuerzo | Notas |
|---|---|---|---|
| H1 | **Gancho hablado ≤ 3 s** (medido con `04_words.json`), no solo ≤12 palabras (12 palabras ≈ 4 s) | bajo | `hielo-flota` tiene 3,6 s |
| H2 | **Choque visual en el primer segundo**: el beat 1 debe llevar una acción o un `punch` antes de 1,0 s, y cámara que no sea `drift`; sin plano de «presentación» | bajo | validador del story |
| H3 | Tipos de gancho nuevos y más disruptivos: `negativo` («No vuelvas a…»), `coste` («Esto te cuesta…»), `contradiccion` («Lo que te enseñaron está al revés») | bajo | `formulas.json` + validador |
| H4 | **Puntuar los ganchos** con una rúbrica (concreto, conflicto, 2.ª persona, promesa que el video cumple, ≤3 s) antes de proponer los 3 | bajo | prompt de 1b |
| H5 | **Portada**: exportar el mejor fotograma (beat 1, con el gancho en grande) como `cover.png` | bajo | |

## Pilar 2 · Ritmo y densidad

Hoy: un beat dura 5–7 s de media (hasta 11 s) con **un solo preset de cámara**; las acciones y overlays añaden eventos, pero
**no se mide cada cuánto cambia algo en pantalla**. La referencia que traes pide un cambio de plano o de escala cada 2–4 s.

| # | Mejora | Esfuerzo | Notas |
|---|---|---|---|
| P1 | **Métrica «hueco sin evento»**: tiempo máximo sin corte de cámara, acción u overlay. Regla: ≤ 3,5 s. Primero medirla en los 3 videos | bajo | validador + QA |
| P2 | **Sub-planos dentro de un beat** (`shots`: cambio de preset o `punch` de zoom a mitad de beat) para partir los beats largos | medio | `schema.ts`, `timeline.ts` |
| P3 | **Zonas seguras de las apps:** los slots `lower` (70 %) y `bottom` (79 %) caen donde las apps ponen usuario, descripción y botones (los últimos ~480–670 px de 1920). Mover los overlays a ≤ 62 % y comprobar que los subtítulos (12–30 % desde arriba) no pasan de ~270 px por arriba en Reels | bajo | `common.tsx`, QA |
| P4 | **Recortar pausas** de la voz (> 0,35 s → 0,25 s) antes de alinear: baja el silencio (33 % en `reloj-pulso`) y sube el ritmo sin tocar el tono. Alternativa: `atempo` +5 % | medio | `voice.py`; Chatterbox no se repite |
| P5 | **Cortes de B-roll** de 1–1,5 s (número grande, icono, diagrama) entre beats largos | medio | nuevo tipo de overlay «inserto» |
| P6 | Subtítulos con **énfasis** en la palabra clave (color, escala, icono) | bajo | `Subtitles` |
| P7 | Opcional: cama sonora muy baja por entorno, con ducking bajo la voz (hoy no hay música) | medio | licencias: sintetizada |
| P8 | OCR del QA: ignorar palabras de ≤ 3 letras (falsos negativos en `reloj-pulso`) | bajo | `style_check.py` |

## Pilar 3 · Bucle sin costuras

Hoy: existe el cierre `bucle`, pero los otros cierres (`envia`, `sigue`, pregunta a comentarios) son justo las despedidas
predecibles que dices que hacen deslizar, y **todos los videos terminan con 1,0 s de silencio** (`TAIL_MS`), que rompe el empalme.

| # | Mejora | Esfuerzo | Notas |
|---|---|---|---|
| L1 | **`bucle` por defecto** y `envia`/`sigue` fuera de las recomendaciones (siguen disponibles si los pides) | bajo | `formulas.json` `elegir` |
| L2 | **Cola de audio corta** (0,15–0,25 s) cuando el cierre es `bucle`; el video termina en la última palabra, sin SFX ni cola | bajo | `common.py`, `timeline.ts` |
| L3 | **La última frase se lee como continuación del gancho**: tres patrones en el prompt (eco de la primera palabra, la respuesta que devuelve a la pregunta, frase abierta que el gancho completa). Validador: la unión «última + primera» no suena a despedida | medio | `script_es.md`, validador |
| L4 | **Bucle visual:** el último beat vuelve al entorno, objeto y encuadre del beat 1; QA compara el último fotograma con el primero (SSIM o histograma) | medio | `validate_story.py`, `short_qa.py` |
| L5 | **Algo que ver la segunda vez:** un dato o etiqueta que aparece 1 s y solo se entiende al repetir | bajo | prompt del story |
| L6 | Ajustar la duración objetivo a **62–80 s** (ver la tensión de arriba) | bajo | prompt del guion |

## Otras mejoras

| # | Mejora | Esfuerzo |
|---|---|---|
| O1 | **Bucle de datos:** `out/<id>/meta.json` con gancho, estructura y cierre, y `tools/ingest_stats.py` que lea el CSV de YouTube Studio o TikTok (retención a 3 s, % visto, repeticiones). Tras ~10 videos, decidir qué gancho rinde en tu canal (`docs/FORMULAS.md` ya lo propone a mano) | medio |
| O2 | **Paquete de publicación** `11_publish.md`: título, descripción, hashtags y comentario fijado por plataforma, y `cover.png` | bajo |
| O3 | **Velocidad:** la voz es el cuello de botella (~15 min para 64 s; ~25 min estimados para 110 s) y el render tarda ~7 min por minuto. Escribir el story y hacer los stills **mientras** corre la voz; repetir solo las líneas cambiadas (ya hay `03_voice.wav.segments.json`); comprobar si hay GPU para Chatterbox | medio |
| O4 | **Huecos del catálogo:** listar todos los `05_gaps.md` por frecuencia (animales grandes, vehículos) y decidir qué prefabs construir primero | bajo |
| O5 | Los ejemplos (`templates/examples/`) son de 55–62 s y 140–185 palabras: hacer al menos uno de ~80 s para que los prompts no copien el largo viejo | medio |
| O6 | `reloj-pulso` tiene 167 palabras: hoy el validador lo rechazaría. Alargarlo (~60–80 palabras) y repetir voz y render | medio |

## Orden recomendado

1. **Una tanda de ~1 sesión (todo bajo):** L1, L2, H1, H2, P1 (medir primero), P3, P8, O2. Es lo que más cambia el resultado con menos riesgo.
2. **Segunda tanda:** L3, L4, L5, H3, H4, P2, P6, O1.
3. **Después:** P4, P5, P7, O3, O4, O5, O6.
4. **Antes de empezar:** comprobar en YouTube Studio si «vistas comprometidas» cuenta los bucles. Si no, el bucle sigue sirviendo
   para TikTok e Instagram, pero no para monetizar en YouTube.
