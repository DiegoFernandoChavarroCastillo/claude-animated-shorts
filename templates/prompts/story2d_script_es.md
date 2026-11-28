# Prompt: guion de un short narrativo 2D (español) · estructuras `drama` (hechos reales), `alegoria` (mitos), `enigma` (curiosidades) y `escalada` (rachas de récords, D126)

Escribes el guion de un short vertical de **25 a 38 s** (historia o reflexión 2D; con el perfil viral, 85–125 palabras, D132) que cuenta una **alegoría, mito o relato filosófico** como un viaje, con voz en off. Mismas reglas de voz y de validador que `script_es.md` (frases ≤22 palabras, números en palabras y con fuente, nada de «ll/y» seguidos, sin despedida). Esta guía solo cambia la **estructura** y el **tono**.

## Las 8 reglas de retención (D132, 28 nov; mandan sobre todo lo de abajo)
Salen de auditar los cuatro shorts de filosofía del canal (erizo, Buridán, río de Heráclito, anillo de Giges): la gente miraba ~20 s de 60–72, la retención se clavaba en ~30 % y YouTube dejaba de repartirlos en ~1.300 vistas. Los cuatro seguían la misma plantilla «Imagina + fábula + "Esta es la famosa paradoja de…" en el segundo 18 + moraleja repetida». Valen también para los guiones de Diego (`guion_autor: usuario`): él pidió que la skill los reescriba.
1. **25–38 s, 85–125 palabras.** Mejor 68 % de retención en 32 s que 30 % en 68 s. Si no cabe, quita ideas, no palabras de cada frase.
2. **Nunca «Imagina…» ni el nombre del tema** en la primera frase. En ≤2,5 s (≤10 palabras): el conflicto en «tú», una contradicción o una consecuencia extrema. «Por esta razón saboteas tus relaciones justo cuando todo va bien.» · «Este burro murió con comida y agua delante. Tú haces lo mismo.» · «Si pudieras ser invisible sin castigo, ¿seguirías siendo buena persona?» (la pregunta vale si es el dilema directo).
3. **Sin muro académico.** Nada de «Esta es la famosa paradoja…», «propuesta por el filósofo…», «se conoce como…». El pensador se nombra una vez, en una cláusula dentro de la acción («Schopenhauer vio en ellos a la sociedad entera.»). El conflicto llega antes del segundo 8.
4. **El ejemplo cotidiano cabe en una frase** («Pasas veinte minutos buscando qué ver y apagas la tele.»), no en 24 s.
5. **Una sola conclusión**, de ≤12 palabras («El problema no son las púas. Es querer amar sin salir herido.»). Nada de «quizás…», «tal vez…», «la verdadera prueba…» repetidos; como mucho dos preguntas en el cuerpo.
6. **Sin desvíos** a otros autores u otras ideas (Platón y Camus metidos en el erizo).
7. **Cierre de ≤8 palabras que enlaza con la primera del gancho** (bucle sintáctico: «Y mientras esperas eso, sin darte cuenta, saboteas…» → «Saboteas tus relaciones…»).
8. **El titular del gancho** (`meta.hookTitle`, tercio superior) da curiosidad en segunda persona («¿Y si fueras invisible?»), nunca es el nombre del tema («La paradoja del erizo»).
Ejemplo del formato: `templates/examples/erizo-30s/02_SCRIPT.md` (el erizo de 72 s reescrito en 99 palabras). `validate_script.py` comprueba 1, 2, 3, 5 y 7; el crítico de guion, todas.

## Entrada
- El tema y `01_research.md` con los **hechos ancla verificados contra el texto original** (≥2 fuentes cada uno) y una sección **«Huecos»**: lo que las fuentes no cuentan (qué pensaba, qué se dijo en privado, quién miraba, cómo olía el lugar). Los huecos son donde va la ficción.

## Ángulo: de una idea simple a un video que se ve entero y se envía (D123)
Antes de proponer ganchos, decide estas seis cosas y escríbelas en `02_SCRIPT.md` (sección `## Ángulo`, la exige el validador). Salen de comparar cuatro videos muy virales (`docs/AnalisisVideosIA.md`) con los nuestros: todos abren una pregunta que no cuadra, la sostienen con datos que **se ven**, se abren a una imagen grande y rematan con una frase que se puede citar.

