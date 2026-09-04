import { forwardRef } from 'react';
import { cx } from '@modul/ui';
import type { NativeProps } from '@modul/ui';
import { useLabels } from '@modul/ui';

export type StepBarProps = NativeProps<'div', { step: number; total: number }>;
/** 상단 2px 진행 바. 페이지 전환 표시도 이것 — 와이프 없음. */
export const StepBar = forwardRef<HTMLDivElement, StepBarProps>(({ step, total, className, ...rest }, ref) => {
  const t = useLabels();
  const pct = total <= 0 ? 0 : Math.round((step / total) * 100);
  return (
    <div ref={ref} className={cx('malt-stepbar', className)} role="progressbar" aria-label={t('stepper.progress')} aria-valuenow={step} aria-valuemin={1} aria-valuemax={total} aria-valuetext={`${step} / ${total}`} {...rest}>
      <span className="malt-stepbar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
});
StepBar.displayName = 'StepBar';
