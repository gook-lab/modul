# Popover / Menu

> Radix Popover / DropdownMenu.

## R — Requirements
- Menu: roving·타입어헤드·서브메뉴·구분선·danger 톤. Popover: 비모달 패널
- 열림 INP p75 ≤ 100ms, 충돌 회피 포지셔닝은 Radix
- Esc·바깥 클릭 닫기, 닫힐 때 트리거 포커스

## A — Architecture
- open 은 Radix 내부 또는 controlled
- items 는 정적 배열 — 액션은 onSelect 콜백

## D — Data Model
```ts
type MenuItem = 'separator' | { label; icon?; kbd?; tone?; disabled?; onSelect? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| trigger | ReactNode (asChild) |  |
| align / side | Radix |  |
| items | MenuItem[] | Menu |

## O — Optimization & Observability
- Portal 렌더, 열릴 때만 마운트
- 항목 ≤ 10, 그 이상은 ⌘K
