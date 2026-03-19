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

  addChapter: (weekId: ID) => ID;
  reorderChapters: (weekId: ID, orderedChapterIds: ID[]) => void;
  updateChapterTitle: (chapterId: ID, title: string) => void;
  deleteChapter: (weekId: ID, chapterId: ID) => void;

  addPage: (chapterId: ID) => ID;
  updatePageTitle: (pageId: ID, title: string) => void;
  updatePageDescription: (pageId: ID, description: string) => void;
  deletePage: (chapterId: ID, pageId: ID) => void;
  movePage: (sourceChapterId: ID, destChapterId: ID, pageId: ID, destIndex: number) => void;

  addLearningItem: (pageId: ID) => ID;
  updateLearningItem: (learningItemId: ID, patch: Partial<CourseTreeState['learningItemsById'][ID]>) => void;
  deleteLearningItem: (pageId: ID, learningItemId: ID) => void;
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
      if (course.weekIds.length <= 1) return {};

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
  },

  addChapter: (weekId) => {
    const now = Date.now();
    const chapterId = `chapter-${now}`;
    const pageId = `page-${now}`;
    set((state) => {
      const week = state.weeksById[weekId];
      if (!week) return {};
      return {
        weeksById: {
          ...state.weeksById,
          [weekId]: {
            ...week,
            chapterIds: [...week.chapterIds, chapterId]
          }
        },
        chaptersById: {
          ...state.chaptersById,
          [chapterId]: {
            id: chapterId,
            title: '',
            pageIds: [pageId]
          }
        },
        pagesById: {
          ...state.pagesById,
          [pageId]: {
            id: pageId,
            title: '',
            description: '',
            learningItemIds: []
          }
        },
        selectedPageId: pageId
      };
    });
    return chapterId;
  },

  reorderChapters: (weekId, orderedChapterIds) => {
    set((state) => {
      const week = state.weeksById[weekId];
      if (!week) return {};
      return {
        weeksById: {
          ...state.weeksById,
          [weekId]: {
            ...week,
            chapterIds: orderedChapterIds
          }
        }
      };
    });
  },

  updateChapterTitle: (chapterId, title) => {
    const nextTitle = title.trim();
    set((state) => {
      const chapter = state.chaptersById[chapterId];
      if (!chapter) return {};
      return {
        chaptersById: {
          ...state.chaptersById,
          [chapterId]: {
            ...chapter,
            title: nextTitle
          }
        }
      };
    });
  },

  deleteChapter: (weekId, chapterId) => {
    set((state) => {
      const week = state.weeksById[weekId];
      const chapter = state.chaptersById[chapterId];
      if (!week || !chapter) return {};

      const nextChapterIds = week.chapterIds.filter((id) => id !== chapterId);
      const pageIdsToDelete = chapter.pageIds;
      const learningItemIdsToDelete = pageIdsToDelete.flatMap(
        (pid) => state.pagesById[pid]?.learningItemIds ?? []
      );

      const nextChapters = { ...state.chaptersById };
      delete nextChapters[chapterId];

      const nextPages = { ...state.pagesById };
      for (const pid of pageIdsToDelete) delete nextPages[pid];

      const nextLearningItems = { ...state.learningItemsById };
      for (const lid of learningItemIdsToDelete) delete nextLearningItems[lid];

      const nextSelectedPageId =
        pageIdsToDelete.includes(state.selectedPageId ?? '')
          ? (nextChapterIds[0] ? state.chaptersById[nextChapterIds[0]]?.pageIds[0] : undefined)
          : state.selectedPageId;

      return {
        weeksById: {
          ...state.weeksById,
          [weekId]: { ...week, chapterIds: nextChapterIds }
        },
        chaptersById: nextChapters,
        pagesById: nextPages,
        learningItemsById: nextLearningItems,
        selectedPageId: nextSelectedPageId
      };
    });
  },

  addPage: (chapterId) => {
    const now = Date.now();
    const pageId = `page-${now}`;
    set((state) => {
      const chapter = state.chaptersById[chapterId];
      if (!chapter) return {};
      return {
        chaptersById: {
          ...state.chaptersById,
          [chapterId]: {
            ...chapter,
            pageIds: [...chapter.pageIds, pageId]
          }
        },
        pagesById: {
          ...state.pagesById,
          [pageId]: {
            id: pageId,
            title: '',
            description: '',
            learningItemIds: []
          }
        },
        selectedPageId: pageId
      };
    });
    return pageId;
  },

  updatePageTitle: (pageId, title) => {
    set((state) => {
      const page = state.pagesById[pageId];
      if (!page) return {};
      return {
        pagesById: {
          ...state.pagesById,
          [pageId]: { ...page, title }
        }
      };
    });
  },

  updatePageDescription: (pageId, description) => {
    set((state) => {
      const page = state.pagesById[pageId];
      if (!page) return {};
      return {
        pagesById: {
          ...state.pagesById,
          [pageId]: { ...page, description }
        }
      };
    });
  },

  deletePage: (chapterId, pageId) => {
    set((state) => {
      const chapter = state.chaptersById[chapterId];
      const page = state.pagesById[pageId];
      if (!chapter || !page) return {};

      const nextPageIds = chapter.pageIds.filter((id) => id !== pageId);
      const itemIdsToDelete = page.learningItemIds;

      const nextChapters = {
        ...state.chaptersById,
        [chapterId]: { ...chapter, pageIds: nextPageIds }
      };

      const nextPages = { ...state.pagesById };
      delete nextPages[pageId];

      const nextItems = { ...state.learningItemsById };
      for (const lid of itemIdsToDelete) delete nextItems[lid];

      const nextSelectedPageId =
        state.selectedPageId === pageId ? nextPageIds[0] : state.selectedPageId;

      return {
        chaptersById: nextChapters,
        pagesById: nextPages,
        learningItemsById: nextItems,
        selectedPageId: nextSelectedPageId
      };
    });
  },

  movePage: (sourceChapterId, destChapterId, pageId, destIndex) => {
    set((state) => {
      const source = state.chaptersById[sourceChapterId];
      const dest = state.chaptersById[destChapterId];
      if (!source || !dest) return {};

      // 같은 챕터 내 이동(재정렬)도 포함
      if (sourceChapterId === destChapterId) {
        const current = [...source.pageIds];
        const from = current.findIndex((id) => id === pageId);
        if (from < 0) return {};
        current.splice(from, 1);
        const clamped = Math.max(0, Math.min(destIndex, current.length));
        current.splice(clamped, 0, pageId);
        return {
          chaptersById: {
            ...state.chaptersById,
            [sourceChapterId]: { ...source, pageIds: current }
          }
        };
      }

      const sourceIds = source.pageIds.filter((id) => id !== pageId);
      const nextDestIds = [...dest.pageIds];
      const clamped = Math.max(0, Math.min(destIndex, nextDestIds.length));
      nextDestIds.splice(clamped, 0, pageId);

      return {
        chaptersById: {
          ...state.chaptersById,
          [sourceChapterId]: { ...source, pageIds: sourceIds },
          [destChapterId]: { ...dest, pageIds: nextDestIds }
        }
      };
    });
  },

  addLearningItem: (pageId) => {
    const now = Date.now();
    const itemId = `item-${now}`;
    set((state) => {
      const page = state.pagesById[pageId];
      if (!page) return {};
      return {
        pagesById: {
          ...state.pagesById,
          [pageId]: { ...page, learningItemIds: [...page.learningItemIds, itemId] }
        },
        learningItemsById: {
          ...state.learningItemsById,
          [itemId]: {
            id: itemId,
            type: 'unknown',
            title: '',
            description: '',
            content: ''
          }
        }
      };
    });
    return itemId;
  },

  updateLearningItem: (learningItemId, patch) => {
    set((state) => {
      const li = state.learningItemsById[learningItemId];
      if (!li) return {};
      return {
        learningItemsById: {
          ...state.learningItemsById,
          [learningItemId]: { ...li, ...patch }
        }
      };
    });
  },

  deleteLearningItem: (pageId, learningItemId) => {
    set((state) => {
      const page = state.pagesById[pageId];
      if (!page) return {};
      const nextIds = page.learningItemIds.filter((id) => id !== learningItemId);
      const nextItems = { ...state.learningItemsById };
      delete nextItems[learningItemId];
      return {
        pagesById: {
          ...state.pagesById,
          [pageId]: { ...page, learningItemIds: nextIds }
        },
        learningItemsById: nextItems
      };
    });
  }
}));

