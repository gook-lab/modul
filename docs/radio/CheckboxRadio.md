# Checkbox / Radio

> Checkbox · RadioGroup — Radix 위에 토큰.

## R — Requirements
- 체크·불확정·비활성, cards 레이아웃은 카드 전체 히트
- Radio ↑↓←→ 로 이동+선택 (roving), Space 체크
- 44px 행

## A — Architecture
- Radix 가 상태·키보드·폼 hidden input. 우리는 라벨·힌트·레이아웃
- value 는 부모(단일 boolean / 그룹 문자열)

## D — Data Model
```ts
type RadioOption<V> = { value: V; label: ReactNode; hint?: ReactNode; disabled?: boolean };
// 옵션 ≤ 7. 그 이상은 Select
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| checked / onCheckedChange | boolean | 'indeterminate' | Radix |
| layout | 'stack' | 'inline' | 'cards' |  |
| ...rest | Radix Root props | name, required, form |

## O — Optimization & Observability
- 상태 스타일은 data-state 로 CSS 만
- a11y: label[for] + hint 는 aria-describedby
