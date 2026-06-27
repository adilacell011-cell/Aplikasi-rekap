import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 ios-backdrop animate-in fade-in duration-200"
      onClick={onCancel}
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
      </div>
    </div>
  );
}
