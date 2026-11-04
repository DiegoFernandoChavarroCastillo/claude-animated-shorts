# Prompt: script for an explainer short (English)

You write the script for a **55–62 second** vertical short that explains something everyday with real facts. The voice
is local TTS (Kokoro) and reads the text **as written**: write the way people speak.

## Input

- The topic and `01_research.md` with the facts. Every fact already has **at least 2 sources**; use only those facts.

## Hook, structure and closing (F12)

Before writing, the user picks **one hook type, one structure and one closing** (`SKILL.md`, step 2). The three are
declared in the script header (`hook:`, `structure:`, `closing:`) and the validator checks that the script has the shape
of each one. Catalog with examples and why each works: `templates/formulas.json`; evidence and its limits:
`docs/FORMULAS.md`. If the user did not choose, use `hook: mito`, `structure: mito` and the closing that fits best.

**Golden rule of the hook: concrete, and it pays off.** A vague hook ("this will surprise you") doesn't count: name the
thing, the fact or the moment. And the video must **answer what the hook promises** before the twist, no tricks.

### Hook types (≤12 words and in the 2nd person, always)

| `hook:` | Name | Shape | Example |
|---|---|---|---|
| `pregunta` | Pregunta cotidiana | Pregunta en 2.ª persona sobre algo que el espectador ha vivido o visto. | Have you ever wondered why ice floats when it's solid water? |
| `mito` | Mito o creencia | Nombra lo que el espectador cree o le dijeron, para desmentirlo en la tensión. | Were you told the sky is blue because it reflects the ocean? |
| `dato` | Dato imposible | Un dato concreto y verificable con su cifra, sobre algo del espectador, que suena increíble. | Your water bottle grows nine percent when it freezes. |
| `y_si` | ¿Y si…? | Una hipótesis de qué pasaría si algo cotidiano fuera distinto. | What if ice sank in your glass? |
| `escena` | Escena en curso | Un momento en presente, en 2.ª persona, ya empezado (sin introducción ni saludo). | You're in the shower and your fingers turn into prunes. |
| `reto` | Apuesta o reto | Un reto directo al espectador: a que no sabes… | Bet you can't explain why the sunset is red. |
| `error` | Error común | Dice que el espectador lleva tiempo haciendo o creyendo algo mal. | You've been wrong about why the sky is blue. |

### Structures (`structure:`; default `mito`)

| `structure:` | Roles in order | What it is |
|---|---|---|
| `mito` | [hook] → [tension] → [mechanism] → [layer2] → [twist] → [cta] | Desmiente una idea y explica cómo funciona de verdad (la fórmula original). Mínimos: mechanism ≥ 1 |
| `lista` | [hook] → [tension] → [item] → [layer2] → [twist] → [cta] | Entre tres y seis hechos cortos del mismo tema, uno por línea, con el más fuerte al final (con 5 o 6, una frase corta cada uno). Mínimos: item ≥ 3 |
| `versus` | [hook] → [tension] → [versus] → [layer2] → [twist] → [cta] | Compara dos cosas punto por punto y cierra con el veredicto. Mínimos: versus ≥ 2 |
| `historia` | [hook] → [story] → [mechanism] → [layer2] → [twist] → [cta] | Cuenta qué se descubrió o qué pasó, y luego la ciencia que lo explica. Mínimos: story ≥ 2, mechanism ≥ 1 |
| `cadena` | [hook] → [tension] → [chain] → [layer2] → [twist] → [cta] | Una cosa provoca la siguiente, que provoca la siguiente, hasta el resultado que ve el espectador. Mínimos: chain ≥ 3 |

Role notes:
- `[item]` (list): one thing per line, from least to most surprising. Open each with "First", "Second"… (not "one",
  "two", "three": those are numbers and need a source). Each with something you can see.
- `[versus]`: each line compares one point of A and B in the same words for both sides. The twist gives the verdict.
- `[story]`: real, sourced facts: what was believed and what was found. `[mechanism]` then explains the science.
- `[chain]`: each line starts where the previous one ended ("That light…", "So…").
- `[twist]` and `[cta]` exist in every structure.

### Closings (`closing:`; always on the `[cta]` line)

| `closing:` | Name | Shape | Example |
|---|---|---|---|
| `pregunta` | Pregunta a los comentarios | Pregunta qué otro tema quiere ver el espectador y pide que lo comente. | What other water oddity should I explain? Drop it in the comments. |
| `envia` | Envíaselo a alguien | Señala a una persona concreta a la que le serviría saberlo. | Send this to the person who spends hours in the shower. |
| `sigue` | Sígueme con promesa | Pide seguir y promete un tema concreto, no un 'más contenido'. | Follow me and tomorrow I'll explain why the sky is blue. |
| `bucle` | Vuelta al gancho | La última frase retoma una palabra o la imagen del gancho, para cerrar el círculo y que el video se repita bien. | So when you see that sunset, remember the blue is still there, just far away. |
| `reto_casa` | Pruébalo hoy | Una acción pequeña que el espectador puede hacer hoy para comprobarlo. | Try it tonight in the shower and tell me what you notice. |

## Structure `mito` (the original, measured on the reference shorts)

| Beat | Role | Approx. time | What it does |
|---|---|---|---|
| 1 | `[hook]` | 0–4 s | A question about something everyday or a surprising claim, **in the 2nd person** ("you", "your"), **≤12 words**. |
| 2 | `[tension]` | 4–12 s | The myth or doubt, and its debunk. Or a "but how…?". |
| 3 | `[mechanism]` | 12–40 s | 2–4 steps (one line per step). Each step has something you can **see**, and at least one carries a **big number with a source**. |
| 4 | `[layer2]` | 40–48 s | "And here's where it gets interesting…": one extra fact, or a real historical or cultural anecdote. Optional. |
| 5 | `[twist]` | 48–55 s | One sentence that reframes everything: "it's not for X: it's for Y". |
| 6 | `[cta]` | last 3–5 s | A question for the comments, "send this to…" or "follow for more". |

