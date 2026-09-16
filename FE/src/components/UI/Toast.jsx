import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

export default function Toast({ toasts = [], onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container-swagat">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          {toast.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => onClose(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
}
