import React from 'react';
import '@styles/course/_workspace.scss';
import ChapterTree from '@components/course/ChapterTree';
import PageEditor from '@components/course/PageEditor';

const CourseWorkspace: React.FC = () => {
  return (
    <section className="cb-workspace" aria-label="코스 편집 영역">
      <aside className="cb-workspace__left" aria-label="챕터/페이지 목록">
        <ChapterTree />
      </aside>
      <section className="cb-workspace__main" aria-label="페이지/학습요소 편집">
        <PageEditor />
      </section>
    </section>
  );
};

export default CourseWorkspace;

