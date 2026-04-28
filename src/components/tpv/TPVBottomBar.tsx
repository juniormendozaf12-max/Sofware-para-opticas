import { useTPV } from './TPVContext';
import type { TPVStep } from './TPVContext';
import { cn, formatCurrency } from '../../lib/utils';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, RotateCcw, Check } from 'lucide-react';

// ══════════════════════════════════════════
// NEXT STEP LABELS
// ══════════════════════════════════════════

const NEXT_STEP_LABELS: Record<TPVStep, string> = {
  monturas: 'LUNAS RX',
  lunas_rx: 'ACCESORIOS',
  accesorios: 'PAGAR',
  pagar: 'CONFIRMAR VENTA',
  listo: 'NUEVA VENTA',
};

// ══════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════

export default function TPVBottomBar() {
  const {
    cart,
    total,
    lastAddedProduct,
    currentStep,
    goNextStep,
    resetSale,
    handleConfirmSale,
    submitting,
  } = useTPV();

  const itemCount = cart.length;
  const unitCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  function handleActionClick() {
    if (currentStep === 'listo') {
      resetSale();
    } else if (currentStep === 'pagar') {
      handleConfirmSale();
    } else {
      goNextStep();
    }
  }

  const buttonLabel = NEXT_STEP_LABELS[currentStep];
  const isConfirm = currentStep === 'pagar';
  const isNewSale = currentStep === 'listo';

  return (
    <div
      className={cn(
        'w-full bg-gray-900 text-white px-4 lg:px-6 shrink-0',
        'flex items-center justify-between gap-4',
        'h-14 z-45',
      )}
      style={{ zIndex: 45 }}
    >
      {/* ── Left: item count (hidden on mobile) ── */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
        <span className="text-sm font-semibold tracking-wide text-gray-200">
          {itemCount} ITEMS
        </span>
        <span className="text-xs text-gray-500">/</span>
        <span className="text-xs text-gray-400">
          {unitCount} u.
        </span>
      </div>

      {/* ── Center: last added product (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col items-center flex-1 min-w-0 px-4">
        {lastAddedProduct ? (
          <>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              Ultimo Agregado
            </span>
            <span className="text-sm text-gray-200 font-medium truncate max-w-xs">
              {lastAddedProduct}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-600">
            Sin productos en el carrito
          </span>
        )}
      </div>

      {/* ── Right: total + action button ── */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Total */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium hidden lg:block">
            Total
          </span>
          <span className="text-lg lg:text-xl font-bold text-white tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Action button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleActionClick}
          disabled={submitting}
          className={cn(
            'flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap',
            isNewSale
              ? 'bg-amber-500 hover:bg-amber-400 text-gray-900'
              : isConfirm
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white',
            submitting && 'opacity-60 cursor-not-allowed',
          )}
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isNewSale ? (
            <RotateCcw className="w-4 h-4" />
          ) : isConfirm ? (
            <Check className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}

          {/* Mobile: shorter label */}
          <span className="lg:hidden">
            {isNewSale ? 'NUEVA' : isConfirm ? 'CONFIRMAR' : 'SIG.'}
          </span>

          {/* Desktop: full label */}
          <span className="hidden lg:inline">
            {isNewSale || isConfirm ? buttonLabel : `SIGUIENTE: ${buttonLabel}`}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
