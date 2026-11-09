# Prompt: del guion aprobado a `story.json` (es / en)

Conviertes un `02_SCRIPT.md` **aprobado** en `05_story.json`, el plan visual del video. Solo usas lo que existe en
`templates/catalog.json` (léelo entero antes de empezar). No escribes código: todo lo visual sale del catálogo, y un id
que no esté en él hace fallar la validación.

## Entradas

- `02_SCRIPT.md` aprobado (ya pasó `validate_script.py`).
- `templates/catalog.json`: entornos, luces, objetos protagonistas con sus poses y anclas, presets de cámara,
  transiciones, overlays con sus campos, iconos y SFX. Cada entrada trae un "when" (cuándo usarla).

## Antes de escribir: busca los objetos (F11)

El catálogo es grande (más de 70 objetos y 17 entornos): **no lo recorras a ojo**. Haz lo siguiente:

1. Lista los **conceptos visuales** del guion: lo que cada línea nombra o explica (una garganta, un virus, una
   célula, un planeta, una reacción…).
2. Para cada uno, busca con `python tools/catalog_search.py <palabras>` (ej. `garganta virus`, `agujero negro`). Devuelve
   objetos, entornos y overlays con su puntuación, poses y anclas. Una puntuación ≥ 3 es un buen candidato.
3. Si un concepto central **no tiene objeto** (puntuación 0), **créalo** (sección siguiente). No lo sustituyas por uno de otra cosa (F19: un
   teléfono por un portátil, un circuito por «el show»); eso hace que lo que se ve no sea lo que se dice. Solo un concepto secundario puede usar uno genérico
   (`esfera_flotante`, `caja_etiquetada`, `diagrama_flujo`); apúntalo en `out/<id>/05_gaps.md` y díselo al usuario en la entrega.
4. **Varía el protagonista**: el validador falla si un mismo objeto sale en más de 3 beats seguidos o en más del 65 %
   de los beats. Alterna objetos y entornos según cambie la idea (el cuerpo → la célula → el virus).

## Objeto que falta: créalo en este video (F14)

Si un concepto **central** del guion sale con puntuación 0 y se puede hacer con formas simples (una rejilla, una lámina con
cargas, un corte de muñeca con LED), no lo sustituyas por un objeto que no encaja: **créalo**. Reglas:

1. **Máximo 5 prefabs por video** (F19; los conceptos centrales siempre tienen objeto propio). Busca primero en el catálogo y en `studio/src/explainer/heroes/primitive/custom.ts`.
2. Escríbelo en `custom.ts` (un `HeroDef` con `kind`, `when`, `poses`, `radius`, `center`, `anchors`, `build`; ~100–150 líneas, con detalle: 5+ partes, 2–3 materiales, escala real; usa
   los ayudantes de `kit.ts`; nada de `Math.random`). Si el guion pide un efecto en una palabra, dale **acciones propias**
   (`actions` + `act`), p. ej. `chispa`, `amontonar`. **El estado de la acción se pinta también dentro de `act`** (`update` corre antes que `act`; en un still
   suelto el estado llegaría a 0): guarda el último `f` y llama de nuevo a tu función de dibujo al final de `act`.
3. Regístralo en `heroes/index.ts` y en el catálogo: `python tools/add_heroes.py tags.json` (tags en español, un `when` claro).
4. **Prueba visual obligatoria** antes del story: `python tools/gallery.py <dir> hero:pose:env:light:camera` y mira el still.
   Cosas que fallaron siempre a la primera: objeto casi negro (en entornos oscuros usa `glowMat`, `metalness` bajo), objeto
   pequeño (sube el `radius`), una parte escondida dentro de otra (alarga o baja la opacidad).
5. Un prefab **plano o frontal** pide cámara con movimiento real (`orbit_slow` ≥40°, `spiral_in`, `push_in` rápido); con
   `drift` o un `push_in` suave el QA marca racha estática.
