import React from 'react';
import '@styles/components/_global-loader.scss';
import { useApiUiStore } from '@store/apiUiStore';

const GlobalLoader: React.FC = () => {
  const pendingCount = useApiUiStore((s) => s.pendingCount);
  const visible = pendingCount > 0;

  if (!visible) return null;

  return (
    <div
      className="cb-globalloader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="데이터를 불러오거나 저장하는 중입니다"
    >
      <div className="cb-globalloader__spinner" aria-hidden />
    </div>
  );
};

export default GlobalLoader;
