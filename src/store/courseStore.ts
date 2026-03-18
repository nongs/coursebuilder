import { create } from 'zustand';
import { sampleCourseTree } from '../domain/sampleData';
import type { CourseTreeState, ID } from '../domain/types';

const STORAGE_KEY = 'coursebuilder:courseTree';

export interface CourseStore extends CourseTreeState {
  loadFromStorage: () => void;
  saveToStorage: () => void;
  selectPage: (pageId: ID | undefined) => void;
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

  selectPage: (pageId) => {
    set({ selectedPageId: pageId });
  }
}));

