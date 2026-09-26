import { Activity, Wallet, TrendingUp, BarChart3, PieChart, ShieldCheck } from 'lucide-react';
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
  return (
    <div className="mx-2 sm:mx-4 mb-2 sm:mb-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fade-in">
      {/* 1. Total P/L Hero Card */}
      <div className="card p-2 sm:p-2.5 flex items-center justify-between gap-2 border-l-4 border-l-cyan-500 hover:scale-[1.01] transition-transform backdrop-blur-xl">
        <div className="min-w-0">
          <span className="text-[9px] font-bold tm uppercase tracking-wider block leading-none">
            Total P/L
          </span>
          <p
            className={`text-xs sm:text-sm font-black tabular-nums tracking-tight mt-1 leading-tight ${
              totals.profitLoss >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {fmtUSD(totals.profitLoss)}
          </p>
          <span className="text-[8px] font-semibold tm block mt-0.5 truncate">
            {totals.profitLoss >= 0 ? 'Net Profit' : 'Drawdown'}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
          <Activity className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 2. Cumulative / Balance */}
      <div className="card p-2 sm:p-2.5 flex items-center justify-between gap-2 border-l-4 border-l-blue-500 hover:scale-[1.01] transition-transform backdrop-blur-xl">
        <div className="min-w-0">
          <span className="text-[9px] font-bold tm uppercase tracking-wider block leading-none">
            Cumulative
          </span>
          <p
            className={`text-xs sm:text-sm font-black tabular-nums tracking-tight mt-1 leading-tight ${
              finalCumulative >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {fmtUSD(finalCumulative)}
          </p>
          <span className="text-[8px] font-semibold tm block mt-0.5 truncate">
            Net Balance
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 3. Withdrawn Funds */}
      <div className="card p-2 sm:p-2.5 flex items-center justify-between gap-2 border-l-4 border-l-amber-500 hover:scale-[1.01] transition-transform backdrop-blur-xl">
        <div className="min-w-0">
          <span className="text-[9px] font-bold tm uppercase tracking-wider block leading-none">
            Withdrawn
          </span>
          <p className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums tracking-tight mt-1 leading-tight">
            {fmtUSD(totals.withdrawn)}
          </p>
          <span className="text-[8px] font-semibold tm block mt-0.5 truncate">
            Secured Payouts
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <Wallet className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 4. Win Rate */}
      <div className="card p-2 sm:p-2.5 flex items-center justify-between gap-2 border-l-4 border-l-indigo-500 hover:scale-[1.01] transition-transform backdrop-blur-xl">
        <div className="min-w-0">
          <span className="text-[9px] font-bold tm uppercase tracking-wider block leading-none">
            Win Rate
          </span>
          <p
            className={`text-xs sm:text-sm font-black tabular-nums tracking-tight mt-1 leading-tight ${
              stats.winRate >= 50
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {stats.winRate.toFixed(0)}%
          </p>
          <span className="text-[8px] font-semibold tm block mt-0.5 truncate">
            {stats.profitable}W / {stats.losing}L • {stats.completed}d
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <BarChart3 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
