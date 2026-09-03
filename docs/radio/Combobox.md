# Combobox

> 검색 자동완성. 입력 → 디바운스 → 필터/API → 결과.

## R — Requirements
- 입력이 곧 필터, 하이라이트, 그룹, creatable, multiple(태그·Backspace), async
- input→result p75 ≤ 150ms 로컬 / ≤ 400ms 원격(디바운스 200 포함)
- **stale 응답 폐기** — 늦게 온 이전 요청이 최신 결과를 덮지 않음(요청 순번)
- 팝업 절대 위치 CLS 0, 키보드만으로 완료, 결과 수 aria-live
- 실패: 마지막 성공 결과 유지 + 재시도 / 오프라인: 로컬 옵션만

## A — Architecture
- query → debounce → source → filter → grouped → flat(키보드 인덱스)
- active 는 query 변경 시 0
- value 부모 소유 / server: async 결과 / local: query·open·active / URL: ?q= 는 부모 / derived: matched·groups·flat

## D — Data Model
- type ComboOption<V> = { value: V; label; group?; hint?; keywords?: string[] } — 객체 전체를 넣지 않음(렌더 = 옵션 × 필드)
- keywords 로 영문/별칭(라프로익 ↔ laphroaig)

## I — Interface
- options · value/onChange(multiple 타입 분기) · filter · async · creatable · ...rest(input)
- GET /search?q=&limit=20 → { items, total }, 요청 id echo
- 이벤트: search.query(len, results, latency) · search.select(position) · search.no_result(q)

## O — Optimization & Observability
- 디바운스 200ms + 최소 1글자 + LRU 50 캐시
- 20개 이상 가상화(visible 6 + overscan 4 = 70 노드)
- 하이라이트 indexOf 1회
- p75 input→result 커스텀 메트릭, no-result-rate > 5% 시 keywords 보강
