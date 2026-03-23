import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@components/common/Modal';

export interface CourseTitleModalProps {
  isOpen: boolean;
  initialTitle: string;
  mode: 'edit' | 'create';
  /** 닫기 가능 여부. false면 강의 생성 전까지 모달 닫을 수 없음 */
  closable?: boolean;
  onClose: () => void;
  onSaveClick: (nextTitle: string, weekCount?: number) => void;
}

const CourseTitleModal: React.FC<CourseTitleModalProps> = ({
  isOpen,
  initialTitle,
  mode,
  closable = true,
  onClose,
  onSaveClick
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [weekCount, setWeekCount] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle);
    setWeekCount(1);
  }, [isOpen, initialTitle]);

  const modalTitle = useMemo(() => {
    return mode === 'create' ? '새 강의 만들기' : '강의명 수정';
  }, [mode]);

  const onClickSave = () => {
    if (mode === 'create') {
      onSaveClick(title.trim(), weekCount);
    } else {
      onSaveClick(title.trim());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={modalTitle}
      onClose={onClose}
      closable={closable}
      footer={
        <>
          <button className="cb-btn cb-btn--primary" onClick={onClickSave}>
            저장
          </button>
          {closable && (
            <button className="cb-btn" onClick={onClose}>
              닫기
            </button>
          )}
        </>
      }
    >
      <div className="cb-coursemodal">
        <div className="cb-coursemodal__field">
          <label className="cb-coursemodal__label">강의명</label>
          <input
            className="cb-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="강의명을 입력하세요"
          />
        </div>
        {mode === 'create' && (
          <div className="cb-coursemodal__field">
            <label className="cb-coursemodal__label">주차 설정</label>
            <div className="cb-coursemodal__week">
              <input
                type="number"
                className="cb-input cb-input--number"
                min={1}
                max={99}
                value={weekCount}
                onChange={(e) => {
                  const v = e.target.valueAsNumber;
                  if (!Number.isNaN(v)) setWeekCount(Math.max(1, Math.min(99, Math.floor(v))));
                  else if (e.target.value === '') setWeekCount(1);
                }}
              />
              <span className="cb-coursemodal__unit">주차</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CourseTitleModal;

