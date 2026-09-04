# MODUL

**한국어** | [English](README.en.md)

헤드리스 React 컴포넌트 라이브러리입니다. 값은 전부 CSS 변수로 나가고, 컴포넌트는 네이티브 속성을 막지 않으며, 앱 CSS 가 항상 이깁니다.

```bash
pnpm add @modul/ui @modul/tokens
```

```tsx
import { Button } from '@modul/ui';
import '@modul/tokens/styles.css';

<Button variant="primary" type="submit" form="contact" data-testid="cta">
  보내기
</Button>
```

`type` · `form` · `data-*` · `aria-*` · 모든 이벤트 핸들러가 루트 엘리먼트에 그대로 도달합니다. 이게 이 라이브러리의 전제입니다.

## 패키지 구성 — 코어 4종 + 도메인 1종

| 패키지 | 무엇 | 규모 |
| --- | --- | --- |
| `@modul/tokens` | `theme.json` 에서 생성되는 CSS 변수. light · dark · malt 3 테마 | css 6.7 KB (gzip) |
| `@modul/ui` | 헤드리스 컴포넌트. export 51개 | 27.4 KB (gzip, 전부) |
| `@modul/motion` | 모션 훅·컴포넌트 19종 + 프리셋 8종 | 1.54 KB (gzip, 훅 + Marquee/Reveal) |
| `@modul/icons` | Lucide 재export + 크기 규격 | — |
| `@malt/ui-web-next` | 위스키 앱 전용 프리미티브 7종. 코어로 승격하지 않습니다 | — |

수치는 `npx size-limit` 실측값이고 예산은 [`.size-limit.json`](./.size-limit.json) 에 있습니다.

## 설계 계약 — 이 여섯 개가 라이브러리의 정체성

계약의 원문과 배경은 [`PROMPT.md`](./PROMPT.md) 에 있습니다. 요약하면 다음과 같습니다.

**1. 헤드리스 — props 를 제한하지 않습니다.** 모든 컴포넌트가 `고유 props + ...rest` 구조이고 `forwardRef` 를 답니다. Own props 와 이름이 겹치는 네이티브 속성만 제외하는 `NativeProps<E, Own>` 을 씁니다. 교차 타입(`Own & ComponentPropsWithoutRef<'div'>`)으로 두면 `children` · `onChange` · `title` 이 두 타입의 교집합이 되어 호출할 수 없는 타입이 됩니다.

**2. `className` 은 마지막, `!` 는 상위 룰.** 조립은 `cx()` 로만 합니다.

```
cx('btn', 'btn-primary', '!btn-ghost')            → 'btn btn-ghost'
cx('btn', 'btn-primary', 'btn-sm', '!btn-ghost')  → 'btn btn-sm btn-ghost'
```

같은 그룹이라도 축이 다르면 남습니다. variant 를 덮었다고 크기까지 사라지면 소비자가 크기를 다시 지정해야 하기 때문입니다. `components.css` 전체가 `@layer modul` 안에 있어서 레이어 밖 앱 CSS 는 명시도와 무관하게 이깁니다.

**3. 토큰만 씁니다.** 색 · 폰트 · 간격 · 반경 · 모션은 전부 `var(--*)` 입니다. hex · px · 폰트명 리터럴은 ESLint 가 막습니다. [`theme.json`](./packages/tokens/theme.json) 이 base 값(테마별 bg · surface · text · accent, 폰트, 반경, 간격, 모션, 이징)의 단일 출처이고, 빌드가 zod 스키마로 검증한 뒤 배포 CSS 와 대조해 어긋나면 실패합니다. 램프(neutral-100..900 · accent-100..900)는 생성하지 않습니다 — 손으로 튜닝한 값이고 대비 검수와 axe 통과가 그 값에 걸려 있어서, 알고리즘으로 다시 뽑으면 검수가 무효가 됩니다.

**4. 모션은 프리셋에서만.** `tap` · `reveal` · `move` · `page` · `spring` · `loop` · `count` · `scrub` 8종 밖의 duration/easing 을 쓰지 않습니다. 움직이는 속성은 `transform` · `opacity` · `clip-path` 뿐입니다. `prefers-reduced-motion` 대체 동작은 프리셋의 `reduced` 가 담당하고 컴포넌트는 분기하지 않습니다.

