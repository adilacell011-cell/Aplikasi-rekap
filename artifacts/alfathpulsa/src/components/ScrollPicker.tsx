import React, { useRef, useEffect } from 'react';

export interface ScrollPickerOption {
  value: string;
  label: string;
}

interface ScrollPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: ScrollPickerOption[];
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function ScrollPicker({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  ariaLabel,
}: ScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = selectedRef.current;
      const offset = el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={`flex flex-row gap-2 overflow-x-auto no-scrollbar py-1 ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {options.map((opt) => {
        const selected = String(value) === String(opt.value);
        return (
          <button
            key={opt.value}
            ref={selected ? selectedRef : null}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            className={`shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200 active:scale-95 ${
              selected
                ? 'bg-brand-500 text-white border-transparent shadow-lg shadow-brand-500/20'
                : 'bg-transparent text-white/60 border-white/10 hover:border-white/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
