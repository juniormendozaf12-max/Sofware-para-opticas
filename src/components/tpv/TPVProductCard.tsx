import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Glasses, CircleDot, Package } from 'lucide-react';
import { useTPV } from './TPVContext';
import { cn, formatCurrency } from '../../lib/utils';
import type { Product } from '../../types';

const CATEGORY_ICONS = {
  frame: Glasses,
  lens: CircleDot,
} as const;

interface TPVProductCardProps {
  product: Product;
}

export default function TPVProductCard({ product }: TPVProductCardProps) {
  const { cart, addToCart } = useTPV();

  const cartItem = useMemo(
    () => cart.find((item) => item.product.id === product.id),
    [cart, product.id],
  );
  const cartQty = cartItem?.quantity ?? 0;

  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = cartQty >= product.stock;
  const isDisabled = isOutOfStock || isMaxInCart;
  const isLowStock = product.stock <= product.stockMin && product.stock > 0;

  const Icon =
    CATEGORY_ICONS[product.category as keyof typeof CATEGORY_ICONS] ?? Package;

  return (
    <motion.button
      type="button"
      whileHover={isDisabled ? undefined : { scale: 1.03 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      onClick={() => !isDisabled && addToCart(product)}
      disabled={isDisabled}
      className={cn(
        'relative flex flex-col w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-shadow',
        !isDisabled && 'hover:shadow-md cursor-pointer',
        isDisabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      {/* Image / Icon area */}
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative">
        <Icon className="w-9 h-9 text-amber-700/60" />

        {/* In-cart badge */}
        {cartQty > 0 && (
          <span className="absolute top-2 right-2 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow">
            {cartQty}
          </span>
        )}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-2.5 flex flex-col gap-1 min-w-0">
        <span className="font-semibold text-sm text-gray-900 truncate">
          {product.name}
        </span>

        <div className="flex items-center justify-between">
          <span className="text-emerald-600 font-bold text-sm">
            {formatCurrency(product.salePrice)}
          </span>

          <span
            className={cn(
              'text-[11px] font-medium px-1.5 py-0.5 rounded-full',
              isLowStock
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-500',
            )}
          >
            {product.stock}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
