import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, Phone, Star, X,
  Receipt, FileText, Download, ChevronDown, ChevronUp, Eye,
  Banknote, CreditCard, Smartphone, ArrowRightLeft, Ticket,
  AlertTriangle, Loader2, Package, Save, Check, Printer,
} from 'lucide-react';
import type { Product, Sale, SaleItem, Patient, UserProfile, PaymentMethod, DocumentType } from '../types';
import type { LensPriceResult } from '../lib/services';
import {
  fetchProducts, fetchSales, fetchPatients, createSale, createPatient, updatePatient,
  searchProducts, searchPatients, onDataChange,
  printSaleTicket, printSaleNote, printSaleBundle, sendTicketWhatsApp, downloadSaleBundlePdf,
  calculateLensPrices, createPrescription, fetchPrescriptions, cancelSale,
} from '../lib/services';
import { WhatsAppIcon } from './ui/whatsapp-icon';
import RxInput from './tpv/RxInput';
import { PremiumCTA } from './ui/premium-cta';
import { cn, formatCurrency, formatDate } from '../lib/utils';

// ══════════════════════════════════════════
// DUOLINGO-STYLE 3D BUTTON
// ══════════════════════════════════════════

function Btn3D({ children, onClick, disabled, color = 'green', className, type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  color?: 'green' | 'amber' | 'blue' | 'gray' | 'red' | 'coral';
  className?: string;
  type?: 'button' | 'submit';
}) {
  const colors = {
    green: 'bg-[#58CC02] border-b-[#46a302] text-white active:bg-[#46a302] hover:bg-[#4db802] disabled:bg-[#e5e5e5] disabled:border-b-[#cccccc] disabled:text-[#aaa]',
    amber: 'bg-[#FF9600] border-b-[#e08600] text-white active:bg-[#e08600] hover:bg-[#f09000]',
    blue: 'bg-[#1CB0F6] border-b-[#1899d6] text-white active:bg-[#1899d6] hover:bg-[#18a8ea]',
    gray: 'bg-white border-b-[#e5e5e5] border-[#e5e5e5] text-[#4b4b4b] active:bg-[#f7f7f7] hover:bg-[#f7f7f7]',
    red: 'bg-[#FF4B4B] border-b-[#e04343] text-white active:bg-[#e04343] hover:bg-[#f04545]',
    coral: 'bg-[#FF6B6B] border-b-[#e05555] text-white active:bg-[#e05555] hover:bg-[#f06060]',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-extrabold rounded-2xl border-b-4 px-5 py-3 text-sm uppercase tracking-wide',
        'transition-all duration-75 active:border-b-0 active:mt-1 active:mb-[-1px]',
        'disabled:cursor-not-allowed disabled:active:border-b-4 disabled:active:mt-0 disabled:active:mb-0',
        colors[color],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ══════════════════════════════════════════
// SECTION CARD — color-coded wrapper
// ══════════════════════════════════════════

function SectionCard({ children, icon, title, color = 'gray', badge, actions, collapsible, defaultOpen = true }: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  color?: 'green' | 'amber' | 'blue' | 'coral' | 'gray';
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const headerColors = {
    green: 'from-[#58CC02]/10 to-[#58CC02]/5 border-[#58CC02]/20',
    amber: 'from-[#FF9600]/10 to-[#FF9600]/5 border-[#FF9600]/20',
    blue: 'from-[#1CB0F6]/10 to-[#1CB0F6]/5 border-[#1CB0F6]/20',
    coral: 'from-[#FF6B6B]/10 to-[#FF6B6B]/5 border-[#FF6B6B]/20',
    gray: 'from-gray-100 to-gray-50 border-gray-200',
  };
  const iconColors = {
    green: 'text-[#58CC02]',
    amber: 'text-[#FF9600]',
    blue: 'text-[#1CB0F6]',
    coral: 'text-[#FF6B6B]',
    gray: 'text-gray-500',
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden shadow-[0_2px_0_#e5e5e5]">
      <button
        type="button"
        onClick={collapsible ? () => setOpen(!open) : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r border-b-2',
          headerColors[color],
          collapsible && 'cursor-pointer hover:brightness-[0.98]',
          !collapsible && 'cursor-default',
        )}
      >
        <span className={cn('shrink-0', iconColors[color])}>{icon}</span>
        <span className="font-extrabold text-[#4b4b4b] text-sm tracking-tight flex-1 text-left">{title}</span>
        {badge}
        {actions}
        {collapsible && (
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-[#afafaf]" />
          </motion.span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote; emoji: string }[] = [
  { value: 'cash', label: 'Efectivo', icon: Banknote, emoji: '💵' },
  { value: 'card', label: 'Tarjeta', icon: CreditCard, emoji: '💳' },
  { value: 'yape', label: 'Yape', icon: Smartphone, emoji: '📱' },
  { value: 'plin', label: 'Plin', icon: Smartphone, emoji: '📲' },
  { value: 'transfer', label: 'Transfer.', icon: ArrowRightLeft, emoji: '🏦' },
];

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: typeof Receipt }[] = [
  { value: 'boleta', label: 'Boleta', icon: Receipt },
  { value: 'factura', label: 'Factura', icon: FileText },
  { value: 'nota', label: 'Ticket', icon: Ticket },
];

interface CartItem { product: Product; quantity: number; }

// ══════════════════════════════════════════
// MAIN COMPONENT
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

  // ── RX / Lunas por Medida ──
  const [odEsf, setOdEsf] = useState(0);
  const [odCil, setOdCil] = useState(0);
  const [odEje, setOdEje] = useState(0);
  const [odAdd, setOdAdd] = useState(0);
  const [oiEsf, setOiEsf] = useState(0);
  const [oiCil, setOiCil] = useState(0);
  const [oiEje, setOiEje] = useState(0);
  const [oiAdd, setOiAdd] = useState(0);
  const [rxDip, setRxDip] = useState(0);
  const [rxLensType, setRxLensType] = useState('');
  const [rxOptometrist, setRxOptometrist] = useState('');
  const [lensQty, setLensQty] = useState<'uni' | 'par'>('par');
  const [savingRx, setSavingRx] = useState(false);
  const [rxSaved, setRxSaved] = useState(false);

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

  const lensResults = useMemo(() => calculateLensPrices(odEsf, odCil, oiEsf, oiCil), [odEsf, odCil, oiEsf, oiCil]);

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
      .then(([prods, sales, pats]) => { setProducts(prods); setRecentSales(sales); setPatients(pats); })
      .finally(() => setLoading(false));
  }, []);

  // ── Realtime ──
  useEffect(() => {
    const unsubs = [
      onDataChange('ventas', async () => { setRecentSales(await fetchSales(30)); }),
      onDataChange('productos', async () => { setProducts(await fetchProducts()); }),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  // ── Click outside ──
  useEffect(() => {
    function h(e: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node) &&
          productInputRef.current && !productInputRef.current.contains(e.target as Node))
        setShowProductResults(false);
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node) &&
          patientInputRef.current && !patientInputRef.current.contains(e.target as Node))
        setShowPatientDropdown(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Cart ops ──
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProductSearch('');
    setShowProductResults(false);
  }, []);

  const addLensToCart = useCallback((result: LensPriceResult) => {
    const price = lensQty === 'par' ? result.pricePair : result.priceUnit;
    const lensProduct: Product = {
      id: `lens-${result.material.code}-${Date.now()}`,
      code: result.material.code,
      name: `${result.material.name} (${lensQty === 'par' ? 'Par' : 'Uni'})`,
      category: 'lens',
      salePrice: price,
      costPrice: 0,
      stock: 99,
      stockMin: 0,
      status: 'active',
    };
    setCart(prev => [...prev, { product: lensProduct, quantity: 1 }]);
  }, [lensQty]);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => prev
      .map(item => {
        if (item.product.id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      }).filter(Boolean) as CartItem[]
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  // ── Patient ──
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

  // ── Save RX ──
  const handleSaveRx = useCallback(async () => {
    let patientForRx = selectedPatient;
    const resolvedName = patientName.trim() || patientSearch.trim();
    if (!patientForRx && resolvedName) {
      setSavingRx(true);
      try {
        const newId = await createPatient({ name: resolvedName.toUpperCase(), dni: '', phone: patientPhone.trim() || undefined, isVIP: false });
        patientForRx = { id: newId, name: resolvedName.toUpperCase(), dni: '', isVIP: false, phone: patientPhone.trim() || undefined };
        setSelectedPatient(patientForRx);
        setPatientName(resolvedName.toUpperCase());
        setPatientSearch('');
      } catch { setSavingRx(false); return; }
    }
    if (!patientForRx) return;
    setSavingRx(true);
    try {
      await createPrescription(patientForRx.id, {
        od: { sph: odEsf, cyl: odCil, axis: odEje, add: odAdd },
        oi: { sph: oiEsf, cyl: oiCil, axis: oiEje, add: oiAdd },
        dip: rxDip,
        lensType: rxLensType || undefined,
        optometrist: rxOptometrist || undefined,
      });
      setRxSaved(true);
      setTimeout(() => setRxSaved(false), 3000);
    } catch (err) { console.error('Error saving RX:', err); }
    finally { setSavingRx(false); }
  }, [selectedPatient, patientName, patientSearch, patientPhone, odEsf, odCil, odEje, odAdd, oiEsf, oiCil, oiEje, oiAdd, rxDip, rxLensType, rxOptometrist]);

  // ── Confirm sale ──
  const handleConfirmSale = useCallback(async () => {
    if (cart.length === 0) return;
    setCtaState('loading');
    try {
      const saleItems: SaleItem[] = cart.map(item => ({
        productId: item.product.id, productName: item.product.name, productCode: item.product.code,
        quantity: item.quantity, unitPrice: item.product.salePrice, discount: 0,
        subtotal: item.product.salePrice * item.quantity,
      }));
      let salePatient = selectedPatient;
      if (!salePatient && patientName.trim()) {
        const newId = await createPatient({ name: patientName.trim().toUpperCase(), dni: '', phone: patientPhone.trim() || undefined, isVIP: false });
        salePatient = { id: newId, name: patientName.trim().toUpperCase(), dni: '', isVIP: false };
      } else if (salePatient && patientPhone.trim() && patientPhone.trim() !== salePatient.phone) {
        await updatePatient(salePatient.id, { phone: patientPhone.trim() }).catch(() => {});
      }
      const finalAbono = abono > 0 ? abono : total;
      const finalSaldo = Math.max(0, Math.round((total - finalAbono) * 100) / 100);
      const estadoPago: 'completed' | 'pending' = finalSaldo <= 0 ? 'completed' : 'pending';
      await createSale({
        date: new Date().toISOString(), patientId: salePatient?.id,
        patientName: salePatient?.name || patientName.trim() || undefined,
        items: saleItems, subtotal, discount: discountAmount, igv: 0, total,
        abono: finalAbono, saldo: finalSaldo, paymentMethod, documentType,
        sellerId: user.uid, sellerName: user.name, establecimiento: user.establecimiento, status: estadoPago,
      });
      const [newSales, newProds] = await Promise.all([fetchSales(30), fetchProducts()]);
      setRecentSales(newSales);
      setProducts(newProds);
      setCart([]); setDiscount(0); setAbono(0);
      setPatientSearch(''); setPatientName(''); setPatientPhone('');
      setSelectedPatient(null); setPaymentMethod('cash'); setDocumentType('boleta');
      setOdEsf(0); setOdCil(0); setOdEje(0); setOdAdd(0);
      setOiEsf(0); setOiCil(0); setOiEje(0); setOiAdd(0);
      setRxDip(0); setRxLensType(''); setRxOptometrist('');
      setCtaState('success');
      setTimeout(() => setCtaState('idle'), 4000);
    } catch (err) {
      console.error('[SalesClassic] Error:', err);
      setCtaState('error');
      setTimeout(() => setCtaState('idle'), 4000);
    }
  }, [cart, selectedPatient, patientName, patientPhone, abono, total, subtotal, discountAmount, paymentMethod, documentType, user]);

  const findPatientForSale = useCallback((sale: Sale): Patient | null => {
    if (!sale.patientId) return null;
    return patients.find(p => p.id === sale.patientId) || null;
  }, [patients]);

  const canSaveRx = !!(selectedPatient || patientName?.trim() || patientSearch?.trim());

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#f0f0f0]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-[#58CC02]" />
        </motion.div>
        <span className="font-extrabold text-[#afafaf] text-sm uppercase tracking-wider">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto lg:overflow-hidden bg-[#f0f0f0]">
      <div className="lg:grid lg:h-full" style={{ gridTemplateColumns: '1fr 380px' }}>

        {/* ═══════════════════════════════════
            LEFT: SALE FORM
            ═══════════════════════════════════ */}
        <div className="p-3 lg:p-5 lg:overflow-y-auto space-y-3 pb-28 lg:pb-5">

          {/* ── A. CLIENT ── */}
          <SectionCard
            icon={<User size={18} />}
            title="Cliente"
            color="green"
            badge={selectedPatient && (
              <span className="bg-[#58CC02] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                {selectedPatient.name.split(' ')[0]}
              </span>
            )}
          >
            {selectedPatient ? (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-xl border-2 border-[#58CC02]/30 bg-[#58CC02]/5 p-3">
                  <div className="w-10 h-10 rounded-full bg-[#58CC02]/20 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#58CC02]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-[#4b4b4b] truncate">{selectedPatient.name}</p>
                    <p className="text-xs text-[#afafaf]">
                      {selectedPatient.dni ? `DNI: ${selectedPatient.dni}` : 'Sin DNI'}
                    </p>
                  </div>
                  {selectedPatient.isVIP && (
                    <span className="bg-[#FF9600]/20 text-[#FF9600] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star size={10} /> VIP
                    </span>
                  )}
                  <button onClick={clearPatient} className="p-1.5 rounded-lg hover:bg-[#e5e5e5] text-[#afafaf] transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#afafaf]" />
                  <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Telefono del cliente (opcional)"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-[#f7f7f7] text-sm font-bold text-[#4b4b4b] placeholder:text-[#cdcdcd] focus:outline-none focus:border-[#58CC02] transition-colors"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#afafaf]" />
                  <input ref={patientInputRef} type="text" value={patientSearch}
                    onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDropdown(true); }}
                    onFocus={() => { if (patientResults.length > 0) setShowPatientDropdown(true); }}
                    placeholder="DNI o nombre... (vacio = EVENTUAL)"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-bold text-[#4b4b4b] placeholder:text-[#cdcdcd] focus:outline-none focus:border-[#58CC02] transition-colors"
                  />
                  <AnimatePresence>
                    {showPatientDropdown && patientResults.length > 0 && (
                      <motion.div ref={patientDropdownRef}
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-52 overflow-y-auto rounded-xl border-2 border-[#e5e5e5] bg-white shadow-lg"
                      >
                        {patientResults.map((p) => (
                          <button key={p.id} onClick={() => selectPatient(p)}
                            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-[#58CC02]/5 border-b border-[#f0f0f0] last:border-b-0 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#e5e5e5] flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-[#afafaf]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#4b4b4b] truncate">{p.name}</p>
                              <p className="text-xs text-[#afafaf]">{p.dni ? `DNI: ${p.dni}` : 'Sin DNI'}{p.phone ? ` | ${p.phone}` : ''}</p>
                            </div>
                            {p.isVIP && <Star size={14} className="text-[#FF9600] shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-[#f7f7f7] text-sm font-bold text-[#4b4b4b] placeholder:text-[#cdcdcd] focus:outline-none focus:border-[#58CC02] transition-colors"
                />
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#afafaf]" />
                  <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Telefono del cliente (opcional)"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-[#f7f7f7] text-sm font-bold text-[#4b4b4b] placeholder:text-[#cdcdcd] focus:outline-none focus:border-[#58CC02] transition-colors"
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── B. LUNAS POR MEDIDA ── */}
          <SectionCard
            icon={<Eye size={18} />}
            title="Lunas por Medida"
            color="amber"
            collapsible
            defaultOpen={true}
          >
            {/* OD */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#FF9600] text-white text-[10px] font-black px-2.5 py-1 rounded-full">OD</span>
                <span className="text-xs font-bold text-[#afafaf]">Ojo Derecho</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">ESF</label>
                  <RxInput label="OD Esfera" value={odEsf} onChange={setOdEsf} className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#FF9600]" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">CIL</label>
                  <RxInput label="OD Cilindro" value={odCil} onChange={setOdCil} className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#FF9600]" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">EJE</label>
                  <RxInput label="OD Eje" value={odEje} onChange={setOdEje} integer className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#FF9600]" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">ADD</label>
                  <RxInput label="OD ADD" value={odAdd} onChange={setOdAdd} className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#FF9600]" />
                </div>
              </div>
            </div>

            {/* OI */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#1CB0F6] text-white text-[10px] font-black px-2.5 py-1 rounded-full">OI</span>
                <span className="text-xs font-bold text-[#afafaf]">Ojo Izquierdo</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">ESF</label>
                  <RxInput label="OI Esfera" value={oiEsf} onChange={setOiEsf} className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#1CB0F6]" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">CIL</label>
                  <RxInput label="OI Cilindro" value={oiCil} onChange={setOiCil} className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#1CB0F6]" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">EJE</label>
                  <RxInput label="OI Eje" value={oiEje} onChange={setOiEje} integer className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#1CB0F6]" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1 text-center">ADD</label>
                  <RxInput label="OI ADD" value={oiAdd} onChange={setOiAdd} className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white focus:!border-[#1CB0F6]" />
                </div>
              </div>
            </div>

            {/* DIP + Lens Type + Optometrist */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1">DIP</label>
                <RxInput label="DIP" value={rxDip} onChange={setRxDip} integer className="!rounded-xl !border-2 !border-[#e5e5e5] !bg-white" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1">TIPO LENTE</label>
                <input type="text" value={rxLensType} onChange={(e) => setRxLensType(e.target.value)}
                  placeholder="Monofocal, Bifocal..."
                  className="w-full px-2.5 py-2 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-bold text-[#4b4b4b] placeholder:text-[#cdcdcd] focus:outline-none focus:border-[#FF9600] transition-colors text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-[#afafaf] uppercase block mb-1">OPTOMETRISTA</label>
                <input type="text" value={rxOptometrist} onChange={(e) => setRxOptometrist(e.target.value)}
                  placeholder="Dr. / Dra."
                  className="w-full px-2.5 py-2 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-bold text-[#4b4b4b] placeholder:text-[#cdcdcd] focus:outline-none focus:border-[#FF9600] transition-colors text-center"
                />
              </div>
            </div>

            {/* Uni/Par toggle */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex bg-[#e5e5e5] rounded-xl p-1 gap-0.5">
                <button onClick={() => setLensQty('uni')}
                  className={cn('px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all', lensQty === 'uni' ? 'bg-white text-[#4b4b4b] shadow-sm' : 'text-[#afafaf]')}>
                  Unidad
                </button>
                <button onClick={() => setLensQty('par')}
                  className={cn('px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all', lensQty === 'par' ? 'bg-white text-[#4b4b4b] shadow-sm' : 'text-[#afafaf]')}>
                  Par
                </button>
              </div>
            </div>

            {/* Material status line */}
            <p className="text-[10px] font-extrabold text-center text-[#afafaf] uppercase tracking-wider mb-3">
              {lensResults.length > 0 && !lensResults[0].isLab
                ? `SERIE ${lensResults[0].serie} — SELECCIONA MATERIAL`
                : 'PLANO (SIN MEDIDA) — SELECCIONA MATERIAL'}
            </p>

            {/* Material cards */}
            <div className="space-y-2.5">
              {lensResults.filter(r => !r.isLab).map((result, idx) => (
                <motion.button
                  key={result.material.code}
                  type="button"
                  onClick={() => addLensToCart(result)}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-[#e5e5e5] bg-white hover:border-[#FF9600]/50 hover:bg-[#FF9600]/5 transition-all text-left group"
                >
                  <span className="text-2xl shrink-0">{result.material.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm" style={{ color: result.material.color }}>{result.material.name}</p>
                    <p className="text-[11px] text-[#afafaf] leading-tight">{result.material.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-base text-[#FF4B4B]">
                      S/ {lensQty === 'par' ? result.pricePair : result.priceUnit}
                    </p>
                    <p className="text-[10px] text-[#afafaf] font-bold">el {lensQty === 'par' ? 'par' : 'uni'}</p>
                  </div>
                  <Plus size={18} className="text-[#e5e5e5] group-hover:text-[#FF9600] transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>

            {/* Save RX button */}
            {canSaveRx && (
              <div className="mt-4">
                <Btn3D
                  onClick={handleSaveRx}
                  disabled={savingRx}
                  color={rxSaved ? 'green' : 'amber'}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {savingRx ? <Loader2 size={16} className="animate-spin" /> : rxSaved ? <Check size={16} /> : <Save size={16} />}
                  {rxSaved ? 'Prescripcion Guardada' : 'Guardar Prescripcion'}
                </Btn3D>
              </div>
            )}
          </SectionCard>

          {/* ── C. PRODUCTS + CART ── */}
          <SectionCard
            icon={<Package size={18} />}
            title="Agrega Productos"
            color="blue"
            badge={cart.length > 0 ? (
              <span className="bg-[#1CB0F6] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            ) : undefined}
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#afafaf] pointer-events-none" />
              <input ref={productInputRef} type="text" value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                onFocus={() => { if (productResults.length > 0) setShowProductResults(true); }}
                placeholder="Buscar por nombre, codigo, marca..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-bold text-[#4b4b4b] placeholder:text-[#cdcdcd] focus:outline-none focus:border-[#1CB0F6] transition-colors"
              />
              <AnimatePresence>
                {showProductResults && productResults.length > 0 && (
                  <motion.div ref={productDropdownRef}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-52 overflow-y-auto rounded-xl border-2 border-[#e5e5e5] bg-white shadow-lg"
                  >
                    {productResults.map(product => (
                      <button key={product.id} onClick={() => addToCart(product)}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-[#1CB0F6]/5 border-b border-[#f0f0f0] last:border-b-0 transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#1CB0F6] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#4b4b4b] truncate">{product.name}</p>
                          <p className="text-[11px] text-[#afafaf]">{product.code} | Stock: {product.stock}</p>
                        </div>
                        <span className="text-sm font-black text-[#4b4b4b] shrink-0">{formatCurrency(product.salePrice)}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                <div className="space-y-2">
                  {cart.map(item => (
                    <motion.div key={item.product.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#f7f7f7] border-2 border-[#e5e5e5]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#4b4b4b] truncate">{item.product.name}</p>
                        <p className="text-[11px] text-[#afafaf] font-semibold">{formatCurrency(item.product.salePrice)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-8 h-8 rounded-xl bg-[#e5e5e5] hover:bg-[#d9d9d9] flex items-center justify-center transition-colors border-b-2 border-[#cdcdcd] active:border-b-0 active:mt-0.5">
                          <Minus className="w-3.5 h-3.5 text-[#777]" />
                        </button>
                        <span className="w-8 text-center text-sm font-black tabular-nums text-[#4b4b4b]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, +1)}
                          className="w-8 h-8 rounded-xl bg-[#1CB0F6] hover:bg-[#18a8ea] flex items-center justify-center transition-colors border-b-2 border-[#1899d6] active:border-b-0 active:mt-0.5 text-white">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-[#4b4b4b] w-20 text-right tabular-nums">
                        {formatCurrency(item.product.salePrice * item.quantity)}
                      </span>
                      <button onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 rounded-lg text-[#cdcdcd] hover:text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-[#e5e5e5]" />
                  <p className="text-sm font-bold text-[#cdcdcd]">El carrito esta vacio</p>
                  <p className="text-xs text-[#cdcdcd]">Busca productos o usa Lunas por Medida</p>
                </div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* ── D. PAYMENT ── */}
          <SectionCard icon={<Receipt size={18} />} title="Pago" color="coral">
            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#afafaf] font-bold">Subtotal</span>
                <span className="font-extrabold text-[#4b4b4b]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#afafaf] font-bold">Descuento</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#cdcdcd] text-xs font-bold">S/</span>
                  <input type="number" min={0} max={subtotal} step={1} value={discount || ''} placeholder="0"
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-right rounded-lg border-2 border-[#e5e5e5] bg-white px-2 py-1 text-sm font-extrabold text-[#4b4b4b] focus:outline-none focus:border-[#FF6B6B] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-dashed border-[#e5e5e5]">
                <span className="font-extrabold text-lg text-[#4b4b4b]">TOTAL</span>
                <motion.span key={total} initial={{ scale: 1.15, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="font-black text-3xl bg-gradient-to-r from-[#FF385C] to-[#E31C5F] bg-clip-text text-transparent">
                  {formatCurrency(total)}
                </motion.span>
              </div>
            </div>

            {/* Abono */}
            <div className="mb-4">
              <label className="text-[10px] font-extrabold text-[#afafaf] uppercase tracking-wider mb-2 block">A Cuenta</label>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#cdcdcd] text-sm font-bold">S/</span>
                  <input type="number" min={0} max={total} step={1} value={abono || ''} placeholder="0.00"
                    onChange={(e) => setAbono(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-[#e5e5e5] bg-white text-sm font-extrabold text-[#4b4b4b] focus:outline-none focus:border-[#FF6B6B] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <Btn3D onClick={() => setAbono(total)} color="gray" className="!py-2.5 !px-4 !text-xs">TOTAL</Btn3D>
              </div>
              {saldo > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF3CD] border-2 border-[#FFECB3]">
                  <AlertTriangle size={14} className="text-[#FF9600] shrink-0" />
                  <span className="text-xs font-extrabold text-[#FF9600]">Credito: saldo S/ {saldo.toFixed(2)}</span>
                </motion.div>
              )}
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <label className="text-[10px] font-extrabold text-[#afafaf] uppercase tracking-wider mb-2 block">Metodo de Pago</label>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all',
                      paymentMethod === pm.value
                        ? 'bg-[#4b4b4b] text-white border-[#4b4b4b] shadow-sm'
                        : 'bg-white text-[#afafaf] border-[#e5e5e5] hover:border-[#cdcdcd]',
                    )}
                  >
                    <span className="text-sm">{pm.emoji}</span>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document type */}
            <div className="mb-4">
              <label className="text-[10px] font-extrabold text-[#afafaf] uppercase tracking-wider mb-2 block">Tipo Documento</label>
              <div className="flex gap-1.5">
                {DOCUMENT_TYPES.map(dt => {
                  const Icon = dt.icon;
                  return (
                    <button key={dt.value} onClick={() => setDocumentType(dt.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all',
                        documentType === dt.value
                          ? 'bg-[#4b4b4b] text-white border-[#4b4b4b] shadow-sm'
                          : 'bg-white text-[#afafaf] border-[#e5e5e5] hover:border-[#cdcdcd]',
                      )}
                    >
                      <Icon size={14} />
                      {dt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── E. CONFIRM CTA ── */}
            <PremiumCTA
              state={ctaState}
              onClick={handleConfirmSale}
              disabled={cart.length === 0}
              successText="Venta Registrada!"
              errorText="Error al registrar"
            >
              <ShoppingCart size={20} />
              <span>Confirmar Venta &mdash; {formatCurrency(total)}</span>
            </PremiumCTA>
          </SectionCard>
        </div>

        {/* ═══════════════════════════════════
            RIGHT: RECENT SALES
            ═══════════════════════════════════ */}
        <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-[#e5e5e5] p-3 lg:p-4 lg:overflow-y-auto bg-gradient-to-b from-[#f7f7f7] to-[#f0f0f0]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#58CC02] to-[#46a302] flex items-center justify-center shadow-sm">
              <Receipt size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#4b4b4b] text-sm leading-tight">Ventas Recientes</h3>
              <p className="text-[10px] font-bold text-[#afafaf]">{recentSales.length} venta{recentSales.length !== 1 ? 's' : ''} hoy</p>
            </div>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#e5e5e5] flex items-center justify-center">
                <Receipt size={28} className="text-[#cdcdcd]" />
              </div>
              <p className="font-extrabold text-[#cdcdcd] text-sm">Sin ventas todavia</p>
              <p className="text-xs text-[#cdcdcd] mt-0.5">Crea tu primera venta</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => {
                const isExpanded = expandedSale === sale.id;
                const isPaid = sale.status === 'completed';
                const isPending = sale.status === 'pending';

                return (
                  <div key={sale.id} className="bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden shadow-[0_1px_0_#e5e5e5]">
                    <button
                      onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                      className="w-full p-3 flex items-center gap-3 text-left hover:bg-[#f7f7f7] transition-colors"
                    >
                      <div className={cn('w-2 h-10 rounded-full shrink-0', isPaid ? 'bg-[#58CC02]' : isPending ? 'bg-[#FF9600]' : 'bg-[#FF4B4B]')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-[#4b4b4b] truncate">{sale.patientName || 'CLIENTE EVENTUAL'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#afafaf] font-semibold">{sale.items.length} item{sale.items.length !== 1 ? 's' : ''} — {formatDate(sale.date)}</span>
                        </div>
                        {isPending && sale.saldo != null && sale.saldo > 0 && (
                          <span className="text-[10px] font-extrabold text-[#FF4B4B]">Saldo: {formatCurrency(sale.saldo)}</span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-sm text-[#4b4b4b]">{formatCurrency(sale.total)}</p>
                        <span className={cn(
                          'text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5',
                          isPaid ? 'bg-[#58CC02]/15 text-[#58CC02]' : isPending ? 'bg-[#FF9600]/15 text-[#FF9600]' : 'bg-[#FF4B4B]/15 text-[#FF4B4B]',
                        )}>
                          {isPaid ? 'Pagado' : isPending ? 'Pendiente' : 'Cancelado'}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-3 pb-3 border-t-2 border-[#f0f0f0]">
                            <div className="mt-2.5 space-y-1">
                              {sale.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-[#777] font-semibold">{item.quantity}x {item.productName}</span>
                                  <span className="font-bold text-[#4b4b4b]">{formatCurrency(item.subtotal)}</span>
                                </div>
                              ))}
                            </div>
                            {sale.discount > 0 && (
                              <div className="flex justify-between text-xs mt-1 text-[#FF4B4B]">
                                <span>Descuento</span><span>-{formatCurrency(sale.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-black text-[#4b4b4b] mt-1.5 pt-1.5 border-t border-[#f0f0f0]">
                              <span>Total</span><span>{formatCurrency(sale.total)}</span>
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-[#afafaf] font-semibold">
                              {sale.sellerName && <span>Vendedor: <b className="text-[#777]">{sale.sellerName}</b></span>}
                              {sale.paymentMethod && <span>Pago: <b className="text-[#777]">{sale.paymentMethod}</b></span>}
                            </div>

                            {/* Action buttons — 3D style */}
                            <div className="grid grid-cols-4 gap-1.5 mt-3">
                              <button onClick={async () => {
                                const p = findPatientForSale(sale);
                                let rx = null;
                                if (p) { try { const rxs = await fetchPrescriptions(p.id); rx = rxs[0] || null; } catch {} }
                                printSaleBundle(sale, p, rx);
                              }}
                                className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#f7f7f7] border-2 border-[#e5e5e5] border-b-[3px] active:border-b-2 active:mt-[1px] text-[#4b4b4b] hover:bg-[#f0f0f0] transition-all">
                                <Printer size={16} className="text-[#58CC02]" />
                                <span className="text-[10px] font-extrabold">Ticket</span>
                              </button>
                              <button onClick={() => printSaleNote(sale, findPatientForSale(sale))}
                                className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#f7f7f7] border-2 border-[#e5e5e5] border-b-[3px] active:border-b-2 active:mt-[1px] text-[#4b4b4b] hover:bg-[#f0f0f0] transition-all">
                                <FileText size={16} className="text-[#1CB0F6]" />
                                <span className="text-[10px] font-extrabold">Nota</span>
                              </button>
                              <button onClick={async () => {
                                const p = findPatientForSale(sale);
                                let rx = null;
                                if (p) { try { const rxs = await fetchPrescriptions(p.id); rx = rxs[0] || null; } catch {} }
                                downloadSaleBundlePdf(sale, p, rx);
                              }}
                                className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#f7f7f7] border-2 border-[#e5e5e5] border-b-[3px] active:border-b-2 active:mt-[1px] text-[#4b4b4b] hover:bg-[#f0f0f0] transition-all">
                                <Download size={16} className="text-[#FF9600]" />
                                <span className="text-[10px] font-extrabold">PDF</span>
                              </button>
                              {sale.patientName && (
                                <button onClick={() => sendTicketWhatsApp(sale, findPatientForSale(sale)).catch(() => {})}
                                  className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#25D366]/10 border-2 border-[#25D366]/20 border-b-[3px] active:border-b-2 active:mt-[1px] text-[#25D366] hover:bg-[#25D366]/15 transition-all">
                                  <WhatsAppIcon size={16} />
                                  <span className="text-[10px] font-extrabold">WhatsApp</span>
                                </button>
                              )}
                            </div>
                            {/* Cancel sale button */}
                            {sale.status !== 'cancelled' && (
                              <button
                                onClick={async () => {
                                  if (!confirm('¿Cancelar esta venta? Se restaurará el stock.')) return;
                                  try {
                                    await cancelSale(sale.id);
                                    const [newSales, newProds] = await Promise.all([fetchSales(30), fetchProducts()]);
                                    setRecentSales(newSales);
                                    setProducts(newProds);
                                  } catch (err) { console.error('Error cancelling sale:', err); }
                                }}
                                className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FF4B4B]/10 border-2 border-[#FF4B4B]/20 border-b-[3px] active:border-b-2 active:mt-[1px] text-[#FF4B4B] hover:bg-[#FF4B4B]/15 transition-all text-xs font-extrabold"
                              >
                                <X size={14} />
                                Cancelar Venta
                              </button>
                            )}
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
