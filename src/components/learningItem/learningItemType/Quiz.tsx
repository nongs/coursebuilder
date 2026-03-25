import React from 'react';
import { showToast } from '@utils/toast';
import type { ID, LearningItem } from '@domain/types';
import Radio from '@components/common/Radio';
import { ensureMultipleDefaults } from './quizHelpers';
import type { UpdateLearningItemFn } from './types';

export interface QuizFieldsProps {
  id: ID;
  item: LearningItem;
  quiz: NonNullable<LearningItem['quiz']>;
  updateLearningItem: UpdateLearningItemFn;
}

const QuizFields: React.FC<QuizFieldsProps> = ({ id, item, quiz, updateLearningItem }) => {
  return (
    <div className="cb-quiz">
      <div className="cb-quiz__row">
        <span className="cb-quiz__label">문항 유형</span>
        <div className="cb-quiz__kinds" role="radiogroup" aria-label="퀴즈 유형">
          {(
            [
              { id: 'short', label: '단답형' },
              { id: 'essay', label: '서술형' },
              { id: 'multiple', label: '객관식' }
            ] as const
          ).map((k) => (
            <Radio
              key={k.id}
              name={`quiz-kind-${id}`}
              value={k.id}
              checked={quiz.kind === k.id}
              label={k.label}
              variant="pill"
              onChange={() => {
                if (k.id === 'multiple') {
                  updateLearningItem(id, { quiz: ensureMultipleDefaults(item) });
                  return;
                }
                updateLearningItem(id, {
                  quiz: { kind: k.id } as NonNullable<LearningItem['quiz']>
                });
              }}
            />
          ))}
        </div>
      </div>

      {quiz.kind === 'short' ? (
        <input
          className="cb-input"
          placeholder="정답"
          value={quiz.shortAnswer ?? ''}
          onChange={(e) =>
            updateLearningItem(id, {
              quiz: { kind: 'short', shortAnswer: e.target.value }
            })
          }
        />
      ) : null}

      {quiz.kind === 'essay' ? (
        <div className="cb-li__richtext cb-li__richtext--quiz">
          <label className="cb-li__fieldlabel" htmlFor={`quiz-rubric-${id}`}>
            평가기준
          </label>
          <textarea
            id={`quiz-rubric-${id}`}
            className="cb-textarea cb-quiz__rubric"
            placeholder="평가 기준을 입력하세요"
            rows={6}
            value={quiz.rubric ?? ''}
            onChange={(e) =>
              updateLearningItem(id, {
                quiz: { kind: 'essay', rubric: e.target.value }
              })
            }
          />
        </div>
      ) : null}

      {quiz.kind === 'multiple' ? (
        <div className="cb-mcq">
          <div className="cb-mcq__list">
            {(quiz.multiple?.options ?? []).map((opt) => (
              <div key={opt.id} className="cb-mcq__row">
                <Radio
                  name={`mcq-correct-${id}`}
                  value={opt.id}
                  checked={quiz.multiple?.correctOptionId === opt.id}
                  variant="dot"
                  onChange={() =>
                    updateLearningItem(id, {
                      quiz: {
                        kind: 'multiple',
                        multiple: {
                          ...quiz.multiple,
                          options: quiz.multiple?.options ?? [],
                          correctOptionId: opt.id
                        }
                      }
                    })
                  }
                />
                <input
                  className="cb-input cb-mcq__input"
                  placeholder="보기 내용"
                  value={opt.label}
                  onChange={(e) => {
                    const nextOptions = (quiz.multiple?.options ?? []).map((o) =>
                      o.id === opt.id ? { ...o, label: e.target.value } : o
                    );
                    updateLearningItem(id, {
                      quiz: {
                        kind: 'multiple',
                        multiple: {
                          ...quiz.multiple,
                          options: nextOptions,
                          correctOptionId: quiz.multiple?.correctOptionId
                        }
                      }
                    });
                  }}
                />
                <button
                  type="button"
                  className="cb-iconbtn cb-iconbtn--danger"
                  aria-label="보기 삭제"
                  onClick={() => {
                    const options = quiz.multiple?.options ?? [];
                    if (options.length <= 1) {
                      showToast('보기는 최소 1개가 필요합니다.', 'danger');
                      return;
                    }
                    const nextOptions = options.filter((o) => o.id !== opt.id);
                    const nextCorrect =
                      quiz.multiple?.correctOptionId === opt.id
                        ? undefined
                        : quiz.multiple?.correctOptionId;
                    updateLearningItem(id, {
                      quiz: {
                        kind: 'multiple',
                        multiple: {
                          options: nextOptions,
                          correctOptionId: nextCorrect
                        }
                      }
                    });
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="cb-linkbtn cb-mcq__add"
            onClick={() => {
              const base = ensureMultipleDefaults(item);
              const options = base.multiple?.options ?? [];
              const newOpt: { id: ID; label: string } = {
                id: `opt-${Date.now()}-${options.length + 1}`,
                label: ''
              };
              updateLearningItem(id, {
                quiz: {
                  kind: 'multiple',
                  multiple: {
                    ...base.multiple,
                    options: [...options, newOpt],
                    correctOptionId: base.multiple?.correctOptionId
                  }
                }
              });
            }}
          >
            + 보기 추가
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default QuizFields;
