import { create } from 'zustand';

type ApiUiState = {
  /** 진행 중인 API 요청 수 (0이면 로더 숨김) */
  pendingCount: number;
  /** 첫 진입 시 강의 데이터 fetch가 끝났는지 (끝난 뒤에만 강제 생성 모달 등 분기) */
  initialCourseFetchDone: boolean;
  setInitialCourseFetchDone: (done: boolean) => void;
  beginRequest: () => void;
  endRequest: () => void;
};

export const useApiUiStore = create<ApiUiState>((set) => ({
  pendingCount: 0,
  initialCourseFetchDone: false,
  setInitialCourseFetchDone: (done) => set({ initialCourseFetchDone: done }),
  beginRequest: () => set((s) => ({ pendingCount: s.pendingCount + 1 })),
  endRequest: () =>
    set((s) => ({
      pendingCount: Math.max(0, s.pendingCount - 1)
    }))
}));
