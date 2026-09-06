# bottling → MODUL 마이그레이션

순서: 토큰 → 프리미티브 → 셸 → 앱 화면. 각 단계는 독립 PR, 화면은 F 번호 순서.

## 0. 준비
- `@gook-lab/tokens` 설치, `theme-malt.css` 링크, `<html data-theme="malt">`
- bottling `build-css.ts` 출력 → `styles.css` · `theme-malt.css` 로 대체(값 동일, 이름만 MODUL). 하루 동안 두 스타일시트 병행 후 옛 것 제거

## 1. codemod 목록 (jscodeshift, `scripts/codemods/`)
| # | 대상 | 변환 | 자동화 |
| --- | --- | --- | --- |
| 1 | `var(--malt-cream)` 등 색 변수 | → `var(--color-bg)` … 매핑표(tmalt 페이지) | sed 급, 100% |
| 2 | `import { Button } from '@malt/ui-web'` | → `@gook-lab/ui`. props 동일(variant 이름 amber→primary, ghost 유지) | 100% |
| 3 | `<Sheet>` (Radix Dialog 래퍼) | → MODUL Sheet. `title` 필수 유지, `onOpenChange(false)` → `onClose` | 95% (onOpenChange 에 로직 있으면 수동) |
| 4 | `ToastProvider` + `useToast().show(msg, { undo })` | → `{ action: { label: '되돌리기', run: undo } }` | 100% |
| 5 | `ChipGroup type="single"` | 그대로(`@gook-lab/malt-ui`) — import 경로만 | 100% |
| 6 | `NumberField` | 그대로 + `...rest` 통과. `aria-label` 필수는 타입이 잡음 | 100% |
| 7 | `Toggle` | → MODUL `Switch` (role=switch 동일, `on`→`checked`, `onChange`→`onCheckedChange`) | 100% |
| 8 | `StepBar` | 그대로 | — |
| 9 | `.malt-index-row` 마크업 | → `<IndexRow>` (`sub` 로 StockBadge) | 70% — 손으로 짠 곳 있음 |
| 10 | `TabBar` (routes/TabBar.tsx) | 유지 — MODUL 에 TabBar 없음(의도). ScrollTabs 는 콘텍스트 탭용 | — |
| 11 | `ViewState` switch 분기 | → `<EmptyState view={…}>` | 80% — 커스텀 empty 카피는 슬롯으로 이동 |
| 12 | `styles.css` 컴포넌트 클래스 3,300줄 | → components.css + theme-malt.css. 화면 전용 CSS 만 남김 | 수동, 화면당 |

## 2. 순서와 검증
1. 토큰(0) → 스크린샷 diff 0 이어야 함
2. codemod 1·2·4·5·6·8 (기계적) → 타입 통과 + 기존 테스트 통과
3. 3·7·11 (동작 변경) → 화면별 수동 확인, F4 → F5 → F3 순
4. 9·12 → 화면당 PR

## 3. 남기는 것
- `@malt/domain` 전부(판정 로직)
- `routes/manifest.ts`, TabBar
- lint 규칙(색 리터럴·판매 문구·dangerouslySetInnerHTML) — MODUL eslint.config.js 가 같은 규칙

## 4. 하지 않는 것
- Radix 버전 통일을 마이그레이션에 끼우지 않는다(별도)
- 폴더 구조 변경 없음 — import 경로만
