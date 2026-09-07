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

/** 아래에서 올라오는 시트 (move 프리셋 · 딤 40%). 원래 화면을 떠나지 않는 결정에. */
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
        style={{ position: 'fixed', inset: 0, margin: 0, border: 0, padding: 0, maxWidth: 'none', maxHeight: 'none', width: '100vw', height: '100vh', background: 'transparent', display: open ? 'flex' : undefined, ...style }}
        {...rest}
      >
        {/* 스타일은 base-components.css 의 .sheet 계열 클래스에 있습니다 — 인라인이면
            테마(malt 의 스크롤 한계 · safe-area · 데스크톱 가운데 세우기)가 손댈 수 없습니다.
            지속시간도 220ms 하드코딩이 아니라 move 프리셋(var(--motion-slow))입니다. */}
        <div className="sheet-panel">
          {grip && <span aria-hidden className="sheet-grip" />}
          <h2 id={tid} className="dialog-title sheet-title">{title}</h2>
          {description && <p id={did} className="dialog-body sheet-body">{description}</p>}
          <div className="sheet-actions">{children}</div>
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
