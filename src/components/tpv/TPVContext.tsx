import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  fetchProducts, fetchSales, createSale, searchProducts, onDataChange,
  calculateLensPrices, getLensMaterials, printSaleTicket, printSaleNote, printSaleBundle, sendTicketWhatsApp, downloadTicketPdf,
  fetchPatients, searchPatients, fetchPrescriptions, createPrescription, updatePatient, createPatient,
} from '../../lib/services';
import type {
  Product, Sale, SaleItem, UserProfile, PaymentMethod, DocumentType, ProductCategory, Patient, Prescription,
} from '../../types';
import type { LensPriceResult } from '../../lib/services';

// ══════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════

export interface CartItem {
  product: Product;
  quantity: number;
}

export type TPVStep = 'monturas' | 'lunas_rx' | 'accesorios' | 'pagar' | 'listo';

interface TPVContextValue {
  // Step wizard
  currentStep: TPVStep;
  setCurrentStep: (step: TPVStep) => void;
  goNextStep: () => void;

  // New client
  handleCreateNewClient: () => Promise<void>;

  // Products
  allProducts: Product[];
  productsLoading: boolean;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  searchResults: Product[];
  categoryFilter: ProductCategory | 'all' | 'favorites';
  setCategoryFilter: (c: ProductCategory | 'all' | 'favorites') => void;
  filteredProducts: Product[];

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  addLensToCart: (result: LensPriceResult) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  lastAddedProduct: string;

  // Financials
  discount: number;
  setDiscount: (d: number) => void;
  abono: number;
  setAbono: (a: number) => void;
  subtotal: number;
  discountAmount: number;
  total: number;
  saldo: number;
  estadoPago: 'completed' | 'pending';

  // Payment
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  documentType: DocumentType;
  setDocumentType: (d: DocumentType) => void;

  // Client
  selectedPatient: Patient | null;
  setSelectedPatient: (p: Patient | null) => void;
  allPatients: Patient[];
  patientSearchTerm: string;
  setPatientSearchTerm: (t: string) => void;
  patientResults: Patient[];
  showPatientResults: boolean;
  setShowPatientResults: (s: boolean) => void;
  patientName: string;
  setPatientName: (n: string) => void;
  patientPhone: string;
  setPatientPhone: (p: string) => void;
  clearPatient: () => void;
  patientRef: React.RefObject<HTMLDivElement | null>;

  // RX / Lens
  odEsf: number; setOdEsf: (v: number) => void;
  odCil: number; setOdCil: (v: number) => void;
  odEje: number; setOdEje: (v: number) => void;
  odAdd: number; setOdAdd: (v: number) => void;
  oiEsf: number; setOiEsf: (v: number) => void;
  oiCil: number; setOiCil: (v: number) => void;
  oiEje: number; setOiEje: (v: number) => void;
  oiAdd: number; setOiAdd: (v: number) => void;
  rxDip: number; setRxDip: (v: number) => void;
  rxLensType: string; setRxLensType: (v: string) => void;
  rxOptometrist: string; setRxOptometrist: (v: string) => void;
  lensResults: LensPriceResult[];
  lensQty: 'uni' | 'par';
  setLensQty: (q: 'uni' | 'par') => void;
  showLensModal: boolean;
  setShowLensModal: (s: boolean) => void;
  savingRx: boolean;
  rxSaved: boolean;
  handleSavePrescription: () => Promise<void>;
  patientRxHistory: Prescription[];
  loadingRx: boolean;

  // Sale lifecycle
  submitting: boolean;
  ctaState: 'idle' | 'loading' | 'success' | 'error';
  successMessage: string;
  errorMessage: string;
  lastSale: Sale | null;
  lastSalePatient: Patient | null;
  lastSaleRx: Prescription | null;
  handleConfirmSale: () => Promise<void>;
  resetSale: () => void;

  // Recent sales
  recentSales: Sale[];

