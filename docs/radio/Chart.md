# Chart (Bar · Line · Sparkline)

> "보이는 수준"만. 데이터 하나, 색 하나, 격자 가로만.

## R — Requirements
- 시리즈 1개(≤ 60 포인트), 라이브러리 0, SVG 인라인 — 번들 +0KB
- 축 라벨은 시작·끝·최대(·강조) 만. 툴팁 없음 — 값은 sr-only 표에
- 대비: accent 막대/선 위 텍스트 없음. 라벨은 neutral-700
- 그 이상은 visx 로. 토큰(색·폰트)만 공유하고 이 컴포넌트를 확장하지 않는다

## A — Architecture
- 순수 함수: data → SVG. 상태 없음. 크기는 props(width/height), 반응형은 부모가 ResizeObserver 로 width 를 넘김

## D — Data Model
`Series = { label: string; value: number }[]` · Sparkline 은 `number[]`

## I — Interface
- data · width · height · title(필수 — figcaption + aria-labelledby) · fmt · highlight(Bar) · area(Line)

## O — Optimization & Observability
- DOM: Bar = n rect + 3 line + ≤4 text ≈ 60 노드 @ 12 포인트 · Line ≈ 8 · Sparkline = 2
- 인쇄: 벡터라 그대로. print.css 에서 accent → 검정 대체 없음(색 인쇄 가정, 흑백이면 명도 차 충분)
