# MODUL 라이브러리 구현 지시서

이 zip 을 받은 에이전트/개발자에게 그대로 전달하는 프롬프트입니다. 아래를 지시로 읽고, 이 저장소의 코드와 문서를 **단일 출처(SSOT)** 로 삼아 실제 배포 가능한 React 라이브러리를 완성하세요.

---

## 0. 역할과 목표

당신은 이 디자인 시스템을 실제 npm 배포 가능한 React + TypeScript 컴포넌트 라이브러리로 완성하는 프론트엔드 엔지니어입니다.

**최종 산출물**
- `@gook-lab/tokens` — CSS 변수 + `theme.json` 에서 생성되는 토큰 (light / dark / malt 3 테마)
- `@gook-lab/ui` — headless 컴포넌트 40여 종 (React 18+, Radix 기반 일부)
- `@gook-lab/motion` — 모션 훅·컴포넌트 18종 + 프리셋
- `@gook-lab/icons` — Lucide 재export
- `@gook-lab/malt-ui` — 도메인 프리미티브 7종 (위스키 앱 전용, 코어에 넣지 않음)
- `apps/storybook` — Storybook 8, 전 컴포넌트 스토리 + autodocs
- 전부 `pnpm build` → `pnpm verify` 통과, CI 초록

**지금 상태**: 컴포넌트 소스·토큰·문서·테스트·CI 설정이 모두 작성되어 있으나 **한 번도 실행된 적이 없습니다.** 의존성 설치, 빌드 설정(tsup/vite), 타입 오류, 실제 Radix API 버전 차이는 당신이 해결해야 합니다.

---

## 1. 절대 지켜야 할 계약 (이 라이브러리의 정체성)

### 1.1 Headless — props 를 제한하지 않는다
모든 컴포넌트는 **고유 props + `...rest`** 구조입니다.

```tsx
type ButtonOwnProps = { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode };
export type ButtonProps = ButtonOwnProps & ComponentPropsWithoutRef<'button'>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, className, children, ...rest }, ref) => (
    <button ref={ref} type="button" className={cx('btn', `btn-${variant}`, `btn-${size}`, className)} {...rest}>
      {children}{icon}
    </button>
  ),
);
```

- `type` · `inputMode` · `pattern` · `autoComplete` · `form` · `aria-*` · `data-*` · 모든 이벤트 핸들러가 **막히지 않고** 루트 엘리먼트에 도달해야 합니다.
- `forwardRef` 필수. `displayName` 설정.
- 래퍼가 있는 컴포넌트(`Input` 의 `.field` 등)는 `fieldProps` 로 래퍼에 전달, `...rest` 는 실제 입력 엘리먼트로.
- 다형성: `as` prop(태그 교체) 또는 `asChild`(Radix Slot 패턴). `utils/polymorphic.ts` · `utils/Slot.tsx` 참조.

### 1.2 className 은 항상 마지막, `!` 는 상위 룰
`utils/cx.ts` 의 규칙을 절대 바꾸지 마세요.

```
cx('btn', 'btn-primary', '!btn-ghost')  →  'btn btn-ghost'
```
- `!` 접두 클래스는 같은 그룹(마지막 `-` 앞 접두)의 컴포넌트 클래스를 제거하고 자신만 남습니다.
- Tailwind variant 접두(`!hover:bg-red`)는 건드리지 않습니다(`:` 포함 시 통과).
- CSS 쪽 근거: `components.css` 전체가 `@layer modul` 안에 있어 레이어 밖 앱 CSS 가 명시도와 무관하게 이깁니다. **이 `@layer` 래핑을 풀지 마세요.**
- variant 는 **반드시 클래스로도** 표현합니다(`tabs-underline`). `data-variant` 만 쓰면 `!` 가 덮을 수 없습니다 — `docs/cx-audit.md` 참조.
- `style` 병합은 `sx()`.

