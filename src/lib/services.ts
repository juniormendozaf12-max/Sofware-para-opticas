import { supabase, isSupabaseConfigured, getEstablecimiento, getStoreConfig } from './supabase';
import { demo } from './demoData';
import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import qrcode from 'qrcode-generator';
import type {
  Patient, Consultation, Prescription, Product, Sale, SaleItem,
  InventoryItem, DashboardStats, EyeRx, ProductCategory,
  LensMatrix, LensMatrixCell, LensMaterialKey, LensCategory,
} from '../types';

// ══════════════════════════════════════════
// app_data SINGLE-TABLE ENGINE
// Desktop uses: app_data(establecimiento, data_key, data JSONB)
// ══════════════════════════════════════════

const _cache: Record<string, { data: any; ts: number; est: string }> = {};
const CACHE_TTL: Record<string, number> = {
  clientes: 20_000,           // 20s — realtime handles instant refresh
  productos: 10_000,          // 10s — stock changes on every sale
  ventas: 5_000,              // 5s — most critical for sales page
  medidas: 45_000,            // 45s
  consultas_clinicas: 45_000, // 45s
  inventario_lunas_matrix: 20_000, // 20s — lens matrix sync
};
const DEFAULT_CACHE_MS = 10_000;

// In-flight request dedup — prevents duplicate Supabase calls when the same key
// is loaded concurrently (e.g. Dashboard loads ventas via 2 different functions)
const _inflight: Record<string, Promise<any>> = {};

// Clear ALL caches + reconnect realtime when store changes
if (typeof window !== 'undefined') {
  window.addEventListener('establecimiento-changed', () => {
    // 1. Clear all caches
    Object.keys(_cache).forEach(k => delete _cache[k]);
    _mappedPatients = null;
    Object.keys(_lastUpdated).forEach(k => delete _lastUpdated[k]);

    // 2. Tear down old realtime channel (it filters the OLD store)
    if (_realtimeChannel) {
      _realtimeChannel.unsubscribe();
      _realtimeChannel = null;
    }
    if (_pollInterval) {
      clearInterval(_pollInterval);
      _pollInterval = null;
    }

    // 3. Re-create subscriptions for the NEW store if there are active listeners
    const hasListeners = Object.keys(_listeners).some(k => (_listeners[k]?.size ?? 0) > 0);
    if (hasListeners && isSupabaseConfigured && supabase) {
      _startRealtime();
      _startPolling();
    }

    console.info('[Optical] Store switched to', getEstablecimiento(), '— cache cleared, realtime reconnected');
  });
}

async function loadData<T = any[]>(key: string): Promise<T> {
  const ttl = CACHE_TTL[key] || DEFAULT_CACHE_MS;
  const est = getEstablecimiento();
  const c = _cache[key];
  if (c && c.est === est && Date.now() - c.ts < ttl) return c.data as T;

  // Dedup: if an identical request is already in-flight, piggyback on it
  const flightKey = `${est}::${key}`;
  if (_inflight[flightKey]) return _inflight[flightKey] as Promise<T>;

  const promise = (async (): Promise<T> => {
    try {
      const { data, error } = await supabase!
        .from('app_data')
        .select('data, updated_at')
        .eq('establecimiento', est)
        .eq('data_key', key)
        .maybeSingle();

      if (error) {
        console.error(`[Optical] Error loading "${key}" for ${est}:`, error.message);
        if (c) return c.data as T;
        return [] as unknown as T;
      }

      const result = (data?.data ?? []) as T;
      _cache[key] = { data: result, ts: Date.now(), est };

      // Seed polling baseline so first poll doesn't miss changes
      if (data?.updated_at) {
        _lastUpdated[key] = data.updated_at;
      }

      return result;
    } catch (err: any) {
      console.error(`[Optical] Network error loading "${key}":`, err?.message || err);
      if (c) return c.data as T;
      return [] as unknown as T;
    }
  })();

  _inflight[flightKey] = promise;
  promise.finally(() => { delete _inflight[flightKey]; });
  return promise;
}

async function saveData(key: string, items: any): Promise<void> {
  const ts = new Date().toISOString();
  const { error } = await supabase!
    .from('app_data')
    .upsert(
      { establecimiento: getEstablecimiento(), data_key: key, data: items, updated_at: ts },
      { onConflict: 'establecimiento,data_key' }
    );

  if (error) {
    console.error(`[Optical] Error saving "${key}":`, error.message);
    throw new Error(`Error guardando datos: ${error.message}`);
  }

  _cache[key] = { data: items, ts: Date.now(), est: getEstablecimiento() };
  // Update polling baseline so polling doesn't fire for our own write
  _lastUpdated[key] = ts;

  // Immediately notify listeners so UI updates without waiting for polling
  _listeners[key]?.forEach(cb => {
    try { cb(key); } catch (e) { console.error('[Optical] Save notify error:', e); }
  });
  // Set _lastNotified so the WS/poll echo is debounced (avoids double-refresh)
  _lastNotified[key] = Date.now();
}

/** Preload all critical data keys in parallel (call on login to warm cache) */
export function preloadCriticalData(): void {
  if (!isSupabaseConfigured || !supabase) return;
  // Fire-and-forget: loads clientes, productos, ventas concurrently
  // By the time Dashboard renders, cache is already warm
  Promise.all([
    loadData('clientes'),
    loadData('productos'),
    loadData('ventas'),
  ]).catch(() => {});
}

/** Combined Dashboard data — single load of 3 keys, derives all needed data.
 *  Avoids the old pattern of fetchDashboardStats + fetchTodaySales + fetchPatients
 *  which internally called loadData 5 times (3 unique, with dedup now 3). */
export async function fetchDashboardData(): Promise<{
  stats: DashboardStats;
  todaySales: Sale[];
  recentPatients: Patient[];
}> {
  if (!isSupabaseConfigured) {
    const [stats, todaySales, patients] = await Promise.all([
      demo.fetchDashboardStats(),
      demo.fetchTodaySales(),
      demo.fetchPatients(),
    ]);
    return { stats, todaySales, recentPatients: patients.slice(0, 5) };
  }

  // Single parallel load of ALL 3 keys
  const [clientes, productos, ventas] = await Promise.all([
    loadData<any[]>('clientes'),
    loadData<any[]>('productos'),
    loadData<any[]>('ventas'),
  ]);

  // Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayVentas = ventas.filter((v: any) => {
    const raw = v.fecha || v.fechaCreacion || '';
    const d = new Date(_localizeDate(raw));
    return d >= today && v.estadoPago !== 'CANCELADO';
  });

  const dailySales = todayVentas.reduce((sum: number, v: any) => sum + (Number(v.totalPagar) || Number(v.total) || 0), 0);
  const criticalStock = productos.filter((p: any) => (p.stock || 0) <= (p.stockMin || 5)).length;

  const stats: DashboardStats = {
    dailySales,
    dailySalesCount: todayVentas.length,
    consultationsToday: 0,
    criticalStock,
    totalPatients: clientes.filter((c: any) => c.estado !== 'D').length,
  };

  // Today's sales mapped
  const todaySales = todayVentas
    .map(desktopToSale)
    .sort((a, b) => new Date(_localizeDate(b.date)).getTime() - new Date(_localizeDate(a.date)).getTime());

  // Recent patients (top 5)
  const recentPatients = mapAndCachePatients(clientes).slice(0, 5);

  return { stats, todaySales, recentPatients };
}

/** Force-clear cache for a key (useful after writes) */
export function invalidateCache(key?: string) {
  if (key) {
    delete _cache[key];
  } else {
    Object.keys(_cache).forEach(k => delete _cache[k]);
  }
}

// ══════════════════════════════════════════
// REALTIME SUBSCRIPTIONS (Supabase Realtime + Polling Fallback)
// Dual strategy: postgres_changes for instant updates +
// polling updated_at every 5s as fallback (works even without
// ALTER PUBLICATION supabase_realtime ADD TABLE app_data)
// ══════════════════════════════════════════

type ChangeCallback = (key: string) => void;
const _listeners: Record<string, Set<ChangeCallback>> = {};
let _realtimeChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

// Polling state
let _pollInterval: ReturnType<typeof setInterval> | null = null;
const _lastUpdated: Record<string, string> = {}; // key → last known updated_at
const POLL_INTERVAL_MS = 2_000; // 2 seconds — fast polling for near-realtime

// Debounce: prevent rapid-fire notifications for the same key
const _lastNotified: Record<string, number> = {};
const DEBOUNCE_MS = 500; // ignore duplicate notifications within 500ms

/** Subscribe to real-time changes for a data key (e.g. 'ventas', 'medidas').
 *  Callback receives the key that changed, enabling selective refresh. */
export function onDataChange(key: string, cb: ChangeCallback): () => void {
  if (!_listeners[key]) _listeners[key] = new Set();
  _listeners[key].add(cb);

  // Start realtime channel + polling if first subscriber
  if (isSupabaseConfigured && supabase) {
    if (!_realtimeChannel) _startRealtime();
    if (!_pollInterval) _startPolling();
  }

  return () => {
    _listeners[key]?.delete(cb);
    if (_listeners[key]?.size === 0) delete _listeners[key];

    // Stop channel + polling if no more listeners
    if (Object.keys(_listeners).length === 0) {
      if (_realtimeChannel) {
        _realtimeChannel.unsubscribe();
        _realtimeChannel = null;
      }
      if (_pollInterval) {
        clearInterval(_pollInterval);
        _pollInterval = null;
      }
    }
  };
}

/** Notify subscribers for a specific key */
function _notifyKey(key: string) {
  // Debounce: skip if we just notified this key within 800ms (prevents double-fire)
  const now = Date.now();
  if (_lastNotified[key] && now - _lastNotified[key] < DEBOUNCE_MS) {
    console.debug(`[Optical] Debounced "${key}" (${now - _lastNotified[key]}ms ago)`);
    return;
  }
  _lastNotified[key] = now;

  // Invalidate cache — always, even on debounce
  delete _cache[key];
  if (key === 'clientes') _mappedPatients = null;

  // Notify all subscribers — pass the key so they can refresh selectively
  _listeners[key]?.forEach(cb => {
    try { cb(key); } catch (e) { console.error('[Optical] Realtime callback error:', e); }
  });
}

function _startRealtime() {
  if (!supabase || _realtimeChannel) return;

  _realtimeChannel = supabase
    .channel('app_data_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_data',
        filter: `establecimiento=eq.${getEstablecimiento()}`,
      },
      (payload: any) => {
        const key = payload.new?.data_key || payload.old?.data_key;
        if (!key) return;

        console.debug(`[Optical] Realtime WS: "${key}" changed (${payload.eventType})`);

        // Update the last-known timestamp so polling doesn't double-fire
        if (payload.new?.updated_at) {
          _lastUpdated[key] = payload.new.updated_at;
        }

        _notifyKey(key);
      }
    )
    .subscribe((status: string) => {
      console.debug(`[Optical] Realtime channel: ${status}`);
    });
}

/** Polling fallback: checks updated_at for all subscribed keys every 2s */
function _startPolling() {
  if (_pollInterval || !supabase) return;

  _pollInterval = setInterval(async () => {
    const subscribedKeys = Object.keys(_listeners).filter(k => (_listeners[k]?.size ?? 0) > 0);
    if (subscribedKeys.length === 0) return;

    try {
      // Fetch updated_at for all subscribed keys in one query
      const { data, error } = await supabase!
        .from('app_data')
        .select('data_key, updated_at')
        .eq('establecimiento', getEstablecimiento())
        .in('data_key', subscribedKeys);

      if (error || !data) return;

      for (const row of data) {
        const key = row.data_key;
        const ts = row.updated_at;
        if (!ts || !key) continue;

        const prev = _lastUpdated[key];
        if (prev && prev === ts) continue; // No change

        _lastUpdated[key] = ts;

        // Skip first poll (seed the timestamp without notifying)
        if (!prev) continue;

        console.debug(`[Optical] Poll detected change: "${key}" (${prev} → ${ts})`);
        _notifyKey(key);
      }
    } catch (e) {
      // Silently ignore poll errors
    }
  }, POLL_INTERVAL_MS);
}

// ══════════════════════════════════════════
// CATEGORY MAPPING  (Desktop ↔ App)
// ══════════════════════════════════════════

const CAT_TO_APP: Record<string, ProductCategory> = {
  MONTURAS: 'frame', LUNAS: 'lens', LCONTACTO: 'contactLens',
  ACCESORIOS: 'accessory', SERVICIOS: 'other',
};
const CAT_TO_DESKTOP: Record<string, string> = {
  frame: 'MONTURAS', lens: 'LUNAS', contactLens: 'LCONTACTO',
  accessory: 'ACCESORIOS', solution: 'ACCESORIOS', other: 'SERVICIOS',
};

// ══════════════════════════════════════════
// ID GENERATORS (same pattern as desktop)
// ══════════════════════════════════════════

