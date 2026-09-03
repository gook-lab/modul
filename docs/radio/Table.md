# Table

> 어드민의 중심. 정렬·선택·상태를 내장하되 데이터는 소유하지 않음.

## R — Requirements
- 정렬(aria-sort) · 선택 + 액션 바 · 고정 헤더 · loading/empty
- 200행까지 스크롤 60fps, 이상은 페이지네이션/가상화
- 행 클릭과 선택 체크박스 비충돌, 좁은 폭에선 가로 스크롤(min-width 480)

## A — Architecture
- 표현 — 정렬·페이지 상태는 부모(URL ?sort=&page=)
- columns 가 렌더와 정렬 키를 함께
- state prop 으로 ViewState 를 받아 loading/empty 내부 처리

## D — Data Model
- type Column<T> = { key; header; sortable?; align?; width?; render? } · type Sort = { key; dir: 'asc'|'desc' }

## I — Interface
- sort/onSortChange · selected/onSelectedChange(Set) · onRowClick · rowKey · stickyHeader
- GET /items?sort=date:desc&cursor= — 정렬은 서버

## O — Optimization & Observability
- DOM 예산: 20행 300 / 200행 3,000(상한) / 1,000행 → 가상화
- 정렬 클릭 → 응답 p75 ≤ 300ms, 헤더 화살표는 즉시
- sticky thead 는 overflow:auto 부모에서만
