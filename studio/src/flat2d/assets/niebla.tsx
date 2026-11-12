// niebla · capa de ambiente: bancos de bruma horizontales que se deslizan despacio y funden el fondo con el suelo. `opts.y` fracción del alto donde se
// centra (0.62), `opts.a` densidad (0.5), `opts.color`.
import React from "react";
import { type AssetFC, opt } from "./common";

export const Niebla: AssetFC = ({ pal, t, seed, opts }) => {
  const y = opt(opts, "y", 0.62) * 178, a = opt(opts, "a", 0.5), c = opt(opts, "color", pal.wallLit), id = `nb${seed}`;
  return (
    <g>
      <defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={0.55} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient></defs>
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={((i * 37 + t * 0.03 * (i % 2 ? 1 : -1)) % 150 + 150) % 150 - 25} cy={y + (i - 1.5) * 7} rx={46} ry={9 + i * 2} fill={`url(#${id})`} opacity={a} />)}
    </g>
  );
};
