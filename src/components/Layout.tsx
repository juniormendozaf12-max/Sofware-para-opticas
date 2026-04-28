import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Grid2X2, Users, Cloud, CloudOff, LogOut, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { isSupabaseConfigured, getStoreConfig } from '../lib/supabase';
import { cn } from '../lib/utils';
import PrintToast from './ui/print-toast';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  onLogout: () => void;
}

// Main tab paths — back button on these should minimize, not navigate
const MAIN_TABS = ['/', '/sales', '/inventory', '/patients'];

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [printFeedback, setPrintFeedback] = useState<{ type: string; message: string } | null>(null);

  // ── Print feedback toast listener ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setPrintFeedback(detail);
      setTimeout(() => setPrintFeedback(null), 4000);
    };
    window.addEventListener('print-feedback', handler);
    return () => window.removeEventListener('print-feedback', handler);
  }, []);

  // ── Android hardware back button ──
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    import('@capacitor/app').then(({ App }) => {
      const handler = App.addListener('backButton', ({ canGoBack }) => {
        // If on a main tab, minimize the app
        if (MAIN_TABS.includes(location.pathname)) {
          App.minimizeApp();
        } else if (canGoBack) {
          // On subpages (patient profile, consultation), go back
          window.history.back();
        } else {
          // Fallback: go to home
          navigate('/');
        }
      });
      cleanup = () => { handler.then(h => h.remove()); };
    }).catch(() => {
      // Not running on Capacitor (web) — ignore
    });

    return () => { if (cleanup) cleanup(); };
  }, [location.pathname, navigate]);

  const isSubpage = location.pathname !== '/' &&
    !(['/sales', '/inventory', '/patients'].includes(location.pathname));

  const navItems = [
    { path: '/', label: 'Inicio', icon: LayoutDashboard },
    { path: '/sales', label: 'Ventas', icon: ShoppingCart },
    { path: '/inventory', label: 'Inventario', icon: Grid2X2 },
    { path: '/patients', label: 'Pacientes', icon: Users },
  ];

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface lg:flex">
      {/* ═══════════════════════════════════════════════
          DESKTOP SIDEBAR (≥1024px)
          ═══════════════════════════════════════════════ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-white border-r border-divider">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-divider">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)' }}
            >
              <span className="text-lg">👁️</span>
            </div>
            <div className="min-w-0">
              <p className="font-headline font-extrabold text-on-surface text-sm leading-tight truncate">
                {getStoreConfig().nombre}
              </p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                Centro Óptico
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-headline text-sm",
                  isActive
                    ? "bg-on-surface text-white font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-semibold"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sync status */}
        <div className="px-5 py-3 border-t border-divider">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-2 text-success">
              <Cloud size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Sincronizado</span>
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse ml-auto" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-warning">
              <CloudOff size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Modo Demo</span>
            </div>
          )}
        </div>

        {/* User + logout */}
        <div className="px-3 py-3 border-t border-divider">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-divider shrink-0">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=F7F7F7&color=222222&bold=true`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate">{user.name}</p>
              <p className="text-[10px] text-on-surface-variant capitalize truncate">
                {user.role === 'admin' ? 'Administrador' : 'Optometrista'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-error-container hover:text-error transition-colors text-sm font-semibold"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════
          MAIN COLUMN (header + content + mobile nav)
          ═══════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl flex justify-between items-center px-5 h-14 border-b border-divider">
          <div className="flex items-center gap-3">
            {isSubpage ? (
              <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors press-scale">
                <ArrowLeft size={20} className="text-on-surface" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full overflow-hidden border border-divider">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=F7F7F7&color=222222&bold=true`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="text-lg font-bold text-on-surface font-headline tracking-tight">{getStoreConfig().nombre}</span>
          </div>
          <div className="flex items-center gap-3">
            {isSupabaseConfigured ? (
              <div className="flex items-center gap-1 text-success">
                <Cloud size={16} />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-warning">
                <CloudOff size={16} />
              </div>
            )}
            <button onClick={onLogout} className="text-on-surface-variant hover:text-error transition-color p-1 press-scale">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Desktop top bar (only on subpages, shows back button) */}
        {isSubpage && (
          <header className="hidden lg:flex sticky top-0 z-40 bg-white/95 backdrop-blur-xl items-center px-10 h-14 border-b border-divider">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors text-sm font-semibold text-on-surface-variant hover:text-on-surface"
            >
              <ArrowLeft size={18} />
              Volver
            </button>
          </header>
        )}

        {/* Content */}
        <main className={cn(
          "flex-1",
          location.pathname === '/sales'
            ? "p-0 lg:p-0"
            : "px-4 pb-28 pt-4 lg:px-10 lg:pt-8 lg:pb-16"
        )}>
          <div className={cn(
            "mx-auto",
            location.pathname === '/sales'
              ? "max-w-full"
              : "max-w-lg lg:max-w-6xl"
          )}>
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pt-2 pb-6 px-4 bg-white border-t border-divider z-50">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 rounded-xl min-w-[64px] press-scale",
                  isActive
                    ? "text-accent"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={cn(
                  "text-[10px] mt-0.5 font-headline",
                  isActive ? "font-bold" : "font-semibold"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Global print feedback toast */}
      <AnimatePresence>
        {printFeedback && (
          <PrintToast
            type={printFeedback.type as 'success' | 'error' | 'info'}
            message={printFeedback.message}
            onDismiss={() => setPrintFeedback(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
