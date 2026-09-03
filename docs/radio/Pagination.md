# Pagination

> 페이지 번호 내비. 자체 구현.

## R — Requirements
- 첫/끝 + 현재 ±siblings + …, 요약 텍스트, 이전/다음
- 커서 페이지네이션(bottling 20개)이면 Pagination.Cursor
- aria-current=page, nav aria-label

## A — Architecture
- page 는 URL(?page=) 소유
- 총 페이지 수는 서버 total/pageSize

## D — Data Model
```ts
type PaginationProps = { page; total; onChange; siblings?; summary?; pageSize? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| summary | boolean | fn |  |
| Pagination.Cursor | { hasPrev; hasNext; onPrev; onNext } |  |

## O — Optimization & Observability
- 버튼 ≤ 9개
- 지표: 2페이지 이상 진입률 — 낮으면 페이지 크기 재검토
