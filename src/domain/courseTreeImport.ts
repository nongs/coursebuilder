import type { CourseTreeState } from './types';
import { COURSE_TREE_SCHEMA_VERSION } from './types';
import { normalizeCourseTreeState } from './courseTreeNormalize';

export type CourseTreeImportResult =
  | { ok: true; state: CourseTreeState }
  | { ok: false; message: string };

/**
 * 파일 가져오기 전 엄격 검증 (필드 존재·타입·지원 스키마 버전)
 */
export function validateCourseTreeImport(raw: unknown): CourseTreeImportResult {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: '루트는 JSON 객체여야 합니다.' };
  }

  const o = raw as Record<string, unknown>;

  const sv = o.schemaVersion;
  if (sv !== undefined) {
    if (typeof sv !== 'number' || !Number.isInteger(sv)) {
      return { ok: false, message: 'schemaVersion은 정수여야 합니다.' };
    }
    if (sv < 1) {
      return { ok: false, message: 'schemaVersion은 1 이상이어야 합니다.' };
    }
    if (sv > COURSE_TREE_SCHEMA_VERSION) {
      return {
        ok: false,
        message: `이 앱은 스키마 v${COURSE_TREE_SCHEMA_VERSION}까지만 지원합니다. (파일: v${sv})`
      };
    }
  }

  const requiredKeys = [
    'courseIds',
    'coursesById',
    'weeksById',
    'chaptersById',
    'pagesById',
    'learningItemsById'
  ] as const;

  for (const key of requiredKeys) {
    if (!(key in o)) {
      return { ok: false, message: `필수 필드가 없습니다: "${key}"` };
    }
  }

  if (!Array.isArray(o.courseIds)) {
    return { ok: false, message: 'courseIds는 배열이어야 합니다.' };
  }

  for (const key of ['coursesById', 'weeksById', 'chaptersById', 'pagesById', 'learningItemsById'] as const) {
    const v = o[key];
    if (v === null || typeof v !== 'object' || Array.isArray(v)) {
      return { ok: false, message: `"${key}"는 객체(맵)여야 합니다.` };
    }
  }

  const state = normalizeCourseTreeState(raw);
  return { ok: true, state };
}
