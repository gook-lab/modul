# Slider

> Radix Slider 위에 토큰. 단일·범위.

## R — Requirements
- step · min/max · 틱 · 단위 포맷, 키보드 ←→ Shift PgUp Home End
- 드래그 60fps — 값 변경마다 부모 리렌더가 무거우면 onValueCommit 사용
- 손잡이 16px 이지만 히트는 Radix 가 24px 확보

## A — Architecture
- value 배열(길이 1 또는 2) 부모 소유
- derived: 표시 문자열(format)

## D — Data Model
```ts
type SliderProps = RadixRoot & { label; value: number[]; onValueChange; unit?; format?; ticks?; range? };
// 범위는 minStepsBetweenThumbs=1 로 교차 방지
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| value / onValueChange | number[] | 드래그 중 매 프레임 |
| onValueCommit | (v) => void | 놓을 때 1회 — 서버 호출은 여기 |
| range | boolean | 손잡이 2개 |

## O — Optimization & Observability
- Radix 가 pointer capture · RTL 처리
- 틱은 최대 11개
- aria-valuetext 로 단위 포함 읊기