| Línea | Qué es | Ejemplos |
|---|---|---|
| `- pregunta:` | La paradoja del tema dicha como pregunta: algo que no debería pasar y pasa. Es el bucle que el video abre en el segundo 0 y **no cierra hasta el remate** | «¿Por qué una ballena cruza medio planeta hacia un mar sin comida?» · «¿Cómo se le gana una discusión a Platón sin decir casi nada?» |
| `- en_juego:` | Qué se pierde si sale mal (una vida, un trono, el prestigio, meses de hambre) | La vida de la cría · la definición de Platón delante de toda la Academia |
| `- cifras:` | De 2 a 4 cifras del tema, **cada una con la imagen que la hace visible** (`cifra = imagen`). Sin cifras: `ninguna` | «ocho mil kilómetros = una ruta que cruza el mapa» · «once mil kilos = dos elefantes» · «setenta y un muertos = setenta y una velas» |
| `- climax:` | La imagen grande a la que se abre el video hacia el 70 %: un mapa, una multitud, una ciudad entera, la sala completa reaccionando | El estadio lleno de velas · la sala estallando de risa ante el pollo |
| `- remate:` | La frase (o el acto) que responde la pregunta y la reencuadra. Mejor de contraste: «no es X, es Y». Debe oírse casi literal en una línea `[twist]` | «Colombia no es su comedor. Es su sala de partos.» · «¡He aquí el hombre de Platón!» |
| `- compartir:` | A quién se lo enviaría alguien y por qué: asombro, orgullo de lugar o de grupo, ternura, risa, «esto le pasó a…» | Orgullo: «se inventó aquí» · risa: un chiste de hace dos mil años |

Si no encuentras la pregunta, el clímax o el remate, el tema todavía no tiene video: busca otro momento de la historia o otro dato. Las cifras se quedan en pocas y redondas; cada una debe poder dibujarse (ver la tabla «qué recurso para qué frase» de `story-short/SKILL.md`).

## Lo primero: una anécdota, contada en orden y en tercera persona (11 nov)
Los videos que gustaron (diogenes-pollo, diogenes-alejandro, cartas-marco-aurelio) y los que no (colapso-bronce, cleopatra-saco) se diferencian en esto:
- **Una sola anécdota con remate**, no una vida ni una época. Si el texto del usuario cubre años (Cleopatra: el saco, César, Roma, los idus, la huida), elige **el mejor momento** (la noche del saco) y vívelo; el resto cabe en 1–3 frases de contexto o de consecuencia.
- **Tercera persona, como se le cuenta algo a un amigo**: «Su hermano le quitó el trono. Entonces llegó César. Cleopatra necesitaba verlo…». Cada frase con sujeto claro; pasado o presente, los dos valen. **Nunca «Eres X»**: el «tú» va solo en el gancho y en el cierre, o como testigo en la sala (el validador rechaza `pov: tu` en historias reales).
- **El remate es concreto**: un acto o una frase que se entiende al instante («Apártate, me tapas el sol», el pollo desplumado, las cartas quemadas sin leer). Nada de metáforas de estructura («la última apuesta», «no la mataron siete barcos») ni rótulos conceptuales en pantalla.
- **Solo `drama`, `alegoria` o `enigma`**: las estructuras inventadas obligan a descifrar la historia (el validador las rechaza con `ficcion:`).
- **Corto y completo**: 25–38 s (D132), frases completas. Si no cabe, quita hechos, no palabras de cada frase.

## Dramatización (la eliges tú; no se le pregunta al usuario)
Un short de historia que suena a documental se desliza: «Según Dion…», «Cuentan que…», crónica en pasado, una lista de hechos y la moraleja al final. Lo que retiene es **vivir la escena**. Regla de oro: **los hechos ancla no se tocan; el cómo se inventa.**

**Ancla (verificada, intocable):** quién, qué pasó, en qué orden, cómo acabó y las frases célebres (se pueden acortar, no cambiar de sentido). **Inventable:** gestos, miradas, silencios, olores, el clima, lo que piensa un personaje, un testigo (incluso inventado), frases privadas fieles a su carácter, comprimir el tiempo o juntar dos escenas en un lugar. **Nunca:** cambiar un desenlace, atribuir una cita real a otra persona, inventar cifras o fechas, o presentar lo inventado como dato («los textos dicen que lloró»). Lo dudoso se dice como duda dentro de la escena («Una de esas cartas podría ser de tu esposa»), no con un «según».

