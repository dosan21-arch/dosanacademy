import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

// 화면 밝기와 상관없이 늘 어두운 판 + 흰 글씨 (가이드 4-4). 오류만 아이콘을 빨강으로 구분
const STYLES: Record<ToastType, string> = {
  success: 'bg-brand-500',
  error: 'bg-danger',
  info: 'bg-white/25',
};
const ICONS: Record<ToastType, string> = { success: '✓', error: '!', info: 'i' };

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++;
      setToasts((list) => [...list, { id, type, message }]);
      // 오류는 읽을 시간을 넉넉히
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => show('success', m),
      error: (m) => show('error', m),
      info: (m) => show('info', m),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-card bg-[#24282d] py-3.5 pl-4 pr-2 text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
            style={{ animation: 'sheet-up 200ms ease-out' }}
          >
            <span
              aria-hidden="true"
              className={`${STYLES[t.type]} flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold`}
            >
              {ICONS[t.type]}
            </span>
            <p className="flex-1 font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="알림 닫기"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-white/70 hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast 는 ToastProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}
