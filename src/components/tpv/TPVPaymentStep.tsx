import { motion } from 'motion/react';
import {
  Banknote,
  CreditCard,
  Smartphone,
  ArrowRightLeft,
  Receipt,
  FileText,
  Ticket,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import { useTPV } from './TPVContext';
import { cn, formatCurrency } from '../../lib/utils';
import { PremiumCTA } from '../ui/premium-cta';
import type { PaymentMethod, DocumentType } from '../../types';

// ══════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'card', label: 'Tarjeta', icon: CreditCard },
  { value: 'yape', label: 'Yape', icon: Smartphone },
  { value: 'plin', label: 'Plin', icon: Smartphone },
  { value: 'transfer', label: 'Transfer.', icon: ArrowRightLeft },
];

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: typeof Receipt }[] = [
  { value: 'boleta', label: 'Boleta', icon: Receipt },
  { value: 'factura', label: 'Factura', icon: FileText },
  { value: 'nota', label: 'Ticket', icon: Ticket },
];

// ══════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════

export default function TPVPaymentStep() {
  const {
    cart,
    subtotal,
    discount,
    setDiscount,
    discountAmount,
    total,
    abono,
    setAbono,
    saldo,
    paymentMethod,
    setPaymentMethod,
    documentType,
    setDocumentType,
    ctaState,
    handleConfirmSale,
  } = useTPV();

  const hasItems = cart.length > 0;
  const isCredit = saldo > 0;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* ── Summary section ── */}
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
            Resumen
          </h3>

          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-500">Descuento</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">S/</span>
              <input
                type="number"
                min={0}
                max={subtotal}
                step={1}
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-20 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
            <span className="font-bold text-gray-900 text-lg">TOTAL</span>
            <span className="font-black text-2xl text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* ── Abono / Saldo section ── */}
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">
            A Cuenta
          </h3>

          {/* Abono input + quick fill */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                S/
              </span>
              <input
                type="number"
                min={0}
                max={total}
                step={1}
                value={abono || ''}
                onChange={(e) => setAbono(Math.max(0, Number(e.target.value)))}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setAbono(total)}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              TOTAL
            </button>
          </div>

          {/* Saldo pendiente */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Saldo pendiente</span>
            <span
              className={cn(
                'font-bold text-base',
                saldo > 0 ? 'text-red-600' : 'text-emerald-600',
              )}
            >
              {formatCurrency(saldo)}
            </span>
          </div>

          {/* Credit warning */}
          {isCredit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-amber-700">
                Venta a credito &mdash; saldo pendiente de S/ {saldo.toFixed(2)}
              </span>
            </motion.div>
          )}
        </div>

        {/* ── Payment method chips ── */}
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">
            Metodo de Pago
          </h3>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon;
              const isActive = paymentMethod === pm.value;
              return (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {pm.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Document type selection ── */}
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">
            Tipo de Documento
          </h3>
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_TYPES.map((dt) => {
              const Icon = dt.icon;
              const isActive = documentType === dt.value;
              return (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setDocumentType(dt.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {dt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Confirm CTA ── */}
        <div className="p-5">
          <PremiumCTA
            state={ctaState}
            onClick={handleConfirmSale}
            disabled={!hasItems}
            successText="Venta Registrada!"
            errorText="Error al registrar"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Confirmar Venta &mdash; {formatCurrency(total)}</span>
          </PremiumCTA>
        </div>
      </motion.div>
    </div>
  );
}
