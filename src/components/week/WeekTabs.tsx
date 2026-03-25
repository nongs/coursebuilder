import React, { useEffect, useRef, useState } from 'react';
import { useCourseStore } from '@store/courseStore';
import type { ID } from '@domain/types';
import { showToast } from '@utils/toast';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import WeekTab from '@components/week/WeekTab';

export interface WeekTabsProps {
  weekIds: ID[];
  activeWeekId: ID | undefined;
  courseId: ID | undefined;
  isReorderMode: boolean;
}

const WeekTabs: React.FC<WeekTabsProps> = ({ weekIds, activeWeekId, courseId, isReorderMode }) => {
  const selectWeek = useCourseStore((s) => s.selectWeek);
  const addWeek = useCourseStore((s) => s.addWeek);
  const reorderWeeks = useCourseStore((s) => s.reorderWeeks);

  const listRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

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

  const scrollByAmount = (dx: number) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };

  const onWheelList: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollLeft += e.deltaY;
  };

  const onClickAddWeek = () => {
    if (!courseId) return;
    addWeek(courseId);
    showToast('주차가 추가되었습니다.', 'success');
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
    showToast('주차 순서가 변경되었습니다.', 'success');
  };

  return (
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={weekIds} strategy={horizontalListSortingStrategy}>
              <div ref={listRef} className="cb-weektabs__list" onWheel={onWheelList}>
                {weekIds.map((weekId, index) => {
                  const isActive = activeWeekId === weekId;
                  return (
                    <WeekTab
                      key={weekId}
                      id={weekId}
                      index={index}
                      isActive={isActive}
                      isReorderMode={isReorderMode}
                      onSelect={() => selectWeek(weekId)}
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
        <button type="button" className="cb-weektabs__add" disabled={!courseId} onClick={onClickAddWeek}>
          + 주차 추가
        </button>
      </div>
    </div>
  );
};

export default WeekTabs;
