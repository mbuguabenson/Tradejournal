import { Target, Settings, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fmtUSD, parseNum } from '@/utils';
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
  const [showSettings, setShowSettings] = useState(false);
  const [sessionInput, setSessionInput] = useState(String(month.sessionCount));

  const monthlyTarget = parseNum(month.monthlyTarget);
  const startingCapital = parseNum(month.startingCapital);
  const profitTarget = monthlyTarget - startingCapital;
  const progress = profitTarget > 0 ? Math.min((finalCumulative / profitTarget) * 100, 100) : 0;
  const clampedProgress = Math.max(0, progress);
  const remaining = profitTarget - finalCumulative;

  const daysInMonth = month.rows?.length || 30;
  const autoDaily = profitTarget > 0 ? (profitTarget / daysInMonth).toFixed(0) : '0';
  const effectiveDailyTarget = month.dailyTarget !== undefined && month.dailyTarget !== '' ? month.dailyTarget : autoDaily;
  const [dailyTargetInput, setDailyTargetInput] = useState(effectiveDailyTarget);

  // Sync state when month changes
  useEffect(() => {
    setSessionInput(String(month.sessionCount));
    setDailyTargetInput(month.dailyTarget !== undefined && month.dailyTarget !== '' ? month.dailyTarget : autoDaily);
  }, [month.sessionCount, month.dailyTarget, autoDaily]);

  // Mini Circular Gauge calculation
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const applySettings = () => {
    const n = Math.max(1, Math.min(10, parseInt(sessionInput) || 3));
    onUpdateMonth({
      sessionCount: n,
      dailyTarget: dailyTargetInput,
    });
    setShowSettings(false);
  };

  return (
    <div className="card mx-2 sm:mx-4 mb-2 sm:mb-2.5 px-3 py-1.5 sm:py-2 backdrop-blur-xl relative overflow-hidden">
      {/* Subtle top iridescent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-60" />

      {/* ONE SINGLE HORIZONTAL LINE ACROSS SCREEN BELOW HEADER */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
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
            <span className="absolute text-[8px] font-black tp tabular-nums">
              {progress.toFixed(0)}%
            </span>
          </div>
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider hidden lg:inline">
            {progress >= 100 ? 'Achieved' : 'Reached'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0 hidden sm:block" />

        {/* Metric 1: Profit Target */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Profit Target:</span>
          <span className="text-xs font-black tp tabular-nums">{fmtUSD(profitTarget)}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0 hidden sm:block" />

        {/* Metric 2: Cumulative */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Cumulative:</span>
          <span className={`text-xs font-black tabular-nums ${finalCumulative >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {fmtUSD(finalCumulative)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0 hidden sm:block" />

        {/* Metric 3: Surplus / Remaining */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">
            {remaining > 0 ? 'Remaining:' : 'Surplus:'}
          </span>
          <span className={`text-xs font-black tabular-nums ${remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {fmtUSD(Math.abs(remaining))}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0 hidden sm:block" />

        {/* Metric 4: Target Capital */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Target Capital:</span>
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
            {fmtUSD(monthlyTarget)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0 hidden lg:block" />

        {/* Progress Bar & Percentage */}
        <div className="items-center gap-2 shrink-0 hidden lg:flex">
          <span className="text-[10px] font-bold tm uppercase">Completion:</span>
          <div className="progress-track w-20 xl:w-28 h-2">
            <div
              className="h-full rounded-full progress-bar-gradient transition-all duration-700"
              style={{ width: `${Math.max(progress, 1)}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
            {progress.toFixed(0)}%
          </span>
        </div>

        {/* Daily Target Goal */}
        <div className="items-baseline gap-1.5 shrink-0 hidden md:flex">
          <span className="text-[10px] font-bold tm uppercase tracking-wider">Daily Goal:</span>
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
            ${parseNum(effectiveDailyTarget).toFixed(2)}
          </span>
        </div>

        {/* Sessions & Settings Button */}
        <div className="shrink-0 ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary px-2 py-1 flex items-center gap-1 text-[10px] font-bold rounded-lg"
            title="Configure sessions and daily target goal"
          >
            <Settings className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>Settings ({month.sessionCount}S)</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowSettings(false)}
        >
          <div className="card p-5 w-full max-w-xs animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold tp flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Challenge Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="btn-secondary w-7 h-7 flex items-center justify-center rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Daily Trading Sessions (1 to 10):
                </label>
                <div className="card-inner p-1.5 flex items-center gap-2">
                  <button
                    onClick={() => setSessionInput((s) => String(Math.max(1, parseInt(s) - 1)))}
                    className="btn-secondary w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sessionInput}
                    onChange={(e) => setSessionInput(e.target.value)}
                    className="flex-1 bg-transparent text-center text-base font-black tp tabular-nums focus:outline-none"
                  />
                  <button
                    onClick={() => setSessionInput((s) => String(Math.min(10, parseInt(s) + 1)))}
                    className="btn-secondary w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Daily Target Goal ($):
                </label>
                <div className="card-inner p-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600 dark:text-cyan-400 font-black text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={autoDaily}
                    value={dailyTargetInput}
                    onChange={(e) => setDailyTargetInput(e.target.value)}
                    className="flex-1 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  Auto-calculated pace: ${autoDaily || '0'}/day based on target.
                </p>
              </div>
            </div>

            <button
              onClick={applySettings}
              className="btn-primary w-full py-2 text-xs font-bold rounded-lg shadow-glow-primary"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
