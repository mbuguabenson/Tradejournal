import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { TrackerData } from '@/types';

const STORAGE_URL_KEY = 'tt-sb-url';
const STORAGE_KEY_KEY = 'tt-sb-key';
const STORAGE_SYNC_ID_KEY = 'tt-sb-sync-id';
const STORAGE_AUTO_SYNC_KEY = 'tt-sb-auto-sync';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  syncId: string;
  autoSync: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  const localUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
  const syncId = localStorage.getItem(STORAGE_SYNC_ID_KEY) || 'my-trade-journal';
  const autoSync = localStorage.getItem(STORAGE_AUTO_SYNC_KEY) === 'true';

  return {
    url: envUrl || localUrl,
    anonKey: envKey || localKey,
    syncId,
    autoSync,
  };
}

export function saveStoredSupabaseConfig(cfg: Partial<SupabaseConfig>) {
  if (cfg.url !== undefined) localStorage.setItem(STORAGE_URL_KEY, cfg.url.trim());
  if (cfg.anonKey !== undefined) localStorage.setItem(STORAGE_KEY_KEY, cfg.anonKey.trim());
  if (cfg.syncId !== undefined) localStorage.setItem(STORAGE_SYNC_ID_KEY, cfg.syncId.trim());
  if (cfg.autoSync !== undefined) localStorage.setItem(STORAGE_AUTO_SYNC_KEY, cfg.autoSync ? 'true' : 'false');
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase(): SupabaseClient | null {
  const cfg = getStoredSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) return null;

  if (cachedClient && lastUsedUrl === cfg.url && lastUsedKey === cfg.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(cfg.url, cfg.anonKey);
    lastUsedUrl = cfg.url;
    lastUsedKey = cfg.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function saveJournalToSupabase(
  data: TrackerData,
  monthKey: string,
  customSyncId?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, error: 'Supabase credentials are not configured yet.' };
  }

  const syncId = (customSyncId || getStoredSupabaseConfig().syncId).trim();
  if (!syncId) {
    return { success: false, error: 'Please specify a Journal / Sync ID.' };
  }

  try {
    const { error } = await client.from('trade_journal').upsert(
      {
        id: syncId,
        data,
        last_month: monthKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function loadJournalFromSupabase(
  customSyncId?: string
): Promise<{ success: boolean; data?: TrackerData; lastMonth?: string; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, error: 'Supabase credentials are not configured yet.' };
  }

  const syncId = (customSyncId || getStoredSupabaseConfig().syncId).trim();
  if (!syncId) {
    return { success: false, error: 'Please specify a Journal / Sync ID.' };
  }

  try {
    const { data: record, error } = await client
      .from('trade_journal')
      .select('*')
      .eq('id', syncId)
      .single();

    if (error) throw error;
    if (!record || !record.data) {
      return { success: false, error: `No journal found under ID "${syncId}". Save first to create it!` };
    }

    return {
      success: true,
      data: record.data as TrackerData,
      lastMonth: record.last_month || undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export const SUPABASE_SQL_SETUP = `-- Run this in your Supabase SQL Editor (1-click copy):
create table if not exists trade_journal (
  id text primary key,
  data jsonb not null,
  last_month text,
  updated_at timestamp with time zone default now()
);

-- Enable public read & write for your personal journal
alter table trade_journal enable row level security;
create policy "Allow all on trade_journal" on trade_journal for all using (true) with check (true);`;
