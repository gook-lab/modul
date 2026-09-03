# ScrollTabs

> 탭이 화면 폭을 넘길 때 쓰는 모바일 Tabs. 가로 스크롤 + 활성 탭 자동 노출.

## R — Requirements
- 탭 행 `min-height 44`(터치 타깃), 탭 패딩 `0 14px`, 리스트 패딩 `0 12px`, 하단 `1px solid --color-divider`
- 가로 스크롤(`overflow-x: auto`) + 스크롤바 숨김(`scrollbar-width: none`, webkit 은 `components.css` 의 `.scroll-tabs [role=tablist]::-webkit-scrollbar{display:none}`)
- `scroll-snap-type: x proximity` + 탭마다 `scroll-snap-align: start`
- 탭이 포커스를 받으면 `scrollIntoView({ inline: 'nearest', block: 'nearest' })` — 키보드 ←→ 로 이동해도 화면 밖 탭이 그대로 있지 않습니다
- 탭 4개 이상이면 `Tabs` 대신 이것을 씁니다(소스 주석 근거)
- 배지는 `count != null && count > 0` 일 때만, 11px `--color-neutral-700`(`docs/contrast-audit.md` 의 11–12px 규칙 준수)
- 하지 않는 것: 탭 값 소유 · 패널 콘텐츠 생성 · `TabItem.icon` 렌더(현재 코드는 `label` 과 `count` 만 그립니다)

## A — Architecture
- 키보드 규칙(←→ · Home/End · roving tabindex)과 활성 상태는 Radix `@radix-ui/react-tabs` 가 소유합니다 — `Tabs.md` 와 같은 기반입니다
- 상태 분류 — server: 배지 `count` 의 출처(앱이 계산해 전달) / local: 리스트의 가로 스크롤 위치 / URL: 활성 탭 `value`(`?tab=` 등 부모 소유, 비제어면 Radix 내부) / derived: `data-state=active` 스타일 · 배지 표시 여부 / optimistic: 없음
- variant 클래스를 `cx('tabs', 'scroll-tabs', className)` 로 붙여 `!` 로 덮을 수 있게 둡니다(`docs/cx-audit.md` 의 "variant 는 항상 클래스로도")
- 활성 표시는 `data-state` 기반이므로 색을 바꾸려면 `@layer modul` 밖 앱 CSS 에서 `.my-tabs .tab[data-state=active]{…}` 로 겨냥합니다

## D — Data Model
```ts
type TabItem = { value: string; label: ReactNode; icon?: ReactNode; count?: number; disabled?: boolean }; // Tabs/Tabs.tsx 재사용
type ScrollTabsProps = ComponentPropsWithoutRef<typeof RTabs.Root> & { items: TabItem[] };
// 크기: 탭 n 개 → 트리거 n, 배지가 있으면 +n. 4~10개 구간을 가정하고, 그 이상이면 탭이 아닌 다른 탐색이 맞습니다
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| items | TabItem[] | `icon` 은 현재 무시됩니다 |
| value / defaultValue / onValueChange | Radix Root props | `...rest` 로 그대로 전달 |
| className | string | `cx('tabs','scroll-tabs',className)` |
| children | ReactNode | `RTabs.Content` 패널들 |

- 함수 컴포넌트라 `forwardRef` 가 없습니다 — 루트 DOM ref 가 필요하면 감싸는 요소에서 잡습니다(현재 코드 기준)
- 리스트 스타일이 인라인이라 `listProps` 같은 하위 표면 주입구가 없습니다(`Tabs` 에는 있습니다)
- 서버 API 없음. 이벤트는 Radix 의 `onValueChange`

## O — Optimization & Observability
- DOM 노드: Root 1 + List 1 + 탭당 1(배지 있으면 2). 10탭 전부 배지면 22 — 모바일 예산 300(`docs/performance-budget.md`) 대비 여유가 있습니다
- 스크롤은 CSS 만 사용하고 스크롤 이벤트 구독이 없습니다. 자동 노출은 `onFocus` 한 번의 `scrollIntoView` 뿐이라 스크롤 중 JS 작업이 없습니다
- 패널 콘텐츠는 Radix 기본 동작대로 활성 탭만 마운트됩니다 — 탭 수가 늘어도 초기 노드 수는 거의 늘지 않습니다
- 지표: `scrolltabs.switch_inp_p75`(탭 전환 INP, 목표는 전역 예산 p75 ≤ 200ms) · `scrolltabs.offscreen_active`(활성 탭이 화면 밖에서 시작한 비율) · `scrolltabs.tab_usage`(탭별 사용 분포 — 순서 재배치 근거). 세 지표 모두 실측 미측정
- 포인터로 탭을 눌렀을 때는 `onFocus` 가 브라우저마다 다르게 발생할 수 있어 자동 스크롤-인 동작의 크로스브라우저 확인이 남아 있습니다(미측정)
