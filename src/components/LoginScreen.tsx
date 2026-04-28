import { Eye, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STORES, type StoreConfig } from '../lib/supabase';

// Doctor profiles per store (matches desktop)
const DOCTOR_PROFILES: Record<string, { uid: string; name: string; role: 'admin' | 'optometrist'; email: string }[]> = {
  dos_de_mayo: [
    { uid: 'dra-gloria', name: 'Dra. Gloria Huaman', role: 'admin', email: 'gloria@centroopticosicuani.com' },
    { uid: 'dr-freddy', name: 'Dr. Freddy Mendoza', role: 'optometrist', email: 'freddy@opticasicuani.com' },
  ],
  plaza_de_armas: [
    { uid: 'dr-freddy', name: 'Dr. Freddy Mendoza', role: 'admin', email: 'freddy@opticasicuani.com' },
    { uid: 'dra-gloria', name: 'Dra. Gloria Huaman', role: 'optometrist', email: 'gloria@centroopticosicuani.com' },
  ],
};

// Transiciones rápidas para móvil
const fastTransition = { duration: 0.2, ease: 'easeOut' as const };
const springCard = { type: 'spring' as const, stiffness: 400, damping: 30 };
const springBounce = { type: 'spring' as const, stiffness: 500, damping: 25 };

export type DoctorProfile = typeof DOCTOR_PROFILES.dos_de_mayo[0];

interface LoginScreenProps {
  selectedStore: string | null;
  loginError: string;
  onSelectStore: (id: string) => void;
  onDoctorLogin: (storeId: string, doc: DoctorProfile) => void;
  onGoogleLogin: () => void;
  onBack: () => void;
}

export default function LoginScreen({
  selectedStore,
  loginError,
  onSelectStore,
  onDoctorLogin,
  onGoogleLogin,
  onBack,
}: LoginScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* ── Fondo simple para móvil ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-72 h-72 rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #FF385C 0%, transparent 70%)',
            top: '-10%', right: '-10%',
          }}
        />
      </div>

      {/* ── Page transitions ── */}
      <AnimatePresence mode="wait">
        {!selectedStore ? (
          /* ═══ STEP 1: Store Selection ═══ */
          <motion.div
            key="store-select"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95, filter: 'blur(4px)' }}
            transition={springCard}
            className="w-full max-w-sm text-center space-y-8 relative z-10 p-6"
          >
            {/* Logo with spring bounce */}
            <div className="flex flex-col items-center gap-5">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={springBounce}
                className="relative"
              >
                <div
                  className="w-20 h-20 rounded-[28px] flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.12), 0 6px 20px rgba(255,56,92,0.25)',
                  }}
                >
                  <Eye size={36} strokeWidth={2} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles size={10} className="text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...springCard }}
              >
                <h1 className="text-[28px] font-headline font-extrabold text-on-surface tracking-tight leading-tight">
                  Centro Optico
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-on-surface-variant font-body text-sm mt-1.5"
                >
                  Selecciona tu establecimiento
                </motion.p>
              </motion.div>
            </div>

            {/* Store cards — spring stagger */}
            <div className="space-y-3">
              {Object.values(STORES).map((store: StoreConfig, idx: number) => (
                <motion.button
                  key={store.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectStore(store.id)}
                  className="w-full p-4 bg-white rounded-2xl border-2 border-divider text-left flex items-center gap-4 active:bg-surface-container"
                  style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
                    style={{ background: store.color, boxShadow: '0 2px 0 rgba(0,0,0,0.15)' }}
                  >
                    <Eye size={26} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-on-surface text-base">{store.nombre}</p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {store.direccion}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-muted" />
                </motion.button>
              ))}
            </div>

            {/* Google login */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoogleLogin}
              className="w-full py-3.5 bg-white text-on-surface-variant rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 border-2 border-divider active:bg-surface-container"
              style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.05)' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continuar con Google
            </motion.button>

            {loginError && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={springCard}
                className="text-sm text-error bg-error-container rounded-2xl px-4 py-3"
              >
                {loginError}
              </motion.p>
            )}
          </motion.div>
        ) : (
          /* ═══ STEP 2: Doctor Selection ═══ */
          <motion.div
            key="doctor-select"
            initial={{ opacity: 0, x: 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.95 }}
            transition={springCard}
            className="w-full max-w-sm text-center space-y-8 relative z-10 p-6"
          >
            {/* Store header */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={fastTransition}
                className="w-20 h-20 rounded-[28px] flex items-center justify-center text-white"
                style={{
                  background: STORES[selectedStore]?.color,
                  boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 6px 20px rgba(0,0,0,0.12)',
                }}
              >
                <Eye size={36} strokeWidth={2} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ...springCard }}
              >
                <h1 className="text-xl font-headline font-extrabold text-on-surface tracking-tight">
                  {STORES[selectedStore]?.nombre}
                </h1>
                <p className="text-xs text-on-surface-variant mt-1 flex items-center justify-center gap-1">
                  <MapPin size={11} /> {STORES[selectedStore]?.subtitulo}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-on-surface-variant font-body text-sm"
              >
                Selecciona tu perfil
              </motion.p>
            </div>

            {/* Doctor cards — spring from right */}
            <div className="space-y-3">
              {(DOCTOR_PROFILES[selectedStore] || []).map((doc, idx) => (
                <motion.button
                  key={doc.uid}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDoctorLogin(selectedStore, doc)}
                  className="w-full p-4 bg-white rounded-2xl border-2 border-divider text-left flex items-center gap-4 active:bg-surface-container"
                  style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-base shrink-0"
                    style={{
                      background: `${STORES[selectedStore]?.color}12`,
                      color: STORES[selectedStore]?.color,
                    }}
                  >
                    {doc.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm">{doc.name}</p>
                    <p className="text-xs text-on-surface-variant capitalize">
                      {doc.role === 'admin' ? 'Administrador' : 'Optometrista'}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted shrink-0" />
                </motion.button>
              ))}
            </div>

            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="text-sm text-on-surface-variant font-bold px-6 py-2.5 rounded-xl active:bg-surface-container"
            >
              ← Cambiar local
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
