import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

interface AnimatedFeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
  iconColor?: string;
  iconBg?: string;
  index?: number;
}

const springConfig = { type: 'spring' as const, stiffness: 280, damping: 22 };

export function AnimatedFeatureCard({
  icon: Icon,
  title,
  description,
  onClick,
  className,
  iconColor = 'text-accent',
  iconBg = 'bg-accent-light',
  index = 0,
}: AnimatedFeatureCardProps) {
  return (
    <motion.div
      className={cn(
        'relative flex items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 border border-divider',
        onClick && 'cursor-pointer',
        className,
      )}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.06, ...springConfig }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
      whileTap={onClick ? { scale: 0.97, y: 0 } : {}}
      onClick={onClick}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-headline font-bold text-on-surface text-[15px] leading-tight">{title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{description}</p>
      </div>
      {onClick && (
        <ChevronRight className="text-muted shrink-0" size={18} />
      )}
    </motion.div>
  );
}