const uid = (prefix: string) => `${prefix}_${Date.now()}_${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;

// ══════════════════════════════════════════
// MAPPERS: Desktop JSON ↔ App TypeScript
// ══════════════════════════════════════════

// ── PATIENTS ──
// Desktop has TWO formats:
//   New:      { id, nombre, apellidos, dni, telefono, ... }
//   Migrated: { id, nombres, documento, telefono, estado, _origenMigracion, ... }

function desktopToPatient(c: any): Patient {
  const name = c.nombre
    ? [c.nombre, c.apellidos].filter(Boolean).join(' ').trim()
    : [c.nombres, c.apellidos].filter(Boolean).join(' ').trim();
  return {
    id: c.id,
    name: name || 'Sin nombre',
    dni: c.dni || c.documento || '',
    phone: c.telefono || undefined,
    address: c.direccion || undefined,
    birthDate: c.fechaNacimiento || undefined,
    isVIP: (c._totalVt || 0) >= 3,
    notes: c.ocupacion || undefined,
    createdAt: c.fechaCreacion || c.fechaModificacion || undefined,
  };
}

function patientToDesktop(p: Patient, existing?: any): any {
  return {
    ...(existing || {}),
    id: p.id,
    nombre: p.name,
    nombres: p.name,
    apellidos: '',
    dni: p.dni,
    documento: p.dni,
    telefono: p.phone || '',
    email: existing?.email || '',
    direccion: p.address || '',
    fechaNacimiento: p.birthDate || '',
    genero: existing?.genero || '',
    ocupacion: p.notes || existing?.ocupacion || '',
    estado: 'H',
    fechaCreacion: p.createdAt || new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
  };
}

// ── PRODUCTS ──

function desktopToProduct(p: any): Product {
  return {
    id: p.id,
    code: p.codigoBarras || p.id,
    name: p.nombre || p.descripcion || '',
    brand: p.marca || undefined,
    model: p.modelo || undefined,
    color: p.color || undefined,
    category: CAT_TO_APP[p.categoria] || 'other',
    material: p.material || undefined,
    costPrice: Number(p.costo) || 0,
    salePrice: Number(p.precio) || 0,
    stock: Number(p.stock) || 0,
    stockMin: Number(p.stockMin) || 5,
    status: 'active',
    createdAt: p.fechaCreacion || undefined,
  };
}

function productToDesktop(p: Product, existing?: any): any {
  return {
    ...(existing || {}),
    id: p.id,
    categoria: CAT_TO_DESKTOP[p.category] || 'ACCESORIOS',
    nombre: p.name,
    descripcion: p.name,
    precio: p.salePrice,
    costo: p.costPrice,
    stock: p.stock,
    stockMin: p.stockMin,
    marca: p.brand || '',
    modelo: p.model || '',
    color: p.color || '',
    material: p.material || '',
    codigoQR: p.code || p.id,
    codigoBarras: p.code || p.id,
    fechaCreacion: p.createdAt || new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
  };
}

// ── SALES ──
// Desktop items: { nombre, precio, importe, cantidad, descuento, productoId, descripcion, tipo }
// Desktop sale:  { total, totalPagar, totalBruto, totalDescuento, estadoPago, clienteNombre, vendedor, ... }

/** Convert short YYYY-MM-DD to local datetime (avoids UTC midnight shift) */
function _localizeDate(d: string): string {
  if (!d) return '';
  // Short date "2026-04-06" → "2026-04-06T00:00:00" (parsed as local, not UTC)
  if (d.length === 10 && d[4] === '-') return d + 'T00:00:00';
  return d;
}

/** Convert ISO/date to local YYYY-MM-DD string (for desktop fecha fields) */
function _toLocalYMD(d: string): string {
  if (!d) return new Date().toISOString().slice(0, 10);
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d.slice(0, 10);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
}

function desktopToSale(v: any): Sale {
  const statusMap: Record<string, Sale['status']> = { PAGADO: 'completed', PENDIENTE: 'pending', CANCELADO: 'cancelled' };
  const docMap: Record<string, Sale['documentType']> = { BOLETA: 'boleta', FACTURA: 'factura', TICKET: 'nota' };
  return {
    id: v.id,
    date: _localizeDate(v.fecha || v.fechaCreacion || ''),
    patientId: v.clienteId || undefined,
    patientName: v.clienteNombre || undefined,
    items: (v.items || []).map((it: any) => ({
      productId: it.productoId || it.codigo || '',
      productName: it.nombre || it.descripcion || '',
      productCode: it.productoId || it.codigo || '',
      quantity: Number(it.cantidad) || 1,
      unitPrice: Number(it.precio) || 0,
      discount: Number(it.descuento) || 0,
      subtotal: Number(it.importe) || Number(it.subtotal) || (Number(it.precio) || 0) * (Number(it.cantidad) || 1),
    })),
    subtotal: Number(v.totalBruto) || Number(v.total) || 0,
    discount: Number(v.totalDescuento) || 0,
    igv: 0,
    total: Number(v.totalPagar) || Number(v.total) || 0,
    paymentMethod: (v.metodoPago || 'cash') as Sale['paymentMethod'],
    documentType: docMap[v.docTipo] || 'boleta',
    documentNumber: v.docNumero ? `${v.docSerie || ''}-${v.docNumero}` : undefined,
    sellerId: v.vendedor || 'admin',
    sellerName: v.vendedor || 'Admin',
    abono: Number(v.saldoACuenta) || Number(v.pagado) || 0,
    saldo: Number(v.saldoTotal) || Number(v.saldo) || 0,
    status: statusMap[v.estadoPago] || 'completed',
  };
}

function saleToDesktop(s: Sale, existing?: any): any {
  const statusRev: Record<string, string> = { completed: 'PAGADO', pending: 'PENDIENTE', cancelled: 'CANCELADO' };
  const docRev: Record<string, string> = { boleta: 'BOLETA', factura: 'FACTURA', nota: 'TICKET' };
  const serieMap: Record<string, string> = { boleta: 'B001', factura: 'F001', nota: 'T001' };
  const now = new Date().toISOString();
  // Desktop expects fecha/fechaEmision as YYYY-MM-DD (local date)
  // buscarVentas() filters: v.fechaEmision !== today() → must match "2026-04-06" format
  const fechaLocal = _toLocalYMD(s.date);

  const docSerie = serieMap[s.documentType] || 'B001';
  // Parse docNumero from documentNumber "B001-000001" → "000001"
  const docNumero = s.documentNumber?.includes('-')
    ? s.documentNumber.split('-').pop() || ''
    : s.documentNumber || '';
  // Desktop scanner matches on codigoBarras = docSerie + docNumero (e.g. "B001000001")
  const codigoBarras = docNumero ? `${docSerie}${docNumero}` : '';

  // Use actual payment amounts — not hardcoded
  const saldoACuenta = s.abono ?? s.total;
  const saldoTotal = s.saldo ?? 0;

  return {
    ...(existing || {}),
    id: s.id,
    docTipo: docRev[s.documentType] || 'BOLETA',
    docSerie,
    docNumero,
    codigoBarras,
    codigoQR: codigoBarras,
    fecha: fechaLocal,
    fechaEmision: fechaLocal,
    clienteId: s.patientId || '',
    clienteNombre: s.patientName || '',
    vendedor: s.sellerName || 'Admin',
    metodoPago: s.paymentMethod || 'cash',
    items: s.items.map(it => ({
      productoId: it.productId,
      nombre: it.productName,
      descripcion: it.productName,
      cantidad: it.quantity,
      precio: it.unitPrice,
      importe: it.subtotal,
      descuento: it.discount,
      tipo: 'PRODUCTO',
    })),
    totalBruto: s.subtotal,
    totalDescuento: s.discount,
    totalPagar: s.total,
    total: s.total,
    saldoACuenta,
    pagado: saldoACuenta,
    saldoTotal,
    saldo: saldoTotal,
    estadoPago: statusRev[s.status] || 'PAGADO',
    estadoEntrega: 'PENDIENTE',
    establecimiento: s.establecimiento || getEstablecimiento(),
    fechaCreacion: existing?.fechaCreacion || now,
    // Desktop _mergeArrayById uses fechaModificacion for conflict resolution
    fechaModificacion: now,
  };
}

// ── PRESCRIPTIONS (medidas) ──
// Desktop fields: lejosOdEsf, lejosOdCil, lejosOdEje, lejosOdAdd,
//                 lejosOiEsf, lejosOiCil, lejosOiEje, lejosOiAdd,
//                 cercaOdEsf, cercaOdCil, cercaOdEje (near vision)
//                 lejosDip, dipOi, clienteId, fecha, tipo, especialista, rxObservacion

function desktopToPrescription(m: any): Prescription {
  return {
    id: m.id,
    patientId: m.clienteId || '',
    date: m.fecha || m.fechaCreacion || '',
    od: {
      sph: parseFloat(m.lejosOdEsf) || 0,
      cyl: parseFloat(m.lejosOdCil) || 0,
      axis: parseFloat(m.lejosOdEje) || 0,
      add: parseFloat(m.lejosOdAdd) || 0,
    },
    oi: {
      sph: parseFloat(m.lejosOiEsf) || 0,
      cyl: parseFloat(m.lejosOiCil) || 0,
      axis: parseFloat(m.lejosOiEje) || 0,
      add: parseFloat(m.lejosOiAdd) || 0,
    },
    dip: parseFloat(m.lejosDip) || parseFloat(m.dipOi) || 0,
    lensType: m.tipo || undefined,
    optometrist: m.especialista || undefined,
  };
}

function prescriptionToDesktop(rx: Prescription, existing?: any): any {
  const halfDip = String(Math.round(rx.dip / 2));
  return {
    ...(existing || {}),
    id: rx.id,
    clienteId: rx.patientId,
    fecha: rx.date || new Date().toISOString().slice(0, 10),
    tipo: rx.lensType || 'PROPIA',
    lejosOdEsf: Number(rx.od.sph).toFixed(2),
    lejosOdCil: Number(rx.od.cyl).toFixed(2),
    lejosOdEje: String(rx.od.axis),
    lejosOdAdd: Number(rx.od.add).toFixed(2),
    lejosOiEsf: Number(rx.oi.sph).toFixed(2),
    lejosOiCil: Number(rx.oi.cyl).toFixed(2),
    lejosOiEje: String(rx.oi.axis),
    lejosOiAdd: Number(rx.oi.add).toFixed(2),
    lejosDip: String(rx.dip),
    dipOi: halfDip,
    cercaOdEsf: existing?.cercaOdEsf || '',
    cercaOdCil: existing?.cercaOdCil || '',
    cercaOdEje: existing?.cercaOdEje || '',
    cercaOiEsf: existing?.cercaOiEsf || '',
    cercaOiCil: existing?.cercaOiCil || '',
    cercaOiEje: existing?.cercaOiEje || '',
    especialista: rx.optometrist || '',
    rxObservacion: existing?.rxObservacion || '',
    fechaCreacion: existing?.fechaCreacion || new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
  };
}

// ── CONSULTATIONS (consultas_clinicas) ──
// Desktop fields: idCliente, motivo, fecha,
//   diagMiopia, diagAstigmatismo, diagHipermetropia, diagPresbicia, diagAmbliopia,
//   rxDistEsfOD, rxDistCilOD, etc., nombreCliente, usuario

function desktopToConsultation(c: any): Consultation {
  const diagnosis = {
    myopia: !!c.diagMiopia,
    hyperopia: !!c.diagHipermetropia,
    astigmatism: !!c.diagAstigmatismo,
    presbyopia: !!c.diagPresbicia,
    amblyopia: !!c.diagAmbliopia,
  };

  const tags: string[] = [];
  if (c.diagMiopia) tags.push('Miopía');
  if (c.diagHipermetropia) tags.push('Hipermetropía');
  if (c.diagAstigmatismo) tags.push('Astigmatismo');
  if (c.diagPresbicia) tags.push('Presbicia');
  if (c.diagAmbliopia) tags.push('Ambliopía');
  if (c.diagAnisometropia) tags.push('Anisometropía');

  return {
    id: c.id,
    patientId: c.idCliente || c.clienteId || c.pacienteId || '',
    date: c.fecha || c.fechaCreacion || '',
    reason: c.motivo || '',
    diagnosis,
    diagnosisTags: tags,
    notes: c.observaciones || c.notas || undefined,
    optometrist: c.usuario || c.optometrista || c.doctor || undefined,
  };
}

function consultationToDesktop(c: Consultation, existing?: any): any {
  return {
    ...(existing || {}),
    id: c.id,
    idCliente: c.patientId,
    clienteId: c.patientId,
    fecha: c.date || new Date().toISOString(),
    motivo: c.reason,
    diagMiopia: c.diagnosis?.myopia || false,
    diagHipermetropia: c.diagnosis?.hyperopia || false,
    diagAstigmatismo: c.diagnosis?.astigmatism || false,
    diagPresbicia: c.diagnosis?.presbyopia || false,
    diagAmbliopia: c.diagnosis?.amblyopia || false,
    observaciones: c.notes || '',
    usuario: c.optometrist || '',
    fechaCreacion: existing?.fechaCreacion || new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════
// MIGRATION HISTORY (OPTI-SOFW legacy data)
// Chunks: migracion_historial_0..N, each is { [clienteId]: { rx: [...], vt: [...] } }
// Old RX format: { f, odE(esf), odC(cil), odJ(eje), oiE, oiC, oiJ, obs, dx, odR, oiR }
// Old VT format: { f, c(desc), t(total), a(aCuenta), d(desc), e(qty), m(marca) }
// ══════════════════════════════════════════

const PATIENTS_PER_CHUNK = 100; // Desktop uses 100 patients per chunk

/** Extract DIP from observation text like "DIP 63MM" or "DIP.65MM" */
function extractDip(obs: string): number {
  const m = obs.match(/DIP[.\s]*(\d{2,3})\s*(?:MM)?/i);
  return m ? parseInt(m[1]) : 63;
}

/** Extract optometrist name from obs, stripping DIP/MM/DR prefixes */
function extractOptometrist(obs: string): string | undefined {
  if (!obs) return undefined;
  // Remove "DIP.63MM" or "DIP 65 MM" or "dip63mm" patterns
  let name = obs.replace(/DIP[.\s]*\d{2,3}\s*(?:MM)?/gi, '').trim();
  // Remove leading "DR" / "DRA" / "dr." prefix (will re-add if needed)
  name = name.replace(/^DR\.?\s*/i, '').trim();
  // Remove leading numbers/noise
  name = name.replace(/^\d+\s*/, '').trim();
  if (!name) return undefined;
  return name;
}

function migratedRxToPrescription(rx: any, patientId: string, index: number): Prescription {
  const obs = rx.obs || '';
  return {
    id: `MIG_RX_${patientId}_${index}`,
    patientId,
    date: rx.f || '',
    od: {
      sph: parseFloat(rx.odE) || 0,
      cyl: parseFloat(rx.odC) || 0,
      axis: parseFloat(rx.odJ) || 0,
      add: 0,
    },
    oi: {
      sph: parseFloat(rx.oiE) || 0,
      cyl: parseFloat(rx.oiC) || 0,
      axis: parseFloat(rx.oiJ) || 0,
      add: 0,
    },
    dip: extractDip(obs),
    lensType: rx.dx || undefined,
    optometrist: extractOptometrist(obs),
  };
}

function migratedVtToSale(vt: any, patientId: string, patientName: string, index: number): Sale {
  return {
    id: `MIG_VEN_${patientId}_${index}`,
    date: vt.f || '',
    patientId,
    patientName,
    items: [{
      productId: `MIG_${index}`,
      productName: [vt.c, vt.m].filter(Boolean).join(' - ') || 'Producto migrado',
      productCode: '',
      quantity: Number(vt.e) || 1,
      unitPrice: Number(vt.t) || 0,
      discount: Number(vt.d) || 0,
      subtotal: Number(vt.t) || 0,
    }],
    subtotal: Number(vt.t) || 0,
    discount: Number(vt.d) || 0,
    igv: 0,
    total: Number(vt.t) || 0,
    paymentMethod: 'cash',
    documentType: 'nota',
    sellerId: 'migrado',
    sellerName: 'Migrado',
    status: 'completed',
  };
}

/** Load migration history for a specific patient. Returns { rx, vt } or null. */
async function loadMigrationHistory(patientId: string): Promise<{ rx: any[]; vt: any[] } | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  // Determine which chunk this patient is in based on the numeric suffix
  const match = patientId.match(/_(\d+)$/);
  if (!match) return null;
  const patientIndex = parseInt(match[1]);
  const chunkIndex = Math.floor(patientIndex / PATIENTS_PER_CHUNK);
  const chunkKey = `migracion_historial_${chunkIndex}`;

  try {
    const chunk = await loadData<Record<string, { rx?: any[]; vt?: any[] }>>(chunkKey);
    if (!chunk || typeof chunk !== 'object' || Array.isArray(chunk)) return null;

    const entry = chunk[patientId];
    if (!entry) return null;

    return {
      rx: Array.isArray(entry.rx) ? entry.rx : [],
      vt: Array.isArray(entry.vt) ? entry.vt : [],
    };
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════
// PATIENTS
// ══════════════════════════════════════════

// Internal: sorted + filtered patient list — cached after first mapping
let _mappedPatients: { raw: any[]; mapped: Patient[] } | null = null;

function mapAndCachePatients(raw: any[]): Patient[] {
  if (_mappedPatients && _mappedPatients.raw === raw) return _mappedPatients.mapped;
  const mapped = raw
    .filter((c: any) => c.estado !== 'D')
    .map(desktopToPatient)
    .sort((a, b) => a.name.localeCompare(b.name));
  _mappedPatients = { raw, mapped };
  return mapped;
}

export async function fetchPatients(): Promise<Patient[]> {
  if (!isSupabaseConfigured) return demo.fetchPatients();
  const raw = await loadData<any[]>('clientes');
  return mapAndCachePatients(raw);
}

export async function getPatient(id: string): Promise<Patient | null> {
  if (!isSupabaseConfigured) return demo.getPatient(id);
  const raw = await loadData<any[]>('clientes');
  const found = raw.find((c: any) => c.id === id);
  return found ? desktopToPatient(found) : null;
}

export async function createPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Promise<string> {
  if (!isSupabaseConfigured) return demo.createPatient(patient);
  const id = uid('CLI');
  const raw = await loadData<any[]>('clientes');
  const newPatient: Patient = { id, ...patient, createdAt: new Date().toISOString() };
  raw.push(patientToDesktop(newPatient));
  _mappedPatients = null; // invalidate mapping cache
  await saveData('clientes', raw);
  return id;
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<void> {
  if (!isSupabaseConfigured) return demo.updatePatient(id, updates);
  const raw = await loadData<any[]>('clientes');
  const idx = raw.findIndex((c: any) => c.id === id);
  if (idx < 0) return;
  const current = desktopToPatient(raw[idx]);
  const updated = { ...current, ...updates };
  raw[idx] = patientToDesktop(updated, raw[idx]);
  _mappedPatients = null;
  await saveData('clientes', raw);
}

export function searchPatients(term: string, patients: Patient[]): Patient[] {
  const t = term.toLowerCase().trim();
  if (!t) return patients;

  // Exact DNI/phone match — always include
  const exactMatches = patients.filter(p =>
    p.dni.toLowerCase().includes(t) || (p.phone && p.phone.includes(t))
  );

  // Fuzzy name matching
  const searchWords = t.split(/\s+/).filter(Boolean);

  const scored: { patient: Patient; score: number }[] = [];
  for (const p of patients) {
    if (exactMatches.includes(p)) continue;
    const nameLower = p.name.toLowerCase();

    // Exact substring match gets highest score
    if (nameLower.includes(t)) {
      scored.push({ patient: p, score: 100 });
      continue;
    }

    // Word-by-word fuzzy match
    const nameWords = nameLower.split(/\s+/).filter(Boolean);
    let totalScore = 0;
    for (const sw of searchWords) {
      let bestWordScore = 0;
      for (const nw of nameWords) {
        // Prefix match
        if (nw.startsWith(sw) || sw.startsWith(nw)) {
          bestWordScore = Math.max(bestWordScore, 80);
          continue;
        }
        // Contains match
        if (nw.includes(sw) || sw.includes(nw)) {
          bestWordScore = Math.max(bestWordScore, 60);
          continue;
        }
        // Levenshtein distance for typos (only for words 3+ chars)
        if (sw.length >= 3 && nw.length >= 3) {
          const dist = _levenshtein(sw, nw);
          const maxLen = Math.max(sw.length, nw.length);
          const similarity = 1 - dist / maxLen;
          if (similarity >= 0.55) {
            bestWordScore = Math.max(bestWordScore, Math.round(similarity * 50));
          }
        }
      }
      totalScore += bestWordScore;
    }
    if (totalScore > 0) {
      scored.push({ patient: p, score: totalScore / searchWords.length });
    }
  }

  // Sort by score descending, take top 30
  scored.sort((a, b) => b.score - a.score);
  const fuzzyResults = scored.slice(0, 30).map(s => s.patient);

  // Combine: exact matches first, then fuzzy
  const seen = new Set(exactMatches.map(p => p.id));
  const combined = [...exactMatches];
  for (const p of fuzzyResults) {
    if (!seen.has(p.id)) { combined.push(p); seen.add(p.id); }
  }
  return combined;
}

function _levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// ══════════════════════════════════════════
// CONSULTATIONS (consultas_clinicas)
// ══════════════════════════════════════════

export async function fetchConsultations(patientId: string): Promise<Consultation[]> {
  if (!isSupabaseConfigured) return demo.fetchConsultations(patientId);
  const raw = await loadData<any[]>('consultas_clinicas');
  return raw
    .filter((c: any) => c.idCliente === patientId || c.clienteId === patientId || c.pacienteId === patientId)
    .map(desktopToConsultation)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createConsultation(
  patientId: string,
  c: Omit<Consultation, 'id' | 'patientId'>
): Promise<string> {
  if (!isSupabaseConfigured) return demo.createConsultation(patientId, c);
  const id = uid('CONS');
  const raw = await loadData<any[]>('consultas_clinicas');
  const full: Consultation = { id, patientId, ...c, date: c.date || new Date().toISOString() };
  raw.push(consultationToDesktop(full));
  await saveData('consultas_clinicas', raw);
  return id;
}

// ══════════════════════════════════════════
// PRESCRIPTIONS (medidas)
// ══════════════════════════════════════════

export async function fetchPrescriptions(patientId: string): Promise<Prescription[]> {
  if (!isSupabaseConfigured) return demo.fetchPrescriptions(patientId);

  // 1. Current medidas (new desktop system)
  const raw = await loadData<any[]>('medidas');
  const current = raw
    .filter((m: any) => m.clienteId === patientId)
    .map(desktopToPrescription);

  // 2. Migrated OPTI-SOFW history (old system)
  const migration = await loadMigrationHistory(patientId);
  const migrated = migration
    ? migration.rx.map((rx, i) => migratedRxToPrescription(rx, patientId, i))
    : [];

  return [...current, ...migrated]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createPrescription(
  patientId: string,
  rx: { od: EyeRx; oi: EyeRx; dip: number; lensType?: string; material?: string; treatments?: string[]; optometrist?: string }
): Promise<string> {
  if (!isSupabaseConfigured) return demo.createPrescription(patientId, rx);
  const id = uid('RX');
  const raw = await loadData<any[]>('medidas');
  const full: Prescription = { id, patientId, date: new Date().toISOString(), ...rx };
  raw.push(prescriptionToDesktop(full));
  await saveData('medidas', raw);
  return id;
}

// ══════════════════════════════════════════
// PRODUCTS (productos)
// ══════════════════════════════════════════

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return demo.fetchProducts();
  const raw = await loadData<any[]>('productos');
  return raw
    .map(desktopToProduct)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return demo.fetchAllProducts();
  const raw = await loadData<any[]>('productos');
  return raw.map(desktopToProduct).sort((a, b) => a.name.localeCompare(b.name));
}

export async function createProduct(p: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  if (!isSupabaseConfigured) return demo.createProduct(p);
  const id = uid('PROD');
  const raw = await loadData<any[]>('productos');
  const full: Product = { id, ...p, createdAt: new Date().toISOString() };
  raw.push(productToDesktop(full));
  await saveData('productos', raw);
  return id;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  if (!isSupabaseConfigured) return demo.updateProduct(id, updates);
  const raw = await loadData<any[]>('productos');
  const idx = raw.findIndex((p: any) => p.id === id);
  if (idx < 0) return;
  const current = desktopToProduct(raw[idx]);
  const updated = { ...current, ...updates };
  raw[idx] = productToDesktop(updated, raw[idx]);
  await saveData('productos', raw);
}

export function searchProducts(term: string, products: Product[]): Product[] {
  const t = term.toLowerCase().trim();
  if (!t) return products;
  return products.filter(p =>
    p.name.toLowerCase().includes(t) ||
    p.code.toLowerCase().includes(t) ||
    (p.brand && p.brand.toLowerCase().includes(t)) ||
    (p.model && p.model.toLowerCase().includes(t))
  );
}

// ══════════════════════════════════════════
// LENS INVENTORY (inventario_lunas)
// ══════════════════════════════════════════

export async function fetchLensInventory(): Promise<InventoryItem[]> {
  if (!isSupabaseConfigured) return demo.fetchLensInventory();
  const raw = await loadData<any[]>('inventario_lunas');
  if (!raw || raw.length === 0) return demo.fetchLensInventory();
  return raw.map((r: any, i: number) => ({
    id: r.id || `li-${i}`,
    material: r.material || r.tipo || 'CR-39',
    sph: parseFloat(r.esfera || r.sph) || 0,
    cyl: parseFloat(r.cilindro || r.cyl) || 0,
    stock: Number(r.stock || r.cantidad) || 0,
  }));
}

// ══════════════════════════════════════════
// SALES (ventas)
// ══════════════════════════════════════════

export async function fetchSales(limitCount = 50): Promise<Sale[]> {
  if (!isSupabaseConfigured) return demo.fetchSales();
  const raw = await loadData<any[]>('ventas');
  return raw
    .map(desktopToSale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limitCount);
}

export async function fetchSalesForPatient(patientId: string): Promise<Sale[]> {
  if (!isSupabaseConfigured) return [];

  // 1. Current ventas
  const raw = await loadData<any[]>('ventas');
  const current = raw
    .filter((v: any) => v.clienteId === patientId)
    .map(desktopToSale);

  // 2. Migrated sales
  const patient = await getPatient(patientId);
  const patientName = patient?.name || '';
  const migration = await loadMigrationHistory(patientId);
  const migrated = migration
    ? migration.vt
        .filter((v: any) => Number(v.t) > 0) // Only sales with a total
        .map((v, i) => migratedVtToSale(v, patientId, patientName, i))
    : [];

  return [...current, ...migrated]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function fetchTodaySales(): Promise<Sale[]> {
  if (!isSupabaseConfigured) return demo.fetchTodaySales();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raw = await loadData<any[]>('ventas');
  return raw
    .filter((v: any) => {
      const fecha = v.fecha || v.fechaCreacion || '';
      const d = new Date(_localizeDate(fecha));
      return d >= today && v.estadoPago !== 'CANCELADO';
    })
    .map(desktopToSale)
    .sort((a, b) => new Date(_localizeDate(b.date)).getTime() - new Date(_localizeDate(a.date)).getTime());
}

export async function createSale(sale: Omit<Sale, 'id'>): Promise<string> {
  if (!isSupabaseConfigured) return demo.createSale(sale);
  const id = uid('VEN');

  const ventas = await loadData<any[]>('ventas');

  // Auto-generate docNumero — desktop-compatible, 6-digit zero-padded, per-series increment
  const serieMap: Record<string, string> = { boleta: 'B001', factura: 'F001', nota: 'T001' };
  const docSerie = serieMap[sale.documentType] || 'B001';
  const maxNum = ventas.reduce((max: number, v: any) => {
    if (v.docSerie !== docSerie) return max;
    const n = parseInt(v.docNumero);
    return (!isNaN(n) && n > max) ? n : max;
  }, 0);
  const docNumero = String(maxNum + 1).padStart(6, '0');
  const documentNumber = `${docSerie}-${docNumero}`;

  const full: Sale = { id, ...sale, date: sale.date || new Date().toISOString(), documentNumber };

  ventas.push(saleToDesktop(full));
  await saveData('ventas', ventas);

  // Decrease product stock
  const productos = await loadData<any[]>('productos');
  let stockChanged = false;
  for (const item of sale.items) {
    const pIdx = productos.findIndex((p: any) => p.id === item.productId || p.codigoBarras === item.productCode);
    if (pIdx >= 0) {
      productos[pIdx].stock = Math.max(0, (productos[pIdx].stock || 0) - item.quantity);
      stockChanged = true;
    }
  }
  if (stockChanged) {
    await saveData('productos', productos);
  }

  return id;
}

export async function cancelSale(saleId: string): Promise<void> {
  if (!isSupabaseConfigured) return demo.cancelSale(saleId);
  const ventas = await loadData<any[]>('ventas');
  const idx = ventas.findIndex((v: any) => v.id === saleId);
  if (idx < 0) return;

  const sale = ventas[idx];
  ventas[idx].estadoPago = 'CANCELADO';
  ventas[idx].fechaModificacion = new Date().toISOString();
  await saveData('ventas', ventas);

  const productos = await loadData<any[]>('productos');
  const items = sale.items || [];
  let stockChanged = false;
  for (const item of items) {
    const pIdx = productos.findIndex((p: any) => p.id === item.productoId || p.codigoBarras === item.productoId);
    if (pIdx >= 0) {
      productos[pIdx].stock = (productos[pIdx].stock || 0) + (item.cantidad || 1);
      stockChanged = true;
    }
  }
  if (stockChanged) {
    await saveData('productos', productos);
  }
}

// ══════════════════════════════════════════
// DASHBOARD STATS (optimized — no full patient list needed)
// ══════════════════════════════════════════

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured) return demo.fetchDashboardStats();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [clientes, productos, ventas] = await Promise.all([
    loadData<any[]>('clientes'),
    loadData<any[]>('productos'),
    loadData<any[]>('ventas'),
  ]);

  const todaySales = ventas.filter((v: any) => {
    const raw = v.fecha || v.fechaCreacion || '';
    // _localizeDate converts "2026-04-06" → "2026-04-06T00:00:00" (local, not UTC)
    const d = new Date(_localizeDate(raw));
    return d >= today && v.estadoPago !== 'CANCELADO';
  });

  const dailySales = todaySales.reduce((sum: number, v: any) => sum + (Number(v.totalPagar) || Number(v.total) || 0), 0);
  const criticalStock = productos.filter((p: any) => (p.stock || 0) <= (p.stockMin || 5)).length;

  return {
    dailySales,
    dailySalesCount: todaySales.length,
    consultationsToday: 0,
    criticalStock,
    totalPatients: clientes.filter((c: any) => c.estado !== 'D').length,
  };
}

// ══════════════════════════════════════════
// PRINT RX
// ══════════════════════════════════════════

const COLOR_MAP: Record<string, string> = {
  dos_de_mayo: '#7c3aed',
  plaza_de_armas: '#312e81',
};
function getPrintColor() { return COLOR_MAP[getEstablecimiento()] || '#7c3aed'; }

/** Strip "Dr.", "Dra.", "Doctor", "Doctora" prefix from seller name */
function _cleanSellerName(name: string): string {
  return name.replace(/^(DRA?\.?\s*|DOCTORA?\s*)/i, '').trim();
}

export function printPrescription(patient: Patient, rx: Prescription, optometrist?: string) {
  // Capacitor Android: use PDF + native print dialog
  if (_isCapacitor()) {
    const file = generateRxPdf(patient, rx, optometrist);
    _capacitorPrintPdf(file, 'Receta Optica').catch(err => {
      console.error('[printPrescription] Print failed:', err);
      _emitPrintEvent('error', 'Error al imprimir receta');
    });
    return;
  }

  const c = getPrintColor();
  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const loc = getEstablecimiento().replace(/_/g, ' ').toUpperCase();
  const store = _getStoreInfo(getEstablecimiento());

  // Near vision section when ADD > 0
  const hasNearVision = rx.od.add > 0 || rx.oi.add > 0;
  const nearSection = hasNearVision ? `
    <div class="section-title">VISION CERCANA (ADD)</div>
    <table>
      <thead><tr><th>OJO</th><th>ESF</th><th>CIL</th><th>EJE</th><th>ADD</th></tr></thead>
      <tbody>
        <tr><td class="eye">OD</td><td>${fv(rx.od.sph + rx.od.add)}</td><td>${fv(rx.od.cyl)}</td><td>${rx.od.axis}&deg;</td><td>${fv(rx.od.add)}</td></tr>
        <tr><td class="eye">OI</td><td>${fv(rx.oi.sph + rx.oi.add)}</td><td>${fv(rx.oi.cyl)}</td><td>${rx.oi.axis}&deg;</td><td>${fv(rx.oi.add)}</td></tr>
      </tbody>
    </table>` : '';

  const rxHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>RX - ${patient.name}</title>
<style>
  @page { size: 185mm 260mm; margin: 8mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; color: #000; background: white; }
  .rx-page { width:185mm; margin:0 auto; border:3px solid ${c}; padding:10mm; position:relative; }
  .sidebar { position:absolute; left:0; top:0; bottom:0; width:15mm; background:${c}; display:flex; align-items:center; justify-content:center; }
  .sidebar span { writing-mode:vertical-rl; text-orientation:mixed; color:white; font-size:14px; font-weight:900; letter-spacing:4px; }
  .content { margin-left:18mm; }
  .header { text-align:center; border-bottom:3px solid ${c}; padding-bottom:5mm; margin-bottom:5mm; }
  .header h1 { font-size:22px; font-weight:900; color:${c}; letter-spacing:2px; }
  .header p { font-size:10px; color:#666; margin-top:2mm; }
  .section-title { background:${c}; color:white; text-align:center; padding:2mm; font-size:12px; font-weight:900; letter-spacing:1.2px; margin:3mm 0 1mm; }
  table { width:100%; border-collapse:collapse; border:2px solid ${c}; margin-bottom:3mm; }
  th { background:${c}; color:white; padding:3mm; font-size:10px; font-weight:900; text-align:center; border:1px solid ${c}; }
  td { padding:4mm 2mm; border:1px solid ${c}; text-align:center; font-size:16px; font-weight:700; }
  td.eye { font-weight:900; color:${c}; font-size:14px; }
  .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:8mm; font-size:11px; }
  .footer .sign { border-top:2px solid ${c}; width:50mm; text-align:center; padding-top:2mm; font-weight:bold; }
  .store-info { font-size:8px; color:#888; margin-top:3mm; }
</style></head><body>
<div class="rx-page">
  <div class="sidebar"><span>CENTRO OPTICO SICUANI</span></div>
  <div class="content">
    <div class="header">
      <h1>CENTRO OPTICO SICUANI</h1>
      <p>Salud Visual Profesional &mdash; ${loc}</p>
      <p style="font-size:9px;color:#888;margin-top:1mm;">${store.direccion} &bull; Tel: ${store.telefono}</p>
    </div>
    <div class="section-title">DATOS DEL PACIENTE</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin:3mm 0;font-size:12px;">
      <div><b style="color:${c};">Paciente:</b> ${patient.name}</div>
      <div><b style="color:${c};">DNI:</b> ${patient.dni}</div>
      <div><b style="color:${c};">Fecha:</b> ${new Date(rx.date || Date.now()).toLocaleDateString('es-PE')}</div>
      <div><b style="color:${c};">Tel:</b> ${patient.phone || '---'}</div>
    </div>
    <div class="section-title">VISION LEJANA</div>
    <table>
      <thead><tr><th>OJO</th><th>ESF</th><th>CIL</th><th>EJE</th><th>ADD</th><th>DIP</th></tr></thead>
      <tbody>
        <tr><td class="eye">OD</td><td>${fv(rx.od.sph)}</td><td>${fv(rx.od.cyl)}</td><td>${rx.od.axis}&deg;</td><td>${fv(rx.od.add)}</td><td rowspan="2" style="font-size:20px;">${rx.dip}</td></tr>
        <tr><td class="eye">OI</td><td>${fv(rx.oi.sph)}</td><td>${fv(rx.oi.cyl)}</td><td>${rx.oi.axis}&deg;</td><td>${fv(rx.oi.add)}</td></tr>
      </tbody>
    </table>
    ${nearSection}
    ${rx.lensType ? `<div style="font-size:12px;margin:2mm 0;"><b style="color:${c};">Tipo:</b> ${rx.lensType}</div>` : ''}
    <div style="border:1.5px solid ${c};padding:3mm;margin:3mm 0;min-height:15mm;">
      <div style="font-size:10px;font-weight:900;color:${c};margin-bottom:1mm;">OBSERVACIONES</div>
      <div style="font-size:11px;">&nbsp;</div>
    </div>
    <div class="footer">
      <div>
        <div>Proximo control: ___________________</div>
        <div class="store-info">RUC: ${store.ruc}</div>
      </div>
      <div class="sign">Especialista<br/>${optometrist || rx.optometrist || ''}</div>
    </div>
  </div>
</div>
</body></html>`;
  printHtml(rxHtml);
}

