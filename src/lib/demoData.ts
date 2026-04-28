import type { Patient, Consultation, Prescription, Product, Sale, InventoryItem, DashboardStats } from '../types';

// ══════════════════════════════════════════
// LOCAL STORAGE PERSISTENCE ENGINE
// ══════════════════════════════════════════

const STORAGE_PREFIX = 'oa_';
const KEYS = {
  patients: `${STORAGE_PREFIX}patients`,
  consultations: `${STORAGE_PREFIX}consultations`,
  prescriptions: `${STORAGE_PREFIX}prescriptions`,
  products: `${STORAGE_PREFIX}products`,
  sales: `${STORAGE_PREFIX}sales`,
  lensInventory: `${STORAGE_PREFIX}lensInventory`,
  idCounter: `${STORAGE_PREFIX}idCounter`,
  seeded: `${STORAGE_PREFIX}seeded`,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota exceeded */ }
}

// ══════════════════════════════════════════
// DEFAULT SEED DATA
// ══════════════════════════════════════════

const DEFAULT_PATIENTS: Patient[] = [
  { id: 'd1', name: 'Elena Rodriguez Salas', dni: '48291004', phone: '984123456', address: 'Av. Cusco 234, Sicuani', birthDate: '1985-03-15', isVIP: true, createdAt: '2025-01-10T08:00:00.000Z' },
  { id: 'd2', name: 'Carlos Mendoza Quispe', dni: '34552129', phone: '976543210', address: 'Jr. Lima 567, Sicuani', birthDate: '1972-08-22', isVIP: false, createdAt: '2025-02-14T10:30:00.000Z' },
  { id: 'd3', name: 'Maria Huaman Flores', dni: '42876543', phone: '951234567', address: 'Calle Sol 89, Espinar', birthDate: '1990-11-07', isVIP: true, createdAt: '2025-03-01T09:15:00.000Z' },
  { id: 'd4', name: 'Jose Quispe Mamani', dni: '31234567', phone: '962345678', address: 'Av. Arequipa 123, Sicuani', birthDate: '1968-05-30', isVIP: false, createdAt: '2025-03-20T14:00:00.000Z' },
  { id: 'd5', name: 'Ana Torres Vilca', dni: '45678901', phone: '973456789', address: 'Jr. Puno 456, Sicuani', birthDate: '1995-01-12', isVIP: false, createdAt: '2025-04-02T11:00:00.000Z' },
];

const DEFAULT_CONSULTATIONS: Record<string, Consultation[]> = {
  d1: [{ id: 'c1', patientId: 'd1', date: new Date().toISOString(), reason: 'Control anual de vision', medicalHistory: 'Usa lentes desde los 15 anos. Sin antecedentes quirurgicos oculares.', diagnosis: { myopia: true, astigmatism: true, hyperopia: false, presbyopia: false, amblyopia: false }, diagnosisTags: ['Miopia', 'Astigmatismo'], optometrist: 'Dr. Junior Mendoza', notes: 'Paciente refiere vision borrosa lejana. Se recomienda actualizacion de lentes.' }],
  d2: [{ id: 'c2', patientId: 'd2', date: new Date(Date.now() - 86400000).toISOString(), reason: 'Dolor de cabeza frecuente', medicalHistory: 'Hipertenso controlado. Diabetes tipo 2.', diagnosis: { myopia: false, astigmatism: false, hyperopia: true, presbyopia: true, amblyopia: false }, diagnosisTags: ['Hipermetropia', 'Presbicia'], optometrist: 'Dr. Junior Mendoza', notes: 'Requiere lentes progresivos. Control en 6 meses por condicion diabetica.' }],
  d3: [{ id: 'c3', patientId: 'd3', date: new Date().toISOString(), reason: 'Primera consulta - derivada de oftalmologo', diagnosis: { myopia: true, astigmatism: false, hyperopia: false, presbyopia: false, amblyopia: false }, diagnosisTags: ['Miopia'], optometrist: 'Dr. Junior Mendoza', notes: 'Miopia moderada bilateral. Se sugiere lentes Hi-Index por graduacion alta.' }],
};

