export type ID = string;

/**
 * 강의 트리 JSON에 포함되는 스키마 버전.
 * - 저장/내보내기 시 항상 `COURSE_TREE_SCHEMA_VERSION`으로 기록
 * - 가져오기 시 버전에 따라 필드 해석·마이그레이션 분기에 사용 (현재는 v1만 지원)
 */
export const COURSE_TREE_SCHEMA_VERSION = 1 as const;

export interface LearningItem {
  id: ID;
  type: 'text' | 'video' | 'quiz' | 'unknown';
  title: string;
  description?: string;
  /** TipTap 등으로 편집한 정제 HTML 조각(스크립트 등은 저장 시 제거) */
  content?: string;
  videoUrl?: string;
  quiz?: {
    kind: 'short' | 'essay' | 'multiple';
    shortAnswer?: string;
    /** 서술형 평가기준(일반 텍스트) */
    rubric?: string;
    multiple?: {
      options: Array<{ id: ID; label: string }>;
      correctOptionId?: ID;
    };
  };
}

export interface Page {
  id: ID;
  title: string;
  description?: string;
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

/** 런타임·hydrate용 트리 본문 (스키마 버전 제외) */
export type CourseTreeData = {
  courseIds: ID[];
  coursesById: Record<ID, Course>;
  weeksById: Record<ID, Week>;
  chaptersById: Record<ID, Chapter>;
  pagesById: Record<ID, Page>;
  learningItemsById: Record<ID, LearningItem>;
};

/** 로컬스토리지·내보내기 JSON (스키마 버전 포함) */
export type CourseTreePersisted = CourseTreeData & {
  schemaVersion: number;
};

export interface CourseTreeState extends CourseTreeData {
  selectedWeekId?: ID;
  selectedPageId?: ID;
}
