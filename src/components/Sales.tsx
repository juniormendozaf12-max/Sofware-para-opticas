import { useState, Component, type ReactNode } from 'react';
import type { UserProfile } from '../types';
import TPVLayout from './tpv/TPVLayout';
import SalesClassic from './SalesClassic';
import { cn } from '../lib/utils';
import { ShoppingCart, LayoutGrid, AlertTriangle } from 'lucide-react';

// ErrorBoundary — prevents white-screen crash if a child throws
class SalesErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#f0f0f0] p-6 text-center">
          <AlertTriangle size={32} className="text-[#FF9600]" />
          <p className="font-extrabold text-[#4b4b4b] text-sm">Error al cargar ventas</p>
          <p className="text-xs text-[#afafaf] max-w-xs">{this.state.error.message}</p>
          <button
            onClick={() => { this.setState({ error: null }); }}
            className="mt-2 px-4 py-2 bg-[#58CC02] text-white font-extrabold rounded-xl text-sm border-b-4 border-[#46a302]"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <SalesErrorBoundary>
        {view === 'tpv' ? (
          <TPVLayout user={user} />
        ) : (
          <SalesClassic user={user} />
        )}
      </SalesErrorBoundary>
    </div>
  );
}
