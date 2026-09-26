import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import TargetProgress from '@/components/TargetProgress';
import SummaryCards from '@/components/SummaryCards';
import TradingTable from '@/components/TradingTable';
import Analysis from '@/components/Analysis';
import ProfitSheetPage from '@/components/ProfitSheetPage';
import {
  parseNum,
  getMonthKey,
  shiftMonth,
  computeRows,
  computeTotals,
  computeStats,
  createEmptyMonth,
  createEmptyRows,
  createSampleMonth,
} from '@/utils';
import type { TrackerData, MonthData, Strategy } from '@/types';

type Page = 'dashboard' | 'profit-sheet';

const STORAGE_KEY = 'trading-tracker-live';

// Automatically clean up any old test versions from storage
try {
  ['trading-tracker-v1', 'trading-tracker-v2', 'trading-tracker-v3', 'trading-tracker-v4'].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch {}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tt-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const [page, setPage] = useState<Page>('dashboard');

  const currentMonthKey = useMemo(() => getMonthKey(new Date()), []);

  const [data, setData] = useState<TrackerData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data && typeof parsed.data === 'object' && Object.keys(parsed.data).length > 0) {
          return parsed.data;
        }
      } catch {}
    }
    // Completely blank, zero data slate for personal use
    return { [currentMonthKey]: createEmptyMonth(currentMonthKey) };
  });

  const [monthKey, setMonthKey] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lastMonth && parsed.data?.[parsed.lastMonth]) return parsed.lastMonth;
      } catch {}
    }
    return currentMonthKey;
  });

  // Toggleable Sections
  const [sections, setSections] = useState({
    summary: true,
    analysis: true,
    table: true,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('tt-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, lastMonth: monthKey }));
  }, [data, monthKey]);

  const month: MonthData = data[monthKey] ?? createEmptyMonth(monthKey);

  const computed = useMemo(() => computeRows(month.rows), [month.rows]);
  const totals = useMemo(() => computeTotals(computed, month.sessionCount), [computed, month.sessionCount]);
  const finalCumulative = computed.length > 0 ? computed[computed.length - 1].cumulativeProfit : 0;
  const stats = useMemo(() => computeStats(computed), [computed]);

  const profitTarget = parseNum(month.monthlyTarget) - parseNum(month.startingCapital);
  const dailyTargetGoal = parseNum(month.dailyTarget) || (profitTarget > 0 ? profitTarget / (month.rows?.length || 30) : 0);

  function updateMonth(patch: Partial<MonthData>) {
    setData((prev) => ({ ...prev, [monthKey]: { ...month, ...patch } }));
  }

  function updateRow(idx: number, field: string, value: string) {
    setData((prev) => {
      const m = prev[monthKey] ?? createEmptyMonth(monthKey);
      const rows = [...m.rows];
      const row = { ...rows[idx] };
      if (field.startsWith('session_')) {
        const si = parseInt(field.split('_')[1]);
        const sessions = [...row.sessions];
        while (sessions.length <= si) sessions.push('');
        sessions[si] = value;
        row.sessions = sessions;
      } else {
        (row as unknown as Record<string, string>)[field] = value;
      }
      rows[idx] = row;
      return { ...prev, [monthKey]: { ...m, rows } };
    });
  }

  function updateRowStrategy(idx: number, strategy: Strategy) {
    setData((prev) => {
      const m = prev[monthKey] ?? createEmptyMonth(monthKey);
      const rows = [...m.rows];
      rows[idx] = { ...rows[idx], strategy };
      return { ...prev, [monthKey]: { ...m, rows } };
    });
  }

  function updateRowNote(idx: number, note: string) {
    setData((prev) => {
      const m = prev[monthKey] ?? createEmptyMonth(monthKey);
      const rows = [...m.rows];
      rows[idx] = { ...rows[idx], note };
      return { ...prev, [monthKey]: { ...m, rows } };
    });
  }

  function changeMonth(key: string) {
    setMonthKey(key);
    if (!data[key]) {
      setData((prev) => ({ ...prev, [key]: createEmptyMonth(key) }));
    }
  }

  function prevMonth() {
    const targetKey = shiftMonth(monthKey, -1);
    changeMonth(targetKey);
  }

  function nextMonth() {
    const targetKey = shiftMonth(monthKey, 1);
    changeMonth(targetKey);
  }

  function newMonth() {
    const allMonths = Object.keys(data).sort();
    const lastMonth = allMonths.length > 0 ? allMonths[allMonths.length - 1] : currentMonthKey;
    const nextKey = shiftMonth(lastMonth, 1);
    changeMonth(nextKey);
    setPage('dashboard');
  }

  function resetMonth() {
    if (confirm('Reset all data for this month to empty? This cannot be undone.')) {
      setData((prev) => ({
        ...prev,
        [monthKey]: {
          ...createEmptyMonth(monthKey),
          startingCapital: '',
          monthlyTarget: '',
          sessionCount: month.sessionCount,
          rows: createEmptyRows(month.sessionCount, month.rows.length),
        },
      }));
    }
  }

  function exportData() {
    const jsonStr = JSON.stringify({ data, lastMonth: monthKey, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.data && typeof parsed.data === 'object') {
          setData(parsed.data);
          if (parsed.lastMonth && parsed.data[parsed.lastMonth]) {
            setMonthKey(parsed.lastMonth);
          }
          alert('Trading data backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
  }

  const allMonthKeys = Object.keys(data).sort();

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-cyan-500 selection:text-white pb-6">
      {/* Soft Ethereal Fluid Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-indigo-500/10 blur-[80px] animate-float-slow" />
        <div className="absolute top-1/4 -right-32 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-indigo-400/20 via-purple-300/20 to-cyan-400/20 blur-[90px]" />
        <div className="absolute bottom-10 left-1/3 w-[550px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-300/20 via-blue-500/15 to-transparent blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto">
        <Header
          darkMode={darkMode}
          toggleDark={() => setDarkMode((d) => !d)}
          page={page}
          onPageChange={setPage}
          onReset={resetMonth}
          onExportData={exportData}
          onImportData={importData}
          onNewMonth={newMonth}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          allMonthKeys={allMonthKeys}
          monthKey={monthKey}
          currentMonthKey={currentMonthKey}
          onMonthChange={changeMonth}
          month={month}
          onUpdateMonth={updateMonth}
          data={data}
        />

        {/* Target Milestone Bar + Key Financial Metrics Bar Directly Below Header */}
        {page === 'dashboard' && (
          <>
            <TargetProgress
              month={month}
              finalCumulative={finalCumulative}
              onUpdateMonth={updateMonth}
            />

            {/* REDUCED KEY FINANCIAL METRICS BAR DIRECTLY BELOW TARGET MILESTONE */}
            <SummaryCards
              totals={totals}
              finalCumulative={finalCumulative}
              startingCapital={parseNum(month.startingCapital)}
              stats={stats}
            />
          </>
        )}

        {page === 'dashboard' ? (
          <>
            {/* Quick View Controls for Split View with Collapsible Panes */}
            <div className="flex items-center justify-between gap-2 px-2 sm:px-4 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold tm uppercase tracking-wider">Quick Views:</span>
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-white/60 dark:border-white/10 shadow-inner">
                  <button
                    onClick={() => setSections({ summary: true, analysis: true, table: true })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      sections.analysis && sections.table
                        ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSections({ summary: true, analysis: false, table: true })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      !sections.analysis && sections.table
                        ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Daily Log
                  </button>
                  <button
                    onClick={() => setSections({ summary: true, analysis: true, table: false })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      sections.analysis && !sections.table
                        ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Charts
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() =>
                    setSections((prev) => {
                      const allOpen = prev.analysis && prev.table;
                      return { summary: true, analysis: !allOpen, table: !allOpen };
                    })
                  }
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md btn-secondary"
                >
                  {sections.analysis && sections.table ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>

            {/* Split View: Left (Wave Analytics & Strategy Pie Chart) + Right (Daily Trading Log) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 sm:gap-3 px-2 sm:px-4 items-start">
              {/* Left Column (5 cols on xl): Wave Analytics with Trade Data & Strategy Pie Chart */}
              {sections.analysis && (
                <div className={`${sections.table ? 'xl:col-span-5' : 'xl:col-span-12'} flex flex-col gap-2.5 sm:gap-3`}>
                  <Analysis
                    data={data}
                    currentMonthKey={monthKey}
                    isOpen={sections.analysis}
                    onToggle={() => setSections((s) => ({ ...s, analysis: !s.analysis }))}
                  />
                </div>
              )}

              {/* Right Column (7 cols on xl): Daily Trading Log with Real Dates & Internal Scroll */}
              {sections.table && (
                <div className={sections.analysis ? 'xl:col-span-7' : 'xl:col-span-12'}>
                  <TradingTable
                    computed={computed}
                    sessionCount={month.sessionCount}
                    monthKey={monthKey}
                    totals={totals}
                    finalCumulative={finalCumulative}
                    dailyTargetGoal={dailyTargetGoal}
                    onUpdateRow={updateRow}
                    onUpdateRowStrategy={updateRowStrategy}
                    onUpdateRowNote={updateRowNote}
                    isOpen={sections.table}
                    onToggle={() => setSections((s) => ({ ...s, table: !s.table }))}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <ProfitSheetPage
            data={data}
            currentMonthKey={monthKey}
            onMonthChange={(k) => {
              changeMonth(k);
              setPage('dashboard');
            }}
          />
        )}
      </div>
    </div>
  );
}
