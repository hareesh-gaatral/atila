'use client';

/**
 * VendorManagementProcessFlow.tsx
 *
 * Animated 9-stage Vendor Management lifecycle flow for the ATILA
 * Procurement Platform. Self-contained: React + TypeScript + lucide-react
 * + SVG + CSS only (no animation libraries).
 *
 * Architecture mirrors the VendorOnboardingHero approach:
 *  - data-driven STAGES configuration
 *  - generated SVG track + travelling "vendor record" packet
 *  - one drift-free timeline; React state only changes on stage transitions
 *  - light/dark theme, controlled or uncontrolled
 *  - serpentine desktop layout, vertical mobile layout
 *  - prefers-reduced-motion support
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Activity,
  Archive,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Database,
  FileCheck2,
  ListChecks,
  Plug,
  ScanSearch,
  ShieldCheck,
  Tags,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import '@/styles/VendorManagementProcessFlow.css';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type VendorFlowTheme = 'light' | 'dark';

export interface VendorFlowStage {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  desc: string;
  icon: LucideIcon;
}

export interface VendorManagementProcessFlowProps {
  /** Explicit theme override from parent ('light' | 'dark'). If omitted, inherits parent/global theme. */
  theme?: VendorFlowTheme;
  className?: string;
}

interface Pt {
  x: number;
  y: number;
}

interface PathSegment {
  kind: 'line' | 'quad';
  from: Pt;
  ctrl?: Pt;
  to: Pt;
  length: number;
}

interface CardPlacement {
  left: string;
  top: string;
  width: string;
  align: 'center' | 'left';
}

interface NodeLabel {
  pt: Pt;
  anchor: 'start' | 'middle' | 'end';
  text: string;
}

interface LayoutModel {
  orientation: 'serpentine' | 'vertical';
  viewBox: { w: number; h: number };
  pathD: string;
  stations: Pt[];
  stationDistances: number[];
  totalLength: number;
  cards: CardPlacement[];
  ticks: Array<{ from: Pt; to: Pt }>;
  start: Pt;
  end: Pt;
  startLabel: NodeLabel;
  endLabel: NodeLabel;
}

interface FlowTiming {
  entry: number;
  dwell: number;
  move: number;
  exit: number;
  arrive: number[];
  completeAt: number;
  packetEnd: number;
  cycle: number;
}

type PhaseState =
  | { mode: 'idle' }
  | { mode: 'stage'; index: number }
  | { mode: 'complete' }
  | { mode: 'static' };

/* ------------------------------------------------------------------ */
/* Stage data (single source of truth)                                 */
/* ------------------------------------------------------------------ */

export const VENDOR_MANAGEMENT_STAGES: readonly VendorFlowStage[] = [
  {
    id: 'invitation',
    num: '01',
    title: 'Supplier Invitation & Registration',
    shortTitle: 'Registration',
    desc: 'Send portal invites to suppliers to fill in basic legal and contact details.',
    icon: UserPlus,
  },
  {
    id: 'profile',
    num: '02',
    title: 'Business & Bank Account Profile',
    shortTitle: 'Company Profile',
    desc: 'Capture GSTIN, PAN, cancelled cheque, and bank details for EFT payments.',
    icon: Building2,
  },
  {
    id: 'documents',
    num: '03',
    title: 'Statutory & Compliance Docs',
    shortTitle: 'Document Upload',
    desc: 'Upload GST certificate, MSME/Udyam, NDA, and ISO certifications.',
    icon: FileCheck2,
  },
  {
    id: 'validation',
    num: '04',
    title: 'GST & Bank Account Verification',
    shortTitle: 'Verification & KYC',
    desc: 'Verify GSTIN active status, run penny-drop checks, and flag duplicates.',
    icon: ScanSearch,
  },
  {
    id: 'approval',
    num: '05',
    title: 'Cross-Department Approval',
    shortTitle: 'Internal Approvals',
    desc: 'Review and sign-off by Procurement, Finance, and Quality teams.',
    icon: UsersRound,
  },
  {
    id: 'activation',
    num: '06',
    title: 'ERP Vendor Master Creation',
    shortTitle: 'ERP Activation',
    desc: 'Generate unique vendor codes and sync master records to your ERP.',
    icon: BadgeCheck,
  },
  {
    id: 'classification',
    num: '07',
    title: 'Sourcing Category & Payment Terms',
    shortTitle: 'Vendor Tagging',
    desc: 'Assign material groups, payment terms (Net 30/60), and MSME status.',
    icon: Tags,
  },
  {
    id: 'monitoring',
    num: '08',
    title: 'Performance & Document Renewal',
    shortTitle: 'Ongoing Review',
    desc: 'Track delivery quality and receive automated alerts before certificates expire.',
    icon: Activity,
  },
  {
    id: 'exit',
    num: '09',
    title: 'Vendor Offboarding & Archival',
    shortTitle: 'Offboarding',
    desc: 'Block inactive vendors from new POs, clear ledgers, and retain records.',
    icon: Archive,
  },
] as const;

