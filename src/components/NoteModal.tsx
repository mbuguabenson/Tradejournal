import { StickyNote, X, Save } from 'lucide-react';
import { useState } from 'react';
import { STRATEGIES } from '@/types';
import type { Strategy } from '@/types';

type Props = {
  day: number;
  note: string;
  strategy: Strategy;
  onSave: (note: string, strategy: Strategy) => void;
  onClose: () => void;
};

export default function NoteModal({ day, note, strategy, onSave, onClose }: Props) {
  const [text, setText] = useState(note);
  const [strat, setStrat] = useState<Strategy>(strategy);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div className="card p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold tp flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-500" /> Day {day} Trade Notes
          </h3>
          <button
            onClick={onClose}
            className="btn-secondary w-8 h-8 flex items-center justify-center rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="text-[11px] font-bold tm uppercase tracking-wider block mb-2">Strategy Applied</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {STRATEGIES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStrat(s.value)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                strat === s.value ? 'text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
              }`}
              style={
                strat === s.value
                  ? { backgroundColor: s.color, borderColor: s.color }
                  : { borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }
              }
            >
              <span className="flex items-center justify-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: strat === s.value ? 'white' : s.color }}
                />
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <label className="text-[11px] font-bold tm uppercase tracking-wider block mb-2">Session Notes & Lessons</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Market sentiment, pair traded, entry/exit triggers, mistakes, psychological state..."
          className="input-field w-full p-3 text-xs sm:text-sm tp focus:outline-none resize-none placeholder:text-slate-400 rounded-xl"
        />

        <div className="flex gap-2.5 mt-5">
          <button
            onClick={() => {
              onSave(text, strat);
              onClose();
            }}
            className="btn-primary flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-glow-primary"
          >
            <Save className="w-4 h-4" /> Save Entry
          </button>
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
