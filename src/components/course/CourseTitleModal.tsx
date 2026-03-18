import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@components/common/Modal';

export interface CourseTitleModalProps {
  isOpen: boolean;
  initialTitle: string;
  mode: 'edit' | 'create';
  onClose: () => void;
  onSaveClick: (nextTitle: string) => void;
}

const CourseTitleModal: React.FC<CourseTitleModalProps> = ({
  isOpen,
  initialTitle,
  mode,
  onClose,
  onSaveClick
}) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle);
  }, [isOpen, initialTitle]);

  const modalTitle = useMemo(() => {
    return mode === 'create' ? '새 코스 만들기' : '강의명 수정';
  }, [mode]);

  const onClickSave = () => {
    onSaveClick(title.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      title={modalTitle}
      onClose={onClose}
      footer={
        <>
          <button className="cb-btn cb-btn--primary" onClick={onClickSave}>
            저장
          </button>
          <button className="cb-btn" onClick={onClose}>
            닫기
          </button>
        </>
      }
    >
      <input
        className="cb-input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="강의명을 입력하세요"
      />
    </Modal>
  );
};

export default CourseTitleModal;

