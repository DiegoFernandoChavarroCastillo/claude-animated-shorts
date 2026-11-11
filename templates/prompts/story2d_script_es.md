# Prompt: guion de un short narrativo 2D (español) · estructuras `drama` (hechos reales), `alegoria` (mitos) o una nueva

Escribes el guion de un short vertical de **más de 60 y menos de 120 s** (objetivo 80–100 s; unas 220–260 palabras) que cuenta una **alegoría, mito o relato filosófico** como un viaje, con voz en off. Mismas reglas de voz y de validador que `script_es.md` (frases ≤22 palabras, números en palabras y con fuente, nada de «ll/y» seguidos, sin despedida). Esta guía solo cambia la **estructura** y el **tono**.

## Entrada
- El tema y `01_research.md` con los **hechos ancla verificados contra el texto original** (≥2 fuentes cada uno) y una sección **«Huecos»**: lo que las fuentes no cuentan (qué pensaba, qué se dijo en privado, quién miraba, cómo olía el lugar). Los huecos son donde va la ficción.

## Dramatización (la eliges tú; no se le pregunta al usuario)
Un short de historia que suena a documental se desliza: «Según Dion…», «Cuentan que…», crónica en pasado, una lista de hechos y la moraleja al final. Lo que retiene es **vivir la escena**. Regla de oro: **los hechos ancla no se tocan; el cómo se inventa.**

**Ancla (verificada, intocable):** quién, qué pasó, en qué orden, cómo acabó y las frases célebres (se pueden acortar, no cambiar de sentido). **Inventable:** gestos, miradas, silencios, olores, el clima, lo que piensa un personaje, un testigo (incluso inventado), frases privadas fieles a su carácter, comprimir el tiempo o juntar dos escenas en un lugar. **Nunca:** cambiar un desenlace, atribuir una cita real a otra persona, inventar cifras o fechas, o presentar lo inventado como dato («los textos dicen que lloró»). Lo dudoso se dice como duda dentro de la escena («Una de esas cartas podría ser de tu esposa»), no con un «según».

Cabecera: `ficcion:` y `pov:` (valores en `templates/dramatizacion.json`), y una sección `## Ficción` con líneas `- ancla: …` y `- inventado: …` (el crítico la usa para no confundir la ficción con un error). Elige así, pensando en qué retiene más:

| Si el tema es… | `ficcion` | `pov` | Por qué |
|---|---|---|---|
| Una anécdota con remate (una frase o un gesto que humilla a alguien) | `dramatizada` | `testigo` (el espectador o alguien que estaba en la sala) | El remate pega más visto desde la grada: primero la tensión del público, luego la risa |
| Una decisión moral de un personaje (perdonar, quemar, traicionar) | `dramatizada` | `tu` («Eres Marco Aurelio. Tienes los cofres delante.») | El espectador decide con él; el giro es lo que eligió |
| Un personaje con voz y frases propias (Diógenes, Séneca) contando su vida | `dramatizada` | `yo` | Confesión: intimidad y humor |
| Varios protagonistas o una batalla | `dramatizada` | `cercano` (tercera persona en presente, pegado a uno) | Claridad sin perder el cuerpo |
| Un mito, una alegoría o un experimento mental | `libre` | `tu` o `cercano` | No hay hechos que proteger: se puede inventar casi todo |
| Un «¿y si…?» sobre un hecho real (final alternativo) | `libre` | cualquiera | Dilo en el cierre o en la descripción: «esto no pasó… ¿o sí?» |
| Hechos disputados, víctimas reales o temas delicados | `fiel` | — | La ficción aquí desinforma o hiere |

