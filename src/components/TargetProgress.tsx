import { Target } from 'lucide-react';
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
  const progress = profitTarget > 0 ? Math.min((finalCumulative / profitTarget) * 100, 100) : 0;
  const clampedProgress = Math.max(0, progress);
  const remaining = profitTarget - finalCumulative;

  const daysInMonth = month.rows?.length || 30;
  const autoDaily = profitTarget > 0 ? (profitTarget / daysInMonth).toFixed(0) : '0';
  const effectiveDailyTarget = month.dailyTarget !== undefined && month.dailyTarget !== '' ? month.dailyTarget : autoDaily;

  // Mini Circular Gauge calculation
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="card mx-2 sm:mx-4 mb-2 sm:mb-2.5 px-3 py-1.5 sm:py-2 backdrop-blur-xl relative z-20">
      {/* Subtle top iridescent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-60 rounded-t-2xl" />

      {/* ONE SINGLE HORIZONTAL LINE ACROSS SCREEN BELOW HEADER */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black tp whitespace-nowrap hidden md:inline">
            Monthly Target Milestone
          </span>
        </div>

        {/* Circular Gauge Ring */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 40 40">
              <defs>
                <linearGradient id="miniCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D2FF" />
                  <stop offset="100%" stopColor="#0077FF" />
                </linearGradient>
              </defs>
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="text-slate-200/70 dark:text-slate-800/80"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke="url(#miniCircleGrad)"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <span className="absolute text-[9px] font-black text-slate-800 dark:text-slate-100 tabular-nums">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Profit Target Metric */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Milestone:</span>
          <span className="text-xs font-black tp tabular-nums">
            {fmtUSD(profitTarget)}
          </span>
        </div>

        {/* Current Accumulated Profit */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Current P/L:</span>
          <span
            className={`text-xs font-black tabular-nums ${
              finalCumulative >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {fmtUSD(finalCumulative)}
          </span>
        </div>

        {/* Remaining to Goal */}
        <div className="items-baseline gap-1.5 shrink-0 hidden sm:flex">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Remaining:</span>
          <span
            className={`text-xs font-black tabular-nums ${
              remaining <= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {remaining <= 0 ? 'Goal Achieved! 🎉' : fmtUSD(remaining)}
          </span>
        </div>

        {/* Slim Horizontal Progress Bar in the line */}
        <div className="flex-1 min-w-[80px] max-w-xs h-2 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden shrink-0 hidden lg:block">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(clampedProgress, 100)}%` }}
          />
        </div>

        {/* Daily Target Goal */}
        <div className="items-baseline gap-1.5 shrink-0 hidden md:flex">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Daily Goal:</span>
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
            ${parseNum(effectiveDailyTarget).toFixed(2)}
          </span>
        </div>

        {/* Sessions & Settings Dropdown */}
        <div className="shrink-0 ml-auto flex items-center gap-1.5">
          <SettingsDropdown month={month} onUpdateMonth={onUpdateMonth} />
        </div>
      </div>
    </div>
  );
}
