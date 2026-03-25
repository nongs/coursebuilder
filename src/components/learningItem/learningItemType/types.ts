import type { ID, LearningItem } from '@domain/types';

export type UpdateLearningItemFn = (
  learningItemId: ID,
  patch: Partial<LearningItem>
) => void;
