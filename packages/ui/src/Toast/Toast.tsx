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
      <div role="status" aria-live="polite" {...containerProps} style={{ position: 'fixed', zIndex: 1000, display: 'grid', gap: 8, width: 'min(380px, calc(100vw - 32px))', ...POS[position], ...containerProps?.style }}>
        {toasts.map(toast => {
          const err = toast.tone === 'error';
          return (
            <div key={toast.id} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', minHeight: 44, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', background: err ? 'var(--color-accent-100)' : 'var(--color-neutral-900)', color: err ? 'var(--color-accent-800)' : 'var(--color-bg)', borderLeft: err ? '2px solid var(--color-accent)' : 0, animation: 'mdl-toast var(--motion-base) var(--ease-decel) both' }}>
              <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.45 }}>{toast.message}</span>
              {toast.action && <button type="button" onClick={() => { toast.action!.run(); dismiss(toast.id); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 600, color: err ? 'var(--color-accent-700)' : 'var(--color-toast-action)', padding: '6px 4px', minHeight: 32 }}>{toast.action.label}</button>}
              <button type="button" aria-label={t('common.close')} onClick={() => dismiss(toast.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', opacity: .6, padding: 6 }}>×</button>
              <span aria-hidden style={{ position: 'absolute', left: 0, bottom: 0, height: 2, width: '100%', background: err ? 'var(--color-accent)' : 'var(--color-toast-action)', transformOrigin: 'left', animation: `mdl-line ${toast.duration ?? duration}ms linear reverse both` }} />
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
