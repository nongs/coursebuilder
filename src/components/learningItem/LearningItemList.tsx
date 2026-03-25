import React from 'react';
import '@styles/learningItem/_learning-items.scss';
import DeleteConfirmModal from '@components/modal/DeleteConfirmModal';
import { showToast } from '@utils/toast';
import { useCourseStore } from '@store/courseStore';
import { LearningItemsEmptyIcon } from '@components/common/icons';
import LearningItem from './LearningItem';

const LearningItemList: React.FC<{ pageId: string }> = ({ pageId }) => {
  const page = useCourseStore((s) => s.pagesById[pageId]);
  const itemsById = useCourseStore((s) => s.learningItemsById);
  const addLearningItem = useCourseStore((s) => s.addLearningItem);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const itemIds = page?.learningItemIds ?? [];

  const onClickAdd = () => {
    addLearningItem(pageId);
    showToast('학습요소가 추가되었습니다.', 'success');
  };

  return (
    <section className="cb-learning" aria-label="학습요소">
      <div className="cb-learning__header">
        <h3 className="cb-learning__title">학습요소</h3>
        <button type="button" className="cb-btn cb-btn--primary" onClick={onClickAdd}>
          + 학습요소 추가
        </button>
      </div>

      {itemIds.length === 0 ? (
        <div className="cb-learning__empty">
          <div className="cb-learning__empty-icon" aria-hidden>
            <LearningItemsEmptyIcon />
          </div>
          <p className="cb-learning__empty-text">학습요소가 없습니다.</p>
        </div>
      ) : (
        <div className="cb-learning__list">
          {itemIds.map((id) => {
            const item = itemsById[id];
            if (!item) return null;
            return (
              <LearningItem key={id} id={id} item={item} onDeleteClick={() => setConfirmDeleteId(id)} />
            );
          })}
        </div>
      )}

      {itemIds.length > 0 ? (
        <div className="cb-learning__footer">
          <button
            type="button"
            className="cb-btn cb-btn--primary cb-learning__addbottom"
            onClick={onClickAdd}
          >
            + 학습요소 추가
          </button>
        </div>
      ) : null}

      {confirmDeleteId !== null ? (
        <DeleteConfirmModal
          isOpen
          target="learningItem"
          pageId={pageId}
          itemId={confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
        />
      ) : null}
    </section>
  );
};

export default LearningItemList;
