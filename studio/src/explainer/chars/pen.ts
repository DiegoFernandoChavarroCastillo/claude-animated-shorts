// API de dibujo `Pen` portada de templates/bridge/toon.ts (plan §4: "conservar la API de dibujo"). Cambio de estilo:
// sin contorno de tinta por defecto (ol = 0), rellenos con degradado suave y trazos de "pelo" pintados (R2).
export type P2 = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;

export const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

/** curva suave de a a b pasando cerca de k, como polilínea */
export const curve = (a: P2, k: P2, b: P2, n = 12): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); }
  return out;
};

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 0;
  ink = "#1D1C34";
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    if (close) g.closePath();
  }
  /** relleno plano (contorno solo si ol > 0) */
  poly(pts: P2[], fill: string | CanvasGradient | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = this.ink; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | CanvasGradient | null, rot = 0) { this.poly(ellPts(cx, cy, rx, ry, 0, 360, rot), fill); }
  stroke(pts: P2[], w: number, col: string) {
    const g = this.g; g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = col; g.lineWidth = w; g.stroke();
  }
  /** trazo que se estrecha de wa a wb (patas, brazos, cola) */
  taper(pts: P2[], wa: number, wb: number, fill: string | CanvasGradient) {
    const L: P2[] = [], R: P2[] = [], n = pts.length;
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const w = (wa + (wb - wa) * (i / (n - 1))) / 2;
      L.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]); R.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
    });
    const tip = pts[n - 1], base = pts[0];
    this.poly([...L, ...R.reverse()], fill);
    this.g.beginPath(); this.g.arc(tip[0], tip[1], wb / 2, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
    this.g.beginPath(); this.g.arc(base[0], base[1], wa / 2, 0, Math.PI * 2); this.g.fill();
  }
  dot(cx: number, cy: number, r: number, fill: string) { this.g.beginPath(); this.g.arc(cx, cy, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill(); }
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** degradado lineal a lo largo de la luz: lado iluminado = base, lado lejano = sombra (ángulo de canvas de donde viene la luz) */
  grad(pts: P2[], base: string, shadow: string, light: number, flat = 0.25) {
    const dx = Math.cos(light), dy = Math.sin(light);
    let lo = Infinity, hi = -Infinity, cx = 0, cy = 0;
    for (const [x, y] of pts) { const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); cx += x / pts.length; cy += y / pts.length; }
    const dc = cx * dx + cy * dy;
    const gr = this.g.createLinearGradient(cx + dx * (hi - dc), cy + dy * (hi - dc), cx + dx * (lo - dc), cy + dy * (lo - dc));
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    return gr;
  }
  /** trazos cortos de pelo o pincel dentro de la forma, orientados por `dir` (radianes), deterministas */
  fur(pts: P2[], cols: string[], n: number, len: number, dir: number, seed: number, w = 3, alpha = 0.35) {
    let s = seed * 7919 + 13; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    this.clip(pts, () => {
      const g = this.g; g.lineCap = "round"; g.lineWidth = w;
      for (let i = 0; i < n; i++) {
        const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = dir + (r() - 0.5) * 0.6, l = len * (0.6 + 0.8 * r());
        g.strokeStyle = cols[Math.floor(r() * cols.length)]; g.globalAlpha = alpha * (0.5 + r());
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      g.globalAlpha = 1;
    });
  }
}