const STAGES: readonly VendorFlowStage[] = VENDOR_MANAGEMENT_STAGES;

/* ------------------------------------------------------------------ */
/* Timing model — one full lifecycle cycle ≈ 15.4 s                    */
/* ------------------------------------------------------------------ */

const TIMING = {
  entry: 0.8, // smooth packet entry
  dwell: 1.8, // relaxed pause on each stage so users can comfortably read title and text
  move: 1.0,  // graceful eased transit between stages
  exit: 0.8,  // transit to completion node
  hold: 3.5,  // completion summary stays visible long enough to digest
  activeTail: 0.25,
} as const;

function buildTiming(count: number): FlowTiming {
  const arrive = Array.from(
    { length: count },
    (_, i) => TIMING.entry + i * (TIMING.dwell + TIMING.move),
  );
  const completeAt = arrive[count - 1] + TIMING.dwell;
  return {
    entry: TIMING.entry,
    dwell: TIMING.dwell,
    move: TIMING.move,
    exit: TIMING.exit,
    arrive,
    completeAt,
    packetEnd: completeAt + TIMING.exit,
    cycle: completeAt + TIMING.hold,
  };
}

/* ------------------------------------------------------------------ */
/* Easing + timeline math                                              */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
const easeOutCubic = (p: number): number => 1 - Math.pow(1 - p, 3);
const easeInOutCubic = (p: number): number =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/** Distance along the track + packet opacity for a given cycle time. */
function packetStateAt(
  t: number,
  timing: FlowTiming,
  distances: readonly number[],
  total: number,
): { d: number; opacity: number } {
  const last = distances.length - 1;

  if (t <= timing.entry) {
    return {
      d: easeOutCubic(clamp01(t / timing.entry)) * distances[0],
      opacity: clamp01(t / 0.22),
    };
  }

  if (t <= timing.completeAt) {
    const span = timing.dwell + timing.move;
    const idx = Math.min(last, Math.floor((t - timing.entry) / span));
    const local = t - timing.arrive[idx];
    if (local <= timing.dwell || idx === last) {
      return { d: distances[idx], opacity: 1 };
    }
    const p = easeInOutCubic(clamp01((local - timing.dwell) / timing.move));
    return { d: lerp(distances[idx], distances[idx + 1], p), opacity: 1 };
  }

  if (t <= timing.packetEnd) {
    const p = clamp01((t - timing.completeAt) / timing.exit);
    return {
      d: lerp(distances[last], total, easeInOutCubic(p)),
      opacity: p < 0.45 ? 1 : clamp01(1 - (p - 0.45) / 0.55),
    };
  }

  return { d: total, opacity: 0 };
}

/** Which phase the lifecycle is in at cycle time `t`. */
function phaseAt(t: number, timing: FlowTiming): PhaseState {
  if (t >= timing.completeAt) return { mode: 'complete' };
  for (let i = timing.arrive.length - 1; i >= 0; i -= 1) {
    if (t >= timing.arrive[i] && t < timing.arrive[i] + timing.dwell + TIMING.activeTail) {
      return { mode: 'stage', index: i };
    }
  }
  return { mode: 'idle' };
}

const phaseKeyOf = (p: PhaseState): string =>
  p.mode === 'stage' ? `stage-${p.index}` : p.mode;

/* ------------------------------------------------------------------ */
/* Geometry — generated from the STAGES array                          */
/* ------------------------------------------------------------------ */

const CORNER_RADIUS = 26;

function quadPoint(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const inv = 1 - t;
  return {
    x: inv * inv * a.x + 2 * inv * t * c.x + t * t * b.x,
    y: inv * inv * a.y + 2 * inv * t * c.y + t * t * b.y,
  };
}

function lineSegment(from: Pt, to: Pt): PathSegment {
  return { kind: 'line', from, to, length: Math.hypot(to.x - from.x, to.y - from.y) };
}

