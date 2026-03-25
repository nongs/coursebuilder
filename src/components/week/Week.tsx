import React, { useMemo, useState } from 'react';
import '@styles/week/_week-tabs.scss';
import { useCourseStore } from '@store/courseStore';
import type { ID } from '@domain/types';
import DeleteConfirmModal from '@components/modal/DeleteConfirmModal';
import { showToast } from '@utils/toast';
import WeekTabs from '@components/week/WeekTabs';
import WeekActions from '@components/week/WeekActions';

const Week: React.FC = () => {
  const courseId = useCourseStore((s) => s.getActiveCourseId());
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const coursesById = useCourseStore((s) => s.coursesById);
  const weeksById = useCourseStore((s) => s.weeksById);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const weekIds = useMemo(() => {
    if (!courseId) return [] as ID[];
    const course = coursesById[courseId];
    if (!course) return [] as ID[];

    return [...course.weekIds].sort((a, b) => {
      const wa = weeksById[a];
      const wb = weeksById[b];
      return (wa?.order ?? 0) - (wb?.order ?? 0);
    });
  }, [courseId, coursesById, weeksById]);

  const activeWeekId = useMemo(() => {
    if (selectedWeekId && weekIds.includes(selectedWeekId)) return selectedWeekId;
    return weekIds[0];
  }, [selectedWeekId, weekIds]);

  const onRequestDeleteWeek = () => {
    if (!activeWeekId) return;
    if (weekIds.length <= 1) {
      showToast('주차는 최소 1개가 필요해서 삭제할 수 없습니다.', 'danger');
      return;
    }
    setIsConfirmDeleteOpen(true);
  };

  return (
    <div className="cb-weeksection" aria-label="주차 영역">
      <WeekTabs
        weekIds={weekIds}
        activeWeekId={activeWeekId}
        courseId={courseId}
        isReorderMode={isReorderMode}
      />
      <WeekActions
        courseId={courseId}
        activeWeekId={activeWeekId}
        weekIds={weekIds}
        isReorderMode={isReorderMode}
        onToggleReorderMode={() => setIsReorderMode((v) => !v)}
        onRequestDeleteWeek={onRequestDeleteWeek}
      />

      {courseId && activeWeekId ? (
        <DeleteConfirmModal
          isOpen={isConfirmDeleteOpen}
          target="week"
          courseId={courseId}
          weekId={activeWeekId}
          onClose={() => setIsConfirmDeleteOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default Week;
