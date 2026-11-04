// Catálogo cerrado de overlays (§3.9): un `type` de story.json que no esté aquí falla en la validación.
import type React from "react";
import { StatCallout } from "./StatCallout";
import { BarCompare } from "./BarCompare";
import { Gauge } from "./Gauge";
import { Waveform } from "./Waveform";
import { IntervalMarks } from "./IntervalMarks";
import { UICard } from "./UICard";
import { Pill } from "./Pill";
import { PhoneMock } from "./PhoneMock";
import { WatchMock } from "./WatchMock";
import { LineBoard } from "./LineBoard";
import { IconFlow } from "./IconFlow";
import { PulseRings } from "./PulseRings";
import { LightTrails } from "./LightTrails";
import { ScanRing } from "./ScanRing";
import { Callout3D } from "./Callout3D";
import { NoSymbol } from "./NoSymbol";
import { TitlePlaque } from "./TitlePlaque";
import { ClockChip } from "./ClockChip";
import { Arrow3D, Highlight, ZoomLens, FlowArrow } from "./Guides";
import { Timeline, Thermometer, VersusCard, Checklist, Steps, Equation, ScaleBar, TrendArrow, WarningTag } from "./Panels";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Comp = React.FC<any>;
/** anchored = recibe `point` (ancla del objeto 3D proyectada a pantalla) */
export const OVERLAYS: Record<string, { component: Comp; anchored: boolean; numeric: boolean }> = {
  StatCallout: { component: StatCallout, anchored: false, numeric: true },
  BarCompare: { component: BarCompare, anchored: false, numeric: true },
  Gauge: { component: Gauge, anchored: false, numeric: false },
  Waveform: { component: Waveform, anchored: false, numeric: false },
  IntervalMarks: { component: IntervalMarks, anchored: false, numeric: true },
  UICard: { component: UICard, anchored: false, numeric: false },
  Pill: { component: Pill, anchored: false, numeric: false },
  PhoneMock: { component: PhoneMock, anchored: false, numeric: false },
  WatchMock: { component: WatchMock, anchored: false, numeric: true },
  LineBoard: { component: LineBoard, anchored: false, numeric: false },
  IconFlow: { component: IconFlow, anchored: false, numeric: false },
  PulseRings: { component: PulseRings, anchored: true, numeric: false },
  LightTrails: { component: LightTrails, anchored: true, numeric: false },
  ScanRing: { component: ScanRing, anchored: false, numeric: false },
  Callout3D: { component: Callout3D, anchored: true, numeric: false },
  NoSymbol: { component: NoSymbol, anchored: false, numeric: false },
  TitlePlaque: { component: TitlePlaque, anchored: false, numeric: false },
  ClockChip: { component: ClockChip, anchored: false, numeric: false },
  // F11: guías (ancladas) y paneles de apoyo
  Arrow3D: { component: Arrow3D, anchored: true, numeric: false },
  Highlight: { component: Highlight, anchored: true, numeric: false },
  ZoomLens: { component: ZoomLens, anchored: true, numeric: false },
  FlowArrow: { component: FlowArrow, anchored: true, numeric: false },
  Timeline: { component: Timeline, anchored: false, numeric: false },
  Thermometer: { component: Thermometer, anchored: false, numeric: true },
  VersusCard: { component: VersusCard, anchored: false, numeric: false },
  Checklist: { component: Checklist, anchored: false, numeric: false },
  Steps: { component: Steps, anchored: false, numeric: false },
  Equation: { component: Equation, anchored: false, numeric: false },
  ScaleBar: { component: ScaleBar, anchored: false, numeric: true },
  TrendArrow: { component: TrendArrow, anchored: false, numeric: true },
  WarningTag: { component: WarningTag, anchored: false, numeric: false },
};