Cabecera: `ficcion:` y `pov:` (valores en `templates/dramatizacion.json`), y una sección `## Ficción` con líneas `- ancla: …` y `- inventado: …` (el crítico la usa para no confundir la ficción con un error). Elige así, pensando en qué retiene más:

| Si el tema es… | `ficcion` | `pov` | Por qué |
|---|---|---|---|
| La mayoría de historias reales (un personaje, una anécdota) | `dramatizada` | `cercano` (tercera persona: «Marco Aurelio tiene los cofres delante.») | Se sigue sin esfuerzo; así se hicieron diogenes-alejandro y cartas-marco-aurelio |
| Una anécdota con remate (una frase o un gesto que humilla a alguien) | `dramatizada` | `testigo` (alguien que estaba en la sala; el protagonista sigue en tercera persona) | El remate pega más visto desde la grada: primero la tensión del público, luego la risa |
| Un personaje con voz y frases propias (Diógenes, Séneca) contando su vida | `dramatizada` | `yo` | Confesión: intimidad y humor |
| Varios protagonistas o una batalla | `dramatizada` | `cercano` (pegado a uno) | Claridad sin perder el cuerpo |
| Un mito, una alegoría o un experimento mental | `libre` | `cercano` (o `tu` solo si es un experimento mental sobre el espectador) | No hay hechos que proteger: se puede inventar casi todo |
| Un «¿y si…?» sobre un hecho real (final alternativo) | `libre` | cualquiera | Dilo en el cierre o en la descripción: «esto no pasó… ¿o sí?» |
| Hechos disputados, víctimas reales o temas delicados | `fiel` | — | La ficción aquí desinforma o hiere |

**Cómo se escribe una historia dramatizada:**
- **Escena, no resumen.** «Diógenes cruza la sala con algo bajo el manto. Platón deja de sonreír.» y no «Diógenes criticaba a Platón». Tercera persona.
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
| `hook` | El momento más tenso o la consecuencia más absurda (el validador pide un «tú» o «te», p. ej. «Alejandro Magno te ofrece todo y le pides que se aparte») | El personaje o el objeto clave en plano cerrado, ya en movimiento |
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

## Estructura `enigma` (`structure: enigma`, para curiosidades y sucesos colectivos; D123)
`[hook] → [conflicto]+ → [pista]+ → [climax] → [twist] → [cta]` (≥1 `conflicto`, ≥2 `pista`, `climax` obligatorio). Para temas sin un protagonista único con anécdota: por qué migra un animal, de dónde sale una fiesta, cómo nació un invento, qué hizo una ciudad entera. Se cuenta en tercera persona y en orden, como un misterio; no lleva `ficcion:` salvo que dramatices una escena.

| Rol | Qué hace | Imagen que necesita |
|---|---|---|
| `hook` | La pregunta del ángulo, con la paradoja dentro (tipo `paradoja`), o la afirmación chocante equivalente | El protagonista del tema grande y ya en movimiento |
| `conflicto` | El escenario que no cuadra: primero lo normal, luego lo absurdo («Y entonces hace algo absurdo.») | El lugar de partida con vida; el contraste entre dos mundos |
| `pista` | Un dato por línea que acerca la respuesta sin darla. **Cada cifra con su imagen**; a mitad, una pista que lo cambia todo («Pero mira quién nada a su lado.») | Contador, mapa con ruta, calendario, reloj, equivalencia, comparación de tamaños |
| `climax` | El video se abre: la escala completa del fenómeno | Plano que se aleja (`reveal`): mapa entero, multitud, ciudad |
| `twist` | El remate: responde la pregunta del gancho y la reencuadra | La imagen más fuerte, cerca |
| `cta` | `remate_cta`: invitación corta ligada al tema. `bucle`: frase abierta que el gancho continúa | La escena del remate (con el CTA animado) o la del gancho |

Reglas propias: la pregunta del gancho **no se responde antes del `twist`** (si una pista la contesta, ya no hay motivo para seguir); una pista de cada dos trae algo que se ve moverse; nada de listas de datos sin hilo: cada pista responde a «¿y entonces por qué…?».

