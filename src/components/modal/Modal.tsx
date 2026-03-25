import React, { PropsWithChildren } from 'react';
import '@styles/components/_modal.scss';

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  /** 닫기 버튼/백드롭 클릭으로 닫을 수 있는지. false면 강제 모달 (저장 전 닫기 불가) */
  closable?: boolean;
  showCloseIcon?: boolean;
  footer?: React.ReactNode;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  title,
  onClose,
  closable = true,
  showCloseIcon,
  footer,
  children
}) => {
  const canClose = closable;
  const displayCloseIcon = showCloseIcon ?? canClose;
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && canClose) onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="cb-modal__backdrop" role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className="cb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cb-modal__header">
          <h3 className="cb-modal__title">{title}</h3>
          {displayCloseIcon && (
            <button aria-label="닫기" className="cb-modal__iconbtn" onClick={onClose}>
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
