import React from 'react';
import '@styles/layout/_header.scss';

import Modal from '@components/common/Modal';
import CourseTitleModal from '@components/course/CourseTitleModal';
import { useCourseStore } from '@store/courseStore';
import Toast from '@components/common/Toast';

const Header: React.FC = () => {
  const [isEditTitleOpen, setIsEditTitleOpen] = React.useState(false);
  const [isConfirmNewCourseOpen, setIsConfirmNewCourseOpen] = React.useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [toastVariant, setToastVariant] = React.useState<'default' | 'success' | 'danger'>('default');

  const courseId = useCourseStore((s) => s.getActiveCourseId());
  const courseTitle = useCourseStore((s) =>
    courseId ? s.coursesById[courseId]?.title ?? '' : ''
  );
  const updateCourseTitle = useCourseStore((s) => s.updateCourseTitle);
  const createCourse = useCourseStore((s) => s.createCourse);

  const hasUnsavedCourseData = useCourseStore((s) => s.courseIds.length > 0);

  const onClickEditTitle = () => setIsEditTitleOpen(true);
  const onCloseEditTitle = () => setIsEditTitleOpen(false);

  const onClickCreateCourse = () => {
    if (hasUnsavedCourseData) {
      setIsConfirmNewCourseOpen(true);
      return;
    }
    setIsCreateCourseOpen(true);
  };

  const onConfirmDiscardAndCreate = () => {
    setIsConfirmNewCourseOpen(false);
    setIsCreateCourseOpen(true);
  };

  const onCloseConfirm = () => setIsConfirmNewCourseOpen(false);
  const onCloseCreateCourse = () => setIsCreateCourseOpen(false);

  const onSaveTitleClick = (nextTitle: string) => {
    console.log('TODO: 강의명 저장 클릭', nextTitle);
    if (!courseId) return;
    updateCourseTitle(courseId, nextTitle);
    setIsEditTitleOpen(false);
    setToastVariant('success');
    setToastMessage('강의명이 저장되었습니다.');
  };

  const onCreateCourseTitleClick = (nextTitle: string) => {
    console.log('TODO: 새 코스 생성 클릭', nextTitle);
    createCourse(nextTitle);
    setIsCreateCourseOpen(false);
    setToastVariant('success');
    setToastMessage('새 코스가 생성되었습니다.');
  };

  const onClickSave = () => {
    console.log('TODO: 저장 클릭');
    setToastVariant('success');
    setToastMessage('저장을 실행했습니다. (추후 구현 예정)');
  };

  return (
    <>
      <header className="cb-header">
        <div className="cb-header__left">
          <span className="cb-header__logo">Coursebuilder</span>
          <span className="cb-header__badge">설계 모드</span>
          <span className="cb-header__divider" />
          <span className="cb-header__course-title">{courseTitle || '강의명 없음'}</span>
          <button
            className="cb-header__iconbtn"
            aria-label="강의명 수정"
            onClick={onClickEditTitle}
            type="button"
            disabled={!courseId}
          >
            ✎
          </button>
        </div>
        <div className="cb-header__right">
          <button
            className="cb-header__button cb-header__button--primary"
            onClick={onClickCreateCourse}
            type="button"
          >
            새 코스 만들기
          </button>
          <button className="cb-header__button" onClick={onClickSave} type="button">
            저장
          </button>
        </div>
      </header>

      <CourseTitleModal
        isOpen={isEditTitleOpen}
        initialTitle={courseTitle}
        mode="edit"
        onClose={onCloseEditTitle}
        onSaveClick={onSaveTitleClick}
      />

      <Modal
        isOpen={isConfirmNewCourseOpen}
        title="새 코스 만들기"
        onClose={onCloseConfirm}
        footer={
          <>
            <button className="cb-btn cb-btn--primary" onClick={onConfirmDiscardAndCreate}>
              새로 만들기
            </button>
            <button className="cb-btn" onClick={onCloseConfirm}>
              닫기
            </button>
          </>
        }
      >
        <p className="cb-modal__text">
          현재 작성 중인 강의 정보가 있습니다. 내보내기/저장을 하지 않으면 데이터가 사라질 수
          있습니다.
          <br />
          그래도 새 코스를 만들까요?
        </p>
      </Modal>

      <CourseTitleModal
        isOpen={isCreateCourseOpen}
        initialTitle=""
        mode="create"
        onClose={onCloseCreateCourse}
        onSaveClick={onCreateCourseTitleClick}
      />

      <Toast
        isOpen={toastMessage !== null}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
        variant={toastVariant}
      />
    </>
  );
};

export default Header;

