# gen-stories 규칙

| 타입 | control |
| --- | --- |
| `'a' \| 'b'` 리터럴 유니언 | inline-radio + options |
| boolean | boolean |
| string | text |
| number | number |
| ReactNode · 함수 · 객체 | control: false (docs 표에만) |

- description.component = RADIO md 의 `> 인용` + `## R` 절. md 가 없으면 빈 문자열 — 그래서 RADIO 먼저.
- 이미 손으로 쓴 스토리는 건드리지 않습니다. 생성물을 손으로 고치면 파일 상단 주석을 지우지 말 것(추적용).
- CI 에서 `pnpm gen:stories && git diff --exit-code` — 생성물이 커밋과 다르면 실패(props 바꾸고 스토리 안 갱신한 경우).
