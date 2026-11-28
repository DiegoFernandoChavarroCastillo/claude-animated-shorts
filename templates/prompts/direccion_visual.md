# Dirección visual del story 2D (D129): montaje rápido, cámara viva y escenas con detalle

Para quien escribe `05_story.json` (o el `_dev/build_story.py` de un video), en `story-short` y en `long-video`. Lo que se comprueba lo dice
`pipeline/validate_story2d.py`; lo que hace el motor solo, `studio/src/flat2d/director.ts`.

## Lo que hace el motor solo (no lo escribas)
- **Director automático** (videos con `meta.theme`): ningún plano dura más de `director.maxShotS` (3,0 s en shorts, 3,5 s en el video largo;
  `templates/pacing_*.json`). Parte cada tramo largo en planos con **corte seco en el inicio de una palabra**, alternando **general / medio /
  primer plano** sobre el sujeto. El sujeto es la capa a la que le pasa una acción en ese plano; si no hay, `scene.subject` (id de una capa)
  o el personaje más grande. Si la capa se desplaza (`slide`, `walk`, `run`, `launch`), el plano queda abierto para que no se salga.
- **Ken Burns** del 3–8 % en cada plano, y en la cámara del beat si apenas se movía.
- **Contorno oscuro** de 3 px en personajes y props (`meta.outline` en px; `0` lo apaga; `outline: false|true` por capa).
- **Haces de luz** con las luces `sol`, `dia`, `atardecer`, `foco`, `luna` y `submarino`.
- **Desenfoque por profundidad**: lo muy lejano (`par` ≤ 0,25) y lo que pasa por delante (`par` ≥ 1,25) salen desenfocados.

`meta.director: false` apaga el director y `meta.director: 2.5` cambia la duración máxima.

## Lo que escribes tú
1. **Cada oración cambia algo en pantalla.** No hace falta una escena nueva: basta un plano del director, una acción, una cara o un rótulo. El hueco máximo sin cambios es la duración del plano (lo cuenta el validador). Apunta a **un micro-evento cada ~2 s**: los beats con tema admiten hasta 6 acciones.
2. **Escenas con detalle**: además de lo que el fondo trae dibujado, 2 o más personajes o props propios por plano (el validador lo exige en el video largo). Busca 3–5 elementos que digan dónde estamos: en un cuarto, la cama, la ventana, la lámpara y el reloj; en un campo, la cerca, el molino y las nubes.
3. **Caras que siguen al guion**: `expr` cambia la cara de una `figura` en una palabra y se queda: `{type:"expr", target, at, to: "decidido"}`. Gestos: `feliz` `serio` `enojado` `triste` `sorpresa` `decidido` `miedo` `muerto`, o sus nombres en inglés (neutral, happy, angry, shocked, sad, determined, scared, dead).
4. **Cuerpo**:
   - poses `corre`, `sostiene` y `caido`, además de las de siempre;
   - acciones `run` (corre mientras dura; muévela con `slide`) y `fall` (cae al suelo con los ojos en X y se queda).
5. **Rótulos dentro de la escena** (siguen a la cámara):
   - `callout`: flecha curva desde un rótulo de 1–3 palabras hasta un detalle de la capa. Para nombrar a un personaje la primera vez o señalar el objeto clave. `point: [u, v]` dentro de la capa si no es la cara o el centro.
   - `bubble`: globo de reacción sobre la cabeza (≤14 letras: «?», «¡Sí!», «Yo espero»).
6. **Interfaz con golpe** (overlays):
   - `Stamp`: sello inclinado que cae: veredicto, revelación, algo descartado.
   - `StatCallout` con `icon`: la cifra rueda hasta su valor con un icono al lado.
   - El resto de overlays, como siempre. En el video largo van a un lado (`screenX`).
7. **Transiciones con intención** (`transition` del beat, hacia el siguiente):

   | Transición | Para qué |
   |---|---|
   | `cut` | Acción y enumeraciones rápidas |
   | `wipe_left` / `wipe_right` | Barrido que sigue un movimiento |
   | `iris` | Recuerdo, flashback, sueño |
   | `flash_cut` | Golpe, explosión, revelación (destello y sacudida) |
   | `swipe` | Ascenso |
   | `crossfade` | Solo cuando dos ideas se funden; ya no es la opción por defecto en escenas de acción |

8. **Sembrar y cobrar (setup y payoff)**: un objeto o dato que se ve en el primer minuto (el reloj, la moneda, la cifra) vuelve en primer plano en el clímax. Márcalo en `shows` de los dos beats («SIEMBRA: el reloj» / «COBRA: el reloj») y, si es una capa, ponla como `scene.subject` en el beat del clímax para que el director la encuadre de cerca.

## Narración (recordatorio; manda la skill de cada formato)
- En historias reales, tercera persona. El «tú» va en el gancho y en el cierre, nunca «Eres X» (D122).
- El guion del usuario conserva su redacción (D127).
- En el video largo, un re-gancho cada 15–20 s: una pregunta, una amenaza o un «pero» que empuje a seguir mirando.
