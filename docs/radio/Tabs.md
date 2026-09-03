# Tabs

> Radix Tabs 위에 토큰.

## R — Requirements
- underline / contained, 아이콘·카운트, ←→ Home End 자동 활성
- 탭 전환 → 패널 표시 INP p75 ≤ 100ms(패널은 가벼워야 — 무거우면 lazy)
- 패널 높이 차로 CLS 생기면 min-height

## A — Architecture
- value 는 URL(?tab=) 이 소유하는 게 기본 — 공유·복구
- Radix 가 roving tabindex·aria

## D — Data Model
```ts
type TabItem = { value; label; icon?; count?; disabled? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| items | TabItem[] |  |
| value / onValueChange | string | URL 동기화 권장 |
| variant | enum |  |

## O — Optimization & Observability
- 비활성 패널은 언마운트(Radix 기본) — 상태 유지 필요하면 forceMount
- 지표: 탭별 진입 비율 → 순서 조정
