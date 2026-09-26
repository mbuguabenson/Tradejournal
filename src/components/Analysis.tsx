import { useState, useMemo } from 'react';
import { BarChart3, Calendar, TrendingUp, Award, Activity, PieChart, Sparkles, ChevronDown } from 'lucide-react';
import { fmtUSD, aggregateMonths, getMonthsInYear, getMonthShort } from '@/utils';
import type { TrackerData, AnalysisMode } from '@/types';
import { STRATEGIES } from '@/types';

type Props = {
  data: TrackerData;
  currentMonthKey: string;
  isOpen?: boolean;
  onToggle?: () => void;
};

export default function Analysis({
  data,
  currentMonthKey,
  isOpen = true,
  onToggle,
}: Props) {
  const [mode, setMode] = useState<AnalysisMode>('monthly');
  const [customStart, setCustomStart] = useState(currentMonthKey);
  const [customEnd, setCustomEnd] = useState(currentMonthKey);

  const allMonths = useMemo(() => Object.keys(data).sort(), [data]);
  const years = useMemo(() => Array.from(new Set(allMonths.map((k) => k.split('-')[0]))).sort(), [allMonths]);
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1] || String(new Date().getFullYear()));

  const monthKeys = useMemo(() => {
    if (mode === 'monthly') return [currentMonthKey];
    if (mode === 'yearly') return getMonthsInYear(data, parseInt(selectedYear));
    if (mode === 'custom') {
      const start = allMonths.findIndex((k) => k === customStart);
      const end = allMonths.findIndex((k) => k === customEnd);
      if (start === -1 || end === -1) return [];
      const [from, to] = start <= end ? [start, end] : [end, start];
      return allMonths.slice(from, to + 1);
    }
    return [];
  }, [mode, currentMonthKey, selectedYear, customStart, customEnd, data, allMonths]);

  const agg = useMemo(() => aggregateMonths(data, monthKeys), [data, monthKeys]);
  const maxAbsProfit = useMemo(() => Math.max(1, ...agg.dailyProfits.map((d) => Math.abs(d.profit))), [agg.dailyProfits]);
  const maxCumulative = useMemo(() => Math.max(1, ...agg.cumulativeProfits.map((d) => Math.abs(d.cumulative))), [agg.cumulativeProfits]);

  // Points for smooth wave chart (Screen 3 inspired)
  const chartPoints = useMemo(() => {
    const pts = agg.cumulativeProfits;
    if (pts.length === 0) return [];
    const minVal = -maxCumulative;
    const maxVal = maxCumulative;
    const range = maxVal - minVal || 1;
    return pts.map((d, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * 300;
      const y = 70 - ((d.cumulative - minVal) / range) * 50;
      return { x, y, cumulative: d.cumulative, day: d.day };
    });
  }, [agg.cumulativeProfits, maxCumulative]);

  // Create smooth bezier path string
  const wavePath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    let d = `M ${chartPoints[0].x},${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const curr = chartPoints[i];
      const next = chartPoints[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
    }
    return d;
  }, [chartPoints]);

  const waveAreaPath = useMemo(() => {
    if (!wavePath || chartPoints.length < 2) return '';
    const last = chartPoints[chartPoints.length - 1];
    return `${wavePath} L ${last.x},80 L ${chartPoints[0].x},80 Z`;
  }, [wavePath, chartPoints]);

  // Peak point for glowing indicator
  const peakPoint = useMemo(() => {
    if (chartPoints.length === 0) return null;
    return chartPoints.reduce((max, p) => (p.cumulative > max.cumulative ? p : max), chartPoints[0]);
  }, [chartPoints]);

  return (
    <div className="card w-full overflow-hidden backdrop-blur-xl transition-all duration-300">
      {/* Header section with badge & accordion toggle */}
      <div
        className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-cyan-500/5 dark:hover:bg-cyan-400/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold tp leading-tight">Wave Analytics & Performance</h2>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {peakPoint && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-extrabold text-[10px] sm:text-[11px] tabular-nums">
              Peak: {fmtUSD(peakPoint.cumulative)}
            </span>
          )}

          {onToggle && (
            <button
              onClick={onToggle}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-label="Toggle Section"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3 sm:p-4 pt-1 sm:pt-2 border-t border-slate-200/50 dark:border-white/5 animate-fade-in">
          {/* Timeframe Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
            <div className="inline-flex p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-white/60 dark:border-white/10 shadow-inner">
              {(['monthly', 'yearly', 'custom'] as AnalysisMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all duration-200 capitalize ${
                    mode === m
                      ? 'btn-pill-active'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {mode === 'yearly' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2 py-0.5 text-[10px] font-bold tp bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="text-slate-800 bg-white">
                    {y}
                  </option>
                ))}
              </select>
            )}

            {mode === 'custom' && (
              <div className="flex items-center gap-1 text-[10px] font-semibold ts">
                <select
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-1.5 py-0.5 text-[10px] font-bold tp bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none cursor-pointer"
                >
                  {allMonths.map((k) => (
                    <option key={k} value={k} className="text-slate-800 bg-white">
                      {getMonthShort(k)}
                    </option>
                  ))}
                </select>
                <span>to</span>
                <select
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-1.5 py-0.5 text-[10px] font-bold tp bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none cursor-pointer"
                >
                  {allMonths.map((k) => (
                    <option key={k} value={k} className="text-slate-800 bg-white">
                      {getMonthShort(k)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {monthKeys.length === 0 || agg.completedDays === 0 ? (
            <div className="card-inner p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
              <p className="text-[11px] font-semibold ts">No trading sessions recorded for the selected range.</p>
            </div>
          ) : (
            <>
              {/* Key Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
                <Stat
                  label="Total Profit"
                  value={fmtUSD(agg.totalProfit)}
                  icon={<TrendingUp className="w-3 h-3" />}
                  variant={agg.totalProfit >= 0 ? 'success' : 'danger'}
                />
                <Stat
                  label="Win Rate"
                  value={`${agg.winRate.toFixed(0)}%`}
                  sub={`${agg.profitableDays}W / ${agg.losingDays}L`}
                  icon={<Activity className="w-3 h-3" />}
                  variant={agg.winRate >= 50 ? 'success' : 'danger'}
                />
                <Stat
                  label="Avg Daily"
                  value={fmtUSD(agg.avgDaily)}
                  icon={<BarChart3 className="w-3 h-3" />}
                  variant="accent"
                />
                <Stat
                  label="Best Day"
                  value={fmtUSD(agg.bestDay)}
                  icon={<Award className="w-3 h-3" />}
                  variant="success"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {/* Wave Chart */}
                <div className="card-inner p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-500" /> Wave Trend
                    </span>
                  </div>

                  <div className="relative h-24 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="waveGradientFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.5" />
                          <stop offset="50%" stopColor="#0077FF" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#4338CA" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Area fill */}
                      {waveAreaPath && (
                        <path d={waveAreaPath} fill="url(#waveGradientFill)" />
                      )}

                      {/* Glowing spline curve */}
                      {wavePath && (
                        <path
                          d={wavePath}
                          fill="none"
                          stroke="#00D2FF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#glowLine)"
                        />
                      )}

                      {/* Peak Marker Dot */}
                      {peakPoint && (
                        <g>
                          <circle cx={peakPoint.x} cy={peakPoint.y} r="4" fill="#00D2FF" />
                          <circle cx={peakPoint.x} cy={peakPoint.y} r="7" fill="#00D2FF" fillOpacity="0.3" className="animate-ping" />
                          <circle cx={peakPoint.x} cy={peakPoint.y} r="1.5" fill="#FFFFFF" />
                        </g>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Daily Profit/Loss Bars */}
                <div className="card-inner p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Daily Distribution
                    </span>
                    <span className="text-[9px] font-bold tm">30 Days</span>
                  </div>
                  <div className="flex items-end gap-0.5 h-24 pt-1">
                    {agg.dailyProfits.map((d, i) => {
                      const h = (Math.abs(d.profit) / maxAbsProfit) * 100;
                      const isPositive = d.profit >= 0;
                      return (
                        <div
                          key={i}
                          className="flex-1 min-w-[2px] flex flex-col justify-end h-full group relative"
                        >
                          <div
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              isPositive
                                ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 group-hover:brightness-110'
                                : 'bg-gradient-to-t from-rose-500 to-pink-400 group-hover:brightness-110'
                            }`}
                            style={{ height: `${Math.max(h, 4)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Strategy Breakdown Pie Chart */}
              {agg.strategyBreakdown.length > 0 && (() => {
                const totalTrades = agg.strategyBreakdown.reduce((sum, s) => sum + s.count, 0);
                const radius = 30;
                const circumference = 2 * Math.PI * radius;
                let currentOffset = 0;

                const slices = agg.strategyBreakdown.map((s) => {
                  const strat = STRATEGIES.find((st) => st.value === s.strategy);
                  const share = totalTrades > 0 ? s.count / totalTrades : 0;
                  const dash = share * circumference;
                  const strokeOffset = -currentOffset;
                  currentOffset += dash;
                  return {
                    ...s,
                    label: strat?.label || s.strategy,
                    color: strat?.color || '#94a3b8',
                    sharePct: Math.round(share * 100),
                    dash,
                    strokeOffset,
                  };
                });

                return (
                  <div className="card-inner p-2.5 mt-2.5">
                    <h3 className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <PieChart className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Strategy Performance
                      </span>
                      <span className="text-[9px] font-semibold tm">{totalTrades} Total Trades</span>
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                      {/* SVG Donut / Pie Chart */}
                      <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            className="text-slate-200/50 dark:text-slate-800/60"
                            strokeWidth="9"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          {slices.map((slice) => (
                            <circle
                              key={slice.strategy}
                              cx="40"
                              cy="40"
                              r={radius}
                              stroke={slice.color}
                              strokeWidth="9"
                              strokeDasharray={`${slice.dash} ${circumference}`}
                              strokeDashoffset={slice.strokeOffset}
                              fill="transparent"
                              className="transition-all duration-500 hover:opacity-80"
                            />
                          ))}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-[11px] font-black tp tabular-nums leading-none">
                            {totalTrades}
                          </span>
                          <span className="text-[7px] font-bold tm uppercase tracking-tighter mt-0.5">
                            Trades
                          </span>
                        </div>
                      </div>

                      {/* Pie Chart Legend & Breakdown */}
                      <div className="flex-1 w-full space-y-1.5">
                        {slices.map((slice) => (
                          <div key={slice.strategy} className="flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: slice.color }}
                              />
                              <span className="text-[10px] font-bold tp truncate">{slice.label}</span>
                              <span className="text-[9px] font-medium tm">({slice.sharePct}%)</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-black tabular-nums ${
                                  slice.profit >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {fmtUSD(slice.profit)}
                              </span>
                              <span className="text-[8px] font-extrabold px-1 rounded bg-slate-200/60 dark:bg-slate-700/60 tm">
                                {slice.count}d
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
  variant,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  variant: 'accent' | 'success' | 'danger';
}) {
  const c = {
    accent: 'text-cyan-600 dark:text-cyan-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-rose-600 dark:text-rose-400',
  };

  const bg = {
    accent: 'bg-cyan-500/10',
    success: 'bg-emerald-500/10',
    danger: 'bg-rose-500/10',
  };

  return (
    <div className="card-inner p-2 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-bold tm uppercase tracking-wider">{label}</span>
        <span className={`w-5 h-5 rounded flex items-center justify-center ${bg[variant]} ${c[variant]}`}>
          {icon}
        </span>
      </div>
      <div>
        <span className={`text-sm font-black tabular-nums tracking-tight ${c[variant]}`}>{value}</span>
        {sub && <span className="text-[8px] font-semibold tm ml-1">{sub}</span>}
      </div>
    </div>
  );
}
