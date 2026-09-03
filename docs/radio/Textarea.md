# Textarea

> 여러 줄 입력 + 글자수.

## R — Requirements
- maxLength 카운터, 90% 경고색, autoGrow
- 한 글자 입력 → 카운터 갱신 ≤ 1 프레임
- autoGrow 시 CLS: 높이 변화는 사용자 입력에 의한 것이라 CLS 집계 제외 — 그래도 max-height 로 상한

## A — Architecture
- 값은 폼 소유, 컴포넌트는 높이 계산만
- derived: len, ratio → 색·바

## D — Data Model
```ts
type TextareaOwnProps = { label?; helper?; autoGrow?: boolean; fieldProps? };
// 글자수는 [...value].length — 이모지·한글 결합문자 1글자 = 1
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| maxLength | number | 있을 때만 카운터 |
| autoGrow | boolean | scrollHeight |
| ...rest | ComponentProps<'textarea'> |  |

## O — Optimization & Observability
- autoGrow 는 입력마다 height:auto → scrollHeight 2회 리플로우 — 16ms 안. 1,000자 이상이면 debounce
- aria-live=polite 카운터는 90%·100% 시점만 읊게(매 글자 읊지 않음)
