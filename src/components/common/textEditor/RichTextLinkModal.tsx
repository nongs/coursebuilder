import React from 'react';
import Modal from '@components/modal/Modal';

export interface RichTextLinkModalProps {
  isOpen: boolean;
  linkUrl: string;
  linkLabel: string;
  onChangeUrl: (value: string) => void;
  onChangeLabel: (value: string) => void;
  onClose: () => void;
  onApply: () => void;
  onRemove: () => void;
}

const RichTextLinkModal: React.FC<RichTextLinkModalProps> = ({
  isOpen,
  linkUrl,
  linkLabel,
  onChangeUrl,
  onChangeLabel,
  onClose,
  onApply,
  onRemove
}) => (
  <Modal
    isOpen={isOpen}
    title="링크"
    onClose={onClose}
    footer={
      <>
        <button type="button" className="cb-btn cb-btn--primary" onClick={onApply}>
          적용
        </button>
        <button type="button" className="cb-btn" onClick={onRemove}>
          링크 제거
        </button>
        <button type="button" className="cb-btn" onClick={onClose}>
          닫기
        </button>
      </>
    }
  >
    <div className="cb-richmodal">
      <label className="cb-richmodal__label">URL</label>
      <input
        className="cb-input cb-richmodal__input"
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="https://"
        value={linkUrl}
        onChange={(e) => onChangeUrl(e.target.value)}
      />
      <p className="cb-richmodal__hint">선택 영역이 없으면 아래 텍스트가 삽입되며 링크가 걸립니다.</p>
      <label className="cb-richmodal__label">표시 텍스트 (선택 없을 때)</label>
      <input
        className="cb-input cb-richmodal__input"
        type="text"
        placeholder="비우면 URL과 동일하게 표시"
        value={linkLabel}
        onChange={(e) => onChangeLabel(e.target.value)}
      />
    </div>
  </Modal>
);

export default RichTextLinkModal;
