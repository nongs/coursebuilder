import React, { useEffect, useMemo, useRef, useState } from 'react';
import '@styles/course/_week-tabs.scss';
import { useCourseStore } from '@store/courseStore';
import type { ID } from '@domain/types';
import Modal from '@components/common/Modal';
import Toast from '@components/common/Toast';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableWeekTab: React.FC<{
  id: ID;
  index: number;
  isActive: boolean;
  isReorderMode: boolean;
  onClick: () => void;
}> = ({ id, index, isActive, isReorderMode, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isReorderMode
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={`cb-weektabs__tab ${isActive ? 'is-active' : ''} ${isReorderMode ? 'is-reorder' : ''}`}
      onClick={() => {
        // 순서 편집 모드에서는 탭 선택 변경을 막고, 드래그 조작만 허용
        if (isReorderMode) return;
        onClick();
      }}
      {...attributes}
      {...listeners}
    >
      {index + 1}
    </button>
  );
};

const WeekTabs: React.FC = () => {
  const courseId = useCourseStore((s) => s.getActiveCourseId());
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const selectWeek = useCourseStore((s) => s.selectWeek);
  const addWeek = useCourseStore((s) => s.addWeek);
  const deleteWeek = useCourseStore((s) => s.deleteWeek);
  const reorderWeeks = useCourseStore((s) => s.reorderWeeks);
  const duplicateWeek = useCourseStore((s) => s.duplicateWeek);
  const coursesById = useCourseStore((s) => s.coursesById);
  const weeksById = useCourseStore((s) => s.weeksById);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default' | 'success' | 'danger'>('default');
  const listRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

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

  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
  };

  useEffect(() => {
    updateScrollState();
  }, [weekIds.length]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    updateScrollState();
    const onScroll = () => updateScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [weekIds.length]);

  const onClickAddWeek = () => {
    if (!courseId) return;
    addWeek(courseId);
    setToastVariant('success');
    setToastMessage('주차가 추가되었습니다.');
  };

  const onClickDuplicateWeek = () => {
    if (!courseId || !activeWeekId) return;
    duplicateWeek(courseId, activeWeekId);
    setToastVariant('success');
    setToastMessage('주차가 복제되었습니다.');
  };

  const onToggleReorderMode = () => {
    setIsReorderMode((v) => !v);
  };

  const scrollByAmount = (dx: number) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };

  const onWheelList: React.WheelEventHandler<HTMLDivElement> = (e) => {
    // 트랙패드/휠로 가로 스크롤이 어려운 환경을 보완 (세로 스크롤을 가로로 변환)
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollLeft += e.deltaY;
  };

  const onClickDeleteWeek = () => {
    if (!activeWeekId) return;
    if (weekIds.length <= 1) {
      setToastVariant('danger');
      setToastMessage('주차는 최소 1개가 필요해서 삭제할 수 없습니다.');
      return;
    }
    setIsConfirmDeleteOpen(true);
  };

  const onConfirmDelete = () => {
    if (!courseId || !activeWeekId) return;
    deleteWeek(courseId, activeWeekId);
    setIsConfirmDeleteOpen(false);
    setToastVariant('success');
    setToastMessage('주차가 삭제되었습니다.');
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = weekIds.findIndex((id) => id === active.id);
    const newIndex = weekIds.findIndex((id) => id === over.id);
    if (oldIndex < 0 || newIndex < 0 || !courseId) return;

    const next = arrayMove(weekIds, oldIndex, newIndex);
    reorderWeeks(courseId, next);
    setToastVariant('success');
    setToastMessage('주차 순서가 변경되었습니다.');
  };

  return (
    <div className="cb-weeksection" aria-label="주차 영역">
      <div className="cb-weektabs" aria-label="주차 탭">
        <div className="cb-weektabs__bar">
          <div className="cb-weektabs__listwrap">
            {canScrollLeft && (
              <button
                type="button"
                className="cb-weektabs__scrollbtn cb-weektabs__scrollbtn--left"
                aria-label="왼쪽으로 스크롤"
                onClick={() => scrollByAmount(-240)}
              >
                &lt;
              </button>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext items={weekIds} strategy={horizontalListSortingStrategy}>
                <div ref={listRef} className="cb-weektabs__list" onWheel={onWheelList}>
                  {weekIds.map((weekId, index) => {
                    const isActive = activeWeekId === weekId;
                    return (
                      <SortableWeekTab
                        key={weekId}
                        id={weekId}
                        index={index}
                        isActive={isActive}
                        isReorderMode={isReorderMode}
                        onClick={() => selectWeek(weekId)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
            {canScrollRight && (
              <button
                type="button"
                className="cb-weektabs__scrollbtn cb-weektabs__scrollbtn--right"
                aria-label="오른쪽으로 스크롤"
                onClick={() => scrollByAmount(240)}
              >
                &gt;
              </button>
            )}
          </div>
          <button
            type="button"
            className="cb-weektabs__add"
            disabled={!courseId}
            onClick={onClickAddWeek}
          >
            + 주차 추가
          </button>
        </div>
      </div>

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
            onClick={onClickDeleteWeek}
          >
            주차 삭제
          </button>
        </div>
      </div>

      <Modal
        isOpen={isConfirmDeleteOpen}
        title="주차 삭제"
        onClose={() => setIsConfirmDeleteOpen(false)}
        footer={
          <>
            <button className="cb-btn cb-btn--primary" onClick={onConfirmDelete}>
              삭제
            </button>
            <button className="cb-btn" onClick={() => setIsConfirmDeleteOpen(false)}>
              닫기
            </button>
          </>
        }
      >
        <p className="cb-modal__text">
          선택된 주차와 그 하위(챕터/페이지/학습요소) 데이터가 모두 삭제됩니다.
          <br />
          정말 삭제할까요?
        </p>
      </Modal>

      <Toast
        isOpen={toastMessage !== null}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
        variant={toastVariant}
      />
    </div>
  );
};

export default WeekTabs;

