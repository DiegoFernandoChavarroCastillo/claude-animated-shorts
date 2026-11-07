// Siluetas planas reutilizables (animal, jarra, árbol, persona) en una caja de 20 x 20 con el suelo abajo: sirven de objeto que pasa por el muro
// y de sombra que se proyecta en la pared (mismo dibujo, otro color y con desenfoque).
import React from "react";

export type Kind = "animal" | "jarra" | "arbol" | "persona";
export const KINDS: Kind[] = ["jarra", "animal", "arbol", "persona"];

const Shapes: Record<Kind, (c: string) => React.ReactNode> = {
  animal: (c) => (
    <g fill={c}>
      <ellipse cx={9} cy={11} rx={6.2} ry={3.3} />
      <path d="M12.6 9.6 L14.6 5.8 L17.6 6.9 L16.9 9.9 Z" />
      <ellipse cx={18.3} cy={7.6} rx={1.8} ry={1.1} />
      <path d="M14.6 6 L14.9 3.6 L16.2 5.7 Z" /><path d="M16 6 L17 3.8 L17.6 6.2 Z" />
      {[4.1, 6.6, 11.3, 13.5].map((x) => <rect key={x} x={x} y={12.6} width={1.2} height={6.9} rx={0.5} />)}
      <path d="M3.4 9.8 Q0.4 8.2 1 4.6" fill="none" stroke={c} strokeWidth={1.3} strokeLinecap="round" />
    </g>
  ),
  jarra: (c) => (
    <g fill={c}>
      <path d="M7.4 1.4 H12.6 V3 C16 4.6 16 10 13.4 15 C12.6 16.8 12.2 18 12 19.6 H8 C7.8 18 7.4 16.8 6.6 15 C4 10 4 4.6 7.4 3 Z" />
      <path d="M7.6 4.2 Q3 4 4.4 9.6 M12.4 4.2 Q17 4 15.6 9.6" fill="none" stroke={c} strokeWidth={1.1} strokeLinecap="round" />
    </g>
  ),
  arbol: (c) => (
    <g fill={c}>
      <rect x={9} y={10} width={2} height={9.8} />
      <circle cx={10} cy={7.2} r={4.3} /><circle cx={6.6} cy={9.4} r={3.1} /><circle cx={13.4} cy={9.4} r={3.1} /><circle cx={10} cy={4.4} r={3.1} />
    </g>
  ),
  persona: (c) => (
    <g fill={c}>
      <circle cx={10} cy={3.4} r={2} />
      <path d="M7.6 5.8 H12.4 L13 12.6 H7 Z" />
      <rect x={7.4} y={12.4} width={2.2} height={7.4} rx={0.8} /><rect x={10.4} y={12.4} width={2.2} height={7.4} rx={0.8} />
      <path d="M7.8 6.4 L5 2.2 M12.2 6.4 L15 2.2" fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  ),
};

/** silueta de tipo `kind` con su esquina arriba a la izquierda en (x, y), de lado 20·s; `flip` la mira a la izquierda */
export const Sil: React.FC<{ kind: Kind; fill: string; x: number; y: number; s: number; flip?: boolean }> = ({ kind, fill, x, y, s, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(${flip ? -20 : 0} 0)`}>{Shapes[kind](fill)}</g>
);
