import * as RTip from '@radix-ui/react-tooltip';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type TooltipProps = ComponentPropsWithoutRef<typeof RTip.Content> & { label: ReactNode; children: ReactNode; delayDuration?: number };
/** Radix Tooltip. 포커스에도 표시. Provider 는 앱 셸에 하나 (<Tooltip.Provider>). 터치 기기: aria-label 만 남기고 렌더하지 않음 */
export function Tooltip({ label, children, delayDuration = 300, side = 'top', sideOffset = 8, style, ...rest }: TooltipProps) {
  if (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) return <>{children}</>;
  return (
    <RTip.Root delayDuration={delayDuration}>
      <RTip.Trigger asChild>{children}</RTip.Trigger>
      <RTip.Portal>
        <RTip.Content side={side} sideOffset={sideOffset} style={{ padding: '6px 10px', background: 'var(--color-neutral-900)', color: 'var(--color-bg)', fontSize: 12, zIndex: 60, animation: 'mdl-fadeup 150ms var(--ease-decel) both', ...style }} {...rest}>
          {label}<RTip.Arrow width={8} height={4} style={{ fill: 'var(--color-neutral-900)' }} />
        </RTip.Content>
      </RTip.Portal>
    </RTip.Root>
  );
}
Tooltip.Provider = RTip.Provider;
