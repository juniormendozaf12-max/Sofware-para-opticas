import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// ══════════════════════════════════════════
// ESTABLECIMIENTO — dynamic per session
// Stored in sessionStorage so each tab can be a different store
// ══════════════════════════════════════════

const SESSION_KEY = 'oa_establecimiento';

/** Get current establecimiento (defaults to env or 'dos_de_mayo') */
export function getEstablecimiento(): string {
  return sessionStorage.getItem(SESSION_KEY)
    || (import.meta as any).env?.VITE_ESTABLECIMIENTO
    || 'dos_de_mayo';
}

/** Set establecimiento for this session and clear caches */
export function setEstablecimiento(est: string) {
  sessionStorage.setItem(SESSION_KEY, est);
  // Force page-level cache reset (services.ts will re-fetch)
  window.dispatchEvent(new CustomEvent('establecimiento-changed', { detail: est }));
}

// Legacy export for backward compat — reads dynamically
export const ESTABLECIMIENTO: string = getEstablecimiento();

// ══════════════════════════════════════════
// STORE CONFIGS (matches desktop software)
// ══════════════════════════════════════════

export interface StoreConfig {
  id: string;
  nombre: string;
  subtitulo: string;
  direccion: string;
  telefono: string;
  ruc: string;
  optometrista: string;
  color: string;
}

export const STORES: Record<string, StoreConfig> = {
  dos_de_mayo: {
    id: 'dos_de_mayo',
    nombre: 'Centro Optico Sicuani',
    subtitulo: 'Dos de Mayo',
    direccion: 'JR. DOS DE MAYO 217',
    telefono: 'CEL. 984 574 974',
    ruc: '10238006312',
    optometrista: 'GLORIA HUAMAN QUISPE',
    color: '#FF385C',
  },
  plaza_de_armas: {
    id: 'plaza_de_armas',
    nombre: 'Optica Sicuani',
    subtitulo: 'Plaza de Armas',
    direccion: 'JR. GARCILAZO DE LA VEGA 135',
    telefono: 'CEL. 984 047 273',
    ruc: '10239810792',
    optometrista: 'FREDY MENDOZA FERNANDEZ',
    color: '#2563eb',
  },
};

export function getStoreConfig(): StoreConfig {
  return STORES[getEstablecimiento()] || STORES.dos_de_mayo;
}

// ══════════════════════════════════════════
// SUPABASE CLIENT
// ══════════════════════════════════════════

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;

if (isSupabaseConfigured) {
  console.info(
    `%c[Centro Optico] Conectado a Supabase — ${getEstablecimiento()}`,
    'color: #10b981; font-weight: bold; font-size: 13px;'
  );
} else {
  console.info(
    '%c[Centro Optico] Modo DEMO — datos en memoria local',
    'color: #f59e0b; font-weight: bold; font-size: 13px;'
  );
}
