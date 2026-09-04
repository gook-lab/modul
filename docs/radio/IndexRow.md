# IndexRow

> 번호 붙은 도감 행. 목록 하나가 곧 항목 하나이고, 상태는 배지가 알린다.

## R — Requirements
- 번호(3자리 0 패딩) · 제목 · 우측 meta · 제목 아래 sub 슬롯(StockBadge 등)
- onClick 이 있으면 `<button>`, 없으면 `<div>` 로 렌더합니다 — 누를 수 없는 행에 button 을 두지 않습니다
- 터치 타깃 44px, 제목은 한 줄 말줄임(폭이 좁아도 번호와 meta 는 잘리지 않음)
- **opacity 로 행을 흐리게 하지 않습니다.** 이 행은 전부 텍스트라 행 단위 투명도가 곧 텍스트 대비 저하입니다.
  Malt bg(#F7F3EA) 기준 실측 — `--color-neutral-700` 은 opacity 94% 미만에서, `--color-text` 는 65% 미만에서,
  `--malt-clay` 는 86% 미만에서 4.5:1 이 깨집니다. 소진·품절은 `StockBadge` 로 알립니다.

## A — Architecture
- 표현만 맡습니다 — 정렬·필터·번호 매김은 부모가 합니다
- 상태 분류: default(누를 수 있음) · static(onClick 없음) · sub 있음/없음 2×2
- 값을 소유하지 않습니다. onClick 이 유일한 경계입니다

## D — Data Model
- `{ index: number; title: ReactNode; meta?: ReactNode; sub?: ReactNode; opacity?: number; onClick?: () => void }`
- index 는 표시용 순번이지 식별자가 아닙니다 — key 는 부모가 도메인 id 로 줍니다

## I — Interface
- `...rest` 는 루트(button 또는 div)로 전달, `className` 은 마지막
- 상태 배지는 `sub` 로 조립합니다 — IndexRow 는 재고 개념을 모릅니다

## O — Optimization & Observability
- DOM 노드: 행당 4~5 (번호 · 제목 · sub · meta)
- 100행 목록 ≈ 450 노드로 모바일 예산 안입니다. 그 이상은 부모가 가상화합니다
- 지표: list.row_tap(position) · list.scroll_depth
