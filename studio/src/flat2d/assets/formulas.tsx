// formulas · fondo (ambiente): fórmulas matemáticas de olimpiada que flotan y suben despacio a distintas profundidades, con
// brillo suave (una pizarra infinita en el aire). Lienzo 100 × 178. opts.n número de fórmulas (14), opts.a opacidad (0.5).
import React from "react";
import { type AssetFC, hash, opt } from "./common";

const EQ = ["a² + b² = c²", "∑ 1/n² = π²/6", "x = (−b ± √Δ) / 2a", "∫₀¹ x² dx = 1/3", "aᵖ ≡ a (mod p)", "√2 ∉ ℚ", "e^(iπ) + 1 = 0",
  "f(x+y) = f(x) + f(y)", "n! > 2ⁿ", "∀ε > 0 ∃δ", "△ABC ~ △DEF", "lim 1/n = 0", "P(A∩B)", "x³ − 3x + 1"];

export const Formulas: AssetFC = ({ pal, t, seed, opts }) => {
  const n = Number(opt(opts, "n", 14)), a = Number(opt(opts, "a", 0.5));
  return (
    <g>
      {[...Array(n)].map((_, i) => {
        const d = 0.4 + hash(i + seed) * 0.6, x = 6 + hash(i * 2.3 + seed) * 70, y0 = hash(i * 4.1 + seed) * 190;
        const y = ((y0 - t * 0.12 * d) % 190 + 190) % 190 - 6, fs = 3 + d * 4;
        return (
          <text key={i} x={x} y={y} fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize={fs}
            fill={i % 3 ? pal.rim : pal.glow} opacity={a * d * (0.6 + 0.4 * Math.sin(t * 0.05 + i))}>{EQ[i % EQ.length]}</text>
        );
      })}
    </g>
  );
};
