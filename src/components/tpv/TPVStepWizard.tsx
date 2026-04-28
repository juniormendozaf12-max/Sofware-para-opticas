import { useTPV } from './TPVContext';
import type { TPVStep } from './TPVContext';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

// ══════════════════════════════════════════
// STEP DEFINITIONS
// ══════════════════════════════════════════

const STEPS: { id: TPVStep; label: string; sublabel: string; number: number }[] = [
  { id: 'monturas', label: 'MONTURAS', sublabel: 'Elige tu armazon', number: 1 },
  { id: 'lunas_rx', label: 'LUNAS RX', sublabel: 'Cliente + Medida auto', number: 2 },
  { id: 'accesorios', label: 'ACCESORIOS', sublabel: 'Liquidos - panos - estuches', number: 3 },
  { id: 'pagar', label: 'PAGAR', sublabel: 'Metodo y monto', number: 4 },
  { id: 'listo', label: 'LISTO', sublabel: 'Ticket emitido', number: 5 },
];

const STEP_ORDER: TPVStep[] = STEPS.map((s) => s.id);

// ══════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════

export default function TPVStepWizard() {
  const { currentStep, setCurrentStep, setShowLensModal } = useTPV();

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  function handleStepClick(step: (typeof STEPS)[number]) {
    setCurrentStep(step.id);
    if (step.id === 'lunas_rx') {
      setShowLensModal(true);
    }
  }

  function getStepState(idx: number): 'completed' | 'active' | 'pending' {
    if (idx < currentIndex) return 'completed';
    if (idx === currentIndex) return 'active';
    return 'pending';
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-4 py-3 shrink-0">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* ── Steps row ── */}
        <div className="flex items-center gap-0 flex-1 overflow-x-auto scrollbar-hide">
          {STEPS.map((step, idx) => {
            const state = getStepState(idx);
            const isLast = idx === STEPS.length - 1;

            return (
              <div key={step.id} className="flex items-center shrink-0">
                {/* Step item */}
                <motion.button
                  onClick={() => handleStepClick(step)}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {/* Number circle */}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: state === 'active' ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                      state === 'active' && 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
                      state === 'completed' && 'bg-emerald-600 text-white',
                      state === 'pending' && 'bg-amber-900/50 text-amber-300',
                    )}
                  >
                    {state === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </motion.div>

                  {/* Label + sublabel (hidden on mobile, only show active) */}
                  <div
                    className={cn(
                      'hidden lg:block text-left',
                      'lg:opacity-100',
                    )}
                  >
                    <div
                      className={cn(
                        'text-xs font-bold tracking-wide leading-tight transition-colors',
                        state === 'active' && 'text-white',
                        state === 'completed' && 'text-emerald-300',
                        state === 'pending' && 'text-amber-400/70',
                      )}
                    >
                      {step.label}
                    </div>
                    <div
                      className={cn(
                        'text-[10px] leading-tight transition-colors',
                        state === 'active' && 'text-amber-100',
                        state === 'completed' && 'text-emerald-200/70',
                        state === 'pending' && 'text-amber-500/50',
                      )}
                    >
                      {step.sublabel}
                    </div>
                  </div>

                  {/* Mobile: show active label only */}
                  {state === 'active' && (
                    <div className="lg:hidden text-left">
                      <div className="text-xs font-bold tracking-wide text-white leading-tight">
                        {step.label}
                      </div>
                    </div>
                  )}
                </motion.button>

                {/* Dashed connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-6 lg:w-10 h-0 mx-2 border-t border-dashed',
                      idx < currentIndex
                        ? 'border-emerald-500/60'
                        : 'border-amber-600/40',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── TPV ACTIVO badge ── */}
        <div className="hidden sm:flex items-center gap-1.5 ml-4 shrink-0">
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            TPV ACTIVO
          </span>
        </div>
      </div>
    </div>
  );
}