**5. 컴포넌트가 모르는 것.** fetch · 업로드 · 라우팅 · 검증을 컴포넌트 안에서 하지 않습니다. 경계는 `onUpload(file, onProgress) => Promise<url>` 처럼 콜백으로 받습니다. 폼 상태는 react-hook-form + zod 가 소유합니다.

**6. 접근성 최소선.** 터치 타깃 44px(Malt 테마는 `.btn` 에 강제), 포커스는 `:focus-visible` 2px accent 링만. 11–12px 텍스트에 `--color-neutral-600` 을 쓰지 않습니다. 한글 IME 는 `guardIme()` 를 거치고, 오버레이는 네이티브 `<dialog>` + `showModal()` 이라 포커스 트랩 · Esc · 복귀를 브라우저에 맡깁니다.

## 트리셰이킹 — 컴포넌트별 엔트리

`Button` 하나만 import 하면 Radix 는 따라오지 않습니다.

| 측정 | 예산 | 실측 |
| --- | --- | --- |
| `{ Button, Input, Tag, Card }` | 4 KB | 1.83 KB |
| `@modul/ui` 전부 (MODUL 코드) | 30 KB | 27.4 KB |
| `@modul/ui` 전부 (Radix 포함) | 74 KB | 71.42 KB |

배럴 하나로 번들하면 `dist/index.js` 최상단에 `import * as RTabs from '@radix-ui/react-tabs'` 같은 문장이 전부 모입니다. Radix · cmdk · react-day-picker 는 `sideEffects: false` 를 선언하지 않아 번들러가 이 문장을 지우지 못하고, 그러면 `Button` 만 써도 47 KB 가 딸려옵니다. 그래서 `tsup` 엔트리를 컴포넌트별로 나눠 배럴이 재수출만 하게 했습니다.

## 문서 — RADIO 44종이 컴포넌트마다 붙습니다

컴포넌트를 고치기 전에 그 컴포넌트의 RADIO 를 읽습니다. R(요구사항·수치) A(구조·상태 분류) D(데이터 모델) I(인터페이스) O(성능·관측) 순서입니다.

| 문서 | 무엇 |
| --- | --- |
| [`docs/radio/`](./docs/radio/) | 컴포넌트별 설계 문서 44종. 새 컴포넌트는 [`TEMPLATE.md`](./docs/radio/TEMPLATE.md) 로 먼저 씁니다 |
| [`docs/cx-audit.md`](./docs/cx-audit.md) | `!` 규칙과 예외 |
| [`docs/contrast-audit.md`](./docs/contrast-audit.md) | 색 사용 제약(실측 대비값) |
| [`docs/performance-budget.md`](./docs/performance-budget.md) | 번들 · DOM 노드 · INP 예산 |
| [`docs/migration-bottling.md`](./docs/migration-bottling.md) | 기존 앱 이전 codemod 12단계 |
| [`PROMPT.md`](./PROMPT.md) | 계약 원문과 작업 순서 |
| `Storybook.dc.html` | 시각 참조. 브라우저로 바로 열립니다 |