### 1.3 토큰만 사용 — 리터럴 금지
- 색·폰트·간격·반경·모션은 전부 `var(--*)`. hex, px 리터럴, 폰트명 직접 지정 금지.
- `eslint.config.js` 가 `no-restricted-syntax` 로 이를 강제합니다(색 리터럴 · fontFamily 리터럴 · `dangerouslySetInnerHTML` · 판매/구매/배송/결제 문구). **lint 를 끄지 말고 코드를 고치세요.**
- 예외: `apps/**` 는 레이아웃 px 허용(이미 설정됨).
- 토큰 SSOT 는 `packages/tokens/theme.json` — 단, **base 값의 SSOT** 입니다. 테마별 bg · surface · text · accent · divider, 폰트, 반경, 간격, 모션, 이징이 여기서 정해집니다.
- `pnpm --filter @gook-lab/tokens build` 는 theme.json 과 배포 CSS(`styles.css` · `theme-malt.css`)를 대조하고 어긋나면 실패합니다. `tokens.ts`(RN/JS 소비용)도 여기서 나옵니다.
- **램프(neutral-100..900 · accent-100..900)는 생성하지 않습니다.** 손으로 튜닝한 값이고 `docs/contrast-audit.md` 의 실측 대비값과 스토리북 axe 통과가 그 값에 걸려 있습니다. 알고리즘으로 다시 뽑으면 테마당 18개 값이 달라져 검수가 무효가 됩니다.
- base 값을 바꿀 때는 theme.json 과 CSS 를 같이 고칩니다. 램프를 바꿀 때는 CSS 를 고치고 대비 검수를 다시 하세요.

### 1.4 모션은 프리셋에서만
- `packages/motion/src/presets.ts` 의 8종(tap · reveal · move · page · spring · loop · count · scrub) 밖의 duration/easing 을 쓰지 않습니다.
- 움직이는 속성은 `transform` · `opacity` · `clip-path` 만. 레이아웃 속성 애니메이션 금지.
- `prefers-reduced-motion` 대체 동작은 **프리셋 레벨**(`presets[x].reduced`)에 정의되어 있습니다. 컴포넌트마다 따로 분기하지 마세요.
- `presets.test.ts` 가 토큰 이탈을 잡습니다.

### 1.5 컴포넌트가 모르는 것
- **fetch·업로드·라우팅·검증**을 컴포넌트 안에서 하지 않습니다. `onUpload(file, onProgress) => Promise<url>`, `onChange`, `renderItem` 처럼 경계를 콜백으로 받습니다.
- 폼 상태는 react-hook-form + zod (`packages/ui/src/Form/`). 컴포넌트는 값을 소유하지 않습니다.
- `ViewState`(loading/empty/error/offline/ready)는 앱의 훅이 만들고 `EmptyState` 가 그립니다.

### 1.6 접근성 최소선
- 터치 타깃 44px(Malt 테마는 `.btn` min-height 강제), 포커스는 `:focus-visible` 2px accent 링만.
- 소형 텍스트(11–12px)에 `--color-neutral-600` 사용 금지 — `--color-neutral-700` (근거: `docs/contrast-audit.md`).
- 한글 IME: Enter/Escape/화살표 핸들러는 `guardIme()` 경유(`utils/keyboard.ts`). 조합 중 확정 키가 선택으로 새면 안 됩니다.
- 오버레이(Modal · Drawer · Sheet)는 네이티브 `<dialog>` + `showModal()` — 포커스 트랩·Esc·복귀를 브라우저에 맡깁니다.

---

## 2. 작업 순서

### 단계 1 — 부팅 (여기서 막히면 나머지 무의미)
1. `pnpm install`. 워크스페이스는 `pnpm-workspace.yaml` 을 새로 만들어야 할 수 있습니다(`packages/*`, `apps/*`).
2. 각 패키지에 빌드 설정 추가 — **tsup 권장**(ESM + CJS + d.ts, `external: ['react', 'react-dom', '@radix-ui/*']`). `package.json` 의 `exports`/`main`/`module`/`types` 를 실제 산출물에 맞게 정리.
3. `tsconfig.json` 확인: `jsx: react-jsx`, `strict: true`, `moduleResolution: bundler`, `paths` 로 워크스페이스 참조.
4. Radix 의존성 실제 버전 설치 후 **API 차이 수정**: 이 코드는 `@radix-ui/react-*` 1.x 기준으로 작성되었습니다. `Tabs` · `Accordion` · `Popover` · `DropdownMenu` · `Tooltip` · `Checkbox` · `RadioGroup` · `Switch` · `Slider` · `Dialog`. `cmdk` · `react-day-picker`(v9 API) 도 확인.
5. `pnpm --filter @gook-lab/tokens build` → theme.json 과 배포 CSS 가 3 테마 모두 일치하는지 확인. 어긋나면 어느 변수가 왜 다른지 찍고 실패합니다.
6. `pnpm typecheck` → 오류 0. **타입을 `any` 로 덮지 말고** 실제 시그니처를 맞추세요.

