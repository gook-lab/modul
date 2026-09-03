import { forwardRef, type ComponentPropsWithoutRef } from 'react';

export type MarqueeProps = {
  /** 한 사이클 초 */
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  tone?: 'ink' | 'accent';
} & ComponentPropsWithoutRef<'div'>;

/** 자식을 2회 복제해 -50% translate 무한 루프. */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(
  ({ speed = 18, reverse, pauseOnHover, tone = 'ink', style, children, ...rest }, ref) => (
    <div
      ref={ref}
      aria-hidden
      style={{ overflow: 'hidden', background: tone === 'accent' ? 'var(--color-accent-700)' : undefined, color: tone === 'accent' ? 'var(--color-bg)' : undefined, ...style }}
      onMouseEnter={pauseOnHover ? e => ((e.currentTarget.firstChild as HTMLElement).style.animationPlayState = 'paused') : undefined}
      onMouseLeave={pauseOnHover ? e => ((e.currentTarget.firstChild as HTMLElement).style.animationPlayState = 'running') : undefined}
      {...rest}
    >
      <div style={{ display: 'flex', width: 'max-content', animation: `mdl-marquee ${speed}s linear infinite ${reverse ? 'reverse' : ''}` }}>
        <div style={{ display: 'flex', flex: 'none' }}>{children}</div>
        <div style={{ display: 'flex', flex: 'none' }}>{children}</div>
      </div>
    </div>
  ),
);
Marquee.displayName = 'Marquee';
