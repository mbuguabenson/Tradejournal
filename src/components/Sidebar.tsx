import React, { useState, useEffect } from 'react';
import {
  Settings,
  Target,
  Wallet,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Database,
  Download,
  Upload,
  ShieldCheck,
  RotateCcw,
  Sun,
  Moon,
  X,
  PanelLeftClose,
  BarChart3,
  TrendingUp,
  Cloud,
  Check,
  Award,
} from 'lucide-react';
import { fmtUSD, parseNum, getMonthLabel } from '@/utils';
import type { MonthData, TrackerData } from '@/types';
import { saveJournalToSupabase, loadJournalFromSupabase } from '@/supabase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  month: MonthData;
  monthKey: string;
  currentMonthKey: string;
  allMonthKeys: string[];
  onUpdateMonth: (patch: Partial<MonthData>) => void;
  onMonthChange: (key: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onNewMonth: () => void;
  finalCumulative: number;
  page: 'dashboard' | 'profit-sheet';
  onPageChange: (page: 'dashboard' | 'profit-sheet') => void;
  supabaseConnected: boolean;
  onOpenBackupModal: () => void;
  onReset: () => void;
  darkMode: boolean;
  toggleDark: () => void;
  data: TrackerData;
  onRestoreData?: (newData: TrackerData, newMonthKey?: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  month,
  monthKey,
  currentMonthKey,
  allMonthKeys,
  onUpdateMonth,
  onMonthChange,
  onPrevMonth,
  onNextMonth,
  onNewMonth,
  finalCumulative,
  page,
  onPageChange,
  supabaseConnected,
  onOpenBackupModal,
  onReset,
  darkMode,
  toggleDark,
  data,
  onRestoreData,
}: SidebarProps) {
  const [sessionInput, setSessionInput] = useState(String(month.sessionCount || 2));
  const [dailyTargetInput, setDailyTargetInput] = useState(month.dailyTarget || '');
  const [capitalInput, setCapitalInput] = useState(month.startingCapital || '');
  const [targetInput, setTargetInput] = useState(month.monthlyTarget || '');
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);

  useEffect(() => {
    setSessionInput(String(month.sessionCount || 2));
    setDailyTargetInput(month.dailyTarget || '');
    setCapitalInput(month.startingCapital || '');
    setTargetInput(month.monthlyTarget || '');
  }, [month]);

  // Target calculations
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

  function handleSaveConfigs() {
    const sCount = Math.max(1, Math.min(10, parseInt(sessionInput) || 2));
    onUpdateMonth({
      sessionCount: sCount,
      dailyTarget: dailyTargetInput.trim(),
      startingCapital: capitalInput.trim(),
      monthlyTarget: targetInput.trim(),
    });
  }

  async function handleQuickCloudSave() {
    setCloudSyncing(true);
    setCloudMsg(null);
    const res = await saveJournalToSupabase(data, monthKey);
    setCloudSyncing(false);
    if (res.success) {
      setCloudMsg('Saved to Cloud!');
      setTimeout(() => setCloudMsg(null), 3000);
    } else {
      setCloudMsg(res.error || 'Failed');
      setTimeout(() => setCloudMsg(null), 4000);
    }
  }

  async function handleQuickCloudLoad() {
    setCloudSyncing(true);
    setCloudMsg(null);
    const res = await loadJournalFromSupabase();
    setCloudSyncing(false);
    if (res.success && res.data) {
      onRestoreData?.(res.data, res.lastMonth);
      setCloudMsg('Loaded from Cloud!');
      setTimeout(() => setCloudMsg(null), 3000);
    } else {
      setCloudMsg(res.error || 'Failed');
      setTimeout(() => setCloudMsg(null), 4000);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile & click-outside */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity lg:bg-transparent lg:backdrop-blur-none"
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 bg-white/95 dark:bg-[#0B101D]/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in-left text-slate-800 dark:text-slate-100"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0B101D]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow-cyan font-black text-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight tp">Journal Configs</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Settings & Challenge Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 space-y-5 flex-1">
          {/* Section 1: Month Navigation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Active Month</span>
              <button
                onClick={() => onPageChange(page === 'dashboard' ? 'profit-sheet' : 'dashboard')}
                className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <BarChart3 className="w-3 h-3" />
                <span>{page === 'dashboard' ? 'Annual Sheet' : 'Dashboard'}</span>
              </button>
            </div>

            <div className="card-inner p-2 rounded-xl flex items-center justify-between gap-2">
              <button
                onClick={onPrevMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-cyan-600 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 flex-1 justify-center">
                <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <select
                  value={monthKey}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="bg-transparent text-xs font-black tp cursor-pointer focus:outline-none truncate"
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
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-cyan-600 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNewMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-cyan-600 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                title="Add New Month"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section 2: Milestone Progress Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 border border-cyan-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-200">
                <Target className="w-3.5 h-3.5 text-cyan-500" />
                <span>Target Milestone</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                isGoalReached
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : hasTarget
                  ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {hasTarget ? `${progress.toFixed(0)}%` : 'Unset'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-600'
                }`}
                style={{ width: `${Math.min(clampedProgress, 100)}%` }}
              />
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/40 dark:border-white/5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Goal</span>
                <span className="font-black text-slate-800 dark:text-slate-200">
                  {hasTarget ? fmtUSD(profitTarget) : '$0.00'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Remaining</span>
                <span className={`font-black ${isGoalReached ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {isGoalReached ? 'Completed 🎉' : hasTarget ? fmtUSD(remaining) : '$0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Target Inputs */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Financial Parameters
            </span>

            {/* Starting Capital */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-cyan-500" /> Starting Capital ($)
              </label>
              <div className="card-inner p-2 rounded-xl flex items-center gap-1.5">
                <span className="text-cyan-600 dark:text-cyan-400 font-black text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={capitalInput}
                  onChange={(e) => {
                    setCapitalInput(e.target.value);
                    onUpdateMonth({ startingCapital: e.target.value });
                  }}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
                />
              </div>
            </div>

            {/* Monthly Target */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-blue-500" /> Monthly Target Milestone ($)
              </label>
              <div className="card-inner p-2 rounded-xl flex items-center gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 font-black text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={targetInput}
                  onChange={(e) => {
                    setTargetInput(e.target.value);
                    onUpdateMonth({ monthlyTarget: e.target.value });
                  }}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
                />
              </div>
            </div>

            {/* Daily Target Goal */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-500" /> Daily Target Goal ($)
              </label>
              <div className="card-inner p-2 rounded-xl flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={autoDaily}
                  value={dailyTargetInput}
                  onChange={(e) => {
                    setDailyTargetInput(e.target.value);
                    onUpdateMonth({ dailyTarget: e.target.value });
                  }}
                  className="flex-1 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
                />
              </div>
              <p className="text-[9.5px] text-slate-400 mt-1">
                Auto-calculated pace: ${autoDaily}/day
              </p>
            </div>

            {/* Daily Sessions */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> Daily Sessions (1 to 10)
              </label>
              <div className="card-inner p-1.5 rounded-xl flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(1, parseInt(sessionInput) - 1);
                    setSessionInput(String(next));
                    onUpdateMonth({ sessionCount: next });
                  }}
                  className="btn-secondary w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sessionInput}
                  onChange={(e) => {
                    setSessionInput(e.target.value);
                    const n = parseInt(e.target.value);
                    if (n >= 1 && n <= 10) onUpdateMonth({ sessionCount: n });
                  }}
                  className="flex-1 bg-transparent text-center text-sm font-black tp tabular-nums focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(10, parseInt(sessionInput) + 1);
                    setSessionInput(String(next));
                    onUpdateMonth({ sessionCount: next });
                  }}
                  className="btn-secondary w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Cloud & Supabase Backup */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Supabase Cloud</span>
              </span>
              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                supabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}>
                {supabaseConnected ? 'Connected' : 'Not Set'}
              </span>
            </div>

            {cloudMsg && (
              <div className="text-[10px] font-bold p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="w-3 h-3" /> {cloudMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickCloudSave}
                disabled={cloudSyncing}
                className="py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
              >
                <Cloud className="w-3 h-3" />
                <span>{cloudSyncing ? '...' : 'Save Cloud'}</span>
              </button>
              <button
                type="button"
                onClick={handleQuickCloudLoad}
                disabled={cloudSyncing}
                className="py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 transition-all disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                <span>{cloudSyncing ? '...' : 'Load Cloud'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenBackupModal}
              className="w-full btn-secondary py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Backup & Sync Center</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
          <button
            onClick={toggleDark}
            className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-300"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-600" />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>

          <button
            onClick={onReset}
            className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
            title="Reset month data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </aside>
    </>
  );
}