**Cómo se escribe una historia dramatizada:**
- **Presente y desde dentro.** «Entras en la Academia. Huele a aceite de lámpara.» y no «Platón enseñaba en la Academia».
- **Empieza en el momento más tenso** (in medias res) y rebobina solo lo justo. El contexto se da en una frase y dentro de la acción, nunca en un bloque.
- **Algo en juego en las primeras 3 líneas**: una humillación, un trono, una vida, la reputación. Si no hay nada que perder, no hay historia.
- **Un detalle físico por escena** (la piel de gallina del pollo, el sello de cera, el polvo en los pies) y **2–3 frases de diálogo cortas** en estilo directo. La frase célebre real es el diálogo estrella: guárdala para el clímax.
- **Brecha de información:** el espectador sabe o sospecha algo que un personaje no sabe (lo que trae Diógenes bajo el manto). La tensión dura hasta que se revela.
- **El giro pasa en la historia** (un acto, una revelación, una consecuencia irónica), no es una lección. La moraleja **nunca se dice**: queda en la pregunta del cierre.
- **Sin muletillas de crónica en la voz**: *según, cuentan que, la tradición, se dice que, el historiador, años después…* (el validador acepta como mucho 1 con `dramatizada` y 0 con `libre`). Las fuentes van en `## Fuentes` y en la descripción del video, con «Basado en hechos reales (Diógenes Laercio 6.40). Escenas dramatizadas.».
- Humor e ironía cuando el material los da: un short de historia puede ser cómico.

## Estructura `drama` (`structure: drama`, para hechos reales)
`[hook] → [scene]+ → [rupture] → [ascent]+ → [twist]+ → [return] → [cta]` (≥1 `scene` y ≥1 `ascent`; `return` opcional).

| Rol | Qué hace | Imagen que necesita |
|---|---|---|
| `hook` | El momento más tenso o la consecuencia más absurda, en 2.ª persona y presente | El personaje o el objeto clave en plano cerrado, ya en movimiento |
| `scene` | Dentro de la escena: dónde estás, quién manda, qué está en juego (un detalle físico por línea) | El lugar con sus personajes reaccionando |
| `rupture` | Entra el conflicto: alguien desafía, aparece, rompe la regla. Abre la brecha de información | La entrada o el gesto, en una acción |
| `ascent` | Escalada: cada línea sube la tensión (miradas, silencio, un paso más cerca); el diálogo vive aquí | Planos cada vez más cerrados |
| `twist` | La revelación o el remate (la frase célebre, el acto) y su consecuencia irónica dentro de la historia | El objeto o el gesto revelado, grande |
| `return` | Opcional: el después que cambia el sentido (cómo reaccionó el poderoso, qué se corrigió) | Vuelta al lugar, cambiado |
| `cta` | Cierre en bucle: una pregunta o una frase abierta que el gancho continúa | La imagen del gancho |

## Estructura `alegoria` (`structure: alegoria`, para mitos y alegorías)
`[hook] → [scene]+ → [rupture] → [ascent]+ → [return] → [twist] → [cta]` (el validador pide ≥1 `scene` y ≥1 `ascent`).

| Rol | Qué hace | Imagen que necesita |
|---|---|---|
| `hook` | Gancho en 2.ª persona (≤12 palabras): tipo `mito` («¿Y si lo que crees real…?») u otro; se dice en ≤3 s | El objeto central del relato, con movimiento ya |
| `scene` | La situación de partida, un elemento por línea (lugar, personajes, la regla que los ata) | Un lugar y sus personajes, bien visibles |
| `rupture` | Algo cambia: alguien se libera, descubre, desobedece | El cambio, en una acción |
| `ascent` | El camino difícil hacia la verdad, en pasos | Un recorrido (cámara que sube) |
| `return` | La consecuencia de volver o de contarlo | El choque entre el que cambió y los que no |
| `twist` | Lo que el relato revela, mostrado como un acto o una imagen que reencuadra todo (no una clase: «Para Platón…» como mucho una vez; la moraleja nunca se dice) | Vuelve a la imagen del principio, cargada de sentido |
| `cta` | **Cierre en bucle**: la última frase no se despide, termina abierta (dos puntos o pregunta) y comparte una palabra de ≥5 letras con el gancho | La misma escena del gancho |

