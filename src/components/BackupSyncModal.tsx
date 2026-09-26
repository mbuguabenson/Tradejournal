import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Copy,
  Check,
  Cloud,
  CloudUpload,
  CloudDownload,
  Smartphone,
  Laptop,
  ShieldCheck,
  Database,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { TrackerData } from '@/types';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  saveJournalToSupabase,
  loadJournalFromSupabase,
  SUPABASE_SQL_SETUP,
} from '@/supabase';

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TrackerData;
  monthKey: string;
  onRestoreData: (newData: TrackerData, newMonthKey?: string) => void;
  onConfigChange?: () => void;
}

export default function BackupSyncModal({
  isOpen,
  onClose,
  data,
  monthKey,
  onRestoreData,
  onConfigChange,
}: BackupSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'supabase' | 'files' | 'code'>('supabase');
  const [copied, setCopied] = useState(false);
  const [pasteCode, setPasteCode] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [syncId, setSyncId] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setSupabaseUrl(cfg.url);
      setSupabaseKey(cfg.anonKey);
      setSyncId(cfg.syncId);
      setAutoSync(cfg.autoSync);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfigured = Boolean(supabaseUrl.trim() && supabaseKey.trim());
  const monthKeys = Object.keys(data);
  const totalDaysWithTrades = monthKeys.reduce((acc, k) => {
    const rows = data[k]?.rows || [];
    const filled = rows.filter((r) => r.sessions?.some((s) => s && s.trim() !== '')).length;
    return acc + filled;
  }, 0);

  // 1. Supabase Upload / Save
  async function handleSupabaseSave() {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setStatusMsg({ text: 'Please enter your Supabase Project URL and Anon Key below.', type: 'error' });
      return;
    }
    setIsCloudSyncing(true);
    setStatusMsg(null);

    // Save configuration
    saveStoredSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim(),
      syncId: syncId.trim() || 'my-trade-journal',
      autoSync,
    });
    onConfigChange?.();

    const res = await saveJournalToSupabase(data, monthKey, syncId.trim() || 'my-trade-journal');
    setIsCloudSyncing(false);

    if (res.success) {
      setStatusMsg({
        text: `Successfully synced & backed up to Supabase under Journal ID "${syncId.trim() || 'my-trade-journal'}"!`,
        type: 'success',
      });
    } else {
      setStatusMsg({
        text: `Supabase save failed: ${res.error}. Make sure the table "trade_journal" is created.`,
        type: 'error',
      });
    }
  }

  // 2. Supabase Download / Restore
  async function handleSupabaseLoad() {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setStatusMsg({ text: 'Please enter your Supabase Project URL and Anon Key below.', type: 'error' });
      return;
    }
    setIsCloudSyncing(true);
    setStatusMsg(null);

    saveStoredSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim(),
      syncId: syncId.trim() || 'my-trade-journal',
      autoSync,
    });
    onConfigChange?.();

    const res = await loadJournalFromSupabase(syncId.trim() || 'my-trade-journal');
    setIsCloudSyncing(false);

    if (res.success && res.data) {
      onRestoreData(res.data, res.lastMonth);
      setStatusMsg({
        text: `Loaded journal successfully from Supabase (ID: "${syncId.trim() || 'my-trade-journal'}")!`,
        type: 'success',
      });
    } else {
      setStatusMsg({
        text: `Supabase load failed: ${res.error}`,
        type: 'error',
      });
    }
  }

  function handleAutoSyncToggle(val: boolean) {
    setAutoSync(val);
    saveStoredSupabaseConfig({ autoSync: val });
    onConfigChange?.();
  }

  // 3. Export File
  function handleDownloadFile() {
    try {
      const payload = {
        data,
        lastMonth: monthKey,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tradejournal-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMsg({ text: 'Backup file downloaded successfully!', type: 'success' });
    } catch {
      setStatusMsg({ text: 'Failed to generate backup file.', type: 'error' });
    }
  }

  // 4. Import File
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          const trackerData = parsed.data || parsed;
          if (typeof trackerData === 'object') {
            onRestoreData(trackerData, parsed.lastMonth);
            setStatusMsg({ text: 'All journal data restored successfully from file!', type: 'success' });
          } else {
            throw new Error('Invalid format');
          }
        }
      } catch {
        setStatusMsg({ text: 'Invalid JSON backup file.', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // 5. Copy Code
  function handleCopyCode() {
    try {
      const payload = { data, lastMonth: monthKey, exportedAt: new Date().toISOString() };
      const str = JSON.stringify(payload);
      const encoded = btoa(encodeURIComponent(str));
      navigator.clipboard.writeText(encoded);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setStatusMsg({ text: 'Sync code copied! You can now paste it into your mobile browser.', type: 'success' });
    } catch {
      setStatusMsg({ text: 'Failed to copy code.', type: 'error' });
    }
  }

  // 6. Restore from Code
  function handleRestoreFromCode() {
    if (!pasteCode.trim()) {
      setStatusMsg({ text: 'Please paste your sync code first.', type: 'error' });
      return;
    }
    try {
      let jsonStr = '';
      try {
        jsonStr = decodeURIComponent(atob(pasteCode.trim()));
      } catch {
        jsonStr = pasteCode.trim();
      }
      const parsed = JSON.parse(jsonStr);
      const trackerData = parsed.data || parsed;
      if (typeof trackerData === 'object') {
        onRestoreData(trackerData, parsed.lastMonth);
        setPasteCode('');
        setStatusMsg({ text: 'Journal data restored successfully from code!', type: 'success' });
      } else {
        throw new Error('Invalid data');
      }
    } catch {
      setStatusMsg({ text: 'Invalid sync code. Please check and try again.', type: 'error' });
    }
  }

  function handleCopySql() {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="card w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-5 space-y-4 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">Supabase Cloud Sync & Backup</h2>
                {isConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Ready to Connect
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Access and sync your trades on phone and PC anywhere without login walls
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

        {/* Current State Info Banner */}
        <div className="card-inner p-2.5 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-600 dark:text-slate-300">Active Storage:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isConfigured ? 'Browser LocalStorage + Supabase Cloud' : 'Browser LocalStorage'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2.5">
            <span><b>{monthKeys.length}</b> Month(s)</span>
            <span>•</span>
            <span><b>{totalDaysWithTrades}</b> Active Days</span>
          </div>
        </div>

        {/* Feedback message */}
        {statusMsg && (
          <div
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'supabase'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Cloud</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'files'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON File</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Quick Sync Code</span>
          </button>
        </div>

        {/* Tab 1: Supabase Cloud Sync (Primary) */}
        {activeTab === 'supabase' && (
          <div className="space-y-3.5 pt-1">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <Cloud className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <b>Personal Cloud Database:</b> Enter your Supabase credentials once. You can save your trades and load them on any phone or laptop immediately without creating user accounts!
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Personal Journal / Sync ID
                </label>
                <input
                  type="text"
                  value={syncId}
                  onChange={(e) => setSyncId(e.target.value)}
                  placeholder="e.g. mbugua-trades (any secret key or name)"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400">
                  Use this same ID on your phone or other laptop to sync the same trades.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://yourproject.supabase.co"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Auto Sync Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <span className="text-xs font-bold block text-slate-700 dark:text-slate-200">
                    Background Auto-Sync to Supabase
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Automatically backs up to Supabase whenever trades are modified
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => handleAutoSyncToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleSupabaseSave}
                disabled={isCloudSyncing}
                className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                {isCloudSyncing ? 'Saving...' : 'Save to Supabase'}
              </button>
              <button
                onClick={handleSupabaseLoad}
                disabled={isCloudSyncing}
                className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-white/10 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all disabled:opacity-50"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                {isCloudSyncing ? 'Loading...' : 'Load from Supabase'}
              </button>
            </div>

            {/* SQL Setup Helper Accordion */}
            <details className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 cursor-pointer">
              <summary className="hover:text-emerald-500 font-semibold flex items-center gap-1">
                <span>View Supabase SQL Setup (1 table needed)</span>
              </summary>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Paste this into your Supabase SQL Editor and click Run:</span>
                  <button
                    onClick={handleCopySql}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedSql ? 'Copied SQL' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto text-[9.5px] leading-relaxed">
{SUPABASE_SQL_SETUP}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Tab 2: File Backup */}
        {activeTab === 'files' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-cyan-600 dark:text-cyan-400">
                    <Download className="w-4 h-4" /> Download Backup File
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Saves all months, strategies, and notes into an offline <code className="text-[10px]">.json</code> file.
                  </p>
                </div>
                <button
                  onClick={handleDownloadFile}
                  className="w-full btn-primary py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Save JSON File
                </button>
              </div>

              {/* Import */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-200">
                    <Upload className="w-4 h-4" /> Restore from File
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload your JSON backup file on any deployed site to restore all trades immediately.
                  </p>
                </div>
                <label className="w-full btn-secondary py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-white/10 hover:border-cyan-500">
                  <Upload className="w-3.5 h-3.5 text-cyan-500" /> Choose Backup File
                  <input type="file" accept=".json" onChange={handleFileInput} className="sr-only" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quick Sync Code */}
        {activeTab === 'code' && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-cyan-500" /> Step 1: Copy Code from PC
                </span>
                <button
                  onClick={handleCopyCode}
                  className="btn-primary py-1 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Copies all trades into a single text code. Send it to your phone via WhatsApp or Notes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-500" /> Step 2: Paste Code on Phone
              </span>
              <textarea
                value={pasteCode}
                onChange={(e) => setPasteCode(e.target.value)}
                placeholder="Paste your sync code here..."
                rows={3}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 focus:outline-none focus:border-cyan-500 resize-none text-slate-700 dark:text-slate-300"
              />
              <button
                onClick={handleRestoreFromCode}
                className="w-full btn-secondary py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10"
              >
                <Upload className="w-3.5 h-3.5" /> Restore from Pasted Code
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn-secondary py-1.5 px-4 rounded-lg text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
