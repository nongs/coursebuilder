import React from 'react';
import type { ID, LearningItem as LearningItemModel } from '@domain/types';
import { LEARNING_ITEM_TYPE_SELECT_OPTIONS } from '@domain/learningItemTypeOptions';
import { useCourseStore } from '@store/courseStore';
import { LazyRichTextEditor } from '@components/common/textEditor';
import QuizFields from './learningItemType/Quiz';
import VideoFields from './learningItemType/Video';
import { ensureQuizDefaults } from './learningItemType/quizHelpers';

export interface LearningItemProps {
  id: ID;
  item: LearningItemModel;
  onDeleteClick: () => void;
}

const LearningItem: React.FC<LearningItemProps> = ({ id, item, onDeleteClick }) => {
  const updateLearningItem = useCourseStore((s) => s.updateLearningItem);
  const isNone = item.type === 'unknown';
  const quiz = item.type === 'quiz' ? ensureQuizDefaults(item) : undefined;

  return (
    <div className="cb-li">
      <div className="cb-li__top">
        <select
          className="cb-select"
          value={item.type}
          onChange={(e) => {
            const nextType = e.target.value as LearningItemModel['type'];
            if (nextType === 'quiz') {
              updateLearningItem(id, {
                type: nextType,
                quiz: ensureQuizDefaults({ ...item, type: 'quiz' })
              });
              return;
            }
            updateLearningItem(id, { type: nextType });
          }}
        >
          {LEARNING_ITEM_TYPE_SELECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="cb-iconbtn cb-iconbtn--danger"
          aria-label="학습요소 삭제"
          onClick={onDeleteClick}
        >
          ✕
        </button>
      </div>

      {isNone ? (
        <div className="cb-li__none">
          <div className="cb-li__noneInner">학습요소 타입을 선택해주세요.</div>
        </div>
      ) : (
        <div className="cb-li__body">
          <React.Suspense
            fallback={<div className="cb-rich cb-rich--loading" aria-busy="true" />}
          >
            <input
              className="cb-input"
              placeholder="학습요소명"
              value={item.title}
              onChange={(e) => updateLearningItem(id, { title: e.target.value })}
            />
            <div className="cb-li__richtext">
              <label className="cb-li__fieldlabel">상세 내용</label>
              <LazyRichTextEditor
                key={`${id}-content`}
                value={item.content ?? ''}
                onChange={(html) => updateLearningItem(id, { content: html })}
                placeholder="내용을 입력하세요. 링크·이미지는 툴바에서 넣을 수 있습니다."
                minHeight={180}
              />
            </div>

            {item.type === 'quiz' && quiz ? (
              <QuizFields id={id} item={item} quiz={quiz} updateLearningItem={updateLearningItem} />
            ) : null}

            {item.type === 'video' ? (
              <VideoFields id={id} item={item} updateLearningItem={updateLearningItem} />
            ) : null}
          </React.Suspense>
        </div>
      )}
    </div>
  );
};

export default LearningItem;
