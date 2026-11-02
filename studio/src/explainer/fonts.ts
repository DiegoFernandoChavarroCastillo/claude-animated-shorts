// Carga de fuentes (Google Fonts vía @remotion/google-fonts). La familia de subtítulos sale de style.ts.
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { FONTS } from "./style";

const caption = FONTS.caption === "Figtree"
  ? loadFigtree("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] })
  : loadJakarta("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });
const display = loadMontserrat("normal", { weights: ["600", "700", "800"], subsets: ["latin", "latin-ext"] });

export const CAPTION_FAMILY = caption.fontFamily;
export const DISPLAY_FAMILY = display.fontFamily;

const ready = Promise.all([caption.waitUntilDone(), display.waitUntilDone()]);

/** true cuando las fuentes están cargadas; retiene el render hasta entonces (las medidas de texto dependen de ellas) */
export const useFontsReady = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    ready.then(() => { setOk(true); continueRender(handle); });
  }, [handle]);
  return ok;
};
