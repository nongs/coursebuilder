import type { CourseTreeState, ID } from './types';

/**
 * 활성 강의 기준 첫 주차·첫 페이지 선택 (로드 직후 UI 동기화용, 스토리지에 저장하지 않음)
 */
export function getDefaultWeekAndPageSelection(
  state: Pick<CourseTreeState, 'courseIds' | 'coursesById' | 'weeksById' | 'chaptersById'>
): { selectedWeekId?: ID; selectedPageId?: ID } {
  const courseId = state.courseIds[0];
  if (!courseId) return { selectedWeekId: undefined, selectedPageId: undefined };
  const course = state.coursesById[courseId];
  if (!course?.weekIds?.length) return { selectedWeekId: undefined, selectedPageId: undefined };

  const sortedWeekIds = [...course.weekIds].sort((a, b) => {
    const wa = state.weeksById[a];
    const wb = state.weeksById[b];
    return (wa?.order ?? 0) - (wb?.order ?? 0);
  });
  const firstWeekId = sortedWeekIds[0];
  const week = state.weeksById[firstWeekId];
  const firstChapterId = week?.chapterIds[0];
  const chapter = firstChapterId ? state.chaptersById[firstChapterId] : undefined;
  const firstPageId = chapter?.pageIds[0];
  return { selectedWeekId: firstWeekId, selectedPageId: firstPageId };
}
