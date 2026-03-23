import type { CourseTreePersisted, CourseTreeState } from '@domain/types';
import { emptyCourseTreeState, normalizeCourseTreeState } from '@domain/courseTreeNormalize';

/** 로컬스토리지 키 (DB 대체 저장소) */
const COURSE_TREE_STORAGE_KEY = 'coursebuilder:courseTree';

const simulateLatency = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 280);
  });

/**
 * 강의 데이터 가져오기 (페이지 진입·새로고침 시 호출)
 * 실제 백엔드 대신 로컬스토리지에서 JSON 로드
 */
export async function fetchCourseTree(): Promise<CourseTreeState> {
  await simulateLatency();
  if (typeof window === 'undefined') {
    return emptyCourseTreeState();
  }
  try {
    const raw = window.localStorage.getItem(COURSE_TREE_STORAGE_KEY);
    if (!raw) {
      return emptyCourseTreeState();
    }
    const parsed = JSON.parse(raw) as unknown;
    return normalizeCourseTreeState(parsed);
  } catch {
    return emptyCourseTreeState();
  }
}

/**
 * 강의 데이터 저장하기 (저장 버튼 등)
 * 실제 백엔드 대신 로컬스토리지에 JSON 저장 (선택 상태는 제외)
 */
export async function saveCourseTree(state: CourseTreePersisted): Promise<void> {
  await simulateLatency();
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COURSE_TREE_STORAGE_KEY, JSON.stringify(state));
}
