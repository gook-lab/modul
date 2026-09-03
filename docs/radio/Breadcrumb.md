# Breadcrumb

> 현재 위치.

## R — Requirements
- 마지막 aria-current=page 텍스트, 5+ 는 … 접기
- 라벨 18ch 말줄임
- renderLink 로 라우터 Link

## A — Architecture
- items 는 라우트 매니페스트에서 파생
- local: open(접기 해제)

## D — Data Model
```ts
type Crumb = { label; href? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| collapse | boolean | number | 기본 5 |
| renderLink | (item, props) => ReactNode |  |

## O — Optimization & Observability
- 비용 없음
