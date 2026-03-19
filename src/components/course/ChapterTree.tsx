import React from 'react';
import '@styles/course/_chapter-tree.scss';
import { useCourseStore } from '@store/courseStore';
import Modal from '@components/common/Modal';
import Toast from '@components/common/Toast';
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  CollisionDetection,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ID } from '@domain/types';

const isChapterDropId = (id: ID) => typeof id === 'string' && id.startsWith('chapter-drop:');
const getChapterIdFromDropId = (id: ID) => id.replace('chapter-drop:', '');

const SortablePageRow: React.FC<{
  chapterId: ID;
  pageId: ID;
  title: string;
  isMuted: boolean;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ chapterId, pageId, title, isMuted, isActive, onSelect, onDelete }) => {
  const {
    setNodeRef: setPageRef,
    attributes: pageAttrs,
    listeners: pageListeners,
    transform: pageTransform,
    transition: pageTransition,
    isDragging: pageDragging
  } = useSortable({ id: pageId });

  const pageStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(pageTransform),
    transition: pageTransition,
    opacity: pageDragging ? 0.7 : 1
  };

  return (
    <div ref={setPageRef} style={pageStyle} className={`cb-page ${isActive ? 'is-active' : ''}`}>
      <button
        type="button"
        className="cb-page__handle"
        aria-label="페이지 이동"
        {...pageAttrs}
        {...pageListeners}
      >
        ⠿
      </button>
      <button type="button" className="cb-page__title" onClick={onSelect}>
        <span className={isMuted ? 'is-muted' : ''}>{title}</span>
      </button>
      <button
        type="button"
        className="cb-iconbtn cb-iconbtn--danger"
        aria-label="페이지 삭제"
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  );
};

const SortableChapterCard: React.FC<{
  chapterId: ID;
  index: number;
  isEditing: boolean;
  editingValue: string;
  titleText: string;
  isTitleMuted: boolean;
  pageIds: ID[];
  getPageMeta: (pageId: ID) => { title: string; isMuted: boolean };
  selectedPageId?: ID;
  onStartEdit: () => void;
  onChangeEditingValue: (v: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onDeleteChapter: () => void;
  onAddPage: () => void;
  onSelectPage: (pageId: ID) => void;
  onDeletePage: (pageId: ID) => void;
}> = ({
  chapterId,
  index,
  isEditing,
  editingValue,
  titleText,
  isTitleMuted,
  pageIds,
  getPageMeta,
  selectedPageId,
  onStartEdit,
  onChangeEditingValue,
  onConfirmEdit,
  onCancelEdit,
  onDeleteChapter,
  onAddPage,
  onSelectPage,
  onDeletePage
}) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: chapterId,
    disabled: isEditing
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1
  };

  const containerId = `page-container:${chapterId}`;
  const { setNodeRef: setContainerRef } = useDroppable({ id: containerId });
  const chapterDropId = `chapter-drop:${chapterId}`;
  const { setNodeRef: setChapterDropRef } = useDroppable({ id: chapterDropId });

  return (
    <div ref={setChapterDropRef} className="cb-chapterdrop">
      <div ref={setNodeRef} style={style} className="cb-chapter">
      <div className="cb-chapter__header">
        <div className="cb-chapter__title">
          <button
            type="button"
            className="cb-chapter__handle"
            aria-label="챕터 이동"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
          <span className="cb-chapter__index">{index + 1}.</span>
          {!isEditing ? (
            <span className={`cb-chapter__titletext ${isTitleMuted ? 'is-muted' : ''}`}>
              {titleText}
            </span>
          ) : (
            <input
              className="cb-input cb-chapter__titleinput"
              value={editingValue}
              onChange={(e) => onChangeEditingValue(e.target.value)}
              placeholder="챕터명 입력"
            />
          )}
        </div>
        <div className="cb-chapter__actions">
          {!isEditing ? (
            <>
              <button type="button" className="cb-iconbtn" aria-label="챕터명 수정" onClick={onStartEdit}>
                ✎
              </button>
              <button
                type="button"
                className="cb-iconbtn cb-iconbtn--danger"
                aria-label="챕터 삭제"
                onClick={onDeleteChapter}
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <button type="button" className="cb-iconbtn" aria-label="수정 완료" onClick={onConfirmEdit}>
                ✓
              </button>
              <button type="button" className="cb-iconbtn" aria-label="편집 취소" onClick={onCancelEdit}>
                ↩
              </button>
            </>
          )}
        </div>
      </div>

      <div ref={setContainerRef} className="cb-pages">
        <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
          {pageIds.map((pid) => (
            (() => {
              const meta = getPageMeta(pid);
              return (
            <SortablePageRow
              key={pid}
              chapterId={chapterId}
              pageId={pid}
              title={meta.title}
              isMuted={meta.isMuted}
              isActive={selectedPageId === pid}
              onSelect={() => onSelectPage(pid)}
              onDelete={() => onDeletePage(pid)}
            />
              );
            })()
          ))}
        </SortableContext>
        <button type="button" className="cb-linkbtn" onClick={onAddPage}>
          + 페이지 추가
        </button>
      </div>
      </div>
    </div>
  );
};

