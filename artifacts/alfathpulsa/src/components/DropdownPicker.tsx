import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [rect, setRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? value;

  const updateRect = useCallback(() => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open, updateRect]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const dropdownStyle: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        maxHeight: 220,
        overflowY: 'auto',
      }
    : { display: 'none' };

  return (
    <div className={`relative ${className}`} aria-label={ariaLabel}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        className={`w-full flex items-center justify-between gap-3 px-5 py-3 border font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${
          open
            ? 'rounded-t-2xl rounded-b-none border-b-0 border-brand-500 bg-brand-500/10 text-brand-400'
            : 'rounded-2xl border-asphalt-700 bg-asphalt-900 text-asphalt-text-300 hover:border-asphalt-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180 text-brand-400' : 'text-asphalt-text-400'}`}
        />
      </button>

      {open && rect && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-asphalt-800 border border-t-0 border-brand-500 rounded-b-2xl shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5)] overflow-y-auto no-scrollbar animate-in fade-in duration-150"
        >
          {options.map((opt, i) => {
            const selected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-[11px] font-black uppercase tracking-widest transition-colors text-left ${
                  selected
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-asphalt-text-300 hover:bg-asphalt-700/50'
                } ${i > 0 ? 'border-t border-asphalt-700/40' : ''}`}
              >
                <span>{opt.label}</span>
                {selected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