6. Si se puede reutilizar (un plano de ondas, un vaso que late), ponle un nombre general y una pose por variante.

## Estilos: 3D, 2.5D y 2D (F20). Tú decides beat a beat

Cada beat se ve en uno de tres estilos. **Eliges tú** el que mejor cuente esa línea; no se le pregunta al usuario. El objetivo es
la calidad y la retención: que cada imagen sea la más clara para lo que dice la voz y que el cambio de registro llegue cuando
cambia la idea, como un golpe de ritmo.

| Estilo | Clase de objeto | Va bien para | Va mal para |
|---|---|---|---|
| **3D** (la base) | `primitive`, `gltf` | Objetos y mecanismos: un chip, un planeta, un corte de garganta, una escalera de etapas. Cosas que giran, se abren o se encienden | Personas, escenas con mucha gente, momentos históricos, lugares con mucho detalle |
| **2.5D** (diorama) | `card`, `lamina` | **Personas y escenas**: una anécdota (Fermi comiendo con colegas), un grupo, un lugar histórico. Son láminas pintadas dentro del mundo 3D, con su luz, su niebla y el parallax de la cámara | Mecanismos que hay que ver por dentro o desde varios lados (las láminas no aguantan órbitas grandes) |
| **2D** (ilustración plana) | `plano` | **Ideas, esquemas y muchos casos a la vez**: una hipótesis en una pizarra, un mapa, una línea de tiempo, un campo de cien planetas, un antes y después. Ilustración vectorial a pantalla completa con capas en parallax | Objetos físicos concretos (ahí el 3D se lee mejor y es la marca del canal) |

Además, el overlay **`Cutaway`** mete 1–3 s de una ilustración `plano` dentro de un beat 3D (una ventana sobre la escena). Úsalo cuando
el objeto del beat no puede enseñar algo concreto que dice la voz («seis mil millones de planetas parecidos a la Tierra» sobre una galaxia).
Cuenta como `Insert` (máx. 3 entre los dos por video) y no va en el gancho.

**Cómo repartirlos** (criterio, no fórmula):
1. **El 3D es la base**: lo normal es 60–85 % de los beats en 3D. El validador falla si más del 50 % son `plano`.
2. **Cambia de estilo cuando cambia la idea**, no dentro de una misma secuencia: tres beats sobre el mismo mecanismo van en el mismo estilo.
   Un salto de estilo funciona como corte de ritmo: guárdalo para una anécdota, una hipótesis, un giro o un dato abrumador.
3. **No alternes beat a beat** (3D → 2D → 3D → 2D): parece otro video en cada plano. Lo habitual es 1–4 beats en 2D o 2.5D y 0–2 `Cutaway` por video.
4. **El gancho** casi siempre en 3D (es la imagen de marca y la que pide una acción antes de 1 s). Un 2D en el gancho solo si el tema es un esquema.
5. **Transiciones entre estilos**: `crossfade` o `glide`; un `cut` entre 3D y 2D se nota como salto de calidad.
6. Si el objeto de una línea es una persona o una escena, prefiere 2.5D a una metáfora 3D. Si es una idea abstracta con partes, prefiere 2D a un objeto 3D genérico (`esfera_flotante`, `caja_etiquetada`).

**Reglas técnicas de cada estilo** (las comprueba el validador):
- Un objeto `plano` va **siempre** con `"env": "plano"` (y ese entorno solo con planos). La `light` del beat tiñe el resplandor y el grade 2D.
- Los planos admiten **todos los presets de cámara** (se convierten a pan, zoom y parallax entre capas), las acciones genéricas (`lift`, `pulse`,
  `shake`…), las de cámara (`punch`, `camshake`) y las propias. **No admiten marcadores 3D** (`ring`, `arrow`, `halo`, `mark`…): usa overlays
  (`PulseRings`, `Arrow3D`, `Highlight`, que siguen las anclas del plano).
