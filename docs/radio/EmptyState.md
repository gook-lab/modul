# EmptyState

> ViewState 5종(loading · empty · error · offline · ready) 을 하나의 컴포넌트로. bottling 의 "ViewState 전부 처리" 규칙을 강제한다.

## R — Requirements
- 5종 전부 처리 — 누락 시 타입 오류
- empty 는 부정형 문구 금지 + 다음 행동 버튼 필수
- error 는 인라인 재시도(view.retry), role=alert
- offline 은 cached 가 있으면 흐리게 보여준다
- loading 은 400ms threshold 후에만 스켈레톤(부모 훅이 판단), 실제 레이아웃과 같은 높이

## A — Architecture
- view 는 core 훅(useMeetFeed 등)이 만든다 — 컴포넌트는 판정하지 않는다
- children(data) 렌더 프롭으로 ready 를 부모가 그림
- server: view 자체 · local: 없음 · derived: 어떤 슬롯을 그릴지

## D — Data Model
```ts
type ViewState<T> = { kind: 'loading' } | { kind: 'empty' } | { kind: 'error'; message: string; retry: () => void } | { kind: 'offline'; cached?: T } | { kind: 'ready'; data: T };
// discriminated union — switch 누락은 never 로 잡힌다
```

## I — Interface
- view · children(data) · empty/error/offline 슬롯({ title, body, action, secondary }) · skeleton
- 이벤트: view.error(message) · view.empty(screen) · view.retry

## O — Optimization & Observability
- ready 일 때 래퍼 div 없음 — Fragment (레이아웃 영향 0)
- error/offline 전환 애니메이션은 fade-up 320ms 한 번
- 지표: empty 비율(화면별) — 높으면 온보딩 문제, error 비율 — 서버 문제
