import { useState, lazy, Suspense } from 'react';
import type { UserProfile } from '../types';
import TPVLayout from './tpv/TPVLayout';
import { cn } from '../lib/utils';
import { ShoppingCart, LayoutGrid, Loader2 } from 'lucide-react';

const SalesClassic = lazy(() => import('./SalesClassic'));

type SalesView = 'normal' | 'tpv';
const STORAGE_KEY = 'oa_sales_view_pref';

interface SalesProps {
  user: UserProfile;
}

export default function Sales({ user }: SalesProps) {
  const [view, setView] = useState<SalesView>(() => {
    return (localStorage.getItem(STORAGE_KEY) as SalesView) || 'normal';
  });

  const toggleView = (v: SalesView) => {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Toggle header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0 lg:px-6">
        <h1 className="font-bold text-gray-900 text-lg tracking-tight">Ventas</h1>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => toggleView('normal')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              view === 'normal'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Normal
          </button>
          <button
            onClick={() => toggleView('tpv')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              view === 'tpv'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            TPV
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'tpv' ? (
        <TPVLayout user={user} />
      ) : (
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        }>
          <SalesClassic user={user} />
        </Suspense>
      )}
    </div>
  );
}
