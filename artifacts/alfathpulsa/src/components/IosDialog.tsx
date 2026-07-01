import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDialogStore } from '../store/dialogStore';

export function IosDialog() {
  const { isOpen, title, message, confirmText, cancelText, confirmVariant, handle } = useDialogStore();

  const hasCancel = cancelText != null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ios-dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] flex items-center justify-center ios-backdrop ios-font"
          onClick={() => hasCancel && handle(false)}
        >
          <motion.div
            key="ios-dialog-panel"
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
              {hasCancel && (
                <button onClick={() => handle(false)} className="ios-alert-btn is-default">
                  {cancelText}
                </button>
              )}
              <button
                onClick={() => handle(true)}
                className={`ios-alert-btn ${confirmVariant === 'danger' ? 'is-destructive' : ''} ${hasCancel ? '' : 'is-default'}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
