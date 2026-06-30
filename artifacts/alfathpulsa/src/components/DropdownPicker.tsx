import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownPickerOption {
  value: string;
  label: string;
}

interface DropdownPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownPickerOption[];
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function DropdownPicker({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  ariaLabel,
}: DropdownPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? value;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`} aria-label={ariaLabel}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-3 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${
          open
            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
            : 'border-asphalt-700 bg-asphalt-900 text-asphalt-text-300 hover:border-asphalt-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180 text-brand-400' : 'text-asphalt-text-400'}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-asphalt-800 border border-asphalt-700 rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt, i) => {
            const selected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-[11px] font-black uppercase tracking-widest transition-colors text-left ${
                  selected
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-asphalt-text-300 hover:bg-asphalt-700/50'
                } ${i > 0 ? 'border-t border-asphalt-700/50' : ''}`}
              >
                <span>{opt.label}</span>
                {selected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
