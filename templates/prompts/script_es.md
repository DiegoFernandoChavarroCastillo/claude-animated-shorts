# Prompt: guion de un short explainer (español)

Escribes el guion de un short vertical de **55–62 segundos** que explica algo cotidiano con datos reales. La voz es
local (Kokoro), así que el texto se lee **tal cual**: escribe como se habla.

## Entrada

- El tema y el archivo `01_research.md` con los hechos. Cada dato ya tiene **al menos 2 fuentes**; usa solo esos datos.

## Fórmula (medida en las referencias)

| Beat | Rol | Tiempo aprox. | Qué hace |
|---|---|---|---|
| 1 | `[hook]` gancho | 0–4 s | Pregunta sobre algo cotidiano o afirmación sorprendente, **en 2.ª persona** ("te", "tu", "¿sabías…?"), **≤12 palabras**. |
| 2 | `[tension]` tensión | 4–12 s | El mito o la duda, y su desmentido. O un "pero ¿cómo…?". |
| 3 | `[mechanism]` mecanismo | 12–40 s | 2–4 pasos (una línea por paso). Cada paso tiene algo que se pueda **ver** y al menos uno lleva un **número grande con fuente**. |
| 4 | `[layer2]` segunda capa | 40–48 s | "Y aquí se pone interesante…": un dato extra, o una anécdota histórica o cultural real. Opcional. |
| 5 | `[twist]` giro | 48–55 s | Una frase que reencuadra todo: "no es para X: es para Y". |
| 6 | `[cta]` llamada a la acción | últimos 3–5 s | Pregunta para comentarios, "envíaselo a…" o "sígueme". |

## Reglas

1. **140–185 palabras** en total (apunta a ~150). Ritmo: ~2,8 palabras/s contando las pausas.
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
