# Progreso del estilo "Explainer 2.5D"

Estado al **2 de noviembre de 2026**, rama `estilo-explainer`. Plan completo en `docs/PLAN_ESTILO_EXPLAINER.md`;
cada decisión tomada, con su motivo, en `docs/DECISIONES.md` (D1–D64).

## Reglas del proyecto (acordadas con Diego)

- No se pasa a la fase siguiente sin que Diego escriba **"aprobado"**.
- Al terminar cada fase: qué se hizo, cada criterio de aceptación (cumple / no cumple), stills y **commit**.
- Desde F5, **cada decisión técnica se consulta en el chat** (con la opción recomendada primero) y se anota después
  en `docs/DECISIONES.md`.
- **Nunca** se sube a Git nada de `references_local/` ni de `out/`.

## Fases

| Fase | Qué | Estado | Commit |
|---|---|---|---|
| F0 | Inventario (`docs/INVENTARIO.md`), entorno, proyecto Remotion en `studio/` | ✅ aprobada | `82761c0` |
| F1 | Tokens de estilo y subtítulos palabra por palabra con caja de selección | ✅ aprobada (verificador 8/10) | `7d92956` |
| F2 | Composición `Explainer` desde `story.json` + `words.json`, cámara y transiciones | ✅ aprobada (ver pendiente 1) | `b62c5f1`, `debbb1f` |
| F3 | 18 overlays de datos (`overlays/`) | ✅ aprobada | `b62c5f1` |
| F4 | 8 entornos, 11 objetos protagonistas, tarjetas pintadas, culling, `catalog.json` | ✅ aprobada (verificador 6,5/10) | `a4e1fb7` |
| F5 | Voz local (Kokoro/Piper), alineación (Whisper medium), SFX, mezcla a −14 LUFS | ✅ aprobada | `109fedd` |
| F6 | Prompts de guion (es/en), `validate_script.py`, prompt de `story.json` | ✅ aprobada | `7203530` |
| F7 | Orquestador `make_short.py` con checkpoints y un solo bundle de Remotion | ✅ criterios cumplidos; Diego revisó el video | `f1e6876` |
| F8 | QA de estilo (`style_check`, OCR de subtítulos, hojas lado a lado, look-match §9: 5,5 → 6,8/10) | ✅ aprobada (look-match 6,8/10; además D60 ll/y y D61 entonación de pregunta) | `59d85d9`, `938ab0e`, `d0f99b4`, `553546c`, `b945b3b` |
| F9 | Nuevo `SKILL.md` (`explainer-short`) y documentación | ✅ aprobada (prueba en sesión nueva: `celular-calienta`) | `eb21221` |
| F11 | Ampliación del catálogo: 72 objetos, 17 entornos, 10 cámaras, 13 overlays (D65–D68) | ✅ implementada; falta que Diego revise los videos de prueba | rama `ampliar-catalogo` |
| F12 | Ganchos, estructuras y cierres variables y elegidos por el usuario (D70–D73) | ✅ implementada (validador, prompts, ejemplos, pruebas); falta probarla con un video nuevo | rama `ampliar-catalogo` |
| F13 | Acciones sincronizadas con la voz: 41 efectos (26 genéricos, 13 marcadores 3D, 2 de cámara) y acciones propias de objetos (D74–D77) | ✅ usada en `microondas-metal` y `reloj-pulso` | rama `ampliar-catalogo` |
| F14 | Prefabs por video en `custom.ts` (3 hechos) y duración obligatoria de 60 a 120 s (D78–D79) | ✅ `8688cdf`; los 2 videos de prueba son de 62 y 64 s; `reloj-pulso` queda fuera del nuevo mínimo de palabras | rama `ampliar-catalogo` |
| F16 | Gancho ≤3 s con acción en el primer segundo, hueco máximo de 3,5 s, cierre `bucle` por defecto con cola de 0,2 s, zona segura de las apps, etapa `publish` (D82–D87) | ✅ implementada y con pruebas; falta usarla en un video nuevo | rama `ampliar-catalogo` |
| F15 | 14 efectos de sonido generales y director de acentos (D80–D81) | ✅ `1e6a516`; Diego los escuchó y le gustan | rama `ampliar-catalogo` |
| F10 | Prueba de punta a punta con un tema nuevo | ⏳ siguiente (`celular-calienta` ya sirve como video `es`) | — |

