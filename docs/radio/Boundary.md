# ErrorBoundary · Boundary

> 렌더 실패를 데이터 실패와 같은 얼굴로. EmptyState error 뷰 재사용.

## R — Requirements
- 위젯 단위로 감싼다 — 하나가 죽어도 나머지는 산다. 라우트 · 카드 · 사이드 패널
- 리셋: 버튼(retry) 또는 resetKeys(라우트 param) 변경
- DEV 에서만 err.message 노출, PROD 는 고정 문구 + onError 로 Sentry
- Suspense 스켈레톤은 실제 레이아웃과 같은 높이 (CLS 0)

## A — Architecture
- class 컴포넌트(getDerivedStateFromError 는 훅으로 불가). Boundary = ErrorBoundary ∘ Suspense
- 상태: err 하나. 로깅은 부모 콜백

## D — Data Model
`{ err: Error | null }`

## I — Interface
- children · fallback(err, reset) · onError · resetKeys · size · skeleton(Boundary)
- 이벤트: boundary.catch(component, message) — 위젯별 실패율

## O — Optimization & Observability
- 경계 자체는 DOM 0 (정상 시 children 그대로)
- 실패율 > 0.1%/세션이면 해당 위젯 RADIO 재검토
