import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      }, 1800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, onClose]);

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 480, damping: 34, mass: 0.8 }}
          className="fixed left-1/2 -translate-x-1/2 z-[600] w-[88%] max-w-sm ios-font pointer-events-none"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
        >
          <div className="ios-card flex items-center gap-3 px-4 py-3 shadow-2xl">
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
    </AnimatePresence>,
    document.body
  );
}
