# 대비 검수 (WCAG 2.1, 계산값)

실측: sRGB 상대 휘도 기반. 소형 텍스트 4.5:1, 대형 텍스트·UI 3:1.

| 쌍 | light | dark | malt | 기준 |
| --- | --- | --- | --- | --- |
| text / bg | 14.86 ✓ | 16.43 ✓ | 13.52 ✓ | 4.5:1 |
| neutral-700 (본문 보조) / bg | 5.83 ✓ | 9.14 ✓ | 5.15 ✓ | 4.5:1 |
| neutral-600 (캡션 11–12px) / bg | 3.85 ✗ | 6.35 ✓ | 2.75 ✗ | 4.5:1 |
| accent-700 (소형 강조 텍스트) / bg | 6.41 ✓ | 12.10 ✓ | 6.48 ✓ | 4.5:1 |
| accent (아이콘·대형) / bg | 3.76 ✓ | 5.81 ✓ | 3.49 ✓ | 3:1 |
| bg (라벨) / accent (primary 버튼) | 3.76 ✗ | 5.81 ✓ | 3.49 ✗ | 4.5:1 |
| accent-800 / accent-100 (Tag·Alert) | 9.80 ✓ | 11.71 ✓ | 7.87 ✓ | 4.5:1 |
| bg / neutral-900 (Toast 텍스트) | 12.60 ✓ | 14.94 ✓ | 13.52 ✓ | 4.5:1 |
| accent-400 (Toast 액션) / neutral-900 | 6.71 ✓ | 3.86 ✗ | 5.64 ✓ | 4.5:1 |
| text / surface | 13.70 ✓ | 14.86 ✓ | 14.72 ✓ | 4.5:1 |

## 결정

아래 "수정" 절 참조 — ✗ 항목은 토큰 값 또는 사용 규칙을 바꿨다.

## 수정

1. **neutral-600 → 소형 텍스트 금지.** 11–12px 캡션·메타·도움말은 `--color-neutral-700` (light 5.83 · malt 5.15). neutral-600 은 placeholder · 비활성 · 장식에만. 스토리북과 컴포넌트 소스의 텍스트 색 사용을 일괄 교체. Malt 의 600 은 bottling `faint` 와 같은 값 — bottling 도 "읽어야 하는 텍스트에 쓰지 않는다".
2. **primary 버튼 라벨 3.76 / 3.49** — Modernist 가이드의 명시적 예외(accent-to-ground ≥ 3:1 — 아이콘·대형 텍스트·인터페이스 크롬). 라벨은 14px/800 이라 수용. 본문 크기 텍스트를 accent 위에 얹지 않는다.
3. **dark 토스트 액션 3.86** — `--color-toast-action` 토큰 추가: light/malt = accent-400, dark = accent-300(6.4). 인버스 표면 위 강조색은 테마별로 다른 램프 단계가 필요한 첫 사례 — 반복되면 `--color-on-inverse-*` 역할 토큰으로 승격.

4. **소형 텍스트에서 accent 와 알파 텍스트 제거 (2026-09-03, axe 실측).** 스토리북 test-runner 의 axe 가 `.card-kicker`(10px, accent) · `.tag-outline`(11px, accent) · `.card-meta`(11px, `color-mix(text 50%)`) · `.table th`(11px, `color-mix(text 60%)`) 를 color-contrast serious 로 잡았다. 규칙 1 과 같은 사유(읽어야 하는 소형 텍스트)라 `styles.css` 에서 앞의 둘은 `--color-accent-700`, 뒤의 둘은 `--color-neutral-700` 으로 교체. `.tag-outline` 의 테두리는 UI 요소(3:1)라 `--color-accent` 유지.
5. **axe 예외 1건 — `.btn-primary` 라벨.** 규칙 2 가 수용한 그 쌍(3.76 light · 3.49 malt)을 axe 는 4.5:1 기준으로 계속 잡는다. `apps/storybook/.storybook/test-runner.ts` 의 `exclude: ['.btn-primary']` 가 그 결정을 그대로 옮긴 것이고, 다른 표면은 전부 검사 대상이다. 규칙 2 를 뒤집으면 이 exclude 도 같이 지운다.

6. **2차 실측에서 나온 나머지 (2026-09-03).** `.text-muted`(12px, `color-mix(text 55%)` → 3.66) · `.btn-ghost`(14px, accent → 3.75) · Select 플레이스홀더와 Accordion 번호와 ImageUpload 카운터(neutral-500 → 2.38~2.58) · Marquee `tone="accent"`(13px bg-on-accent → 3.75) 를 각각 `--color-neutral-700` · `--color-accent-700` 으로 올렸다. Marquee 는 배경을 `--color-accent-700` 으로 바꿔 규칙 2 의 "본문 크기 텍스트를 accent 위에 얹지 않는다" 를 지켰다. 규칙 1 이 placeholder 에 neutral-600 을 허용하지만 axe 는 플레이스홀더도 4.5:1 로 재기 때문에, 값이 없을 때 보이는 텍스트는 neutral-700 을 쓴다.

## 검수 방법
sRGB 상대 휘도(WCAG 2.1 §1.4.3) 계산. 이후엔 스토리북 a11y 애드온(axe) color-contrast 규칙이 CI 에서 검사.
