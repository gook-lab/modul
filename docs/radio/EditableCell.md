# EditableCell

> 표 안 인라인 편집 셀. 표시와 편집이 같은 박스를 써서 전환에 레이아웃 이동이 없습니다.

## R — Requirements
- 표시 상태는 `<button>`(포커스 가능, `Enter`·`F2` 로 편집 진입), 편집 상태는 `<input>` — 둘 다 `min-height 32`, `padding 0 6px`, `margin 0 -6px`, `box-sizing: content-box` 로 같은 박스 → CLS 0(`docs/performance-budget.md` 의 "인라인 편집 동일 박스")
- 확정 경로 3개: `Enter`(기본 동작 차단 후 커밋) · `Tab`(커밋 후 이동) · `blur`(커밋). 취소는 `Escape` — draft 를 `value` 로 되돌리고 표시 상태 복귀
- `draft === value` 면 커밋을 건너뜁니다 — 편집만 하고 나갈 때 네트워크 0회
- 저장 중: 값 유지 + `opacity .5` + `input disabled`. 실패 시 편집 상태 유지 + `role="alert"` 오류 + 입력에 포커스 복귀 + 밑줄 `--color-accent-700`
- 한글 IME: 키 핸들러 전체가 `guardIme()` 경유 — 조합 확정 `Enter` 가 커밋으로 새지 않습니다(`utils/keyboard.ts`)
- `type="number"` 면 `font-variant-numeric: tabular-nums`, `align` 은 표시·편집 양쪽에 같은 값
- 하지 않는 것: 검증 · 낙관적 반영 · 셀 간 Tab 순서 계산 · 저장 요청 자체(`onCommit` 은 앱)

## A — Architecture
- 값의 소유자는 부모(표/서버). 컴포넌트는 편집 세션만 소유하고, 성공하면 `value` 가 다시 내려오길 기다립니다
- 상태 분류 — server: `value` prop / local: `edit` · `draft` · `busy` · `err` / derived: `aria-invalid` · `aria-describedby` · 밑줄 색 · `opacity` / optimistic: 없음(저장 중에도 이전 값을 그대로 보여줍니다) / URL: 없음
- `edit` 이 false 인 동안에만 `value` → `draft` 를 동기화합니다. 편집 중 도착한 서버 값이 입력 내용을 덮지 않습니다
- Table 배선은 미완입니다. `Table.tsx:4` 가 `Column<T>` 에 `editable` · `onCommit` · `inputType` 타입을 정의하지만 `Table.tsx` 본체는 `EditableCell` 을 import 하지도 렌더하지도 않습니다. 조립 목표 형태는 `packages/ui/src/Table/TABLE-VIRTUAL.md`, 작업 항목은 `PROMPT.md` 단계 5

## D — Data Model
```ts
// 컴포넌트 (packages/ui/src/Table/EditableCell.tsx)
function EditableCell(p: {
  value: string;                                  // 표시·취소 복원의 기준값
  onCommit: (v: string) => void | Promise<void>;  // 실패는 throw — err.message 를 alert 에 표시
  type?: 'text' | 'number'; align?: 'left' | 'right';
}): JSX.Element;

// 컬럼 타입 (packages/ui/src/Table/Table.tsx) — 같은 이름의 별개 타입
type EditableCell<T> = { editable?: boolean | ((row: T) => boolean); onCommit?: (row: T, value: string) => void | Promise<void>; inputType?: 'text' | 'number' };
// 값은 항상 string 으로 오가고 숫자 변환은 앱이 합니다 (`onCommit: (r, v) => api.patch(r.id, { budget: +v })`)
```

## I — Interface
- props: `value` · `onCommit` · `type` · `align`. `...rest` · `className` · `forwardRef` 없음 — 계약 1.1 적용 밖입니다(현재 코드 기준)
- 표시 상태 루트에 `className="cell-edit"` 이 붙어 있어 앱 CSS 로 표시 상태만 겨냥할 수 있습니다
- 서버 API: 셀 단위 부분 갱신(`PATCH /items/:id`)을 전제하되 호출은 `onCommit` 안에서 앱이 합니다
- 오류 요소 id 가 `'cell-err'` 고정입니다 — 한 표에서 두 셀이 동시에 실패하면 id 가 중복되고 `aria-describedby` 가 첫 요소를 가리킵니다(개선 후보)
- 편집 진입 힌트는 `title="Enter 로 편집"` 하드코딩 — `labels.ts` 의 `table.editing` 키는 아직 미사용

## O — Optimization & Observability
- 리렌더 범위: 셀 하나. 편집 진입·커밋이 행이나 표 전체를 다시 그리지 않습니다
- DOM 노드: 표시 1 · 편집 1(+오류 1). `Table 20행 × 5열 ≈ 130`(`docs/performance-budget.md`) 기준 편집 중 셀만 +1
- 네트워크: 디바운스 없음 — 확정 시 1회. 같은 값 커밋 스킵이 유일한 절약 경로이고, 재시도·큐는 앱의 몫입니다
- 지표: `cell.commit_latency_p75`(확정 → 성공 응답, 목표는 전역 INP 예산 p75 ≤ 200ms 와 별개로 미정) · `cell.commit_fail_rate`(실패율) · `cell.escape_rate`(편집 진입 후 취소 비율 — 진입이 너무 쉬운지의 근거). 현재 세 지표 모두 실측 미측정
- 대비: 빈 값 표시 `—` 가 `--color-neutral-500` 입니다. `docs/contrast-audit.md` 표에 500 단계 계산값이 없어 미측정이고, 규칙상 placeholder·장식 용도에 해당합니다
