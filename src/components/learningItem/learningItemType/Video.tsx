import React from 'react';
import { showToast } from '@utils/toast';
import type { ID, LearningItem } from '@domain/types';
import type { UpdateLearningItemFn } from './types';

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;

export function getYoutubeId(url: string): string | null {
  const m = url.match(YOUTUBE_REGEX);
  if (!m) return null;
  return m[4] ?? null;
}

export interface VideoFieldsProps {
  id: ID;
  item: LearningItem;
  updateLearningItem: UpdateLearningItemFn;
}

const VideoFields: React.FC<VideoFieldsProps> = ({ id, item, updateLearningItem }) => {
  const youtubeId = item.videoUrl ? getYoutubeId(item.videoUrl) : null;

  return (
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
            showToast('유효한 유튜브 링크를 입력해주세요.', 'danger');
          } else {
            showToast('유튜브 링크가 적용되었습니다.', 'success');
          }
        }}
      />
      {youtubeId ? (
        <div className="cb-li__videoFrame">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
};

export default VideoFields;
