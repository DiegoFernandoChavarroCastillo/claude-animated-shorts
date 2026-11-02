# Inventario del repo (Fase 0)

Estado leído el 2026-11-01 en la rama `estilo-explainer`, a partir de `main` (`e3b817b`).
Objetivo: dejar por escrito los archivos, exports y contratos **reales** y marcar en qué difieren del plan
(`docs/PLAN_ESTILO_EXPLAINER.md`, sobre todo §4). Las diferencias van marcadas con **⚠ DIF**.

## 1. Estructura real

```
claude-animated-shorts/            ← raíz del repo git (no la carpeta vd/ que la contiene)
├─ SKILL.md                        skill "cartoon-3d-short" (puente)
├─ README.md, LICENSE (MIT)
├─ docs/PLAN_ESTILO_EXPLAINER.md   el plan (sin versionar hasta este commit)
├─ references/
│  ├─ STYLE_BIBLE.md
│  ├─ reports/  8 informes: CONTEXT, characters, depth, grade, lighting, motion, outlines, textures
│  ├─ frames/   38 jpg 540x960 (short01..short19, frames 0060/0180)
│  └─ sheets/   20 hojas de contacto (short01..20)
├─ references_local/videos/        video1..video5.mp4 (≈27 MB, ignorado por .gitignore)
├─ templates/
│  ├─ bridge/     13 archivos .ts/.tsx (código completo del puente)
│  ├─ audio/      7 .py + cues.md (SFX, música, mezcla del puente)
│  ├─ scripts/    bridge-stills.mjs, bridge_merge.py, bridge_shots.py, sbs_sheet.py, short_qa.py
│  ├─ sandbox_index_example.tsx
│  └─ SCRIPT_example.md
└─ tools/medicion/                 measure.py, audio.py, ocr_caps.py, chunks.py,
                                   medidas_referencias.json, README.md (aplanado en F0; antes en
                                   tools/medicion/herramientas_medicion/)
```

**⚠ DIF 1 · Herramientas de medición anidadas.** El plan (§5, §8 F2/F5/F8, Apéndice C) las cita como
`tools/medicion/measure.py` y `tools/medicion/README.md`, pero están en
`tools/medicion/herramientas_medicion/`. **Resuelto (decisión del usuario):** se aplanó a `tools/medicion/`.

**⚠ DIF 2 · No hay proyecto Remotion en el repo.** No existe `package.json`, `src/index.ts`, `src/Root.tsx`
ni `public/`. `templates/bridge/` es solo el código fuente que el SKILL original copia a
`src/videos/bridge/` de un proyecto Remotion externo. Para el criterio de F0 "2 stills del puente" hace
falta crear ese proyecto (ver §6). **Decisión del usuario:** el proyecto vive en `studio/` dentro del repo.

**⚠ DIF 3 · Faltan los modelos Kenney.** `world.ts` carga 26 GLB de `public/bridge/kenney/<nombre>.glb`
(`staticFile`). No están en el repo. El cargador los ignora si faltan (`.catch(() => null)`), y árboles,
arbustos y setos se dibujan por código, así que el puente renderiza igual pero sin farolas, puestos,
carros, molino, canoas, nenúfares ni flores. Son CC0 (Kenney Nature Kit / Fantasy Town Kit).

**⚠ DIF 4 · `references/` tiene más que fotos.** El plan (§4) dice "fotos del canal del puente". Incluye
además `STYLE_BIBLE.md` y 8 informes medidos en `reports/`. Moverlo todo a `legacy/` es coherente con el
plan; solo lo anoto.

## 2. `templates/bridge/` — exports y contratos

Grafo de imports: `Bridge.tsx` → `world, ink, lensblur, grade, build, story`; `world.ts` → `build, paint,
toon, lights, shade, ink, cast, story`; `cast.ts` → `toon, story, lights, ink, cardshade`;
`build.ts` → `story (D0), paint, shade`; `cardshade.ts` → `shade`.

