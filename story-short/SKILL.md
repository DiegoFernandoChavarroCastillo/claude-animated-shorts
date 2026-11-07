---
name: story-short
description: Hace un short vertical narrativo de 60–80 s (perfil viral; 60–120 s sin él) (1080x1920) en estilo 2D plano "cut-out vectorial": alegorías, mitos, relatos y reflexiones (filosofía, ficción) con voz en off local, subtítulos palabra por palabra, sombras y luz 2D, efectos de sonido y cama sonora, renderizado con Remotion en el PC del usuario. Úsalo cuando el usuario pida un "short de historia", "el mito de…", "una alegoría", "un relato", "como los videos de reglas/ficción oscura" o diga "usa el skill story-short". Para divulgación con objetos 3D, usa explainer-short.
---

# Story short (motor 2D)

Mismo repo y mismo pipeline que `explainer-short` (voz, alineación, mezcla, QA y publicación), con `meta.engine: "2d"` en el story. Plan, decisiones y medidas: `docs/PLAN_STORY_2D.md`. La raíz es la carpeta del repo; Python: `.venv/bin/python` (Linux) y `REMOTION_TMP` siempre puesto.

## Pasos (en `out/<id>/`)
| # | Paso | Artefacto |
|---|---|---|
| 1 | Investigación: texto original del relato y ≥2 fuentes por dato (verifica contra el texto primario; separa lo que dice el autor de la interpretación) | `01_research.md` |
| 2 | Elegir gancho y cierre con el usuario: propón 3 ganchos y pasa la «prueba de los 3 s» de `story2d_script_es.md` (afirmación chocante o paradoja, ≤11 palabras, sin abstracciones ni introducciones suaves); gancho `escena`/`mito`/`y_si`/…, cierre `bucle` por defecto (la última frase queda abierta y el gancho la continúa) | cabecera de `02_SCRIPT.md` |
| 3 | Guion con `templates/prompts/story2d_script_es.md` (estructura `alegoria`, **cabecera `pacing: viral`** y su system prompt) y validar: `.venv/bin/python pipeline/validate_script.py out/<id>/02_SCRIPT.md` | `02_SCRIPT.md` |
| 4 | Plan visual: `05_story.json` con `meta.engine: "2d"`. Assets: `.venv/bin/python tools/catalog_search2d.py <palabras>`; ids de `templates/catalog2d.json`. Ejemplo vigente: `templates/examples/solipsismo-viral/` (perfil viral; `mito-caverna` es el ejemplo clásico) | `05_story.json` |
| 5 | **Crítico** (etapa `review`, entre `validate-story` y `stills`): un agente independiente califica el story de 0 a 10 (gancho, retención, narrativa, ritmo verbal, coherencia visual, cierre en bucle). Si no pasa (total ≥7,5, gancho ≥7, ninguna dimensión <5) lo **devuelve** con las correcciones: corrígelo, `validate-story` y relanza `review`. Tras 3 devoluciones se para y se consulta al usuario | `06_review.md`, `06_review.json` |
| 6 | `stills` → mirar la hoja → arreglar → `all` | `03`–`11` |
| 7 | Una ronda de verificador independiente (`templates/prompts/verificador.md`, adaptando a 2D) | notas |
| 8 | Render final: `all --force render,mix,mux,qa,publish` (escala 1) | `09_final.mp4` |

## Etapa `review` (crítico del story)
`make_short.py --id <id> review` (también dentro de `all`; solo motor 2D). Por defecto lanza `claude -p` sin herramientas ni sesión (contexto limpio) con `templates/prompts/critico_story.md` sobre `06_review_request.md` (guion con tiempos reales, `shows`, acciones y métricas). El total, el veredicto y los umbrales (`templates/review.json`: pesos, `minTotal`, `minGancho`, `minDimension`, `maxRounds`) los calcula `pipeline/review_story.py`, no el agente. La calificación caduca si cambian `02_SCRIPT.md` o `05_story.json`. `--reviewer manual` solo prepara la petición y espera un `06_review.json` escrito por otro agente (p. ej. un subagente con el mismo prompt); `--no-story-review` la omite y queda anotado en el log. El crítico no puede pedir menos de 60 s: si algo sobra, se sustituye por contenido nuevo. `templates/examples/solipsismo-viral/` es el ejemplo del **formato** (estructura, marcas de tiempo, SFX); el crítico lo califica ~6, así que no lo tomes como vara editorial.

