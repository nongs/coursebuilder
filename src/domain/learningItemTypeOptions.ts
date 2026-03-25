import type { LearningItem } from './types';

export type LearningItemType = LearningItem['type'];

type DomainSelectable = Exclude<LearningItemType, 'unknown'>;

/**
 * 선택 가능한 타입(unknown 제외) 목록 — 도메인에 타입이 추가되면 여기 키도 맞춰야 함.
 * 객체 키 순서가 셀렉트에서의 표시 순서가 됨.
 */
export const LEARNING_ITEM_TYPE_SELECTABLE_KEYS = {
  text: true,
  video: true,
  quiz: true
} as const satisfies Record<DomainSelectable, true>;

export const LEARNING_ITEM_TYPE_SELECT_ORDER = [
  'unknown',
  ...(Object.keys(LEARNING_ITEM_TYPE_SELECTABLE_KEYS) as DomainSelectable[])
] as const satisfies readonly LearningItemType[];

/** UI 표시용 — `LearningItem['type']` 키가 바뀌면 컴파일러가 누락을 알려줌 */
export const LEARNING_ITEM_TYPE_LABELS: Record<LearningItemType, string> = {
  unknown: '없음',
  text: '텍스트',
  video: '비디오',
  quiz: '퀴즈'
};

export interface LearningItemTypeSelectOption {
  value: LearningItemType;
  label: string;
  disabled?: boolean;
}

export const LEARNING_ITEM_TYPE_SELECT_OPTIONS: LearningItemTypeSelectOption[] =
  LEARNING_ITEM_TYPE_SELECT_ORDER.map((value) => ({
    value,
    label: LEARNING_ITEM_TYPE_LABELS[value],
    ...(value === 'unknown' ? { disabled: true } : {})
  }));
