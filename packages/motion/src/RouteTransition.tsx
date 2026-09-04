import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type RouteTransitionProps = {
  /** 라우트 키 — 바뀌면 와이프 실행 */
  routeKey: string;
  duration?: number;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

/** 강조색 블록이 왼쪽에서 덮고(0–45%) 오른쪽으로 빠짐(55–100%). 콘텐츠는 가려진 시점에 교체. */
export function RouteTransition({ routeKey, duration = 720, children, style, ...rest }: RouteTransitionProps) {
  const [shown, setShown] = useState({ key: routeKey, node: children });
  const [wiping, setWiping] = useState(false);
  // 렌더 중에 ref 를 쓰면 StrictMode 의 두 번째 렌더에서 값이 어긋납니다.
  // 커밋 뒤에 갱신해도 전환 타이머(duration*0.47)보다 훨씬 먼저라 최신 children 을 읽는 데 문제가 없습니다.
  const latest = useRef(children);
  useEffect(() => { latest.current = children; });
  // 전환은 타이머로 진행합니다(덮기 → 교체 → 걷기). 렌더 중에 계산할 수 있는 값이 아닙니다.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (routeKey === shown.key) { setShown(s => ({ ...s, node: children })); return; }
    setWiping(true);
    const swap = setTimeout(() => setShown({ key: routeKey, node: latest.current }), duration * 0.47);
    const done = setTimeout(() => setWiping(false), duration + 40);
    return () => { clearTimeout(swap); clearTimeout(done); };
    // routeKey 만 의존합니다 — children 이 바뀔 때마다 전환을 다시 시작하면 화면이 계속 덮입니다.
    // 최신 children 은 latest ref 로 읽으므로 값이 낡지도 않습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);
  /* eslint-enable react-hooks/set-state-in-effect */
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }} {...rest}>
      {shown.node}
      {wiping && <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'var(--color-accent)', animation: `mdl-wipe ${duration}ms var(--ease-inout) both`, pointerEvents: 'none' }} />}
    </div>
  );
}
