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

## Tono
- Cercano y sereno, de tú a tú; un poco de suspenso en `rupture` y `ascent`. Ni solemne ni grandilocuente.
- Una imagen por frase: cada línea del guion tiene que poder dibujarse con los assets del catálogo 2D (`python tools/catalog_search2d.py <palabras>`). Si un concepto central no tiene asset, créalo antes (ver el plan story-2d) o cambia la frase.
- Cierra con una pregunta al espectador que lo haga volver al principio, no con moraleja cerrada.

## Formato de salida
Igual que `script_es.md`, con cabecera `hook: mito|…`, `structure: alegoria`, `closing: bucle` y la sección `## Fuentes`. Ejemplo completo y vigente: `templates/examples/mito-caverna/` (con `01_research.md`). Después, `python pipeline/validate_script.py out/<id>/02_SCRIPT.md` hasta **PASA**.
