import { create } from 'zustand';
import { sampleCourseTree } from '../domain/sampleData';
import type { CourseTreeState, ID } from '../domain/types';

const STORAGE_KEY = 'coursebuilder:courseTree';

export interface CourseStore extends CourseTreeState {
  loadFromStorage: () => void;
  saveToStorage: () => void;
  selectWeek: (weekId: ID | undefined) => void;
  selectPage: (pageId: ID | undefined) => void;
  getActiveCourseId: () => ID | undefined;
  updateCourseTitle: (courseId: ID, title: string) => void;
  createCourse: (title: string) => ID;
  addWeek: (courseId: ID) => ID;
  deleteWeek: (courseId: ID, weekId: ID) => void;
  reorderWeeks: (courseId: ID, orderedWeekIds: ID[]) => void;
  duplicateWeek: (courseId: ID, weekId: ID) => ID | undefined;
}

const loadInitialState = (): CourseTreeState => {
  if (typeof window === 'undefined') {
    return sampleCourseTree;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return sampleCourseTree;
    }
    const parsed = JSON.parse(raw) as CourseTreeState;
    return parsed;
  } catch {
    return sampleCourseTree;
  }
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  ...loadInitialState(),

  loadFromStorage: () => {
    set(loadInitialState());
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    const { loadFromStorage: _lf, saveToStorage: _sf, ...rest } = get();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  },

  selectWeek: (weekId) => {
    set({ selectedWeekId: weekId });
  },

  selectPage: (pageId) => {
    set({ selectedPageId: pageId });
  },

  getActiveCourseId: () => {
    const { courseIds } = get();
    return courseIds[0];
  },

  updateCourseTitle: (courseId, title) => {
    const nextTitle = title.trim();
    if (!nextTitle) return;

    set((state) => ({
      coursesById: {
        ...state.coursesById,
        [courseId]: {
          ...state.coursesById[courseId],
          title: nextTitle
        }
      }
    }));
  },

  createCourse: (title) => {
    const nextTitle = title.trim();
    const id = `course-${Date.now()}`;
    set((state) => ({
      courseIds: [id, ...state.courseIds],
      selectedWeekId: undefined,
      coursesById: {
        ...state.coursesById,
        [id]: {
          id,
          title: nextTitle || '새 코스',
          weekIds: []
        }
      }
    }));
    return id;
  },

  addWeek: (courseId) => {
    const now = Date.now();
    const weekId = `week-${now}`;
    const chapterId = `chapter-${now}`;
    const pageId = `page-${now}`;

    set((state) => {
      const course = state.coursesById[courseId];
      const nextOrder = (course?.weekIds ?? [])
        .map((id) => state.weeksById[id]?.order ?? 0)
        .reduce((max, cur) => Math.max(max, cur), 0) + 1;

      return {
        coursesById: {
          ...state.coursesById,
          [courseId]: {
            ...course,
            weekIds: [...(course?.weekIds ?? []), weekId]
          }
        },
        weeksById: {
          ...state.weeksById,
          [weekId]: {
            id: weekId,
            title: `${nextOrder}주차`,
            order: nextOrder,
            chapterIds: [chapterId]
          }
        },
        chaptersById: {
          ...state.chaptersById,
          [chapterId]: {
            id: chapterId,
            title: '기본 챕터',
            pageIds: [pageId]
          }
        },
        pagesById: {
          ...state.pagesById,
          [pageId]: {
            id: pageId,
            title: '기본 페이지',
            learningItemIds: []
          }
        },
        selectedWeekId: weekId
      };
    });

    return weekId;
  },

  deleteWeek: (courseId, weekId) => {
    set((state) => {
      const course = state.coursesById[courseId];
      if (!course) return {};

      const nextWeekIds = course.weekIds.filter((id) => id !== weekId);
      const deletedWeek = state.weeksById[weekId];

      const chapterIdsToDelete = deletedWeek?.chapterIds ?? [];
      const pageIdsToDelete = chapterIdsToDelete.flatMap(
        (cid) => state.chaptersById[cid]?.pageIds ?? []
      );
      const learningItemIdsToDelete = pageIdsToDelete.flatMap(
        (pid) => state.pagesById[pid]?.learningItemIds ?? []
      );

      const { [weekId]: _removedWeek, ...restWeeks } = state.weeksById;

      const nextChapters = { ...state.chaptersById };
      for (const cid of chapterIdsToDelete) delete nextChapters[cid];

      const nextPages = { ...state.pagesById };
      for (const pid of pageIdsToDelete) delete nextPages[pid];

      const nextLearningItems = { ...state.learningItemsById };
      for (const lid of learningItemIdsToDelete) delete nextLearningItems[lid];

      const deletedIndex = course.weekIds.findIndex((id) => id === weekId);
      let nextSelectedWeekId: ID | undefined = state.selectedWeekId;
      if (state.selectedWeekId === weekId) {
        const nextCandidate = nextWeekIds[deletedIndex] ?? nextWeekIds[deletedIndex - 1];
        nextSelectedWeekId = nextCandidate;
      }

      return {
        coursesById: {
          ...state.coursesById,
          [courseId]: {
            ...course,
            weekIds: nextWeekIds
          }
        },
        weeksById: restWeeks,
        chaptersById: nextChapters,
        pagesById: nextPages,
        learningItemsById: nextLearningItems,
        selectedWeekId: nextSelectedWeekId,
        selectedPageId: undefined
      };
    });
  },

  reorderWeeks: (courseId, orderedWeekIds) => {
    set((state) => {
      const course = state.coursesById[courseId];
      if (!course) return {};

      const nextWeeksById = { ...state.weeksById };
      orderedWeekIds.forEach((wid, idx) => {
        const w = nextWeeksById[wid];
        if (!w) return;
        nextWeeksById[wid] = { ...w, order: idx + 1 };
      });

      return {
        coursesById: {
          ...state.coursesById,
          [courseId]: {
            ...course,
            weekIds: orderedWeekIds
          }
        },
        weeksById: nextWeeksById
      };
    });
  },

  duplicateWeek: (courseId, weekId) => {
    const now = Date.now();
    const weekIdNew = `week-${now}`;

    let createdId: ID | undefined = weekIdNew;

    set((state) => {
      const course = state.coursesById[courseId];
      const sourceWeek = state.weeksById[weekId];
      if (!course || !sourceWeek) {
        createdId = undefined;
        return {};
      }

      const newChaptersById = { ...state.chaptersById };
      const newPagesById = { ...state.pagesById };
      const newItemsById = { ...state.learningItemsById };

      const newChapterIds: ID[] = [];

      sourceWeek.chapterIds.forEach((chapterSourceId, chapterIndex) => {
        const chapterSource = state.chaptersById[chapterSourceId];
        if (!chapterSource) return;
        const chapterIdNew = `chapter-${now}-${chapterIndex}`;

        const newPageIds: ID[] = [];
        chapterSource.pageIds.forEach((pageSourceId, pageIndex) => {
          const pageSource = state.pagesById[pageSourceId];
          if (!pageSource) return;
          const pageIdNew = `page-${now}-${chapterIndex}-${pageIndex}`;

          const newLearningItemIds: ID[] = [];
          pageSource.learningItemIds.forEach((itemSourceId, itemIndex) => {
            const itemSource = state.learningItemsById[itemSourceId];
            if (!itemSource) return;
            const itemIdNew = `item-${now}-${chapterIndex}-${pageIndex}-${itemIndex}`;
            newItemsById[itemIdNew] = { ...itemSource, id: itemIdNew };
            newLearningItemIds.push(itemIdNew);
          });

          newPagesById[pageIdNew] = {
            ...pageSource,
            id: pageIdNew,
            title: pageSource.title,
            learningItemIds: newLearningItemIds
          };
          newPageIds.push(pageIdNew);
        });

        newChaptersById[chapterIdNew] = {
          ...chapterSource,
          id: chapterIdNew,
          title: chapterSource.title,
          pageIds: newPageIds
        };
        newChapterIds.push(chapterIdNew);
      });

      const nextOrder = (course.weekIds ?? [])
        .map((id) => state.weeksById[id]?.order ?? 0)
        .reduce((max, cur) => Math.max(max, cur), 0) + 1;

      const nextWeeksById = {
        ...state.weeksById,
        [weekIdNew]: {
          ...sourceWeek,
          id: weekIdNew,
          order: nextOrder,
          chapterIds: newChapterIds
        }
      };

      return {
        coursesById: {
          ...state.coursesById,
          [courseId]: {
            ...course,
            weekIds: [...course.weekIds, weekIdNew]
          }
        },
        weeksById: nextWeeksById,
        chaptersById: newChaptersById,
        pagesById: newPagesById,
        learningItemsById: newItemsById,
        selectedWeekId: weekIdNew
      };
    });

    return createdId;
  }
}));

