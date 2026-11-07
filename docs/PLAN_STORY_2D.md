# Plan piloto: skill `story-short` (shorts narrativos 2D plano)

Estado general: **7 / 8 fases** (F0–F6 hechas; siguiente: F7, video piloto) · Rama de trabajo: `story-2d` (creada desde `ampliar-catalogo`, commit `c87a8bf`) · Última actualización: 2026-11-06

> Cómo usar este archivo: marca `[x]` al terminar cada tarea, cambia el estado de la fase (⬜ pendiente · 🟡 en curso · ✅ hecha) y anota en la tabla de medidas lo que costó de verdad.

## 1. Objetivo y alcance

Shorts verticales de **más de 60 s y menos de 120 s** que cuentan **narrativas, historias y reflexiones** (filosofía, ciencia ficción, ficción oscura, alegorías) con voz en off, siluetas 2D planas, subtítulos palabra por palabra y cierre en bucle o cliffhanger.

Reutiliza el pipeline actual de voz, subtítulos, mezcla, QA y publicación. Reemplaza solo la parte visual (escenas 3D → escenas 2D por capas) y la investigación (en relatos, una «biblia de la historia»; en filosofía o divulgación, fuentes para fijar el texto).

**Piloto:** un único video, el **mito de la caverna** (Platón, *La República*, libro VII), de 60–90 s y ~10 assets. El esquema nace pensado para admitir más formatos; no se construyen todos ahora.

Fuera de alcance: copiar guion, escenas o marcas de videos ajenos (el video de TikTok comentado es solo referencia de estilo, igual que `references_local/`); animación de personajes con huesos; música con letra.

## 2. Decisiones de diseño

- **Mismo repo, rama `story-2d`.** Cambios solo aditivos; `engine` vale `3d` por defecto. Se mezcla a `main` solo con pruebas en verde.
- **Skill propia** (`story-short/SKILL.md`), para no engordar el contexto de `explainer-short`. Los docs 2D van en archivos aparte.
- **Carpetas nuevas** (no tocan lo existente): `studio/src/flat2d/` (composición y assets), `templates/catalog2d.json`, `templates/prompts/story2d_*.md`, `pipeline/validate_story2d.py`.
- **Se reutiliza sin cambios:** `voice.py`, `tts/`, `align.py`, `mix.py`, `sfx_*`, `voice_fx.py`, subtítulos de Remotion, `publish_pack.py`, caché de voz por frase.
- **Se adapta:** `make_short.py` (elige validador y composición según `meta.engine`), QA de estilo (recalibrar rangos), SFX (sonidos nuevos).
- **Formatos de guion como estructuras** (como en el explainer): el piloto implementa `alegoria`; el esquema deja sitio para `reglas`, `relato` (con giro), `reflexion` (monólogo), `y_si` (ciencia ficción) y `dilema` (filosofía).

## 3. Esquema de `05_story.json` (engine 2d) — borrador

```json
{
  "meta": { "id": "mito-caverna", "lang": "es", "engine": "2d", "title": "…",
            "voice": { "engine": "chatterbox", "voice": "diego", "speed": 1.0 },
            "music": true, "musicMood": "tense", "captionEmphasis": "box", "tailS": 0.2 },
  "beats": [
    { "id": "b01", "role": "hook", "text": "…", "keyword": "…", "shows": "una frase de lo que se ve",
      "scene": { "palette": "cueva", "light": "fuego",
        "layers": [ { "asset": "cueva_corte", "z": 0 }, { "asset": "pared_sombras", "z": 1, "at": [0.5, 0.35] },
                    { "asset": "prisioneros", "z": 2, "at": [0.5, 0.75] } ],
        "camera": { "preset": "push_in", "from": [0.5, 0.5, 1.0], "to": [0.5, 0.45, 1.25] } },
      "overlays": [ { "type": "Pill", "at": "sombras", "text": "SOLO SOMBRAS", "slot": "lower" } ],
      "actions": [ { "type": "shadow_pass", "at": "sombras", "target": "pared_sombras" }, { "type": "flicker", "at": "fuego", "target": "fuego" } ],
      "transition": "swipe" }
  ]
}
```

Roles del piloto (`alegoria`): `hook → scene → rupture → ascent → return → twist → cta` (cierre `bucle`). Posiciones normalizadas 0–1.

## 4. Biblioteca del piloto (≈10 assets, SVG/Canvas, 2–3 colores planos cada uno)

