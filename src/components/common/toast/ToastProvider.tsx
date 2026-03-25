import React, { useCallback, useEffect, useState } from 'react';
import Toast from './Toast';
import { bindToastEmitter, type ToastVariant } from '@utils/toast';

type ToastPayload = {
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    bindToastEmitter(setToast);
    return () => bindToastEmitter(null);
  }, []);

  const onClose = useCallback(() => setToast(null), []);

  return (
    <>
      {children}
      <Toast
        isOpen={toast !== null}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'default'}
        durationMs={toast?.durationMs ?? 2500}
        onClose={onClose}
      />
    </>
  );
};
