import { useState, useRef, useEffect, useMemo } from 'react';
import {
  History,
  ChevronDown,
  ChevronRight,
  Calendar,
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  FileText,
  Clock,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  fmtUSD,
  getMonthLabel,
  getMonthShort,
  computeRows,
  computeStats,
  formatDayDate,
  parseNum,
} from '@/utils';
import { STRATEGIES } from '@/types';
import type { TrackerData } from '@/types';

type Props = {
  data: TrackerData;
  currentMonthKey: string;
  selectedMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  onNewMonth: () => void;
  onOpenProfitSheet?: () => void;
};

export default function HistoryDropdown({
  data,
  currentMonthKey,
  selectedMonthKey,
  onSelectMonth,
  onNewMonth,
  onOpenProfitSheet,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMonthKey, setExpandedMonthKey] = useState<string | null>(selectedMonthKey);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sorted months in reverse chronological order (newest first)
  const sortedMonthKeys = useMemo(() => {
    return Object.keys(data).sort((a, b) => b.localeCompare(a));
  }, [data]);

  // Overall multi-month stats
  const historyStats = useMemo(() => {
    let totalProfit = 0;
    let totalTrades = 0;
    let totalWins = 0;

    for (const key of sortedMonthKeys) {
      const month = data[key];
      if (!month) continue;
      const computed = computeRows(month.rows);
      for (const row of computed) {
        const hasData = row.sessions.some((s) => s !== '');
        if (hasData) {
          totalTrades++;
          totalProfit += row.profitLoss;
          if (row.profitLoss > 0) totalWins++;
        }
      }
    }

    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    return {
      monthCount: sortedMonthKeys.length,
      totalTrades,
      totalProfit,
      winRate,
    };
  }, [data, sortedMonthKeys]);

  const pastMonthsCount = sortedMonthKeys.filter((k) => k !== currentMonthKey).length;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* LEFT DROPDOWN TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 border ${
          isOpen
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-glow-cyan'
            : 'card-inner text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30'
        }`}
        title="View previous data and trade history"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-5 h-5 rounded-md flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <History className="w-3 h-3" />
        </div>
        <span className="font-extrabold tracking-tight">Trade History</span>

        {/* Count Badge */}
        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 tabular-nums">
          {sortedMonthKeys.length} {sortedMonthKeys.length === 1 ? 'mo' : 'mos'}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-500' : ''
          }`}
        />
      </button>

      {/* DROPDOWN FLYOUT PANEL */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[340px] sm:w-[410px] max-h-[85vh] sm:max-h-[620px] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-3 sm:p-3.5 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black tp uppercase tracking-wider leading-none">
                    Previous Data & Trade History
                  </h3>
                  <p className="text-[10px] font-semibold ts mt-0.5">
                    Browse past months and view trade details
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              <div className="card-inner p-1.5 text-center">
                <span className="text-[9px] font-bold tm uppercase block">Total Net</span>
                <span
                  className={`text-xs font-black tabular-nums ${
                    historyStats.totalProfit >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {fmtUSD(historyStats.totalProfit)}
                </span>
              </div>
              <div className="card-inner p-1.5 text-center">
                <span className="text-[9px] font-bold tm uppercase block">Win Rate</span>
                <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {historyStats.winRate.toFixed(0)}%
                </span>
              </div>
              <div className="card-inner p-1.5 text-center">
                <span className="text-[9px] font-bold tm uppercase block">Logged Days</span>
                <span className="text-xs font-black tp tabular-nums">
                  {historyStats.totalTrades} days
                </span>
              </div>
            </div>

            {/* Add Past Month & Actions */}
            <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-200/40 dark:border-white/5">
              <label className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 cursor-pointer transition-colors border border-cyan-500/20">
                <Calendar className="w-3 h-3" />
                <span>+ Add Past Month</span>
                <input
                  type="month"
                  onChange={(e) => {
                    if (e.target.value) {
                      onSelectMonth(e.target.value);
                      setExpandedMonthKey(e.target.value);
                    }
                  }}
                  className="sr-only"
                />
              </label>

              <button
                onClick={() => {
                  onNewMonth();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                title="Add next month"
              >
                <Plus className="w-3 h-3 text-cyan-500" />
                <span>Next Month</span>
              </button>
            </div>
          </div>

          {/* Month List & Previous Trades Stream */}
          <div className="p-2 sm:p-2.5 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar">
            {sortedMonthKeys.map((key) => {
              const monthData = data[key];
              const isSelected = key === selectedMonthKey;
              const isCurrent = key === currentMonthKey;
              const isExpanded = expandedMonthKey === key;

              const computed = computeRows(monthData.rows);
              const stats = computeStats(computed);
              const finalCum =
                computed.length > 0 ? computed[computed.length - 1].cumulativeProfit : 0;
              const loggedTrades = computed.filter((r) =>
                r.sessions.some((s) => s !== '')
              );

              return (
                <div
                  key={key}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'border-cyan-500/50 bg-cyan-500/5 dark:bg-cyan-950/20 shadow-sm'
                      : 'border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  {/* Month Card Header */}
                  <div className="p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMonthKey(isExpanded ? null : key)
                        }
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-transform"
                        title={isExpanded ? 'Collapse trades' : 'Expand previous trades'}
                      >
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90 text-cyan-500' : ''
                          }`}
                        />
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black tp">{getMonthLabel(key)}</span>
                          {isCurrent ? (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                              Current
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700/70 tm">
                              Past
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-medium ts mt-0.5">
                          <span>
                            {loggedTrades.length}/{computed.length} days logged
                          </span>
                          <span>•</span>
                          <span>{stats.winRate.toFixed(0)}% WR</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Profit pill */}
                      <span
                        className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-lg ${
                          finalCum >= 0
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {fmtUSD(finalCum)}
                      </span>

                      {/* Select / Active Button */}
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-cyan-500 text-white shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectMonth(key);
                            setIsOpen(false);
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 transition-colors"
                        >
                          Load
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDABLE PREVIOUS HISTORY OF TRADES LIST */}
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-200/40 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 animate-fade-in">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Trades Breakdown ({loggedTrades.length} logged)
                        </span>

                        {!isSelected && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectMonth(key);
                              setIsOpen(false);
                            }}
                            className="text-[9px] font-extrabold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                          >
                            Open on Dashboard <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {loggedTrades.length === 0 ? (
                        <div className="py-2.5 text-center card-inner">
                          <p className="text-[10px] font-semibold ts">
                            No trades recorded yet for {getMonthShort(key)}.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectMonth(key);
                              setIsOpen(false);
                            }}
                            className="mt-1 text-[10px] font-extrabold text-cyan-600 hover:underline"
                          >
                            + Start entering trades
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                          {loggedTrades.map((t) => {
                            const dateInfo = formatDayDate(key, t.day);
                            const stratInfo = STRATEGIES.find((s) => s.value === t.strategy);

                            return (
                              <div
                                key={t.day}
                                className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 hover:border-cyan-500/20 text-[10px] transition-colors"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 w-14 shrink-0">
                                    {dateInfo.formatted}
                                  </span>
                                  {stratInfo && stratInfo.value !== 'none' && (
                                    <span
                                      className="px-1 py-0.2 rounded text-[8px] font-extrabold text-white shrink-0"
                                      style={{ backgroundColor: stratInfo.color }}
                                    >
                                      {stratInfo.short}
                                    </span>
                                  )}
                                  {t.note && (
                                    <span
                                      className="text-slate-400 truncate max-w-[120px] sm:max-w-[160px]"
                                      title={t.note}
                                    >
                                      {t.note}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {parseNum(t.withdrawn) > 0 && (
                                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                      -W: ${parseNum(t.withdrawn)}
                                    </span>
                                  )}
                                  <span
                                    className={`font-black tabular-nums flex items-center gap-0.5 ${
                                      t.profitLoss >= 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    {t.profitLoss >= 0 ? (
                                      <TrendingUp className="w-2.5 h-2.5" />
                                    ) : (
                                      <TrendingDown className="w-2.5 h-2.5" />
                                    )}
                                    {fmtUSD(t.profitLoss)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-2 sm:p-2.5 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-[10px] font-bold">
            <button
              type="button"
              onClick={() => {
                onSelectMonth(currentMonthKey);
                setIsOpen(false);
              }}
              className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Clock className="w-3 h-3" /> Jump to Current ({getMonthShort(currentMonthKey)})
            </button>

            {onOpenProfitSheet && (
              <button
                type="button"
                onClick={() => {
                  onOpenProfitSheet();
                  setIsOpen(false);
                }}
                className="text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-0.5"
              >
                <span>Full Portfolio</span> <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
