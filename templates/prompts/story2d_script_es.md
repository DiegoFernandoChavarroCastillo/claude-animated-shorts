# Prompt: guion de un short narrativo 2D (español) · estructura `alegoria`

Escribes el guion de un short vertical de **más de 60 y menos de 120 s** (objetivo 80–100 s; unas 220–260 palabras) que cuenta una **alegoría, mito o relato filosófico** como un viaje, con voz en off. Mismas reglas de voz y de validador que `script_es.md` (frases ≤22 palabras, números en palabras y con fuente, nada de «ll/y» seguidos, sin despedida). Esta guía solo cambia la **estructura** y el **tono**.

## Entrada
- El tema y `01_research.md` con los hechos del relato **verificados contra el texto original** (≥2 fuentes cada uno). Cuenta solo lo que el texto dice; si añades una interpretación, preséntala como «para X…».

## Estructura `alegoria` (`structure: alegoria`)
`[hook] → [scene]+ → [rupture] → [ascent]+ → [return] → [twist] → [cta]` (el validador pide ≥1 `scene` y ≥1 `ascent`).

| Rol | Qué hace | Imagen que necesita |
|---|---|---|
| `hook` | Gancho en 2.ª persona (≤12 palabras): tipo `mito` («¿Y si lo que crees real…?») u otro; se dice en ≤3 s | El objeto central del relato, con movimiento ya |
| `scene` | La situación de partida, un elemento por línea (lugar, personajes, la regla que los ata) | Un lugar y sus personajes, bien visibles |
| `rupture` | Algo cambia: alguien se libera, descubre, desobedece | El cambio, en una acción |
| `ascent` | El camino difícil hacia la verdad, en pasos | Un recorrido (cámara que sube) |
| `return` | La consecuencia de volver o de contarlo | El choque entre el que cambió y los que no |
| `twist` | La lectura: qué significa el relato («Para Platón…») y una frase que lo reencuadra | Vuelve a la imagen del principio, cargada de sentido |
| `cta` | **Cierre en bucle**: la última frase no se despide, termina abierta (dos puntos o pregunta) y comparte una palabra de ≥5 letras con el gancho | La misma escena del gancho |

## Gancho (el que más pesa)
- **Prueba de los 3 s:** alguien que no conoce el tema, ¿entiende qué le prometes al oírlo una sola vez? Si no, reescríbelo.
- Evita como palabra central una abstracción («conversación», «conciencia», «realidad», «sentido»): no pinta nada. Usa una **consecuencia concreta para el espectador** (tú + verbo + descubrimiento) o una imagen que se vea: «Cuando mueres, descubres que todos fueron tú.»
- Con la voz `diego` (Chatterbox) el gancho debe tener unas 7 palabras para entrar en ≤3,2 s. Como afirmación en presente en 2.ª persona valida como `hook: escena`; `mito` y `contradiccion` exigen una forma más rígida.
- El cierre en bucle retoma una palabra **clave y concreta** del gancho (p. ej. «todos»: «…¿y si todos fueran tú?»), no una abstracción repetida.
- Antes de escribir, propón al usuario 3 ganchos distintos (uno concreto, uno de consecuencia, uno de pregunta) y deja que elija.

## Tono
- Cercano y sereno, de tú a tú; un poco de suspenso en `rupture` y `ascent`. Ni solemne ni grandilocuente.
- Una imagen por frase: cada línea del guion tiene que poder dibujarse con los assets del catálogo 2D (`python tools/catalog_search2d.py <palabras>`). Si un concepto central no tiene asset, créalo antes (ver el plan story-2d) o cambia la frase.
- Cierra con una pregunta al espectador que lo haga volver al principio, no con moraleja cerrada.

## Formato de salida
Igual que `script_es.md`, con cabecera `hook: mito|…`, `structure: alegoria`, `closing: bucle` y la sección `## Fuentes`. Ejemplo completo y vigente: `templates/examples/mito-caverna/` (con `01_research.md`). Después, `python pipeline/validate_script.py out/<id>/02_SCRIPT.md` hasta **PASA**.

