# Ganchos, estructuras y cierres (F12)

El catálogo está en [`templates/formulas.json`](../templates/formulas.json) (lo lee el validador) y los prompts de guion
lo explican con ejemplos. Aquí va **por qué** hay esas opciones y **qué tan sólida es la evidencia**. Antes de cada
video, Claude propone 3 de cada tipo, recomienda uno y el usuario elige (`SKILL.md`, paso 1b).

## Qué hay

| | Opciones |
|---|---|
| Gancho (10) | `pregunta`, `mito`, `dato`, `y_si`, `escena`, `reto`, `error`, `negativo`, `coste`, `contradiccion` (los tres últimos, de F17: más disruptivos, con conflicto en el primer segundo) |
| Estructura (5) | `mito` (la original), `lista`, `versus`, `historia`, `cadena` |
| Cierre (5) | `pregunta`, `envia`, `sigue`, `bucle`, `reto_casa` |

Cada tipo de gancho corresponde a un patrón que las guías de video corto repiten (afirmación atrevida o creencia
contradicha, pregunta, dato sorprendente, brecha de curiosidad, escena ya empezada, interpelación directa). Todos, además,
cumplen las reglas fijas de siempre: ≤12 palabras, 2.ª persona, nada inventado y cada cifra con fuente.

## Qué tan "comprobado" es (y qué no)

**Sólido (teoría y resultados publicados):**
- La curiosidad aparece cuando se percibe una **brecha entre lo que se sabe y lo que se quiere saber**: Loewenstein, G.
  (1994), «The psychology of curiosity: A review and reinterpretation», *Psychological Bulletin* 116(1), 75–98
  (<https://doi.org/10.1037/0033-2909.116.1.75>). Es el fundamento de los ganchos de pregunta, mito, reto y «¿y si…?».

**Una advertencia con estudio detrás (por eso el gancho debe ser concreto y tener pago):**
- Los estudios de titulares que abren una brecha de curiosidad dan **resultados mixtos**; funcionan peor cuando el titular
  es vago o el tema no le importa a la persona: «When curiosity gaps backfire: effects of headline concreteness on
  information selection decisions» (2024, <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11704130/>) y «You won't believe
  what's in this paper! Clickbait, relevance, and the curiosity gap» (<https://eprints.kingston.ac.uk/47719>). De ahí la
  regla de oro del prompt: **concreto, y el video contesta lo que el gancho promete.**

**Práctica común, no medida aquí:**
- Casi todas las guías de Shorts y TikTok coinciden en que **los primeros 1–3 segundos** deciden si alguien se queda y en
  que el texto en pantalla ayuda (muchos ven sin sonido). Las cifras de retención que circulan **no coinciden entre sí** y
  salen de blogs de marketing, no de documentación de las plataformas, así que no las usamos. Ejemplos de las guías
  consultadas: [JoinBrands](https://joinbrands.com/blog/youtube-shorts-best-practices/),
  [Subscribr](https://subscribr.ai/youtube-strategy/perfect-youtube-short-length-structure-hooks),
  [Opus](https://www.opus.pro/blog/tiktok-hook-formulas), [Stackmatix](https://stackmatix.com/blog/tiktok-creative-best-practices-2026).
- Las estructuras `lista`, `versus`, `historia` y `cadena` y los cierres son formatos habituales de divulgación en video
  corto. No hay un estudio que diga cuál rinde más para este canal.

**Conclusión honesta:** son patrones establecidos y razonables, no «el gancho que más retiene». Por eso Claude recomienda
con un motivo concreto para el tema (no con un porcentaje) y el usuario decide.

## Fórmulas nuevas: el catálogo no es un menú cerrado (D120, 10 nov)

Con 10 ganchos, 5 estructuras del explainer (2 en story-short) y 5 cierres, los videos salían de pocas combinaciones y se
parecían entre sí (los dos últimos de story-short: `escena` + `drama` + `bucle`). Desde D120:

- **Se pueden inventar** un tipo de gancho, una estructura o un cierre para un tema. Se describen en `## Fórmulas nuevas`
  (`- nombre: patrón`); una estructura nueva declara `beats: hook > … > twist > cta` (≥5 roles, en snake_case).
- **Comodín:** al proponer, al menos uno de los tres ganchos y (en el explainer) una de las tres estructuras son nuevos. En
  story-short la estructura la elige Claude y no debe repetir la de los dos últimos videos sin motivo.
- **Formatos** (`formulas.json` → `formatos`): 12 premisas para el video entero (¿qué pasaría si…?, cuenta atrás, eres la cosa,
  cambio de escala, juicio, misterio, diario…), como inspiración, combinables con cualquier estructura.
- **Qué sigue comprobando el validador:** a lo nuevo no se le comprueba la forma (no hay patrón), pero sí todo lo común:
  longitud, gancho ≤12 palabras en 2.ª persona, números con fuente, frases cortas, cierre sin despedida, perfil viral y
  dramatización; y en una estructura nueva, que el guion siga su `beats:` y que exista `twist` (la pausa larga y el riser
  del pipeline cuelgan de él). El crítico de guion recibe las fórmulas nuevas y las juzga por su propia promesa.
- **Del comodín al catálogo:** `tools/recent_formulas.py --nuevas` lista las fórmulas nuevas usadas y en cuántos videos;
  `tools/ingest_stats.py` las cruza con las estadísticas. Si una se repite y rinde, pasa a `formulas.json` con su patrón (y,
  si es un gancho, sus marcas en `validate_script.py`). Una fórmula nueva no está probada: se presenta así, sin venderla como mejor.

## Cómo comprobarlo con tus propios datos

1. Anota en la cabecera de cada `02_SCRIPT.md` el `hook:`, el `structure:` y el `closing:` (el skill ya lo hace).
2. En YouTube Studio / TikTok, mira la retención de los primeros segundos y la media de cada video.
3. Tras unos 10 videos, compara por tipo: `python tools/recent_formulas.py 20` lista lo usado en cada uno.
4. Si un tipo rinde claramente peor o mejor en tu audiencia, cámbialo en `elegir` de `formulas.json`.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Catálogo (nombre, forma, ejemplos, criterio de elección) | `templates/formulas.json` |
| Reglas de validación por tipo | `pipeline/validate_script.py` (`HOOK_MARKS`, `CLOSING_MARKS`, estructuras) |
| Pruebas | `pipeline/tests/test_validate_script.py` |
| Un guion de ejemplo por estructura | `templates/examples/{agua-rara-lista,agua-contra-hielo,dedos-historia,atardecer-cadena}/` |
| Qué usaron los últimos videos | `tools/recent_formulas.py` |
