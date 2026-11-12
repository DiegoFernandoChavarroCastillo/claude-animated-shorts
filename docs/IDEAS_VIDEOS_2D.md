# Ideas de videos para `story-short` (motor 2D)

Lista de temas para shorts narrativos de 60–120 s con siluetas planas, voz en off y subtítulos. Es el equivalente 2D de
`IDEAS_VIDEOS.md` (que es del `explainer-short` 3D). No es una lista cerrada: es el punto de partida.

**Cómo leerla**
- **Gancho:** una propuesta que pasa la «prueba de los 3 s» de `templates/prompts/story2d_script_es.md` (concreto, ~7 palabras,
  se entiende sin contexto). Son borradores: en cada video se proponen 3 y el usuario elige.
- **Assets:** los que ya existen y encajan. Catálogo vigente (13): `cueva_corte`, `pared_sombras`, `prisioneros`,
  `prisionero_libre`, `muro_bajo`, `fuego`, `tunel_ascenso`, `exterior_sol`, `vacio_luz`, `dialogo`, `epocas`, `reflejo`,
  `huevo` (y las siluetas animal/jarra/árbol/persona que cruzan la pared).
- **Esfuerzo:** **bajo** = solo assets existentes; **medio** = 1–2 assets nuevos; **alto** = 3 o más, o una escena que no se parece a nada.
- **Estructura:** hoy solo existe `alegoria`. `dilema`, `y_si`, `relato`, `reglas` y `reflexion` están reservadas en el catálogo
  (`roles_pendientes`) pero **sin implementar**: son la siguiente mejora (ver el final).
- Todo dato (autor, año, texto original) se investiga con ≥2 fuentes y contra el texto primario antes de escribir el guion;
  no confíes en esta lista como fuente. Separa siempre lo que dice el autor de la interpretación.

**Ya hechos:** `mito-caverna` (Platón) y `el-huevo` (Andy Weir).

---

## 1. Filosofía: experimentos mentales (ya son relatos)

| # | Tema | Gancho posible | Assets | Esfuerzo | Estructura |
|---|---|---|---|---|---|
| 1 | El anillo de Giges (Platón, *República* II) | «Si fueras invisible, ¿seguirías siendo bueno?» | persona, `fuego`, `vacio_luz` | medio (anillo, invisibilidad) | dilema |
| 2 | La máquina de experiencias (Nozick) | «Te ofrecen una vida perfecta, pero falsa.» | `dialogo`, `vacio_luz`, `cueva_corte` | bajo | dilema |
| 3 | El barco de Teseo | «Cambias todas tus piezas. ¿Sigues siendo tú?» | `reflejo`, `epocas` | medio (barco) | y_si |
| 4 | El teletransportador (Parfit) | «Al entrar te desintegran. Al salir, ¿eres tú?» | `reflejo`, `vacio_luz` | medio (cabina) | dilema |
| 5 | El velo de la ignorancia (Rawls) | «Diseña el mundo sin saber quién serás.» | `epocas`, `vacio_luz` | bajo | dilema |
| 6 | El dilema del tranvía (Foot) | «Una palanca. Cinco personas o una.» | persona | alto (vías, tranvía) | dilema |
| 7 | El cerebro en una cubeta (Putnam) | «Todo lo que sientes podría ser un cable.» | `cueva_corte`, `dialogo` | medio (cubeta) | y_si |
| 8 | El cuarto de Mary (Jackson) | «Sabe todo del rojo, pero nunca lo ha visto.» | persona, `exterior_sol` | medio (cuarto en gris) | relato |
| 9 | La habitación china (Searle) | «Contestas en chino sin saber una palabra.» | persona | medio | dilema |
| 10 | El sueño de la mariposa (Zhuangzi) | «¿Y si eres el sueño de una mariposa?» | `vacio_luz`, `epocas` | medio (mariposa) | alegoría |
| 11 | El mito de Sísifo (Camus) | «Empujas la misma piedra para siempre.» | `tunel_ascenso`, `exterior_sol` | medio (piedra) | alegoría |
| 12 | La apuesta de Pascal | «Apostar a que Dios existe sale rentable.» | `dialogo`, `vacio_luz` | bajo | dilema |
| 13 | El asno de Buridán | «Tiene hambre, sed y dos opciones iguales.» | animal (silueta), `vacio_luz` | medio | relato |
| 14 | El dilema del prisionero | «Tú y un desconocido, y solo uno puede ganar.» | `prisioneros`, `reflejo` | bajo | dilema |
| 15 | El carro alado de Platón (*Fedro*) | «Dentro de ti, dos caballos tiran en contra.» | animal, `exterior_sol` | alto | alegoría |

## 2. Mitos y fábulas (alegoría, el formato ya implementado)

| # | Tema | Gancho posible | Assets | Esfuerzo |
|---|---|---|---|---|
| 16 | Ícaro y el sol | «Te dijeron que no volaras tan alto.» | `exterior_sol`, `tunel_ascenso` | medio (alas) |
| 17 | El rey Midas | «Todo lo que tocas se vuelve oro. Todo.» | `fuego`, persona | medio (oro, comida) |
| 18 | Narciso | «Te enamoras de ti sin saber que eres tú.» | `reflejo` | bajo |
| 19 | Pandora y la esperanza | «Abres la caja y escapa todo menos una cosa.» | `fuego`, `vacio_luz` | medio (caja) |
| 20 | La zorra y las uvas | «Si no puedes tenerlo, dices que no lo querías.» | animal, `exterior_sol` | medio |
| 21 | Los ciegos y el elefante | «Cada uno toca algo distinto y todos juran tener razón.» | `epocas`, animal | medio |
| 22 | Parábolas zen (la taza llena) | «Tu taza está tan llena que no cabe nada.» | persona, `exterior_sol` | medio |