- Las láminas (`lamina`) son 3D a todos los efectos: entorno 3D, marcadores, `Callout3D`. Cámaras con parallax lateral (`dolly_side`, `drift`,
  `push_in`, `crane_up`) les sientan mejor que las órbitas grandes (`orbit_fast`, `spiral_in` ≥40°), que las ponen de canto.

**Crear láminas y planos que faltan** (cuentan en el máximo de 5 prefabs por video):
- **Lámina 2.5D**: en `studio/src/explainer/heroes/laminas_custom.ts`, con `buildLaminas` (`heroes/laminas.ts`). Pinta cada capa con Canvas2D
  (`fillPath` acepta paths SVG; `drawSeated` dibuja una persona sentada de perfil). Pon 4–8 láminas a distintas profundidades: un fondo grande que
  tape el entorno, el plano medio y un primer plano. Las partes que se mueven (un brazo, un bocadillo) van en láminas propias y se animan en `act`.
  Ejemplo: `comida_fermi`.
- **Plano 2D**: en `studio/src/explainer/flat/custom.tsx`, un `HeroDef` con `kind: "plano"` y `flat` (un componente SVG de 1080 x 1920). Usa
  `Depth` (capa a profundidad z: 0,2 el fondo, 0,5 el plano medio, 1 el sujeto, >1 el primer plano) y `Subject` (la capa que mueven las acciones
  genéricas), más `Backdrop`, `Glow`, `Stars`, `Person` y `Grain` de `flat/kit.tsx`. Las anclas son px del lienzo con la profundidad en z.
  **Composición**: lo importante entre y = 560 y 1380 (arriba van los subtítulos y abajo la interfaz de las apps), el sujeto hacia y ≈ 900, y el fondo
  más grande que el lienzo, para que el zoom no deje bordes. Paleta de `style.ts`. Ejemplos: `pizarra_hipotesis`, `planetas_campo`.
- **Calidad**: el mismo nivel que un prefab 3D. Siluetas reconocibles, 3+ capas de profundidad, luz de recorte o resplandor, y nada de clip-art. Mira el
  still en la galería (`tools/gallery.py <dir> plano_id:pose:plano:noche:push_in`) y comprueba la luma y la saturación: un plano demasiado oscuro
  o saturado hace fallar el QA igual que un 3D.

Duración: el video final debe durar **más de 60 s y menos de 120 s** (≈175–300 palabras), así que espera **10–20 beats**.
Con un guion largo, reparte objetos y entornos; el límite de cortes sigue siendo 3 por minuto.

## Acciones: que el video se sienta vivo (F13)

Un objeto que solo gira se siente como un modelo 3D con subtítulos. Un video vivo **muestra lo que la voz dice** en el
momento en que lo dice: cuando se nombra el ecuador, una línea roja rodea la Tierra; cuando sales despedido, la persona
sube; cuando algo explota, saltan chispas. Eso lo hacen las **acciones** (`actions` en cada beat, con `at` = la palabra
que las dispara). Catálogo completo en `catalog.json` → `actions` y `heroes.<id>.actions`.

**Cómo elegirlas.** Para cada beat, lee la frase y pregúntate: *¿qué hace o qué muestra esto que se pueda ver?* Busca el
verbo o el sustantivo fuerte y ponle una acción en esa palabra (`"at": "despedido"`). Prueba primero con las **propias del
objeto** (`heroes.<id>.actions`, p. ej. `ecuador` o `eje` en `planeta`, `inflamar` en `garganta_corte`, `llamarada` en
`sol`, `acelerar` en `corazon`); después, con las genéricas.

