# MODUL UI 작업 규칙

이 저장소에서 컴포넌트를 만들거나 고칠 때 지킨다. 근거: `PROMPT.md` 1절·4절, `docs/cx-audit.md`, `docs/contrast-audit.md`.

- RADIO 없이 새 컴포넌트를 만들지 않는다. `docs/radio/TEMPLATE.md` 로 문서를 먼저 쓰고 `docs/radio/README.md` 표에 추가한다.
- 모든 컴포넌트는 `forwardRef` + `...rest` + `className` 마지막. `aria-*` · `data-*` · 이벤트가 루트 DOM 에 도달해야 한다. `displayName` 설정.
- `className` 조립은 `cx()` 로만. 템플릿 문자열(`` className={`btn ${className}`} ``)로 잇지 않는다 — `!` 접두 규칙이 깨진다.
- variant 는 클래스로도 표현한다(`tabs-underline`). `data-variant` 만 쓰면 `!` 로 덮을 수 없다. `data-state` 는 컴포넌트 소유라 덮지 않는다.
- `components.css` 의 `@layer modul` 래핑을 풀지 않는다. 레이어 밖 앱 CSS 가 이기는 구조가 이 라이브러리의 덮어쓰기 경로다.
- 색·폰트·간격·반경·모션은 `var(--*)` 만 쓴다. hex·px·폰트명 리터럴 금지.
- base 값(테마별 bg·surface·text·accent, 폰트, 반경, 간격, 모션, 이징)의 SSOT 는 `packages/tokens/theme.json` 이다. 바꿀 때는 theme.json 과 배포 CSS 를 같이 고친다 — `pnpm --filter @modul/tokens build` 가 둘을 대조해 어긋나면 실패한다.
- 램프(neutral-100..900 · accent-100..900)는 생성물이 아니라 손으로 튜닝한 값이다. 바꾸면 `docs/contrast-audit.md` 를 다시 실측하고 axe 를 다시 돌린다.
- duration·easing 은 `packages/motion/src/presets.ts` 의 8종(tap · reveal · move · page · spring · loop · count · scrub) 안에서만 고른다. 움직이는 속성은 `transform` · `opacity` · `clip-path`. `prefers-reduced-motion` 분기는 프리셋의 `reduced` 가 담당하므로 컴포넌트에서 따로 분기하지 않는다.
- fetch · 업로드 · 라우팅 · 검증을 컴포넌트 안에서 하지 않는다. 경계는 콜백(`onUpload` · `onCommit` · `onChange` · `renderItem`)으로 받는다.
- 터치 타깃 44px, 포커스는 `:focus-visible` 2px accent 링. 11–12px 텍스트에 `--color-neutral-600` 을 쓰지 않는다(`--color-neutral-700`).
- Enter/Escape/화살표 핸들러는 `guardIme()` 를 거친다. 오버레이는 네이티브 `<dialog>` + `showModal()` 을 쓰고 포커스 트랩을 직접 만들지 않는다.
- 하드코딩 한국어 문자열 대신 `useLabels()` 의 `t()` 를 쓴다. 키가 없으면 `packages/ui/src/utils/labels.ts` 에 추가한다.
- lint·test 규칙을 끄지 않는다. `no-restricted-syntax` 가 걸리면 규칙이 아니라 코드를 고친다. 테스트가 틀렸다고 판단되면 지우지 말고 근거를 적어 RADIO 문서와 함께 고친다.
- 애니메이션 라이브러리·Tailwind·차트 확장·도메인 프리미티브 승격은 하지 않는다(`PROMPT.md` 4절).
- 새 값이나 예외가 필요하면 코드보다 문서를 먼저 고친다 — RADIO 의 R 에 수치, A 에 상태 분류, O 에 지표 이름이 없으면 리뷰에서 되돌아온다.
