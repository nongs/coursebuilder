import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ID } from '@domain/types';
import { useCourseStore } from '@store/courseStore';
import PageList from '@components/chapter/PageList';
import DeleteConfirmModal from '@components/modal/DeleteConfirmModal';

export interface ChapterCardProps {
  chapterId: ID;
  index: number;
  isEditing: boolean;
  editingValue: string;
  onStartEdit: () => void;
  onChangeEditingValue: (v: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapterId,
  index,
  isEditing,
  editingValue,
  onStartEdit,
  onChangeEditingValue,
  onConfirmEdit,
  onCancelEdit
}) => {
  const chaptersById = useCourseStore((s) => s.chaptersById);
  const chapter = chaptersById[chapterId];
  const titleText = chapter?.title?.trim() || '챕터명을 입력해주세요';
  const isTitleMuted = !chapter?.title?.trim();

  const [chapterDeleteOpen, setChapterDeleteOpen] = React.useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: chapterId,
    disabled: isEditing
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1
  };

  const chapterDropId = `chapter-drop:${chapterId}`;
  const { setNodeRef: setChapterDropRef } = useDroppable({ id: chapterDropId });

  return (
    <>
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
                <span className={`cb-chapter__titletext ${isTitleMuted ? 'is-muted' : ''}`}>{titleText}</span>
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
                    onClick={() => setChapterDeleteOpen(true)}
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

          <PageList chapterId={chapterId} />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={chapterDeleteOpen}
        target="chapter"
        chapterId={chapterId}
        onClose={() => setChapterDeleteOpen(false)}
      />
    </>
  );
};

export default ChapterCard;
