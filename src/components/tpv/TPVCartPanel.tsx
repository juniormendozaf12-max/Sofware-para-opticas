import { motion, AnimatePresence } from 'motion/react';
import {
  User, ShoppingCart, Plus, Eye, Pause, RotateCcw, Zap,
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { useTPV } from './TPVContext';
import TPVCartItem from './TPVCartItem';
import TPVClientSearch from './TPVClientSearch';

export default function TPVCartPanel() {
  const {
    cart,
    subtotal,
    discount,
    setDiscount,
    total,
    setCurrentStep,
    resetSale,
    setShowLensModal,
    patientRxHistory,
    loadingRx,
    handleCreateNewClient,
  } = useTPV();

  const itemCount = cart.length;
  const unitCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const hasRx = patientRxHistory.length > 0 || loadingRx;

  return (
    <div className="flex h-full flex-col bg-white border-l border-gray-200">
      {/* ═══════════════════════════════════════
          SECTION A: CLIENTE
          ═══════════════════════════════════════ */}
      <div className="border-b border-gray-100 p-4 space-y-3">
        {/* Section header */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
            <User className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Cliente
          </h3>
        </div>

        {/* Client search / selected card */}
        <TPVClientSearch />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewClient}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2',
              'bg-emerald-500 text-xs font-semibold text-white',
              'transition-colors hover:bg-emerald-600 active:bg-emerald-700',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo
          </button>
          <button
            onClick={() => setShowLensModal(true)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2',
              'bg-amber-500 text-xs font-semibold text-white',
              'transition-colors hover:bg-amber-600 active:bg-amber-700',
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            RX
          </button>
        </div>

        {/* RX badge */}
        <AnimatePresence mode="wait">
          {hasRx ? (
            <motion.div
              key="con-medida"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600"
            >
              <Eye className="h-3 w-3" />
              Con medida
            </motion.div>
          ) : (
            <motion.div
              key="sin-medida"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400"
            >
              <Eye className="h-3 w-3" />
              Sin medida
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════
          SECTION B: CARRITO
          ═══════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden border-b border-gray-100">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Carrito
          </h3>
          {itemCount > 0 && (
            <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              {itemCount}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div
                key="empty-cart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                  <ShoppingCart className="h-7 w-7 text-gray-300" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-400">Carrito vacio</p>
                <p className="mt-1 text-xs text-gray-300">
                  Click en un producto del grid
                </p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <TPVCartItem key={item.product.id} item={item} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SECTION C: TOTALES + CTA
          ═══════════════════════════════════════ */}
      <div className="shrink-0 p-4 space-y-3">
        {/* Summary table */}
        <div className="space-y-1.5 text-sm">
          {/* Items */}
          <div className="flex items-center justify-between text-gray-500">
            <span>Items</span>
            <span>
              {itemCount}
              {unitCount !== itemCount && (
                <span className="ml-1 text-gray-400">({unitCount} u.)</span>
              )}
            </span>
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="text-gray-700">{formatCurrency(subtotal)}</span>
          </div>

          {/* Descuento */}
          <div className="flex items-center justify-between text-gray-500">
            <span>Descuento</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">S/</span>
              <input
                type="number"
                min={0}
                step={1}
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className={cn(
                  'w-16 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-right text-sm text-gray-700',
                  'focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200',
                  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                )}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-1.5" />

          {/* TOTAL */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900">TOTAL</span>
            <motion.span
              key={total}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-xl font-black text-emerald-600"
            >
              {formatCurrency(total)}
            </motion.span>
          </div>
        </div>

        {/* Main CTA: Cobrar */}
        <button
          onClick={() => setCurrentStep('pagar')}
          disabled={cart.length === 0}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-3',
            'bg-amber-500 text-white shadow-lg shadow-amber-500/20',
            'transition-all hover:bg-amber-400 hover:shadow-amber-500/30 active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
          )}
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <Zap className="h-4 w-4" />
            COBRAR DIRECTO
          </span>
          <span className="text-xs font-normal opacity-80">Saltar al pago</span>
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2',
              'text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700',
            )}
          >
            <Pause className="h-3.5 w-3.5" />
            Suspender
          </button>
          <button
            onClick={resetSale}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2',
              'text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700',
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nueva
          </button>
        </div>
      </div>
    </div>
  );
}
