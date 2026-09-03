# Switch

> 즉시 반영 이진 설정. Toggle(bottling) 승격.

## R — Requirements
- role=switch, ON/OFF 라벨 옵션, sm/md
- 토글 → 반영 ≤ 150ms(전환 애니메이션 포함)
- 히트 44px(::after), 보이는 크기는 유지 — 설정 목록 리듬

## A — Architecture
- optimistic: 토글 즉시 켜고 서버 실패 시 되돌리기 + 토스트(bottling 규칙)
- hidden input 으로 폼 참여

## D — Data Model
```ts
type SwitchProps = { checked; onCheckedChange; label; hint?; size?; shape?; labels?; name? } & ButtonProps
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| checked / onCheckedChange | boolean |  |
| labels | boolean | ON/OFF 텍스트 |
| ...rest | ComponentProps<'button'> |  |

## O — Optimization & Observability
- transform 만 애니메이션
- 지표: 설정별 on 비율(제품 지표) — 컴포넌트는 로깅 안 함
