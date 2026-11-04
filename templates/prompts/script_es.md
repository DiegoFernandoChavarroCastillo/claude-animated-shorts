# Prompt: guion de un short explainer (español)

Escribes el guion de un short vertical de **más de 60 y menos de 120 segundos** (objetivo 70–100 s; es obligatorio para monetizar en YouTube, TikTok, Instagram y Facebook) que explica algo cotidiano con datos reales. La voz es
local (Kokoro), así que el texto se lee **tal cual**: escribe como se habla.

## Entrada

- El tema y el archivo `01_research.md` con los hechos. Cada dato ya tiene **al menos 2 fuentes**; usa solo esos datos.

## Gancho, estructura y cierre (F12)

Antes de escribir, el usuario elige **un tipo de gancho, una estructura y un cierre** (`SKILL.md`, paso 2). Los tres se
declaran en la cabecera del guion (`hook:`, `structure:`, `closing:`) y el validador comprueba que el guion tenga la
forma de cada uno. Catálogo con ejemplos y por qué funciona cada tipo: `templates/formulas.json`; la evidencia y sus
límites, en `docs/FORMULAS.md`. Si el usuario no eligió, usa `hook: mito`, `structure: mito` y el cierre que mejor encaje.

**Regla de oro del gancho: concreto y con pago.** Un gancho vago ("esto te va a sorprender") no vale: nombra la cosa, el
dato o el momento. Y el video tiene que **contestar lo que el gancho promete** antes del giro, sin trampas.

### Tipos de gancho (≤12 palabras y en 2.ª persona, siempre)

| `hook:` | Nombre | Forma | Ejemplo |
|---|---|---|---|
| `pregunta` | Pregunta cotidiana | Pregunta en 2.ª persona sobre algo que el espectador ha vivido o visto. | ¿Te has preguntado por qué flota el hielo, si es agua sólida? |
| `mito` | Mito o creencia | Nombra lo que el espectador cree o le dijeron, para desmentirlo en la tensión. | ¿Te dijeron que el cielo es azul porque refleja el mar? |
| `dato` | Dato imposible | Un dato concreto y verificable con su cifra, sobre algo del espectador, que suena increíble. | Al congelarse, el agua de tu botella crece un nueve por ciento. |
| `y_si` | ¿Y si…? | Una hipótesis de qué pasaría si algo cotidiano fuera distinto. | ¿Qué pasaría si el hielo se hundiera en tu vaso? |
| `escena` | Escena en curso | Un momento en presente, en 2.ª persona, ya empezado (sin introducción ni saludo). | Estás en la ducha y tus dedos parecen pasas. |
| `reto` | Apuesta o reto | Un reto directo al espectador: a que no sabes… | Apuesto a que no sabes por qué el atardecer es rojo. |
| `error` | Error común | Dice que el espectador lleva tiempo haciendo o creyendo algo mal. | Llevas años creyendo que el cielo es azul por el mar. |

### Estructuras (`structure:`; por defecto `mito`)

| `structure:` | Roles en orden | Qué es |
|---|---|---|
| `mito` | [hook] → [tension] → [mechanism] → [layer2] → [twist] → [cta] | Desmiente una idea y explica cómo funciona de verdad (la fórmula original). Mínimos: mechanism ≥ 1 |
| `lista` | [hook] → [tension] → [item] → [layer2] → [twist] → [cta] | Entre tres y nueve hechos cortos del mismo tema, uno por línea, con el más fuerte al final (con 5 o 6, una frase corta cada uno). Mínimos: item ≥ 3 |
| `versus` | [hook] → [tension] → [versus] → [layer2] → [twist] → [cta] | Compara dos cosas punto por punto y cierra con el veredicto. Mínimos: versus ≥ 2 |
| `historia` | [hook] → [story] → [mechanism] → [layer2] → [twist] → [cta] | Cuenta qué se descubrió o qué pasó, y luego la ciencia que lo explica. Mínimos: story ≥ 2, mechanism ≥ 1 |
| `cadena` | [hook] → [tension] → [chain] → [layer2] → [twist] → [cta] | Una cosa provoca la siguiente, que provoca la siguiente, hasta el resultado que ve el espectador. Mínimos: chain ≥ 3 |

Notas por rol:
- `[item]` (lista): una cosa por línea, de menos a más sorprendente. Abre cada una con "Primero", "Segundo"… (no con
  "uno", "dos", "tres": son números y piden fuente). Cada una con algo que se pueda ver.
- `[versus]`: cada línea compara un punto de A y de B con las mismas palabras para los dos lados. El giro da el veredicto.
- `[story]` (historia): hechos reales con fuente: qué se creía y qué se descubrió. `[mechanism]` explica después la ciencia.
- `[chain]` (cadena): cada línea arranca donde acabó la anterior ("Esa luz…", "Por eso…").
- El `[twist]` y el `[cta]` existen en todas las estructuras.