| Si la voz dice… | Usa |
|---|---|
| sale despedido, vuela, se va, se escapa, se dispersa | `fly` (con `dir`), o `lift` si solo se eleva |
| se eleva, levita, flota, sube | `lift` |
| se cae, se desploma, se desmaya | `topple` |
| tiembla, vibra, calor, miedo, impacto | `shake` |
| late, se activa, "aquí está la clave" | `pulse` |
| crece, se hincha, se expande / se encoge, se comprime | `scale` (`to` mayor o menor que 1) |
| gira, da vueltas | `spin` |
| salta, rebota | `hop` |
| rodea, alrededor, ecuador, órbita, barrera, límite | `ring` (o la propia `ecuador` en `planeta`); inclina con `tilt` si la cámara está baja |
| señala una parte, "mira aquí", sentido de una fuerza | `arrow` con `anchor` y `dir` |
| viaja, corre, velocidad, cae a toda prisa | `speed` (líneas de velocidad, con `dir`) |
| se calienta, se enciende, energía, atención | `halo` con `anchor` |
| choca, estalla, se rompe, chispa | `burst`; golpe en el suelo o sonido: `shockwave` |
| se agranda, crece, aumenta / se encoge, disminuye | `grow` / `shrink` (o `scale` con `to`) |
| aparece, nace, surge / desaparece, se esfuma | `appear` / `vanish` |
| se suelta, aterriza, se deja caer | `drop` (el objeto espera arriba hasta la palabra) |
| se balancea, oscila / se tambalea | `swing` / `wobble` |
| se aplasta, absorbe un golpe / se estira, es succionado | `squash` / `stretch` |
| da la vuelta, voltea / se gira hacia otro lado | `flip` / `turn` |
| da una vuelta alrededor, patrulla / serpentea, esquiva | `circle` / `zigzag` |
| respira, está tranquilo, flota quieto | `sway` (dura todo el beat) |
| se hunde, se sumerge | `sink` |
| parpadea, titila, alerta | `blink` |
| brilla, magia, descubrimiento | `sparkle` |
| láser, rayo de luz, señal que llega | `beam` |
| vapor, humo, burbujas, hierve | `steam` (`kind`: steam, bubbles o smoke) |
| ¿misterio?, ¡alerta!, correcto, falso, cariño | `mark` (`text`: ?, !, ✓, ✗, ♥) |
| algo que lo acompaña girando, satélite, luna | `orbiter` |
| llueve, nieva | `rain` (`kind`: rain o snow) |
| sonido, vibración, eco, ondas | `ripple` |
| ¡de repente!, el dato clave, una revelación | `punch` (zoom de golpe en la cámara) |
| terremoto, explosión, golpe fuerte | `camshake` (y `shake` en el objeto) |

**Reglas.**
1. **Al menos la mitad de los beats** llevan una acción (el pipeline falla si no) y **como mucho 3 por beat**. Los beats de
   gancho, mecanismo y giro son los que más las piden; el cierre puede ir sin ellas.
2. **Cada acción ilustra algo que se dice.** No decores sin sentido: si no hay un verbo o un sustantivo que mostrar, no pongas una.
3. **El `at` es la palabra exacta del beat** (la 1.ª vez que aparece). La acción sube durante `dur` frames (30 por defecto;
   40–50 para movimientos grandes como `fly` o `scale`) y se queda hasta el final del beat. `shake`, `pulse` y `hop` se
   resuelven solas y vuelven a su sitio.
4. **Varía:** no repitas la misma acción en beats seguidos ni pongas `lift`, `fly` y `speed` juntas siempre. Combina una que
   mueva el objeto con un marcador que lo explique (p. ej. `fly` + `speed`; `ring` + `halo`).
5. **Los overlays anclados siguen al objeto** cuando una acción lo mueve (suben con él).
6. **Suenan** (F15, `sfx_plan.py`): `fly`, `speed`, `flip`, `circle` y `zigzag`, un whoosh; `lift` y `grow`, un swish que sube;
   `drop`, `sink`, `shrink` y `vanish`, uno que baja; `shockwave`, `shake`, `topple`, `punch` y `camshake`, un impacto suave;
   `burst` y `chispa`, un zap eléctrico; `sparkle`, `halo` y `beam`, un shimmer; `ring`, `arrow`, `blink` y `mark`, un blip
   (`mark ✓` = ding, `✗` = buzz_no, `♥` = latido); `steam` = siseo (burbujeo con `kind: bubbles`); `rain` y `ripple`, una gota;
   `acelerar` = latido; `hop`, `pulse`, `appear` y `squash`, un pop. No añadas `sfx` a mano para lo mismo.
