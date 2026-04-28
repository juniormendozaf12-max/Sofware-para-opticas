import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Eye } from 'lucide-react';

// Detect if running inside Capacitor (Android/iOS app)
const isNativeApp = typeof (window as any).Capacitor !== 'undefined'
  || window.location.protocol === 'file:'
  || navigator.userAgent.includes('CapacitorApp');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Animación rápida para móvil - total 1.5s
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => {
        sessionStorage.setItem('oa_splash_shown', '1');
        onFinish();
      }, 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  const exiting = phase >= 3;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      animate={{
        opacity: exiting ? 0 : 1,
      }}
      transition={{ duration: 0.3 }}
      style={{
        background: isNativeApp
          ? 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)'
          : '#ffffff',
        minHeight: '100dvh',
      }}
    >
      {/* Fondo simple con gradiente sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isNativeApp
            ? 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(255,56,92,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Contenido centrado */}
      <div className="flex flex-col items-center gap-5 relative z-10">
        {/* Logo */}
        {phase >= 1 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-20 h-20 rounded-[24px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)',
              boxShadow: isNativeApp
                ? '0 8px 32px rgba(255,56,92,0.4)'
                : '0 6px 24px rgba(255,56,92,0.25)',
            }}
          >
            <Eye size={38} strokeWidth={1.8} color="white" />
          </motion.div>
        )}

        {/* Título */}
        {phase >= 2 && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center gap-2"
          >
            <h1
              className="text-[26px] font-extrabold tracking-[0.08em]"
              style={{
                fontFamily: 'Manrope, system-ui, sans-serif',
                color: isNativeApp ? '#ffffff' : '#222222',
              }}
            >
              CENTRO OPTICO
            </h1>

            {/* Línea decorativa */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="h-[2px] w-32 origin-center"
              style={{
                background: 'linear-gradient(90deg, transparent, #FF385C, transparent)',
              }}
            />

            <p
              className="text-[10px] uppercase font-semibold tracking-[0.4em]"
              style={{
                color: isNativeApp ? 'rgba(255,255,255,0.6)' : 'rgba(34,34,34,0.5)',
              }}
            >
              Sicuani
            </p>
          </motion.div>
        )}

        {/* Loading indicator */}
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-1 mt-4"
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: isNativeApp ? '#FF385C' : '#FF385C',
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