// ══════════════════════════════════════════
// PRINT SALE TICKET (80mm thermal)
// ══════════════════════════════════════════

/** Detect mobile/Android */
function _isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/** Detect Capacitor native environment (Android/iOS WebView) */
function _isCapacitor(): boolean {
  return typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();
}

/** Efficient ArrayBuffer to base64 — uses chunked conversion instead of byte-by-byte */
function _arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK = 8192;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return btoa(chunks.join(''));
}

/** Emit a print feedback event for the UI to display */
function _emitPrintEvent(type: 'success' | 'error' | 'info', message: string) {
  window.dispatchEvent(new CustomEvent('print-feedback', {
    detail: { type, message }
  }));
}

/**
 * Share a file natively via Capacitor (Filesystem + Share).
 * Saves the file to cache directory, then opens native share sheet.
 */
async function _capacitorShareFile(file: File, title?: string): Promise<void> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');

  // Read file as base64 (chunked, efficient)
  const arrayBuffer = await file.arrayBuffer();
  const base64 = _arrayBufferToBase64(arrayBuffer);

  // Write to cache directory
  const result = await Filesystem.writeFile({
    path: file.name,
    data: base64,
    directory: Directory.Cache,
  });

  // Share the file via native share sheet (print, save, WhatsApp, etc.)
  await Share.share({
    title: title || file.name,
    url: result.uri,
    dialogTitle: title || 'Compartir documento',
  });
}

/**
 * Print a PDF directly using Android's PrintManager via the local PrintPdf plugin.
 * Falls back to _capacitorShareFile() if the plugin is not available.
 */
async function _capacitorPrintPdf(file: File, jobName?: string): Promise<void> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');

  // Write PDF to cache using efficient base64 conversion
  const arrayBuffer = await file.arrayBuffer();
  const base64 = _arrayBufferToBase64(arrayBuffer);

  const result = await Filesystem.writeFile({
    path: file.name,
    data: base64,
    directory: Directory.Cache,
  });

  // Try native PrintPdf plugin (direct Android print dialog)
  try {
    const { Capacitor } = await import('@capacitor/core');
    const PrintPdf = (Capacitor as any).Plugins?.['PrintPdf'];
    if (PrintPdf?.print) {
      await PrintPdf.print({
        uri: result.uri,
        jobName: jobName || file.name.replace('.pdf', ''),
      });
      _emitPrintEvent('success', 'Documento enviado a impresora');
      return;
    }
  } catch (e) {
    console.warn('[PrintPdf plugin] Not available, falling back to share:', e);
  }

  // Fallback: share sheet
  const { Share } = await import('@capacitor/share');
  await Share.share({
    title: jobName || file.name,
    url: result.uri,
    dialogTitle: jobName || 'Imprimir documento',
  });
  _emitPrintEvent('info', 'Seleccione "Imprimir" en el menu');
}

/**
 * Cross-platform print: works on desktop (iframe), mobile browser (Blob URL),
 * and Capacitor Android/iOS (native share via PDF).
 */
