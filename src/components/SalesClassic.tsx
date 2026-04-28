import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, Phone, Star, X,
  Receipt, FileText, Download, ChevronDown, ChevronUp,
  Banknote, CreditCard, Smartphone, ArrowRightLeft, Ticket,
  AlertTriangle, Loader2, Package,
} from 'lucide-react';
import type { Product, Sale, SaleItem, Patient, UserProfile, PaymentMethod, DocumentType } from '../types';
import {
  fetchProducts, fetchSales, fetchPatients, createSale, createPatient, updatePatient,
  searchProducts, searchPatients, onDataChange,
  printSaleTicket, printSaleNote, downloadTicketPdf, sendTicketWhatsApp,
} from '../lib/services';
import { WhatsAppIcon } from './ui/whatsapp-icon';
import { PremiumCTA } from './ui/premium-cta';
import { cn, formatCurrency, formatDate } from '../lib/utils';

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

interface CartItem {
  product: Product;
  quantity: number;
}

// ══════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════

export default function SalesClassic({ user }: { user: UserProfile }) {
  // ── Data ──
  const [products, setProducts] = useState<Product[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Product search ──
  const [productSearch, setProductSearch] = useState('');
  const [showProductResults, setShowProductResults] = useState(false);
  const productInputRef = useRef<HTMLInputElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // ── Cart ──
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Patient ──
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const patientInputRef = useRef<HTMLInputElement>(null);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  // ── Payment ──
  const [discount, setDiscount] = useState(0);
  const [abono, setAbono] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [documentType, setDocumentType] = useState<DocumentType>('boleta');
  const [ctaState, setCtaState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // ── Recent sales ──
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  // ── Computed ──
  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const discountAmount = Math.min(discount, subtotal);
  const total = Math.round((subtotal - discountAmount) * 100) / 100;
  const saldo = Math.max(0, Math.round((total - abono) * 100) / 100);

  const productResults = useMemo(() => {
    if (!productSearch.trim()) return [];
    return searchProducts(productSearch, products).slice(0, 10);
  }, [productSearch, products]);

  const patientResults = useMemo(() => {
    if (!patientSearch.trim()) return [];
    return searchPatients(patientSearch, patients).slice(0, 8);
  }, [patientSearch, patients]);

  // ── Data loading ──
  useEffect(() => {
    Promise.all([fetchProducts(), fetchSales(30), fetchPatients()])
      .then(([prods, sales, pats]) => {
        setProducts(prods);
        setRecentSales(sales);
        setPatients(pats);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Realtime ──
  useEffect(() => {
    const unsubs = [
      onDataChange('ventas', async () => {
        const s = await fetchSales(30);
        setRecentSales(s);
      }),
      onDataChange('productos', async () => {
        const p = await fetchProducts();
        setProducts(p);
      }),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  // ── Click outside handlers ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node) &&
        productInputRef.current &&
        !productInputRef.current.contains(e.target as Node)
      ) {
        setShowProductResults(false);
      }
      if (
        patientDropdownRef.current &&
        !patientDropdownRef.current.contains(e.target as Node) &&
        patientInputRef.current &&
        !patientInputRef.current.contains(e.target as Node)
      ) {
        setShowPatientDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Cart operations ──
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProductSearch('');
    setShowProductResults(false);
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => prev
      .map(item => {
        if (item.product.id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      })
      .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  // ── Patient selection ──
  const selectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setPatientName(patient.name);
    setPatientPhone(patient.phone || '');
    setPatientSearch('');
    setShowPatientDropdown(false);
  }, []);

  const clearPatient = useCallback(() => {
    setSelectedPatient(null);
    setPatientName('');
    setPatientPhone('');
    setPatientSearch('');
  }, []);

  // ── Confirm sale ──
  const handleConfirmSale = useCallback(async () => {
    if (cart.length === 0) return;
    setCtaState('loading');

    try {
      const saleItems: SaleItem[] = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productCode: item.product.code,
        quantity: item.quantity,
        unitPrice: item.product.salePrice,
        discount: 0,
        subtotal: item.product.salePrice * item.quantity,
      }));

      let salePatient = selectedPatient;
      if (!salePatient && patientName.trim()) {
        const newId = await createPatient({
          name: patientName.trim().toUpperCase(),
          dni: '',
          phone: patientPhone.trim() || undefined,
          isVIP: false,
        });
        salePatient = { id: newId, name: patientName.trim().toUpperCase(), dni: '', isVIP: false };
      } else if (salePatient && patientPhone.trim() && patientPhone.trim() !== salePatient.phone) {
        await updatePatient(salePatient.id, { phone: patientPhone.trim() }).catch(() => {});
      }

      const finalAbono = abono > 0 ? abono : total;
      const finalSaldo = Math.max(0, Math.round((total - finalAbono) * 100) / 100);
      const estadoPago: 'completed' | 'pending' = finalSaldo <= 0 ? 'completed' : 'pending';

      await createSale({
        date: new Date().toISOString(),
        patientId: salePatient?.id,
        patientName: salePatient?.name || patientName.trim() || undefined,
        items: saleItems,
        subtotal,
        discount: discountAmount,
        igv: 0,
        total,
        abono: finalAbono,
        saldo: finalSaldo,
        paymentMethod,
        documentType,
        sellerId: user.uid,
        sellerName: user.name,
        establecimiento: user.establecimiento,
        status: estadoPago,
      });

      const [newSales, newProds] = await Promise.all([fetchSales(30), fetchProducts()]);
      setRecentSales(newSales);
      setProducts(newProds);

      // Reset form
      setCart([]);
      setDiscount(0);
      setAbono(0);
      setPatientSearch('');
      setPatientName('');
      setPatientPhone('');
      setSelectedPatient(null);
      setPaymentMethod('cash');
      setDocumentType('boleta');
      setCtaState('success');
      setTimeout(() => setCtaState('idle'), 4000);
    } catch (err) {
      console.error('[SalesClassic] Error creating sale:', err);
      setCtaState('error');
      setTimeout(() => setCtaState('idle'), 4000);
    }
  }, [cart, selectedPatient, patientName, patientPhone, abono, total, subtotal, discountAmount, paymentMethod, documentType, user]);

  // ── Find patient for a sale (for WhatsApp) ──
  const findPatientForSale = useCallback((sale: Sale): Patient | null => {
    if (!sale.patientId) return null;
    return patients.find(p => p.id === sale.patientId) || null;
  }, [patients]);

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto lg:overflow-hidden">
      <div className="lg:grid lg:h-full" style={{ gridTemplateColumns: '1fr 400px' }}>
        {/* ═══════════════════════════════════
            LEFT COLUMN: SALE FORM
            ═══════════════════════════════════ */}
        <div className="p-4 lg:p-6 lg:overflow-y-auto space-y-4 pb-32 lg:pb-6">

          {/* ── Section: Product Search + Cart ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">
                Agregar Productos
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  ref={productInputRef}
                  type="text"
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                  onFocus={() => { if (productResults.length > 0) setShowProductResults(true); }}
                  placeholder="Buscar por nombre, codigo, marca..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-300 transition-shadow"
                />
                <AnimatePresence>
                  {showProductResults && productResults.length > 0 && (
                    <motion.div
                      ref={productDropdownRef}
                      initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{ transformOrigin: 'top' }}
                      className="absolute left-0 right-0 top-full z-40 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
                    >
                      {productResults.map(product => (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.code} | Stock: {product.stock}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(product.salePrice)}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cart items */}
            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                <div className="p-4 space-y-2">
                  {cart.map(item => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(item.product.salePrice)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, +1)}
                          className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-20 text-right tabular-nums">
                        {formatCurrency(item.product.salePrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Busca y agrega productos al carrito
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Section: Patient ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">
              Cliente <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </h3>

            {selectedPatient ? (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{selectedPatient.name}</p>
                      {selectedPatient.isVIP && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          <Star className="h-2.5 w-2.5" /> VIP
                        </span>
                      )}
                    </div>
                    {selectedPatient.dni && <p className="text-xs text-gray-500">DNI: {selectedPatient.dni}</p>}
                  </div>
                  <button onClick={clearPatient} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Cambiar">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Telefono..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="relative space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={patientInputRef}
                    type="text"
                    value={patientSearch}
                    onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDropdown(true); }}
                    onFocus={() => { if (patientResults.length > 0) setShowPatientDropdown(true); }}
                    placeholder="DNI o nombre... (vacio = EVENTUAL)"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                  />
                </div>

                <AnimatePresence>
                  {showPatientDropdown && patientResults.length > 0 && (
                    <motion.div
                      ref={patientDropdownRef}
                      initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{ transformOrigin: 'top' }}
                      className="absolute left-0 right-0 z-40 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
                    >
                      {patientResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => selectPatient(patient)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-400">
                              {patient.dni ? `DNI: ${patient.dni}` : 'Sin DNI'}
                              {patient.phone ? ` | ${patient.phone}` : ''}
                            </p>
                          </div>
                          {patient.isVIP && <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Manual name/phone for walk-in customers */}
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nombre del cliente (opcional)"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                />
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Telefono (opcional)"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Section: Payment ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Summary */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
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
                    className={cn(
                      'w-20 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold',
                      'focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400',
                      '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                <span className="font-bold text-gray-900 text-lg">TOTAL</span>
                <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-black text-2xl text-gray-900">
                  {formatCurrency(total)}
                </motion.span>
              </div>
            </div>

            {/* Abono / Saldo */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">A Cuenta</h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                  <input
                    type="number"
                    min={0}
                    max={total}
                    step={1}
                    value={abono || ''}
                    onChange={(e) => setAbono(Math.max(0, Number(e.target.value)))}
                    placeholder="0.00"
                    className={cn(
                      'w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold',
                      'focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400',
                      '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    )}
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Saldo pendiente</span>
                <span className={cn('font-bold text-base', saldo > 0 ? 'text-red-600' : 'text-emerald-600')}>
                  {formatCurrency(saldo)}
                </span>
              </div>
              {saldo > 0 && (
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

            {/* Payment method chips */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Metodo de Pago</h3>
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

            {/* Document type chips */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Tipo de Documento</h3>
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

            {/* Confirm CTA */}
            <div className="p-4">
              <PremiumCTA
                state={ctaState}
                onClick={handleConfirmSale}
                disabled={cart.length === 0}
                successText="Venta Registrada!"
                errorText="Error al registrar"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Confirmar Venta &mdash; {formatCurrency(total)}</span>
              </PremiumCTA>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════
            RIGHT COLUMN: RECENT SALES
            ═══════════════════════════════════ */}
        <div className="border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:p-5 lg:overflow-y-auto bg-gray-50">
          <h3 className="font-bold text-gray-900 text-base mb-3">Ventas Recientes</h3>

          {recentSales.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              Sin ventas recientes
            </div>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => {
                const isExpanded = expandedSale === sale.id;
                const statusColor = sale.status === 'completed' ? 'text-green-600 bg-green-50'
                  : sale.status === 'pending' ? 'text-amber-600 bg-amber-50'
                  : 'text-red-600 bg-red-50';
                const statusLabel = sale.status === 'completed' ? 'Pagado'
                  : sale.status === 'pending' ? 'Pendiente' : 'Cancelado';

                return (
                  <div key={sale.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                    {/* Sale header */}
                    <button
                      onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                      className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                        <Receipt size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {sale.patientName || 'Cliente Mostrador'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{formatDate(sale.date)}</span>
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold', statusColor)}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(sale.total)}</p>
                        {isExpanded
                          ? <ChevronUp size={14} className="text-gray-400 ml-auto mt-1" />
                          : <ChevronDown size={14} className="text-gray-400 ml-auto mt-1" />
                        }
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5 border-t border-gray-100">
                            {/* Items */}
                            <div className="mt-3 space-y-1">
                              {sale.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    {item.quantity}x {item.productName}
                                  </span>
                                  <span className="text-gray-900 font-medium">{formatCurrency(item.subtotal)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-2 pt-2 border-t border-gray-100 space-y-0.5">
                              {sale.discount > 0 && (
                                <>
                                  <div className="flex justify-between text-xs text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(sale.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-red-500">
                                    <span>Descuento</span>
                                    <span>-{formatCurrency(sale.discount)}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between text-sm font-bold text-gray-900">
                                <span>Total</span>
                                <span>{formatCurrency(sale.total)}</span>
                              </div>
                              {(sale.abono != null && sale.abono > 0 && sale.abono < sale.total) && (
                                <>
                                  <div className="flex justify-between text-xs text-emerald-600">
                                    <span>A cuenta</span>
                                    <span>{formatCurrency(sale.abono)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold text-red-600">
                                    <span>Saldo</span>
                                    <span>{formatCurrency(sale.saldo ?? (sale.total - sale.abono))}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-400">
                              {sale.sellerName && <span>Vendedor: <b className="text-gray-600">{sale.sellerName}</b></span>}
                              {sale.documentNumber && <span>Doc: <b className="text-gray-600">{sale.documentNumber}</b></span>}
                              {sale.paymentMethod && <span>Pago: <b className="text-gray-600">{sale.paymentMethod}</b></span>}
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => printSaleTicket(sale, findPatientForSale(sale))}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-900 hover:bg-gray-200 transition-colors"
                              >
                                <Receipt size={14} className="text-emerald-600" />
                                Ticket
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => printSaleNote(sale, findPatientForSale(sale))}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-900 hover:bg-gray-200 transition-colors"
                              >
                                <FileText size={14} className="text-emerald-600" />
                                Nota
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => downloadTicketPdf(sale, findPatientForSale(sale))}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                              >
                                <Download size={14} />
                                PDF
                              </motion.button>
                              {sale.patientName && (
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => sendTicketWhatsApp(sale, findPatientForSale(sale)).catch(e => console.error('[WhatsApp]', e))}
                                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366]/10 rounded-xl text-xs font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                                >
                                  <WhatsAppIcon size={14} />
                                  WhatsApp
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
