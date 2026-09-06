# @gook-lab/*

## 0.1.0 — 2026-09-04

핸드오프 스켈레톤을 빌드·테스트·배포가 도는 라이브러리로 만든 첫 릴리스입니다.
게이트는 typecheck 0 · lint 0 · test 57 · size-limit 전항목 · a11y 90/90 입니다.

### 부팅
- tsconfig 의 paths 가 baseUrl 없이 비상대 경로라 tsx 가 즉시 종료되던 것을 고쳤습니다
- `RichText/richtext.ts` 가 `RichText.tsx` 와 케이스 비민감 파일시스템에서 충돌해 RichText 컴포넌트가 export 되지 않았습니다 — `richtext-core.ts` 로 분리했습니다
- Table 의 `type EditableCell<T>` 이 컴포넌트 `EditableCell` 과 이름 충돌해 `EditableColumn<T>` 으로 바꿨습니다
- Toast 의 `useLabels` import 누락과 map 파라미터가 라벨 함수 `t` 를 가리던 셰도잉을 고쳤습니다

### 타입
- `NativeProps<E, Own>` 을 신설해 props 타입 30개를 교정했습니다. `Own & ComponentPropsWithoutRef` 교차가 `children` · `onChange` · `onError` · `title` 을 호출할 수 없는 타입으로 만들고 있었습니다
- `polyForwardRef` · `genericForwardRef` 로 다형 컴포넌트의 forwardRef 캐스팅을 한 곳에 모았습니다
- Form 에 `createField<T>()` 팩토리를 추가했습니다. 타입 인자를 하나만 주면 부분 추론이 없어 value 가 전 필드 유니온이 됐습니다
- DatePicker 의 `mode` · `value` · `onChange` 가 `...rest` 에 남아 `<button>` DOM 으로 새던 것을 고쳤습니다

### 토큰
- `theme.json` 을 base 값의 SSOT 로 확정했습니다. 빌드가 zod 로 검증한 뒤 배포 CSS 와 대조하고, 어긋나면 실패합니다
- 아무도 import 하지 않던 `generated.css` 와 culori 의존을 제거했습니다. 배포 팔레트와 램프가 테마당 18개 값 달랐고, 대비 검수는 배포 팔레트 기준이었습니다

### 번들
- tsup 엔트리를 컴포넌트별로 나눴습니다. 단일 배럴에서는 Radix import 문이 트리셰이킹 뒤에도 남아 Button 하나에 47.4 KB 가 딸려왔습니다 (→ 1.83 KB)

### 접근성
- 대비 위반 9건과 접근성 이름 누락 3건을 고쳤습니다. 자세한 내역은 `docs/contrast-audit.md` 의 수정 4~9번에 있습니다
- 닫힌 `<dialog>` 가 화면에 남던 버그를 고쳤습니다. `.dialog { display: flex }` 가 `@layer` 밖이라 브라우저 기본값을 이기고 있었습니다

### 남은 구현 (PROMPT 5장) 완료
- Table 의 `stickyHeader` · `virtual` · 인라인 편집을 본체에 배선했습니다
- FileDrop · ImageUpload · Avatar · EmptyState · CommandPalette 의 하드코딩 한국어를 `useLabels()` 로 바꿨습니다
- ImageGallery 에 키보드 순서 변경(←→)을 넣었습니다
- RADIO 문서 6종(FieldArray · EditableCell · AppBar · BottomActions · ScrollTabs · IndexRow)을 추가했습니다

### 스토리북
- Foundations 9종과 Domain/Malt 프리미티브를 추가했습니다. 스토리 96개, 그룹 19개입니다

---

이 아래는 핸드오프 시점의 기록입니다.

## 0.10.0
- 모바일 셸: AppBar · BottomActions · ScrollTabs (F5 조립에서 발견)
- EmptyState size="sm" · IndexRow sub(2줄) · Sheet.Options
- i18n: 9개 컴포넌트가 useLabels() 사용 (common.back 추가)

## 0.9.0
- Button: tone · rounded · iconPosition · block · loading
- RADIO 문서 전 컴포넌트, 대비 검수, --color-toast-action
- Form · Field · SubmitButton (RHF + zod)
- components.css · build-tokens.ts · vitest · CI

## 0.8.0
- 39종 컴포넌트, Radix 기반 12종, Malt 테마·프리미티브