소비하는 쪽 규칙은 [guk-lab-docs 의 플레이북](https://github.com/gook-lab/guk-lab-docs/blob/main/playbooks/modul-design-system.md) 에 있고, 이 저장소에서 에이전트가 지킬 것은 [`.claude/rules/modul-ui.md`](./.claude/rules/modul-ui.md) 에 있습니다.

## 예시 앱 — 조립해 보는 두 화면

라이브러리를 실제로 붙였을 때 무엇이 비는지 보는 용도입니다. 워크스페이스 소스를 바로 참조하므로 라이브러리를 고치면 새로고침만 하면 됩니다.

```bash
pnpm --filter @modul/app-admin dev        # 폼 11종 조립 · Table · 서버 오류 흐름
pnpm --filter @modul/app-portfolio dev    # 모션 래퍼 · Reveal · Marquee
```

Malt 앱의 두 화면(F4 피드 · F5 매장 상세)은 스토리북의 `Domain/Malt 화면` 에 있습니다. 새 컴포넌트 없이 코어와 도메인 프리미티브만으로 조립한 것이고, 이 조립에서 `.card-body` 의 투명도 문제가 드러났습니다.

## 개발 — 검증 게이트 7개

```bash
pnpm install
pnpm --filter @modul/tokens build          # theme.json ↔ CSS 대조 + tokens.ts
pnpm --filter @modul/storybook dev         # localhost:6006, 3 테마 토글
```

```bash
pnpm typecheck                             # 0 errors
pnpm lint                                  # 0 errors
pnpm -r test                               # 134 passed (ui 121 · tokens 9 · motion 4)
pnpm -r build                              # 4 패키지
npx size-limit                             # 예산 내
pnpm --filter @modul/storybook build
pnpm --filter @modul/storybook test:a11y   # 스토리 92개, axe 위반 0
pnpm --filter @modul/storybook test:visual # 스크린샷 92장 비교 (기준선은 OS 별)
```

```bash
pnpm --filter @modul/storybook test:visual # 스크린샷 92장 비교 (기준선은 OS 별)
```

마지막 실측은 2026-09-04 이고 전 항목 통과입니다. 두 게이트 모두 Storybook 10 의 vitest 브라우저 모드에서 스토리를 실제로 렌더해 검사합니다. 시각 회귀는 CI 필수 게이트에 넣지 않았습니다 — 폰트 래스터라이즈가 OS 마다 달라 macOS 기준선을 리눅스 러너에 그대로 쓸 수 없어서, 배포 전 로컬 확인용입니다. axe 만으로 부족하다는 근거는 실측에 있습니다: `--space-4` 를 16px → 40px 로 바꿔도 a11y 92/92 는 그대로 통과하고 시각 스냅샷만 잡았습니다. 두 게이트 모두 Storybook 10 의 vitest 브라우저 모드에서 스토리를 실제로 렌더해 검사합니다. 시각 회귀는 CI 필수 게이트에 넣지 않았습니다 — 폰트 래스터라이즈가 OS 마다 달라 macOS 기준선을 리눅스 러너에 그대로 쓸 수 없어서, 배포 전 로컬 확인용입니다. axe 만으로는 부족하다는 근거는 실측에 있습니다: `--space-4` 를 16px → 40px 로 바꿔도 a11y 92/92 는 그대로 통과하고 시각 스냅샷만 잡았습니다. `pnpm gen:stories` 는 RADIO 문서와 props 타입에서 스토리를 만들고 손으로 쓴 16개는 건너뜁니다. CI 는 [`.github/workflows/verify.yml`](./.github/workflows/verify.yml) 에서 같은 순서로 돕니다.

## 배포 — pnpm 으로만

```bash
pnpm changeset      # 변경 요약과 버전 폭
pnpm release        # 버전 + 빌드 + publish
```

`npm publish` 는 쓸 수 없고 `prepack` 가드가 막습니다. peerDependencies 의 `workspace:*` 를 실제 버전으로 치환하는 것이 pnpm 뿐이라, npm 으로 내보내면 소비자가 `EUNSUPPORTEDPROTOCOL` 로 설치에 실패합니다(실측). 빌드를 잊고 배포하는 것은 각 패키지의 `prepublishOnly` 가 막습니다 — 없을 때는 `dist` 를 지우고 pack 하면 1파일 1.8 KB 가 나갔습니다.

## 배포 — pnpm 으로만

```bash
pnpm changeset      # 변경 요약과 버전 폭
pnpm release        # 버전 + 빌드 + publish
```

`npm publish` 는 쓸 수 없고 `prepack` 가드가 막습니다. peerDependencies 의 `workspace:*` 를 실제 버전으로 치환하는 것이 pnpm 뿐이라, npm 으로 내보내면 소비자가 `EUNSUPPORTEDPROTOCOL` 로 설치에 실패합니다(실측). 빌드를 잊고 배포하는 것은 각 패키지의 `prepublishOnly` 가 막습니다 — 없을 때는 `dist` 를 지우고 pack 하면 1파일 1.8 KB 가 나갔습니다.

## 상태

`0.1.0`. Button · Input · Tag · Card · Table · Modal · Toast 는 stable, 나머지는 beta 입니다. 버전은 changesets 로 올리고 `ui` · `motion` · `tokens` 는 같은 버전으로 묶여 있습니다.