## Cómo se hace un video hoy

1. Claude escribe `out/<id>/01_research.md`, `02_SCRIPT.md` (con `templates/prompts/script_es.md` o `script_en.md`)
   y `05_story.json` (con `templates/prompts/story_es_en.md` y `templates/catalog.json`).
   Para probar con el ejemplo: `make_short.py init --id hielo-flota --from templates\examples\hielo-flota`.
2. Todo lo demás es determinista:

   ```powershell
   .venv\Scripts\python.exe pipeline\make_short.py all --id hielo-flota            # 1080x1920
   .venv\Scripts\python.exe pipeline\make_short.py all --id hielo-flota --scale 0.5 # prueba rápida
   ```

   Etapas: validate-script → tts → align → validate-story → stills → render → mix → mux → qa. Cada una deja su
   artefacto en `out/<id>/` y se salta si ya está al día; `--force render,mix` rehace etapas concretas; `--review`
   para tras validar el guion. Registro en `out/<id>/log.md`.
3. Tiempos medidos en el PC Windows (Intel HD 530, 7,8 GB de RAM), video de 52 s a escala 0,5: voz 2 min,
   alineación 1,4 min, stills 1,6 min, render 6,6 min, mezcla + unión + QA ~1 min. En el portátil Linux (Intel UHD,
   11 GB): voz 36 s, alineación 2,9 min con la descarga de Whisper, stills 41 s, render 5,2 min.

## Mapa del código

| Ruta | Qué es |
|---|---|
| `studio/src/explainer/style.ts` | Única fuente del look: paleta, subtítulos, overlays, cámara, luces, post |
| `studio/src/explainer/Explainer.tsx`, `Scene.tsx`, `timeline.ts`, `camera/` | Compositor, escena 3D por beat, tiempos y cámara |
| `studio/src/explainer/captions/` | Subtítulos palabra a palabra y caja de la palabra clave |
| `studio/src/explainer/overlays/` | 18 overlays de datos + `registry.ts` |
| `studio/src/explainer/envs/` | 8 entornos (uno por archivo), `kit.ts` (piezas comunes) y `cull.ts` (culling) |
| `studio/src/explainer/heroes/` | Objetos protagonistas: `primitive/`, `cards.ts`, `gltf.ts` (sin modelos aún), `LICENSES.md` |
| `studio/src/explainer/chars/` | API `Pen` portada y personajes pintados (perro, persona) |
| `studio/src/explainer/catalog.ts` + `templates/catalog.json` | Catálogo para el LLM, cruzado con el código |
| `studio/src/explainer/dev/`, `EnvGallery`, `CullTest`, `KitGallery`, `CaptionTest` | Composiciones de prueba |
| `studio/scripts/job.mjs` | Bundle único + stills + render para el orquestador |
| `studio/scripts/stills.mjs` | Stills sueltos para desarrollo |
| `pipeline/` | Python: `make_short.py`, `voice.py`, `tts/` (con `prosody.py` y Chatterbox: `chatterbox_tts.py` + `chatterbox_worker.py`), `setup_chatterbox.py`, `voice_fx.py`, `align.py`, `sfx_plan.py`, `sfx_synth.py`, `mix.py`, `validate_script.py`, `validate_story.py`, `qa_basic.py`, `setup_audio.ps1`, `tests/` |
| `templates/prompts/` | Prompts de guion (es/en) y de `story.json` |
| `templates/examples/` | `hielo-flota` (es) y `hielo-flota-en` completos; `cielo-azul` y `dedos-arrugados` solo guion |
| `tools/medicion/` | Medición de referencias y renders (`measure.py`, `audio.py`…) |
| `tools/qa/` | `style_check.py` (QA de estilo y OCR de subtítulos, F8), `lookmatch_sheets.py` y `sbs_sheet.py` (hojas lado a lado), `short_qa.py`, comprobaciones de subtítulos y de la banda |
| `SKILL.md` | El skill `explainer-short` (F9) |
| `legacy/` | Skill anterior `cartoon-3d-short`, código del puente, sus scripts y `references/` (F9) |

## Continuar en otro PC (Windows)