## Perfil viral (`pacing: viral`, por defecto en los videos nuevos)
Config única: `templates/pacing_viral.json`. En el guion: 60–80 s (225–290 palabras), gancho chocante ≤11 palabras sin introducción suave, frases ≤12 palabras, cierre en bucle abierto que enlaza con la primera palabra del gancho. En el story: `meta.pacing: "viral"`, `meta.voice.speed: 1.13`, `meta.captionEmphasis: "accent"`, `keywords` por beat. El pipeline aplica solo: voz +13 % y pausas ≤150 ms; `impact` en el segundo 0, `whoosh_soft` por cambio de escena y `riser` antes de `rupture`/`twist`; un cambio en pantalla cada ≤3 s (objetivo 2–2,5 s) y cámara siempre en movimiento; subtítulos de 1–3 palabras, grandes, en la franja 0,62–0,78 del alto con la palabra clave en amarillo (capas con los pies en y ≤0,62; overlays solo en `top`/`upper`/`center`); QA con rangos propios (silencio 2–14 %, 3,3–4,3 pal/s, duración 60–80 s). Detalle y system prompt: `templates/prompts/story2d_script_es.md`.

Voz: la definitiva es la de Diego (`chatterbox`/`diego`; con el perfil viral `speed` 1,13 y pausas ≤150 ms, sin `pauseScale`; sin el perfil, `pauseScale` ~0,7 y para alargar el video añade palabras, no pausas). Música propia: `"musicFile": "voices_local/<archivo>"` y `"musicGain"` en `meta` (con `"music": false`). Para iterar usa `"voice": {"engine": "kokoro", "voice": "em_alex"}` (rápida, ~2 min); `chatterbox`/`diego` para la versión definitiva (~20 min). Cama sonora: `"music": true, "musicMood": "tense"`.

## Reglas del story 2D (las comprueba `pipeline/validate_story2d.py`, que lista todos los problemas de una vez)
- Un beat por línea del guion, con `shows` (qué se ve). Capas: `{asset, z, at:[x,y] (0–1), scale, id?, init?}`; `at` es el punto de anclaje (por defecto, los pies).
- Cámara 2D: `push_in`, `pull_out`, `pan_slow` (con `to`), `hold`; `shots` (≤3 por beat, ≥1,5 s entre sí) para cambiar de plano dentro de un beat largo.
- Acciones genéricas (`appear`, `vanish`, `tremble`, `pop`, `slide`, `scale`, `flash`, `camshake`, `palette_shift`) y propias de cada asset (`shadow_pass`, `stand_up`, `walk`, `carry`, `flare`, `light_grow`, `sunrise`). Máx. 3 por beat; al menos la mitad de los beats con acción. `init` deja una acción propia ya aplicada (p. ej. el prisionero de pie).
- Ritmo: un evento (acción, overlay o sub-plano) como mucho cada 2,5–3 s (viral: cada 2–2,5 s, tope 3 s); ≤3 cortes por minuto; gancho ≤3 s con acción antes de 1 s; con cierre `bucle`, el último beat repite paleta y assets del primero y `tailS` ≤ 0,3.
- Overlays: solo los no anclados (`Pill`, `StatCallout`, `Insert`, `IconFlow` de ≤3 pasos: con 4 se sale del cuadro…). Nunca encima del protagonista.
- `crossfade` entre dos beats con los mismos assets no hace fundido (evita ver dos copias desfasadas): mantén la cámara continua.
- **Textura:** las zonas lisas y oscuras hacen que el QA de movimiento crea que el plano está quieto aunque la cámara se mueva. Los assets llevan grano (`assets/grain.tsx`); si sale una racha estática, mueve más la cámara (zoom o pan) o añade grano antes de relajar nada.

## Assets (9) y cómo añadir uno
`cueva_corte`, `pared_sombras`, `prisioneros`, `prisionero_libre`, `muro_bajo`, `fuego`, `tunel_ascenso`, `exterior_sol` (ver `catalog2d.json`). Uno nuevo: `studio/src/flat2d/assets/<id>.tsx` (lienzo de 100 de ancho × 100·aspect), registrarlo en `assets/registry.tsx` y en `catalog2d.json` (aspect, anclaje, `par`, `when`, `tags`, acciones propias); `tools/gallery2d.py` para verlo. Estilo: colores de la paleta (nunca hex sueltos salvo luz), ≥4 partes, nada de sustitutos de lo que dice la voz.

## Antes de dar algo por terminado
`.venv/bin/python tools/run_tests.py` y `.venv/bin/python tools/regression_check.py` (el 3D no debe cambiar). `make_short.py` para con error si el QA tiene ❌ (`--allow-qa-warnings` solo si el usuario lo acepta y se dice).
