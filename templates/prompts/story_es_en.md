# Prompt: del guion aprobado a `story.json` (es / en)

Conviertes un `02_SCRIPT.md` **aprobado** en `05_story.json`, el plan visual del video. Solo usas lo que existe en
`templates/catalog.json` (léelo entero antes de empezar). No escribes código: todo lo visual sale del catálogo, y un id
que no esté en él hace fallar la validación.

## Entradas

- `02_SCRIPT.md` aprobado (ya pasó `validate_script.py`).
- `templates/catalog.json`: entornos, luces, objetos protagonistas con sus poses y anclas, presets de cámara,
  transiciones, overlays con sus campos, iconos y SFX. Cada entrada trae un "when" (cuándo usarla).

## Reglas

1. **Un beat por línea del guion**, en el mismo orden: `id` = `b01`, `b02`…; `role` = la etiqueta de la línea;
   `text` = la línea **exacta** (misma ortografía y puntuación: los subtítulos y la voz salen de aquí).
2. `meta`: `id` del video, `lang`, `title`, `voice` (es: `chatterbox`/`diego`, la voz grabada del usuario;
   en: `chatterbox`/`default`; respaldo rápido: `kokoro` con `em_alex` en es o `am_fenrir` en en), `music: false`, `captionEmphasis: "box"` (o `"accent"` para temas
   muy técnicos).
3. `keyword`: **una palabra por beat** que lleva la caja de selección, copiada del `text` (la idea clave, no un
   artículo). En el gancho, el verbo o el objeto sorprendente.
4. **Escena** (`scene`):
   - `env` y `light` del catálogo, eligiendo por su "when" y usando una de las luces de `envs.<id>.lights`.
   - **Cambia de entorno solo al cambiar de lugar o de idea grande.** Beats seguidos en el mismo sitio comparten
     `env`, `light` y protagonista, así la transición `glide` planea la cámara sin cortar.
   - `hero`: un objeto protagonista por beat (`kind` y `asset` del catálogo; `pose` de su lista). Es lo que la voz
     nombra o explica en ese momento.
   - `camera`: `push_in` por defecto; `orbit_slow` para enseñar la forma; `drift` para enumerar; `glide` al llegar a
     un lugar nuevo; `zoom_through` en el beat que sigue a una transición `zoom_through`.
   - `dof` (desenfoque de fondo, px a 1080): primer plano 12–16, plano medio 8–12, plano abierto 2–6. Si no lo pones,
     se usa el del entorno.
5. **Cada beat `mechanism` = un objeto protagonista + al menos un overlay de dato** (`StatCallout`, `BarCompare`,
   `Gauge`, `Waveform`, `IntervalMarks`, `IconFlow`, `UICard`…). El número grande del paso va en un `StatCallout` o
   un `BarCompare`.
6. **Overlays**: `type` y campos según `catalog.json`. `at` = una palabra del `text` del beat (cuando se dice) o
   `"#n"`. Los anclados (`PulseRings`, `LightTrails`, `Callout3D`) pueden llevar `anchor` con un ancla del protagonista.
   Colores con tokens (`ui.cyan`, `warm.gold`, `ui.green`, `ui.red`). Textos de overlay cortos (≤4 palabras) y en el
   idioma del video.
   - gancho: `PulseRings` o `Pill`; tensión: `Pill` o `NoSymbol`; segunda capa histórica: `TitlePlaque`;
     giro: `Callout3D` o `NoSymbol`; CTA: normalmente ninguno.
7. **Fuentes**: un beat con un overlay numérico lleva `sources` con las URL de `## Fuentes` del guion para ese dato.
8. **Transiciones** (`transition`, hacia el beat siguiente): `glide` por defecto, `zoom_through` para "entrar" en el
   objeto (pantalla, ventanilla, chip), `crossfade` entre ideas, `cut` solo al cambiar de lugar y **como mucho 3 por
   minuto**.
9. `sfx` solo si hace falta algo extra: los whoosh, pops, ticks, riser e impact se añaden solos (`sfx_plan.py`).

Al terminar, la validación es automática: `calculateMetadata` cruza el story.json con el catálogo y falla con el
motivo exacto (id inexistente, pose que no existe, `at` que no es una palabra del beat…).

