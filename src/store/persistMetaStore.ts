import { create } from 'zustand';
import { getPersistedSnapshotString, useCourseStore } from './courseStore';

/**
 * 마지막 저장(또는 초기 로드) 이후 편집 여부(더티) 판별용 baseline.
 * `lastSavedSerialized`는 `getPersistedSnapshotString`과 동일한 규칙의 JSON 문자열.
 */
interface PersistMetaState {
  lastSavedSerialized: string | null;
  /** 현재 스토어 스냅샷을 "저장됨" 기준선으로 맞춤 (초기 로드·저장 성공·가져오기 후) */
  syncBaselineFromStore: () => void;
  /** 앱 초기화 등 */
  resetBaseline: () => void;
}

export const usePersistMetaStore = create<PersistMetaState>((set) => ({
  lastSavedSerialized: null,
  syncBaselineFromStore: () => {
    const s = useCourseStore.getState();
    set({ lastSavedSerialized: getPersistedSnapshotString(s) });
  },
  resetBaseline: () => set({ lastSavedSerialized: null })
}));
