import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ID } from '@domain/types';
import { useCourseStore } from '@store/courseStore';
import DeleteConfirmModal from '@components/modal/DeleteConfirmModal';
import PageRow from '@components/chapter/PageRow';
import { showToast } from '@utils/toast';

export interface PageListProps {
  chapterId: ID;
}

const PageList: React.FC<PageListProps> = ({ chapterId }) => {
  const chaptersById = useCourseStore((s) => s.chaptersById);
  const pagesById = useCourseStore((s) => s.pagesById);
  const selectedPageId = useCourseStore((s) => s.selectedPageId);
  const selectPage = useCourseStore((s) => s.selectPage);
  const addPage = useCourseStore((s) => s.addPage);

  const pageIds = chaptersById[chapterId]?.pageIds ?? [];
  const [pageDeleteId, setPageDeleteId] = React.useState<ID | null>(null);

  const containerId = `page-container:${chapterId}`;
  const { setNodeRef: setContainerRef } = useDroppable({ id: containerId });

  const onAddPage = () => {
    addPage(chapterId);
    showToast('페이지가 추가되었습니다.', 'success');
  };

  return (
    <>
      <div ref={setContainerRef} className="cb-pages">
        <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
          {pageIds.map((pid) => {
            const p = pagesById[pid];
            const t = p?.title?.trim();
            const title = t || '페이지명을 입력해주세요';
            const isMuted = !t;
            return (
              <PageRow
                key={pid}
                pageId={pid}
                title={title}
                isMuted={isMuted}
                isActive={selectedPageId === pid}
                onSelect={() => selectPage(pid)}
                onDelete={() => setPageDeleteId(pid)}
              />
            );
          })}
        </SortableContext>
        <button type="button" className="cb-linkbtn" onClick={onAddPage}>
          + 페이지 추가
        </button>
      </div>

      {pageDeleteId !== null ? (
        <DeleteConfirmModal
          isOpen
          target="page"
          chapterId={chapterId}
          pageId={pageDeleteId}
          onClose={() => setPageDeleteId(null)}
        />
      ) : null}
    </>
  );
};

export default PageList;
