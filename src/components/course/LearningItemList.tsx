import React from 'react';
import '@styles/course/_learning-items.scss';
import Modal from '@components/common/Modal';
import Toast from '@components/common/Toast';
import { useCourseStore } from '@store/courseStore';
import type { ID, LearningItem } from '@domain/types';
import Radio from '@components/common/Radio';

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;

function getYoutubeId(url: string): string | null {
  const m = url.match(YOUTUBE_REGEX);
  if (!m) return null;
  return m[4] ?? null;
}

function ensureQuizDefaults(item: LearningItem): NonNullable<LearningItem['quiz']> {
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

function ensureMultipleDefaults(item: LearningItem): NonNullable<LearningItem['quiz']> {
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

const LearningItemList: React.FC<{ pageId: string }> = ({ pageId }) => {
  const page = useCourseStore((s) => s.pagesById[pageId]);
  const itemsById = useCourseStore((s) => s.learningItemsById);
  const addLearningItem = useCourseStore((s) => s.addLearningItem);
  const updateLearningItem = useCourseStore((s) => s.updateLearningItem);
  const deleteLearningItem = useCourseStore((s) => s.deleteLearningItem);

  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; variant: 'default' | 'success' | 'danger' } | null>(null);

  const itemIds = page?.learningItemIds ?? [];

  const onClickAdd = () => {
    addLearningItem(pageId);
    setToast({ message: '학습요소가 추가되었습니다.', variant: 'success' });
  };

  const onConfirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteLearningItem(pageId, confirmDeleteId);
    setConfirmDeleteId(null);
    setToast({ message: '학습요소가 삭제되었습니다.', variant: 'success' });
  };

  return (
    <section className="cb-learning" aria-label="학습요소">
      <div className="cb-learning__header">
        <h3 className="cb-learning__title">학습요소</h3>
        <button type="button" className="cb-btn cb-btn--primary" onClick={onClickAdd}>
          + 학습요소 추가
        </button>
      </div>

      {itemIds.length === 0 ? (
        <div className="cb-learning__empty">학습요소가 없습니다.</div>
      ) : (
        <div className="cb-learning__list">
          {itemIds.map((id) => {
            const item = itemsById[id];
            if (!item) return null;
            const isNone = item.type === 'unknown';
            const youtubeId = item.videoUrl ? getYoutubeId(item.videoUrl) : null;
            const quiz = item.type === 'quiz' ? ensureQuizDefaults(item) : undefined;
            return (
              <div key={id} className="cb-li">
                <div className="cb-li__top">
                  <select
                    className="cb-select"
                    value={item.type}
                    onChange={(e) => {
                      const nextType = e.target.value as LearningItem['type'];
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
                    <option value="unknown" disabled>
                      없음
                    </option>
                    <option value="text">텍스트</option>
                    <option value="video">비디오</option>
                    <option value="quiz">퀴즈</option>
                    <option value="image">이미지</option>
                    <option value="embed">임베드</option>
                  </select>
                  <button
                    type="button"
                    className="cb-iconbtn cb-iconbtn--danger"
                    aria-label="학습요소 삭제"
                    onClick={() => setConfirmDeleteId(id)}
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
                    <input
                      className="cb-input"
                      placeholder="학습요소명"
                      value={item.title}
                      onChange={(e) => updateLearningItem(id, { title: e.target.value })}
                    />
                    <textarea
                      className="cb-textarea"
                      placeholder="학습요소 상세 내용"
                      value={item.content ?? ''}
                      onChange={(e) => updateLearningItem(id, { content: e.target.value })}
                    />

                    {item.type === 'quiz' && quiz && (
                      <div className="cb-quiz">
                        <div className="cb-quiz__row">
                          <span className="cb-quiz__label">문항 유형</span>
                          <div className="cb-quiz__kinds" role="radiogroup" aria-label="퀴즈 유형">
                            {([
                              { id: 'short', label: '단답형' },
                              { id: 'essay', label: '서술형' },
                              { id: 'multiple', label: '객관식' }
                            ] as const).map((k) => (
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
                                  updateLearningItem(id, { quiz: { kind: k.id } as any });
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {quiz.kind === 'short' && (
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
                        )}

                        {quiz.kind === 'essay' && (
                          <textarea
                            className="cb-textarea"
                            placeholder="평가기준"
                            value={quiz.rubric ?? ''}
                            onChange={(e) =>
                              updateLearningItem(id, {
                                quiz: { kind: 'essay', rubric: e.target.value }
                              })
                            }
                          />
                        )}

                        {quiz.kind === 'multiple' && (
                          <div className="cb-mcq">
                            <div className="cb-mcq__list">
                              {(quiz.multiple?.options ?? []).map((opt, idx) => (
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
                                        setToast({ message: '보기는 최소 1개가 필요합니다.', variant: 'danger' });
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
                        )}
                      </div>
                    )}

                    {item.type === 'video' && (
                      <div className="cb-li__video">
                        <input
                          className="cb-input"
                          placeholder="유튜브 링크"
                          value={item.videoUrl ?? ''}
                          onChange={(e) => updateLearningItem(id, { videoUrl: e.target.value })}
                          onBlur={() => {
                            const url = (item.videoUrl ?? '').trim();
                            if (!url) return;
                            if (!getYoutubeId(url)) {
                              setToast({ message: '유효한 유튜브 링크를 입력해주세요.', variant: 'danger' });
                            } else {
                              setToast({ message: '유튜브 링크가 적용되었습니다.', variant: 'success' });
                            }
                          }}
                        />
                        {youtubeId && (
                          <div className="cb-li__videoFrame">
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}`}
                              title="YouTube video player"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {itemIds.length > 0 ? (
        <div className="cb-learning__footer">
          <button type="button" className="cb-btn cb-btn--primary cb-learning__addbottom" onClick={onClickAdd}>
            + 학습요소 추가
          </button>
        </div>
      ) : null}

      <Modal
        isOpen={confirmDeleteId !== null}
        title="학습요소 삭제"
        onClose={() => setConfirmDeleteId(null)}
        footer={
          <>
            <button className="cb-btn cb-btn--primary" onClick={onConfirmDelete}>
              삭제
            </button>
            <button className="cb-btn" onClick={() => setConfirmDeleteId(null)}>
              닫기
            </button>
          </>
        }
      >
        <p className="cb-modal__text">학습요소를 삭제할까요?</p>
      </Modal>

      <Toast
        isOpen={toast !== null}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'default'}
        onClose={() => setToast(null)}
      />
    </section>
  );
};

export default LearningItemList;

