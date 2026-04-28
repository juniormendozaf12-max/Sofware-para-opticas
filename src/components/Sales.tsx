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
      {/* Toggle header — Duolingo style */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b-2 border-[#e5e5e5] shrink-0 lg:px-6">
        <h1 className="font-extrabold text-[#4b4b4b] text-lg tracking-tight">Ventas</h1>
        <div className="flex bg-[#e5e5e5] rounded-2xl p-1 gap-0.5">
          <button
            onClick={() => toggleView('normal')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all',
              view === 'normal'
                ? 'bg-white text-[#4b4b4b] shadow-sm border-b-2 border-[#cdcdcd]'
                : 'text-[#afafaf] hover:text-[#777]',
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Normal
          </button>
          <button
            onClick={() => toggleView('tpv')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all',
              view === 'tpv'
                ? 'bg-white text-[#4b4b4b] shadow-sm border-b-2 border-[#cdcdcd]'
                : 'text-[#afafaf] hover:text-[#777]',
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
          <div className="flex-1 flex items-center justify-center bg-[#f0f0f0]">
            <Loader2 className="w-8 h-8 text-[#58CC02] animate-spin" />
          </div>
        }>
          <SalesClassic user={user} />
        </Suspense>
      )}
    </div>
  );
}