### Cierres (`closing:`; siempre en la línea `[cta]`)

| `closing:` | Nombre | Forma | Ejemplo |
|---|---|---|---|
| `pregunta` | Pregunta a los comentarios | Pregunta qué otro tema quiere ver el espectador y pide que lo comente. | ¿Qué otra rareza del agua quieres que te explique? Déjamela en los comentarios. |
| `envia` | Envíaselo a alguien | Señala a una persona concreta a la que le serviría saberlo. | Envíaselo a esa persona que se pasa horas en la ducha. |
| `sigue` | Sígueme con promesa | Pide seguir y promete un tema concreto, no un 'más contenido'. | Sígueme y mañana te cuento por qué el cielo es azul. |
| `bucle` | Vuelta al gancho | La última frase retoma una palabra o la imagen del gancho, para cerrar el círculo y que el video se repita bien. | Así que cuando veas ese atardecer, recuerda que el azul sigue ahí, solo que lejos. |
| `reto_casa` | Pruébalo hoy | Una acción pequeña que el espectador puede hacer hoy para comprobarlo. | Pruébalo esta noche en la ducha y cuéntame qué notas. |

## Estructura `mito` (la original, medida en las referencias)

| Beat | Rol | Tiempo aprox. | Qué hace |
|---|---|---|---|
| 1 | `[hook]` gancho | 0–4 s | Pregunta sobre algo cotidiano o afirmación sorprendente, **en 2.ª persona** ("te", "tu", "¿sabías…?"), **≤12 palabras**. |
| 2 | `[tension]` tensión | 4–14 s | El mito o la duda, y su desmentido. O un "pero ¿cómo…?". |
| 3 | `[mechanism]` mecanismo | 14–65 s | 2–4 pasos (una línea por paso). Cada paso tiene algo que se pueda **ver** y al menos uno lleva un **número grande con fuente**. |
| 4 | `[layer2]` segunda capa | 65–80 s | "Y aquí se pone interesante…": un dato extra, o una anécdota histórica o cultural real. Opcional. |
| 5 | `[twist]` giro | 80–90 s | Una frase que reencuadra todo: "no es para X: es para Y". |
| 6 | `[cta]` llamada a la acción | últimos 4–6 s | Pregunta para comentarios, "envíaselo a…" o "sígueme". |

## Reglas

1. **175–300 palabras** en total (apunta a ~220–250 ≈ 85–95 s). Ritmo real de la voz: ~2,6 palabras/s contando las pausas, así que
   175 palabras ≈ 67 s y 300 ≈ 115 s. **El video final debe durar más de 60 s y menos de 120 s**: el QA lo exige. Con más tiempo,
   añade pasos al mecanismo/cadena/lista (más líneas, cada una con algo que se vea), no frases largas ni relleno.
2. **Una idea por frase** y **ninguna frase de más de 22 palabras**.
3. **Números en palabras** ("nueve por ciento", "novecientos diecisiete"), como se dicen. Cada número del guion lleva
   una línea en `## Fuentes` que lo repite tal cual, seguido de la URL.
4. No describas lo que ya se ve en pantalla ("como ves aquí…"). La imagen acompaña; la voz explica.
5. Nada de relleno ni de "¡hola!": la primera palabra ya es el gancho.
6. Nada inventado: si un dato no está en `01_research.md` con fuente, no va.
7. Un tono cercano y concreto, de tú a tú.
8. **Evita juntar dos sonidos "ll"/"y" seguidos** entre palabras: una palabra que termina en "lla", "llo", "ya",
   "yo"… seguida de otra que empieza por "ll" o "y" + vocal ("una botella llena", "la calle llena", "su playa ya…").
   La voz alarga la primera palabra y hace una pausa como si hubiera una coma ("botella, llena"). Reescribe para
   separarlas: "una botella con agua", "la calle repleta". El validador lo marca como error.

## Formato de salida: `02_SCRIPT.md`

```markdown
# Título
lang: es
hook: <tipo de gancho>
structure: <estructura>
closing: <tipo de cierre>

## Guion
[hook] …
[tension] …
[mechanism] …
[mechanism] …
[layer2] …
[twist] …
[cta] …

## Fuentes
- <número tal como aparece en el guion> (qué es): <URL>
- (sin número) <dato sin cifra>: <URL>
```

Después de escribirlo, ejecuta `python pipeline\validate_script.py out\<id>\02_SCRIPT.md` y corrige hasta que diga
**PASA**. Si falla, el motivo dice exactamente qué cambiar.

