import React, { ReactNode, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Check, Loader2 } from 'lucide-react';

type CTAState = 'idle' | 'loading' | 'success' | 'error';

interface PremiumCTAProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  state?: CTAState;
  className?: string;
  successText?: string;
  errorText?: string;
  gradient?: 'accent' | 'success' | 'dark';
}

const springConfig = { type: 'spring' as const, stiffness: 400, damping: 30 };
const springBouncy = { type: 'spring' as const, stiffness: 500, damping: 25 };

const gradients: Record<string, { bg: string; shadow: string; glow: string }> = {
  accent: {
    bg: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 50%, #BD1550 100%)',
    shadow: 'rgba(255, 56, 92, 0.4)',
    glow: 'rgba(255, 56, 92, 0.25)',
  },
  success: {
    bg: 'linear-gradient(135deg, #00C853 0%, #008A05 100%)',
    shadow: 'rgba(0, 138, 5, 0.4)',
    glow: 'rgba(0, 138, 5, 0.25)',
  },
  dark: {
    bg: 'linear-gradient(135deg, #333 0%, #111 100%)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    glow: 'rgba(0, 0, 0, 0.15)',
  },
};

export function PremiumCTA({
  children,
  onClick,
  disabled = false,
  state = 'idle',
  className,
  successText = 'Listo!',
  errorText = 'Error',
  gradient = 'accent',
}: PremiumCTAProps) {
  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const isIdle = state === 'idle';
  const g = gradients[gradient];

  const currentBg = isSuccess
    ? gradients.success.bg
    : isError
      ? 'linear-gradient(135deg, #C13515 0%, #9B1B0E 100%)'
      : g.bg;

  const currentShadow = isSuccess
    ? gradients.success.shadow
    : isError
      ? 'rgba(193, 53, 21, 0.4)'
      : g.shadow;

  return (
    <motion.button
      onClick={isIdle && !disabled ? onClick : undefined}
      disabled={disabled || !isIdle}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl font-bold text-white text-base',
        'flex items-center justify-center gap-2.5',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        className,
      )}
      style={{
        background: currentBg,
        height: 56,
        boxShadow: `0 4px 0 rgba(0,0,0,0.12), 0 8px 24px ${currentShadow}`,
      } as CSSProperties}
      whileHover={isIdle && !disabled ? {
        y: -2,
        boxShadow: `0 6px 0 rgba(0,0,0,0.12), 0 12px 32px ${currentShadow}`,
      } : {}}
      whileTap={isIdle && !disabled ? {
        y: 2,
        scale: 0.98,
        boxShadow: `0 1px 0 rgba(0,0,0,0.12), 0 3px 8px ${currentShadow}`,
      } : {}}
      transition={springConfig}
    >
      {/* Shimmer overlay on idle */}
      {isIdle && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
        />
      )}

      {/* Content with state transitions */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={springBouncy}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={22} />
            </motion.div>
            <span className="text-white/90">Procesando...</span>
          </motion.div>
        )}

        {isSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={springBouncy}
            className="flex items-center gap-2.5"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...springBouncy, delay: 0.1 }}
            >
              <Check size={22} strokeWidth={3} />
            </motion.div>
            <span>{successText}</span>
          </motion.div>
        )}

        {isError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={springConfig}
            className="flex items-center gap-2"
          >
            <span>{errorText}</span>
          </motion.div>
        )}

        {isIdle && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={springConfig}
            className="flex items-center gap-2.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom edge highlight */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
      />
    </motion.button>
  );
}