const DEFAULT_PRESCRIPTIONS: Record<string, Prescription[]> = {
  d1: [{ id: 'rx1', patientId: 'd1', date: new Date().toISOString(), od: { sph: -2.75, cyl: -0.50, axis: 165, add: 0 }, oi: { sph: -3.00, cyl: -0.75, axis: 15, add: 0 }, dip: 63, lensType: 'Monofocal', material: 'CR-39', treatments: ['Antireflejo', 'UV'], optometrist: 'Dr. Junior Mendoza' }],
  d2: [{ id: 'rx2', patientId: 'd2', date: new Date(Date.now() - 86400000).toISOString(), od: { sph: 1.50, cyl: -0.25, axis: 90, add: 2.00 }, oi: { sph: 1.75, cyl: -0.50, axis: 85, add: 2.00 }, dip: 65, lensType: 'Progresivo', material: 'Policarbonato', treatments: ['Antireflejo', 'Blue Filter'], optometrist: 'Dr. Junior Mendoza' }],
  d3: [{ id: 'rx3', patientId: 'd3', date: new Date().toISOString(), od: { sph: -4.00, cyl: 0, axis: 0, add: 0 }, oi: { sph: -3.75, cyl: 0, axis: 0, add: 0 }, dip: 60, lensType: 'Monofocal', material: 'Hi-Index 1.67', treatments: ['Antireflejo', 'Fotocromatico'], optometrist: 'Dr. Junior Mendoza' }],
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', code: 'ARM-001', name: 'Versace VE3281', brand: 'Versace', model: 'VE3281', color: 'Negro', category: 'frame', material: 'Acetato', costPrice: 180, salePrice: 285, stock: 4, stockMin: 2, status: 'active' },
  { id: 'p2', code: 'ARM-002', name: 'Ray-Ban RB5154', brand: 'Ray-Ban', model: 'RB5154', color: 'Carey', category: 'frame', material: 'Metal/Acetato', costPrice: 120, salePrice: 195, stock: 8, stockMin: 3, status: 'active' },
  { id: 'p3', code: 'ARM-003', name: 'Oakley OX8046', brand: 'Oakley', model: 'OX8046', color: 'Negro Mate', category: 'frame', material: 'O-Matter', costPrice: 150, salePrice: 240, stock: 3, stockMin: 2, status: 'active' },
  { id: 'p4', code: 'ARM-004', name: 'Gucci GG0027O', brand: 'Gucci', model: 'GG0027O', color: 'Dorado', category: 'frame', material: 'Metal', costPrice: 220, salePrice: 350, stock: 2, stockMin: 2, status: 'active' },
  { id: 'p5', code: 'ARM-005', name: 'Carolina Herrera CH806', brand: 'Carolina Herrera', model: 'CH806', color: 'Rojo', category: 'frame', material: 'Acetato', costPrice: 160, salePrice: 260, stock: 5, stockMin: 2, status: 'active' },
  { id: 'p6', code: 'LEN-001', name: 'Essilor Varilux X', brand: 'Essilor', model: 'Varilux X', category: 'lens', material: 'Policarbonato', costPrice: 250, salePrice: 410, stock: 12, stockMin: 5, status: 'active' },
  { id: 'p7', code: 'LEN-002', name: 'Zeiss SmartLife', brand: 'Zeiss', model: 'SmartLife', category: 'lens', material: 'Hi-Index 1.67', costPrice: 300, salePrice: 480, stock: 6, stockMin: 3, status: 'active' },
  { id: 'p8', code: 'LEN-003', name: 'Lente CR-39 Monofocal', brand: 'Generico', category: 'lens', material: 'CR-39', costPrice: 15, salePrice: 35, stock: 50, stockMin: 20, status: 'active' },
  { id: 'p9', code: 'LEN-004', name: 'Lente Policarbonato Monofocal', brand: 'Generico', category: 'lens', material: 'Policarbonato', costPrice: 25, salePrice: 55, stock: 35, stockMin: 15, status: 'active' },
  { id: 'p10', code: 'ACC-001', name: 'Kit Limpieza Anti-Fog', brand: 'OptiClean', category: 'accessory', costPrice: 5, salePrice: 12.50, stock: 48, stockMin: 10, status: 'active' },
  { id: 'p11', code: 'ACC-002', name: 'Estuche Premium Rigido', brand: 'OptiCase', category: 'accessory', costPrice: 8, salePrice: 18, stock: 30, stockMin: 10, status: 'active' },
  { id: 'p12', code: 'SOL-001', name: 'Solucion Multiproposito 360ml', brand: 'ReNu', category: 'solution', costPrice: 12, salePrice: 25, stock: 20, stockMin: 8, status: 'active' },
  { id: 'p13', code: 'CL-001', name: 'Lentes de Contacto Acuvue Oasys', brand: 'Acuvue', model: 'Oasys', category: 'contactLens', material: 'Hidrogel Silicona', costPrice: 45, salePrice: 85, stock: 15, stockMin: 5, status: 'active' },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: 's1', date: new Date().toISOString(), patientName: 'Elena Rodriguez Salas',
    items: [
      { productId: 'p1', productName: 'Versace VE3281', productCode: 'ARM-001', quantity: 1, unitPrice: 285, discount: 0, subtotal: 285 },
      { productId: 'p6', productName: 'Essilor Varilux X', productCode: 'LEN-001', quantity: 1, unitPrice: 410, discount: 0, subtotal: 410 },
    ],
    subtotal: 695, discount: 50, igv: 116.10, total: 761.10,
    paymentMethod: 'card', documentType: 'boleta', sellerId: 'demo', sellerName: 'Junior Mendoza', status: 'completed',
  },
  {
    id: 's2', date: new Date().toISOString(), patientName: 'Carlos Mendoza Quispe',
    items: [
      { productId: 'p2', productName: 'Ray-Ban RB5154', productCode: 'ARM-002', quantity: 1, unitPrice: 195, discount: 0, subtotal: 195 },
      { productId: 'p8', productName: 'Lente CR-39 Monofocal', productCode: 'LEN-003', quantity: 2, unitPrice: 35, discount: 0, subtotal: 70 },
    ],
    subtotal: 265, discount: 0, igv: 47.70, total: 312.70,
    paymentMethod: 'cash', documentType: 'boleta', sellerId: 'demo', sellerName: 'Junior Mendoza', status: 'completed',
  },
];

