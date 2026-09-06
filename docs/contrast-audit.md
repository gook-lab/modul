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

아래 "수정" 절을 참조해 주세요 — ✗ 항목은 토큰 값 또는 사용 규칙을 바꿨습니다.

## 수정 — 규칙과 근거

1. **neutral-600 → 소형 텍스트 금지.** 11–12px 캡션·메타·도움말은 `--color-neutral-700` 을 씁니다 (light 5.83 · malt 5.15). neutral-600 은 placeholder · 비활성 · 장식에만 씁니다. 스토리북과 컴포넌트 소스의 텍스트 색 사용을 일괄 교체했습니다. Malt 의 600 은 bottling `faint` 와 같은 값이고, bottling 에서도 읽어야 하는 텍스트에는 쓰지 않습니다.
2. **primary 버튼 라벨 3.76 / 3.49** — Modernist 가이드의 명시적 예외입니다(accent-to-ground ≥ 3:1 — 아이콘·대형 텍스트·인터페이스 크롬). 라벨은 14px/800 이라 수용했습니다. 본문 크기 텍스트는 accent 위에 얹지 않습니다.
3. **dark 토스트 액션 3.86** — `--color-toast-action` 토큰을 추가했습니다. light/malt 는 accent-400, dark 는 accent-300(6.4)입니다. 인버스 표면 위 강조색이 테마별로 다른 램프 단계를 요구한 첫 사례라, 같은 일이 반복되면 `--color-on-inverse-*` 역할 토큰으로 올리려 합니다.

4. **소형 텍스트에서 accent 와 알파 텍스트 제거 (2026-09-03, axe 실측).** 스토리북 test-runner 의 axe 가 `.card-kicker`(10px, accent) · `.tag-outline`(11px, accent) · `.card-meta`(11px, `color-mix(text 50%)`) · `.table th`(11px, `color-mix(text 60%)`) 를 color-contrast serious 로 잡았습니다. 규칙 1 과 같은 사유(읽어야 하는 소형 텍스트)라 `styles.css` 에서 앞의 둘은 `--color-accent-700`, 뒤의 둘은 `--color-neutral-700` 으로 교체했습니다. `.tag-outline` 의 테두리는 UI 요소(3:1)라 `--color-accent` 를 유지했습니다.
5. **axe 예외 1건 — `.btn-primary` 라벨.** 규칙 2 가 수용한 그 쌍(3.76 light · 3.49 malt)을 axe 는 4.5:1 기준으로 계속 잡습니다. `apps/storybook/.storybook/test-runner.ts` 의 `exclude: ['.btn-primary']` 가 그 결정을 그대로 옮긴 것이고, 다른 표면은 전부 검사 대상입니다. 규칙 2 를 뒤집을 때는 이 exclude 도 같이 지워 주세요.

6. **2차 실측에서 나온 나머지 (2026-09-03).** `.text-muted`(12px, `color-mix(text 55%)` → 3.66) · `.btn-ghost`(14px, accent → 3.75) · Select 플레이스홀더와 Accordion 번호와 ImageUpload 카운터(neutral-500 → 2.38~2.58) · Marquee `tone="accent"`(13px bg-on-accent → 3.75) 를 각각 `--color-neutral-700` · `--color-accent-700` 으로 올렸습니다. Marquee 는 배경을 `--color-accent-700` 으로 바꿔 규칙 2 의 "본문 크기 텍스트를 accent 위에 얹지 않는다" 를 지켰습니다. 규칙 1 이 placeholder 에 neutral-600 을 허용하지만 axe 는 플레이스홀더도 4.5:1 로 재기 때문에, 값이 없을 때 보이는 텍스트에는 neutral-700 을 씁니다.

