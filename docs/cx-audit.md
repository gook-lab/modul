# cx `!` 관통 검수

규칙: variant 는 **항상 클래스**(`btn-primary`, `tabs-underline`)로도 표현한다. Radix 의 `data-state` 는 상태(열림/활성)라 컴포넌트 소유 — `!` 로 덮지 않는다. 우리가 정하는 variant 를 `data-variant` 로만 두면 `!` 가 못 덮는다 → Tabs 에 `tabs-${variant}` 클래스 추가.

## 결과 (37 파일)
- CommandPalette/CommandPalette.tsx: cx 미사용
- Toast/Toast.tsx: cx 미사용
- Tooltip/Tooltip.tsx: cx 미사용

## 소비자 규칙
- 그룹 = 마지막 `-` 앞 접두(`btn-*` · `tag-*` · `elev-*`). 축 = 그룹 안에서 서로 배타인 값의 묶음 — 크기(`xs`·`sm`·`md`·`lg`·`xl`·`2xl`·`3xl`)가 size 축, 나머지 variant·tone 이 look 축이다. `!` 는 **같은 그룹 + 같은 축**만 지운다: `cx('btn','btn-primary','btn-sm','!btn-ghost')` → `btn btn-sm btn-ghost` (variant 를 덮어도 크기는 남는다). 근거: `packages/ui/src/utils/cx.ts` · `cx.test.ts` 5번
- `className="!btn-ghost"` — variant 덮기 (그룹 `btn-*`) · `"!elev-lg"` — elevation 덮기
- 상태 색을 바꾸려면 앱 CSS 에서 `.my-tabs .tab[data-state=active]{…}` — components.css 가 `@layer modul` 이라 레이어 밖 규칙이 이김
- style 은 `sx()` — 소비자가 마지막

## 예외
CommandPalette · Toast(Provider) · Tooltip 은 루트가 Radix Portal/Provider 라 className 을 받지 않음 — 대신 `contentProps` / `containerProps` 로 내부 표면에 className 전달. 규칙은 같다(마지막에 붙음, `!` 동작).
