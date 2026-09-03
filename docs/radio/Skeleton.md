# Skeleton

> 로딩 자리표시.

## R — Requirements
- Text · List · Table · Card 프리셋, 실제 레이아웃과 같은 높이
- 400ms threshold 후에만 표시(부모), 표시 후 최소 300ms 유지 — 깜빡임 방지
- reduced-motion 시 시머 정지

## A — Architecture
- 표현만. 언제 보일지는 ViewState/훅
- derived: 없음

## D — Data Model
```ts
Skeleton.Text({ lines }) · List({ rows, avatar }) · Table({ rows, cols }) · Card({ lines })
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| shimmer | boolean | true |
| aria-busy |  | 래퍼에 |

## O — Optimization & Observability
- 배경 그라디언트 애니메이션 1개(composited)
- 노드 수는 실제 콘텐츠의 1/3 이하로
