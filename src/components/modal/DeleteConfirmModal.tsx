import React from 'react';
import Modal from './Modal';
import { showToast } from '@utils/toast';
import { useCourseStore } from '@store/courseStore';
import type { ID } from '@domain/types';

type DeleteTarget = 'chapter' | 'page' | 'week' | 'learningItem';

export type DeleteConfirmModalProps =
  | {
      isOpen: boolean;
      onClose: () => void;
      target: 'chapter';
      chapterId: ID;
    }
  | {
      isOpen: boolean;
      onClose: () => void;
      target: 'page';
      chapterId: ID;
      pageId: ID;
    }
  | {
      isOpen: boolean;
      onClose: () => void;
      target: 'week';
      courseId: ID;
      weekId: ID;
    }
  | {
      isOpen: boolean;
      onClose: () => void;
      target: 'learningItem';
      pageId: ID;
      itemId: ID;
    };

type CopyEntry = {
  title: string;
  bodyLines: string[];
  successToast: string;
};

const COPY: Record<DeleteTarget, CopyEntry> = {
  chapter: {
    title: '챕터 삭제',
    bodyLines: ['이 챕터와 하위 페이지/학습요소가 모두 삭제됩니다.', '정말 삭제할까요?'],
    successToast: '챕터가 삭제되었습니다.'
  },
  page: {
    title: '페이지 삭제',
    bodyLines: ['이 페이지와 하위 학습요소가 모두 삭제됩니다.', '정말 삭제할까요?'],
    successToast: '페이지가 삭제되었습니다.'
  },
  week: {
    title: '주차 삭제',
    bodyLines: [
      '선택된 주차와 그 하위(챕터/페이지/학습요소) 데이터가 모두 삭제됩니다.',
      '정말 삭제할까요?'
    ],
    successToast: '주차가 삭제되었습니다.'
  },
  learningItem: {
    title: '학습요소 삭제',
    bodyLines: ['학습요소를 삭제할까요?'],
    successToast: '학습요소가 삭제되었습니다.'
  }
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = (props) => {
  const { isOpen, onClose, target } = props;
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const deleteChapter = useCourseStore((s) => s.deleteChapter);
  const deletePage = useCourseStore((s) => s.deletePage);
  const deleteWeek = useCourseStore((s) => s.deleteWeek);
  const deleteLearningItem = useCourseStore((s) => s.deleteLearningItem);

  const copy = COPY[target];

  const onConfirm = () => {
    if (target === 'chapter') {
      if (!selectedWeekId) return;
      deleteChapter(selectedWeekId, props.chapterId);
    } else if (target === 'page') {
      deletePage(props.chapterId, props.pageId);
    } else if (target === 'week') {
      deleteWeek(props.courseId, props.weekId);
    } else {
      deleteLearningItem(props.pageId, props.itemId);
    }
    onClose();
    showToast(copy.successToast, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      title={copy.title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="cb-btn cb-btn--primary" onClick={onConfirm}>
            삭제
          </button>
          <button type="button" className="cb-btn" onClick={onClose}>
            닫기
          </button>
        </>
      }
    >
      <p className="cb-modal__text">
        {copy.bodyLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </React.Fragment>
        ))}
      </p>
    </Modal>
  );
};

export default DeleteConfirmModal;
