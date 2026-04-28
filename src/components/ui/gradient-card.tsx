import * as React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

type GradientVariant = 'accent' | 'success' | 'info' | 'warning' | 'purple';

const gradientMap: Record<GradientVariant, string> = {
  accent: 'from-[#FFF0F3] to-[#FFE0E6]',
  success: 'from-[#E6F7E6] to-[#D0F0D0]',
  info: 'from-[#EBF3FF] to-[#D6E8FF]',
  warning: 'from-[#FFF8E1] to-[#FFECB3]',
  purple: 'from-[#F3E8FF] to-[#E8D5FF]',
};

const iconBgMap: Record<GradientVariant, string> = {
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/15 text-success',
  info: 'bg-info/15 text-info',
  warning: 'bg-warning/15 text-warning',
  purple: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
};

interface GradientCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  gradient?: GradientVariant;
  value?: string | number;
  badge?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const springConfig = { type: 'spring' as const, stiffness: 400, damping: 28 };

export function GradientCard({
  icon: Icon,
  title,
  description,
  gradient = 'info',
  value,
  badge,
  onClick,
  className,
  children,
}: GradientCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}
      whileTap={onClick ? { scale: 0.97, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl p-5 shadow-sm",
        "bg-gradient-to-br",
        gradientMap[gradient],
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBgMap[gradient])}>
          <Icon size={20} />
        </div>
        {badge && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm",
            gradient === 'accent' && 'text-accent',
            gradient === 'success' && 'text-success',
            gradient === 'info' && 'text-info',
            gradient === 'warning' && 'text-warning',
            gradient === 'purple' && 'text-[#8B5CF6]',
          )}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1">
        {value !== undefined && (
          <h3 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight mb-1">{value}</h3>
        )}
        <p className="font-headline font-bold text-on-surface text-sm">{title}</p>
        {description && (
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}
