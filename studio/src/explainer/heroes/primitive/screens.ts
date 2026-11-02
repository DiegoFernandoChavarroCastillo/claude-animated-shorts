// Pantallas genéricas de dispositivo (sin marcas ni logos, plan §3.9): solo iconos y cifras, sin palabras, para que
// sirvan igual en español e inglés. Se pintan una vez por pose en un canvas.
import { PALETTE } from "../../style";

type G = CanvasRenderingContext2D;
const FONT = "Montserrat, 'Plus Jakarta Sans', sans-serif";

export const bgGrad = (g: G, w: number, h: number) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, PALETTE.bg.indigo); gr.addColorStop(1, PALETTE.bg.night0);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
};
export const text = (g: G, s: string, x: number, y: number, size: number, col: string = PALETTE.light.white, weight = 700) => {
  g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y);
};
export const rrect = (g: G, x: number, y: number, w: number, h: number, r: number, fill: string) => {
  g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill();
};
export const bars = (g: G, x: number, y: number, w: number, h: number, n: number, on: number, col: string, off: string = PALETTE.ui.track) => {
  const bw = w / (n * 1.5 - 0.5);
  for (let i = 0; i < n; i++) { const bh = h * (0.35 + (0.65 * i) / (n - 1)); rrect(g, x + i * bw * 1.5, y + h - bh, bw, bh, bw * 0.3, i < on ? col : off); }
};
const glow = (g: G, col: string, blur: number, fn: () => void) => { g.save(); g.shadowColor = col; g.shadowBlur = blur; fn(); g.restore(); };

/** pantalla de teléfono (w x h) para cada pose */
export const phoneScreen = (pose: string) => (g: G, w: number, h: number) => {
  bgGrad(g, w, h);
  // barra de estado: hora, cobertura y batería
  text(g, "22:47", 70, 44, 26, PALETTE.light.white, 600);
  bars(g, w - 150, 30, 46, 26, 4, pose === "sin_senal" ? 0 : 4, PALETTE.light.white, "rgba(255,255,255,0.25)");
  rrect(g, w - 92, 32, 50, 22, 6, "rgba(255,255,255,0.3)"); rrect(g, w - 90, 34, pose === "metricas" ? 44 : 30, 18, 4, PALETTE.light.white);
  const cx = w / 2;
  if (pose === "senal" || pose === "sin_senal") {
    const ok = pose === "senal";
    glow(g, ok ? PALETTE.ui.cyan : "transparent", 30, () => bars(g, cx - 130, h * 0.3, 260, 300, 4, ok ? 4 : 1, ok ? PALETTE.ui.cyan : PALETTE.mid.lavender, "rgba(255,255,255,0.12)"));
    if (!ok) {
      g.strokeStyle = PALETTE.ui.red; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.moveTo(cx - 150, h * 0.3 - 10); g.lineTo(cx + 150, h * 0.3 + 310); g.stroke();
      for (let k = 0; k < 8; k++) { g.globalAlpha = 0.2 + k * 0.1; const a = (k / 8) * Math.PI * 2; rrect(g, cx + Math.cos(a) * 40 - 7, h * 0.72 + Math.sin(a) * 40 - 7, 14, 14, 7, PALETTE.light.white); }
      g.globalAlpha = 1;
    } else text(g, "5G", cx, h * 0.72, 64, PALETTE.ui.cyan, 800);
  } else if (pose === "bloqueo") {
    text(g, "22:47", cx, h * 0.27, 150, PALETTE.light.white, 700);
    rrect(g, cx - 120, h * 0.36, 240, 14, 7, "rgba(255,255,255,0.35)");
    // candado
    g.strokeStyle = PALETTE.light.white; g.lineWidth = 12; g.beginPath(); g.arc(cx, h * 0.09, 22, Math.PI, 0); g.stroke();
    rrect(g, cx - 32, h * 0.09, 64, 48, 10, PALETTE.light.white);
    for (let k = 0; k < 2; k++) { rrect(g, 40, h * (0.55 + k * 0.12), w - 80, h * 0.1, 26, "rgba(255,255,255,0.12)"); rrect(g, 70, h * (0.575 + k * 0.12), 60, 60, 16, k ? PALETTE.ui.green : PALETTE.ui.selection); rrect(g, 150, h * (0.585 + k * 0.12), 240, 16, 8, "rgba(255,255,255,0.5)"); rrect(g, 150, h * (0.615 + k * 0.12), 170, 14, 7, "rgba(255,255,255,0.25)"); }
  } else if (pose === "metricas") {
    // batería grande en barras verticales, de rojo a verde, y porcentaje
    const cols = [PALETTE.ui.red, PALETTE.warm.sunset, PALETTE.warm.gold, PALETTE.ui.green];
    rrect(g, cx - 120, h * 0.18, 240, h * 0.52, 30, "rgba(255,255,255,0.08)");
    for (let k = 0; k < 10; k++) glow(g, cols[Math.min(3, Math.floor(k / 2.6))], 14, () => rrect(g, cx - 96, h * 0.66 - k * h * 0.047, 192, h * 0.034, 10, cols[Math.min(3, Math.floor(k / 2.6))]));
    text(g, "98 %", cx, h * 0.8, 96, PALETTE.ui.green, 800);
  } else {
    // control: rejilla de botones redondos (sin etiquetas): avión, wifi, bluetooth, datos, linterna, luna
    const tiles = [[PALETTE.warm.sunset, "plane"], [PALETTE.ui.selection, "wifi"], [PALETTE.ui.selection, "bt"], [PALETTE.ui.green, "data"], ["rgba(255,255,255,0.18)", "torch"], ["rgba(255,255,255,0.18)", "moon"]];
    rrect(g, 40, h * 0.18, w - 80, h * 0.44, 46, "rgba(255,255,255,0.08)");
    tiles.forEach(([c, icon], i) => {
      const x = cx + (i % 2 ? 95 : -95), y = h * 0.26 + Math.floor(i / 2) * h * 0.13;
      g.fillStyle = c; g.beginPath(); g.arc(x, y, 62, 0, Math.PI * 2); g.fill();
      g.strokeStyle = PALETTE.light.white; g.fillStyle = PALETTE.light.white; g.lineWidth = 8; g.lineCap = "round";
      if (icon === "plane") { g.beginPath(); g.moveTo(x - 30, y + 6); g.lineTo(x + 30, y - 6); g.moveTo(x - 4, y - 26); g.lineTo(x + 8, y + 24); g.stroke(); }
      else if (icon === "wifi") for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x, y + 22, 12 + k * 14, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); }
      else if (icon === "bt") { g.beginPath(); g.moveTo(x - 14, y - 14); g.lineTo(x + 14, y + 12); g.lineTo(x, y + 26); g.lineTo(x, y - 26); g.lineTo(x + 14, y - 12); g.lineTo(x - 14, y + 14); g.stroke(); }
      else if (icon === "data") bars(g, x - 26, y - 22, 52, 44, 4, 4, PALETTE.light.white);
      else if (icon === "torch") { rrect(g, x - 10, y - 10, 20, 36, 4, PALETTE.light.white); rrect(g, x - 18, y - 26, 36, 18, 4, PALETTE.light.white); }
      else { g.beginPath(); g.arc(x, y, 24, 0.6, Math.PI * 2 - 0.6); g.stroke(); }
    });
    rrect(g, 40, h * 0.66, w - 80, h * 0.08, 30, "rgba(255,255,255,0.08)");
    rrect(g, 70, h * 0.69, (w - 140) * 0.6, 18, 9, PALETTE.light.white);
  }
  rrect(g, cx - 90, h - 30, 180, 8, 4, "rgba(255,255,255,0.6)");
};