| Archivo | Exports | Notas |
|---|---|---|
| `Bridge.tsx` | `BRIDGE_FRAMES` (= `TOTAL`), `BridgeShort` | Compositor. Interruptores A/B por `inputProps.post` (`ink, lens, pre, bloom, grade, grain, dpr`). Crossfade apilando un 2.º `ThreeCanvas`. Flash blanco de 4 f. Fondo DOM `#cfe3f2`. |
| `story.ts` | `FPS, TOTAL, D0, HALF, FILES, ROW_GAP, COUNT, PARK, V3, clamp01, smooth, easeOut, front, marchPhase, SNAP, DROP0, DROP1, amp, stomp, shapeZ, dropW, dropU, DROP_H, BridgeState, deckY, Light, Crowd, ShotDef, SHOTS, XFADE, FLASH_AT, shotAt, layersAt, bridgeState, Cam, glide, ANCHOR, snapEnd, kickAt, camAt, keyEnd, Dof, DOF, dofAt, focusAt, Fg, FOREGROUND` | Física del puente + cámara + DOF, todo a mano. |
| `world.ts` | `loadKit, chainY, BOLT, World` (clase con `update(id, f, cam, scene)`) | Cielo shader de 5 paradas, niebla = horizonte, río, puente dinámico, sol congelado por plano, culling de frustum de cartas. |
| `lights.ts` | `LightPreset, LIGHTS, WorldLook, LOOK` | Claves solo `"day" \| "golden"`. |
| `shade.ts` | `TONE, CHAR, LFB, twoTone, untone` | Sombreado de dos tonos + inversión del tone map Neutral. |
| `cardshade.ts` | `GRAD_K, GRAD_KB, TINT_K, CARD_K, cardShade, blobMaterial` | Cartas iluminadas por la escena. |
| `ink.ts` | `NOINK` (= 3), `InkOptions, InkPass, noInkFallback` | Pase de tinta como `Pass` propio. |
| `lensblur.ts` | `LensBlurEffect, LensBlur, GrainEffect` | DOF de lente fina en 2 pasadas (`pre` 16 taps + `main` 64+32). |
| `grade.ts` | `tintRGB, KX, monoTangents, GradeParams, GRADE_DAY, GRADE_GOLDEN, GradeEffect, GRADE_DAY2, GRADE_GOLDEN2, GRADES, GRADE_STRENGTH, gradeFor` | Curva de 7 nudos + saturación por zonas + split-tone + viñeta. |
| `build.ts` | `Kit, V, lam, quad, tri, boxGeo, Batch, Strand, Ray, prop, kitClone, house, flagTex, buildTown` | Utilidades de geometría + pueblo. |
| `paint.ts` | `rng, ctex, rep, jit, grass, cobble, stone, planks, beam, water, bed, roof, brick, chainTex, facade, planksHD, beamHD, stoneHD, cobbleHD, roofHD, grassHD, facadeHD, waterMarks, waterNear, waterFar, CLOUD_DAY, CLOUD_GOLD, cloudHD, chainHD` | Texturas Canvas2D cacheadas por clave. |
| `toon.ts` | `INK, SKIN, mul, shade, mix, RIFLEMAN, OFFICER, KID, PARENT, SKINS, soldier, townsfolk, Pen, Blob, blobPts, headBlob, thickAngle, Expr, Arms, Prop, FrontOpts, bodyFront, SideOpts, bodySide, swingKid, fxNote, fxBurst, fxSplash, fxPuff, fxStars, fxCreak, fxRing, fxSign, fxCloud, fxShadow, fxContact, fxPlank, fxDrum, fxBlob, Outfit, Build` | API `Pen`, lienzo 600x1000, suelas en y = 975. |
| `cast.ts` | `Req, Pool, SU, SU_SWING, Actor, Fx, Place, FxPlace, CamInfo, Stage, HITS, SIGN_AT, SWING_T, PUSH0, swingAmp, swingAngle, stage, snapFx, splashFx, creakFx, FPS` | Pool de lienzos, billboards en capa `NOINK`. |

### Contratos citados por el plan

| Contrato | Plan dice | Real | Estado |
|---|---|---|---|
| `NOINK` | de `ink.ts` | `export const NOINK = 3` en `ink.ts` | ✅ |
| `dofAt` | de `story.ts` | `dofAt(f) → { cInf, focus? }` sobre la tabla `DOF` | ✅ |
| `FOREGROUND` | de `story.ts` | `Fg[]` con `{a, b, kit, pos, s?, yaw?}` | ✅ |
| `LIGHTS` / `LOOK` | de `lights.ts`, presets `day`/`golden` | igual | ✅ |
| `CAMS` | parte de `story.ts` | **no exportado** (const interna); lo público es `camAt(id, f)` y `keyEnd` | ⚠ DIF 5 (menor) |
| `KICKS` | parte de `story.ts` | **no exportado**; lo público es `kickAt(t)` | ⚠ DIF 5 (menor) |
| `XFADE` | parte de `story.ts` | exportado | ✅ |
| Orden del compositor | ink → lens pre → lens main → bloom → NEUTRAL → grade, MSAA 4 | igual + `GrainEffect` al final (apagado) | ✅ |
| Bloom | plan pide umbral ~0,9 / intensidad ~0,6 | real: umbral 1,0 / intensidad 0,5 / 6 niveles / radio 0,6, MIP fijado a 540x960 | cambio previsto por el plan |
| `cInf` | recalibrar a 10–16 px (CU/MS) y 0–6 (generales) | `maxCoC 24`, `nearScale 1.2`; la tabla `DOF` ya usa 0–16 | ✅ compatible |
| Escala de píxeles | — | todo parámetro en px se define a 1080x1920 y se escala con `alto/1920` | a conservar |

