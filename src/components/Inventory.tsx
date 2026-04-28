import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  Package,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Grid2X2,
  Tag,
  Eye,
  Glasses,
  Droplets,
  ShoppingBag,
  Loader2,
  Box,
  ArrowDownUp,
  Minus,
  Plus,
  X,
  Save,
} from 'lucide-react';
import {
  fetchProducts, fetchLensMatrix, searchProducts, onDataChange,
  getMatrixStock, updateMatrixStock, getMatrixMaterialStats,
  MATRIX_MATERIALS, MATRIX_CATEGORIES,
  getMatrixSphValues, CYL_VALUES, formatLensValue,
} from '../lib/services';
import type { Product, ProductCategory, LensMatrix, LensCategory, LensMaterialKey } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// ══════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════

type ViewMode = 'products' | 'lensMatrix';

interface CategoryFilter {
  label: string;
  value: ProductCategory | 'all';
  icon: React.ElementType;
}

const CATEGORY_FILTERS: CategoryFilter[] = [
  { label: 'Todos', value: 'all', icon: Package },
  { label: 'Armazones', value: 'frame', icon: Glasses },
  { label: 'Lentes', value: 'lens', icon: Eye },
  { label: 'Accesorios', value: 'accessory', icon: ShoppingBag },
  { label: 'Soluciones', value: 'solution', icon: Droplets },
  { label: 'Contacto', value: 'contactLens', icon: Eye },
];

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════

function getStockStatus(stock: number, stockMin: number): 'ok' | 'low' | 'critical' {
  if (stock <= 0) return 'critical';
  if (stock <= stockMin) return 'low';
  return 'ok';
}

function getStockBadgeClasses(status: 'ok' | 'low' | 'critical'): string {
  switch (status) {
    case 'ok':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'low':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'critical':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
  }
}

function getStockIcon(status: 'ok' | 'low' | 'critical') {
  switch (status) {
    case 'ok':
      return CheckCircle2;
    case 'low':
    case 'critical':
      return AlertTriangle;
  }
}

function getLensCellColor(stock: number): string {
  if (stock === 0) return 'bg-red-500/10 text-red-600';
  if (stock <= 2) return 'bg-amber-500/10 text-amber-600';
  if (stock <= 5) return 'bg-yellow-500/10 text-yellow-700';
  return 'bg-emerald-500/10 text-emerald-600';
}

// ══════════════════════════════════════════
// EDIT CELL MODAL
// ══════════════════════════════════════════

interface EditCellProps {
  sph: number;
  cyl: number;
  currentStock: number;
  material: string;
  category: string;
  onSave: (newStock: number) => void;
  onClose: () => void;
}

