import { forwardRef, useEffect, useId, useRef } from 'react';
import { cx } from '../utils/cx';
import { mergeRefs } from '../utils/Slot';
import type { NativeProps } from '../utils/polymorphic';

export type SheetOwnProps = {
  open: boolean;
  /** Esc · 딤 클릭 · 닫기 전부 이것을 부릅니다. 대개 navigate(-1). */
  onClose: () => void;
  /** 스크린리더가 먼저 읽습니다 — 비우지 마세요 */
  title: string;
  description?: string;
  grip?: boolean;
};
export type SheetProps = NativeProps<'dialog', SheetOwnProps>;

/** 아래에서 올라오는 시트 (220ms, 딤 40%). 원래 화면을 떠나지 않는 결정에. */
export const Sheet = forwardRef<HTMLDialogElement, SheetProps>(
  ({ open, onClose, title, description, grip = true, className, style, children, ...rest }, ref) => {
    const inner = useRef<HTMLDialogElement>(null);
    const tid = useId(), did = useId();
    useEffect(() => { const d = inner.current; if (!d) return; if (open && !d.open) d.showModal(); else if (!open && d.open) d.close(); }, [open]);
    return (
      // 백드롭 클릭으로 닫기. 키보드 닫기(Esc)·포커스 트랩·복귀는 showModal() 이 브라우저에 맡긴 동작이라
      // 별도 키 핸들러를 달면 중복 동작이 됩니다.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <dialog
        ref={mergeRefs(ref, inner)}
        className={cx('sheet', className)}
        aria-labelledby={tid}
        aria-describedby={description ? did : undefined}
        onClose={onClose}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{ position: 'fixed', inset: 0, margin: 0, border: 0, padding: 0, maxWidth: 'none', maxHeight: 'none', width: '100vw', height: '100vh', background: 'transparent', display: open ? 'flex' : undefined, alignItems: 'flex-end', justifyContent: 'center', ...style }}
        {...rest}
      >
        <div style={{ width: 'min(480px, 100%)', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)', padding: '12px 20px 20px', display: 'grid', gap: 12, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', animation: 'mdl-sheet 220ms var(--ease-decel) both' }}>
          {grip && <span aria-hidden style={{ width: 36, height: 4, background: 'var(--color-neutral-300)', justifySelf: 'center', borderRadius: 2 }} />}
          <h2 id={tid} className="dialog-title" style={{ margin: 0, fontSize: 22 }}>{title}</h2>
          {description && <p id={did} className="dialog-body" style={{ margin: 0 }}>{description}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>{children}</div>
        </div>
      </dialog>
    );
  },
);
Sheet.displayName = 'Sheet';

export type SheetOption = { label: string; dot?: string; tone?: 'default' | 'danger'; onSelect: () => void };
/** 시트 안의 선택지 버튼 스택 + "그대로 두기" — 참석 취소 · 재고 상태 · 신고 사유에서 반복되는 형태 */
export function SheetOptions({ options, onKeep, keepLabel = '그대로 두기' }: { options: SheetOption[]; onKeep: () => void; keepLabel?: string }) {
  return (<>
    {options.map(o => <button key={o.label} type="button" className={`btn btn-secondary${o.tone === 'danger' ? ' btn-danger' : ''}`} onClick={o.onSelect} style={{ minHeight: 44, justifyContent: 'flex-start', gap: 10 }}>{o.dot && <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: o.dot }} />}{o.label}</button>)}
    <button type="button" className="btn btn-ghost" onClick={onKeep} style={{ minHeight: 44 }}>{keepLabel}</button>
  </>);
}
