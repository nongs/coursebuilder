import React from 'react';
import { useCourseStore } from '@store/courseStore';
import type { ID } from '@domain/types';
import { showToast } from '@utils/toast';

export interface WeekActionsProps {
  courseId: ID | undefined;
  activeWeekId: ID | undefined;
  weekIds: ID[];
  isReorderMode: boolean;
  onToggleReorderMode: () => void;
  onRequestDeleteWeek: () => void;
}

const WeekActions: React.FC<WeekActionsProps> = ({
  courseId,
  activeWeekId,
  weekIds,
  isReorderMode,
  onToggleReorderMode,
  onRequestDeleteWeek
}) => {
  const duplicateWeek = useCourseStore((s) => s.duplicateWeek);

  const onClickDuplicateWeek = () => {
    if (!courseId || !activeWeekId) return;
    duplicateWeek(courseId, activeWeekId);
    showToast('주차가 복제되었습니다.', 'success');
  };

  return (
    <div className="cb-weekactions" aria-label="주차 기능">
      <div className="cb-weekactions__right">
        <button
          type="button"
          className="cb-weekactions__btn"
          disabled={!courseId || !activeWeekId}
          onClick={onClickDuplicateWeek}
        >
          주차 복제
        </button>
        <button
          type="button"
          className={`cb-weekactions__btn ${isReorderMode ? 'is-active' : ''}`}
          disabled={!courseId || !activeWeekId}
          onClick={onToggleReorderMode}
        >
          {isReorderMode ? '순서 편집 종료' : '순서 편집'}
        </button>
        <button
          type="button"
          className={`cb-weekactions__btn cb-weekactions__btn--danger ${
            !courseId || weekIds.length <= 1 ? 'is-disabled' : ''
          }`}
          disabled={!courseId || weekIds.length <= 1}
          onClick={onRequestDeleteWeek}
        >
          주차 삭제
        </button>
      </div>
    </div>
  );
};

export default WeekActions;