1. **Programas** (PowerShell como administrador):

   ```powershell
   winget install --id Git.Git -e
   winget install --id Python.Python.3.11 -e
   winget install --id OpenJS.NodeJS.LTS -e
   winget install --id Gyan.FFmpeg -e
   winget install --id Microsoft.VCRedist.2015+.x64 -e   # sin él, PyTorch (Kokoro) no carga
   winget install --id UB-Mannheim.TesseractOCR -e       # solo para tools/medicion (OCR de subtítulos)
   git config --global core.longpaths true
   ```

   Para Tesseract en español, ver los comandos al principio de `requirements.txt`. Abre una terminal nueva para que
   se actualice el PATH.
2. **Código**:

   ```powershell
   git clone https://github.com/DiegoFernandoChavarroCastillo/claude-animated-shorts
   cd claude-animated-shorts
   git checkout estilo-explainer
   ```

3. **Python y audio**: `powershell -ExecutionPolicy Bypass -File pipeline\setup_audio.ps1`. Crea `.venv` con
   `py -3.11`, instala `requirements.txt` y comprueba PyTorch, ffmpeg, espeak-ng y Kokoro. Si falta algo, dice qué.
4. **Remotion**: `cd studio`, luego `npm ci` y `npx tsc --noEmit` (debe salir sin errores).
5. **Referencias** (no van en Git): copia a mano la carpeta `references_local/videos/` (video1–video5.mp4) del PC
   original. R1 = `video5`, R3 = `video4` (D1). Hacen falta para el QA de estilo (F8) y el look-match.
6. **Descargas automáticas la primera vez** (necesitan internet): modelo de Kokoro (~330 MB), Whisper medium
   (~1,5 GB) y voces de Piper (2 × 60 MB, solo si se usa Piper). Se guardan en la caché de Hugging Face del usuario
   y en `pipeline/models/` (no versionada).
7. **Temporales de Remotion**: por defecto `C:/remotion-tmp` (variable `REMOTION_TMP`). Cada bundle copia
   `public/`; el bundle de `make_short` se reutiliza mientras no cambie el código.
8. **Prueba de humo**:

   ```powershell
   .venv\Scripts\python.exe pipeline\tests\test_validate_script.py
   .venv\Scripts\python.exe pipeline\tests\test_prosody.py
   .venv\Scripts\python.exe pipeline\make_short.py init --id hielo-flota --from templates\examples\hielo-flota
   .venv\Scripts\python.exe pipeline\make_short.py all --id hielo-flota --scale 0.5
   ```

## Continuar en otro PC (Linux)

Probado en CachyOS (Arch) el 2 nov (D56). Mismos pasos que en Windows, con estos cambios:

1. **Programas:** `sudo pacman -S git ffmpeg espeak-ng nodejs-lts-krypton npm tesseract tesseract-data-spa
   tesseract-data-eng uv` (en Debian/Ubuntu, los equivalentes con `apt`; `uv` con su instalador oficial).
2. **Python** (desde la raíz del repo; `setup_audio.ps1` es solo para Windows):

   ```bash
   uv python install 3.11
   uv venv --python 3.11 .venv
   uv pip install --python .venv/bin/python torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu
   uv pip install --python .venv/bin/python -r requirements.txt \
       --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
   ```

   PyTorch va en versión CPU. Con GPU NVIDIA, usa el índice CUDA que corresponda.
3. **Remotion:** `cd studio && npm ci && npx tsc --noEmit`. npm avisa de que bloqueó el `postinstall` de esbuild.
   No hace falta: el binario `@esbuild/linux-x64` ya viene instalado.
4. **Temporales:** por defecto `~/remotion-tmp` (no `/tmp`, que suele ir en RAM). Se cambia con `REMOTION_TMP`.
5. **Referencias y prueba de humo:** como en Windows (pasos 5 y 8), con `.venv/bin/python` y rutas con `/`.

## F11 · Resultado de la prueba (3 nov)

`garganta-gripe` rehecho como `garganta-gripe-v2` (mismo guion y voz; solo cambia `05_story.json`): 8 beats con 6
objetos distintos (garganta en corte ×3, virus, célula, persona, neurona, caja) y 5 entornos, frente a `persona` ×8 y 3
entornos. QA a escala 0,5, **con avisos**: racha estática 103 → 50 frames (límite de diseño 45, de referencias 100), OCR
86,7 % (como antes; con los cielos claros de `interior_cuerpo` y `microscopio` bajó a 76,7 %, por eso se oscurecieron) y
silencio 32,6 % (la voz, ya conocido en D64). **Sin pasar** por el agente verificador de look-match: falta.

