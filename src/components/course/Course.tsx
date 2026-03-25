import React from 'react';
import '@styles/course/_course.scss';
import Chapter from '@components/chapter/Chapter';
import PageDetail from '@components/page/PageDetail';

const Course: React.FC = () => {
  return (
    <section className="cb-course" aria-label="코스 편집 영역">
      <aside className="cb-course__left" aria-label="챕터/페이지 목록">
        <Chapter />
      </aside>
      <section className="cb-course__main" aria-label="페이지 상세·학습요소 편집">
        <PageDetail />
      </section>
    </section>
  );
};

export default Course;
