import React, { useEffect } from 'react';
import '@styles/components/_toast.scss';

export interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  durationMs?: number;
  variant?: 'default' | 'success' | 'danger';
}

const Toast: React.FC<ToastProps> = ({
  message,
  isOpen,
  onClose,
  durationMs = 2500,
  variant = 'default'
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [isOpen, onClose, durationMs]);

  if (!isOpen) return null;

  return (
    <div className="cb-toast" role="status" aria-live="polite">
      <div className={`cb-toast__card ${variant !== 'default' ? `is-${variant}` : ''}`}>
        {message}
      </div>
    </div>
  );
};

export default Toast;

