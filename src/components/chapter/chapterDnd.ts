import type { CollisionDetection } from '@dnd-kit/core';
import { closestCenter, pointerWithin } from '@dnd-kit/core';
import type { Chapter, ID } from '@domain/types';

export const isChapterDropId = (id: ID): boolean =>
  typeof id === 'string' && id.startsWith('chapter-drop:');

export const getChapterIdFromDropId = (id: ID): ID => id.replace('chapter-drop:', '');

export const isPageContainerId = (id: ID): boolean =>
  typeof id === 'string' && id.startsWith('page-container:');

export const getContainerChapterId = (containerId: ID): ID =>
  containerId.replace('page-container:', '');

export function resolveOverChapterId(
  overId: ID,
  ctx: {
    isChapterId: (id: ID) => boolean;
    isPageId: (id: ID) => boolean;
    findChapterByPageId: (pageId: ID) => ID | undefined;
  }
): ID | undefined {
  if (ctx.isChapterId(overId)) return overId;
  if (isChapterDropId(overId)) return getChapterIdFromDropId(overId) as ID;
  if (isPageContainerId(overId)) return getContainerChapterId(overId) as ID;
  if (ctx.isPageId(overId)) return ctx.findChapterByPageId(overId);
  return undefined;
}

export function createChapterTreeCollisionDetection(
  isChapterId: (id: ID) => boolean
): CollisionDetection {
  return (args) => {
    const activeId = String(args.active.id) as ID;
    const isDraggingChapter = isChapterId(activeId);

    if (isDraggingChapter) {
      const chapterDroppables = args.droppableContainers.filter((c) => {
        const id = String(c.id) as ID;
        return isChapterId(id) || isChapterDropId(id) || isPageContainerId(id);
      });

      const pointerHits = pointerWithin({ ...args, droppableContainers: chapterDroppables });
      if (pointerHits.length > 0) return pointerHits;
      return closestCenter({ ...args, droppableContainers: chapterDroppables });
    }

    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) return pointerHits;
    return closestCenter(args);
  };
}

export function resolvePageDropDestination(
  overId: ID,
  chaptersById: Record<ID, Chapter | undefined>,
  ctx: { isPageId: (id: ID) => boolean; findChapterByPageId: (pageId: ID) => ID | undefined }
): { destChapterId: ID; destIndex: number } | undefined {
  if (isPageContainerId(overId)) {
    const destChapterId = getContainerChapterId(overId) as ID;
    const destIndex = chaptersById[destChapterId]?.pageIds.length ?? 0;
    return { destChapterId, destIndex };
  }
  if (ctx.isPageId(overId)) {
    const destChapterId = ctx.findChapterByPageId(overId);
    if (!destChapterId) return undefined;
    const destIndex = chaptersById[destChapterId]?.pageIds.findIndex((pid) => pid === overId) ?? 0;
    return { destChapterId, destIndex };
  }
  return undefined;
}
