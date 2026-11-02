// Tiempos de palabra SINTÉTICOS (sin TTS) para pruebas, hasta que F5 genere words.json reales con la alineación.
// Ritmo del plan (§3.10): ~4 pal/s mientras se habla, pausas de 0,3–0,6 s entre frases y ~0,9 s antes del giro.
//   node scripts/fake_words.mjs story <story.json> <words.json>   -> words.json de un story.json
//   node scripts/fake_words.mjs captiontest                       -> src/explainer/dev/captiontest_{es,en}.json
import fs from "node:fs";
import path from "node:path";

const dur = (w) => 0.07 + 0.042 * w.replace(/[^\p{L}\p{N}]/gu, "").length; // ~0,28 s por palabra de 5 letras
const pauseAfter = (w) => (/[.?!…]["»”)]*$/.test(w) ? 0.45 : /[,;:]$/.test(w) ? 0.22 : 0.03);

/** segs = [{ beat, text, role? }] -> [{ w, start, end, beat }] */
export const fakeWords = (segs, t0 = 0.15) => {
  const out = [];
  let t = t0;
  segs.forEach((s, k) => {
    if (s.role === "twist") t += 0.5; // más silencio antes del giro (0,8–1,0 s en total)
    const ws = s.text.trim().split(/\s+/);
    ws.forEach((w, i) => {
      const d = dur(w);
      out.push({ w, start: +t.toFixed(3), end: +(t + d).toFixed(3), beat: s.beat });
      t += d + (i < ws.length - 1 ? pauseAfter(w) : 0);
    });
    if (k < segs.length - 1) t += 0.5; // pausa entre beats
  });
  return out;
};

const [mode, a, b] = process.argv.slice(2);
if (mode === "story") {
  const story = JSON.parse(fs.readFileSync(a, "utf8"));
  const words = fakeWords(story.beats.map((x) => ({ beat: x.id, text: x.text, role: x.role })));
  fs.writeFileSync(b, JSON.stringify(words, null, 1));
  const last = words[words.length - 1];
  console.log(`${words.length} palabras, ${last.end.toFixed(2)} s, ${(words.length / last.end).toFixed(2)} pal/s`);
} else if (mode === "captiontest") {
  const T = {
    es: { text: "¿Sabías que tu cerebro produce electricidad? Un electroencefalograma la mide desde fuera, con sensores en la piel. Cada neurona dispara pulsos diminutos, y juntas forman ondas.",
      keywords: [["electricidad?", "box"], ["electroencefalograma", "box"], ["ondas.", "accent"]] },
    en: { text: "Did you know your brain makes electricity? An electroencephalogram measures it from outside, using sensors on your skin. Each neuron fires tiny pulses, and together they form waves.",
      keywords: [["electricity?", "box"], ["electroencephalogram", "box"], ["waves.", "accent"]] },
  };
  const dir = path.resolve("src/explainer/dev");
  fs.mkdirSync(dir, { recursive: true });
  for (const [lang, t] of Object.entries(T)) {
    const words = fakeWords([{ beat: "b01", text: t.text }]);
    const keywords = t.keywords.map(([w, variant]) => ({ index: words.findIndex((x) => x.w === w), variant }));
    fs.writeFileSync(path.join(dir, `captiontest_${lang}.json`), JSON.stringify({ words, keywords }, null, 1));
    console.log(lang, words.length, "palabras", words[words.length - 1].end.toFixed(2), "s", keywords);
  }
}
