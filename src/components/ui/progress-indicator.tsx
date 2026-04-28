import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CircleCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepProgressProps {
  totalSteps?: number;
  onFinish?: () => void;
  className?: string;
  continueLabel?: string;
  backLabel?: string;
  finishLabel?: string;
  accentColor?: string;
}

export function StepProgress({
  totalSteps = 3,
  onFinish,
  className,
  continueLabel = 'Continuar',
  backLabel = 'Atras',
  finishLabel = 'Finalizar',
  accentColor = '#FF385C',
}: StepProgressProps) {
  const [step, setStep] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setIsExpanded(false);
    } else {
      onFinish?.();
    }
  };

  const handleBack = () => {
    if (step === 2) setIsExpanded(true);
    if (step > 1) setStep(step - 1);
  };

  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const gapPx = 24; // gap-6
  const dotPx = 8;
  const progressWidth = step === 1
    ? dotPx * 3
    : dotPx * 3 + (step - 1) * (dotPx + gapPx);

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      {/* Dots */}
      <div className="flex items-center gap-6 relative">
        {dots.map((dot) => (
          <div
            key={dot}
            className={cn(
              'w-2 h-2 rounded-full relative z-10 transition-colors duration-300',
              dot <= step ? 'bg-white' : 'bg-on-surface-variant/30'
            )}
          />
        ))}

        {/* Animated progress bar */}
        <motion.div
          initial={{ width: dotPx * 3, height: dotPx * 3 }}
          animate={{ width: progressWidth, height: dotPx * 3 }}
          className="absolute -left-[8px] -top-[8px] rounded-full"
          style={{ background: accentColor }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 0.8,
            bounce: 0.25,
          }}
        />
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm">
        <motion.div
          className="flex items-center gap-2"
          animate={{ justifyContent: isExpanded ? 'stretch' : 'space-between' }}
        >
          <AnimatePresence>
            {!isExpanded && (
              <motion.button
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 80, scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                  mass: 0.8,
                  opacity: { duration: 0.2 },
                }}
                onClick={handleBack}
                className="px-4 py-3 text-on-surface flex items-center justify-center bg-surface-container font-semibold rounded-full hover:bg-divider transition-colors text-sm overflow-hidden"
              >
                {backLabel}
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleContinue}
            animate={{ flex: isExpanded ? 1 : 'inherit' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'px-4 py-3 rounded-full text-white transition-colors',
              !isExpanded && 'w-48'
            )}
            style={{ background: step === totalSteps ? '#008A05' : accentColor }}
          >
            <div className="flex items-center font-semibold justify-center gap-2 text-sm">
              {step === totalSteps && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                    mass: 0.5,
                    bounce: 0.4,
                  }}
                >
                  <CircleCheck size={16} />
                </motion.div>
              )}
              {step === totalSteps ? finishLabel : continueLabel}
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Compact dot-only indicator (for embedding in forms) ──
interface ProgressDotsProps {
  current: number;
  total: number;
  className?: string;
  accentColor?: string;
}

export function ProgressDots({ current, total, className, accentColor = '#FF385C' }: ProgressDotsProps) {
  const dots = Array.from({ length: total }, (_, i) => i + 1);
  const gapPx = 12;
  const dotPx = 8;
  const progressWidth = current === 1
    ? dotPx * 3
    : dotPx * 3 + (current - 1) * (dotPx + gapPx);

  return (
    <div className={cn('flex items-center gap-3 relative', className)}>
      {dots.map((dot) => (
        <motion.div
          key={dot}
          animate={{
            scale: dot === current ? 1.3 : 1,
            opacity: dot <= current ? 1 : 0.3,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={cn(
            'w-2 h-2 rounded-full relative z-10',
            dot <= current ? 'bg-white' : 'bg-on-surface-variant/30'
          )}
        />
      ))}
      <motion.div
        animate={{ width: progressWidth }}
        className="absolute -left-[4px] -top-[4px] h-4 rounded-full"
        style={{ background: accentColor, opacity: 0.25 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
    </div>
  );
}

export default StepProgress;
