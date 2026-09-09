'use client';

import defaultWheel from '@/data/json/procurement-wheel.json';

interface WheelCard {
  title: string;
  description: string;
}

interface WheelSide {
  title: string;
  headline?: string;
  description: string;
  cards?: WheelCard[];
}

const buyerIcon = (
  <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const supplierIcon = (
  <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

/**
 * One side column of the lifecycle. The panel keeps its icon + title fixed and
 * auto-scrolls its content cards in an endless vertical marquee — Buyers on the
 * left scroll up, Suppliers on the right scroll down. Pause on hover.
 */
function SideColumn({ wheel, side }: { wheel: Record<string, any>; side: 'buyers' | 'suppliers' }) {
  const isBuyers = side === 'buyers';
  const data = (wheel as Record<string, WheelSide>)[side];

  const cards: WheelCard[] = data.cards?.length ? data.cards : [];
  const items: WheelCard[] = [
    ...(data.headline ? [{ title: data.headline, description: data.description }] : []),
    ...cards,
  ];
  // Two copies of the list make translateY(-50%) a seamless loop.
  const loop = items.length ? [...items, ...items] : [];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border border-slate-200 dark:border-slate-700 hover:shadow-card-hover transition-all duration-300 flex flex-col h-[26rem] lg:h-[30rem]">
      {/* Fixed header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 bg-teal-600/10 dark:bg-teal-400/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          {isBuyers ? buyerIcon : supplierIcon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-navy dark:text-slate-50">{data.title}</h3>
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-0.5">
            {isBuyers ? 'Sourcing side of the network' : 'Selling side of the network'}
          </p>
        </div>
      </div>

      {/* Auto-scrolling content */}
      <div className="marquee-viewport relative flex-1 min-h-0 overflow-hidden rounded-xl">
        <div
          className={`flex flex-col px-0.5 ${isBuyers ? 'animate-marquee-up' : 'animate-marquee-down'}`}
        >
          {loop.map((card, i) => (
            <div key={i} className="pb-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-700/30 p-4">
                <p className="text-[15px] font-bold text-navy dark:text-slate-100 leading-snug">
                  {card.title}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Soft fade masks so cards appear to dip in and out smoothly */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white via-white/70 to-transparent dark:from-slate-800 dark:via-slate-800/70" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-slate-800 dark:via-slate-800/70" />
      </div>
    </div>
  );
}

export default function ProcurementWheel({ content }: { content?: Record<string, any> | null }) {
  const wheel: Record<string, any> =
    content && typeof content === 'object' && Object.keys(content).length
      ? { ...(defaultWheel as Record<string, any>), ...content }
      : (defaultWheel as Record<string, any>);
  const stages = Array.isArray(wheel.stages) ? (wheel.stages as any[]) : (defaultWheel.stages as any[]);

  return (
    <section className="py-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-2">
            {wheel.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">
            {wheel.title}<span className="gradient-text">{wheel.highlight}</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-center">
          {/* Buyers column (scrolls up) */}
          <SideColumn wheel={wheel} side="buyers" />

          {/* Center Wheel */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 320 320" className="w-full h-full">
                {/* Outer circle segments */}
                {stages.map((stage, i) => {
                  const startAngle = (i * 45 - 90) * (Math.PI / 180);
                  const endAngle = ((i + 1) * 45 - 90) * (Math.PI / 180);
                  const x1 = 160 + 140 * Math.cos(startAngle);
                  const y1 = 160 + 140 * Math.sin(startAngle);
                  const x2 = 160 + 140 * Math.cos(endAngle);
                  const y2 = 160 + 140 * Math.sin(endAngle);
                  const largeArc = 45 > 180 ? 1 : 0;

                  const midAngle = ((i * 45 + 22.5) - 90) * (Math.PI / 180);
                  const textX = 160 + 105 * Math.cos(midAngle);
                  const textY = 160 + 105 * Math.sin(midAngle);

                  return (
                    <g key={stage.label}>
                      <path
                        d={`M 160 160 L ${x1} ${y1} A 140 140 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={stage.color}
                        className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {stage.label.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* Middle circle */}
                <circle cx="160" cy="160" r="75" fill="white" className="dark:fill-[#0f172a]" />
                <circle cx="160" cy="160" r="74" fill="none" stroke="#e2e8f0" strokeWidth="2" className="dark:stroke-slate-600" />

                {/* Inner decorative ring */}
                <circle cx="160" cy="160" r="70" fill="none" stroke="#14b8a6" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

                {/* Product Logo - Center */}
                <image href={wheel.logo} x="110" y="110" width="100" height="100" />
              </svg>

              {/* Outer decorative ring labels */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-navy dark:bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  {wheel.ringLabels.top}
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  {wheel.ringLabels.bottom}
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-500 text-white text-[10px] font-bold px-3 py-1 rounded-full -rotate-90">
                  {wheel.ringLabels.left}
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-500 text-white text-[10px] font-bold px-3 py-1 rounded-full rotate-90">
                  {wheel.ringLabels.right}
                </div>
              </div>
            </div>
          </div>

          {/* Suppliers column (scrolls down) */}
          <SideColumn wheel={wheel} side="suppliers" />
        </div>

        {/* Bottom Tags */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {(wheel.tags as string[]).map((tag, i) => (
            <span
              key={i}
              className={[
                'text-white px-5 py-2 rounded-full text-sm font-medium',
                i === 0 && 'bg-navy dark:bg-teal-500',
                i === 1 && 'bg-teal-500',
                i === 2 && 'bg-slate-500',
                i === 3 && 'bg-navy-light',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
