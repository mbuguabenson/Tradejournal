import { Activity, Wallet, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Award, Shield } from 'lucide-react';
import { fmtUSD } from '@/utils';

type Props = {
  totals: { dailyTarget: number; profitLoss: number; withdrawn: number; sessions: number[] };
  finalCumulative: number;
  startingCapital: number;
  stats: { completed: number; profitable: number; losing: number; winRate: number; avgDaily: number; bestDay: number; worstDay: number };
};

export default function SummaryCards({
  totals,
  finalCumulative,
  stats,
}: Props) {
  const isProfit = totals.profitLoss >= 0;
  const isCumulativeProfit = finalCumulative >= 0;

  return (
    <div className="mx-2 sm:mx-4 mb-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 animate-fade-in">
      {/* 1. Total P/L Tile */}
      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-3.5 sm:p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-cyan-500/40">
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 to-blue-500 opacity-80" />

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isProfit ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Total P/L
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg sm:text-2xl font-black tabular-nums tracking-tight ${
                isProfit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {fmtUSD(totals.profitLoss)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              {isProfit ? 'Net Performance' : 'Net Drawdown'}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-full text-[9px] ${
                isProfit
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isProfit ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              {isProfit ? 'Profit' : 'Loss'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cumulative / Net Account Balance Tile */}
      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-3.5 sm:p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-500/40">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-400 to-indigo-500 opacity-80" />

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Cumulative P/L
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg sm:text-2xl font-black tabular-nums tracking-tight ${
                isCumulativeProfit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {fmtUSD(finalCumulative)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              Net Account Growth
            </span>
            <span className="inline-flex items-center font-bold px-1.5 py-0.5 rounded-full text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Equity Curve
            </span>
          </div>
        </div>
      </div>

      {/* 3. Withdrawn Funds Tile */}
      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-3.5 sm:p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-amber-500/40">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-400 to-orange-500 opacity-80" />

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Withdrawn
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums tracking-tight">
              {fmtUSD(totals.withdrawn)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              Secured Profit
            </span>
            <span className="inline-flex items-center font-bold px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Payouts
            </span>
          </div>
        </div>
      </div>

      {/* 4. Win Rate Tile */}
      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-3.5 sm:p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-500/40">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-400 to-purple-500 opacity-80" />

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Win Rate
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg sm:text-2xl font-black tabular-nums tracking-tight ${
                stats.winRate >= 50
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {stats.winRate.toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-semibold truncate">
              {stats.profitable}W • {stats.losing}L
            </span>
            <span className="inline-flex items-center font-bold px-1.5 py-0.5 rounded-full text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {stats.completed} Days Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
