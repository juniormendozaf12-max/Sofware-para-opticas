import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Printer,
  FileText,
  Download,
  Phone,
  ShoppingBag,
  AlertCircle,
  User,
  Package,
  Calendar,
} from 'lucide-react';
import { useTPV } from './TPVContext';
import { WhatsAppIcon } from '../ui/whatsapp-icon';
import { cn, formatCurrency, formatDate } from '../../lib/utils';

// ══════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════

export default function TPVCompletionStep() {
  const {
    lastSale,
    lastSalePatient,
    lastSaleRx,
    successMessage,
    errorMessage,
    recentSales,
    resetSale,
    printTicket,
    printNote,
    printBundle,
    downloadPdf,
    sendWhatsApp,
  } = useTPV();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* ── Success message ── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400, delay: 0.15 }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-bold text-emerald-800 text-lg">{successMessage}</h3>
              <p className="text-emerald-600 text-sm mt-0.5">
                La venta ha sido registrada correctamente.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error message ── */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4"
          >
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800">Error</h3>
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Last sale summary ── */}
      {lastSale && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Sale header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Resumen de Venta</h3>
              {lastSale.documentNumber && (
                <span className="bg-gray-100 text-gray-600 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                  {lastSale.documentNumber}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {/* Patient */}
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Paciente:</span>
                <span className="font-semibold text-gray-900">
                  {lastSalePatient?.name || lastSale.patientName || 'Cliente Mostrador'}
                </span>
              </div>

              {/* Items count */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Articulos:</span>
                <span className="font-semibold text-gray-900">
                  {lastSale.items.length} {lastSale.items.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Fecha:</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(lastSale.date)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-black text-2xl text-gray-900">
                {formatCurrency(lastSale.total)}
              </span>
            </div>

            {/* Saldo if pending */}
            {lastSale.saldo && lastSale.saldo > 0 && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Saldo pendiente</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(lastSale.saldo)}
                </span>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="p-5 flex flex-wrap gap-2">
            {/* Imprimir (2x Ticket + 1x RX) */}
            <button
              type="button"
              onClick={() => printBundle(lastSale, lastSalePatient, lastSaleRx)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>

            {/* Ticket solo */}
            <button
              type="button"
              onClick={() => printTicket(lastSale, lastSalePatient)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-600 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Ticket
            </button>

            {/* Nota */}
            <button
              type="button"
              onClick={() => printNote(lastSale, lastSalePatient, lastSaleRx)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Nota
            </button>

            {/* PDF */}
            <button
              type="button"
              onClick={() => downloadPdf(lastSale, lastSalePatient)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => sendWhatsApp(lastSale, lastSalePatient)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#25D366' }}
            >
              <WhatsAppIcon size={14} />
              WhatsApp
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Nueva Venta button ── */}
      <motion.button
        type="button"
        onClick={resetSale}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
      >
        <ShoppingBag className="w-5 h-5" />
        Nueva Venta
      </motion.button>

      {/* ── Recent sales list ── */}
      {recentSales.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 25, stiffness: 250 }}
        >
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">
            Ventas Recientes
          </h3>
          <div className="space-y-2">
            {recentSales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {sale.patientName || 'Cliente Mostrador'}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                        sale.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sale.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700',
                      )}
                    >
                      {sale.status === 'completed'
                        ? 'Pagado'
                        : sale.status === 'pending'
                          ? 'Pendiente'
                          : 'Anulado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {formatDate(sale.date)}
                    </span>
                    <span className="text-xs text-gray-300">&middot;</span>
                    <span className="text-xs text-gray-400">
                      {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-900 flex-shrink-0">
                  {formatCurrency(sale.total)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
