# Select

> 단일 선택 listbox. 네이티브 <select> 가 못 하는 힌트·상태점·44px 행을 위해 존재한다.

## R — Requirements
- 옵션에 hint · dot · disabled, 키보드 ↑↓ Home End Enter Esc, 타입어헤드(600ms 창)
- 열림 → 첫 프레임에 목록 표시(INP p75 ≤ 100ms), 목록은 절대 위치라 CLS 0
- 옵션 50개 이하 — 그 이상은 Combobox 로
- native prop 으로 <select> 폴백 (SSR 폼, 브라우저 자동완성이 필요한 곳)

## A — Architecture
- 값은 부모 소유(value/onChange), 컴포넌트는 open · activeIndex · typeahead 버퍼만
- hidden input 으로 네이티브 폼 제출 참여(name)
- derived: 현재 라벨, aria-activedescendant

## D — Data Model
```ts
type SelectOption<V extends string> = { value: V; label: string; hint?: ReactNode; dot?: 'accent' | 'neutral'; disabled?: boolean };
// 옵션에 객체 전체를 넣지 않는다 — 렌더 비용 = 옵션 × 필드
```

## I — Interface
- options · value · onChange · placeholder · size · native · renderOption · fieldProps · ...rest(button)
- 이벤트 없음 — 선택은 onChange 하나
- 관측 없음 (폼 제출 시 폼이 로깅)

## O — Optimization & Observability
- 목록은 열릴 때만 마운트 — 닫힌 Select 의 DOM 은 button 하나
- 외부 클릭 감지 리스너는 열린 동안만 등록
- a11y: role=combobox + aria-haspopup=listbox + aria-activedescendant — axe 통과