7. **Ojo con la cámara:** una acción que saca al objeto del cuadro (`fly` con `dist` grande) deja el plano vacío después. Úsala
   al final de la frase o combínala con un overlay que se quede. Un `ring` en un plano bajo se ve de canto: inclínalo (`tilt` 40–70).

**Acciones genéricas (mueven o deforman el objeto entero)**

| `type` | Cuándo | Campos |
|---|---|---|
| `lift` | Se eleva y flota: sale despedido hacia arriba, levita, se eleva, pierde peso, 'sube'. | `height`, `hold` |
| `topple` | Se desploma de lado como un árbol: se cae, se desmaya, se derrumba, pierde el equilibrio. | `dir` |
| `fly` | Sale volando y se aleja, acelerando: se escapa, se va, se dispersa, es lanzado, desaparece. | `dir`, `dist` |
| `shake` | Tiembla o vibra: terremoto, miedo, calor, impacto, motor, tensión. | `amp` |
| `pulse` | Un latido o golpe de tamaño: late, se acelera, se activa, 'aquí está la clave'. | `scale` |
| `scale` | Crece o se encoge y se queda así: se expande, se infla, se hincha, se reduce, se comprime. | `to` |
| `spin` | Da una vuelta rápida: gira, rueda, rota, da vueltas. | `turns` |
| `tilt` | Se inclina y se queda: se inclina, se ladea, cae hacia un lado sin llegar al suelo. | `deg` |
| `hop` | Salta una o varias veces: rebota, salta, brinca, se emociona. | `height`, `count` |
| `slide` | Se desplaza de lado: avanza, se mueve, se aparta, recorre. | `x`, `z` |
| `grow` | Se agranda y se queda grande: crece, se agranda, se infla, aumenta, se hace enorme. | `to` |
| `shrink` | Se encoge y se queda pequeño: se encoge, se reduce, disminuye, se hace diminuto, se comprime. | `to` |
| `appear` | Aparece de la nada con un pequeño rebote: surge, nace, aparece, se forma, se descubre. Antes de la palabra no se ve. | — |
| `vanish` | Desaparece encogiéndose y girando: se desvanece, desaparece, se esfuma, se evapora. | — |
| `drop` | Se suelta y cae con rebote desde arriba (hasta la palabra, se queda arriba): se suelta, cae, aterriza, se deja caer. | `height` |
| `swing` | Se balancea como un péndulo y se va calmando: oscila, se balancea, se mece, va y viene. | `deg`, `cycles` |
| `wobble` | Se tambalea y recupera el equilibrio: se tambalea, pierde el equilibrio, se agita, se desestabiliza. | `amp` |
| `squash` | Se aplasta un momento y vuelve: se aplasta, se comprime, rebota, absorbe un golpe, aterriza. | `amount` |
| `stretch` | Se estira en vertical y se queda así: se estira, se alarga, se espaguetiza, es succionado, se afina. | `to` |
| `flip` | Da una voltereta hacia atrás: se da la vuelta, voltea, se invierte, cambia de lado. | `turns` |
| `circle` | Describe un círculo en el suelo y vuelve: da una vuelta alrededor, orbita, recorre, patrulla. | `r`, `turns` |
| `zigzag` | Avanza en zigzag: serpentea, esquiva, zigzaguea, se mueve de forma irregular. | `amp`, `z` |
| `sway` | Se mece suavemente sin parar mientras dura el beat: respira, flota, está tranquilo, ondea. | `amp` |
| `sink` | Se hunde despacio por debajo del suelo: se hunde, se sumerge, se entierra, se pierde en el fondo. | `depth` |
| `turn` | Se gira hacia otro lado y se queda: se voltea, mira hacia otro lado, cambia de dirección. | `deg` |
| `blink` | Parpadea o destella varias veces: parpadea, se enciende y se apaga, titila, intermitente, alerta. | `count` |

