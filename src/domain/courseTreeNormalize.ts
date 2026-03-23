import type { CourseTreeData, CourseTreeState } from './types';
import { sanitizeLearningItemsInTree } from './sanitizeHtml';

export function emptyCourseTreeState(): CourseTreeState {
  return {
    courseIds: [],
    coursesById: {},
    weeksById: {},
    chaptersById: {},
    pagesById: {},
    learningItemsById: {},
    selectedWeekId: undefined,
    selectedPageId: undefined
  };
}

/**
 * 스토리지/파일 JSON → 런타임 상태 (schemaVersion 필드는 무시, 선택 ID는 비움)
 */
export function normalizeCourseTreeState(raw: unknown): CourseTreeState {
  const empty = emptyCourseTreeState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return empty;
  const o = raw as Record<string, unknown>;

  const data: CourseTreeData = {
    courseIds: Array.isArray(o.courseIds) ? (o.courseIds as CourseTreeData['courseIds']) : [],
    coursesById:
      o.coursesById && typeof o.coursesById === 'object' && !Array.isArray(o.coursesById)
        ? (o.coursesById as CourseTreeData['coursesById'])
        : {},
    weeksById:
      o.weeksById && typeof o.weeksById === 'object' && !Array.isArray(o.weeksById)
        ? (o.weeksById as CourseTreeData['weeksById'])
        : {},
    chaptersById:
      o.chaptersById && typeof o.chaptersById === 'object' && !Array.isArray(o.chaptersById)
        ? (o.chaptersById as CourseTreeData['chaptersById'])
        : {},
    pagesById:
      o.pagesById && typeof o.pagesById === 'object' && !Array.isArray(o.pagesById)
        ? (o.pagesById as CourseTreeData['pagesById'])
        : {},
    learningItemsById:
      o.learningItemsById && typeof o.learningItemsById === 'object' && !Array.isArray(o.learningItemsById)
        ? (o.learningItemsById as CourseTreeData['learningItemsById'])
        : {}
  };

  return sanitizeLearningItemsInTree({
    ...data,
    selectedWeekId: undefined,
    selectedPageId: undefined
  });
}
