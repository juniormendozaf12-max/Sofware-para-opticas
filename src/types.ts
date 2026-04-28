// Dates come as ISO strings from Supabase
type DateString = string;

// ══════════════════════════════════════════
// USERS & AUTH
// ══════════════════════════════════════════

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'optometrist' | 'seller';
  photoURL?: string;
  establecimiento?: string;
}

// ══════════════════════════════════════════
// PATIENTS (aligned with desktop CLIENTES)
// ══════════════════════════════════════════

export interface Patient {
  id: string;
  name: string;
  dni: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  isVIP: boolean;
  lastVisit?: DateString;
  photoURL?: string;
  notes?: string;
  createdAt?: DateString;
}

// ══════════════════════════════════════════
// CONSULTATIONS (aligned with desktop CONSULTAS_CLINICAS)
// ══════════════════════════════════════════

export interface VisualAcuity {
  scOd?: string;
  scOi?: string;
  ccOd?: string;
  ccOi?: string;
}

export interface EyeRx {
  sph: number;
  cyl: number;
  axis: number;
  add: number;
}

export interface Diagnosis {
  myopia: boolean;
  hyperopia: boolean;
  astigmatism: boolean;
  presbyopia: boolean;
  amblyopia: boolean;
  other?: string;
}

export interface LensRecommendation {
  type: string;
  material: string;
  treatments: string[];
}

export interface Consultation {
  id: string;
  patientId: string;
  date: DateString;
  reason: string;
  medicalHistory?: string;
  visualAcuity?: VisualAcuity;
  diagnosis: Diagnosis;
  diagnosisTags: string[];
  lensRecommendation?: LensRecommendation;
  pioOd?: number;
  pioOi?: number;
  notes?: string;
  optometrist?: string;
  aiAnalysis?: string;
}

// ══════════════════════════════════════════
// PRESCRIPTIONS (RX)
// ══════════════════════════════════════════

export interface Prescription {
  id: string;
  patientId: string;
  date: DateString;
  od: EyeRx;
  oi: EyeRx;
  dip: number;
  lensType?: string;
  material?: string;
  treatments?: string[];
  optometrist?: string;
}

// ══════════════════════════════════════════
// PRODUCTS (aligned with desktop PRODUCTOS)
// ══════════════════════════════════════════

export type ProductCategory = 'frame' | 'lens' | 'contactLens' | 'accessory' | 'solution' | 'other';

export interface Product {
  id: string;
  code: string;
  name: string;
  brand?: string;
  model?: string;
  color?: string;
  category: ProductCategory;
  material?: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  stockMin: number;
  supplier?: string;
  location?: string;
  status: 'active' | 'inactive';
  createdAt?: DateString;
}

// ══════════════════════════════════════════
// INVENTORY (Lens Matrix)
// ══════════════════════════════════════════

export interface InventoryItem {
  id: string;
  material: string;
  sph: number;
  cyl: number;
  stock: number;
}

// Desktop-compatible lens matrix (inventario_lunas_matrix)
export type LensMaterialKey = 'RX_BLUE' | 'POLY_BLUE' | 'DIPPIN';
export type LensCategory =
  | 'ESFERICO_NEGATIVO'
  | 'ESFERICO_POSITIVO'
  | 'CILINDRO_PURO'
  | 'COMBINADO'
  | 'PROGRESIVO'
  | 'BIFOCAL';

export interface LensMatrixCell {
  stock: number;
  minimo: number;
  precio: number;
}

// matrix[material][categoria][serie][sph][cyl] = LensMatrixCell
export type LensMatrix = Record<string, Record<string, Record<string, Record<string, Record<string, LensMatrixCell>>>>>;

// ══════════════════════════════════════════
// SALES (aligned with desktop VENTAS)
// ══════════════════════════════════════════

export interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'card' | 'yape' | 'plin' | 'transfer';
export type DocumentType = 'boleta' | 'factura' | 'nota';

export interface Sale {
  id: string;
  date: DateString;
  patientId?: string;
  patientName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  igv: number;
  total: number;
  abono?: number;
  saldo?: number;
  paymentMethod: PaymentMethod;
  documentType: DocumentType;
  documentNumber?: string;
  sellerId: string;
  sellerName: string;
  establecimiento?: string;
  status: 'completed' | 'cancelled' | 'pending';
  notes?: string;
}

// ══════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════

export interface DashboardStats {
  dailySales: number;
  dailySalesCount: number;
  consultationsToday: number;
  criticalStock: number;
  totalPatients: number;
}
