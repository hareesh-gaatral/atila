'use client';

/**
 * O2CProcessFlow.tsx
 *
 * Animated 8-stage Order-to-Cash (O2C) lifecycle flow for the ATILA
 * Procurement & Sales Platform.
 * Self-contained: React + TypeScript + lucide-react + SVG + CSS only
 * (no external animation libraries).
 *
 * Matches the exact architecture and code flow of VendorManagementProcessFlow:
 *  - data-driven STAGES configuration
 *  - generated SVG track + travelling order record packet with glow & ring
 *  - one drift-free rAF timeline writing directly to DOM (no React state lag)
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
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Database,
  FileCheck2,
  ListChecks,
  MessageSquare,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Truck,
  WalletCards,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import '@/styles/O2CProcessFlow.css';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type O2CFlowTheme = 'light' | 'dark';

export interface O2CFlowStage {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  desc: string;
  icon: LucideIcon;
}

export interface O2CProcessFlowProps {
  /** Explicit theme override from parent ('light' | 'dark'). If omitted, inherits parent/global theme. */
  theme?: O2CFlowTheme;
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

export const O2C_STAGES: readonly O2CFlowStage[] = [
  {
    id: 'inquiry',
    num: '01',
    title: 'Customer Inquiry & RFQ Capture',
    shortTitle: 'Inquiry & RFQ',
    desc: 'Log customer item requirements, delivery dates, and shipping locations.',
    icon: MessageSquare,
  },
  {
    id: 'onboarding',
    num: '02',
    title: 'Customer Setup & Credit Evaluation',
    shortTitle: 'Customer KYC',
    desc: 'Verify customer GSTIN, assign credit limits, and confirm billing addresses.',
    icon: Building2,
  },
  {
    id: 'quotation',
    num: '03',
    title: 'Quotation & Proforma Invoice',
    shortTitle: 'Quotation & Pricing',
    desc: 'Prepare formal quotes with price lists, volume discounts, freight, and GST.',
    icon: FileCheck2,
  },
  {
    id: 'confirmation',
    num: '04',
    title: 'Customer PO Matching & Sales Order',
    shortTitle: 'Sales Order (SO)',
    desc: 'Match customer purchase orders against approved quotes to book confirmed sales orders.',
    icon: ShoppingCart,
  },
  {
    id: 'scheduling',
    num: '05',
    title: 'Stock Allocation & Dispatch Schedule',
    shortTitle: 'Order Scheduling',
    desc: 'Reserve warehouse stock, check batch numbers, and plan partial or full delivery dates.',
    icon: CalendarClock,
  },
  {
    id: 'dispatch',
    num: '06',
    title: 'Pick, Pack, Dispatch & E-Way Bill',
    shortTitle: 'Dispatch & Delivery',
    desc: 'Generate pick lists, create E-Way bills, assign transporters, and collect signed PODs.',
    icon: Truck,
  },
  {
    id: 'invoicing',
    num: '07',
    title: 'Tax Invoice & E-Invoice Generation',
    shortTitle: 'Tax Invoice & IRN',
    desc: 'Issue GST tax invoices with government IRN and QR codes for dispatched items.',
    icon: Receipt,
  },
  {
    id: 'receivables',
    num: '08',
    title: 'Payment Collection & Bank Reconciliation',
    shortTitle: 'Payment & Settlement',
    desc: 'Match incoming NEFT/RTGS payments against open invoices and reconcile ledgers.',
    icon: WalletCards,
  },
] as const;

const STAGES: readonly O2CFlowStage[] = O2C_STAGES;

/* ------------------------------------------------------------------ */
/* Timing model — one full lifecycle cycle ≈ 14.2 s                    */
/* ------------------------------------------------------------------ */

