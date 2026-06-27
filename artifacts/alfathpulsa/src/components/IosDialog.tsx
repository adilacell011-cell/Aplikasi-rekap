import React from 'react';
import { useDialogStore } from '../store/dialogStore';

export function IosDialog() {
  const { isOpen, title, message, confirmText, cancelText, confirmVariant, handle } = useDialogStore();
  if (!isOpen) return null;

  const hasCancel = cancelText != null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-6 ios-backdrop animate-in fade-in duration-200"
      onClick={() => hasCancel && handle(false)}
    >
      <div
        className="ios-alert ios-font animate-in zoom-in-95 fade-in duration-200"
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
      </div>
    </div>
  );
}
