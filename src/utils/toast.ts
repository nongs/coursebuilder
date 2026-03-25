export type ToastVariant = 'default' | 'success' | 'danger';

type ToastPayload = {
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

type Emit = (payload: ToastPayload | null) => void;

let emit: Emit | null = null;

/** ToastProvider 마운트 시 연결 */
export function bindToastEmitter(fn: Emit | null): void {
  emit = fn;
}

export function showToast(
  message: string,
  variant: ToastVariant = 'default',
  durationMs = 2500
): void {
  emit?.({ message, variant, durationMs });
}