const TIMING = {
  entry: 0.8, // smooth packet entry
  dwell: 1.8, // relaxed pause on each stage so users can comfortably read title and text
  move: 1.0,  // graceful eased transit between stages
  exit: 0.8,  // stage 08 → RECONCILED end node
  hold: 3.5,  // completion summary stays visible long enough to digest
  activeTail: 0.25, // card stays lit briefly after packet departs
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
/* Geometry — generated for 8-stage serpentine flow                     */
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

/** Desktop / tablet: serpentine 3-row layout, preserving business order 01…08. */
function buildSerpentineLayout(stageCount: number): LayoutModel {
  const W = 1200;
  const H = 410;
  const colX = [220, 600, 980] as const;
  const rowY = [72, 205, 338] as const;
  const r = CORNER_RADIUS;

  // Grid cells for 8 stages:
  // Row 0: 01 → 02 → 03
  // Row 1: 04 ← 05 ← 06 (visually right to left)
  // Row 2: 07 → 08 → [RECONCILED Endpoint]
  const grid: ReadonlyArray<readonly [number, number]> = [
    [0, 0], [1, 0], [2, 0],
    [2, 1], [1, 1], [0, 1],
    [0, 2], [1, 2],
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
    stationDistances[station] = acc - s.length / 2;
  };

  // 01
  add(lineSegment(start, stations[0]));
  stationDistances[0] = acc;
  // 01 -> 02
  add(lineSegment(stations[0], stations[1]));
  stationDistances[1] = acc;
  // 02 -> 03 (corner)
  add(lineSegment(stations[1], { x: colX[2] - r, y: rowY[0] }));
  addQuadStation(
    quadSegment({ x: colX[2] - r, y: rowY[0] }, stations[2], { x: colX[2], y: rowY[0] + r }),
    2,
  );
  // 03 -> 04 (corner)
  add(lineSegment({ x: colX[2], y: rowY[0] + r }, { x: colX[2], y: rowY[1] - r }));
  addQuadStation(
    quadSegment({ x: colX[2], y: rowY[1] - r }, stations[3], { x: colX[2] - r, y: rowY[1] }),
    3,
  );
  // 04 -> 05
  add(lineSegment({ x: colX[2] - r, y: rowY[1] }, stations[4]));
  stationDistances[4] = acc;
  // 05 -> 06 (corner)
  add(lineSegment(stations[4], { x: colX[0] + r, y: rowY[1] }));
  addQuadStation(
    quadSegment({ x: colX[0] + r, y: rowY[1] }, stations[5], { x: colX[0], y: rowY[1] + r }),
    5,
  );
  // 06 -> 07 (corner)
  add(lineSegment({ x: colX[0], y: rowY[1] + r }, { x: colX[0], y: rowY[2] - r }));
  addQuadStation(
    quadSegment({ x: colX[0], y: rowY[2] - r }, stations[6], { x: colX[0] + r, y: rowY[2] }),
    6,
  );
  // 07 -> 08
  add(lineSegment({ x: colX[0] + r, y: rowY[2] }, stations[7]));
  stationDistances[7] = acc;
  // 08 -> Reconciled Endpoint
  add(lineSegment(stations[7], end));

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
    startLabel: { pt: { x: start.x, y: rowY[0] + 24 }, anchor: 'middle', text: 'INQUIRY' },
    endLabel: { pt: { x: end.x, y: rowY[2] + 24 }, anchor: 'middle', text: 'RECONCILED' },
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
    startLabel: { pt: { x: railX + 16, y: start.y + 3 }, anchor: 'start', text: 'INQUIRY' },
    endLabel: { pt: { x: railX + 16, y: end.y + 3 }, anchor: 'start', text: 'RECONCILED' },
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

export function O2CProcessFlow({
  theme: themeProp,
  className,
}: O2CProcessFlowProps) {
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

  const currentTheme: O2CFlowTheme =
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

  /* ----- animation engine (rAF writes DOM directly, zero React re-render lag) ----- */
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
      const t = ((now - startedAt) / 1000) % timing.cycle;

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

  const rootClass = ['o2cpf', className].filter(Boolean).join(' ');

  return (
    <section
      className={rootClass}
      data-theme={currentTheme}
      data-orient={layout.orientation}
      aria-label="Order to Cash lifecycle process flow"
    >
      <p className="o2cpf-sr-only">
        Step-by-step Order to Cash (O2C) sales execution flow: customer inquiry and RFQ,
        onboarding and credit check, quotation and proforma pricing, sales order confirmation,
        stock allocation, warehouse dispatch with E-Way bills, GST tax invoicing with IRN, and payment
        reconciliation.
      </p>

      {/* ---------------- Header ---------------- */}
      <header className="o2cpf-head">
        <div className="o2cpf-head-copy">
          <p className="o2cpf-eyebrow">
            <span className="o2cpf-eyebrow-dot" aria-hidden="true" />
            COMMERCIAL OPERATIONS · ORDER TO CASH
          </p>
          <h2 className="o2cpf-title">
            How Order-to-Cash Operates, <em>from Customer Inquiry to Bank Settlement</em>
          </h2>
          <p className="o2cpf-sub">
            A clear, dependable flow that links sales orders, warehouse dispatch, e-invoicing, and payment reconciliation without manual tracking errors.
          </p>
          <ul className="o2cpf-meta">
            <li><ListChecks size={13} aria-hidden="true" /> 8-step fulfillment flow</li>
            <li><Database size={13} aria-hidden="true" /> PO & quotation validation</li>
            <li><ShieldCheck size={13} aria-hidden="true" /> Automated E-Way bill & IRN</li>
            <li><Zap size={13} aria-hidden="true" /> Real-time payment reconciliation</li>
          </ul>
        </div>
      </header>

      {/* ---------------- Process board ---------------- */}
      <div
        className="o2cpf-board"
        data-complete={isComplete ? 'true' : 'false'}
        style={{ aspectRatio: `${layout.viewBox.w} / ${layout.viewBox.h}` }}
      >
        <svg
          className="o2cpf-svg"
          viewBox={`0 0 ${layout.viewBox.w} ${layout.viewBox.h}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--o2c-accent)" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <radialGradient id={`${uid}-core`} cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="var(--o2c-accent-soft)" />
              <stop offset="100%" stopColor="var(--o2c-accent-strong)" />
            </radialGradient>
          </defs>

          {/* muted base track */}
          <path ref={trackRef} className="o2cpf-track-base" d={layout.pathD} />
          {/* illuminated progress trail (glow + crisp) */}
          <path ref={progressGlowRef} className="o2cpf-track-glow" d={layout.pathD} />
          <path
            ref={progressMainRef}
            className="o2cpf-track-progress"
            d={layout.pathD}
            stroke={`url(#${uid}-stroke)`}
          />

          {/* mobile rail ticks */}
          {layout.ticks.map((tick, i) => (
            <line
              key={`tick-${i}`}
              className="o2cpf-track-tick"
              x1={tick.from.x}
              y1={tick.from.y}
              x2={tick.to.x}
              y2={tick.to.y}
            />
          ))}

          {/* lifecycle endpoints */}
          <g className="o2cpf-node" transform={`translate(${layout.start.x} ${layout.start.y})`}>
            <circle r="4.6" />
            <circle className="o2cpf-node-core" r="1.6" />
          </g>
          <g className="o2cpf-node" transform={`translate(${layout.end.x} ${layout.end.y})`}>
            <circle r="4.6" />
            <circle className="o2cpf-node-core" r="1.6" />
          </g>
          <text
            className="o2cpf-node-label"
            x={layout.startLabel.pt.x}
            y={layout.startLabel.pt.y}
            textAnchor={layout.startLabel.anchor}
          >
            {layout.startLabel.text}
          </text>
          <text
            className="o2cpf-node-label"
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
              className="o2cpf-station"
              data-active={i === activeIndex ? 'true' : 'false'}
              cx={p.x}
              cy={p.y}
              r={layout.orientation === 'vertical' ? 5 : 3.5}
            />
          ))}

          {/* the travelling order record */}
          <g ref={packetRef} className="o2cpf-packet" opacity="0">
            <circle className="o2cpf-packet-halo" r="15" />
            <circle className="o2cpf-packet-ring" r="10" />
            <circle className="o2cpf-packet-core" r="9.5" fill={`url(#${uid}-core)`} />
            <text className="o2cpf-packet-glyph" textAnchor="middle" dominantBaseline="central">
              O
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
              className="o2cpf-card"
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
              <div className="o2cpf-card-head">
                <span className="o2cpf-card-icon" aria-hidden="true">
                  <Icon size={15} strokeWidth={2.2} />
                </span>
                <span className="o2cpf-card-side">
                  <span className="o2cpf-card-check" aria-hidden="true">
                    <Check size={9} strokeWidth={3.5} />
                  </span>
                  <span className="o2cpf-card-num">{stage.num}</span>
                </span>
              </div>
              <h3 className="o2cpf-card-title">{stage.shortTitle}</h3>
              <p className="o2cpf-card-desc">{stage.desc}</p>
            </article>
          );
        })}

        {/* completion state */}
        <div
          className="o2cpf-complete"
          data-visible={isComplete ? 'true' : 'false'}
          role="status"
          aria-hidden={!isComplete}
        >
          <div className="o2cpf-complete-panel">
            <span className="o2cpf-complete-icon" aria-hidden="true">
              <CheckCircle2 size={22} strokeWidth={2.2} />
            </span>
            <p className="o2cpf-complete-kicker">STEPS 01 → 08 · SALES CYCLE SETTLED</p>
            <h3 className="o2cpf-complete-title">Order Fulfilled & Payment Reconciled</h3>
            <p className="o2cpf-complete-sub">
              Goods delivered with POD, tax invoice filed with IRN, and payment cleared in the ledger.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- lifecycle progress strip (desktop) ---------------- */}
      <div className="o2cpf-strip" aria-hidden="true">
        <div className="o2cpf-strip-rail">
          <span className="o2cpf-strip-fill" style={{ width: `${stripFillPct}%` }} />
        </div>
        <ol className="o2cpf-strip-nodes">
          {STAGES.map((stage, i) => (
            <li
              key={stage.id}
              data-active={i === activeIndex ? 'true' : 'false'}
              data-done={i < doneCount ? 'true' : 'false'}
            >
              <span className="o2cpf-strip-node">
                {i < doneCount ? <Check size={9} strokeWidth={3.2} /> : stage.num}
              </span>
              <span className="o2cpf-strip-name">{stage.shortTitle}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="o2cpf-legend" aria-hidden="true">
        <span className="o2cpf-legend-item">
          <span className="o2cpf-legend-dot" /> Sales order moving through fulfillment stages
        </span>
        <span className="o2cpf-legend-muted">
          Interactive workflow preview · auto-advancing
        </span>
      </div>
    </section>
  );
}

export default O2CProcessFlow;
