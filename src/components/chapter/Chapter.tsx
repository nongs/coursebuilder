import React from 'react';
import '@styles/chapter/_chapter.scss';
import { useCourseStore } from '@store/courseStore';
import { showToast } from '@utils/toast';
import { DndContext, DragOverlay, DragEndEvent, DragStartEvent, DragOverEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ID } from '@domain/types';
import ChapterCard from '@components/chapter/ChapterCard';
import {
  createChapterTreeCollisionDetection,
  resolveOverChapterId,
  resolvePageDropDestination
} from '@components/chapter/chapterDnd';

const Chapter: React.FC = () => {
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const weeksById = useCourseStore((s) => s.weeksById);
  const chaptersById = useCourseStore((s) => s.chaptersById);
  const pagesById = useCourseStore((s) => s.pagesById);
  const addChapter = useCourseStore((s) => s.addChapter);
  const reorderChapters = useCourseStore((s) => s.reorderChapters);
  const updateChapterTitle = useCourseStore((s) => s.updateChapterTitle);
  const movePage = useCourseStore((s) => s.movePage);

  const [editingChapterId, setEditingChapterId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState('');
  const [activeDragId, setActiveDragId] = React.useState<ID | null>(null);
  const lastChapterReorderRef = React.useRef<{ activeId: ID; overChapterId: ID } | null>(null);
  const lastPageMoveRef = React.useRef<{
    pageId: ID;
    sourceChapterId: ID;
    destChapterId: ID;
    destIndex: number;
  } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const week = selectedWeekId ? weeksById[selectedWeekId] : undefined;
  const chapterIds = week?.chapterIds ?? [];

  const onClickEdit = (chapterId: string) => {
    const chapter = chaptersById[chapterId];
    setEditingChapterId(chapterId);
    setEditingValue(chapter?.title ?? '');
  };

  const onCancelEdit = () => {
    setEditingChapterId(null);
    setEditingValue('');
  };

  const onConfirmEdit = (chapterId: string) => {
    updateChapterTitle(chapterId, editingValue);
    setEditingChapterId(null);
    showToast('챕터명이 변경되었습니다.', 'success');
  };

  const findChapterByPageId = (pageId: ID): ID | undefined => {
    for (const cid of chapterIds) {
      const ch = chaptersById[cid];
      if (ch?.pageIds.includes(pageId)) return cid;
    }
    return undefined;
  };

  const isChapterId = (id: ID) => chapterIds.includes(id);
  const isPageId = (id: ID) => !!pagesById[id];

  const dndCtx = React.useMemo(
    () => ({ isChapterId, isPageId, findChapterByPageId }),
    [chapterIds, chaptersById, pagesById]
  );

  const collisionDetection = React.useMemo(
    () => createChapterTreeCollisionDetection(isChapterId),
    [chapterIds]
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || !selectedWeekId) return;
    if (active.id === over.id) return;

    const activeId = String(active.id) as ID;
    const overId = String(over.id) as ID;

    const overChapterId = resolveOverChapterId(overId, dndCtx);

    if (isChapterId(activeId) && overChapterId && isChapterId(overChapterId)) {
      const oldIndex = chapterIds.findIndex((id) => id === activeId);
      const newIndex = chapterIds.findIndex((id) => id === overChapterId);
      if (oldIndex < 0 || newIndex < 0) return;
      reorderChapters(selectedWeekId, arrayMove(chapterIds, oldIndex, newIndex));
      showToast('챕터 순서가 변경되었습니다.', 'success');
      return;
    }

    if (!isPageId(activeId)) return;
    const sourceChapterId = findChapterByPageId(activeId);
    if (!sourceChapterId) return;

    const dest = resolvePageDropDestination(overId, chaptersById, dndCtx);
    if (!dest) return;
    const { destChapterId, destIndex } = dest;

    movePage(sourceChapterId, destChapterId, activeId, destIndex);
    showToast('페이지 순서가 변경되었습니다.', 'success');
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id) as ID);
    lastChapterReorderRef.current = null;
    lastPageMoveRef.current = null;
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id) as ID;
    const overId = String(over.id) as ID;
    if (activeId === overId) return;

    if (isChapterId(activeId) && selectedWeekId) {
      const overChapterId = resolveOverChapterId(overId, dndCtx);

      if (overChapterId && isChapterId(overChapterId) && overChapterId !== activeId) {
        const last = lastChapterReorderRef.current;
        if (last && last.activeId === activeId && last.overChapterId === overChapterId) return;

        const oldIndex = chapterIds.findIndex((id) => id === activeId);
        const newIndex = chapterIds.findIndex((id) => id === overChapterId);
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          reorderChapters(selectedWeekId, arrayMove(chapterIds, oldIndex, newIndex));
          lastChapterReorderRef.current = { activeId, overChapterId };
        }
      }
      return;
    }

    if (!isPageId(activeId)) return;

    const sourceChapterId = findChapterByPageId(activeId);
    if (!sourceChapterId) return;

    const dest = resolvePageDropDestination(overId, chaptersById, dndCtx);
    if (!dest) return;
    const { destChapterId, destIndex } = dest;

    const currentSource = findChapterByPageId(activeId);
    if (!currentSource) return;

    const currentIndex = chaptersById[currentSource]?.pageIds.findIndex((pid) => pid === activeId) ?? -1;
    const sameChapter = currentSource === destChapterId;
    const sameIndex = sameChapter && currentIndex === destIndex;
    if (sameIndex) return;

    const lastMove = lastPageMoveRef.current;
    if (
      lastMove &&
      lastMove.pageId === activeId &&
      lastMove.sourceChapterId === currentSource &&
      lastMove.destChapterId === destChapterId &&
      lastMove.destIndex === destIndex
    ) {
      return;
    }

    movePage(currentSource, destChapterId, activeId, destIndex);
    lastPageMoveRef.current = {
      pageId: activeId,
      sourceChapterId: currentSource,
      destChapterId,
      destIndex
    };
  };

  const onClickAddChapter = () => {
    if (!selectedWeekId) return;
    addChapter(selectedWeekId);
    showToast('챕터가 추가되었습니다.', 'success');
  };

  return (
    <div className="cb-chapters">
      <div className="cb-chapters__top">
        <h3 className="cb-chapters__title">챕터</h3>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
          <div className="cb-chapters__list">
            {chapterIds.map((cid, idx) => (
              <ChapterCard
                key={cid}
                chapterId={cid}
                index={idx}
                isEditing={editingChapterId === cid}
                editingValue={editingChapterId === cid ? editingValue : ''}
                onStartEdit={() => onClickEdit(cid)}
                onChangeEditingValue={(v) => setEditingValue(v)}
                onConfirmEdit={() => onConfirmEdit(cid)}
                onCancelEdit={onCancelEdit}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeDragId && isPageId(activeDragId) ? (
            <div className="cb-page cb-page--overlay">
              <div className="cb-page__handle">⠿</div>
              <div className="cb-page__title">
                <span>{pagesById[activeDragId]?.title?.trim() || '페이지명을 입력해주세요'}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="cb-chapters__footer">
        <button type="button" className="cb-btn cb-btn--primary" disabled={!selectedWeekId} onClick={onClickAddChapter}>
          + 챕터 추가
        </button>
      </div>
    </div>
  );
};

export default Chapter;