7. **3차 실측 — 스토리 커버리지 확대 (2026-09-04).** 스토리가 없던 6개 영역(Chart · FileDrop · Boundary · RichText · Mobile · Form)에 스토리를 붙이자 axe 가 세 곳을 새로 잡았습니다.
   - **전역 링크 3.76.** `styles.css` 의 `a { color: var(--color-accent) }` 가 본문 크기(15px) 링크라 4.5:1 에 미달했습니다. `--color-accent-700`(6.41)로 올렸습니다. `components.css` 의 `.richtext a` 는 이미 accent-700 이었지만 `@layer modul` 안이라 레이어 밖의 이 규칙을 이길 수 없었습니다. 레이어 전략을 택한 대가라서 기본값 쪽을 고쳤습니다.
   - **FileDrop 확장자 뱃지 4.39.** 9px 텍스트가 `--color-neutral-300` 배경 위라 규칙 1 의 neutral-700 으로는 부족했습니다(4.39). 배경이 bg 가 아닐 때는 한 단계 더 필요해서 `--color-neutral-800`(6.81)로 올렸습니다. 규칙 1 이 "bg 위" 기준이라는 것을 여기서 확인했습니다.
   - **DatePicker 플레이스홀더 2.38.** 규칙 6 이 정한 "값이 없을 때 보이는 텍스트는 neutral-700" 을 빠뜨린 자리였습니다. `--color-neutral-500` → `--color-neutral-700`(5.38).
   - 대비 밖에서도 둘 나왔습니다. FileDrop 의 `role=progressbar` 에 접근성 이름이 없어 `aria-label` 을 붙였고, `scripts/gen-stories.ts` 가 args 없이 `Default` 를 만들어 Textarea 가 라벨 없는 입력으로 렌더되던 것을 label · title · alt · name · placeholder · helper · hint 를 채우도록 고쳤습니다.

8. **닫힌 모달 노출과 a11y 플레이크 (2026-09-04).** CI 만 실패하고 로컬은 통과하던 `Components/Modal › Danger` 를 따라가서 둘을 찾았습니다.
   - `styles.css` 의 `.dialog { display: flex }` 는 `@layer` 밖 author CSS 라 브라우저 기본값 `dialog:not([open]) { display: none }` 을 이깁니다. 그래서 `open={false}` 인 모달이 440×143px 로 화면에 그대로 남아 있었습니다(브라우저 실측). `dialog.dialog:not([open]) { display: none }` 을 추가해 되돌렸습니다. Drawer · Sheet 는 같은 문제가 없었습니다.
   - Modal 스토리는 트리거 버튼만 렌더해서 axe 가 모달 내용을 한 번도 검사하지 않고 있었습니다. `Open` 스토리를 추가해 실제로 검사합니다.
   - 진입 애니메이션(`mdl-fadeup`) 도중에 axe 가 샘플링하면 opacity 가 0 에 가까워 그 안의 텍스트가 전부 color-contrast 위반으로 잡힙니다. 타이밍에 달린 문제라 로컬은 통과하고 CI 만 실패합니다. `test-runner.ts` 의 `postVisit` 에서 애니메이션을 끄고 잽니다. 애니메이션이 끝나기를 기다리는 방법은 Marquee · Skeleton 이 무한 반복이라 쓸 수 없었습니다.

