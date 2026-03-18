import React, { PropsWithChildren } from 'react';
import '@styles/components/_modal.scss';

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  showCloseIcon?: boolean;
  footer?: React.ReactNode;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  title,
  onClose,
  showCloseIcon = true,
  footer,
  children
}) => {
  if (!isOpen) return null;
  return (
    <div className="cb-modal__backdrop" role="dialog" aria-modal="true">
      <div className="cb-modal">
        <div className="cb-modal__header">
          <h3 className="cb-modal__title">{title}</h3>
          {showCloseIcon && (
            <button
              aria-label="닫기"
              className="cb-modal__iconbtn"
              onClick={onClose}
            >
              &#10005;
            </button>
          )}
        </div>
        <div className="cb-modal__content">{children}</div>
        {footer && <div className="cb-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

