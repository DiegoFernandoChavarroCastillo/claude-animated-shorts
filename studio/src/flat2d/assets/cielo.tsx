// cielo · fondo lejano del kit (D123): el astro con su halo y la bruma del horizonte, sobre el degradado de cielo que pinta el tema.
// `opts.astro`: sol | luna | ninguno; `opts.x`, `opts.y` posición en el lienzo (0–100, 0–178); `opts.r` radio (9). `set` (acción propia): el astro baja hacia el horizonte.
import React from "react";
import { type AssetFC, opt } from "./common";
import { lerpHex } from "../palette";
import { Halo } from "./shade";

export const Cielo: AssetFC = ({ pal, t, seed, opts, p }) => {
  const astro = opt(opts, "astro", "sol"), x = opt(opts, "x", 68), r = opt(opts, "r", 9), y = opt(opts, "y", 52) + (p.set ?? 0) * 40, id = `ci${seed}`, hz = opt(opts, "horizonte", 106);
  return (
    <g>
      <defs><linearGradient id={`${id}z`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.glow} stopOpacity={0} /><stop offset="1" stopColor={pal.glow} stopOpacity={0.55} /></linearGradient></defs>
      <rect x={-30} y={hz - 34} width={160} height={34} fill={`url(#${id}z)`} />
      {astro !== "ninguno" ? <g>
        <Halo id={`${id}h`} cx={x} cy={y} r={r * 5.5} color={pal.glow} a={astro === "sol" ? 0.8 : 0.45} />
        <circle cx={x} cy={y} r={r * (1 + 0.012 * Math.sin(t * 0.05))} fill={astro === "sol" ? lerpHex(pal.glow, "#ffffff", 0.45) : lerpHex(pal.wallLit, "#ffffff", 0.35)} />
        {astro === "luna" ? [[-0.3, -0.2, 0.22], [0.25, 0.3, 0.16], [0.35, -0.35, 0.1]].map(([dx, dy, k], i) => <circle key={i} cx={x + dx * r} cy={y + dy * r} r={k * r} fill={lerpHex(pal.wallLit, pal.wall, 0.35)} opacity={0.5} />) : null}
      </g> : null}
    </g>
  );
};
