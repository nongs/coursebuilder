import React from 'react';
import '@styles/course/_page-editor.scss';
import { useCourseStore } from '@store/courseStore';
import LearningItemList from './LearningItemList';

const PageEditor: React.FC = () => {
  const selectedPageId = useCourseStore((s) => s.selectedPageId);
  const page = useCourseStore((s) => (selectedPageId ? s.pagesById[selectedPageId] : undefined));
  const selectedWeekId = useCourseStore((s) => s.selectedWeekId);
  const weeksById = useCourseStore((s) => s.weeksById);
  const chaptersById = useCourseStore((s) => s.chaptersById);
  const updatePageTitle = useCourseStore((s) => s.updatePageTitle);
  const updatePageDescription = useCourseStore((s) => s.updatePageDescription);

  const weekOrder = selectedWeekId ? weeksById[selectedWeekId]?.order : undefined;
  const chapterName = React.useMemo(() => {
    if (!selectedWeekId || !selectedPageId) return undefined;
    const week = weeksById[selectedWeekId];
    const chapterId = week?.chapterIds.find((cid) => chaptersById[cid]?.pageIds.includes(selectedPageId));
    return chapterId ? chaptersById[chapterId]?.title?.trim() : undefined;
  }, [selectedWeekId, selectedPageId, weeksById, chaptersById]);

  if (!selectedPageId || !page) {
    return (
      <div className="cb-pageeditor cb-pageeditor--empty">
        <p className="cb-pageeditor__muted">선택된 페이지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="cb-pageeditor">
      <div className="cb-breadcrumb cb-breadcrumb--flush" aria-label="페이지 경로">
        <span className="cb-breadcrumb__seg">{weekOrder ? `${weekOrder}주차` : '주차'}</span>
        <span className="cb-breadcrumb__sep">&gt;</span>
        <span className={`cb-breadcrumb__seg ${!chapterName ? 'is-muted' : ''}`}>
          {chapterName || '챕터명이 설정되지 않았습니다'}
        </span>
        <span className="cb-breadcrumb__sep">&gt;</span>
        <span className={`cb-breadcrumb__seg ${!page.title.trim() ? 'is-muted' : ''}`}>
          {page.title.trim() || '페이지명이 설정되지 않았습니다'}
        </span>
      </div>

      <div className="cb-pageeditor__content">
        <div className="cb-pageeditor__top">
        <input
          className="cb-input cb-pageeditor__title"
          placeholder="페이지 제목"
          value={page.title}
          onChange={(e) => updatePageTitle(selectedPageId, e.target.value)}
        />
        <textarea
          className="cb-textarea cb-pageeditor__desc"
          placeholder="페이지 설명"
          value={page.description ?? ''}
          onChange={(e) => updatePageDescription(selectedPageId, e.target.value)}
        />
      </div>

        <LearningItemList pageId={selectedPageId} />
      </div>
    </div>
  );
};

export default PageEditor;

