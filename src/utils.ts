import type { ComputedDay, DayData, MonthData, Strategy, TrackerData } from '@/types';

export function parseNum(val: string | number | undefined): number {
  if (val === undefined || val === '') return 0;
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export function fmtUSD(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getStrategyColor(strategy: Strategy): string {
  const map: Record<Strategy, string> = {
    'none': '#94a3b8',
    'rise-fall': '#3b82f6',
    'over-under': '#f59e0b',
    'even-odd': '#8b5cf6',
  };
  return map[strategy] || '#94a3b8';
}

export function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function getMonthShort(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return getMonthKey(d);
}

export function getMonthsInYear(data: TrackerData, year: number): string[] {
  return Object.keys(data)
    .filter((k) => parseInt(k.split('-')[0]) === year)
    .sort();
}

export function getDaysInMonth(key: string): number {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function formatDayDate(monthKey: string, day: number): { formatted: string; weekday: string; isWeekend: boolean; fullDate: string } {
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1, day);
  const weekday = date.toLocaleString('en-US', { weekday: 'short' });
  const monthName = date.toLocaleString('en-US', { month: 'short' });
  const dayStr = String(day).padStart(2, '0');
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const fullDate = `${y}-${String(m).padStart(2, '0')}-${dayStr}`;
  return {
    formatted: `${monthName} ${dayStr}`,
    weekday,
    isWeekend,
    fullDate,
  };
}

export function createEmptyRow(day: number, sessionCount: number): DayData {
  return { day, dailyTarget: '', sessions: Array(sessionCount).fill(''), withdrawn: '', strategy: 'none', note: '' };
}

export function createEmptyRows(sessionCount: number, daysCount: number = 30): DayData[] {
  return Array.from({ length: daysCount }, (_, i) => createEmptyRow(i + 1, sessionCount));
}

export function createEmptyMonth(key?: string): MonthData {
  const days = key ? getDaysInMonth(key) : 30;
  return { startingCapital: '', monthlyTarget: '', sessionCount: 3, rows: createEmptyRows(3, days) };
}

export function createSampleMonth(key: string = '2026-09'): MonthData {
  const sessionCount = 3;
  const daysInMonth = getDaysInMonth(key);
  // Real trading sessions up to day 26 (today)
  const sampleProfits: [number, number, number][] = [
    [120, 100, 80],   // Day 1 (Sep 01)
    [140, 110, -50],  // Day 2 (Sep 02)
    [200, 150, 100],  // Day 3 (Sep 03)
    [90, -70, 130],   // Day 4 (Sep 04)
    [180, 120, 100],  // Day 5 (Sep 05)
    [220, 160, 120],  // Day 6 (Sep 06)
    [-120, 90, -50],  // Day 7 (Sep 07)
    [170, 130, 100],  // Day 8 (Sep 08)
    [140, 110, 80],   // Day 9 (Sep 09)
    [250, 180, 120],  // Day 10 (Sep 10)
    [100, -80, 130],  // Day 11 (Sep 11)
    [190, 140, 110],  // Day 12 (Sep 12)
    [210, 170, 120],  // Day 13 (Sep 13)
    [-110, -60, 80],  // Day 14 (Sep 14)
    [160, 120, 90],   // Day 15 (Sep 15)
    [180, 140, 110],  // Day 16 (Sep 16)
    [220, 180, 140],  // Day 17 (Sep 17)
    [120, 100, -50],  // Day 18 (Sep 18)
    [200, 150, 120],  // Day 19 (Sep 19)
    [150, 110, 90],   // Day 20 (Sep 20)
    [180, 140, 120],  // Day 21 (Sep 21)
    [90, 60, -20],    // Day 22 (Sep 22)
    [160, 130, 90],   // Day 23 (Sep 23)
    [190, 150, 110],  // Day 24 (Sep 24)
    [130, 110, 70],   // Day 25 (Sep 25)
    [140, 120, 80],   // Day 26 (Sep 26 - Today!)
  ];

  const strategies: Strategy[] = ['rise-fall', 'over-under', 'even-odd', 'rise-fall', 'over-under'];
  const notes: Record<number, string> = {
    1: 'Month kick-off: executed cleanly according to plan',
    3: 'Clean trend continuation breakout session on high volume',
    7: 'High volatility whipsaw, halted early to protect capital',
    10: 'Secured first partial profit withdrawal ($500)',
    14: 'Minor pullback on Asian session range contraction',
    17: 'High volume momentum expansion after key economic data',
    20: 'Second scheduled profit transfer to cold wallet ($500)',
    24: 'Strong rebound on trend follow-through setup',
    26: 'Active trading day: hit session target with high accuracy',
  };

  const rows: DayData[] = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    if (idx < sampleProfits.length) {
      const sp = sampleProfits[idx];
      return {
        day,
        dailyTarget: '300',
        sessions: sp.map(String),
        withdrawn: day === 10 ? '500' : day === 20 ? '500' : '',
        strategy: strategies[idx % strategies.length],
        note: notes[day] || '',
      };
    }
    return createEmptyRow(day, sessionCount);
  });

  return { startingCapital: '1000', monthlyTarget: '10000', sessionCount: 3, rows };
}

