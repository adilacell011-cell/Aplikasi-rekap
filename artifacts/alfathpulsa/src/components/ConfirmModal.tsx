import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Hapus',
  confirmVariant = 'danger',
}: ConfirmModalProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[500] flex items-center justify-center ios-backdrop ios-font"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={onCancel}
        >
          <motion.div
            key="confirm-modal-panel"
            initial={{ opacity: 0, scale: 0.82, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.7 }}
            className="ios-alert"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ios-alert-body">
              <h3 className="ios-alert-title">{title}</h3>
              {message && <div className="ios-alert-message">{message}</div>}
            </div>
            <div className="ios-alert-actions">
              <button onClick={onCancel} className="ios-alert-btn is-default">
                Batal
              </button>
              <button
                onClick={onConfirm}
                className={`ios-alert-btn ${confirmVariant === 'danger' ? 'is-destructive' : ''}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
