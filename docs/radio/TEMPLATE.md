# <Component>

> 한 줄: 무엇을 하는 컴포넌트인가

## R — Requirements
- 기능 — 무엇을 한다
- 품질 기준 — 수치 (INP p75, CLS, 응답 시간, 터치 타깃)
- 하지 않는 것 — 어느 계층의 몫인지

## A — Architecture
- 책임 분리 — 표현 vs 상태 소유자
- 상태 분류 — server / local / URL / optimistic / derived

## D — Data Model
```ts
// 타입 + 왜 이 형태인가 + 크기 추정 (O(n) 비교)
```

## I — Interface
- 컴포넌트 props (고유 + ...rest)
- 서버 API
- 이벤트 · 관측 이름

## O — Optimization & Observability
- 렌더 예산 (DOM 노드 수 표)
- 네트워크 (디바운스 · 캐시 · stale)
- 지표 이름과 목표 p75