function generateLensInventory(): InventoryItem[] {
  const materials = ['Organic CR-39', 'Polycarbonate', 'Hi-Index 1.67', 'Trivex'];
  const sphValues = [0, -0.25, -0.50, -0.75, -1.00, -1.25, -1.50, -1.75, -2.00];
  const cylValues = [0, -0.25, -0.50, -0.75, -1.00];
  const items: InventoryItem[] = [];
  let idx = 0;
  // Use seeded random for consistent lens stock
  let seed = 42;
  const seededRandom = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };
  for (const mat of materials) {
    for (const sph of sphValues) {
      for (const cyl of cylValues) {
        items.push({ id: `li-${idx++}`, material: mat, sph, cyl, stock: Math.floor(seededRandom() * 20) });
      }
    }
  }
  return items;
}

// ══════════════════════════════════════════
// INITIALIZE FROM LOCALSTORAGE OR DEFAULTS
// ══════════════════════════════════════════

function initStore() {
  const seeded = localStorage.getItem(KEYS.seeded);
  if (!seeded) {
    save(KEYS.patients, DEFAULT_PATIENTS);
    save(KEYS.consultations, DEFAULT_CONSULTATIONS);
    save(KEYS.prescriptions, DEFAULT_PRESCRIPTIONS);
    save(KEYS.products, DEFAULT_PRODUCTS);
    save(KEYS.sales, DEFAULT_SALES);
    save(KEYS.lensInventory, generateLensInventory());
    save(KEYS.idCounter, 100);
    localStorage.setItem(KEYS.seeded, 'true');
  }
}

initStore();

// ══════════════════════════════════════════
// CRUD HELPERS
// ══════════════════════════════════════════

function getPatients(): Patient[] { return load<Patient[]>(KEYS.patients, []); }
function setPatients(p: Patient[]) { save(KEYS.patients, p); }

function getConsultations(): Record<string, Consultation[]> { return load(KEYS.consultations, {}); }
function setConsultations(c: Record<string, Consultation[]>) { save(KEYS.consultations, c); }

function getPrescriptions(): Record<string, Prescription[]> { return load(KEYS.prescriptions, {}); }
function setPrescriptions(p: Record<string, Prescription[]>) { save(KEYS.prescriptions, p); }

function getProducts(): Product[] { return load<Product[]>(KEYS.products, []); }
function setProducts(p: Product[]) { save(KEYS.products, p); }

function getSales(): Sale[] { return load<Sale[]>(KEYS.sales, []); }
function setSales(s: Sale[]) { save(KEYS.sales, s); }

function getLensInventory(): InventoryItem[] { return load<InventoryItem[]>(KEYS.lensInventory, []); }

function nextId(): string {
  let counter = load<number>(KEYS.idCounter, 100);
  const id = `demo-${counter++}`;
  save(KEYS.idCounter, counter);
  return id;
}