9. **Malt 도메인 프리미티브 — 첫 검수 (2026-09-04).** `@malt/ui-web-next` 는 스토리가 없어 axe 가 한 번도 본 적이 없었습니다. 스토리를 붙이자 넷이 나왔습니다.
   - `.malt-index-row__no`(12px) · `.malt-numberfield__suffix`(10.5px) 가 `--color-neutral-600`(2.75 · 2.99)이었습니다. 규칙 1 그대로라 `--color-neutral-700`(5.15 · 5.61)로 올렸습니다.
   - `.malt-stock--low` 가 `--malt-stock-low`(#D8A33F, 2.05)였습니다. 이 토큰은 배지 텍스트에만 쓰이므로 `#7A5610`(5.99)으로 어둡게 했습니다. `theme.json` 과 `theme-malt.css` 를 같이 고쳤고, 이참에 빌드 검증기가 `extra` 토큰까지 대조하도록 넓혔습니다. 그전에는 base 색만 보고 있어 이 불일치를 잡지 못했습니다.
   - `StepBar` 의 `role=progressbar` 에 접근성 이름이 없어 `aria-label` 과 `aria-valuetext` 를 붙였습니다.
   - `IndexRow` 의 `opacity` 로 행을 흐리게 한 예시가 그 안의 텍스트를 전부 4.5:1 아래로 떨어뜨렸습니다. 이 행은 전부 텍스트라 행 단위 투명도가 곧 대비 저하입니다. 실측으로 neutral-700 은 94%, text 는 65%, clay 는 86% 아래에서 깨집니다. 예시를 배지로 바꾸고 `docs/radio/IndexRow.md` 에 제약을 적었습니다.

10. **투명도로 본문을 흐리게 하던 규칙 두 개 (2026-09-04).** 시안의 F4 · F5 화면을 스토리로 조립하자 카드 안 텍스트 15개가 한꺼번에 걸렸습니다. axe 가 보고한 전경색이 `#8b837c` 처럼 블렌딩된 값이라 원인을 좁힐 수 있었습니다.
   - `styles.css` 의 `.card-body { opacity: 0.8 }` 이 카드 안 모든 텍스트의 대비를 같이 떨어뜨리고 있었습니다. `.dialog-body { opacity: 0.85 }` 도 같습니다. 둘 다 투명도를 빼고 `color: var(--color-neutral-700)` 로 같은 의도를 냅니다 — light bg 5.83 · light surface 5.38 · malt surface 5.61 입니다. `IndexRow` 의 `opacity`(수정 9)와 같은 계열이고, 이번에는 라이브러리 CSS 쪽이었습니다.
   - `.btn:disabled` 같은 비활성 상태의 `opacity: .45` 는 그대로 둡니다. WCAG 는 비활성 컨트롤을 대비 요구에서 제외합니다.
   - 화면 조립에서 하나 더 나왔습니다. 자리표시자 이미지의 11px 라벨이 `--color-neutral-300` 배경 위 `--color-neutral-700` 로 4.22 였습니다. 수정 7 의 FileDrop 뱃지와 같은 사례라 `--color-neutral-800`(6.85)을 씁니다.

11. **Malt 재고 상태색 — 여유 확인 (2026-09-06).** bottling 쪽에서 같은 값을 쓰다가 대비 위반이 나와, 세 색의 여유를 다시 쟀습니다. 기준은 cream(`#F7F3EA`) 위 소형 텍스트 4.5:1 입니다.

    | 토큰 | 값 | cream 위 | surface 위 |
    | --- | --- | --- | --- |
    | `--malt-stock-in` | `#2A7049` | 5.40 | 5.88 |
    | `--malt-stock-low` | `#7A5610` | 5.99 | 6.52 |
    | `--malt-clay` | `#A33B2E` | 5.88 | 6.41 |

    `--malt-stock-in` 은 처음 `#2F7D52` 로 4.54 였습니다. 기준을 0.04 만큼 넘기는 값이라 배경을 조금만 밝게 바꿔도 깨집니다. bottling 쪽에서 같은 판단을 내려 `#2A7049`(5.40)로 옮겼고, 디자인 시스템이 소비자보다 뒤처지지 않도록 여기서도 같은 값으로 맞췄습니다(2026-09-06).

    `--malt-stock-low` 를 `#D8A33F`(2.05)에서 바꿀 때 후보는 `#96601A`(4.76) · `#7A5610`(5.99) · `#6E4E0E`(6.87) 였습니다. `#7A5610` 을 고른 이유는 배지의 6px 점이 `background: currentColor` 라 텍스트 4.5:1 과 UI 요소 3:1 을 한 색으로 같이 넘겨야 했기 때문입니다.

## 검수 방법
sRGB 상대 휘도(WCAG 2.1 §1.4.3) 계산. 이후엔 스토리북 a11y 애드온(axe) color-contrast 규칙이 CI 에서 검사.