## Estructuras nuevas (D120)
`drama` y `alegoria` son puntos de partida, no las únicas formas. Si el tema se cuenta mejor de otra manera, diséñala: un
**juicio** (`hook > acusacion > prueba > defensa > twist > cta`), una **carta o diario** (`hook > fecha > entrada > ultima_entrada > twist > cta`),
una **cuenta atrás** (`hook > aviso > dias > ultima_hora > twist > cta`), un **¿y si…?** sobre un hecho real (`hook > hecho > desvio > mundo_nuevo > twist > cta`),
un **dilema** que el espectador decide (`hook > situacion > opcion_a > opcion_b > twist > cta`)… Más premisas en `formulas.json` → `formatos`.

- Cabecera: `structure: <nombre>` y `beats:` con los roles en orden (≥5; empieza en `hook`, acaba en `cta`, lleva `twist`), y la
  línea del nombre en `## Fórmulas nuevas`. Formato completo en `script_es.md` → «Fórmulas nuevas».
- Valen las mismas reglas de dramatización (`ficcion`, `pov`, `## Ficción`, sin muletillas de crónica) y las del perfil viral.
- `riser` automático antes del `twist` (y de `rupture` si lo usas); los roles propios no llevan riser.
- Al proponer, la estructura nueva es una opción más (no hace falta preguntarla aparte): dila en la misma línea que la dramatización
  y por qué cuenta mejor este tema que `drama`.

## Gancho (el que más pesa)
- **Prueba de los 3 s:** alguien que no conoce el tema, ¿entiende qué le prometes al oírlo una sola vez? Si no, reescríbelo.
- Evita como palabra central una abstracción («conversación», «conciencia», «realidad», «sentido»): no pinta nada. Usa una **consecuencia concreta para el espectador** (tú + verbo + descubrimiento) o una imagen que se vea: «Cuando mueres, descubres que todos fueron tú.»
- Con la voz `diego` (Chatterbox) el gancho debe tener unas 7 palabras para entrar en ≤3,2 s. Como afirmación en presente en 2.ª persona valida como `hook: escena`; `mito` y `contradiccion` exigen una forma más rígida.
- El cierre en bucle retoma una palabra **clave y concreta** del gancho (p. ej. «todos»: «…¿y si todos fueran tú?»), no una abstracción repetida.
- Antes de escribir, propón al usuario 3 ganchos distintos (uno concreto, uno de consecuencia, uno de pregunta) y deja que elija. **Comodín (D120):** al menos uno de los tres es de un tipo nuevo, inventado para este tema (descrito en `## Fórmulas nuevas`); se juzga con la misma prueba de los 3 s.

## Tono
- Cercano, de tú a tú, como quien cuenta un chisme histórico que no se puede creer; suspenso en `rupture` y `ascent`, humor si el material lo da. Ni solemne ni de clase.
- Una imagen por frase: cada línea del guion tiene que poder dibujarse con los assets del catálogo 2D (`python tools/catalog_search2d.py <palabras>`). Si un concepto central no tiene asset, créalo antes (ver el plan story-2d) o cambia la frase.
- Cierra con una pregunta al espectador que lo haga volver al principio, no con moraleja cerrada.

## Formato de salida
Igual que `script_es.md`, con cabecera `hook: mito|…|<nuevo>`, `structure: drama|alegoria|<nueva>` (con `beats:` si es nueva), `closing: bucle`, `ficcion:` y `pov:` (si es `drama`), la sección `## Fuentes` y, con ficción, `## Ficción` (`- ancla: …` / `- inventado: …`). Ejemplo completo y vigente: `templates/examples/mito-caverna/` (con `01_research.md`). Después, `python pipeline/validate_script.py out/<id>/02_SCRIPT.md` hasta **PASA**.

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