## 3. «¿Y si…?» y reflexión existencial (tono de `el-huevo`)

| # | Tema | Gancho posible | Assets | Esfuerzo |
|---|---|---|---|---|
| 23 | ¿Y si solo existes tú? (solipsismo) | «Todos los demás podrían ser decorado.» | `epocas`, `vacio_luz` | bajo |
| 24 | ¿Y si pudieras revivir tu vida igual? (eterno retorno, Nietzsche) | «Debes vivir esta vida otra vez, idéntica.» | `epocas`, `reflejo` | bajo |
| 25 | ¿Y si tu yo de hace diez años te viera? | «Te cruzas contigo, pero con diez años menos.» | `reflejo`, `dialogo` | bajo |
| 26 | El cerebro de Boltzmann | «Quizá solo existes durante este segundo.» | `vacio_luz`, persona | medio |
| 27 | La paradoja del abuelo | «Viajas atrás y matas a tu abuelo. ¿Y entonces?» | `epocas` | medio |
| 28 | Memento mori / estoicismo | «Hoy podría ser tu último día. Actúa así.» | `exterior_sol`, `tunel_ascenso` | bajo |

## 4. Ficción corta con giro (relato / reglas)

Funcionan muy bien en short, pero piden escenas propias (casa, pasillo, puerta) y por eso su esfuerzo es **alto**.

| # | Tema | Gancho posible |
|---|---|---|
| 29 | Las que se van de Omelas (Le Guin) | «Una ciudad perfecta sostenida por un solo niño.» |
| 30 | Reglas para vigilar un faro | «Si ves a alguien en las rocas, no le contestes.» |
| 31 | El último mensaje de un astronauta | «Llevas años sin respuesta, y hoy suena la radio.» |
| 32 | La habitación que solo se abre de noche | «Hay una puerta nueva en tu casa. Es de hoy.» |

(Los de la sección 4 son ideas originales: se escriben desde cero, sin copiar texto de otras cuentas.)

---

## Cómo elegir con criterio

1. **Empieza por esfuerzo bajo** (2, 5, 12, 14, 18, 23–25, 28): reutilizan lo que ya existe y permiten afinar el guion sin dibujar.
2. **Cada asset nuevo debe servir a más de un video** (una cabina, una piedra, un barco, una mariposa y una caja cubren 8 ideas).
3. **Una idea por video.** Si el tema pide explicar contexto histórico, es un `explainer-short`, no un story.
4. **Gancho antes que nada:** el tema solo vale si puedes decirlo en una frase concreta de ~7 palabras.

## Mejora pendiente del motor

Implementar las estructuras `dilema` (escenario en 2.ª persona → decisión → obstáculo que la complica → qué respondieron
los filósofos → giro que reencuadra → pregunta abierta) y `y_si`, con sus roles en `catalog2d.json`, el validador de guion y
una plantilla en `templates/prompts/`. Con eso las ideas 1–15 y 23–28 dejan de forzar la estructura `alegoria`.


## Curiosidades contadas como misterio (`enigma`, D123)
Formato de los videos virales de `docs/AnalisisVideosIA.md`: pregunta que no cuadra, pistas con cifras que se ven, clímax panorámico y remate. Investiga cada dato con ≥2 fuentes antes de escribir.

| Tema | Gancho posible (pregunta con paradoja) | Clímax | Tema visual | Kit |
|---|---|---|---|---|
| Migración de la ballena jorobada | «¿Por qué una ballena nada ocho mil kilómetros sin comer?» | Globo con la ruta de la Antártida al Pacífico | `submarino` → `cosmos` | `ballena`, `mapa_mundo`, `rayos_luz` |
| El día de las velitas (7 de diciembre) | «¿Por qué Colombia enciende millones de velas la misma noche?» | Calles enteras encendiéndose | `noche_calida` (+ `pergamino` para el pasado) | `calle`, `vela` con `repeat`, `Calendar` |
| La ciclovía de Bogotá | «¿Sabías que la ciclovía nació en Colombia?» | Ciudades del mundo encendiéndose | `ciudad` | `calle`, `figura` con `repeat`, `launch`, `mapa_mundo` |
| Por qué las pirámides no tienen esclavos | «¿Quién construyó las pirámides, si no fueron esclavos?» | La obra entera con miles de obreros | `pergamino` / `vivo` | `figura` con `repeat` |
| El año sin verano (1816) | «¿Cómo nevó en julio en medio mundo?» | El mapa del frío extendiéndose | `drama_oscuro` | `mapa_mundo`, `particulas` nieve, `Thermometer` |
| La tregua de Navidad de 1914 | «¿Por qué dos ejércitos jugaron fútbol en plena guerra?» | La tierra de nadie llena de soldados | `noche_calida` | `figura` armadura/actual con `repeat`, `velas` |
