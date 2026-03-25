import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ID } from '@domain/types';

export interface WeekTabProps {
  id: ID;
  index: number;
  isActive: boolean;
  isReorderMode: boolean;
  onSelect: () => void;
}

const WeekTab: React.FC<WeekTabProps> = ({ id, index, isActive, isReorderMode, onSelect }) => {
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
        if (isReorderMode) return;
        onSelect();
      }}
      {...attributes}
      {...listeners}
    >
      {index + 1}
    </button>
  );
};

export default WeekTab;