## Estructura `escalada` (`structure: escalada`, para rachas de récords con un giro; D126)
`[hook] → [hito]+ → [giro]+ → [twist]+ → [cta]` (3–5 `hito`, 1–2 `giro`, 1–2 `twist`). **No es una historia**: no lleva `ficcion:` ni protagonista; todo es dato verificado. Para «cómo cambió X en diez años», avances de tecnología o ciencia, récords deportivos: un tema con 3–5 hitos que suben de escala y **una excepción absurda** que todavía falla. Dura **30–45 s** (100–160 palabras; perfil `escalada` de `pacing_viral.json`, D132): los golpes de datos cansan rápido. Lleva `## Ángulo` como las historias. Ejemplo: `templates/examples/ia-frontera/`.

| Rol | Qué hace | Imagen que necesita |
|---|---|---|
| `hook` | Contraste antes/ahora con fecha, o la afirmación chocante del tema. La imagen hace la mitad del trabajo (pantalla partida) | `VersusCard` o dos assets lado a lado, el «antes» ya en cuadro en el fotograma 0 |
| `hito` | Un récord por línea, **cada uno un dominio más grande que el anterior** (de la pantalla al mundo físico, a la ciencia). Cifra = imagen; un golpe visual (`pop`, `camshake`, `flash`) por hito. El último hito siembra el giro sin decirlo («Todo sube. Casi todo.») | Medalla, contador que sube (`StatCallout from`, `Gauge`), `DotGrid`, el objeto del récord en acción |
| `giro` | El ritmo se frena: la excepción absurda, con un detalle que se vea, y su cifra contra la humana. La ironía explícita («Las IA de oro…») | Plano largo y oscuro (`palette_shift` a `themeAlt`), `BarCompare`; sin cortes |
| `twist` | El remate que reencuadra la racha («no es X, es Y») y una consecuencia concreta | La línea de hitos entera, con su hueco (`reveal`) |
| `cta` | `remate_cta`: una pregunta que obliga a tomar partido, ligada al tema | `ChatMock` o `ShareCTA` sobre el remate |

Reglas propias: la racha no se explica, se acumula (una línea = un hito); el giro se oye después del último hito, nunca antes; nada de «puntuación perfecta» ni redondeos que inflen: cada récord con su cifra exacta en `## Fuentes`. Ritmo visual: un golpe por hito y un plano largo en el giro (que respire).

## Estructuras nuevas (D120) — no en historias
Desde el 11 nov las historias (`ficcion:` declarada) usan solo `drama` o `alegoria`: lo de abajo queda para piezas sin historia real (reflexiones, experimentos mentales). Referencia: un
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
**Hay varios tipos que funcionan y valen lo mismo (D124)**; elige el que mejor le sienta a cada tema y varíalos entre videos:
1. **Protagonista inmediato:** el espectador dentro desde la primera frase, con «tú/te/tu/ti» y una acción («Si te duermes agarrando dos bolas de acero…», «Imagina que estás…»).
2. **Pregunta con la paradoja dentro** (`hook: paradoja`): «¿Por qué una ballena nada ocho mil kilómetros sin comer?». Puede hablar de un tercero.
3. **Afirmación chocante sobre algo que todos conocen** (un lugar, un objeto, el cuerpo): «En Japón es imposible que te despidan».
4. **Escena límite o revelación** de la anécdota, con algo en juego: «Alejandro Magno te ofrece todo y le pides que se aparte».