## 3. `templates/audio/` — exports y contratos

| Archivo | Qué es | Reutilizable tal cual |
|---|---|---|
| `dsp.py` | DSP propio: filtros, ruido, envolventes, paneo, reverb sintética, medidor BS.1770-4 (`integrated, momentary, short_term, lra, true_peak`), WAV 16/24 bit. `SR = 48000`. | Sí (genérico) |
| `sfx_gen.py` | Generadores: `creak, clink, rattle, boot, column_stomp, deck_flex, chain_groan, bolt_strain, bolt_snap, whoosh, chain_whip, timber_tear, wood_crack, bubbles, splash_big, water_bed, vox, oof, whoa, babble, hurrah, applause, bird_chirps, crickets, breeze, flag_flutter, swing_squeak, push_thump, hammer_hit, stroll_step` | Sí (`whoosh`, `clink`, `breeze`…) |
| `instruments.py` | Instrumentos sintetizados (`brass, glock, vibes, musicbox, triangle, fife, whistle, snare, cymbal, timpani, brush, pluck, pad`) | Solo si se activa música |
| `music.py` | Marcha original del puente (Si♭, 120 bpm), `SECTIONS`, `build()`, `render()` | No (específica del puente) |
| `timeline.py` | Copia en Python de los tiempos de `story.ts`/`cast.ts` del puente | No (codificada a mano) |
| `sfx.py` | Lista de cues del puente (`Cue`, `cues()`, `render(v_ref)`) | La clase `Cue` y `render()` sí; los cues no |
| `mix.py` | Voz + música (ducking) + SFX, limitador 4x look-ahead, informe `cues.md` | Limitador y medición sí; ver DIF 6–8 |
| `cues.md` | Hoja de cues generada del puente (salida, no código) | No |

**⚠ DIF 6 · Loudness distinto.** `mix.py` masteriza a **−15 LUFS** con techo **−1,2 dBTP**; el plan pide
**−14 LUFS** y ≤ −1 dBTP.

**⚠ DIF 7 · Nivel de SFX distinto.** `sfx.py` coloca cada evento a **−6 dB** de la voz (`SFX_DB`); el plan
pide **−8 a −12 dB**.

**⚠ DIF 8 · Formato de `words.json` incompatible.** `mix.py` lee `w["s"]` y `w["e"]`; el plan (§7.5)
define `{"w", "start", "end", "beat"}`. Hay que elegir uno.

**⚠ DIF 9 · Faltan SFX del plan.** De `whoosh_soft, pop, tick, riser, impact` (§7.6) solo existe `whoosh`
(y `clink` sirve de base para `tick`). `pop`, `riser` e `impact` suave hay que escribirlos.

Rutas codificadas: `mix.py` lee `<carpeta padre>/voice/voice.wav` y `voice/words.json` y escribe junto a sí
mismo; `timeline.py` cita `~/bridge-short/`.

## 4. `templates/scripts/`

| Archivo | Qué hace | Notas |
|---|---|---|
| `bridge-stills.mjs` | Empaqueta una vez y renderiza stills JPEG de `BridgeShort` | Ruta fija a Chrome `C:/Program Files/Google/Chrome/...` (**no existe en esta máquina**), `gl: "angle"`. Respeta `REMOTION_TMP` y `BRIDGE_ENTRY`. |
| `short_qa.py` | QA frame a frame: specs, loudness, negros/blancos/congelados/saltos, hojas de 2 s | Necesita ffmpeg/ffprobe, numpy, Pillow. Genérico. |
| `sbs_sheet.py` | Hoja lado a lado (nuestros arriba, referencia abajo) | Genérico. |
| `bridge_merge.py` | Fusiona sandboxes por archivo | `ROOT = "your Remotion project"` (marcador sin rellenar). |
| `bridge_shots.py` | Extrae `shots.json` de `story.ts` con regex | Específico del puente. |