function EditCellModal({ sph, cyl, currentStock, material, category, onSave, onClose }: EditCellProps) {
  const [value, setValue] = useState(currentStock);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const matLabel = MATRIX_MATERIALS.find(m => m.key === material)?.label || material;
  const catLabel = MATRIX_CATEGORIES.find(c => c.key === category)?.label || category;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline font-extrabold text-lg text-on-surface">Editar Stock</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="bg-surface-container rounded-2xl p-4 mb-5 space-y-1">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span className="font-bold">{matLabel}</span>
            <span>{catLabel}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-on-surface">
            <span>SPH: {formatLensValue(sph)}</span>
            <span>CYL: {formatLensValue(cyl)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setValue(Math.max(0, value - 1))}
            className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center hover:bg-divider transition-colors press-scale"
          >
            <Minus size={20} />
          </button>
          <input
            ref={inputRef}
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-24 h-14 text-center text-3xl font-extrabold font-headline bg-surface-container border-2 border-primary/30 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button
            onClick={() => setValue(value + 1)}
            className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center hover:bg-divider transition-colors press-scale"
          >
            <Plus size={20} />
          </button>
        </div>

        <button
          onClick={() => onSave(value)}
          className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 press-scale hover:opacity-90 transition-opacity"
        >
          <Save size={18} />
          Guardar
        </button>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════

export default function Inventory() {
  // ── State ──
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [loading, setLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  // Lens matrix state
  const [matrix, setMatrix] = useState<LensMatrix>({});
  const [activeMaterial, setActiveMaterial] = useState<LensMaterialKey>('RX_BLUE');
  const [activeMatrixCat, setActiveMatrixCat] = useState<LensCategory>('ESFERICO_NEGATIVO');
  const [editingCell, setEditingCell] = useState<{ sph: number; cyl: number } | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Data Loading ──
  const refreshProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }, []);

  const refreshMatrix = useCallback(async () => {
    try {
      const data = await fetchLensMatrix();
      setMatrix(data);
    } catch (err) {
      console.error('Error loading lens matrix:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([refreshProducts(), refreshMatrix()]);
      setLoading(false);
    })();
  }, [refreshProducts, refreshMatrix]);

  // Realtime: auto-refresh when productos or inventario_lunas_matrix change
  useEffect(() => {
    const unsub1 = onDataChange('productos', refreshProducts);
    const unsub2 = onDataChange('inventario_lunas_matrix', refreshMatrix);
    return () => { unsub1(); unsub2(); };
  }, [refreshProducts, refreshMatrix]);

  // ── Derived Data: Products ──
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchTerm.trim()) {
      result = searchProducts(searchTerm, result);
    }
    return result;
  }, [products, activeCategory, searchTerm]);

  // ── Derived Data: Lens Matrix ──
  const sphValues = useMemo(() => getMatrixSphValues(activeMatrixCat), [activeMatrixCat]);
  const cylValues = CYL_VALUES;

  const materialStats = useMemo(
    () => getMatrixMaterialStats(matrix, activeMaterial),
    [matrix, activeMaterial]
  );

  const handleSaveStock = useCallback(async (sph: number, cyl: number, newStock: number) => {
    setSaving(true);
    try {
      const updated = await updateMatrixStock(matrix, activeMaterial, activeMatrixCat, sph, cyl, newStock);
      setMatrix(updated);
    } catch (err) {
      console.error('Error saving stock:', err);
    }
    setSaving(false);
    setEditingCell(null);
  }, [matrix, activeMaterial, activeMatrixCat]);

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  return (
    <div className="space-y-6 pb-12">
      {/* ── View Toggle ── */}
      <section>
        <div className="bg-surface-container p-1.5 rounded-2xl flex items-center">
          <button
            onClick={() => setViewMode('products')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              viewMode === 'products'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:opacity-80'
            )}
          >
            <Package size={16} />
            Productos
          </button>
          <button
            onClick={() => setViewMode('lensMatrix')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              viewMode === 'lensMatrix'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:opacity-80'
            )}
          >
            <Grid2X2 size={16} />
            Matriz Lentes
          </button>
        </div>
      </section>

      {/* ── Loading State ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-accent" size={32} />
          <p className="text-sm text-on-surface-variant font-medium">
            Cargando inventario...
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* PRODUCTS VIEW                             */}
      {/* ══════════════════════════════════════════ */}
      {!loading && viewMode === 'products' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="products-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Search Bar */}
            <section>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="text-outline" size={20} />
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container border border-divider rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-body text-on-surface placeholder-on-surface-variant"
                  placeholder="Buscar por nombre, codigo o marca..."
                  type="text"
                />
              </div>
            </section>

            {/* Category Chips */}
            <section>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {CATEGORY_FILTERS.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={cn(
                        'whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-1.5 shrink-0',
                        isActive
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      )}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Refresh Button */}
            <section className="flex justify-end">
              <button
                onClick={refreshProducts}
                className="flex items-center gap-1.5 text-on-surface font-semibold underline text-xs hover:opacity-80 transition-opacity"
              >
                <RefreshCw size={14} />
                Actualizar
              </button>
            </section>

            {/* Products Grid */}
            <section>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Box className="text-on-surface-variant/40" size={48} />
                  <p className="text-sm text-on-surface-variant font-medium">
                    No se encontraron productos
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setActiveCategory('all');
                      }}
                      className="text-accent text-xs font-bold hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.stock, product.stockMin);
                    const StockIcon = getStockIcon(stockStatus);
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="bg-white rounded-2xl p-4 space-y-3 border border-divider"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-on-surface truncate">
                              {product.name}
                            </h3>
                            {product.brand && (
                              <p className="text-xs text-on-surface-variant font-medium truncate">
                                {product.brand}
                              </p>
                            )}
                          </div>
                          <div
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold shrink-0',
                              getStockBadgeClasses(stockStatus)
                            )}
                          >
                            <StockIcon size={12} />
                            {product.stock}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Tag size={12} className="text-on-surface-variant/60" />
                            <span className="text-[11px] font-mono text-on-surface-variant font-medium">
                              {product.code}
                            </span>
                          </div>
                          <span className="text-sm font-extrabold text-accent">
                            {formatCurrency(product.salePrice)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* LENS MATRIX VIEW                          */}
      {/* ══════════════════════════════════════════ */}
      {!loading && viewMode === 'lensMatrix' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="lens-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Material Tabs */}
            <section>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {MATRIX_MATERIALS.map((mat) => (
                  <button
                    key={mat.key}
                    onClick={() => setActiveMaterial(mat.key)}
                    className={cn(
                      'whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all shrink-0 flex items-center gap-2',
                      activeMaterial === mat.key
                        ? 'text-white shadow-md'
                        : 'bg-surface-container-high text-on-surface-variant'
                    )}
                    style={activeMaterial === mat.key ? { background: mat.color } : undefined}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: mat.color, opacity: activeMaterial === mat.key ? 0 : 1 }}
                    />
                    {mat.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Category Tabs */}
            <section>
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                {MATRIX_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveMatrixCat(cat.key)}
                    className={cn(
                      'whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shrink-0',
                      activeMatrixCat === cat.key
                        ? 'bg-on-surface text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    )}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Lens Matrix Table */}
            <section className="bg-surface-container rounded-2xl overflow-hidden border border-divider">
              <div className="p-4 border-b border-divider flex justify-between items-end">
                <div>
                  <h2 className="font-headline font-extrabold text-base tracking-tight text-on-surface">
                    {MATRIX_MATERIALS.find(m => m.key === activeMaterial)?.label}
                    {' — '}
                    {MATRIX_CATEGORIES.find(c => c.key === activeMatrixCat)?.label}
                  </h2>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    Toca una celda para editar stock
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      {'>5'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      1-5
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      0
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-surface-container-high/50">
                      <th className="p-2 text-left border-r border-divider sticky left-0 bg-surface-container-high/90 z-10">
                        <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest leading-none flex items-center gap-1">
                          <ArrowDownUp size={9} />
                          SPH\CYL
                        </span>
                      </th>
                      {cylValues.map((cyl) => (
                        <th key={cyl} className="p-2 text-center min-w-[44px]">
                          <span className="text-[10px] font-bold text-on-surface">
                            {formatLensValue(cyl)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-label">
                    {sphValues.map((sph) => (
                      <tr key={sph}>
                        <td className="p-2 border-r border-divider bg-surface-container-high/30 sticky left-0 z-10">
                          <span className="text-[10px] font-bold text-on-surface whitespace-nowrap">
                            {formatLensValue(sph)}
                          </span>
                        </td>
                        {cylValues.map((cyl) => {
                          const cell = getMatrixStock(matrix, activeMaterial, activeMatrixCat, sph, cyl);
                          const stock = cell.stock;
                          return (
                            <td key={cyl} className="p-1">
                              <button
                                onClick={() => setEditingCell({ sph, cyl })}
                                className={cn(
                                  'w-full rounded-lg p-1.5 flex items-center justify-center border border-transparent transition-all',
                                  'hover:border-primary/30 hover:shadow-sm active:scale-95',
                                  getLensCellColor(stock),
                                )}
                              >
                                <span className="text-[11px] font-bold tabular-nums">{stock}</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3 bg-surface-container/50 flex items-center justify-between border-t border-divider">
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {sphValues.length} filas × {cylValues.length} columnas
                </span>
                <button
                  onClick={refreshMatrix}
                  className="flex items-center gap-1 text-on-surface font-semibold underline text-[10px] hover:opacity-80 transition-opacity"
                >
                  <RefreshCw size={12} />
                  Sincronizar
                </button>
              </div>
            </section>

            {/* Summary Cards */}
            <section className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex flex-col gap-1"
              >
                <div className="flex items-center gap-1">
                  <Package size={10} className="text-emerald-600" />
                  <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">
                    Total
                  </span>
                </div>
                <span className="text-2xl font-headline font-extrabold text-emerald-600">
                  {materialStats.totalStock >= 1000
                    ? `${(materialStats.totalStock / 1000).toFixed(1)}k`
                    : materialStats.totalStock}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex flex-col gap-1"
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle size={10} className="text-amber-600" />
                  <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest">
                    Bajo
                  </span>
                </div>
                <span className="text-2xl font-headline font-extrabold text-amber-600">
                  {materialStats.lowStock}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex flex-col gap-1"
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle size={10} className="text-red-600" />
                  <span className="text-[8px] font-black text-red-700 uppercase tracking-widest">
                    Agotado
                  </span>
                </div>
                <span className="text-2xl font-headline font-extrabold text-red-600">
                  {materialStats.outOfStock}
                </span>
              </motion.div>
            </section>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Edit Cell Modal ── */}
      <AnimatePresence>
        {editingCell && (
          <EditCellModal
            sph={editingCell.sph}
            cyl={editingCell.cyl}
            currentStock={getMatrixStock(matrix, activeMaterial, activeMatrixCat, editingCell.sph, editingCell.cyl).stock}
            material={activeMaterial}
            category={activeMatrixCat}
            onSave={(val) => handleSaveStock(editingCell.sph, editingCell.cyl, val)}
            onClose={() => setEditingCell(null)}
          />
        )}
      </AnimatePresence>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl">
          <Loader2 size={16} className="animate-spin" />
          Guardando...
        </div>
      )}
    </div>
  );
}
