import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  UserPlus,
  LayoutGrid,
  ChevronRight,
  Plus,
  RefreshCw,
  Cloud,
  Eye,
  ClipboardList,
  Stethoscope,
  Sparkles,
  Gamepad2,
  Play,
  Palette,
  ExternalLink,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import type { UserProfile, DashboardStats, Sale, Patient } from '../types';
import { fetchDashboardData, getCachedDashboardData, onDataChange } from '../lib/services';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GradientCard } from './ui/gradient-card';
import { AnimatedFeatureCard } from './ui/animated-feature-card';

interface DashboardProps {
  user: UserProfile;
}

const springBouncy = { type: 'spring' as const, stiffness: 400, damping: 28 };
const springGentle = { type: 'spring' as const, stiffness: 300, damping: 30 };

const EMPTY_STATS: DashboardStats = {
  dailySales: 0, dailySalesCount: 0, consultationsToday: 0, criticalStock: 0, totalPatients: 0,
};

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();

  // Try warm cache first → instant render with real data
  const cached = getCachedDashboardData();

  const [stats, setStats] = useState<DashboardStats>(cached?.stats ?? EMPTY_STATS);
  const [todaySales, setTodaySales] = useState<Sale[]>(cached?.todaySales ?? []);
  const [recentPatients, setRecentPatients] = useState<Patient[]>(cached?.recentPatients ?? []);
  const [refreshing, setRefreshing] = useState(!cached); // subtle indicator if cache was cold

  const refreshData = useCallback(async () => {
    try {
      const { stats: s, todaySales: ts, recentPatients: rp } = await fetchDashboardData();
      setStats(s);
      setTodaySales(ts);
      setRecentPatients(rp);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
    }
  }, []);

  useEffect(() => {
    refreshData().finally(() => setRefreshing(false));
  }, [refreshData]);

  useEffect(() => {
    const unsubs = [
      onDataChange('ventas', refreshData),
      onDataChange('productos', refreshData),
      onDataChange('clientes', refreshData),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [refreshData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-7 pb-12">
      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-[26px] lg:text-4xl font-extrabold font-headline text-on-surface tracking-tight leading-tight">
            Hola, {firstName}
          </h1>
          <p className="text-on-surface-variant font-body text-sm lg:text-base mt-1">
            Resumen del dia en tu centro optico.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, rotate: 180 }}
          transition={springBouncy}
          onClick={handleRefresh}
          disabled={refreshing}
          className={cn(
            'mt-1 w-10 h-10 rounded-full border border-divider flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors',
            refreshing && 'animate-spin',
          )}
        >
          <RefreshCw size={18} />
        </motion.button>
      </motion.section>

      {/* Stats — Gradient Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Sales - full row on mobile, spans 2 on desktop */}
        <GradientCard
          icon={TrendingUp}
          title="Ventas del Dia"
          gradient="success"
          value={formatCurrency(stats?.dailySales ?? 0)}
          badge={`${stats?.dailySalesCount ?? 0} ventas`}
          className="col-span-2"
        />

        {/* Patients */}
        <GradientCard
          icon={Users}
          title="Pacientes"
          gradient="info"
          value={stats?.totalPatients ?? 0}
          onClick={() => navigate('/patients')}
        />

        {/* Stock */}
        <GradientCard
          icon={Package}
          title="Stock Critico"
          gradient={((stats?.criticalStock ?? 0) > 0) ? 'warning' : 'success'}
          value={(stats?.criticalStock ?? 0).toString().padStart(2, '0')}
          onClick={() => navigate('/inventory')}
        />
      </div>

      {/* Quick Actions — Animated Feature Cards */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
          className="text-on-surface font-headline font-bold text-lg lg:text-xl mb-3 tracking-tight"
        >
          Acciones Rapidas
        </motion.h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
          <AnimatedFeatureCard
            icon={ShoppingCart}
            title="Nueva Venta"
            description="Registrar venta con lunas, monturas y accesorios"
            iconColor="text-accent"
            iconBg="bg-accent-light"
            onClick={() => navigate('/sales')}
            index={0}
          />
          <AnimatedFeatureCard
            icon={UserPlus}
            title="Nuevo Paciente"
            description="Crear ficha con datos personales y medidas"
            iconColor="text-info"
            iconBg="bg-info-container"
            onClick={() => navigate('/patients/new')}
            index={1}
          />
          <AnimatedFeatureCard
            icon={LayoutGrid}
            title="Inventario"
            description="Productos, monturas, lunas y stock"
            iconColor="text-warning"
            iconBg="bg-warning-container"
            onClick={() => navigate('/inventory')}
            index={2}
          />
          <AnimatedFeatureCard
            icon={Eye}
            title="Consultas"
            description="Historial clinico y examenes de vision"
            iconColor="text-success"
            iconBg="bg-success-container"
            onClick={() => navigate('/patients')}
            index={3}
          />
        </div>
      </section>

      {/* Gaming Zone — Premium Access Card */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
      >
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springBouncy}
          onClick={() => navigate('/gaming')}
          className="relative overflow-hidden rounded-3xl cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          }}
        >
          {/* Animated gold accent */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #c9a227, #d4af37, #c9a227, transparent)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#c9a227]/10 to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative p-6 flex items-center gap-5">
            {/* Icon container */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a227]/20 to-[#d4af37]/10 border border-[#c9a227]/30 flex items-center justify-center">
                <Gamepad2 size={28} className="text-[#c9a227]" />
              </div>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl border border-[#c9a227]/50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#c9a227]/80">Premium</span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-[#c9a227]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <h3 className="text-xl font-bold text-[#f5f0e6] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Gaming Zone
              </h3>
              <p className="text-[#8a8a8a] text-xs mt-1">
                Experiencia inmersiva de entretenimiento
              </p>
            </div>

            {/* Play button */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-12 h-12 rounded-full border border-[#c9a227]/50 flex items-center justify-center text-[#c9a227] group-hover:bg-[#c9a227] group-hover:text-[#0a0a0a] transition-all duration-300"
            >
              <Play size={18} fill="currentColor" />
            </motion.div>
          </div>

          {/* Bottom shine effect on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#c9a227]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </motion.div>
      </motion.section>

      {/* Transitions ColorMatch — Prismatic Premium Card */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.3 }}
      >
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springBouncy}
          onClick={() => window.open('https://global.transitions.com/colormatch/ES-PE', '_blank')}
          className="relative overflow-hidden rounded-3xl cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, #0c0014 0%, #1a0a2e 30%, #0a1628 60%, #0c0014 100%)',
          }}
        >
          {/* Animated prismatic accent bar */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f59e0b, #8b5cf6, transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Prismatic light refraction blobs */}
          <motion.div
            className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-20%] left-[-5%] w-[160px] h-[160px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1.1, 0.9, 1.1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Content */}
          <div className="relative p-6 flex items-center gap-5">
            {/* Prismatic Lens Icon */}
            <motion.div className="relative">
              {/* Outer rotating chromatic ring */}
              <motion.div
                className="absolute inset-[-4px] rounded-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f59e0b, #ef4444, #8b5cf6)',
                  opacity: 0.3,
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20 border border-[#8b5cf6]/30 flex items-center justify-center backdrop-blur-sm">
                <motion.div
                  animate={{
                    color: ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#8b5cf6'],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Palette size={28} />
                </motion.div>
              </div>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl border border-[#8b5cf6]/40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Herramienta Profesional
                </span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <h3 className="text-xl font-bold text-[#f0eef5] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Transitions <span style={{ color: '#a78bfa' }}>ColorMatch</span>
              </h3>
              <p className="text-[#6b6b8a] text-xs mt-1">
                Encuentra el color perfecto de lentes Transitions
              </p>
            </div>

            {/* External link button */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#a78bfa',
              }}
            >
              <motion.div
                className="group-hover:text-white transition-colors duration-300"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ExternalLink size={18} />
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom prismatic shine on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(139,92,246,0.08), rgba(6,182,212,0.04), transparent)',
            }}
          />

          {/* Chromatic bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
            <motion.div
              className="h-full w-[200%]"
              style={{
                background: 'linear-gradient(90deg, transparent, #8b5cf6, #3b82f6, #06b6d4, #10b981, transparent, #8b5cf6, #3b82f6, #06b6d4, #10b981, transparent)',
              }}
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Optical Atelier — Landing Page Premium Card */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.35 }}
      >
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springBouncy}
          onClick={() => window.open('landing.html', '_blank')}
          className="relative overflow-hidden rounded-3xl cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, #0a0608 0%, #1c0a1e 25%, #0d1a2a 55%, #080412 100%)',
          }}
        >
          {/* Animated spectrum accent bar */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #c5a47e, #d4af37, #f5e6cc, #c5a47e, transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Ambient golden light */}
          <motion.div
            className="absolute top-[-30%] right-[-15%] w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(197,164,126,0.12) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-25%] left-[-10%] w-[180px] h-[180px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
            }}
            animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Content */}
          <div className="relative p-6 flex items-center gap-5">
            {/* Golden rotating ring icon */}
            <motion.div className="relative">
              <motion.div
                className="absolute inset-[-4px] rounded-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #c5a47e, #d4af37, #f5e6cc, #c5a47e)',
                  opacity: 0.25,
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c5a47e]/20 to-[#d4af37]/10 border border-[#c5a47e]/30 flex items-center justify-center backdrop-blur-sm">
                <motion.div
                  animate={{ color: ['#c5a47e', '#d4af37', '#f5e6cc', '#c5a47e'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Globe size={28} />
                </motion.div>
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl border border-[#c5a47e]/40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    background: 'linear-gradient(90deg, #c5a47e, #f5e6cc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Sitio Web Premium
                </span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #c5a47e, #d4af37)' }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <h3 className="text-xl font-bold text-[#f5efe6] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Optical <span style={{ color: '#c5a47e' }}>Atelier</span>
              </h3>
              <p className="text-[#7a7068] text-xs mt-1">
                Catalogo de lunas, monturas y tecnologia optica
              </p>
            </div>

            {/* Arrow button */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ border: '1px solid rgba(197,164,126,0.4)', color: '#c5a47e' }}
            >
              <ArrowUpRight size={18} />
            </motion.div>
          </div>

          {/* Bottom golden shine on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(197,164,126,0.08), rgba(212,175,55,0.04), transparent)',
            }}
          />

          {/* Golden bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
            <motion.div
              className="h-full w-[200%]"
              style={{
                background: 'linear-gradient(90deg, transparent, #c5a47e, #d4af37, #f5e6cc, transparent, #c5a47e, #d4af37, #f5e6cc, transparent)',
              }}
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Recent Patients */}
      {recentPatients.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springGentle, delay: 0.3 }}
              className="text-on-surface font-headline font-bold text-lg tracking-tight"
            >
              Pacientes Recientes
            </motion.h2>
            <Link to="/patients" className="text-accent font-semibold text-sm">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {recentPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05, ...springGentle }}
                whileHover={{ y: -3, scale: 1.015, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <Link
                  to={`/patients/${patient.id}`}
                  className="flex items-center gap-3 bg-white hover:bg-surface-container p-4 rounded-2xl border border-divider card-interactive"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={springBouncy}
                    className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-headline font-bold text-sm shrink-0"
                  >
                    {patient.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-semibold text-on-surface text-sm truncate">{patient.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {patient.dni ? `DNI: ${patient.dni}` : ''}
                      {patient.phone ? ` \u00b7 ${patient.phone}` : ''}
                    </p>
                  </div>
                  {patient.isVIP && (
                    <span className="text-[10px] font-bold bg-warning-container text-warning px-2 py-0.5 rounded-full">VIP</span>
                  )}
                  <ChevronRight className="text-muted shrink-0" size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Today's Sales */}
      {todaySales.length > 0 && (
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springGentle, delay: 0.4 }}
            className="text-on-surface font-headline font-bold text-lg mb-3 tracking-tight"
          >
            Ventas de Hoy
          </motion.h2>
          <div className="space-y-2">
            {todaySales.slice(0, 5).map((sale, idx) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + idx * 0.04, ...springGentle }}
                whileHover={{ y: -3, scale: 1.015, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.98, y: 0 }}
                className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-divider card-interactive"
              >
                <div className="w-10 h-10 rounded-xl bg-success-container flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm truncate">
                    {sale.patientName || 'Venta directa'}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-on-surface text-sm">{formatCurrency(sale.total)}</p>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    sale.status === 'completed' ? 'bg-success-container text-success' :
                    sale.status === 'cancelled' ? 'bg-error-container text-error' :
                    'bg-warning-container text-warning'
                  )}>
                    {sale.status === 'completed' ? 'Pagado' : sale.status === 'cancelled' ? 'Anulado' : 'Pendiente'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Sync Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="border border-divider rounded-full py-2.5 px-4 flex items-center justify-center gap-2"
      >
        <Cloud size={14} className="text-success" />
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-body font-medium text-on-surface-variant">Conectado a Supabase</span>
      </motion.div>

      {/* FAB — Premium magnetic lift */}
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ ...springBouncy, delay: 0.5 }}
        className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-40"
      >
        <motion.div
          whileHover={{
            y: -6,
            scale: 1.08,
            boxShadow: '0 8px 28px rgba(255,56,92,0.45), 0 0 0 4px rgba(255,56,92,0.1)',
          }}
          whileTap={{ y: 1, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="rounded-full"
        >
          <Link
            to="/sales"
            className="w-14 h-14 rounded-full bg-accent text-on-accent shadow-[0_4px_16px_rgba(255,56,92,0.35)] flex items-center justify-center"
            aria-label="Nueva Venta"
          >
            <Plus size={24} strokeWidth={2.5} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