**Marcadores 3D (añaden algo pegado al objeto)**

| `type` | Cuándo | Campos |
|---|---|---|
| `ring` | Una línea brillante que lo rodea: ecuador, órbita, alrededor, cinturón, límite, barrera. | `anchor`, `r`, `axis`, `tilt`, `color` |
| `arrow` | Una flecha 3D que señala o muestra el sentido de un movimiento o una fuerza. | `anchor`, `dir`, `len`, `color` |
| `speed` | Líneas de velocidad que cruzan el plano: viaja, corre, sale disparado, cae, a toda velocidad. | `dir`, `color` |
| `halo` | Un resplandor que late sobre una parte: calor, energía, atención, se enciende, se activa. | `anchor`, `size`, `color` |
| `burst` | Una explosión de chispas: choque, ruptura, estallido, contacto, chispa. | `anchor`, `color`, `speed` |
| `sparkle` | Destellos que titilan alrededor del objeto: brilla, es especial, magia, energía, hermoso, descubrimiento. | `color` |
| `beam` | Un haz de luz o un rayo recto desde una parte: láser, rayo, luz que llega, señal, apunta, emite. | `anchor`, `dir`, `len`, `color` |
| `steam` | Partículas que suben desde una parte: vapor, humo, burbujas, calor, hierve, respira, se evapora. | `kind`, `anchor` |
| `mark` | Un símbolo flotante sobre el objeto: ? (duda, misterio), ! (alerta, sorpresa), ✓ (correcto), ✗ (falso, error), ♥ (cariño, corazón). | `text`, `anchor` |
| `orbiter` | Una bolita que gira alrededor del objeto sin parar: satélite, luna, electrón, órbita, algo que lo acompaña. | `r`, `tilt`, `color` |
| `rain` | Lluvia o nieve que cae sobre el objeto: llueve, nieva, tormenta, gotas, cae agua. | `kind` |
| `ripple` | Ondas que salen una tras otra del suelo o de una parte: sonido, vibración, señal, latido, eco, ondas. | `anchor`, `color` |
| `shockwave` | Una onda que se expande desde el suelo o una parte: impacto, golpe, terremoto, sonido, aparece de golpe. | `anchor`, `color` |

**Efectos de cámara (un instante)**

| `type` | Cuándo | Campos |
|---|---|---|
| `punch` | Un golpe de zoom hacia dentro y vuelta: ¡impacto!, de repente, el dato clave, un giro, una revelación. | `amount` |
| `camshake` | La cámara tiembla un momento: terremoto, explosión, golpe, peligro, caída. | `amp` |

Ejemplo (`templates/examples/hielo-flota/05_story.json`): `{ "type": "scale", "at": "expande", "to": 1.25, "dur": 40 }` en la
frase «el agua se expande…» y `{ "type": "burst", "at": "revienta", "anchor": "top" }` en «…la botella revienta».

## Según la estructura del guion (cabecera `structure:`)

- `mito`: como siempre: tensión con `Pill`/`NoSymbol`, mecanismo con objeto y dato.
- `lista` (`[item]`): **un objeto distinto por ítem** y un overlay distinto en cada uno (`StatCallout`, `Thermometer`,
  `Speedometer`…); el último ítem, el más fuerte, con el plano más abierto.
- `versus` (`[versus]`): `VersusCard` o `BarCompare` en el primero; después, el objeto de A y el de B alternados, con la misma
  cámara en los dos para que se vean comparables.
- `historia` (`[story]`): `Timeline`, `TitlePlaque` o `ThoughtBubble` para lo que se creía o se descubrió; el objeto entra en `[mechanism]`.
- `cadena` (`[chain]`): `FlowArrow` o `IconFlow` y una cámara que siga el recorrido (`follow_anchor`, `dolly_side`); cada beat
  arranca donde acabó el anterior (mismo entorno si la cadena no cambia de lugar).

