import { useLabels } from '../utils/labels';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type ToastAction = { label: string; run: () => void };
export type ToastOptions = { tone?: 'neutral' | 'error'; action?: ToastAction; duration?: number };
type Toast = { id: number; message: string } & ToastOptions;
type Api = { show: (message: string, opts?: ToastOptions) => number; dismiss: (id: number) => void };
const Ctx = createContext<Api | null>(null);
export const useToast = () => { const c = useContext(Ctx); if (!c) throw new Error('useToast 는 <ToastProvider> 안에서'); return c; };

export type ToastProviderProps = {
  children: ReactNode;
  duration?: number;
  position?: 'bottom-left' | 'bottom-center' | 'top-right';
  /** 스택 컨테이너 div 로 전달 */
  containerProps?: ComponentPropsWithoutRef<'div'>;
};
const POS: Record<NonNullable<ToastProviderProps['position']>, React.CSSProperties> = {
  'bottom-left': { left: 16, bottom: 16 }, 'bottom-center': { left: '50%', bottom: 16, transform: 'translateX(-50%)' }, 'top-right': { right: 16, top: 16 },
};

/** 앱 셸에 하나. role=status + aria-live=polite — 읽는 중을 끊지 않습니다. */
export function ToastProvider({ children, duration = 4000, position = 'bottom-left', containerProps }: ToastProviderProps) {
  const t = useLabels(); const [toasts, set] = useState<Toast[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const dismiss = useCallback((id: number) => { clearTimeout(timers.current.get(id)); timers.current.delete(id); set(c => c.filter(t => t.id !== id)); }, []);
  const show = useCallback((message: string, opts: ToastOptions = {}) => {
    const id = ++seq.current;
    set(c => [...c, { id, message, ...opts }]);
    timers.current.set(id, setTimeout(() => dismiss(id), opts.duration ?? duration));
    return id;
  }, [dismiss, duration]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" className="toast-stack" {...containerProps} style={{ position: 'fixed', zIndex: 1000, display: 'grid', gap: 8, width: 'min(380px, calc(100vw - 32px))', ...POS[position], ...containerProps?.style }}>
        {toasts.map(toast => {
          const err = toast.tone === 'error';
          return (
            /* 스타일은 base-components.css 의 .toast 계열 클래스에 있습니다 — 인라인이면
               테마(malt 등)가 손댈 수 없습니다. 수명 진행선의 duration 만 값이라 인라인입니다. */
            <div key={toast.id} className={err ? 'toast toast-error' : 'toast'}>
              <span className="toast-msg">{toast.message}</span>
              {toast.action && <button type="button" className="toast-action" onClick={() => { toast.action!.run(); dismiss(toast.id); }}>{toast.action.label}</button>}
              <button type="button" className="toast-close" aria-label={t('common.close')} onClick={() => dismiss(toast.id)}>×</button>
              <span aria-hidden className="toast-line" style={{ animation: `mdl-line ${toast.duration ?? duration}ms linear reverse both` }} />
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