### 단계 2 — 테스트 통과
`pnpm --filter @gook-lab/ui test`. 이미 작성된 테스트:
- `Select.test.tsx` — ↑↓ Enter Esc, 타입어헤드, 포커스 복귀, `...rest` 도달
- `Combobox.test.tsx` — 필터, keywords, multiple Backspace, creatable, **stale 응답 폐기**
- `Modal.test.tsx` · `Drawer.test.tsx` — Esc, 백드롭, 내부 클릭 무시
- `Tabs.test.tsx` — roving tabindex
- `Form.test.tsx` — 검증 실패 → `role=alert`, 제출 중 `aria-busy`
- `Pagination.test.ts` · `cx.test.ts` · `files.test.ts` · `richtext.test.ts` · `image-safety.test.ts` · `presets.test.ts`

`test/setup.ts` 에 jsdom 폴리필(`showModal`, `matchMedia`)이 있습니다. **테스트가 잘못되었다고 판단되면 테스트를 지우지 말고**, 그 계약이 왜 틀렸는지 근거를 적고 RADIO 문서와 함께 고치세요.

### 단계 3 — Storybook
1. `pnpm --filter @gook-lab/storybook dev` 기동. `.storybook/main.ts` 는 `../../../packages/**/*.stories.@(ts|tsx)` 를 봅니다.
2. `preview.tsx` 가 3 테마를 `data-theme` 로 토글합니다(`@storybook/addon-themes`).
3. `pnpm gen:stories` — RADIO md + props 타입에서 스토리를 생성합니다. 손으로 쓴 스토리는 건너뜁니다. CI 가 `git diff --exit-code` 로 검사합니다.
4. `pnpm --filter @gook-lab/storybook build` + `test:a11y`(test-runner + axe). **color-contrast 위반 0** 이어야 합니다.

### 단계 4 — 배포 준비
1. `changesets` 로 버전 — `ui`/`motion`/`tokens` 는 fixed 그룹(같은 버전).
2. `npx size-limit` — `.size-limit.json` 예산 준수(tokens css 8KB, ui core 4KB, ui all 38KB, motion 3KB). 초과 시 lazy 분할(`DatePicker` · `CommandPalette` 는 이미 lazy 대상).
3. `.github/workflows/verify.yml` 전 단계 초록.
4. 컴포넌트 상태 표시: Button · Input · Tag · Card · Table · Modal · Toast = **stable**, 나머지 = **beta** (`.changeset/README.md`).

### 단계 5 — 남은 구현 (문서에는 있으나 코드가 비어 있음)
- **i18n `t()` 치환 미완**: `FileDrop` · `ImageUpload` · `Stepper` · `Avatar` · `EmptyState` · `CommandPalette` 의 하드코딩 한국어를 `useLabels()` 로 교체(`utils/labels.ts` 에 키 이미 존재).
- **RADIO 문서 누락**: `FieldArray` · `EditableCell` · `AppBar` · `BottomActions` · `ScrollTabs` · `Chart` 중 없는 것. `docs/radio/TEMPLATE.md` 형식(R 에 수치, A 에 상태 분류, O 에 지표 이름).
- **Table `virtual` 배선**: `useVirtualRows` 와 `EditableCell` 은 있으나 `Table.tsx` 본체가 이를 실제로 사용하도록 연결 필요(`Table/TABLE-VIRTUAL.md` 의 조립 예시 참조).
- **ImageGallery 키보드 순서 변경**: 드래그만 있음. 항목 포커스 후 ←→ 로 이동하는 대안 필요(RADIO/ImageUpload 의 TODO).

