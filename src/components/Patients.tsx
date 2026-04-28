import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, ChevronRight, Star, Phone, Loader2, X, ArrowLeft, Save, Users } from 'lucide-react';
import { fetchPatients, createPatient, searchPatients, onDataChange } from '../lib/services';
import type { Patient } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const PAGE_SIZE = 80;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
type Mode = 'list' | 'create';

interface CreateForm {
  name: string;
  dni: string;
  phone: string;
  address: string;
  birthDate: string;
  isVIP: boolean;
}

const emptyForm: CreateForm = {
  name: '',
  dni: '',
  phone: '',
  address: '',
  birthDate: '',
  isVIP: false,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export default function Patients() {
  const [mode, setMode] = useState<Mode>('list');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Create form state
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; dni?: string }>({});
  const [toast, setToast] = useState<string | null>(null);

  // ── Load patients ──────────────────────────

  // Silent refresh — no spinner, used by realtime subscriptions
  const refreshPatients = useCallback(async () => {
    try {
      const data = await fetchPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  }, []);

  // Initial load — shows spinner
  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshPatients();
      setLoading(false);
    })();
  }, [refreshPatients]);

  // ── Realtime: auto-refresh when clientes change ──
  useEffect(() => {
    const unsub = onDataChange('clientes', refreshPatients);
    return unsub;
  }, [refreshPatients]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ── Filtered patients ──────────────────────
  const filtered = useMemo(() => {
    let result = searchPatients(searchTerm, patients);
    if (activeLetter) {
      result = result.filter(p => p.name.toUpperCase().startsWith(activeLetter));
    }
    return result;
  }, [searchTerm, patients, activeLetter]);
  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  // Available letters from the full patient list
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    patients.forEach(p => {
      const first = p.name.trim().charAt(0).toUpperCase();
      if (first && /[A-Z]/.test(first)) letters.add(first);
    });
    return letters;
  }, [patients]);

  // Reset pagination when search/letter changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm, activeLetter]);

  // ── Validation ─────────────────────────────
  function validate(): boolean {
    const next: { name?: string; dni?: string } = {};
    if (!form.name.trim()) next.name = 'El nombre es obligatorio';
    if (!form.dni.trim()) next.dni = 'El DNI es obligatorio';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit handler ─────────────────────────
  async function handleSave() {
    if (!validate()) return;
    try {
      setSaving(true);
      await createPatient({
        name: form.name.trim(),
        dni: form.dni.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        birthDate: form.birthDate || undefined,
        isVIP: form.isVIP,
      });
      setToast('Paciente registrado correctamente');
      setForm(emptyForm);
      setErrors({});
      setMode('list');
      await refreshPatients();
    } catch (err) {
      console.error('Error creating patient:', err);
      setToast('Error al registrar paciente');
    } finally {
      setSaving(false);
    }
  }

  // ── Auto-dismiss toast ─────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ══════════════════════════════════════════
  //  CREATE MODE
  // ══════════════════════════════════════════
  if (mode === 'create') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="space-y-6 pb-12"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setMode('list'); setErrors({}); }}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">
            Nuevo Paciente
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 space-y-5 border border-divider">
          {/* Nombre completo */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant">
              Nombre completo <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e2 => ({ ...e2, name: undefined })); }}
              placeholder="Ej: Maria Huaman Flores"
              className={cn(
                'w-full bg-surface-container rounded-xl py-3.5 px-4 font-body text-on-surface placeholder-on-surface-variant/50 transition-all outline-none',
                'focus:ring-2 focus:ring-primary/20',
                errors.name && 'ring-2 ring-error/40'
              )}
            />
            {errors.name && <p className="text-xs text-error font-medium">{errors.name}</p>}
          </div>

          {/* DNI */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant">
              DNI <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.dni}
              onChange={(e) => { setForm(f => ({ ...f, dni: e.target.value })); setErrors(e2 => ({ ...e2, dni: undefined })); }}
              placeholder="Ej: 48291004"
              maxLength={15}
              className={cn(
                'w-full bg-surface-container rounded-xl py-3.5 px-4 font-body text-on-surface placeholder-on-surface-variant/50 transition-all outline-none',
                'focus:ring-2 focus:ring-primary/20',
                errors.dni && 'ring-2 ring-error/40'
              )}
            />
            {errors.dni && <p className="text-xs text-error font-medium">{errors.dni}</p>}
          </div>

          {/* Telefono */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant">Telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Ej: 984123456"
              className="w-full bg-surface-container rounded-xl py-3.5 px-4 font-body text-on-surface placeholder-on-surface-variant/50 transition-all outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Direccion */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant">Direccion</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Ej: Av. Cusco 234, Sicuani"
              className="w-full bg-surface-container rounded-xl py-3.5 px-4 font-body text-on-surface placeholder-on-surface-variant/50 transition-all outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant">Fecha de nacimiento</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm(f => ({ ...f, birthDate: e.target.value }))}
              className="w-full bg-surface-container rounded-xl py-3.5 px-4 font-body text-on-surface placeholder-on-surface-variant/50 transition-all outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Es VIP Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Star size={18} className="text-amber-500" />
              <span className="text-sm font-semibold text-on-surface">Es VIP</span>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isVIP: !f.isVIP }))}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors duration-200',
                form.isVIP ? 'bg-primary' : 'bg-surface-container-high'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200',
                  form.isVIP && 'translate-x-5'
                )}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all press-scale',
            'bg-accent text-on-accent shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
            saving && 'opacity-70 cursor-not-allowed'
          )}
        >
          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={20} />
              Guardar Paciente
            </>
          )}
        </button>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-28 left-4 right-4 z-50"
            >
              <div className="bg-primary text-on-primary rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl">
                <span className="text-sm font-medium">{toast}</span>
                <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ══════════════════════════════════════════
  //  LIST MODE
  // ══════════════════════════════════════════
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">
          Pacientes
        </h1>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={() => setMode('create')}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-2xl font-bold text-sm btn-premium shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        >
          <UserPlus size={18} />
          Nuevo Paciente
        </motion.button>
      </motion.section>

      {/* Search Bar */}
      <section>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-outline" size={20} />
          </div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container border-none rounded-2xl py-4 pl-12 pr-10 focus:ring-2 focus:ring-primary/20 transition-all font-body text-on-surface placeholder-on-surface-variant outline-none"
            placeholder="Buscar por nombre, DNI o telefono..."
            type="text"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-on-surface"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Alphabet Quick Filter */}
      {!loading && patients.length > 50 && (
        <section>
          <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1 px-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveLetter(null)}
              className={cn(
                'shrink-0 w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all',
                !activeLetter
                  ? 'bg-on-surface text-white shadow-md'
                  : 'bg-surface-container text-on-surface-variant'
              )}
            >
              <Users size={12} />
            </motion.button>
            {ALPHABET.map(letter => {
              const has = availableLetters.has(letter);
              const isActive = activeLetter === letter;
              return (
                <motion.button
                  key={letter}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => has && setActiveLetter(isActive ? null : letter)}
                  disabled={!has}
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all',
                    isActive
                      ? 'bg-accent text-white shadow-md'
                      : has
                        ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        : 'bg-transparent text-muted/30 cursor-default'
                  )}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* Patients Count */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-on-surface-variant">
            {filtered.length.toLocaleString()} {filtered.length === 1 ? 'paciente' : 'pacientes'}
            {activeLetter ? ` con "${activeLetter}"` : ''}
          </p>
          {activeLetter && (
            <button
              onClick={() => setActiveLetter(null)}
              className="text-xs font-bold text-accent flex items-center gap-1"
            >
              <X size={12} /> Quitar filtro
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-accent" />
          <span className="text-sm text-on-surface-variant font-medium">Cargando pacientes...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
            <Search size={32} className="text-on-surface-variant/40" />
          </div>
          <div className="text-center">
            <p className="font-headline font-bold text-on-surface">
              {searchTerm ? 'Sin resultados' : 'No hay pacientes'}
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              {searchTerm
                ? `No se encontraron pacientes para "${searchTerm}"`
                : 'Registra tu primer paciente para comenzar'}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={() => setMode('create')}
              className="mt-2 flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-2xl font-bold text-sm shadow-[0_4px_16px_rgba(0,0,0,0.12)] press-scale transition-all"
            >
              <UserPlus size={18} />
              Registrar Paciente
            </button>
          )}
        </motion.div>
      )}

      {/* Patient Cards — paginated, with slide animations */}
      {!loading && filtered.length > 0 && (
        <section className="space-y-2">
          {visible.map((patient, idx) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, x: 25, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.03, 0.4), type: 'spring', stiffness: 300, damping: 30 }}
              whileHover={{ scale: 1.015, y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
              whileTap={{ scale: 0.98, y: 0 }}
            >
              <Link
                to={`/patients/${patient.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 transition-all border border-divider card-interactive"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-headline font-bold text-base shrink-0">
                  {getInitials(patient.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-headline font-bold text-on-surface truncate">{patient.name}</p>
                    {patient.isVIP && (
                      <span className="shrink-0 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Star size={10} fill="currentColor" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-on-surface-variant font-medium">DNI: {patient.dni}</span>
                    {patient.phone && (
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                        <Phone size={11} /> {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-outline shrink-0" />
              </Link>
            </motion.div>
          ))}

          {/* Load More */}
          {hasMore && (
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="w-full py-3 rounded-2xl bg-surface-container text-accent font-bold text-sm hover:bg-surface-container-high transition-colors press-scale"
            >
              Mostrar mas ({filtered.length - visibleCount} restantes)
            </button>
          )}
        </section>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-28 left-4 right-4 z-50"
          >
            <div className="bg-primary text-on-primary rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl">
              <span className="text-sm font-medium">{toast}</span>
              <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
