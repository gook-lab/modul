/**
 * 입력 컴포넌트 공용 키보드 규칙.
 * - 한글·일본어 조합 중(isComposing) Enter/Escape/화살표 무시 — 조합 확정 키가 선택으로 새는 사고 방지 (Safari: keyCode 229)
 * - 모바일 힌트: type 별 enterKeyHint · autoCapitalize · autoCorrect 기본값. 소비자 값이 우선.
 */
export const isComposing = (e: React.KeyboardEvent) => e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229;
export const guardIme = <E extends React.KeyboardEvent>(fn: (e: E) => void) => (e: E) => { if (isComposing(e)) return; fn(e); };
type Hints = Partial<Pick<React.InputHTMLAttributes<HTMLInputElement>, 'enterKeyHint' | 'autoCapitalize' | 'autoCorrect' | 'spellCheck' | 'inputMode'>>;
const BY_TYPE: Record<string, Hints> = {
  email: { enterKeyHint: 'next', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false, inputMode: 'email' },
  url: { enterKeyHint: 'go', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false, inputMode: 'url' },
  tel: { enterKeyHint: 'next', inputMode: 'tel' }, number: { enterKeyHint: 'next', inputMode: 'decimal' },
  password: { enterKeyHint: 'done', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false },
  search: { enterKeyHint: 'search', autoCapitalize: 'none', autoCorrect: 'off' }, text: { enterKeyHint: 'next' },
};
/** <input {...mobileHints(type, rest)} {...rest} /> — rest 가 뒤라 소비자 값이 이김 */
export const mobileHints = (type: string | undefined, given: Hints = {}): Hints => ({ ...(BY_TYPE[type ?? 'text'] ?? BY_TYPE.text), ...Object.fromEntries(Object.entries(given).filter(([, v]) => v !== undefined)) });
export const searchHints: Hints = { enterKeyHint: 'search', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false };