## Fidelidad y limpieza visual (F19)

- Cada beat lleva `"shows"`: una frase de lo que se ve («un portátil y una mesa con faders»). Si no coincide con lo que dice la voz, cambia el objeto.
- Un overlay no tapa al protagonista: `NoSymbol`, `BigWord` o un `Insert` grande no van encima de lo que se está explicando; rótulos de texto con `Pill`
  en `lower` o `bottom` (dos en el mismo hueco se pisan). `Callout3D` hacia el lado con espacio (uno cortado por el borde se ve mal).
- Objetos pequeños en pantalla: baja el `radius` o usa `tech_oscuro` (ciudades y casas distraen y empequeñecen).
- Antes del render final: `make_short.py stills` (mitad de beat + frame tras la última acción), mira la hoja y pasa el verificador.

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
     un lugar nuevo; `zoom_through` en el beat que sigue a una transición `zoom_through`. Más: `pull_out` revela el
     contexto, `orbit_fast`/`spiral_in`/`arc_over` enseñan el objeto desde otro ángulo, `crane_up`/`crane_down` suben o
     bajan, `dolly_side` recorre de lado, `whip_pan` da un golpe de energía al cambiar de idea, `dutch_tilt` inclina el
     horizonte para tensión y `follow_anchor` (con `camera.anchor`) lleva la mirada a una parte del objeto. **Dos beats
     seguidos con el mismo objeto no repiten preset de cámara.**
   - `dof` (desenfoque de fondo, px a 1080): primer plano 12–16, plano medio 8–12, plano abierto 2–6. Si no lo pones,
     se usa el del entorno.
5. **Cada beat `mechanism`, `item`, `versus` o `chain` = un objeto protagonista + al menos un overlay de dato** (`StatCallout`, `BarCompare`,
   `Gauge`, `Waveform`, `IntervalMarks`, `IconFlow`, `UICard`…). El número grande del paso va en un `StatCallout` o
   un `BarCompare`.
6. **Overlays**: `type` y campos según `catalog.json`. `at` = una palabra del `text` del beat (cuando se dice) o
   `"#n"`. Los anclados (`PulseRings`, `LightTrails`, `Callout3D`) pueden llevar `anchor` con un ancla del protagonista.
   Colores con tokens (`ui.cyan`, `warm.gold`, `ui.green`, `ui.red`). Textos de overlay cortos (≤4 palabras) y en el
   idioma del video.
   - gancho: `PulseRings`, `Highlight` o `Pill`; tensión: `Pill`, `WarningTag` o `NoSymbol`; segunda capa histórica:
     `TitlePlaque` o `Timeline`; giro: `Callout3D`, `Arrow3D` o `NoSymbol`; CTA: normalmente ninguno.
   - **Ayudas visuales** (F11): `Arrow3D` (flecha a una parte), `Highlight` (aro o marco), `ZoomLens` (lupa con un
     icono), `FlowArrow` (recorrido de un ancla `anchor` a otra `to`), `Timeline`, `Thermometer`, `VersusCard`,
     `Checklist`, `Steps`, `Equation`, `ScaleBar`, `TrendArrow`, `WarningTag`. Una guía anclada se combina con un panel;
     dos paneles en el mismo hueco se pisan (usa `slot`).
7. **Fuentes**: un beat con un overlay numérico lleva `sources` con las URL de `## Fuentes` del guion para ese dato.
8. **Transiciones** (`transition`, hacia el beat siguiente): `glide` por defecto, `zoom_through` para "entrar" en el
   objeto (pantalla, ventanilla, chip), `crossfade` entre ideas, `cut` solo al cambiar de lugar y **como mucho 3 por
   minuto**.
