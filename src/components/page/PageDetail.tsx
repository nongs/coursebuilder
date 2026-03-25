import React from 'react';
import '@styles/page/_page-detail.scss';
import { useCourseStore } from '@store/courseStore';
import { LearningItemList } from '@components/learningItem';
import { PageEmptyIcon } from '@components/common/icons';

const PageDetail: React.FC = () => {
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
      <div className="cb-pagedetail cb-pagedetail--empty">
        <div className="cb-pagedetail__empty-inner">
          <div className="cb-pagedetail__empty-icon" aria-hidden>
            <PageEmptyIcon />
          </div>
          <p className="cb-pagedetail__empty-text">선택된 페이지가 없습니다.</p>
        </div>
      </div>
    );
  }

  const weekBreadcrumbLabel = weekOrder ? `${weekOrder}주차` : '주차';
  const chapterBreadcrumbLabel = chapterName || '챕터명이 설정되지 않았습니다';
  const pageBreadcrumbLabel = page.title.trim() || '페이지명이 설정되지 않았습니다';

  return (
    <div className="cb-pagedetail">
      <div className="cb-breadcrumb cb-breadcrumb--flush" aria-label="페이지 경로">
        <span className="cb-breadcrumb__seg" title={weekBreadcrumbLabel}>
          {weekBreadcrumbLabel}
        </span>
        <span className="cb-breadcrumb__sep">&gt;</span>
        <span
          className={`cb-breadcrumb__seg ${!chapterName ? 'is-muted' : ''}`}
          title={chapterBreadcrumbLabel}
        >
          {chapterBreadcrumbLabel}
        </span>
        <span className="cb-breadcrumb__sep">&gt;</span>
        <span
          className={`cb-breadcrumb__seg ${!page.title.trim() ? 'is-muted' : ''}`}
          title={pageBreadcrumbLabel}
        >
          {pageBreadcrumbLabel}
        </span>
      </div>

      <div className="cb-pagedetail__content">
        <div className="cb-pagedetail__top">
          <input
            className="cb-input cb-pagedetail__title"
            placeholder="페이지 제목"
            value={page.title}
            onChange={(e) => updatePageTitle(selectedPageId, e.target.value)}
          />
          <textarea
            className="cb-textarea cb-pagedetail__desc"
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

export default PageDetail;