const ChapterTree: React.FC = () => {
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const weeksById = useCourseStore((s) => s.weeksById);
  const chaptersById = useCourseStore((s) => s.chaptersById);
  const pagesById = useCourseStore((s) => s.pagesById);
  const selectedPageId = useCourseStore((s) => s.selectedPageId);
  const selectPage = useCourseStore((s) => s.selectPage);
  const addChapter = useCourseStore((s) => s.addChapter);
  const reorderChapters = useCourseStore((s) => s.reorderChapters);
  const updateChapterTitle = useCourseStore((s) => s.updateChapterTitle);
  const deleteChapter = useCourseStore((s) => s.deleteChapter);
  const addPage = useCourseStore((s) => s.addPage);
  const deletePage = useCourseStore((s) => s.deletePage);
  const movePage = useCourseStore((s) => s.movePage);

  const [editingChapterId, setEditingChapterId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState('');
  const [confirmChapterDeleteId, setConfirmChapterDeleteId] = React.useState<string | null>(null);
  const [confirmPageDelete, setConfirmPageDelete] = React.useState<{ chapterId: string; pageId: string } | null>(null);
  const [toast, setToast] = React.useState<{ message: string; variant: 'default' | 'success' | 'danger' } | null>(null);
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
    setToast({ message: '챕터명이 변경되었습니다.', variant: 'success' });
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
  const isContainerId = (id: ID) => typeof id === 'string' && id.startsWith('page-container:');
  const getContainerChapterId = (containerId: ID) => containerId.replace('page-container:', '');

  const collisionDetection: CollisionDetection = (args) => {
    const activeId = String(args.active.id) as ID;
    const isDraggingChapter = isChapterId(activeId);

    // 챕터 드래그일 때는 챕터 드롭존만 대상으로 충돌 판정(페이지/버튼 위에서도 챕터로 잘 잡히게)
    if (isDraggingChapter) {
      const chapterDroppables = args.droppableContainers.filter((c) => {
        const id = String(c.id) as ID;
        return isChapterId(id) || isChapterDropId(id) || isContainerId(id);
      });

      const pointerHits = pointerWithin({ ...args, droppableContainers: chapterDroppables });
      if (pointerHits.length > 0) return pointerHits;
      return closestCenter({ ...args, droppableContainers: chapterDroppables });
    }

    // 페이지 드래그는 기존대로(페이지/컨테이너 포함)
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) return pointerHits;
    return closestCenter(args);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || !selectedWeekId) return;
    if (active.id === over.id) return;

    const activeId = String(active.id) as ID;
    const overId = String(over.id) as ID;

    const overChapterId = isChapterId(overId)
      ? overId
      : isChapterDropId(overId)
        ? (getChapterIdFromDropId(overId) as ID)
        : isContainerId(overId)
          ? (getContainerChapterId(overId) as ID)
          : isPageId(overId)
            ? findChapterByPageId(overId)
          : undefined;

    if (isChapterId(activeId) && overChapterId && isChapterId(overChapterId)) {
      const oldIndex = chapterIds.findIndex((id) => id === activeId);
      const newIndex = chapterIds.findIndex((id) => id === overChapterId);
      if (oldIndex < 0 || newIndex < 0) return;
      reorderChapters(selectedWeekId, arrayMove(chapterIds, oldIndex, newIndex));
      setToast({ message: '챕터 순서가 변경되었습니다.', variant: 'success' });
      return;
    }

    if (!isPageId(activeId)) return;
    const sourceChapterId = findChapterByPageId(activeId);
    if (!sourceChapterId) return;

    let destChapterId: ID | undefined;
    let destIndex = 0;

    if (isContainerId(overId)) {
      destChapterId = getContainerChapterId(overId) as ID;
      const destChapter = chaptersById[destChapterId];
      destIndex = destChapter?.pageIds.length ?? 0;
    } else if (isPageId(overId)) {
      destChapterId = findChapterByPageId(overId);
      if (!destChapterId) return;
      const destChapter = chaptersById[destChapterId];
      destIndex = destChapter?.pageIds.findIndex((pid) => pid === overId) ?? 0;
    } else {
      return;
    }

    if (!destChapterId) return;
    movePage(sourceChapterId, destChapterId, activeId, destIndex);
    setToast({ message: '페이지 순서가 변경되었습니다.', variant: 'success' });
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

    // 챕터 드래그 중에는 hover 시점에 즉시 재정렬(페이지 영역/버튼 위에서도 반응)
    if (isChapterId(activeId) && selectedWeekId) {
      const overChapterId = isChapterId(overId)
        ? overId
        : isChapterDropId(overId)
          ? (getChapterIdFromDropId(overId) as ID)
          : isContainerId(overId)
            ? (getContainerChapterId(overId) as ID)
            : isPageId(overId)
              ? findChapterByPageId(overId)
              : undefined;

      if (overChapterId && isChapterId(overChapterId) && overChapterId !== activeId) {
        // 동일한 hover 상태에서 무한 reorder 방지
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

    let destChapterId: ID | undefined;
    let destIndex = 0;

    if (isContainerId(overId)) {
      destChapterId = getContainerChapterId(overId) as ID;
      const destChapter = chaptersById[destChapterId];
      destIndex = destChapter?.pageIds.length ?? 0;
    } else if (isPageId(overId)) {
      destChapterId = findChapterByPageId(overId);
      if (!destChapterId) return;
      const destChapter = chaptersById[destChapterId];
      destIndex = destChapter?.pageIds.findIndex((pid) => pid === overId) ?? 0;
    } else {
      return;
    }

    if (!destChapterId) return;
    // 같은 변경을 반복 적용하면서 무한 업데이트(depth) 나는 것 방지
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
    setToast({ message: '챕터가 추가되었습니다.', variant: 'success' });
  };

  const onClickDeleteChapter = (chapterId: string) => {
    setConfirmChapterDeleteId(chapterId);
  };

  const onConfirmDeleteChapter = () => {
    if (!selectedWeekId || !confirmChapterDeleteId) return;
    deleteChapter(selectedWeekId, confirmChapterDeleteId);
    setConfirmChapterDeleteId(null);
    setToast({ message: '챕터가 삭제되었습니다.', variant: 'success' });
  };

  const onClickAddPage = (chapterId: string) => {
    addPage(chapterId);
    setToast({ message: '페이지가 추가되었습니다.', variant: 'success' });
  };

  const onClickDeletePage = (chapterId: string, pageId: string) => {
    setConfirmPageDelete({ chapterId, pageId });
  };

  const onConfirmDeletePage = () => {
    if (!confirmPageDelete) return;
    deletePage(confirmPageDelete.chapterId, confirmPageDelete.pageId);
    setConfirmPageDelete(null);
    setToast({ message: '페이지가 삭제되었습니다.', variant: 'success' });
  };

  return (
    <div className="cb-chaptertree">
      <div className="cb-chaptertree__top">
        <h3 className="cb-chaptertree__title">챕터</h3>
      </div>

      {!selectedWeekId ? (
        <div className="cb-chaptertree__empty">선택된 주차가 없습니다.</div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
              <div className="cb-chaptertree__list">
                {chapterIds.map((cid, idx) => (
                  <SortableChapterCard
                    key={cid}
                    chapterId={cid}
                    index={idx}
                    isEditing={editingChapterId === cid}
                    editingValue={editingChapterId === cid ? editingValue : ''}
                      titleText={(chaptersById[cid]?.title?.trim() || '챕터명을 입력해주세요') as string}
                    isTitleMuted={!chaptersById[cid]?.title?.trim()}
                    pageIds={chaptersById[cid]?.pageIds ?? []}
                    getPageMeta={(pid) => {
                      const p = pagesById[pid];
                      const t = p?.title?.trim();
                      return {
                          title: t || '페이지명을 입력해주세요',
                        isMuted: !t
                      };
                    }}
                    selectedPageId={selectedPageId}
                    onStartEdit={() => onClickEdit(cid)}
                    onChangeEditingValue={(v) => setEditingValue(v)}
                    onConfirmEdit={() => onConfirmEdit(cid)}
                    onCancelEdit={onCancelEdit}
                    onDeleteChapter={() => onClickDeleteChapter(cid)}
                    onAddPage={() => onClickAddPage(cid)}
                    onSelectPage={(pid) => selectPage(pid)}
                    onDeletePage={(pid) => onClickDeletePage(cid, pid)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeDragId && isPageId(activeDragId) ? (
                <div className="cb-page cb-page--overlay">
                  <div className="cb-page__handle">⠿</div>
                  <div className="cb-page__title">
                    <span>
                      {(() => {
                        const p = pagesById[activeDragId];
                        const t = p?.title?.trim();
                        return t || '페이지명을 입력해주세요';
                      })()}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className="cb-chaptertree__footer">
            <button type="button" className="cb-btn cb-btn--primary" onClick={onClickAddChapter}>
              + 챕터 추가
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={confirmChapterDeleteId !== null}
        title="챕터 삭제"
        onClose={() => setConfirmChapterDeleteId(null)}
        footer={
          <>
            <button className="cb-btn cb-btn--primary" onClick={onConfirmDeleteChapter}>
              삭제
            </button>
            <button className="cb-btn" onClick={() => setConfirmChapterDeleteId(null)}>
              닫기
            </button>
          </>
        }
      >
        <p className="cb-modal__text">
          이 챕터와 하위 페이지/학습요소가 모두 삭제됩니다.
          <br />
          정말 삭제할까요?
        </p>
      </Modal>

      <Modal
        isOpen={confirmPageDelete !== null}
        title="페이지 삭제"
        onClose={() => setConfirmPageDelete(null)}
        footer={
          <>
            <button className="cb-btn cb-btn--primary" onClick={onConfirmDeletePage}>
              삭제
            </button>
            <button className="cb-btn" onClick={() => setConfirmPageDelete(null)}>
              닫기
            </button>
          </>
        }
      >
        <p className="cb-modal__text">
          이 페이지와 하위 학습요소가 모두 삭제됩니다.
          <br />
          정말 삭제할까요?
        </p>
      </Modal>

      <Toast
        isOpen={toast !== null}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'default'}
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default ChapterTree;

