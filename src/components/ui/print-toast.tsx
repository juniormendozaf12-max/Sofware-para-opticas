import { motion } from 'motion/react';
import { Printer, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface PrintToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onDismiss: () => void;
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-primary text-white',
};

export default function PrintToast({ type, message, onDismiss }: PrintToastProps) {
  const Icon = ICONS[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-24 left-4 right-4 z-[99999] lg:left-auto lg:right-8 lg:bottom-8 lg:max-w-sm"
    >
      <div className={`${COLORS[type]} rounded-2xl px-5 py-4 flex items-center gap-3 shadow-2xl`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Printer size={18} className="shrink-0 opacity-80" />
          <Icon size={18} className="shrink-0" />
          <span className="text-sm font-semibold truncate">{message}</span>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}
