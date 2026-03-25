import React from 'react';
import Modal from '@components/modal/Modal';

export interface RichTextImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt: string;
  onChangeUrl: (value: string) => void;
  onChangeAlt: (value: string) => void;
  onClose: () => void;
  onApply: () => void;
}

const RichTextImageModal: React.FC<RichTextImageModalProps> = ({
  isOpen,
  imageUrl,
  imageAlt,
  onChangeUrl,
  onChangeAlt,
  onClose,
  onApply
}) => (
  <Modal
    isOpen={isOpen}
    title="이미지"
    onClose={onClose}
    footer={
      <>
        <button type="button" className="cb-btn cb-btn--primary" onClick={onApply}>
          삽입
        </button>
        <button type="button" className="cb-btn" onClick={onClose}>
          닫기
        </button>
      </>
    }
  >
    <div className="cb-richmodal">
      <label className="cb-richmodal__label">이미지 주소</label>
      <input
        className="cb-input cb-richmodal__input"
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder="https://… (웹에 공개된 이미지 URL)"
        value={imageUrl}
        onChange={(e) => onChangeUrl(e.target.value)}
      />
      <label className="cb-richmodal__label">대체 텍스트 (선택)</label>
      <input
        className="cb-input cb-richmodal__input"
        type="text"
        placeholder="스크린 리더용 설명"
        value={imageAlt}
        onChange={(e) => onChangeAlt(e.target.value)}
      />
      <p className="cb-richmodal__hint">
        이미지는 http(s) URL만 저장됩니다. Imgur·GitHub raw·CDN 등 공개 URL을 사용해 주세요.
      </p>
    </div>
  </Modal>
);

export default RichTextImageModal;
