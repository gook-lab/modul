import { forwardRef, useEffect, useRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { mergeRefs } from '../utils/Slot';
import type { NativeProps } from '../utils/polymorphic';

export type ModalOwnProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  danger?: boolean;
};
export type ModalProps = NativeProps<'dialog', ModalOwnProps>;

/** 네이티브 <dialog> 위에 토큰 클래스만. 포커스 트랩·ESC 는 브라우저가 처리. */
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  ({ open, onClose, title, danger, className, children, ...rest }, ref) => {
    const inner = useRef<HTMLDialogElement>(null);
    useEffect(() => {
      const d = inner.current; if (!d) return;
      if (open && !d.open) d.showModal(); else if (!open && d.open) d.close();
    }, [open]);
    return (
      // 백드롭 클릭으로 닫기. 키보드 닫기(Esc)·포커스 트랩·복귀는 showModal() 이 브라우저에 맡긴 동작이라
      // 별도 키 핸들러를 달면 중복 동작이 됩니다.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <dialog
        ref={mergeRefs(ref, inner)}
        className={cx('dialog', danger && 'dialog-danger', className)}
        onClose={onClose}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{ animation: 'mdl-fadeup var(--motion-slow) var(--ease-decel) both', border: 0, padding: 'var(--space-4)' }}
        {...rest}
      >
        {title && <span className="dialog-title">{title}</span>}
        <div className="dialog-body">{children}</div>
      </dialog>
    );
  },
);
Modal.displayName = 'Modal';

export type ModalActionsProps = NativeProps<'div', { confirm: ReactNode; cancel?: ReactNode; onConfirm?: () => void; onCancel?: () => void }>;
export function ModalActions({ confirm, cancel = '취소', onConfirm, onCancel, className, ...rest }: ModalActionsProps) {
  return (
    <div className={cx('dialog-actions', className)} style={{ justifyContent: 'flex-start' }} {...rest}>
      <button type="button" className="btn btn-primary" onClick={onConfirm}>{confirm}</button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancel}</button>
    </div>
  );
}
