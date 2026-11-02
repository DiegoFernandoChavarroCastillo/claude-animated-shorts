// Galería de overlays (F3): todos en secuencia, 2 s cada uno, sobre bg.night1. Sirve de hoja de contactos y para
// comprobar que ninguno entra en la banda de subtítulos (12–30 % del alto).
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { PALETTE } from "./style";
import { useFontsReady } from "./fonts";
import { OverlayStage, H, W } from "./overlays/common";
import { OVERLAYS } from "./overlays/registry";

export const GALLERY_ITEM = 60;
const P: Record<string, Record<string, unknown>> = {
  StatCallout: { value: 300, suffix: " M", label: "receptores de olor", color: "warm.gold" },
  BarCompare: { items: [{ label: "Perro", value: 300 }, { label: "Tú", value: 6 }], unit: "millones de receptores" },
  Gauge: { value: 0.22, label: "Relajado", low: "calma", high: "estrés" },
  Waveform: { kind: "pulse", labels: ["pulso", "en reposo"] },
  IntervalMarks: { intervals: ["0,97 s", "1,02 s", "0,99 s"] },
  UICard: { title: "Fase de sueño", subtitle: "Profundo · 1 h 42 min", icon: "moon", progress: 0.68 },
  Pill: { text: "acelerómetro", color: "ui.green" },
  PhoneMock: { screen: "signal", text: "Buscando señal…" },
  WatchMock: { screen: "heart", value: 64 },
  LineBoard: { drawing: "hexagons", title: "red de hielo" },
  IconFlow: { steps: [{ label: "Mide", icon: "sensor" }, { label: "Analiza", icon: "chip" }, { label: "Estima", icon: "chart" }] },
  PulseRings: { point: [W / 2, 0.6 * H], color: "ui.cyan" },
  LightTrails: { point: [0.18 * W, 0.8 * H], to: [0.8 * W, 0.42 * H] },
  ScanRing: { icon: "face" },
  Callout3D: { point: [0.42 * W, 0.6 * H], text: "Sensor óptico" },
  NoSymbol: { icon: "eye", label: "no ve" },
  TitlePlaque: { title: "LA ODISEA", subtitle: "Homero · siglo VIII a. C." },
  ClockChip: { time: "23:00", icon: "moon" },
};
export const GALLERY_TYPES = Object.keys(OVERLAYS);
export const galleryFrames = () => GALLERY_TYPES.length * GALLERY_ITEM;

export const KitGallery: React.FC = () => {
  useFontsReady();
  return (
    <AbsoluteFill style={{ background: PALETTE.bg.night1 }}>
      <OverlayStage>
        {GALLERY_TYPES.map((t, i) => {
          const C = OVERLAYS[t].component;
          return (
            <Sequence key={t} from={i * GALLERY_ITEM} durationInFrames={GALLERY_ITEM} layout="none">
              <C dur={GALLERY_ITEM} lang="es" {...P[t]} />
            </Sequence>
          );
        })}
      </OverlayStage>
    </AbsoluteFill>
  );
};