## Ejemplo completo (`templates/examples/hielo-flota/05_story.json`)
```json
{
  "meta": {
    "id": "hielo-flota",
    "lang": "es",
    "title": "Por qué el hielo flota",
    "fps": 30, "width": 1080, "height": 1920,
    "voice": { "engine": "chatterbox", "voice": "diego", "speed": 1.0 },
    "music": false,
    "captionEmphasis": "box"
  },
  "beats": [
    {
      "id": "b01", "role": "hook",
      "text": "¿Te has preguntado por qué flota el hielo, si es agua sólida?",
      "keyword": "flota",
      "scene": { "env": "interior_neutro", "light": "noche", "hero": { "kind": "primitive", "asset": "vaso_agua_hielo", "pose": "centro" },
                 "camera": { "preset": "push_in", "rate": 0.2 }, "dof": 14 },
      "overlays": [ { "type": "PulseRings", "at": "flota", "anchor": "hero", "color": "ui.cyan" } ],
      "transition": "glide"
    },
    {
      "id": "b02", "role": "tension",
      "text": "Casi todas las sustancias se encogen al congelarse, y su versión sólida se hunde. Con el agua pasa justo lo contrario.",
      "keyword": "contrario.",
      "scene": { "env": "interior_neutro", "light": "noche", "hero": { "kind": "primitive", "asset": "vaso_agua_hielo", "pose": "lateral" },
                 "camera": { "preset": "drift", "dir": "right" }, "dof": 12 },
      "overlays": [ { "type": "Pill", "at": "hunde.", "text": "SE HUNDE", "color": "ui.red" } ],
      "transition": "zoom_through"
    },
    {
      "id": "b03", "role": "mechanism",
      "text": "Al congelarse, el agua se expande cerca de un nueve por ciento. Por eso una botella llena revienta en el congelador.",
      "keyword": "expande",
      "scene": { "env": "tech_oscuro", "light": "tech", "hero": { "kind": "primitive", "asset": "moleculas_agua", "pose": "red_hexagonal" },
                 "camera": { "preset": "orbit_slow", "deg": 12 }, "dof": 8 },
      "overlays": [ { "type": "StatCallout", "at": "nueve", "value": 9, "suffix": " %", "label": "MÁS VOLUMEN AL CONGELARSE", "color": "warm.gold" } ],
      "sources": ["https://en.wikipedia.org/wiki/Properties_of_water", "https://en.wikipedia.org/wiki/Ice"],
      "transition": "glide"
    },
    {
      "id": "b04", "role": "mechanism",
      "text": "La culpa es de sus moléculas. En el hielo se ordenan en hexágonos que dejan huecos por dentro. Un litro de hielo pesa unos novecientos diecisiete gramos, y uno de agua, mil.",
      "keyword": "hexágonos",
      "scene": { "env": "tech_oscuro", "light": "tech", "hero": { "kind": "primitive", "asset": "moleculas_agua", "pose": "red_hexagonal" },
                 "camera": { "preset": "push_in", "rate": 0.25 }, "dof": 10 },
      "overlays": [ { "type": "BarCompare", "at": "litro", "unit": "g por litro",
                      "items": [ { "label": "Hielo", "value": 917, "color": "ui.cyan" }, { "label": "Agua", "value": 1000, "color": "warm.gold" } ] } ],
      "sources": ["https://en.wikipedia.org/wiki/Ice", "https://www.britannica.com/science/ice"],
      "transition": "crossfade"
    },
    {
      "id": "b05", "role": "layer2",
      "text": "Y aquí se pone interesante. El agua líquida es más densa a unos cuatro grados, así que esa agua baja al fondo de los lagos.",
      "keyword": "cuatro",
      "scene": { "env": "interior_neutro", "light": "dorado", "hero": { "kind": "primitive", "asset": "lago_corte", "pose": "corte" },
                 "camera": { "preset": "glide" }, "dof": 6 },
      "overlays": [ { "type": "StatCallout", "at": "cuatro", "value": 4, "suffix": " °C", "label": "AGUA MÁS DENSA", "color": "ui.cyan" } ],
      "sources": ["https://en.wikipedia.org/wiki/Properties_of_water"],
      "transition": "cut"
    },
    {
      "id": "b06", "role": "twist",
      "text": "Por eso los lagos se congelan desde arriba. El hielo no hunde la vida: la protege, como una tapa contra el frío.",
      "keyword": "protege,",
      "scene": { "env": "interior_neutro", "light": "atardecer", "hero": { "kind": "primitive", "asset": "lago_corte", "pose": "corte" },
                 "camera": { "preset": "push_in", "rate": 0.15 }, "dof": 12 },
      "overlays": [ { "type": "Callout3D", "at": "tapa", "anchor": "top", "text": "Hielo: aislante" } ],
      "transition": "crossfade"
    },
    {
      "id": "b07", "role": "cta",
      "text": "¿Qué otra rareza del agua quieres que te explique? Déjamela en los comentarios.",
      "keyword": "comentarios.",
      "scene": { "env": "interior_neutro", "light": "noche", "hero": { "kind": "primitive", "asset": "vaso_agua_hielo", "pose": "centro" },
                 "camera": { "preset": "drift", "dir": "left" }, "dof": 14 },
      "overlays": [],
      "transition": "cut"
    }
  ]
}
```
