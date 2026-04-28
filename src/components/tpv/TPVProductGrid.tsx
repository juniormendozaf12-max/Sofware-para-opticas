import { useTPV } from './TPVContext';
import TPVProductCard from './TPVProductCard';
import { Search, Loader2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TPVProductGrid() {
  const { searchTerm, setSearchTerm, productsLoading, filteredProducts } = useTPV();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search bar */}
      <div className="relative mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar producto por nombre o escanear código..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
        />
        {productsLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Product grid */}
      <div className="overflow-y-auto flex-1 min-h-0">
        {productsLoading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-gray-400"
          >
            <Package className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No se encontraron productos</p>
            {searchTerm && (
              <p className="text-xs mt-1 text-gray-400">
                Intenta con otro término de búsqueda
              </p>
            )}
          </motion.div>
        ) : (
          /* Product cards */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TPVProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
