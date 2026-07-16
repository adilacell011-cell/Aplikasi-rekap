import React, { useRef } from 'react';

export interface BlockChoiceOption {
  value: string;
  label: string;
}

interface BlockChoiceProps {
  value: string;
  onChange: (value: string) => void;
  options: BlockChoiceOption[];
  columns?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

export function BlockChoice({
  value,
  onChange,
  options,
  columns,
  disabled = false,
  size = 'md',
  className = '',
  ariaLabel,
}: BlockChoiceProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const sizeClass =
    size === 'sm' ? 'px-3 py-2 text-[10px]' : 'px-4 py-3.5 text-xs';

  const containerClass = columns ? 'grid gap-2' : 'flex flex-wrap gap-2';

  const containerStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  const selectedIndex = options.findIndex(
    (opt) => String(value) === String(opt.value),
  );

  const focusOption = (index: number) => {
    const len = options.length;
    if (len === 0) return;
    const next = ((index % len) + len) % len;
    refs.current[next]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = index + 1 >= options.length ? 0 : index + 1;
      onChange(options[next].value);
      focusOption(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = index - 1 < 0 ? options.length - 1 : index - 1;
      onChange(options[prev].value);
      focusOption(prev);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`${containerClass} ${className}`}
      style={containerStyle}
    >
      {options.map((opt, index) => {
        const selected = String(value) === String(opt.value);
        const isTabStop =
          selectedIndex === -1 ? index === 0 : selected;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            tabIndex={disabled ? -1 : isTabStop ? 0 : -1}
            onClick={() => !disabled && onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`rounded-2xl font-black uppercase tracking-widest text-center border transition-all active:scale-95 ${sizeClass} ${
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
