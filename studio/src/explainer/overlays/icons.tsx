// Iconos de línea propios (genéricos, sin marcas), dibujados en una caja de 24 x 24.
import React from "react";

const P: Record<string, React.ReactNode> = {
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  sun: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></>,
  face: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2M9 9.5h.01M15 9.5h.01" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  signal: <path d="M4 20v-3M9 20v-6M14 20v-9M19 20V5" />,
  plane: <path d="M21 15.5l-8-4.5V4.5a1.5 1.5 0 0 0-3 0V11l-8 4.5v2l8-2.5v4l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-4l8 2.5z" />,
  chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" /></>,
  sensor: <><circle cx="12" cy="12" r="2.5" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" /></>,
  chart: <path d="M3 20h18M6 16l4-5 3 3 5-7" />,
  brain: <path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2.5 4.5A3 3 0 0 0 12 18V5.5A2.5 2.5 0 0 0 9 4.5zM15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2.5 4.5A3 3 0 0 1 12 18" />,
  drop: <path d="M12 3s6 6.7 6 11a6 6 0 0 1-12 0c0-4.3 6-11 6-11z" />,
  snow: <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  nose: <path d="M12 3c0 6-4 9-4 12a4 4 0 0 0 8 0c0-3-4-6-4-12zM8 15h-1.5M16 15h1.5" />,
  // ---- F11: iconos de ciencia y apoyo ----
  virus: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M5 5l2.5 2.5M16.5 16.5L19 19M19 5l-2.5 2.5M7.5 16.5L5 19" /></>,
  cell: <><circle cx="12" cy="12" r="9" /><circle cx="10" cy="11" r="3" /><path d="M16 15.5h.01M15.5 8.5h.01" /></>,
  atom: <><circle cx="12" cy="12" r="1.6" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></>,
  planet: <><circle cx="12" cy="12" r="5.5" /><ellipse cx="12" cy="12" rx="10.5" ry="3" transform="rotate(-20 12 12)" /></>,
  thermo: <><path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z" /><path d="M12 9v8" /></>,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  warning: <><path d="M12 3L2 20h20L12 3z" /><path d="M12 10v5M12 18h.01" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  flask: <><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3" /><path d="M7.5 15h9" /></>,
  leaf: <path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l7-7" />,
  dna: <path d="M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9M9 6.5h6M9 17.5h6" />,
  lungs: <path d="M12 4v8M12 8c-2 0-5 1-6 8-.5 3 1 4 3 3.5 2-.5 3-2 3-5V8M12 8c2 0 5 1 6 8 .5 3-1 4-3 3.5-2-.5-3-2-3-5" />,
  bone: <path d="M7.5 4.5a2.5 2.5 0 0 0-3 3 2.5 2.5 0 0 0 3 1.5l7.5 7.5a2.5 2.5 0 0 0 1.5 3 2.5 2.5 0 0 0 3-3 2.5 2.5 0 0 0-3-1.5L9 7.5A2.5 2.5 0 0 0 7.5 4.5z" />,
  magnet: <><path d="M5 3v8a7 7 0 0 0 14 0V3h-4v8a3 3 0 0 1-6 0V3H5z" /><path d="M5 7h4M15 7h4" /></>,
  wave: <path d="M2 12c2.5-7 4.5-7 7 0s4.5 7 7 0 3-5 6-3" />,
  rocket: <><path d="M12 2c3 3 4 7 3.5 12h-7C8 9 9 5 12 2z" /><circle cx="12" cy="9" r="1.6" /><path d="M8.5 14L5 17.5V20l3.5-2M15.5 14l3.5 3.5V20l-3.5-2M12 17v4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8L12 3z" />,
  fire: <path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.5-5.5-3.5-9-2 1-3 3-3.5 4.5-.5-2-1.5-3.5-3-4.5C8 9 5 11 5 15c0 4.2 3 7 7 7z" />,
  cloud: <path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 10a4 4 0 0 1-.5 8H7z" />,
  mountain: <path d="M2 20l7-12 4 6 2.5-4L22 20H2z" />,
  fish: <><path d="M2 12c3-5 8-6 12-4 2 1 3.5 2.5 4 4-.5 1.5-2 3-4 4-4 2-9 1-12-4zM18 12l4-4v8l-4-4z" /><path d="M7 11.5h.01" /></>,
  bug: <><ellipse cx="12" cy="14" rx="4.5" ry="6" /><path d="M12 8V5M9.5 5.5L8 3.5M14.5 5.5L16 3.5M7.5 12H3M7.5 16H3.5M16.5 12H21M16.5 16h4M12 8v12" /></>,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z" />,
  gear: <><circle cx="12" cy="12" r="3.2" /><circle cx="12" cy="12" r="6.5" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></>,
  scale: <path d="M12 3v18M6 21h12M4 7h16M4 7l-2.5 7a3.5 3.5 0 0 0 5 0L4 7zM20 7l-2.5 7a3.5 3.5 0 0 0 5 0L20 7z" />,
  book: <path d="M4 4.5A2 2 0 0 1 6 3h13v16H6a2 2 0 0 0-2 2V4.5zM6 19h13v2H6" />,
  hourglass: <path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />,
  pill: <><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="M8.5 8.5l7 7" /></>,
  cross: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />,
  sound: <path d="M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />,
};
export type IconName = keyof typeof P;
export const ICONS = Object.keys(P) as IconName[];

export const Icon: React.FC<{ name: string; size: number; color: string; stroke?: number }> = ({ name, size, color, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {P[name] ?? P.check}
  </svg>
);
