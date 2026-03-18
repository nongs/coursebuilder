import type {
  CourseTreeState,
  Course,
  Week,
  Chapter,
  Page,
  LearningItem
} from './types';

const courseId = 'course-1';
const week1Id = 'week-1';
const chapter1Id = 'chapter-1';
const page1Id = 'page-1';
const item1Id = 'item-1';
const item2Id = 'item-2';

const course: Course = {
  id: courseId,
  title: '샘플 코스',
  description: '코스빌더 구조를 테스트하기 위한 샘플 코스입니다.',
  weekIds: [week1Id]
};

const week1: Week = {
  id: week1Id,
  title: '1주차 – 오리엔테이션',
  order: 1,
  chapterIds: [chapter1Id]
};

const chapter1: Chapter = {
  id: chapter1Id,
  title: '코스빌더 소개',
  pageIds: [page1Id]
};

const page1: Page = {
  id: page1Id,
  title: '코스빌더 개요',
  learningItemIds: [item1Id, item2Id]
};

const item1: LearningItem = {
  id: item1Id,
  type: 'text',
  title: '텍스트 소개',
  description: '코스빌더의 기본 개념을 간단히 설명하는 텍스트 요소입니다.'
};

const item2: LearningItem = {
  id: item2Id,
  type: 'video',
  title: '소개 영상',
  description: '코스빌더 사용 흐름을 보여주는 간단한 소개 영상입니다.'
};

export const sampleCourseTree: CourseTreeState = {
  coursesById: {
    [course.id]: course
  },
  weeksById: {
    [week1.id]: week1
  },
  chaptersById: {
    [chapter1.id]: chapter1
  },
  pagesById: {
    [page1.id]: page1
  },
  learningItemsById: {
    [item1.id]: item1,
    [item2.id]: item2
  },
  courseIds: [course.id],
  selectedWeekId: week1Id,
  selectedPageId: page1Id
};

