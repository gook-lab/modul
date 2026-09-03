# FieldArray

> 반복 항목(연락처·일정·태그) 행 편집. RHF `useFieldArray` 위의 얇은 표현 레이어.

## R — Requirements
- 항목 행 = 콘텐츠 + 이동(↑↓) + 제거(×), 하단 "추가" 버튼 하나
- 개수 제한: `min` 기본 0 · `max` 기본 20. `max` 도달 시 추가 버튼 `disabled` + `aria-disabled` + `title="최대 {max}개"`, 헤더에 `{n} / {max}` 카운터(11px, tabular-nums)
- 정렬은 드래그가 아니라 버튼 — 마우스·키보드·스크린리더가 같은 경로를 씁니다. 첫 행 ↑ 와 마지막 행 ↓ 는 `disabled`
- 제거 후 포커스는 다음 행의 첫 포커스 가능 요소(`input,select,textarea,button`), 없으면 `#{name}-add`
- 행 진입 애니메이션은 `mdl-fadeup var(--motion-base) both` 하나
- 하지 않는 것: 검증(zod/RHF) · fetch · 항목 UI 결정(children render prop) · 드래그 정렬

## A — Architecture
- 표현만. 배열 값·검증·제출은 `useFormContext` 의 폼이 소유하고, FieldArray 는 `control` 만 빌려 씁니다
- 상태 분류 — server: 폼 `defaultValues` 로 들어온 초기 배열 / local: `fields` 순서·포커스 위치 / derived: `canAdd`(`fields.length < max`) · `canRemove`(`fields.length > min`) · `rootErr` / URL·optimistic: 없음
- 배열 수준 오류만 `role="alert"` 로 그리고, 항목별 오류는 children 안의 Field 가 그립니다. 오류 조회는 `Form/errors.ts` 의 `errorAt()` 이 점 경로로 탐색합니다 — `errors[name]` 인덱싱은 중첩·FieldArray 오류를 놓쳤습니다
- 행 `key` 는 RHF 가 발급한 `f.id` — 인덱스가 아니라서 이동·제거 뒤에도 입력 DOM 이 유지됩니다

## D — Data Model
```ts
type FieldArrayRow<T extends FieldValues, N extends ArrayPath<T>> = {
  index: number; id: string;
  name: <K extends string>(k: K) => Path<T> & `${N}.${number}.${K}`;  // 실제 경로 타입
  remove: () => void; canRemove: boolean;
};
type FieldArrayProps<T extends FieldValues, N extends ArrayPath<T>> = {
  name: N; label?: ReactNode;
  empty: RHFFieldArray<T, N>;          // 새 항목 기본값 — 스키마를 아는 쪽(앱)이 넘김
  min?: number; max?: number; reorder?: boolean; addLabel?: string;
  children: (row: FieldArrayRow<T, N>) => ReactNode;
};
// name(k) 가 `${name}.${i}.${k}` 를 조립합니다. 반환이 string 이 아니라 Path<T> 라
// Field 가 값 타입을 좁힐 수 있고, 소비자 쪽 캐스팅이 사라집니다.
// 크기: 항목 n 개 → DOM O(n), 행당 컨테이너·콘텐츠·버튼그룹 3 + 버튼 최대 3 = 6 (코드 산출, 실측 미측정)
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| name | ArrayPath<T> | 폼 필드 경로. 추가 버튼 id `${name}-add` |
| empty | FieldArray<T,N> | append 기본값 |
| min / max | number | 기본 0 / 20 |
| reorder | boolean | 기본 true. false 면 ↑↓ 미렌더 |
| addLabel | string | 기본값은 `t('common.add')` |
| children | render prop | 위 row 객체 |

- 서버 API 없음 — 제출은 폼의 `onSubmit` 이 배열째 보냅니다
- `...rest` · `className` · `forwardRef` 없음. 루트는 `role="group"` div 이고 스타일은 인라인 고정 — 계약 1.1 적용 밖입니다(현재 코드 기준)
- 항목 버튼 `aria-label` 은 `"{i+1}번 항목 위로/아래로/제거"` 로 하드코딩 — `t()` 미치환

## O — Optimization & Observability
- 리렌더 범위: 추가·제거·이동은 `fields` 배열만 갱신하고, 항목 내부 입력은 RHF 비제어라 형제 행을 다시 그리지 않습니다
- DOM 예산: 항목 20개(max 기본) 기준 행 6 × 20 = 120 + children 필드 수. `docs/performance-budget.md` 에 FieldArray 행은 없습니다 — 실측 미측정
- 지표: `fieldarray.add_click`(추가 클릭 수) · `fieldarray.max_reached`(상한 도달 비율 — 상한 재조정 근거) · `fieldarray.remove_undo_absent`(제거 후 되돌리기 요청 — 현재 undo 없음)
- INP 목표는 전역 예산 p75 ≤ 200ms(`docs/performance-budget.md`)를 따르고, 이 컴포넌트 단독 실측은 미측정
- 접근성: 그룹 `aria-label` 은 `label` 이 string 일 때만 붙습니다. ReactNode 라벨을 넘기면 그룹 이름이 비므로 `aria-label` 을 직접 주는 편이 좋습니다
