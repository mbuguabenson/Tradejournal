export type Strategy = 'rise-fall' | 'over-under' | 'even-odd' | 'none';

export const STRATEGIES: { value: Strategy; label: string; short: string; color: string }[] = [
  { value: 'none', label: 'None', short: '—', color: '#94a3b8' },
  { value: 'rise-fall', label: 'Rise/Fall', short: 'R/F', color: '#3b82f6' },
  { value: 'over-under', label: 'Over/Under', short: 'O/U', color: '#f59e0b' },
  { value: 'even-odd', label: 'Even/Odd', short: 'E/O', color: '#8b5cf6' },
];

export type AnalysisMode = 'monthly' | 'yearly' | 'custom';

export type DayData = {
  day: number;
  dailyTarget: string;
  sessions: string[];
  withdrawn: string;
  strategy: Strategy;
  note: string;
};

export type MonthData = {
  startingCapital: string;
  monthlyTarget: string;
  dailyTarget?: string;
  sessionCount: number;
  rows: DayData[];
};

export type TrackerData = Record<string, MonthData>;

export type ComputedDay = DayData & {
  profitLoss: number;
  cumulativeProfit: number;
};
