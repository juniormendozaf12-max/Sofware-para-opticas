import { useTPV } from './TPVContext';
import { cn } from '../../lib/utils';
import {
  Star,
  Grid2X2,
  Glasses,
  CircleDot,
  Sun,
  Eye,
  Puzzle,
  Wrench,
} from 'lucide-react';
import type { ProductCategory } from '../../types';

// ══════════════════════════════════════════
// CATEGORY DEFINITIONS
// ══════════════════════════════════════════

type CategoryFilterValue = ProductCategory | 'all' | 'favorites';

interface CategoryItem {
  label: string;
  icon: React.ElementType;
  filter: CategoryFilterValue;
}

const CATEGORIES: CategoryItem[] = [
  { label: 'Favoritos', icon: Star, filter: 'favorites' },
  { label: 'Todos', icon: Grid2X2, filter: 'all' },
  { label: 'Monturas', icon: Glasses, filter: 'frame' },
  { label: 'Lunas', icon: CircleDot, filter: 'lens' },
  { label: 'Lentes Sol', icon: Sun, filter: 'frame' },
  { label: 'Contacto', icon: Eye, filter: 'contactLens' },
  { label: 'Accesorios', icon: Puzzle, filter: 'accessory' },
  { label: 'Servicios', icon: Wrench, filter: 'other' },
];

// ══════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════

export default function TPVSidebar() {
  const { categoryFilter, setCategoryFilter, setShowLensModal } = useTPV();

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
        {/* Categories */}
        <div className="px-3 pt-4 pb-2">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 px-1">
            Categorias
          </h3>
          <nav className="flex flex-col gap-0.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = categoryFilter === cat.filter;

              return (
                <button
                  key={cat.label}
                  onClick={() => setCategoryFilter(cat.filter)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors w-full',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-emerald-600' : 'text-gray-400',
                    )}
                  />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-100 my-2" />

        {/* Quick actions */}
        <div className="px-3 pb-4">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 px-1">
            Acciones Rapidas
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowLensModal(true)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
            >
              Config. Luna RX
            </button>
            <button
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-400 text-amber-900 text-sm font-semibold hover:bg-amber-500 transition-colors shadow-sm"
            >
              Item Manual
            </button>
            <button
              onClick={() => setCategoryFilter('all')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
            >
              Catalogo
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile horizontal bar (<lg) ── */}
      <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide shrink-0">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = categoryFilter === cat.filter;

          return (
            <button
              key={cat.label}
              onClick={() => setCategoryFilter(cat.filter)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                isActive
                  ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}

        {/* Quick action: lens config */}
        <button
          onClick={() => setShowLensModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white whitespace-nowrap shrink-0"
        >
          Luna RX
        </button>
      </div>
    </>
  );
}