// ══════════════════════════════════════════
// DEMO SERVICE FUNCTIONS (localStorage-backed)
// ══════════════════════════════════════════

export const demo = {
  // ─── Patients ───
  fetchPatients: async (): Promise<Patient[]> =>
    getPatients().sort((a, b) => a.name.localeCompare(b.name)),

  getPatient: async (id: string): Promise<Patient | null> =>
    getPatients().find(p => p.id === id) || null,

  createPatient: async (data: any): Promise<string> => {
    const id = nextId();
    const patients = getPatients();
    patients.push({ id, ...data, createdAt: new Date().toISOString() });
    setPatients(patients);
    return id;
  },

  updatePatient: async (id: string, updates: Partial<Patient>): Promise<void> => {
    const patients = getPatients();
    const idx = patients.findIndex(p => p.id === id);
    if (idx >= 0) {
      patients[idx] = { ...patients[idx], ...updates };
      setPatients(patients);
    }
  },

  // ─── Consultations ───
  fetchConsultations: async (patientId: string): Promise<Consultation[]> => {
    const all = getConsultations();
    return (all[patientId] || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createConsultation: async (patientId: string, data: any): Promise<string> => {
    const id = nextId();
    const all = getConsultations();
    if (!all[patientId]) all[patientId] = [];
    all[patientId].push({ id, patientId, date: new Date().toISOString(), ...data });
    setConsultations(all);
    return id;
  },

  // ─── Prescriptions ───
  fetchPrescriptions: async (patientId: string): Promise<Prescription[]> => {
    const all = getPrescriptions();
    return (all[patientId] || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createPrescription: async (patientId: string, rx: any): Promise<string> => {
    const id = nextId();
    const all = getPrescriptions();
    if (!all[patientId]) all[patientId] = [];
    all[patientId].push({ id, patientId, date: new Date().toISOString(), ...rx });
    setPrescriptions(all);
    return id;
  },

  // ─── Products ───
  fetchProducts: async (): Promise<Product[]> =>
    getProducts().filter(p => p.status === 'active').sort((a, b) => a.name.localeCompare(b.name)),

  fetchAllProducts: async (): Promise<Product[]> =>
    getProducts().sort((a, b) => a.name.localeCompare(b.name)),

  createProduct: async (data: any): Promise<string> => {
    const id = nextId();
    const products = getProducts();
    products.push({ id, ...data, createdAt: new Date().toISOString() });
    setProducts(products);
    return id;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<void> => {
    const products = getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...updates };
      setProducts(products);
    }
  },

  // ─── Lens Inventory ───
  fetchLensInventory: async (): Promise<InventoryItem[]> => getLensInventory(),

  // ─── Sales ───
  fetchSales: async (): Promise<Sale[]> =>
    getSales().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

  fetchTodaySales: async (): Promise<Sale[]> => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return getSales().filter(s => new Date(s.date) >= today && s.status === 'completed');
  },

  createSale: async (sale: any): Promise<string> => {
    const id = nextId();
    const sales = getSales();
    sales.push({ id, date: new Date().toISOString(), ...sale });
    setSales(sales);
    // Decrease product stock
    const products = getProducts();
    for (const item of sale.items) {
      const pIdx = products.findIndex(p => p.id === item.productId);
      if (pIdx >= 0) products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
    }
    setProducts(products);
    return id;
  },

  cancelSale: async (saleId: string): Promise<void> => {
    const sales = getSales();
    const idx = sales.findIndex(s => s.id === saleId);
    if (idx >= 0) {
      sales[idx].status = 'cancelled';
      setSales(sales);
      // Restore stock
      const products = getProducts();
      for (const item of sales[idx].items) {
        const pIdx = products.findIndex(p => p.id === item.productId);
        if (pIdx >= 0) products[pIdx].stock += item.quantity;
      }
      setProducts(products);
    }
  },

  // ─── Dashboard ───
  fetchDashboardStats: async (): Promise<DashboardStats> => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sales = getSales();
    const todaySales = sales.filter(s => new Date(s.date) >= today && s.status === 'completed');
    const products = getProducts();
    return {
      dailySales: todaySales.reduce((sum, s) => sum + s.total, 0),
      dailySalesCount: todaySales.length,
      consultationsToday: 0,
      criticalStock: products.filter(p => p.status === 'active' && p.stock <= p.stockMin).length,
      totalPatients: getPatients().length,
    };
  },

  // ─── Seed (no-op, already seeded by initStore) ───
  seedDatabase: async (): Promise<void> => {},
};
