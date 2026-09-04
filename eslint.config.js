// bottling 의 규칙을 그대로 가져온다 — 색 리터럴 · 폰트 직접 지정 · 판매 문구 금지. 통과 못 하면 코드를 고친다.
import js from '@eslint/js';
import ts from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

export default ts.config(
  // 빌드 산출물과 생성 파일은 검사 대상이 아니다. tokens.ts · generated.css 의 SSOT 는 theme.json 이므로
  // 거기 든 색 리터럴은 규칙 위반이 아니라 규칙의 출력이다.
  { ignores: ['**/dist/**', '**/node_modules/**', '**/storybook-static/**', 'packages/tokens/tokens.ts'] },
  js.configs.recommended, ...ts.configs.recommended, jsxA11y.flatConfigs.recommended,
  // 훅 규칙. 컴파일러 계열(refs·set-state-in-effect·immutability·purity)은 이 코드베이스에서
  // 실제 문제와 의도된 패턴이 섞여 나와 지금은 켜지 않았습니다 — 켤 때는 한 건씩 판단해야 합니다.
  { plugins: { 'react-hooks': reactHooks }, rules: {
    ...reactHooks.configs.recommended.rules,
    'react-hooks/exhaustive-deps': 'warn',
  } },
  // Storybook CSF 의 render 는 컴포넌트로 렌더되지만 린트는 일반 함수로 봅니다 — 오탐이라 제외합니다.
  { files: ['**/*.stories.tsx'], rules: { 'react-hooks/rules-of-hooks': 'off' } },
  { files: ['packages/**/*.{ts,tsx}'], rules: {
    'no-restricted-syntax': ['error',
      { selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]", message: '새 색을 만들지 마세요 — var(--color-*) 토큰을 씁니다' },
      // var(--font-*) 와 inherit 은 통과 — 그 밖의 폰트 리터럴만 막는다
      { selector: "Property[key.name='fontFamily'] > Literal[value!=/^(var\\(--font-|inherit$)/]", message: '폰트는 var(--font-*) 로' },
      { selector: "Literal[value=/판매|구매|배송|결제/]", message: 'UI 문구에 판매·구매·배송·결제를 쓰지 않습니다 (Malt 규칙)' },
      { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: '금지 — 서버에서 렌더하세요' },
    ],
    'jsx-a11y/click-events-have-key-events': 'error', 'jsx-a11y/alt-text': 'error',
  } },
  // 테스트는 규칙 자체를 검증하려고 리터럴 값을 씁니다(예: 색 리터럴을 거부하는지 보는 테스트).
  // 배포되지 않는 코드라 리터럴 규칙만 면제하고 나머지는 그대로 적용합니다.
  { files: ['**/*.test.{ts,tsx}'], rules: { 'no-restricted-syntax': 'off' } },
  // 예시 앱은 레이아웃 px 허용 (컴포넌트 패키지엔 적용 안 함)
  { files: ['apps/**'], rules: { 'no-restricted-syntax': 'off' } },
);
