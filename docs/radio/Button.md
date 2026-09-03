# Button

> 액션 하나. primary 는 화면당 하나, 라벨은 왼쪽 정렬.

## R — Requirements
- variant 3 · size 3 · icon(라벨 뒤) · loading(인라인 스피너 + 라벨 유지) · disabled
- 클릭 → 시각 피드백 INP p75 ≤ 100ms (active 색은 CSS 만)
- 터치 타깃 44px(Malt) / 36px
- 비활성이면 왜 못 누르는지 옆에 (aria-describedby, bottling disabledReason)

## A — Architecture
- 표현만. 비동기 상태(loading)는 부모가 내려준다
- as/asChild 로 a·Link 다형성 — 스타일은 그대로, 시맨틱은 호출부가
- local: 없음. derived: disabled = disabled || loading

## D — Data Model
```ts
type ButtonOwnProps = { variant?; size?; icon?: ReactNode; loading?: boolean; block?: boolean; asChild?: boolean };
// 텍스트는 children — label prop 을 두지 않는다 (아이콘만 버튼은 aria-label 필수)
```

## 보조 속성 (v0.9)
- `tone="danger"` — 파괴 동작 전용. primary 는 accent-700 필드, 그 외는 accent-700 잉크. 화면당 하나.
- `rounded` — 기본은 토큰. 명시하면 덮어씀. `pill` 은 칩·FAB 성격의 버튼에만 — 일반 액션에 쓰면 Modernist 의 "모서리 없음" 을 깨뜨린다.
- `iconPosition="start"` — 뒤로가기·이전 같은 방향성 액션.
- `block` — 시트·모바일 폼의 세로 스택.

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| variant | 'primary' | 'secondary' | 'ghost' | primary |
| loading | boolean | aria-busy, 클릭 차단 |
| as / asChild | ElementType | boolean | 다형성 |
| ...rest | ComponentProps<'button'> | type 기본 button |

## O — Optimization & Observability
- CSS 전환만(background 120ms) — JS 없음
- 스피너는 12px border 애니메이션 1개
- 지표 없음 — 클릭은 사용처가 로깅
