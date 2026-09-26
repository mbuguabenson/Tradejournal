import { TrendingUp, Moon, Sun, RotateCcw, Wallet, Target, Plus, LayoutGrid, BarChart3, Bell, Sparkles, Clock, ChevronLeft, ChevronRight, Calendar, Download, Upload, ShieldCheck, Cloud, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMonthLabel, getMonthShort } from '@/utils';
import HistoryDropdown from '@/components/HistoryDropdown';
import SettingsDropdown from '@/components/SettingsDropdown';
import type { MonthData, TrackerData } from '@/types';

type Page = 'dashboard' | 'profit-sheet';

type Props = {
  darkMode: boolean;
  toggleDark: () => void;
  page: Page;
  onPageChange: (page: Page) => void;
  onReset: () => void;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
  onOpenBackupModal?: () => void;
  supabaseConnected?: boolean;
  onNewMonth: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  allMonthKeys: string[];
  monthKey: string;
  currentMonthKey: string;
  onMonthChange: (key: string) => void;
  month: MonthData;
  onUpdateMonth: (patch: Partial<MonthData>) => void;
  data: TrackerData;
};

export default function Header({
  darkMode,
  toggleDark,
  page,
  onPageChange,
  onReset,
  onExportData,
  onImportData,
  onOpenBackupModal,
  supabaseConnected,
  onNewMonth,
  onPrevMonth,
  onNextMonth,
  allMonthKeys,
  monthKey,
  currentMonthKey,
  onMonthChange,
  month,
  onUpdateMonth,
  data,
}: Props) {
  // Live ticking date and time in header
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateFormatted = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatted = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const isHistorical = monthKey !== currentMonthKey;

  return (
    <header className="card mx-2 sm:mx-4 mt-2 sm:mt-3 mb-2 sm:mb-2.5 p-2.5 sm:p-3 relative z-30 backdrop-blur-xl">
      {/* Subtle top iridescent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-80 rounded-t-2xl" />

      <div className="flex flex-col gap-2">
        {/* Top bar: Title + Live Clock + Segmented pill tabs + Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Current Date in Header Top Left */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-glow-cyan text-white shadow-sm shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase leading-none block">
                Today's Date
              </span>
              <h1 className="text-xs sm:text-sm font-black tp tracking-tight leading-tight">
                {dateFormatted}
              </h1>
            </div>
          </div>

          {/* Live Digital Clock Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-[10px] sm:text-[11px] font-extrabold tabular-nums shadow-sm">
            <Clock className="w-3 h-3 text-cyan-500 shrink-0" />
            <span className="font-mono text-cyan-600 dark:text-cyan-300 font-black">{timeFormatted}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-0.5 shrink-0" />
          </div>

          {/* Controls: Segmented Pills + Buttons */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {/* Segmented Pill Switcher */}
            <div className="inline-flex p-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-white/60 dark:border-white/10 shadow-inner">
              <button
                onClick={() => onPageChange('dashboard')}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1 transition-all duration-200 ${
                  page === 'dashboard'
                    ? 'btn-pill-active'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" /> <span className="hidden xs:inline">Dashboard</span>
              </button>
              <button
                onClick={() => onPageChange('profit-sheet')}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1 transition-all duration-200 ${
                  page === 'profit-sheet'
                    ? 'btn-pill-active'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3 h-3" /> <span className="hidden xs:inline">Past Data & History</span>
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDark}
              className="btn-secondary w-7 h-7 flex items-center justify-center rounded-lg"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-cyan-600" />}
            </button>

            {/* Backup & Supabase Cloud Sync Center Button */}
            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className={`btn-secondary px-2.5 h-7 flex items-center gap-1.5 text-[10px] font-bold rounded-lg shadow-sm transition-all ${
                  supabaseConnected
                    ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15'
                    : 'text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 hover:border-cyan-500/60 hover:bg-cyan-500/10'
                }`}
                title="Supabase Cloud & Backup Center"
              >
                <Database className="w-3 h-3" />
                <span>{supabaseConnected ? 'Supabase: Synced' : 'Supabase Sync'}</span>
                {supabaseConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              </button>
            )}

            {/* Backup / Export Button */}
            {onExportData && (
              <button
                onClick={onExportData}
                className="btn-secondary px-2 h-7 flex items-center gap-1 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-300"
                title="Quick backup to JSON file"
              >
                <Download className="w-3 h-3" /> <span className="hidden md:inline">Export</span>
              </button>
            )}

            {/* Restore / Import Button */}
            {onImportData && (
              <label
                className="btn-secondary px-2 h-7 flex items-center gap-1 text-[10px] font-bold rounded-lg cursor-pointer"
                title="Restore data from JSON backup file"
              >
                <Upload className="w-3 h-3 text-slate-500" /> <span className="hidden md:inline">Restore</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      onImportData(f);
                      e.target.value = '';
                    }
                  }}
                  className="sr-only"
                />
              </label>
            )}

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="btn-secondary px-2 h-7 flex items-center gap-1 text-[10px] font-bold rounded-lg"
              title="Reset all days to zero"
            >
              <RotateCcw className="w-3 h-3" /> <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Second bar: Historical Month Navigator & Starting Capital & Monthly Target inputs */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/40 dark:border-white/5 flex-wrap">
          {/* Month Navigator Controls & Left Trade History Dropdown */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* LEFT DROPDOWN FOR PREVIOUS DATA WITH PREVIOUS HISTORY OF TRADES */}
            <HistoryDropdown
              data={data}
              currentMonthKey={currentMonthKey}
              selectedMonthKey={monthKey}
              onSelectMonth={onMonthChange}
              onNewMonth={onNewMonth}
              onOpenProfitSheet={() => onPageChange('profit-sheet')}
            />

            <div className="flex items-center gap-1 card-inner px-2 py-1">
              <button
                onClick={onPrevMonth}
                className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                title="View previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-1">
                <label className="cursor-pointer text-cyan-600 dark:text-cyan-400 hover:scale-110 transition-transform p-0.5" title="Jump to or add any past or future month">
                  <Calendar className="w-3.5 h-3.5" />
                  <input
                    type="month"
                    value={monthKey}
                    onChange={(e) => {
                      if (e.target.value) onMonthChange(e.target.value);
                    }}
                    className="sr-only"
                  />
                </label>
                <select
                  value={monthKey}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="bg-transparent text-xs font-black tp cursor-pointer focus:outline-none"
                >
                  {allMonthKeys.map((k) => (
                    <option key={k} value={k} className="text-slate-800 bg-white">
                      {getMonthLabel(k)} {k === currentMonthKey ? '• (Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onNextMonth}
                className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                title="View next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNewMonth}
                className="w-5 h-5 rounded flex items-center justify-center text-cyan-600 hover:bg-cyan-500/10 transition-colors ml-0.5"
                title="Create / add new month"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Historical Month Alert Badge */}
            {isHistorical && (
              <button
                onClick={() => onMonthChange(currentMonthKey)}
                className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                title="Jump back to the current active month"
              >
                Viewing Past Data • Click to Return to Current Month
              </button>
            )}
          </div>

          {/* Capital and Target Inputs */}
          {page === 'dashboard' && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="card-inner px-2.5 py-1 flex items-center gap-1.5 text-xs">
                <Wallet className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="text-[10px] font-bold tm uppercase">Capital:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-black text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={month.startingCapital}
                  onChange={(e) => onUpdateMonth({ startingCapital: e.target.value })}
                  className="w-16 sm:w-20 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div className="card-inner px-2.5 py-1 flex items-center gap-1.5 text-xs">
                <Target className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-[10px] font-bold tm uppercase">Target:</span>
                <span className="text-blue-600 dark:text-blue-400 font-black text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={month.monthlyTarget}
                  onChange={(e) => onUpdateMonth({ monthlyTarget: e.target.value })}
                  className="w-16 sm:w-20 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Settings Dropdown for Sessions & Target */}
              <SettingsDropdown month={month} onUpdateMonth={onUpdateMonth} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