function quadSegment(from: Pt, ctrl: Pt, to: Pt): PathSegment {
  let length = 0;
  let prev = from;
  for (let i = 1; i <= 24; i += 1) {
    const p = quadPoint(from, ctrl, to, i / 24);
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return { kind: 'quad', from, ctrl, to, length };
}

function segmentsToPathD(start: Pt, segments: readonly PathSegment[]): string {
  return segments.reduce((d, s) => {
    if (s.kind === 'line') return `${d} L ${s.to.x} ${s.to.y}`;
    const c = s.ctrl ?? s.from;
    return `${d} Q ${c.x} ${c.y} ${s.to.x} ${s.to.y}`;
  }, `M ${start.x} ${start.y}`);
}

/** Desktop / tablet: compact 3×3 serpentine, logical order 01…09 preserved. */
function buildSerpentineLayout(stageCount: number): LayoutModel {
  const W = 1200;
  const H = 410;
  const colX = [220, 600, 980] as const;
  const rowY = [72, 205, 338] as const;
  const r = CORNER_RADIUS;

  // Grid cells in *business* order: 01→02→03 ↓ 04→05→06 (visually right→left) ↓ 07→08→09
  const grid: ReadonlyArray<readonly [number, number]> = [
    [0, 0], [1, 0], [2, 0],
    [2, 1], [1, 1], [0, 1],
    [0, 2], [1, 2], [2, 2],
  ];
  const stations: Pt[] = grid.slice(0, stageCount).map(([c, row]) => ({
    x: colX[c],
    y: rowY[row],
  }));

  const start: Pt = { x: 52, y: rowY[0] };
  const end: Pt = { x: 1148, y: rowY[2] };

  const segments: PathSegment[] = [];
  const stationDistances: number[] = new Array<number>(stageCount).fill(0);
  let acc = 0;
  const add = (s: PathSegment): void => {
    segments.push(s);
    acc += s.length;
  };
  const addQuadStation = (s: PathSegment, station: number): void => {
    segments.push(s);
    acc += s.length;
    stationDistances[station] = acc - s.length / 2; // arrival ≈ curve midpoint
  };

  add(lineSegment(start, stations[0]));
  stationDistances[0] = acc;
  add(lineSegment(stations[0], stations[1]));
  stationDistances[1] = acc;
  add(lineSegment(stations[1], { x: colX[2] - r, y: rowY[0] }));
  addQuadStation(
    quadSegment({ x: colX[2] - r, y: rowY[0] }, stations[2], { x: colX[2], y: rowY[0] + r }),
    2,
  );
  add(lineSegment({ x: colX[2], y: rowY[0] + r }, { x: colX[2], y: rowY[1] - r }));
  addQuadStation(
    quadSegment({ x: colX[2], y: rowY[1] - r }, stations[3], { x: colX[2] - r, y: rowY[1] }),
    3,
  );
  add(lineSegment({ x: colX[2] - r, y: rowY[1] }, stations[4]));
  stationDistances[4] = acc;
  add(lineSegment(stations[4], { x: colX[0] + r, y: rowY[1] }));
  addQuadStation(
    quadSegment({ x: colX[0] + r, y: rowY[1] }, stations[5], { x: colX[0], y: rowY[1] + r }),
    5,
  );
  add(lineSegment({ x: colX[0], y: rowY[1] + r }, { x: colX[0], y: rowY[2] - r }));
  addQuadStation(
    quadSegment({ x: colX[0], y: rowY[2] - r }, stations[6], { x: colX[0] + r, y: rowY[2] }),
    6,
  );
  add(lineSegment({ x: colX[0] + r, y: rowY[2] }, stations[7]));
  stationDistances[7] = acc;
  add(lineSegment(stations[7], stations[8]));
  stationDistances[8] = acc;
  add(lineSegment(stations[8], end));

  return {
    orientation: 'serpentine',
    viewBox: { w: W, h: H },
    pathD: segmentsToPathD(start, segments),
    stations,
    stationDistances,
    totalLength: acc,
    cards: stations.map((p) => ({
      left: `${(p.x / W) * 100}%`,
      top: `${(p.y / H) * 100}%`,
      width: '23%',
      align: 'center' as const,
    })),
    ticks: [],
    start,
    end,
    startLabel: { pt: { x: start.x, y: rowY[0] + 24 }, anchor: 'middle', text: 'INVITE' },
    endLabel: { pt: { x: end.x, y: rowY[2] + 24 }, anchor: 'middle', text: 'ARCHIVED' },
  };
}

/** Mobile: single vertical rail, cards to the right. */
function buildVerticalLayout(stageCount: number): LayoutModel {
  const W = 420;
  const railX = 56;
  const firstY = 86;
  const step = 132;
  const cardLeft = 96;
  const cardRight = 16;

  const stations: Pt[] = Array.from({ length: stageCount }, (_, i) => ({
    x: railX,
    y: firstY + i * step,
  }));
  const lastY = firstY + (stageCount - 1) * step;
  const start: Pt = { x: railX, y: firstY - 52 };
  const end: Pt = { x: railX, y: lastY + 52 };
  const H = end.y + 34;

  return {
    orientation: 'vertical',
    viewBox: { w: W, h: H },
    pathD: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
    stations,
    stationDistances: stations.map((p) => p.y - start.y),
    totalLength: end.y - start.y,
    cards: stations.map((p) => ({
      left: `${(cardLeft / W) * 100}%`,
      top: `${(p.y / H) * 100}%`,
      width: `${((W - cardLeft - cardRight) / W) * 100}%`,
      align: 'left' as const,
    })),
    ticks: stations.map((p) => ({
      from: { x: railX + 8, y: p.y },
      to: { x: cardLeft - 8, y: p.y },
    })),
    start,
    end,
    startLabel: { pt: { x: railX + 16, y: start.y + 3 }, anchor: 'start', text: 'INVITATION' },
    endLabel: { pt: { x: railX + 16, y: end.y + 3 }, anchor: 'start', text: 'ARCHIVED' },
  };
}

/* ------------------------------------------------------------------ */
/* Environment hooks                                                   */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent): void => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useIsCompact(): boolean {
  const [compact, setCompact] = useState<boolean>(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(max-width: 820px)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(max-width: 820px)');
    const onChange = (e: MediaQueryListEvent): void => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function VendorManagementProcessFlow({
  theme: themeProp,
  className,
}: VendorManagementProcessFlowProps) {
  /* ----- theme: inherited from parent prop / global Redux store / html.dark ----- */
  const reduxTheme = useAppSelector((state) => state.ui?.theme);
  const [htmlDark, setHtmlDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setHtmlDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setHtmlDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const currentTheme: VendorFlowTheme =
    themeProp || reduxTheme || (htmlDark ? 'dark' : 'light');

  /* ----- layout + timing ----- */
  const reduced = usePrefersReducedMotion();
  const compact = useIsCompact();
  const layout = useMemo<LayoutModel>(
    () => (compact ? buildVerticalLayout(STAGES.length) : buildSerpentineLayout(STAGES.length)),
    [compact],
  );
  const timing = useMemo<FlowTiming>(() => buildTiming(STAGES.length), []);

  const rawId = useId();
  const uid = useMemo(() => rawId.replace(/[^a-zA-Z0-9_-]/g, ''), [rawId]);

  /* ----- phase state: updated ONLY on stage transitions ----- */
  const [phase, setPhase] = useState<PhaseState>(reduced ? { mode: 'static' } : { mode: 'idle' });
  const phaseKeyRef = useRef<string>(phaseKeyOf(reduced ? { mode: 'static' } : { mode: 'idle' }));

  const trackRef = useRef<SVGPathElement | null>(null);
  const progressGlowRef = useRef<SVGPathElement | null>(null);
  const progressMainRef = useRef<SVGPathElement | null>(null);
  const packetRef = useRef<SVGGElement | null>(null);

  /* ----- animation engine (rAF writes DOM directly, no re-renders) ----- */
  useEffect(() => {
    const progressPaths = [progressGlowRef.current, progressMainRef.current];
    const total = layout.totalLength;

    progressPaths.forEach((p) => {
      if (!p) return;
      p.style.strokeDasharray = `${total}`;
      p.style.strokeDashoffset = reduced ? '0' : `${total}`;
    });

    if (reduced) {
      phaseKeyRef.current = 'static';
      setPhase({ mode: 'static' });
      if (packetRef.current) packetRef.current.style.opacity = '0';
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();

    const frame = (now: number): void => {
      const t = ((now - startedAt) / 1000) % timing.cycle; // drift-free loop

      const track = trackRef.current;
      const packet = packetRef.current;
      if (track && packet) {
        const { d, opacity } = packetStateAt(t, timing, layout.stationDistances, total);
        const point = track.getPointAtLength(d);
        packet.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
        packet.style.opacity = opacity.toFixed(3);
        const offset = Math.max(0, total - d).toFixed(2);
        progressPaths.forEach((p) => {
          if (p) p.style.strokeDashoffset = offset;
        });
      }

      const next = phaseAt(t, timing);
      const key = phaseKeyOf(next);
      if (key !== phaseKeyRef.current) {
        phaseKeyRef.current = key;
        setPhase(next);
      }
      frameId = window.requestAnimationFrame(frame);
    };

    frameId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(frameId);
  }, [layout, reduced, timing]);

  /* ----- derived render state ----- */
  const activeIndex = phase.mode === 'stage' ? phase.index : -1;
  const isComplete = phase.mode === 'complete';
  const isStatic = phase.mode === 'static';
  const doneCount = isComplete || isStatic ? STAGES.length : Math.max(activeIndex, 0);
  const stripFillPct = (isComplete || isStatic
    ? 1
    : Math.max(activeIndex, 0) / (STAGES.length - 1)) * 100;

  const rootClass = ['vmpf', className].filter(Boolean).join(' ');

  return (
    <section
      className={rootClass}
      data-theme={currentTheme}
      data-orient={layout.orientation}
      aria-label="Vendor Management lifecycle process flow"
    >
      <p className="vmpf-sr-only">
        Step-by-step supplier onboarding and vendor management lifecycle: portal registration,
        business and bank profile, statutory document collection, GST and penny-drop checks,
        cross-department approvals, ERP master creation, sourcing classification, ongoing reviews,
        and archival.
      </p>

      {/* ---------------- Header ---------------- */}
      <header className="vmpf-head">
        <div className="vmpf-head-copy">
          <p className="vmpf-eyebrow">
            <span className="vmpf-eyebrow-dot" aria-hidden="true" />
            PROCUREMENT OPERATIONS · VENDOR LIFECYCLE
          </p>
          <h2 className="vmpf-title">
            How Supplier Onboarding Works, <em>from Invite to Active ERP Master</em>
          </h2>
          <p className="vmpf-sub">
            A structured, step-by-step workflow that turns manual supplier paperwork into a verified, ERP-ready vendor master in days instead of weeks.
          </p>
          <ul className="vmpf-meta">
            <li><ListChecks size={13} aria-hidden="true" /> 9-step verified flow</li>
            <li><Database size={13} aria-hidden="true" /> Direct ERP synchronization</li>
            <li><ShieldCheck size={13} aria-hidden="true" /> GST & bank penny-drop check</li>
            <li><Plug size={13} aria-hidden="true" /> Full audit history</li>
          </ul>
        </div>
      </header>

      {/* ---------------- Process board ---------------- */}
      <div
        className="vmpf-board"
        data-complete={isComplete ? 'true' : 'false'}
        style={{ aspectRatio: `${layout.viewBox.w} / ${layout.viewBox.h}` }}
      >
        <svg
          className="vmpf-svg"
          viewBox={`0 0 ${layout.viewBox.w} ${layout.viewBox.h}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--vmpf-accent)" />
              <stop offset="100%" stopColor="var(--vmpf-teal)" />
            </linearGradient>
            <radialGradient id={`${uid}-core`} cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="var(--vmpf-accent-soft)" />
              <stop offset="100%" stopColor="var(--vmpf-accent-strong)" />
            </radialGradient>
          </defs>

          {/* muted base track */}
          <path ref={trackRef} className="vmpf-track-base" d={layout.pathD} />
          {/* illuminated progress trail (glow + crisp) */}
          <path ref={progressGlowRef} className="vmpf-track-glow" d={layout.pathD} />
          <path
            ref={progressMainRef}
            className="vmpf-track-progress"
            d={layout.pathD}
            stroke={`url(#${uid}-stroke)`}
          />

          {/* mobile rail ticks */}
          {layout.ticks.map((tick, i) => (
            <line
              key={`tick-${i}`}
              className="vmpf-track-tick"
              x1={tick.from.x}
              y1={tick.from.y}
              x2={tick.to.x}
              y2={tick.to.y}
            />
          ))}

          {/* lifecycle endpoints */}
          <g className="vmpf-node" transform={`translate(${layout.start.x} ${layout.start.y})`}>
            <circle r="4.6" />
            <circle className="vmpf-node-core" r="1.6" />
          </g>
          <g className="vmpf-node" transform={`translate(${layout.end.x} ${layout.end.y})`}>
            <circle r="4.6" />
            <circle className="vmpf-node-core" r="1.6" />
          </g>
          <text
            className="vmpf-node-label"
            x={layout.startLabel.pt.x}
            y={layout.startLabel.pt.y}
            textAnchor={layout.startLabel.anchor}
          >
            {layout.startLabel.text}
          </text>
          <text
            className="vmpf-node-label"
            x={layout.endLabel.pt.x}
            y={layout.endLabel.pt.y}
            textAnchor={layout.endLabel.anchor}
          >
            {layout.endLabel.text}
          </text>

          {/* station markers */}
          {layout.stations.map((p, i) => (
            <circle
              key={`station-${STAGES[i].id}`}
              className="vmpf-station"
              data-active={i === activeIndex ? 'true' : 'false'}
              cx={p.x}
              cy={p.y}
              r={layout.orientation === 'vertical' ? 5 : 3.5}
            />
          ))}

          {/* the travelling vendor record */}
          <g ref={packetRef} className="vmpf-packet" opacity="0">
            <circle className="vmpf-packet-halo" r="15" />
            <circle className="vmpf-packet-ring" r="10" />
            <circle className="vmpf-packet-core" r="9.5" fill={`url(#${uid}-core)`} />
            <text className="vmpf-packet-glyph" textAnchor="middle" dominantBaseline="central">
              V
            </text>
          </g>
        </svg>

        {/* stage cards — data-driven */}
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const pos = layout.cards[i];
          const isActive = i === activeIndex;
          const isDone = i < doneCount;
          return (
            <article
              key={stage.id}
              className="vmpf-card"
              data-active={isActive ? 'true' : 'false'}
              data-done={isDone ? 'true' : 'false'}
              title={stage.title}
              aria-label={`Stage ${stage.num}: ${stage.title}. ${stage.desc}`}
              style={{
                left: pos.left,
                top: pos.top,
                width: pos.width,
                transform: pos.align === 'center' ? 'translate(-50%,-50%)' : 'translate(0,-50%)',
              }}
            >
              <div className="vmpf-card-head">
                <span className="vmpf-card-icon" aria-hidden="true">
                  <Icon size={15} strokeWidth={2.2} />
                </span>
                <span className="vmpf-card-side">
                  <span className="vmpf-card-check" aria-hidden="true">
                    <Check size={9} strokeWidth={3.5} />
                  </span>
                  <span className="vmpf-card-num">{stage.num}</span>
                </span>
              </div>
              <h3 className="vmpf-card-title">{stage.shortTitle}</h3>
              <p className="vmpf-card-desc">{stage.desc}</p>
            </article>
          );
        })}

        {/* completion state */}
        <div
          className="vmpf-complete"
          data-visible={isComplete ? 'true' : 'false'}
          role="status"
          aria-hidden={!isComplete}
        >
          <div className="vmpf-complete-panel">
            <span className="vmpf-complete-icon" aria-hidden="true">
              <CheckCircle2 size={22} strokeWidth={2.2} />
            </span>
            <p className="vmpf-complete-kicker">STEPS 01 → 09 · ONBOARDING COMPLETE</p>
            <h3 className="vmpf-complete-title">Supplier Ready for Purchase Orders</h3>
            <p className="vmpf-complete-sub">
              Profile verified, approved by Finance, and created in the ERP master catalog.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- lifecycle progress strip (desktop) ---------------- */}
      <div className="vmpf-strip" aria-hidden="true">
        <div className="vmpf-strip-rail">
          <span className="vmpf-strip-fill" style={{ width: `${stripFillPct}%` }} />
        </div>
        <ol className="vmpf-strip-nodes">
          {STAGES.map((stage, i) => (
            <li
              key={stage.id}
              data-active={i === activeIndex ? 'true' : 'false'}
              data-done={i < doneCount ? 'true' : 'false'}
            >
              <span className="vmpf-strip-node">
                {i < doneCount ? <Check size={9} strokeWidth={3.2} /> : stage.num}
              </span>
              <span className="vmpf-strip-name">{stage.shortTitle}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="vmpf-legend" aria-hidden="true">
        <span className="vmpf-legend-item">
          <span className="vmpf-legend-dot" /> Supplier record moving through onboarding stages
        </span>
        <span className="vmpf-legend-item vmpf-legend-muted">
          Interactive workflow preview · auto-advancing
        </span>
      </div>
    </section>
  );
}

export default VendorManagementProcessFlow;