# Stepper

> 다단계 폼 진행.

## R — Requirements
- bar(상단 2px, bottling StepBar) / dots(클릭 가능), linear 잠금, optional 표시
- 단계 전환은 180ms 좌우 슬라이드(부모)
- aria-current=step, progressbar aria-valuetext=단계명

## A — Architecture
- current 는 URL(/signup/2) 또는 wizard-context
- 검증 통과 여부는 폼이 — Stepper 는 표시

## D — Data Model
```ts
type Step = { id; label; optional? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| current | number (0-based) |  |
| linear | boolean | 앞 단계만 이동 |
| onStepChange | (i) => void | dots 만 |

## O — Optimization & Observability
- width transition 1개
- 지표: 단계별 이탈률 — 퍼널
