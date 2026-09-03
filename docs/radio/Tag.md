# Tag

> 작은 상태 라벨. 램프 100/800 틴트.

## R — Requirements
- 3 변형, 텍스트만(아이콘 없음), 한 줄
- 색만으로 뜻을 전하지 않는다 — 텍스트가 곧 상태
- Malt 에선 pill(칩·배지만 둥글다)

## A — Architecture
- 표현만. 상태→variant 매핑은 호출부(tone(status))

## D — Data Model
```ts
type TagOwnProps = { variant?: 'accent' | 'neutral' | 'outline'; asChild? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| variant | enum |  |
| as / asChild |  | 링크 태그 |

## O — Optimization & Observability
- 비용 없음. 테이블 200행 × 1 = 200 노드
