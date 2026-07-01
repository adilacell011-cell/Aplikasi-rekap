import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuccessToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function SuccessToast({ show, message, onClose }: SuccessToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.8 }}
          className="fixed top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-1/2 -translate-x-1/2 z-[110] w-[88%] max-w-sm ios-font pointer-events-none"
        >
          <div className="ios-card flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-[#34c759] flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-5 h-5 ios-on-color stroke-[3px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="ios-card-title text-[15px] font-semibold leading-tight tracking-[-0.01em]">Berhasil</p>
              <p className="ios-card-sub text-[13px] font-normal leading-snug mt-0.5 line-clamp-2">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