Lo que pierde gente (y el validador rechaza en el perfil viral): abrir **afirmando algo de un tercero desconocido** sin paradoja («Un herrero le vendió a un rey…», «Hace años, un científico…»), el «tú» que llega en la segunda frase, saludos y presentaciones («hola», «hoy vamos a ver»), la pregunta vacía y «Imagina un X» sin el espectador dentro («Imagina que estás…» sí vale). Después del gancho, la historia sigue en tercera persona (D122).
- **Prueba de los 3 s:** alguien que no conoce el tema, ¿entiende qué le prometes al oírlo una sola vez? Si no, reescríbelo.
- Evita como palabra central una abstracción («conversación», «conciencia», «realidad», «sentido»): no pinta nada. Usa una **consecuencia concreta para el espectador** (tú + verbo + descubrimiento) o una imagen que se vea: «Cuando mueres, descubres que todos fueron tú.»
- Duración hablada del gancho según su tipo (25 nov, a pedido del usuario: no todos los ganchos caben en 3,2 s): los de golpe (`dato`, `mito`, `paradoja`, `contradiccion`, `pregunta`…) ≤3,2 s, unas 7 palabras con la voz `diego`; los de planteamiento (`y_si`, `escena`, `revelacion`, `reto`) montan una situación y llegan a 4 s (≤11 palabras; `max_s` en `templates/formulas.json`). En el story, `meta.hook` repite el tipo del guion para que el validador y el QA usen su tope. Como afirmación en presente en 2.ª persona valida como `hook: escena`; `mito` y `contradiccion` exigen una forma más rígida.
- El cierre en bucle retoma una palabra **clave y concreta** del gancho (p. ej. «todos»: «…¿y si todos fueran tú?»), no una abstracción repetida.
- **Pregunta con paradoja** (`hook: paradoja`, D123): una pregunta vale si lleva dentro lo que no cuadra: una cifra, un nombre propio o un contraste («¿Por qué una ballena nada ocho mil kilómetros sin comer?», «¿Sabías que un equipo pidió que su rival fuera campeón sin jugar?»). Sigue prohibida la pregunta vacía («¿Alguna vez te has preguntado…?», «¿Qué hacen las ballenas en invierno?»). En pregunta no hace falta el «tú».
- Antes de escribir, propón al usuario 3 ganchos **de tipos distintos** (de los cuatro de arriba) y deja que elija. Si el usuario escribe o elige un gancho propio, pon `hook_autor: usuario` en la cabecera: el validador no le aplica las reglas de forma y el crítico no lo sustituye. Los tres hablan del **momento** de la anécdota, con su protagonista por el nombre («Alejandro Magno te ofrece todo y le pides que se aparte»). Un gancho de tipo nuevo es opcional.

## Tono
- Cercano, de tú a tú, como quien cuenta un chisme histórico que no se puede creer; suspenso en `rupture` y `ascent`, humor si el material lo da. Ni solemne ni de clase.
- Una imagen por frase: cada línea del guion tiene que poder dibujarse con los assets del catálogo 2D (`python tools/catalog_search2d.py <palabras>`). Si un concepto central no tiene asset, créalo antes (ver el plan story-2d) o cambia la frase.
- Cierra con una pregunta al espectador que lo haga volver al principio, no con moraleja cerrada (`bucle`), o con el remate y una invitación corta (`remate_cta`).

## Cierre: `bucle` o `remate_cta` (lo eliges tú, D123)
| Cierre | Cómo es | Cuándo |
|---|---|---|
| `bucle` | La última frase queda abierta y el gancho la continúa; el video termina sin cola y se repite solo | El gancho es una afirmación que admite ser continuación; temas de filosofía o de «¿y si…?»; cuando el remate es un gesto y no una frase |
| `remate_cta` | El último `[twist]` es la frase-remate; la `[cta]` es una invitación de ≤12 palabras que sale del tema («Envíaselo a quien todavía cree que vienen a comer.») y en pantalla lleva un CTA animado (`ShareCTA` o `ChatMock`) sobre la escena, 3–5 s | El remate es una frase redonda que pide cerrar; el tema se comparte por orgullo, ternura o asombro; `enigma` casi siempre |

No hay datos fiables de cuál rinde más: por eso se elige por video y se compara en el canal con `tools/ingest_stats.py`. Nunca «sígueme para más» a secas.

## Formato de salida
Igual que `script_es.md`, con cabecera `hook: mito|paradoja|…|<nuevo>`, `structure: drama|alegoria|enigma`, `closing: bucle|remate_cta`, `ficcion:` y `pov:` (si es `drama`), la sección `## Ángulo` (seis líneas), la sección `## Fuentes` y, con ficción, `## Ficción` (`- ancla: …` / `- inventado: …`). Ejemplo completo y vigente: `templates/examples/mito-caverna/` (con `01_research.md`). Después, `python pipeline/validate_script.py out/<id>/02_SCRIPT.md` hasta **PASA**.

## Perfil `pacing: viral` (por defecto en los videos nuevos)
Cabecera del guion: `pacing: viral` (y `closing: bucle`); en el story: `meta.pacing: "viral"`. Todo lo que cambia está en `templates/pacing_viral.json` (una sola fuente de verdad) y lo comprueban `validate_script.py`, `validate_story2d.py` y el QA. Sin esa cabecera rigen las reglas de arriba.

