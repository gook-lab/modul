# Tooltip

> Radix Tooltip.

## R — Requirements
- 300ms 지연, 포커스에도 표시, Esc 닫기
- 터치 기기: 렌더하지 않음(aria-label 만)
- 내용은 한 줄 라벨 — 문장·링크는 Popover

## A — Architecture
- Provider 앱 셸에 하나(지연 공유)
- local 없음

## D — Data Model
```ts
type TooltipProps = RadixContent & { label; children; delayDuration? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| label | ReactNode | 한 줄 |
| side | enum 4 | top |

## O — Optimization & Observability
- Portal, 열릴 때만
- aria-describedby 는 Radix 가