function printHtml(html: string): void {
  const c = getPrintColor();
  if (_isMobile()) {
    // Mobile: inline overlay with iframe preview — avoids popup blockers
    const existing = document.getElementById('__printOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = '__printOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `background:linear-gradient(135deg,${c},${c}dd);padding:12px 16px;display:flex;gap:10px;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.25);flex-shrink:0;`;
    toolbar.innerHTML = `
      <button id="__doPrint" style="background:#fff;color:${c};border:none;padding:12px 32px;border-radius:12px;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15);letter-spacing:0.5px;">IMPRIMIR</button>
      <button id="__closePrint" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.4);padding:12px 24px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;">Cerrar</button>
    `;
    overlay.appendChild(toolbar);

    // Preview iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'flex:1;border:none;width:100%;';
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // Load content into iframe
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    iframe.src = blobUrl;

    document.getElementById('__doPrint')!.onclick = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Fallback: open blob in new tab
        window.open(blobUrl, '_blank');
      }
    };

    document.getElementById('__closePrint')!.onclick = () => {
      overlay.remove();
      URL.revokeObjectURL(blobUrl);
    };
  } else {
    // Desktop: iframe for cleaner UX (no new tab)
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);
    const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iDoc) { document.body.removeChild(iframe); return; }
    iDoc.open();
    iDoc.write(html);
    iDoc.close();
    const win = iframe.contentWindow;
    if (!win) { document.body.removeChild(iframe); return; }
    const doPrint = () => {
      try { win.focus(); win.print(); } catch {}
      setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 1000);
    };
    win.onload = () => setTimeout(doPrint, 300);
    setTimeout(doPrint, 2000);
  }
}

