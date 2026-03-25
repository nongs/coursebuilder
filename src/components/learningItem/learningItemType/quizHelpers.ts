import type { LearningItem } from '@domain/types';

export function ensureQuizDefaults(item: LearningItem): NonNullable<LearningItem['quiz']> {
  if (item.quiz?.kind === 'multiple') {
    const options = item.quiz.multiple?.options ?? [];
    return {
      kind: 'multiple',
      multiple: {
        options:
          options.length > 0
            ? options
            : [
                { id: `opt-${Date.now()}-1`, label: '' }
              ],
        correctOptionId: item.quiz.multiple?.correctOptionId
      }
    };
  }
  if (item.quiz?.kind === 'essay') {
    return { kind: 'essay', rubric: item.quiz.rubric ?? '' };
  }
  return { kind: 'short', shortAnswer: item.quiz?.shortAnswer ?? '' };
}

export function ensureMultipleDefaults(item: LearningItem): NonNullable<LearningItem['quiz']> {
  const base = ensureQuizDefaults(item);
  if (base.kind !== 'multiple') {
    return {
      kind: 'multiple',
      multiple: {
        options: [{ id: `opt-${Date.now()}-1`, label: '' }]
      }
    };
  }
  const options = base.multiple?.options ?? [];
  return {
    kind: 'multiple',
    multiple: {
      options: options.length > 0 ? options : [{ id: `opt-${Date.now()}-1`, label: '' }],
      correctOptionId: base.multiple?.correctOptionId
    }
  };
}