  // Print actions
  printTicket: (sale: Sale, patient?: Patient | null) => void;
  printNote: (sale: Sale, patient?: Patient | null, rx?: Prescription | null) => void;
  printBundle: (sale: Sale, patient?: Patient | null, rx?: Prescription | null) => void;
  downloadPdf: (sale: Sale, patient?: Patient | null) => void;
  sendWhatsApp: (sale: Sale, patient?: Patient | null) => Promise<void>;

  // User
  user: UserProfile;

  // Format helper
  fv: (v: number) => string;
}

const TPVContext = createContext<TPVContextValue | null>(null);

export function useTPV() {
  const ctx = useContext(TPVContext);
  if (!ctx) throw new Error('useTPV must be used within TPVProvider');
  return ctx;
}

// ══════════════════════════════════════════
// STEP ORDER
// ══════════════════════════════════════════

const STEP_ORDER: TPVStep[] = ['monturas', 'lunas_rx', 'accesorios', 'pagar', 'listo'];

// ══════════════════════════════════════════
// PROVIDER
// ══════════════════════════════════════════

export function TPVProvider({ user, children }: { user: UserProfile; children: React.ReactNode }) {
  // ── Step wizard ──
  const [currentStep, setCurrentStep] = useState<TPVStep>('monturas');

  const goNextStep = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep);
    if (idx < STEP_ORDER.length - 1) {
      const next = STEP_ORDER[idx + 1];
      if (next === 'lunas_rx') {
        setShowLensModal(true);
        setCurrentStep('lunas_rx');
      } else {
        setCurrentStep(next);
      }
    }
  }, [currentStep]);

  // ── Products ──
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all' | 'favorites'>('all');

  // ── Recent sales ──
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  // ── Cart ──
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAddedProduct, setLastAddedProduct] = useState('');

  // ── Financials ──
  const [discount, setDiscount] = useState(0);
  const [abono, setAbono] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [documentType, setDocumentType] = useState<DocumentType>('boleta');

  // ── Patient ──
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const patientRef = useRef<HTMLDivElement>(null);

  // ── RX / Lens ──
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
  const [lensResults, setLensResults] = useState<LensPriceResult[]>([]);
  const [lensQty, setLensQty] = useState<'uni' | 'par'>('par');
  const [showLensModal, setShowLensModal] = useState(false);
  const [savingRx, setSavingRx] = useState(false);
  const [rxSaved, setRxSaved] = useState(false);
  const [patientRxHistory, setPatientRxHistory] = useState<Prescription[]>([]);
  const [loadingRx, setLoadingRx] = useState(false);

  // ── Sale lifecycle ──
  const [submitting, setSubmitting] = useState(false);
  const [ctaState, setCtaState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [lastSalePatient, setLastSalePatient] = useState<Patient | null>(null);
  const [lastSaleRx, setLastSaleRx] = useState<Prescription | null>(null);

  // ══════════════════════════════════════════
  // DATA FETCHING
  // ══════════════════════════════════════════

  const refreshProducts = useCallback(async () => {
    try {
      const products = await fetchProducts();
      setAllProducts(products);
      setProductsLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, []);

  const refreshSales = useCallback(async () => {
    try {
      const sales = await fetchSales(10);
      setRecentSales(sales);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  }, []);

  const refreshPatients = useCallback(async () => {
    try {
      const patients = await fetchPatients();
      setAllPatients(patients);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([refreshProducts(), refreshSales(), refreshPatients()])
      .finally(() => setProductsLoading(false));
  }, [refreshProducts, refreshSales, refreshPatients]);

  // ── Realtime subscriptions ──
  useEffect(() => {
    const unsubs = [
      onDataChange('ventas', () => refreshSales()),
      onDataChange('productos', () => refreshProducts()),
      onDataChange('clientes', () => refreshPatients()),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [refreshSales, refreshProducts, refreshPatients]);

  // ── Search products ──
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setSearchResults(searchProducts(searchTerm, allProducts));
  }, [searchTerm, allProducts]);

  // ── Patient search ──
  useEffect(() => {
    if (patientSearchTerm.trim().length === 0) {
      setPatientResults([]);
      setShowPatientResults(false);
      return;
    }
    setPatientResults(searchPatients(patientSearchTerm, allPatients).slice(0, 8));
    setShowPatientResults(true);
  }, [patientSearchTerm, allPatients]);

  // ── Fetch prescriptions when patient selected ──
  useEffect(() => {
    if (!selectedPatient) {
      setPatientRxHistory([]);
      return;
    }
    setLoadingRx(true);
    fetchPrescriptions(selectedPatient.id).then(rxs => {
      setPatientRxHistory(rxs);
      if (rxs.length > 0) {
        const latest = rxs[0];
        setOdEsf(latest.od.sph);
        setOdCil(latest.od.cyl);
        setOdEje(latest.od.axis);
        setOdAdd(latest.od.add);
        setOiEsf(latest.oi.sph);
        setOiCil(latest.oi.cyl);
        setOiEje(latest.oi.axis);
        setOiAdd(latest.oi.add);
        setRxDip(latest.dip || 0);
        setRxLensType(latest.lensType || '');
        setRxOptometrist(latest.optometrist || '');
        setLastSaleRx(latest);
      }
      setLoadingRx(false);
    }).catch(() => setLoadingRx(false));
  }, [selectedPatient]);

  // ── Lens price calculation ──
  useEffect(() => {
    if (!showLensModal) return;
    setLensResults(calculateLensPrices(odEsf, odCil, oiEsf, oiCil));
  }, [odEsf, odCil, oiEsf, oiCil, showLensModal]);

  // Auto-select category tab when step changes
  useEffect(() => {
    if (currentStep === 'monturas') setCategoryFilter('frame');
    else if (currentStep === 'accesorios') setCategoryFilter('accessory');
    else if (currentStep === 'pagar' || currentStep === 'listo') setCategoryFilter('all');
  }, [currentStep]);

  // ══════════════════════════════════════════
  // FILTERED PRODUCTS
  // ══════════════════════════════════════════

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Step-based auto-filtering
    if (currentStep === 'monturas' && categoryFilter === 'all') {
      filtered = allProducts.filter(p => p.category === 'frame');
    } else if (currentStep === 'accesorios' && categoryFilter === 'all') {
      filtered = allProducts.filter(p => ['accessory', 'solution', 'contactLens', 'other'].includes(p.category));
    } else if (categoryFilter === 'favorites') {
      // Favorites = products that appear most in recent sales
      const freqMap = new Map<string, number>();
      recentSales.forEach(s => s.items.forEach(item => {
        freqMap.set(item.productId, (freqMap.get(item.productId) || 0) + 1);
      }));
      const topIds = [...freqMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0]);
      filtered = allProducts.filter(p => topIds.includes(p.id));
    } else if (categoryFilter !== 'all') {
      filtered = allProducts.filter(p => p.category === categoryFilter);
    }

    // Search within filtered
    if (searchTerm.trim()) {
      filtered = searchProducts(searchTerm, filtered);
    }

    return filtered;
  }, [allProducts, categoryFilter, currentStep, searchTerm, recentSales]);

  // ══════════════════════════════════════════
  // CART HELPERS
  // ══════════════════════════════════════════

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
    setLastAddedProduct(product.name);
    setSearchTerm('');
  }, []);

  const addLensToCart = useCallback((result: LensPriceResult) => {
    const price = lensQty === 'par' ? result.pricePair : result.priceUnit;
    const lensProduct: Product = {
      id: `luna-${result.material.code}-${Date.now()}`,
      code: `LUNA-${result.material.code.toUpperCase()}`,
      name: `Luna ${result.material.shortName} ${result.serie === 1 && odEsf === 0 && odCil === 0 && oiEsf === 0 && oiCil === 0 ? 'Plano' : `S${result.serie}`} (${lensQty === 'par' ? 'Par' : 'Uni'})`,
      category: 'lens',
      costPrice: 0,
      salePrice: price,
      stock: 999,
      stockMin: 0,
      status: 'active',
    };
    setCart(prev => [...prev, { product: lensProduct, quantity: 1 }]);
    setLastAddedProduct(lensProduct.name);
  }, [lensQty, odEsf, odCil, oiEsf, oiCil]);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0 || newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      })
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ══════════════════════════════════════════
  // CALCULATIONS
  // ══════════════════════════════════════════

  const subtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  const discountAmount = Math.min(discount, subtotal);
  const total = Math.round((subtotal - discountAmount) * 100) / 100;
  const saldo = Math.max(0, Math.round((total - abono) * 100) / 100);
  const estadoPago: 'completed' | 'pending' = saldo <= 0 ? 'completed' : 'pending';

  // ══════════════════════════════════════════
  // CLEAR PATIENT
  // ══════════════════════════════════════════

  const clearPatient = useCallback(() => {
    setSelectedPatient(null);
    setPatientSearchTerm('');
    setPatientName('');
    setPatientPhone('');
    setPatientRxHistory([]);
    setOdEsf(0); setOdCil(0); setOdEje(0); setOdAdd(0);
    setOiEsf(0); setOiCil(0); setOiEje(0); setOiAdd(0);
    setRxDip(0); setRxLensType(''); setRxOptometrist('');
    setLensResults([]);
    setRxSaved(false);
  }, []);

  // ══════════════════════════════════════════
  // CREATE NEW CLIENT (inline)
  // ══════════════════════════════════════════

  const handleCreateNewClient = useCallback(async () => {
    const name = patientSearchTerm.trim() || patientName.trim();
    if (!name) return;
    try {
      const newId = await createPatient({
        name: name.toUpperCase(),
        dni: '',
        phone: patientPhone.trim() || undefined,
        isVIP: false,
      });
      const newPatient: Patient = {
        id: newId,
        name: name.toUpperCase(),
        dni: '',
        isVIP: false,
        phone: patientPhone.trim() || undefined,
      };
      setSelectedPatient(newPatient);
      setPatientName(name.toUpperCase());
      setPatientSearchTerm('');
      setShowPatientResults(false);
      refreshPatients();
    } catch (err) {
      console.error('Error creating new client:', err);
    }
  }, [patientSearchTerm, patientName, patientPhone, refreshPatients]);

  // ══════════════════════════════════════════
  // SAVE PRESCRIPTION
  // ══════════════════════════════════════════

  const handleSavePrescription = useCallback(async () => {
    let patientForRx = selectedPatient;

    if (!patientForRx && patientName.trim()) {
      setSavingRx(true);
      try {
        const newId = await createPatient({
          name: patientName.trim().toUpperCase(),
          dni: '',
          phone: patientPhone.trim() || undefined,
          isVIP: false,
        });
        patientForRx = { id: newId, name: patientName.trim().toUpperCase(), dni: '', isVIP: false, phone: patientPhone.trim() || undefined };
        setSelectedPatient(patientForRx);
      } catch (err) {
        console.error('Error creating patient for RX:', err);
        setSavingRx(false);
        return;
      }
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
      const rxs = await fetchPrescriptions(patientForRx.id);
      setPatientRxHistory(rxs);
      if (rxs.length > 0) setLastSaleRx(rxs[0]);
      setRxSaved(true);
      setTimeout(() => setRxSaved(false), 3000);
    } catch (err) {
      console.error('Error saving prescription:', err);
    } finally {
      setSavingRx(false);
    }
  }, [selectedPatient, patientName, patientPhone, odEsf, odCil, odEje, odAdd, oiEsf, oiCil, oiEje, oiAdd, rxDip, rxLensType, rxOptometrist]);

  // ══════════════════════════════════════════
  // CONFIRM SALE
  // ══════════════════════════════════════════

  const handleConfirmSale = useCallback(async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setCtaState('loading');
    setErrorMessage('');
    setSuccessMessage('');

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

      const saleData: Omit<Sale, 'id'> = {
        date: new Date().toISOString(),
        patientId: selectedPatient?.id,
        patientName: selectedPatient?.name || patientName.trim() || undefined,
        items: saleItems,
        subtotal,
        discount: discountAmount,
        igv: 0,
        total,
        abono: abono > 0 ? abono : total,
        saldo,
        paymentMethod,
        documentType,
        sellerId: user.uid,
        sellerName: user.name,
        establecimiento: user.establecimiento,
        status: estadoPago,
      };

      let salePatient = selectedPatient;
      const phone = patientPhone.trim();
      if (!salePatient && patientName.trim()) {
        try {
          const newId = await createPatient({
            name: patientName.trim().toUpperCase(),
            dni: '',
            phone: phone || undefined,
            isVIP: false,
          });
          salePatient = { id: newId, name: patientName.trim().toUpperCase(), dni: '', isVIP: false, phone: phone || undefined };
          saleData.patientId = newId;
          saleData.patientName = salePatient.name;
        } catch (e) { console.warn('Auto-create patient failed:', e); }
      } else if (salePatient && phone && phone !== salePatient.phone) {
        await updatePatient(salePatient.id, { phone }).catch(() => {});
      }

      await createSale(saleData);

      const hasRx = odEsf !== 0 || odCil !== 0 || odAdd !== 0 || oiEsf !== 0 || oiCil !== 0 || oiAdd !== 0;
      if (hasRx && salePatient) {
        try {
          await createPrescription(salePatient.id, {
            od: { sph: odEsf, cyl: odCil, axis: odEje, add: odAdd },
            oi: { sph: oiEsf, cyl: oiCil, axis: oiEje, add: oiAdd },
            dip: rxDip,
            lensType: rxLensType || undefined,
            optometrist: rxOptometrist || undefined,
          });
          const rxs = await fetchPrescriptions(salePatient.id);
          if (rxs.length > 0) setLastSaleRx(rxs[0]);
        } catch (e) { console.warn('Auto-save RX failed:', e); }
      }

      const sales = await fetchSales(10);
      setRecentSales(sales);
      refreshProducts();

      const savedSale = { id: sales[0]?.id || 'temp', ...saleData } as Sale;
      setLastSale(savedSale);
      setLastSalePatient(salePatient);

      // Reset
      setCart([]);
      setDiscount(0);
      setAbono(0);
      setPatientName('');
      setPatientPhone('');
      setPatientSearchTerm('');
      setSelectedPatient(null);
      setPatientRxHistory([]);
      setOdEsf(0); setOdCil(0); setOdEje(0); setOdAdd(0);
      setOiEsf(0); setOiCil(0); setOiEje(0); setOiAdd(0);
      setRxDip(0); setRxLensType(''); setRxOptometrist('');
      setShowLensModal(false);
      setLensResults([]);
      setRxSaved(false);
      setPaymentMethod('cash');
      setDocumentType('boleta');
      setCtaState('success');
      setSuccessMessage('Venta registrada exitosamente');
      setCurrentStep('listo');

      setTimeout(() => { setSuccessMessage(''); setLastSale(null); setLastSalePatient(null); setCtaState('idle'); }, 8000);
    } catch (err: any) {
      console.error('Error creating sale:', err);
      setCtaState('error');
      setErrorMessage(err?.message || 'Error al registrar la venta.');
      setTimeout(() => { setErrorMessage(''); setCtaState('idle'); }, 5000);
    } finally {
      setSubmitting(false);
    }
  }, [cart, selectedPatient, patientName, patientPhone, subtotal, discountAmount, total, abono, saldo, paymentMethod, documentType, estadoPago, user, odEsf, odCil, odEje, odAdd, oiEsf, oiCil, oiEje, oiAdd, rxDip, rxLensType, rxOptometrist, refreshProducts]);

  // ══════════════════════════════════════════
  // RESET SALE
  // ══════════════════════════════════════════

  const resetSale = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setAbono(0);
    setPatientName('');
    setPatientPhone('');
    setPatientSearchTerm('');
    setSelectedPatient(null);
    setPatientRxHistory([]);
    setOdEsf(0); setOdCil(0); setOdEje(0); setOdAdd(0);
    setOiEsf(0); setOiCil(0); setOiEje(0); setOiAdd(0);
    setRxDip(0); setRxLensType(''); setRxOptometrist('');
    setShowLensModal(false);
    setLensResults([]);
    setRxSaved(false);
    setPaymentMethod('cash');
    setDocumentType('boleta');
    setSuccessMessage('');
    setErrorMessage('');
    setLastSale(null);
    setLastSalePatient(null);
    setLastSaleRx(null);
    setCtaState('idle');
    setCurrentStep('monturas');
    setLastAddedProduct('');
  }, []);

  // ── Format helper ──
  const fv = useCallback((v: number) => (v >= 0 ? '+' : '') + v.toFixed(2), []);

  // ── Print helpers ──
  const printTicket = useCallback((sale: Sale, patient?: Patient | null) => {
    printSaleTicket(sale, patient ?? undefined);
  }, []);

  const printNote = useCallback((sale: Sale, patient?: Patient | null, rx?: Prescription | null) => {
    printSaleNote(sale, patient ?? undefined, rx ?? undefined);
  }, []);

  const printBundle = useCallback((sale: Sale, patient?: Patient | null, rx?: Prescription | null) => {
    printSaleBundle(sale, patient ?? undefined, rx ?? undefined);
  }, []);

  const downloadPdf = useCallback((sale: Sale, patient?: Patient | null) => {
    downloadTicketPdf(sale, patient ?? undefined);
  }, []);

  const sendWhatsApp = useCallback(async (sale: Sale, patient?: Patient | null) => {
    await sendTicketWhatsApp(sale, patient ?? undefined);
  }, []);

  // ══════════════════════════════════════════
  // CONTEXT VALUE
  // ══════════════════════════════════════════

  const value = useMemo<TPVContextValue>(() => ({
    currentStep, setCurrentStep, goNextStep, handleCreateNewClient,
    allProducts, productsLoading, searchTerm, setSearchTerm, searchResults, categoryFilter, setCategoryFilter, filteredProducts,
    cart, addToCart, addLensToCart, updateQuantity, removeFromCart, clearCart, lastAddedProduct,
    discount, setDiscount, abono, setAbono, subtotal, discountAmount, total, saldo, estadoPago,
    paymentMethod, setPaymentMethod, documentType, setDocumentType,
    selectedPatient, setSelectedPatient, allPatients, patientSearchTerm, setPatientSearchTerm,
    patientResults, showPatientResults, setShowPatientResults, patientName, setPatientName,
    patientPhone, setPatientPhone, clearPatient, patientRef,
    odEsf, setOdEsf, odCil, setOdCil, odEje, setOdEje, odAdd, setOdAdd,
    oiEsf, setOiEsf, oiCil, setOiCil, oiEje, setOiEje, oiAdd, setOiAdd,
    rxDip, setRxDip, rxLensType, setRxLensType, rxOptometrist, setRxOptometrist,
    lensResults, lensQty, setLensQty, showLensModal, setShowLensModal,
    savingRx, rxSaved, handleSavePrescription, patientRxHistory, loadingRx,
    submitting, ctaState, successMessage, errorMessage, lastSale, lastSalePatient, lastSaleRx,
    handleConfirmSale, resetSale,
    recentSales,
    printTicket, printNote, printBundle, downloadPdf, sendWhatsApp,
    user, fv,
  }), [
    currentStep, goNextStep, handleCreateNewClient,
    allProducts, productsLoading, searchTerm, searchResults, categoryFilter, filteredProducts,
    cart, addToCart, addLensToCart, updateQuantity, removeFromCart, clearCart, lastAddedProduct,
    discount, abono, subtotal, discountAmount, total, saldo, estadoPago,
    paymentMethod, documentType,
    selectedPatient, allPatients, patientSearchTerm, patientResults, showPatientResults,
    patientName, patientPhone, clearPatient,
    odEsf, odCil, odEje, odAdd, oiEsf, oiCil, oiEje, oiAdd,
    rxDip, rxLensType, rxOptometrist,
    lensResults, lensQty, showLensModal, savingRx, rxSaved,
    handleSavePrescription, patientRxHistory, loadingRx,
    submitting, ctaState, successMessage, errorMessage,
    lastSale, lastSalePatient, lastSaleRx,
    handleConfirmSale, resetSale, recentSales,
    printTicket, printNote, printBundle, downloadPdf, sendWhatsApp,
    user, fv,
  ]);

  return <TPVContext.Provider value={value}>{children}</TPVContext.Provider>;
}