export function computeRows(rows: DayData[]): ComputedDay[] {
  let cumulative = 0;
  return rows.map((r) => {
    const pl = r.sessions.reduce((sum, s) => sum + parseNum(s), 0);
    cumulative += pl;
    return { ...r, profitLoss: pl, cumulativeProfit: cumulative };
  });
}

export function computeTotals(computed: ComputedDay[], sessionCount: number) {
  const totals = { dailyTarget: 0, sessions: Array(sessionCount).fill(0), profitLoss: 0, withdrawn: 0 };
  for (const r of computed) {
    totals.dailyTarget += parseNum(r.dailyTarget);
    totals.profitLoss += r.profitLoss;
    totals.withdrawn += parseNum(r.withdrawn);
    for (let i = 0; i < sessionCount; i++) {
      totals.sessions[i] = (totals.sessions[i] || 0) + parseNum(r.sessions[i]);
    }
  }
  return totals;
}

export function computeStats(computed: ComputedDay[]) {
  let completed = 0, profitable = 0, losing = 0;
  let bestDay = 0, worstDay = 0, totalPL = 0;
  for (const r of computed) {
    const hasData = r.sessions.some((s) => s !== '');
    if (hasData) {
      completed++;
      totalPL += r.profitLoss;
      if (r.profitLoss > 0) profitable++;
      else if (r.profitLoss < 0) losing++;
      if (r.profitLoss > bestDay) bestDay = r.profitLoss;
      if (r.profitLoss < worstDay) worstDay = r.profitLoss;
    }
  }
  return {
    completed, profitable, losing,
    winRate: completed > 0 ? (profitable / completed) * 100 : 0,
    avgDaily: completed > 0 ? totalPL / completed : 0,
    bestDay, worstDay,
  };
}

export function aggregateMonths(data: TrackerData, monthKeys: string[]) {
  const allRows: ComputedDay[] = [];
  for (const key of monthKeys) {
    const month = data[key];
    if (month) {
      allRows.push(...computeRows(month.rows));
    }
  }

  const completedRows = allRows.filter((r) => r.sessions.some((s) => s !== ''));
  const profitableDays = completedRows.filter((r) => r.profitLoss > 0).length;
  const losingDays = completedRows.filter((r) => r.profitLoss < 0).length;
  const totalProfit = completedRows.reduce((s, r) => s + r.profitLoss, 0);
  const bestDay = completedRows.length > 0 ? Math.max(...completedRows.map((r) => r.profitLoss)) : 0;
  const worstDay = completedRows.length > 0 ? Math.min(...completedRows.map((r) => r.profitLoss)) : 0;

  // Cumulative trend
  let cum = 0;
  const cumulativeProfits = completedRows.map((r) => {
    cum += r.profitLoss;
    return { day: r.day, cumulative: cum };
  });

  // Daily profits
  const dailyProfits = completedRows.map((r) => ({ day: r.day, profit: r.profitLoss }));

  // Strategy breakdown
  const stratMap = new Map<string, { profit: number; count: number }>();
  for (const r of completedRows) {
    if (r.strategy === 'none') continue;
    const existing = stratMap.get(r.strategy) || { profit: 0, count: 0 };
    existing.profit += r.profitLoss;
    existing.count++;
    stratMap.set(r.strategy, existing);
  }
  const strategyBreakdown = Array.from(stratMap.entries()).map(([strategy, v]) => ({ strategy, ...v }));

  return {
    completedDays: completedRows.length,
    profitableDays, losingDays,
    totalProfit, bestDay, worstDay,
    winRate: completedRows.length > 0 ? (profitableDays / completedRows.length) * 100 : 0,
    avgDaily: completedRows.length > 0 ? totalProfit / completedRows.length : 0,
    dailyProfits, cumulativeProfits, strategyBreakdown,
  };
}
