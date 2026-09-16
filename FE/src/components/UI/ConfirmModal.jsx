import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-swagat" style={{ maxWidth: '440px' }}>
        <div className="modal-body-swagat" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div 
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: isDanger ? '#FEE2E2' : '#FEF3C7',
              color: isDanger ? '#DC2626' : '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 16px'
            }}
          >
            <FiAlertTriangle />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            {message}
          </p>
        </div>
        <div className="modal-footer-swagat" style={{ justifyContent: 'center' }}>
          <button className="btn-outline-swagat" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className={isDanger ? 'btn-primary-swagat' : 'btn-accent-swagat'} 
            style={{ backgroundColor: isDanger ? 'var(--danger)' : undefined }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
