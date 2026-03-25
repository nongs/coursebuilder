import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ID } from '@domain/types';

export interface PageRowProps {
  pageId: ID;
  title: string;
  isMuted: boolean;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const PageRow: React.FC<PageRowProps> = ({
  pageId,
  title,
  isMuted,
  isActive,
  onSelect,
  onDelete
}) => {
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

export default PageRow;
