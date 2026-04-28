import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface RxInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  integer?: boolean;
  className?: string;
}

export default function RxInput({ label, value, onChange, integer = false, className }: RxInputProps) {
  const [display, setDisplay] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format value for display
  const formatValue = (v: number): string => {
    if (integer) return String(Math.round(v));
    return v.toFixed(2);
  };

  // Sync from parent when not focused (e.g. when patient RX loads)
  useEffect(() => {
    if (!focused) {
      setDisplay(formatValue(value));
    }
  }, [value, focused, integer]);

  const handleFocus = () => {
    setFocused(true);
    // Select all text so user types to replace
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (integer) {
      // Allow digits, minus, plus only
      if (/^[+\-]?\d*$/.test(raw)) {
        setDisplay(raw);
      }
    } else {
      // Allow digits, minus, plus, dot
      if (/^[+\-]?\d*\.?\d*$/.test(raw)) {
        setDisplay(raw);
      }
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseFloat(display);
    const final = isNaN(parsed) ? 0 : parsed;
    onChange(final);
    setDisplay(formatValue(final));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      aria-label={label}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-amber-50/80 border border-amber-200 rounded-lg py-2 px-2 text-center text-sm font-bold tabular-nums',
        'focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400',
        'transition-colors w-full',
        className,
      )}
    />
  );
}
