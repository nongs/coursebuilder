export type ID = string;

export interface LearningItem {
  id: ID;
  type: 'text' | 'video' | 'quiz' | 'image' | 'embed' | 'unknown';
  title: string;
  description?: string;
}

export interface Page {
  id: ID;
  title: string;
  learningItemIds: ID[];
}

export interface Chapter {
  id: ID;
  title: string;
  pageIds: ID[];
}

export interface Week {
  id: ID;
  title: string;
  order: number;
  chapterIds: ID[];
}

export interface Course {
  id: ID;
  title: string;
  description?: string;
  weekIds: ID[];
}

export interface CourseTreeState {
  coursesById: Record<ID, Course>;
  weeksById: Record<ID, Week>;
  chaptersById: Record<ID, Chapter>;
  pagesById: Record<ID, Page>;
  learningItemsById: Record<ID, LearningItem>;
  courseIds: ID[];
  selectedPageId?: ID;
}

