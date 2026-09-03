# Stat

> KPI 카드.

## R — Requirements
- 라벨 · 값(tabular) · 단위 · 추세(색+화살표+텍스트) · 스파크라인
- 숫자 카운트업은 useCountUp 로 부모가 — 컴포넌트는 정적
- 추세 색은 방향 뿐, 좋고 나쁨은 텍스트가

## A — Architecture
- 값 포맷(toLocaleString) 만 내부. 집계는 domain

## D — Data Model
```ts
type StatProps = { label; value: number | string; unit?; delta?: { value; period?; direction }; sparkline?: number[]; decimals? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| delta.direction | 'up' | 'down' | 'flat' | sr-only 텍스트 동반 |
| sparkline | number[] | ≤ 30점 |

## O — Optimization & Observability
- 스파크라인은 polyline 1개, vector-effect 로 리사이즈 무비용
- 4장 그리드 = 40 노드