9. **Acciones** (sección de arriba): al menos la mitad de los beats, ancladas a la palabra que las dispara.
10c. **Sub-planos (F17):** en un beat largo (más de ~5 s) añade `shots`: `"shots": [{"at": "palabra", "camera": {"preset": "push_in", "rate": 0.5}}]`.
    A partir de esa palabra la cámara barre (9 frames, sin corte duro) a otro preset: úsalos para cambiar de escala o de ángulo
    cada 3–4 s sin cambiar de objeto. Máximo 3 por beat, separados al menos 1,5 s, y cada uno con un preset distinto del anterior.
    Cuentan como evento de ritmo. En objetos planos o frontales, alterna `orbit_slow` con `push_in`.
10e. **Insertos (F18):** un `Insert` es un corte de ~1 s con el fondo oscurecido, un icono y una cifra o frase de ≤18 letras
    (`{"type": "Insert", "at": "palabra", "text": "1600 SALTOS", "icon": "bolt", "hold": 36}`). Úsalo para enfatizar el dato más fuerte o romper un
    beat largo; máximo 3 por video, nunca en el gancho, `hold` entre 15 y 60 frames. Cuenta como evento de ritmo. Si lleva un número, el beat necesita `sources`.
10f. **Cama sonora (opcional):** `"music": true` y `"musicMood": "tech|calm|warm"` en `meta` añaden un colchón de acordes muy bajo (24 dB bajo la voz);
    por defecto no hay música. Si dudas, déjalo apagado.
10d. **Algo para ver dos veces (F17):** deja un detalle (una etiqueta, un número pequeño) que sale un segundo en un beat intermedio y solo se
    entiende al repetir el video; es lo que hace que el espectador vuelva.
10a. **Gancho y ritmo (F16, lo comprueba el validador):** el primer beat lleva una acción que empiece antes de 1 s (con `at` en la 1.ª o 2.ª palabra) y una cámara que no sea `drift`; en todo el video no pasan más de 3,5 s sin un cambio en pantalla (inicio de beat, acción u overlay): en los beats largos pon una acción o un overlay a mitad. Los overlays viven por encima del 70 % del alto (slots `top`…`bottom`): debajo están la descripción y los botones de las apps.
10b. **Cierre `bucle`:** pon `"tailS": 0.2` en `meta` (el video acaba casi sobre la última palabra) y haz que el último beat vuelva al entorno y al objeto del primero.
10. `sfx` a mano solo para lo que no tiene acción propia, **máximo 3 por video** y solo si refuerza el verbo que dice la voz:
    `rumble` (volcán, terremoto, cohete, derrumbe), `crack` (hielo, hueso, rotura), `clock_tick` (reloj, tiempo, péndulo),
    `heartbeat` (pulso sin objeto corazón), `drip`, `bubbles`, `sizzle`, `zap`, `ding`, `buzz_no`. Con `at` = la palabra exacta.
    Los whoosh, pops, ticks, riser e impact se añaden solos, y también los de las acciones.
    **El director de acentos** (`sfx_plan.py`) quita lo que recarga: un acento por cada 3 s como máximo, 1,2 s entre acentos, ninguno
    pegado (0,45 s) a otro sonido, y el mismo no se repite antes de 4 s. Los pedidos a mano tienen prioridad. En el plan queda
    marcado «omitido» en `08_sfx_plan.json`. Los acentos salen entre 3 y 7 dB más bajos que los de estructura y la mezcla sigue
    a −14 LUFS: no subas la mezcla ni pidas sonidos de relleno.

Al terminar, la validación es automática: `calculateMetadata` cruza el story.json con el catálogo y falla con el
motivo exacto (id inexistente, pose que no existe, `at` que no es una palabra del beat…).

Ejemplo vigente de un video de 71 s con gancho, ritmo, sub-planos y cierre en bucle: `templates/examples/bluetooth-wifi/05_story.json` (con su
`02_SCRIPT.md` y `04_words.json`). El que sigue es el formato original de 54 s.

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
