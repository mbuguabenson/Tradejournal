import React, { useState, useEffect } from 'react';
import { Settings, X, Target, Wallet, Layers, Check } from 'lucide-react';
import type { MonthData } from '@/types';
import { parseNum } from '@/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: MonthData;
  onUpdateMonth: (patch: Partial<MonthData>) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  month,
  onUpdateMonth,
}: SettingsModalProps) {
  const [sessionInput, setSessionInput] = useState(String(month.sessionCount || 2));
  const [dailyTargetInput, setDailyTargetInput] = useState(month.dailyTarget || '');
  const [capitalInput, setCapitalInput] = useState(month.startingCapital || '');
  const [targetInput, setTargetInput] = useState(month.monthlyTarget || '');

  useEffect(() => {
    if (isOpen) {
      setSessionInput(String(month.sessionCount || 2));
      setDailyTargetInput(month.dailyTarget || '');
      setCapitalInput(month.startingCapital || '');
      setTargetInput(month.monthlyTarget || '');
    }
  }, [isOpen, month]);

  if (!isOpen) return null;

  const profitGoal = parseNum(targetInput) - parseNum(capitalInput);
  const autoDaily = profitGoal > 0 ? (profitGoal / (month.rows?.length || 30)).toFixed(2) : '0.00';

  function handleSave() {
    const sCount = Math.max(1, Math.min(10, parseInt(sessionInput) || 2));
    onUpdateMonth({
      sessionCount: sCount,
      dailyTarget: dailyTargetInput.trim(),
      startingCapital: capitalInput.trim(),
      monthlyTarget: targetInput.trim(),
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-sm rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-5 space-y-4 text-slate-800 dark:text-slate-100 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black">Challenge Settings</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Configure targets, capital & daily sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Starting Capital */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <Wallet className="w-3.5 h-3.5 text-cyan-500" /> Starting Capital ($)
            </label>
            <div className="card-inner p-2 flex items-center gap-1.5">
              <span className="text-cyan-600 dark:text-cyan-400 font-black text-xs">$</span>
              <input
                type="number"
                step="0.01"
                value={capitalInput}
                onChange={(e) => setCapitalInput(e.target.value)}
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
            <div className="card-inner p-2 flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-blue-400 font-black text-xs">$</span>
              <input
                type="number"
                step="0.01"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
              />
            </div>
          </div>

          {/* Daily Target Goal */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-500" /> Daily Target Goal ($)
            </label>
            <div className="card-inner p-2 flex items-center gap-1.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">$</span>
              <input
                type="number"
                step="0.01"
                placeholder={autoDaily}
                value={dailyTargetInput}
                onChange={(e) => setDailyTargetInput(e.target.value)}
                className="flex-1 bg-transparent text-right text-xs font-black tp tabular-nums focus:outline-none"
              />
            </div>
            <p className="text-[9.5px] text-slate-400 mt-1">
              Leave blank to auto-calculate pace (${autoDaily}/day).
            </p>
          </div>

          {/* Daily Trading Sessions */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Daily Trading Sessions (1 to 10)
            </label>
            <div className="card-inner p-1.5 flex items-center gap-2">
              <button
                type="button"
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
                className="flex-1 bg-transparent text-center text-sm font-black tp tabular-nums focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSessionInput((s) => String(Math.min(10, parseInt(s) + 1)))}
                className="btn-secondary w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 py-2 text-xs font-bold rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