## Tres ejemplos (originales; estudia la forma, no copies el contenido)
```markdown
# Por qué el hielo flota
lang: es

## Guion
[hook] ¿Te has preguntado por qué flota el hielo, si es agua sólida?
[tension] Casi todas las sustancias se encogen al congelarse, y su versión sólida se hunde. Con el agua pasa justo lo contrario.
[mechanism] Al congelarse, el agua se expande cerca de un nueve por ciento. Por eso una botella llena revienta en el congelador.
[mechanism] La culpa es de sus moléculas. En el hielo se ordenan en hexágonos que dejan huecos por dentro. Un litro de hielo pesa unos novecientos diecisiete gramos, y uno de agua, mil.
[layer2] Y aquí se pone interesante. El agua líquida es más densa a unos cuatro grados, así que esa agua baja al fondo de los lagos.
[twist] Por eso los lagos se congelan desde arriba. El hielo no hunde la vida: la protege, como una tapa contra el frío.
[cta] ¿Qué otra rareza del agua quieres que te explique? Déjamela en los comentarios.

## Fuentes
- nueve por ciento (expansión al congelarse): https://en.wikipedia.org/wiki/Properties_of_water
- novecientos diecisiete gramos por litro (densidad del hielo, 0,917 g/cm³): https://en.wikipedia.org/wiki/Ice
- mil gramos por litro (densidad del agua líquida): https://www.britannica.com/science/ice
- cuatro grados (densidad máxima del agua, 3,98 °C): https://en.wikipedia.org/wiki/Properties_of_water
```

```markdown
# Por qué el cielo es azul
lang: es

## Guion
[hook] ¿Te dijeron que el cielo es azul porque refleja el mar?
[tension] Es un mito muy extendido. El cielo también es azul sobre el desierto, lejos de cualquier océano.
[mechanism] La luz del sol parece blanca, pero mezcla todos los colores. Al chocar con las moléculas del aire, se dispersa en todas direcciones.
[mechanism] Y no se dispersa igual. La luz azul rebota unas cinco veces más que la roja. Por eso, mires donde mires, te llega azul.
[layer2] ¿Y por qué no es violeta, si el violeta se dispersa todavía más? Porque el sol emite menos violeta, y tus ojos son poco sensibles a ese color.
[twist] Al atardecer, la luz cruza mucho más aire y el azul se pierde por el camino. El cielo rojo no es otro cielo: es el mismo, visto de lado.
[cta] ¿Qué otro "porque sí" quieres que desmonte? Cuéntamelo en los comentarios.

## Fuentes
- cinco veces (dispersión de Rayleigh ∝ 1/λ⁴: (700/450)⁴ ≈ 5,8): https://en.wikipedia.org/wiki/Rayleigh_scattering
- (sin número) por qué no es violeta: https://en.wikipedia.org/wiki/Diffuse_sky_radiation
```

```markdown
# Por qué se arrugan los dedos en el agua
lang: es

## Guion
[hook] ¿Por qué se te arrugan los dedos después de un baño largo?
[tension] Casi todo el mundo cree que la piel absorbe agua y se hincha. Pero si fuera así, se arrugaría todo el cuerpo.
[mechanism] Solo se arrugan las yemas de los dedos y las plantas de los pies. Y tarda unos cinco minutos en empezar.
[mechanism] Lo provocan tus nervios. Al notar el agua, los vasos de las yemas se estrechan y la piel de encima se pliega.
[layer2] La prueba es curiosa. Si los nervios de un dedo están dañados, ese dedo no se arruga nunca, por mucho que lo mojes.
[twist] Y en un experimento, con los dedos arrugados la gente movió objetos mojados un doce por ciento más rápido. No es un fallo: es tracción.
[cta] ¿Conocías este truco de tu cuerpo? Envíaselo a esa persona que se pasa horas y horas en la ducha.

## Fuentes
- cinco minutos (inicio del arrugado): https://en.wikipedia.org/wiki/Water-immersion_wrinkling
- (sin número) nervios dañados, el dedo no se arruga: https://en.wikipedia.org/wiki/Water-immersion_wrinkling
- doce por ciento más rápido (Kareklas et al., 2013, Biology Letters): https://doi.org/10.1098/rsbl.2012.0999
```

Otros cuatro ejemplos completos, uno por estructura, con su gancho y cierre: `templates/examples/agua-rara-lista/` (`lista`, gancho `dato`, cierre `envia`), `agua-contra-hielo/` (`versus`, `error`, `sigue`), `dedos-historia/` (`historia`, `escena`, `reto_casa`) y `atardecer-cadena/` (`cadena`, `reto`, `bucle`). Léelos antes de escribir en una estructura que no sea `mito`.
