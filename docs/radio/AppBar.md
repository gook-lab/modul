# AppBar

> 모바일 상단 바. 뒤로 · 제목 또는 경로 · 액션 세 자리만 정해 둡니다.

## R — Requirements
- 높이 `min-height 56`, 패딩 `10px 12px`, 배경 `--color-surface`, 하단 `1px solid --color-divider`
- 뒤로 버튼은 44×44(`min-height 44` · `width 44`) — 계약 1.6 의 터치 타깃 최소선
- `sticky` 기본 true → `position: sticky; top: 0; z-index: 10`. `BottomActions` 와 같은 z-index 라 서로 겹치지 않는 자리에 둡니다
- 제목은 `<h1>` 17px 한 줄 말줄임(`nowrap` + `ellipsis`), 경로(crumbs)는 12px `--color-neutral-700` — 12px 에 neutral-600 을 쓰지 않는 규칙(`docs/contrast-audit.md`)을 지킵니다
- `crumbs` 와 `title` 은 배타적입니다. `crumbs` 가 있으면 `<h1>` 대신 `<nav>` 를 그리므로 그 화면에는 제목 레벨 요소가 없습니다
- 하지 않는 것: 라우팅(`onBack` 콜백만) · 경로 계산 · 스크롤 연동 축소 · 검색 입력

## A — Architecture
- 무상태 표현 컴포넌트입니다. 렌더에 쓰는 값이 전부 props 로 들어옵니다
- 상태 분류 — server: 없음 / local: 없음 / URL: `title` · `crumbs` · `onBack` 의 출처(라우터에서 앱이 파생) / derived: 마지막 crumb 의 `aria-current="page"` 와 강조 스타일 / optimistic: 없음
- F5 매장 상세 화면에서 같은 조합이 반복돼 컴포넌트로 승격한 자리입니다(소스 주석 근거)
- 경로 표시는 Breadcrumb 컴포넌트를 재사용하지 않고 자체 `<nav>` 로 그립니다 — 접힘·펼침 없이 전부 나열합니다

## D — Data Model
```ts
type AppBarProps = {
  title?: ReactNode; onBack?: () => void;
  crumbs?: string[];        // 문자열 배열만 — 링크가 필요하면 Breadcrumb 를 쓰는 편이 맞습니다
  actions?: ReactNode; sticky?: boolean;
} & ComponentPropsWithoutRef<'header'>;
// 크기: crumbs n 개 → 노드 2n-1 (항목 n + 구분자 n-1). 실사용은 2~4단계 가정
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| title | ReactNode | crumbs 없을 때만 렌더 |
| onBack | () => void | 없으면 뒤로 버튼 자체를 그리지 않습니다 |
| crumbs | string[] | 마지막 항목이 현재 위치 |
| actions | ReactNode | 오른쪽 정렬, gap 2 |
| sticky | boolean | 기본 true |

- `forwardRef` · `cx('appbar', className)` · `...rest` → `<header>` 로 모두 도달합니다(계약 1.1 충족)
- 라벨은 `t('common.back')` · `t('breadcrumb.label')` — `LabelsProvider` 로 교체 가능
- 서버 API 없음. 이벤트는 `onBack` 하나

## O — Optimization & Observability
- DOM 노드: 뒤로 + 제목 + 액션 기준 header 1 + 버튼 1 + h1 1 + 액션 래퍼 1 = 4. crumbs 4단계면 header 1 + nav 1 + 7 = 9(코드 산출). 모바일 화면 예산 300 노드(`docs/performance-budget.md`) 대비 여유가 큽니다
- 스타일이 전부 인라인이라 리렌더 시 `style` 객체가 매번 새로 만들어집니다. 상위가 자주 리렌더되는 화면에서는 memo 대상 후보입니다
- 지표: `appbar.back_click`(뒤로 사용률 — 하드웨어 백 대비) · `appbar.title_truncated`(말줄임 발생 비율 — 제목 길이 정책 근거). 둘 다 실측 미측정
- INP 목표는 전역 예산 p75 ≤ 200ms 를 따르고 이 컴포넌트 단독 측정치는 없습니다
