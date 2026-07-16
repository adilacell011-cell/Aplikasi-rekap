import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { useBgThemeStore, BG_PRESETS, BgTheme } from '../store/bgThemeStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function BgThemePicker({ isOpen, onClose }: Props) {
  const { bg, setBg } = useBgThemeStore();

  const handleSelect = (id: BgTheme) => {
    setBg(id);
    document.body.setAttribute('data-bg', id);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="bg-picker-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[500] flex items-end justify-center ios-backdrop ios-font pb-[env(safe-area-inset-bottom,0px)]"
          onClick={onClose}
        >
          <motion.div
            key="bg-picker-panel"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
            className="w-full max-w-md glass-card-strong rounded-b-none rounded-t-[2rem] p-6 pb-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Tema Latar</h3>
                <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-0.5">Pilih warna background</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white rounded-xl border border-white/10 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preset grid */}
            <div className="grid grid-cols-4 gap-3">
              {BG_PRESETS.map((preset) => {
                const isActive = bg === preset.id;
                const [c1, c2, c3] = preset.colors;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset.id)}
                    className={`flex flex-col items-center gap-2 group transition-all active:scale-95`}
                  >
                    {/* Gradient preview circle */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg"
                      style={{
                        background: `radial-gradient(ellipse 120% 100% at 30% 20%, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
                        boxShadow: isActive
                          ? `0 0 0 3px #fff, 0 0 0 5px ${c1}90, 0 8px 24px ${c1}40`
                          : '0 4px 12px rgba(0,0,0,0.4)',
                      }}
                    >
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-gray-800 stroke-[3px]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <p className="text-base leading-none">{preset.emoji}</p>
                      <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 leading-none transition-colors ${
                        isActive ? 'text-white' : 'text-white/50'
                      }`}>
                        {preset.label.split(' ')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current theme info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl leading-none">{BG_PRESETS.find(p => p.id === bg)?.emoji}</span>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-tight">
                  {BG_PRESETS.find(p => p.id === bg)?.label}
                </p>
                <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Aktif sekarang</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
