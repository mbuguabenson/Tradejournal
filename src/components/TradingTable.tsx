import { StickyNote, Calendar, FileText, CheckCircle2, ChevronDown, Check, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { fmtUSD, getStrategyColor, formatDayDate, parseNum } from '@/utils';
import type { ComputedDay, Strategy } from '@/types';
import { STRATEGIES } from '@/types';
import NoteModal from './NoteModal';

type Props = {
  computed: ComputedDay[];
  sessionCount: number;
  monthKey: string;
  totals: { dailyTarget: number; sessions: number[]; profitLoss: number; withdrawn: number };
  finalCumulative: number;
  dailyTargetGoal?: number;
  onUpdateRow: (idx: number, field: string, value: string) => void;
  onUpdateRowStrategy: (idx: number, strategy: Strategy) => void;
  onUpdateRowNote: (idx: number, note: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
};

export default function TradingTable({
  computed,
  sessionCount,
  monthKey,
  totals,
  finalCumulative,
  dailyTargetGoal = 0,
  onUpdateRow,
  onUpdateRowStrategy,
  onUpdateRowNote,
  isOpen = true,
  onToggle,
}: Props) {
  const [noteDay, setNoteDay] = useState<number | null>(null);
  const currentNoteRow = noteDay !== null ? computed[noteDay - 1] : null;

  // Count completed and reached days
  const completedCount = computed.filter((r) => r.sessions.some((s) => s !== '')).length;
  const reachedCount = computed.filter((r) => {
    const hasData = r.sessions.some((s) => s !== '');
    if (!hasData) return false;
    return dailyTargetGoal > 0 ? r.profitLoss >= dailyTargetGoal : r.profitLoss > 0;
  }).length;

  // Today's date ISO string (e.g. 2026-09-26)
  const todayISO = new Date().toISOString().split('T')[0];

  const cell = (value: string, onChange: (v: string) => void) => (
    <input
      type="number"
      step="0.01"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0"
      className="w-full h-5 px-1 py-0 text-[11px] font-bold tp tabular-nums text-right bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 rounded focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
    />
  );

  return (
    <div className="card w-full overflow-hidden backdrop-blur-xl transition-all duration-300">
      {/* Header section with badge & accordion toggle */}
      <div
        className="p-2.5 sm:p-3 flex items-center justify-between cursor-pointer select-none hover:bg-cyan-500/5 dark:hover:bg-cyan-400/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Calendar className="w-3 h-3" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold tp leading-tight">Daily Trading Log</h2>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-extrabold text-[10px] tabular-nums">
            {completedCount}/{computed.length} Days Logged • {reachedCount} Target Hits
          </span>

          {onToggle && (
            <button
              onClick={onToggle}
              className={`w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-label="Toggle Section"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-2 sm:p-2.5 pt-0 border-t border-slate-200/50 dark:border-white/5 animate-fade-in">
          {/* Scroll container configured to fit all 30 days cleanly in page */}
          <div className="overflow-auto max-h-[calc(100vh-215px)] min-h-[440px] rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-inner custom-scrollbar">
            <table className="w-full border-collapse min-w-[620px] text-xs">
              <thead className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
                <tr className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/60">
                  <th className="px-2 py-1.5 text-left w-28">Day & Date</th>
                  {Array.from({ length: sessionCount }, (_, i) => (
                    <th key={i} className="px-1 py-1.5 text-right w-14">S{i + 1}</th>
                  ))}
                  <th className="px-2 py-1.5 text-right w-18">P / L</th>
                  <th className="px-1.5 py-1.5 text-right w-14" title="Withdrawals (funds taken out)">W / D</th>
                  <th className="px-1 py-1.5 text-center w-12">Strat</th>
                  <th className="px-2 py-1.5 text-center w-20">Progress</th>
                  <th className="px-2 py-1.5 text-center w-24">Target Status</th>
                  <th className="px-1 py-1.5 text-center w-7"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {computed.map((r, idx) => {
                  const { formatted, weekday, isWeekend, fullDate } = formatDayDate(monthKey, r.day);
                  const isToday = fullDate === todayISO;
                  const hasData = r.sessions.some((s) => s !== '');

                  // Calculate Progress and Target Reached
                  const goal = dailyTargetGoal > 0 ? dailyTargetGoal : 0;
                  const targetProgressPct =
                    goal > 0 && r.profitLoss > 0
                      ? Math.min(100, Math.max(0, Math.round((r.profitLoss / goal) * 100)))
                      : r.profitLoss > 0
                      ? 100
                      : 0;
                  const isReached = goal > 0 ? r.profitLoss >= goal : r.profitLoss > 0;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-cyan-500/5 dark:hover:bg-cyan-400/5 transition-colors duration-100 ${
                        isToday
                          ? 'bg-cyan-500/10 dark:bg-cyan-400/10'
                          : isWeekend
                          ? 'bg-slate-50/40 dark:bg-slate-800/20'
                          : ''
                      }`}
                    >
                      {/* Balanced Day & Date Column */}
                      <td className="px-2 py-0.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 text-right text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                            {String(r.day).padStart(2, '0')}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700 text-[9px]">•</span>
                          <span
                            className={`w-7 text-center text-[9px] font-black uppercase rounded px-1 py-0.5 leading-none ${
                              isToday
                                ? 'bg-cyan-500 text-white font-black shadow-sm'
                                : isWeekend
                                ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                : 'bg-slate-100/90 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {weekday}
                          </span>
                          <span
                            className={`text-[10px] sm:text-[11px] font-extrabold tabular-nums ${
                              isToday ? 'text-cyan-600 dark:text-cyan-400 font-black' : 'tp'
                            }`}
                          >
                            {formatted}
                          </span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping ml-auto" title="Today" />
                          )}
                        </div>
                      </td>

                      {/* Sessions Inputs */}
                      {Array.from({ length: sessionCount }, (_, i) => (
                        <td key={i} className="px-0.5 py-0.5">
                          {cell(r.sessions[i] || '', (v) => onUpdateRow(idx, `session_${i}`, v))}
                        </td>
                      ))}

                      {/* Profit / Loss */}
                      <td
                        className={`px-2 py-0.5 text-right font-extrabold tabular-nums text-xs ${
                          r.profitLoss > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : r.profitLoss < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {r.profitLoss !== 0 ? fmtUSD(r.profitLoss) : '—'}
                      </td>

                      {/* Withdrawn */}
                      <td className="px-0.5 py-0.5">
                        {cell(r.withdrawn, (v) => onUpdateRow(idx, 'withdrawn', v))}
                      </td>

                      {/* Strategy */}
                      <td className="px-0.5 py-0.5 text-center">
                        <select
                          value={r.strategy}
                          onChange={(e) => onUpdateRowStrategy(idx, e.target.value as Strategy)}
                          className="text-[9px] font-bold h-5 px-0.5 rounded border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/80 focus:outline-none cursor-pointer"
                          style={{ color: getStrategyColor(r.strategy) }}
                        >
                          {STRATEGIES.map((s) => (
                            <option key={s.value} value={s.value} className="text-slate-800 bg-white">
                              {s.short}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Progress Bar right after Strat */}
                      <td className="px-1.5 py-0.5 text-center">
                        {hasData ? (
                          <div className="w-14 sm:w-16 mx-auto">
                            <div className="h-1.5 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/80 overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isReached
                                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-glow-cyan'
                                    : r.profitLoss > 0
                                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                                    : 'bg-transparent'
                                }`}
                                style={{ width: `${targetProgressPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 sm:w-16 mx-auto h-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50" />
                        )}
                      </td>

                      {/* Target Reached or Not (Replacing Cumulative) */}
                      <td className="px-1.5 py-0.5 text-center">
                        {!hasData ? (
                          <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">—</span>
                        ) : isReached ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Reached
                          </span>
                        ) : r.profitLoss > 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {targetProgressPct}%
                          </span>
                        ) : r.profitLoss < 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Missed
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                            Even
                          </span>
                        )}
                      </td>

                      {/* Note Button */}
                      <td className="px-0.5 py-0.5 text-center">
                        <button
                          onClick={() => setNoteDay(r.day)}
                          className={`w-4.5 h-4.5 flex items-center justify-center rounded transition-colors ${
                            r.note
                              ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                              : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={r.note || 'Add notes'}
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-t-2 border-slate-200 dark:border-white/10">
                <tr className="font-black text-[10px]">
                  <td className="px-2 py-1.5 text-left text-slate-600 dark:text-slate-300">TOTAL</td>
                  {Array.from({ length: sessionCount }, (_, i) => (
                    <td key={i} className="px-1 py-1.5 text-right tp tabular-nums">
                      {fmtUSD(totals.sessions[i] || 0)}
                    </td>
                  ))}
                  <td
                    className={`px-2 py-1.5 text-right tabular-nums ${
                      totals.profitLoss >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {fmtUSD(totals.profitLoss)}
                  </td>
                  <td className="px-1.5 py-1.5 text-right tp tabular-nums">{fmtUSD(totals.withdrawn)}</td>
                  <td className="px-1 py-1.5"></td>
                  <td className="px-1.5 py-1.5 text-center text-[9px] text-cyan-600 dark:text-cyan-400 font-extrabold">
                    {dailyTargetGoal > 0 ? `$${dailyTargetGoal.toFixed(0)} Goal` : '—'}
                  </td>
                  <td className="px-1.5 py-1.5 text-center text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {reachedCount}/{completedCount} Hit
                  </td>
                  <td className="px-1 py-1.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {currentNoteRow && (
        <NoteModal
          day={currentNoteRow.day}
          note={currentNoteRow.note}
          strategy={currentNoteRow.strategy}
          onSave={(note, strategy) => {
            onUpdateRowNote(currentNoteRow.day - 1, note);
            onUpdateRowStrategy(currentNoteRow.day - 1, strategy);
          }}
          onClose={() => setNoteDay(null)}
        />
      )}
    </div>
  );
}
