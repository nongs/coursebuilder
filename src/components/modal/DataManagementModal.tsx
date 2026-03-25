import React, { useEffect, useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import type { CourseTreeState } from '@domain/types';
import { COURSE_TREE_SCHEMA_VERSION } from '@domain/types';
import { validateCourseTreeImport } from '@domain/courseTreeImport';
import { useCourseStore } from '@store/courseStore';
import { usePersistMetaStore } from '@store/persistMetaStore';
import { useApiUiStore } from '@store/apiUiStore';
import { saveCourseTree } from '@api/courseApi';
import { showToast } from '@utils/toast';
import '@styles/components/_data-management.scss';

export interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getCourseTreeSnapshot = useCourseStore((s) => s.getCourseTreeSnapshot);
  const hydrate = useCourseStore((s) => s.hydrate);
  const syncBaselineFromStore = usePersistMetaStore((s) => s.syncBaselineFromStore);
  const beginRequest = useApiUiStore((s) => s.beginRequest);
  const endRequest = useApiUiStore((s) => s.endRequest);

  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingState, setPendingState] = useState<CourseTreeState | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setImportConfirmOpen(false);
      setPendingState(null);
    }
  }, [isOpen]);

  const onClickExport = () => {
    try {
      const snapshot = getCourseTreeSnapshot();
      const json = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const fname = `coursebuilder-${stamp.getFullYear()}-${pad(stamp.getMonth() + 1)}-${pad(stamp.getDate())}-${pad(stamp.getHours())}${pad(stamp.getMinutes())}.json`;
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('JSON 파일로 내보냈습니다.', 'success');
    } catch {
      showToast('내보내기에 실패했습니다.', 'danger');
    }
  };

  const onClickImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    beginRequest();
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        showToast('JSON 형식이 올바르지 않습니다.', 'danger');
        return;
      }

      const result = validateCourseTreeImport(parsed);
      if (!result.ok) {
        showToast(result.message, 'danger');
        return;
      }

      setPendingState(result.state);
      setImportConfirmOpen(true);
    } catch {
      showToast('가져오기에 실패했습니다.', 'danger');
    } finally {
      endRequest();
    }
  };

  const onCancelImportConfirm = () => {
    setImportConfirmOpen(false);
    setPendingState(null);
  };

  const onConfirmImport = async () => {
    if (!pendingState) return;
    beginRequest();
    try {
      hydrate(pendingState);
      await saveCourseTree(getCourseTreeSnapshot());
      syncBaselineFromStore();
      showToast('데이터를 불러와 저장했습니다.', 'success');
      setPendingState(null);
      setImportConfirmOpen(false);
      onClose();
    } catch {
      showToast('가져오기에 실패했습니다.', 'danger');
    } finally {
      endRequest();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="cb-datamgmt__file"
        aria-hidden
        tabIndex={-1}
        onChange={onFileChange}
      />
      <Modal
        isOpen={isOpen}
        title="데이터 가져오기 / 내보내기"
        onClose={onClose}
        footer={
          <button type="button" className="cb-btn" onClick={onClose}>
            닫기
          </button>
        }
      >
        <p className="cb-modal__text cb-datamgmt__lead">
          강의 구조 전체를 JSON 파일로 백업하거나, 백업 파일을 불러와 이 기기의 저장소에 반영할 수 있습니다.
        </p>
        <p className="cb-datamgmt__version">
          현재 앱 스키마 버전: <strong>v{COURSE_TREE_SCHEMA_VERSION}</strong> (내보내기 JSON에{' '}
          <code className="cb-datamgmt__code">schemaVersion</code>으로 기록됩니다)
        </p>
        <div className="cb-datamgmt__actions">
          <button type="button" className="cb-btn cb-btn--primary cb-datamgmt__btn" onClick={onClickExport}>
            데이터 내보내기 (JSON)
          </button>
          <button type="button" className="cb-btn cb-datamgmt__btn" onClick={onClickImportTrigger}>
            데이터 가져오기 (JSON)
          </button>
        </div>
        <p className="cb-datamgmt__hint">가져오기 전에 형식 검사를 하며, 적용 직전에 덮어쓰기를 한 번 더 확인합니다.</p>
      </Modal>

      <Modal
        isOpen={importConfirmOpen}
        title="데이터 덮어쓰기"
        onClose={onCancelImportConfirm}
        footer={
          <>
            <button type="button" className="cb-btn cb-btn--primary" onClick={onConfirmImport}>
              파일로 덮어쓰기
            </button>
            <button type="button" className="cb-btn" onClick={onCancelImportConfirm}>
              취소
            </button>
          </>
        }
      >
        <p className="cb-modal__text">
          현재 편집 중인 강의 데이터가 선택한 JSON 파일 내용으로 <strong>완전히 대체</strong>되고, 로컬 저장소에
          저장됩니다. 계속할까요?
        </p>
      </Modal>
    </>
  );
};

export default DataManagementModal;