| # | Asset | Tipo | Estado |
|---|---|---|---|
| 1 | `cueva_corte` (techo, paredes, entrada lejana) | fondo | ⬜ |
| 2 | `prisioneros` (siluetas sentadas, cadenas, mirando la pared) | personaje | ⬜ |
| 3 | `prisionero_libre` (se levanta, se tapa los ojos) | personaje | ⬜ |
| 4 | `muro_bajo` con `portadores` (siluetas que cruzan con objetos) | escenario | ⬜ |
| 5 | `fuego` (llama con parpadeo y luz local) | prop | ⬜ |
| 6 | `pared_sombras` (superficie que recibe sombras proyectadas) | escenario | ⬜ |
| 7 | `objetos_sombra` (animal, jarra, árbol: siluetas para proyectar) | prop | ⬜ |
| 8 | `tunel_ascenso` (rampa hacia la luz) | escenario | ⬜ |
| 9 | `exterior_sol` (sol, cielo, árbol, río) | fondo | ⬜ |
| 10 | Marcadores UI: `Pill`, número, destello de deslumbramiento | overlay | ⬜ |

Efectos centrales 2D: **sombra proyectada** (silueta desplazada y difuminada), luz local parpadeante, cambio de paleta de cueva a exterior, destello de deslumbramiento.

Reglas de calidad (heredadas de `visual-fidelity`): el asset se reconoce de un vistazo, ≥4 partes, nada de sustitutos («lo que se ve = lo que se dice»), ningún overlay tapa al protagonista.

## 5. Fases

### F0 · Preparación y red de seguridad — ✅
- [x] Trabajo anterior comiteado (`c87a8bf`).
- [x] Rama `story-2d` creada.
- [x] Línea base guardada: 20 miniaturas PNG de `templates/examples/bluetooth-wifi` en `tools/baseline/bluetooth-wifi/` (712 KB).
- [x] Comando único: `.venv/bin/python tools/regression_check.py` (pruebas + validar el story + stills + comparar; ~50 s). `... baseline` regenera la línea base solo si un cambio visual es intencionado.
- [x] Verificado: es determinista (diferencia 0,04 entre corridas) y detecta un cambio inyectado (112,7 contra un límite de 3).
- **Listo cuando:** la comprobación de no regresión se corre con un solo comando. ✔

### F1 · Esquema y validador 2D — ✅
- [x] `templates/catalog2d.json` (assets, paletas, luces, cámaras 2D, acciones 2D, overlays).
- [x] `pipeline/validate_story2d.py`: ids existentes, un beat por línea del guion, ritmo (evento cada ≤2,5 s, ≤3 cortes/min), gancho ≤3 s, cierre, `shows` obligatorio. **Lista todos los problemas a la vez.**
- [x] Pruebas en `pipeline/tests/test_validate_story2d.py`.
- **Listo cuando:** un story de prueba válido pasa y cada regla rota falla con su motivo.

### F2 · Motor `Flat2D` mínimo — ✅
- [x] Composición Remotion `Flat2D` con capas por `z`, parallax y posición/escala normalizadas.
- [x] Cámara 2D: `pan_slow`, `push_in`, `pull_out`, `shake`; transiciones `swipe`, `crossfade`, `cut`.
- [x] Luz 2D local y viñeta/grano; efecto **sombra proyectada** con máscara.
- [x] Reutilizar los subtítulos palabra por palabra existentes.
- **Listo cuando:** 3 beats con assets provisionales (formas) se ven y se mueven a 1080x1920, con una sombra que cruza una pared.

### F3 · Biblioteca piloto y acciones 2D — ✅
- [x] Los 9 assets dibujados (sección 4; los marcadores UI reutilizan los overlays no anclados del explainer): `studio/src/flat2d/assets/*.tsx`, con `tools/gallery2d.py` y `tools/catalog_search2d.py`.
- [x] Acciones: genéricas (`appear`, `vanish`, `tremble`, `pop`, `slide`, `scale`), de escena (`flash`, `camshake`, `palette_shift`) y propias (`shadow_pass`, `stand_up`, `walk`, `carry`, `flare`, `light_grow`, `sunrise`). El parpadeo del fuego es continuo.
- [x] Revisión independiente (1.ª ronda: 6/6/5/5/6) y una pasada de arreglos: paleta del exterior apagada, sol bajo, degradado tras los subtítulos, prisioneros y portadores con luz de borde, pared con borde de roca, relieve en la cueva, sin duplicados al hacer crossfade entre escenas iguales.
- [ ] Segunda revisión independiente tras los arreglos (pendiente; se hace con los stills del beat real en F7).
- **Listo cuando:** la hoja de contacto de assets se ve coherente (misma paleta, mismo grosor) y pasa la revisión de otra instancia. Estado: coherente a ojo; la 2.ª revisión queda para F7.

### F4 · Guion narrativo — ✅
- [x] `templates/prompts/story2d_script_es.md` con la estructura `alegoria` (y la lista de las demás como pendientes), tono, longitud 175–300 palabras.
- [x] `01_research.md` del piloto: texto de Platón (*La República*, VII, 514a–520a) y al menos 2 fuentes por dato.
- [x] Validador de guion: estructura, frases ≤22 palabras, sonidos «ll/y» seguidos, cierre en bucle (reuso de `validate_script.py`).
- **Listo cuando:** un guion original de ~220 palabras valida y suena bien leído.