**System prompt de la etapa de redacción** (historias 2D: 25–38 s, D132; el explainer sigue en 35–59 s, D121):
> Eres un guionista experto en viralidad de YouTube Shorts con retención superior al 100 %. Tu objetivo es contar la idea del usuario como **una anécdota**, en tercera persona y en orden, en un guion de 25 a 38 segundos (85–125 palabras). Nunca empieces con «Imagina» ni con el nombre del tema, nunca frenes para presentar la teoría, y di la conclusión una sola vez. Frases cortas y claras con sujeto, ritmo ágil, suspenso narrativo y un gancho agresivo en los primeros 2 segundos. Asegúrate de que la última palabra del texto conecte gramaticalmente con la primera palabra del texto para crear un bucle perfecto.

| Regla | Valor |
|---|---|
| Duración | 25–38 s hablados (85–125 palabras con la voz `diego`, D132); sin relleno ni pausas |
| Gancho (0–2,5 s) | ≤10 palabras; nunca «Imagina…» ni el nombre del tema (D132); afirmación chocante, paradoja o dato contraintuitivo en la primera frase, o una pregunta con la paradoja dentro (cifra, nombre propio o contraste). Uno de los cuatro tipos de «Gancho» (D124). Prohibido: «¿Alguna vez…?», «Imagina…» (cualquiera, D132), saludos, «Solo conversación…», la pregunta vacía y abrir afirmando algo de un tercero desconocido |
| Frases | 8–12 palabras como máximo; verbos de acción, sin adjetivos de relleno; una imagen por frase; frases completas con sujeto, no telegramas |
| Cierre en bucle (`closing: bucle`; la alternativa es `remate_cta`, arriba) | La última frase queda **abierta** (acaba en «:», «…» o en un nexo sin punto: *que, porque, cuando, como, y…*) y la primera frase del gancho la continúa. Ej.: cierre «Y lo único que importa de los demás es que» → gancho «Solo tú eres real. Los demás, decorado.» Comparte además una palabra de ≥5 letras con el gancho |

Ejemplo vigente (con story, `templates/examples/solipsismo-viral/`): gancho «Solo tú eres real. Los demás, decorado.». El gancho debe pasar igualmente la prueba de los 3 s: si una frase tan larga como la de un ejemplo de dos oraciones no cabe en 3 s hablados, deja la primera frase como gancho y mueve la segunda a la primera línea `[scene]`.

### Audio y tiempos (los aplica el pipeline)
- Voz: `meta.voice.speed` ≥ 1,18 (+18 %, D132; antes 1,13) y pausas entre frases ≤120 ms (`pauseMaxMs`); el silencio de cada frase se recorta siempre. La velocidad y las pausas del perfil no se reajustan al medir (el QA exige 3,5–4,5 pal/s).
- SFX: golpe grave (`impact`) en el segundo 0, barrido (`whoosh_soft`) en cada cambio de escena, `riser` 0,8 s antes de `rupture`, `climax` y `twist`, y (D132) un golpe seco con 0,4 s de música cortada al entrar el `climax` (o el `twist`), más un `pop` de relleno si pasan 4 s sin ningún efecto. La cama sonora va 18 dB bajo la voz (antes 24) y la música no se apaga al final (el video hace bucle).

### Visual y subtítulos del story
- Un cambio (acción, overlay o sub-plano) cada ~1,8 s (≥4 por cada 10 s, D132); nunca más de 2,5 s sin cambios; planos del director de ≤2 s; ninguna cámara `hold`.
- Subtítulos de 1–3 palabras, grandes (7,4 % del ancho ≈ 80 px a 1080), con contorno grueso y placa semitransparente (D132: se leen sobre nieve o cielo claro), centro-inferior (centro en el 66 % del alto, por encima de la interfaz de Shorts y TikTok). El titular del gancho va en el tercio superior (22 %): durante el gancho no pongas overlays en `top`/`upper`. Las palabras clave van en **amarillo** (`meta.captionEmphasis: "accent"`): pon `keywords: [...]` (varias por beat) en cada beat.
- La franja 0,62–0,74 del alto es de los subtítulos: capas con los pies en y ≤0,62 y overlays solo en los slots `top`, `upper` o `center`.
- `at` busca la **primera** aparición de la palabra en el beat: si se repite («Es… es una»), elige otra palabra más única.
