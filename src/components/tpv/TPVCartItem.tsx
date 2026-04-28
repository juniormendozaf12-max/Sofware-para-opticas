import { motion } from 'motion/react';
import { Minus, Plus, X } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { useTPV, type CartItem } from './TPVContext';

interface TPVCartItemProps {
  item: CartItem;
}

export default function TPVCartItem({ item }: TPVCartItemProps) {
  const { updateQuantity, removeFromCart } = useTPV();
  const { product, quantity } = item;
  const lineTotal = product.salePrice * quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
    >
      {/* Product name */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900" title={product.name}>
          {product.name}
        </p>
        <p className="text-xs text-gray-400">
          {formatCurrency(product.salePrice)} c/u
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(product.id, -1)}
          disabled={quantity <= 1}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded',
            'bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300',
            'disabled:cursor-not-allowed disabled:opacity-30',
          )}
        >
          <Minus className="h-3 w-3" />
        </button>

        <motion.span
          key={quantity}
          initial={{ scale: 1.3, color: '#7c3aed' }}
          animate={{ scale: 1, color: '#111827' }}
          transition={{ duration: 0.25 }}
          className="w-6 text-center text-sm font-bold text-gray-900"
        >
          {quantity}
        </motion.span>

        <button
          onClick={() => updateQuantity(product.id, 1)}
          disabled={quantity >= product.stock}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded',
            'bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300',
            'disabled:cursor-not-allowed disabled:opacity-30',
          )}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Line subtotal */}
      <motion.span
        key={lineTotal}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-20 text-right text-sm font-semibold text-emerald-600"
      >
        {formatCurrency(lineTotal)}
      </motion.span>

      {/* Remove button */}
      <button
        onClick={() => removeFromCart(product.id)}
        className="flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