---

## 3. 문서를 먼저 읽는 순서

| 파일 | 왜 |
| --- | --- |
| `README.md` | 패키지 구조, 버전별 변경 이력 |
| `docs/radio/README.md` + 개별 md 38종 | **컴포넌트를 고치기 전에 그 컴포넌트의 RADIO 를 읽으세요.** R(요구사항·수치) A(구조·상태 분류) D(데이터 모델) I(인터페이스) O(성능·관측) |
| `docs/cx-audit.md` | className `!` 규칙과 예외 |
| `docs/contrast-audit.md` | 색 사용 제약(실측 대비값) |
| `docs/performance-budget.md` | 번들·DOM 노드·INP 예산 |
| `docs/migration-bottling.md` | 기존 앱을 이 라이브러리로 옮기는 codemod 12단계 |
| `packages/tokens/theme.json` | 모든 시각 값의 출처 |
| `apps/admin/src/ProjectForm.tsx` | 폼 컴포넌트 11종 조립 실례(서버 오류 흐름 포함) |

**RADIO 없이 새 컴포넌트를 만들지 마세요.** 새로 추가한다면 `docs/radio/TEMPLATE.md` 로 먼저 작성하고 리뷰받으세요.

---

## 4. 하지 말 것

- 컴포넌트에 `className` 을 받지 않거나, `...rest` 를 삼키거나, `forwardRef` 를 빼는 것
- `cx()` 를 우회해 `className={`btn ${className}`}` 로 직접 조립(→ `!` 규칙 깨짐)
- `components.css` 의 `@layer modul` 제거
- 새 색·폰트·duration 값 도입(theme.json 을 거치지 않고)
- Tailwind 도입(선택은 소비자 앱의 몫 — 라이브러리는 CSS 변수 + 클래스)
- 애니메이션 라이브러리(framer-motion 등) 추가 — 현재 0 의존. 정말 필요하면 `@gook-lab/motion` **밖**에서, 이유를 문서화
- 차트 확장(현재 SVG 3종은 "보이는 수준"만) — 그 이상은 visx 를 별 패키지로, 토큰만 공유
- 테스트·lint 규칙을 끄는 것
- 도메인 프리미티브(`@gook-lab/malt-ui` 의 StockBadge · AmountBar 등)를 `@gook-lab/ui` 로 승격 — 위스키 앱 전용입니다

---

## 5. 완료 기준 (Definition of Done)

```
pnpm install
pnpm --filter @gook-lab/tokens build     # theme.json ↔ CSS 대조 + tokens.ts
pnpm typecheck                        # 0 errors
pnpm lint                             # 0 errors (규칙 유지)
pnpm -r test                          # 전부 통과
pnpm gen:stories && git diff --exit-code
pnpm -r build && npx size-limit       # 예산 내
pnpm --filter @gook-lab/storybook build
pnpm --filter @gook-lab/storybook test:a11y   # axe 위반 0
```

추가로:
- 3 테마(light/dark/malt) 각각에서 Storybook 전 스토리가 깨지지 않음
- `prefers-reduced-motion: reduce` 를 켠 상태에서 모션 스토리 전부가 `presets[x].reduced` 대로 동작
- 새 앱에서 `import { Button } from '@gook-lab/ui'` + `import '@gook-lab/tokens/styles.css'` 만으로 동작

---

## 6. 참고 — 스토리북 원본

이 zip 과 함께 받은 `Storybook.dc.html` 은 전 컴포넌트·모션·템플릿의 **동작하는 시각 참조**입니다(단일 HTML). 구현이 애매할 때 그 페이지의 렌더 결과와 인터랙션을 정답으로 삼으세요. 특히:
- 컴포넌트별 props 패널의 조합별 모양
- 모션 18종의 실제 타이밍·이징
- Malt 테마 적용 화면(F4 피드 · F5 매장 상세)
- 프리셋 표와 reduced-motion 대체 동작 13행
