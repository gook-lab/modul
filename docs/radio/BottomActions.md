# BottomActions

> 화면 하단 고정 액션 바. 첫 버튼이 주 동작이고 safe-area 를 반영합니다.

## R — Requirements
- `position: fixed; left:0; right:0; bottom:0; z-index:10`, 버튼 사이 `gap 8`
- 패딩 `12px 20px calc(16px + env(safe-area-inset-bottom))` — 홈 인디케이터가 있는 기기에서 버튼이 가려지지 않습니다
- 자식 버튼은 `min-height 44`, 첫 자식은 `flex: 1` — 둘 다 `components.css` 의 `.bottom-actions > .btn` 규칙이 담당합니다(소스 주석 근거). 컴포넌트 자체에는 자식 스타일 분기가 없습니다
- 콘텐츠 영역에 `padding-bottom: 88` 을 주는 것은 사용하는 화면의 몫입니다. 이 값이 빠지면 마지막 콘텐츠가 바 뒤로 들어갑니다
- 하지 않는 것: 버튼 생성 · 로딩·비활성 상태 관리 · 스크롤 시 숨김/노출 · 키보드 올라올 때 위치 보정

## A — Architecture
- 고유 props 가 없는 순수 배치 컨테이너입니다. 무엇을 몇 개 넣을지는 전부 소비자가 정합니다
- 상태 분류 — server · local · URL · optimistic 전부 없음(무상태) / derived: 없음. 버튼의 `disabled` · `aria-busy` 같은 상태는 앱이 자식 버튼에 직접 얹습니다
- `AppBar` 와 `z-index: 10` 을 공유합니다. 오버레이(Modal · Drawer · Sheet)는 네이티브 `<dialog>` 라 top layer 로 올라가므로 이 바 위에 정상적으로 덮입니다

## D — Data Model
```ts
// 고유 props 0개 — div 그대로
const BottomActions: ForwardRefExoticComponent<ComponentPropsWithoutRef<'div'> & RefAttributes<HTMLDivElement>>;
// 크기: 노드 1 + 자식 버튼 수. 실사용 1~2개 가정(주 동작 + 보조)
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| children | ReactNode | 첫 자식이 주 동작(flex:1) |
| className | string | `cx('bottom-actions', className)` — 마지막에 붙고 `!` 규칙이 그대로 동작합니다 |
| style | CSSProperties | 인라인 기본값 뒤에 spread — 소비자 값이 이깁니다 |

- `forwardRef` + `...rest` → `<div>` 도달(계약 1.1 충족)
- 서버 API · 이벤트 · 라벨 없음. 클릭 핸들러는 자식 버튼에 붙습니다
- `style` 병합만 인라인 spread 방식이고, 다른 컴포넌트가 쓰는 `sx()` 는 사용하지 않습니다

## O — Optimization & Observability
- DOM 노드 1(+버튼). 모바일 화면 예산 300(`docs/performance-budget.md`) 대비 영향이 사실상 없습니다
- 애니메이션 없음 — `position: fixed` 유지라 스크롤 중 리페인트만 발생합니다
- 지표: `bottomactions.primary_click`(주 동작 클릭률) · `bottomactions.overlap_report`(콘텐츠 가림 제보 — `padding-bottom: 88` 누락 회귀 탐지). 둘 다 실측 미측정
- `env(safe-area-inset-bottom)` 실기기 검증 기록은 아직 없습니다(미측정). 시뮬레이터·실기기 확인은 남은 작업입니다
