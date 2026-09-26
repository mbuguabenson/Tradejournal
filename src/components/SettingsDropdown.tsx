import { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDown, Check, Layers, Target, Wallet, X } from 'lucide-react';
import type { MonthData } from '@/types';
import { parseNum } from '@/utils';

interface SettingsDropdownProps {
  month: MonthData;
  onUpdateMonth: (patch: Partial<MonthData>) => void;
}

export default function SettingsDropdown({
  month,
  onUpdateMonth,
}: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionInput, setSessionInput] = useState(String(month.sessionCount || 2));
  const [dailyTargetInput, setDailyTargetInput] = useState(month.dailyTarget || '');
  const [capitalInput, setCapitalInput] = useState(month.startingCapital || '');
  const [targetInput, setTargetInput] = useState(month.monthlyTarget || '');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync inputs whenever modal opens or month changes
  useEffect(() => {
    setSessionInput(String(month.sessionCount || 2));
    setDailyTargetInput(month.dailyTarget || '');
    setCapitalInput(month.startingCapital || '');
    setTargetInput(month.monthlyTarget || '');
  }, [month, isOpen]);

  // Close on click outside
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

  const profitGoal = parseNum(targetInput) - parseNum(capitalInput);
  const autoDaily = profitGoal > 0 ? (profitGoal / (month.rows?.length || 30)).toFixed(2) : '0.00';

  function handleApply() {
    const sCount = Math.max(1, Math.min(10, parseInt(sessionInput) || 2));
    onUpdateMonth({
      sessionCount: sCount,
      dailyTarget: dailyTargetInput.trim(),
      startingCapital: capitalInput.trim(),
      monthlyTarget: targetInput.trim(),
    });
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`btn-secondary px-2.5 h-7 flex items-center gap-1.5 text-[10px] font-bold rounded-lg transition-all ${
          isOpen
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 shadow-sm'
            : 'text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-cyan-500/60'
        }`}
        title="Challenge Settings (Sessions, Daily Target, Capital)"
      >
        <Settings className="w-3.5 h-3.5 text-cyan-500" />
        <span>Settings ({month.sessionCount}S)</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-72 sm:w-80 card p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 text-slate-800 dark:text-slate-100 animate-scale-in space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-xs font-black">Challenge Settings</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-2.5">
            {/* Daily Trading Sessions */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> Daily Sessions (1 to 10)
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

            {/* Daily Target Goal */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-emerald-500" /> Daily Target Goal ($)
              </label>
              <div className="card-inner p-1.5 flex items-center gap-1.5">
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
              <p className="text-[9px] text-slate-400 mt-0.5">
                Auto-calculated pace: ${autoDaily}/day
              </p>
            </div>

            {/* Starting Capital */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-cyan-500" /> Starting Capital ($)
              </label>
              <div className="card-inner p-1.5 flex items-center gap-1.5">
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
              <div className="card-inner p-1.5 flex items-center gap-1.5">
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
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-secondary flex-1 py-1.5 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
