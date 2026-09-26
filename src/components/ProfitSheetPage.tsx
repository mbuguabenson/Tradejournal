import { TrendingUp, Target, Wallet, Activity, Calendar, ChevronRight, BarChart3, Award, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { fmtUSD, parseNum, getMonthShort, getMonthLabel, computeRows, computeTotals, computeStats, aggregateMonths } from '@/utils';
import type { TrackerData } from '@/types';

type Props = {
  data: TrackerData;
  currentMonthKey: string;
  onMonthChange: (key: string) => void;
};

export default function ProfitSheetPage({ data, currentMonthKey, onMonthChange }: Props) {
  const allMonths = Object.keys(data).sort();
  const monthSummaries = allMonths.map((key) => {
    const month = data[key];
    const computed = computeRows(month.rows);
    const totals = computeTotals(computed, month.sessionCount);
    const finalCum = computed.length > 0 ? computed[computed.length - 1].cumulativeProfit : 0;
    const stats = computeStats(computed);
    const monthlyTarget = parseNum(month.monthlyTarget);
    const startingCapital = parseNum(month.startingCapital);
    const profitTarget = monthlyTarget - startingCapital;
    const progress = profitTarget > 0 ? Math.min((finalCum / profitTarget) * 100, 100) : 0;
    return {
      key,
      totals,
      finalCum,
      monthlyTarget,
      startingCapital,
      progress,
      completed: stats.completed,
      profitable: stats.profitable,
      losing: stats.losing,
      winRate: stats.winRate,
      bestDay: stats.bestDay,
      worstDay: stats.worstDay,
    };
  });

  const overallProfit = monthSummaries.reduce((s, m) => s + m.finalCum, 0);
  const overallWithdrawn = monthSummaries.reduce((s, m) => s + m.totals.withdrawn, 0);
  const overallTarget = monthSummaries.reduce((s, m) => s + (m.monthlyTarget - m.startingCapital), 0);
  const overallProgress = overallTarget > 0 ? Math.min((overallProfit / overallTarget) * 100, 100) : 0;
  const totalCompleted = monthSummaries.reduce((s, m) => s + m.completed, 0);
  const totalProfitable = monthSummaries.reduce((s, m) => s + m.profitable, 0);
  const totalLosing = monthSummaries.reduce((s, m) => s + m.losing, 0);
  const overallWinRate = totalCompleted > 0 ? (totalProfitable / totalCompleted) * 100 : 0;
  const overallBest = monthSummaries.length > 0 ? Math.max(...monthSummaries.map((m) => m.bestDay)) : 0;
  const overallWorst = monthSummaries.length > 0 ? Math.min(...monthSummaries.map((m) => m.worstDay)) : 0;

  const aggAll = aggregateMonths(data, allMonths);
  const maxCum = Math.max(1, ...aggAll.cumulativeProfits.map((d) => Math.abs(d.cumulative)));
  const maxDaily = Math.max(1, ...aggAll.dailyProfits.map((d) => Math.abs(d.profit)));

  return (
    <div className="mx-3 sm:mx-4 mb-6 space-y-4">
      {/* Overall Progress Hero */}
      <div className="card p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                Long-Term Growth
              </span>
              <h2 className="text-base sm:text-lg font-black tp leading-tight">
                All-Months Portfolio Sheet
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            {monthSummaries.length} Tracked Months
          </span>
        </div>

        <div className="card-inner p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-500" /> Total Challenge Completion
            </span>
            <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="progress-track h-4 mb-3">
            <div
              className="h-full rounded-full progress-bar-gradient transition-all duration-700"
              style={{ width: `${Math.max(overallProgress, 1)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs ts font-semibold">
            <span>
              Net Profit: <span className={`font-black ${overallProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{fmtUSD(overallProfit)}</span>
            </span>
            <span>
              Cumulative Target: <span className="font-black tp">{fmtUSD(overallTarget)}</span>
            </span>
            <span>
              Total Withdrawn: <span className="font-black text-amber-600 dark:text-amber-400">{fmtUSD(overallWithdrawn)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <HeroStat icon={<Activity className="w-4 h-4" />} label="Total Profit" value={fmtUSD(overallProfit)} variant={overallProfit >= 0 ? 'success' : 'danger'} />
          <HeroStat icon={<Target className="w-4 h-4" />} label="Total Target" value={fmtUSD(overallTarget)} variant="accent" />
          <HeroStat icon={<Wallet className="w-4 h-4" />} label="Withdrawn" value={fmtUSD(overallWithdrawn)} variant="warning" />
          <HeroStat icon={<Calendar className="w-4 h-4" />} label="Total Days" value={String(totalCompleted)} sub={`${totalProfitable}W / ${totalLosing}L`} variant="accent" />
          <HeroStat icon={<BarChart3 className="w-4 h-4" />} label="Win Rate" value={`${overallWinRate.toFixed(0)}%`} variant={overallWinRate >= 50 ? 'success' : 'danger'} />
          <HeroStat icon={<Award className="w-4 h-4" />} label="Best Day" value={fmtUSD(overallBest)} variant="success" />
          <HeroStat icon={<TrendingDown className="w-4 h-4" />} label="Worst Day" value={fmtUSD(overallWorst)} variant="danger" />
          <HeroStat icon={<TrendingUp className="w-4 h-4" />} label="Avg / Day" value={fmtUSD(totalCompleted > 0 ? overallProfit / totalCompleted : 0)} variant="accent" />
        </div>
      </div>

      {/* Cumulative trend across all months */}
      {aggAll.completedDays > 0 && (
        <div className="card p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Multi-Month Compounding Curve
            </span>
          </div>
          <div className="relative h-44">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${aggAll.cumulativeProfits.length} 100`}>
              <defs>
                <linearGradient id="allCumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#0077FF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
                </linearGradient>
              </defs>
              {aggAll.cumulativeProfits.length > 1 && (
                <>
                  <polyline
                    points={aggAll.cumulativeProfits.map((d, i) => `${i},${100 - ((d.cumulative + maxCum) / (2 * maxCum)) * 100}`).join(' ')}
                    fill="none"
                    stroke="#00D2FF"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polygon
                    points={`0,100 ${aggAll.cumulativeProfits.map((d, i) => `${i},${100 - ((d.cumulative + maxCum) / (2 * maxCum)) * 100}`).join(' ')} ${aggAll.cumulativeProfits.length - 1},100`}
                    fill="url(#allCumGrad)"
                  />
                </>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Per-month breakdown cards */}
      <div className="card p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-extrabold tp flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Monthly Breakdown & Past Months History
            </h3>
            <p className="text-[11px] font-semibold ts mt-0.5">
              Click any past month below to open its daily trades in the Dashboard
            </p>
          </div>

          <label className="btn-secondary px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer text-cyan-600 dark:text-cyan-400 hover:border-cyan-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>+ Add Past Month</span>
            <input
              type="month"
              onChange={(e) => {
                if (e.target.value) {
                  onMonthChange(e.target.value);
                }
              }}
              className="sr-only"
            />
          </label>
        </div>

        <div className="space-y-3">
          {monthSummaries.map((m) => {
            const isCurrent = m.key === currentMonthKey;
            return (
              <div
                key={m.key}
                className={`card-inner p-4 cursor-pointer hover:border-cyan-400/50 hover:shadow-md transition-all duration-200 group ${
                  isCurrent ? 'ring-2 ring-cyan-500/40 bg-cyan-50/20 dark:bg-cyan-900/10' : ''
                }`}
                onClick={() => onMonthChange(m.key)}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 tm">Past Month</span>
                    )}
                    <span className="text-sm sm:text-base font-extrabold tp group-hover:text-cyan-500 transition-colors">{getMonthLabel(m.key)}</span>
                    <span className="text-xs font-semibold tm">({m.completed}/30 days logged)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs sm:text-sm font-black flex items-center gap-0.5 tabular-nums ${
                      m.finalCum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {m.finalCum >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {fmtUSD(m.finalCum)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all hidden xs:inline-block">
                      View Trades ➔
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                </div>

                <div className="progress-track h-3 mb-2.5">
                  <div
                    className="h-full rounded-full progress-bar-gradient transition-all duration-500"
                    style={{ width: `${Math.max(m.progress, 1)}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold ts">
                  <span>Target: <span className="font-extrabold tp">{fmtUSD(m.monthlyTarget)}</span></span>
                  <span>Capital: <span className="font-extrabold tp">{fmtUSD(m.startingCapital)}</span></span>
                  <span>Win Rate: <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{m.winRate.toFixed(0)}%</span></span>
                  <span>Withdrawn: <span className="font-extrabold text-amber-600 dark:text-amber-400">{fmtUSD(m.totals.withdrawn)}</span></span>
                  <span className="ml-auto font-black text-cyan-600 dark:text-cyan-400">{m.progress.toFixed(0)}% Achieved</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  sub,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  variant: 'accent' | 'success' | 'danger' | 'warning';
}) {
  const iconBg = {
    accent: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  const valColor = {
    accent: 'tp',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-rose-600 dark:text-rose-400',
    warning: 'text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="card-inner p-3.5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold tm uppercase tracking-wider">{label}</span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg[variant]}`}>
          {icon}
        </span>
      </div>
      <div>
        <span className={`text-base sm:text-lg font-black tabular-nums tracking-tight ${valColor[variant]}`}>{value}</span>
        {sub && <span className="text-[10px] font-semibold tm ml-2">{sub}</span>}
      </div>
    </div>
  );
}