### F5 · Audio de ambiente — ✅
- [x] Voz del narrador (prueba con `diego` y variaciones de `pauseScale`).
- [x] SFX nuevos en `sfx_synth.py`: crepitar del fuego, cadenas, pasos en piedra, eco de cueva, viento exterior.
- [x] Cama sonora (reuso de `music: true`, con un `musicMood` adecuado).
- **Listo cuando:** la mezcla cumple −14 LUFS / TP ≤ −1 dBTP y la voz se entiende sobre los efectos.

### F6 · Integración en el pipeline y QA — ✅
- [x] `make_short.py` elige validador y composición con `meta.engine` (por defecto `3d`).
- [x] Recalibrar los rangos de QA de estilo para 2D (luz, saturación, cortes, racha estática) con referencias propias, sin copiar contenido.
- [x] `publish` y `meta.json` sin cambios de formato.
- [x] **Prueba de no regresión:** línea base de F0 igual que antes.
- **Listo cuando:** `all` corre de punta a punta en un story 2D y en uno 3D sin errores.

### F7 · Video piloto y medición — ⬜
- [ ] Story del mito de la caverna, con `stills` → revisar → `all` → render final.
- [ ] Una ronda del verificador (`templates/prompts/verificador.md` adaptado a 2D).
- [ ] Rellenar la tabla de medidas y decidir: ampliar formatos y biblioteca, ajustar o abandonar.
- **Listo cuando:** `09_final.mp4` entre 60 y 120 s con QA en ✅ y notas del verificador ≥7.

## 6. Medidas a registrar (rellenar en F7)

| Medida | Explainer 3D (`internet-bajo-agua`) | Piloto 2D |
|---|---|---|
| Tokens (≈ % de la ventana de 5 h) | ~16 % | |
| Tiempo de trabajo, sin render | > 1 h | |
| Tiempo de render a escala 1 | ~25–30 min (estimado) | |
| Rondas de validación | 6–7 | |
| Rondas del verificador | 3 | |
| Notas mínimas del verificador | 6 | |

## 7. Riesgos y cómo se controlan

| Riesgo | Control |
|---|---|
| Romper el pipeline 3D | Rama, cambios aditivos, prueba de no regresión en F0 y F6 |
| Más contexto/tokens por tener dos skills | Skill separada; docs 2D en archivos propios; no se lee lo que no se usa |
| Escenas 2D desordenadas por el LLM | Posiciones normalizadas, `shows` obligatorio, validador que lista todo a la vez |
| La sombra proyectada no se ve convincente | Probarla en F2 antes de dibujar los assets; si falla, simplificar a siluetas con borde duro |
| Animación pobre | Limitar a traslación, escala, brillo y sombras; cámara con movimiento real |
| Texto o ideas atribuidos mal a Platón | Fijar el pasaje con ≥2 fuentes y separar lo que dice Platón de la interpretación |
| Contenido ajeno | Solo referencia de estilo; guion, personajes y escenas originales |
| Costo inicial mayor de lo estimado | Piloto de ~10 assets; decisión de continuar solo tras F7 |

## 8. Estimación (incierta)

El motor y la biblioteca del piloto caben en **1–3 sesiones largas**. Es una estimación sin medir; F2 y F3 son las fases que más pueden desviarse.

## 9. Registro de avance

| Fecha | Fase | Qué se hizo | Notas |
|---|---|---|---|
| 2026-11-06 | — | Plan creado | Sin código todavía |
| 2026-11-06 | F0 | Plan ampliado (narrativas, filosofía, ciencia ficción) y piloto cambiado a mito de la caverna; rama `story-2d` creada | — |
| 2026-11-06 | F1 | `templates/catalog2d.json` y `pipeline/validate_story2d.py` (lista todos los problemas a la vez), 24 pruebas | commit `0b5a768` |
| 2026-11-06 | F2 | Motor `Flat2D` (`studio/src/flat2d/`): capas, parallax, cámara 2D, acciones, luz, swipe, paleta, subtítulos y overlays reutilizados; `tools/gallery2d.py`; `job.mjs` elige la composición por `meta.engine` | No regresión 3D verificada |
| 2026-11-06 | F3 | 9 assets, acciones 2D, `catalog_search2d.py`, `test_catalog2d.py`; una ronda del revisor y arreglos | Pendiente la 2.ª revisión (F7); algunos assets (prisionero libre, exterior) siguen siendo sencillos |
| 2026-11-06 | F0 | `tools/regression_check.py` y línea base; F0 cerrada | Correr antes de cada commit que toque archivos compartidos y al cerrar F6 |