## 5. `SKILL.md` y `README.md`

- Nombre del skill: `cartoon-3d-short`. Reglas a cambiar según el plan: "No captions", "English only",
  "music +3 dB", "Final export 2K", "Opus max verifies every check" (conservar la idea). Coincide con §4.
- El SKILL cita ~3,7 palabras/s; el plan lo sustituye por ≈2,8 (§3.10). Coincide con lo previsto.
- `README.md` instala en `~/.claude/skills/cartoon-3d-short/`.

## 6. Dependencias deducidas del código

- **npm** (no hay `package.json`): `remotion`, `@remotion/three`, `@remotion/bundler`, `@remotion/renderer`,
  `three`, `@react-three/fiber`, `@react-three/postprocessing`, `postprocessing` (el comentario de
  `grade.ts` cita la 6.37), `react`.
  **⚠ DIF 10:** el `package.json` de §5 del plan no lista `@react-three/fiber`, `@react-three/postprocessing`
  ni `postprocessing`, que el motor necesita.
- **Python**: `numpy`, `scipy` (audio), `Pillow` (scripts), `opencv-python`, `pytesseract` (medición).

## 7. Entorno de esta máquina (2026-11-01)

| Pieza | Estado |
|---|---|
| Node / npm | **No instalado** |
| Python | 3.11.9 (launcher `py`); no hay 3.12 |
| ffmpeg / ffprobe | **No instalado** |
| Tesseract + `spa` | **No instalado** |
| espeak-ng (F5) | No instalado |
| Google Chrome | No instalado (Remotion puede descargar su propio Chrome Headless Shell) |
| git | 2.56; `core.longpaths` sin configurar |
| GPU | Intel HD Graphics 530 (integrada), sin NVIDIA |
| RAM | 7,8 GB |
| Disco | Solo `C:` con 203 GB libres; **no hay `D:`** |

**⚠ DIF 11 · No hay disco `D:`.** El plan (§10) usa `D:\remotion-tmp`. Habrá que usar una carpeta en `C:`
(p. ej. `C:\remotion-tmp`) y vigilar el espacio.

**⚠ DIF 12 · Hardware por debajo de lo que asume el plan.** Sin GPU NVIDIA, Chatterbox (§7.4) no es práctico
y los renders con desenfoque y bloom serán lentos (el original medía ~4 fps a 2K con GPU dedicada).
Kokoro, Piper y faster-whisper sí funcionan en CPU.

## 8. Proyecto `studio/` montado en F0

- `studio/` (decisión del usuario): Remotion 4.0.539, three 0.187.0, @react-three/fiber 9.8.2,
  postprocessing 6.39.6, React 19.3.1. Versiones exactas en `studio/package.json` y `package-lock.json`.
- `src/Root.tsx` registra solo `BridgeShort` (legado, prueba del motor). `src/videos/bridge/` es una copia de
  `templates/bridge/`.
- `scripts/stills.mjs` sustituye a `bridge-stills.mjs`: recibe el id de la composición, no fija la ruta de
  Chrome (Remotion usa su Chrome Headless Shell), fija `TEMP`/`TMP` a `REMOTION_TMP` (por defecto
  `C:/remotion-tmp`) y acepta `STILLS_PROPS` (inputProps en JSON), `STILLS_GL` y `STILLS_ENTRY`.
- three 0.187 conserva la cadena que parchea `shade.ts` (`lights_fragment_begin`): sin cambios.

**⚠ DIF 13 · `@react-three/postprocessing` fijado en 3.0.4.** Con la 3.2.x los stills salen vacíos (solo el
fondo DOM `#cfe3f2`): crea el composer de forma asíncrona (`setComposerState` en un efecto) y, como Remotion
avanza un único frame por still, el composer aún no existe cuando se captura. La 3.0.4 lo crea de forma
síncrona. Comprobado: sin `EffectComposer` la escena se ve; con 3.0.4 se ve con toda la cadena.

**⚠ DIF 14 · Único cambio en el código del puente.** Los tipos de la 3.0.4 no aceptan hijos `null` en
`<EffectComposer>`, así que en `studio/src/videos/bridge/Bridge.tsx` los pases opcionales son un array
filtrado. Mismo orden y mismos pases que el original; `templates/bridge/` queda intacto.

**Rendimiento medido (Intel HD 530):** still a escala 0,5 en 10–18 s tras un bundle de ~1 min.