## Perfil `pacing: viral` (por defecto en los videos nuevos)
Cabecera del guion: `pacing: viral` (y `closing: bucle`); en el story: `meta.pacing: "viral"`. Todo lo que cambia está en `templates/pacing_viral.json` (una sola fuente de verdad) y lo comprueban `validate_script.py`, `validate_story2d.py` y el QA. Sin esa cabecera rigen las reglas de arriba.

**System prompt de la etapa de redacción** (adaptado: el original pedía «máximo 55 s», pero YouTube solo monetiza Shorts de más de 60 s; por eso el objetivo es 60–80 s):
> Eres un guionista experto en viralidad de YouTube Shorts con retención superior al 100 %. Tu objetivo es adaptar la idea del usuario en un guion de 60 a 80 segundos (225–290 palabras). Usa frases ultracortas, ritmo picado, alto suspenso filosófico o narrativo y un gancho agresivo en los primeros 2 segundos. Asegúrate de que la última palabra del texto conecte gramaticalmente con la primera palabra del texto para crear un bucle perfecto.

| Regla | Valor |
|---|---|
| Duración | 60–80 s hablados (225–290 palabras con la voz `diego` a +13 %); sin relleno ni pausas |
| Gancho (0–3 s) | ≤11 palabras; afirmación chocante, paradoja o dato contraintuitivo en la primera frase. Prohibido: «¿Alguna vez…?», «Imagina que…», «¿Sabías que…?», «Solo conversación…», empezar por pregunta |
| Frases | 8–12 palabras como máximo; verbos de acción, sin adjetivos de relleno; una imagen por frase |
| Cierre en bucle | La última frase queda **abierta** (acaba en «:», «…» o en un nexo sin punto: *que, porque, cuando, como, y…*) y la primera frase del gancho la continúa. Ej.: cierre «Y lo único que importa de los demás es que» → gancho «Solo tú eres real. Los demás, decorado.» Comparte además una palabra de ≥5 letras con el gancho |

Ejemplo vigente (con story, `templates/examples/solipsismo-viral/`): gancho «Solo tú eres real. Los demás, decorado.». El gancho debe pasar igualmente la prueba de los 3 s: si una frase tan larga como la de un ejemplo de dos oraciones no cabe en 3 s hablados, deja la primera frase como gancho y mueve la segunda a la primera línea `[scene]`.

### Audio y tiempos (los aplica el pipeline)
- Voz: `meta.voice.speed` ≥ 1,13 (+13 %, rango pedido +12–15 %) y pausas entre frases ≤150 ms (`pauseMaxMs`); el silencio de cada frase se recorta siempre. La velocidad y las pausas del perfil no se reajustan al medir (solo avisa si salen de 3,3–4,3 pal/s).
- SFX: golpe grave (`impact`) en el segundo 0, barrido (`whoosh_soft`) en cada cambio de escena y `riser` 0,8 s antes de `rupture` y `twist`.

### Visual y subtítulos del story
- Un cambio (acción, overlay o sub-plano) cada 2,0–2,5 s; nunca más de 3 s sin cambios; ninguna cámara `hold`.
- Subtítulos de 1–3 palabras, grandes (7,4 % del ancho ≈ 80 px a 1080), centro-inferior (centro en el 70 % del alto, por encima de la interfaz de Shorts). Las palabras clave van en **amarillo** (`meta.captionEmphasis: "accent"`): pon `keywords: [...]` (varias por beat) en cada beat.
- La franja 0,62–0,78 del alto es de los subtítulos: capas con los pies en y ≤0,62 y overlays solo en los slots `top`, `upper` o `center`.
- `at` busca la **primera** aparición de la palabra en el beat: si se repite («Es… es una»), elige otra palabra más única.
