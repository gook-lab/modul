# Accordion

> Radix Accordion.

## R — Requirements
- single/multiple, collapsible, 번호 + 제목 + −/+
- 높이 애니메이션 320ms(--radix-accordion-content-height)
- Enter/Space, 헤더는 h3 > button

## A — Architecture
- 열림 상태 local(FAQ) 또는 URL(#faq-2)

## D — Data Model
```ts
type AccordionItem = { value; title; content };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| type | 'single' | 'multiple' |  |
| rule | '1px' | '2px' |  |

## O — Optimization & Observability
- 닫힌 콘텐츠는 Radix 가 언마운트
- 항목 ≤ 12
