---
name: story-short
description: Hace un short vertical narrativo de 60–120 s (1080x1920) en estilo 2D plano "cut-out vectorial": alegorías, mitos, relatos y reflexiones (filosofía, ficción) con voz en off local, subtítulos palabra por palabra, sombras y luz 2D, efectos de sonido y cama sonora, renderizado con Remotion en el PC del usuario. Úsalo cuando el usuario pida un "short de historia", "el mito de…", "una alegoría", "un relato", "como los videos de reglas/ficción oscura" o diga "usa el skill story-short". Para divulgación con objetos 3D, usa explainer-short.
---

# Story short (motor 2D)

Mismo repo y mismo pipeline que `explainer-short` (voz, alineación, mezcla, QA y publicación), con `meta.engine: "2d"` en el story. Plan, decisiones y medidas: `docs/PLAN_STORY_2D.md`. La raíz es la carpeta del repo; Python: `.venv/bin/python` (Linux) y `REMOTION_TMP` siempre puesto.

## Pasos (en `out/<id>/`)
| # | Paso | Artefacto |
|---|---|---|
| 1 | Investigación: texto original del relato y ≥2 fuentes por dato (verifica contra el texto primario; separa lo que dice el autor de la interpretación) | `01_research.md` |
| 2 | Elegir gancho y cierre con el usuario (gancho `mito`/`y_si`/…; cierre `bucle` por defecto) | cabecera de `02_SCRIPT.md` |
| 3 | Guion con `templates/prompts/story2d_script_es.md` (estructura `alegoria`) y validar: `.venv/bin/python pipeline/validate_script.py out/<id>/02_SCRIPT.md` | `02_SCRIPT.md` |
| 4 | Plan visual: `05_story.json` con `meta.engine: "2d"`. Assets: `.venv/bin/python tools/catalog_search2d.py <palabras>`; ids de `templates/catalog2d.json`. Ejemplo vigente: `templates/examples/mito-caverna/` | `05_story.json` |
| 5 | `stills` → mirar la hoja → arreglar → `all` | `03`–`11` |
| 6 | Una ronda de verificador independiente (`templates/prompts/verificador.md`, adaptando a 2D) | notas |
| 7 | Render final: `all --force render,mix,mux,qa,publish` (escala 1) | `09_final.mp4` |

Voz: para iterar usa `"voice": {"engine": "kokoro", "voice": "em_alex"}` (rápida, ~2 min); `chatterbox`/`diego` para la versión definitiva (~20 min). Cama sonora: `"music": true, "musicMood": "tense"`.

## Reglas del story 2D (las comprueba `pipeline/validate_story2d.py`, que lista todos los problemas de una vez)
- Un beat por línea del guion, con `shows` (qué se ve). Capas: `{asset, z, at:[x,y] (0–1), scale, id?, init?}`; `at` es el punto de anclaje (por defecto, los pies).
- Cámara 2D: `push_in`, `pull_out`, `pan_slow` (con `to`), `hold`; `shots` (≤3 por beat, ≥1,5 s entre sí) para cambiar de plano dentro de un beat largo.
- Acciones genéricas (`appear`, `vanish`, `tremble`, `pop`, `slide`, `scale`, `flash`, `camshake`, `palette_shift`) y propias de cada asset (`shadow_pass`, `stand_up`, `walk`, `carry`, `flare`, `light_grow`, `sunrise`). Máx. 3 por beat; al menos la mitad de los beats con acción. `init` deja una acción propia ya aplicada (p. ej. el prisionero de pie).
- Ritmo: un evento (acción, overlay o sub-plano) como mucho cada 2,5–3 s; ≤3 cortes por minuto; gancho ≤3 s con acción antes de 1 s; con cierre `bucle`, el último beat repite paleta y assets del primero y `tailS` ≤ 0,3.
- Overlays: solo los no anclados (`Pill`, `StatCallout`, `Insert`, `IconFlow` de ≤3 pasos: con 4 se sale del cuadro…). Nunca encima del protagonista.
- `crossfade` entre dos beats con los mismos assets no hace fundido (evita ver dos copias desfasadas): mantén la cámara continua.
- **Textura:** las zonas lisas y oscuras hacen que el QA de movimiento crea que el plano está quieto aunque la cámara se mueva. Los assets llevan grano (`assets/grain.tsx`); si sale una racha estática, mueve más la cámara (zoom o pan) o añade grano antes de relajar nada.

## Assets (9) y cómo añadir uno
`cueva_corte`, `pared_sombras`, `prisioneros`, `prisionero_libre`, `muro_bajo`, `fuego`, `tunel_ascenso`, `exterior_sol` (ver `catalog2d.json`). Uno nuevo: `studio/src/flat2d/assets/<id>.tsx` (lienzo de 100 de ancho × 100·aspect), registrarlo en `assets/registry.tsx` y en `catalog2d.json` (aspect, anclaje, `par`, `when`, `tags`, acciones propias); `tools/gallery2d.py` para verlo. Estilo: colores de la paleta (nunca hex sueltos salvo luz), ≥4 partes, nada de sustitutos de lo que dice la voz.

## Antes de dar algo por terminado
`.venv/bin/python tools/run_tests.py` y `.venv/bin/python tools/regression_check.py` (el 3D no debe cambiar). `make_short.py` para con error si el QA tiene ❌ (`--allow-qa-warnings` solo si el usuario lo acepta y se dice).
