import { Target, Flag, Sparkles, TrendingUp } from 'lucide-react';
import { fmtUSD, parseNum } from '@/utils';
import SettingsDropdown from '@/components/SettingsDropdown';
import type { MonthData } from '@/types';

type Props = {
  month: MonthData;
  finalCumulative: number;
  onUpdateMonth: (patch: Partial<MonthData>) => void;
};

export default function TargetProgress({
  month,
  finalCumulative,
  onUpdateMonth,
}: Props) {
  const monthlyTarget = parseNum(month.monthlyTarget);
  const startingCapital = parseNum(month.startingCapital);
  const profitTarget = monthlyTarget - startingCapital;
  const hasTarget = profitTarget > 0;

  const progress = hasTarget ? Math.min((finalCumulative / profitTarget) * 100, 100) : 0;
  const clampedProgress = Math.max(0, progress);
  const remaining = hasTarget ? profitTarget - finalCumulative : 0;
  const isGoalReached = hasTarget && remaining <= 0;

  const daysInMonth = month.rows?.length || 30;
  const autoDaily = hasTarget ? (profitTarget / daysInMonth).toFixed(2) : '0.00';
  const effectiveDailyTarget = month.dailyTarget !== undefined && month.dailyTarget !== '' ? month.dailyTarget : autoDaily;

  return (
    <div className="card mx-2 sm:mx-4 mb-2.5 px-3.5 sm:px-4 py-2.5 backdrop-blur-xl relative z-20 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
      {/* Top subtle iridescent glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-60 rounded-t-2xl" />

      <div className="flex items-center justify-between gap-3 sm:gap-6 flex-wrap">
        {/* Left: Milestone Badge & % */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 font-bold shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tp tracking-tight">
                Monthly Target Milestone
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                isGoalReached
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : hasTarget
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}>
                {hasTarget ? `${progress.toFixed(0)}% Achieved` : 'Target Unset'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Sleek Responsive Progress Bar */}
        <div className="flex-1 min-w-[140px] max-w-md hidden md:block">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            <span>Progress: {fmtUSD(finalCumulative)}</span>
            <span>Target: {hasTarget ? fmtUSD(profitTarget) : '$0.00'}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-[1.5px]">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-glow-emerald'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-600 shadow-glow-cyan'
              }`}
              style={{ width: `${Math.min(clampedProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Right: Key Stats Pills */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto flex-wrap">
          {/* Target Goal */}
          <div className="card-inner px-2.5 py-1 text-center">
            <span className="text-[9px] font-bold tm uppercase block leading-none">Goal</span>
            <span className="text-xs font-black tp tabular-nums">
              {hasTarget ? fmtUSD(profitTarget) : '$0.00'}
            </span>
          </div>

          {/* Remaining */}
          <div className="card-inner px-2.5 py-1 text-center">
            <span className="text-[9px] font-bold tm uppercase block leading-none">Remaining</span>
            <span
              className={`text-xs font-black tabular-nums ${
                isGoalReached
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : remaining > 0
                  ? 'text-slate-700 dark:text-slate-200'
                  : 'text-slate-400'
              }`}
            >
              {isGoalReached ? 'Completed 🎉' : hasTarget ? fmtUSD(remaining) : '$0.00'}
            </span>
          </div>

          {/* Daily Pace */}
          <div className="card-inner px-2.5 py-1 text-center hidden sm:block">
            <span className="text-[9px] font-bold tm uppercase block leading-none">Daily Pace</span>
            <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
              ${parseNum(effectiveDailyTarget).toFixed(2)}/d
            </span>
          </div>

          {/* Settings Dropdown */}
          <SettingsDropdown month={month} onUpdateMonth={onUpdateMonth} />
        </div>
      </div>
    </div>
  );
}
