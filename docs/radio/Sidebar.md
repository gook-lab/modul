# Sidebar

> 접히는 내비 레일. 어드민 셸의 왼쪽 기둥.

## R — Requirements
- 펼침 200 / 접힘 56, 접힘은 아이콘 + title 툴팁
- 활성 항목 좌측 2px 룰 + aria-current=page
- 접힘 상태 기억(Storage 어댑터), 토글 320ms
- < 720px 에서는 렌더하지 않고 TabBar 로 (반응형 규칙)

## A — Architecture
- items 는 라우트 매니페스트에서 생성, activeId 는 현재 라우트에서 파생
- collapsed 는 앱 셸 local + 영속
- renderItem 으로 라우터 Link 주입 — 컴포넌트는 라우터를 모른다

## D — Data Model
```ts
type SidebarItem = { id: string; label: string; icon?: ReactNode; badge?: ReactNode; href?: string };
// badge 는 ReactNode — 숫자·점·Tag 모두 허용, 계산은 부모
```

## I — Interface
- items · activeId · onSelect · collapsed · onToggle · brand · renderItem · ...rest(nav)
- 이벤트: nav.select(id) · nav.toggle(collapsed)

## O — Optimization & Observability
- width 전환은 transition 한 속성 — 내부 라벨은 접힘 시 언마운트(리플로우 최소)
- 항목 ≤ 12 가정, 그 이상은 그룹 접기
- 지표: 항목별 클릭 분포 — 하위 30% 는 ⌘K 로 이동 후보