## Rules

1. **140–185 words** in total (aim for ~150). Pace: ~2.8 words/s including pauses.
2. **One idea per sentence**, and **no sentence longer than 22 words**.
3. **Numbers in words** ("nine percent", "nine hundred seventeen"), the way they are said. Every number in the script
   gets a line in `## Sources` that repeats it exactly, followed by the URL.
4. Don't describe what is already on screen ("as you can see here…"). The picture supports; the voice explains.
5. No filler and no "hi guys": the first word is already the hook.
6. Nothing made up: if a fact is not in `01_research.md` with a source, it doesn't go in.
7. A close, concrete tone, talking to one person.

## Output format: `02_SCRIPT.md`

```markdown
# Title
lang: en
hook: <hook type>
structure: <structure>
closing: <closing type>

## Script
[hook] …
[tension] …
[mechanism] …
[mechanism] …
[layer2] …
[twist] …
[cta] …

## Sources
- <number exactly as written in the script> (what it is): <URL>
- (no number) <fact without a figure>: <URL>
```

After writing it, run `python pipeline\validate_script.py out\<id>\02_SCRIPT.md` and fix it until it says **PASA**
(pass). When it fails, the reason says exactly what to change.

## Three examples (original; study the shape, don't copy the content)
```markdown
# Why ice floats
lang: en

## Script
[hook] Have you ever wondered why ice floats, if it's just solid water?
[tension] Almost every substance shrinks when it freezes, and its solid form sinks. Water does exactly the opposite, and that changes everything.
[mechanism] When water freezes, it expands by about nine percent. That's why a full bottle of water can burst in the freezer.
[mechanism] Blame the molecules. In ice, they lock into hexagons that leave gaps inside. A liter of ice weighs about nine hundred seventeen grams, and a liter of water, a thousand.
[layer2] And here's where it gets interesting. Liquid water is densest at about four degrees, so that water sinks to the bottom of lakes.
[twist] That's why lakes freeze from the top down. Ice doesn't bury life: it protects it, like a lid against the cold.
[cta] What other weird thing about water should I explain next? Tell me in the comments below.

## Sources
- nine percent (expansion on freezing): https://en.wikipedia.org/wiki/Properties_of_water
- nine hundred seventeen grams per liter (density of ice, 0.917 g/cm³): https://en.wikipedia.org/wiki/Ice
- a thousand grams per liter (density of liquid water): https://www.britannica.com/science/ice
- four degrees (maximum density of water, 3.98 °C): https://en.wikipedia.org/wiki/Properties_of_water
```

```markdown
# Why the sky is blue
lang: en

## Script
[hook] Were you told the sky is blue because it reflects the sea?
[tension] It's a very common myth. The sky is just as blue over the desert, far away from any ocean.
[mechanism] Sunlight looks white, but it's a mix of every color. When it hits the molecules in the air, it scatters in every direction.
[mechanism] And it doesn't scatter evenly. Blue light bounces around about five times more than red. So wherever you look, blue reaches your eyes.
[layer2] So why isn't it violet, if violet scatters even more? Because the sun gives off less violet, and your eyes are not very sensitive to it.
[twist] At sunset, light crosses much more air, and the blue gets lost along the way. A red sky isn't a different sky: it's the same one, seen from the side.
[cta] What other "just because" should I take apart next? Tell me in the comments.

## Sources
- five times (Rayleigh scattering ∝ 1/λ⁴: (700/450)⁴ ≈ 5.8): https://en.wikipedia.org/wiki/Rayleigh_scattering
- (no number) why it isn't violet: https://en.wikipedia.org/wiki/Diffuse_sky_radiation
```

```markdown
# Why your fingers wrinkle in water
lang: en

## Script
[hook] Why do your fingers wrinkle after a long bath?
[tension] Most people think the skin soaks up water and swells. But if that were true, your whole body would wrinkle.
[mechanism] Only your fingertips and the soles of your feet do it. And it takes about five minutes to start.
[mechanism] Your nerves are behind it. When they sense water, the blood vessels in your fingertips narrow, and the skin above them folds.
[layer2] And here's where it gets interesting. The proof is strange. If the nerves in a finger are damaged, that finger never wrinkles, no matter how long it stays wet.
[twist] In one experiment, people with wrinkled fingers moved wet objects twelve percent faster. So it's not a glitch at all: it's your body adding grip.
[cta] Did you know your body did this? Send it to that one friend who spends hours in the shower.

## Sources
- five minutes (onset of wrinkling): https://en.wikipedia.org/wiki/Water-immersion_wrinkling
- (no number) damaged nerves, no wrinkling: https://en.wikipedia.org/wiki/Water-immersion_wrinkling
- twelve percent faster (Kareklas et al., 2013, Biology Letters): https://doi.org/10.1098/rsbl.2012.0999
```

Four more full examples, one per structure, with their hook and closing, are in Spanish in `templates/examples/agua-rara-lista/` (`lista`, hook `dato`, closing `envia`), `agua-contra-hielo/` (`versus`, `error`, `sigue`), `dedos-historia/` (`historia`, `escena`, `reto_casa`) and `atardecer-cadena/` (`cadena`, `reto`, `bucle`). Read them before writing in a structure other than `mito`; the shapes carry over to English.