## F12 · Prueba: `sin-gravedad` (3 nov)

Primer video con las fórmulas nuevas (gancho `y_si`, estructura `cadena`, cierre `bucle`, elegidos por el usuario).
Verificador de look-match, ronda 1: **5,1/10** (luz 4, profundidad 4, cámara 4; objetos pequeños). Arreglos al entorno
`espacio_profundo` (más claro, suelo con rejilla en vez de un bloque negro, nebulosas más suaves, `distK` 0,85), tamaños de
objeto y etiquetas de `ForceArrows`. QA final a escala 1: estilo 9/9, luminosidad mediana 0,19 (antes 0,116), OCR 97,1 %
(antes 88,6 %), pero **racha estática 99 frames** (cumple las referencias, ≤100; no la regla de diseño, ≤45). Estaba en el
plano de la molécula (b05); cambiar la cámara a `drift` no la movió. No se volvió a pasar el verificador tras los arreglos.

## Pendientes conocidos (para F9–F10)

1. ~~Plano quieto más largo~~ y ~~color del ejemplo~~: resueltos en F8 (D58, D59). `hielo-flota` da QA OK.
2. **Bloqueantes de F10 según el verificador** (`docs/LOOKMATCH.md`): moléculas en red hexagonal visible y corte del
   lago con el hielo flotando arriba (`heroes/primitive/science.ts`).
3. ~~Voz algo robótica~~: resuelto con el tratamiento de voz de D62 (muestras A/B). Las pausas extra en las comas
   se descartaron de oído. Vigilar el % de silencio (22,8 en `hielo-flota`, mínimo 22).
4. **Modelos glTF CC0 (Kenney)**: el cargador está hecho pero sin probar con un modelo real. Descargar 2–3 modelos,
   probarlos y actualizar `heroes/LICENSES.md` (corrección de D33).
5. **Fuentes no verificadas**: las de los guiones de ejemplo se escribieron de memoria (D14, D52). Hay que
   verificarlas antes de publicar.
6. **R2 (el perro) no está** en `references_local/` (D1); `video3` es otro short.
7. **Overlays de F3**: tras los arreglos al 5/10 del verificador no se volvió a pasar el verificador (D28).
8. **Grade por entorno**: con un grade por luz, 5 de 12 combinaciones de `EnvGallery` quedan fuera de rango
   (`cielo_atardecer`, `vista_aerea` en el borde, `calle_noche_bokeh`, `interior_neutro`+`dorado`, `tech_oscuro`+`noche`).
   Queda para F10 (D58, D59).
9. **Mejoras no bloqueantes del look-match**: b07 termina en el mismo encuadre que b01, movimiento poco visible dentro
   de b04, mancha de luz de noche más fuerte, profundidad en el suelo, color de acento y más etiquetas de dato.
10. **Prueba de F9 (`celular-calienta`, 2 nov):** en una sesión nueva, el prompt "Hazme un short de curiosidad de un
   minuto sobre por qué el celular se calienta al cargarlo" (sin nombrar el skill) activó `explainer-short` y llegó
   hasta `09_final.mp4` (1080x1920, 59,6 s) sin intervención. Coste aproximado: ~$2,8 en equivalente de API (Opus
   principal + Haiku para 7 búsquedas), el 3 % del uso de las últimas 24 h. QA final a escala 1 **con avisos**: racha
   estática de 66 frames (regla de diseño ≤45; a escala 0,5 había salido OK) y OCR al 94 % (no lee "al" y "de"). Para
   F10: averiguar por qué la racha cambia con la escala y si el OCR debe ignorar palabras de ≤2 letras.
11. **Voz (D64, 3 nov):** Chatterbox con la voz de Diego es el motor por defecto. En `hielo-flota`, la racha estática
   sube a 70 frames (regla de diseño ≤45) y el silencio llega al 32 % (máximo del rango): la voz es más pausada y los
   beats más largos. Para F10: vigilarlo y, si hace falta, bajar las pausas a ×1,3.
