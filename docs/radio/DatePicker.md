# DatePicker

> Radix Popover + react-day-picker. 날짜(또는 기간) + 선택적 시간.

## R — Requirements
- single / range, min·max, 로케일 ko, 시간은 네이티브 <input type=time>
- 열림 INP p75 ≤ 150ms (달력 42셀 렌더), 팝오버는 절대 위치 → CLS 0
- 키보드: 그리드 ←→↑↓ PgUp/PgDn Home End Enter, Esc 닫기 + 포커스 복귀
- 값은 Date 객체 — 표시 포맷은 @malt/domain formatDate 가, 상대 시각은 relativeTime 이

## A — Architecture
- 날짜 선택 = local → onChange 로 즉시 부모에게 (optimistic 아님)
- 월 이동은 DayPicker 내부 local
- URL: 필터용이면 ?from=&to= ISO 로 부모가 동기화

## D — Data Model
```ts
type Single = { mode?: 'single'; value: Date | null; onChange: (d: Date | null) => void };
type Range  = { mode: 'range'; value: DateRange | null; onChange: (r: DateRange | null) => void };
// 서버 왕복은 ISO 문자열, 경계에서만 Date 로 변환
```

## I — Interface
- mode · value · onChange · withTime · time · onTimeChange · min · max · fieldProps · ...rest(button)
- 서버: startsAt ISO 8601 (UTC), 표시 시 로컬로

## O — Optimization & Observability
- react-day-picker 는 lazy import — 폼 첫 렌더에 42셀 비용을 넣지 않는다
- 달력 CSS 는 components.css .calendar 한 블록 (bottling .malt-calendar 와 동일 규격)
- 지표: 날짜 선택까지 클릭 수(평균 ≤ 3) — 많으면 기본 월/프리셋 도입
