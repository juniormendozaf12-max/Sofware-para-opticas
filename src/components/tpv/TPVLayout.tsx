import { useState } from 'react';
import { TPVProvider, useTPV } from './TPVContext';
import type { TPVStep } from './TPVContext';
import type { UserProfile } from '../../types';
import TPVStepWizard from './TPVStepWizard';
import TPVSidebar from './TPVSidebar';
import TPVProductGrid from './TPVProductGrid';
import TPVCartPanel from './TPVCartPanel';
import TPVBottomBar from './TPVBottomBar';
import TPVLensModal from './TPVLensModal';
import TPVPaymentStep from './TPVPaymentStep';
import TPVCompletionStep from './TPVCompletionStep';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X } from 'lucide-react';

// ══════════════════════════════════════════
// INNER LAYOUT (needs TPV context)
// ══════════════════════════════════════════

function TPVLayoutInner() {
  const { currentStep, cart, showLensModal } = useTPV();
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const totalUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

  /** Decide what to render in the center column based on the current step */
  function renderCenterContent() {
    switch (currentStep) {
      case 'monturas':
      case 'accesorios':
      case 'lunas_rx':
        return <TPVProductGrid />;
      case 'pagar':
        return <TPVPaymentStep />;
      case 'listo':
        return <TPVCompletionStep />;
      default:
        return <TPVProductGrid />;
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      {/* ── Step wizard (full width) ── */}
      <TPVStepWizard />

      {/* ── Desktop 3-column grid (lg+) ── */}
      <div
        className={cn(
          'hidden lg:grid flex-1 min-h-0 overflow-hidden',
        )}
        style={{ gridTemplateColumns: '220px 1fr 340px' }}
      >
        {/* Left: sidebar */}
        <TPVSidebar />

        {/* Center: dynamic content */}
        <div className="overflow-y-auto">
          {renderCenterContent()}
        </div>

        {/* Right: cart panel */}
        <TPVCartPanel />
      </div>

      {/* ── Mobile single column (<lg) ── */}
      <div className="flex flex-col flex-1 min-h-0 lg:hidden overflow-hidden">
        {/* Mobile category bar (sidebar content as horizontal strip) */}
        <TPVSidebar />

        {/* Center content scrollable */}
        <div className="flex-1 overflow-y-auto">
          {renderCenterContent()}
        </div>
      </div>

      {/* ── Mobile cart slide-up panel ── */}
      <AnimatePresence>
        {mobileCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileCartOpen(false)}
            />
            {/* Cart panel */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                <h3 className="font-bold text-gray-900">Carrito</h3>
                <button
                  onClick={() => setMobileCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <TPVCartPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile floating cart button ── */}
      {!mobileCartOpen && cart.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className={cn(
            'fixed bottom-20 right-4 z-40 lg:hidden',
            'flex items-center gap-2 px-4 py-3 rounded-full shadow-xl',
            'bg-emerald-600 text-white font-semibold',
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{totalUnits}</span>
        </button>
      )}

      {/* ── Bottom bar (fixed, full width) ── */}
      <TPVBottomBar />

      {/* ── Lens modal overlay ── */}
      {showLensModal && <TPVLensModal />}
    </div>
  );
}

// ══════════════════════════════════════════
// EXPORTED WRAPPER (provides TPV context)
// ══════════════════════════════════════════

export default function TPVLayout({ user }: { user: UserProfile }) {
  return (
    <TPVProvider user={user}>
      <TPVLayoutInner />
    </TPVProvider>
  );
}