/** pantalla de reloj (cuadrada, w x h) para cada pose */
export const watchScreen = (pose: string) => (g: G, w: number, h: number) => {
  g.fillStyle = PALETTE.bg.night0; g.fillRect(0, 0, w, h);
  const cx = w / 2;
  if (pose === "hora") {
    text(g, "2:47", cx, h * 0.55, 150, PALETTE.light.white, 600);
    g.fillStyle = PALETTE.mid.lavender; g.beginPath(); g.arc(cx, h * 0.24, 20, 0, Math.PI * 2); g.fill();
  } else if (pose === "sueno") {
    text(g, "7 h 32", cx, h * 0.22, 80, PALETTE.light.white, 800);
    // hipnograma: bloques a cuatro alturas (despierto, REM, ligero, profundo)
    const cols = [PALETTE.warm.sunset, PALETTE.ui.cyan, PALETTE.mid.lavender, PALETTE.ui.selection];
    let s = 3; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    for (let x = 40; x < w - 40; x += 22) { const lv = Math.floor(r() * 4); glow(g, cols[lv], 10, () => rrect(g, x, h * 0.42 + lv * h * 0.11, 18, h * 0.08, 5, cols[lv])); }
  } else {
    // pulso: corazón, ppm y onda
    g.fillStyle = PALETTE.ui.red; g.beginPath();
    const hx = cx - 110, hy = h * 0.26;
    g.moveTo(hx, hy + 26); g.bezierCurveTo(hx - 50, hy - 4, hx - 26, hy - 44, hx, hy - 16); g.bezierCurveTo(hx + 26, hy - 44, hx + 50, hy - 4, hx, hy + 26); g.fill();
    text(g, "62", cx + 30, h * 0.27, 110, PALETTE.light.white, 800);
    g.strokeStyle = PALETTE.ui.green; g.lineWidth = 9; g.lineJoin = "round"; g.beginPath();
    for (let x = 30; x <= w - 30; x += 6) { const u = ((x - 30) / (w - 60)) * 3, c = u % 1; const y = c > 0.4 && c < 0.46 ? -1 : c > 0.46 && c < 0.52 ? 0.55 : 0; g.lineTo(x, h * 0.68 + y * h * 0.18); }
    glow(g, PALETTE.ui.green, 16, () => g.stroke());
  }
};
