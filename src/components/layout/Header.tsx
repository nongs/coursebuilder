import React from 'react';
import '@styles/layout/_header.scss';

import Modal from '@components/common/Modal';
import CourseTitleModal from '@components/course/CourseTitleModal';
import DataManagementModal from '@components/layout/DataManagementModal';
import { getPersistedSnapshotString, useCourseStore } from '@store/courseStore';
import { usePersistMetaStore } from '@store/persistMetaStore';
import { useApiUiStore } from '@store/apiUiStore';
import { saveCourseTree } from '@api/courseApi';
import Toast from '@components/common/Toast';

const Header: React.FC = () => {
  const [isEditTitleOpen, setIsEditTitleOpen] = React.useState(false);
  const [isConfirmNewCourseOpen, setIsConfirmNewCourseOpen] = React.useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = React.useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [toastVariant, setToastVariant] = React.useState<'default' | 'success' | 'danger'>('default');

  const courseIds = useCourseStore((s) => s.courseIds);
  const courseId = useCourseStore((s) => s.getActiveCourseId());
  const courseTitle = useCourseStore((s) =>
    courseId ? s.coursesById[courseId]?.title ?? '' : ''
  );
  const updateCourseTitle = useCourseStore((s) => s.updateCourseTitle);
  const createCourse = useCourseStore((s) => s.createCourse);
  const getCourseTreeSnapshot = useCourseStore((s) => s.getCourseTreeSnapshot);
  const beginRequest = useApiUiStore((s) => s.beginRequest);
  const endRequest = useApiUiStore((s) => s.endRequest);
  const initialCourseFetchDone = useApiUiStore((s) => s.initialCourseFetchDone);

  const snapshotStr = useCourseStore((s) => getPersistedSnapshotString(s));
  const lastSavedSerialized = usePersistMetaStore((s) => s.lastSavedSerialized);
  const syncBaselineFromStore = usePersistMetaStore((s) => s.syncBaselineFromStore);
  const saveStatusKnown = lastSavedSerialized !== null;
  const isDirty = saveStatusKnown && snapshotStr !== lastSavedSerialized;

  const hasUnsavedCourseData = courseIds.length > 0;
  /** 첫 로드 완료 후에만 강제 생성 (스피너 종료 직후 모달이 자연스럽게 뜸) */
  const isForcedCreate = courseIds.length === 0 && initialCourseFetchDone;

  const onClickEditTitle = () => setIsEditTitleOpen(true);
  const onCloseEditTitle = () => setIsEditTitleOpen(false);

  const onClickCreateCourse = () => {
    if (!initialCourseFetchDone || isForcedCreate) return;
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

  const onCreateCourseTitleClick = (nextTitle: string, weekCount?: number) => {
    createCourse(nextTitle, weekCount);
    setIsCreateCourseOpen(false);
    setToastVariant('success');
    setToastMessage('새 강의가 생성되었습니다.');
  };

  const onClickSave = async () => {
    beginRequest();
    try {
      await saveCourseTree(getCourseTreeSnapshot());
      syncBaselineFromStore();
      setToastVariant('success');
      setToastMessage('강의 데이터가 저장되었습니다.');
    } catch {
      setToastVariant('danger');
      setToastMessage('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      endRequest();
    }
  };

  return (
    <>
      <header className="cb-header">
        <div className="cb-header__left">
          <span className="cb-header__logo">Coursebuilder</span>
          <span className="cb-header__badge">설계 모드</span>
          {initialCourseFetchDone && (
            <span
              className={
                saveStatusKnown
                  ? isDirty
                    ? 'cb-header__save cb-header__save--dirty'
                    : 'cb-header__save cb-header__save--saved'
                  : 'cb-header__save cb-header__save--pending'
              }
              title={
                saveStatusKnown
                  ? isDirty
                    ? '마지막 저장 이후 변경됨 (저장필요)'
                    : '마지막 저장 내용과 동일'
                  : '저장 상태 확인 중'
              }
            >
              {saveStatusKnown ? (isDirty ? '저장필요' : '저장됨') : '…'}
            </span>
          )}
          <span className="cb-header__divider" />
          <span className="cb-header__course-title" title={courseTitle || '강의명 없음'}>
            {courseTitle || '강의명 없음'}
          </span>
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
            disabled={!initialCourseFetchDone || isForcedCreate}
            title={
              !initialCourseFetchDone
                ? '강의 데이터를 불러오는 중입니다'
                : isForcedCreate
                  ? '강의를 먼저 생성해주세요'
                  : undefined
            }
          >
            새 강의 만들기
          </button>
          <button className="cb-header__button" onClick={onClickSave} type="button">
            저장
          </button>
          <button
            className="cb-header__button"
            onClick={() => setIsDataManagementOpen(true)}
            type="button"
            title="JSON 파일로 가져오기·내보내기"
          >
            데이터 관리
          </button>
        </div>
      </header>

      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
        onToast={(message, variant) => {
          setToastVariant(variant);
          setToastMessage(message);
        }}
      />

      <CourseTitleModal
        isOpen={isEditTitleOpen}
        initialTitle={courseTitle}
        mode="edit"
        onClose={onCloseEditTitle}
        onSaveClick={onSaveTitleClick}
      />

      <Modal
        isOpen={isConfirmNewCourseOpen}
        title="새 강의 만들기"
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
          그래도 새 강의를 만들까요?
        </p>
      </Modal>

      <CourseTitleModal
        isOpen={isForcedCreate || isCreateCourseOpen}
        initialTitle=""
        mode="create"
        closable={!isForcedCreate}
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

