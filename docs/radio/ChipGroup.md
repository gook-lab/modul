# ChipGroup

> 44px pill 칩 묶음. 하나 고르기와 여러 개 고르기를 한 컴포넌트로 다룬다.

## R — Requirements
- 단일(`type="single"`)과 다중(`type="multiple"`) 선택. bottling 실사용이 근거입니다 —
  취향 단계(성향 6개·잔 수)와 지역 단계가 다중, 노트 작성의 잔 종류가 단일 + 해제 가능
- 단일에서 기본은 **해제 불가**입니다. 고른 것을 다시 눌러 비우려면 `deselectable` 을
  명시합니다 — 값이 비어도 되는 자리인지는 폼이 정할 일이지 칩이 정하지 않습니다
- 키보드: 묶음 전체가 탭 정지점 하나(roving tabindex), ←→ 항목 이동, Home·End 양 끝.
  칩 하나하나가 탭 정지점이면 성향 6개 · 지역 8개에서 지나가는 것만 여덟 번입니다
  (bottling 2026-08-26 확인 — 그래서 손으로 만든 버튼 나열로 돌아가지 않습니다)
- 터치 타깃 44px(`.malt-chip` min-height)
- 하지 않는 것: 검증·최대 개수 제한은 폼 몫, 옵션 목록 fetch 는 화면 몫

## A — Architecture
- Radix ToggleGroup 위의 표현 계층입니다. roving tabindex · 화살표 이동 ·
  single=radiogroup / multiple=aria-pressed 역할 정리를 Radix 가 맡습니다
- 값을 소유하지 않습니다 — `value` + `onChange` 만. 상태 분류: 전부 부모 소유(local/URL)
- 선택 표시는 Radix 가 붙이는 `data-state=on` 을 CSS 가 봅니다.
  `data-state` 는 컴포넌트 소유이므로 `!` 로 덮지 않습니다

## D — Data Model
```ts
type ChipOption<V extends string> = { value: V; label: ReactNode }
// 단일과 다중은 판별 유니언입니다 — value 의 형이 다르므로 (V|'' vs readonly V[])
// 한 형으로 뭉치면 콜사이트마다 캐스팅이 생깁니다.
type Props<V> =
  | ({ type?: 'single'; value: V | ''; onChange: (v: V | '') => void; deselectable?: boolean } & Common<V>)
  | ({ type: 'multiple'; value: readonly V[]; onChange: (v: V[]) => void } & Common<V>)
```

## I — Interface
- `label` 필수(aria-label), `options`, `value`, `onChange`, 단일에만 `deselectable`
- `...rest` 는 루트(ToggleGroup.Root 의 div)로, `className` 은 마지막에 `cx()` 로
- 이벤트: 부모가 onChange 에서 셉니다 — 칩은 지표 이름을 모릅니다

## O — Optimization & Observability
- DOM 노드: 옵션당 1(button) + 루트 1. 8옵션 ≈ 9 노드
- 선택 토글에 리렌더는 묶음 하나 — 옵션 30개 미만이면 메모 불필요
- 지표: 부모 화면의 step.field_change(field) 로 잡습니다