export function printSaleTicket(sale: Sale, patient?: Patient | null) {
  // Capacitor Android: share PNG image for thermal printer apps (Thermer, RawBT, etc.)
  if (_isCapacitor()) {
    try {
      const imgFile = generateTicketImage(sale, patient);
      _capacitorShareFile(imgFile, 'Imprimir Ticket').catch(err => {
        console.error('[printSaleTicket] Share image failed:', err);
        _emitPrintEvent('error', 'Error al imprimir ticket');
      });
    } catch (err) {
      console.error('[printSaleTicket] Image generation failed:', err);
      _emitPrintEvent('error', 'Error generando ticket');
    }
    return;
  }

  const est = getEstablecimiento();

  // Datos del establecimiento — idéntico al sistema desktop
  const ed = est === 'plaza_de_armas' ? {
    nombre: 'ÓPTICA "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRÍA',
    direccion: 'Jr. Garcilazo de la Vega 135 – Sicuani, Cusco',
    telefono: 'Cel. 984 047 273',
    ruc: '10239810792',
  } : {
    nombre: 'CENTRO ÓPTICO "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRÍA',
    direccion: 'Jr. Dos de Mayo 217 – Sicuani, Cusco',
    telefono: 'Cel. 984 574 974',
    ruc: '10238006312',
  };

  // Fecha — safe para ISO "2026-04-10T..." y "2026-04-10"
  const d = new Date(sale.date.includes('T') ? sale.date : sale.date + 'T00:00:00');
  const fechaFormateada = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  // Tipo documento
  const tipoDoc = (sale.documentType || 'boleta').toUpperCase();
  let tituloDocumento = 'BOLETA DE VENTA';
  if (tipoDoc === 'FACTURA') tituloDocumento = 'FACTURA';
  else if (tipoDoc === 'NOTA' || tipoDoc === 'TICKET') tituloDocumento = 'TICKET DE VENTA';

  // Pago
  const pagoLabel = sale.paymentMethod === 'cash' ? 'CONTADO' : sale.paymentMethod === 'card' ? 'TARJETA' : sale.paymentMethod === 'yape' ? 'YAPE' : sale.paymentMethod === 'plin' ? 'PLIN' : 'TRANSFERENCIA';

  // Cliente
  const nombreCompleto = (sale.patientName || patient?.name || 'CLIENTE EVENTUAL').toUpperCase();

  // Saldo
  const aCuenta = sale.abono ?? sale.total;
  const saldoPendiente = sale.saldo ?? 0;

  // Número de documento
  const docSerie = sale.documentNumber || sale.id.slice(-8).toUpperCase();

  // Items — limpieza idéntica al desktop
  let itemsHtml = '';
  let subtotalBruto = 0;
  let totalDescuento = 0;
  sale.items.forEach((item) => {
    const importe = (item.quantity * item.unitPrice) - (item.discount || 0);
    subtotalBruto += item.quantity * item.unitPrice;
    totalDescuento += item.discount || 0;
    let desc = item.productName;
    desc = desc.replace(/\s*OD:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+\s*OI:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+/gi, '');
    desc = desc.replace(/\s*\(?\s*OD[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*OI[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*\)?/gi, '');
    desc = desc.replace(/\s*[—–-]\s*Serie\s*\S+/gi, '');
    desc = desc.replace(/\s+/g, ' ').trim();
    itemsHtml += `
      <div style="margin-bottom: 3px; padding-bottom: 2px; border-bottom: 1px dotted #ccc;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900;">
          <span>${item.quantity.toFixed(0)}x ${desc}</span>
          <span style="white-space: nowrap; margin-left: 6px;">S/.${importe.toFixed(2)}</span>
        </div>
      </div>`;
  });

  const ticketHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${tituloDocumento} ${docSerie}</title>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-weight: 700; }
  html, body { font-family: 'Courier New', Courier, monospace; margin: 0 !important; padding: 0 !important; font-weight: 700; width: 80mm; }
  @media print { @page { size: 80mm auto; margin: 0 !important; padding: 0 !important; } html, body { margin: 0 !important; padding: 0 !important; } }
  .sep { border-top: 1px dashed #000; margin: 5px 0; }
  .sep-double { border-top: 2px solid #000; margin: 5px 0; }
  .sep-line { border-top: 1px solid #000; margin: 4px 0; }
  .row { display: flex; justify-content: space-between; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
</style></head><body>
<div style="width: 80mm; margin: 0 auto; padding: 2px 6px 8px 6px; font-size: 11px; line-height: 1.4; color: #000;">

  <!-- ENCABEZADO EMPRESA -->
  <div class="center" style="margin-bottom: 2px;">
    <div style="font-size: 15px; font-weight: 900; letter-spacing: 0.5px;">${ed.nombre}</div>
    <div style="font-size: 8px; font-weight: 700; margin-top: 2px; letter-spacing: 0.5px;">${ed.subtitulo}</div>
  </div>
  <div class="sep-line"></div>
  <div class="center" style="font-size: 10px; line-height: 1.4; padding: 3px 0; font-weight: 900;">
    <div>${ed.direccion}</div>
    <div>${ed.telefono} &nbsp;&middot;&nbsp; RUC: ${ed.ruc}</div>
  </div>
  <div class="sep"></div>

  <!-- TIPO DOCUMENTO -->
  <div class="center" style="padding: 6px 0;">
    <div style="font-size: 13px; font-weight: 900; letter-spacing: 1px;">${tituloDocumento}</div>
    <div style="font-size: 14px; font-weight: 900; margin-top: 2px;">N&deg; &nbsp;${docSerie}</div>
  </div>
  <div class="sep"></div>

  <!-- DATOS DE LA VENTA -->
  <div style="padding: 4px 0; font-size: 10px;">
    <div class="row"><span class="bold">FECHA</span><span>${fechaFormateada}</span></div>
    <div class="row"><span class="bold">CLIENTE</span><span>${nombreCompleto}</span></div>
    ${patient?.dni ? `<div class="row"><span class="bold">DNI</span><span>${patient.dni}</span></div>` : ''}
    <div class="row"><span class="bold">PAGO</span><span>${pagoLabel}</span></div>
    <div class="row"><span class="bold">VENDEDOR</span><span>${_cleanSellerName((sale.sellerName || '').toUpperCase())}</span></div>
  </div>
  <div class="sep"></div>

  <!-- CABECERA ITEMS -->
  <div class="row bold" style="font-size: 10px; padding: 3px 0; border-bottom: 1px solid #000;">
    <span>CANT.</span>
    <span style="flex: 1; text-align: center;">DESCRIPCION</span>
    <span>IMPORTE</span>
  </div>

  <!-- ITEMS -->
  <div style="padding: 4px 0;">
    ${itemsHtml}
  </div>
  <div class="sep"></div>

  <!-- SUBTOTAL / DESCUENTO -->
  <div style="padding: 3px 0; font-size: 10px;">
    <div class="row"><span>SUBTOTAL</span><span class="bold">S/. ${subtotalBruto.toFixed(2)}</span></div>
    <div class="row"><span>DESCUENTO</span><span>S/. ${totalDescuento.toFixed(2)}</span></div>
  </div>
  <div class="sep-double"></div>

  <!-- TOTAL -->
  <div class="row" style="padding: 3px 0; align-items: baseline;">
    <span style="font-size: 12px; font-weight: 900;">TOTAL S/.</span>
    <span style="font-size: 16px; font-weight: 900;">${sale.total.toFixed(2)}</span>
  </div>
  <div class="sep"></div>

  <!-- A CUENTA -->
  <div style="padding: 3px 0; font-size: 10px;">
    <div class="row"><span>A CUENTA</span><span>S/. ${aCuenta.toFixed(2)}</span></div>
  </div>
  <!-- SALDO PENDIENTE -->
  <div style="padding: 4px 0; font-size: 11px; font-weight: 900;">
    <div class="row"><span>SALDO PENDIENTE</span><span>S/. ${saldoPendiente.toFixed(2)}</span></div>
  </div>
  <div class="sep"></div>

  <!-- AGRADECIMIENTO -->
  <div class="center bold" style="padding: 6px 0; font-size: 10px; letter-spacing: 0.5px;">
    &mdash; GRACIAS POR SU PREFERENCIA &mdash;
  </div>

  <!-- QR + DESPACHO/BARCODE -->
  <div style="display: flex; align-items: flex-start; gap: 4px; padding: 6px 0; border-top: 1px dashed #000;">
    <div style="flex: 1; text-align: center;">
      <div style="font-size: 8px; font-weight: 700; border: 1px solid #000; padding: 2px 6px; margin-bottom: 4px; display: inline-block;">DESPACHO / ENTREGA</div>
      <div><svg id="barcode-ticket"></svg></div>
    </div>
    <div style="text-align: center; min-width: 80px;">
      <div style="font-size: 8px; font-weight: 700; margin-bottom: 3px;">PAGINA WEB</div>
      <div id="qrFacebook" style="display: inline-block;"></div>
      <div style="font-size: 6px; margin-top: 2px; word-break: break-all; max-width: 80px;">centroopticosicuani</div>
    </div>
  </div>

  <!-- CONDICIONES DEL CASO -->
  <div style="padding: 6px 2px; border-top: 1px dashed #000; font-family: Arial, sans-serif;">
    <div class="center bold" style="font-size: 9px; margin-bottom: 4px;">CONDICIONES DEL CASO</div>
    <div style="font-size: 7.5px; line-height: 1.4; font-weight: 500;">
      <div style="margin-bottom: 2px;">1. Trabajos no recogidos en 30 d&iacute;as no son responsabilidad de la empresa.</div>
      <div style="margin-bottom: 2px;">2. No se aceptan devoluciones una vez iniciado el pedido.</div>
      <div style="margin-bottom: 2px;">3. Su oculista debe controlar sus cristales peri&oacute;dicamente.</div>
      <div>4. Al inicio puede sentir incomodidad; desaparece en pocos d&iacute;as.</div>
    </div>
  </div>

  <!-- FOOTER SISTEMA -->
  <div class="sep-line"></div>
  <div class="center" style="padding: 4px 0; font-size: 8px; font-weight: 700; letter-spacing: 0.5px;">
    CENTRO &Oacute;PTICO SICUANI &ndash; SISTEMA DE GESTI&Oacute;N
  </div>

</div>
<script>
  function generarCodigosTicket() {
    try {
      if (typeof JsBarcode !== 'undefined') {
        JsBarcode("#barcode-ticket", "${docSerie.replace(/[^a-zA-Z0-9]/g, '')}", {
          format: "CODE128", width: 1.2, height: 32, displayValue: true, fontSize: 9, margin: 2, font: "Courier"
        });
      }
    } catch (e) {}
    try {
      if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById('qrFacebook'), {
          text: 'https://www.facebook.com/profile.php?id=100042368066358',
          width: 68, height: 68, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.L
        });
      }
    } catch (e) {}
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', generarCodigosTicket); }
  else { generarCodigosTicket(); }
<\/script>
</body></html>`;
  printHtml(ticketHtml);
}

// ══════════════════════════════════════════
// PRINT BUNDLE: 2x TICKET + 1x COMPACT RX (80mm thermal)
// ══════════════════════════════════════════

/**
 * Print bundle for the optician (NOT for client WhatsApp):
 * - 2 copies of the sale ticket
 * - 1 compact prescription (RX) sheet
 * All formatted for 80mm thermal printer.
 * On Capacitor Android: generates a single tall PNG image with all 3 docs.
 * On Web: generates multi-section HTML with page breaks.
 */
export function printSaleBundle(sale: Sale, patient?: Patient | null, rx?: Prescription | null) {
  if (_isCapacitor()) {
    try {
      const imgFile = _generateBundleImage(sale, patient, rx);
      _capacitorShareFile(imgFile, 'Imprimir Documentos').catch(err => {
        console.error('[printSaleBundle] Share failed:', err);
        _emitPrintEvent('error', 'Error al imprimir documentos');
      });
    } catch (err) {
      console.error('[printSaleBundle] Generation failed:', err);
      _emitPrintEvent('error', 'Error generando documentos');
    }
    return;
  }

  // Web: combine 2 tickets + 1 rx in a single printable HTML
  const est = getEstablecimiento();
  const ed = est === 'plaza_de_armas' ? {
    nombre: 'ÓPTICA "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRÍA',
    direccion: 'Jr. Garcilazo de la Vega 135 – Sicuani, Cusco',
    telefono: 'Cel. 984 047 273',
    ruc: '10239810792',
  } : {
    nombre: 'CENTRO ÓPTICO "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRÍA',
    direccion: 'Jr. Dos de Mayo 217 – Sicuani, Cusco',
    telefono: 'Cel. 984 574 974',
    ruc: '10238006312',
  };

  const d = new Date(sale.date.includes('T') ? sale.date : sale.date + 'T00:00:00');
  const fechaFormateada = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
  const nombreCompleto = (sale.patientName || patient?.name || 'CLIENTE EVENTUAL').toUpperCase();
  const docSerie = sale.documentNumber || sale.id.slice(-8).toUpperCase();
  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const vendedor = _cleanSellerName((sale.sellerName || '').toUpperCase());

  // Items HTML
  let itemsHtml = '';
  sale.items.forEach((item) => {
    const importe = (item.quantity * item.unitPrice) - (item.discount || 0);
    let desc = item.productName;
    desc = desc.replace(/\s*OD:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+\s*OI:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+/gi, '');
    desc = desc.replace(/\s*\(?\s*OD[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*OI[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*\)?/gi, '');
    desc = desc.replace(/\s*[—–-]\s*Serie\s*\S+/gi, '').replace(/\s+/g, ' ').trim();
    itemsHtml += `<div style="font-size:12px;font-weight:900;margin:2px 0;">${item.quantity}x ${desc} <span style="float:right">S/.${importe.toFixed(2)}</span></div>`;
  });

  const aCuenta = sale.abono ?? sale.total;
  const saldoPendiente = sale.saldo ?? 0;

  // Ticket section template (reused twice)
  const ticketSection = `
  <div style="width:80mm;padding:2px 6px 4px 6px;font-family:'Courier New',monospace;font-size:11px;color:#000;font-weight:700;line-height:1.4;">
    <div style="text-align:center;font-size:15px;font-weight:900;">${ed.nombre}</div>
    <div style="text-align:center;font-size:8px;font-weight:900;margin-top:2px;">${ed.subtitulo}</div>
    <div style="border-top:1px solid #000;margin:4px 0;"></div>
    <div style="text-align:center;font-size:10px;font-weight:900;">${ed.direccion}</div>
    <div style="text-align:center;font-size:10px;font-weight:900;">${ed.telefono} &middot; RUC: ${ed.ruc}</div>
    <div style="border-top:1px dashed #000;margin:5px 0;"></div>
    <div style="text-align:center;font-size:13px;font-weight:900;">TICKET DE VENTA</div>
    <div style="text-align:center;font-size:14px;font-weight:900;">N&deg; ${docSerie}</div>
    <div style="border-top:1px dashed #000;margin:5px 0;"></div>
    <div style="font-size:10px;">
      <div style="display:flex;justify-content:space-between;"><span>FECHA</span><span>${fechaFormateada}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>CLIENTE</span><span>${nombreCompleto}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>VENDEDOR</span><span>${vendedor}</span></div>
    </div>
    <div style="border-top:1px dashed #000;margin:5px 0;"></div>
    ${itemsHtml}
    <div style="border-top:1px dashed #000;margin:5px 0;"></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:900;"><span>TOTAL S/.</span><span>${sale.total.toFixed(2)}</span></div>
    <div style="font-size:10px;margin-top:3px;">
      <div style="display:flex;justify-content:space-between;"><span>A CUENTA</span><span>S/. ${aCuenta.toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:900;"><span>SALDO PENDIENTE</span><span>S/. ${saldoPendiente.toFixed(2)}</span></div>
    </div>
    <div style="border-top:1px dashed #000;margin:5px 0;"></div>
    <div style="text-align:center;font-size:10px;font-weight:900;">&mdash; GRACIAS POR SU PREFERENCIA &mdash;</div>
  </div>`;

  // Compact RX section for 80mm thermal
  const rxSection = rx ? `
  <div style="width:80mm;padding:4px 6px;font-family:'Courier New',monospace;font-size:11px;color:#000;font-weight:700;line-height:1.5;">
    <div style="border-top:2px solid #000;margin:2px 0;"></div>
    <div style="text-align:center;font-size:13px;font-weight:900;margin:4px 0;">PRESCRIPCION OPTICA</div>
    <div style="border-top:1px solid #000;margin:2px 0;"></div>
    <div style="font-size:11px;margin:3px 0;">
      <div><b>Paciente:</b> ${nombreCompleto}</div>
      <div><b>Fecha:</b> ${fechaFormateada}</div>
    </div>
    <div style="border-top:1px dashed #000;margin:4px 0;"></div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;font-weight:900;">
      <tr style="border-bottom:1px solid #000;">
        <th style="text-align:left;padding:2px;">OJO</th>
        <th style="text-align:center;padding:2px;">ESF</th>
        <th style="text-align:center;padding:2px;">CIL</th>
        <th style="text-align:center;padding:2px;">EJE</th>
        <th style="text-align:center;padding:2px;">ADD</th>
      </tr>
      <tr style="border-bottom:1px dotted #999;">
        <td style="padding:3px 2px;font-weight:900;">OD</td>
        <td style="text-align:center;padding:3px 2px;">${fv(rx.od.sph)}</td>
        <td style="text-align:center;padding:3px 2px;">${fv(rx.od.cyl)}</td>
        <td style="text-align:center;padding:3px 2px;">${rx.od.axis}&deg;</td>
        <td style="text-align:center;padding:3px 2px;">${fv(rx.od.add)}</td>
      </tr>
      <tr>
        <td style="padding:3px 2px;font-weight:900;">OI</td>
        <td style="text-align:center;padding:3px 2px;">${fv(rx.oi.sph)}</td>
        <td style="text-align:center;padding:3px 2px;">${fv(rx.oi.cyl)}</td>
        <td style="text-align:center;padding:3px 2px;">${rx.oi.axis}&deg;</td>
        <td style="text-align:center;padding:3px 2px;">${fv(rx.oi.add)}</td>
      </tr>
    </table>
    <div style="font-size:12px;font-weight:900;margin:4px 0;">DIP: ${rx.dip}</div>
    <div style="border-top:1px dashed #000;margin:4px 0;"></div>
    <div style="font-size:10px;">Optometrista: ${_cleanSellerName(rx.optometrist || sale.sellerName || '')}</div>
    <div style="border-top:2px solid #000;margin:4px 0;"></div>
  </div>` : '';

  const cutLine = `<div style="width:80mm;text-align:center;font-family:'Courier New',monospace;font-size:9px;color:#999;padding:4px 0;letter-spacing:2px;">&#9986; &#9472;&#9472;&#9472;&#9472; CORTE &#9472;&#9472;&#9472;&#9472; &#9986;</div>`;

  const bundleHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Documentos ${docSerie}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { margin:0 !important; padding:0 !important; width:80mm; }
  @media print { @page { size: 80mm auto; margin: 0 !important; } html, body { margin:0 !important; padding:0 !important; } }
</style></head><body>
${ticketSection}
${cutLine}
${ticketSection}
${cutLine}
${rxSection}
</body></html>`;

  printHtml(bundleHtml);
}

/**
 * Generate a single tall PNG combining 2x ticket + 1x compact RX for thermal printer.
 * Canvas width: 576px (80mm @ ~183 DPI). Used on Capacitor/Android.
 */
function _generateBundleImage(sale: Sale, patient?: Patient | null, rx?: Prescription | null): File {
  const W = 576;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = 4800; // oversized, will crop
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, 4800);
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'alphabetic';

  const LM = 29, RM = 547, CX = W / 2;
  let y = 20;

  const dashLine = () => { ctx.save(); ctx.setLineDash([7, 7]); ctx.lineWidth = 1.5; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke(); ctx.restore(); };
  const solidLine = () => { ctx.save(); ctx.setLineDash([]); ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke(); ctx.restore(); };
  const doubleLine = () => { ctx.save(); ctx.setLineDash([]); ctx.lineWidth = 3.5; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke(); ctx.restore(); };
  const font = (style: string, size: number, fam = 'Courier New, Courier, monospace') => { ctx.font = `${style} ${size}px ${fam}`; };
  const center = (t: string) => { ctx.textAlign = 'center'; ctx.fillText(t, CX, y); };
  const lr = (l: string, r: string) => { ctx.textAlign = 'left'; ctx.fillText(l, LM, y); ctx.textAlign = 'right'; ctx.fillText(r, RM, y); };

  const est = getEstablecimiento();
  const ed = est === 'plaza_de_armas' ? {
    nombre: 'OPTICA "SICUANI"', subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Garcilazo de la Vega 135 - Sicuani, Cusco', telefono: 'Cel. 984 047 273', ruc: '10239810792',
  } : {
    nombre: 'CENTRO OPTICO "SICUANI"', subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Dos de Mayo 217 - Sicuani, Cusco', telefono: 'Cel. 984 574 974', ruc: '10238006312',
  };

  const d = new Date(sale.date.includes('T') ? sale.date : sale.date + 'T00:00:00');
  const fecha = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
  const clienteName = (sale.patientName || patient?.name || 'CLIENTE EVENTUAL').toUpperCase();
  const docSerie = sale.documentNumber || sale.id.slice(-8).toUpperCase();
  const aCuenta = sale.abono ?? sale.total;
  const saldo = sale.saldo ?? 0;
  const vendedor = _cleanSellerName((sale.sellerName || '').toUpperCase());
  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);

  // Helper: draw one ticket
  const drawTicket = () => {
    font('bold', 30); center(ed.nombre); y += 29;
    font('bold', 16); center(ed.subtitulo); y += 16;
    solidLine(); y += 22;
    font('bold', 17); center(ed.direccion); y += 20;
    center(`${ed.telefono}  |  RUC: ${ed.ruc}`); y += 14;
    dashLine(); y += 29;

    font('bold', 28); center('TICKET DE VENTA'); y += 32;
    font('bold', 28); center(`N\u00B0  ${docSerie}`); y += 14;
    dashLine(); y += 25;

    font('bold', 18);
    lr('FECHA', fecha); y += 22;
    lr('CLIENTE', clienteName); y += 22;
    lr('VENDEDOR', vendedor); y += 14;
    dashLine(); y += 22;

    // Items
    font('bold', 18);
    ctx.textAlign = 'left'; ctx.fillText('CANT.', LM, y);
    ctx.fillText('DESCRIPCION', LM + 101, y);
    ctx.textAlign = 'right'; ctx.fillText('IMPORTE', RM, y); y += 7;
    solidLine(); y += 22;

    let subtotalBruto = 0, totalDescuento = 0;
    sale.items.forEach(item => {
      const importe = (item.quantity * item.unitPrice) - (item.discount || 0);
      subtotalBruto += item.quantity * item.unitPrice;
      totalDescuento += item.discount || 0;
      let desc = item.productName;
      desc = desc.replace(/\s*OD:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+\s*OI:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+/gi, '');
      desc = desc.replace(/\s*\(?\s*OD[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*OI[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*\)?/gi, '');
      desc = desc.replace(/\s*[—–-]\s*Serie\s*\S+/gi, '').replace(/\s+/g, ' ').trim();
      font('bold', 18);
      const maxDescW = RM - LM - 170;
      while (desc.length > 3 && ctx.measureText(desc).width > maxDescW) desc = desc.substring(0, desc.length - 3) + '..';
      ctx.textAlign = 'left'; ctx.fillText(`${item.quantity}x`, LM, y);
      ctx.fillText(desc, LM + 58, y);
      ctx.textAlign = 'right'; ctx.fillText(`S/.${importe.toFixed(2)}`, RM, y);
      y += 25;
    });
    dashLine(); y += 22;

    font('bold', 18);
    lr('SUBTOTAL', `S/. ${subtotalBruto.toFixed(2)}`); y += 22;
    lr('DESCUENTO', `S/. ${totalDescuento.toFixed(2)}`); y += 14;
    doubleLine(); y += 29;

    font('bold', 28); lr('TOTAL S/.', sale.total.toFixed(2)); y += 14;
    solidLine(); y += 22;

    font('bold', 18); lr('A CUENTA', `S/. ${aCuenta.toFixed(2)}`); y += 22;
    font('bold', 20); lr('SALDO PENDIENTE', `S/. ${saldo.toFixed(2)}`); y += 14;
    dashLine(); y += 29;

    font('bold', 18); center('\u2014 GRACIAS POR SU PREFERENCIA \u2014'); y += 22;
  };

  // Helper: draw cut line
  const drawCutLine = () => {
    y += 10;
    ctx.save(); ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.strokeStyle = '#999';
    ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke(); ctx.restore();
    font('normal', 14, 'Arial, Helvetica, sans-serif');
    ctx.fillStyle = '#999'; ctx.textAlign = 'center';
    ctx.fillText('\u2702 CORTE \u2702', CX, y + 18);
    ctx.fillStyle = '#000';
    y += 36;
  };

  // Helper: draw compact prescription
  const drawCompactRx = () => {
    if (!rx) return;
    solidLine(); y += 25;
    font('bold', 26); center('PRESCRIPCION OPTICA'); y += 28;
    solidLine(); y += 22;
    font('bold', 18);
    ctx.textAlign = 'left'; ctx.fillText(`Paciente: ${clienteName}`, LM, y); y += 22;
    ctx.fillText(`Fecha: ${fecha}`, LM, y); y += 14;
    dashLine(); y += 22;

    // Table header
    font('bold', 18);
    const cols = [LM, LM + 60, LM + 160, LM + 270, LM + 370, LM + 440];
    ctx.textAlign = 'left';
    ctx.fillText('OJO', cols[0], y);
    ctx.fillText('ESF', cols[1], y);
    ctx.fillText('CIL', cols[2], y);
    ctx.fillText('EJE', cols[3], y);
    ctx.fillText('ADD', cols[4], y);
    y += 7; solidLine(); y += 22;

    // OD row
    font('bold', 20);
    ctx.fillText('OD', cols[0], y);
    ctx.fillText(fv(rx.od.sph), cols[1], y);
    ctx.fillText(fv(rx.od.cyl), cols[2], y);
    ctx.fillText(`${rx.od.axis}\u00B0`, cols[3], y);
    ctx.fillText(fv(rx.od.add), cols[4], y);
    y += 25;

    // OI row
    ctx.fillText('OI', cols[0], y);
    ctx.fillText(fv(rx.oi.sph), cols[1], y);
    ctx.fillText(fv(rx.oi.cyl), cols[2], y);
    ctx.fillText(`${rx.oi.axis}\u00B0`, cols[3], y);
    ctx.fillText(fv(rx.oi.add), cols[4], y);
    y += 14;
    dashLine(); y += 22;

    // DIP
    font('bold', 22);
    ctx.fillText(`DIP: ${rx.dip}`, LM, y); y += 22;
    dashLine(); y += 22;

    // Optometrist
    font('bold', 16);
    ctx.fillText(`Optometrista: ${_cleanSellerName(rx.optometrist || sale.sellerName || '')}`, LM, y);
    y += 14;
    solidLine(); y += 20;
  };

  // Draw: Ticket 1
  drawTicket();
  drawCutLine();
  // Draw: Ticket 2
  drawTicket();
  drawCutLine();
  // Draw: Compact RX
  drawCompactRx();

  // Crop to actual content
  const finalH = y;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = W; outCanvas.height = finalH;
  outCanvas.getContext('2d')!.drawImage(canvas, 0, 0, W, finalH, 0, 0, W, finalH);

  const dataUrl = outCanvas.toDataURL('image/png');
  const raw = atob(dataUrl.split(',')[1]);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  const blob = new Blob([buf], { type: 'image/png' });
  const fileName = `Bundle_${docSerie}_${fecha.replace(/\//g, '-')}.png`;
  return new File([blob], fileName, { type: 'image/png' });
}

// ══════════════════════════════════════════
// PRINT NOTA DE VENTA (A4 half-sheet — morada)
// ══════════════════════════════════════════

export function printSaleNote(sale: Sale, patient?: Patient | null, rx?: Prescription | null) {
  // Capacitor Android: use PDF + native print dialog (A4 note, NOT ticket)
  if (_isCapacitor()) {
    const file = generateNotePdf(sale, patient, rx);
    _capacitorPrintPdf(file, 'Nota de Venta').catch(err => {
      console.error('[printSaleNote] Print failed:', err);
      _emitPrintEvent('error', 'Error al imprimir nota de venta');
    });
    return;
  }

  const c = getPrintColor();
  const loc = getEstablecimiento().replace(/_/g, ' ').toUpperCase();
  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);

  const itemsHTML = sale.items.map(it =>
    `<tr>
      <td style="text-align:center;border:1px solid #999;padding:2mm;">${it.quantity}</td>
      <td style="border:1px solid #999;padding:2mm;">${it.productName}</td>
      <td style="text-align:right;border:1px solid #999;padding:2mm;">S/ ${it.unitPrice.toFixed(2)}</td>
      <td style="text-align:right;border:1px solid #999;padding:2mm;">S/ ${it.subtotal.toFixed(2)}</td>
    </tr>`
  ).join('');

  const rxSection = rx ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2mm;margin:3mm 0;">
      <div style="border:2px solid ${c};padding:2mm;">
        <div style="background:${c};color:white;text-align:center;font-size:9px;font-weight:900;padding:1mm;">LEJOS</div>
        <div style="font-size:9px;padding:1mm;">
          <div><b>OD:</b> ${fv(rx.od.sph)} / ${fv(rx.od.cyl)} x ${rx.od.axis}&deg; Add:${fv(rx.od.add)}</div>
          <div><b>OI:</b> ${fv(rx.oi.sph)} / ${fv(rx.oi.cyl)} x ${rx.oi.axis}&deg; Add:${fv(rx.oi.add)}</div>
          <div><b>DIP:</b> ${rx.dip}</div>
        </div>
      </div>
      <div style="border:2px solid ${c};padding:2mm;">
        <div style="background:${c};color:white;text-align:center;font-size:9px;font-weight:900;padding:1mm;">TIPO</div>
        <div style="font-size:9px;padding:1mm;">
          <div>${rx.lensType || '---'}</div>
          <div>${rx.optometrist ? 'Esp: ' + rx.optometrist : ''}</div>
        </div>
      </div>
    </div>
  ` : '';

  const statusLabel = sale.status === 'completed' ? 'PAGADO' : sale.status === 'pending' ? 'PENDIENTE' : 'CANCELADO';

  const noteHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Nota - ${sale.id}</title>
<style>
  @page { size: A4; margin: 10mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; color:#000; background:white; }
  .nota { width:170mm; margin:0 auto; border:3px solid ${c}; padding:5mm; position:relative; }
  .nota-header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid ${c}; padding-bottom:3mm; margin-bottom:3mm; }
  .nota-header h1 { font-size:16px; font-weight:900; color:${c}; letter-spacing:1px; }
  .nota-header p { font-size:9px; color:#666; }
  .doc-box { border:3px solid ${c}; padding:3mm; text-align:center; min-width:40mm; }
  .doc-box .type { font-size:10px; font-weight:900; color:${c}; }
  .doc-box .num { font-size:14px; font-weight:900; color:${c}; margin-top:1mm; }
  .info-row { display:flex; justify-content:space-between; font-size:11px; margin:1mm 0; }
  table { width:100%; border-collapse:collapse; margin:3mm 0; }
  th { background:${c}; color:white; padding:2mm; font-size:9px; font-weight:900; text-align:center; }
  .totals { text-align:right; font-size:12px; margin-top:2mm; }
  .totals .grand { font-size:16px; font-weight:900; color:${c}; }
  .conditions { border:1px solid #ccc; padding:2mm; margin-top:3mm; font-size:7px; color:#666; }
</style></head><body>
<div class="nota">
  <div class="nota-header">
    <div>
      <h1>CENTRO OPTICO SICUANI</h1>
      <p>${loc}</p>
      <p>Salud Visual Profesional</p>
    </div>
    <div class="doc-box">
      <div class="type">NOTA DE VENTA</div>
      <div class="num">${sale.documentNumber || sale.id.slice(-8)}</div>
    </div>
  </div>

  <div class="info-row">
    <span><b style="color:${c};">Fecha:</b> ${new Date(sale.date).toLocaleDateString('es-PE')}</span>
    <span><b style="color:${c};">Estado:</b> ${statusLabel}</span>
  </div>
  <div class="info-row">
    <span><b style="color:${c};">Cliente:</b> ${sale.patientName || patient?.name || 'CLIENTE EVENTUAL'}</span>
    ${patient?.dni ? `<span><b style="color:${c};">DNI:</b> ${patient.dni}</span>` : ''}
  </div>
  <div class="info-row">
    <span><b style="color:${c};">Vendedor:</b> ${_cleanSellerName(sale.sellerName || '')}</span>
  </div>

  ${rxSection}

  <table>
    <thead><tr><th>CANT</th><th>DESCRIPCION</th><th>P.UNIT</th><th>IMPORTE</th></tr></thead>
    <tbody>${itemsHTML}</tbody>
  </table>

  <div class="totals">
    ${sale.discount > 0 ? `<div>Subtotal: S/ ${sale.subtotal.toFixed(2)}</div>
    <div>Descuento: -S/ ${sale.discount.toFixed(2)}</div>` : ''}
    <div class="grand">TOTAL: S/ ${sale.total.toFixed(2)}</div>
  </div>

  <div class="conditions">
    <b>CONDICIONES:</b><br/>
    1. El estuche protege su montura, uselo siempre. &bull;
    2. No dejar sus lentes en lugares calientes. &bull;
    3. Limpie sus lentes solo con el pano adecuado. &bull;
    4. Reclamos dentro de las 24 horas.
  </div>
</div>
</body></html>`;
  printHtml(noteHtml);
}

// ══════════════════════════════════════════
// WHATSAPP TICKET SHARING (PDF + Web Share API)
// ══════════════════════════════════════════

function _getStoreInfo(est: string) {
  return est === 'plaza_de_armas' ? {
    nombre: 'OPTICA SICUANI',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Garcilazo de la Vega 135 - Sicuani, Cusco',
    telefono: '984 047 273',
    ruc: '10239810792',
  } : {
    nombre: 'CENTRO OPTICO SICUANI',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Dos de Mayo 217 - Sicuani, Cusco',
    telefono: '984 574 974',
    ruc: '10238006312',
  };
}

function _formatSaleDate(dateStr: string): string {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
}

function _getPatientPhone(patient?: Patient | null): string {
  let phone = patient?.phone || '';
  phone = phone.replace(/\D/g, '');
  if (phone.length === 9) phone = '51' + phone;
  return phone;
}

/** Generate a PDF ticket using jsPDF and share via WhatsApp.
 *  Falls back to text-only WhatsApp message if PDF generation fails. */
export async function sendTicketWhatsApp(sale: Sale, patient?: Patient | null) {
  const est = getEstablecimiento();
  const store = _getStoreInfo(est);
  const fecha = _formatSaleDate(sale.date);
  const clienteName = (sale.patientName || patient?.name || 'CLIENTE').toUpperCase();
  const docSerie = sale.documentNumber || sale.id.slice(-8).toUpperCase();
  const aCuenta = sale.abono ?? sale.total;
  const saldo = sale.saldo ?? 0;
  const phone = _getPatientPhone(patient);

  const tipoDoc = (sale.documentType || 'boleta').toUpperCase();
  let titulo = 'BOLETA DE VENTA';
  if (tipoDoc === 'FACTURA') titulo = 'FACTURA';
  else if (tipoDoc === 'NOTA' || tipoDoc === 'TICKET') titulo = 'TICKET DE VENTA';

  // Build text summary (used in WhatsApp message and as fallback)
  const itemsText = sale.items.map(it => {
    const imp = (it.quantity * it.unitPrice) - (it.discount || 0);
    return `  ${it.quantity}x ${it.productName.substring(0, 30)} - S/${imp.toFixed(2)}`;
  }).join('\n');
  const textMsg = `*${store.nombre}*\n${store.direccion}\nTel: ${store.telefono}\n${'─'.repeat(24)}\n*${titulo}*\nN° ${docSerie}\nFecha: ${fecha}\n${'─'.repeat(24)}\nCliente: ${clienteName}${patient?.dni ? `\nDNI: ${patient.dni}` : ''}\nPago: ${sale.paymentMethod === 'cash' ? 'CONTADO' : (sale.paymentMethod || '').toUpperCase()}\nVendedor: ${(sale.sellerName || '').toUpperCase()}\n${'─'.repeat(24)}\n${itemsText}\n${'─'.repeat(24)}\n*TOTAL: S/${sale.total.toFixed(2)}*\nA cuenta: S/${aCuenta.toFixed(2)}${saldo > 0 ? `\n*Saldo: S/${saldo.toFixed(2)}*` : ''}\n${'─'.repeat(24)}\n_Gracias por su preferencia_`;

  // Try generating PDF with jsPDF (reuse generateTicketPdf)
  let pdfFile: File | null = null;
  try {
    pdfFile = generateTicketPdf(sale, patient);
  } catch (pdfErr) {
    console.warn('[WhatsApp] PDF generation failed, using text-only:', pdfErr);
  }

  // 1) Try native Web Share API with PDF (Android Chrome / Capacitor)
  if (pdfFile && navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
    try {
      await navigator.share({
        title: `${titulo} - ${store.nombre}`,
        text: `${titulo} N° ${docSerie} - ${clienteName} - Total: S/${sale.total.toFixed(2)}`,
        files: [pdfFile],
      });
      return;
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      // Share failed — fall through
    }
  }

  // 2) Fallback: open WhatsApp with text message (+ download PDF if available)
  if (pdfFile && _isCapacitor()) {
    // On Capacitor, use native share with the PDF file
    try {
      await _capacitorShareFile(pdfFile, 'Enviar por WhatsApp');
      return;
    } catch { /* fall through to wa.me */ }
  } else if (pdfFile) {
    const url = URL.createObjectURL(pdfFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFile.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  const encoded = encodeURIComponent(textMsg);
  const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  setTimeout(() => window.open(waUrl, '_blank'), pdfFile ? 500 : 0);
}

// ══════════════════════════════════════════
// PDF RX GENERATION + WHATSAPP RX SHARING
// ══════════════════════════════════════════

/** Generate a PDF prescription using jsPDF. Returns a File ready for sharing. */
export function generateRxPdf(patient: Patient, rx: Prescription, optometrist?: string): File {
  const est = getEstablecimiento();
  const store = _getStoreInfo(est);
  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const fecha = new Date(rx.date || Date.now()).toLocaleDateString('es-PE');
  const specialist = optometrist || rx.optometrist || '';

  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
  const w = 148;
  const lm = 10;
  const rm = w - 10;
  let y = 12;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(store.nombre, w / 2, y, { align: 'center' }); y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Salud Visual Profesional', w / 2, y, { align: 'center' }); y += 3;
  doc.text(store.direccion, w / 2, y, { align: 'center' }); y += 3;
  doc.text(`Tel: ${store.telefono}  |  RUC: ${store.ruc}`, w / 2, y, { align: 'center' }); y += 3;

  // Separator
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.8);
  doc.line(lm, y, rm, y); y += 6;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PRESCRIPCION OPTICA', w / 2, y, { align: 'center' }); y += 7;

  // Patient data
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Paciente:', lm, y);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.name, lm + 22, y);
  doc.setFont('helvetica', 'bold');
  doc.text('DNI:', rm - 30, y);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.dni, rm - 20, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', lm, y);
  doc.setFont('helvetica', 'normal');
  doc.text(fecha, lm + 22, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Tel:', rm - 30, y);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.phone || '---', rm - 20, y);
  y += 7;

  // RX Table Header — VISION LEJANA
  doc.setFillColor(124, 58, 237);
  doc.rect(lm, y, rm - lm, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VISION LEJANA', w / 2, y + 4, { align: 'center' });
  y += 8;

  doc.setTextColor(0, 0, 0);

  // Table headers
  const cols = [lm, lm + 15, lm + 38, lm + 61, lm + 84, lm + 107];
  const colLabels = ['OJO', 'ESF', 'CIL', 'EJE', 'ADD', 'DIP'];
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  colLabels.forEach((label, i) => {
    doc.text(label, cols[i] + (i === 0 ? 4 : 10), y, { align: 'center' });
  });
  y += 2;
  doc.setLineWidth(0.3);
  doc.line(lm, y, rm, y); y += 5;

  // OD row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text('OD', cols[0] + 4, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(fv(rx.od.sph), cols[1] + 10, y, { align: 'center' });
  doc.text(fv(rx.od.cyl), cols[2] + 10, y, { align: 'center' });
  doc.text(`${rx.od.axis}\u00B0`, cols[3] + 10, y, { align: 'center' });
  doc.text(fv(rx.od.add), cols[4] + 10, y, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(String(rx.dip), cols[5] + 10, y + 3, { align: 'center' });
  y += 7;

  // OI row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text('OI', cols[0] + 4, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(fv(rx.oi.sph), cols[1] + 10, y, { align: 'center' });
  doc.text(fv(rx.oi.cyl), cols[2] + 10, y, { align: 'center' });
  doc.text(`${rx.oi.axis}\u00B0`, cols[3] + 10, y, { align: 'center' });
  doc.text(fv(rx.oi.add), cols[4] + 10, y, { align: 'center' });
  y += 3;

  doc.setLineWidth(0.3);
  doc.line(lm, y, rm, y); y += 5;

  // Near vision section if ADD > 0
  if (rx.od.add > 0 || rx.oi.add > 0) {
    doc.setFillColor(124, 58, 237);
    doc.rect(lm, y, rm - lm, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('VISION CERCANA (ADD)', w / 2, y + 4, { align: 'center' });
    y += 8;
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('OD:', lm, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${fv(rx.od.sph + rx.od.add)} / ${fv(rx.od.cyl)} x ${rx.od.axis}\u00B0`, lm + 10, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('OI:', lm, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${fv(rx.oi.sph + rx.oi.add)} / ${fv(rx.oi.cyl)} x ${rx.oi.axis}\u00B0`, lm + 10, y);
    y += 5;
    doc.line(lm, y, rm, y); y += 5;
  }

  // Lens type
  if (rx.lensType) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo de lente:', lm, y);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.lensType, lm + 30, y);
    y += 6;
  }

  // Observations box
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.rect(lm, y, rm - lm, 18);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text('OBSERVACIONES', lm + 2, y + 4);
  doc.setTextColor(0, 0, 0);
  y += 22;

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Proximo control: ___________________', lm, y);
  y += 8;

  // Signature line
  doc.setLineWidth(0.5);
  doc.setDrawColor(124, 58, 237);
  doc.line(rm - 50, y, rm, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Especialista', rm - 25, y + 4, { align: 'center' });
  if (specialist) {
    doc.setFont('helvetica', 'normal');
    doc.text(specialist, rm - 25, y + 8, { align: 'center' });
  }

  const pdfData = doc.output('arraybuffer');
  const fileName = `RX_${patient.name.replace(/\s+/g, '_')}_${fecha.replace(/\//g, '-')}.pdf`;
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  return new File([blob], fileName, { type: 'application/pdf' });
}

/** Send prescription via WhatsApp with PDF attachment.
 *  Uses Web Share API on Android, falls back to text + PDF download. */
export async function sendRxWhatsApp(patient: Patient, rx: Prescription, optometrist?: string) {
  const est = getEstablecimiento();
  const store = _getStoreInfo(est);
  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const fecha = new Date(rx.date || Date.now()).toLocaleDateString('es-PE');
  const specialist = optometrist || rx.optometrist || '';
  const phone = _getPatientPhone(patient);

  // Build text summary
  const textMsg = `*${store.nombre}*\n${store.direccion}\nTel: ${store.telefono}\n${'─'.repeat(24)}\n*PRESCRIPCION OPTICA*\nFecha: ${fecha}\n${'─'.repeat(24)}\nPaciente: ${patient.name}\nDNI: ${patient.dni}\n${'─'.repeat(24)}\n*OD:* ESF ${fv(rx.od.sph)} | CIL ${fv(rx.od.cyl)} | EJE ${rx.od.axis}\u00B0 | ADD ${fv(rx.od.add)}\n*OI:* ESF ${fv(rx.oi.sph)} | CIL ${fv(rx.oi.cyl)} | EJE ${rx.oi.axis}\u00B0 | ADD ${fv(rx.oi.add)}\n*DIP:* ${rx.dip}\n${rx.lensType ? `Tipo: ${rx.lensType}\n` : ''}${specialist ? `Especialista: ${specialist}\n` : ''}${'─'.repeat(24)}\n_${store.nombre} - Salud Visual Profesional_`;

  // Generate PDF
  let pdfFile: File | null = null;
  try {
    pdfFile = generateRxPdf(patient, rx, optometrist);
  } catch (err) {
    console.warn('[WhatsApp RX] PDF generation failed:', err);
  }

  // 1) Try native Web Share API with PDF
  if (pdfFile && navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
    try {
      await navigator.share({
        title: `Prescripcion - ${patient.name}`,
        text: `Prescripcion Optica - ${patient.name} - ${fecha}`,
        files: [pdfFile],
      });
      return;
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
    }
  }

  // 2) Fallback: download PDF + open WhatsApp with text
  if (pdfFile) {
    const url = URL.createObjectURL(pdfFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFile.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  const encoded = encodeURIComponent(textMsg);
  const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  setTimeout(() => window.open(waUrl, '_blank'), pdfFile ? 500 : 0);
}

// ══════════════════════════════════════════
// PDF DOWNLOAD FUNCTIONS
// ══════════════════════════════════════════

/** Helper to trigger a file download — uses native share on Capacitor */
function _downloadFile(file: File) {
  if (_isCapacitor()) {
    _capacitorShareFile(file, 'Descargar PDF').catch(err =>
      console.error('[_downloadFile] Capacitor share failed:', err));
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── PDF Barcode + QR helpers ──

/** Draw a Code128 barcode on a jsPDF document using an off-screen canvas */
function _drawBarcodePdf(doc: jsPDF, text: string, x: number, y: number, w: number, h: number) {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128', width: 2, height: 50, displayValue: true,
      fontSize: 14, margin: 2, font: 'monospace', background: '#ffffff',
    });
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, h);
  } catch (e) {
    // Fallback: just print the text
    doc.setFontSize(9);
    doc.text(text, x + w / 2, y + h / 2, { align: 'center' });
  }
}

/** Draw a QR code on a jsPDF document using qrcode-generator */
function _drawQrPdf(doc: jsPDF, text: string, x: number, y: number, size: number) {
  try {
    const qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();
    const mc = qr.getModuleCount();
    const cs = size / mc;
    doc.setFillColor(0, 0, 0);
    for (let r = 0; r < mc; r++) {
      for (let c = 0; c < mc; c++) {
        if (qr.isDark(r, c)) {
          doc.rect(x + c * cs, y + r * cs, cs, cs, 'F');
        }
      }
    }
  } catch (e) {
    doc.setFontSize(5);
    doc.text('QR', x + size / 2, y + size / 2, { align: 'center' });
  }
}

/** Generate an A4 Nota de Venta PDF using jsPDF. Returns a File ready for sharing/printing. */
export function generateNotePdf(sale: Sale, patient?: Patient | null, rx?: Prescription | null): File {
  const est = getEstablecimiento();
  const store = _getStoreInfo(est);
  const c = getPrintColor();
  const fv = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const fecha = _formatSaleDate(sale.date);
  const clienteName = (sale.patientName || patient?.name || 'CLIENTE EVENTUAL').toUpperCase();
  const docNumber = sale.documentNumber || sale.id.slice(-8).toUpperCase();
  const statusLabel = sale.status === 'completed' ? 'PAGADO' : sale.status === 'pending' ? 'PENDIENTE' : 'CANCELADO';

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const w = 210;
  const lm = 20;
  const rm = w - 20;
  let y = 20;

  // Parse hex color for jsPDF
  const cr = parseInt(c.slice(1, 3), 16);
  const cg = parseInt(c.slice(3, 5), 16);
  const cb = parseInt(c.slice(5, 7), 16);

  // ── HEADER ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(cr, cg, cb);
  doc.text(store.nombre, lm, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(est.replace(/_/g, ' ').toUpperCase(), lm, y);
  y += 4;
  doc.text('Salud Visual Profesional', lm, y);

  // Document box (right side)
  doc.setDrawColor(cr, cg, cb);
  doc.setLineWidth(1);
  doc.rect(rm - 50, y - 14, 50, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(cr, cg, cb);
  doc.text('NOTA DE VENTA', rm - 25, y - 7, { align: 'center' });
  doc.setFontSize(14);
  doc.text(docNumber, rm - 25, y, { align: 'center' });

  y += 5;
  doc.setLineWidth(0.8);
  doc.setDrawColor(cr, cg, cb);
  doc.line(lm, y, rm, y);
  y += 8;

  // ── SALE DATA ──
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cr, cg, cb);
  doc.text('Fecha:', lm, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(fecha, lm + 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cr, cg, cb);
  doc.text('Estado:', rm - 50, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(statusLabel, rm - 34, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cr, cg, cb);
  doc.text('Cliente:', lm, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(clienteName, lm + 18, y);
  if (patient?.dni) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cr, cg, cb);
    doc.text('DNI:', rm - 50, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(patient.dni, rm - 38, y);
  }
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cr, cg, cb);
  doc.text('Vendedor:', lm, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(_cleanSellerName(sale.sellerName || ''), lm + 24, y);
  y += 8;

  // ── RX SECTION (optional) ──
  if (rx) {
    // LEJOS box
    doc.setFillColor(cr, cg, cb);
    doc.rect(lm, y, 75, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('LEJOS', lm + 37.5, y + 4, { align: 'center' });
    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`OD: ${fv(rx.od.sph)} / ${fv(rx.od.cyl)} x ${rx.od.axis}\u00B0  Add: ${fv(rx.od.add)}`, lm + 2, y);
    y += 4;
    doc.text(`OI: ${fv(rx.oi.sph)} / ${fv(rx.oi.cyl)} x ${rx.oi.axis}\u00B0  Add: ${fv(rx.oi.add)}`, lm + 2, y);
    y += 4;
    doc.text(`DIP: ${rx.dip}`, lm + 2, y);
    y += 3;

    // TIPO box (right column)
    if (rx.lensType || rx.optometrist) {
      doc.setFillColor(cr, cg, cb);
      doc.rect(lm + 80, y - 19, 75, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TIPO', lm + 117.5, y - 15, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (rx.lensType) doc.text(rx.lensType, lm + 82, y - 11);
      if (rx.optometrist) doc.text(`Esp: ${rx.optometrist}`, lm + 82, y - 7);
    }
    y += 5;
  }

  // ── ITEMS TABLE ──
  doc.setFillColor(cr, cg, cb);
  doc.rect(lm, y, rm - lm, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CANT', lm + 8, y + 5, { align: 'center' });
  doc.text('DESCRIPCION', lm + 60, y + 5, { align: 'center' });
  doc.text('P.UNIT', rm - 35, y + 5, { align: 'center' });
  doc.text('IMPORTE', rm - 10, y + 5, { align: 'center' });
  y += 10;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  sale.items.forEach(item => {
    doc.text(String(item.quantity), lm + 8, y, { align: 'center' });
    let desc = item.productName;
    if (desc.length > 45) desc = desc.substring(0, 43) + '..';
    doc.text(desc, lm + 18, y);
    doc.text(`S/ ${item.unitPrice.toFixed(2)}`, rm - 35, y, { align: 'center' });
    doc.text(`S/ ${item.subtotal.toFixed(2)}`, rm - 10, y, { align: 'center' });
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(lm, y + 2, rm, y + 2);
    y += 6;
  });
  y += 4;

  // ── TOTALS ──
  doc.setFontSize(10);
  if (sale.discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: S/ ${sale.subtotal.toFixed(2)}`, rm - 10, y, { align: 'right' });
    y += 5;
    doc.text(`Descuento: -S/ ${sale.discount.toFixed(2)}`, rm - 10, y, { align: 'right' });
    y += 5;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(cr, cg, cb);
  doc.text(`TOTAL: S/ ${sale.total.toFixed(2)}`, rm - 10, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 10;

  // ── CONDITIONS ──
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(lm, y, rm - lm, 20);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDICIONES:', lm + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const conditions = [
    '1. El estuche protege su montura, uselo siempre.',
    '2. No dejar sus lentes en lugares calientes.',
    '3. Limpie sus lentes solo con el pano adecuado.',
    '4. Reclamos dentro de las 24 horas.',
  ];
  conditions.forEach((cond, i) => {
    doc.text(cond, lm + 2, y + 8 + i * 3);
  });
  y += 24;

  // ── FOOTER ──
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(`${store.nombre} | ${store.direccion} | Tel: ${store.telefono} | RUC: ${store.ruc}`, w / 2, y, { align: 'center' });

  const pdfData = doc.output('arraybuffer');
  const fileName = `Nota_${docNumber}_${fecha.replace(/\//g, '-')}.pdf`;
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  return new File([blob], fileName, { type: 'application/pdf' });
}

/** Generate a ticket PDF — identical layout to printSaleTicket HTML version.
 *  Includes: header, sale data, items, totals, conditions, barcode, QR, footer. */
export function generateTicketPdf(sale: Sale, patient?: Patient | null): File {
  const est = getEstablecimiento();
  const ed = est === 'plaza_de_armas' ? {
    nombre: 'OPTICA "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Garcilazo de la Vega 135 - Sicuani, Cusco',
    telefono: 'Cel. 984 047 273',
    ruc: '10239810792',
  } : {
    nombre: 'CENTRO OPTICO "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Dos de Mayo 217 - Sicuani, Cusco',
    telefono: 'Cel. 984 574 974',
    ruc: '10238006312',
  };

  const d = new Date(sale.date.includes('T') ? sale.date : sale.date + 'T00:00:00');
  const fecha = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
  const clienteName = (sale.patientName || patient?.name || 'CLIENTE EVENTUAL').toUpperCase();
  const docSerie = sale.documentNumber || sale.id.slice(-8).toUpperCase();
  const aCuenta = sale.abono ?? sale.total;
  const saldo = sale.saldo ?? 0;

  const tipoDoc = (sale.documentType || 'boleta').toUpperCase();
  let titulo = 'BOLETA DE VENTA';
  if (tipoDoc === 'FACTURA') titulo = 'FACTURA';
  else if (tipoDoc === 'NOTA' || tipoDoc === 'TICKET') titulo = 'TICKET DE VENTA';

  const pagoLabel = sale.paymentMethod === 'cash' ? 'CONTADO' : sale.paymentMethod === 'card' ? 'TARJETA' : sale.paymentMethod === 'yape' ? 'YAPE' : sale.paymentMethod === 'plin' ? 'PLIN' : 'TRANSFERENCIA';

  // Dynamic height: base + items + conditions + barcode/QR
  const itemCount = sale.items.length;
  const pageH = 170 + (itemCount * 4) + (patient?.dni ? 3 : 0);
  const doc = new jsPDF({ unit: 'mm', format: [80, pageH] });
  const w = 80;
  let y = 6;
  const lm = 4;
  const rm = w - 4;

  const dashLine = () => { doc.setLineDashPattern([1, 1], 0); doc.setLineWidth(0.2); doc.line(lm, y, rm, y); };
  const solidLine = () => { doc.setLineDashPattern([], 0); doc.setLineWidth(0.3); doc.line(lm, y, rm, y); };
  const doubleLine = () => { doc.setLineDashPattern([], 0); doc.setLineWidth(0.5); doc.line(lm, y, rm, y); };

  // ── HEADER ──
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text(ed.nombre, w / 2, y, { align: 'center' }); y += 4;
  doc.setFontSize(6.5);
  doc.text(ed.subtitulo, w / 2, y, { align: 'center' }); y += 2;
  solidLine(); y += 3;
  doc.setFontSize(7);
  doc.text(ed.direccion, w / 2, y, { align: 'center' }); y += 2.5;
  doc.text(`${ed.telefono}  |  RUC: ${ed.ruc}`, w / 2, y, { align: 'center' }); y += 2;
  dashLine(); y += 4;

  // ── TIPO DOCUMENTO ──
  doc.setFontSize(11);
  doc.text(titulo, w / 2, y, { align: 'center' }); y += 4.5;
  doc.setFontSize(11);
  doc.text(`N\u00B0  ${docSerie}`, w / 2, y, { align: 'center' }); y += 2;
  dashLine(); y += 3.5;

  // ── DATOS DE LA VENTA ──
  doc.setFontSize(7);
  doc.text('FECHA', lm, y); doc.text(fecha, rm, y, { align: 'right' }); y += 3;
  doc.text('CLIENTE', lm, y); doc.text(clienteName, rm, y, { align: 'right' }); y += 3;
  if (patient?.dni) { doc.text('DNI', lm, y); doc.text(patient.dni, rm, y, { align: 'right' }); y += 3; }
  doc.text('PAGO', lm, y); doc.text(pagoLabel, rm, y, { align: 'right' }); y += 3;
  doc.text('VENDEDOR', lm, y); doc.text(_cleanSellerName((sale.sellerName || '').toUpperCase()), rm, y, { align: 'right' }); y += 2;
  dashLine(); y += 3;

  // ── ITEMS HEADER ──
  doc.setFontSize(7);
  doc.text('CANT.', lm, y); doc.text('DESCRIPCION', lm + 14, y); doc.text('IMPORTE', rm, y, { align: 'right' }); y += 1;
  solidLine(); y += 3;

  // ── ITEMS ──
  let subtotalBruto = 0;
  let totalDescuento = 0;
  sale.items.forEach(item => {
    const importe = (item.quantity * item.unitPrice) - (item.discount || 0);
    subtotalBruto += item.quantity * item.unitPrice;
    totalDescuento += item.discount || 0;
    let desc = item.productName;
    desc = desc.replace(/\s*OD:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+\s*OI:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+/gi, '');
    desc = desc.replace(/\s*\(?\s*OD[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*OI[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*\)?/gi, '');
    desc = desc.replace(/\s*[—–-]\s*Serie\s*\S+/gi, '').replace(/\s+/g, ' ').trim();
    if (desc.length > 30) desc = desc.substring(0, 28) + '..';
    doc.setFontSize(7);
    doc.text(`${item.quantity}x`, lm, y);
    doc.text(desc, lm + 8, y);
    doc.text(`S/.${importe.toFixed(2)}`, rm, y, { align: 'right' });
    y += 3.5;
  });
  dashLine(); y += 3;

  // ── SUBTOTAL / DESCUENTO ──
  doc.setFontSize(7);
  doc.text('SUBTOTAL', lm, y); doc.text(`S/. ${subtotalBruto.toFixed(2)}`, rm, y, { align: 'right' }); y += 3;
  doc.text('DESCUENTO', lm, y); doc.text(`S/. ${totalDescuento.toFixed(2)}`, rm, y, { align: 'right' }); y += 2;
  doubleLine(); y += 4;

  // ── TOTAL ──
  doc.setFontSize(11); doc.setFont('courier', 'bold');
  doc.text('TOTAL S/.', lm, y); doc.text(sale.total.toFixed(2), rm, y, { align: 'right' }); y += 2;
  solidLine(); y += 3;

  // ── A CUENTA / SALDO ──
  doc.setFontSize(7);
  doc.text('A CUENTA', lm, y); doc.text(`S/. ${aCuenta.toFixed(2)}`, rm, y, { align: 'right' }); y += 3;
  doc.setFontSize(8);
  doc.text('SALDO PENDIENTE', lm, y); doc.text(`S/. ${saldo.toFixed(2)}`, rm, y, { align: 'right' }); y += 2;
  dashLine(); y += 4;

  // ── AGRADECIMIENTO ──
  doc.setFontSize(7);
  doc.text('\u2014 GRACIAS POR SU PREFERENCIA \u2014', w / 2, y, { align: 'center' }); y += 3;
  dashLine(); y += 3;

  // ── DESPACHO / ENTREGA + BARCODE + QR ──
  // Layout: left side = DESPACHO box + barcode, right side = QR + label
  const barcodeText = docSerie.replace(/[^a-zA-Z0-9]/g, '');

  // Left: DESPACHO box
  doc.setFont('courier', 'bold');
  doc.setFontSize(6);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([], 0);
  const boxW = 28; const boxH = 4.5;
  const boxX = lm + 1;
  doc.rect(boxX, y - 1, boxW, boxH);
  doc.text('DESPACHO / ENTREGA', boxX + boxW / 2, y + 1.8, { align: 'center' });

  // Right: QR code + label
  const qrSize = 15;
  const qrX = rm - qrSize - 1;
  const qrY = y - 1;
  _drawQrPdf(doc, 'https://www.facebook.com/profile.php?id=100042368066358', qrX, qrY, qrSize);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.text('PAGINA WEB', qrX + qrSize / 2, qrY - 1, { align: 'center' });

  y += boxH + 2;

  // Barcode below DESPACHO box (centered in left area)
  const barcodeW = 38;
  const barcodeH = 10;
  const barcodeX = lm + 1;
  _drawBarcodePdf(doc, barcodeText, barcodeX, y, barcodeW, barcodeH);

  y += barcodeH + 4;
  dashLine(); y += 3;

  // ── CONDICIONES DEL CASO ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('CONDICIONES DEL CASO', w / 2, y, { align: 'center' }); y += 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  const condiciones = [
    '1. Trabajos no recogidos en 30 dias no son responsabilidad de la empresa.',
    '2. No se aceptan devoluciones una vez iniciado el pedido.',
    '3. Su oculista debe controlar sus cristales periodicamente.',
    '4. Al inicio puede sentir incomodidad; desaparece en pocos dias.',
  ];
  condiciones.forEach(c => {
    doc.text(c, lm + 1, y, { maxWidth: rm - lm - 2 }); y += 3;
  });
  y += 1;

  // ── FOOTER ──
  solidLine(); y += 3;
  doc.setFont('courier', 'bold');
  doc.setFontSize(5.5);
  doc.text('CENTRO OPTICO SICUANI - SISTEMA DE GESTION', w / 2, y, { align: 'center' });

  const pdfData = doc.output('arraybuffer');
  const fileName = `Ticket_${docSerie}_${fecha.replace(/\//g, '-')}.pdf`;
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  return new File([blob], fileName, { type: 'application/pdf' });
}

/** Generate a ticket as a PNG image for thermal printer apps (e.g. Thermer).
 *  Draws on an offscreen Canvas at 576px width (≈80mm at 183 DPI). */
export function generateTicketImage(sale: Sale, patient?: Patient | null): File {
  const est = getEstablecimiento();
  const ed = est === 'plaza_de_armas' ? {
    nombre: 'OPTICA "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Garcilazo de la Vega 135 - Sicuani, Cusco',
    telefono: 'Cel. 984 047 273',
    ruc: '10239810792',
  } : {
    nombre: 'CENTRO OPTICO "SICUANI"',
    subtitulo: 'SERVICIO PROFESIONAL EN OPTOMETRIA',
    direccion: 'Jr. Dos de Mayo 217 - Sicuani, Cusco',
    telefono: 'Cel. 984 574 974',
    ruc: '10238006312',
  };

  const d = new Date(sale.date.includes('T') ? sale.date : sale.date + 'T00:00:00');
  const fecha = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
  const clienteName = (sale.patientName || patient?.name || 'CLIENTE EVENTUAL').toUpperCase();
  const docSerie = sale.documentNumber || sale.id.slice(-8).toUpperCase();
  const aCuenta = sale.abono ?? sale.total;
  const saldo = sale.saldo ?? 0;
  const tipoDoc = (sale.documentType || 'boleta').toUpperCase();
  let titulo = 'BOLETA DE VENTA';
  if (tipoDoc === 'FACTURA') titulo = 'FACTURA';
  else if (tipoDoc === 'NOTA' || tipoDoc === 'TICKET') titulo = 'TICKET DE VENTA';
  const pagoLabel = sale.paymentMethod === 'cash' ? 'CONTADO' : sale.paymentMethod === 'card' ? 'TARJETA' : sale.paymentMethod === 'yape' ? 'YAPE' : sale.paymentMethod === 'plin' ? 'PLIN' : 'TRANSFERENCIA';

  // Canvas: 576px wide ≈ 80mm thermal. Scale: 7.2 px/mm
  const W = 576;
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = W;
  tmpCanvas.height = 2400; // oversized, will crop
  const ctx = tmpCanvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, 2400);
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'alphabetic';

  const LM = 29, RM = 547, CX = W / 2;
  let y = 43;

  // ─── Drawing helpers ───
  const dashLine = () => {
    ctx.save(); ctx.setLineDash([7, 7]); ctx.lineWidth = 1.5; ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke(); ctx.restore();
  };
  const solidLine = () => {
    ctx.save(); ctx.setLineDash([]); ctx.lineWidth = 2; ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke(); ctx.restore();
  };
  const doubleLine = () => {
    ctx.save(); ctx.setLineDash([]); ctx.lineWidth = 3.5; ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke(); ctx.restore();
  };
  const font = (style: string, size: number, fam = 'Courier New, Courier, monospace') => {
    ctx.font = `${style} ${size}px ${fam}`;
  };
  const center = (t: string) => { ctx.textAlign = 'center'; ctx.fillText(t, CX, y); };
  const lr = (l: string, r: string) => {
    ctx.textAlign = 'left'; ctx.fillText(l, LM, y);
    ctx.textAlign = 'right'; ctx.fillText(r, RM, y);
  };

  // ── HEADER ──
  font('bold', 30); center(ed.nombre); y += 29;
  font('bold', 16); center(ed.subtitulo); y += 16;
  solidLine(); y += 22;
  font('bold', 17); center(ed.direccion); y += 20;
  center(`${ed.telefono}  |  RUC: ${ed.ruc}`); y += 14;
  dashLine(); y += 29;

  // ── TIPO DOCUMENTO ──
  font('bold', 28); center(titulo); y += 32;
  font('bold', 28); center(`N\u00B0  ${docSerie}`); y += 14;
  dashLine(); y += 25;

  // ── DATOS DE LA VENTA ──
  font('bold', 18);
  lr('FECHA', fecha); y += 22;
  lr('CLIENTE', clienteName); y += 22;
  if (patient?.dni) { lr('DNI', patient.dni); y += 22; }
  lr('PAGO', pagoLabel); y += 22;
  lr('VENDEDOR', _cleanSellerName((sale.sellerName || '').toUpperCase())); y += 14;
  dashLine(); y += 22;

  // ── ITEMS HEADER ──
  font('bold', 18);
  ctx.textAlign = 'left'; ctx.fillText('CANT.', LM, y);
  ctx.fillText('DESCRIPCION', LM + 101, y);
  ctx.textAlign = 'right'; ctx.fillText('IMPORTE', RM, y); y += 7;
  solidLine(); y += 22;

  // ── ITEMS ──
  let subtotalBruto = 0, totalDescuento = 0;
  sale.items.forEach(item => {
    const importe = (item.quantity * item.unitPrice) - (item.discount || 0);
    subtotalBruto += item.quantity * item.unitPrice;
    totalDescuento += item.discount || 0;
    let desc = item.productName;
    desc = desc.replace(/\s*OD:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+\s*OI:\s*[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+/gi, '');
    desc = desc.replace(/\s*\(?\s*OD[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*OI[:\s]*[-+]?\d*\.?\d*\s*\/?\s*[-+]?\d*\.?\d*\s*\)?/gi, '');
    desc = desc.replace(/\s*[—–-]\s*Serie\s*\S+/gi, '').replace(/\s+/g, ' ').trim();
    font('bold', 18);
    const maxDescW = RM - LM - 170;
    while (desc.length > 3 && ctx.measureText(desc).width > maxDescW) {
      desc = desc.substring(0, desc.length - 3) + '..';
    }
    ctx.textAlign = 'left'; ctx.fillText(`${item.quantity}x`, LM, y);
    ctx.fillText(desc, LM + 58, y);
    ctx.textAlign = 'right'; ctx.fillText(`S/.${importe.toFixed(2)}`, RM, y);
    y += 25;
  });
  dashLine(); y += 22;

  // ── SUBTOTAL / DESCUENTO ──
  font('bold', 18);
  lr('SUBTOTAL', `S/. ${subtotalBruto.toFixed(2)}`); y += 22;
  lr('DESCUENTO', `S/. ${totalDescuento.toFixed(2)}`); y += 14;
  doubleLine(); y += 29;

  // ── TOTAL ──
  font('bold', 28); lr('TOTAL S/.', sale.total.toFixed(2)); y += 14;
  solidLine(); y += 22;

  // ── A CUENTA / SALDO ──
  font('bold', 18); lr('A CUENTA', `S/. ${aCuenta.toFixed(2)}`); y += 22;
  font('bold', 20); lr('SALDO PENDIENTE', `S/. ${saldo.toFixed(2)}`); y += 14;
  dashLine(); y += 29;

  // ── AGRADECIMIENTO ──
  font('bold', 18); center('\u2014 GRACIAS POR SU PREFERENCIA \u2014'); y += 22;
  dashLine(); y += 22;

  // ── DESPACHO BOX + QR ──
  font('bold', 15);
  const boxW = 202, boxH = 32, boxX = LM + 7;
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.setLineDash([]);
  ctx.strokeRect(boxX, y - 7, boxW, boxH);
  ctx.textAlign = 'center'; ctx.fillText('DESPACHO / ENTREGA', boxX + boxW / 2, y + 13);

  // QR
  const qrSz = 108, qrX = RM - qrSz - 7, qrY = y - 7;
  try {
    const qr = qrcode(0, 'L');
    qr.addData('https://www.facebook.com/profile.php?id=100042368066358');
    qr.make();
    const mc = qr.getModuleCount(), cs = qrSz / mc;
    ctx.fillStyle = '#000';
    for (let r = 0; r < mc; r++) for (let c = 0; c < mc; c++)
      if (qr.isDark(r, c)) ctx.fillRect(qrX + c * cs, qrY + r * cs, cs + 0.5, cs + 0.5);
  } catch (_e) { /* skip QR on error */ }

  font('bold', 13, 'Arial, Helvetica, sans-serif');
  ctx.textAlign = 'center'; ctx.fillStyle = '#000';
  ctx.fillText('PAGINA WEB', qrX + qrSz / 2, qrY - 7);
  y += boxH + 14;

  // Barcode
  const barcodeText = docSerie.replace(/[^a-zA-Z0-9]/g, '');
  const bcW = 274, bcH = 72, bcX = LM + 7;
  try {
    const bcCanvas = document.createElement('canvas');
    JsBarcode(bcCanvas, barcodeText, {
      format: 'CODE128', width: 2, height: 50, displayValue: true,
      fontSize: 14, margin: 2, font: 'monospace', background: '#ffffff',
    });
    ctx.drawImage(bcCanvas, bcX, y, bcW, bcH);
  } catch (_e) {
    font('normal', 18); ctx.textAlign = 'center';
    ctx.fillText(barcodeText, bcX + bcW / 2, y + bcH / 2);
  }
  y += bcH + 29;
  dashLine(); y += 22;

  // ── CONDICIONES ──
  font('bold', 17, 'Arial, Helvetica, sans-serif'); center('CONDICIONES DEL CASO'); y += 22;
  font('normal', 14, 'Arial, Helvetica, sans-serif');
  const conds = [
    '1. Trabajos no recogidos en 30 dias no son responsabilidad de la empresa.',
    '2. No se aceptan devoluciones una vez iniciado el pedido.',
    '3. Su oculista debe controlar sus cristales periodicamente.',
    '4. Al inicio puede sentir incomodidad; desaparece en pocos dias.',
  ];
  const maxTxtW = RM - LM - 14;
  conds.forEach(c => {
    const words = c.split(' ');
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxTxtW && line) {
        ctx.textAlign = 'left'; ctx.fillText(line, LM + 7, y); y += 18; line = w;
      } else { line = test; }
    }
    if (line) { ctx.textAlign = 'left'; ctx.fillText(line, LM + 7, y); y += 22; }
  });
  y += 7;

  // ── FOOTER ──
  solidLine(); y += 22;
  font('bold', 14); center('CENTRO OPTICO SICUANI - SISTEMA DE GESTION');
  y += 20;

  // Crop to actual content
  const finalH = y;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = W; outCanvas.height = finalH;
  outCanvas.getContext('2d')!.drawImage(tmpCanvas, 0, 0, W, finalH, 0, 0, W, finalH);

  // Export PNG
  const dataUrl = outCanvas.toDataURL('image/png');
  const raw = atob(dataUrl.split(',')[1]);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  const blob = new Blob([buf], { type: 'image/png' });
  const fileName = `Ticket_${docSerie}_${fecha.replace(/\//g, '-')}.png`;
  return new File([blob], fileName, { type: 'image/png' });
}

/** Download a sale ticket — PNG on Capacitor (for thermal printer apps), PDF on web */
export function downloadTicketPdf(sale: Sale, patient?: Patient | null) {
  try {
    if (_isCapacitor()) {
      const imgFile = generateTicketImage(sale, patient);
      _capacitorShareFile(imgFile, 'Ticket de Venta').catch(err =>
        console.error('[Download Ticket Image] Capacitor share failed:', err));
      return;
    }
    const file = generateTicketPdf(sale, patient);
    _downloadFile(file);
  } catch (err) {
    console.error('[Download Ticket] Error:', err);
  }
}

/** Download an RX prescription as PDF */
export function downloadRxPdf(patient: Patient, rx: Prescription, optometrist?: string) {
  try {
    const file = generateRxPdf(patient, rx, optometrist);
    _downloadFile(file);
  } catch (err) {
    console.error('[Download RX PDF] Error:', err);
  }
}

/** Download a sale note as A4 PDF */
export function downloadNotePdf(sale: Sale, patient?: Patient | null, rx?: Prescription | null) {
  try {
    const file = generateNotePdf(sale, patient, rx);
    _downloadFile(file);
  } catch (err) {
    console.error('[Download Note PDF] Error:', err);
    _emitPrintEvent('error', 'Error al generar PDF de nota');
  }
}

/** Download ticket + RX bundle as PDFs.
 *  On Capacitor: shares a combined PNG (ticket+RX image).
 *  On Web: downloads ticket PDF, then RX PDF (if patient+rx available). */
export async function downloadSaleBundlePdf(sale: Sale, patient?: Patient | null, rx?: Prescription | null) {
  try {
    if (_isCapacitor()) {
      // On mobile, share the combined bundle image
      const imgFile = _generateBundleImage(sale, patient, rx);
      await _capacitorShareFile(imgFile, 'Ticket + Medidas');
      return;
    }
    // Web: download ticket PDF
    const ticketFile = generateTicketPdf(sale, patient);
    _downloadFile(ticketFile);
    // Then download RX PDF if available
    if (patient && rx) {
      await new Promise(r => setTimeout(r, 600));
      const rxFile = generateRxPdf(patient, rx);
      _downloadFile(rxFile);
    }
  } catch (err) {
    console.error('[Download Sale Bundle PDF] Error:', err);
  }
}

// ══════════════════════════════════════════
// LENS PRICING ENGINE (matches desktop PRECIOS_POR_SERIE + PRECIOS_LUNAS)
// ══════════════════════════════════════════

export interface LensMaterial {
  code: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  description: string;
}

export interface LensPriceResult {
  material: LensMaterial;
  serie: number;
  priceUnit: number;
  pricePair: number;
  inStock: boolean;
  isLab: boolean;
  deliveryTime: string;
}

const LENS_MATERIALS: LensMaterial[] = [
  { code: 'blue', name: 'Resina Blue Defender', shortName: 'Blue', color: '#3b82f6', icon: '💎', description: 'Proteccion blue light avanzada' },
  { code: 'poly', name: 'Poly Blue HD', shortName: 'Poly', color: '#c9a455', icon: '🔷', description: 'Alta resistencia policarbonato premium HD' },
  { code: 'dipping', name: 'Dipping Premium', shortName: 'Dipping', color: '#06b6d4', icon: '✨', description: 'Tratamiento de inmersion ultra fino' },
];

const PRECIOS_POR_SERIE: Record<string, Record<number, { uni: number; par: number }>> = {
  blue:    { 1: { uni: 50, par: 100 },  2: { uni: 80, par: 160 },  3: { uni: 110, par: 220 } },
  poly:    { 1: { uni: 85, par: 170 },  2: { uni: 135, par: 270 }, 3: { uni: 150, par: 300 } },
  dipping: { 1: { uni: 80, par: 160 },  2: { uni: 130, par: 260 }, 3: { uni: 145, par: 290 } },
};

// Classic pricing table (PRECIOS_LUNAS from desktop)
export const PRECIOS_LUNAS = {
  ESFERICO: {
    RANGO_1: { min: 0.25, max: 2.00, precios: { PHOTOMATIC: 70, POLY_AR: 50, POLY_BLUE: 85, LUX_BLUE: 50, DIPPIN: 80 }},
    RANGO_2: { min: 2.25, max: 3.00, precios: { PHOTOMATIC: 70, POLY_AR: 50, POLY_BLUE: 85, LUX_BLUE: 50, DIPPIN: 80 }},
    RANGO_3: { min: 3.25, max: 4.00, precios: { PHOTOMATIC: 80, POLY_AR: 55, POLY_BLUE: 90, LUX_BLUE: 60, DIPPIN: 90 }},
    RANGO_4: { min: 4.25, max: 5.00, precios: { PHOTOMATIC: 120, POLY_AR: 120, POLY_BLUE: 150, LUX_BLUE: 110, DIPPIN: 145 }},
    RANGO_5: { min: 5.25, max: 6.00, precios: { PHOTOMATIC: 125, POLY_AR: 125, POLY_BLUE: 140, LUX_BLUE: 110, DIPPIN: 145 }},
  },
  COMBINADO: {
    RANGO_1: { min: 0.25, max: 2.00, precios: { PHOTOMATIC: 75, POLY_AR: 50, POLY_BLUE: 85, LUX_BLUE: 50, DIPPIN: 80 }},
    RANGO_2: { min: 2.25, max: 3.00, precios: { PHOTOMATIC: 105, POLY_AR: 95, POLY_BLUE: 130, LUX_BLUE: 80, DIPPIN: 130 }},
    RANGO_3: { min: 3.25, max: 6.00, precios: { PHOTOMATIC: 125, POLY_AR: 125, POLY_BLUE: 140, LUX_BLUE: 110, DIPPIN: 145 }},
  },
  CRISTAL_ESF: {
    RANGO_1: { min: 0.25, max: 2.00, precios: { CRISTAL_BLANCO: 20, CRISTAL_AR: 26, CRISTAL_GRAY: 50, CRISTAL_FOTO_AR: 45 }},
    RANGO_2: { min: 2.25, max: 4.00, precios: { CRISTAL_BLANCO: 25, CRISTAL_AR: 30, CRISTAL_GRAY: 55, CRISTAL_FOTO_AR: 50 }},
    RANGO_3: { min: 4.25, max: 6.00, precios: { CRISTAL_BLANCO: 40, CRISTAL_AR: 45, CRISTAL_GRAY: 70, CRISTAL_FOTO_AR: 65 }},
  },
  BIFOCAL: { FLAT_TOP: 65, ADD_3: 135 },
  PROGRESIVO: {
    ADAPTA_VIEW: { RX_BLUE: 360, PHOTOMATIC: 400, DIPPIN: 360, POLY_BLUE: 450 },
    EASY_VIEW: { RX_BLUE: 400, PHOTOMATIC: 420, DIPPIN: 450, POLY_BLUE: 390 },
    ULTRA_VIEW: { RX_BLUE: 580, PHOTOMATIC: 585, DIPPIN: 660, POLY_BLUE: 620 },
  },
  ALTO_INDICE: { BLUE_AR_174: 460, QUARZ_174: 430 },
};

/** Determine lens serie (1, 2, 3) based on prescription — matches desktop obtenerSeriePorRxV5 */
export function getLensSerie(esfera: number, cilindro: number): number | null {
  const esfAbs = Math.abs(esfera);
  const cilAbs = Math.abs(cilindro);
  if (esfAbs > 6.00 || cilAbs > 6.00) return null; // Lab order
  // Plano (0.00/0.00) = Serie 1
  if (esfAbs === 0 && cilAbs === 0) return 1;
  let serie = 1;
  if (cilAbs > 4.00 && cilAbs <= 6.00) serie = 3;
  else if (cilAbs > 2.00 && cilAbs <= 4.00) serie = 2;
  if (esfAbs > 4.00 && serie < 3) serie = 3;
  else if (esfAbs > 2.00 && serie < 2) serie = 2;
  return serie;
}

/** Calculate lens prices for all materials given a prescription */
export function calculateLensPrices(odEsf: number, odCil: number, oiEsf: number, oiCil: number): LensPriceResult[] {
  // Use the eye with higher absolute values (desktop logic)
  const esfera = Math.abs(odEsf) >= Math.abs(oiEsf) ? odEsf : oiEsf;
  const cilindro = Math.abs(odCil) >= Math.abs(oiCil) ? odCil : oiCil;
  const serie = getLensSerie(esfera, cilindro);

  return LENS_MATERIALS.map(mat => {
    if (!serie) {
      return { material: mat, serie: 0, priceUnit: 0, pricePair: 0, inStock: false, isLab: true, deliveryTime: '5-7 dias' };
    }
    const prices = PRECIOS_POR_SERIE[mat.code]?.[serie];
    if (!prices) return null;
    return { material: mat, serie, priceUnit: prices.uni, pricePair: prices.par, inStock: true, isLab: false, deliveryTime: 'Inmediata' };
  }).filter(Boolean) as LensPriceResult[];
}

export function getLensMaterials(): LensMaterial[] {
  return LENS_MATERIALS;
}

// ══════════════════════════════════════════
// LENS MATRIX ENGINE (inventario_lunas_matrix — desktop compatible)
// Desktop structure: matrix[material][categoria][serie][sph][cyl] = {stock, minimo, precio}
// ══════════════════════════════════════════

export const MATRIX_MATERIALS: { key: LensMaterialKey; label: string; color: string }[] = [
  { key: 'RX_BLUE', label: 'Rx Blue', color: '#3b82f6' },
  { key: 'POLY_BLUE', label: 'Poly Blue', color: '#c9a455' },
  { key: 'DIPPIN', label: 'Dipping', color: '#06b6d4' },
];

export const MATRIX_CATEGORIES: { key: LensCategory; label: string; icon: string }[] = [
  { key: 'ESFERICO_NEGATIVO', label: 'Esf. Negativo', icon: '−' },
  { key: 'ESFERICO_POSITIVO', label: 'Esf. Positivo', icon: '+' },
  { key: 'CILINDRO_PURO', label: 'Cilindro Puro', icon: '◎' },
  { key: 'COMBINADO', label: 'Combinado', icon: '⊕' },
  { key: 'PROGRESIVO', label: 'Progresivo', icon: '▽' },
  { key: 'BIFOCAL', label: 'Bifocal', icon: '◐' },
];

/** SPH values for negative (−0.25 to −6.00) */
export const SPH_NEGATIVE = Array.from({ length: 24 }, (_, i) => -((i + 1) * 0.25));
/** SPH values for positive (+0.25 to +6.00) */
export const SPH_POSITIVE = Array.from({ length: 24 }, (_, i) => (i + 1) * 0.25);
/** CYL values (+0.25 to +4.00) */
export const CYL_VALUES = Array.from({ length: 16 }, (_, i) => (i + 1) * 0.25);

/** Determine serie from SPH value — matches desktop logic */
function _getSerieFromSph(sph: number): string {
  const abs = Math.abs(sph);
  if (abs <= 2.00) return 'SERIE_1';
  if (abs <= 4.00) return 'SERIE_2';
  return 'SERIE_3';
}

/** Get the SPH range for a category */
export function getMatrixSphValues(category: LensCategory): number[] {
  switch (category) {
    case 'ESFERICO_NEGATIVO': return SPH_NEGATIVE;
    case 'ESFERICO_POSITIVO': return SPH_POSITIVE;
    case 'CILINDRO_PURO': return [0]; // CYL only, single SPH row
    case 'COMBINADO': return [...SPH_NEGATIVE, ...SPH_POSITIVE];
    case 'PROGRESIVO': return SPH_NEGATIVE;
    case 'BIFOCAL': return SPH_NEGATIVE;
    default: return SPH_NEGATIVE;
  }
}

/** Format SPH/CYL for display */
export function formatLensValue(val: number): string {
  if (val === 0) return '0.00';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}`;
}

/** Fetch the full lens matrix from Supabase (inventario_lunas_matrix) */
export async function fetchLensMatrix(): Promise<LensMatrix> {
  if (!isSupabaseConfigured) return {};
  const raw = await loadData<LensMatrix>('inventario_lunas_matrix');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw;
}

/** Get stock for a specific cell */
export function getMatrixStock(
  matrix: LensMatrix, material: string, category: string, sph: number, cyl: number
): LensMatrixCell {
  const serie = _getSerieFromSph(sph);
  const sphKey = sph.toFixed(2);
  const cylKey = cyl.toFixed(2);
  return matrix?.[material]?.[category]?.[serie]?.[sphKey]?.[cylKey]
    ?? { stock: 0, minimo: 0, precio: 0 };
}

/** Update a single cell's stock in the matrix and save to Supabase */
export async function updateMatrixStock(
  matrix: LensMatrix,
  material: string,
  category: string,
  sph: number,
  cyl: number,
  newStock: number,
): Promise<LensMatrix> {
  const serie = _getSerieFromSph(sph);
  const sphKey = sph.toFixed(2);
  const cylKey = cyl.toFixed(2);

  // Deep-ensure path exists
  if (!matrix[material]) matrix[material] = {};
  if (!matrix[material][category]) matrix[material][category] = {};
  if (!matrix[material][category][serie]) matrix[material][category][serie] = {};
  if (!matrix[material][category][serie][sphKey]) matrix[material][category][serie][sphKey] = {};

  const existing = matrix[material][category][serie][sphKey][cylKey]
    ?? { stock: 0, minimo: 0, precio: 0 };

  matrix[material][category][serie][sphKey][cylKey] = {
    ...existing,
    stock: Math.max(0, newStock),
  };

  // Save to Supabase
  if (isSupabaseConfigured) {
    await saveData('inventario_lunas_matrix', matrix);
  }

  return { ...matrix };
}

/** Get summary stats for a material */
export function getMatrixMaterialStats(matrix: LensMatrix, material: string): {
  totalStock: number; lowStock: number; outOfStock: number; totalCells: number;
} {
  let totalStock = 0, lowStock = 0, outOfStock = 0, totalCells = 0;
  const matData = matrix?.[material];
  if (!matData) return { totalStock, lowStock, outOfStock, totalCells };

  for (const cat of Object.values(matData)) {
    for (const serie of Object.values(cat)) {
      for (const sphRow of Object.values(serie as Record<string, Record<string, LensMatrixCell>>)) {
        for (const cell of Object.values(sphRow)) {
          totalCells++;
          totalStock += cell.stock || 0;
          if ((cell.stock || 0) === 0) outOfStock++;
          else if ((cell.stock || 0) <= (cell.minimo || 2)) lowStock++;
        }
      }
    }
  }
  return { totalStock, lowStock, outOfStock, totalCells };
}

// ══════════════════════════════════════════
// RE-EXPORT STORE CONFIG FOR COMPONENTS
// ══════════════════════════════════════════

export { getStoreConfig } from './supabase';

// ══════════════════════════════════════════
// SEED (no-op — desktop data already exists)
// ══════════════════════════════════════════

export async function seedDatabase() {
  if (!isSupabaseConfigured) return demo.seedDatabase();
}
