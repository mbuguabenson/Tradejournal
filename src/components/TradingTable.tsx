import { StickyNote, Calendar, FileText, CheckCircle2, ChevronDown, TrendingDown, TrendingUp, Filter, Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import { fmtUSD, getStrategyColor, formatDayDate, parseNum, exportMonthToCSV } from '@/utils';
import type { ComputedDay, Strategy } from '@/types';
import { STRATEGIES } from '@/types';
import NoteModal from './NoteModal';

type FilterType = 'all' | 'hit' | 'loss' | 'recovery' | 'notes';

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
  const [filter, setFilter] = useState<FilterType>('all');
  const currentNoteRow = noteDay !== null ? computed[noteDay - 1] : null;

  // Pre-calculate per-row flags so counts and filters are instant & consistent
  const rowMeta = useMemo(() => {
    return computed.map((r, idx) => {
      const hasData = r.sessions.some((s) => s !== '');
      const hadPriorLoss = computed.slice(0, idx).some(
        (prev) => prev.sessions.some((s) => s !== '') && prev.profitLoss < 0
      );
      const isLossDay = hasData && r.profitLoss < 0;
      const isRecoveryDay = hasData && r.profitLoss > 0 && hadPriorLoss;
      const isReached = hasData && (dailyTargetGoal > 0 ? r.profitLoss >= dailyTargetGoal : r.profitLoss > 0);
      const hasNote = Boolean(r.note && r.note.trim() !== '');

      return {
        hasData,
        hadPriorLoss,
        isLossDay,
        isRecoveryDay,
        isReached,
        hasNote,
      };
    });
  }, [computed, dailyTargetGoal]);

  // Overall metric counts
  const completedCount = rowMeta.filter((m) => m.hasData).length;
  const reachedCount = rowMeta.filter((m) => m.isReached).length;
  const lossCount = rowMeta.filter((m) => m.isLossDay).length;
  const recoveryCount = rowMeta.filter((m) => m.isRecoveryDay).length;
  const notesCount = rowMeta.filter((m) => m.hasNote).length;

  // Filtered rows for display
  const filteredComputed = useMemo(() => {
    if (filter === 'all') return computed;
    return computed.filter((_, idx) => {
      const meta = rowMeta[idx];
      if (filter === 'hit') return meta.isReached;
      if (filter === 'loss') return meta.isLossDay;
      if (filter === 'recovery') return meta.isRecoveryDay;
      if (filter === 'notes') return meta.hasNote;
      return true;
    });
  }, [computed, filter, rowMeta]);

  // Active totals for the visible view
  const activeTotals = useMemo(() => {
    if (filter === 'all') return totals;
    const t = { dailyTarget: 0, sessions: Array(sessionCount).fill(0), profitLoss: 0, withdrawn: 0 };
    for (const r of filteredComputed) {
      t.dailyTarget += parseNum(r.dailyTarget);
      t.profitLoss += r.profitLoss;
      t.withdrawn += parseNum(r.withdrawn);
      for (let i = 0; i < sessionCount; i++) {
        t.sessions[i] = (t.sessions[i] || 0) + parseNum(r.sessions[i]);
      }
    }
    return t;
  }, [filter, totals, filteredComputed, sessionCount]);

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
        <div className="p-2 sm:p-2.5 pt-0 border-t border-slate-200/50 dark:border-white/5 animate-fade-in flex flex-col gap-2">
          {/* Quick Filter Toolbar & CSV Export */}
          <div className="py-1.5 px-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 mr-0.5 shrink-0">
                <Filter className="w-2.5 h-2.5 text-cyan-500" /> Filter:
              </span>

              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shrink-0 ${
                  filter === 'all'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                All ({computed.length})
              </button>

              <button
                type="button"
                onClick={() => setFilter('hit')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                  filter === 'hit'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> Target Hit ({reachedCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter('loss')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                  filter === 'loss'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <TrendingDown className="w-2.5 h-2.5" /> Losses ({lossCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter('recovery')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                  filter === 'recovery'
                    ? 'bg-violet-500 text-white shadow-sm'
                    : 'text-violet-600 dark:text-violet-400 hover:bg-violet-500/10'
                }`}
              >
                <TrendingUp className="w-2.5 h-2.5" /> Recovered ({recoveryCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter('notes')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                  filter === 'notes'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <FileText className="w-2.5 h-2.5" /> Notes ({notesCount})
              </button>
            </div>

            {/* Excel / CSV Export button */}
            <button
              type="button"
              onClick={() => exportMonthToCSV(computed, monthKey, sessionCount, dailyTargetGoal)}
              className="px-2.5 py-1 text-[10px] font-extrabold flex items-center gap-1.5 rounded-lg border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/15 shadow-sm transition-all shrink-0"
              title="Download formatted CSV file for Excel or Google Sheets"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Scroll container configured to fit all 30 days cleanly in page */}
          <div className="overflow-auto max-h-[calc(100vh-250px)] min-h-[440px] rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-inner custom-scrollbar">
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
                  <th className="px-2 py-1.5 text-center w-20">Loss / Rec.</th>
                  <th className="px-1 py-1.5 text-center w-7"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredComputed.length === 0 ? (
                  <tr>
                    <td colSpan={sessionCount + 7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                        <Filter className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          No days match the active filter "{filter}".
                        </span>
                        <button
                          type="button"
                          onClick={() => setFilter('all')}
                          className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 hover:underline mt-0.5"
                        >
                          Reset to Show All ({computed.length}) Days
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredComputed.map((r) => {
                    const originalIdx = r.day - 1;
                    const hadPriorLoss = computed.slice(0, originalIdx).some(
                      (prev) => prev.sessions.some((s) => s !== '') && prev.profitLoss < 0
                    );
                    const isLossDay = r.sessions.some((s) => s !== '') && r.profitLoss < 0;
                    const isRecoveryDay = r.sessions.some((s) => s !== '') && r.profitLoss > 0 && hadPriorLoss;
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
                        key={r.day}
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
                            {cell(r.sessions[i] || '', (v) => onUpdateRow(originalIdx, `session_${i}`, v))}
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
                          {cell(r.withdrawn, (v) => onUpdateRow(originalIdx, 'withdrawn', v))}
                        </td>

                        {/* Strategy */}
                        <td className="px-0.5 py-0.5 text-center">
                          <select
                            value={r.strategy}
                            onChange={(e) => onUpdateRowStrategy(originalIdx, e.target.value as Strategy)}
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

                        {/* Loss / Recovery */}
                        <td className="px-1.5 py-0.5 text-center">
                          {!r.sessions.some((s) => s !== '') ? (
                            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">—</span>
                          ) : isLossDay ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                              <TrendingDown className="w-2.5 h-2.5" /> Loss
                            </span>
                          ) : isRecoveryDay ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25">
                              <TrendingUp className="w-2.5 h-2.5" /> Recovered
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">—</span>
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
                  })
                )}
              </tbody>
              <tfoot className="sticky bottom-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-t-2 border-slate-200 dark:border-white/10">
                <tr className="font-black text-[10px]">
                  <td className="px-2 py-1.5 text-left text-slate-600 dark:text-slate-300">
                    {filter === 'all' ? 'TOTAL' : `TOTAL (${filteredComputed.length}D)`}
                  </td>
                  {Array.from({ length: sessionCount }, (_, i) => (
                    <td key={i} className="px-1 py-1.5 text-right tp tabular-nums">
                      {fmtUSD(activeTotals.sessions[i] || 0)}
                    </td>
                  ))}
                  <td
                    className={`px-2 py-1.5 text-right tabular-nums ${
                      activeTotals.profitLoss >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {fmtUSD(activeTotals.profitLoss)}
                  </td>
                  <td className="px-1.5 py-1.5 text-right tp tabular-nums">{fmtUSD(activeTotals.withdrawn)}</td>
                  <td className="px-1 py-1.5"></td>
                  <td className="px-1.5 py-1.5 text-center text-[9px] text-cyan-600 dark:text-cyan-400 font-extrabold">
                    {dailyTargetGoal > 0 ? `$${dailyTargetGoal.toFixed(0)} Goal` : '—'}
                  </td>
                  <td className="px-1.5 py-1.5 text-center text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {reachedCount}/{completedCount} Hit
                  </td>
                  <td className="px-1.5 py-1.5 text-center text-[9px] font-bold text-slate-400">
                    {lossCount > 0 ? (
                      <span className="text-rose-500">{lossCount}L / <span className="text-violet-400">{recoveryCount}R</span></span>
                    ) : '—'}
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
