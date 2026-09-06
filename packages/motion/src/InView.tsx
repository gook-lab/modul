import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { cx, mergeRefs } from '@gook-lab/ui';

export function useInView<T extends Element>({ once = true, threshold = 0.2 } = {}) {
  const ref = useRef<T>(null);
  const [inView, set] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { set(true); if (once) io.disconnect(); } else if (!once) set(false); }, { threshold });
    io.observe(el); return () => io.disconnect();
  }, [once, threshold]);
  return { ref, inView };
}

export type InViewProps = { once?: boolean } & ComponentPropsWithoutRef<'div'>;
/** CSS scroll-driven animation(.mdl-inview) 우선, 미지원 시 IntersectionObserver 폴백(data-inview). */
export const InView = forwardRef<HTMLDivElement, InViewProps>(({ once = true, className, ...rest }, ref) => {
  const { ref: r, inView } = useInView<HTMLDivElement>({ once });
  return <div ref={mergeRefs(ref, r)} className={cx('mdl-inview', className)} data-inview={inView || undefined} {...rest} />;
});
InView.displayName = 'InView';
